import { test } from "node:test";
import assert from "node:assert/strict";
import ledger from "../../data/points/ledger.json";
import {
  BASE_BACKING_ESCROW,
  MULTICHAIN_VERSION,
  RH_POINTS_TOKEN,
  type PointsEpoch,
} from "../../features/points/model";
import { CONTRACT_ADDRESSES } from "../../config/contracts";
import { mergeChainWeights } from "../../server/points/chain-weights";
import {
  allocatePoints,
  integrateHoldings,
  ZERO,
} from "../../server/points/rewards";
import { appendEpoch, validateLedger } from "../../server/points/ledger";
import type { ChainEvidence } from "../../server/points/robinhood";
const A = "0x1111111111111111111111111111111111111111",
  B = "0x2222222222222222222222222222222222222222";
function chains(): [ChainEvidence, ChainEvidence] {
  const block = {
    startBlock: "10",
    endBlock: "20",
    endBlockHash: `0x${"ab".repeat(32)}`,
    deployed: true,
    reconciliation: {
      block: "119200000",
      blockHash: `0x${"ab".repeat(32)}`,
      supply: "10",
    },
  };
  return [
    {
      ...block,
      chainId: 8453,
      token: CONTRACT_ADDRESSES.SGLD_TOKEN.toLowerCase(),
      weights: [{ address: A, walletSeconds: "40", lpSeconds: "10" }],
    },
    {
      ...block,
      startBlock: "119199050",
      endBlock: "119200000",
      chainId: 4663,
      token: RH_POINTS_TOKEN,
      deployment: {
        block: "119199050",
        blockHash: block.endBlockHash,
        transactionHash:
          "0x6f0cd162378ebeae3c9ea2ab6ddf5c54595feb23ab09298ea370ff7c32282d00",
        timestamp: "1795190000",
      },
      weights: [
        { address: A, walletSeconds: "20", lpSeconds: "0" },
        { address: B, walletSeconds: "10", lpSeconds: "0" },
      ],
    },
  ];
}
test("Base and Robinhood combine into one ten-million pool with Base LP principal weighted 3x", () => {
  const result = allocatePoints(mergeChainWeights(chains()));
  assert.equal(result.distributed, "10000000");
  assert.deepEqual(
    result.awards.map((x) => [x.address, x.walletPoints, x.lpPoints]),
    [
      [A, "6000000", "3000000"],
      [B, "1000000", "0"],
    ],
  );
});
test("a bridged SGLD earns for the holder on either chain, never its Base backing escrow", () => {
  const base = integrateHoldings(
    [
      {
        kind: "transfer",
        time: 0,
        block: 1n,
        index: 0,
        from: ZERO,
        to: A,
        amount: 1n,
      },
      {
        kind: "transfer",
        time: 30,
        block: 2n,
        index: 0,
        from: A,
        to: BASE_BACKING_ESCROW,
        amount: 1n,
      },
    ],
    0,
    100,
  );
  const rh = integrateHoldings(
    [
      {
        kind: "transfer",
        time: 40,
        block: 1n,
        index: 0,
        from: ZERO,
        to: A,
        amount: 1n,
      },
    ],
    0,
    100,
  );
  assert.equal(base.weights.has(BASE_BACKING_ESCROW), false);
  assert.equal(base.weights.get(A)!.wallet + rh.weights.get(A)!.wallet, 90n);
});
test("chain evidence rejects duplicate sources, unverified tokens, RH LP weights and system balances", () => {
  for (const mutate of [
    (c: ReturnType<typeof chains>) => {
      c[1].chainId = 8453;
    },
    (c: ReturnType<typeof chains>) => {
      c[1].token = A;
    },
    (c: ReturnType<typeof chains>) => {
      c[1].weights[0].lpSeconds = "1";
    },
    (c: ReturnType<typeof chains>) => {
      c[0].weights[0].address = BASE_BACKING_ESCROW;
    },
    (c: ReturnType<typeof chains>) => {
      c[1].deployed = false;
    },
  ]) {
    const c = chains();
    mutate(c);
    assert.throws(() => mergeChainWeights(c));
  }
});
test("a v3 append preserves every old point and epoch, and provenance must reconcile", () => {
  const old = validateLedger(ledger),
    c = chains();
  c[1] = {
    ...c[1],
    startBlock: "10",
    endBlock: "20",
    deployed: false,
    weights: [],
  };
  const start = old.epochs.at(-1)!.end;
  const end = new Date(Date.parse(start) + 604800000).toISOString();
  const epoch: Extract<PointsEpoch, { version: typeof MULTICHAIN_VERSION }> = {
    version: MULTICHAIN_VERSION,
    start,
    end,
    calculatedAt: end,
    startBlock: c[0].startBlock,
    endBlock: c[0].endBlock,
    endBlockHash: c[0].endBlockHash,
    chains: c,
    ...allocatePoints(mergeChainWeights(c)),
  };
  const next = appendEpoch(old, epoch);
  assert.equal(next.version, MULTICHAIN_VERSION);
  assert.deepEqual(next.baseline, old.baseline);
  assert.deepEqual(next.epochs.slice(0, -1), old.epochs);
  assert.throws(
    () =>
      appendEpoch(old, { ...epoch, chains: [{ ...c[0], weights: [] }, c[1]] }),
    /weights/,
  );
  const { chains: _evidence, ...legacy } = epoch;
  assert.throws(
    () =>
      appendEpoch(next, {
        ...legacy,
        version: "sgld-holdings-v2",
        start: end,
        end: new Date(Date.parse(end) + 604800000).toISOString(),
        calculatedAt: new Date(Date.parse(end) + 604800000).toISOString(),
      }),
    /revert/,
  );
});
