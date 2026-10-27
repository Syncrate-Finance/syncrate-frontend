import { APIError, type CollectionAfterChangeHook, type CollectionAfterDeleteHook, type CollectionBeforeChangeHook } from 'payload'
import { canPublish } from './permissions'

export const protectPublication: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  if (!canPublish(req.user) && (data?._status === 'published' || originalDoc?._status === 'published')) {
    throw new APIError('Publishing or changing published content requires a publisher.', 403)
  }
  return data
}

export const recordContentChange: CollectionAfterChangeHook = async ({ doc, operation, collection, req }) => {
  await req.payload.create({
    collection: 'audit-events',
    overrideAccess: true,
    req,
    data: {
      actor: req.user ? String(req.user.id) : 'system',
      action: operation,
      targetCollection: collection.slug,
      targetID: String(doc.id),
    },
  })
  return doc
}

export const recordDeletion: CollectionAfterDeleteHook = async ({ doc, collection, req }) => {
  await req.payload.create({ collection: 'audit-events', overrideAccess: true, req, data: {
    actor: req.user ? String(req.user.id) : 'system', action: 'delete', targetCollection: collection.slug, targetID: String(doc.id),
  } })
  return doc
}
