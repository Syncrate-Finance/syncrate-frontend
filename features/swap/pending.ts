import { isAddress, type Hash } from "viem";
import {
  type SwapSnapshot,
  type SwapMode,
  type Stablecoin,
  parseAmount,
} from "./model";

export const PENDING_KEY = "syncrate-sgld-pending-v1";
export type PendingSwap = {
  hash: Hash;
  review: {
    account: NonNullable<SwapSnapshot["account"]>;
    mode: SwapMode;
    stablecoin: Stablecoin;
    amount: bigint;
    action: "reset" | "approve" | "swap";
  };
};
/** Public transaction context only. Restoring this data never authorizes another write. */
export function decodePending(raw: string | null): PendingSwap | null {
  if (!raw || raw.length > 1500) return null;
  try {
    const value = JSON.parse(raw);
    if (
      value?.version !== 1 ||
      !/^0x[0-9a-fA-F]{64}$/.test(value.hash) ||
      !isAddress(value.account) ||
      !["mint", "redeem"].includes(value.mode) ||
      !["USDC", "USDT"].includes(value.stablecoin) ||
      !["reset", "approve", "swap"].includes(value.action) ||
      typeof value.amount !== "string"
    )
      return null;
    return {
      hash: value.hash,
      review: {
        account: value.account,
        mode: value.mode,
        stablecoin: value.stablecoin,
        amount: parseAmount(value.amount, 0),
        action: value.action,
      },
    };
  } catch {
    return null;
  }
}
export function encodePending(value: PendingSwap): string {
  return JSON.stringify({
    version: 1,
    hash: value.hash,
    ...value.review,
    amount: value.review.amount.toString(),
  });
}
