import { createHash } from "node:crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import { createClient, type Session } from "@supabase/supabase-js";
import type { ServerEnvironment } from "../environment";

export const staffCookie = "__Host-syncrate-staff";
export const localStaffCookie = "syncrate-staff-local";
export type StaffSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  startedAt: number;
};
const lifetime = 8 * 60 * 60;

export function cookieName(env: ServerEnvironment) {
  return env.localAuthentication ? localStaffCookie : staffCookie;
}
function key(env: ServerEnvironment) {
  return createHash("sha256")
    .update("syncrate-staff-session-v1:" + env.PAYLOAD_SECRET)
    .digest();
}
export function providerClient(env: ServerEnvironment) {
  if (
    env.CMS_AUTH_PROVIDER !== "supabase" ||
    !env.SUPABASE_URL ||
    !env.SUPABASE_PUBLISHABLE_KEY
  )
    throw new Error("Staff identity is unavailable");
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        }),
    },
  });
}
export function sessionData(
  session: Session,
  startedAt = Math.floor(Date.now() / 1000),
): StaffSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? 0,
    startedAt,
  };
}
export async function sealSession(
  session: StaffSession,
  env: ServerEnvironment,
) {
  const cookie = await new EncryptJWT(session)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuer("syncrate-staff")
    .setAudience(env.SUPABASE_URL!)
    .setIssuedAt()
    .setExpirationTime(session.startedAt + lifetime)
    .encrypt(key(env));
  if (cookie.length > 3800)
    throw new Error("Staff session exceeds cookie limit");
  return cookie;
}
export async function openSession(
  value: string | undefined,
  env: ServerEnvironment,
): Promise<StaffSession | null> {
  if (!value || value.length > 3800) return null;
  try {
    const { payload } = await jwtDecrypt(value, key(env), {
      issuer: "syncrate-staff",
      audience: env.SUPABASE_URL,
      keyManagementAlgorithms: ["dir"],
      contentEncryptionAlgorithms: ["A256GCM"],
    });
    if (
      typeof payload.accessToken !== "string" ||
      typeof payload.refreshToken !== "string" ||
      typeof payload.expiresAt !== "number" ||
      typeof payload.startedAt !== "number" ||
      payload.startedAt + lifetime <= Date.now() / 1000
    )
      return null;
    return {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      expiresAt: payload.expiresAt,
      startedAt: payload.startedAt,
    };
  } catch {
    return null;
  }
}
export function readCookie(headers: Headers, env: ServerEnvironment) {
  const prefix = cookieName(env) + "=";
  return headers
    .get("cookie")
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}
export const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};
export function cookieOptions(env: ServerEnvironment) {
  return {
    httpOnly: true,
    secure: !env.localAuthentication,
    sameSite: "lax" as const,
    path: "/",
    maxAge: lifetime,
  };
}
