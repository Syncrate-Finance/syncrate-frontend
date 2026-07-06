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
          Bridging DeFi and productive real-world assets through transparent onchain yield. 
        </h1>

        {/* Subheading - Kept intact and clean */}
        <p className="text-base text-[#888888] leading-relaxed mb-6 max-w-md">
          Syncrate channels onchain capital into productive real-world assets, delivering transparent, USD-denominated yield designed for the next generation of decentralized finance.
        </p>
      </main>

      {/* --- SWIPEABLE CARDS SECTION --- */}
      <HowItWorks />
{/* Divider and Products Label Section */}
<div className="w-full max-w-6xl mx-auto px-6 pt-16 pb-8">
  {/* The Divider Line */}
  <div className="w-full h-[1px] bg-[#222222] mb-6" />
  
  {/* The Small Font Label Row */}
  <div className="flex justify-between items-center">
    <span className="text-xs font-medium tracking-widest-[#888888]">
      Products
    </span>
  </div>
</div>
      {/* --- NEW PRODUCTS HEADER & SECTION (Inspired by image_7.png) --- */}
     <section className="w-full">
  {/* 
     - 'w-full' and no 'px' parameters ensures it stretches completely right-to-left.
     - 'aspect-[3/4]' makes the box longer so text stays clear of the icon.
     - 'rounded-none' removes corner curves on mobile to seamlessly blend into the screen edge.
  */}
  <div className="relative w-full aspect-[3/4] sm:aspect-video overflow-hidden border-y border-[#222222] bg-[#030303] flex flex-col justify-between p-6 md:p-12">
    
    {/* 1. Full Bleed Background Cover Photo */}
    <div className="absolute inset-0 z-0">
      <Image
        src="/susd-bg-cover.PNG" 
        alt="sUSD Background"
        fill
        className="object-cover opacity-35"
        priority
      />
    </div>

    {/* 2. Floating Asset Visual (Tucked safely in upper-middle block) */}
    <div className="absolute inset-x-0 top-[20%] z-10 flex justify-center">
      <div className="relative w-56 h-56 md:w-72 md:h-72">
        <Image
          src="/sUSD-asset.png" 
          alt="sUSD Asset Visual"
          fill
          className="object-contain"
        />
      </div>
    </div>

    {/* 3. High Contrast Content Layer (Forced cleanly to the very bottom) */}
    <div className="relative z-20 mt-auto flex flex-col items-start text-left w-full max-w-xl mx-auto px-4 sm:px-0">
      
      {/* Title */}
      <h3 className="text-3xl md:text-5xl font-normal text-white mb-4 tracking-tight">
        sUSD
      </h3>
      
      {/* Smaller, Clean Description Sitting Unimpeded */}
      <p className="text-xs md:text-sm text-[#AAAAAA] leading-relaxed mb-8 max-w-md">
        Each Syncrate Gold (sUSD) is backed 1:1 by GoldBog-accredited physical gold, held in secure vaults with reputable custodians in Ghana and the UAE.
      </p>

      {/* Styled View Product Button Link */}
      <button className="flex items-center gap-2 border border-[#333333] bg-black/60 backdrop-blur-md rounded-md px-6 py-3 text-xs font-medium text-white hover:bg-white hover:text-black transition-all duration-200 mb-2">
        View Product <span>→</span>
      </button>
    </div>
  </div>
</section>

{/* --- DESIGN SECTION --- */}
<section className="w-full max-w-6xl mx-auto px-6 py-24">
  
  {/* Thicker Divider Line (Height increased to 2px) */}
  <div className="w-full h-[2px] bg-[#333333] mb-6" />
  
  {/* Label Row */}
  <div className="flex justify-between items-center">
    {/* "Design" - Bold, sentence case, matching hero color (white) */}
    <span className="text-lg font-bold text-white">
      Design
    </span>
    
    {/* Indicator dots matching the Techdollar image */}
    <div className="flex gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-white" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#333333]" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#333333]" />
    </div>
  </div>

  {/* Spacing before the large paragraph */}
  <div className="mt-32 mb-16">
    {/* 
      Main Paragraph: 
      Using the exact same sizing, tracking, and leading as your Hero heading 
    */}
    <p className="text-3xl md:text-4xl font-normal tracking-tighter text-white max-w-3xl leading-[1.1]">
      The future of private-credit demands speed, access, and nuance. Months-long underwriting cycles miss the pace of innovation needed at the bleeding edge of deep tech.
    </p>
  </div>

  {/* Little paragraph space, followed by bullet point structure */}
  <div className="max-w-3xl mt-12 flex flex-col gap-2">
    {/* Bullet Heading - Semi-bold */}
    <h4 className="text-base md:text-lg font-semibold text-[#E5E5E5]">
      Digitally Native, Traditional Structuring
    </h4>
    {/* Write-up underneath */}
    <p className="text-base text-[#888888] leading-relaxed">
      Every facility is originated as secured private credit against vested equity. Purpose-built infrastructure funds loan principal faster and cheaper than traditional lenders. Borrowers...
    </p>
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
