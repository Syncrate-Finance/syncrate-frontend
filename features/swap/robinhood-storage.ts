import { z } from "zod";
import type { Address } from "viem";
const hash = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/)
  .transform((v) => v as `0x${string}`);
export const remotePendingSchema = z.object({
  hash,
  chainId: z.union([z.literal(8453), z.literal(4663)]),
  action: z.enum([
    "approve",
    "mint",
    "redeem",
    "dispatch",
    "cancel",
    "refund",
    "claim",
    "queue",
  ]),
  id: hash.optional(),
});
const schema = z.object({
  version: z.literal(1),
  ids: z.array(hash).max(100),
  pending: remotePendingSchema.nullable(),
});
export type RemotePending = z.infer<typeof remotePendingSchema>;
export type RemoteHistory = z.infer<typeof schema>;
export const emptyRemoteHistory = (): RemoteHistory => ({
  version: 1,
  ids: [],
  pending: null,
});
export const remoteHistoryKey = (account: Address) =>
  `syncrate:rh:4663:v1:${account.toLowerCase()}`;
export function decodeRemoteHistory(value: string | null): RemoteHistory {
  if (!value || value.length > 40000) return emptyRemoteHistory();
  try {
    return schema.parse(JSON.parse(value));
  } catch {
    return emptyRemoteHistory();
  }
}
export function addRemoteId(
  history: RemoteHistory,
  id: `0x${string}`,
): RemoteHistory {
  if (!/^0x[\da-fA-F]{64}$/.test(id)) throw Error("Enter a valid request ID.");
  return {
    ...history,
    ids: [
      id,
      ...history.ids.filter((x) => x.toLowerCase() !== id.toLowerCase()),
    ].slice(0, 100),
  };
}
