import { APP_ORIGIN } from "@/config/site";
import { parseAmount } from "@/features/swap/model";

export const STAKING_TERMS = [30, 90] as const;
export type StakingTerm = (typeof STAKING_TERMS)[number];

export function getStakingTerm(value: unknown): StakingTerm {
  return value === "90" ? 90 : 30;
}

export function stakingHref(term: StakingTerm) {
  return `${APP_ORIGIN}/stake?term=${term}`;
}

export function stakingAmountError(
  input: string,
  balance?: bigint,
): string | null {
  if (!input) return null;
  try {
    const amount = parseAmount(input, 18);
    return balance !== undefined && amount > balance
      ? "This amount exceeds your available SGLD balance."
      : null;
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "Enter a valid SGLD amount.";
  }
}
