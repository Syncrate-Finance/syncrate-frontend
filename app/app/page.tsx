'use client'

import { useState, useEffect } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Image from 'next/image'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'

// Base Mainnet Contract Addresses
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const USDT_ADDRESS = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
const XAUS_ADDRESS = '0x0000000000000000000000000000000000000000' // Placeholder until deployment
const XAU_USD_FEED = '0x76BAb56c71026046e8853a479424F60a48C17F72' // Chainlink XAU/USD Base Proxy

// Core System Spender Address
const MINT_CONTROLLER_ADDRESS = '0x0000000000000000000000000000000000000000' // Replace with your deployed Mint/Redeem contract

// Minimal ERC20 ABI for Approval
const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const

export default function XAusMintingApp() {
  // RainbowKit / Wagmi Account Connection Status
  const { isConnected, address } = useAccount()

  // --- CHAINLINK ORACLE FETCHING ---
  const { data: priceData } = useReadContract({
    address: XAU_USD_FEED,
    abi: [{ inputs: [], name: 'latestAnswer', outputs: [{ internalType: 'int256', name: '', type: 'int256' }], stateMutability: 'view', type: 'function' }],
    functionName: 'latestAnswer',
    query: {
      refetchInterval: 10000,
    },
  })

  // Chainlink prices have 8 decimals
  const goldPricePerOunce = priceData ? Number(priceData) / 1e8 : 2415.50

  // --- WAGMI BALANCE FETCHING ---
  const { data: usdcData } = useBalance({
    address,
    token: USDC_ADDRESS,
  })
  
  const { data: usdtData } = useBalance({
    address,
    token: USDT_ADDRESS,
  })

  const { data: xausData } = useBalance({
    address,
    token: XAUS_ADDRESS as `0x${string}`,
  })

  // Parse formatted balances (returns 0 if undefined/loading)
  const usdcBalance = usdcData ? parseFloat(usdcData.formatted) : 0
  const usdtBalance = usdtData ? parseFloat(usdtData.formatted) : 0
  const xausBalance = xausData ? parseFloat(xausData.formatted) : 0
  
  // Chain visibility state (Dropdown handled entirely by RainbowKit automatically)
  const [selectedChain, setSelectedChain] = useState('Base')
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false)

  // Core Flow States
  const [activeTab, setActiveTab] = useState<'mint' | 'redeem'>('mint')
  const [inputAmount, setInputAmount] = useState('')
  const [paymentAsset, setPaymentAsset] = useState<'USDC' | 'USDT'>('USDC')
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false)
  
  // Transaction Progression States: 'idle' | 'approving' | 'approved' | 'processing' | 'success'
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'approved' | 'processing' | 'success'>('idle')

  // --- CONTRACT WRITE CONTRACT HOOKS ---
  const { writeContract, data: approveTxHash, error: approveError, reset: resetWrite } = useWriteContract()
  
  const { isLoading: isApprovalMining, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  })

  // Synchronize approval mining state with UI pipeline state
  useEffect(() => {
    if (isApprovalMining) {
      setTxStatus('approving')
    } else if (isApprovalConfirmed) {
      setTxStatus('approved')
    } else if (approveError) {
      setTxStatus('idle')
      resetWrite()
    }
  }, [isApprovalMining, isApprovalConfirmed, approveError, resetWrite])

  // Dynamically set the stablecoin balance based on user selection
  const activeStablecoinBalance = paymentAsset === 'USDC' ? usdcBalance : usdtBalance

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

  // Form Auto-fill Handler using real balances
  const handleMaxBalance = () => {
    if (activeTab === 'mint') {
      setInputAmount(activeStablecoinBalance.toString())
    } else {
      setInputAmount(xausBalance.toString())
    }
  }

  // Real ERC-20 Allowance Setup Trigger
  const handleApprove = () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return

    // Determine target token address and token decimals
    let targetTokenAddress: `0x${string}` = USDC_ADDRESS
    let decimals = 6 // USDC and USDT on Base use 6 decimals

    if (activeTab === 'mint') {
      targetTokenAddress = paymentAsset === 'USDC' ? USDC_ADDRESS : USDT_ADDRESS
    } else {
      targetTokenAddress = XAUS_ADDRESS as `0x${string}`
      decimals = 18 // Assuming standard XAUs asset uses 18 decimals
    }

    const parsedAmount = parseUnits(inputAmount, decimals)

    writeContract({
      address: targetTokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [MINT_CONTROLLER_ADDRESS as `0x${string}`, parsedAmount],
    })
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
    resetWrite()
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

        {/* Custom Unified Wallet Connect Button Restoring Original UI */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted && account && chain;

              return (
                <div
                  {...(!mounted && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                  className="flex items-center gap-1.5 sm:gap-3"
                >
                  {(() => {
                    if (!mounted || !account || !chain) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all bg-white text-[#030303] hover:bg-[#E5E5E5]"
                        >
                          Connect Wallet
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all bg-red-600 text-white shadow-md hover:bg-red-700"
                        >
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-1.5 sm:gap-3">
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md border border-[#222222] bg-[#0A0A0A] text-[11px] sm:text-xs font-mono text-white flex items-center gap-1.5 hover:border-[#333333] transition-colors"
                        >
                          {chain.hasIcon && (
                            <div className="w-3.5 h-3.5 overflow-hidden rounded-full flex-shrink-0">
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                          <span className="text-[9px] sm:text-[10px] text-[#666666] ml-1">▼</span>
                        </button>

                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all border border-[#222222] bg-[#0A0A0A] text-[#888888] hover:text-[#E5E5E5] hover:border-[#444444]"
                        >
                          {account.displayName}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
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
                      ? (activeTab === 'mint' ? activeStablecoinBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : xausBalance.toFixed(4))
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
                  <div className="w-full flex justify-center custom-rainbow-btn">
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <button 
                          onClick={openConnectModal}
                          className="w-full py-4 bg-white text-black font-medium text-sm rounded-lg hover:bg-[#E5E5E5] transition-all shadow-md"
                        >
                          Connect Wallet to {activeTab === 'mint' ? 'Mint' : 'Redeem'}
                        </button>
                      )}
                    </ConnectButton.Custom>
                  </div>
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
    </div>
  )
}
