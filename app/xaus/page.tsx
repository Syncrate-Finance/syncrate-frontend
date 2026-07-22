'use client'

import { useState, useRef, useEffect, UIEvent } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Link from 'next/link'
import Image from 'next/image'
import { createPublicClient, http, formatUnits } from 'viem'
import { base } from 'viem/chains'

// Initialize Base public client
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
})

// XAUs Address & Minimal ABI
const XAUS_ADDRESS = '0xfa581c1F9c48fdb4137Aea343BA810434B3177d3' as `0x${string}`
const xausAbi = [
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const

export default function XAUsProductPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Live Metrics State
  const [totalSupply, setTotalSupply] = useState<string>('0 XAUs')
  const [marketCap, setMarketCap] = useState<string>('$0.00')
  const [mintPrice] = useState<number>(4154.91) // Real-time gold mint quote

  // Fetch live onchain supply and compute Market Cap
  useEffect(() => {
    async function fetchOnChainData() {
      try {
        const rawSupply = (await publicClient.readContract({
          address: XAUS_ADDRESS,
          abi: xausAbi,
          functionName: 'totalSupply',
        } as any)) as bigint

        const formattedSupply = parseFloat(formatUnits(rawSupply, 18))

        // Format Total Supply
        const supplyString = `${formattedSupply.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })} XAUs`
        setTotalSupply(supplyString)

        // Calculate Market Cap
        const calculatedMarketCap = formattedSupply * mintPrice
        const mcapString = `$${calculatedMarketCap.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
        setMarketCap(mcapString)

      } catch (error) {
        console.error('Error querying live XAUs supply on Base:', error)
      }
    }

    fetchOnChainData()
  }, [mintPrice])

  const features = [
    {
      id: 1,
      title: "LBMA-Standard",
      description: "All Syncrate Gold bars are LBMA-standard, sourced directly from Ziba Refinery by our bullion supplier (Alluca Gold), ensuring each gold bar is bullion-market authentic and globally accepted.",
      bgImage: "/feature-1.PNG", 
      logos: ["/alluca.png"]
    },
    {
      id: 2,
      title: "Securly Vaulted",
      description: "Syncrate partners with Amanat Vaults - a UAE leading vaulting firm, to physical safeguard Syncrate's physical gold bars.",
      bgImage: "/feature-2.PNG",
      logos: ["/amanat.png"]
    },
    {
      id: 3,
      title: "Accessible Everywhere",
      description: "XAUs is deployed across multiple chains and exchanges, enabling robust liquidy and seamless ownership.",
      bgImage: "/feature-3.PNG",
      logos: ["/eth.png", "/base.jpeg"]
    }
  ]

  const faqs = [
    {
      q: "What is XAUs?",
      a: "Syncrate Gold (XAUs) is a digital asset where each token is fully backed by one troy ounce of 99.99% pure physical gold bullion secured in reputable UAE vaults."
    },
    {
      q: "How can I verify the physical gold backing?",
      a: "Transparency is maintained via independent third-party physical audits conducted by Bureau Veritas alongside bi-annual vault statement reconciliations available on our transparency dashboard."
    },
    {
      q: "Is there a minimum requirement for minting and redemption?",
      a: "No. There is no minimum minting requirement and XAUs can be redeemed back into USDC/USDT at any amount"
    },
    {
      q: "What is the fee structure?",
      a: "A 0.25% fee is charged on every XAUs redemption transaction."
    }
  ]

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const firstCard = container.children[0] as HTMLElement
    if (!firstCard) return
    
    const itemWidth = firstCard.offsetWidth + 24
    const scrollLeft = container.scrollLeft
    
    const newIndex = Math.floor((scrollLeft + itemWidth / 2) / itemWidth)
    
    if (newIndex >= 0 && newIndex < features.length && newIndex !== activeIndex) {
      setActiveIndex(newIndex)
    }
  }

  const scrollToCard = (index: number) => {
    const container = scrollContainerRef.current
    if (!container) return
    const firstCard = container.children[0] as HTMLElement
    if (!firstCard) return
    
    const itemWidth = firstCard.offsetWidth + 24
    container.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    })
    setActiveIndex(index)
  }

  return (
    <div 
      className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col antialiased ${GeistSans.variable} ${GeistMono.variable}`} 
      style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      {/* --- TOP NAVIGATION --- */}
      <header className="w-full flex items-center justify-between px-6 py-5 max-w-6xl mx-auto border-b border-[#111111]">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
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
            src="/XAUs-bg-cover.PNG" 
            alt="XAUs Gold Background"
            fill
            className="object-cover opacity-25"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030303]/50 to-[#030303]" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 md:py-20">
          <div className="flex flex-col text-left max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-normal tracking-tighter text-white mb-6 stroke-none leading-[1.05]">
              Real <span className="text-[#FFD700]">Gold.</span> <br />
              OnChain.
            </h1>

            <p className="text-sm md:text-base text-[#AAAAAA] leading-relaxed mb-8 max-w-xl">
              Backed by 99.99% pure LBMA-standard gold, with each token representing 1 troy oz. Vaulted securely with reputable custodians in the UAE.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-12 mb-12 font-sans">
              <div className="flex-shrink-0">
                <Link href="/app" className="inline-block px-8 py-3.5 bg-white text-black font-medium text-sm rounded-md hover:bg-[#E5E5E5] transition-all">
                  Buy XAUs
                </Link>
              </div>

              <div className="flex flex-col gap-2 border-l border-[#222222] pl-8">
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-[10px] font-mono tracking-wider text-[#666666] uppercase mb-0.5">Mint Price</p>
                    <p className="text-xl md:text-2xl font-normal text-white tracking-tight">
                      ${mintPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono tracking-wider text-[#666666] uppercase mb-0.5">Redeem Price</p>
                    <p className="text-xl md:text-2xl font-normal text-white tracking-tight">$4,123.54</p>
                  </div>
                </div>
                <p className="text-[11px] text-[#555555] tracking-normal font-normal">
                  Real-time price quote available in the mint/redeem web-app.
                </p>
              </div>
            </div>

            {/* --- LIVE METRICS GRID --- */}
            <div className="pt-8 border-t border-[#111111]/50 backdrop-blur-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Market Cap</p>
                  <p className="text-xl md:text-2xl font-normal text-white tracking-tight">{marketCap}</p>
                </div>
                <div>
                  <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Bullion Weight</p>
                  <p className="text-xl md:text-2xl font-normal text-white tracking-tight">193 Troy Oz</p>
                </div>
                <div>
                  <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Total Supply</p>
                  <p className="text-xl md:text-2xl font-normal text-white tracking-tight">{totalSupply}</p>
                </div>
                <div>
                  <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Vault Gold Bars</p>
                  <p className="text-xl md:text-2xl font-normal text-white tracking-tight">6 Bars</p>
                </div>
              </div>

              {/* External Links Bar */}
              <div className="flex items-center gap-3">
                <a
                  href={`https://basescan.org/token/${XAUS_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111] hover:bg-[#1a1a1a] border border-[#222222] text-xs font-mono text-[#AAAAAA] hover:text-white transition-all"
                >
                  <Image src="/basescan.jpg" alt="BaseScan" width={14} height={14} className="rounded-full object-cover" />
                  BaseScan
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>

                <a
                  href="https://dune.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111] hover:bg-[#1a1a1a] border border-[#222222] text-xs font-mono text-[#AAAAAA] hover:text-white transition-all"
                >
                  <Image src="/dune.JPG" alt="Dune Analytics" width={14} height={14} className="rounded-full object-cover" />
                  Dune
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- XAUs FEATURES SECTION --- */}
      <section className="w-full max-w-6xl mx-auto px-6 py-12 md:py-16">
        <hr className="border-[#222222] mb-12" />
        
        <span className="text-xs font-mono text-[#666666] tracking-widest block mb-4">
          XAUs Features
        </span>

        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl md:text-4xl font-normal text-white tracking-tight mb-3">
            Secure <span className="text-[#FFD700]">Gold.</span> Transparent Infrastructure.
          </h2>
          <p className="text-sm md:text-lg text-[#888888] leading-relaxed">
            From licensed gold sourcing to independent vault custody, Syncrate combines trusted real-world infrastructure with programmable onchain finance.
          </p>
        </div>

        {/* Sliding Cards Container */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {features.map((feature) => (
            <div 
              key={feature.id}
              className="relative flex-none w-[320px] md:w-[400px] aspect-[4/5] rounded-xl overflow-hidden snap-center group border border-[#1a1a1a] flex flex-col justify-end"
            >
              <div className="absolute inset-0 z-0 bg-[#0d0d0d]">
                <Image
                  src={feature.bgImage}
                  alt={feature.title}
                  fill
                  sizes="(max-width: 768px) 320px, 400px"
                  className="object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent" />
              </div>

              <div className="relative z-10 p-6 md:p-8 flex flex-col w-full">
                <h3 className="text-xl md:text-2xl font-medium text-white tracking-tight mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-xs md:text-sm text-[#AAAAAA] leading-relaxed mb-6">
                  {feature.description}
                </p>

                <div className="pt-5 border-t border-[#222222]/60 w-full">
                  <div className={`flex flex-wrap items-center ${feature.id <= 2 ? 'gap-x-6 gap-y-3' : 'gap-3'}`}>
                    {feature.logos.map((logoPath, idx) => {
                      if (feature.id <= 2) {
                        return (
                          <div 
                            key={idx} 
                            className="relative h-12 w-36 flex items-center justify-start overflow-hidden"
                          >
                            <Image 
                              src={logoPath} 
                              alt="Integrated Network Partner" 
                              fill
                              sizes="(max-width: 768px) 96px, 96px"
                              className="object-contain object-left brightness-0 invert" 
                            />
                          </div>
                        )
                      }

                      return (
                        <div 
                          key={idx} 
                          className="relative w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-white/5 border border-white/10"
                        >
                          <Image 
                            src={logoPath} 
                            alt="Integrated Network Partner" 
                            fill
                            sizes="36px"
                            className="object-cover" 
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Indicator Dots */}
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

      {/* --- TRANSPARENCY & VERIFICATION SECTION --- */}
      <section className="relative w-full overflow-hidden border-t border-[#111111] py-16 md:py-24">
        <div className="absolute inset-0 z-0 w-full h-full">
          <Image
            src="/XAUs-bg-cover.PNG" 
            alt="Transparency Background"
            fill
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-transparent to-[#030303]" />
          <div className="absolute inset-0 bg-[#030303]/40 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xs font-mono text-[#666666] tracking-widest block">
              Transparency
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-12 md:gap-8 justify-between items-start">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-4xl font-normal text-white tracking-tight mb-6 leading-tight">
                Transparent by Design
              </h2>
              <p className="text-sm md:text-lg text-[#888888] leading-relaxed">
                Syncrate combines independent audits by Bureau Veritas with regular reserve statements from custodians, ensuring institutional-grade transparency across the protocol.
              </p>
            </div>

            <div className="w-full md:w-[420px] flex flex-col mt-4 md:mt-0 border-t border-[#222222]">
              <Link 
                href="/asset-statements"
                className="flex items-center justify-between py-5 border-b border-[#222222] group hover:bg-white/5 px-2 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#AAAAAA] group-hover:text-white transition-colors">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span className="text-[#F5F5F5] font-normal text-base md:text-lg">Assets Statements</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#666666] group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </Link>

              <Link 
                href="/audits" 
                className="flex items-center justify-between py-5 border-b border-[#222222] group hover:bg-white/5 px-2 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#AAAAAA] group-hover:text-white transition-colors">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span className="text-[#F5F5F5] font-normal text-base md:text-lg">Audit Reports</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#666666] group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQs SECTION --- */}
      <section className="w-full max-w-6xl mx-auto px-6 py-16 md:py-24 border-t border-[#111111]">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-normal text-white tracking-tight mb-12">
            FAQs
          </h2>

          <div className="flex flex-col border-t border-[#222222]">
            {faqs.map((faq, index) => (
              <FaqItem key={index} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>
      
      {/* --- FOOTER SECTION --- */}
      <footer className="w-full bg-[#0037FF] pt-16 pb-12 px-6 border-t border-[#111111]">
        <div className="w-full max-w-6xl mx-auto flex flex-col">
          <div className="flex justify-between items-start text-sm text-[#F5F5F5] font-medium">
            <div className="flex flex-col gap-5">
              <a href="mailto:team@syncrate.org" className="hover:text-[#888888] transition-colors">Contact</a>
              <a href="https://docs.syncrate.org" className="hover:text-[#888888] transition-colors">Documentation</a>
              <a href="#" className="hover:text-[#888888] transition-colors">Brand Kit</a>
              <a href="#" className="hover:text-[#888888] transition-colors">Terms & Disclosures</a>
              <Link href="/blog" className="hover:text-[#888888] transition-colors">Blog</Link>
              <a href="https://x.com/syncratefi" className="hover:text-[#888888] transition-colors">X (formerly Twitter)</a>
              <a href="https://linkedin.com/company/syncrateprotocol" className="hover:text-[#888888] transition-colors">LinkedIn</a>
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

// Sub-component for individual FAQ toggles
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-[#222222] w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group hover:bg-white/[0.02] px-2 transition-colors duration-200"
      >
        <span className="text-base md:text-lg font-normal text-[#F5F5F5] pr-4">
          {question}
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
          {answer}
        </p>
      </div>
    </div>
  )
}
