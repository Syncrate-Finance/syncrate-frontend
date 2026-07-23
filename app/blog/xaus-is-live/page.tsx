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
            <span className="text-[#888888] text-sm font-mono">23 Jul 2026</span>
            <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-white leading-[1.1]">
              XAUs is Live: Gold built for DeFi
            </h1>
          </div>

          {/* HERO IMAGE */}
          <div className="w-full aspect-[16/9] relative rounded-[24px] overflow-hidden mb-10 border border-[#222222]">
            <Image 
              src="/blog2.PNG" 
              alt="XAUs is Live" 
              fill
              className="object-cover grayscale opacity-90"
            />
          </div>

          {/* ARTICLE BODY & PARAGRAPHING */}
          <article className="space-y-6 text-[#D4D4D8] text-base md:text-lg leading-relaxed font-light">
            <p>
              Gold has long been one of the world’s most trusted stores of value, but owning it has always required a tradeoff. 
              Physical gold offers safety without counterparty risk, but it’s difficult to move, divide, or use in modern finance. On the other hand, traditional gold financial products rely on legacy intermediaries built for a system that isn't open or programmable. 
            </p>

            <p>
             We believe onchain infrastructure changes this equation completely.
             Today, XAUs is publicly live on Base. 
            </p>

            <p>
              XAUs is Syncrate’s tokenized gold asset, designed to bring gold onchain as a programmable financial primitive. Each XAUs token represents exposure to one troy ounce of gold held within Syncrate’s custody infrastructure. 
              But our goal isn't just to wrap gold in a digital container - it's to make gold actively usable.
            </p>

            <h2 className="text-2xl font-normal text-white pt-6 border-t border-[#222222] tracking-tight">
              From Store of Value to Onchain Primitive
            </h2>

           <p>
  Despite gold's massive global market, its potential onchain remains largely untapped. A true tokenized gold asset should move through financial infrastructure just as easily as any crypto-native asset.
  With XAUs, gold can now be integrated directly into decentralized finance to:
</p>

<ul>
  <li>Trade on decentralized markets and serve as reliable collateral.</li>
  <li>Integrate into lending protocols and structured financial products.</li>
  <li>Power real-world yield strategies by composing with other DeFi primitives.</li>
</ul>

               <h2 className="text-2xl font-normal text-white pt-6 border-t border-[#222222] tracking-tight">
              The Modular Architecture: XAUs and SGLD
            </h2>

              <p>
               To maximize utility, we designed a modular setup that separates gold exposure from yield strategies:
               </p>

               <ul>
  <li><strong>Syncrate Gold (XAUs):</strong> Provides direct exposure to tokenized gold.</li>
  <li><strong>Syncrate Prime (SGLD):</strong> Built on top of XAUs, SGLD deploys gold-backed capital into real-world financing arrangements to generate yield.</li>
</ul>

                <p>
                Crucially, this yield isn't driven by inflationary token emissions - it's backed by real economic activity, creating a sustainable foundation for gold-based financial products.
                 </p>
                 
                <h2 className="text-2xl font-normal text-white pt-6 border-t border-[#222222] tracking-tight">
              Why Composability Matters
            </h2>

                <p>
                Tokenizing real-world assets is only the first step. The real opportunity lies in composability - giving these assets the ability to interact smoothly with the rest of the financial system.
                That missing piece is what we are building at Syncrate.
                </p>

                <p>
The launch of XAUs is a major milestone, but it’s only the beginning. As we expand, we are focused on deepening liquidity, scaling DeFi integrations, building institutional partnerships, and driving multichain access.
</p>

<p>
Gold shouldn't just sit onchain. It should move, interact, and work.
</p>

<p className="text-white">
  Explore XAUs:{' '}
  <Link 
    href="/xaus" 
    className="text-[#888888] underline hover:text-white transition-colors"
  >
    https://www.syncrate.org/xaus
  </Link>
</p>
          </article>
          
        </div>
      </main>
    </div>
  )
}
