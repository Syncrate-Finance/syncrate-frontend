import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { MULTICHAIN_VERSION, type PointsEpoch } from "@/features/points/model";
import { calculateBaseHoldingsWeek, pointsClient } from "./chain";
import { readRobinhoodHoldings, type ChainEvidence } from "./robinhood";
import { allocatePoints } from "./rewards";

import { mergeChainWeights } from "./chain-weights";

export async function calculateMultichainWeek(
  client: ReturnType<typeof pointsClient>,
  start: number,
  end: number,
  progress: (message: string) => void,
): Promise<PointsEpoch> {
  const base = await calculateBaseHoldingsWeek(client, start, end, progress);
  // An unavailable second chain fails the whole week; it never silently gets zero weight.
  const remote = await readRobinhoodHoldings(start, end, progress);
  const chains: [ChainEvidence, ChainEvidence] = [
    {
      chainId: 8453,
      token: CONTRACT_ADDRESSES.SGLD_TOKEN.toLowerCase(),
      startBlock: base.epoch.startBlock,
      endBlock: base.epoch.endBlock,
      endBlockHash: base.epoch.endBlockHash,
      deployed: true,
      weights: [...base.weights]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([address, w]) => ({
          address,
          walletSeconds: String(w.wallet),
          lpSeconds: String(w.lp),
        })),
    },
    remote,
  ];
  return {
    ...base.epoch,
    version: MULTICHAIN_VERSION,
    calculatedAt: new Date().toISOString(),
    chains,
    ...allocatePoints(mergeChainWeights(chains)),
  };
}
