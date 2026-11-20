import {
  erc20Abi,
  keccak256,
  type Address,
  type Hash,
  type PublicClient,
} from "viem";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { IMPLEMENTATION_SLOT } from "./model";
import {
  RH,
  rhAbi,
  ZERO_HASH,
  requestMessage,
  assertRemoteOwner,
  type RobinhoodSnapshot,
} from "./robinhood-model";

export async function remoteBlocks(base: PublicClient, remote: PublicClient) {
  const [baseId, remoteId] = await Promise.all([
    base.getChainId(),
    remote.getChainId(),
  ]);
  if (baseId !== 8453 || remoteId !== 4663)
    throw Error("Network configuration is unavailable.");
  const [b, r] = await Promise.all([
    base.getBlockNumber({ cacheTime: 0 }),
    remote.getBlockNumber({ cacheTime: 0 }),
  ]);
  // RH public RPC intermittently rejects reads at the tip. Never use an invented fallback result.
  const [bb, rb] = await Promise.all([
    base.getBlock({ blockNumber: b }),
    remote.getBlock({ blockNumber: r - 32n }),
  ]);
  const now = BigInt(Math.floor(Date.now() / 1000));
  for (const block of [bb, rb])
    if (now - block.timestamp > 120n || block.timestamp > now + 30n)
      throw Error("Network data is outdated. Refresh before continuing.");
  return { baseBlock: b, remoteBlock: r - 32n, timestamp: rb.timestamp };
}
export async function readRobinhoodSnapshot(
  base: PublicClient,
  remote: PublicClient,
  account?: Address,
): Promise<RobinhoodSnapshot> {
  const { baseBlock, remoteBlock } = await remoteBlocks(base, remote);
  const engine = RH.engine;
  const [
    implementation,
    implCode,
    baseCode,
    usdg,
    feed,
    remotePaused,
    basePaused,
    allowed,
    price,
    gold,
    fee,
    cap,
    supply,
  ] = await Promise.all([
    remote.getStorageAt({
      address: engine,
      slot: IMPLEMENTATION_SLOT,
      blockNumber: remoteBlock,
    }),
    remote.getBytecode({
      address: RH.implementation,
      blockNumber: remoteBlock,
    }),
    base.getBytecode({ address: RH.controller, blockNumber: baseBlock }),
    remote.readContract({
      address: engine,
      abi: rhAbi,
      functionName: "usdg",
      blockNumber: remoteBlock,
    }),
    remote.readContract({
      address: engine,
      abi: rhAbi,
      functionName: "usdgPriceFeed",
      blockNumber: remoteBlock,
    }),
    remote.readContract({
      address: engine,
      abi: rhAbi,
      functionName: "paused",
      blockNumber: remoteBlock,
    }),
    base.readContract({
      address: RH.controller,
      abi: rhAbi,
      functionName: "paused",
      blockNumber: baseBlock,
    }),
    remote.readContract({
      address: engine,
      abi: rhAbi,
      functionName: "isAllowedCollateral",
      args: [RH.usdg],
      blockNumber: remoteBlock,
    }),
    remote.readContract({
      address: engine,
      abi: rhAbi,
      functionName: "currentUSDGPrice",
      blockNumber: remoteBlock,
    }),
    base.readContract({
      address: RH.oracle,
      abi: rhAbi,
      functionName: "getCollateralValueInUsd",
      args: [10n ** 18n],
      blockNumber: baseBlock,
    }),
    remote.readContract({
      address: engine,
      abi: rhAbi,
      functionName: "redeemFeeBps",
      blockNumber: remoteBlock,
    }),
    base.readContract({
      address: CONTRACT_ADDRESSES.SGLD_TOKEN,
      abi: rhAbi,
      functionName: "MAX_CANONICAL_SUPPLY",
      blockNumber: baseBlock,
    }),
    base.readContract({
      address: CONTRACT_ADDRESSES.SGLD_TOKEN,
      abi: erc20Abi,
      functionName: "totalSupply",
      blockNumber: baseBlock,
    }),
  ]);
  if (
    implementation?.slice(-40).toLowerCase() !==
      RH.implementation.slice(2).toLowerCase() ||
    !implCode ||
    keccak256(implCode) !== RH.implementationHash ||
    !baseCode ||
    keccak256(baseCode) !== RH.controllerHash ||
    usdg.toLowerCase() !== RH.usdg.toLowerCase() ||
    feed.toLowerCase() !== RH.usdgFeed.toLowerCase()
  )
    throw Error("Contract configuration changed. Please contact Syncrate.");
  const [usdgBalance, sgldBalance, allowance, nativeBalance] = account
    ? await Promise.all([
        remote.readContract({
          address: RH.usdg,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [account],
          blockNumber: remoteBlock,
        }),
        remote.readContract({
          address: engine,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [account],
          blockNumber: remoteBlock,
        }),
        remote.readContract({
          address: RH.usdg,
          abi: erc20Abi,
          functionName: "allowance",
          args: [account, engine],
          blockNumber: remoteBlock,
        }),
        remote.getBalance({ address: account, blockNumber: remoteBlock }),
      ])
    : [0n, 0n, 0n, 0n];
  return {
    account,
    goldUSD18: gold,
    usdgUSD18: price.priceUSD18,
    feeBps: fee,
    paused: remotePaused || basePaused,
    allowed,
    cap,
    supply,
    usdgBalance,
    sgldBalance,
    allowance,
    nativeBalance,
  };
}
export async function readRobinhoodIntent(
  base: PublicClient,
  remote: PublicClient,
  id: Hash,
  account: Address,
) {
  const { baseBlock, remoteBlock, timestamp } = await remoteBlocks(
    base,
    remote,
  );
  const request = await remote.readContract({
    address: RH.engine,
    abi: rhAbi,
    functionName: "getRequest",
    args: [id],
    blockNumber: remoteBlock,
  });
  assertRemoteOwner(request, id, account);
  const message = requestMessage(request),
    cancellation = requestMessage(request, true);
  const [
    state,
    baseState,
    response,
    claimable,
    cancellationPayload,
    minNet,
    feeBps,
  ] = await Promise.all([
    remote.readContract({
      address: RH.engine,
      abi: rhAbi,
      functionName: "states",
      args: [id],
      blockNumber: remoteBlock,
    }),
    base.readContract({
      address: RH.controller,
      abi: rhAbi,
      functionName: "states",
      args: [id],
      blockNumber: baseBlock,
    }),
    base.readContract({
      address: RH.controller,
      abi: rhAbi,
      functionName: "responseMessages",
      args: [id],
      blockNumber: baseBlock,
    }),
    remote.readContract({
      address: RH.engine,
      abi: rhAbi,
      functionName: "claimablePayout",
      args: [id],
      blockNumber: remoteBlock,
    }),
    remote.readContract({
      address: RH.engine,
      abi: rhAbi,
      functionName: "outbox",
      args: [cancellation],
      blockNumber: remoteBlock,
    }),
    remote.readContract({
      address: RH.engine,
      abi: rhAbi,
      functionName: "requestMinimumNet",
      args: [id],
      blockNumber: remoteBlock,
    }),
    remote.readContract({
      address: RH.engine,
      abi: rhAbi,
      functionName: "requestFeeBps",
      args: [id],
      blockNumber: remoteBlock,
    }),
  ]);
  // A paid claim has no separate state enum. Read the indexed event, never infer "paid" from zero claimable.
  const paid =
    request.kind === 1 && state === 2
      ? await remote
          .getLogs({
            address: RH.engine,
            event: rhAbi.find(
              (x) => x.type === "event" && x.name === "RedemptionPaid",
            )!,
            args: { id },
            fromBlock: 119199050n,
            toBlock: remoteBlock,
          })
          .catch(() => null)
      : [];
  return {
    id,
    request,
    state,
    baseState,
    response,
    message,
    cancellation,
    cancellationQueued: cancellationPayload !== "0x",
    claimable,
    expired: timestamp > request.deadline,
    paid: paid === null ? null : paid.length > 0,
    minNet,
    feeBps,
    hasResponse: response !== ZERO_HASH,
  };
}
export type RobinhoodIntent = Awaited<ReturnType<typeof readRobinhoodIntent>>;
