import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose'
import type { AuthStrategy } from 'payload'
import type { ServerEnvironment } from '../environment'

export async function verifyStaffIdentity(
  token: string,
  key: JWTVerifyGetKey,
  settings: { issuer: string; audience: string },
) {
  const { payload } = await jwtVerify(token, key, {
    issuer: settings.issuer,
    audience: settings.audience,
    algorithms: ['RS256', 'ES256'],
    maxTokenAge: '15m',
    clockTolerance: 5,
    requiredClaims: ['sub', 'iat', 'exp'],
  })
  if (!payload.sub || !Array.isArray(payload.amr) || !payload.amr.includes('mfa')) {
    throw new Error('Staff identity requires a subject and verified MFA')
  }
  return payload.sub
}

export function staffIdentityStrategy(env: ServerEnvironment): AuthStrategy {
  const key = env.CMS_IDENTITY_JWKS_URL ? createRemoteJWKSet(new URL(env.CMS_IDENTITY_JWKS_URL), {
    timeoutDuration: 5000,
    cooldownDuration: 30000,
  }) : undefined
  return {
    name: 'verified-staff-identity',
    authenticate: async ({ headers, payload }) => {
      const token = headers.get('x-syncrate-identity')
      if (!token || token.length > 16384 || !key || !env.CMS_IDENTITY_ISSUER || !env.CMS_IDENTITY_AUDIENCE) return { user: null }
      try {
        const subject = await verifyStaffIdentity(token, key, {
          issuer: env.CMS_IDENTITY_ISSUER, audience: env.CMS_IDENTITY_AUDIENCE,
        })
        const result = await payload.find({
          collection: 'staff-users',
          // Privileged internal lookup, deliberately limited to a verified IdP subject.
          overrideAccess: true,
          where: { and: [{ identitySubject: { equals: subject } }, { active: { equals: true } }] },
          limit: 1,
          depth: 0,
        })
        const user = result.docs[0]
        return { user: user ? { ...user, collection: 'staff-users' as const } : null }
      } catch {
        // Deny without logging bearer tokens, subjects or provider details.
        return { user: null }
      }
    },
  }
}
