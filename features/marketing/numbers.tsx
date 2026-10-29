"use client";
import { useQuery } from "@tanstack/react-query";
import type { PublicMetrics } from "@/features/metrics/types";
import styles from "./marketing.module.css";

export function HomepageNumbers() {
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
  const stale =
    isError || (data && Date.now() - Date.parse(data.observedAt) > 120_000);
  const metrics = [
    {
      label: "Total Bullion Inventory",
      metric: { state: "ready", value: "193" },
    },
    {
      label: "SGLD Marketcap",
      metric: data?.sgldMarketCap,
    },
    {
      label: "sySGLD Marketcap",
      metric: data?.sysgldMarketCap ?? { state: "unconfigured", value: null },
    },
  ];
  return (
    <section className={styles.numbers} aria-labelledby="numbers-heading">
      <div className={styles.numbersHeading}>
        <h3 id="numbers-heading">The Numbers</h3>
      </div>
      <dl className={styles.numbersGrid} aria-busy={isPending}>
        {metrics.map(({ label, metric }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {label === "Total Bullion Inventory"
                ? metric?.value
                : !stale && metric?.state === "ready"
                  ? metric.value
                  : "—"}
              {label === "Total Bullion Inventory" &&
                metric?.state === "ready" && <span> troy oz</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
