"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Coins,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";
import { formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import { WEBSITE_ORIGIN } from "@/config/site";
import {
  BaseIcon,
  DashboardShell,
  WalletControl,
} from "@/features/dashboard/shell";
import { PortfolioCard } from "@/features/portfolio/card";
import { useSgldBalance } from "@/features/portfolio/use-sgld-balance";
import { formatSgldBalance } from "@/features/portfolio/sgld-read";
import { STAKING_TERMS, stakingAmountError, type StakingTerm } from "./model";
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
              amountError ? "stake-amount-error stake-balance" : "stake-balance"
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
            —
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
            <dd>To be announced</dd>
          </div>
        </dl>
        <div className={styles.availability} id="staking-availability">
          <LockKeyhole size={15} aria-hidden="true" />
          <p>
            Staking is coming soon. Deposits are not yet open. Rates and
            conversion details will be published before launch.
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
            <span className={styles.eyebrow}>SGLD → sySGLD</span>
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
            <section
              className={styles.explainer}
              aria-labelledby="how-staking-works"
            >
              <span className={styles.eyebrow}>GOLD WITH A PURPOSE</span>
              <h2 id="how-staking-works">Real gold. Productive by design.</h2>
              <p>
                sySGLD is Syncrate’s yield-bearing gold asset. Its underlying
                yield comes from direct gold leasing with vetted bullion banks
                and established counterparties.
              </p>
              <ol className={styles.steps}>
                <li>
                  <span className={styles.stepIcon}>
                    <CalendarDays size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>Choose 30 or 90 days</h3>
                    <p>Stake your SGLD for a fixed term and receive sySGLD.</p>
                  </div>
                </li>
                <li>
                  <span className={styles.stepIcon}>
                    <Building2 size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>Your gold gets to work</h3>
                    <p>
                      The gold bars backing your staked SGLD are leased to
                      vetted, established counterparties.
                    </p>
                  </div>
                </li>
                <li>
                  <span className={styles.stepIcon}>
                    <Coins size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>Lease interest becomes yield</h3>
                    <p>
                      The interest paid by these counterparties flows back as
                      yield to sySGLD holders.
                    </p>
                  </div>
                </li>
              </ol>
              <a className={styles.learnLink} href={WEBSITE_ORIGIN + "/sysgld"}>
                Learn about sySGLD <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </section>
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
