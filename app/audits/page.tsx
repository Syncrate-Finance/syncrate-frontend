'use client'

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Link from 'next/link'
import Image from 'next/image'

interface AuditReport {
  id: string
  title: string
  fileName: string
  fileSize: string
  pdfUrl: string
}

export default function AuditReportsPage() {
  // Single audit report configuration
  const reports: AuditReport[] = [
    {
      id: '1',
      title: 'Syncrate Gold Bureau Veritas Audit Jul 2026',
      fileName: 'Syncrate_Gold_Bureau_Veritas_Audit_Jul_2026.pdf',
      fileSize: '615 KB',
      pdfUrl: '/audits/Syncrate_Gold_Bureau_Veritas_Audit_Jul_2026.pdf',
    },
  ]

  return (
    <div 
      className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col justify-between antialiased ${GeistSans.variable} ${GeistMono.variable}`} 
      style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      <div>
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
          <Link href="/xaus" className="px-5 py-2 rounded-full bg-[#111111] hover:bg-[#1c1c1c] text-white border border-[#222222] text-xs font-medium transition-colors">
            ← Back to XAUs
          </Link>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="w-full max-w-4xl mx-auto px-6 py-12 md:py-16">
          <div className="mb-10">
            <span className="text-xs font-mono text-[#666666] tracking-widest block mb-3 uppercase">
              Transparency
            </span>
            <h1 className="text-3xl md:text-5xl font-normal text-white tracking-tight mb-4">
              Audit Reports
            </h1>
            <p className="text-sm md:text-base text-[#AAAAAA] max-w-2xl leading-relaxed">
              Independent physical vault verification and reserve audit statements for Syncrate Gold (XAUs) conducted by Bureau Veritas.
            </p>
          </div>

          {/* --- SINGLE PDF BLOCK --- */}
          <div className="flex flex-col gap-4">
            {reports.map((report) => (
              <div 
                key={report.id}
                className="w-full bg-[#0A0A0A] border border-[#222222] hover:border-[#333333] rounded-xl p-5 md:p-6 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* PDF Icon & File Meta */}
                <div className="flex items-start md:items-center gap-4">
                  {/* Left PDF Badge Block */}
                  <div className="flex flex-col items-center justify-center min-w-[56px] h-16 bg-[#111111] border border-[#222222] rounded-lg text-[#AAAAAA] p-2 flex-shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span className="text-[9px] font-mono font-semibold tracking-wider uppercase mt-1">PDF</span>
                  </div>

                  {/* Vertical Divider line */}
                  <div className="hidden sm:block w-[1px] h-10 bg-[#222222]" />

                  {/* Title and details */}
                  <div className="flex flex-col">
                    <h3 className="text-base md:text-lg font-medium text-white tracking-tight leading-snug">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-[#666666]">
                      <span>{report.fileName}</span>
                      <span>•</span>
                      <span>{report.fileSize}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  {/* Download Button */}
                  <a
                    href={report.pdfUrl}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#202020] border border-[#282828] text-xs font-medium text-[#D1D1D1] hover:text-white transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                  </a>

                  {/* Open Button */}
                  <a
                    href={report.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium text-white transition-all"
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

      {/* --- FOOTER --- */}
      <footer className="w-full bg-[#0037FF] pt-12 pb-10 px-6 border-t border-[#111111] mt-20">
        <div className="w-full max-w-6xl mx-auto flex flex-col">
          <div className="flex justify-between items-start text-sm text-[#F5F5F5] font-medium">
            <div className="flex flex-col gap-4">
              <a href="mailto:team@syncrate.org" className="hover:text-[#888888] transition-colors">Contact</a>
              <a href="https://docs.syncrate.org" className="hover:text-[#888888] transition-colors">Documentation</a>
              <Link href="/xaus" className="hover:text-[#888888] transition-colors">XAUs Product</Link>
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

          <div className="w-full mt-12 text-[10px] md:text-xs text-[#F5F5F5] leading-relaxed">
            <p>
              Syncrate audit reports are published for transparency purposes. All audits are conducted independently by Bureau Veritas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
