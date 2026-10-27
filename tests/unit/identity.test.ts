import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose'
import { verifyStaffIdentity } from '../../server/cms/identity'
const settings = { issuer: 'https://identity.example.org', audience: 'syncrate-cms' }
const pair = await generateKeyPair('RS256')
const jwk = await exportJWK(pair.publicKey)
const key = createLocalJWKSet({ keys: [{ ...jwk, kid: 'test-key', alg: 'RS256', use: 'sig' }] })
async function token(claims: Record<string, unknown> = {}, audience = settings.audience, expiry: string | number = '5m') {
  return new SignJWT({ amr: ['pwd', 'mfa'], ...claims }).setProtectedHeader({ alg: 'RS256', kid: 'test-key' }).setSubject('verified-staff-subject').setIssuer(settings.issuer).setAudience(audience).setIssuedAt().setExpirationTime(expiry).sign(pair.privateKey)
}
test('signed identity requires exact audience and MFA', async () => {
  assert.equal(await verifyStaffIdentity(await token(), key, settings), 'verified-staff-subject')
  await assert.rejects(verifyStaffIdentity(await token({ amr: ['pwd'] }), key, settings), /MFA/)
  await assert.rejects(verifyStaffIdentity(await token({}, 'another-app'), key, settings))
  await assert.rejects(verifyStaffIdentity(await token({}, settings.audience, 1), key, settings))
})
test('wrong issuer and altered tokens fail signature validation', async () => {
  const signed = await token()
  await assert.rejects(verifyStaffIdentity(signed, key, { ...settings, issuer: 'https://another.example.org' }))
  const parts = signed.split('.')
  parts[1] = Buffer.from(JSON.stringify({ sub: 'attacker', amr: ['mfa'] })).toString('base64url')
  await assert.rejects(verifyStaffIdentity(parts.join('.'), key, settings))
})
