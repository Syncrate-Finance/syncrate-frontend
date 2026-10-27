import { z } from 'zod'

const optionalURL = z.preprocess(value => value === '' ? undefined : value, z.string().url().optional())
const optionalString = z.preprocess(value => value === '' ? undefined : value, z.string().min(1).optional())
function parseURL(value: string) {
  try { return new URL(value) } catch { return null }
}

const environmentSchema = z.object({
  APP_ENV: z.enum(['local', 'test', 'preview', 'production']),
  SERVER_URL: z.string().url(),
  DATABASE_URL: z.string().refine(value => {
    try { return ['postgres:', 'postgresql:'].includes(new URL(value).protocol) } catch { return false }
  }, 'must be a PostgreSQL connection URL'),
  PAYLOAD_SECRET: z.string().min(48, 'must contain at least 48 characters'),
  BASE_RPC_URL: z.string().url().default('https://mainnet.base.org'),
  CMS_IDENTITY_ISSUER: optionalURL,
  CMS_IDENTITY_AUDIENCE: optionalString,
  CMS_IDENTITY_JWKS_URL: optionalURL,
}).superRefine((value, ctx) => {
  const deployed = value.APP_ENV === 'production' || value.APP_ENV === 'preview'
  const serverURL = parseURL(value.SERVER_URL)
  if (serverURL && (serverURL.pathname !== '/' || serverURL.search || serverURL.hash || serverURL.username || serverURL.password)) {
    ctx.addIssue({ code: 'custom', path: ['SERVER_URL'], message: 'must be an origin without credentials, path or query' })
  }
  if (deployed) {
    if (parseURL(value.DATABASE_URL)?.searchParams.get('sslmode') !== 'verify-full') {
      ctx.addIssue({ code: 'custom', path: ['DATABASE_URL'], message: 'requires sslmode=verify-full outside local/test' })
    }
    for (const key of ['CMS_IDENTITY_ISSUER', 'CMS_IDENTITY_AUDIENCE', 'CMS_IDENTITY_JWKS_URL'] as const) {
      if (!value[key]) ctx.addIssue({ code: 'custom', path: [key], message: 'is required outside local/test' })
    }
    for (const key of ['SERVER_URL', 'CMS_IDENTITY_ISSUER', 'CMS_IDENTITY_JWKS_URL'] as const) {
      if (value[key] && parseURL(value[key])?.protocol !== 'https:') {
        ctx.addIssue({ code: 'custom', path: [key], message: 'requires HTTPS outside local/test' })
      }
    }
  }
})

export function readServerEnvironment(input: Record<string, unknown> = process.env) {
  const parsed = environmentSchema.safeParse(input)
  if (!parsed.success) {
    // Never serialize Zod input data: connection URLs and secrets must not enter logs.
    throw new Error('Invalid server configuration: ' + parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; '))
  }
  return { ...parsed.data, localAuthentication: ['local', 'test'].includes(parsed.data.APP_ENV) }
}

export type ServerEnvironment = ReturnType<typeof readServerEnvironment>
