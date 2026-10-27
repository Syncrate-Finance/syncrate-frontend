import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PublishedRichText } from '../../features/content/rich-text'
import type { Page } from '../../payload-types'
function body(children: unknown[]): Page['body'] {
  return {
    root: {
      type: 'root',
      children,
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  } as Page['body']
}
const text = { type: 'text', text: '<script>alert(1)</script>', version: 1 }
test('rich text escapes authored text and strips active link destinations', () => {
  const html = renderToStaticMarkup(
    createElement(PublishedRichText, {
      body: body([
        {
          type: 'paragraph',
          version: 1,
          children: [
            {
              type: 'link',
              version: 3,
              children: [text],
              fields: {
                linkType: 'custom',
                url: 'javascript:alert(1)',
                newTab: true,
              },
            },
          ],
        },
      ]),
    }),
  )
  assert.ok(html.includes('&lt;script&gt;'))
  assert.ok(!html.includes('<script>'))
  assert.ok(!html.includes('href='))
})
test('private uploads do not expose media URLs through the public renderer', () => {
  const html = renderToStaticMarkup(
    createElement(PublishedRichText, {
      body: body([
        {
          type: 'upload',
          version: 3,
          relationTo: 'media',
          value: {
            url: 'https://private.example.test/secret.png',
            alt: 'Private document',
          },
        },
      ]),
    }),
  )
  assert.ok(!html.includes('private.example.test'))
  assert.ok(!html.includes('Private document'))
})
