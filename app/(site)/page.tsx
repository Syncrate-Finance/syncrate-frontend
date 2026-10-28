import type { Metadata } from 'next'
import { MarketingHomepage } from '@/features/marketing/homepage'
export const dynamic = 'force-dynamic'
export const viewport = { themeColor: '#f7f7f0' }
export const metadata: Metadata = {
  title: 'Syncrate | Gold, Built for Onchain Finance',
  description:
    'Making gold composable, programmable and useful onchain. Explore SGLD on Base and learn about sySGLD gold financing.',
  alternates: { canonical: '/' },
}
export default function HomePage() {
  return <MarketingHomepage />
}
