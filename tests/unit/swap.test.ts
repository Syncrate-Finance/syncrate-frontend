import { test } from "node:test";
import assert from "node:assert/strict";
import {
  encodeAbiParameters,
  encodeEventTopics,
  type Address,
  type Hex,
  type Log,
} from "viem";
import { CONTRACT_ADDRESSES } from "../../config/contracts";
import { engineAbi } from "../../features/swap/engine-abi";
import {
  assertWalletContext,
  displayAmount,
  parseAmount,
  quoteSwap,
  requiredAction,
  STABLECOINS,
  type SwapSnapshot,
} from "../../features/swap/model";
import {
  hasApprovalReceipt,
  readSwapOutcome,
} from "../../features/swap/receipt";
import { decodePending, encodePending } from "../../features/swap/pending";

const account = "0x1111111111111111111111111111111111111111" as Address;
export function snapshot(change: Partial<SwapSnapshot> = {}): SwapSnapshot {
  return {
    account,
    blockNumber: 42n,
    observedAt: Date.now(),
    stablecoin: "USDC",
    price: 400012345678n,
    priceUpdatedAt: 1n,
    oracleMaxAge: 86400n,
    feeBps: 25n,
    allowed: true,
    paused: false,
    reserveCap: 193n * 10n ** 18n,
    reserved: 0n,
    totalSupply: 2n * 10n ** 18n,
    stableBuffer: 10000000000n,
    stableBalance: 10000000000n,
    sgldBalance: 2n * 10n ** 18n,
    stableAllowance: 0n,
    sgldAllowance: 0n,
    nativeBalance: 10n ** 16n,
    ...change,
  };
}
test("amount parsing never rounds money and rejects ambiguous, zero and uint256 overflow inputs", () => {
  assert.equal(parseAmount("12.345678", 6), 12345678n);
  assert.equal(parseAmount("0.000000000000000001", 18), 1n);
  for (const invalid of [
    "",
    "0",
    "0.000000",
    "-1",
    "1e6",
    "1,000",
    " 1",
    "1 ",
    ".5",
    "1.0000001",
    "9".repeat(90),
  ])
    assert.throws(() => parseAmount(invalid, 6));
});
test("mint and redeem estimates match integer engine settlement and fee rounding", () => {
  const data = snapshot();
  const mint = quoteSwap("mint", 123456789n, data);
  assert.equal(mint.output, (123456789n * 10n ** 20n) / data.price);
  assert.equal(mint.fee, 0n);
  for (const feeBps of [0n, 25n, 500n]) {
    const input = 12345678901234567n;
    const gross = (input * data.price) / 10n ** 20n;
    const result = quoteSwap("redeem", input, snapshot({ feeBps }));
    assert.equal(result.fee, (gross * feeBps) / 10000n);
    assert.equal(result.output, gross - result.fee);
  }
  assert.throws(() => quoteSwap("redeem", 1n, data), /too small/);
  assert.throws(() => quoteSwap("mint", 1n, snapshot({ price: 0n })));
  assert.throws(() => quoteSwap("mint", 1n, snapshot({ feeBps: 501n })));
});
test("reserve capacity includes reservations and queue prediction includes the fee", () => {
  const data = snapshot({
    price: 4000n * 10n ** 8n,
    totalSupply: 192n * 10n ** 18n,
    reserved: 10n ** 18n,
  });
  assert.throws(() => quoteSwap("mint", 1000000n, data), /capacity/);
  const q = quoteSwap("redeem", 10n ** 18n, data);
  assert.equal(
    quoteSwap(
      "redeem",
      10n ** 18n,
      snapshot({ price: data.price, stableBuffer: q.output }),
    ).queues,
    true,
  );
  assert.equal(
    quoteSwap(
      "redeem",
      10n ** 18n,
      snapshot({ price: data.price, stableBuffer: q.output + q.fee }),
    ).queues,
    false,
  );
});
test("approval steps are amount limited and never bypass wallet/balance/network-fee guards", () => {
  assert.equal(requiredAction("mint", 100n, snapshot()), "approve");
  assert.equal(
    requiredAction("mint", 100n, snapshot({ stableAllowance: 50n })),
    "reset",
  );
  assert.equal(
    requiredAction("mint", 100n, snapshot({ stableAllowance: 100n })),
    "swap",
  );
  assert.equal(
    requiredAction(
      "redeem",
      10n ** 18n,
      snapshot({ sgldAllowance: 10n ** 18n }),
    ),
    "swap",
  );
  for (const change of [
    { account: undefined },
    { paused: true },
    { allowed: false },
    { observedAt: Date.now() - 31000 },
    { stableBalance: 1n },
    { nativeBalance: 0n },
  ])
    assert.throws(() => requiredAction("mint", 100n, snapshot(change)));
  assert.throws(
    () => requiredAction("redeem", 3n * 10n ** 18n, snapshot()),
    /Insufficient/,
  );
});
test("account changes, disconnects and chain changes invalidate an in-flight review", () => {
  assert.doesNotThrow(() =>
    assertWalletContext(account, {
      address: account,
      chainId: 8453,
      connected: true,
    }),
  );
  for (const change of [
    { connected: false },
    { chainId: 1 },
    { address: CONTRACT_ADDRESSES.SGLD_TOKEN },
  ])
    assert.throws(
      () =>
        assertWalletContext(account, {
          address: account,
          chainId: 8453,
          connected: true,
          ...change,
        }),
      /Wallet changed/,
    );
});
test("display keeps large integer precision and does not turn dust into zero", () => {
  assert.equal(displayAmount(1n, 18), "<0.000001");
  assert.equal(displayAmount(0n, 18), "0");
  assert.equal(
    displayAmount(900719925474099312345678n, 6),
    "900,719,925,474,099,312.345678",
  );
});
function eventLog(
  kind: "minted" | "paid" | "queued",
  user = account,
): Log<bigint, number, false> {
  const topics =
    kind === "minted"
      ? encodeEventTopics({
          abi: engineAbi,
          eventName: "SGLDMinted",
          args: { user, collateralToken: STABLECOINS.USDC.address },
        })
      : kind === "paid"
        ? encodeEventTopics({
            abi: engineAbi,
            eventName: "SGLDRedeemedImmediate",
            args: { user, stablecoin: STABLECOINS.USDC.address },
          })
        : encodeEventTopics({
            abi: engineAbi,
            eventName: "SGLDRedemptionQueued",
            args: {
              queueIndex: 99n,
              user,
              stablecoin: STABLECOINS.USDC.address,
            },
          });
  const data =
    kind === "minted"
      ? encodeAbiParameters(
          [{ type: "uint256" }, { type: "uint256" }],
          [1000n, 123n],
        )
      : kind === "paid"
        ? encodeAbiParameters(
            [{ type: "uint256" }, { type: "uint256" }, { type: "uint256" }],
            [123n, 900n, 2n],
          )
        : encodeAbiParameters(
            [{ type: "uint256" }, { type: "uint256" }],
            [123n, 900n],
          );
  const hash = ("0x" + "0".repeat(64)) as Hex;
  return {
    address: CONTRACT_ADDRESSES.SYNCRATE_ENGINE,
    topics: topics as [Hex, ...Hex[]],
    data,
    blockHash: hash,
    blockNumber: 42n,
    logIndex: 0,
    transactionHash: hash,
    transactionIndex: 0,
    removed: false,
  };
}
test("settlement feedback uses engine events and distinguishes queued from paid", () => {
  assert.deepEqual(
    readSwapOutcome(
      { status: "success", logs: [eventLog("minted")] },
      account,
      "mint",
      "USDC",
      123n,
    ),
    { kind: "minted", amount: 1000n },
  );
  assert.deepEqual(
    readSwapOutcome(
      { status: "success", logs: [eventLog("paid")] },
      account,
      "redeem",
      "USDC",
      123n,
    ),
    { kind: "paid", amount: 900n },
  );
  assert.deepEqual(
    readSwapOutcome(
      { status: "success", logs: [eventLog("queued")] },
      account,
      "redeem",
      "USDC",
      123n,
    ),
    { kind: "queued", amount: 900n, queueIndex: 99n },
  );
  assert.throws(() =>
    readSwapOutcome(
      { status: "reverted", logs: [] },
      account,
      "mint",
      "USDC",
      123n,
    ),
  );
});
test("unrelated events cannot fabricate a successful swap", () => {
  const log = eventLog("minted");
  for (const logs of [
    [],
    [{ ...log, address: STABLECOINS.USDC.address }],
    [eventLog("minted", CONTRACT_ADDRESSES.SGLD_TOKEN)],
    [{ ...log, data: "0x" as const }],
  ])
    assert.equal(
      readSwapOutcome(
        { status: "success", logs },
        account,
        "mint",
        "USDC",
        123n,
      ),
      undefined,
    );
  assert.equal(
    readSwapOutcome(
      { status: "success", logs: [log] },
      account,
      "mint",
      "USDT",
      123n,
    ),
    undefined,
  );
  assert.equal(
    readSwapOutcome(
      { status: "success", logs: [log] },
      account,
      "mint",
      "USDC",
      124n,
    ),
    undefined,
  );
  assert.equal(
    readSwapOutcome(
      { status: "success", logs: [log] },
      account,
      "redeem",
      "USDC",
      123n,
    ),
    undefined,
  );
});
test("refresh recovery retains transaction context and rejects malformed stored data", () => {
  const pending = {
    hash: ("0x" + "a".repeat(64)) as `0x${string}`,
    review: {
      account,
      mode: "mint" as const,
      stablecoin: "USDC" as const,
      amount: 123n,
      action: "swap" as const,
    },
  };
  assert.deepEqual(decodePending(encodePending(pending)), pending);
  for (const raw of [
    null,
    "bad json",
    "{}",
    "null",
    "x".repeat(1501),
    encodePending(pending).replace("USDC", "FAKE"),
    encodePending(pending).replace('"123"', '"1e6"'),
    encodePending(pending).replace('"version":1', '"version":2'),
  ])
    assert.equal(decodePending(raw), null);
});
test("approval feedback requires the exact input token, owner, spender and amount", () => {
  const hash = ("0x" + "0".repeat(64)) as Hex;
  const log: Log<bigint, number, false> = {
    ...eventLog("minted"),
    address: STABLECOINS.USDC.address,
    topics: encodeEventTopics({
      abi: [
        {
          type: "event",
          name: "Approval",
          inputs: [
            { type: "address", name: "owner", indexed: true },
            { type: "address", name: "spender", indexed: true },
            { type: "uint256", name: "value", indexed: false },
          ],
        },
      ],
      eventName: "Approval",
      args: { owner: account, spender: CONTRACT_ADDRESSES.SYNCRATE_ENGINE },
    }) as [Hex, ...Hex[]],
    data: encodeAbiParameters([{ type: "uint256" }], [123n]),
    transactionHash: hash,
  };
  const receipt = { status: "success" as const, logs: [log] };
  assert.equal(
    hasApprovalReceipt(receipt, account, "mint", "USDC", 123n),
    true,
  );
  assert.equal(
    hasApprovalReceipt(receipt, account, "mint", "USDC", 124n),
    false,
  );
  assert.equal(
    hasApprovalReceipt(receipt, account, "mint", "USDT", 123n),
    false,
  );
  assert.equal(
    hasApprovalReceipt(
      receipt,
      CONTRACT_ADDRESSES.SGLD_TOKEN,
      "mint",
      "USDC",
      123n,
    ),
    false,
  );
  assert.equal(
    hasApprovalReceipt(
      { ...receipt, status: "reverted" },
      account,
      "mint",
      "USDC",
      123n,
    ),
    false,
  );
});
