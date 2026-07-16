'use client'

import { useState, useEffect, useMemo } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Image from 'next/image'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'

// ==========================================
// 🚀 THE MASTER TOGGLE
// Set to 'false' to show the "Launching Soon" waitlist.
// Set to 'true' to instantly bring back the full dApp.
// ==========================================
const IS_LIVE = false;

// ==========================================
// CONFIGURATIONS & ABIS
// ==========================================
interface StablecoinConfig {
  address: `0x${string}`;
  decimals: number;
}

interface ChainConfig {
  stablecoins: Record<string, StablecoinConfig>;
  xaus: `0x${string}`;
  goldPriceFeed: `0x${string}`;
  mintController: `0x${string}`;
  defaultAsset: string;
}

const CHAIN_CONFIGS: Record<number, ChainConfig> = {
  8453: {
    stablecoins: {
      USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
      USDT: { address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6 },
    },
    xaus: '0x0000000000000000000000000000000000000000', 
    goldPriceFeed: '0x5213eBB69743b85644dbB6E25cdF994aFBb8cF31', 
    mintController: '0x0000000000000000000000000000000000000000', 
    defaultAsset: 'USDC',
  },
  4663: {
    stablecoins: {
      USDG: { address: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', decimals: 18 },
    },
    xaus: '0x0000000000000000000000000000000000000000', 
    goldPriceFeed: '0x1F954Dc24a49708C26E0C1777f16750B5C6d5a2c', 
    mintController: '0x0000000000000000000000000000000000000000', 
    defaultAsset: 'USDG',
  },
};

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

const ERC20_ABI = [
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }
] as const;

const MINT_CONTROLLER_ABI = [
  { inputs: [{ internalType: 'uint256', name: 'xauAmount', type: 'uint256' }, { internalType: 'address', name: 'tokenAddress', type: 'address' }], name: 'mint', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'xauAmount', type: 'uint256' }, { internalType: 'address', name: 'stablecoinAddress', type: 'address' }], name: 'redeem', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'nextQueueIndex', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], name: 'redemptionQueue', outputs: [{ internalType: 'address', name: 'account', type: 'address' }, { internalType: 'address', name: 'stablecoin', type: 'address' }, { internalType: 'uint256', name: 'amountOwed', type: 'uint256' }], stateMutability: 'view', type: 'function' }
] as const


