'use client'

import { useState, useEffect } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'

// Base Mainnet Contract Address
const SYNCRATE_ENGINE_ADDRESS = '0x0000000000000000000000000000000000000000' // Your Engine Address

const engineAbi = [
  { type: 'function', name: 'reserveCap', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'updateReserveCap', inputs: [{ name: 'newReserveCap', type: 'uint256' }], outputs: [] }
] as const

export default function AdminDashboard() {
  const { isConnected } = useAccount()
  const [newCap, setNewCap] = useState('')

  // --- READ: Current Cap from Contract ---
  const { data: currentCapData, refetch: refetchCap } = useReadContract({
    address: SYNCRATE_ENGINE_ADDRESS as `0x${string}`,
    abi: engineAbi,
    functionName: 'reserveCap',
  })

  // Format the BigInt contract value back to readable numbers (assuming 18 decimals)
  const currentCap = currentCapData ? parseFloat(formatUnits(currentCapData as bigint, 18)) : 0

    // --- WRITE: Update Cap ---
  const { data: txHash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Handle the success state with a side-effect
  useEffect(() => {
    if (isConfirmed) {
      setNewCap('')
      refetchCap() // Instantly refresh the UI metric on success
    }
  }, [isConfirmed, refetchCap])

  const handleUpdateCap = () => {
    if (!newCap || isNaN(Number(newCap))) return
    
    // Format input string to 18-decimal BigInt for execution
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
        ) : (
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
