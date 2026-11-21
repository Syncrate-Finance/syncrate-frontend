import { test } from "node:test";
import assert from "node:assert/strict";
import type { PublicClient, Hash } from "viem";
import { createPaymentHistory } from "../../features/swap/payment-history";
const id = `0x${"ab".repeat(32)}` as Hash,
  birth = 119199050n;
const hash = (n: bigint) => `0x${n.toString(16).padStart(64, "0")}` as Hash;
test("payout lookup stays bounded, never skips a failed range, and resumes through old history", async () => {
  const ranges: bigint[][] = [];
  let fail = true;
  const client = {
    getBlock: async ({ blockNumber: n }: { blockNumber: bigint }) => ({
      hash: hash(n),
      timestamp: n - birth,
    }),
    getLogs: async ({
      fromBlock: a,
      toBlock: b,
    }: {
      fromBlock: bigint;
      toBlock: bigint;
    }) => {
      ranges.push([a, b]);
      if (fail) throw Error("provider range unavailable");
      return [];
    },
  } as unknown as PublicClient;
  const read = createPaymentHistory(128, 2n, 1);
  assert.equal(await read(client, id, 2n, birth + 6n), null);
  fail = false;
  assert.equal(await read(client, id, 2n, birth + 6n), null);
  assert.deepEqual(ranges.slice(0, 2), [
    [birth + 2n, birth + 3n],
    [birth + 2n, birth + 3n],
  ]);
  assert.equal(await read(client, id, 2n, birth + 6n), null);
  assert.equal(await read(client, id, 2n, birth + 6n), false);
  assert.ok(ranges.every(([a, b]) => b - a < 2n));
});
test("cached payment proof is invalidated after a canonical reorg", async () => {
  let paid = true,
    reorg = false;
  const client = {
    getBlock: async ({ blockNumber: n }: { blockNumber: bigint }) => ({
      hash: hash(n + (reorg ? 100n : 0n)),
      timestamp: n - birth,
    }),
    getLogs: async () =>
      paid
        ? [
            {
              args: { id },
              blockNumber: birth + 2n,
              blockHash: hash(birth + 2n),
              removed: false,
            },
          ]
        : [],
  } as unknown as PublicClient;
  const read = createPaymentHistory();
  assert.equal(await read(client, id, 1n, birth + 3n), true);
  reorg = true;
  paid = false;
  assert.equal(await read(client, id, 1n, birth + 3n), false);
});
