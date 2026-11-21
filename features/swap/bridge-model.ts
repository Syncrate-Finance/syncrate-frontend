import {
  decodeFunctionData,
  decodeEventLog,
  encodeAbiParameters,
  erc20Abi,
  keccak256,
  parseAbi,
  type Address,
  type Hash,
  type PublicClient,
} from "viem";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { RH, rhAbi } from "./robinhood-model";
import { IMPLEMENTATION_SLOT } from "./model";
import { remoteBlocks } from "./robinhood-read";
export type BridgeChain = 8453 | 4663;
export const bridgeAbi = parseAbi([
  "function bridgeToRobinhood(uint256 amount,address recipient) returns(bytes32 id,bytes32 messageId)",
  "function bridgeToBase(uint256 amount,address recipient) returns(bytes32 id,bytes32 messageId)",
  "event BackingLocked(bytes32 indexed id,address indexed recipient,uint256 amount,bytes32 messageId)",
  "event BridgeBurned(bytes32 indexed id,address indexed recipient,uint256 amount,bytes32 messageId)",
]);
export const bridgeContract = (chain: BridgeChain) =>
  chain === 8453 ? RH.controller : RH.engine;
export const bridgeToken = (chain: BridgeChain) =>
  chain === 8453 ? CONTRACT_ADDRESSES.SGLD_TOKEN : RH.engine;
export const bridgeNetwork = (chain: BridgeChain) =>
  chain === 8453 ? "Base" : "Robinhood";
export const bridgeTarget = (chain: BridgeChain): BridgeChain =>
  chain === 8453 ? 4663 : 8453;
