import {
  RichText,
  type JSXConverter,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import {
  type SerializedLinkNode,
  type SerializedAutoLinkNode,
} from '@payloadcms/richtext-lexical'
import type { Page } from '@/payload-types'
import { internalContentHref, safeContentHref } from './links'

const converters: JSXConvertersFunction = ({ defaultConverters }) => {
  const link: JSXConverter<SerializedLinkNode | SerializedAutoLinkNode> = ({
    node,
    nodesToJSX,
  }) => {
    const fields = node.fields
    const children = nodesToJSX({ nodes: node.children })
    const href =
      fields.linkType === 'internal'
        ? internalContentHref(fields.doc)
        : safeContentHref(fields.url)
    if (!href) return <>{children}</>
    return (
      <a
        href={href}
        target={fields.newTab ? '_blank' : undefined}
        rel={fields.newTab ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  }
  return {
    ...defaultConverters,
    link,
    autolink: link,
    // Media stays private until the approved object-storage/publication integration.
    upload: () => null,
    relationship: () => null,
    unknown: () => null,
  }
}
export function PublishedRichText({ body }: { body: Page['body'] }) {
  return <RichText data={body} converters={converters} disableContainer />
}
