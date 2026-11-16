"use client";
import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { formatUnits, type Address } from "viem";
import { Button } from "@/components/ui/button";
import { stakingAbi } from "./abi";
import { STAKING_ADDRESS } from "./deployment";
import { useStakingSnapshot } from "./hooks";
import { readPositionPage } from "./read";
import type { StakeAction } from "./transactions";
import styles from "./staking.module.css";

function Rewards({
  id,
  account,
  request,
  busy,
}: {
  id: bigint;
  account: Address;
  request: (a: StakeAction) => void;
  busy: boolean;
}) {
  const { client, snapshot } = useStakingSnapshot();
  const [offset, setOffset] = useState(0n);
  const count = snapshot?.epochCount ?? 0n;
  const end = count < offset + 32n ? count : offset + 32n;
  const ids = Array.from(
    { length: Number(end > offset ? end - offset : 0n) },
    (_, i) => offset + BigInt(i),
  );
  const rewards = useQuery({
    queryKey: [
      "staking",
      "rewards",
      account.toLowerCase(),
      id.toString(),
      offset.toString(),
      count.toString(),
    ],
    enabled: !!client && !!snapshot && count > offset,
    queryFn: async () => {
      const blockNumber = await client!.getBlockNumber({ cacheTime: 0 });
      const amounts = await Promise.all(
        ids.map((epoch) =>
          client!.readContract({
            address: STAKING_ADDRESS,
            abi: stakingAbi,
            functionName: "claimable",
            args: [id, epoch],
            blockNumber,
          }),
        ),
      );
      return {
        sum: amounts.reduce((a, b) => a + b, 0n),
        ids: ids.filter((_, i) => amounts[i] > 0n),
      };
    },
    refetchInterval: 30000,
    retry: 1,
  });
  if (!count) return <p>No reward periods have been funded yet.</p>;
  return (
    <div className={styles.rewardBlock}>
      <p>
        Reward periods {(offset + 1n).toString()}–{end.toString()} of{" "}
        {count.toString()}
      </p>
      <p>
        {rewards.isError
          ? "Rewards unavailable. Retry later."
          : rewards.data
            ? `${formatUnits(rewards.data.sum, 18)} SGLD claimable in these periods`
            : "Loading rewards…"}
      </p>
      <div className={styles.positionActions}>
        <Button
          disabled={
            busy ||
            rewards.isError ||
            rewards.isFetching ||
            !rewards.data?.ids.length
          }
          onClick={() =>
            request({ kind: "claim", id, term: 30, epochs: rewards.data!.ids })
          }
        >
          Claim rewards
        </Button>
        {offset > 0n && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => setOffset(offset - 32n)}
          >
            Earlier periods
          </Button>
        )}
        {end < count && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => setOffset(end)}
          >
            Later periods
          </Button>
        )}
      </div>
    </div>
  );
}
export function StakingPositions({
  request,
  busy,
  allowed,
}: {
  request: (a: StakeAction) => void;
  busy: boolean;
  allowed: boolean;
}) {
  const { wallet, client, snapshot } = useStakingSnapshot();
  const account = wallet.chainId === 8453 ? wallet.address : undefined;
  const query = useInfiniteQuery({
    queryKey: ["staking", "positions", account?.toLowerCase()],
    queryFn: ({ pageParam }) => readPositionPage(client!, account!, pageParam),
    initialPageParam: null as bigint | null,
    getNextPageParam: (page) => page.next,
    enabled: !!account && !!client,
    refetchInterval: 30000,
    retry: 1,
  });
  const rows = [
    ...new Map(
      query.data?.pages
        .flatMap((p) => p.rows)
        .map((p) => [p.id.toString(), p]) ?? [],
    ).values(),
  ];
  return (
    <section
      className={styles.positions}
      aria-labelledby="staking-positions-heading"
    >
      <h2 id="staking-positions-heading">Your staking positions</h2>
      {!account ? (
        <p className={styles.formIntro}>
          Connect your wallet on Base to view positions.
        </p>
      ) : query.isError ? (
        <>
          <p role="alert">Positions could not be loaded.</p>
          <Button variant="outline" onClick={() => query.refetch()}>
            Retry
          </Button>
        </>
      ) : query.isPending ? (
        <p>Loading positions…</p>
      ) : (
        <>
          {!rows.length && (
            <p className={styles.formIntro}>
              {query.hasNextPage
                ? "No positions in this page. Load older entries to continue searching."
                : "Your staking positions will appear here."}
            </p>
          )}
          {rows.map((p) => {
            const mature = !!snapshot && snapshot.timestamp >= p.maturesAt;
            return (
              <article key={p.id.toString()} className={styles.positionRow}>
                <h3>Position #{p.id.toString()}</h3>
                <p>
                  {formatUnits(p.principal, 18)} SGLD ·{" "}
                  {p.withdrawn
                    ? "Principal redeemed or restaked"
                    : mature
                      ? "Matured"
                      : "Locked"}
                </p>
                <p>
                  Matures {new Date(Number(p.maturesAt) * 1000).toUTCString()}
                </p>
                {!p.withdrawn && mature && (
                  <div className={styles.positionActions}>
                    <Button
                      disabled={busy}
                      onClick={() =>
                        request({
                          kind: "withdraw",
                          id: p.id,
                          term: 30,
                          epochs: [],
                        })
                      }
                    >
                      Redeem principal
                    </Button>
                    {[30, 90].map((term) => (
                      <Button
                        key={term}
                        variant="outline"
                        disabled={busy || !allowed || snapshot?.paused}
                        onClick={() =>
                          request({
                            kind: "restake",
                            id: p.id,
                            term: term as 30 | 90,
                            epochs: [],
                          })
                        }
                      >
                        Restake {term} days
                      </Button>
                    ))}
                  </div>
                )}
                {mature && (
                  <Rewards
                    id={p.id}
                    account={account}
                    request={request}
                    busy={busy}
                  />
                )}
              </article>
            );
          })}
          {query.hasNextPage && (
            <Button
              variant="outline"
              disabled={query.isFetchingNextPage}
              onClick={() => query.fetchNextPage()}
            >
              {query.isFetchingNextPage ? "Loading…" : "Load older positions"}
            </Button>
          )}
        </>
      )}
    </section>
  );
}
