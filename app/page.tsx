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
    <span className="text-lg font-large text-white">
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
<section className="w-full max-w-6xl mx-auto px-6 pt-24 pb-8">
  
  {/* Thicker Divider Line (Height increased to 2px) */}
  <div className="w-full h-[2px] bg-[#333333] mb-6" />
  
  {/* Label Row */}
  <div className="flex justify-between items-center">
    {/* "Design" - Bold, sentence case, matching hero color (white) */}
    <span className="text-lg font-large text-white">
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
      The gold economy holds real value, but most of it never reaches global capital. Slow, informal financing leaves licensed aggregators undercapitalized, while investors have no direct way to earn yield from real gold-backed activity.
    </p>
  </div>

  {/* Little paragraph space, followed by bullet point structure */}
  <div className="max-w-3xl mt-12 flex flex-col gap-2">
    {/* Bullet Heading - Semi-bold */}
    <h4 className="text-base md:text-lg font-semibold text-[#E5E5E5]">
      Real Yield Source
    </h4>
    {/* Write-up underneath */}
    <p className="text-base text-[#888888] leading-relaxed">
      Yield isn’t a promise or a token emission. It comes directly from the financing spread earned when our gold partner repurchases inventory under short-term agreements. As gold moves through a real financing cycle, that spread flows back to Syncrate holders through sUSD.
    </p>
  </div>

  {/* Little paragraph space, followed by bullet point structure */}
  <div className="max-w-3xl mt-12 flex flex-col gap-2">
    {/* Bullet Heading - Semi-bold */}
    <h4 className="text-base md:text-lg font-semibold text-[#E5E5E5]">
      Regulated Partners and Custodian
    </h4>
    {/* Write-up underneath */}
    <p className="text-base text-[#888888] leading-relaxed">
      Syncrate works exclusively with licensed gold aggregators and secure custodial partners, ensuring every ounce financed is sourced and held within a compliant, verifiable structure. 
    </p>
  </div>

  {/* Little paragraph space, followed by bullet point structure */}
  <div className="max-w-3xl mt-12 flex flex-col gap-2">
    {/* Bullet Heading - Semi-bold */}
    <h4 className="text-base md:text-lg font-semibold text-[#E5E5E5]">
      Experienced
    </h4>
    {/* Write-up underneath */}
    <p className="text-base text-[#888888] leading-relaxed">
      Our team brings extensive expertise from top global banks and companies including Goldman Sachs and ChainLink. We are also backed by industry leading advisors with decades of experience in onchain finance, tokenization and DeFi.
 </p>
  </div>
