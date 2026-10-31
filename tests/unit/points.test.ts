import { test } from "node:test";
import assert from "node:assert/strict";
import { isAddress } from "viem";
import legacy from "../../public/points/latest.json";
import baseline from "../../data/points/ledger.json";
import {
  PROGRAM_START,
  PROGRAM_VERSION,
  WEEK_SECONDS,
  WEEKLY_POOL,
  nextSunday,
  formatPoints,
  type PointsEpoch,
} from "../../features/points/model";
import {
  integrateHoldings,
  allocatePoints,
  ZERO,
  EXCLUDED,
  type RewardEvent,
} from "../../server/points/rewards";
import { sqrtAtTick, sgldInLiquidity } from "../../server/points/tick-math";
import {
  validateLedger,
  appendEpoch,
  projectPoints,
} from "../../server/points/ledger";
import { scanLogs } from "../../server/points/chain";
import {
  POINTS_POOL,
  POSITION_MANAGER,
  UNISWAP_FACTORY,
  USDC,
} from "../../features/points/model";

test("all points configuration addresses are valid Base contract addresses", () => {
  for (const value of [
    POINTS_POOL,
    POSITION_MANAGER,
    UNISWAP_FACTORY,
    USDC,
    ...EXCLUDED,
  ])
    assert.ok(isAddress(value, { strict: false }), value);
  assert.equal(USDC, "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913");
});

const A = "0x1111111111111111111111111111111111111111",
  B = "0x2222222222222222222222222222222222222222",
  C = "0x3333333333333333333333333333333333333333";
const Q96 = 1n << 96n;
const transfer = (
  time: number,
  block: bigint,
  from: string,
  to: string,
  amount: bigint,
  index = 0,
): RewardEvent => ({ kind: "transfer", time, block, index, from, to, amount });
test("time-weighted holders receive points after transfers without minting themselves", () => {
  const state = integrateHoldings(
    [transfer(0, 1n, ZERO, A, 100n), transfer(10, 2n, A, B, 100n)],
    0,
    70,
  );
  assert.deepEqual(state.weights.get(A), { wallet: 1000n, lp: 0n });
  assert.deepEqual(state.weights.get(B), { wallet: 6000n, lp: 0n });
  const points = allocatePoints(state.weights, 700n);
  assert.equal(points.awards.find((r) => r.address === A)?.walletPoints, "100");
  assert.equal(points.awards.find((r) => r.address === B)?.walletPoints, "600");
});
test("same-block flash holdings and end-cutoff transfers cannot earn time", () => {
  const state = integrateHoldings(
    [
      transfer(0, 1n, ZERO, A, 10n),
      transfer(30, 2n, A, B, 10n, 0),
      transfer(30, 2n, B, A, 10n, 1),
      transfer(70, 3n, A, C, 10n),
    ],
    0,
    70,
  );
  assert.equal(state.weights.get(A)?.wallet, 700n);
  assert.equal(state.weights.has(B), false);
  assert.equal(state.weights.has(C), false);
});

