import { createPublicClient, http, formatUnits } from "viem";
import { robinhood } from "../config/networks";
import { readRobinhoodSnapshot } from "../features/swap/robinhood-read";
const baseClient = createPublicClient({
  transport: http("https://mainnet.base.org", { timeout: 20000 }),
});
const remoteClient = createPublicClient({
  transport: http(robinhood.rpcUrls.default.http[0], { timeout: 20000 }),
});
try {
  const snapshot = await readRobinhoodSnapshot(baseClient, remoteClient);
  console.log(
    JSON.stringify({
      paused: snapshot.paused,
      allowedUSDG: snapshot.allowed,
      goldUSD: formatUnits(snapshot.goldUSD18, 18),
      usdgUSD: formatUnits(snapshot.usdgUSD18, 18),
      redeemFeeBps: String(snapshot.feeBps),
      inventoryCap: formatUnits(snapshot.cap, 18),
      canonicalSupply: formatUnits(snapshot.supply, 18),
      verifiedProxyAndController: true,
      transactionSent: false,
    }),
  );
} catch {
  console.error(
    "Read-only Robinhood acceptance failed. No transaction was sent and no fallback quote was used.",
  );
  process.exitCode = 1;
}
