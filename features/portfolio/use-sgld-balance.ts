"use client";
import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { CHAIN_ID, CONTRACT_ADDRESSES } from "@/config/contracts";
import { readSgldSnapshot } from "./sgld-read";
import { isMintChain } from "@/config/networks";
import { RH } from "@/features/swap/robinhood-model";
export function useSgldBalance(multichain = false) {
  const account = useAccount();
  const chainId =
    multichain && isMintChain(account.chainId) ? account.chainId : CHAIN_ID;
  const networkName = chainId === 4663 ? "Robinhood" : "Base";
  const client = usePublicClient({ chainId });
  const address = account.address;
  const enabled =
    account.isConnected &&
    account.chainId === chainId &&
    Boolean(client && address);
  const query = useQuery({
    queryKey: [
      "sgld-snapshot",
      chainId,
      chainId === 4663 ? RH.engine : CONTRACT_ADDRESSES.SGLD_TOKEN,
      address?.toLowerCase(),
    ],
    queryFn: () => {
      if (!client || !address) throw new Error("Wallet unavailable");
      return readSgldSnapshot(client, address, chainId);
    },
    enabled,
    staleTime: 30000,
    refetchInterval: enabled ? 30000 : false,
    refetchOnWindowFocus: true,
    retry: 1,
    gcTime: 60000,
  });
  const snapshot =
    query.data?.address.toLowerCase() === address?.toLowerCase()
      ? query.data
      : undefined;
  const phase =
    account.status === "connecting" || account.status === "reconnecting"
      ? "connecting"
      : !account.isConnected
        ? "disconnected"
        : account.chainId !== chainId
          ? "wrong-network"
          : query.isError
            ? "error"
            : !snapshot
              ? "loading"
              : "ready";
  return {
    phase,
    networkName,
    snapshot: phase === "ready" ? snapshot : undefined,
    isConnected: account.isConnected,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
