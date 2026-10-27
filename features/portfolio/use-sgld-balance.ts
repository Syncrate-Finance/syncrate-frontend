'use client'
import { useQuery } from '@tanstack/react-query'
import { useAccount, usePublicClient } from 'wagmi'
import { CHAIN_ID, CONTRACT_ADDRESSES } from '@/config/contracts'
import { readSgldSnapshot } from './sgld-read'
export function useSgldBalance() {
  const account = useAccount()
  const client = usePublicClient({ chainId: CHAIN_ID })
  const address = account.address
  const enabled =
    account.isConnected &&
    account.chainId === CHAIN_ID &&
    Boolean(client && address)
  const query = useQuery({
    queryKey: [
      'sgld-snapshot',
      CHAIN_ID,
      CONTRACT_ADDRESSES.SGLD_TOKEN,
      address?.toLowerCase(),
    ],
    queryFn: () => {
      if (!client || !address) throw new Error('Wallet unavailable')
      return readSgldSnapshot(client, address)
    },
    enabled,
    staleTime: 30000,
    refetchInterval: enabled ? 30000 : false,
    refetchOnWindowFocus: true,
    retry: 1,
    gcTime: 60000,
  })
  const snapshot =
    query.data?.address.toLowerCase() === address?.toLowerCase()
      ? query.data
      : undefined
  const phase =
    account.status === 'connecting' || account.status === 'reconnecting'
      ? 'connecting'
      : !account.isConnected
        ? 'disconnected'
        : account.chainId !== CHAIN_ID
          ? 'wrong-network'
          : query.isError
            ? 'error'
            : !snapshot
              ? 'loading'
              : 'ready'
  return {
    phase,
    snapshot: phase === 'ready' ? snapshot : undefined,
    isConnected: account.isConnected,
    isFetching: query.isFetching,
    refetch: query.refetch,
  }
}
