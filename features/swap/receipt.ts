import {
  decodeEventLog,
  erc20Abi,
  type Address,
  type TransactionReceipt,
} from "viem";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { engineAbi } from "./engine-abi";
import {
  inputToken,
  STABLECOINS,
  type Stablecoin,
  type SwapMode,
} from "./model";
export function hasApprovalReceipt(
  receipt: Pick<TransactionReceipt, "status" | "logs">,
  account: Address,
  mode: SwapMode,
  stablecoin: Stablecoin,
  value: bigint,
) {
  if (receipt.status !== "success") return false;
  return receipt.logs.some((log) => {
    if (
      log.address.toLowerCase() !== inputToken(mode, stablecoin).toLowerCase()
    )
      return false;
    try {
      const event = decodeEventLog({
        abi: erc20Abi,
        data: log.data,
        topics: log.topics,
      });
      return (
        event.eventName === "Approval" &&
        event.args.owner.toLowerCase() === account.toLowerCase() &&
        event.args.spender.toLowerCase() ===
          CONTRACT_ADDRESSES.SYNCRATE_ENGINE.toLowerCase() &&
        event.args.value === value
      );
    } catch {
      return false;
    }
  });
}
export type SwapOutcome = {
  kind: "minted" | "paid" | "queued";
  amount: bigint;
  queueIndex?: bigint;
};
export function readSwapOutcome(
  receipt: Pick<TransactionReceipt, "status" | "logs">,
  account: Address,
  mode: SwapMode,
  stablecoin: Stablecoin,
  input: bigint,
): SwapOutcome | undefined {
  if (receipt.status !== "success") throw Error("Transaction reverted");
  const stable = STABLECOINS[stablecoin].address.toLowerCase();
  for (const log of receipt.logs) {
    if (
      log.address.toLowerCase() !==
      CONTRACT_ADDRESSES.SYNCRATE_ENGINE.toLowerCase()
    )
      continue;
    try {
      const event = decodeEventLog({
        abi: engineAbi,
        data: log.data,
        topics: log.topics,
      });
      if (
        event.eventName === "SGLDMinted" &&
        mode === "mint" &&
        event.args.user.toLowerCase() === account.toLowerCase() &&
        event.args.collateralToken.toLowerCase() === stable &&
        event.args.collateralSpent === input
      )
        return { kind: "minted", amount: event.args.sgldAmount };
      if (
        event.eventName === "SGLDRedeemedImmediate" &&
        mode === "redeem" &&
        event.args.user.toLowerCase() === account.toLowerCase() &&
        event.args.stablecoin.toLowerCase() === stable &&
        event.args.sgldBurned === input
      )
        return { kind: "paid", amount: event.args.stablecoinPaid };
      if (
        event.eventName === "SGLDRedemptionQueued" &&
        mode === "redeem" &&
        event.args.user.toLowerCase() === account.toLowerCase() &&
        event.args.stablecoin.toLowerCase() === stable &&
        event.args.sgldBurned === input
      )
        return {
          kind: "queued",
          amount: event.args.stablecoinOwed,
          queueIndex: event.args.queueIndex,
        };
    } catch {
      /* Ignore unrelated or undecodable events; never invent a successful payout. */
    }
  }
}
