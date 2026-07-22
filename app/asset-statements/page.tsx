'use client'

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Link from 'next/link'
import Image from 'next/image'

interface AssetStatement {
  id: string
  title: string
  fileName: string
  fileSize: string
  pdfUrl: string
}

export default function AssetStatementsPage() {
  const statements: AssetStatement[] = [
    {
      id: '1',
      title: 'Inital Gold Procurement from Alluca Gold',
      fileName: 'Syncrate_Gold_Procurement_Alluca_Gold.pdf',
      fileSize: '450 KB',
      pdfUrl: '/Syncrate_Gold_Procurement_Alluca_Gold.pdf', 
    },
  ]

  return (
    <div 
      className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col antialiased w-full overflow-x-hidden ${GeistSans.variable} ${GeistMono.variable}`} 
      style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      <div className="w-full">
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
          <Link href="/xaus" className="px-4 py-2 rounded-full bg-[#111111] hover:bg-[#1c1c1c] text-white border border-[#222222] text-xs font-medium transition-colors">
            ← Back to XAUs
          </Link>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="w-full max-w-4xl mx-auto px-6 py-8 md:py-16">
          <div className="mb-8">
            <span className="text-xs font-mono text-[#666666] tracking-widest block mb-2 uppercase">
              Transparency
            </span>
            <h1 className="text-3xl md:text-5xl font-normal text-white tracking-tight mb-3">
              Assets Statements
            </h1>
            <p className="text-xs md:text-base text-[#AAAAAA] max-w-2xl leading-relaxed">
              Regular reserve and custody holdings statements from partner vaults confirming 1:1 physical gold backing across the protocol.
            </p>
          </div>

          {/* --- MOBILE-RESPONSIVE PDF CARD --- */}
          <div className="w-full flex flex-col gap-4">
            {statements.map((statement) => (
              <div 
                key={statement.id}
                className="w-full bg-[#0A0A0A] border border-[#222222] rounded-xl p-4 md:p-6 flex flex-col gap-5"
              >
                {/* Header: Icon + Details */}
                <div className="flex items-start gap-3 md:gap-4 w-full">
                  {/* PDF Badge Icon */}
                  <div className="flex flex-col items-center justify-center min-w-[48px] h-14 md:min-w-[56px] md:h-16 bg-[#111111] border border-[#222222] rounded-lg text-[#AAAAAA] p-1.5 flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span className="text-[8px] md:text-[9px] font-mono font-semibold tracking-wider uppercase mt-1">PDF</span>
                  </div>

                  {/* Text Details */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <h3 className="text-sm md:text-lg font-medium text-white tracking-tight leading-snug break-words">
                      {statement.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] md:text-xs font-mono text-[#666666]">
                      <span className="break-all">{statement.fileName}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{statement.fileSize}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 pt-3 border-t border-[#181818] w-full sm:w-auto sm:self-end">
                  <a
                    href={statement.pdfUrl}
                    download
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#202020] border border-[#282828] text-xs font-medium text-[#D1D1D1] hover:text-white transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                  </a>

                  <a
                    href={statement.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium text-white transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                    Open
                  </a>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
