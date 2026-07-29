import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'XAUs | Syncrate Gold',
  description:
    'Syncrate Gold (XAUs) — 1:1 gold-pegged token each representing 1 troy oz of LBMA-standard physical gold.',
  openGraph: {
    title: 'XAUs | Syncrate Gold',
    description:
      '1:1 gold-pegged token each representing 1 troy oz of LBMA-standard physical gold.',
    url: 'https://syncrate.org/xaus',
    siteName: 'Syncrate',
    images: [
      {
        url: '/xaus-og.png', // or a dedicated /xaus-og.png
        width: 1200,
        height: 630,
        alt: 'Syncrate XAUs',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XAUs | Syncrate Gold',
    description:
      '1:1 gold-pegged token each representing 1 troy oz of LBMA-standard physical gold.',
    images: ['/xaus-og.png'],
  },
}

export default function XAUsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}