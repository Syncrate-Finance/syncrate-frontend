import { createPublicClient, erc20Abi, keccak256, parseAbiItem } from "viem";
import { robinhood } from "@/config/networks";
import { RH } from "@/features/swap/robinhood-model";
import { IMPLEMENTATION_SLOT } from "@/features/swap/model";
import {
  RH_POINTS_TOKEN,
  type chainEvidenceSchema,
} from "@/features/points/model";
import type { z } from "zod";
import { firstBlockAt, scanLogs } from "./chain";
import { pointsTransport, assertLogBlockHash } from "./rpc";
import { integrateHoldings, type RewardEvent } from "./rewards";

const creation = {
  block: 119199050n,
  hash: "0x6f0cd162378ebeae3c9ea2ab6ddf5c54595feb23ab09298ea370ff7c32282d00",
} as const;
export type ChainEvidence = z.infer<typeof chainEvidenceSchema>;
export function robinhoodPointsClient() {
  const url =
    process.env.POINTS_ROBINHOOD_RPC_URL || robinhood.rpcUrls.default.http[0];
  return createPublicClient({
    chain: robinhood,
    transport: pointsTransport(url, url, {
      chain: robinhood,
      intervalMs: 1000,
    }),
  });
}

/** Complete native-token replay; no RH LP weighting until an eligible pool is integrated. */
export async function readRobinhoodHoldings(
  start: number,
  end: number,
  progress: (message: string) => void,
  client = robinhoodPointsClient(),
): Promise<ChainEvidence> {
  if ((await client.getChainId()) !== 4663)
    throw Error("Wrong Robinhood points network");
  const final = await client.getBlock({ blockTag: "finalized" });
  if (!final.number || Number(final.timestamp) < end)
    throw Error("Robinhood cutoff is not finalized");
  const receipt = await client.getTransactionReceipt({ hash: creation.hash });
  const birth = await client.getBlock({ blockNumber: creation.block });
  if (
    receipt.status !== "success" ||
    receipt.blockNumber !== creation.block ||
    receipt.contractAddress?.toLowerCase() !== RH_POINTS_TOKEN ||
    receipt.blockHash !== birth.hash ||
    final.number < creation.block
  )
    throw Error("Unverified Robinhood points deployment");
  const [startBlock, exclusiveEnd] = await Promise.all([
    firstBlockAt(client, start, final.number),
    firstBlockAt(client, end, final.number),
  ]);
  const endBlock = exclusiveEnd - 1n;
  const endpoint = await client.getBlock({ blockNumber: endBlock });
  if (!endpoint.hash) throw Error("Missing Robinhood cutoff hash");
  const evidence: ChainEvidence = {
    chainId: 4663,
    token: RH_POINTS_TOKEN,
    startBlock: String(startBlock),
    endBlock: String(endBlock),
    endBlockHash: endpoint.hash,
    deployed: endBlock >= creation.block,
    deployment: {
      block: String(creation.block),
      blockHash: receipt.blockHash,
      transactionHash: creation.hash,
      timestamp: String(birth.timestamp),
    },
    weights: [],
  };
  if (!evidence.deployed) {
    // Verified successful CREATE receipt proves this proxy's birth. No old-state
    // RPC fallback is needed to establish that the token did not yet exist.
    if (Number(birth.timestamp) < end)
      throw Error("Robinhood predeployment history mismatch");
    progress(
      "Verified Robinhood had not deployed at this cutoff; no Robinhood weight.",
    );
  } else {
    // Native public RPC retains logs/headers but not old account state. Reconcile
    // COMPLETE replay at a recent anchor, then integrate only finalized week time.
    // Current balance is never substituted for historical exposure.
    const anchorBlock = (await client.getBlockNumber({ cacheTime: 0 })) - 64n;
    const anchor = await client.getBlock({ blockNumber: anchorBlock });
    if (
      !anchor.hash ||
      anchorBlock < endBlock ||
      Number(anchor.timestamp) + 120 < Date.now() / 1000
    )
      throw Error("Unavailable Robinhood reconciliation anchor");
    const [slot, code, symbol, decimals] = await Promise.all([
      client.getStorageAt({
        address: RH.engine,
        slot: IMPLEMENTATION_SLOT,
        blockNumber: anchorBlock,
      }),
      client.getBytecode({
        address: RH.implementation,
        blockNumber: anchorBlock,
      }),
      client.readContract({
        address: RH.engine,
        abi: erc20Abi,
        functionName: "symbol",
        blockNumber: anchorBlock,
      }),
      client.readContract({
        address: RH.engine,
        abi: erc20Abi,
        functionName: "decimals",
        blockNumber: anchorBlock,
      }),
    ]);
    if (
      slot?.slice(-40).toLowerCase() !==
        RH.implementation.slice(2).toLowerCase() ||
      !code ||
      keccak256(code) !== RH.implementationHash ||
      symbol !== "SGLD" ||
      decimals !== 18
    )
      throw Error(
        "Robinhood points contract changed; review before settlement",
      );
    progress("Reading complete Robinhood SGLD transfer history.");
    const upgrades = await scanLogs(
      (fromBlock, toBlock) =>
        client.getLogs({
          address: RH.engine,
          event: parseAbiItem("event Upgraded(address indexed implementation)"),
          fromBlock,
          toBlock,
          strict: true,
        }),
      creation.block,
      anchorBlock,
    );
    // An upgrade (even one later reverted) invalidates the known event/state
    // invariant. Stop for a fresh implementation review rather than guessing.
    if (
      upgrades.length !== 1 ||
      upgrades[0].blockNumber !== creation.block ||
      upgrades[0].blockHash !== birth.hash ||
      upgrades[0].removed ||
      upgrades[0].args.implementation?.toLowerCase() !==
        RH.implementation.toLowerCase()
    )
      throw Error("Unreviewed Robinhood upgrade history");
    const logs = await scanLogs(
      (fromBlock, toBlock) =>
        client.getLogs({
          address: RH.engine,
          event: erc20Abi.find(
            (x) => x.type === "event" && x.name === "Transfer",
          )!,
          fromBlock,
          toBlock,
          strict: true,
        }),
      creation.block,
      anchorBlock,
    );
    const headers = new Map<string, { time: number; hash: string }>();
    for (const block of new Set(logs.map((log) => String(log.blockNumber)))) {
      const header = await client.getBlock({ blockNumber: BigInt(block) });
      if (!header.hash) throw Error("Missing Robinhood transfer header");
      headers.set(block, { time: Number(header.timestamp), hash: header.hash });
    }
    const events: RewardEvent[] = logs.map((log) => {
      const header = headers.get(String(log.blockNumber));
      if (
        !header ||
        log.blockNumber === null ||
        log.logIndex === null ||
        log.removed ||
        !log.args.from ||
        !log.args.to ||
        log.args.value === undefined
      )
        throw Error("Incomplete Robinhood transfer history");
      assertLogBlockHash(log.blockHash, header.hash);
      return {
        kind: "transfer",
        block: log.blockNumber,
        index: log.logIndex,
        time: header.time,
        from: log.args.from.toLowerCase(),
        to: log.args.to.toLowerCase(),
        amount: log.args.value,
      };
    });
    const replay = integrateHoldings(events, start, end);
    const anchored = integrateHoldings(
      events,
      Number(birth.timestamp),
      Number(anchor.timestamp) + 1,
    );
    const supply = await client.readContract({
      address: RH.engine,
      abi: erc20Abi,
      functionName: "totalSupply",
      blockNumber: anchorBlock,
    });
    if ([...anchored.balances.values()].reduce((n, x) => n + x, 0n) !== supply)
      throw Error("Robinhood supply reconciliation failed");
    for (const [address, amount] of anchored.balances) {
      const actual = await client.readContract({
        address: RH.engine,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        blockNumber: anchorBlock,
      });
      if (actual !== amount)
        throw Error("Robinhood wallet reconciliation failed");
    }
    if (
      (await client.getBlock({ blockNumber: anchorBlock })).hash !== anchor.hash
    )
      throw Error("Robinhood reconciliation chain changed");
    evidence.reconciliation = {
      block: String(anchorBlock),
      blockHash: anchor.hash,
      supply: String(supply),
    };
    evidence.weights = [...replay.weights]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([address, w]) => ({
        address,
        walletSeconds: String(w.wallet),
        lpSeconds: String(w.lp),
      }));
    progress(`Reconciled ${replay.balances.size} Robinhood SGLD accounts.`);
  }
  if ((await client.getBlock({ blockNumber: endBlock })).hash !== endpoint.hash)
    throw Error("Robinhood cutoff chain changed");
  return evidence;
}
