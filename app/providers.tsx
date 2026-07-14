'use client';

// FIX: Use this exact path for the CSS
import '@rainbow-me/rainbowkit/styles.css'; 

// FIX: Ensure this is the correct package import
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { defineChain } from 'viem';

// --- ROBINHOOD CHAIN DEFINITIONS ---

// Define Robinhood Chain Mainnet (Chain ID: 4663)
export const robinhoodChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.chain.robinhood.com'],
    },
    public: {
      http: ['https://rpc.mainnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Blockscout', 
      url: 'https://robinhoodchain.blockscout.com' 
    },
  },
});

// Define Robinhood Chain Testnet (Chain ID: 46630)
export const robinhoodTestnet = defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.chain.robinhood.com'],
    },
    public: {
      http: ['https://rpc.testnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Blockscout Testnet', 
      url: 'https://explorer.testnet.chain.robinhood.com' 
    },
  },
});

// 1. Configure Wagmi and RainbowKit
const config = getDefaultConfig({
  appName: 'Syncrate',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  // Added Robinhood networks alongside Base!
  chains: [base, baseSepolia, robinhoodChain, robinhoodTestnet], 
  ssr: true, // Required for Next.js
});

// 2. Set up React Query client
const queryClient = new QueryClient();

// 3. Create the Provider wrapper component
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
