import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { RH_POINTS_TOKEN } from "@/features/points/model";
import type { ChainEvidence } from "./robinhood";
import { EXCLUDED, type Weights } from "./rewards";

/** Sum seconds of actual holdings, then allocate ONE global weekly pool. */
export function mergeChainWeights(chains: readonly ChainEvidence[]): Weights {
  if (
    chains.length !== 2 ||
    chains[0].chainId !== 8453 ||
    chains[1].chainId !== 4663 ||
    chains[0].token !== CONTRACT_ADDRESSES.SGLD_TOKEN.toLowerCase() ||
    chains[1].token !== RH_POINTS_TOKEN
  )
    throw Error("Invalid points chain provenance");
  const merged: Weights = new Map();
  for (const chain of chains) {
    if (
      BigInt(chain.endBlock) < BigInt(chain.startBlock) ||
      (!chain.deployed && chain.weights.length) ||
      (chain.chainId === 8453 && !chain.deployed)
    )
      throw Error("Invalid points chain evidence");
    if (
      chain.chainId === 4663 &&
      (!chain.deployment ||
        chain.deployment.block !== "119199050" ||
        chain.deployment.transactionHash !==
          "0x6f0cd162378ebeae3c9ea2ab6ddf5c54595feb23ab09298ea370ff7c32282d00" ||
        chain.deployed !==
          BigInt(chain.endBlock) >= BigInt(chain.deployment.block))
    )
      throw Error("Invalid Robinhood deployment evidence");
    if (
      chain.chainId === 4663 &&
      chain.deployed &&
      (!chain.reconciliation ||
        BigInt(chain.reconciliation.block) < BigInt(chain.endBlock))
    )
      throw Error("Missing Robinhood reconciliation evidence");
    const seen = new Set<string>();
    for (const row of chain.weights) {
      if (
        seen.has(row.address) ||
        EXCLUDED.has(row.address) ||
        (chain.chainId === 4663 && BigInt(row.lpSeconds) !== 0n)
      )
        throw Error("Invalid multichain points weight");
      seen.add(row.address);
      const w = merged.get(row.address) ?? { wallet: 0n, lp: 0n };
      w.wallet += BigInt(row.walletSeconds);
      w.lp += BigInt(row.lpSeconds);
      merged.set(row.address, w);
    }
  }
  return merged;
}
