import { z } from "zod";

export const WEEK_SECONDS = 7 * 24 * 60 * 60;
export const WEEKLY_POOL = 10_000_000n;
export const PROGRAM_START = "2026-10-25T00:00:00.000Z";
export const POINTS_POOL = "0xc5963bd6d6cf713f0994ffd867d4d639ad45ec6e";
export const POSITION_MANAGER = "0x03a520b32c04bf3beef7beb72e919cf822ed34f1";
export const UNISWAP_FACTORY = "0x33128a8fc17869897dce68ed026d694621f6fdfd";
export const USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
export const PROGRAM_VERSION = "sgld-holdings-v2";
export const uintString = z
  .string()
  .regex(/^(0|[1-9][0-9]*)$/)
  .max(100);
export const walletAddress = z.string().regex(/^0x[0-9a-f]{40}$/);
const hash = z.string().regex(/^0x[0-9a-f]{64}$/);
const dateTime = z.iso.datetime();
export const awardSchema = z
  .object({
    address: walletAddress,
    walletSeconds: uintString,
    lpSeconds: uintString,
    walletPoints: uintString,
    lpPoints: uintString,
  })
  .strict();
export const epochSchema = z
  .object({
    version: z.literal(PROGRAM_VERSION),
    start: dateTime,
    end: dateTime,
    calculatedAt: dateTime,
    startBlock: uintString,
    endBlock: uintString,
    endBlockHash: hash,
    distributed: uintString,
    unallocated: uintString,
    awards: z.array(awardSchema).max(100000),
  })
  .strict();
export const ledgerSchema = z
  .object({
    version: z.literal(PROGRAM_VERSION),
    chainId: z.literal(8453),
    pool: z.literal(POINTS_POOL),
    start: z.literal(PROGRAM_START),
    baseline: z
      .object({
        cutoff: z.literal(PROGRAM_START),
        sourceSha256: z.string().regex(/^[0-9a-f]{64}$/),
        balances: z
          .array(
            z.object({ address: walletAddress, points: uintString }).strict(),
          )
          .max(100000),
      })
      .strict(),
    epochs: z.array(epochSchema).max(520),
  })
  .strict();
export type PointsEpoch = z.infer<typeof epochSchema>;
export type PointsLedger = z.infer<typeof ledgerSchema>;
export type PointsAward = z.infer<typeof awardSchema>;
export type LeaderboardRow = { address: string; total: string; rank: number };
export type PointsAccount = {
  address: string;
  total: string;
  carriedOver: string;
  rank: number | null;
  lastAward: string;
  history: Array<{
    start: string;
    end: string;
    walletPoints: string;
    lpPoints: string;
    total: string;
  }>;
};
export type PointsResponse = {
  version: typeof PROGRAM_VERSION;
  lastSettledAt: string;
  nextCutoff: string;
  weeklyPool: string;
  status: "accruing" | "processing";
  account: PointsAccount | null;
  leaderboard: {
    rows: LeaderboardRow[];
    total: number;
    page: number;
    pages: number;
  } | null;
};

export function formatPoints(value: string) {
  return new Intl.NumberFormat("en-US").format(BigInt(value));
}
export function nextSunday(now: Date) {
  const cutoff = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - now.getUTCDay(),
    ),
  );
  cutoff.setUTCDate(cutoff.getUTCDate() + 7);
  return cutoff.toISOString();
}
export function shortWallet(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