export function bridgePayload(
  chain: BridgeChain,
  id: Hash,
  recipient: Address,
  amount: bigint,
) {
  return encodeAbiParameters(
    [{ type: "uint8" }, { type: "uint8" }, { type: "bytes" }],
    [
      2,
      chain === 8453 ? 4 : 5,
      encodeAbiParameters(
        [{ type: "bytes32" }, { type: "address" }, { type: "uint256" }],
        [id, recipient, amount],
      ),
    ],
  );
}
/** Every imported transaction is re-read, tied to the wallet and matched to its exact outbox. */
export async function readBridgeTransfer(
  source: PublicClient,
  destination: PublicClient,
  chain: BridgeChain,
  hash: Hash,
  owner: Address,
) {
  if (
    (await source.getChainId()) !== chain ||
    (await destination.getChainId()) !== bridgeTarget(chain)
  )
    throw Error("Wrong bridge network");
  const [tx, receipt] = await Promise.all([
    source.getTransaction({ hash }),
    source.getTransactionReceipt({ hash }),
  ]);
  if (
    tx.hash !== hash ||
    receipt.transactionHash !== hash ||
    receipt.status !== "success" ||
    tx.from.toLowerCase() !== owner.toLowerCase() ||
    tx.to?.toLowerCase() !== bridgeContract(chain).toLowerCase() ||
    tx.value !== 0n
  )
    throw Error("This transaction is not a bridge from this wallet.");
  const call = decodeFunctionData({ abi: bridgeAbi, data: tx.input });
  const expected = chain === 8453 ? "bridgeToRobinhood" : "bridgeToBase";
  if (
    call.functionName !== expected ||
    !call.args ||
    call.args[0] <= 0n ||
    call.args[1].toLowerCase() !== owner.toLowerCase()
  )
    throw Error("This transfer is not addressed to this wallet.");
  if (
    (await source.getBlock({ blockNumber: receipt.blockNumber })).hash !==
    receipt.blockHash
  )
    throw Error("Bridge receipt is no longer canonical.");
  const eventName = chain === 8453 ? "BackingLocked" : "BridgeBurned";
  const matches = receipt.logs
    .filter(
      (log) =>
        log.address.toLowerCase() === bridgeContract(chain).toLowerCase(),
    )
    .flatMap((log) => {
      try {
        const e = decodeEventLog({
          abi: bridgeAbi,
          eventName,
          data: log.data,
          topics: log.topics,
          strict: true,
        });
        return [e.args];
      } catch {
        return [];
      }
    });
  if (
    matches.length !== 1 ||
    matches[0].recipient.toLowerCase() !== owner.toLowerCase() ||
    matches[0].amount !== call.args[0]
  )
    throw Error("Bridge event does not match the transaction.");
  const event = matches[0],
    payload = bridgePayload(chain, event.id, owner, event.amount);
  if (keccak256(payload) !== event.messageId)
    throw Error("Invalid bridge message");
  const stored = await source.readContract({
    address: bridgeContract(chain),
    abi: rhAbi,
    functionName: "outbox",
    args: [event.messageId],
  });
  if (stored !== payload) throw Error("Bridge outbox mismatch");
  const delivered = await destination.readContract({
    address: bridgeContract(bridgeTarget(chain)),
    abi: rhAbi,
    functionName: "received",
    args: [event.messageId],
  });
  return {
    chainId: chain,
    hash,
    id: event.id,
    messageId: event.messageId,
    amount: event.amount,
    delivered,
  };
}
export async function readBridgeSnapshot(
  base: PublicClient,
  remote: PublicClient,
  chain: BridgeChain,
  owner: Address,
) {
  const blocks = await remoteBlocks(base, remote);
  const [slot, impl, controller, bp, rp] = await Promise.all([
    remote.getStorageAt({
      address: RH.engine,
      slot: IMPLEMENTATION_SLOT,
      blockNumber: blocks.remoteBlock,
    }),
    remote.getBytecode({
      address: RH.implementation,
      blockNumber: blocks.remoteBlock,
    }),
    base.getBytecode({ address: RH.controller, blockNumber: blocks.baseBlock }),
    base.readContract({
      address: RH.controller,
      abi: rhAbi,
      functionName: "paused",
      blockNumber: blocks.baseBlock,
    }),
    remote.readContract({
      address: RH.engine,
      abi: rhAbi,
      functionName: "paused",
      blockNumber: blocks.remoteBlock,
    }),
  ]);
  if (
    slot?.slice(-40).toLowerCase() !==
      RH.implementation.slice(2).toLowerCase() ||
    !impl ||
    keccak256(impl) !== RH.implementationHash ||
    !controller ||
    keccak256(controller) !== RH.controllerHash
  )
    throw Error("Contract configuration changed.");
  const client = chain === 8453 ? base : remote,
    blockNumber = chain === 8453 ? blocks.baseBlock : blocks.remoteBlock;
  const [balance, allowance] = await Promise.all([
    client.readContract({
      address: bridgeToken(chain),
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner],
      blockNumber,
    }),
    chain === 8453
      ? client.readContract({
          address: bridgeToken(chain),
          abi: erc20Abi,
          functionName: "allowance",
          args: [owner, bridgeContract(chain)],
          blockNumber,
        })
      : Promise.resolve(0n),
  ]);
  return { balance, allowance, paused: bp || rp };
}
export type SavedBridge = { chainId: BridgeChain; hash: Hash };
export type BridgeStore = {
  version: 1;
  transfers: SavedBridge[];
  pending: (SavedBridge & { action: "approve" | "bridge" | "dispatch" }) | null;
};
export const emptyBridgeStore = (): BridgeStore => ({
  version: 1,
  transfers: [],
  pending: null,
});
export const bridgeStoreKey = (owner: Address) =>
  `syncrate-bridge-v1:${owner.toLowerCase()}`;
export function decodeBridgeStore(raw: string | null): BridgeStore {
  try {
    const v = JSON.parse(raw ?? "null");
    const record = (r: unknown): boolean =>
      Boolean(
        r &&
          typeof r === "object" &&
          [8453, 4663].includes(Reflect.get(r, "chainId")) &&
          /^0x[\da-f]{64}$/i.test(Reflect.get(r, "hash")),
      );
    if (
      v?.version !== 1 ||
      !Array.isArray(v.transfers) ||
      v.transfers.length > 20 ||
      !v.transfers.every(record) ||
      (v.pending &&
        (!record(v.pending) ||
          !["approve", "bridge", "dispatch"].includes(v.pending.action)))
    )
      return emptyBridgeStore();
    return {
      version: 1,
      transfers: v.transfers.map((r: SavedBridge) => ({
        chainId: r.chainId,
        hash: r.hash,
      })),
      pending: v.pending
        ? {
            chainId: v.pending.chainId,
            hash: v.pending.hash,
            action: v.pending.action,
          }
        : null,
    };
  } catch {
    return emptyBridgeStore();
  }
}
