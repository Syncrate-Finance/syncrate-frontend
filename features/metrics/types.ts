export type PublicMetric = {
  state: "ready" | "unavailable" | "unconfigured";
  value: string | null;
};

export type PublicMetrics = {
  blockNumber: string;
  observedAt: string;
  priceUpdatedAt: string | null;
  inventory: PublicMetric;
  sgldSupply: PublicMetric;
  unallocatedBullion: PublicMetric;
  sgldMarketCap: PublicMetric;
  sysgldMarketCap: PublicMetric;
  sysgldYieldPaidUsd: PublicMetric;
};
