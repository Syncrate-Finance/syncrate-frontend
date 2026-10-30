"use client";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { walletModal } from "./modal";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
type Controls = {
  mounted: boolean;
  account: { address: string; displayName: string } | undefined;
  chain:
    | {
        id: number;
        name: string;
        unsupported: boolean;
        hasIcon: false;
        iconUrl?: string;
      }
    | undefined;
  openConnectModal: () => void;
  openAccountModal: () => void;
  openChainModal: () => void;
};

/** Keep the existing styled triggers; every trigger opens the same Reown modal. */
function WalletControls({
  children,
}: {
  children: (controls: Controls) => ReactNode;
}) {
  const wallet = useAccount();
  const mounted = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );
  const [unavailable, setUnavailable] = useState(false);
  const address = mounted && wallet.isConnected ? wallet.address : undefined;
  function open(view: "Connect" | "Account" | "Networks") {
    if (!walletModal) {
      setUnavailable(true);
      return;
    }
    void walletModal.open({ view }).catch(() => setUnavailable(true));
  }
  return (
    <>
      {children({
        mounted,
        account: address
          ? {
              address,
              displayName: `${address.slice(0, 6)}…${address.slice(-4)}`,
            }
          : undefined,
        chain:
          address && wallet.chainId
            ? {
                id: wallet.chainId,
                name: wallet.chain?.name ?? `Chain ${wallet.chainId}`,
                unsupported: wallet.chainId !== 8453,
                hasIcon: false,
              }
            : undefined,
        openConnectModal: () => open("Connect"),
        openAccountModal: () => open("Account"),
        openChainModal: () => open("Networks"),
      })}
      <Dialog open={unavailable} onOpenChange={setUnavailable}>
        <DialogContent>
          <DialogTitle>Wallet connection unavailable</DialogTitle>
          <DialogDescription>
            We can’t open wallet connections right now. Please try again later.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
function DefaultWalletButton() {
  return (
    <WalletControls>
      {({
        account,
        chain,
        mounted,
        openConnectModal,
        openAccountModal,
        openChainModal,
      }) => (
        <Button
          type="button"
          variant="gold"
          disabled={!mounted}
          onClick={
            account
              ? chain?.unsupported
                ? openChainModal
                : openAccountModal
              : openConnectModal
          }
        >
          {account
            ? chain?.unsupported
              ? "Switch to Base"
              : account.displayName
            : "Connect Wallet"}
        </Button>
      )}
    </WalletControls>
  );
}
export const WalletButton = Object.assign(DefaultWalletButton, {
  Custom: WalletControls,
});
