'use client'

import { useState, useRef, UIEvent } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Link from 'next/link'
import Image from 'next/image'

export default function XAUsProductPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const features = [
    {
      id: 1,
      title: "Goldbod Accredited",
      description: "All Syncrate Gold bars are Goldbog-accredited and sourced directly from Goldbod miners, ensuring each gold bar is bullion-market authentic and globally accepted.",
      bgImage: "/feature-1.PNG", 
      logos: ["/eth3.png"]
    },
    {
      id: 2,
      title: "Securly Vaulted",
      description: "Syncrate partners with Amanat Vaults - a UAE leading vaulting firm, to physical safeguard Syncrate's physical gold bars.",
      bgImage: "/feature-2.PNG",
      logos: ["/custodian-1.png", "/custodian-2.png"]
    },
    {
      id: 3,
      title: "Accessible Everywhere",
      description: "XAUs is deployed across multiple chains, enabling robust liquidy and seamless ownership.",
      bgImage: "/feature-3.PNG",
      logos: ["/eth.png", "/base.png"]
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
            <h1 className="text-4xl md:text-6xl font-normal tracking-tighter text-white mb-6 leading-[1.05]">
              Real <span className="text-[#FFD700]">Gold.</span> <br />
              OnChain.
            </h1>

            <p className="text-sm md:text-base text-[#AAAAAA] leading-relaxed mb-8 max-w-xl">
              Backed by 99.99% pure Goldbog-accredited gold, with each token representing 1 troy oz. Vaulted securely with reputable custodians in the UAE.
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
                    <p className="text-xl md:text-2xl font-normal text-white tracking-tight">$4,154.91</p>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[#111111]/50 backdrop-blur-sm">
              <div>
                <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Market Cap</p>
                <p className="text-xl md:text-2xl font-normal text-white tracking-tight">$11.51M</p>
              </div>
              <div>
                <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Bullion Weight</p>
                <p className="text-xl md:text-2xl font-normal text-white tracking-tight">2,765 Troy Oz</p>
              </div>
              <div>
                <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Total Supply</p>
                <p className="text-xl md:text-2xl font-normal text-white tracking-tight">2,765 XAUs</p>
              </div>
              <div>
                <p className="text-xs font-mono tracking-wider text-[#666666] uppercase mb-1">Vault Gold Bars</p>
                <p className="text-xl md:text-2xl font-normal text-white tracking-tight">86 Bars</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- XAUs FEATURES SECTION --- */}
      <section className="w-full max-w-6xl mx-auto px-6 py-12 md:py-16">
        <hr className="border-[#222222] mb-12" />
        
        <span className="text-xs font-mono uppercase text-[#666666] tracking-widest block mb-4">
          Key Features
        </span>

        {/* FIXED: Turn layout header and subheading into cleanly formatted static texts */}
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl md:text-4xl font-normal text-white tracking-tight mb-3">
            Highest Standards of <span className="text-[#FFD700]">Gold & Storage</span>
          </h2>
          <p className="text-base md:text-lg text-[#888888] leading-relaxed">
            Global gold infrastructure integrated seamlessly with secure bullion clearing markets, institutional custody modules, and multi-chain access tokens.
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
                  sizes="(max-w-768px) 320px, 400px"
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
                  <div className="flex flex-wrap items-center gap-3">
                    {feature.logos.map((logoPath, idx) => (
                      <div 
                        key={idx} 
                        /* FIXED Dimensions: w-9 h-9 (36px frame) with circular overflow clipping */
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
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Small Navigation Indicator Dots */}
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

       {/* --- FOOTER SECTION --- */}
      <footer className="w-full bg-[#0037FF] pt-16 pb-12 px-6 border-t border-[#111111] mt-auto">
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
            <p>Syncrate is a technology platform and does not constitute an offer to sell or a solicitation of an offer to buy any securities...</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