</section>
{/* --- INFRASTRUCTURE (STACK) SECTION --- */}
<section className="w-full max-w-6xl mx-auto px-6 pt-8 pb-24">
  
  {/* Thicker Divider Line (2px matching Design section) */}
  <div className="w-full h-[2px] bg-[#333333] mb-6" />
  
  {/* Label Row */}
  <div className="flex justify-between items-center">
    <span className="text-lg font-bold text-white">
      Stack
    </span>
  </div>

  {/* Large Paragraph Header (Matches Hero & Design fonts/spacing exactly) */}
  <div className="mt-32 mb-16">
    <p className="text-3xl md:text-4xl font-normal tracking-tighter text-white max-w-3xl leading-[1.1]">
      Syncrate is structured through a secure, institutional process designed for clear asset verification and continuous liquidity.
    </p>
  </div>

  {/* Horizontal Sliding Row for Tiles */}
  <div className="flex flex-nowrap overflow-x-auto gap-4 pb-8 snap-x snap-mandatory scrollbar-none [mask-image:_linear-gradient(to_right,black_85%,transparent_100%)] md:[mask-image:none]">
    
    {/* Tile 1: Financing */}
    <div className="w-[85%] md:w-1/4 shrink-0 bg-[#111111]/60 border border-[#222222] rounded-[24px] p-6 flex flex-col items-start text-left snap-start">
      {/* Icon Wrapper (96x96px image placeholder) */}
      <div className="w-12 h-12 bg-[#222222] rounded-xl flex items-center justify-center mb-12 overflow-hidden">
        <Image src="/financing-icon.png" alt="Financing" width={24} height={24} className="object-contain" />
      </div>
      <h4 className="text-lg font-medium text-white mb-3">Gold Financing</h4>
      <p className="text-sm text-[#888888] leading-relaxed">
      Partnered with <span className="text-blue-500 font-medium">Bawa Rocks LTD</span>, a Goldbog accredited aggregator, sourcing and financing physical gold inventory that backs the value flowing through Syncrate.
      </p>
    </div>

    {/* Tile 2: Oracle */}
    <div className="w-[85%] md:w-1/4 shrink-0 bg-[#111111]/60 border border-[#222222] rounded-[24px] p-6 flex flex-col items-start text-left snap-start">
      <div className="w-12 h-12 bg-[#222222] rounded-xl flex items-center justify-center mb-12 overflow-hidden">
        <Image src="/oracle-icon.PNG" alt="Oracle" width={24} height={24} className="object-contain" />
      </div>
      <h4 className="text-lg font-medium text-white mb-3">Oracle</h4>
      <p className="text-sm text-[#888888] leading-relaxed">
        Real-time gold price feeds and reserve data, powered by <span className="text-blue-500 font-medium">Pyth Network</span> giving the vault accurate, tamper-resistant pricing to calculate NAV and yield.
      </p>
    </div>

    {/* Tile 3: Custody */}
    <div className="w-[85%] md:w-1/4 shrink-0 bg-[#111111]/60 border border-[#222222] rounded-[24px] p-6 flex flex-col items-start text-left snap-start">
      <div className="w-12 h-12 bg-[#222222] rounded-xl flex items-center justify-center mb-12 overflow-hidden">
        <Image src="/custody-icon.PNG" alt="Custody" width={24} height={24} className="object-contain" />
      </div>
      <h4 className="text-lg font-medium text-white mb-3">Custody</h4>
      <p className="text-sm text-[#888888] leading-relaxed">
      Secure custodial storage for physical gold bars, by <span className="text-blue-500 font-medium">Amanat Vaults</span> and <span className="text-blue-500 font-medium">Crown Heritage Vaults</span> ensuring the assets backing sUSD are held independently and always verfiable.
      </p>
    </div>

    {/* Tile 4: Chain */}
    <div className="w-[85%] md:w-1/4 shrink-0 bg-[#111111]/60 border border-[#222222] rounded-[24px] p-6 flex flex-col items-start text-left snap-start">
      <div className="w-12 h-12 bg-[#222222] rounded-xl flex items-center justify-center mb-12 overflow-hidden">
        <Image src="/chain-icon.png" alt="Liquidity" width={24} height={24} className="object-contain" />
      </div>
      <h4 className="text-lg font-medium text-white mb-3">Liquidity</h4>
      <p className="text-sm text-[#888888] leading-relaxed">
      </p>
    </div>

  </div>
</section>

      {/* Partner Marquee Section */}
<section className="w-full max-w-6xl mx-auto py-12 border-t border-[#111111] overflow-hidden flex flex-col items-center">
  <div className="relative flex overflow-x-hidden w-full max-w-4xl [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
    <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
      {/* Logo Set 1 */}
      <div className="flex shrink-0 gap-24 md:gap-32 pr-24 md:pr-32 items-center">
        <Image src="/bawa.png" alt="Bawa Rocks LTD" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/pyth-icon.png" alt="Pyth" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/chainlink.png" alt="Chainlink" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/morpho-icon.png" alt="Morpho" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/amanat-icon.png" alt="Amanat Vaults" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
      </div>
      {/* Logo Set 2 */}
      <div className="flex shrink-0 gap-24 md:gap-32 pr-24 md:pr-32 items-center">
        <Image src="/bawa.png" alt="Bawa Rocks LTD" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/pyth-icon.png" alt="Pyth" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/chainlink.png" alt="Chainlink" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/morpho-icon.png" alt="Morpho" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/amanat-icon.png" alt="Amanat Vaults" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
      </div>
      {/* Logo Set 3 */}
      <div className="flex shrink-0 gap-24 md:gap-32 pr-24 md:pr-32 items-center">
        <Image src="/bawa.png" alt="Bawa Rocks LTD" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/pyth-icon.png" alt="Pyth" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/chainlink.png" alt="Chainlink" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/morpho-icon.png" alt="Morpho" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/amanat-icon.png" alt="Amanat Vaults" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
      </div>
       {/* Logo Set 4 */}
      <div className="flex shrink-0 gap-24 md:gap-32 pr-24 md:pr-32 items-center">
        <Image src="/bawa.png" alt="Bawa Rocks LTD" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/pyth-icon.png" alt="Pyth" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/chainlink.png" alt="Chainlink" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/morpho-icon.png" alt="Morpho" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
        <Image src="/amanat-icon.png" alt="Amanat Vaults" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
      </div>
    </div> {/* <-- Added this missing closing div for the animate-marquee wrapper */}
  </div>
</section>

                  {/* --- NEW FOOTER SECTION (Inspired by image_13.png) --- */}
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

            {/* Right: Small Logo Visual replacing text copyright */}
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

          {/* Bottom: Faint Legal Disclosure with mt-16 to fix spacing from image_13.png */}
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