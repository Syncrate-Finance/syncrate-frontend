"use client";

import { useQuery } from "@tanstack/react-query";
import type { PublicMetrics } from "@/features/metrics/types";
import styles from "./products.module.css";
import yieldStyles from "./sysgld.module.css";

export function SysgldMetrics() {
  const { data, isError, isPending } = useQuery<PublicMetrics>({
    queryKey: ["public-homepage-metrics"],
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/v1/metrics", {
        signal,
        cache: "no-store",
      });
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
  const metrics = [
    { label: "sySGLD market cap", metric: data?.sysgldMarketCap },
    { label: "Yield paid since inception (USD)", metric: data?.sysgldYieldPaidUsd },
  ];

  return (
    <section
      className={`${styles.metricSection} ${yieldStyles.metricsPanel}`}
      aria-label="sySGLD metrics"
    >
      <dl
        className={`${styles.metricGrid} ${yieldStyles.metricsGrid}`}
        aria-busy={isPending}
      >
        {metrics.map(({ label, metric }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {fresh && metric?.state === "ready" ? metric.value : "—"}
              <span>
                {isPending
                  ? "Loading"
                  : fresh && metric?.state === "ready"
                    ? label === "Yield paid since inception (USD)"
                      ? "Since inception"
                      : "USD · Updated every minute"
                    : "Not available yet"}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
