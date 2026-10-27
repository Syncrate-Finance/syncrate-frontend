import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublishedArticle } from '@/server/services/content'
import { ContentDocument } from '@/features/content/document'
export const dynamic = 'force-dynamic'
export const viewport = { themeColor: '#f5f7f8' }
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const document = await getPublishedArticle(slug)
  if (!document)
    return {
      title: 'Page not found | Syncrate',
      robots: { index: false, follow: false },
    }
  return {
    title: `${document.seo?.title || document.title} | Syncrate`,
    description: document.seo?.description || document.summary || undefined,
    alternates: { canonical: `/insights/${document.slug}` },
  }
}
export default async function PublishedDocument({ params }: Props) {
  const { slug } = await params
  const document = await getPublishedArticle(slug)
  if (!document) notFound()
  return <ContentDocument document={document} article={true} />
}
