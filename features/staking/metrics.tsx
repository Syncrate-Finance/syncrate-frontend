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
    <section className={styles.metricsPanel} aria-label="sySGLD performance">
      <dl className={styles.metricsGrid} aria-busy={isPending}>
        <div>
          <dt>Market cap</dt>
          <dd>
            {marketCap ?? "—"}
            <span>{marketCap ? "Updated every minute" : isPending ? "Loading" : "Not available yet"}</span>
          </dd>
        </div>
      </dl>
      <figure className={styles.apyChart}>
        <figcaption>Historical APY · 30 days</figcaption>
        <div
          className={styles.chartPlot}
          role="img"
          aria-label="Historical APY chart for the past 30 days. No APY history is available yet."
        >
          <span>No APY history yet</span>
        </div>
        <div className={styles.chartAxis} aria-hidden="true">
          <span>30 days ago</span><span>Today</span>
        </div>
      </figure>
    </section>
  );
}
