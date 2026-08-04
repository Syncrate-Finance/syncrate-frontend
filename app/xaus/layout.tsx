import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Syncrate',

  openGraph: {
    title: 'Syncrate',
    url: 'https://syncrate.org/xaus',
    images: [
      {
        url: '/embed.PNG?v=2',
        width: 1200,
        height: 600,
        alt: 'Syncrate Gold',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syncrate',
    images: ['/embed.PNG?v=2'],
  },
}

export default function XAUsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}