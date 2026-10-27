import type { CollectionConfig } from 'payload'
import { isAdmin } from '../server/cms/permissions'

export const AuditEvents: CollectionConfig = {
  slug: 'audit-events',
  admin: { useAsTitle: 'action' },
  access: { read: isAdmin, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'actor', type: 'text', required: true },
    { name: 'action', type: 'text', required: true },
    { name: 'targetCollection', type: 'text', required: true },
    { name: 'targetID', type: 'text', required: true },
  ],
}
