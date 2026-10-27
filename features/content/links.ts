// Only explicit web, email and same-site destinations can become published links.
export function safeContentHref(value: unknown): string | null {
  if (
    typeof value !== 'string' ||
    !value ||
    /[\\\s\u0000-\u001f\u007f]/.test(value)
  )
    return null
  if (value.startsWith('/') && !value.startsWith('//')) return value
  if (/^#[a-zA-Z0-9_-]+$/.test(value)) return value
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' && !url.username && !url.password)
      return url.href
    if (url.protocol === 'mailto:' && /^[^?<>]+@[^?<>]+$/.test(url.pathname))
      return url.href
  } catch {
    /* Invalid URLs stay plain text. */
  }
  return null
}
export function internalContentHref(doc: unknown): string | null {
  if (
    !doc ||
    typeof doc !== 'object' ||
    !('relationTo' in doc) ||
    !('value' in doc)
  )
    return null
  const value = doc.value
  if (
    !value ||
    typeof value !== 'object' ||
    !('slug' in value) ||
    !('_status' in value) ||
    value._status !== 'published' ||
    typeof value.slug !== 'string' ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)
  )
    return null
  const prefix =
    doc.relationTo === 'pages'
      ? '/content/'
      : doc.relationTo === 'articles'
        ? '/insights/'
        : null
  return prefix ? prefix + value.slug : null
}
