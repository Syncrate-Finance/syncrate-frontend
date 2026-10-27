import type { Access, FieldAccess } from 'payload'

export type StaffRole = 'editor' | 'publisher' | 'admin'
type Actor = unknown

export function hasRole(actor: Actor, roles: readonly StaffRole[]) {
  return typeof actor === 'object' && actor !== null && 'active' in actor && actor.active === true && 'role' in actor && roles.includes(actor.role as StaffRole)
}

export const isStaff: Access = ({ req }) => hasRole(req.user, ['editor', 'publisher', 'admin'])
export const isAdmin: Access = ({ req }) => hasRole(req.user, ['admin'])
export const isAdminField: FieldAccess = ({ req }) => hasRole(req.user, ['admin'])
export const canPublish = (actor: Actor) => hasRole(actor, ['publisher', 'admin'])

export const publishedOrStaff: Access = ({ req }) => isStaff({ req }) ? true : { _status: { equals: 'published' } }
export const updateDraftOrPublish: Access = ({ req }) => {
  if (canPublish(req.user)) return true
  return hasRole(req.user, ['editor']) ? { _status: { equals: 'draft' } } : false
}
