import './globals.css'
import { Providers } from './providers' 

export const viewport = {
  themeColor: '#030303',
}

export const metadata = {
  metadataBase: new URL('https://syncrate.org'),
  title: 'Syncrate',
  other: {
    'base:app_id': '6a79a989d198f685bc61e2e5',
  },
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
    card: 'summary_large_image', 
    title: 'Syncrate',         
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
