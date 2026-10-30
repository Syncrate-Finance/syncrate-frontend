import { WEEKLY_POOL, type PointsAward } from "@/features/points/model";
import { sgldInLiquidity } from "./tick-math";

export const ZERO = "0x0000000000000000000000000000000000000000";
// Custodial/system balances must not be counted again as ordinary wallet holdings.
export const EXCLUDED = new Set([
  ZERO,
  "0x000000000000000000000000000000000000dead",
  "0xc5963bd6d6cf713f0994ffd867d4d639ad45ec6e",
  "0x37c0078d297243a22ac247cd93f1cafed9dbe461",
  "0x03a520b32c04bf3beef7beb72e919cf822ed34f1",
  // Legacy custody is not a supported pass-through rewards venue.
  "0xba93aa354a3b47a936d713b8fb90126d4d35546b",
]);
export type Position = {
  owner: string;
  liquidity: bigint;
  lower: number;
  upper: number;
};
export type RewardEvent = {
  time: number;
  block: bigint;
  index: number;
} & (
  | { kind: "transfer"; from: string; to: string; amount: bigint }
  | { kind: "price"; sqrtPrice: bigint }
  | {
      kind: "liquidity";
      key: string;
      delta: bigint;
      lower: number;
      upper: number;
      owner?: string;
    }
  | { kind: "owner"; key: string; from: string; to: string }
);
export type Weights = Map<string, { wallet: bigint; lp: bigint }>;
export function integrateHoldings(
  events: RewardEvent[],
  start: number,
  end: number,
) {
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    end <= start
  )
    throw Error("Invalid interval");
  const balances = new Map<string, bigint>();
  const positions = new Map<string, Position>();
  const weights: Weights = new Map();
  let price = 0n;
  let cursor = start;
  const add = (address: string, venue: "wallet" | "lp", value: bigint) => {
    if (!value || EXCLUDED.has(address)) return;
    const weight = weights.get(address) ?? { wallet: 0n, lp: 0n };
    weight[venue] += value;
    weights.set(address, weight);
  };
  function accrue(until: number) {
    if (until < cursor) throw Error("Non-monotonic chain timestamps");
    const seconds = BigInt(until - cursor);
    if (seconds) {
      for (const [address, amount] of balances)
        add(address, "wallet", amount * seconds);
      for (const position of positions.values()) {
        if (!position.liquidity || EXCLUDED.has(position.owner)) continue;
        if (!price) throw Error("Position without pool price");
        add(
          position.owner,
          "lp",
          sgldInLiquidity(
            position.liquidity,
            position.lower,
            position.upper,
            price,
          ) * seconds,
        );
      }
    }
    cursor = until;
  }
  const ordered = [...events].sort((a, b) =>
    a.block < b.block ? -1 : a.block > b.block ? 1 : a.index - b.index,
  );
  let previousKey = "";
  for (const event of ordered) {
    const key = `${event.block}:${event.index}`;
    if (key === previousKey) throw Error("Duplicate chain event");
    previousKey = key;
    if (event.time >= end) continue;
    accrue(Math.max(start, event.time));
    if (event.kind === "price") {
      if (event.sqrtPrice <= 0n) throw Error("Invalid pool price");
      price = event.sqrtPrice;
    } else if (event.kind === "transfer") {
      if (event.amount < 0n) throw Error("Invalid token amount");
      if (event.from !== ZERO) {
        const next = (balances.get(event.from) ?? 0n) - event.amount;
        if (next < 0n) throw Error("Incomplete token history");
        balances.set(event.from, next);
      }
      if (event.to !== ZERO)
        balances.set(event.to, (balances.get(event.to) ?? 0n) + event.amount);
    } else if (event.kind === "owner") {
      const p = positions.get(event.key) ?? {
        owner: ZERO,
        liquidity: 0n,
        lower: 0,
        upper: 0,
      };
      if (p.owner !== event.from)
        throw Error("Incomplete NFT ownership history");
      if (event.to === ZERO && p.liquidity)
        throw Error("Burned position still has liquidity");
      p.owner = event.to;
      positions.set(event.key, p);
    } else {
      const p = positions.get(event.key) ?? {
        owner: event.owner ?? ZERO,
        liquidity: 0n,
        lower: event.lower,
        upper: event.upper,
      };
      if (p.liquidity && (p.lower !== event.lower || p.upper !== event.upper))
        throw Error("Position range changed");
      p.lower = event.lower;
      p.upper = event.upper;
      p.liquidity += event.delta;
      if (p.liquidity < 0n) throw Error("Incomplete liquidity history");
      positions.set(event.key, p);
    }
  }
  accrue(end);
  return { weights, balances, positions, sqrtPrice: price };
}
export function allocatePoints(weights: Weights, pool = WEEKLY_POOL) {
  if (pool < 0n) throw Error("Invalid points pool");
  const eligible = [...weights.entries()].filter(
    ([address]) => !EXCLUDED.has(address),
  );
  if (eligible.some(([, v]) => v.wallet < 0n || v.lp < 0n))
    throw Error("Negative weight");
  const totalWeight = eligible.reduce(
    (n, [, v]) => n + v.wallet + v.lp * 3n,
    0n,
  );
  const awards: PointsAward[] = [];
  const remainders: Array<{
    row: PointsAward;
    field: "walletPoints" | "lpPoints";
    value: bigint;
  }> = [];
  let distributed = 0n;
  for (const [address, weight] of [...weights.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (weight.wallet < 0n || weight.lp < 0n) throw Error("Negative weight");
    if (EXCLUDED.has(address) || (!weight.wallet && !weight.lp)) continue;
    const row: PointsAward = {
      address,
      walletSeconds: String(weight.wallet),
      lpSeconds: String(weight.lp),
      walletPoints: "0",
      lpPoints: "0",
    };
    for (const [field, value] of [
      ["walletPoints", weight.wallet],
      ["lpPoints", weight.lp * 3n],
    ] as const) {
      const points = totalWeight ? (value * pool) / totalWeight : 0n;
      row[field] = String(points);
      distributed += points;
      if (value)
        remainders.push({ row, field, value: (value * pool) % totalWeight });
    }
    awards.push(row);
  }
  // Largest remainder, stable address/venue ties: all ten million points, never a float.
  remainders.sort((a, b) =>
    a.value > b.value
      ? -1
      : a.value < b.value
        ? 1
        : a.row.address.localeCompare(b.row.address) ||
          a.field.localeCompare(b.field),
  );
  let remaining = totalWeight ? pool - distributed : 0n;
  for (const remainder of remainders) {
    if (!remaining) break;
    remainder.row[remainder.field] = String(
      BigInt(remainder.row[remainder.field]) + 1n,
    );
    remaining--;
    distributed++;
  }
  if (remaining) throw Error("Invalid rounding remainder");
  return {
    awards,
    distributed: String(distributed),
    unallocated: String(pool - distributed),
  };
}
