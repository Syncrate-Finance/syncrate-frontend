import { test } from "node:test";
import assert from "node:assert/strict";
import { type Address } from "viem";
import { CONTRACT_ADDRESSES } from "../../config/contracts";
import { ENGINE_IMPLEMENTATION, STABLECOINS } from "../../features/swap/model";
import {
  readQueuedPayouts,
  readSwapSnapshot,
  type SwapReadClient,
} from "../../features/swap/read";
const user = "0x1111111111111111111111111111111111111111" as Address;
function fixture(
  options: {
    chainId?: number;
    implementation?: string;
    code?: string;
    blockTime?: bigint;
    overrides?: Record<string, unknown>;
    stablecoin?: "USDC" | "USDT";
    next?: bigint;
    length?: bigint;
  } = {},
) {
  const calls: { method: string; args: Record<string, unknown> }[] = [];
  const now = BigInt(Math.floor(Date.now() / 1000));
  const values: Record<string, unknown> = {
    sgldToken: CONTRACT_ADDRESSES.SGLD_TOKEN,
    goldPriceFeed: CONTRACT_ADDRESSES.CHAINLINK_XAU_USD,
    paused: false,
    isAllowedCollateral: true,
    redeemFeeBps: 25n,
    oracleStalenessThreshold: 86400n,
    reserveCap: 193n * 10n ** 18n,
    totalReserved: 0n,
    totalSupply: 10n ** 18n,
    balanceOf: 1000000n,
    allowance: 0n,
    description: "XAU / USD",
    latestRoundData: [100n, 400000000000n, now - 10n, now - 10n, 100n],
    nextQueueIndex: options.next ?? 2n,
    getQueueLength: options.length ?? 30n,
    ...options.overrides,
  };
  const client = {
    getChainId: async () => options.chainId ?? 8453,
    getBlockNumber: async () => 42n,
    getBlock: async (args: Record<string, unknown>) => {
      calls.push({ method: "block", args });
      return { timestamp: options.blockTime ?? now };
    },
    getStorageAt: async (args: Record<string, unknown>) => {
      calls.push({ method: "storage", args });
      return (
        options.implementation ??
        "0x" + "0".repeat(24) + ENGINE_IMPLEMENTATION.slice(2)
      );
    },
    getBytecode: async (args: Record<string, unknown>) => {
      calls.push({ method: "code", args });
      return options.code ?? "0x6001";
    },
    getBalance: async (args: Record<string, unknown>) => {
      calls.push({ method: "balance", args });
      return 10n ** 16n;
    },
    readContract: async (args: Record<string, unknown>) => {
      calls.push({ method: "contract", args });
      const name = String(args.functionName);
      if (Object.hasOwn(options.overrides ?? {}, name))
        return options.overrides![name];
      if (name === "decimals")
        return args.address === CONTRACT_ADDRESSES.CHAINLINK_XAU_USD
          ? 8
          : args.address === CONTRACT_ADDRESSES.SGLD_TOKEN
            ? 18
            : 6;
      if (name === "symbol")
        return args.address === CONTRACT_ADDRESSES.SGLD_TOKEN
          ? "SGLD"
          : (options.stablecoin ?? "USDC");
      if (name === "redemptionQueue") {
        const [index] = args.args as [bigint];
        return [
          index === 4n || index === 29n ? user : CONTRACT_ADDRESSES.SGLD_TOKEN,
          STABLECOINS.USDC.address,
          1000000n,
        ];
      }
      if (!Object.hasOwn(values, name)) throw Error("Unexpected read: " + name);
      return values[name];
    },
  } as unknown as SwapReadClient;
  return { client, calls, now };
}
test("swap data and balances are read coherently at one Base block for either stablecoin", async () => {
  for (const stablecoin of ["USDC", "USDT"] as const) {
    const { client, calls } = fixture({ stablecoin });
    const data = await readSwapSnapshot(client, stablecoin, user);
    assert.equal(data.account, user);
    assert.equal(data.stablecoin, stablecoin);
    assert.equal(data.price, 400000000000n);
    assert.equal(data.blockNumber, 42n);
    for (const call of calls) assert.equal(call.args.blockNumber, 42n);
  }
});
test("unexpected chain, code, implementation, token metadata or feed fail closed", async () => {
  for (const options of [
    { chainId: 1 },
    { code: "0x" },
    { implementation: "0x" + "0".repeat(64) },
    { overrides: { sgldToken: user } },
    { overrides: { goldPriceFeed: user } },
    { overrides: { decimals: 9 } },
    { overrides: { symbol: "FAKE" } },
    { overrides: { description: "ETH / USD" } },
    { overrides: { redeemFeeBps: 501n } },
    { overrides: { oracleStalenessThreshold: 0n } },
  ])
    await assert.rejects(
      readSwapSnapshot(fixture(options).client, "USDC", user),
    );
});
test("oracle freshness follows the engine threshold and rejects incomplete/future/negative rounds", async () => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  assert.equal(
    (
      await readSwapSnapshot(
        fixture({
          overrides: {
            latestRoundData: [2n, 400000000000n, now - 3600n, now - 3600n, 2n],
          },
        }).client,
        "USDC",
      )
    ).priceUpdatedAt,
    now - 3600n,
  );
  for (const round of [
    [2n, 0n, now, now, 2n],
    [2n, -1n, now, now, 2n],
    [0n, 1n, now, now, 0n],
    [2n, 1n, now, now, 1n],
    [2n, 1n, now, 0n, 2n],
    [2n, 1n, now, now + 5n, 2n],
    [2n, 1n, now, now - 86401n, 2n],
  ])
    await assert.rejects(
      readSwapSnapshot(
        fixture({ overrides: { latestRoundData: round } }).client,
        "USDC",
      ),
      /gold price/,
    );
  for (const blockTime of [now - 1000n, now + 1000n])
    await assert.rejects(
      readSwapSnapshot(fixture({ blockTime }).client, "USDC"),
      /outdated/,
    );
});
test("disconnected quotes omit wallet reads rather than implying a zero balance", async () => {
  const { client, calls } = fixture();
  assert.equal((await readSwapSnapshot(client, "USDC")).account, undefined);
  assert.equal(
    calls.some(
      (call) =>
        call.method === "balance" || call.args.functionName === "allowance",
    ),
    false,
  );
});
test("queue scanning is bounded, coherent, paginated and filters by owner", async () => {
  const { client, calls } = fixture();
  const first = await readQueuedPayouts(client, user);
  assert.deepEqual(first.rows, [
    { index: 4n, token: STABLECOINS.USDC.address, amount: 1000000n },
  ]);
  assert.equal(first.nextOffset, 20n);
  assert.equal(
    calls.filter((call) => call.args.functionName === "redemptionQueue").length,
    20,
  );
  const last = await readQueuedPayouts(client, user, first.nextOffset!);
  assert.equal(last.nextOffset, null);
  assert.deepEqual(
    last.rows.map((row) => row.index),
    [29n],
  );
  for (const call of calls) assert.equal(call.args.blockNumber, 42n);
  await assert.rejects(readQueuedPayouts(fixture({ chainId: 1 }).client, user));
  await assert.rejects(readQueuedPayouts(client, user, -1n));
});
