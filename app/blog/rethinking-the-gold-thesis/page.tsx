import Image from 'next/image'
import Link from 'next/link'

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans antialiased selection:bg-white/20">
      
      {/* --- TOP NAVIGATION --- */}
      <header className="w-full px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          {/* Using a placeholder for your blue geometric logo */}
          <div className="w-4 h-6 flex flex-col gap-0.5">
            <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-sm ml-2"></div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="px-4 py-1.5 rounded-full border border-[#333333] text-sm text-[#CCCCCC] hover:bg-[#222222] transition-colors"
          >
            Main site
          </Link>
          <Link 
            href="/apply" 
            className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Apply
          </Link>
        </div>
      </header>

      {/* --- MAIN ARTICLE CONTAINER --- */}
      <main className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        
        {/* INNER CARD (Matches the slightly lighter rounded container in your design) */}
        <div className="bg-[#1C1C1E] rounded-[32px] p-6 md:p-10 shadow-2xl">
          
          {/* BACK BUTTON */}
          <Link 
            href="/blog" 
            className="inline-flex items-center justify-center px-4 py-1.5 bg-[#2C2C2E] rounded-full text-sm text-[#A1A1AA] hover:text-white hover:bg-[#3A3A3C] transition-all mb-8"
          >
            &lt; Back
          </Link>

          {/* ARTICLE METADATA & TITLE */}
          <div className="flex flex-col gap-4 mb-8">
            <span className="text-[#A1A1AA] text-sm">02 Jul 2026</span>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.1]">
              The technology behind Living Liquid
            </h1>
            
            {/* WATCH ON X BUTTON */}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-[#A1A1AA]">Watch on</span>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-white hover:bg-[#3A3A3C] transition-colors"
              >
                {/* Simple X icon representation */}
                <span className="text-xs font-bold">X</span>
              </a>
            </div>
          </div>

          {/* HERO IMAGE */}
          <div className="w-full aspect-[16/9] relative rounded-2xl overflow-hidden mb-10 border border-[#333333]/50">
            {/* Note: Replace '/techdollar.jpg' with your actual image path */}
            <Image 
              src="/techdollar.jpg" 
              alt="Portrait of Techdollar founder" 
              fill
              className="object-cover grayscale" // Added grayscale to match your reference
            />
          </div>

          {/* 
            ARTICLE BODY & PARAGRAPHING
            The 'space-y-6' class below automatically adds vertical spacing 
            between every <p>, <h2>, or <div> inside this container. 
          */}
          <article className="space-y-6 text-[#D4D4D8] text-lg leading-relaxed font-light">
            <p>
              Land got mortgages. Stocks got margin. Receivables got factoring. Private equity, 
              the asset class where modern wealth is actually created, got nothing. Hundreds of 
              billions of dollars in verified ownership sit motionless while the world competes for capital. 
            </p>

            <p>
              This article examines how Techdollar unlocks that dormant value through verified private lending. 
              Techdollar is software: a compliant protocol for employee retention and upside ownership, 
              purpose built to provide a liquid environment for illiquid assets.
            </p>

            {/* Example of how you would add a subheading further down the article */}
            <h2 className="text-2xl font-medium text-white pt-6 border-t border-[#333333]">
              The Illiquidity Penalty
            </h2>

            <p>
              When founders and early employees are forced to wait a decade for a liquidity event, 
              the traditional venture model fractures. We built a mechanism that allows continuous 
              price discovery and secondary liquidity without the overhead of public markets.
            </p>
          </article>
          
        </div>
      </main>
    </div>
  )
}
