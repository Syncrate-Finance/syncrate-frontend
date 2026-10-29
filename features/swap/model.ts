import { formatUnits, type Address } from "viem";
import { CONTRACT_ADDRESSES } from "@/config/contracts";

export const ENGINE_IMPLEMENTATION =
  "0xD5c82eB3BdFb66f459F3216e53D0ED0A2B1115Ed" as const;
export const IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc" as const;
export const STABLECOINS = {
  USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
  USDT: { address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", decimals: 6 },
} as const;
export type Stablecoin = keyof typeof STABLECOINS;
export type SwapMode = "mint" | "redeem";
export type SwapSnapshot = {
  account?: Address;
  blockNumber: bigint;
  observedAt: number;
  price: bigint;
  priceUpdatedAt: bigint;
  oracleMaxAge: bigint;
  feeBps: bigint;
  allowed: boolean;
  paused: boolean;
  stablecoin: Stablecoin;
  reserveCap: bigint;
  reserved: bigint;
  totalSupply: bigint;
  stableBuffer: bigint;
  stableBalance: bigint;
  sgldBalance: bigint;
  stableAllowance: bigint;
  sgldAllowance: bigint;
  nativeBalance: bigint;
};
export type SwapQuote = {
  input: bigint;
  output: bigint;
  fee: bigint;
  queues: boolean;
};

export function parseAmount(input: string, decimals: number): bigint {
  if (
    !Number.isInteger(decimals) ||
    decimals < 0 ||
    decimals > 18 ||
    input.length > 90 ||
    !/^\d+(?:\.\d*)?$/.test(input)
  )
    throw Error("Enter a valid amount");
  const [whole, fraction = ""] = input.split(".");
  if (fraction.length > decimals)
    throw Error(`Use at most ${decimals} decimal places`);
  const amount =
    BigInt(whole) * 10n ** BigInt(decimals) +
    BigInt(fraction.padEnd(decimals, "0") || "0");
  if (amount <= 0n || amount > (1n << 256n) - 1n)
    throw Error("Enter an amount greater than zero");
  return amount;
}

/** Exact integer formulas from the reviewed engine; no floating-point settlement estimates. */
export function quoteSwap(
  mode: SwapMode,
  input: bigint,
  data: SwapSnapshot,
): SwapQuote {
  if (
    input <= 0n ||
    input > (1n << 256n) - 1n ||
    data.price <= 0n ||
    data.feeBps < 0n ||
    data.feeBps > 500n
  )
    throw Error("Quote unavailable");
  if (!data.allowed) throw Error("This asset is not currently supported");
  // Solidity uses checked uint256 multiplication before division.
  if (input > ((1n << 256n) - 1n) / (mode === "mint" ? 10n ** 20n : data.price))
    throw Error("Amount exceeds contract limits");
  let output: bigint,
    fee = 0n;
  if (mode === "mint") {
    output = (input * 10n ** 20n) / data.price;
    if (data.totalSupply + data.reserved + output > data.reserveCap)
      throw Error("Amount exceeds available mint capacity");
  } else {
    const gross = (input * data.price) / 10n ** 20n;
    fee = (gross * data.feeBps) / 10000n;
    output = gross - fee;
  }
  if (output <= 0n) throw Error("Amount is too small");
  return {
    input,
    output,
    fee,
    queues: mode === "redeem" && data.stableBuffer < output + fee,
  };
}

export function requiredAction(
  mode: SwapMode,
  amount: bigint,
  data: SwapSnapshot,
): "reset" | "approve" | "swap" {
  if (!data.account) throw Error("Connect your wallet");
  if (data.paused) throw Error("Swaps are temporarily paused");
  if (Date.now() - data.observedAt > 30000)
    throw Error("Refresh the quote before continuing");
  quoteSwap(mode, amount, data);
  if (amount > (mode === "mint" ? data.stableBalance : data.sgldBalance))
    throw Error("Insufficient balance");
  if (data.nativeBalance === 0n)
    throw Error("Add ETH on Base for network fees");
  const allowance = mode === "mint" ? data.stableAllowance : data.sgldAllowance;
  return allowance >= amount ? "swap" : allowance > 0n ? "reset" : "approve";
}

export function assertWalletContext(
  expected: Address,
  current: { address?: Address; chainId?: number; connected: boolean },
) {
  if (
    !current.connected ||
    current.chainId !== 8453 ||
    current.address?.toLowerCase() !== expected.toLowerCase()
  )
    throw Error("Wallet changed. Review the swap again.");
}
export function inputToken(mode: SwapMode, stablecoin: Stablecoin) {
  return mode === "mint"
    ? STABLECOINS[stablecoin].address
    : CONTRACT_ADDRESSES.SGLD_TOKEN;
}
export function displayAmount(value: bigint, decimals: number, digits = 6) {
  const [whole, fraction = ""] = formatUnits(value, decimals).split(".");
  const visible = fraction.slice(0, digits).replace(/0+$/, "");
  if (value > 0n && whole === "0" && !visible)
    return `<0.${"0".repeat(digits - 1)}1`;
  return (
    new Intl.NumberFormat("en-US").format(BigInt(whole)) +
    (visible ? "." + visible : "")
  );
}
