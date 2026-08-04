import './globals.css'
import { Providers } from './providers' 

export const viewport = {
  themeColor: '#030303',
}

export const metadata = {
  metadataBase: new URL('https://syncrate.org'),
  title: 'Syncrate',
  icons: {
    icon: '/logo2.jpg',
    shortcut: '/logo2.jpg',
    apple: '/logo2.jpg',
  },
  
  openGraph: {
    title: 'Syncrate',
    url: 'https://syncrate.org',
    images: [
      {
        url: '/embed.PNG',
        width: 1200,
        height: 600,
        alt: 'Syncrate',
      },
    ],
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image', // Keeps the full banner layout
    title: 'Syncrate',            // Renders only "Syncrate" inside the translucent bottom badge
    images: ['/embed.PNG'],
    creator: '@syncratenetwork',
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
