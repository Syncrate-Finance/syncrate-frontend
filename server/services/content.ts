import 'server-only'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

const validSlug = (slug: string) =>
  slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
// React cache deduplicates only within this server render, never across visitors.
export const getPublishedPage = cache(async (slug: string) => {
  if (!validSlug(slug)) return null
  const cms = await getPayload({ config })
  const result = await cms.find({
    collection: 'pages',
    overrideAccess: false,
    user: null,
    draft: false,
    depth: 1,
    limit: 1,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })
  return result.docs[0] ?? null
})
export const getPublishedArticle = cache(async (slug: string) => {
  if (!validSlug(slug)) return null
  const cms = await getPayload({ config })
  const result = await cms.find({
    collection: 'articles',
    overrideAccess: false,
    user: null,
    draft: false,
    depth: 1,
    limit: 1,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })
  return result.docs[0] ?? null
})
export async function listPublishedArticles(page = 1) {
  const cms = await getPayload({ config })
  return cms.find({
    collection: 'articles',
    overrideAccess: false,
    user: null,
    draft: false,
    depth: 0,
    limit: 12,
    page,
    sort: '-createdAt',
    where: { _status: { equals: 'published' } },
    select: { title: true, slug: true, summary: true, createdAt: true },
  })
}
