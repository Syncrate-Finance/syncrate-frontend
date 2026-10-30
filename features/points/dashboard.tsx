"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  Star,
  CalendarDays,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Wallet,
  RefreshCw,
  Layers3,
} from "lucide-react";
import { APP_ORIGIN } from "@/config/site";
import {
  DashboardShell,
  WalletControl,
  BaseIcon,
} from "@/features/dashboard/shell";
import { SAFFRON_POOL_URL } from "@/features/opportunities/catalog";
import { useSgldBalance } from "@/features/portfolio/use-sgld-balance";
import { formatSgldBalance } from "@/features/portfolio/sgld-read";
import {
  formatPoints,
  shortWallet,
  type PointsResponse,
  type PointsAccount,
} from "./model";
import styles from "./points.module.css";

function date(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
async function requestPoints(
  address?: string,
  page?: number,
  signal?: AbortSignal,
): Promise<PointsResponse> {
  const query = new URLSearchParams();
  if (address) query.set("address", address);
  if (page !== undefined) query.set("page", String(page));
  const response = await fetch("/api/v1/points?" + query, {
    signal,
    cache: "no-store",
  });
  if (!response.ok) throw Error("Points unavailable");
  return response.json();
}
export function AccountSummary({ account }: { account: PointsAccount }) {
  return (
    <>
      <div className={styles.accountLine}>
        <span className={styles.walletAddress} title={account.address}>
          <Wallet size={13} />
          {shortWallet(account.address)}
        </span>
        <span className={styles.baseLabel}>
          <BaseIcon />
          Base
        </span>
      </div>
      <span className={styles.smallLabel}>YOUR TOTAL POINTS</span>
      <strong className={styles.total}>{formatPoints(account.total)}</strong>
      <div className={styles.accountStats}>
        <div>
          <span>Community rank</span>
          <strong>{account.rank ? `#${account.rank}` : "—"}</strong>
        </div>
        <div>
          <span>Last weekly award</span>
          <strong>+{formatPoints(account.lastAward)}</strong>
        </div>
      </div>
      <p className={styles.accountNote}>
        Includes {formatPoints(account.carriedOver)} previously earned points.
      </p>
    </>
  );
}
function CommunityLeaderboard() {
  const [open, setOpen] = useState(false),
    [page, setPage] = useState(0);
  const wallet = useAccount().address?.toLowerCase();
  const query = useQuery({
    queryKey: ["points-leaderboard", page],
    queryFn: ({ signal }) => requestPoints(undefined, page, signal),
    enabled: open,
    staleTime: 60000,
    refetchInterval: open ? 60000 : false,
    retry: 1,
  });
  const board = query.data?.leaderboard;
  return (
    <details
      className={styles.leaderboard}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <span className={styles.leaderIcon}>
          <Trophy size={20} />
        </span>
        <span>
          <strong>Community leaderboard</strong>
          <small>Every wallet. All settled points.</small>
        </span>
        <span className={styles.expandLabel}>View rankings</span>
        <ChevronDown size={18} />
      </summary>
      <div className={styles.boardContent}>
        {query.isError ? (
          <div className={styles.empty}>
            <p>Rankings are temporarily unavailable.</p>
            <button
              onClick={() => void query.refetch()}
              disabled={query.isFetching}
            >
              <RefreshCw size={13} />
              Try again
            </button>
          </div>
        ) : !board ? (
          <p className={styles.loading} role="status">
            Loading rankings…
          </p>
        ) : (
          <>
            <div className={styles.tableScroll}>
              <table>
                <caption className={styles.srOnly}>
                  Cumulative community points, including preserved previous
                  awards
                </caption>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Wallet</th>
                    <th>Sync Points</th>
                  </tr>
                </thead>
                <tbody>
                  {board.rows.map((row) => (
                    <tr
                      key={row.address}
                      className={
                        row.address === wallet ? styles.yourRow : undefined
                      }
                    >
                      <td>#{row.rank}</td>
                      <td>
                        <a
                          href={`https://basescan.org/address/${row.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={row.address}
                        >
                          {shortWallet(row.address)}
                          <ArrowUpRight size={11} />
                        </a>
                        {row.address === wallet && (
                          <span className={styles.you}>You</span>
                        )}
                      </td>
                      <td>{formatPoints(row.total)}</td>
                    </tr>
                  ))}
                  {!board.rows.length && (
                    <tr>
                      <td colSpan={3}>No settled points yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className={styles.pagination}>
              <span>
                {board.total} wallets · Page {board.page + 1} of {board.pages}
              </span>
              <div>
                <button
                  aria-label="Previous leaderboard page"
                  disabled={page === 0 || query.isFetching}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  aria-label="Next leaderboard page"
                  disabled={board.page + 1 >= board.pages || query.isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </details>
  );
}
function DistributionHistory({
  account,
  connected,
  loading,
  error,
}: {
  account: PointsAccount | undefined;
  connected: boolean;
  loading: boolean;
  error: boolean;
}) {
  const [page, setPage] = useState(0);
  const history = account?.history ?? [],
    pages = Math.max(1, Math.ceil(history.length / 8));
  const current = Math.min(page, pages - 1);
  return (
    <section className={styles.ledger} aria-labelledby="distribution-heading">
      <div className={styles.panelHeading}>
        <div>
          <span className={styles.smallLabel}>YOUR WEEKLY RECORD</span>
          <h2 id="distribution-heading">Distribution history</h2>
          <p>Settled every Sunday, broken down by how you held SGLD.</p>
        </div>
        <CalendarDays size={20} />
      </div>
      {!connected || loading || error || !account ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <CalendarDays size={22} />
          </span>
          <h3>
            {!connected
              ? "Your holding history starts here."
              : error
                ? "History is temporarily unavailable."
                : "Reading your points…"}
          </h3>
          <p>
            {!connected
              ? "Connect your wallet to see your distributions and carried-over points."
              : error
                ? "Please retry using the points summary above."
                : "Your weekly record will appear shortly."}
          </p>
        </div>
      ) : (
        <>
          {history.length ? (
            <>
              <div className={styles.tableScroll}>
                <table>
                  <caption className={styles.srOnly}>
                    Weekly points for {account.address}
                  </caption>
                  <thead>
                    <tr>
                      <th>Distribution</th>
                      <th>Wallet · 1×</th>
                      <th>Uniswap · 3×</th>
                      <th>Total points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(current * 8, current * 8 + 8).map((row) => (
                      <tr key={row.end}>
                        <td>
                          <strong>{date(row.end)}</strong>
                          <small>
                            {date(row.start)} – {date(row.end)}
                          </small>
                        </td>
                        <td>{formatPoints(row.walletPoints)}</td>
                        <td>{formatPoints(row.lpPoints)}</td>
                        <td>+{formatPoints(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pages > 1 && (
                <div className={styles.pagination}>
                  <span>
                    Page {current + 1} of {pages}
                  </span>
                  <div>
                    <button
                      aria-label="Previous distributions"
                      disabled={current === 0}
                      onClick={() => setPage(current - 1)}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      aria-label="Next distributions"
                      disabled={current + 1 >= pages}
                      onClick={() => setPage(current + 1)}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>
                <CalendarDays size={22} />
              </span>
              <h3>Your next chapter is accruing.</h3>
              <p>
                The first holding-based distribution closes November 1, 2026 at
                00:00 UTC. Your previous points stay with you.
              </p>
            </div>
          )}
          <div className={styles.openingBalance}>
            <span>
              Previously earned points
              <small>Preserved through October 25, 2026</small>
            </span>
            <strong>{formatPoints(account.carriedOver)}</strong>
          </div>
        </>
      )}
      <div className={styles.ledgerFoot}>
        Points reflect time held during the week. Weekly processing can finish
        after the 00:00 UTC cutoff.
      </div>
    </section>
  );
}
export function PointsDashboard() {
  const wallet = useAccount();
  const address = wallet.address?.toLowerCase();
  const connected = wallet.isConnected && Boolean(address);
  const query = useQuery({
    queryKey: ["points-account", 8453, address],
    queryFn: ({ signal }) => requestPoints(address, undefined, signal),
    enabled: connected,
    staleTime: 60000,
    refetchInterval: connected ? 60000 : false,
    retry: 1,
    gcTime: 60000,
  });
  const publicQuery = useQuery({
    queryKey: ["points-program"],
    queryFn: ({ signal }) => requestPoints(undefined, undefined, signal),
    staleTime: 60000,
    refetchInterval: 60000,
    retry: 1,
  });
  const candidate = query.data?.account;
  const account =
    connected && candidate?.address === address && !query.isError
      ? (candidate ?? undefined)
      : undefined;
  const program = publicQuery.isError ? undefined : publicQuery.data;
  const holdings = useSgldBalance();
  return (
    <DashboardShell active="points">
      <main id="main-content" className={styles.container}>
        <div className={styles.topGrid}>
          <section className={styles.hero} aria-labelledby="points-title">
            <span className={styles.heroEyebrow}>
              <Star size={16} />
              SYNCRATE REWARDS
            </span>
            <h1 id="points-title">
              Hold gold.
              <br />
              <em>Grow your points.</em>
            </h1>
            <p>
              SGLD in your wallet earns Sync Points. Put its SGLD liquidity to
              work on Uniswap for 3× weighting.
            </p>
            <div className={styles.heroPills}>
              <span>
                <Star size={12} />
                10 million points each week
              </span>
              <span>
                <CalendarDays size={12} />
                Sundays · 00:00 UTC
              </span>
            </div>
          </section>
          <section className={styles.summary} aria-labelledby="summary-title">
            <span className={styles.summaryIcon}>
              <Star size={20} />
            </span>
            <h2 id="summary-title">Your Sync Points</h2>
            {wallet.status === "connecting" ||
            wallet.status === "reconnecting" ? (
              <p role="status">Connecting to your wallet…</p>
            ) : !connected ? (
              <div className={styles.connectPrompt}>
                <p>
                  A record that follows your wallet.
                  <br />
                  Connect to see your points and weekly distributions.
                </p>
                <WalletControl compact />
                <span>No signature required to view points.</span>
              </div>
            ) : query.isError ? (
              <div className={styles.error} role="status">
                <p>Points are temporarily unavailable.</p>
                <button
                  onClick={() => void query.refetch()}
                  disabled={query.isFetching}
                >
                  <RefreshCw size={14} />
                  {query.isFetching ? "Retrying…" : "Try again"}
                </button>
              </div>
            ) : !account ? (
              <p className={styles.loading} role="status">
                Loading your points…
              </p>
            ) : (
              <AccountSummary account={account} />
            )}
          </section>
        </div>
        <section className={styles.statusGrid} aria-label="Program status">
          <div>
            <span>Your wallet-held SGLD</span>
            <strong>
              {holdings.snapshot
                ? formatSgldBalance(
                    holdings.snapshot.balance,
                    holdings.snapshot.decimals,
                  )
                : "—"}
              <small>{holdings.snapshot ? "SGLD" : ""}</small>
            </strong>
            <p>
              {holdings.phase === "disconnected"
                ? "Connect to read your Base holdings"
                : holdings.phase === "wrong-network"
                  ? "Switch to Base for live holdings"
                  : holdings.phase === "error"
                    ? "Balance temporarily unavailable"
                    : "Wallet holdings receive 1× weighting"}
            </p>
          </div>
          <div>
            <span>Last settled cutoff</span>
            <strong>{program ? date(program.lastSettledAt) : "—"}</strong>
            <p>Previous points are preserved</p>
          </div>
          <div>
            <span>
              {program?.status === "processing"
                ? "Distribution processing"
                : "Next distribution cutoff"}
            </span>
            <strong>{program ? date(program.nextCutoff) : "—"}</strong>
            <p>
              {publicQuery.isError
                ? "Schedule temporarily unavailable"
                : "Sunday at 00:00 UTC"}
            </p>
          </div>
        </section>
        <div className={styles.mainGrid}>
          <DistributionHistory
            key={address ?? "disconnected"}
            account={account}
            connected={connected}
            loading={query.isPending}
            error={query.isError}
          />
          <aside className={styles.venues} aria-labelledby="multipliers-title">
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.smallLabel}>
                  MAKE YOUR HOLDINGS COUNT
                </span>
                <h2 id="multipliers-title">Points multipliers</h2>
                <p>One asset. Two ways to participate.</p>
              </div>
            </div>
            <div className={styles.venue}>
              <span className={styles.coin}>
                <Image src="/SGLD-icon.png" width={35} height={35} alt="" />
              </span>
              <div>
                <h3>SGLD in your wallet</h3>
                <p>
                  Hold SGLD on Base. Your time-weighted balance counts
                  automatically.
                </p>
              </div>
              <strong className={styles.multiplier}>1×</strong>
            </div>
            <div className={styles.venue}>
              <span className={styles.lpIcon}>
                <Layers3 size={23} />
              </span>
              <div>
                <h3>Uniswap liquidity</h3>
                <span className={styles.via}>SGLD / USDC · via Saffron</span>
                <p>
                  3× weighting for the SGLD principal in directly owned
                  positions in the eligible pool.
                </p>
              </div>
              <strong className={`${styles.multiplier} ${styles.boost}`}>
                3×
              </strong>
            </div>
            <a
              className={styles.poolLink}
              href={SAFFRON_POOL_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore the Uniswap pool
              <ArrowUpRight size={15} />
            </a>
            <p className={styles.venueNote}>
              Only direct LP ownership is attributed to your wallet. USDC and
              uncollected fees do not receive the LP boost. Moving SGLD into
              this pool does not count it twice.
            </p>
          </aside>
        </div>
        <CommunityLeaderboard />
        <section className={styles.how} aria-labelledby="how-points-work">
          <div>
            <span className={styles.smallLabel}>AUTOMATIC BY DESIGN</span>
            <h2 id="how-points-work">
              A little more gold.
              <br />A little more possibility.
            </h2>
            <a href={APP_ORIGIN + "#buy-sgld"}>
              Get SGLD
              <ArrowUpRight size={14} />
            </a>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div>
                <h3>Hold throughout the week</h3>
                <p>
                  Your balance is weighted by how long you hold it, including
                  transfers during the week.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Boost eligible liquidity</h3>
                <p>
                  The SGLD portion of directly owned Uniswap positions receives
                  three times the weight.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>See your Sunday distribution</h3>
                <p>
                  The 10 million weekly pool is shared proportionally. Your
                  settled points appear here after processing.
                </p>
              </div>
            </li>
          </ol>
        </section>
      </main>
    </DashboardShell>
  );
}
