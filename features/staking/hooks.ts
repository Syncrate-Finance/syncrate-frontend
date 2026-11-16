"use client";
import { useAccount, usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { readStakingSnapshot } from "./read";
export function useStakingSnapshot() {
  const wallet = useAccount();
  const client = usePublicClient({ chainId: 8453 });
  const account =
    wallet.isConnected && wallet.chainId === 8453 ? wallet.address : undefined;
  const query = useQuery({
    queryKey: ["staking", "snapshot", account?.toLowerCase()],
    queryFn: () => readStakingSnapshot(client!, account!),
    enabled: !!account && !!client,
    staleTime: 10000,
    refetchInterval: 15000,
    retry: 1,
  });
  return {
    wallet,
    client,
    query,
    snapshot:
      query.data?.account.toLowerCase() === account?.toLowerCase()
        ? query.data
        : undefined,
  };
}
