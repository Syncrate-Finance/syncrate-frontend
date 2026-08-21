'use client'

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
            src="/logo.png" 
            alt="Syncrate Logo" 
            width={32} 
            height={32} 
            className="object-contain"
          />
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 text-sm font-medium">
          {/* Whitepaper Button */}
          <a 
            href="/whitepaper.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[#333333] text-white hover:bg-[#111111] transition-colors"
            aria-label="Read Whitepaper"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </a>
          <Link href="/app" className="px-5 py-2.5 rounded-full bg-white text-[#030303] hover:bg-[#E5E5E5] transition-colors">
            Mint SGLD
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main className="w-full max-w-6xl mx-auto px-6 flex flex-col items-start text-left mt-12 md:mt-24">
        {/* Main Heading */}
        <h1 className="text-3xl md:text-4xl font-normal tracking-tighter text-white mb-6 max-w-3xl leading-[1.05]">
          Bridging DeFi and productive real-world assets through transparent onchain yield. 
        </h1>

        {/* Subheading */}
        <p className="text-base text-[#888888] leading-relaxed mb-6 max-w-md">
          Syncrate channels onchain capital into productive real-world assets, delivering transparent, gold-backed yield designed for the next generation of decentralized finance.
        </p>
      </main>

      {/* --- SWIPEABLE CARDS SECTION --- */}
      <HowItWorks />
      
      {/* Divider and Products Label Section */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="w-full h-[1px] bg-[#222222] mb-6" />
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-white">
            Products
          </span>
        </div>
      </div>

      {/* --- NEW PRODUCTS HEADER & SECTION --- */}
      <section className="w-full max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PRODUCT CARD 1: SGLD */}
        <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] rounded-2xl overflow-hidden border border-[#222222] bg-[#030303] flex flex-col justify-between p-6 md:p-8">
          <div className="absolute inset-0 z-0">
            <Image
              src="/XAUs-bg-cover.PNG" 
              alt="SGLD Background"
              fill
              className="object-cover opacity-35"
              priority
            />
          </div>

          <div className="absolute inset-x-0 top-[15%] z-10 flex justify-center">
            <div className="relative w-48 h-48 md:w-56 md:h-56">
              <Image
                src="/XAUs-icon.png" 
                alt="SGLD Icon Visual"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="relative z-20 mt-auto flex flex-col items-start text-left w-full">
            <h3 className="text-2xl md:text-3xl font-normal text-white mb-2 tracking-tight">
              SGLD
            </h3>
            <p className="text-xs md:text-sm text-[#AAAAAA] leading-relaxed mb-6 max-w-sm">
              Each Syncrate Gold (SGLD) is backed 1:1 by LBMA-standard physical gold, held in secure vaults with reputable custodians in the UAE.
            </p>
            <Link href="/sgld">
              <button className="flex items-center gap-2 border border-[#333333] bg-black/60 backdrop-blur-md rounded-md px-5 py-2.5 text-xs font-medium text-white hover:bg-white hover:text-black transition-all duration-200">
                View Product <span>→</span>
              </button>
            </Link>
          </div>
        </div>

        {/* PRODUCT CARD 2: SGLD */}
        <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] rounded-2xl overflow-hidden border border-[#222222] bg-[#030303] flex flex-col justify-between p-6 md:p-8">
          <div className="absolute inset-0 z-0">
            <Image
              src="/SGLD-cover.PNG" 
              alt="SGLD Background"
              fill
              className="object-cover opacity-35"
              priority
            />
          </div>

          <div className="absolute inset-x-0 top-[15%] z-10 flex justify-center">
            <div className="relative w-48 h-48 md:w-56 md:h-56">
              <Image
                src="/SGLD-icon.png" 
                alt="SGLD Icon Visual"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="relative z-20 mt-auto flex flex-col items-start text-left w-full">
            <h3 className="text-2xl md:text-3xl font-normal text-white mb-2 tracking-tight">
              Syncrate Prime
            </h3>
            <p className="text-xs md:text-sm text-[#AAAAAA] leading-relaxed mb-6 max-w-sm">
              Syncrate Prime is a yield vault product that gives SGLD holders an optional path to deploy their gold exposure into, gold-backed financing opportunities and earn yield from the underlying returns.
            </p>
            <Link href="/sgld">
              <button className="flex items-center gap-2 border border-[#333333] bg-black/60 backdrop-blur-md rounded-md px-5 py-2.5 text-xs font-medium text-white hover:bg-white hover:text-black transition-all duration-200">
                Launch Syncrate Prime <span>→</span>
              </button>
            </Link>
          </div>
        </div>

      </section>

      {/* --- DESIGN SECTION --- */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-24 pb-8">
        <div className="w-full h-[2px] bg-[#333333] mb-6" />
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-white">
            Design
          </span>
        </div>

        <div className="mt-32 mb-16">
          <p className="text-3xl md:text-4xl font-normal tracking-tighter text-white max-w-3xl leading-[1.1]">
            Physical gold holds generational value, but it remains static onchain. Investors are forced to choose between the safety of gold backing or the growth of decentralized finance. Syncrate removes this friction, turning static asset preservation into yield generating assets.
          </p>
        </div>

        <div className="max-w-3xl mt-12 flex flex-col gap-2">
          <h4 className="text-base md:text-lg font-semibold text-[#E5E5E5]">
            Real Yield Source
          </h4>
          <p className="text-sm text-[#888888] leading-relaxed">
            sySGLD's growth isn't built on synthetic promises or arbitrary token emissions. Yield is driven directly from short-term gold financing arrangements with bullion banks and refiners who pay a financing spread that flows back to the Syncrate Prime vault.
          </p>
        </div>

        <div className="max-w-3xl mt-12 flex flex-col gap-2">
          <h4 className="text-base md:text-lg font-semibold text-[#E5E5E5]">
            Institutional-Grade Custody
          </h4>
          <p className="text-sm text-[#888888] leading-relaxed">
            While sySGLD earns additional upside, the base layer remains anchored. Each SGLD token are securely backed 1:1 by physical gold held in independent UAE vaults, tracked and priced continuously by Chainlink's decentralized oracle infrastructure.
          </p>
        </div>

        <div className="max-w-3xl mt-12 flex flex-col gap-2">
          <h4 className="text-base md:text-lg font-semibold text-[#E5E5E5]">
            Experienced Team
          </h4>
          <p className="text-sm text-[#888888] leading-relaxed">
            Our team brings extensive expertise from top global banks and companies including Goldman Sachs and ChainLink. We are also backed by industry leading advisors with decades of experience in onchain finance, tokenization and DeFi.
          </p>
        </div>
      </section>

      {/* --- INFRASTRUCTURE (STACK) SECTION --- */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-8 pb-16">
        <div className="w-full h-[2px] bg-[#333333] mb-6" />
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-white">
            Stack
          </span>
        </div>

        <div className="mt-32 mb-16">
          <p className="text-3xl md:text-4xl font-normal tracking-tighter text-white max-w-3xl leading-[1.1]">
            Syncrate is structured through a secure, institutional process designed for clear asset verification and continuous liquidity.
          </p>
        </div>

        <div className="flex flex-nowrap overflow-x-auto gap-4 pb-8 snap-x snap-mandatory scrollbar-none [mask-image:_linear-gradient(to_right,black_85%,transparent_100%)] md:[mask-image:none]">
          <div className="w-[85%] md:w-1/4 shrink-0 bg-[#111111]/60 border border-[#222222] rounded-[24px] p-6 flex flex-col items-start text-left snap-start">
            <div className="w-12 h-12 bg-[#222222] rounded-xl flex items-center justify-center mb-12 overflow-hidden">
              <Image src="/financing-icon.png" alt="Financing" width={24} height={24} className="object-contain" />
            </div>
            <h4 className="text-lg font-medium text-white mb-3">Gold Sourcing</h4>
            <p className="text-sm text-[#888888] leading-relaxed">
              Partnered with <span className="text-blue-500 font-medium">Alluca Gold</span>, a DMCC-licensed gold trading company, sourcing and financing LBMA-standard physical gold inventory that backs the value flowing through Syncrate.
            </p>
          </div>

          <div className="w-[85%] md:w-1/4 shrink-0 bg-[#111111]/60 border border-[#222222] rounded-[24px] p-6 flex flex-col items-start text-left snap-start">
            <div className="w-12 h-12 bg-[#222222] rounded-xl flex items-center justify-center mb-12 overflow-hidden">
              <Image src="/oracle-icon.PNG" alt="Oracle" width={24} height={24} className="object-contain" />
            </div>
            <h4 className="text-lg font-medium text-white mb-3">Oracle</h4>
            <p className="text-sm text-[#888888] leading-relaxed">
              Real-time gold price feeds and reserve data, powered by <span className="text-blue-500 font-medium">Chainlink</span> giving the SGLD token accurate, tamper-resistant pricing to calculate NAV and yield.
            </p>
          </div>

          <div className="w-[85%] md:w-1/4 shrink-0 bg-[#111111]/60 border border-[#222222] rounded-[24px] p-6 flex flex-col items-start text-left snap-start">
            <div className="w-12 h-12 bg-[#222222] rounded-xl flex items-center justify-center mb-12 overflow-hidden">
              <Image src="/custody-icon.PNG" alt="Custody" width={24} height={24} className="object-contain" />
            </div>
            <h4 className="text-lg font-medium text-white mb-3">Custody & Financing</h4>
            <p className="text-sm text-[#888888] leading-relaxed">
              Secure custodial storage and financing for physical gold bars, by <span className="text-blue-500 font-medium">Amanat Vaults</span>, ensuring the assets backing SGLD are held independently and always verfiable.
            </p>
          </div>
        </div>
      </section>

      {/* --- CONTRACTS SECTION --- */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-8 pb-12">
        <div className="w-full h-[2px] bg-[#333333] mb-6" />
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-medium text-white">
            Contracts
          </span>
          <span className="text-xs font-mono text-[#AAAAAA] bg-[#111111] px-3 py-1 rounded-full border border-[#222222]">
            Base Mainnet
          </span>
        </div>

        {/* Compact List Container */}
        <div className="w-full border border-[#222222] rounded-xl bg-[#0A0A0A] overflow-hidden flex flex-col">
          
          {/* SGLD Token */}
          <a 
            href="https://basescan.org/token/0x10C5E0643bCc6C915Cad0335f70A96c1532766eb"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 sm:py-5 border-b border-[#222222] hover:bg-[#111111] transition-colors duration-200"
          >
            <div className="flex flex-col mb-3 sm:mb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white group-hover:text-[#FFD700] transition-colors">
                  SGLD Token
                </span>
                <span className="text-[10px] font-mono text-[#666666] group-hover:text-white transition-colors sm:hidden">↗</span>
              </div>
              <span className="text-xs text-[#888888]">Syncrate Gold Asset</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-[#AAAAAA] bg-[#1a1a1a] px-3 py-1.5 rounded border border-[#333333] truncate max-w-[240px] sm:max-w-none">
                0x10C5E0643bCc6C915Cad0335f70A96c1532766eb
              </span>
              <span className="text-xs font-mono text-[#666666] group-hover:text-white transition-colors hidden sm:block">↗</span>
            </div>
          </a>

          {/* SyncrateEngine */}
          <a 
            href="https://basescan.org/address/0x37c0078D297243A22ac247cd93f1cafed9Dbe461"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 sm:py-5 border-b border-[#222222] hover:bg-[#111111] transition-colors duration-200"
          >
            <div className="flex flex-col mb-3 sm:mb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white group-hover:text-[#FFD700] transition-colors">
                  SyncrateEngine
                </span>
                <span className="text-[10px] font-mono text-[#666666] group-hover:text-white transition-colors sm:hidden">↗</span>
              </div>
              <span className="text-xs text-[#888888]">Minting & Redemption Engine</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-[#AAAAAA] bg-[#1a1a1a] px-3 py-1.5 rounded border border-[#333333] truncate max-w-[240px] sm:max-w-none">
                0x37c0078D297243A22ac247cd93f1cafed9Dbe461
              </span>
              <span className="text-xs font-mono text-[#666666] group-hover:text-white transition-colors hidden sm:block">↗</span>
            </div>
          </a>

          {/* SYNC Token */}
          <a 
            href="https://basescan.org/token/0xd93c521d39ee255bcc3cc9b6269e380fc08e022a"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 sm:py-5 hover:bg-[#111111] transition-colors duration-200"
          >
            <div className="flex flex-col mb-3 sm:mb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white group-hover:text-[#FFD700] transition-colors">
                  SYNC Token
                </span>
                <span className="text-[10px] font-mono text-[#666666] group-hover:text-white transition-colors sm:hidden">↗</span>
              </div>
              <span className="text-xs text-[#888888]">Protocol Ecosystem Token</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-[#AAAAAA] bg-[#1a1a1a] px-3 py-1.5 rounded border border-[#333333] truncate max-w-[240px] sm:max-w-none">
                0xD93c521D39Ee255Bcc3CC9b6269e380fc08e022A
              </span>
              <span className="text-xs font-mono text-[#666666] group-hover:text-white transition-colors hidden sm:block">↗</span>
            </div>
          </a>

        </div>
      </section>

      {/* --- NEWS & INSIGHTS SECTION --- */}
      <section className="w-full max-w-6xl mx-auto px-6 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-t border-[#222222] pt-8">
          <h2 className="text-lg font-medium text-white tracking-tight">
            News & Insights
          </h2>
          <Link href="/blog" className="text-sm font-medium text-[#AAAAAA] hover:text-white transition-colors flex items-center gap-1.5">
            View All <span className="text-[12px]">➔</span>
          </Link>
        </div>

        {/* Featured Card */}
        <Link 
          href="/blog/sgld-is-live"
          className="group block w-full max-w-2xl border border-[#222222] rounded-xl overflow-hidden bg-[#0A0A0A] hover:border-[#444444] transition-colors duration-300">
        
          {/* Card Top: Image */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-[#111111] overflow-hidden border-b border-[#222222]">
            <Image 
              src="/blog2.PNG" // Upload a thumbnail image of your choice to public/
              alt="Syncrate News Feature"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          {/* Card Bottom: Content */}
          <div className="p-6 md:p-8 flex flex-col gap-4">
            <h3 className="text-lg md:text-xl font-normal text-[#E5E5E5] leading-snug group-hover:text-white transition-colors">
              SGLD is Live: Gold, Built for DeFi
            </h3>
            <span className="text-xs text-[#888888]">23 Jul, 2026</span>
          </div>
        </Link>
      </section>

      {/* Partner Swipeable Section */}
      <section className="w-full max-w-6xl mx-auto py-4 border-t border-[#6586FF] overflow-hidden flex flex-col items-center">
        
        {/* Title */}
        <span className="text-sm font-medium text-[#888888] mb-4 tracking-wide">
          Building With
        </span>
        
        {/* Swipeable Container */}
        <div className="w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none [mask-image:_linear-gradient(to_right,transparent_0,_black_32px,_black_calc(100%-32px),transparent_100%)] md:[mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          
          <div className="flex w-max shrink-0 items-center justify-start gap-12 md:gap-16 px-12 md:px-32 py-2">
            <Image 
              src="/alluca.png" 
              alt="Alluca Gold" 
              width={120} 
              height={48} 
              className="snap-center object-contain shrink-0 w-[120px] h-[48px] opacity-50 grayscale hover:opacity-100 transition-opacity duration-300" 
            />
            <Image 
              src="/saffron.PNG" 
              alt="Saffron" 
              width={130} 
              height={52} 
              className="snap-center object-contain shrink-0 w-[120px] h-[48px] opacity-50 grayscale hover:opacity-100 transition-opacity duration-300" 
            />
            <Image 
              src="/chainlink.PNG" 
              alt="Chainlink" 
              width={130} 
              height={52} 
              className="snap-center object-contain shrink-0 w-[120px] h-[48px] opacity-50 grayscale hover:opacity-100 transition-opacity duration-300" 
            />
            <Image 
              src="/rwaxyz.png" 
              alt="RWAXYZ" 
              width={130} 
              height={52} 
              className="snap-center object-contain shrink-0 w-[120px] h-[48px] opacity-50 grayscale hover:opacity-100 transition-opacity duration-300" 
            />
            <Image 
              src="/uniswap-icon.png" 
              alt="Uniswap" 
              width={130} 
              height={52} 
              className="snap-center object-contain shrink-0 w-[120px] h-[48px] opacity-50 grayscale hover:opacity-100 transition-opacity duration-300" 
            />
            <Image 
              src="/veritas.png" 
              alt="Veritas" 
              width={130} 
              height={52} 
              className="snap-center object-contain shrink-0 w-[120px] h-[48px] opacity-50 grayscale hover:opacity-100 transition-opacity duration-300" 
            />
            <Image 
              src="/amanat.png" 
              alt="Amanat Vaults" 
              width={130} 
              height={52} 
              className="snap-center object-contain shrink-0 w-[120px] h-[48px] opacity-50 grayscale hover:opacity-100 transition-opacity duration-300" 
            />
          </div>
          
        </div>
        {/* Faint Square Slider Indicator */}
        <div className="flex items-center justify-center gap-2 mt-4 md:hidden">
          <div className="w-1.5 h-1.5 bg-[#666666]"></div>
          <div className="w-1.5 h-1.5 bg-[#222222]"></div>
          <div className="w-1.5 h-1.5 bg-[#222222]"></div>
        </div>

      </section>

      {/* --- FOOTER SECTION --- */}
      <footer className="w-full bg-[#0037FF] pt-16 pb-12 px-6 border-t border-[#111111]">
        <div className="w-full max-w-6xl mx-auto flex flex-col">
          <div className="flex justify-between items-start text-sm text-[#F5F5F5] font-medium">
            <div className="flex flex-col gap-5">
              <a href="mailto:team@syncrate.org" className="hover:text-[#888888] transition-colors">Contact</a>
              <a href="https://docs.syncrate.org" className="hover:text-[#888888] transition-colors">Documentation</a>
              <a href="https://discord.gg/Q9MRKP69Fj" className="hover:text-[#888888] transition-colors">Discord</a>
              <Link href="/blog" className="hover:text-[#888888] transition-colors">Blog</Link>
              <Link href="/terms" className="hover:text-[#888888] transition-colors">Terms & Disclosures</Link>
              <a href="https://x.com/syncratenetwork" className="hover:text-[#888888] transition-colors">X (formerly Twitter)</a>
              <a href="https://github.com/Syncrate-Finance" className="hover:text-[#888888] transition-colors">GitHub</a>
            </div>

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

          <div className="w-full mt-16 flex flex-col gap-2 text-[10px] md:text-xs text-[#F5F5F5] leading-relaxed text-justify md:text-left">
            <p>
              Syncrate is a technology platform and does not constitute an offer to sell or a solicitation of an offer to buy any securities, financial instruments, or investment products in any jurisdiction where such offer or solicitation would be unlawful. SGLD is not legal tender, is not insured by any government deposit insurance scheme, and is not guaranteed by any bank or financial institution.
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
