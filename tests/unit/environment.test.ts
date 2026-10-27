import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readServerEnvironment } from '../../server/environment'
const valid = { APP_ENV: 'test', SERVER_URL: 'http://localhost:3000', DATABASE_URL: 'postgresql://test:password@127.0.0.1/syncrate_test', PAYLOAD_SECRET: 'x'.repeat(64) }
test('local and test environments permit local authentication', () => {
  assert.equal(readServerEnvironment(valid).localAuthentication, true)
})
test('deployment configuration fails closed without the identity provider', () => {
  assert.throws(() => readServerEnvironment({ ...valid, APP_ENV: 'production' }), /CMS_IDENTITY_ISSUER/)
  assert.throws(() => readServerEnvironment({ ...valid, APP_ENV: 'preview' }), /requires HTTPS/)
})
test('a configured deployment disables password authentication', () => {
  const env = readServerEnvironment({ ...valid, APP_ENV: 'production', DATABASE_URL: 'postgresql://app:password@db.example.test/syncrate?sslmode=verify-full', SERVER_URL: 'https://syncrate.org', CMS_IDENTITY_ISSUER: 'https://id.example.org', CMS_IDENTITY_AUDIENCE: 'syncrate-cms', CMS_IDENTITY_JWKS_URL: 'https://id.example.org/jwks' })
  assert.equal(env.localAuthentication, false)
})
test('validation errors never disclose connection credentials or secrets', () => {
  const marker = 'sensitive-password-marker'
  try { readServerEnvironment({ ...valid, DATABASE_URL: 'not-a-db://' + marker, PAYLOAD_SECRET: marker }) } catch (error) {
    assert.ok(error instanceof Error)
    assert.equal(error.message.includes(marker), false)
    return
  }
  assert.fail('Expected invalid configuration to fail')
})
test('server origin cannot inject a path or credentials', () => {
  assert.throws(() => readServerEnvironment({ ...valid, SERVER_URL: 'http://localhost:3000/unexpected' }), /must be an origin/)
})
test('malformed deployment URLs produce redacted configuration errors', () => {
  const marker = 'private-input-marker'
  try { readServerEnvironment({ ...valid, APP_ENV: 'production', DATABASE_URL: marker, SERVER_URL: marker, CMS_IDENTITY_ISSUER: marker, CMS_IDENTITY_JWKS_URL: marker }) } catch (error) {
    assert.ok(error instanceof Error)
    assert.equal(error.message.includes(marker), false)
    return
  }
  assert.fail('Expected malformed URLs to fail')
})
