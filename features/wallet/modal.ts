"use client";
import { createAppKit } from "@reown/appkit/react";
import { APP_ORIGIN } from "@/config/site";
import { walletAdapter, walletNetworks, walletProjectId } from "./config";

// One modal and one Wagmi configuration for overview, points and retained tools.
// Reown initializes the mobile wallet list, QR pairing and wallet deep links.
export const walletModal =
  walletProjectId && walletAdapter
    ? createAppKit({
        adapters: [walletAdapter],
        networks: walletNetworks,
        defaultNetwork: walletNetworks[0],
        projectId: walletProjectId,
        metadata: {
          name: "Syncrate",
          description: "SGLD on Base",
          url:
            typeof window === "undefined" ? APP_ORIGIN : window.location.origin,
          icons: [APP_ORIGIN + "/logo2.png"],
        },
        themeMode: "light",
        themeVariables: {
          "--w3m-accent": "#142D63",
          "--w3m-font-family": "Arial, sans-serif",
          "--w3m-z-index": 200,
        },
        defaultAccountTypes: { eip155: "eoa" },
        enableWallets: true,
        enableWalletConnect: true,
        enableMobileFullScreen: true,
        features: {
          email: false,
          socials: false,
          analytics: false,
          swaps: false,
          onramp: false,
          send: false,
          receive: false,
          history: false,
        },
      })
    : undefined;
