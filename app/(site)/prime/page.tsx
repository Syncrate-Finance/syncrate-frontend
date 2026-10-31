'use client'

import { base } from 'wagmi/chains'
import { APP_ORIGIN } from '@/config/site'
import { useState, useEffect } from 'react'
import { GeistSans } from 'geist/font/sans'
import Image from 'next/image'
import Link from 'next/link'
import { WalletButton as ConnectButton } from '@/features/wallet/button'
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { parseUnits, formatUnits } from 'viem'

// ==========================================
// 🚀 CONFIGURATIONS
// ==========================================

// ── EDITABLE METRICS ──────────────────────
const MANUAL_APY = 11 // APY percentage (%)
// ──────────────────────────────────────────

const SGLD_ADDRESS = '0x10C5E0643bCc6C915Cad0335f70A96c1532766eb' as const
const PRIME_VAULT_ADDRESS = '0xbA93Aa354a3B47A936d713b8FB90126D4d35546B' as const
const GOLD_PRICE_FEED_ADDRESS = '0x5213eBB69743b85644dbB6E25cdF994aFBb8cF31' as const

const VAULT_INCEPTION = new Date('2026-08-08T00:00:00Z').getTime()

// Standard Chainlink AggregatorV3Interface ABI
const aggregatorV3Abi = [
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const vaultAbi = [
  {
    type: 'function',
    name: 'totalAssets',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'redeem',
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
    outputs: [{ name: 'assets', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'previewRedeemNet',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

export default function AppPortal() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin" />
      </div>
    )
  }

  return <PrimeVaultAppUI />
}

// ==========================================
// COMPONENT: ACTIVE VAULT DAPP
// ==========================================
function PrimeVaultAppUI() {
  const { isConnected, address } = useAccount()

  const [inputAmount, setInputAmount] = useState('')
  const [txStatus, setTxStatus] = useState<
    'idle' | 'processing' | 'success'
  >('idle')

  // Balances
  const { refetch: refetchSgld } = useBalance({
    address,
    token: SGLD_ADDRESS,
  })
  const { data: sySgldData, refetch: refetchSySgld } = useBalance({
    address,
    token: PRIME_VAULT_ADDRESS,
  })

  const sySgldBalance = sySgldData ? parseFloat(sySgldData.formatted) : 0.0

  // ── DYNAMIC TVL & LIVE GOLD PRICE FETCHING ──
  const { data: totalAssetsData } = useReadContract({
    address: PRIME_VAULT_ADDRESS,
    abi: vaultAbi,
    functionName: 'totalAssets',
    chainId: base.id,
    query: { refetchInterval: 15000 },
  })

  const { data: roundData } = useReadContract({
    address: GOLD_PRICE_FEED_ADDRESS,
    abi: aggregatorV3Abi,
    functionName: 'latestRoundData',
    chainId: base.id,
    query: { refetchInterval: 15000 },
  })

  const goldPricePerOunce = (() => {
    if (!roundData) return null
    const answer = Array.isArray(roundData) ? roundData[1] : (roundData as any)?.answer
    if (!answer || answer <= BigInt(0)) return null
    return Number(answer) / 1e8
  })()

  const totalAssetsNum = totalAssetsData ? parseFloat(formatUnits(totalAssetsData as bigint, 18)) : 0
  const vaultTVL = goldPricePerOunce ? totalAssetsNum * goldPricePerOunce : 0

  const vaultApy = MANUAL_APY

  const daysElapsed = Math.max(
    (Date.now() - VAULT_INCEPTION) / (1000 * 60 * 60 * 24),
    1
  )
  const sharePrice = 1.0 + (vaultApy / 100) * (daysElapsed / 365)
  const vaultSupply = sharePrice > 0 ? totalAssetsNum / sharePrice : 0

  // Preview: redeem → net SGLD out (after 0.1% fee)
  let redeemSharesWei: bigint | undefined
  try {
    if (inputAmount && Number(inputAmount) > 0) {
      redeemSharesWei = parseUnits(inputAmount, sySgldData?.decimals ?? 21)
    }
  } catch {
    redeemSharesWei = undefined
  }

  const { data: previewNetAssets } = useReadContract({
    address: PRIME_VAULT_ADDRESS,
    abi: vaultAbi,
    functionName: 'previewRedeemNet',
    args: redeemSharesWei !== undefined ? [redeemSharesWei] : undefined,
    query: {
      enabled: redeemSharesWei !== undefined,
    },
  })

  const previewNetAssetsFmt =
    previewNetAssets !== undefined
      ? parseFloat(formatUnits(previewNetAssets as bigint, 18)).toFixed(4)
      : null

  const formatMetric = (value: number) => {
    if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M'
    if (value >= 1e3) return (value / 1e3).toFixed(2) + 'k'
    return value.toFixed(2)
  }

  const formatSupply = (value: number) => {
    return (
      value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + ' sySGLD'
    )
  }

  // Transactions
  const {
    data: processTxHash,
    writeContract: writeProcess,
    isPending: isProcessPending,
  } = useWriteContract()

  const { isLoading: isProcessConfirming, isSuccess: isProcessSuccess } =
    useWaitForTransactionReceipt({ hash: processTxHash })

  useEffect(() => {
    if (isProcessPending || isProcessConfirming) setTxStatus('processing')
    if (isProcessSuccess) {
      setTxStatus('success')
      refetchSgld()
      refetchSySgld()
    }
  }, [
    isProcessPending,
    isProcessConfirming,
    isProcessSuccess,
    refetchSgld,
    refetchSySgld,
  ])

  const handleMaxBalance = () => {
    setInputAmount(sySgldBalance.toString())
  }

  const handleProcess = () => {
    if (!address || !inputAmount || !sySgldData) return
    const sharesToRedeem = parseUnits(inputAmount, sySgldData.decimals)
    writeProcess({
      address: PRIME_VAULT_ADDRESS,
      abi: vaultAbi,
      functionName: 'redeem',
      args: [sharesToRedeem, address, address],
      account: address,
      chain: base,
    })
  }

  const resetFlow = () => {
    setInputAmount('')
    setTxStatus('idle')
  }

  return (
    <div
      className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col justify-between antialiased ${GeistSans.className}`}
    >
      {/* HEADER */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center border-b border-[#111111]">
        <Link className="flex items-center gap-2 group" href="/">
          <Image
            alt="Syncrate Logo"
            className="object-contain rounded-full"
            height={32}
            src="/logo.png"
            width={32}
          />
          <span className="text-xs font-mono tracking-widest text-[#666666] group-hover:text-white transition-colors hidden xs:inline">
            sySGLD
          </span>
        </Link>

        {/* CUSTOM RAINBOWKIT CONNECT BUTTON */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
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
                      )
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
                      )
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
                          <span className="text-[9px] sm:text-[10px] text-[#666666] ml-1">
                            ▼
                          </span>
                        </button>
                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all border border-[#222222] bg-[#0A0A0A] text-[#888888] hover:text-[#E5E5E5] hover:border-[#444444]"
                        >
                          {account.displayName}
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      {/* MAIN INTERFACE */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-12 gap-6">
        <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Image
              alt="Syncrate Logo"
              className="object-contain rounded-full"
              height={28}
              src="/logo.png"
              width={28}
            />
            <h1 className="text-lg font-medium text-white tracking-tight">
              sySGLD Vault
            </h1>
          </div>

          {/* METRICS HEADER */}
          <div className="grid grid-cols-4 gap-2 border-y border-[#111111] py-4 my-1">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-[#666666]">
                Vault TVL
              </span>
              <span className="text-xs sm:text-sm font-medium text-white">
                ${formatMetric(vaultTVL)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-[#666666]">
                Supply
              </span>
              <span className="text-xs sm:text-sm font-medium text-white">
                {formatSupply(vaultSupply)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-[#666666]">
                Price
              </span>
              <span className="text-xs sm:text-sm font-medium text-white">
                ${sharePrice.toFixed(4)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-[#0037FF]">
                Est. APY
              </span>
              <span className="text-xs sm:text-sm font-medium text-[#0037FF]">
                {vaultApy.toFixed(2)}%
              </span>
            </div>
          </div>

          {txStatus === 'success' ? (
            <div className="text-center py-6 flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                <span className="text-emerald-500 text-lg">✓</span>
              </div>
              <h3 className="text-base font-medium text-white mb-2">
                Transaction Successful
              </h3>
              <button
                onClick={resetFlow}
                className="w-full mt-4 py-3 bg-[#111111] text-xs font-medium rounded-lg hover:bg-[#222222] text-white transition-all border border-[#222222]"
              >
                Dismiss
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-medium text-white">Withdraw sySGLD</h2>
                <p className="mt-2 text-xs text-[#888888]">
                  Deposits are discontinued. Existing sySGLD holders can withdraw.
                </p>
              </div>

              <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-2 relative mt-1">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#666666] uppercase">
                  <span>
                    Amount (sySGLD)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>
                      Balance:{' '}
                      {isConnected
                        ? sySgldBalance.toFixed(4)
                        : '0.00'}
                    </span>
                    {isConnected && (
                      <button
                        onClick={handleMaxBalance}
                        type="button"
                        className="text-[9px] font-bold text-[#0037FF] uppercase"
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
                    disabled={txStatus !== 'idle'}
                    className="bg-transparent text-xl md:text-2xl text-white placeholder-[#333333] focus:outline-none font-sans w-full disabled:opacity-50 min-w-0"
                  />
                  <span className="text-sm font-medium text-[#888]">
                    sySGLD
                  </span>
                </div>
              </div>

              {/* Preview line */}
              {inputAmount &&
                Number(inputAmount) > 0 &&
                previewNetAssetsFmt && (
                  <div className="text-xs text-[#888888] px-1">
                    {previewNetAssetsFmt && (
                      <span>
                        You receive ≈ {previewNetAssetsFmt} SGLD{' '}
                        <span className="text-[#666666]">(after 0.1% fee)</span>
                      </span>
                    )}
                  </div>
                )}

              <div className="mt-2">
                {!isConnected ? (
                  <div className="w-full flex justify-center custom-rainbow-btn">
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="w-full py-4 bg-white text-black font-medium text-sm rounded-lg hover:bg-[#E5E5E5] transition-all shadow-md"
                        >
                          Connect Wallet to Withdraw
                        </button>
                      )}
                    </ConnectButton.Custom>
                  </div>
                ) : (
                  <button
                    onClick={handleProcess}
                    disabled={
                      !inputAmount ||
                      parseFloat(inputAmount) <= 0 ||
                      txStatus === 'processing'
                    }
                    className="w-full py-4 bg-[#0037FF] hover:bg-[#002CD6] text-white font-medium text-sm rounded-lg transition-all shadow-lg shadow-[#0037FF]/10"
                  >
                    {txStatus === 'processing'
                      ? 'Processing...'
                      : 'Withdraw to Sgld'}
                  </button>
                )}
              </div>

              {/* Mint Link */}
              <p className="text-center text-xs text-[#666666] mt-1">
                Don't hold SGLD yet?{' '}
                <a
                  href={APP_ORIGIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#888888] hover:text-white underline transition-colors font-medium"
                >
                  Mint here
                </a>
              </p>
            </div>
          )}
        </div>

        <a href={`${APP_ORIGIN}/points`} className="text-sm text-white underline">
          View Sync Points
        </a>
      </main>
    </div>
  )
}
