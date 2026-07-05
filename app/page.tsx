import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Image from 'next/image'

export default function LaunchingSoon() {
  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col justify-between antialiased ${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}>
      
      {/* Top Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        
        {/* Custom Logo */}
        <div className="flex items-center">
          {/* Ensure the src matches your exact uploaded filename in the public folder */}
          <Image 
            src="/logo.jpg" 
            alt="Syncrate Logo" 
            width={32} 
            height={32} 
            className="object-contain"
          />
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 text-sm font-medium">
          <a href="#" className="px-5 py-2.5 rounded-full border border-[#333333] text-white hover:bg-[#111111] transition-colors">
            Blog
          </a>
          <a href="#" className="px-5 py-2.5 rounded-full bg-white text-[#030303] hover:bg-[#E5E5E5] transition-colors">
            Join Waitlist
          </a>
        </div>
      </header>

      {/* Hero / Main Content - Left Aligned */}
      <main className="w-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-start text-left justify-center my-auto">
        
    

        {/* Header - Normal weight, left aligned, with inline blue link */}
        <h1 className="text-3xl md:text-4xl font-normal tracking-tighter text-white mb-6 max-w-3xl leading-[1.05]">
          DeFi yield, backed by the real world. <a href="#" className="text-blue-600 underline hover:text-blue-500 transition-colors">Join waitlist→</a>
        </h1>
        
        <p className="text-base text-[#888888] leading-relaxed mb-10 max-w-md">
          Syncrate channels onchain capital into productive real-world assets, delivering transparent, USD-denominated yield designed for the next generation of decentralized finance.
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
          <a href="https://linkedin.com/company/syncrateprotocol" className="hover:text-[#888888] transition-colors">LinkedIn</a>
        </div>
      </footer>
      
    </div>
  )
}
