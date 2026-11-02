import {
  createPublicClient,
  parseAbi,
  decodeEventLog,
  encodePacked,
  keccak256,
  stringToHex,
  type Address,
} from "viem";
import { base } from "viem/chains";
import { pointsTransport, assertLogBlockHash } from "./rpc";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import {
  POINTS_POOL,
  POSITION_MANAGER,
  UNISWAP_FACTORY,
  USDC,
  PROGRAM_VERSION,
  type PointsEpoch,
} from "@/features/points/model";
import {
  allocatePoints,
  integrateHoldings,
  ZERO,
  type RewardEvent,
} from "./rewards";

const token = CONTRACT_ADDRESSES.SGLD_TOKEN.toLowerCase() as Address;
const pool = POINTS_POOL as Address;
const manager = POSITION_MANAGER as Address;
const tokenAbi = parseAbi([
  "event Transfer(address indexed from,address indexed to,uint256 value)",
  "function balanceOf(address) view returns(uint256)",
  "function totalSupply() view returns(uint256)",
  "function symbol() view returns(string)",
  "function decimals() view returns(uint8)",
]);
const poolAbi = parseAbi([
  "event Initialize(uint160 sqrtPriceX96,int24 tick)",
  "event Swap(address indexed sender,address indexed recipient,int256 amount0,int256 amount1,uint160 sqrtPriceX96,uint128 liquidity,int24 tick)",
  "event Mint(address sender,address indexed owner,int24 indexed tickLower,int24 indexed tickUpper,uint128 amount,uint256 amount0,uint256 amount1)",
  "event Burn(address indexed owner,int24 indexed tickLower,int24 indexed tickUpper,uint128 amount,uint256 amount0,uint256 amount1)",
  "function token0() view returns(address)",
  "function token1() view returns(address)",
  "function factory() view returns(address)",
  "function fee() view returns(uint24)",
  "function slot0() view returns(uint160,int24,uint16,uint16,uint16,uint8,bool)",
  "function positions(bytes32) view returns(uint128,uint256,uint256,uint128,uint128)",
]);
const managerAbi = parseAbi([
  "event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)",
  "event IncreaseLiquidity(uint256 indexed tokenId,uint128 liquidity,uint256 amount0,uint256 amount1)",
  "event DecreaseLiquidity(uint256 indexed tokenId,uint128 liquidity,uint256 amount0,uint256 amount1)",
  "function factory() view returns(address)",
  "function ownerOf(uint256) view returns(address)",
  "function positions(uint256) view returns(uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)",
]);
const factoryAbi = parseAbi([
  "function getPool(address,address,uint24) view returns(address)",
]);
type ChainLog = {
  address: Address;
  data: `0x${string}`;
  topics: readonly `0x${string}`[];
  blockNumber: bigint | null;
  blockHash: `0x${string}` | null;
  transactionHash: `0x${string}` | null;
  logIndex: number | null;
  removed?: boolean;
};
type EventArgs = Record<string, unknown>;
type Decoded = { name: string; args: EventArgs; log: ChainLog };
const address = (value: unknown) => {
  if (typeof value !== "string" || !/^0x[0-9a-f]{40}$/i.test(value))
    throw Error("Invalid chain address");
  return value.toLowerCase();
};
const integer = (value: unknown) => {
  if (typeof value !== "bigint") throw Error("Invalid chain amount");
  return value;
};
const tick = (value: unknown) => {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    Math.abs(value) > 887272
  )
    throw Error("Invalid chain tick");
  return value;
};
function decode(
  log: ChainLog,
  abi: typeof tokenAbi | typeof poolAbi | typeof managerAbi,
): Decoded {
  if (
    log.removed ||
    log.blockNumber === null ||
    log.blockHash === null ||
    log.logIndex === null ||
    log.transactionHash === null
  )
    throw Error("Incomplete chain log");
  const decoded = decodeEventLog({
    abi,
    data: log.data,
    topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
    strict: true,
  });
  return { name: decoded.eventName, args: decoded.args as EventArgs, log };
}
/** Bounded range splitting. A failed range is never skipped or treated as empty. */
export async function scanLogs<T>(
  read: (from: bigint, to: bigint) => Promise<T[]>,
  from: bigint,
  to: bigint,
  progress?: () => void,
): Promise<T[]> {
  if (from > to) return [];
  const output: T[] = [];
  async function range(a: bigint, b: bigint): Promise<void> {
    let last: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        output.push(...(await read(a, b)));
        progress?.();
        return;
      } catch (error) {
        last = error;
      }
    }
    // Provider range/result limits vary. Binary splitting remains complete.
    if (b - a < 1000n) {
      const error = Error("Blockchain log range unavailable", { cause: last });
      Object.assign(error, { pointsFromBlock: a.toString(), pointsToBlock: b.toString() });
      throw error;
    }
    const mid = (a + b) / 2n;
    await range(a, mid);
    await range(mid + 1n, b);
  }
  // Chainnodes documents a 20,000-block ceiling; narrower provider/result
  // limits are handled by complete binary splitting below that ceiling.
  for (let a = from; a <= to; a += 20000n)
    await range(a, a + 19999n > to ? to : a + 19999n);
  return output;
}
async function mapLimit<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency = 4,
): Promise<R[]> {
  const output: R[] = new Array(items.length);
  let index = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      for (;;) {
        const i = index++;
        if (i >= items.length) return;
        output[i] = await fn(items[i]);
      }
    }),
  );
  return output;
}
export function pointsClient(rpcUrl = process.env.POINTS_RPC_URL) {
  if (!rpcUrl)
    throw Error("POINTS_RPC_URL is required for historical rewards reads");
  const configured = Number(process.env.POINTS_RPC_MIN_INTERVAL_MS ?? "1000");
  const interval =
    Number.isFinite(configured) && configured >= 0 && configured <= 10000
      ? configured
      : 1000;
  return createPublicClient({
    chain: base,
    transport: pointsTransport(
      rpcUrl,
      process.env.POINTS_BLOCK_RPC_URL || "https://mainnet.base.org",
      { intervalMs: interval },
    ),
  });
}
type Client = ReturnType<typeof pointsClient>;
async function firstBlockAt(client: Client, timestamp: number, head: bigint) {
  let lo = 0n,
    hi = head + 1n;
  while (lo < hi) {
    const mid = (lo + hi) / 2n;
    const b = await client.getBlock({ blockNumber: mid });
    if (b.timestamp < BigInt(timestamp)) lo = mid + 1n;
    else hi = mid;
  }
  return lo;
}
async function deploymentBlock(
  client: Client,
  contract: Address,
  head: bigint,
) {
  const hasCode = async (blockNumber: bigint) => {
    const code = await client.getBytecode({ address: contract, blockNumber });
    return Boolean(code && code !== "0x");
  };
  if (!(await hasCode(head))) throw Error("Rewards contract not deployed");
  let lo = 0n,
    hi = head;
  while (lo < hi) {
    const mid = (lo + hi) / 2n;
    if (await hasCode(mid)) hi = mid;
    else lo = mid + 1n;
  }
  return lo;
}
async function verifyContracts(client: Client, blockNumber: bigint) {
  if ((await client.getChainId()) !== 8453) throw Error("Wrong points network");
  const [symbol, decimals, t0, t1, factory, fee, nftFactory] =
    await Promise.all([
      client.readContract({
        address: token,
        abi: tokenAbi,
        functionName: "symbol",
        blockNumber,
      }),
      client.readContract({
        address: token,
        abi: tokenAbi,
        functionName: "decimals",
        blockNumber,
      }),
      client.readContract({
        address: pool,
        abi: poolAbi,
        functionName: "token0",
        blockNumber,
      }),
      client.readContract({
        address: pool,
        abi: poolAbi,
        functionName: "token1",
        blockNumber,
      }),
      client.readContract({
        address: pool,
        abi: poolAbi,
        functionName: "factory",
        blockNumber,
      }),
      client.readContract({
        address: pool,
        abi: poolAbi,
        functionName: "fee",
        blockNumber,
      }),
      client.readContract({
        address: manager,
        abi: managerAbi,
        functionName: "factory",
        blockNumber,
      }),
    ]);
  if (
    symbol !== "SGLD" ||
    decimals !== 18 ||
    t0.toLowerCase() !== token ||
    t1.toLowerCase() !== USDC ||
    factory.toLowerCase() !== UNISWAP_FACTORY ||
    nftFactory.toLowerCase() !== UNISWAP_FACTORY ||
    fee !== 3000
  )
    throw Error("Unverified rewards contracts");
  const canonical = await client.readContract({
    address: UNISWAP_FACTORY,
    abi: factoryAbi,
    functionName: "getPool",
    args: [token, USDC, 3000],
    blockNumber,
  });
  if (canonical.toLowerCase() !== pool) throw Error("Noncanonical points pool");
}
export async function calculateHoldingsWeek(
  client: Client,
  start: number,
  end: number,
  progress: (message: string) => void = () => {},
): Promise<PointsEpoch> {
  progress("Resolving finalized Base history.");
  const final = await client.getBlock({ blockTag: "finalized" });
  if (!final.number || !final.hash || Number(final.timestamp) < end)
    throw Error("Weekly cutoff is not finalized");
  const [startBlock, exclusiveEnd] = await Promise.all([
    firstBlockAt(client, start, final.number),
    firstBlockAt(client, end, final.number),
  ]);
  const endBlock = exclusiveEnd - 1n;
  const endpoint = await client.getBlock({ blockNumber: endBlock });
  if (!endpoint.hash) throw Error("Missing settlement block hash");
  progress("Verifying the SGLD token, canonical pool and position manager.");
  await verifyContracts(client, endBlock);
  progress("Locating original token and pool deployments.");
  const [tokenCreated, poolCreated] = await Promise.all([
    deploymentBlock(client, token, endBlock),
    deploymentBlock(client, pool, endBlock),
  ]);
  progress("Verified Base contracts and finalized weekly block boundaries.");
  progress(`Historical boundaries: token ${tokenCreated}, pool ${poolCreated}, reward blocks ${startBlock} through ${endBlock}.`);
  let ranges = 0;
  const report = () => {
    ranges++;
    if (ranges % 25 === 0)
      progress(`Read ${ranges} complete historical log ranges.`);
  };
  const [transfers, poolRaw] = await Promise.all([
    scanLogs(
      (fromBlock, toBlock) =>
        client.getLogs({
          address: token,
          event: tokenAbi[0],
          fromBlock,
          toBlock,
          strict: true,
        }),
      tokenCreated,
      endBlock,
      report,
    ),
    scanLogs(
      (fromBlock, toBlock) =>
        client.getLogs({ address: pool, fromBlock, toBlock }),
      poolCreated,
      endBlock,
      report,
    ),
  ]);
  const principalTopics = new Set(
    [
      "Initialize(uint160,int24)",
      "Swap(address,address,int256,int256,uint160,uint128,int24)",
      "Mint(address,address,int24,int24,uint128,uint256,uint256)",
      "Burn(address,int24,int24,uint128,uint256,uint256)",
    ].map((signature) => keccak256(stringToHex(signature))),
  );
  const poolEvents = poolRaw
    .filter((log) => log.topics[0] && principalTopics.has(log.topics[0]))
    .map((log) => decode(log, poolAbi));
  // Unknown pool events are ignored only after complete logs are fetched. Collect/Flash/fees do not change principal.
  const managerMints = poolEvents.filter(
    (e) => e.name === "Mint" && address(e.args.owner) === manager,
  );
  const receiptHashes = [
    ...new Set(managerMints.map((e) => e.log.transactionHash!)),
  ];
  const candidates = new Map<string, bigint>();
  await mapLimit(receiptHashes, async (hash) => {
    const receipt = await client.getTransactionReceipt({ hash });
    if (receipt.status !== "success") throw Error("Invalid liquidity receipt");
    for (const log of receipt.logs)
      if (log.address.toLowerCase() === manager) {
        let event: Decoded;
        try {
          event = decode(log, managerAbi);
        } catch {
          continue;
        }
        if (event.name !== "IncreaseLiquidity") continue;
        const id = integer(event.args.tokenId).toString();
        const block = receipt.blockNumber;
        if (!candidates.has(id) || candidates.get(id)! > block)
          candidates.set(id, block);
      }
  });
  const metadata = new Map<string, { lower: number; upper: number }>();
  await mapLimit([...candidates], async ([id, blockNumber]) => {
    const p = await client.readContract({
      address: manager,
      abi: managerAbi,
      functionName: "positions",
      args: [BigInt(id)],
      blockNumber,
    });
    // A position minted and burned within its first block has zero elapsed exposure.
    if (
      p[2].toLowerCase() === ZERO &&
      p[3].toLowerCase() === ZERO &&
      p[7] === 0n
    )
      return;
    if (
      p[2].toLowerCase() === token &&
      p[3].toLowerCase() === USDC &&
      p[4] === 3000
    )
      metadata.set(id, { lower: p[5], upper: p[6] });
  });
  progress(`Discovered ${metadata.size} verified Uniswap NFT positions.`);
  const managerLogs: ChainLog[] = [];
  const ids = [...metadata.keys()].map(BigInt);
  for (let i = 0; i < ids.length; i += 40) {
    const tokenIds = ids.slice(i, i + 40);
    for (const eventName of [
      "Transfer",
      "IncreaseLiquidity",
      "DecreaseLiquidity",
    ] as const) {
      const event = managerAbi.find(
        (e): e is Extract<(typeof managerAbi)[number], { type: "event" }> =>
          e.type === "event" && e.name === eventName,
      )!;
      const logs = await scanLogs(
        (fromBlock, toBlock) =>
          client.getLogs({
            address: manager,
            event,
            args: { tokenId: tokenIds },
            fromBlock,
            toBlock,
            strict: true,
          }),
        poolCreated,
        endBlock,
        report,
      );
      managerLogs.push(...logs);
    }
  }
  const allLogs: ChainLog[] = [...transfers, ...poolRaw, ...managerLogs];
  const timestamps = new Map<string, number>();
  const blockHashes = new Map<string, string>();
  const weeklyBlocks = [
    ...new Set(
      allLogs
        .filter((l) => l.blockNumber !== null && l.blockNumber >= startBlock)
        .map((l) => l.blockNumber!.toString()),
    ),
  ];
  await mapLimit(weeklyBlocks, async (key) => {
    const block = await client.getBlock({ blockNumber: BigInt(key) });
    if (!block.hash) throw Error("Missing historical block");
    timestamps.set(key, Number(block.timestamp));
    blockHashes.set(key, block.hash);
  });
  const context = (log: ChainLog) => {
    if (
      log.blockNumber === null ||
      log.logIndex === null ||
      log.blockHash === null ||
      log.removed
    )
      throw Error("Invalid log context");
    const time =
      log.blockNumber < startBlock
        ? start
        : timestamps.get(log.blockNumber.toString());
    if (time === undefined) throw Error("Missing event timestamp");
    if (log.blockNumber >= startBlock)
      assertLogBlockHash(log.blockHash, blockHashes.get(log.blockNumber.toString()));
    return { block: log.blockNumber, index: log.logIndex, time };
  };
  const events: RewardEvent[] = [];
  for (const raw of transfers) {
    const e = decode(raw, tokenAbi);
    events.push({
      ...context(raw),
      kind: "transfer",
      from: address(e.args.from),
      to: address(e.args.to),
      amount: integer(e.args.value),
    });
  }
  const expectedManagerLiquidity = new Map<string, bigint>();
  const nftLiquidity = new Map<string, bigint>();
  const rangesSeen = new Set<string>();
  function addDelta(map: Map<string, bigint>, key: string, value: bigint) {
    map.set(key, (map.get(key) ?? 0n) + value);
  }
  for (const e of poolEvents) {
    const c = context(e.log);
    if (e.name === "Initialize" || e.name === "Swap")
      events.push({
        ...c,
        kind: "price",
        sqrtPrice: integer(e.args.sqrtPriceX96),
      });
    if (e.name === "Mint" || e.name === "Burn") {
      const owner = address(e.args.owner),
        lower = tick(e.args.tickLower),
        upper = tick(e.args.tickUpper);
      const delta = integer(e.args.amount) * (e.name === "Mint" ? 1n : -1n);
      const range = `${lower}:${upper}`;
      rangesSeen.add(`${owner}:${range}`);
      if (owner === manager)
        addDelta(expectedManagerLiquidity, `${c.block}:${range}`, delta);
      else
        events.push({
          ...c,
          kind: "liquidity",
          key: `core:${owner}:${range}`,
          owner,
          lower,
          upper,
          delta,
        });
    }
  }
  for (const raw of managerLogs) {
    const e = decode(raw, managerAbi),
      id = integer(e.args.tokenId).toString(),
      p = metadata.get(id);
    if (!p) throw Error("Missing position metadata");
    const c = context(raw),
      key = `nft:${id}`;
    if (e.name === "Transfer")
      events.push({
        ...c,
        kind: "owner",
        key,
        from: address(e.args.from),
        to: address(e.args.to),
      });
    else {
      const delta =
        integer(e.args.liquidity) * (e.name === "IncreaseLiquidity" ? 1n : -1n);
      events.push({
        ...c,
        kind: "liquidity",
        key,
        lower: p.lower,
        upper: p.upper,
        delta,
      });
      addDelta(nftLiquidity, `${c.block}:${p.lower}:${p.upper}`, delta);
    }
  }
  for (const key of new Set([
    ...expectedManagerLiquidity.keys(),
    ...nftLiquidity.keys(),
  ]))
    if (
      (expectedManagerLiquidity.get(key) ?? 0n) !==
      (nftLiquidity.get(key) ?? 0n)
    )
      throw Error("Incomplete NFT liquidity attribution");
  const replay = integrateHoldings(events, start, end);
  const [supply, slot] = await Promise.all([
    client.readContract({
      address: token,
      abi: tokenAbi,
      functionName: "totalSupply",
      blockNumber: endBlock,
    }),
    client.readContract({
      address: pool,
      abi: poolAbi,
      functionName: "slot0",
      blockNumber: endBlock,
    }),
  ]);
  if (
    [...replay.balances.values()].reduce((n, x) => n + x, 0n) !== supply ||
    replay.sqrtPrice !== slot[0]
  )
    throw Error("End-state reconciliation failed");
  await mapLimit([...replay.balances], async ([account, amount]) => {
    const actual = await client.readContract({
      address: token,
      abi: tokenAbi,
      functionName: "balanceOf",
      args: [account as Address],
      blockNumber: endBlock,
    });
    if (actual !== amount) throw Error("Wallet balance reconciliation failed");
  });
  await mapLimit([...metadata], async ([id]) => {
    const p = replay.positions.get(`nft:${id}`);
    const actual = await client.readContract({
      address: manager,
      abi: managerAbi,
      functionName: "positions",
      args: [BigInt(id)],
      blockNumber: endBlock,
    });
    if (!p || p.liquidity !== actual[7])
      throw Error("Position liquidity reconciliation failed");
    if (p.owner !== ZERO) {
      const owner = await client.readContract({
        address: manager,
        abi: managerAbi,
        functionName: "ownerOf",
        args: [BigInt(id)],
        blockNumber: endBlock,
      });
      if (owner.toLowerCase() !== p.owner)
        throw Error("Position ownership reconciliation failed");
    }
  });
  await mapLimit([...rangesSeen], async (key) => {
    const [owner, lower, upper] = key.split(":");
    const positionKey = keccak256(
      encodePacked(
        ["address", "int24", "int24"],
        [owner as Address, Number(lower), Number(upper)],
      ),
    );
    const actual = await client.readContract({
      address: pool,
      abi: poolAbi,
      functionName: "positions",
      args: [positionKey],
      blockNumber: endBlock,
    });
    const expected =
      owner === manager
        ? [...replay.positions.entries()]
            .filter(
              ([k, p]) =>
                k.startsWith("nft:") &&
                p.lower === Number(lower) &&
                p.upper === Number(upper),
            )
            .reduce((n, [, p]) => n + p.liquidity, 0n)
        : (replay.positions.get(`core:${key}`)?.liquidity ?? 0n);
    if (actual[0] !== expected)
      throw Error("Pool liquidity reconciliation failed");
  });
  // Detect a changed canonical history rather than publishing a mixed-fork calculation.
  const check = await client.getBlock({ blockNumber: endBlock });
  if (check.hash !== endpoint.hash) throw Error("Settlement chain changed");
  progress(
    `Reconciled ${replay.balances.size} token accounts and all supported positions.`,
  );
  return {
    version: PROGRAM_VERSION,
    start: new Date(start * 1000).toISOString(),
    end: new Date(end * 1000).toISOString(),
    calculatedAt: new Date().toISOString(),
    startBlock: String(startBlock),
    endBlock: String(endBlock),
    endBlockHash: endpoint.hash!,
    ...allocatePoints(replay.weights),
  };
}
