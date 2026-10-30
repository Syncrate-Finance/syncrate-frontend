"use client";
import { useQuery } from "@tanstack/react-query";
import type { PublicMetrics } from "@/features/metrics/types";
import styles from "./products.module.css";
export function SgldMetrics() {
  const { data, isError, isPending } = useQuery<PublicMetrics>({
    queryKey: ["public-homepage-metrics"],
    queryFn: async ({ signal }) => {
      const r = await fetch("/api/v1/metrics", { signal, cache: "no-store" });
      if (!r.ok) throw Error("Metrics unavailable");
      return r.json();
    },
    staleTime: 30000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    retry: 1,
  });
  const stale =
    isError || (!!data && Date.now() - Date.parse(data.observedAt) > 120000);
  const metrics = [
    { label: "SGLD Market Cap", metric: data?.sgldMarketCap, unit: "" },
    {
      label: "Bullion Weight",
      metric: { state: "ready", value: "193" },
      unit: "troy oz",
    },
    { label: "Circulating Supply", metric: data?.sgldSupply, unit: "SGLD" },
    {
      label: "Unallocated Bullion",
      metric: data?.unallocatedBullion,
      unit: "troy oz",
    },
  ];
  return (
    <section className={styles.metricSection} aria-label="SGLD metrics">
      <dl className={styles.metricGrid} aria-busy={isPending}>
        {metrics.map(({ label, metric, unit }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {(!stale || label === "Bullion Weight") &&
              metric?.state === "ready" ? (
                <>
                  {metric.value}
                  {unit && <span>{unit}</span>}
                </>
              ) : (
                "—"
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className={styles.metricContext}>
        Bullion weight is the reported inventory of 193 troy oz. Supply is read
        from Base; unallocated bullion is the difference between reported
        inventory and supply.
      </p>
    </section>
  );
}
