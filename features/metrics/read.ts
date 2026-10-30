import {
  erc20Abi,
  isAddress,
  parseAbi,
  zeroAddress,
  type Address,
  type PublicClient,
} from "viem";
import { CHAIN_ID, CONTRACT_ADDRESSES } from "@/config/contracts";
import type { PublicMetrics } from "./types";

const oracleAbi = parseAbi([
  "function description() view returns (string)",
  "function decimals() view returns (uint8)",
  "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
]);
const vaultAbi = parseAbi([
  "function asset() view returns (address)",
  "function convertToAssets(uint256 shares) view returns (uint256)",
]);
type ReadClient = Pick<
  PublicClient,
  "getChainId" | "getBlockNumber" | "getBytecode" | "readContract"
> & {
  getBlock: (args: { blockNumber: bigint }) => Promise<{ timestamp: bigint }>;
};
const unavailable = () => ({ state: "unavailable" as const, value: null });
const MAX_UINT256 = (1n << 256n) - 1n;
// Indicative display only. Permit a closed-market weekend, never silently use an older quote.
export const MAX_GOLD_PRICE_AGE = 72n * 60n * 60n;

function uint(value: bigint) {
  if (value < 0n || value > MAX_UINT256)
    throw new Error("Invalid contract amount");
  return value;
}

export function configuredSysgldAddress(value?: string): Address | undefined {
  if (!value || value.toLowerCase() === zeroAddress) return undefined;
  if (!isAddress(value, { strict: false }))
    throw new Error("Invalid sySGLD configuration");
  return value as Address;
}

export function formatFixed(value: bigint, decimals: number, digits: number) {
  if (
    value < 0n ||
    !Number.isInteger(decimals) ||
    decimals < 0 ||
    decimals > 36 ||
    digits < 0 ||
    digits > decimals
  )
    throw new Error("Invalid display amount");
  const scale = 10n ** BigInt(decimals - digits);
  const rounded = (value + scale / 2n) / scale;
  const unit = 10n ** BigInt(digits);
  const whole = new Intl.NumberFormat("en-US").format(rounded / unit);
  return digits
    ? `${whole}.${(rounded % unit).toString().padStart(digits, "0")}`
    : whole;
}

export function usdMarketCap(
  amount: bigint,
  tokenDecimals: number,
  price: bigint,
  priceDecimals: number,
) {
  if (
    !Number.isInteger(tokenDecimals) ||
    !Number.isInteger(priceDecimals) ||
    tokenDecimals < 0 ||
    tokenDecimals > 36 ||
    priceDecimals < 2 ||
    priceDecimals > 18 ||
    price <= 0n
  )
    throw new Error("Invalid valuation inputs");
  const divisor = 10n ** BigInt(tokenDecimals + priceDecimals - 2);
  const cents = (uint(amount) * price + divisor / 2n) / divisor;
  return "$" + formatFixed(cents, 2, 2);
}

