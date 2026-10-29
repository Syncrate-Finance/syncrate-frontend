import { erc20Abi, parseAbi, type Address, type PublicClient } from "viem";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { engineAbi } from "./engine-abi";
import {
  ENGINE_IMPLEMENTATION,
  IMPLEMENTATION_SLOT,
  STABLECOINS,
  type Stablecoin,
  type SwapSnapshot,
} from "./model";
const oracleAbi = parseAbi([
  "function decimals() view returns (uint8)",
  "function description() view returns (string)",
  "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
]);
export type SwapReadClient = Pick<
  PublicClient,
  | "getChainId"
  | "getBlockNumber"
  | "getBytecode"
  | "getStorageAt"
  | "readContract"
  | "getBalance"
> & {
  getBlock: (args: { blockNumber: bigint }) => Promise<{ timestamp: bigint }>;
};

export async function readSwapSnapshot(
  client: SwapReadClient,
  stablecoin: Stablecoin,
  account?: Address,
): Promise<SwapSnapshot> {
  if ((await client.getChainId()) !== 8453) throw Error("Swaps require Base");
  const blockNumber = await client.getBlockNumber({ cacheTime: 0 });
  const block = await client.getBlock({ blockNumber });
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now - block.timestamp > 120n || block.timestamp > now + 30n)
    throw Error("Network data is outdated");
  const engine = CONTRACT_ADDRESSES.SYNCRATE_ENGINE,
    sgld = CONTRACT_ADDRESSES.SGLD_TOKEN;
  const stable = STABLECOINS[stablecoin].address;
  const [
    implementation,
    codes,
    configuredToken,
    feed,
    paused,
    allowed,
    feeBps,
    oracleMaxAge,
    reserveCap,
    reserved,
    totalSupply,
    stableBuffer,
    stableDecimals,
    stableSymbol,
    sgldDecimals,
    sgldSymbol,
  ] = await Promise.all([
    client.getStorageAt({
      address: engine,
      slot: IMPLEMENTATION_SLOT,
      blockNumber,
    }),
    Promise.all(
      [engine, sgld, stable].map((address) =>
        client.getBytecode({ address, blockNumber }),
      ),
    ),
    client.readContract({
      address: engine,
      abi: engineAbi,
      functionName: "sgldToken",
      blockNumber,
    }),
    client.readContract({
      address: engine,
      abi: engineAbi,
      functionName: "goldPriceFeed",
      blockNumber,
    }),
    client.readContract({
      address: engine,
      abi: engineAbi,
      functionName: "paused",
      blockNumber,
    }),
    client.readContract({
      address: engine,
      abi: engineAbi,
      functionName: "isAllowedCollateral",
      args: [stable],
      blockNumber,
    }),
    client.readContract({
      address: engine,
      abi: engineAbi,
      functionName: "redeemFeeBps",
      blockNumber,
    }),
    client.readContract({
      address: engine,
      abi: engineAbi,
      functionName: "oracleStalenessThreshold",
      blockNumber,
    }),
    client.readContract({
      address: engine,
      abi: engineAbi,
      functionName: "reserveCap",
      blockNumber,
    }),
    client.readContract({
      address: engine,
      abi: engineAbi,
      functionName: "totalReserved",
      blockNumber,
    }),
    client.readContract({
      address: sgld,
      abi: erc20Abi,
      functionName: "totalSupply",
      blockNumber,
    }),
    client.readContract({
      address: stable,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [engine],
      blockNumber,
    }),
    client.readContract({
      address: stable,
      abi: erc20Abi,
      functionName: "decimals",
      blockNumber,
    }),
    client.readContract({
      address: stable,
      abi: erc20Abi,
      functionName: "symbol",
      blockNumber,
    }),
    client.readContract({
      address: sgld,
      abi: erc20Abi,
      functionName: "decimals",
      blockNumber,
    }),
    client.readContract({
      address: sgld,
      abi: erc20Abi,
      functionName: "symbol",
      blockNumber,
    }),
  ]);
  if (
    !implementation ||
    implementation.slice(-40).toLowerCase() !==
      ENGINE_IMPLEMENTATION.slice(2).toLowerCase() ||
    codes.some((code) => !code || code === "0x") ||
    configuredToken.toLowerCase() !== sgld.toLowerCase() ||
    feed.toLowerCase() !== CONTRACT_ADDRESSES.CHAINLINK_XAU_USD.toLowerCase() ||
    stableDecimals !== 6 ||
    stableSymbol !== stablecoin ||
    sgldDecimals !== 18 ||
    sgldSymbol !== "SGLD" ||
    feeBps > 500n ||
    oracleMaxAge <= 0n
  )
    throw Error("Swap configuration needs review");
  const [feedDecimals, description, round, funds] = await Promise.all([
    client.readContract({
      address: feed,
      abi: oracleAbi,
      functionName: "decimals",
      blockNumber,
    }),
    client.readContract({
      address: feed,
      abi: oracleAbi,
      functionName: "description",
      blockNumber,
    }),
    client.readContract({
      address: feed,
      abi: oracleAbi,
      functionName: "latestRoundData",
      blockNumber,
    }),
    account
      ? Promise.all([
          client.readContract({
            address: stable,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [account],
            blockNumber,
          }),
          client.readContract({
            address: sgld,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [account],
            blockNumber,
          }),
          client.readContract({
            address: stable,
            abi: erc20Abi,
            functionName: "allowance",
            args: [account, engine],
            blockNumber,
          }),
          client.readContract({
            address: sgld,
            abi: erc20Abi,
            functionName: "allowance",
            args: [account, engine],
            blockNumber,
          }),
          client.getBalance({ address: account, blockNumber }),
        ])
      : Promise.resolve([0n, 0n, 0n, 0n, 0n] as const),
  ]);
  const [roundId, price, , priceUpdatedAt, answeredInRound] = round;
  if (
    feedDecimals !== 8 ||
    description !== "XAU / USD" ||
    price <= 0n ||
    roundId === 0n ||
    answeredInRound < roundId ||
    priceUpdatedAt === 0n ||
    priceUpdatedAt > block.timestamp ||
    block.timestamp - priceUpdatedAt > oracleMaxAge
  )
    throw Error("Live gold price is unavailable or outdated");
  return {
    account,
    blockNumber,
    observedAt: Date.now(),
    stablecoin,
    price,
    priceUpdatedAt,
    oracleMaxAge,
    feeBps,
    allowed,
    paused,
    reserveCap,
    reserved,
    totalSupply,
    stableBuffer,
    stableBalance: funds[0],
    sgldBalance: funds[1],
    stableAllowance: funds[2],
    sgldAllowance: funds[3],
    nativeBalance: funds[4],
  };
}

