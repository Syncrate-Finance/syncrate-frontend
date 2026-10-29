type UpcomingBaseOpportunity = {
  id: string;
  name: string;
  provider: string;
  network: "Base";
  status: "upcoming";
  apy: null;
  actionUrl: null;
};
export type StakingOpportunity = UpcomingBaseOpportunity & {
  kind: "staking";
  days: 30 | 90;
  depositAsset: "SGLD";
};
export type CreditOpportunity = UpcomingBaseOpportunity & {
  kind: "credit";
  integration: "Morpho";
  days: null;
  depositAsset: null;
};
export type EarnOpportunity = StakingOpportunity | CreditOpportunity;

export const EARN_OPPORTUNITIES = [
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
    actionUrl: null,
  },
  {
    id: "morpho-credit-upcoming",
    kind: "credit",
    name: "Lend on Morpho",
    provider: "Credit markets",
    integration: "Morpho",
    days: null,
    status: "upcoming",
    network: "Base",
    depositAsset: null,
    apy: null,
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