export async function readPublicMetrics(
  client: ReadClient,
  sysgldAddress?: Address,
): Promise<PublicMetrics> {
  if ((await client.getChainId()) !== CHAIN_ID)
    throw new Error("Wrong metrics network");
  const blockNumber = await client.getBlockNumber({ cacheTime: 0 });
  const block = await client.getBlock({ blockNumber });
  // A frozen or wrong RPC must not make old block data appear current.
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (block.timestamp > now + 60n || now - block.timestamp > 300n)
    throw new Error("Outdated metrics block");
  async function deployed(address: Address) {
    const code = await client.getBytecode({ address, blockNumber });
    if (!code || code === "0x") throw new Error("Contract unavailable");
  }
  async function token(address: Address, expectedSymbol: string) {
    await deployed(address);
    const [supply, decimals, symbol] = await Promise.all([
      client.readContract({
        address,
        abi: erc20Abi,
        functionName: "totalSupply",
        blockNumber,
      }),
      client.readContract({
        address,
        abi: erc20Abi,
        functionName: "decimals",
        blockNumber,
      }),
      client.readContract({
        address,
        abi: erc20Abi,
        functionName: "symbol",
        blockNumber,
      }),
    ]);
    if (symbol !== expectedSymbol || decimals !== 18)
      throw new Error("Unverified metrics token");
    return { supply: uint(supply), decimals };
  }
  const [sgld, oracle] = await Promise.allSettled([
    token(CONTRACT_ADDRESSES.SGLD_TOKEN, "SGLD"),
    (async () => {
      const address = CONTRACT_ADDRESSES.CHAINLINK_XAU_USD;
      await deployed(address);
      const [description, decimals, round] = await Promise.all([
        client.readContract({
          address,
          abi: oracleAbi,
          functionName: "description",
          blockNumber,
        }),
        client.readContract({
          address,
          abi: oracleAbi,
          functionName: "decimals",
          blockNumber,
        }),
        client.readContract({
          address,
          abi: oracleAbi,
          functionName: "latestRoundData",
          blockNumber,
        }),
      ]);
      const [roundId, answer, , updatedAt, answeredInRound] = round;
      if (
        description !== "XAU / USD" ||
        decimals < 2 ||
        decimals > 18 ||
        answer <= 0n ||
        roundId === 0n ||
        answeredInRound < roundId ||
        updatedAt === 0n ||
        updatedAt > block.timestamp ||
        block.timestamp - updatedAt > MAX_GOLD_PRICE_AGE
      )
        throw new Error("Unverified or outdated gold price");
      return { answer, decimals, updatedAt };
    })(),
  ]);
  const result: PublicMetrics = {
    blockNumber: blockNumber.toString(),
    observedAt: new Date().toISOString(),
    priceUpdatedAt:
      oracle.status === "fulfilled"
        ? new Date(Number(oracle.value.updatedAt) * 1000).toISOString()
        : null,
    // Owner-reported fixed inventory. This is deliberately not represented as a live reserve read.
    inventory: { state: "ready", value: "193" },
    sgldSupply:
      sgld.status === "fulfilled"
        ? {
            state: "ready",
            value: formatFixed(sgld.value.supply, sgld.value.decimals, 4),
          }
        : unavailable(),
    unallocatedBullion:
      sgld.status === "fulfilled" && sgld.value.supply <= 193n * 10n ** 18n
        ? {
            state: "ready",
            value: formatFixed(193n * 10n ** 18n - sgld.value.supply, 18, 4),
          }
        : unavailable(),
    sgldMarketCap:
      sgld.status === "fulfilled" && oracle.status === "fulfilled"
        ? {
            state: "ready",
            value: usdMarketCap(
              sgld.value.supply,
              sgld.value.decimals,
              oracle.value.answer,
              oracle.value.decimals,
            ),
          }
        : unavailable(),
    sysgldMarketCap: sysgldAddress
      ? unavailable()
      : { state: "unconfigured", value: null },
  };
  if (
    sysgldAddress &&
    oracle.status === "fulfilled" &&
    sgld.status === "fulfilled"
  ) {
    try {
      const sy = await token(sysgldAddress, "sySGLD");
      const underlying = await client.readContract({
        address: sysgldAddress,
        abi: vaultAbi,
        functionName: "asset",
        blockNumber,
      });
      if (
        underlying.toLowerCase() !== CONTRACT_ADDRESSES.SGLD_TOKEN.toLowerCase()
      )
        throw new Error("Unverified vault asset");
      const assets = uint(
        await client.readContract({
          address: sysgldAddress,
          abi: vaultAbi,
          functionName: "convertToAssets",
          args: [sy.supply],
          blockNumber,
        }),
      );
      result.sysgldMarketCap = {
        state: "ready",
        value: usdMarketCap(
          assets,
          sgld.value.decimals,
          oracle.value.answer,
          oracle.value.decimals,
        ),
      };
    } catch {
      /* A configured but unsupported vault must never imply a 1:1 share price. */
    }
  }
  return result;
}
