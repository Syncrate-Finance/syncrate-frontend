import type { CollectionConfig } from 'payload'
import { isAdmin, isStaff, publishedOrStaff, updateDraftOrPublish } from '../server/cms/permissions'
import { protectPublication, recordContentChange, recordDeletion } from '../server/cms/hooks'

function contentCollection(slug: 'pages' | 'articles'): CollectionConfig {
  return {
    slug,
    admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status', 'updatedAt'] },
    versions: { drafts: true, maxPerDoc: 50 },
    access: { create: isStaff, read: publishedOrStaff, update: updateDraftOrPublish, delete: isAdmin, readVersions: isStaff },
    hooks: { beforeChange: [protectPublication], afterChange: [recordContentChange], afterDelete: [recordDeletion] },
    fields: [
      { name: 'title', type: 'text', required: true, maxLength: 180 },
      { name: 'slug', type: 'text', required: true, unique: true, index: true, validate: (value: unknown) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || 'Use lowercase letters, numbers and hyphens.' },
      { name: 'summary', type: 'textarea', maxLength: 500 },
      { name: 'body', type: 'richText', required: true },
      { name: 'seo', type: 'group', fields: [{ name: 'title', type: 'text', maxLength: 180 }, { name: 'description', type: 'textarea', maxLength: 320 }] },
    ],
  }
}

export const Pages = contentCollection('pages')
export const Articles = contentCollection('articles')
