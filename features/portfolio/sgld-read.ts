import {
  erc20Abi,
  formatUnits,
  isAddress,
  type Address,
  type PublicClient,
} from 'viem'
import { CONTRACT_ADDRESSES, CHAIN_ID } from '@/config/contracts'
export type SgldSnapshot = {
  address: Address
  balance: bigint
  decimals: number
  symbol: 'SGLD'
  blockNumber: bigint
  observedAt: number
}
export class SgldReadError extends Error {
  constructor(
    public readonly code:
      | 'wrong-network'
      | 'invalid-address'
      | 'token-unavailable'
      | 'token-unverified',
  ) {
    super(code)
    this.name = 'SgldReadError'
  }
}
type SgldReadClient = Pick<
  PublicClient,
  'getChainId' | 'getBlockNumber' | 'getBytecode' | 'readContract'
>
export async function readSgldSnapshot(
  client: SgldReadClient,
  address: Address,
): Promise<SgldSnapshot> {
  if (!isAddress(address, { strict: false }))
    throw new SgldReadError('invalid-address')
  if ((await client.getChainId()) !== CHAIN_ID)
    throw new SgldReadError('wrong-network')
  const blockNumber = await client.getBlockNumber({ cacheTime: 0 })
  const token = CONTRACT_ADDRESSES.SGLD_TOKEN
  const code = await client.getBytecode({ address: token, blockNumber })
  if (!code || code === '0x') throw new SgldReadError('token-unavailable')
  const [balance, decimals, symbol] = await Promise.all([
    client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address],
      blockNumber,
    }),
    client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: 'decimals',
      blockNumber,
    }),
    client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: 'symbol',
      blockNumber,
    }),
  ])
  if (
    symbol !== 'SGLD' ||
    decimals !== 18 ||
    balance < 0n ||
    balance > (1n << 256n) - 1n
  )
    throw new SgldReadError('token-unverified')
  return {
    address,
    balance,
    decimals,
    symbol,
    blockNumber,
    observedAt: Date.now(),
  }
}
export function formatSgldBalance(balance: bigint, decimals = 18) {
  if (
    balance < 0n ||
    decimals < 0 ||
    decimals > 36 ||
    !Number.isInteger(decimals)
  )
    throw new Error('Invalid token amount')
  const [whole, fraction = ''] = formatUnits(balance, decimals).split('.')
  const visibleFraction = fraction.slice(0, 4).replace(/0+$/, '')
  if (balance > 0n && whole === '0' && !visibleFraction) return '<0.0001'
  return (
    new Intl.NumberFormat('en-US').format(BigInt(whole)) +
    (visibleFraction ? '.' + visibleFraction : '')
  )
}
