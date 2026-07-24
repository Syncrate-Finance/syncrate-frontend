'use client'

import { useState, useEffect } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits, keccak256, stringToBytes } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'

// Base Mainnet Contract Address
const SYNCRATE_ENGINE_ADDRESS = '0xA6053c69043C370c4033F89c5Fceb21019b305D5' 

// Compute standard keccak256 hash for RESERVE_MANAGER_ROLE
const RESERVE_MANAGER_ROLE = keccak256(stringToBytes('RESERVE_MANAGER_ROLE'))

const engineAbi = [
  { type: 'function', name: 'reserveCap', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'updateReserveCap', inputs: [{ name: 'newReserveCap', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'hasRole', inputs: [{ name: 'role', type: 'bytes32' }, { name: 'account', type: 'address' }], outputs: [{ type: 'bool' }] }
] as const

export default function AdminDashboard() {
  const { address, isConnected } = useAccount()
  const [newCap, setNewCap] = useState('')

  // --- READ: Current Cap from Contract ---
  const { data: currentCapData, refetch: refetchCap } = useReadContract({
    address: SYNCRATE_ENGINE_ADDRESS as `0x${string}`,
    abi: engineAbi,
    functionName: 'reserveCap',
  })

  // --- READ: Check if Connected Wallet has RESERVE_MANAGER_ROLE ---
  const { data: isReserveManager, isLoading: isRoleChecking } = useReadContract({
    address: SYNCRATE_ENGINE_ADDRESS as `0x${string}`,
    abi: engineAbi,
    functionName: 'hasRole',
    args: [RESERVE_MANAGER_ROLE, address as `0x${string}`],
    query: {
      enabled: Boolean(isConnected && address), // Only run if wallet is connected
    }
  })

  const currentCap = currentCapData ? parseFloat(formatUnits(currentCapData as bigint, 18)) : 0

  // --- WRITE: Update Cap ---
  const { data: txHash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  useEffect(() => {
    if (isConfirmed) {
      setNewCap('')
      refetchCap()
    }
  }, [isConfirmed, refetchCap])

  const handleUpdateCap = () => {
    if (!newCap || isNaN(Number(newCap))) return

    const parsedCap = parseUnits(newCap, 18)

    writeContract({
      address: SYNCRATE_ENGINE_ADDRESS as `0x${string}`,
      abi: engineAbi,
      functionName: 'updateReserveCap',
      args: [parsedCap],
    } as any)
  }

  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] p-6 flex flex-col items-center justify-center antialiased ${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#111111] rounded-2xl p-6 shadow-xl flex flex-col gap-6">
        
        <div>
          <h1 className="text-lg font-medium text-white tracking-tight">Syncrate Control Panel</h1>
          <p className="text-xs text-[#666666] font-mono mt-1">ROLE: RESERVE_MANAGER_ROLE</p>
        </div>

        <div className="border-y border-[#111111] py-4 flex justify-between items-center">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono uppercase text-[#666666]">Active Reserve Cap</span>
            <span className="text-xl font-medium text-white font-mono">
              {currentCap.toLocaleString(undefined, { minimumFractionDigits: 2 })} XAUs
            </span>
          </div>
        </div>

        {!isConnected ? (
          <div className="flex flex-col items-center py-4">
            <ConnectButton />
          </div>
        ) : isRoleChecking ? (
          /* Loading State while checking on-chain role */
          <div className="flex items-center justify-center py-6 gap-2 text-xs text-[#666666] font-mono">
            <span className="w-4 h-4 border-2 border-t-transparent border-[#666666] rounded-full animate-spin" />
            Verifying Reserve Manager Permissions...
          </div>
        ) : !isReserveManager ? (
          /* Access Denied Card for Non-Admin Wallets */
          <div className="bg-[#110505] border border-[#331111] rounded-xl p-4 flex flex-col items-center text-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#220A0A] text-[#FF4D4D] flex items-center justify-center text-xs font-mono font-bold">
              ✕
            </div>
            <div>
              <p className="text-sm font-medium text-[#FF6B6B]">Unauthorized Wallet</p>
              <p className="text-xs text-[#884444] mt-1 font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)} does not have RESERVE_MANAGER_ROLE.
              </p>
            </div>
            <ConnectButton showBalance={false} />
          </div>
        ) : (
          /* Authorized Manager Input Form */
          <div className="flex flex-col gap-4">
            <div className="bg-[#030303] border border-[#222222] rounded-xl p-4 flex flex-col gap-2 focus-within:border-[#444444] transition-colors">
              <label className="text-[10px] font-mono tracking-wider text-[#666666] uppercase">
                New Target Cap Amount
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="e.g. 5000000"
                  value={newCap}
                  onChange={(e) => setNewCap(e.target.value)}
                  disabled={isPending || isConfirming}
                  className="bg-transparent text-lg text-white placeholder-[#333333] focus:outline-none font-mono w-full"
                />
                <span className="text-xs font-mono text-[#444444]">XAUs</span>
              </div>
            </div>

            <button 
              onClick={handleUpdateCap}
              disabled={!newCap || isPending || isConfirming}
              className="w-full py-4 bg-white text-[#030303] hover:bg-[#E5E5E5] font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30"
            >
              {isPending || isConfirming ? (
                <>
                  <span className="w-4 h-4 border-2 border-t-transparent border-[#030303] rounded-full animate-spin" />
                  Broadcasting Change...
                </>
              ) : (
                'Push Cap Update'
              )} 
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
