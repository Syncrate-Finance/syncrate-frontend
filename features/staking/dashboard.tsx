"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  CalendarDays,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";
import { formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import {
  BaseIcon,
  DashboardShell,
  WalletControl,
} from "@/features/dashboard/shell";
import { PortfolioCard } from "@/features/portfolio/card";
import { useSgldBalance } from "@/features/portfolio/use-sgld-balance";
import { formatSgldBalance } from "@/features/portfolio/sgld-read";
import { STAKING_TERMS, stakingAmountError, type StakingTerm } from "./model";
import { StakingMetrics } from "./metrics";
import styles from "./staking.module.css";

function StakeForm({ initialTerm }: { initialTerm: StakingTerm }) {
  const [term, setTerm] = useState(initialTerm);
  const [amount, setAmount] = useState("");
  const { phase, snapshot, isFetching, refetch } = useSgldBalance();
  const router = useRouter();
  const amountError = stakingAmountError(amount, snapshot?.balance);
  useEffect(() => setTerm(initialTerm), [initialTerm]);

  function selectTerm(next: StakingTerm) {
    setTerm(next);
    const query = new URLSearchParams(window.location.search);
    query.set("term", String(next));
    router.replace("/stake?" + query.toString(), { scroll: false });
  }

  return (
    <section className={styles.formCard} aria-labelledby="stake-form-title">
      <div className={styles.cardHeading}>
        <h2 id="stake-form-title">Stake SGLD</h2>
        <span className={styles.network}>
          <BaseIcon /> Base
        </span>
      </div>
      <p className={styles.formIntro}>
        Choose your term. Put your gold to work.
      </p>
      <form
        onSubmit={(event) => event.preventDefault()}
        aria-describedby="staking-availability"
      >
        <fieldset className={styles.terms}>
          <legend>Staking term</legend>
          <div className={styles.termOptions}>
            {STAKING_TERMS.map((days) => (
              <label
                key={days}
                className={styles.termOption}
                data-selected={term === days}
              >
                <input
                  type="radio"
                  name="staking-term"
                  value={days}
                  checked={term === days}
                  onChange={() => selectTerm(days)}
                />
                <CalendarDays size={17} aria-hidden="true" />
                <strong>{days} days</strong>
                <span>Fixed term</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.amountPanel}>
          <div className={styles.amountHeading}>
            <label htmlFor="stake-amount">You stake</label>
            <span className={styles.asset}>
              <Image src="/SGLD-icon.png" width={24} height={24} alt="" /> SGLD
            </span>
          </div>
          <input
            id="stake-amount"
            name="amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            placeholder="0.00"
            value={amount}
            maxLength={90}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={Boolean(amountError)}
            aria-describedby={
              amountError
                ? "stake-amount-error stake-balance stake-minimum"
                : "stake-balance stake-minimum"
            }
          />
          <div className={styles.balanceRow}>
            <span id="stake-balance" role="status">
              {phase === "ready" && snapshot
                ? `Available: ${formatSgldBalance(snapshot.balance, snapshot.decimals)} SGLD`
                : phase === "disconnected"
                  ? "Connect to view your balance"
                  : phase === "wrong-network"
                    ? "Switch to Base to view your balance"
                    : phase === "error"
                      ? "Balance unavailable"
                      : "Reading your balance…"}
            </span>
            <button
              type="button"
              disabled={!snapshot || isFetching}
              onClick={() =>
                snapshot &&
                setAmount(formatUnits(snapshot.balance, snapshot.decimals))
              }
            >
              Max
            </button>
          </div>
          {phase === "error" && (
            <button
              type="button"
              className={styles.retry}
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              <RefreshCw size={12} aria-hidden="true" /> Retry balance
            </button>
          )}
        </div>
        <p className={styles.minimumStake} id="stake-minimum">Minimum stake amount: 1 SGLD</p>
        {amountError && (
          <p
            id="stake-amount-error"
            className={styles.amountError}
            role="alert"
          >
            {amountError}
          </p>
        )}

        <div className={styles.exchangeArrow} aria-hidden="true">
          <ArrowDown size={17} />
        </div>
        <div className={styles.receiptPanel}>
          <div className={styles.amountHeading}>
            <span>You receive</span>
            <span className={styles.asset}>
              <Image
                src="/sySGLD-icon.png"
                width={24}
                height={24}
                alt=""
                unoptimized
              />{" "}
              sySGLD
            </span>
          </div>
          <div
            className={styles.receiptValue}
            aria-label="Receipt amount not yet quoted"
          >
            –
          </div>
          <p></p>
        </div>
        <dl className={styles.summary}>
          <div>
            <dt>Staking term</dt>
            <dd>{term} days</dd>
          </div>
          <div>
            <dt>APY</dt>
            <dd>–</dd>
          </div>
        </dl>
        <div className={styles.availability} id="staking-availability">
          <LockKeyhole size={15} aria-hidden="true" />
          <p>
            Staking is coming soon.Deposits are not yet open.
          </p>
        </div>
        <Button type="submit" disabled className={styles.stakeButton}>
          Staking coming soon
        </Button>
        {(phase === "disconnected" || phase === "wrong-network") && (
          <div className={styles.connect}>
            <WalletControl compact />
          </div>
        )}
      </form>
    </section>
  );
}

export function StakingDashboard({
  initialTerm,
}: {
  initialTerm: StakingTerm;
}) {
  return (
    <DashboardShell active="stake">
      <main className={styles.main} id="main-content">
        <header className={styles.pageHeading}>
          <div>
            <h1>Stake your gold.</h1>
          </div>
        </header>
        <div className={styles.layout}>
          <div className={styles.portfolio}>
            <PortfolioCard asset="sysgld" showEarnings={false} />
          </div>
          <div className={styles.formColumn}>
            <StakeForm initialTerm={initialTerm} />
          </div>
          <div className={styles.information}>
            <StakingMetrics />
            <section
              className={styles.positions}
              aria-labelledby="staking-positions-heading"
            >
              <h2 id="staking-positions-heading">Your staking positions</h2>
              <div className={styles.emptyPositions}>
                <LockKeyhole size={20} aria-hidden="true" />
                <p>Your staking positions will appear here.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
