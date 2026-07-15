'use client'

import { useState } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Image from 'next/image'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

interface AssetAllocation {
  symbol: string;
  name: string;
  logo: string;
  allocation: string;
  value: string;
}

interface Vault {
  id: string;
  name: string;
  ticker: string;
  apy: string;
  curator: string;
  curatorLogo: string;
  totalDeposits: string;
  liquidity: string;
  network: string;
  networkLogo: string;
  assets: AssetAllocation[];
}

const VAULTS_DATA: Vault[] = [
  {
    id: 'bluechip',
    name: 'Syncrate BlueChip Main',
    ticker: 'sxBC',
    apy: '8.42%',
    curator: 'Syncrate Labs',
    curatorLogo: '/logo.jpg',
    totalDeposits: '$12.45M USDC',
    liquidity: '$4.12M USDC',
    network: 'Base',
    networkLogo: '/base-logo.png', // Add your base asset path
    assets: [
      { symbol: 'cbBTC', name: 'Coinbase Wrapped BTC', logo: '/cbbtc-icon.png', allocation: '35%', value: '$4.35M' },
      { symbol: 'WETH', name: 'Wrapped Ether', logo: '/weth-icon.png', allocation: '35%', value: '$4.35M' },
      { symbol: 'wSOL', name: 'Wrapped Solana', logo: '/wsol-icon.png', allocation: '15%', value: '$1.86M' },
      { symbol: 'LINK', name: 'Chainlink', logo: '/link-icon.png', allocation: '15%', value: '$1.86M' }
    ]
  },
  {
    id: 'meme',
    name: 'Syncrate High Yield Prime',
    ticker: 'sxM',
    apy: '42.18%',
    curator: 'Syncrate Alpha',
    curatorLogo: '/logo.jpg',
    totalDeposits: '$4.89M USDC',
    liquidity: '$950.2K USDC',
    network: 'Base',
    networkLogo: '/base-logo.png',
    assets: [
      { symbol: 'DEGEN', name: 'Degen Token', logo: '/degen-icon.png', allocation: '40%', value: '$1.95M' },
      { symbol: 'BRETT', name: 'Brett', logo: '/brett-icon.png', allocation: '30%', value: '$1.46M' },
      { symbol: 'AERO', name: 'Aerodrome', logo: '/aero-icon.png', allocation: '20%', value: '$978K' },
      { symbol: 'COIN', name: 'Coin Meme', logo: '/coin-icon.png', allocation: '10%', value: '$489K' }
    ]
  },
  {
    id: 'conservative',
    name: 'Syncrate Conservative',
    ticker: 'sxC',
    apy: '5.25%',
    curator: 'Syncrate Treasury',
    curatorLogo: '/logo.jpg',
    totalDeposits: '$24.10M USDC',
    liquidity: '$18.40M USDC',
    network: 'Base',
    networkLogo: '/base-logo.png',
    assets: [
      { symbol: 'USDY', name: 'Ondo US Dollar Yield', logo: '/usdy-icon.png', allocation: '50%', value: '$12.05M' },
      { symbol: 'fUSDC', name: 'Fluid USDC', logo: '/usdc-icon.png', allocation: '30%', value: '$7.23M' },
      { symbol: 'tbills', name: 'Tokenized US T-Bills', logo: '/tbill-icon.png', allocation: '20%', value: '$4.82M' }
    ]
  }
]