export async function readQueuedPayouts(
  client: SwapReadClient,
  account: Address,
  offset = 0n,
) {
  if ((await client.getChainId()) !== 8453)
    throw Error("Queue status requires Base");
  if (offset < 0n) throw Error("Invalid queue page");
  const engine = CONTRACT_ADDRESSES.SYNCRATE_ENGINE;
  const blockNumber = await client.getBlockNumber({ cacheTime: 0 });
  const [next, length] = await Promise.all([
    client.readContract({
      address: engine,
      abi: engineAbi,
      functionName: "nextQueueIndex",
      blockNumber,
    }),
    client.readContract({
      address: engine,
      abi: engineAbi,
      functionName: "getQueueLength",
      blockNumber,
    }),
  ]);
  const start = next + offset,
    end = start + 20n < length ? start + 20n : length;
  const indices: bigint[] = [];
  for (let i = start; i < end; i++) indices.push(i);
  const rows = await Promise.all(
    indices.map(async (index) => ({
      index,
      row: await client.readContract({
        address: engine,
        abi: engineAbi,
        functionName: "redemptionQueue",
        args: [index],
        blockNumber,
      }),
    })),
  );
  return {
    nextOffset: end < length ? offset + 20n : null,
    rows: rows
      .filter(({ row }) => row[0].toLowerCase() === account.toLowerCase())
      .map(({ index, row }) => ({ index, token: row[1], amount: row[2] })),
  };
}
