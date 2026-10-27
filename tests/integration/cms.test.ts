import { before, after, test } from 'node:test'
import assert from 'node:assert/strict'
import { getPayload, type Payload } from 'payload'
import type { StaffUser } from '../../payload-types'

// Database-writing tests may run only against an explicitly designated local test DB.
if (process.env.APP_ENV !== 'test' || !process.env.DATABASE_URL) throw new Error('Integration tests require APP_ENV=test and DATABASE_URL.')
const databaseURL = new URL(process.env.DATABASE_URL)
if (!['localhost', '127.0.0.1', '[::1]'].includes(databaseURL.hostname) || !databaseURL.pathname.endsWith('_test')) throw new Error('Use a disposable local database with a name ending in _test.')
let cms: Payload
let admin: StaffUser
let publisher: StaffUser
let editor: StaffUser
let draftID: string | number
const body = { root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Integration test content', version: 1 }], version: 1 }], direction: null, format: '' as const, indent: 0, version: 1 } }
before(async () => {
  const config = (await import('../../payload.config')).default
  cms = await getPayload({ config })
  await cms.db.migrate()
  const suffix = Date.now()
  admin = await cms.create({ collection: 'staff-users', context: { bootstrap: true }, data: { name: 'Test admin', email: 'admin-' + suffix + '@example.test', password: 'local-test-only-password-1234', role: 'admin', active: true } })
  publisher = await cms.create({ collection: 'staff-users', overrideAccess: false, user: admin, data: { name: 'Test publisher', email: 'publisher-' + suffix + '@example.test', password: 'local-test-only-password-1234', role: 'publisher', active: true } })
  editor = await cms.create({ collection: 'staff-users', overrideAccess: false, user: admin, data: { name: 'Test editor', email: 'editor-' + suffix + '@example.test', password: 'local-test-only-password-1234', role: 'editor', active: true } })
})
after(async () => { if (cms) await cms.destroy() }, { timeout: 5000 })
test('anonymous staff registration and role escalation are denied', async () => {
  await assert.rejects(cms.create({ collection: 'staff-users', overrideAccess: false, data: { name: 'Attacker', email: 'attacker@example.test', password: 'not-a-real-user-password', role: 'admin', active: true } }))
  await assert.rejects(cms.update({ collection: 'staff-users', id: editor.id, overrideAccess: false, user: editor, data: { role: 'admin' } }))
})
test('editor can draft but anonymous visitors cannot read drafts or versions', async () => {
  const doc = await cms.create({ collection: 'pages', overrideAccess: false, user: editor, draft: true, data: { title: 'Integration draft', slug: 'integration-' + Date.now(), body, _status: 'draft' } })
  draftID = doc.id
  const publicResult = await cms.find({ collection: 'pages', overrideAccess: false, where: { id: { equals: draftID } } })
  assert.equal(publicResult.totalDocs, 0)
  await assert.rejects(cms.findVersions({ collection: 'pages', overrideAccess: false }))
  await assert.rejects(cms.update({ collection: 'pages', id: draftID, overrideAccess: false, user: editor, data: { _status: 'published' } }))
})
test('publisher can publish; editor cannot modify published content', async () => {
  await cms.update({ collection: 'pages', id: draftID, overrideAccess: false, user: publisher, data: { _status: 'published' } })
  const publicResult = await cms.find({ collection: 'pages', overrideAccess: false, where: { id: { equals: draftID } } })
  assert.equal(publicResult.totalDocs, 1)
  await assert.rejects(cms.update({ collection: 'pages', id: draftID, overrideAccess: false, user: editor, data: { title: 'Unauthorized edit' } }))
})
test('audit trail is visible only to administrators and append-only through access-controlled APIs', async () => {
  const result = await cms.find({ collection: 'audit-events', overrideAccess: false, user: admin, limit: 1 })
  assert.ok(result.totalDocs >= 2)
  await assert.rejects(cms.find({ collection: 'audit-events', overrideAccess: false, user: editor }))
  await assert.rejects(cms.delete({ collection: 'audit-events', id: result.docs[0].id, overrideAccess: false, user: admin }))
})

test('local login works and a disabled account cannot authenticate', async () => {
  const login = await cms.login({ collection: 'staff-users', data: { email: editor.email, password: 'local-test-only-password-1234' } })
  assert.ok(login.token)
  await cms.update({ collection: 'staff-users', id: editor.id, overrideAccess: false, user: admin, data: { active: false } })
  await assert.rejects(cms.login({ collection: 'staff-users', data: { email: editor.email, password: 'local-test-only-password-1234' } }))
})
