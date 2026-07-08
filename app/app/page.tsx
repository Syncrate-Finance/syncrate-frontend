'use client'

import { useState, useEffect } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Image from 'next/image'
import Link from 'next/link'

export default function XAusMintingApp() {
  // Wallet Connection States
  const [isConnected, setIsConnected] = useState(false)
  const [selectedChain, setSelectedChain] = useState('Base')
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false)

  // Minting Flow Form States
  const [mintAmount, setMintAmount] = useState('')
  const [paymentAsset, setPaymentAsset] = useState<'USDC' | 'USDT'>('USDC')
  
  // Transaction Progression States: 'idle' | 'approving' | 'approved' | 'minting' | 'success'
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'approved' | 'minting' | 'success'>('idle')

  // Mock pricing calculation based on live gold feed (e.g., ~$2,415.50 per troy oz / XAUs)
  const goldPricePerOunce = 2415.50
  const estimatedCost = mintAmount ? (parseFloat(mintAmount) * goldPricePerOunce).toFixed(2) : '0.00'

  // Block handlers demonstrating layout flow updates
  const handleApprove = () => {
    setTxStatus('approving')
    setTimeout(() => {
      setTxStatus('approved')
    }, 2000)
  }

  const handleMint = () => {
    setTxStatus('minting')
    setTimeout(() => {
      setTxStatus('success')
    }, 3500)
  }

  const resetFlow = () => {
    setMintAmount('')
    setTxStatus('idle')
  }

  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col justify-between antialiased ${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}>
      
      {/* --- APPLICATION HEADER --- */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center border-b border-[#111111]">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.jpg" alt="Syncrate Logo" width={32} height={32} className="object-contain rounded-full" />
          <span className="text-xs font-mono tracking-widest text-[#666666] group-hover:text-white transition-colors hidden xs:inline">XAUs MINT</span>
        </Link>

        {/* Chain Selector & Wallet Connection Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Custom Network Selector Dropdown Wrapper */}
          <div className="relative">
            <button 
              onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md border border-[#222222] bg-[#0A0A0A] text-[11px] sm:text-xs font-mono text-white flex items-center gap-1 sm:gap-2 hover:border-[#333333] transition-colors"
            >
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#0037FF] animate-pulse" />
              {selectedChain} <span className="text-[9px] sm:text-[10px] text-[#666666]">▼</span>
            </button>

            {isChainDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-[#0A0A0A] border border-[#222222] rounded-md overflow-hidden z-50 shadow-2xl font-mono text-xs">
                {/* Available Network */}
                <button 
                  onClick={() => { setSelectedChain('Base'); setIsChainDropdownOpen(false) }}
                  className="w-full text-left px-4 py-3 text-white hover:bg-white/[0.03] flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0037FF]" /> Base
                </button>
                {/* Unavailable Networks - Styled in Gray Fonts */}
                <div className="w-full text-left px-4 py-3 text-[#444444] cursor-not-allowed border-t border-[#111111] flex items-center justify-between">
                  <span>Ethereum</span> <span className="text-[9px] uppercase tracking-tighter text-[#333333]">Soon</span>
                </div>
                <div className="w-full text-left px-4 py-3 text-[#444444] cursor-not-allowed border-t border-[#111111] flex items-center justify-between">
                  <span>Avalanche</span> <span className="text-[9px] uppercase tracking-tighter text-[#333333]">Soon</span>
                </div>
                <div className="w-full text-left px-4 py-3 text-[#444444] cursor-not-allowed border-t border-[#111111] flex items-center justify-between">
                  <span>Solana</span> <span className="text-[9px] uppercase tracking-tighter text-[#333333]">Soon</span>
                </div>
              </div>
            )}
          </div>

          {/* Connect Wallet Button */}
          <button 
            onClick={() => setIsConnected(!isConnected)}
            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
              isConnected 
                ? 'border border-[#222222] bg-[#0A0A0A] text-[#888888]' 
                : 'bg-white text-[#030303] hover:bg-[#E5E5E5]'
            }`}
          >
            {isConnected ? '0x71C...3a9b' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* --- MINT INTERFACE MAIN PORTAL --- */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-12">
        <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-6 md:p-8 shadow-xl">
          
          {/* Header section tab structures */}
          <div className="flex gap-6 border-b border-[#111111] pb-4 mb-6">
            <button className="text-sm font-medium text-white pb-4 border-b-2 border-white -mb-[18px]">
              Mint XAUs
            </button>
            <button className="text-sm font-medium text-[#444444] cursor-not-allowed pb-4 -mb-[18px]">
              Redeem
            </button>
          </div>

          {txStatus === 'success' ? (
            /* SUCCESS FEEDBACK CARD */
            <div className="text-center py-8 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                <span className="text-emerald-500 text-lg">✓</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Transaction Success</h3>
              <p className="text-xs text-[#888888] max-w-xs mb-6 leading-relaxed">
                Your payment was processed and your native XAUs have been minted successfully on Base.
              </p>
              <button 
                onClick={resetFlow}
                className="px-6 py-2.5 bg-[#111111] text-xs font-medium rounded-md hover:bg-[#222222] text-white transition-all"
              >
                Mint Again
              </button>
            </div>
          ) : (
            /* INPUT SETUP SYSTEM */
            <div className="flex flex-col gap-5">
              
              {/* Input 1: Quantity Field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono tracking-wider text-[#666666] uppercase">Quantity to Mint (XAUs)</label>
                <div className="relative flex items-center">
                  <input 
                    type="number" 
                    placeholder="0.0"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    disabled={txStatus !== 'idle' && txStatus !== 'approved'}
                    className="w-full bg-[#030303] border border-[#222222] rounded-lg px-4 py-3.5 text-base text-white placeholder-[#333333] focus:outline-none focus:border-[#444444] font-sans disabled:opacity-50 transition-colors"
                  />
                  <span className="absolute right-4 text-xs font-mono text-[#666666]">Ounces</span>
                </div>
              </div>

              {/* Input 2: Payment Asset Selector Split Grid */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono tracking-wider text-[#666666] uppercase">Pay With Asset</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['USDC', 'USDT'] as const).map((asset) => (
                    <button
                      key={asset}
                      type="button"
                      disabled={txStatus !== 'idle' && txStatus !== 'approved'}
                      onClick={() => setPaymentAsset(asset)}
                      className={`py-3 px-4 border rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                        paymentAsset === asset 
                          ? 'border-[#444444] bg-white/[0.02] text-white' 
                          : 'border-[#1a1a1a] bg-transparent text-[#555555] hover:border-[#222222]'
                      } disabled:opacity-40`}
                    >
                      <div className={`w-2 h-2 rounded-full ${asset === 'USDC' ? 'bg-[#2775CA]' : 'bg-[#26A17B]'}`} />
                      {asset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input 3: Pricing Estimates Breakdown Details */}
              <div className="bg-[#030303] border border-[#111111] rounded-lg p-4 font-mono text-xs flex flex-col gap-2.5 mt-2">
                <div className="flex justify-between items-center text-[#666666]">
                  <span>Live Gold Feed</span>
                  <span className="text-white">${goldPricePerOunce.toFixed(2)} / oz</span>
                </div>
                <div className="w-full h-[1px] bg-[#111111]" />
                <div className="flex justify-between items-center">
                  <span className="text-[#666666]">Estimated Cost</span>
                  <span className="text-sm font-sans font-medium text-white">
                    {estimatedCost} <span className="text-xs text-[#666666] font-mono">{paymentAsset}</span>
                  </span>
                </div>
              </div>

              {/* Smart Contract Interaction Process Buttons */}
              <div className="mt-4">
                {!isConnected ? (
                  <button 
                    onClick={() => setIsConnected(true)}
                    className="w-full py-4 bg-white text-black font-medium text-sm rounded-lg hover:bg-[#E5E5E5] transition-all shadow-md"
                  >
                    Connect Wallet to Mint
                  </button>
                ) : (
                  <>
                    {/* PIPELINE STEP 1: APPROVE ACTION */}
                    {(txStatus === 'idle' || txStatus === 'approving') && (
                      <button 
                        onClick={handleApprove}
                        disabled={!mintAmount || parseFloat(mintAmount) <= 0 || txStatus === 'approving'}
                        className="w-full py-4 bg-[#111111] hover:bg-[#1A1A1A] text-white border border-[#333333] font-medium text-sm rounded-lg disabled:opacity-40 disabled:hover:bg-[#111111] transition-all flex items-center justify-center gap-2"
                      >
                        {txStatus === 'approving' ? (
                          <>
                            <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                            Approving Allowances...
                          </>
                        ) : (
                          `Approve ${paymentAsset}`
                        )}
                      </button>
                    )}

                    {/* PIPELINE STEP 2: REAL MINT ACTION EXECUTION */}
                    {(txStatus === 'approved' || txStatus === 'minting') && (
                      <button 
                        onClick={handleMint}
                        disabled={txStatus === 'minting'}
                        className="w-full py-4 bg-[#0037FF] hover:bg-[#002CD6] text-white font-medium text-sm rounded-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0037FF]/10"
                      >
                        {txStatus === 'minting' ? (
                          <>
                            <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                            Minting XAUs...
                          </>
                        ) : (
                          'Mint XAUs'
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>

            </div>
          )}
        </div>
      </main>

      {/* --- APP FOOTER STRIP --- */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-[#444444] border-t border-[#111111] gap-2">
        <span>SYNC RATE BASE PROTOCOL MINT ENGINE v1.0.4</span>
        <span className="text-center md:text-right">Live index verification streams handled independently via distributed decentralized networks.</span>
      </footer>

    </div>
  )
}
