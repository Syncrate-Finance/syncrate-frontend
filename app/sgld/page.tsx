'use client'

import { useState, useEffect } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Image from 'next/image'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'

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

export default function SgldVaultApp() {
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
  const vaultTVL = totalAssetsData ? parseFloat(formatUnits(totalAssetsData as bigint, 6)) : 0 // TVL is based in USDC (6 decimals)
  
  // Note: ERC4626 inherits underlying asset decimals. If USDC is 6, SGLD is also 6. 
  // Adjusted from 18 to 6 assuming standard ERC4626 behavior based on your USDC asset.
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

    // Allowances only matter for Deposits. Withdrawals burn user's own shares natively.
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
      
      {/* --- HEADER --- */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center border-b border-[#111111]">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.jpg" alt="Syncrate Logo" width={32} height={32} className="object-contain rounded-full" />
          <span className="text-xs font-mono tracking-widest text-[#666666] group-hover:text-white transition-colors hidden xs:inline">SGLD VAULT</span>
        </Link>
        
        {/* Custom Clean Header Connect Button */}
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button 
                        onClick={openConnectModal} 
                        type="button" 
                        className="px-5 py-2.5 bg-[#0037FF] hover:bg-[#002CD6] text-white font-medium text-sm rounded-lg transition-all"
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
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg transition-all"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="flex items-center gap-2 bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] px-3 py-2 rounded-lg text-xs font-mono text-[#888888] transition-all"
                      >
                        {chain.hasIcon && (
                          <div className="w-4 h-4 rounded-full overflow-hidden">
                            {chain.iconUrl && (
                              <Image
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                width={16}
                                height={16}
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </button>

                      <button 
                        onClick={openAccountModal} 
                        type="button" 
                        className="px-4 py-2 bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] text-white font-mono text-xs rounded-lg transition-all"
                      >
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
          
          {/* HEADER METRICS */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Image src="/logo.jpg" alt="Syncrate Logo" width={28} height={28} className="object-contain rounded-full" />
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
            /* SUCCESS MESSAGE */
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
            /* CONTROLS */
            <div className="flex flex-col gap-4">
              
              {/* DEPOSIT / WITHDRAW TABS */}
              <div className="grid grid-cols-2 bg-[#030303] border border-[#111111] rounded-xl p-1">
                <button type="button" onClick={() => handleTabSwitch('deposit')} className={`py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'deposit' ? 'bg-[#1a1a1a] text-white' : 'text-[#666666] hover:text-[#999999]'}`}>Deposit</button>
                <button type="button" onClick={() => handleTabSwitch('withdraw')} className={`py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'withdraw' ? 'bg-[#1a1a1a] text-white' : 'text-[#666666] hover:text-[#999999]'}`}>Withdraw</button>
              </div>

              {/* FEE ROW (Cleanly displayed without the XAU box) */}
              <div className="flex justify-end items-center mt-1 h-6">
                <span className="text-[10px] text-[#555]">
                  Fee: {activeTab === 'deposit' ? '0%' : '0.10%'}
                </span>
              </div>

              {/* INPUT FIELD */}
              <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-2 focus-within:border-[#444444] transition-colors relative mt-1">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#666666] uppercase">
                  <span>Amount ({activeTab === 'deposit' ? 'XAU' : 'SGLD'})</span>
                  <div className="flex items-center gap-1.5">
                    <span>
                      Balance: {isConnected ? (activeTab === 'deposit' ? xausBalance.toFixed(2) : sgldBalance.toFixed(2)) : '0.00'}
                    </span>
                    {isConnected && (
                      <button onClick={handleMaxBalance} type="button" className="text-[9px] font-bold text-[#0037FF] hover:text-[#002CD6] transition-colors uppercase">Max</button>
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
                  <span className="text-sm font-medium text-[#888]">
                    {activeTab === 'deposit' ? 'XAU' : 'SGLD'}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
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
