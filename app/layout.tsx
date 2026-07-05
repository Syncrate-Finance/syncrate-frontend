import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
