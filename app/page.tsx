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
      <section className="w-full max-w-6xl mx-auto px-6 pt-12 pb-20">
        
        {/* Header Block with Line */}
        <div className="w-full mb-12">
          <div className="w-full h-[1px] bg-[#222222] mb-6" /> {/* Section Divider Line */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-normal tracking-tight text-white">Products</h2>
            {/* Simple design pagination circles matching image_7.png style */}
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span className="w-2 h-2 rounded-full border border-[#444444]"></span>
              <span className="w-2 h-2 rounded-full border border-[#444444]"></span>
            </div>
          </div>
        </div>

        {/* --- USDS PRODUCT CARD (Inspired by image_6.png layout) --- */}
        <div className="w-full max-w-xl mx-auto flex flex-col items-start bg-[#0A0A0A] border border-[#111111] rounded-[32px] overflow-hidden p-4 md:p-6 shadow-xl">
          
          {/* Cover Photo Area (4:3 Ratio) */}
          <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden mb-6 bg-[#0E0E0E]">
            <Image 
              src="/usds-cover.png" 
              alt="sUSDS Token Product Cover"
              fill
              className="object-cover opacity-90 transition-opacity hover:opacity-100 duration-300"
            />
          </div>

          {/* Product Title */}
          <h3 className="text-3xl font-normal tracking-tight text-white mb-4 px-2">
            sUSDS
          </h3>

          {/* Product Short Description */}
          <p className="text-base text-[#888888] leading-relaxed mb-8 px-2">
            Syncrate USD (sUSDS) is a fully collateralized, yield-bearing stablecoin backed 1:1 by highly liquid, secure real-world institutional assets. Enjoy decentralized flexibility with institutional-grade security.
          </p>

          {/* View Product Call-To-Action Button */}
          <Link 
            href="/products/usds" 
            className="group flex items-center justify-between border border-[#333333] rounded-xl px-5 py-3.5 text-sm font-medium text-white hover:bg-white hover:text-black transition-all duration-200"
          >
            <span>View Product</span>
            <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>

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
