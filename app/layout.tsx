import './globals.css'
import { Providers } from './providers' 

export const viewport = {
  themeColor: '#030303',
}

export const metadata = {
  metadataBase: new URL('https://syncrate.org'), // Ensures relative image URLs work properly
  title: 'Syncrate | Real Gold Yield Onchain',
  description: 'DeFi yield, backed by the real world.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  
  // Explicitly tell scrapers what banner image to use
  openGraph: {
    title: 'Syncrate | Real Gold Yield Onchain',
    description: 'DeFi yield, backed by the real world.',
    url: 'https://syncrate.org',
    siteName: 'Syncrate',
    images: [
      {
        url: '/logo.png', // Save a 1200x630 banner in your /public folder
        width: 1200,
        height: 630,
        alt: 'Syncrate',
      },
    ],
    type: 'website',
  },

  // Force Twitter/X to display a large summary card
  twitter: {
    card: 'summary_large_image',
    title: 'Syncrate | Real Gold Yield Onchain',
    description: 'DeFi yield, backed by the real world.',
    images: ['/og-image.png'],
    creator: '@syncratefi',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#030303]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