// ==========================================
// COMPONENT A: THE WAITLIST (LAUNCHING SOON)
// ==========================================
function LaunchingSoonUI() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    // TODO: Replace with your actual email API
    await new Promise((resolve) => setTimeout(resolve, 1000)) 
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] p-6 flex flex-col items-center justify-center antialiased ${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-8 shadow-2xl flex flex-col gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono uppercase tracking-wider text-amber-500 font-semibold">
              XAUs
            </span>
            <span className="text-[10px] font-mono text-[#666666] uppercase">
              Base Mainnet
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mt-2">
            Launching Soon
          </h1>
          <p className="text-sm text-[#888888] leading-relaxed">
            The XAUs minting & redemption dApp is coming soon. Join the waitlist and be the first to get notified when we go live.
          </p>
        </div>

        <div className="border-t border-[#111111] pt-6">
          {submitted ? (
            <div className="bg-[#050505] border border-emerald-950/40 rounded-xl p-5 text-center flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-300">
              <span className="text-sm font-medium text-emerald-400">You're on the list!</span>
              <span className="text-xs text-[#666666]">
                We will contact you the second the mint contracts go live.
              </span>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col gap-4">
              <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-2 focus-within:border-[#444444] transition-colors">
                <label className="text-[10px] font-mono tracking-wider text-[#666666] uppercase">
                  Email Address
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="bg-transparent text-white placeholder-[#333333] focus:outline-none font-mono w-full text-sm"
                />
              </div>

              <button 
                type="submit"
                disabled={!email || loading}
                className="w-full py-4 bg-white text-[#030303] hover:bg-[#E5E5E5] font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-t-transparent border-[#030303] rounded-full animate-spin" />
                    Adding you...
                  </>
                ) : (
                  'Secure Early Access'
                )}
              </button>
            </form>
          )}
        </div>

         <div className="flex flex-col items-center gap-2 border-t border-[#111111] pt-6 relative z-10">
          <span className="text-[10px] font-mono text-[#444444] uppercase tracking-wider">
            Follow our updates
          </span>
          <div className="flex items-center gap-3 text-xs font-mono text-[#666666]">
            <a 
              href="https://x.com/syncratenetwork" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors"
            >
              X (Twitter)
            </a>
            <span className="text-[#222222]">•</span>
            <a 
              href="https://linkedin.com/company/syncrateprotocol" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <span className="text-[#222222]">•</span>
            <a 
              href="https://syncrate.org/blog" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors"
            >
              Blog
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// COMPONENT B: THE ACTIVE DAPP (MINTING)
// ==========================================
function MintingAppUI() {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  const activeChainId = useChainId()
  
  const activeConfig = useMemo(() => CHAIN_CONFIGS[activeChainId] || CHAIN_CONFIGS[8453], [activeChainId])
  const availableStablecoins = useMemo(() => Object.keys(activeConfig.stablecoins), [activeConfig])

  const [activeTab, setActiveTab] = useState<'mint' | 'redeem'>('mint')
  const [inputAmount, setInputAmount] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)

  const paymentAsset = useMemo(() => {
    if (selectedAsset && activeConfig.stablecoins[selectedAsset]) return selectedAsset
    return activeConfig.defaultAsset
  }, [selectedAsset, activeConfig])

  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false)
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'approved' | 'processing' | 'success'>('idle')
  const [queuedRequest, setQueuedRequest] = useState<{ amount: number, position: number, status: 'pending' | 'processing' } | null>(null)

  useEffect(() => setSelectedAsset(null), [activeChainId])

  const activeStablecoinConfig = useMemo(() => activeConfig.stablecoins[paymentAsset], [activeConfig, paymentAsset])

  const { isConnected, address } = useAccount()
  const isMintControllerValid = activeConfig.mintController !== ZERO_ADDRESS

  const { data: priceData } = useReadContract({
    address: activeConfig.goldPriceFeed !== ZERO_ADDRESS ? activeConfig.goldPriceFeed : undefined,
    abi: [{ inputs: [], name: 'latestAnswer', outputs: [{ internalType: 'int256', name: '', type: 'int256' }], stateMutability: 'view', type: 'function' }],
    functionName: 'latestAnswer',
    query: { enabled: activeConfig.goldPriceFeed !== ZERO_ADDRESS, refetchInterval: 10000 },
  })

  const goldPricePerOunce = priceData ? Number(priceData) / 1e8 : 2415.50

  const { data: currentFrontIndex } = useReadContract({
    address: isMintControllerValid ? activeConfig.mintController : undefined,
    abi: MINT_CONTROLLER_ABI,
    functionName: 'nextQueueIndex',
    query: { enabled: isMintControllerValid, refetchInterval: 10000 }
  })

  const targetIndex = queuedRequest ? BigInt(queuedRequest.position + (currentFrontIndex ? Number(currentFrontIndex) : 0) - 1) : BigInt(0)

  const { data: queueItemData } = useReadContract({
    address: isMintControllerValid ? activeConfig.mintController : undefined,
    abi: MINT_CONTROLLER_ABI,
    functionName: 'redemptionQueue',
    args: [targetIndex],
    query: { enabled: !!queuedRequest && isMintControllerValid, refetchInterval: 10000 }
  })

  const { data: stablecoinBalanceRaw } = useReadContract({
    address: activeStablecoinConfig?.address !== ZERO_ADDRESS ? activeStablecoinConfig?.address : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!activeStablecoinConfig?.address && activeStablecoinConfig.address !== ZERO_ADDRESS, refetchInterval: 10000, }
  })

  const { data: xausBalanceRaw } = useReadContract({
    address: activeConfig.xaus !== ZERO_ADDRESS ? activeConfig.xaus : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!activeConfig.xaus && activeConfig.xaus !== ZERO_ADDRESS, refetchInterval: 10000, }
  })

  const stablecoinBalance = stablecoinBalanceRaw && activeStablecoinConfig ? parseFloat(formatUnits(stablecoinBalanceRaw, activeStablecoinConfig.decimals)) : 0
  const xausBalance = xausBalanceRaw ? parseFloat(formatUnits(xausBalanceRaw, 18)) : 0

  const { writeContract: writeApprove, data: approveTxHash, error: approveError, reset: resetApprove } = useWriteContract()
  const { isLoading: isApprovalMining, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash })

  const { writeContract: writeAction, data: actionTxHash, error: actionError, reset: resetAction } = useWriteContract()
  const { isLoading: isActionMining, isSuccess: isActionConfirmed } = useWaitForTransactionReceipt({ hash: actionTxHash })

  useEffect(() => {
    if (isApprovalMining) setTxStatus('approving')
    else if (isApprovalConfirmed && txStatus === 'approving') setTxStatus('approved')
    else if (approveError) { setTxStatus('idle'); resetApprove() }
  }, [isApprovalMining, isApprovalConfirmed, approveError, resetApprove, txStatus])

  useEffect(() => {
    if (isActionMining) setTxStatus('processing')
    else if (isActionConfirmed && txStatus === 'processing') {
      if (activeTab === 'redeem') {
        setQueuedRequest({ amount: parseFloat(inputAmount), position: 1, status: 'pending' })
        setTxStatus('idle'); setInputAmount('')
      } else {
        setTxStatus('success')
      }
    } else if (actionError) { setTxStatus('approved'); resetAction() }
  }, [isActionMining, isActionConfirmed, actionError, resetAction, activeTab, inputAmount, txStatus])

  const calculatedOutput = (() => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return activeTab === 'mint' ? '0.0000' : '0.00'
    const amount = parseFloat(inputAmount)
    if (activeTab === 'mint') return (amount / goldPricePerOunce).toFixed(4)
    else return (amount * goldPricePerOunce * 0.9975).toFixed(2)
  })()

  const handleMaxBalance = () => {
    if (activeTab === 'mint') setInputAmount(stablecoinBalance.toString())
    else setInputAmount(xausBalance.toString())
  }

  const handleApprove = () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0 || !activeStablecoinConfig || !isMintControllerValid) return
    let targetTokenAddress: `0x${string}`
    let decimals: number
    if (activeTab === 'mint') {
      targetTokenAddress = activeStablecoinConfig.address
      decimals = activeStablecoinConfig.decimals
    } else {
      targetTokenAddress = activeConfig.xaus
      decimals = 18 
    }
    if (targetTokenAddress === ZERO_ADDRESS) { alert('Contract addresses not yet configured for this network.'); return }
    const parsedAmount = parseUnits(inputAmount, decimals)
    writeApprove({ address: targetTokenAddress, abi: ERC20_ABI, functionName: 'approve', args: [activeConfig.mintController, parsedAmount] } as any)
  }

  const handleProcess = () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0 || !activeStablecoinConfig || !isMintControllerValid) return
    const isMint = activeTab === 'mint'
    const decimals = isMint ? activeStablecoinConfig.decimals : 18
    const parsedAmount = parseUnits(inputAmount, decimals)
    const targetTokenAddress = activeStablecoinConfig.address
    if (activeConfig.mintController === ZERO_ADDRESS) { alert('Mint Controller address not configured for this network.'); return }
    
    if (isMint) writeAction({ address: activeConfig.mintController, abi: MINT_CONTROLLER_ABI, functionName: 'mint', args: [parsedAmount, targetTokenAddress] } as any)
    else writeAction({ address: activeConfig.mintController, abi: MINT_CONTROLLER_ABI, functionName: 'redeem', args: [parsedAmount, targetTokenAddress] } as any)
  }

  const resetFlow = () => { setInputAmount(''); setTxStatus('idle'); resetApprove(); resetAction() }
  const handleTabSwitch = (tab: 'mint' | 'redeem') => { if (txStatus === 'idle' || txStatus === 'success') { setActiveTab(tab); resetFlow() } }

  const renderDashboard = () => {
    if (activeTab !== 'redeem' || !isConnected) return null;
    if (!queuedRequest) return (
      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-5 text-center transition-all">
        <h3 className="text-xs font-mono tracking-widest text-[#666666] uppercase mb-1">Redemption Queue</h3>
        <p className="text-[10px] text-[#444444] font-mono">No pending requests</p>
      </div>
    );
    const liveAmountOwed = queueItemData && queueItemData[2] ? Number(formatUnits(queueItemData[2], activeStablecoinConfig?.decimals || 18)) : queuedRequest.amount
    return (
      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-5 shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between border-b border-[#111111] pb-3">
          <h3 className="text-xs font-mono tracking-widest text-[#888888] uppercase">Your Queue Position</h3>
          <span className="text-xs font-mono text-white">#{queuedRequest.position}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-xs text-[#666666]">Amount Owed</span>
          <span className="text-sm font-medium text-white">{liveAmountOwed.toFixed(4)} {paymentAsset} Value</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-xs text-[#666666]">Status</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs text-amber-500 font-mono capitalize">Pending Treasury Buffer</span>
          </div>
        </div>
      </div>
    );
  };

  if (!isMounted) return <div className="min-h-screen bg-[#030303] flex items-center justify-center"><span className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin" /></div>

  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col justify-between antialiased ${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center border-b border-[#111111]">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="Syncrate Logo" width={32} height={32} className="object-contain rounded-full" />
          <span className="text-xs font-mono tracking-widest text-[#666666] group-hover:text-white transition-colors hidden xs:inline">XAUs MINT</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted && account && chain;
              return (
                <div {...(!mounted && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })} className="flex items-center gap-1.5 sm:gap-3">
                  {(() => {
                    if (!mounted || !account || !chain) return <button onClick={openConnectModal} type="button" className="px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all bg-white text-[#030303] hover:bg-[#E5E5E5]">Connect Wallet</button>;
                    if (chain.unsupported) return <button onClick={openChainModal} type="button" className="px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all bg-red-600 text-white shadow-md hover:bg-red-700">Wrong network</button>;
                    return (
                      <div className="flex items-center gap-1.5 sm:gap-3">
                        <button onClick={openChainModal} type="button" className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md border border-[#222222] bg-[#0A0A0A] text-[11px] sm:text-xs font-mono text-white flex items-center gap-1.5 hover:border-[#333333] transition-colors">
                          {chain.hasIcon && <div className="w-3.5 h-3.5 overflow-hidden rounded-full flex-shrink-0">{chain.iconUrl && <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} className="w-full h-full object-cover" />}</div>}
                          {chain.name}
                          <span className="text-[9px] sm:text-[10px] text-[#666666] ml-1">▼</span>
                        </button>
                        <button onClick={openAccountModal} type="button" className="px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all border border-[#222222] bg-[#0A0A0A] text-[#888888] hover:text-[#E5E5E5] hover:border-[#444444]">{account.displayName}</button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-12 gap-6">
        <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex gap-6 border-b border-[#111111] pb-4 mb-6">
            <button onClick={() => handleTabSwitch('mint')} className={`text-sm font-medium pb-4 -mb-[18px] transition-colors ${activeTab === 'mint' ? 'text-white border-b-2 border-white' : 'text-[#666666] hover:text-[#AAAAAA]'}`}>Mint XAUs</button>
            <button onClick={() => handleTabSwitch('redeem')} className={`text-sm font-medium pb-4 -mb-[18px] transition-colors ${activeTab === 'redeem' ? 'text-white border-b-2 border-white' : 'text-[#666666] hover:text-[#AAAAAA]'}`}>Redeem</button>
          </div>

          {txStatus === 'success' ? (
            <div className="text-center py-8 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4"><span className="text-emerald-500 text-lg">✓</span></div>
              <h3 className="text-lg font-medium text-white mb-2">Transaction Success</h3>
              <p className="text-xs text-[#888888] max-w-xs mb-6 leading-relaxed">
                {activeTab === 'mint' ? 'Your payment was processed and your native XAUs have been minted successfully.' : `Your XAUs have been successfully redeemed for ${paymentAsset}.`}
              </p>
              <button onClick={resetFlow} className="px-6 py-2.5 bg-[#111111] text-xs font-medium rounded-md hover:bg-[#222222] text-white transition-all">
                {activeTab === 'mint' ? 'Mint Again' : 'Redeem Again'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-1.5 focus-within:border-[#444444] transition-colors relative">
                <span className="text-[10px] font-mono tracking-wider text-[#666666] uppercase">You Pay</span>
                <div className="flex items-center justify-between gap-4">
                  <input type="number" placeholder="0.0" value={inputAmount} onChange={(e) => setInputAmount(e.target.value)} disabled={txStatus !== 'idle' && txStatus !== 'approved'} className="bg-transparent text-xl md:text-2xl text-white placeholder-[#333333] focus:outline-none font-sans w-full disabled:opacity-50 min-w-0" />
                  {activeTab === 'mint' ? (
                    <div className="relative flex-shrink-0">
                      <button type="button" disabled={(txStatus !== 'idle' && txStatus !== 'approved') || availableStablecoins.length <= 1} onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)} className="bg-[#0A0A0A] border border-[#222222] hover:border-[#333333] rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-medium text-white transition-all disabled:opacity-50">
                        <Image src={`/${paymentAsset.toLowerCase()}-icon.png`} alt={`${paymentAsset} logo`} width={16} height={16} className="rounded-full flex-shrink-0" />
                        <span>{paymentAsset}</span>
                        {availableStablecoins.length > 1 && <span className="text-[9px] text-[#666666]">▼</span>}
                      </button>
                      {isAssetDropdownOpen && availableStablecoins.length > 1 && (
                        <div className="absolute right-0 mt-1.5 w-28 bg-[#0A0A0A] border border-[#222222] rounded-lg overflow-hidden z-40 shadow-xl">
                          {availableStablecoins.map((asset) => (
                            <button key={asset} type="button" onClick={() => { setSelectedAsset(asset); setIsAssetDropdownOpen(false) }} className="w-full text-left px-3 py-2.5 text-xs text-[#AAAAAA] hover:text-white hover:bg-white/[0.03] flex items-center gap-2 transition-colors">
                              <Image src={`/${asset.toLowerCase()}-icon.png`} alt={`${asset} logo`} width={16} height={16} className="rounded-full" />
                              {asset}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-medium text-white select-none flex-shrink-0 whitespace-nowrap">
                      <Image src="/xaus-icon2.png" alt="XAUs logo" width={16} height={16} className="rounded-full flex-shrink-0" />
                      <span>XAUs</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end items-center gap-2 mt-1">
                  <span className="text-[10px] text-[#666666] font-mono">
                    Balance: {isConnected ? (activeTab === 'mint' ? stablecoinBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : xausBalance.toFixed(4)) : (activeTab === 'mint' ? '0.00' : '0.0000')} {activeTab === 'mint' ? paymentAsset : 'XAUs'}
                  </span>
                  {isConnected && <button onClick={handleMaxBalance} disabled={txStatus !== 'idle' && txStatus !== 'approved'} className="text-[9px] font-bold text-[#0037FF] hover:text-[#002CD6] transition-colors disabled:opacity-50 uppercase tracking-wider">Max</button>}
                </div>
              </div>

              <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-1.5 relative">
                <span className="text-[10px] font-mono tracking-wider text-[#666666] uppercase">You Receive</span>
                <div className="flex items-center justify-between gap-4">
                  <input type="text" readOnly value={calculatedOutput} className="bg-transparent text-xl md:text-2xl text-white/90 font-sans focus:outline-none w-full cursor-default min-w-0" />
                  {activeTab === 'mint' ? (
                    <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-medium text-[#AAAAAA] select-none flex-shrink-0 whitespace-nowrap">
                      <Image src="/xaus-icon2.png" alt="XAUs logo" width={16} height={16} className="rounded-full flex-shrink-0" />
                      <span>XAUs</span>
                    </div>
                  ) : (
                    <div className="relative flex-shrink-0">
                      <button type="button" disabled={(txStatus !== 'idle' && txStatus !== 'approved') || availableStablecoins.length <= 1} onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)} className="bg-[#0A0A0A] border border-[#222222] hover:border-[#333333] rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-medium text-white transition-all disabled:opacity-50">
                        <Image src={`/${paymentAsset.toLowerCase()}-icon.png`} alt={`${paymentAsset} logo`} width={16} height={16} className="rounded-full flex-shrink-0" />
                        <span>{paymentAsset}</span>
                        {availableStablecoins.length > 1 && <span className="text-[9px] text-[#666666]">▼</span>}
                      </button>
                      {isAssetDropdownOpen && availableStablecoins.length > 1 && (
                        <div className="absolute right-0 mt-1.5 w-28 bg-[#0A0A0A] border border-[#222222] rounded-lg overflow-hidden z-40 shadow-xl">
                          {availableStablecoins.map((asset) => (
                            <button key={asset} type="button" onClick={() => { setSelectedAsset(asset); setIsAssetDropdownOpen(false) }} className="w-full text-left px-3 py-2.5 text-xs text-[#AAAAAA] hover:text-white hover:bg-white/[0.03] flex items-center gap-2 transition-colors">
                              <Image src={`/${asset.toLowerCase()}-icon.png`} alt={`${asset} logo`} width={16} height={16} className="rounded-full" />
                              {asset}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#030303] border border-[#111111] rounded-xl p-4 font-mono text-xs flex flex-col gap-2 mt-1">
                <div className="flex justify-between items-center text-[#666666]">
                  <span>Live Gold Price Feed</span>
                  <span className="text-white font-sans">${goldPricePerOunce.toFixed(2)} <span className="text-[10px] font-mono text-[#666666]">/ oz</span></span>
                </div>
                {activeTab === 'redeem' && <div className="flex justify-between items-center text-[#666666] pt-2 border-t border-[#111111]"><span>Redemption Fee</span><span className="text-white">0.25%</span></div>}
              </div>

              <div className="mt-3">
                {!isConnected ? (
                  <div className="w-full flex justify-center custom-rainbow-btn">
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <button onClick={openConnectModal} className="w-full py-4 bg-white text-black font-medium text-sm rounded-lg hover:bg-[#E5E5E5] transition-all shadow-md">
                          Connect Wallet to {activeTab === 'mint' ? 'Mint' : 'Redeem'}
                        </button>
                      )}
                    </ConnectButton.Custom>
                  </div>
                ) : (
                  <>
                    {(txStatus === 'idle' || txStatus === 'approving') && (
                      <button onClick={handleApprove} disabled={!inputAmount || parseFloat(inputAmount) <= 0 || txStatus === 'approving' || !isMintControllerValid} className="w-full py-4 bg-[#111111] hover:bg-[#1A1A1A] text-white border border-[#333333] font-medium text-sm rounded-lg disabled:opacity-40 disabled:hover:bg-[#111111] transition-all flex items-center justify-center gap-2">
                        {txStatus === 'approving' ? <><span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />Approving Allowances...</> : !isMintControllerValid ? 'Addresses Not Active on This Network' : `Approve ${activeTab === 'mint' ? paymentAsset : 'XAUs'}`}
                      </button>
                    )}
                    {(txStatus === 'approved' || txStatus === 'processing') && (
                      <button onClick={handleProcess} disabled={txStatus === 'processing' || !isMintControllerValid} className={`w-full py-4 text-white font-medium text-sm rounded-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg ${activeTab === 'mint' ? 'bg-[#0037FF] hover:bg-[#002CD6] shadow-[#0037FF]/10' : 'bg-white text-black hover:bg-[#E5E5E5] shadow-white/10'}`}>
                        {txStatus === 'processing' ? <><span className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${activeTab === 'mint' ? 'border-white' : 'border-black'}`} />{activeTab === 'mint' ? 'Minting XAUs...' : 'Redeeming XAUs...'}</> : activeTab === 'mint' ? 'Mint XAUs' : 'Redeem XAUs'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <Link href="/app/sgld" className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] hover:border-[#222222] rounded-xl px-4 py-3 flex items-center justify-between group transition-all duration-300">
          <span className="text-xs font-mono tracking-wide text-[#666666] group-hover:text-[#E5E5E5] transition-colors">Earn yield on your XAUs</span>
          <span className="text-xs text-[#444444] group-hover:text-white group-hover:translate-x-0.5 transition-all font-mono">Launch Syncrate Prime ➔</span>
        </Link>
        {renderDashboard()}
      </main>
    </div>
  )
}

// ==========================================
// THE MAIN ROUTER EXPORT
// This looks at 'IS_LIVE' and decides which component to show.
// ==========================================
export default function AppPortal() {
  if (!IS_LIVE) {
    return <LaunchingSoonUI />
  }

  return <MintingAppUI />
}
