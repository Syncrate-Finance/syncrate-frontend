import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import type { AuthStrategy } from "payload";
import { openSession, readCookie, providerClient } from "./supabase-session";
import type { ServerEnvironment } from "../environment";

export async function verifyStaffIdentity(
  token: string,
  key: JWTVerifyGetKey,
  settings: { issuer: string; audience: string; provider?: "supabase" },
) {
  const { payload } = await jwtVerify(token, key, {
    issuer: settings.issuer,
    audience: settings.audience,
    algorithms: ["RS256", "ES256"],
    maxTokenAge: settings.provider === "supabase" ? "65m" : "15m",
    clockTolerance: 5,
    requiredClaims: ["sub", "iat", "exp"],
  });
  const mfa =
    settings.provider === "supabase"
      ? payload.aal === "aal2" &&
        typeof payload.session_id === "string" &&
        Array.isArray(payload.amr) &&
        payload.amr.some(
          (method) =>
            method && typeof method === "object" && method.method === "totp",
        )
      : Array.isArray(payload.amr) && payload.amr.includes("mfa");
  if (!payload.sub || !mfa) {
    throw new Error("Staff identity requires a subject and verified MFA");
  }
  return payload.sub;
}

export function staffIdentityStrategy(env: ServerEnvironment): AuthStrategy {
  const issuer =
    env.CMS_AUTH_PROVIDER === "supabase"
      ? `${env.SUPABASE_URL}/auth/v1`
      : env.CMS_IDENTITY_ISSUER;
  const audience =
    env.CMS_AUTH_PROVIDER === "supabase"
      ? "authenticated"
      : env.CMS_IDENTITY_AUDIENCE;
  const jwks =
    env.CMS_AUTH_PROVIDER === "supabase"
      ? `${issuer}/.well-known/jwks.json`
      : env.CMS_IDENTITY_JWKS_URL;
  const key = jwks
    ? createRemoteJWKSet(new URL(jwks), {
        timeoutDuration: 5000,
        cooldownDuration: 30000,
      })
    : undefined;
  return {
    name: "verified-staff-identity",
    authenticate: async ({ headers, payload }) => {
      const session =
        env.CMS_AUTH_PROVIDER === "supabase"
          ? await openSession(readCookie(headers, env), env)
          : null;
      const token =
        env.CMS_AUTH_PROVIDER === "supabase"
          ? session?.accessToken
          : headers.get("x-syncrate-identity");
      if (!token || token.length > 16384 || !key || !issuer || !audience)
        return { user: null };
      try {
        const subject = await verifyStaffIdentity(token, key, {
          issuer,
          audience,
          provider:
            env.CMS_AUTH_PROVIDER === "supabase" ? "supabase" : undefined,
        });
        if (env.CMS_AUTH_PROVIDER === "supabase") {
          const { data, error } = await providerClient(env).auth.getUser(token);
          if (error || data.user?.id !== subject) return { user: null };
          const { payload: claims } = await jwtVerify(token, key, {
            issuer,
            audience,
            algorithms: ["RS256", "ES256"],
          });
          const active = await payload.db.pool.query(
            "select cms.is_staff_session_active($1::uuid, $2::uuid) as active",
            [subject, claims.session_id],
          );
          if (active.rows[0]?.active !== true) return { user: null };
        }
        const result = await payload.find({
          collection: "staff-users",
          // Privileged internal lookup, deliberately limited to a verified IdP subject.
          overrideAccess: true,
          where: {
            and: [
              { identitySubject: { equals: subject } },
              { active: { equals: true } },
            ],
          },
          limit: 1,
          depth: 0,
        });
        const user = result.docs[0];
        return {
          user: user ? { ...user, collection: "staff-users" as const } : null,
        };
      } catch {
        // Deny without logging bearer tokens, subjects or provider details.
        return { user: null };
      }
    },
  };
}
