import type { Hash, PublicClient } from "viem";
import { RH, rhAbi } from "./robinhood-model";

type Cursor = {
  next: bigint;
  anchor?: { block: bigint; hash: Hash };
  paid?: { block: bigint; hash: Hash };
};
/** Bounded work per poll, canonical anchors, and no false "unpaid" on missing ranges. */
export function createPaymentHistory(
  maxEntries = 128,
  pageSize = 2000n,
  maxPages = 4,
) {
  const cache = new Map<string, Cursor>();
  const pending = new Map<string, Promise<boolean | null>>();
  return function read(
    client: PublicClient,
    id: Hash,
    observedAt: bigint,
    head: bigint,
  ): Promise<boolean | null> {
    const key = `${id}:${observedAt}`;
    const existing = pending.get(key);
    if (existing) return existing;
    const job = (async () => {
      try {
        let cursor = cache.get(key);
        const proof = cursor?.paid ?? cursor?.anchor;
        if (
          proof &&
          (head < proof.block ||
            (await client.getBlock({ blockNumber: proof.block })).hash !==
              proof.hash)
        ) {
          cache.delete(key);
          cursor = undefined;
        }
        if (cursor?.paid) return true;
        if (!cursor) {
          // The immutable price snapshot records request creation time. No payment predates it.
          let lo = 119199050n,
            hi = head + 1n;
          while (lo < hi) {
            const mid = (lo + hi) / 2n;
            if (
              (await client.getBlock({ blockNumber: mid })).timestamp <
              observedAt
            )
              lo = mid + 1n;
            else hi = mid;
          }
          cursor = { next: lo };
          if (cache.size >= maxEntries)
            cache.delete(cache.keys().next().value!);
          cache.set(key, cursor);
        }
        for (let page = 0; page < maxPages && cursor.next <= head; page++) {
          const fromBlock = cursor.next,
            toBlock =
              fromBlock + pageSize - 1n > head
                ? head
                : fromBlock + pageSize - 1n;
          const before = await client.getBlock({ blockNumber: toBlock });
          if (!before.hash) return null;
          const logs = await client.getLogs({
            address: RH.engine,
            event: rhAbi.find(
              (x) => x.type === "event" && x.name === "RedemptionPaid",
            )!,
            args: { id },
            fromBlock,
            toBlock,
            strict: true,
          });
          for (const log of logs) {
            if (
              log.removed ||
              log.blockNumber === null ||
              log.blockNumber < fromBlock ||
              log.blockNumber > toBlock ||
              !log.blockHash ||
              log.args.id !== id
            )
              throw Error("Invalid payment history");
            if (
              (await client.getBlock({ blockNumber: log.blockNumber })).hash !==
              log.blockHash
            )
              throw Error("Payment history changed");
          }
          if (
            (await client.getBlock({ blockNumber: toBlock })).hash !==
            before.hash
          )
            throw Error("Payment history changed");
          cursor.next = toBlock + 1n;
          cursor.anchor = { block: toBlock, hash: before.hash };
          if (logs.length) {
            cursor.paid = {
              block: logs[0].blockNumber!,
              hash: logs[0].blockHash!,
            };
            return true;
          }
        }
        return cursor.next > head ? false : null;
      } catch {
        // Retry this incomplete range next poll; never infer a payment or an empty queue.
        return null;
      }
    })();
    pending.set(key, job);
    void job.finally(() => pending.delete(key));
    return job;
  };
}
export const readPaymentHistory = createPaymentHistory();
