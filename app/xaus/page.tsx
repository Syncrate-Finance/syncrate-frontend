import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Link from 'next/link'
import Image from 'next/image'

export default function XAUsProductPage() {
  
  // Dummy data for the 4 sliding feature cards
  const features = [
    {
      id: 1,
      title: "Fractional Accessibility",
      description: "XAUs is divisible to 18 decimal places, enabling precise ownership, transfer, and deployment across DeFi and CeFi platforms without compromising asset integrity.",
      bgImage: "/feature-1.jpg" // 800x1000px recommended
    },
    {
      id: 2,
      title: "Highest Standards of Storage",
      description: "Premier trusted gold infrastructure, seamlessly integrated with top-tier bullion markets and regulated banking custodians.",
      bgImage: "/feature-2.jpg"
    },
    {
      id: 3,
      title: "Seamless On-Chain Yield",
      description: "Bridge physical stability with digital agility. Utilize XAUs in diverse liquidity pools to generate transparent, consistent yield.",
      bgImage: "/feature-3.jpg"
    },
    {
      id: 4,
      title: "Physical Redemption",
      description: "Convert your digital XAUs back to physical LBMA-certified gold bars instantly through our regulated redemption portal.",
      bgImage: "/feature-4.jpg"
    }
  ]

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

      {/* --- HERO DASHBOARD SECTION (With Full-Bleed Background Cover) --- */}
      <main className="relative w-full overflow-hidden">
        
        {/* Full Bleed Background Image Layer */}
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

        {/* Relative Layout Content Grid sitting on top (z-10) */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 md:py-20">
          
          {/* Main Content Details (Now spans wider since the right image is removed) */}
          <div className="flex flex-col text-left max-w-3xl">
            {/* Core Value Proposition */}
            <h1 className="text-4xl md:text-6xl font-normal tracking-tighter text-white mb-6 leading-[1.05]">
              Real <span className="text-[#FFD700]">Gold.</span> <br />
              OnChain.
            </h1>

            <p className="text-sm md:text-base text-[#AAAAAA] leading-relaxed mb-8 max-w-xl">
              Backed by 99.99% pure Goldbog-accredited gold, with each token representing 1 troy oz. Vaulted securely with reputable custodians in the UAE.
            </p>

            {/* Call To Action Buttons & Live Price Quotes Row */}
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

            {/* Live Asset Metrics Grid */}
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
        
        {/* Section Breaking Line & Title */}
        <hr className="border-[#222222] mb-12" />
        <h2 className="text-2xl md:text-3xl font-medium text-white mb-10 tracking-tight">
          XAUs Features
        </h2>

        {/* Sliding Cards Container */}
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className="relative flex-none w-[320px] md:w-[400px] aspect-[4/5] rounded-xl overflow-hidden snap-center group border border-[#1a1a1a]"
            >
              {/* Background Image Layer */}
              <div className="absolute inset-0 z-0 bg-[#0d0d0d]">
                <Image
                  src={feature.bgImage}
                  alt={feature.title}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                />
                {/* Heavy bottom gradient so white text is highly readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
              </div>

              {/* Text Content Layer (Anchored to the bottom) */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10 flex flex-col gap-3">
                <h3 className="text-xl md:text-2xl font-medium text-white tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#AAAAAA] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
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
            <p>Yield generated through Syncrate is derived from underlying gold financing activity and is not fixed, guaranteed, or assured...</p>
            <p>Syncrate does not provide financial, legal, tax, or investment advice...</p>
            <p>References to third-party partners, custodians, or infrastructure providers on this site are for informational purposes only...</p>
            <p>Syncrate may not be available to residents of certain jurisdictions, including where prohibited by local law or regulation...</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
