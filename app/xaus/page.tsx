import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Link from 'next/link'
import Image from 'next/image'

export default function XAUsProductPage() {
  return (
    <div 
      className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col antialiased ${GeistSans.variable} ${GeistMono.variable}`} 
      style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      {/* --- TOP NAVIGATION --- */}
      <header className="w-full flex items-center justify-between px-6 py-5 max-w-6xl mx-auto border-b border-[#111111]">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.jpg" 
            alt="Syncrate Logo" 
            width={32} 
            height={32} 
            className="object-contain rounded-full" 
          />
        </Link>
        <Link href="/" className="px-5 py-2 rounded-full bg-white text-[#030303] hover:bg-[#E5E5E5] text-xs font-medium transition-colors">
          Main Site
        </Link>
      </header>

      {/* --- HERO DASHBOARD SECTION --- */}
      <main className="w-full max-w-6xl mx-auto px-6 py-12 md:py-20 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Product Details & Actions */}
          <div className="lg:col-span-7 flex flex-col text-left">
            </div>

            {/* Core Value Proposition */}
            <h1 className="text-4xl md:text-6xl font-normal tracking-tighter text-white mb-6 leading-[1.05]">
              Real <span className="text-[#FFD700]">Gold.</span> <br />
              OnChain.
            </h1>

            <p className="text-sm md:text-base text-[#AAAAAA] leading-relaxed mb-8 max-w-xl">
              Backed by 99.99% pure Goldbog-accredited gold, with each token representing 1 troy oz. Vaulted securely in with reputable custodians in the UAE.
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/app" className="px-8 py-3.5 bg-white text-black font-medium text-sm rounded-md hover:bg-[#E5E5E5] transition-all">
                Buy XAUs
              </Link>
            </div>

            {/* Live Asset Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[#111111]">
              <div>
                <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Market Cap</p>
                <p className="text-xl md:text-2xl font-normal text-white tracking-tight">$42.18M</p>
              </div>
              <div>
                <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Total Supply</p>
                <p className="text-xl md:text-2xl font-normal text-white tracking-tight">18,450 XAUs</p>
              </div>
              <div>
                <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Bullion Weight</p>
                <p className="text-xl md:text-2xl font-normal text-white tracking-tight">18,450 Oz</p>
              </div>
              <div>
                <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Vault Gold Bars</p>
                <p className="text-xl md:text-2xl font-normal text-white tracking-tight">564 Bars</p>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Showcase Block */}
          <div className="lg:col-span-5 flex justify-center relative w-full aspect-square max-w-md mx-auto">
            {/* Background Atmosphere glow */}
            <div className="absolute inset-0 bg-[#FFD700]/5 rounded-full blur-3xl" />
            
            {/* Main Premium Floating Coin Graphic */}
            <div className="relative w-full h-full min-h-[320px]">
              <Image 
                src="/XAUs-asset.png" 
                alt="XAUs Premium Gold Coin Token" 
                fill
                className="object-contain drop-shadow-[0_0_50px_rgba(255,215,0,0.15)] animate-[float_6s_ease-in-out_infinite]"
                priority
              />
            </div>
          </div>

        </div>
      </main>

      {/* --- REUSED FOOTER (Maintains context layout symmetry) --- */}
      <footer className="w-full bg-[#030303] pt-16 pb-12 px-6 border-t border-[#111111]">
        <div className="w-full max-w-6xl mx-auto flex flex-col">
          <div className="flex justify-between items-start text-sm text-[#F5F5F5] font-medium">
            <div className="flex flex-col gap-5">
              <a href="mailto:team@syncrate.org" className="hover:text-[#888888] transition-colors">Contact</a>
              <a href="https://docs.syncrate.org" className="hover:text-[#888888] transition-colors">Documentation</a>
              <a href="#" className="hover:text-[#888888] transition-colors">Brand Kit</a>
              <a href="#" className="hover:text-[#888888] transition-colors">Terms & Disclosures</a>
              <Link href="/blog" className="hover:text-[#888888] transition-colors">Blog</Link>
            </div>
            <div className="flex items-center">
              <Image src="/footer-icon.PNG" alt="Syncrate" width={32} height={32} className="object-contain" />
            </div>
          </div>

          <div className="w-full mt-16 flex flex-col gap-2 text-[10px] md:text-xs text-[#444444] leading-relaxed text-justify md:text-left">
            <p>Syncrate is a technology platform and does not constitute an offer to sell or a solicitation of securities, financial instruments, or investment products...</p>
            <p>Yield generated through Syncrate is derived from underlying gold financing activity and is not fixed, guaranteed, or assured.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
