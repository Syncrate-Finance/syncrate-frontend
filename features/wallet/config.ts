import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { base } from "@reown/appkit/networks";
import { readWalletProjectId } from "./settings";

// This is a public application identifier, never a wallet key or RPC credential.
export const walletProjectId = readWalletProjectId(
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
);
export const walletNetworks = [base] as [typeof base];
export const walletAdapter = walletProjectId
  ? new WagmiAdapter({
      projectId: walletProjectId,
      networks: walletNetworks,
      ssr: true,
      transports: { [base.id]: http(base.rpcUrls.default.http[0]) },
    })
  : undefined;

// Public pages and read-only queries still render when onboarding is unconfigured.
// The connection button reports availability instead of showing an empty picker.
export const walletConfig =
  walletAdapter?.wagmiConfig ??
  createConfig({
    chains: [base],
    connectors: [injected()],
    transports: { [base.id]: http(base.rpcUrls.default.http[0]) },
    ssr: true,
  });
