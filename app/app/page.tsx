import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Link from 'next/link'
import Image from 'next/image'

export default function AppPage() {
  return (
    <div 
      className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col antialiased ${GeistSans.variable} ${GeistMono.variable}`} 
      style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      
      {/* Top Header with Logo */}
      <header className="w-full flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.jpg" 
            alt="Syncrate Logo" 
            width={32} 
            height={32} 
            className="object-contain rounded-full" 
          />
          <span className="text-lg font-medium tracking-tight text-white">Syncrate</span>
        </Link>
      </header>
      
      {/* Main Content Area (flex-grow expands to fill all middle space, perfectly centering content) */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 min-h-[40vh]">
        <h1 className="text-3xl md:text-4xl font-normal tracking-tighter text-white mb-8 leading-[1.05] text-center">
          Coming soon..
        </h1>

        <Link 
          href="/" 
          className="px-6 py-3 rounded-full border border-[#333333] text-sm font-medium text-white hover:bg-[#111111] transition-colors"
        >
          ← Back to Home
        </Link>
      </main>
      
      {/* Partner Marquee Section */}
      <section className="w-full max-w-6xl mx-auto py-3 border-t border-[#6586FF] overflow-hidden flex flex-col items-center">
        <div className="relative flex overflow-x-hidden w-full max-w-4xl [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <div className="flex w-max shrink-0 gap-24 md:gap-32 pr-24 md:pr-32 items-center animate-[marquee_10s_linear_infinite] hover:[animation-play-state:paused]">
            
            {/* Track 1 */}
            <div className="flex shrink-0 gap-12 md:gap-16 items-center">
              <Image src="/bawa.png" alt="Bawa Rocks LTD" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/pyth-icon.png" alt="Pyth" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/chainlink.png" alt="Chainlink" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/morpho-icon.png" alt="Morpho" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/amanat-icon.png" alt="Amanat Vaults" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
            </div>

            {/* Track 2 */}
            <div className="flex shrink-0 gap-12 md:gap-16 items-center">
              <Image src="/bawa.png" alt="Bawa Rocks LTD" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/pyth-icon.png" alt="Pyth" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/chainlink.png" alt="Chainlink" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/morpho-icon.png" alt="Morpho" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/amanat-icon.png" alt="Amanat Vaults" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
            </div>

            {/* Track 3 */}
            <div className="flex shrink-0 gap-12 md:gap-16 items-center">
              <Image src="/bawa.png" alt="Bawa Rocks LTD" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/pyth-icon.png" alt="Pyth" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/chainlink.png" alt="Chainlink" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/morpho-icon.png" alt="Morpho" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/amanat-icon.png" alt="Amanat Vaults" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
            </div>

            {/* Track 4 */}
            <div className="flex shrink-0 gap-12 md:gap-16 items-center">
              <Image src="/bawa.png" alt="Bawa Rocks LTD" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/pyth-icon.png" alt="Pyth" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/chainlink.png" alt="Chainlink" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/morpho-icon.png" alt="Morpho" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
              <Image src="/amanat-icon.png" alt="Amanat Vaults" width={100} height={30} className="object-contain shrink-0 w-auto opacity-50 grayscale" />
            </div>

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