test("retired Prime custody earns no new holding or deposit points", () => {
  const prime = "0xba93aa354a3b47a936d713b8fb90126d4d35546b";
  const state = integrateHoldings(
    [
      transfer(0, 1n, ZERO, A, 100n),
      transfer(10, 2n, A, prime, 100n),
    ],
    0,
    70,
  );
  assert.equal(state.weights.get(A)?.wallet, 1000n);
  assert.equal(state.weights.has(prime), false);
  const result = allocatePoints(state.weights, 700n);
  assert.deepEqual(result.awards.map((row) => row.address), [A]);
  assert.equal(result.awards[0].walletPoints, "700");
  assert.equal(result.awards[0].lpPoints, "0");
});
test("LP ownership transfers split the weight and changing pool price updates only SGLD principal", () => {
  const l = 10n ** 18n,
    principal = sgldInLiquidity(l, -60, 60, Q96);
  const events: RewardEvent[] = [
    { kind: "price", time: 0, block: 1n, index: 0, sqrtPrice: Q96 },
    {
      kind: "owner",
      time: 0,
      block: 1n,
      index: 1,
      key: "nft:1",
      from: ZERO,
      to: A,
    },
    {
      kind: "liquidity",
      time: 0,
      block: 1n,
      index: 2,
      key: "nft:1",
      delta: l,
      lower: -60,
      upper: 60,
    },
    {
      kind: "owner",
      time: 20,
      block: 2n,
      index: 0,
      key: "nft:1",
      from: A,
      to: B,
    },
    { kind: "price", time: 40, block: 3n, index: 0, sqrtPrice: sqrtAtTick(60) },
  ];
  const state = integrateHoldings(events, 0, 60);
  assert.equal(state.weights.get(A)?.lp, principal * 20n);
  assert.equal(state.weights.get(B)?.lp, principal * 20n);
  assert.equal(sgldInLiquidity(l, -60, 60, sqrtAtTick(60)), 0n);
});
test("deposited pool tokens are not counted twice and LP weighting is exactly 3x", () => {
  const l = 10n ** 18n,
    amount = sgldInLiquidity(l, -60, 60, Q96);
  const pool = "0xc5963bd6d6cf713f0994ffd867d4d639ad45ec6e";
  const events: RewardEvent[] = [
    transfer(0, 1n, ZERO, A, amount, 0),
    transfer(0, 1n, ZERO, B, amount, 1),
    transfer(0, 1n, A, pool, amount, 2),
    { kind: "price", time: 0, block: 1n, index: 3, sqrtPrice: Q96 },
    {
      kind: "liquidity",
      time: 0,
      block: 1n,
      index: 4,
      key: "core:a",
      owner: A,
      delta: l,
      lower: -60,
      upper: 60,
    },
  ];
  const state = integrateHoldings(events, 0, 100);
  assert.equal(state.weights.has(pool), false);
  assert.equal(state.weights.get(A)?.wallet, 0n);
  const points = allocatePoints(state.weights, 100n);
  assert.equal(points.awards.find((r) => r.address === A)?.lpPoints, "75");
  assert.equal(points.awards.find((r) => r.address === B)?.walletPoints, "25");
});
test("incomplete histories fail rather than producing partial awards", () => {
  assert.throws(
    () => integrateHoldings([transfer(0, 1n, A, B, 1n)], 0, 10),
    /Incomplete/,
  );
  assert.throws(
    () =>
      integrateHoldings(
        [transfer(0, 1n, ZERO, A, 1n), transfer(0, 1n, ZERO, A, 1n)],
        0,
        10,
      ),
    /Duplicate/,
  );
  assert.throws(
    () =>
      integrateHoldings(
        [
          {
            kind: "owner",
            time: 0,
            block: 1n,
            index: 0,
            key: "nft:1",
            from: A,
            to: B,
          },
        ],
        0,
        10,
      ),
    /Incomplete/,
  );
  assert.throws(
    () =>
      integrateHoldings(
        [
          {
            kind: "liquidity",
            time: 0,
            block: 1n,
            index: 0,
            key: "p",
            owner: A,
            delta: 1n,
            lower: -60,
            upper: 60,
          },
        ],
        0,
        10,
      ),
    /price/,
  );
});
test("integer rounding conserves the pool with stable ties and handles uint256-scale weights", () => {
  const weights = new Map(
    [A, B, C].map((a) => [a, { wallet: 1n << 255n, lp: 0n }]),
  );
  const result = allocatePoints(weights);
  assert.equal(result.distributed, String(WEEKLY_POOL));
  assert.equal(
    result.awards.reduce(
      (n, r) => n + BigInt(r.walletPoints) + BigInt(r.lpPoints),
      0n,
    ),
    WEEKLY_POOL,
  );
  assert.equal(result.awards[0].walletPoints, "3333334");
  assert.equal(allocatePoints(new Map()).distributed, "0");
  assert.equal(allocatePoints(new Map()).unallocated, "10000000");
  assert.equal(
    allocatePoints(new Map([[[...EXCLUDED][0], { wallet: 100n, lp: 0n }]]))
      .distributed,
    "0",
  );
  assert.equal(
    formatPoints("900719925474099312345"),
    "900,719,925,474,099,312,345",
  );
});
test("tick math matches published Uniswap endpoints and +/- one tick", () => {
  assert.equal(sqrtAtTick(0), Q96);
  assert.equal(sqrtAtTick(-1), 79224201403219477170569942574n);
  assert.equal(sqrtAtTick(1), 79232123823359799118286999568n);
  assert.equal(sqrtAtTick(-887272), 4295128739n);
  assert.equal(
    sqrtAtTick(887272),
    1461446703485210103287273052203988822378723970342n,
  );
  assert.throws(() => sqrtAtTick(887273));
});
test("all 18 previous wallets and 17,000,338 points carry forward unchanged", () => {
  const ledger = validateLedger(baseline);
  for (const old of legacy.leaderboard)
    assert.equal(
      ledger.baseline.balances.find(
        (r) => r.address === old.address.toLowerCase(),
      )?.points,
      String(old.totalPoints),
    );
  assert.equal(ledger.baseline.balances.length, 18);
  assert.equal(
    ledger.baseline.balances.reduce((n, r) => n + BigInt(r.points), 0n),
    17000338n,
  );
  const result = projectPoints(
    ledger,
    legacy.leaderboard[0].address.toLowerCase(),
    0,
    new Date("2026-10-29T12:00:00Z"),
  );
  assert.equal(
    result.account?.total,
    String(legacy.leaderboard[0].totalPoints),
  );
  assert.equal(result.account?.history.length, 0);
  assert.equal(result.nextCutoff, "2026-11-01T00:00:00.000Z");
  assert.equal(projectPoints(ledger, B, null).account?.total, "0");
  assert.equal(projectPoints(ledger, null, 0).account, null);
});
test("weekly settlements are consecutive, immutable, conserved and idempotent", () => {
  const epoch: PointsEpoch = {
    version: PROGRAM_VERSION,
    start: PROGRAM_START,
    end: "2026-11-01T00:00:00.000Z",
    calculatedAt: "2026-11-01T00:35:00.000Z",
    startBlock: "1",
    endBlock: "2",
    endBlockHash: "0x" + "a".repeat(64),
    ...allocatePoints(new Map([[A, { wallet: 1n, lp: 0n }]])),
  };
  const ledger = appendEpoch(baseline, epoch);
  assert.throws(
    () => projectPoints(ledger, A, null, new Date("2026-10-30T00:00:00Z")),
    /Future/,
  );
  assert.equal(
    projectPoints(ledger, A, null, new Date("2026-11-01T00:40:00Z")).account
      ?.total,
    "10000000",
  );
  assert.throws(() => appendEpoch(ledger, epoch), /already/);
  assert.throws(
    () =>
      appendEpoch(baseline, { ...epoch, start: "2026-10-26T00:00:00.000Z" }),
    /Nonconsecutive/,
  );
  assert.throws(
    () => appendEpoch(baseline, { ...epoch, distributed: "1" }),
    /allocation/,
  );
  assert.throws(
    () =>
      appendEpoch(baseline, {
        ...epoch,
        awards: epoch.awards.map((r) => ({ ...r, walletSeconds: "0" })),
      }),
    /weights/,
  );
  assert.equal(
    nextSunday(new Date("2026-11-01T00:00:00Z")),
    "2026-11-08T00:00:00.000Z",
  );
  assert.equal(
    projectPoints(
      validateLedger(baseline),
      A,
      null,
      new Date("2026-11-01T00:01:00Z"),
    ).status,
    "processing",
  );
  assert.equal(WEEK_SECONDS, 604800);
});
test("range splitting covers every block and a failed chunk never returns partial history", async () => {
  const ranges = await scanLogs(
    async (a, b) => {
      if (b - a > 1500n) throw Error("range limit");
      return [{ a, b }];
    },
    0n,
    5000n,
  );
  let next = 0n;
  for (const r of ranges) {
    assert.equal(r.a, next);
    next = r.b + 1n;
  }
  assert.equal(next, 5001n);
  await assert.rejects(
    scanLogs(
      async (a, b) => {
        if (a >= 2500n) throw Error("missing archive range");
        return [{ a, b }];
      },
      0n,
      80000n,
    ),
  );
});
