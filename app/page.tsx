import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Image from 'next/image'
import Link from 'next/link'
import HowItWorks from '../components/HowItWorks'

export default function LaunchingSoon() {
  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col justify-between antialiased ${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}>
      
      {/* Top Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        {/* Custom Logo */}
        <div className="flex items-center">
          <Image 
            src="/logo.jpg" 
            alt="Syncrate Logo" 
            width={32} 
            height={32} 
            className="object-contain"
          />
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 text-sm font-medium">
          <Link href="/blog" className="px-5 py-2.5 rounded-full border border-[#333333] text-white hover:bg-[#111111] transition-colors">
            Blog
          </Link>
          <a href="#" className="px-5 py-2.5 rounded-full bg-white text-[#030303] hover:bg-[#E5E5E5] transition-colors">
            App
          </a>
        </div>
      </header>

      {/* Hero Content */}
      <main className="w-full max-w-6xl mx-auto px-6 flex flex-col items-start text-left mt-12 md:mt-24">
        {/* Main Heading */}
        <h1 className="text-3xl md:text-4xl font-normal tracking-tighter text-white mb-6 max-w-3xl leading-[1.05]">
          DeFi yield, backed by the real world. <a href="#" className="text-blue-600 underline hover:text-blue-500 transition-colors">Join waitlist→</a>
        </h1>

        {/* Subheading - Kept intact and clean */}
        <p className="text-base text-[#888888] leading-relaxed mb-6 max-w-md">
          Syncrate channels onchain capital into productive real-world assets, delivering transparent, USD-denominated yield designed for the next generation of decentralized finance.
        </p>
      </main>

      {/* --- SWIPEABLE CARDS SECTION --- */}
      <HowItWorks />

      {/* --- NEW PRODUCTS HEADER & SECTION (Inspired by image_7.png) --- */}
     <section className="w-full max-w-lg mx-auto px-6 py-6">
  {/* The Product Card Wrapper - Relative so text overlays inside */}
  <div className="relative w-full aspect-[1200/1081] rounded-[32px] overflow-hidden border border-[#222222] bg-[#030303] shadow-2xl flex flex-col justify-end p-8">
    
    {/* 1. Background Cover Photo */}
    <div className="absolute inset-0 z-0">
      <Image
        src="/susd-cover.png" // Replace with your cover background image file name
        alt="sUSD Background"
        fill
        className="object-cover opacity-40" // Lower opacity ensures text stays highly readable
      />
    </div>

    {/* 2. Floating Visual on Top (Like the coin asset shown in image_6.png) */}
    <div className="absolute inset-0 z-10 flex items-center justify-center p-12 mb-20">
      <div className="relative w-48 h-48 md:w-56 md:h-56">
        <Image
          src="/susd-token.PNG" // Your card graphic sitting on top of the background
          alt="sUSD Asset Visual"
          fill
          className="object-contain"
        />
      </div>
    </div>

    {/* 3. Text & Content Layer (Directly matching Matrixdock layout in image_6.png) */}
    <div className="relative z-20 flex flex-col items-start text-left">
      
      {/* Title */}
      <h3 className="text-3xl md:text-4xl font-normal text-white mb-3 tracking-tight">
        sUSD
      </h3>
      
      {/* Smaller Font Description */}
      <p className="text-xs md:text-sm text-[#888888] leading-relaxed mb-6 max-w-sm">
        Each Syncrate Gold (sUSD) token is securely backed 1:1 by GoldBog-accredited physical gold, held in secure vaults with reputable custodians in Ghana and the UAE.
      </p>

      {/* View Product Button Style */}
      <button className="flex items-center gap-2 border border-[#333333] bg-black/40 backdrop-blur-sm rounded-lg px-5 py-2.5 text-xs font-medium text-white hover:bg-white hover:text-black transition-all duration-200">
        View Product <span>→</span>
      </button>
    </div>

  </div>
</section>

      {/* Partner Marquee Section */}
      <section className="w-full max-w-6xl mx-auto py-12 border-t border-[#111111] overflow-hidden flex flex-col items-center">
        <div className="relative flex overflow-x-hidden w-full max-w-4xl [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {/* Logo Set 1 */}
            <div className="flex shrink-0 gap-24 md:gap-32 pr-24 md:pr-32 items-center">
              <Image src="/bawa.png" alt="Bawa Rocks LTD" width={120} height={40} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/redstone.PNG" alt="Redstone" width={120} height={40} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/chainlink.png" alt="Chainlink" width={120} height={40} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/morpho.png" alt="Morpho" width={120} height={40} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
            </div>
            {/* Logo Set 2 */}
            <div className="flex shrink-0 gap-24 md:gap-32 pr-24 md:pr-32 items-center">
              <Image src="/bawa.png" alt="Bawa Rocks LTD" width={120} height={40} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/redstone.PNG" alt="Redstone" width={120} height={40} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/chainlink.png" alt="Chainlink" width={120} height={40} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/morpho.png" alt="Morpho" width={120} height={40} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Details */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[#111111] text-xs text-[#555555] font-mono">
        <div>
          &copy; {new Date().getFullYear()} Syncrate Technologies Inc. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="https://x.com/syncratefi" className="hover:text-[#888888] transition-colors">Twitter</a>
          <a href="https://linkedin.com/company/syncrateprotocol" className="hover:text-[#888888] transition-colors">LinkedIn</a>
        </div>
      </footer>
      
    </div>
  )
}
