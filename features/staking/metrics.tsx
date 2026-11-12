"use client";

import { useQuery } from "@tanstack/react-query";
import type { PublicMetrics } from "@/features/metrics/types";
import styles from "./staking.module.css";

export function StakingMetrics() {
  const { data, isError, isPending } = useQuery<PublicMetrics>({
    queryKey: ["public-homepage-metrics"],
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/v1/metrics", { signal, cache: "no-store" });
      if (!response.ok) throw new Error("Metrics unavailable");
      return response.json();
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    retry: 1,
  });
  const age = data ? Date.now() - Date.parse(data.observedAt) : NaN;
  const fresh = !isError && age >= 0 && age <= 120_000;
  const marketCap = fresh && data?.sysgldMarketCap.state === "ready"
    ? data.sysgldMarketCap.value
    : null;

  return (
    <section className={styles.explainer} aria-labelledby="sysgld-metrics-heading">
      <h2 id="sysgld-metrics-heading">sySGLD metrics</h2>
      <dl className={styles.metricsGrid} aria-busy={isPending}>
        <div>
          <dt>Market cap</dt>
          <dd>{marketCap ?? "—"}</dd>
          <p>{marketCap ? "Updated every minute" : isPending ? "Loading" : "Not available yet"}</p>
        </div>
        <div>
          <dt>Historical APY · 30 days</dt>
          <dd>—</dd>
          <p>Not available yet</p>
        </div>
      </dl>
    </section>
  );
}
