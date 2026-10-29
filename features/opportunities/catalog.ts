type BaseOpportunity = {
  id: string;
  name: string;
  provider: string;
  network: "Base";
  apy: null;
};
export type StakingOpportunity = BaseOpportunity & {
  kind: "staking";
  days: 30 | 90;
  depositAsset: "SGLD";
  status: "upcoming";
  apr: null;
  actionUrl: null;
};
export type LiquidityOpportunity = BaseOpportunity & {
  kind: "liquidity";
  integration: "Saffron";
  days: 14;
  depositAsset: "SGLD/USDC";
  apr: 300;
  status: "external";
  actionUrl: typeof SAFFRON_POOL_URL;
  logo: "/saffron-logo.jpg";
};
export type EarnOpportunity = StakingOpportunity | LiquidityOpportunity;

export const SAFFRON_POOL_URL =
  "https://app.uniswap.org/explore/pools/base/0xC5963Bd6d6Cf713F0994fFd867D4d639AD45EC6E";

export const EARN_OPPORTUNITIES = [
  {
    id: "saffron-uniswap-sgld-usdc",
    kind: "liquidity",
    name: "LP on Uniswap",
    provider: "via Saffron",
    integration: "Saffron",
    days: 14,
    status: "external",
    network: "Base",
    depositAsset: "SGLD/USDC",
    apr: 300,
    apy: null,
    actionUrl: SAFFRON_POOL_URL,
    logo: "/saffron-logo.jpg",
  },
  {
    id: "sgld-staking-30d",
    kind: "staking",
    name: "SGLD Staking",
    provider: "powered by Syncrate Staking",
    days: 30,
    status: "upcoming",
    network: "Base",
    depositAsset: "SGLD",
    apy: null,
    apr: null,
    actionUrl: null,
  },
  {
    id: "sgld-staking-90d",
    kind: "staking",
    name: "SGLD Staking",
    provider: "powered by Syncrate Staking",
    days: 90,
    status: "upcoming",
    network: "Base",
    depositAsset: "SGLD",
    apy: null,
    apr: null,
    actionUrl: null,
  },
] as const satisfies readonly EarnOpportunity[];

export function opportunityLabel(offer: EarnOpportunity) {
  return offer.kind === "staking"
    ? `${offer.name} · ${offer.days} days`
    : offer.name;
}
export type OpportunityView = "all" | "positions";
export function getOpportunityView(value: unknown): OpportunityView {
  return value === "positions" ? "positions" : "all";
}
