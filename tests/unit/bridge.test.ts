import { test } from "node:test";
import assert from "node:assert/strict";
import {
  encodeFunctionData,
  encodeAbiParameters,
  encodeEventTopics,
  keccak256,
  type Address,
  type Hash,
  type PublicClient,
} from "viem";
import {
  bridgeAbi,
  bridgeContract,
  bridgePayload,
  readBridgeTransfer,
  decodeBridgeStore,
  emptyBridgeStore,
  bridgeStoreKey,
  type BridgeChain,
} from "../../features/swap/bridge-model";
const owner = "0x1111111111111111111111111111111111111111" as Address,
  other = "0x2222222222222222222222222222222222222222" as Address;
const hash = `0x${"aa".repeat(32)}` as Hash,
  id = `0x${"bb".repeat(32)}` as Hash,
  blockHash = `0x${"cc".repeat(32)}` as Hash;
function fixture(chain: BridgeChain) {
  const amount = 10n ** 18n,
    payload = bridgePayload(chain, id, owner, amount),
    messageId = keccak256(payload),
    eventName = chain === 8453 ? "BackingLocked" : "BridgeBurned";
  const tx = {
    hash,
    from: owner,
    to: bridgeContract(chain) as Address,
    value: 0n,
    input: encodeFunctionData({
      abi: bridgeAbi,
      functionName: chain === 8453 ? "bridgeToRobinhood" : "bridgeToBase",
      args: [amount, owner],
    }),
  };
  const receipt = {
    transactionHash: hash,
    status: "success",
    blockNumber: 100n,
    blockHash,
    logs: [
      {
        address: bridgeContract(chain),
        topics: encodeEventTopics({
          abi: bridgeAbi,
          eventName,
          args: { id, recipient: owner },
        }),
        data: encodeAbiParameters(
          [{ type: "uint256" }, { type: "bytes32" }],
          [amount, messageId],
        ),
      },
    ],
  };
  const source = {
    getChainId: async () => chain,
    getTransaction: async () => tx,
    getTransactionReceipt: async () => receipt,
    getBlock: async () => ({ hash: blockHash }),
    readContract: async () => payload,
  };
  const destination = {
    getChainId: async () => (chain === 8453 ? 4663 : 8453),
    readContract: async () => false,
  };
  return {
    source: source as unknown as PublicClient,
    destination: destination as unknown as PublicClient,
    tx,
    receipt,
    payload,
  };
}
test("both bridge directions bind the user's exact transaction, receipt and authenticated outbox", async () => {
  for (const chain of [8453, 4663] as const) {
    const f = fixture(chain);
    const t = await readBridgeTransfer(
      f.source,
      f.destination,
      chain,
      hash,
      owner,
    );
    assert.equal(t.amount, 10n ** 18n);
    assert.equal(t.delivered, false);
    assert.equal(t.messageId, keccak256(f.payload));
  }
  assert.notEqual(
    bridgePayload(8453, id, owner, 1n),
    bridgePayload(4663, id, owner, 1n),
  );
});
test("foreign-wallet, redirected, substituted and reorged transfers cannot fund a dispatch", async () => {
  {
    const f = fixture(8453);
    await assert.rejects(
      readBridgeTransfer(f.source, f.destination, 8453, hash, other),
    );
  }
  {
    const f = fixture(8453);
    f.tx.to = other;
    await assert.rejects(
      readBridgeTransfer(f.source, f.destination, 8453, hash, owner),
    );
  }
  {
    const f = fixture(8453);
    f.tx.input = encodeFunctionData({
      abi: bridgeAbi,
      functionName: "bridgeToRobinhood",
      args: [10n ** 18n, other],
    });
    await assert.rejects(
      readBridgeTransfer(f.source, f.destination, 8453, hash, owner),
    );
  }
  {
    const f = fixture(4663);
    f.receipt.blockHash = id;
    await assert.rejects(
      readBridgeTransfer(f.source, f.destination, 4663, hash, owner),
    );
  }
  {
    const f = fixture(4663);
    f.source.readContract = (async () => "0x") as never;
    await assert.rejects(
      readBridgeTransfer(f.source, f.destination, 4663, hash, owner),
      /outbox/,
    );
  }
  {
    const f = fixture(8453);
    f.receipt.logs = [];
    await assert.rejects(
      readBridgeTransfer(f.source, f.destination, 8453, hash, owner),
    );
  }
});
test("bridge recovery is wallet scoped, bounded and rejects unknown networks or pending actions", () => {
  assert.notEqual(bridgeStoreKey(owner), bridgeStoreKey(other));
  const valid = {
    version: 1,
    transfers: [{ chainId: 8453, hash }],
    pending: { chainId: 4663, hash, action: "bridge" },
  };
  assert.deepEqual(decodeBridgeStore(JSON.stringify(valid)), valid);
  for (const bad of [
    null,
    "no",
    JSON.stringify({ ...valid, transfers: [{ chainId: 1, hash }] }),
    JSON.stringify({
      ...valid,
      pending: { chainId: 4663, hash, action: "mint" },
    }),
    JSON.stringify({ ...valid, transfers: Array(21).fill(valid.transfers[0]) }),
  ])
    assert.deepEqual(decodeBridgeStore(bad), emptyBridgeStore());
});
