import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Syncrate',

  openGraph: {
    title: 'Syncrate',
    url: 'https://syncrate.org/prime',
    images: [
      {
        url: '/embed.PNG',
        width: 1200,
        height: 600,
        alt: 'Syncrate Prime',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syncrate',
    images: ['/embed.PNG'],
  },
}

export default function SGLDLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}