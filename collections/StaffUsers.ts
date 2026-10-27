import { APIError, type CollectionConfig } from 'payload'
import { hasRole, isAdmin, isAdminField } from '../server/cms/permissions'
import { staffIdentityStrategy } from '../server/cms/identity'
import { recordContentChange, recordDeletion } from '../server/cms/hooks'
import type { ServerEnvironment } from '../server/environment'

export function staffUsers(env: ServerEnvironment): CollectionConfig {
  return {
    slug: 'staff-users',
    admin: { useAsTitle: 'email' },
    auth: {
      disableLocalStrategy: env.localAuthentication ? undefined : { enableFields: true, optionalPassword: true },
      tokenExpiration: 3600,
      maxLoginAttempts: 5,
      lockTime: 600000,
      cookies: { secure: !env.localAuthentication, sameSite: 'Lax' },
      strategies: [staffIdentityStrategy(env)],
    },
    access: {
      admin: ({ req }) => hasRole(req.user, ['editor', 'publisher', 'admin']),
      create: isAdmin,
      read: ({ req }) => hasRole(req.user, ['admin']) ? true : req.user?.active ? { id: { equals: req.user.id } } : false,
      update: isAdmin,
      delete: isAdmin,
    },
    hooks: {
      afterChange: [recordContentChange],
      afterDelete: [recordDeletion],
      beforeValidate: [({ data, operation, req }) => {
        // Also closes the framework's first-user registration path. Only the local
        // bootstrap script passes this internal context; HTTP body fields cannot set it.
        if (operation === 'create' && !hasRole(req.user, ['admin']) && req.context.bootstrap !== true) {
          throw new APIError('Staff registration is not public.', 403)
        }
        return data
      }],
      beforeLogin: [({ user }) => {
        if (!user.active) throw new APIError('Account unavailable.', 403)
        return user
      }],
    },
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'role', type: 'select', required: true, defaultValue: 'editor', options: ['editor', 'publisher', 'admin'], access: { create: isAdminField, update: isAdminField } },
      { name: 'active', type: 'checkbox', defaultValue: true, required: true, access: { create: isAdminField, update: isAdminField } },
      { name: 'identitySubject', type: 'text', unique: true, index: true, access: { create: isAdminField, update: isAdminField }, admin: { description: 'Exact immutable subject from the configured identity provider. No automatic provisioning.' } },
    ],
  }
}
