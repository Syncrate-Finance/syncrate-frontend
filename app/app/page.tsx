'use client'

import { useState } from 'react'
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
  const [stablecoinAmount, setStablecoinAmount] = useState('')
  const [paymentAsset, setPaymentAsset] = useState<'USDC' | 'USDT'>('USDC')
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false)
  
  // Transaction Progression States: 'idle' | 'approving' | 'approved' | 'minting' | 'success'
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'approved' | 'minting' | 'success'>('idle')

  // Mock pricing calculation based on live gold feed (e.g., ~$2,415.50 per troy oz / XAUs)
  const goldPricePerOunce = 2415.50
  
  // Calculate how many XAUs they receive for the typed stablecoin amount
  const calculatedXAus = stablecoinAmount && parseFloat(stablecoinAmount) > 0
    ? (parseFloat(stablecoinAmount) / goldPricePerOunce).toFixed(4)
    : '0.0000'

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
    setStablecoinAmount('')
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
            <div className="flex flex-col gap-3">
              
              {/* BLOCK 1: PAY INPUT (EDITABLE Stablecoin Amount) */}
              <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-1.5 focus-within:border-[#444444] transition-colors relative">
                <span className="text-[10px] font-mono tracking-wider text-[#666666] uppercase">You Pay</span>
                <div className="flex items-center justify-between gap-4">
                  <input 
                    type="number" 
                    placeholder="0.0"
                    value={stablecoinAmount}
                    onChange={(e) => setStablecoinAmount(e.target.value)}
                    disabled={txStatus !== 'idle' && txStatus !== 'approved'}
                    className="bg-transparent text-xl md:text-2xl text-white placeholder-[#333333] focus:outline-none font-sans w-full disabled:opacity-50"
                  />
                  
                  {/* Inline Token Selector Dropdown */}
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      disabled={txStatus !== 'idle' && txStatus !== 'approved'}
                      onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
                      className="bg-[#0A0A0A] border border-[#222222] hover:border-[#333333] rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-medium text-white transition-all disabled:opacity-50"
                    >
                      <Image 
                        src={paymentAsset === 'USDC' ? '/usdc-icon.png' : '/usdt-icon.png'} 
                        alt={`${paymentAsset} logo`} 
                        width={16} 
                        height={16} 
                        className="rounded-full flex-shrink-0"
                      />
                      <span>{paymentAsset}</span>
                      <span className="text-[9px] text-[#666666]">▼</span>
                    </button>

                    {isAssetDropdownOpen && (
                      <div className="absolute right-0 mt-1.5 w-28 bg-[#0A0A0A] border border-[#222222] rounded-lg overflow-hidden z-40 shadow-xl">
                        {(['USDC', 'USDT'] as const).map((asset) => (
                          <button
                            key={asset}
                            type="button"
                            onClick={() => {
                              setPaymentAsset(asset)
                              setIsAssetDropdownOpen(false)
                            }}
                            className="w-full text-left px-3 py-2.5 text-xs text-[#AAAAAA] hover:text-white hover:bg-white/[0.03] flex items-center gap-2 transition-colors"
                          >
                            <Image 
                              src={asset === 'USDC' ? '/usdc-icon.png' : '/usdt-icon.png'} 
                              alt={`${asset} logo`} 
                              width={16} 
                              height={16} 
                              className="rounded-full"
                            />
                            {asset}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BLOCK 2: RECEIVE DISPLAY (READ-ONLY Calculated XAUs Ounces) */}
              <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-1.5 relative">
                <span className="text-[10px] font-mono tracking-wider text-[#666666] uppercase">You Receive</span>
                <div className="flex items-center justify-between gap-4">
                  <input 
                    type="text" 
                    readOnly
                    value={calculatedXAus}
                    className="bg-transparent text-xl md:text-2xl text-white/90 font-sans focus:outline-none w-full cursor-default"
                  />
                  <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-medium text-[#AAAAAA] select-none">
                    <Image 
                      src="/XAUs-icon2.png" 
                      alt="XAUs logo" 
                      width={16} 
                      height={16} 
                      className="rounded-full flex-shrink-0"
                    />
                    <span>XAUs</span>
                  </div>
                </div>
              </div>

              {/* LIVE GOLD FEED DETAILS PANEL */}
              <div className="bg-[#030303] border border-[#111111] rounded-xl p-4 font-mono text-xs flex flex-col gap-1 mt-1">
                <div className="flex justify-between items-center text-[#666666]">
                  <span>Live Gold Price Feed</span>
                  <span className="text-white font-sans">${goldPricePerOunce.toFixed(2)} <span className="text-[10px] font-mono text-[#666666]">/ oz</span></span>
                </div>
              </div>

              {/* Smart Contract Interaction Process Buttons */}
              <div className="mt-3">
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
                        disabled={!stablecoinAmount || parseFloat(stablecoinAmount) <= 0 || txStatus === 'approving'}
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
