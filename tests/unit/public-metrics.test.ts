import { test } from "node:test";
import assert from "node:assert/strict";
import { CONTRACT_ADDRESSES } from "../../config/contracts";
import {
  configuredSysgldAddress,
  formatFixed,
  MAX_GOLD_PRICE_AGE,
  readPublicMetrics,
  usdMarketCap,
} from "../../features/metrics/read";
import type { Address } from "viem";

const now = BigInt(Math.floor(Date.now() / 1000));
const vault = "0x1111111111111111111111111111111111111111" as Address;
function fixture(
  options: {
    chain?: number;
    price?: bigint;
    updatedAt?: bigint;
    supply?: bigint;
    underlying?: Address;
    failPrice?: boolean;
    symbol?: string;
  } = {},
) {
  const calls: {
    functionName?: string;
    address: Address;
    blockNumber: bigint;
  }[] = [];
  const client = {
    getChainId: async () => options.chain ?? 8453,
    getBlockNumber: async () => 123n,
    getBlock: async () => ({ timestamp: now }),
    getBytecode: async (input: (typeof calls)[number]) => {
      calls.push(input);
      return "0x1234";
    },
    readContract: async (input: (typeof calls)[number]) => {
      calls.push(input);
      switch (input.functionName) {
        case "totalSupply":
          return options.supply ?? 2n * 10n ** 18n;
        case "decimals":
          return input.address === CONTRACT_ADDRESSES.CHAINLINK_XAU_USD
            ? 8
            : 18;
        case "symbol":
          return input.address === vault
            ? "sySGLD"
            : (options.symbol ?? "SGLD");
        case "description":
          return "XAU / USD";
        case "latestRoundData":
          if (options.failPrice) throw Error("RPC failure");
          return [
            10n,
            options.price ?? 4000n * 10n ** 8n,
            now,
            options.updatedAt ?? now,
            10n,
          ];
        case "asset":
          return options.underlying ?? CONTRACT_ADDRESSES.SGLD_TOKEN;
        case "convertToAssets":
          return 3n * 10n ** 18n;
        default:
          throw Error("Unexpected read");
      }
    },
  } as unknown as Parameters<typeof readPublicMetrics>[0];
  return { client, calls };
}

test("public valuation uses verified token supply and gold quote at one Base block", async () => {
  const { client, calls } = fixture();
  const data = await readPublicMetrics(client);
  assert.equal(data.sgldMarketCap.value, "$8,000.00");
  assert.equal(data.inventory.value, "193");
  assert.equal(data.sysgldMarketCap.state, "unconfigured");
  assert.ok(calls.every((call) => call.blockNumber === 123n));
  assert.ok(
    calls.every((call) => call.address !== CONTRACT_ADDRESSES.SYSGLD_TOKEN),
  );
  assert.ok(
    calls.every((call) => call.address !== CONTRACT_ADDRESSES.SYNCRATE_ENGINE),
  );
});

test("USD rounding retains integer precision beyond Number.MAX_SAFE_INTEGER", () => {
  assert.equal(
    usdMarketCap(90071992547409931234567890123456789n, 18, 400012345678n, 8),
    "$360,299,090,187,807,812,165.72",
  );
  assert.equal(formatFixed(1999999999999999999n, 18, 2), "2.00");
});

test("zero supply is a real zero market cap rather than a missing value", async () => {
  const data = await readPublicMetrics(fixture({ supply: 0n }).client);
  assert.equal(data.sgldMarketCap.state, "ready");
  assert.equal(data.sgldMarketCap.value, "$0.00");
});

test("wrong network and unexpected token identity cannot produce a valuation", async () => {
  await assert.rejects(
    readPublicMetrics(fixture({ chain: 1 }).client),
    /Wrong metrics network/,
  );
  const data = await readPublicMetrics(fixture({ symbol: "OTHER" }).client);
  assert.equal(data.sgldMarketCap.state, "unavailable");
});

test("stale, future and nonpositive oracle quotes never produce a market cap", async () => {
  for (const options of [
    { updatedAt: now - MAX_GOLD_PRICE_AGE - 1n },
    { updatedAt: now + 1n },
    { price: 0n },
    { price: -1n },
    { failPrice: true },
  ]) {
    const data = await readPublicMetrics(fixture(options).client);
    assert.equal(data.sgldMarketCap.value, null);
    assert.equal(data.inventory.value, "193");
  }
});

test("sySGLD valuation converts shares to verified underlying assets", async () => {
  const data = await readPublicMetrics(fixture().client, vault);
  assert.equal(data.sysgldMarketCap.value, "$12,000.00");
  const unsupported = await readPublicMetrics(
    fixture({ underlying: vault }).client,
    vault,
  );
  assert.equal(unsupported.sysgldMarketCap.state, "unavailable");
});

test("sySGLD address placeholders stay unconfigured and invalid values are rejected", () => {
  assert.equal(configuredSysgldAddress(), undefined);
  assert.equal(
    configuredSysgldAddress(CONTRACT_ADDRESSES.SYSGLD_TOKEN),
    undefined,
  );
  assert.throws(() => configuredSysgldAddress("placeholder"), /Invalid sySGLD/);
});

test("a frozen block cannot make an old RPC snapshot appear current", async () => {
  const { client } = fixture();
  const frozen = {
    ...client,
    getBlock: async () => ({ timestamp: now - 600n }),
  } as unknown as Parameters<typeof readPublicMetrics>[0];
  await assert.rejects(readPublicMetrics(frozen), /Outdated metrics block/);
});
