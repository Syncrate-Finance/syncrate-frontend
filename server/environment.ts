import { X509Certificate } from "node:crypto";
import { z } from "zod";

const optionalURL = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);
const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);
function parseURL(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

const environmentSchema = z
  .object({
    APP_ENV: z.enum(["local", "test", "preview", "production"]),
    SERVER_URL: z.string().url(),
    DATABASE_URL: z.string().refine((value) => {
      try {
        return ["postgres:", "postgresql:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, "must be a PostgreSQL connection URL"),
    PAYLOAD_SECRET: z.string().min(48, "must contain at least 48 characters"),
    DATABASE_CA_CERT: optionalString.refine((value) => {
      if (!value) return true;
      try {
        return (
          value.includes("-----BEGIN CERTIFICATE-----") &&
          new X509Certificate(value).ca
        );
      } catch {
        return false;
      }
    }, "must contain a valid PEM CA certificate"),
    BASE_RPC_URL: z.string().url().default("https://mainnet.base.org"),
    DATABASE_SCHEMA: z.enum(["public", "cms"]).default("public"),
    CMS_AUTH_PROVIDER: z.enum(["proxy", "supabase"]).default("proxy"),
    SUPABASE_URL: optionalURL,
    SUPABASE_PUBLISHABLE_KEY: optionalString,
    CMS_IDENTITY_ISSUER: optionalURL,
    CMS_IDENTITY_AUDIENCE: optionalString,
    CMS_IDENTITY_JWKS_URL: optionalURL,
  })
  .superRefine((value, ctx) => {
    const deployed =
      value.APP_ENV === "production" || value.APP_ENV === "preview";
    const serverURL = parseURL(value.SERVER_URL);
    if (
      serverURL &&
      (serverURL.pathname !== "/" ||
        serverURL.search ||
        serverURL.hash ||
        serverURL.username ||
        serverURL.password)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["SERVER_URL"],
        message: "must be an origin without credentials, path or query",
      });
    }
    if (value.CMS_AUTH_PROVIDER === "supabase") {
      const url = parseURL(value.SUPABASE_URL ?? "");
      if (
        !url ||
        url.protocol !== "https:" ||
        !/^[a-z]{20}\.supabase\.co$/.test(url.hostname) ||
        url.pathname !== "/" ||
        url.search ||
        url.hash ||
        url.username ||
        url.password
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["SUPABASE_URL"],
          message: "requires the exact hosted project HTTPS origin",
        });
      }
      if (!value.SUPABASE_PUBLISHABLE_KEY?.startsWith("sb_publishable_"))
        ctx.addIssue({
          code: "custom",
          path: ["SUPABASE_PUBLISHABLE_KEY"],
          message: "requires a publishable key",
        });
      if (value.DATABASE_SCHEMA !== "cms")
        ctx.addIssue({
          code: "custom",
          path: ["DATABASE_SCHEMA"],
          message: "Supabase requires the private cms schema",
        });
    }
    if (deployed) {
      if (
        parseURL(value.DATABASE_URL)?.searchParams.get("sslmode") !==
        "verify-full"
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["DATABASE_URL"],
          message: "requires sslmode=verify-full outside local/test",
        });
      }
      for (const key of [
        "CMS_IDENTITY_ISSUER",
        "CMS_IDENTITY_AUDIENCE",
        "CMS_IDENTITY_JWKS_URL",
      ] as const) {
        if (value.CMS_AUTH_PROVIDER !== "supabase" && !value[key])
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "is required outside local/test",
          });
      }
      for (const key of [
        "SERVER_URL",
        "CMS_IDENTITY_ISSUER",
        "CMS_IDENTITY_JWKS_URL",
      ] as const) {
        if (value[key] && parseURL(value[key])?.protocol !== "https:") {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "requires HTTPS outside local/test",
          });
        }
      }
    }
  });

export function readServerEnvironment(
  input: Record<string, unknown> = process.env,
) {
  // Vercel supplies this system variable, independently of the request Host header.
  const previewHost =
    input.VERCEL_ENV === "preview" &&
    typeof (input.VERCEL_BRANCH_URL ?? input.VERCEL_URL) === "string" &&
    /^[a-z0-9-]+\.vercel\.app$/.test(
      String(input.VERCEL_BRANCH_URL ?? input.VERCEL_URL),
    )
      ? String(input.VERCEL_BRANCH_URL ?? input.VERCEL_URL)
      : undefined;
  const parsed = environmentSchema.safeParse({
    ...input,
    SERVER_URL:
      input.SERVER_URL ?? (previewHost ? `https://${previewHost}` : undefined),
  });
  if (!parsed.success) {
    // Never serialize Zod input data: connection URLs and secrets must not enter logs.
    throw new Error(
      "Invalid server configuration: " +
        parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; "),
    );
  }
  return {
    ...parsed.data,
    SUPABASE_URL: parsed.data.SUPABASE_URL
      ? new URL(parsed.data.SUPABASE_URL).origin
      : undefined,
    localAuthentication: ["local", "test"].includes(parsed.data.APP_ENV),
  };
}

export type ServerEnvironment = ReturnType<typeof readServerEnvironment>;

export function serverOrigins(
  env: ServerEnvironment,
  input: Record<string, unknown> = process.env,
) {
  const branch =
    env.APP_ENV === "preview" &&
    input.VERCEL_ENV === "preview" &&
    typeof input.VERCEL_BRANCH_URL === "string" &&
    /^[a-z0-9-]+\.vercel\.app$/.test(input.VERCEL_BRANCH_URL)
      ? `https://${input.VERCEL_BRANCH_URL}`
      : undefined;
  return branch
    ? Array.from(new Set([env.SERVER_URL, branch]))
    : [env.SERVER_URL];
}
