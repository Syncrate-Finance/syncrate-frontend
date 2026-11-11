"use client";
import { ArrowUpRight, CircleHelp, RefreshCw } from "lucide-react";
import { formatUnits } from "viem";
import { APP_ORIGIN } from "@/config/site";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useSgldBalance } from "./use-sgld-balance";
import { formatSgldBalance } from "./sgld-read";
import styles from "@/features/dashboard/dashboard.module.css";
function Help({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={styles.helpButton}
          aria-label={`About ${label}`}
        >
          <CircleHelp size={12} />
        </button>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}
function PortfolioBalanceCard() {
  const { phase, snapshot, isFetching, refetch } = useSgldBalance();
  const balance = snapshot
    ? formatSgldBalance(snapshot.balance, snapshot.decimals)
    : "–";
  return (
    <section
      className={styles.portfolioCard}
      aria-labelledby="portfolio-heading"
    >
      <div className={styles.portfolioHeading}>
        <h2 id="portfolio-heading">Your portfolio</h2>
      </div>
      <div
        className={styles.portfolioValue}
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          className={styles.balance}
          title={
            snapshot
              ? `${formatUnits(snapshot.balance, snapshot.decimals)} SGLD`
              : undefined
          }
        >
          {balance}
        </span>
        {snapshot && <span className={styles.balanceUnit}>SGLD</span>}
        <Help label="portfolio balance">
          {snapshot
            ? `Your SGLD balance on Base, read at block ${snapshot.blockNumber.toLocaleString("en-US")}. Dollar valuation is not available yet.`
            : "Connect a wallet on Base to read its SGLD balance. Portfolio reads require no signature. Minting and redemption require separate wallet confirmations."}
        </Help>
      </div>
      <div className={styles.portfolioStatus} role="status">
        {phase === "disconnected" &&
          "Connect your wallet to view your holdings."}
        {phase === "connecting" && "Connecting to your wallet…"}
        {phase === "wrong-network" &&
          "Switch your wallet to Base to view SGLD."}
        {phase === "loading" && "Reading your SGLD balance…"}
        {phase === "error" && (
          <>
            <span>Balance unavailable.</span>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className={styles.retryButton}
            >
              <RefreshCw size={12} /> {isFetching ? "Retrying…" : "Try again"}
            </button>
          </>
        )}
        {phase === "ready" && (
          <>
            <span className={styles.liveDot} />
            {isFetching ? "Updating balance…" : "SGLD balance on Base"}
          </>
        )}
      </div>
      <dl className={styles.metrics}>
        <div>
          <dt>
            Total earned{" "}
            <a
              href={APP_ORIGIN + "/points"}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.pointsLink}
              aria-label="Earn Points (opens in a new tab)"
            >
              Earn SYNC Points <ArrowUpRight size={12} aria-hidden="true" />
            </a>
          </dt>
          <dd>–</dd>
        </div>
      </dl>
    </section>
  );
}

export function PortfolioCard() {
  return (
    <TooltipProvider delayDuration={250}>
      <PortfolioBalanceCard />
    </TooltipProvider>
  );
}
