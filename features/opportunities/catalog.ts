export const PRIME_OPPORTUNITIES = [
  {
    id: 'prime-3',
    name: 'Prime',
    months: 3,
    status: 'upcoming',
    network: 'Base',
    depositAsset: null,
    apy: null,
    actionUrl: null,
  },
  {
    id: 'prime-6',
    name: 'Prime',
    months: 6,
    status: 'upcoming',
    network: 'Base',
    depositAsset: null,
    apy: null,
    actionUrl: null,
  },
  {
    id: 'prime-9',
    name: 'Prime',
    months: 9,
    status: 'upcoming',
    network: 'Base',
    depositAsset: null,
    apy: null,
    actionUrl: null,
  },
] as const
export type PrimeOpportunity = (typeof PRIME_OPPORTUNITIES)[number]
export type OpportunityView = 'all' | 'positions'
export function getOpportunityView(value: unknown): OpportunityView {
  return value === 'positions' ? 'positions' : 'all'
}
