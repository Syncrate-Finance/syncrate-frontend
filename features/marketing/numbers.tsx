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
        <span role="status">
          {isPending
            ? "Updating valuation…"
            : stale
              ? "Valuation update unavailable"
              : data?.sgldMarketCap.state === "ready"
                : "Valuation unavailable"}
        </span>
      </div>
      <dl className={styles.numbersGrid}>
        {metrics.map(({ label, metric, note }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {metric?.value ?? "—"}
              {label === "Total Bullion Inventory" &&
                metric?.state === "ready" && <span> troy oz</span>}
            </dd>
            <dd className={styles.metricNote}>
              {metric?.state === "unconfigured"
                ? "Contract not configured"
                : metric?.state === "unavailable" || (!metric && isError)
                  ? "Temporarily unavailable"
                  : note}
            </dd>
          </div>
        ))}
      </dl>
      {data && (
        <p className={styles.numbersTimestamp}>
          Block {data.blockNumber} ·{" "}
          <time dateTime={data.observedAt}>
            {new Date(data.observedAt).toLocaleString("en-GB", {
              timeZone: "UTC",
              hour12: false,
            })}{" "}
            UTC
          </time>
          {data.priceUpdatedAt && (
            <>
              {" "}
              · Gold quote{" "}
              <time dateTime={data.priceUpdatedAt}>
                {new Date(data.priceUpdatedAt).toLocaleString("en-GB", {
                  timeZone: "UTC",
                  hour12: false,
                })}{" "}
                UTC
              </time>
            </>
          )}
        </p>
      )}
    </section>
  );
}
