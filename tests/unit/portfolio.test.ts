import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createPublicClient,
  custom,
  encodeFunctionResult,
  erc20Abi,
  toFunctionSelector,
  type Address,
  type Hex,
} from "viem";
import { base } from "viem/chains";
import {
  formatSgldBalance,
  readSgldSnapshot,
  SgldReadError,
} from "../../features/portfolio/sgld-read";
import {
  getOpportunityView,
  EARN_OPPORTUNITIES,
  SAFFRON_POOL_URL,
} from "../../features/opportunities/catalog";
const wallet = "0x1111111111111111111111111111111111111111" as Address;
function fixture(
  options: {
    chainId?: number;
    code?: Hex;
    symbol?: string;
    decimals?: number;
    balance?: bigint;
    fail?: boolean;
  } = {},
) {
  const calls: { method: string; params: unknown }[] = [];
  const client = createPublicClient({
    chain: base,
    transport: custom(
      {
        request: async ({ method, params }) => {
          calls.push({ method, params });
          if (method === "eth_chainId")
            return "0x" + (options.chainId ?? 8453).toString(16);
          if (method === "eth_blockNumber") return "0x2a";
          if (method === "eth_getCode") return options.code ?? "0x60016000";
          if (method === "eth_call") {
            const [transaction] = params as unknown as [{ data: Hex }];
            const selector = transaction.data.slice(0, 10);
            if (selector === toFunctionSelector("balanceOf(address)")) {
              if (options.fail) throw new Error("RPC unavailable");
              return encodeFunctionResult({
                abi: erc20Abi,
                functionName: "balanceOf",
                result: options.balance ?? 1234567890123456789n,
              });
            }
            if (selector === toFunctionSelector("symbol()"))
              return encodeFunctionResult({
                abi: erc20Abi,
                functionName: "symbol",
                result: options.symbol ?? "SGLD",
              });
            if (selector === toFunctionSelector("decimals()"))
              return encodeFunctionResult({
                abi: erc20Abi,
                functionName: "decimals",
                result: options.decimals ?? 18,
              });
          }
          throw new Error("Unexpected RPC method");
        },
      },
      { retryCount: 0 },
    ),
  });
  return { client, calls };
}
test("wallet balance and token identity are read coherently at one Base block", async () => {
  const { client, calls } = fixture();
  const result = await readSgldSnapshot(client, wallet);
  assert.equal(result.balance, 1234567890123456789n);
  assert.equal(result.blockNumber, 42n);
  assert.equal(result.address, wallet);
  const reads = calls.filter(
    (call) => call.method === "eth_call" || call.method === "eth_getCode",
  );
  assert.equal(reads.length, 4);
  for (const read of reads) assert.equal((read.params as unknown[])[1], "0x2a");
  assert.ok(
    calls.every((call) =>
      ["eth_chainId", "eth_blockNumber", "eth_getCode", "eth_call"].includes(
        call.method,
      ),
    ),
  );
});
test("a real zero balance remains distinct from a failed read", async () => {
  assert.equal(
    (await readSgldSnapshot(fixture({ balance: 0n }).client, wallet)).balance,
    0n,
  );
  await assert.rejects(
    readSgldSnapshot(fixture({ fail: true }).client, wallet),
  );
});
test("wrong chain or missing deployed bytecode prevents a trusted balance", async () => {
  await assert.rejects(
    readSgldSnapshot(fixture({ chainId: 1 }).client, wallet),
    (error) => error instanceof SgldReadError && error.code === "wrong-network",
  );
  await assert.rejects(
    readSgldSnapshot(fixture({ code: "0x" }).client, wallet),
    (error) =>
      error instanceof SgldReadError && error.code === "token-unavailable",
  );
});
test("unexpected token metadata is rejected rather than mislabelled SGLD", async () => {
  await assert.rejects(
    readSgldSnapshot(fixture({ symbol: "OTHER" }).client, wallet),
    (error) =>
      error instanceof SgldReadError && error.code === "token-unverified",
  );
  await assert.rejects(
    readSgldSnapshot(fixture({ decimals: 6 }).client, wallet),
    (error) =>
      error instanceof SgldReadError && error.code === "token-unverified",
  );
});
test("invalid wallet addresses are rejected before making a public request", async () => {
  const { client, calls } = fixture();
  await assert.rejects(readSgldSnapshot(client, "0xinvalid" as Address));
  assert.equal(calls.length, 0);
});
test("display formatting preserves large integer precision and distinguishes dust from zero", () => {
  assert.equal(formatSgldBalance(0n), "0");
  assert.equal(formatSgldBalance(1n), "<0.0001");
  assert.equal(formatSgldBalance(1234567890123456789n), "1.2345");
  assert.equal(
    formatSgldBalance(9007199254740993123456789000000000n),
    "9,007,199,254,740,993.1234",
  );
  assert.throws(() => formatSgldBalance(-1n));
});
test("Earn lists only the supplied Saffron LP; staking has its own page", () => {
  const staking = EARN_OPPORTUNITIES.filter(
    (offer) => offer.kind === "staking",
  );
  const liquidity = EARN_OPPORTUNITIES.filter(
    (offer) => offer.kind === "liquidity",
  );
  assert.equal(staking.length, 0);
  assert.equal(liquidity.length, 1);
  assert.equal(EARN_OPPORTUNITIES[0], liquidity[0]);
  assert.equal(liquidity[0].name, "LP on Uniswap");
  assert.equal(liquidity[0].integration, "Saffron");
  assert.equal(liquidity[0].days, 14);
  assert.equal(liquidity[0].depositAsset, "SGLD/USDC");
  assert.equal(liquidity[0].apr, 300);
  assert.equal(liquidity[0].actionUrl, SAFFRON_POOL_URL);
  const pool = new URL(liquidity[0].actionUrl);
  assert.equal(pool.origin, "https://app.uniswap.org");
  assert.equal(
    pool.pathname,
    "/explore/pools/base/0xC5963Bd6d6Cf713F0994fFd867D4d639AD45EC6E",
  );
  assert.equal(EARN_OPPORTUNITIES.length, 1);
  assert.equal(new Set(EARN_OPPORTUNITIES.map((offer) => offer.id)).size, 1);
  assert.ok(
    EARN_OPPORTUNITIES.every(
      (offer) => offer.network === "Base" && offer.apy === null,
    ),
  );
});
test("only the supported positions URL selects the positions view", () => {
  assert.equal(getOpportunityView("positions"), "positions");
  for (const value of [undefined, ["positions"], "<script>", "unexpected"])
    assert.equal(getOpportunityView(value), "all");
});
