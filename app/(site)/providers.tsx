'use client'
import '@rainbow-me/rainbowkit/styles.css'
import { useState } from 'react'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { base } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const config = projectId ? getDefaultConfig({ appName: 'Syncrate', projectId, chains: [base], ssr: true }) : createConfig({ chains: [base], connectors: [injected()], transports: { [base.id]: http() }, ssr: true })
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return <WagmiProvider config={config}><QueryClientProvider client={queryClient}><RainbowKitProvider>{children}</RainbowKitProvider></QueryClientProvider></WagmiProvider>
}
