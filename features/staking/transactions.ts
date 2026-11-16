import { decodeEventLog, type Address, type TransactionReceipt } from "viem";
import { stakingAbi } from "./abi";
import { STAKING_ADDRESS } from "./deployment";

export type StakeAction =
  | { kind: "approve" | "reset" | "stake"; amount: bigint; term: 30 | 90 }
  | {
      kind: "withdraw" | "restake" | "claim";
      id: bigint;
      term: 30 | 90;
      epochs: bigint[];
    };
export function depositQuote(amount: bigint) {
  const fee = (amount * 25n) / 10000n;
  return { fee, principal: amount - fee };
}
export function hasStakeReceipt(
  receipt: TransactionReceipt,
  account: Address,
  gross: bigint,
  term: number,
) {
  if (receipt.status !== "success") return false;
  return receipt.logs.some((log) => {
    if (log.address.toLowerCase() !== STAKING_ADDRESS.toLowerCase())
      return false;
    try {
      const event = decodeEventLog({
        abi: stakingAbi,
        data: log.data,
        topics: log.topics,
        eventName: "Staked",
        strict: true,
      });
      return (
        event.args.owner.toLowerCase() === account.toLowerCase() &&
        event.args.amount === depositQuote(gross).principal &&
        event.args.maturesAt > 0n &&
        (term === 30 || term === 90)
      );
    } catch {
      return false;
    }
  });
}
