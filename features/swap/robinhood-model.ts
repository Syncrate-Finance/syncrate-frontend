import {
  encodeAbiParameters,
  keccak256,
  parseAbi,
  type Address,
  type Hash,
} from "viem";
import type { SwapMode } from "./model";

/** Verified replacement deployment, source dac1784. Old 6155 gateway is retired. */
export const RH = {
  chainId: 4663,
  engine: "0x8D1C9e4B54E143F56Bbd33F861Bc0fB9fb301AE9",
  implementation: "0x64789096edf7a3F64A92aD705e64A06e4CC32888",
  implementationHash:
    "0x43d349edd6f1f1e5749dd34d9554cea69ee9baf9dc11fe1118f1dd318fb3a291",
  controller: "0xddD8d43C21aa8A5Ec60cF92c30b72a3CF4D8C08b",
  controllerHash:
    "0x0b19c5f42f391cd9ec2822ee5e641d3e2f252774af912ff9a162cc27e777d2d5",
  oracle: "0xDbb6D70553c388Eba28860b6d0C7406B840063f3",
  usdg: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
  usdgFeed: "0x61B7e5650328764B076A108EFF5fa7282a1B9aD2",
} as const;
export const rhAbi = parseAbi([
  "function paused() view returns(bool)",
  "function usdg() view returns(address)",
  "function usdgPriceFeed() view returns(address)",
  "function currentUSDGPrice() view returns((uint256 priceUSD18,uint80 roundId,uint256 updatedAt,uint256 observedAt))",
  "function redeemFeeBps() view returns(uint256)",
  "function isAllowedCollateral(address) view returns(bool)",
  "function states(bytes32) view returns(uint8)",
  "function getRequest(bytes32) view returns((bytes32 id,uint8 kind,address owner,address recipient,uint256 amount,uint256 minOutput,uint256 deadline,(uint256 priceUSD18,uint80 roundId,uint256 updatedAt,uint256 observedAt) usdgPrice))",
  "function responseMessages(bytes32) view returns(bytes32)",
  "function received(bytes32) view returns(bool)",
  "function outbox(bytes32) view returns(bytes)",
  "function claimablePayout(bytes32) view returns(uint256)",
  "function requestMinimumNet(bytes32) view returns(uint256)",
  "function requestFeeBps(bytes32) view returns(uint256)",
  "function requestMint(uint256,uint256,uint256,address) returns(bytes32,bytes32)",
  "function requestRedemption(uint256,uint256,uint256,address) returns(bytes32,bytes32)",
  "function requestCancellation(bytes32) returns(bytes32)",
  "function claimRefund(bytes32,address)",
  "function claimRedemption(bytes32,address)",
  "function processPayouts(uint256)",
  "function quoteDispatch(bytes32,bytes) view returns((uint256 nativeFee,uint256 lzTokenFee))",
  "function dispatch(bytes32,bytes) payable returns(bytes32)",
  "function getCollateralValueInUsd(uint256) view returns(uint256)",
  "function MAX_CANONICAL_SUPPLY() view returns(uint256)",
  "event IntentCreated(bytes32 indexed id,uint8 kind,address indexed owner,bytes32 messageId)",
  "event IntentResolved(bytes32 indexed id,bool accepted,uint256 output)",
  "event RedemptionPaid(bytes32 indexed id,address indexed recipient,uint256 net,uint256 fee)",
]);
export const ZERO_HASH = `0x${"0".repeat(64)}` as Hash;
// Type3: executor worker1, option size17, lzReceive1, uint128 gas1500000; no native drop.
export const RECEIVE_OPTIONS =
  "0x0003010011010000000000000000000000000016e360" as const;
export const priceComponents = [
  { name: "priceUSD18", type: "uint256" },
  { name: "roundId", type: "uint80" },
  { name: "updatedAt", type: "uint256" },
  { name: "observedAt", type: "uint256" },
] as const;
export const requestComponents = [
  { name: "id", type: "bytes32" },
  { name: "kind", type: "uint8" },
  { name: "owner", type: "address" },
  { name: "recipient", type: "address" },
  { name: "amount", type: "uint256" },
  { name: "minOutput", type: "uint256" },
  { name: "deadline", type: "uint256" },
  { name: "usdgPrice", type: "tuple", components: priceComponents },
] as const;
export type RemoteRequest = {
  id: Hash;
  kind: number;
  owner: Address;
  recipient: Address;
  amount: bigint;
  minOutput: bigint;
  deadline: bigint;
  usdgPrice: {
    priceUSD18: bigint;
    roundId: bigint;
    updatedAt: bigint;
    observedAt: bigint;
  };
};
export function requestMessage(request: RemoteRequest, cancel = false): Hash {
  const body = encodeAbiParameters(
    [{ type: "tuple", components: requestComponents }],
    [request],
  );
  return keccak256(
    encodeAbiParameters(
      [{ type: "uint8" }, { type: "uint8" }, { type: "bytes" }],
      [2, cancel ? 2 : request.kind, body],
    ),
  );
}
export type RobinhoodSnapshot = {
  account?: Address;
  goldUSD18: bigint;
  usdgUSD18: bigint;
  feeBps: bigint;
  paused: boolean;
  allowed: boolean;
  cap: bigint;
  supply: bigint;
  usdgBalance: bigint;
  sgldBalance: bigint;
  allowance: bigint;
  nativeBalance: bigint;
};
export function quoteRobinhood(
  mode: SwapMode,
  amount: bigint,
  data: RobinhoodSnapshot,
) {
  if (
    amount <= 0n ||
    amount > (1n << 256n) - 1n ||
    data.goldUSD18 <= 0n ||
    data.usdgUSD18 <= 0n ||
    data.feeBps < 0n ||
    data.feeBps > 500n
  )
    throw Error("Quote unavailable.");
  const gross =
    mode === "mint"
      ? (amount * data.usdgUSD18 * 10n ** 12n) / data.goldUSD18
      : (amount * data.goldUSD18) / (data.usdgUSD18 * 10n ** 12n);
  const fee = mode === "redeem" ? (gross * data.feeBps) / 10000n : 0n;
  const output = gross - fee;
  if (output <= 0n) throw Error("Amount is too small.");
  if (mode === "mint" && data.supply + output > data.cap)
    throw Error("Amount exceeds the current available gold inventory.");
  const minimum = (output * 9950n) / 10000n;
  return { output, fee, minimum: minimum > 0n ? minimum : 1n };
}
export function assertRemoteOwner(
  request: RemoteRequest,
  id: Hash,
  account: Address,
) {
  if (
    request.id.toLowerCase() !== id.toLowerCase() ||
    request.owner.toLowerCase() !== account.toLowerCase() ||
    request.recipient.toLowerCase() !== account.toLowerCase() ||
    ![0, 1].includes(request.kind)
  )
    throw Error("This request does not belong to this wallet.");
}
