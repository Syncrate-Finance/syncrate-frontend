import { test } from "node:test";
import assert from "node:assert/strict";
import { encodePacked, type Address, type Hash, type PublicClient } from "viem";
import {
  remoteBlocks,
  readRobinhoodIntent,
} from "../../features/swap/robinhood-read";
import {
  RH,
  RECEIVE_OPTIONS,
  quoteRobinhood,
  requestMessage,
  assertRemoteOwner,
  type RobinhoodSnapshot,
  type RemoteRequest,
} from "../../features/swap/robinhood-model";
import {
  addRemoteId,
  decodeRemoteHistory,
  emptyRemoteHistory,
  remoteHistoryKey,
} from "../../features/swap/robinhood-storage";
import { isMintChain, robinhood } from "../../config/networks";
const owner = "0x1111111111111111111111111111111111111111" as Address;
const id = `0x${"12".repeat(32)}` as Hash;
const data: RobinhoodSnapshot = {
  account: owner,
  goldUSD18: 4000n * 10n ** 18n,
  usdgUSD18: 10n ** 18n,
  feeBps: 25n,
  paused: false,
  allowed: true,
  cap: 193n * 10n ** 18n,
  supply: 10n ** 18n,
  usdgBalance: 10n ** 10n,
  sgldBalance: 10n ** 18n,
  allowance: 0n,
  nativeBalance: 10n ** 16n,
};
test("Robinhood is chain4663 and uses only the verified engine proxy", () => {
  assert.equal(robinhood.id, 4663);
  assert.ok(isMintChain(4663));
  assert.ok(isMintChain(8453));
  assert.ok(!isMintChain(46630));
  assert.equal(
    RH.engine.toLowerCase(),
    "0x8d1c9e4b54e143f56bbd33f861bc0fb9fb301ae9",
  );
  assert.notEqual(RH.engine, RH.implementation);
});
test("USDG quotes use both feed prices, integer floors and principal cap", () => {
  assert.equal(
    quoteRobinhood("mint", 4000n * 10n ** 6n, data).output,
    10n ** 18n,
  );
  assert.equal(
    quoteRobinhood("mint", 4000n * 10n ** 6n, {
      ...data,
      usdgUSD18: 99n * 10n ** 16n,
    }).output,
    99n * 10n ** 16n,
  );
  const redeem = quoteRobinhood("redeem", 10n ** 18n, data);
  assert.equal(redeem.output, 3990n * 10n ** 6n);
  assert.equal(redeem.fee, 10n * 10n ** 6n);
  assert.equal(redeem.minimum, (redeem.output * 9950n) / 10000n);
  assert.throws(
    () =>
      quoteRobinhood("mint", 4000n * 10n ** 6n, { ...data, supply: data.cap }),
    /inventory/,
  );
  for (const bad of [0n, -1n])
    assert.throws(() =>
      quoteRobinhood("mint", 1n, { ...data, usdgUSD18: bad }),
    );
  assert.throws(() => quoteRobinhood("redeem", 1n, data), /small/);
});
test("delivery options encode1.5million gas and no native drop", () => {
  assert.equal(
    RECEIVE_OPTIONS,
    encodePacked(
      ["uint16", "uint8", "uint16", "uint8", "uint128"],
      [3, 1, 17, 1, 1500000n],
    ),
  );
});
test("request IDs are revalidated against ownership and cancellation messages differ", () => {
  const request: RemoteRequest = {
    id,
    kind: 0,
    owner,
    recipient: owner,
    amount: 100n,
    minOutput: 1n,
    deadline: 1000n,
    usdgPrice: {
      priceUSD18: 10n ** 18n,
      roundId: 1n,
      updatedAt: 10n,
      observedAt: 11n,
    },
  };
  assert.doesNotThrow(() => assertRemoteOwner(request, id, owner));
  assert.throws(
    () => assertRemoteOwner({ ...request, owner: RH.engine }, id, owner),
    /belong/,
  );
  assert.throws(
    () => assertRemoteOwner({ ...request, recipient: RH.engine }, id, owner),
    /belong/,
  );
  assert.notEqual(requestMessage(request), requestMessage(request, true));
  assert.notEqual(
    requestMessage(request),
    requestMessage({ ...request, amount: 101n }),
  );
});
test("pending recovery is chain/account scoped and malformed storage cannot supply a transaction", () => {
  assert.notEqual(remoteHistoryKey(owner), remoteHistoryKey(RH.engine));
  for (const value of [
    null,
    "bad",
    JSON.stringify({ version: 1, ids: ["not a hash"], pending: null }),
    JSON.stringify({
      version: 1,
      ids: [],
      pending: { hash: id, chainId: 1, action: "mint" },
    }),
  ])
    assert.deepEqual(decodeRemoteHistory(value), emptyRemoteHistory());
  const history = addRemoteId(addRemoteId(emptyRemoteHistory(), id), id);
  assert.equal(history.ids.length, 1);
  const pending = {
    ...history,
    pending: { hash: id, chainId: 4663, action: "mint" },
  };
  assert.deepEqual(decodeRemoteHistory(JSON.stringify(pending)), pending);
});

test("cross-chain reads reject wrong chains and stale/future blocks before quoting", async () => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const fixture = (id: number, timestamp = now) =>
    ({
      getChainId: async () => id,
      getBlockNumber: async () => 1000n,
      getBlock: async () => ({ timestamp }),
    }) as unknown as PublicClient;
  const result = await remoteBlocks(fixture(8453), fixture(4663));
  assert.equal(result.remoteBlock, 968n);
  await assert.rejects(
    remoteBlocks(fixture(1), fixture(4663)),
    /configuration/,
  );
  await assert.rejects(
    remoteBlocks(fixture(8453), fixture(4663, now - 121n)),
    /outdated/,
  );
  await assert.rejects(
    remoteBlocks(fixture(8453, now + 31n), fixture(4663)),
    /outdated/,
  );
});

test("imported history never authorizes actions for a different wallet", async () => {
  const common = {
    getBlockNumber: async () => 1000n,
    getBlock: async () => ({
      timestamp: BigInt(Math.floor(Date.now() / 1000)),
    }),
  };
  const base = {
    ...common,
    getChainId: async () => 8453,
  } as unknown as PublicClient;
  const remote = {
    ...common,
    getChainId: async () => 4663,
    readContract: async () => ({
      id,
      owner: RH.engine,
      recipient: owner,
      kind: 0,
    }),
  } as unknown as PublicClient;
  await assert.rejects(readRobinhoodIntent(base, remote, id, owner), /belong/);
});
