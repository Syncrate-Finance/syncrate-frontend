import Image from 'next/image'
import Link from 'next/link'

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans antialiased selection:bg-white/20">
      
      {/* --- TOP NAVIGATION --- */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="Syncrate Logo" 
              width={32} 
              height={32} 
              className="object-contain cursor-pointer"
            />
          </Link>
        </div>

        {/* Right Action Button */}
        <div className="flex items-center gap-3 text-sm font-medium">
          <Link 
            href="/" 
            className="px-5 py-2.5 rounded-full border border-[#333333] text-white hover:bg-[#111111] transition-colors"
          >
            Main site
          </Link>
        </div>
      </header>

      {/* --- MAIN ARTICLE CONTAINER --- */}
      <main className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        
        {/* INNER CARD */}
        <div className="bg-[#161616] rounded-[32px] p-6 md:p-10 shadow-2xl">
          
          {/* BACK BUTTON */}
          <Link 
            href="/blog" 
            className="inline-flex items-center justify-center px-4 py-1.5 bg-[#222222] rounded-full text-sm text-[#A1A1AA] hover:text-white hover:bg-[#2A2A2A] transition-all mb-8"
          >
            &lt; Back
          </Link>

          {/* ARTICLE METADATA & TITLE */}
          <div className="flex flex-col gap-4 mb-8">
            <span className="text-[#888888] text-sm font-mono">02 Jul 2026</span>
            <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-white leading-[1.1]">
              Rethinking the Gold Thesis
            </h1>
          </div>

          {/* HERO IMAGE */}
          <div className="w-full aspect-[16/9] relative rounded-[24px] overflow-hidden mb-10 border border-[#222222]">
            <Image 
              src="/blog1.PNG" 
              alt="Rethinking the Gold Thesis" 
              fill
              className="object-cover grayscale opacity-90"
            />
          </div>

          {/* ARTICLE BODY & PARAGRAPHING */}
          <article className="space-y-6 text-[#D4D4D8] text-base md:text-lg leading-relaxed font-light">
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

            <h2 className="text-2xl font-normal text-white pt-6 border-t border-[#222222] tracking-tight">
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
