import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from "jose";
import { readServerEnvironment, serverOrigins } from "../../server/environment";
import { verifyStaffIdentity } from "../../server/cms/identity";
import {
  cookieName,
  cookieOptions,
  openSession,
  sealSession,
  readCookie,
} from "../../server/cms/supabase-session";
const input = {
  APP_ENV: "preview",
  SERVER_URL: "https://preview.example.test",
  DATABASE_URL:
    "postgresql://test:disposable@db.example.test/postgres?sslmode=verify-full",
  DATABASE_SCHEMA: "cms",
  PAYLOAD_SECRET: "test-only-session-key-".repeat(4),
  CMS_AUTH_PROVIDER: "supabase",
  SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_disposable_test",
};
const env = readServerEnvironment(input);
const now = Math.floor(Date.now() / 1000);
const session = {
  accessToken: "disposable-access",
  refreshToken: "disposable-refresh",
  expiresAt: now + 300,
  startedAt: now,
};
test("Supabase deployment requires a hosted origin, publishable key and private schema", () => {
  assert.equal(env.localAuthentication, false);
  for (const patch of [
    { DATABASE_SCHEMA: "public" },
    { SUPABASE_URL: "https://attacker.example.test" },
    { SUPABASE_URL: input.SUPABASE_URL + "/auth" },
    { SUPABASE_PUBLISHABLE_KEY: "service-role-must-not-be-used" },
  ])
    assert.throws(() => readServerEnvironment({ ...input, ...patch }));
});
test("staff cookies are encrypted, host-only, HttpOnly and expire after eight hours", async () => {
  const sealed = await sealSession(session, env);
  assert.equal(sealed.includes(session.refreshToken), false);
  assert.deepEqual(await openSession(sealed, env), session);
  assert.equal(cookieName(env), "__Host-syncrate-staff");
  assert.deepEqual(cookieOptions(env), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 28800,
  });
  assert.equal(
    readCookie(
      new Headers({ cookie: "other=x; " + cookieName(env) + "=" + sealed }),
      env,
    ),
    sealed,
  );
  const modified = sealed.slice(0, -8) + "tampered";
  assert.equal(await openSession(modified, env), null);
  assert.equal(
    await openSession(
      sealed,
      readServerEnvironment({
        ...input,
        PAYLOAD_SECRET: "different-test-key-".repeat(4),
      }),
    ),
    null,
  );
  assert.equal(
    await openSession(
      await sealSession({ ...session, startedAt: now - 28810 }, env),
      env,
    ),
    null,
  );
  assert.equal(
    await openSession(
      sealed,
      readServerEnvironment({
        ...input,
        SUPABASE_URL: "https://zyxwvutsrqponmlkjihg.supabase.co",
      }),
    ),
    null,
  );
});
test("provider identity needs signed aal2, a TOTP method and a session ID", async () => {
  const pair = await generateKeyPair("ES256");
  const jwk = await exportJWK(pair.publicKey);
  const key = createLocalJWKSet({
    keys: [{ ...jwk, kid: "test-key", alg: "ES256" }],
  });
  const settings = {
    issuer: input.SUPABASE_URL + "/auth/v1",
    audience: "authenticated",
    provider: "supabase" as const,
  };
  const claims = {
    aal: "aal2",
    amr: [{ method: "password" }, { method: "totp" }],
    session_id: "test-session",
  };
  async function token(patch: Record<string, unknown> = {}) {
    return new SignJWT({ ...claims, ...patch })
      .setProtectedHeader({ alg: "ES256", kid: "test-key" })
      .setSubject("staff-subject")
      .setIssuer(settings.issuer)
      .setAudience(settings.audience)
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(pair.privateKey);
  }
  assert.equal(
    await verifyStaffIdentity(await token(), key, settings),
    "staff-subject",
  );
  for (const patch of [
    { aal: "aal1" },
    { amr: ["mfa"] },
    { amr: [{ method: "password" }] },
    { session_id: null },
  ])
    await assert.rejects(
      verifyStaffIdentity(await token(patch), key, settings),
    );
});

test("only trusted Vercel preview system origins extend the CSRF allowlist", () => {
  const { SERVER_URL, ...rest } = input;
  const preview = readServerEnvironment({
    ...rest,
    VERCEL_ENV: "preview",
    VERCEL_URL: "syncrate-build.vercel.app",
  });
  assert.equal(preview.SERVER_URL, "https://syncrate-build.vercel.app");
  assert.deepEqual(
    serverOrigins(preview, {
      VERCEL_ENV: "preview",
      VERCEL_BRANCH_URL: "syncrate-branch.vercel.app",
    }),
    ["https://syncrate-build.vercel.app", "https://syncrate-branch.vercel.app"],
  );
  assert.deepEqual(
    serverOrigins(preview, {
      VERCEL_ENV: "preview",
      VERCEL_BRANCH_URL: "attacker.example.test",
    }),
    [preview.SERVER_URL],
  );
  assert.throws(() =>
    readServerEnvironment({
      ...rest,
      VERCEL_ENV: "production",
      VERCEL_URL: "syncrate-build.vercel.app",
    }),
  );
});