export default function VaultsPage() {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'vaults' | 'markets' | 'portfolio'>('vaults')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  return (
    <div className={`min-h-screen bg-[#030303] text-[#F5F5F5] flex flex-col justify-between antialiased ${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif' }}>
      
      {/* --- HEADER --- */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center border-b border-[#111111]">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.jpg" alt="Syncrate Logo" width={32} height={32} className="object-contain rounded-full" />
          <span className="text-xs font-mono tracking-widest text-[#666666] group-hover:text-white transition-colors">SYNCRATE</span>
        </Link>
        <ConnectButton />
      </header>

      {/* --- MAIN PORTAL --- */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-6">
        
        {/* Navigation Tabs (Morpho Style) */}
        <div className="grid grid-cols-3 bg-[#0A0A0A] border border-[#111111] p-1 rounded-xl w-full">
          {(['vaults', 'markets', 'portfolio'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 text-xs font-medium rounded-lg capitalize transition-all ${
                activeTab === tab ? 'bg-[#161616] text-white' : 'text-[#666666] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between text-xs text-[#666666] font-mono px-1">
          <div className="flex items-center gap-2">
            <span>Network:</span>
            <span className="text-white bg-[#0A0A0A] border border-[#111111] px-2 py-1 rounded">Base</span>
          </div>
          <span>Sort by Deposits ↓</span>
        </div>

        {/* VAULT CARDS CONTAINER */}
        <div className="flex flex-col gap-4">
          {VAULTS_DATA.map((vault) => (
            <div 
              key={vault.id} 
              className="bg-[#0A0A0A] border border-[#111111] rounded-2xl p-6 flex flex-col gap-5 hover:border-[#1F1F1F] transition-all relative"
            >
              {/* Vault Title, Ticker Badge & APY */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base text-white">{vault.name}</span>
                    <span className="text-[10px] bg-[#161616] text-[#888888] font-mono px-1.5 py-0.5 rounded border border-[#222222]">
                      {vault.ticker}
                    </span>
                  </div>
                  <span className="text-xs text-[#666666] font-mono">Curated by {vault.curator}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-emerald-400 font-mono">{vault.apy}</span>
                  <span className="block text-[10px] text-[#666666] uppercase font-mono tracking-wider">Net APY</span>
                </div>
              </div>

              <div className="h-[1px] bg-[#111111] w-full" />

              {/* Data Table Parameters */}
              <div className="flex flex-col gap-3 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-[#666666]">Total Deposits</span>
                  <span className="text-white">{vault.totalDeposits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#666666]">Liquidity Available</span>
                  <span className="text-white">{vault.liquidity}</span>
                </div>

                {/* Exposure / Asset Basket Selection */}
                <div className="flex justify-between items-center relative py-1">
                  <span className="text-[#666666]">Asset Exposure</span>
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === vault.id ? null : vault.id)}
                      className="flex items-center -space-x-1.5 bg-[#111111] hover:bg-[#161616] p-1.5 rounded-lg border border-[#222222] transition-colors"
                    >
                      {vault.assets.map((asset, i) => (
                        <div 
                          key={asset.symbol} 
                          className="w-5 h-5 rounded-full border border-[#0A0A0A] bg-[#222222] flex items-center justify-center text-[8px] font-bold text-white relative overflow-hidden"
                          style={{ zIndex: 10 - i }}
                        >
                          {asset.symbol.substring(0, 2)}
                        </div>
                      ))}
                      <span className="text-[10px] text-[#888888] ml-2 pr-1 font-mono">▼</span>
                    </button>

                    {/* Morpho-style Interactive Allocation Breakdown Popover */}
                    {openDropdownId === vault.id && (
                      <div className="absolute right-0 bottom-8 w-64 bg-[#111111] border border-[#222222] rounded-xl p-4 flex flex-col gap-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="text-[10px] font-mono text-[#666666] uppercase border-b border-[#222222] pb-2">
                          Allocation Breakdown
                        </div>
                        <div className="flex flex-col gap-2.5">
                          {vault.assets.map((asset) => (
                            <div key={asset.symbol} className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center text-[7px] font-mono font-bold">
                                  {asset.symbol.substring(0, 2)}
                                </div>
                                <span className="text-white font-medium">{asset.symbol}</span>
                              </div>
                              <div className="text-right font-mono">
                                <span className="text-white text-xs">{asset.allocation}</span>
                                <span className="block text-[9px] text-[#666666]">{asset.value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                className="w-full py-3 bg-[#111111] hover:bg-white hover:text-black border border-[#222222] text-white font-medium text-xs rounded-xl transition-all font-sans"
              >
                {isConnected ? 'Deposit Funds' : 'Connect Wallet to Deposit'}
              </button>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
