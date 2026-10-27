import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  safeContentHref,
  internalContentHref,
} from '../../features/content/links'
test('published links reject active schemes, credentials, controls and ambiguous URLs', () => {
  for (const value of [
    'javascript:alert(1)',
    'data:text/html,hello',
    '//evil.test',
    '/\\evil.test',
    'https://user:pass@example.test',
    'http://example.test',
    'https://example.test/\nsecret',
    undefined,
  ])
    assert.equal(safeContentHref(value), null, String(value))
  assert.equal(
    safeContentHref('/dashboard?view=positions'),
    '/dashboard?view=positions',
  )
  assert.equal(
    safeContentHref('https://docs.syncrate.org'),
    'https://docs.syncrate.org/',
  )
  assert.equal(safeContentHref('#risks'), '#risks')
})
test('internal links resolve only published documents in known public collections', () => {
  assert.equal(
    internalContentHref({
      relationTo: 'pages',
      value: { slug: 'gold-exposure', _status: 'published' },
    }),
    '/content/gold-exposure',
  )
  assert.equal(
    internalContentHref({
      relationTo: 'articles',
      value: { slug: 'update', _status: 'published' },
    }),
    '/insights/update',
  )
  for (const value of [
    7,
    { relationTo: 'pages', value: { slug: 'secret', _status: 'draft' } },
    {
      relationTo: 'staff-users',
      value: { slug: 'admin', _status: 'published' },
    },
    { relationTo: 'pages', value: { slug: '../admin', _status: 'published' } },
  ])
    assert.equal(internalContentHref(value), null)
})
