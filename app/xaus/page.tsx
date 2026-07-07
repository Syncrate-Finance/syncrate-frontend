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

      {/* --- HERO DASHBOARD SECTION (With Full-Bleed Background Cover) --- */}
      <main className="relative w-full overflow-hidden flex-grow">
        
        {/* 1. Full Bleed Background Image Layer */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <Image
            src="/XAUs-bg-cover.PNG" 
            alt="XAUs Gold Background"
            fill
            className="object-cover opacity-25"
            priority
          />
          {/* Subtle bottom gradient to blend cleanly into the next section */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030303]" />
        </div>

        {/* 2. Relative Layout Content Grid sitting on top (z-10) */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Product Details & Actions */}
          <div className="lg:col-span-7 flex flex-col text-left">
            {/* Core Value Proposition */}
            <h1 className="text-4xl md:text-6xl font-normal tracking-tighter text-white mb-6 leading-[1.05]">
              Real <span className="text-[#FFD700]">Gold.</span> <br />
              OnChain.
            </h1>

            <p className="text-sm md:text-base text-[#AAAAAA] leading-relaxed mb-8 max-w-xl">
              Backed by 99.99% pure Goldbog-accredited gold, with each token representing 1 troy oz. Vaulted securely with reputable custodians in the UAE.
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/app" className="px-8 py-3.5 bg-white text-black font-medium text-sm rounded-md hover:bg-[#E5E5E5] transition-all">
                Buy XAUs
              </Link>
            </div>

            {/* Live Asset Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[#111111]/50 backdrop-blur-sm">
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

       {/* --- NEW FOOTER SECTION --- */}
      <footer className="w-full bg-[#0037FF] pt-16 pb-12 px-6 border-t border-[#111111]">
        <div className="w-full max-w-6xl mx-auto flex flex-col">
          
          {/* Top Row: Links and Small Logo */}
          <div className="flex justify-between items-start text-sm text-[#F5F5F5] font-medium">
            
            {/* Left: Stacked Links */}
            <div className="flex flex-col gap-5">
              <a href="mailto:team@syncrate.org" className="hover:text-[#888888] transition-colors">Contact</a>
              <a href="https://docs.syncrate.org" className="hover:text-[#888888] transition-colors">Documentation</a>
              <a href="#" className="hover:text-[#888888] transition-colors">Brand Kit</a>
              <a href="#" className="hover:text-[#888888] transition-colors">Terms & Disclosures</a>
              <Link href="/blog" className="hover:text-[#888888] transition-colors">Blog</Link>
              <a href="https://x.com/syncratefi" className="hover:text-[#888888] transition-colors">X (formerly Twitter)</a>
              <a href="https://linkedin.com/company/syncrateprotocol" className="hover:text-[#888888] transition-colors">LinkedIn</a>
            </div>

            {/* Right: Small Logo Visual */}
            <div className="flex items-center">
              <Image 
                src="/footer-icon.PNG" 
                alt="Syncrate Logo" 
                width={32} 
                height={32} 
                className="object-contain"
              />
            </div>
            
          </div>

          {/* Bottom: Faint Legal Disclosure */}
          <div className="w-full mt-16 flex flex-col gap-2 text-[10px] md:text-xs text-[#F5F5F5] leading-relaxed text-justify md:text-left">
            <p>
              Syncrate is a technology platform and does not constitute an offer to sell or a solicitation of an offer to buy any securities, financial instruments, or investment products in any jurisdiction where such offer or solicitation would be unlawful. USDS is not legal tender, is not insured by any government deposit insurance scheme, and is not guaranteed by any bank or financial institution.
            </p>
            <p>
              Yield generated through Syncrate is derived from underlying gold financing activity and is not fixed, guaranteed, or assured. Past performance of any financing cycle is not indicative of future results. The value of gold and the performance of financing partners can fluctuate, and depositors may be exposed to counterparty, custodial, operational, and market risks, including potential loss of principal.
            </p>
            <p>
              Syncrate does not provide financial, legal, tax, or investment advice. Prospective users should conduct their own due diligence and consult independent professional advisors before participating.
            </p>
            <p>
              References to third-party partners, custodians, or infrastructure providers on this site are for informational purposes only and do not constitute an endorsement, guarantee, or warranty of their services by Syncrate.
            </p>
            <p>
              Syncrate may not be available to residents of certain jurisdictions, including where prohibited by local law or regulation. It is the responsibility of users to ensure their participation complies with applicable laws in their jurisdiction.
            </p>
          </div>

        </div>
      </footer>
      
    </div>
  )
}
