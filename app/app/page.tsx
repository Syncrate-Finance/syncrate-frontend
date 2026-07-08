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

  // Core Flow States
  const [activeTab, setActiveTab] = useState<'mint' | 'redeem'>('mint')
  const [inputAmount, setInputAmount] = useState('')
  const [paymentAsset, setPaymentAsset] = useState<'USDC' | 'USDT'>('USDC')
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false)
  
  // Transaction Progression States: 'idle' | 'approving' | 'approved' | 'processing' | 'success'
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'approved' | 'processing' | 'success'>('idle')

  // Mock pricing and balance states
  const goldPricePerOunce = 2415.50
  const mockTokenBalance = 15420.50 
  const mockXAusBalance = 4.2500

  // FIFO Queue States (For Asynchronous Redemption Dashboard)
  const [queuedRequest, setQueuedRequest] = useState<{ amount: number, position: number, status: 'pending' | 'processing' } | null>(null)
  
  // Dynamic output calculation based on mode
  const calculatedOutput = (() => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return activeTab === 'mint' ? '0.0000' : '0.00'
    
    const amount = parseFloat(inputAmount)
    if (activeTab === 'mint') {
      // Mint: Stablecoin / Price = XAUs
      return (amount / goldPricePerOunce).toFixed(4)
    } else {
      // Redeem: XAUs * Price * 0.9975 (0.25% Fee Deducted)
      return (amount * goldPricePerOunce * 0.9975).toFixed(2)
    }
  })()

  // Form Auto-fill Handler
  const handleMaxBalance = () => {
    if (activeTab === 'mint') {
      setInputAmount(mockTokenBalance.toString())
    } else {
      setInputAmount(mockXAusBalance.toString())
    }
  }

  // Block handlers demonstrating layout flow updates
  const handleApprove = () => {
    setTxStatus('approving')
    setTimeout(() => {
      setTxStatus('approved')
    }, 2000)
  }

  const handleProcess = () => {
    setTxStatus('processing')
    setTimeout(() => {
      if (activeTab === 'redeem') {
        // Mocking the event trigger: 'XAUsRedemptionQueued'
        setQueuedRequest({ amount: parseFloat(inputAmount), position: 1, status: 'pending' })
        setTxStatus('idle') // Return to idle so they can see the dashboard
        setInputAmount('')
      } else {
        setTxStatus('success')
      }
    }, 3500)
  }

  const resetFlow = () => {
    setInputAmount('')
    setTxStatus('idle')
  }

  const handleTabSwitch = (tab: 'mint' | 'redeem') => {
    if (txStatus === 'idle' || txStatus === 'success') {
      setActiveTab(tab)
      resetFlow()
    }
  }

  // Dashboard component helper
  const renderDashboard = () => {
    // Only show if the user is in Redeem mode and connected
    if (activeTab !== 'redeem' || !isConnected) return null;

    // DEFAULT STATE: No pending requests
    if (!queuedRequest) {
      return (
        <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-5 text-center transition-all">
          <h3 className="text-xs font-mono tracking-widest text-[#666666] uppercase mb-1">Redemption Queue</h3>
          <p className="text-[10px] text-[#444444] font-mono">No pending requests</p>
        </div>
      );
    }

    // ACTIVE STATE: User has a pending redemption in the FIFO queue
    return (
      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-5 shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between border-b border-[#111111] pb-3">
          <h3 className="text-xs font-mono tracking-widest text-[#888888] uppercase">Your Queue Position</h3>
          <span className="text-xs font-mono text-white">#{queuedRequest.position}</span>
        </div>
        
        <div className="flex justify-between items-center py-1">
          <span className="text-xs text-[#666666]">Amount Owed</span>
          <span className="text-sm font-medium text-white">{queuedRequest.amount.toFixed(4)} XAUs</span>
        </div>
        
        <div className="flex justify-between items-center py-1">
          <span className="text-xs text-[#666666]">Status</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs text-amber-500 font-mono capitalize">Pending Liquidity</span>
          </div>
        </div>
      </div>
    );
  };

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
          
          <div className="relative">
            <button 
              onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md border border-[#222222] bg-[#0A0A0A] text-[11px] sm:text-xs font-mono text-white flex items-center gap-1.5 hover:border-[#333333] transition-colors"
            >
              <Image src="/base.PNG" alt="Base Network" width={14} height={14} className="rounded-full" />
              {selectedChain} <span className="text-[9px] sm:text-[10px] text-[#666666] ml-1">▼</span>
            </button>

            {isChainDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-[#0A0A0A] border border-[#222222] rounded-md overflow-hidden z-50 shadow-2xl font-mono text-xs">
                <button 
                  onClick={() => { setSelectedChain('Base'); setIsChainDropdownOpen(false) }}
                  className="w-full text-left px-4 py-3 text-white hover:bg-white/[0.03] flex items-center gap-2"
                >
                  <Image src="/base.png" alt="Base Network" width={14} height={14} className="rounded-full" /> Base
                </button>
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
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-12 gap-6">
        
        {/* PRIMARY MINT/REDEEM CARD */}
        <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-6 md:p-8 shadow-xl">
          
          {/* Header section tab structures */}
          <div className="flex gap-6 border-b border-[#111111] pb-4 mb-6">
            <button 
              onClick={() => handleTabSwitch('mint')}
              className={`text-sm font-medium pb-4 -mb-[18px] transition-colors ${
                activeTab === 'mint' ? 'text-white border-b-2 border-white' : 'text-[#666666] hover:text-[#AAAAAA]'
              }`}
            >
              Mint XAUs
            </button>
            <button 
              onClick={() => handleTabSwitch('redeem')}
              className={`text-sm font-medium pb-4 -mb-[18px] transition-colors ${
                activeTab === 'redeem' ? 'text-white border-b-2 border-white' : 'text-[#666666] hover:text-[#AAAAAA]'
              }`}
            >
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
                {activeTab === 'mint' 
                  ? 'Your payment was processed and your native XAUs have been minted successfully on Base.'
                  : `Your XAUs have been successfully redeemed for ${paymentAsset} on Base.`}
              </p>
              <button 
                onClick={resetFlow}
                className="px-6 py-2.5 bg-[#111111] text-xs font-medium rounded-md hover:bg-[#222222] text-white transition-all"
              >
                {activeTab === 'mint' ? 'Mint Again' : 'Redeem Again'}
              </button>
            </div>
          ) : (
            /* INPUT SETUP SYSTEM */
            <div className="flex flex-col gap-3">
              
              {/* BLOCK 1: PAY INPUT (EDITABLE) */}
              <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-1.5 focus-within:border-[#444444] transition-colors relative">
                <span className="text-[10px] font-mono tracking-wider text-[#666666] uppercase">You Pay</span>
                
                <div className="flex items-center justify-between gap-4">
                  <input 
                    type="number" 
                    placeholder="0.0"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    disabled={txStatus !== 'idle' && txStatus !== 'approved'}
                    className="bg-transparent text-xl md:text-2xl text-white placeholder-[#333333] focus:outline-none font-sans w-full disabled:opacity-50 min-w-0"
                  />
                  
                  {activeTab === 'mint' ? (
                    /* MINT MODE: Stablecoin Dropdown */
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
                  ) : (
                    /* REDEEM MODE: Fixed XAUs Badge */
                    <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-medium text-white select-none flex-shrink-0 whitespace-nowrap">
                      <Image 
                        src="/xaus-icon2.png" 
                        alt="XAUs logo" 
                        width={16} 
                        height={16} 
                        className="rounded-full flex-shrink-0"
                      />
                      <span>XAUs</span>
                    </div>
                  )}
                </div>

                {/* Inline Balance & Max Wrapper */}
                <div className="flex justify-end items-center gap-2 mt-1">
                  <span className="text-[10px] text-[#666666] font-mono">
                    Balance: {isConnected 
                      ? (activeTab === 'mint' ? mockTokenBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : mockXAusBalance.toFixed(4))
                      : (activeTab === 'mint' ? '0.00' : '0.0000')} {activeTab === 'mint' ? paymentAsset : 'XAUs'}
                  </span>
                  {isConnected && (
                    <button 
                      onClick={handleMaxBalance}
                      disabled={txStatus !== 'idle' && txStatus !== 'approved'}
                      className="text-[9px] font-bold text-[#0037FF] hover:text-[#002CD6] transition-colors disabled:opacity-50 uppercase tracking-wider"
                    >
                      Max
                    </button>
                  )}
                </div>
              </div>

              {/* BLOCK 2: RECEIVE DISPLAY (READ-ONLY) */}
              <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-1.5 relative">
                <span className="text-[10px] font-mono tracking-wider text-[#666666] uppercase">You Receive</span>
                <div className="flex items-center justify-between gap-4">
                  <input 
                    type="text" 
                    readOnly
                    value={calculatedOutput}
                    className="bg-transparent text-xl md:text-2xl text-white/90 font-sans focus:outline-none w-full cursor-default min-w-0"
                  />
                  
                  {activeTab === 'mint' ? (
                    /* MINT MODE: Fixed XAUs Badge */
                    <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-medium text-[#AAAAAA] select-none flex-shrink-0 whitespace-nowrap">
                      <Image 
                        src="/xaus-icon2.png" 
                        alt="XAUs logo" 
                        width={16} 
                        height={16} 
                        className="rounded-full flex-shrink-0"
                      />
                      <span>XAUs</span>
                    </div>
                  ) : (
                    /* REDEEM MODE: Stablecoin Dropdown */
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
                  )}
                </div>
              </div>

              {/* LIVE GOLD FEED DETAILS PANEL & FEES */}
              <div className="bg-[#030303] border border-[#111111] rounded-xl p-4 font-mono text-xs flex flex-col gap-2 mt-1">
                <div className="flex justify-between items-center text-[#666666]">
                  <span>Live Gold Price Feed</span>
                  <span className="text-white font-sans">${goldPricePerOunce.toFixed(2)} <span className="text-[10px] font-mono text-[#666666]">/ oz</span></span>
                </div>
                {activeTab === 'redeem' && (
                  <div className="flex justify-between items-center text-[#666666] pt-2 border-t border-[#111111]">
                    <span>Redemption Fee</span>
                    <span className="text-white">0.25%</span>
                  </div>
                )}
              </div>

              {/* Smart Contract Interaction Process Buttons */}
              <div className="mt-3">
                {!isConnected ? (
                  <button 
                    onClick={() => setIsConnected(true)}
                    className="w-full py-4 bg-white text-black font-medium text-sm rounded-lg hover:bg-[#E5E5E5] transition-all shadow-md"
                  >
                    Connect Wallet to {activeTab === 'mint' ? 'Mint' : 'Redeem'}
                  </button>
                ) : (
                  <>
                    {/* PIPELINE STEP 1: APPROVE ACTION */}
                    {(txStatus === 'idle' || txStatus === 'approving') && (
                      <button 
                        onClick={handleApprove}
                        disabled={!inputAmount || parseFloat(inputAmount) <= 0 || txStatus === 'approving'}
                        className="w-full py-4 bg-[#111111] hover:bg-[#1A1A1A] text-white border border-[#333333] font-medium text-sm rounded-lg disabled:opacity-40 disabled:hover:bg-[#111111] transition-all flex items-center justify-center gap-2"
                      >
                        {txStatus === 'approving' ? (
                          <>
                            <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                            Approving Allowances...
                          </>
                        ) : (
                          `Approve ${activeTab === 'mint' ? paymentAsset : 'XAUs'}`
                        )}
                      </button>
                    )}

                    {/* PIPELINE STEP 2: REAL PROCESSING ACTION EXECUTION */}
                    {(txStatus === 'approved' || txStatus === 'processing') && (
                      <button 
                        onClick={handleProcess}
                        disabled={txStatus === 'processing'}
                        className={`w-full py-4 text-white font-medium text-sm rounded-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg ${
                          activeTab === 'mint' 
                            ? 'bg-[#0037FF] hover:bg-[#002CD6] shadow-[#0037FF]/10' 
                            : 'bg-white text-black hover:bg-[#E5E5E5] shadow-white/10'
                        }`}
                      >
                        {txStatus === 'processing' ? (
                          <>
                            <span className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${activeTab === 'mint' ? 'border-white' : 'border-black'}`} />
                            {activeTab === 'mint' ? 'Minting XAUs...' : 'Redeeming XAUs...'}
                          </>
                        ) : (
                          activeTab === 'mint' ? 'Mint XAUs' : 'Redeem XAUs'
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>

            </div>
          )}
        </div>

        {/* --- ASYNCHRONOUS REDEMPTION QUEUE DASHBOARD --- */}
        {renderDashboard()}

      </main>

      {/* --- APP FOOTER STRIP --- */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-[#444444] border-t border-[#111111] gap-2">
        <span>SYNC RATE BASE PROTOCOL MINT ENGINE v1.0.4</span>
        <span className="text-center md:text-right">Live index verification streams handled independently via distributed decentralized networks.</span>
      </footer>

    </div>
  )
}
