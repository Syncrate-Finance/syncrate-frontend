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
const XAUS_ADDRESS = '0x0000000000000000000000000000000000000000' // Placeholder
const SGLD_VAULT_ADDRESS = '0x0000000000000000000000000000000000000000' // Placeholder

// Minimal ABIs for interacting with the contracts
const erc20Abi = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] }
] as const

const vaultAbi = [
  { type: 'function', name: 'depositXAUs', inputs: [{ name: 'xausAmount', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'redeem', inputs: [{ name: 'shares', type: 'uint256' }, { name: 'receiver', type: 'address' }, { name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] }
] as const

export default function SgldVaultApp() {
  const { isConnected, address } = useAccount()

  // --- WAGMI READ: Balances ---
  const { data: xausData, refetch: refetchXaus } = useBalance({
    address,
    token: XAUS_ADDRESS as `0x${string}`,
  })

  const { data: sgldData, refetch: refetchSgld } = useBalance({
    address,
    token: SGLD_VAULT_ADDRESS as `0x${string}`,
  })

  // Replaced the 100 mock with actual 0.00 fallback
  const xausBalance = xausData ? parseFloat(xausData.formatted) : 0.00
  const sgldBalance = sgldData ? parseFloat(sgldData.formatted) : 0.00

  // --- WAGMI READ: Allowance ---
  const { data: xausAllowance, refetch: refetchAllowance } = useReadContract({
    address: XAUS_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, SGLD_VAULT_ADDRESS as `0x${string}`] : undefined,
    query: { enabled: !!address },
  })

  // --- WAGMI WRITE: Transactions ---
  const { data: approveTxHash, writeContract: writeApprove, isPending: isApprovePending } = useWriteContract()
  const { data: processTxHash, writeContract: writeProcess, isPending: isProcessPending } = useWriteContract()

  // --- WAGMI RECEIPTS: Wait for blockchain confirmations ---
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { isLoading: isProcessConfirming, isSuccess: isProcessSuccess } = useWaitForTransactionReceipt({ hash: processTxHash })

  // Core Flow States
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [inputAmount, setInputAmount] = useState('')
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'approved' | 'processing' | 'success'>('idle')

  // Global Vault Data (Mocked until indexer/subgraph is built)
  const vaultTVL = 1200000 
  const vaultSupply = 2180000 
  const sharePrice = 1.10 

  // --- EFFECT ROUTERS: Manage UI State based on Tx Receipts ---
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

    const inputUnits = parseUnits(inputAmount, xausData.decimals)
    const currentAllowance = xausAllowance ? (xausAllowance as bigint) : BigInt(0)

    if (activeTab === 'withdraw' || currentAllowance >= inputUnits) {
      // If withdrawing (no approval needed) OR already approved enough
      if (txStatus === 'idle') setTxStatus('approved')
    } else {
      if (txStatus === 'approved') setTxStatus('idle')
    }
  }, [inputAmount, activeTab, xausAllowance, xausData, txStatus])

  // --- INTERACTION HANDLERS ---
  const handleMaxBalance = () => {
    if (activeTab === 'deposit') {
      setInputAmount(xausBalance.toString())
    } else {
      setInputAmount(sgldBalance.toString())
    }
  }

  const handleApprove = () => {
    if (!xausData) return
    const amountToApprove = parseUnits(inputAmount, xausData.decimals)
    writeApprove({
      address: XAUS_ADDRESS as `0x${string}`,
      abi: erc20Abi,
      functionName: 'approve',
      args: [SGLD_VAULT_ADDRESS as `0x${string}`, amountToApprove],
    })
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
      })
    } else {
      if (!sgldData) return
      const sharesToRedeem = parseUnits(inputAmount, sgldData.decimals)
      writeProcess({
        address: SGLD_VAULT_ADDRESS as `0x${string}`,
        abi: vaultAbi,
        functionName: 'redeem',
        args: [sharesToRedeem, address, address],
      })
    }
  }

  const resetFlow = () => {
    setInputAmount('')
    setTxStatus('idle')
  }

  const handleTabSwitch = (tab: 'deposit' | 'withdraw') => {
    if (txStatus === 'idle' || txStatus === 'success' || txStatus === 'approved') {
      setActiveTab(tab)
      resetFlow()
    }
  }

  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col justify-between antialiased ${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}>
      
      {/* --- APPLICATION HEADER --- */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center border-b border-[#111111]">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.jpg" alt="Syncrate Logo" width={32} height={32} className="object-contain rounded-full" />
          <span className="text-xs font-mono tracking-widest text-[#666666] group-hover:text-white transition-colors hidden xs:inline">SGLD VAULT</span>
        </Link>

        {/* Unified Wallet Connect Button */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <ConnectButton.Custom>
             {/* ... (Keep your existing RainbowKit ConnectButton implementation intact here) ... */}
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              return (
                <div
                  {...(!mounted && {
                    'aria-hidden': true,
                    style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
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

      {/* --- MAIN VAULT APP INTERFACE SYSTEM --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-12 gap-6">
        
        {/* METRICS ROW COMPONENT */}
        <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Image src="/logo.jpg" alt="Syncrate Logo" width={28} height={28} className="object-contain rounded-full" />
              <h1 className="text-lg font-medium text-white tracking-tight">Syncrate GLD Vault</h1>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-y border-[#111111] py-4 my-1">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-[#666666]">Vault TVL</span>
              <span className="text-sm font-medium text-white">${(vaultTVL / 1e6).toFixed(1)}M</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-[#666666]">Vault Supply</span>
              <span className="text-sm font-medium text-white">{(vaultSupply / 1e6).toFixed(2)}M SGLD</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-[#666666]">Share Price</span>
              <span className="text-sm font-medium text-white">${sharePrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between -mt-2">
            <Link href="#" className="text-xs font-mono text-[#0037FF] hover:underline flex items-center gap-1 transition-all">
              View details <span className="text-[10px]">➔</span>
            </Link>
          </div>

          {txStatus === 'success' ? (
            /* TRANSACTION SUCCESS FEEDBACK */
            <div className="text-center py-6 flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                <span className="text-emerald-500 text-lg">✓</span>
              </div>
              <h3 className="text-base font-medium text-white mb-2">Transaction Success</h3>
              <p className="text-xs text-[#888888] max-w-xs mb-6 leading-relaxed">
                {activeTab === 'deposit' 
                  ? 'Your XAUs positions have been safely deposited into the yields optimizer pool.'
                  : 'Your stable shares have been burned and your underlying asset capital has returned.'}
              </p>
              <button 
                onClick={resetFlow}
                className="w-full py-3 bg-[#111111] text-xs font-medium rounded-lg hover:bg-[#222222] text-white transition-all border border-[#222222]"
              >
                Dismiss
              </button>
            </div>
          ) : (
            /* CORE DEPOSIT/WITHDRAW MANAGEMENT CONTROLS */
            <div className="flex flex-col gap-4">
              
              <div className="grid grid-cols-2 bg-[#030303] border border-[#111111] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('deposit')}
                  className={`py-2 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'deposit' ? 'bg-[#1a1a1a] text-white' : 'text-[#666666] hover:text-[#999999]'
                  }`}
                >
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('withdraw')}
                  className={`py-2 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'withdraw' ? 'bg-[#1a1a1a] text-white' : 'text-[#666666] hover:text-[#999999]'
                  }`}
                >
                  Withdraw
                </button>
              </div>

              <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-2 focus-within:border-[#444444] transition-colors relative">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#666666] uppercase">
                  <span>Amount ({activeTab === 'deposit' ? 'XAUs' : 'SGLD'})</span>
                  <div className="flex items-center gap-1.5">
                    <span>
                      Balance: {isConnected 
                        ? (activeTab === 'deposit' ? xausBalance.toFixed(2) : sgldBalance.toFixed(2))
                        : '0.00'}
                    </span>
                    {isConnected && (
                      <button 
                        onClick={handleMaxBalance}
                        type="button"
                        className="text-[9px] font-bold text-[#0037FF] hover:text-[#002CD6] transition-colors uppercase"
                      >
                        Max
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    disabled={txStatus !== 'idle' && txStatus !== 'approved'}
                    className="bg-transparent text-xl md:text-2xl text-white placeholder-[#333333] focus:outline-none font-sans w-full disabled:opacity-50 min-w-0"
                  />
                </div>
              </div>

              <div className="mt-2">
                {!isConnected ? (
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <button 
                        onClick={openConnectModal}
                        type="button"
                        className="w-full py-4 bg-[#0037FF] hover:bg-[#002CD6] text-white font-medium text-sm rounded-lg transition-all shadow-md shadow-[#0037FF]/10"
                      >
                        Connect Wallet
                      </button>
                    )}
                  </ConnectButton.Custom>
                ) : (
                  <>
                    {(txStatus === 'idle' || txStatus === 'approving') && activeTab === 'deposit' && (
                      <button 
                        onClick={handleApprove}
                        disabled={!inputAmount || parseFloat(inputAmount) <= 0 || txStatus === 'approving'}
                        className="w-full py-4 bg-[#111111] hover:bg-[#1A1A1A] text-white border border-[#333333] font-medium text-sm rounded-lg disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                      >
                        {txStatus === 'approving' ? (
                          <>
                            <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                            Approving Vault Allowances...
                          </>
                        ) : (
                          'Approve XAUs'
                        )}
                      </button>
                    )}

                    {(txStatus === 'approved' || txStatus === 'processing') && (
                      <button 
                        onClick={handleProcess}
                        disabled={!inputAmount || parseFloat(inputAmount) <= 0 || txStatus === 'processing'}
                        className="w-full py-4 bg-[#0037FF] hover:bg-[#002CD6] text-white font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0037FF]/10"
                      >
                        {txStatus === 'processing' ? (
                          <>
                            <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                            {activeTab === 'deposit' ? 'Depositing into Vault...' : 'Withdrawing Assets...'}
                          </>
                        ) : (
                          activeTab === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'
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
      <div className="h-4" />
    </div>
  )
}
