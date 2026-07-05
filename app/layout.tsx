import './globals.css'

// Tweak 1: This tells Safari/Chrome to color the top status bar and bottom areas
export const viewport = {
  themeColor: '#0F0F0F',
}

export const metadata = {
  title: 'Syncrate',
  description: 'DeFi yield, backed by the real world.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* TWEAK 2: This forces the absolute bottom layer of the site to be dark */}
      <body className="bg-[#0F0F0F]">{children}</body>
    </html>
  )
}
