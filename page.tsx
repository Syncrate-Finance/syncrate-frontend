import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export default function LaunchingSoon() {
  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col justify-between antialiased ${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}>
      
      {/* Top Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 tracking-tight font-medium text-lg text-white">
          <div className="w-5 h-5 bg-white rounded-[4px] flex items-center justify-center">
            <span className="text-[#030303] text-xs font-black select-none">S</span>
          </div>
          <span>Syncrate</span>
        </div>
        <div className="text-xs tracking-widest text-[#888888] font-mono uppercase">
          [ Phase_01 ]
        </div>
      </header>

      {/* Hero / Main Content */}
      <main className="w-full max-w-xl mx-auto px-6 py-12 flex flex-col items-center text-center my-auto">
        {/* Subtle Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#222] bg-[#0A0A0A] text-xs text-[#888] font-mono mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Private Beta Coming Soon
        </div>

        {/* Header - Fixed sizes for both desktop & mobile */}
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-4 max-w-md leading-[1.15]">
          DeFi yield, backed by the real world.
        </h1>
        
        <p className="text-base text-[#888888] leading-relaxed mb-8 max-w-sm">
          Syncrate is a DeFi yield protocol that channels onchain capital into productive real-world assets, delivering transparent, USD-denominated yield designed for the next generation of decentralized finance.
        </p>

        {/* Email Waitlist Form */}
        <form className="w-full flex flex-col sm:flex-row gap-2 max-w-md">
          <input 
            type="email" 
            placeholder="Enter your work email" 
            required
            className="flex-1 bg-[#0A0A0A] border border-[#222222] rounded-lg px-4 py-3 text-base text-white placeholder-[#555555] focus:outline-none focus:border-[#444444] focus:ring-1 focus:ring-[#444444] transition-all duration-200"
          />
          <button 
            type="submit"
            className="bg-white text-[#030303] font-medium rounded-lg px-5 py-3 text-base hover:bg-[#E5E5E5] transition-colors duration-200"
          >
            Request Access
          </button>
        </form>
      </main>

      {/* Footer Details */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[#111111] text-xs text-[#555555] font-mono">
        <div>
          &copy; {new Date().getFullYear()} Syncrate Technologies Inc. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="https://x.com/syncratefi" className="hover:text-[#888888] transition-colors">Twitter</a>
          <a href="https://www.linkedin.com/company/syncrateprotocol" className="hover:text-[#888888] transition-colors">LinkedIn</a>
        </div>
      </footer>
      
    </div>
  )
}
