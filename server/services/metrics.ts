import "server-only";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import {
  configuredSysgldAddress,
  readPublicMetrics,
} from "@/features/metrics/read";
import type { PublicMetrics } from "@/features/metrics/types";

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org", {
    timeout: 8000,
    retryCount: 1,
  }),
});
let snapshot: { value: PublicMetrics; expires: number } | undefined;
let pending: Promise<PublicMetrics> | undefined;
export function getPublicMetrics(): Promise<PublicMetrics> {
  if (snapshot && snapshot.expires > Date.now())
    return Promise.resolve(snapshot.value);
  if (pending) return pending;
  pending = readPublicMetrics(
    client,
    configuredSysgldAddress(
      process.env.SYSGLD_TOKEN_ADDRESS ?? CONTRACT_ADDRESSES.SYSGLD_TOKEN,
    ),
  )
    .then((value) => {
      snapshot = {
        value,
        expires:
          Date.now() +
          (value.inventory.state === "ready" &&
          value.sgldMarketCap.state === "ready"
            ? 30_000
            : 5_000),
      };
      return value;
    })
    .finally(() => {
      pending = undefined;
    });
  return pending;
}
