'use client';

// FIX: Use this exact path for the CSS
import '@rainbow-me/rainbowkit/styles.css'; 

// FIX: Ensure this is the correct package import
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// 1. Configure Wagmi and RainbowKit
const config = getDefaultConfig({
  appName: 'Syncrate',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [base, baseSepolia],
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
