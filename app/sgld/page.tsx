'use client'

import { useState, useEffect } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Image from 'next/image'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'

// ==========================================
// 🚀 THE MASTER TOGGLE
// Set to 'false' to show the "Launching Soon" waitlist.
// Set to 'true' to instantly bring back the full Vault dApp.
// ==========================================
const IS_LIVE = false;

// ==========================================
// CONFIGURATIONS & ABIS
// ==========================================
// Base Mainnet Contract Addresses
const XAUS_ADDRESS = '0x0000000000000000000000000000000000000001' // Placeholder
const SGLD_VAULT_ADDRESS = '0x0000000000000000000000000000000000000000' // Placeholder

// Launch date for APY calculation (Update this to your actual deployment date)
const VAULT_INCEPTION = new Date('2026-06-01T00:00:00Z').getTime()

// Minimal ABIs for interacting with the contracts
const erc20Abi = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] }
] as const

const vaultAbi = [
  // Custom XAU Path
  { type: 'function', name: 'depositXAUs', inputs: [{ name: 'xausAmount', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'withdrawToXAUs', inputs: [{ name: 'sharesAmount', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  // Metrics
  { type: 'function', name: 'totalAssets', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }] }
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
    // TODO: Replace with your actual email API integration
    await new Promise((resolve) => setTimeout(resolve, 1000)) 
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] p-6 flex flex-col items-center justify-center antialiased ${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-8 shadow-2xl flex flex-col gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#0037FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0037FF]/10 border border-[#0037FF]/20 text-[10px] font-mono uppercase tracking-wider text-[#0037FF] font-semibold">
              Coming Soon
            </span>
            <span className="text-[10px] font-mono text-[#666666] uppercase">
              Base Mainnet
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mt-2">
            Syncrate Prime Vault
          </h1>
          <p className="text-sm text-[#888888] leading-relaxed">
            Unlock institutional-grade yield on your gold. Deposit XAUs and earn securely on Base.
          </p>
        </div>

        <div className="border-t border-[#111111] pt-6 relative z-10">
          {submitted ? (
            <div className="bg-[#050505] border border-emerald-950/40 rounded-xl p-5 text-center flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-300">
              <span className="text-sm font-medium text-emerald-400">You're on the list!</span>
              <span className="text-xs text-[#666666]">
                We will contact you the second the vault contracts go live.
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
                className="w-full py-4 bg-[#0037FF] text-white hover:bg-[#002CD6] font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30 shadow-lg shadow-[#0037FF]/10"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
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
          <span className="text-[10px] font-mono text-[#444444] uppercase">
            Developed Assets
          </span>
          <div className="flex items-center gap-3 text-xs font-mono text-[#666666]">
            <span>XAUs</span>
            <span className="text-[#222222]">•</span>
            <span className="text-white">SGLD Vault</span>
            <span className="text-[#222222]">•</span>
            <span>USDC</span>
          </div>
        </div>
      </div>
    </div>
  )
}


// ==========================================
// COMPONENT B: THE ACTIVE DAPP (VAULT)
// ==========================================
function SgldVaultAppUI() {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  const { isConnected, address } = useAccount()

  // Core Flow States
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [inputAmount, setInputAmount] = useState('')
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'approved' | 'processing' | 'success'>('idle')

  // --- WAGMI READ: Balances ---
  const { data: xausData, refetch: refetchXaus } = useBalance({ address, token: XAUS_ADDRESS as `0x${string}` })
  const { data: sgldData, refetch: refetchSgld } = useBalance({ address, token: SGLD_VAULT_ADDRESS as `0x${string}` })

  const xausBalance = xausData ? parseFloat(xausData.formatted) : 0.00
  const sgldBalance = sgldData ? parseFloat(sgldData.formatted) : 0.00

  // --- WAGMI READ: Allowance ---
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: XAUS_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, SGLD_VAULT_ADDRESS as `0x${string}`] : undefined,
    query: { enabled: !!address },
  })

  // --- WAGMI READ: Vault Global Metrics ---
  const { data: totalAssetsData } = useReadContract({ address: SGLD_VAULT_ADDRESS as `0x${string}`, abi: vaultAbi, functionName: 'totalAssets' })
  const { data: totalSupplyData } = useReadContract({ address: SGLD_VAULT_ADDRESS as `0x${string}`, abi: vaultAbi, functionName: 'totalSupply' })

  // Parse Live Vault Data
  const vaultTVL = totalAssetsData ? parseFloat(formatUnits(totalAssetsData as bigint, 6)) : 0 
  const vaultSupply = totalSupplyData ? parseFloat(formatUnits(totalSupplyData as bigint, 6)) : 0 
  const sharePrice = vaultSupply > 0 ? (vaultTVL / vaultSupply) : 1.00

  // --- Calculate Actual APY ---
  const daysElapsed = Math.max((Date.now() - VAULT_INCEPTION) / (1000 * 60 * 60 * 24), 1)
  const vaultApy = vaultSupply > 0 ? ((sharePrice - 1.00) / 1.00) * (365 / daysElapsed) * 100 : 0.00

  const formatMetric = (value: number) => {
    if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M'
    if (value >= 1e3) return (value / 1e3).toFixed(2) + 'k'
    return value.toFixed(2)
  }

  // --- WAGMI WRITE: Transactions ---
  const { data: approveTxHash, writeContract: writeApprove, isPending: isApprovePending } = useWriteContract()
  const { data: processTxHash, writeContract: writeProcess, isPending: isProcessPending } = useWriteContract()

  // --- WAGMI RECEIPTS ---
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { isLoading: isProcessConfirming, isSuccess: isProcessSuccess } = useWaitForTransactionReceipt({ hash: processTxHash })

  // --- EFFECT ROUTERS ---
  useEffect(() => {
    if (isApprovePending || isApproveConfirming) setTxStatus('approving')
    if (isApproveSuccess) {
      setTxStatus('approved')
      refetchAllowance()
    }
  }, [isApprovePending, isApproveConfirming, isApproveSuccess, refetchAllowance])

  useEffect(() => {
    if (isProcessPending || isProcessConfirming) setTxStatus('processing')
    if (isProcessSuccess) {
      setTxStatus('success')
      refetchXaus()
      refetchSgld()
    }
  }, [isProcessPending, isProcessConfirming, isProcessSuccess, refetchXaus, refetchSgld])

  // Smart checking to skip approval if user already approved enough or is withdrawing
  useEffect(() => {
    if (!inputAmount || isNaN(Number(inputAmount)) || !xausData) return

    if (activeTab === 'withdraw') {
      if (txStatus === 'idle') setTxStatus('approved')
      return
    }

    const inputUnits = parseUnits(inputAmount, xausData.decimals)
    const allowed = currentAllowance ? (currentAllowance as bigint) : BigInt(0)

    if (allowed >= inputUnits) {
      if (txStatus === 'idle') setTxStatus('approved')
    } else {
      if (txStatus === 'approved') setTxStatus('idle')
    }
  }, [inputAmount, activeTab, currentAllowance, xausData, txStatus])

  // --- INTERACTION HANDLERS ---
  const handleMaxBalance = () => {
    if (activeTab === 'deposit') setInputAmount(xausBalance.toString())
    else setInputAmount(sgldBalance.toString())
  }

  const handleApprove = () => {
    if (!xausData) return
    const amountToApprove = parseUnits(inputAmount, xausData.decimals)
    writeApprove({
      address: XAUS_ADDRESS as `0x${string}`,
      abi: erc20Abi,
      functionName: 'approve',
      args: [SGLD_VAULT_ADDRESS as `0x${string}`, amountToApprove],
    } as any)
  }

  const handleProcess = () => {
    if (!address) return
    if (activeTab === 'deposit') {
      if (!xausData) return
      const amountToDeposit = parseUnits(inputAmount, xausData.decimals)
      writeProcess({
        address: SGLD_VAULT_ADDRESS as `0x${string}`,
        abi: vaultAbi,
        functionName: 'depositXAUs',
        args: [amountToDeposit],
      } as any)
    } else {
      if (!sgldData) return
      const sharesToRedeem = parseUnits(inputAmount, sgldData.decimals)
      writeProcess({
        address: SGLD_VAULT_ADDRESS as `0x${string}`,
        abi: vaultAbi,
        functionName: 'withdrawToXAUs',
        args: [sharesToRedeem],
      } as any)
    }
  }

  const resetFlow = () => { setInputAmount(''); setTxStatus('idle') }
  const handleTabSwitch = (tab: 'deposit' | 'withdraw') => {
    if (txStatus === 'idle' || txStatus === 'success' || txStatus === 'approved') {
      setActiveTab(tab); resetFlow()
    }
  }

  // Hydration fallback
  if (!isMounted) return <div className="min-h-screen bg-[#030303] flex items-center justify-center"><span className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin" /></div>

  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col justify-between antialiased ${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}>
      
      {/* --- HEADER --- */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center border-b border-[#111111]">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="Syncrate Logo" width={32} height={32} className="object-contain rounded-full" />
          <span className="text-xs font-mono tracking-widest text-[#666666] group-hover:text-white transition-colors hidden xs:inline">SGLD VAULT</span>
        </Link>
        
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;
            return (
              <div {...(!ready && { 'aria-hidden': true, 'style': { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })}>
                {(() => {
                  if (!connected) return <button onClick={openConnectModal} type="button" className="px-5 py-2.5 bg-[#0037FF] hover:bg-[#002CD6] text-white font-medium text-sm rounded-lg transition-all">Connect Wallet</button>;
                  if (chain.unsupported) return <button onClick={openChainModal} type="button" className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg transition-all">Wrong network</button>;
                  return (
                    <div className="flex items-center gap-3">
                      <button onClick={openChainModal} type="button" className="flex items-center gap-2 bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] px-3 py-2 rounded-lg text-xs font-mono text-[#888888] transition-all">
                        {chain.hasIcon && <div className="w-4 h-4 rounded-full overflow-hidden">{chain.iconUrl && <Image alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} width={16} height={16} />}</div>}
                        {chain.name}
                      </button>
                      <button onClick={openAccountModal} type="button" className="px-4 py-2 bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] text-white font-mono text-xs rounded-lg transition-all">
                        {account.displayName}
                        {account.displayBalance ? ` (${account.displayBalance})` : ''}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </header>

      {/* --- MAIN APP INTERFACE --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-12 gap-6">
        <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Syncrate Logo" width={28} height={28} className="object-contain rounded-full" />
              <h1 className="text-lg font-medium text-white tracking-tight">Syncrate Prime Vault</h1>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 border-y border-[#111111] py-4 my-1">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-[#666666]">Vault TVL</span>
              <span className="text-sm font-medium text-white">${formatMetric(vaultTVL)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-[#666666]">Supply</span>
              <span className="text-sm font-medium text-white">{formatMetric(vaultSupply)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-[#666666]">Price</span>
              <span className="text-sm font-medium text-white">${sharePrice.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-[#0037FF]">Est. APY</span>
              <span className="text-sm font-medium text-[#0037FF]">{vaultApy.toFixed(2)}%</span>
            </div>
          </div>

          {txStatus === 'success' ? (
            <div className="text-center py-6 flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                <span className="text-emerald-500 text-lg">✓</span>
              </div>
              <h3 className="text-base font-medium text-white mb-2">Transaction Success</h3>
              <button onClick={resetFlow} className="w-full mt-4 py-3 bg-[#111111] text-xs font-medium rounded-lg hover:bg-[#222222] text-white transition-all border border-[#222222]">
                Dismiss
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 bg-[#030303] border border-[#111111] rounded-xl p-1">
                <button type="button" onClick={() => handleTabSwitch('deposit')} className={`py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'deposit' ? 'bg-[#1a1a1a] text-white' : 'text-[#666666] hover:text-[#999999]'}`}>Deposit</button>
                <button type="button" onClick={() => handleTabSwitch('withdraw')} className={`py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'withdraw' ? 'bg-[#1a1a1a] text-white' : 'text-[#666666] hover:text-[#999999]'}`}>Withdraw</button>
              </div>

              <div className="flex justify-end items-center mt-1 h-6">
                <span className="text-[10px] text-[#555]">
                  Fee: {activeTab === 'deposit' ? '0%' : '0.10%'}
                </span>
              </div>

              <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-2 focus-within:border-[#444444] transition-colors relative mt-1">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#666666] uppercase">
                  <span>Amount ({activeTab === 'deposit' ? 'XAU' : 'SGLD'})</span>
                  <div className="flex items-center gap-1.5">
                    <span>Balance: {isConnected ? (activeTab === 'deposit' ? xausBalance.toFixed(2) : sgldBalance.toFixed(2)) : '0.00'}</span>
                    {isConnected && <button onClick={handleMaxBalance} type="button" className="text-[9px] font-bold text-[#0037FF] hover:text-[#002CD6] transition-colors uppercase">Max</button>}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <input type="number" placeholder="0.00" value={inputAmount} onChange={(e) => setInputAmount(e.target.value)} disabled={txStatus !== 'idle' && txStatus !== 'approved'} className="bg-transparent text-xl md:text-2xl text-white placeholder-[#333333] focus:outline-none font-sans w-full disabled:opacity-50 min-w-0" />
                  <span className="text-sm font-medium text-[#888]">{activeTab === 'deposit' ? 'XAU' : 'SGLD'}</span>
                </div>
              </div>

              <div className="mt-2">
                {!isConnected ? (
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <button onClick={openConnectModal} type="button" className="w-full py-4 bg-[#0037FF] hover:bg-[#002CD6] text-white font-medium text-sm rounded-lg transition-all shadow-md shadow-[#0037FF]/10">
                        Connect Wallet
                      </button>
                    )}
                  </ConnectButton.Custom>
                ) : (
                  <>
                    {(txStatus === 'idle' || txStatus === 'approving') && activeTab === 'deposit' && (
                      <button onClick={handleApprove} disabled={!inputAmount || parseFloat(inputAmount) <= 0 || txStatus === 'approving'} className="w-full py-4 bg-[#111111] hover:bg-[#1A1A1A] text-white border border-[#333333] font-medium text-sm rounded-lg disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                        {txStatus === 'approving' ? 'Approving...' : `Approve XAU`}
                      </button>
                    )}

                    {(txStatus === 'approved' || txStatus === 'processing') && (
                      <button onClick={handleProcess} disabled={!inputAmount || parseFloat(inputAmount) <= 0 || txStatus === 'processing'} className="w-full py-4 bg-[#0037FF] hover:bg-[#002CD6] text-white font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0037FF]/10">
                        {txStatus === 'processing' ? 'Processing...' : (activeTab === 'deposit' ? 'Confirm Deposit' : `Withdraw to XAU`)}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <div className="h-4" />
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

  return <SgldVaultAppUI />
}
