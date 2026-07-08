'use client'

import { useState, useRef, UIEvent } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Link from 'next/link'
import Image from 'next/image'

export default function SGLDProductPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Layout Helpers (Added to satisfy slide indicator map logic safely)
  const features = [0, 1, 2] 
  const scrollToCard = (index: number) => {
    setActiveIndex(index)
  }

  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col justify-between antialiased ${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}>
      
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
      <main className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0 w-full h-full">
          <Image
            src="/SGLD-cover.PNG" 
            alt="SGLD Background"
            fill
            className="object-cover opacity-25"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030303]/50 to-[#030303]" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 md:py-20">
          <div className="flex flex-col text-left max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-normal tracking-tighter text-white mb-6 stroke-none leading-[1.05]">
              Put Your <span className="text-[#FFD700]">Gold.</span> <br />
              To Work.
            </h1>

            <p className="text-sm md:text-base text-[#AAAAAA] leading-relaxed mb-8 max-w-xl">
              Earn yield on your XAUs & stablecoins while maintaining exposure to physical gold through Syncrate’s Gold Yield Vault.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-12 mb-12 font-sans">
              <div className="flex-shrink-0">
                <Link href="/app/sgld" className="inline-block px-8 py-3.5 bg-white text-black font-medium text-sm rounded-md hover:bg-[#E5E5E5] transition-all">
                  Deposit XAUs
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[#111111]/50 backdrop-blur-sm">
              <div>
                <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Vault TVL</p>
                <p className="text-xl md:text-2xl font-normal text-white tracking-tight">–</p>
              </div>
              <div>
                <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Total Supply</p>
                <p className="text-xl md:text-2xl font-normal text-white tracking-tight">–</p>
              </div>
              <div>
                <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Current Share Price</p>
                <p className="text-xl md:text-2xl font-normal text-white tracking-tight">–</p>
              </div>
              <div>
                <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">XAUs Deployed</p>
                <p className="text-xl md:text-2xl font-normal text-white tracking-tight">–</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- FEATURE NAVIGATION INDICATORS --- */}
      <section className="w-full max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center gap-2 mt-4">
          {features.map((_, index) => (
            <button 
              key={index}
              onClick={() => scrollToCard(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-6 bg-[#0037FF]' : 'w-1.5 bg-[#222222]'}`}
            />
          ))}
        </div>
      </section>

      {/* --- FAQs SECTION --- */}
      <section className="w-full max-w-6xl mx-auto px-6 py-16 md:py-24 border-t border-[#111111]">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-normal text-white tracking-tight mb-12">
            FAQs
          </h2>

          <div className="flex flex-col border-t border-[#222222]">
            {[
              {
                q: "What is SGLD?",
                a: "SGLD is a vault share token representing a proportional claim on the Syncrate Gold Yield Vault. As the vault earns income from institutional gold financing, the value of each SGLD share increases over time and can be redeemed for XAUs."
              },
              {
                q: "How is yield distributed?",
                a: "Yield is not paid as separate rewards. Financing income generated from institutional gold lending accrues directly to the Syncrate Gold Yield Vault, increasing the value of each SGLD share over time. Holders realize this yield when redeeming SGLD for XAUs."
              },
              {
                q: "What is the fee structure?",
                a: "There is no deposit fee. A 0.15% fee is charged on every withdrawal transaction - paid in the native token of the blockchain XAUs is being redeemed from."
              }
            ].map((faq, index) => {
              // Internalized wrapper block to legally handle hook logic per dynamic map object
              return (
                <FAQItem key={index} q={faq.q} a={faq.a} />
              )
            })}
          </div>
        </div>
      </section>
      
      {/* --- FOOTER SECTION --- */}
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

{/* Sub-component logic separating loops cleanly to avoid hook rule breaks */}
function FAQItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-[#222222] w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group hover:bg-white/[0.02] px-2 transition-colors duration-200"
      >
        <span className="text-base md:text-lg font-normal text-[#F5F5F5] pr-4">
          {q}
        </span>
        <span className="text-xl font-mono text-[#AAAAAA] group-hover:text-white transition-colors w-6 h-6 flex items-center justify-center select-none">
          {isOpen ? '–' : '+'}
        </span>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-40 opacity-100 mb-6' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-sm md:text-base text-[#888888] leading-relaxed px-2 max-w-2xl">
          {a}
        </p>
      </div>
    </div>
  )
}
