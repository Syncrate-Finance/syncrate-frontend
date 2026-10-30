"use client";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { walletConfig } from "@/features/wallet/config";
import "@/features/wallet/modal";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={walletConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
