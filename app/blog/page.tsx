import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Image from 'next/image'
import Link from 'next/link'

export default function Blog() {
  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] antialiased ${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}>
      
      {/* Top Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="Syncrate Logo" 
              width={32} 
              height={32} 
              className="object-contain cursor-pointer"
            />
          </Link>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 text-sm font-medium">
          <Link href="/" className="px-5 py-2.5 rounded-full border border-[#333333] text-white hover:bg-[#111111] transition-colors">
            Main site
          </Link>
          <a href="#" className="px-5 py-2.5 rounded-full bg-white text-[#030303] hover:bg-[#E5E5E5] transition-colors">
            App
          </a>
        </div>
      </header>

      {/* Blog Main Content */}
      <main className="w-full max-w-6xl mx-auto px-6 py-12">
        
        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl font-normal tracking-tight text-white mb-10">
          Our Recent Publications
        </h1>

        {/* Blog Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Post Block 1 */}
          <Link href="/blog/rethinking-the-gold-thesis" className="flex flex-col bg-[#161616] rounded-[32px] p-2 hover:bg-[#1A1A1A] transition-colors group cursor-pointer">
            <div className="overflow-hidden rounded-[24px] w-full aspect-[16/9]">
              <Image 
                src="/blog1.PNG" 
                alt="Blog 1" 
                width={800} 
                height={450} 
                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
              />
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h2 className="text-xl font-normal text-white tracking-tight leading-snug mb-12">
                The Opportunity Cost: Rethinking the Gold Thesis.
              </h2>
              <p className="text-sm text-[#888888] mt-auto">
                17 Jul 2026
              </p>
            </div>
          </Link>

        </div>
      </main>
    </div>
  )
}
