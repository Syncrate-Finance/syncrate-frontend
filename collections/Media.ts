import type { CollectionConfig } from 'payload'
import { isAdmin, isStaff } from '../server/cms/permissions'
import { recordContentChange, recordDeletion } from '../server/cms/hooks'

export const Media: CollectionConfig = {
  slug: 'media',
  hooks: { afterChange: [recordContentChange], afterDelete: [recordDeletion] },
  access: { create: isStaff, read: isStaff, update: isStaff, delete: isAdmin },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  },
  fields: [{ name: 'alt', type: 'text', required: true, maxLength: 300 }],
}
