export type PublicMetric = {
  state: "ready" | "unavailable" | "unconfigured";
  value: string | null;
};

export type PublicMetrics = {
  blockNumber: string;
  observedAt: string;
  priceUpdatedAt: string | null;
  inventory: PublicMetric;
  sgldMarketCap: PublicMetric;
  sysgldMarketCap: PublicMetric;
};
