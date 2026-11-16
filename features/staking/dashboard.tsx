"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowDown, CalendarDays, LockKeyhole, RefreshCw } from "lucide-react";
import { formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import {
  BaseIcon,
  DashboardShell,
  WalletControl,
} from "@/features/dashboard/shell";
import { PortfolioCard } from "@/features/portfolio/card";
import { useStakingSnapshot } from "./hooks";
import { InviteGate, InviteIssuer, useStakingAccess } from "./access";
import { useStakingTransactions } from "./use-transactions";
import { StakingTransactionStatus } from "./transaction-status";
import { StakingPositions } from "./positions";
import { depositQuote, type StakeAction } from "./transactions";
import { parseAmount } from "@/features/swap/model";
import { formatSgldBalance } from "@/features/portfolio/sgld-read";
import { STAKING_TERMS, stakingAmountError, type StakingTerm } from "./model";
import { StakingMetrics } from "./metrics";
import styles from "./staking.module.css";

function StakeForm({
  initialTerm,
  request,
  busy,
}: {
  initialTerm: StakingTerm;
  request: (a: StakeAction) => void;
  busy: boolean;
}) {
  const [term, setTerm] = useState(initialTerm);
  const [amount, setAmount] = useState("");
  const { wallet, snapshot, query } = useStakingSnapshot();
  const isFetching = query.isFetching;
  const refetch = query.refetch;
  const phase = !wallet.isConnected
    ? "disconnected"
    : wallet.chainId !== 8453
      ? "wrong-network"
      : query.isError
        ? "error"
        : snapshot
          ? "ready"
          : "loading";
  let parsed: bigint | undefined;
  try {
    if (amount) parsed = parseAmount(amount, 18);
  } catch {
    /* Validation below explains invalid amounts. */
  }
  const quote = parsed ? depositQuote(parsed) : undefined;
  const nextAction =
    snapshot && parsed && snapshot.allowance < parsed
      ? snapshot.allowance > 0n
        ? "reset"
        : "approve"
      : "stake";
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
        onSubmit={(event) => {
          event.preventDefault();
          if (parsed && snapshot && !snapshot.paused && !amountError)
            request({ kind: nextAction, amount: parsed, term });
        }}
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
                ? `Available: ${formatSgldBalance(snapshot.balance, 18)} SGLD`
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
                snapshot && setAmount(formatUnits(snapshot.balance, 18))
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
        <p className={styles.minimumStake} id="stake-minimum">
          Minimum stake: 1 SGLD
        </p>
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
            aria-label="sySGLD receipt amount after deposit fee"
          >
            {quote ? formatUnits(quote.principal, 18) : "—"}
          </div>
          <p>Your yield-bearing gold asset.</p>
        </div>
        <dl className={styles.summary}>
          <div>
            <dt>Staking term</dt>
            <dd>{term} days</dd>
          </div>
          <div>
            <dt>Yield rate</dt>
            <dd>Variable · Funded lease income</dd>
          </div>
          <div>
            <dt>Deposit fee (0.25%)</dt>
            <dd>{quote ? formatUnits(quote.fee, 18) + " SGLD" : "—"}</dd>
          </div>
          <div>
            <dt>Redemption fee</dt>
            <dd>0.50% of principal</dd>
          </div>
        </dl>
        <div className={styles.availability} id="staking-availability">
          <LockKeyhole size={15} aria-hidden="true" />
          <p>
            {snapshot?.paused
              ? "Deposits are currently paused."
              : "Principal is locked until maturity. sySGLD cannot be transferred. Rewards depend on actual funded lease income."}
          </p>
        </div>
        <Button
          type="submit"
          disabled={
            busy ||
            phase !== "ready" ||
            !parsed ||
            !!amountError ||
            snapshot?.paused
          }
          className={styles.stakeButton}
        >
          {busy
            ? "Waiting for confirmation…"
            : snapshot?.paused
              ? "Deposits paused"
              : nextAction === "reset"
                ? "Reset SGLD allowance"
                : nextAction === "approve"
                  ? "Approve SGLD"
                  : "Review stake"}
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
  const access = useStakingAccess();
  const tx = useStakingTransactions();
  const locked = tx.busy || !!tx.pending;
  return (
    <DashboardShell active="stake">
      <main className={styles.main} id="main-content">
        <header className={styles.pageHeading}>
          <div>
            <h1>Earn on your Gold</h1>
          </div>
        </header>
        <div className={styles.layout}>
          <div className={styles.portfolio}>
            <PortfolioCard asset="sysgld" showEarnings={false} />
          </div>
          <div className={styles.formColumn}>
            {access.data?.allowed ? (
              <StakeForm
                initialTerm={initialTerm}
                request={tx.request}
                busy={locked}
              />
            ) : (
              <InviteGate />
            )}
          </div>
          <div className={styles.information}>
            <StakingMetrics />
            <StakingTransactionStatus tx={tx} />
            <StakingPositions
              request={tx.request}
              busy={locked}
              allowed={!!access.data?.allowed}
            />
            {access.data?.admin && <InviteIssuer admin={access.data.admin} />}
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
