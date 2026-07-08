'use client'

import { useState } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Image from 'next/image'
import Link from 'next/link'

export default function XAusMintingApp() {
  // Wallet & UI States
  const [isConnected, setIsConnected] = useState(false)
  const [selectedChain, setSelectedChain] = useState('Base')
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'mint' | 'redeem'>('mint')
  
  // Input & Tx States
  const [inputAmount, setInputAmount] = useState('')
  const [paymentAsset, setPaymentAsset] = useState<'USDC' | 'USDT'>('USDC')
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false)
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'approved' | 'processing' | 'success'>('idle')

  // FIFO Queue States
  const [queuedRequest, setQueuedRequest] = useState<{ amount: number, position: number, status: 'pending' | 'processing' } | null>(null)

  // Mock Data
  const goldPricePerOunce = 2415.50
  const mockTokenBalance = 15420.50 
  const mockXAusBalance = 4.2500

  const calculatedOutput = (() => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return activeTab === 'mint' ? '0.0000' : '0.00'
    const amount = parseFloat(inputAmount)
    return activeTab === 'mint' 
      ? (amount / goldPricePerOunce).toFixed(4) 
      : (amount * goldPricePerOunce * 0.9975).toFixed(2)
  })()

  // Handlers
  const handleMaxBalance = () => {
    setInputAmount(activeTab === 'mint' ? mockTokenBalance.toString() : mockXAusBalance.toString())
  }

  const handleApprove = () => {
    setTxStatus('approving')
    setTimeout(() => setTxStatus('approved'), 2000)
  }

  const handleProcess = () => {
    setTxStatus('processing')
    setTimeout(() => {
      if (activeTab === 'redeem') {
        setQueuedRequest({ amount: parseFloat(inputAmount), position: 1, status: 'pending' })
        setTxStatus('idle')
        setInputAmount('')
      } else {
        setTxStatus('success')
      }
    }, 2000)
  }

  const resetFlow = () => {
    setInputAmount('')
    setTxStatus('idle')
  }

  const renderDashboard = () => {
    if (activeTab !== 'redeem' || !isConnected) return null

    if (!queuedRequest) {
      return (
        <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-5 text-center transition-all">
          <h3 className="text-xs font-mono tracking-widest text-[#666666] uppercase mb-1">Redemption Queue</h3>
          <p className="text-[10px] text-[#444444] font-mono">No pending requests</p>
        </div>
      )
    }

    return (
      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-5 shadow-xl flex flex-col gap-3">
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
    )
  }

  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col justify-between antialiased ${GeistSans.variable} ${GeistMono.variable}`}>
      
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center border-b border-[#111111]">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.jpg" alt="Syncrate Logo" width={32} height={32} className="object-contain rounded-full" />
          <span className="text-xs font-mono tracking-widest text-[#666666] group-hover:text-white transition-colors hidden xs:inline">XAUs MINT</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md border border-[#222222] bg-[#0A0A0A] text-[11px] sm:text-xs font-mono text-white flex items-center gap-1.5 hover:border-[#333333] transition-colors"
            >
              <Image src="/base.png" alt="Base Network" width={14} height={14} className="rounded-full" />
              {selectedChain} <span className="text-[9px] sm:text-[10px] text-[#666666] ml-1">▼</span>
            </button>
            {isChainDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-[#0A0A0A] border border-[#222222] rounded-md overflow-hidden z-50 shadow-2xl font-mono text-xs">
                <button onClick={() => { setSelectedChain('Base'); setIsChainDropdownOpen(false) }} className="w-full text-left px-4 py-3 text-white hover:bg-white/[0.03] flex items-center gap-2">
                  <Image src="/base.png" alt="Base Network" width={14} height={14} className="rounded-full" /> Base
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsConnected(!isConnected)}
            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all ${isConnected ? 'border border-[#222222] bg-[#0A0A0A] text-[#888888]' : 'bg-white text-[#030303]'}`}
          >
            {isConnected ? '0x71C...3a9b' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-12 gap-6">
        <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex gap-6 border-b border-[#111111] pb-4 mb-6">
            <button onClick={() => { setActiveTab('mint'); resetFlow(); }} className={`text-sm font-medium pb-4 -mb-[18px] ${activeTab === 'mint' ? 'text-white border-b-2 border-white' : 'text-[#666666]'}`}>Mint XAUs</button>
            <button onClick={() => { setActiveTab('redeem'); resetFlow(); }} className={`text-sm font-medium pb-4 -mb-[18px] ${activeTab === 'redeem' ? 'text-white border-b-2 border-white' : 'text-[#666666]'}`}>Redeem</button>
          </div>

          {txStatus === 'success' ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-white mb-2">Transaction Success</h3>
              <button onClick={resetFlow} className="px-6 py-2 bg-[#111111] text-xs font-medium rounded-md text-white">Mint Again</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono tracking-wider text-[#666666] uppercase">You Pay</span>
                <div className="flex items-center justify-between gap-4">
                  <input type="number" placeholder="0.0" value={inputAmount} onChange={(e) => setInputAmount(e.target.value)} className="bg-transparent text-xl text-white w-full focus:outline-none" />
                  <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg px-3 py-2 text-xs text-white">{activeTab === 'mint' ? paymentAsset : 'XAUs'}</div>
                </div>
                <button onClick={handleMaxBalance} className="text-[9px] font-bold text-[#0037FF] uppercase self-end">Max</button>
              </div>

              <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono tracking-wider text-[#666666] uppercase">You Receive</span>
                <input type="text" readOnly value={calculatedOutput} className="bg-transparent text-xl text-white/90 w-full focus:outline-none" />
              </div>

              <div className="mt-3">
                {txStatus === 'idle' && <button onClick={handleApprove} className="w-full py-4 bg-[#111111] text-white text-sm rounded-lg">Approve</button>}
                {txStatus === 'approved' && <button onClick={handleProcess} className="w-full py-4 bg-[#0037FF] text-white text-sm rounded-lg">Confirm</button>}
              </div>
            </div>
          )}
        </div>

        {renderDashboard()}
      </main>

      <footer className="w-full max-w-6xl mx-auto px-6 py-4 flex justify-between text-[10px] font-mono text-[#444444] border-t border-[#111111]">
        <span>SYNC RATE BASE PROTOCOL MINT ENGINE v1.0.4</span>
      </footer>
    </div>
  )
}
