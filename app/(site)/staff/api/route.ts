import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";
import { getPayload } from "payload";
import config from "@payload-config";
import { z } from "zod";
import { readServerEnvironment, serverOrigins } from "@/server/environment";
import {
  cookieName,
  cookieOptions,
  openSession,
  privateHeaders,
  providerClient,
  sealSession,
  sessionData,
} from "@/server/cms/supabase-session";

export const runtime = "nodejs";
const input = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("login"),
    email: z.string().email().max(254),
    password: z.string().min(1).max(256),
  }),
  z.object({
    action: z.literal("invitation"),
    accessToken: z.string().max(8192),
    refreshToken: z.string().max(512),
  }),
  z.object({
    action: z.literal("password"),
    password: z.string().min(16).max(128),
  }),
  z.object({ action: z.literal("status") }),
  z.object({ action: z.literal("enroll") }),
  z.object({ action: z.literal("logout") }),
  z.object({
    action: z.literal("verify"),
    factorId: z.string().uuid(),
    code: z.string().regex(/^\d{6}$/),
  }),
]);
async function provisioned(subject: string, token: string) {
  const cms = await getPayload({ config });
  // The provider has already verified the token. Use its session ID only for
  // the owner-installed boolean revocation check, never decoded roles.
  const claims = decodeJwt(token);
  const session = await cms.db.pool.query(
    "select cms.is_staff_session_active($1::uuid, $2::uuid) as active",
    [subject, claims.session_id],
  );
  if (session.rows[0]?.active !== true) return false;
  const result = await cms.find({
    collection: "staff-users",
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
  return !!result.docs[0];
}
export async function POST(request: NextRequest) {
  const env = readServerEnvironment();
  const json = (body: unknown, status = 200) =>
    NextResponse.json(body, { status, headers: privateHeaders });
  if (env.CMS_AUTH_PROVIDER !== "supabase")
    return json({ error: "Staff identity is unavailable." }, 404);
  if (
    !serverOrigins(env).includes(request.headers.get("origin") ?? "") ||
    !request.headers.get("content-type")?.startsWith("application/json")
  )
    return json({ error: "Request rejected." }, 403);
  if (Number(request.headers.get("content-length") ?? 0) > 12000)
    return json({ error: "Request too large." }, 413);
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Request rejected." }, 400);
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 12000) {
        await reader.cancel();
        return json({ error: "Request too large." }, 413);
      }
      chunks.push(value);
    }
    const raw = Buffer.concat(chunks).toString("utf8");
    if (raw.length > 12000) return json({ error: "Request too large." }, 413);
    const parsed = input.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return json({ error: "Check the submitted fields." }, 400);
    const body = parsed.data;
    const client = providerClient(env);
    let stored = await openSession(
      request.cookies.get(cookieName(env))?.value,
      env,
    );
    if (body.action === "logout") {
      if (stored) {
        const { error: setupError } = await client.auth.setSession({
          access_token: stored.accessToken,
          refresh_token: stored.refreshToken,
        });
        if (!setupError) {
          const { error } = await client.auth.signOut({ scope: "local" });
          if (error && ![401, 403, 404].includes(error.status ?? 0))
            return json(
              {
                error:
                  "Provider sign-out failed. Retry to revoke this session.",
              },
              503,
            );
        } else if (![400, 401, 403].includes(setupError.status ?? 0))
          return json(
            {
              error: "Provider sign-out failed. Retry to revoke this session.",
            },
            503,
          );
      }
      const response = json({ signedOut: true });
      response.cookies.set(cookieName(env), "", {
        ...cookieOptions(env),
        maxAge: 0,
      });
      return response;
    }
    if (body.action === "login") {
      const { data, error } = await client.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });
      if (
        error ||
        !data.session ||
        !data.user ||
        !(await provisioned(data.user.id, data.session.access_token))
      )
        return json(
          {
            error:
              "Sign-in unavailable. Check your credentials and staff access.",
          },
          401,
        );
      stored = sessionData(data.session);
    } else if (body.action === "invitation") {
      const { data, error } = await client.auth.setSession({
        access_token: body.accessToken,
        refresh_token: body.refreshToken,
      });
      if (
        error ||
        !data.session ||
        !data.user ||
        !(await provisioned(data.user.id, data.session.access_token))
      )
        return json(
          {
            error:
              "Invitation is unavailable. Ask the administrator for a new invitation.",
          },
          401,
        );
      stored = sessionData(data.session);
    } else {
      if (!stored) return json({ error: "Sign in to continue." }, 401);
      const { data, error } = await client.auth.setSession({
        access_token: stored.accessToken,
        refresh_token: stored.refreshToken,
      });
      if (
        error ||
        !data.session ||
        !data.user ||
        !(await provisioned(data.user.id, data.session.access_token))
      )
        return json({ error: "Session is unavailable. Sign in again." }, 401);
      stored = sessionData(data.session, stored.startedAt);
    }
    if (body.action === "password") {
      const { error } = await client.auth.updateUser({
        password: body.password,
      });
      if (error)
        return json(
          {
            error:
              "Password update failed. Choose a different password or request a new invitation.",
          },
          400,
        );
    }
    if (body.action === "verify") {
      const { error } = await client.auth.mfa.challengeAndVerify({
        factorId: body.factorId,
        code: body.code,
      });
      if (error)
        return json(
          { error: "Code rejected. Try the current authenticator code." },
          401,
        );
      const { data } = await client.auth.getSession();
      if (!data.session) return json({ error: "Sign in again." }, 401);
      stored = sessionData(data.session, stored!.startedAt);
    }
    const { data: factors, error: factorError } =
      await client.auth.mfa.listFactors();
    if (factorError)
      return json({ error: "Authenticator service is unavailable." }, 503);
    let enrollment: { id: string; qr: string; secret: string } | undefined;
    if (body.action === "enroll") {
      if (factors.totp.some((factor) => factor.status === "verified"))
        return json({ error: "Use your existing authenticator." }, 409);
      for (const factor of factors.all.filter(
        (factor) => factor.status === "unverified",
      ))
        await client.auth.mfa.unenroll({ factorId: factor.id });
      const { data, error } = await client.auth.mfa.enroll({
        factorType: "totp",
        issuer: "Syncrate CMS",
        friendlyName: "Staff authenticator",
      });
      if (error)
        return json(
          { error: "Authenticator enrollment failed. Try again." },
          400,
        );
      enrollment = {
        id: data.id,
        qr: data.totp.qr_code,
        secret: data.totp.secret,
      };
    }
    const { data: assurance, error: assuranceError } =
      await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assuranceError)
      return json({ error: "Session verification failed." }, 401);
    const response = json({
      ready: assurance.currentLevel === "aal2",
      factors: factors.totp
        .filter((factor) => factor.status === "verified")
        .map((factor) => ({
          id: factor.id,
          name: factor.friendly_name ?? "Authenticator",
        })),
      enrollment,
    });
    response.cookies.set(
      cookieName(env),
      await sealSession(stored!, env),
      cookieOptions(env),
    );
    return response;
  } catch {
    // Do not print credentials, enrollment material, session cookies or provider errors.
    return json({ error: "Staff sign-in is temporarily unavailable." }, 503);
  }
}
