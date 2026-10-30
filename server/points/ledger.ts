import {
  ledgerSchema,
  WEEK_SECONDS,
  WEEKLY_POOL,
  nextSunday,
  type PointsLedger,
  type PointsEpoch,
  type PointsResponse,
} from "@/features/points/model";
import { allocatePoints, EXCLUDED } from "./rewards";

export function validateLedger(input: unknown): PointsLedger {
  const ledger = ledgerSchema.parse(input);
  const baseline = new Set<string>();
  for (const row of ledger.baseline.balances) {
    if (baseline.has(row.address)) throw Error("Duplicate baseline wallet");
    baseline.add(row.address);
  }
  let expectedStart: string = ledger.start;
  for (const epoch of ledger.epochs) {
    const start = new Date(epoch.start),
      end = new Date(epoch.end);
    if (
      epoch.start !== expectedStart ||
      end.getTime() - start.getTime() !== WEEK_SECONDS * 1000 ||
      end.getUTCDay() !== 0 ||
      end.getUTCHours() ||
      end.getUTCMinutes() ||
      end.getUTCSeconds() ||
      end.getUTCMilliseconds()
    )
      throw Error("Nonconsecutive weekly points ledger");
    if (BigInt(epoch.endBlock) < BigInt(epoch.startBlock))
      throw Error("Invalid settlement blocks");
    if (new Date(epoch.calculatedAt) < end) throw Error("Premature settlement");
    const seen = new Set<string>();
    let sum = 0n;
    for (const row of epoch.awards) {
      if (seen.has(row.address) || EXCLUDED.has(row.address))
        throw Error("Invalid weekly wallet");
      seen.add(row.address);
      sum += BigInt(row.walletPoints) + BigInt(row.lpPoints);
    }
    if (
      sum !== BigInt(epoch.distributed) ||
      sum + BigInt(epoch.unallocated) !== WEEKLY_POOL
    )
      throw Error("Invalid weekly allocation");
    const expected = allocatePoints(
      new Map(
        epoch.awards.map((r) => [
          r.address,
          { wallet: BigInt(r.walletSeconds), lp: BigInt(r.lpSeconds) },
        ]),
      ),
    );
    const actual = [...epoch.awards].sort((a, b) =>
      a.address.localeCompare(b.address),
    );
    if (JSON.stringify(actual) !== JSON.stringify(expected.awards))
      throw Error("Weekly weights do not match points");
    expectedStart = epoch.end;
  }
  return ledger;
}
/** A settled cutoff is immutable; reruns cannot add the same week again. */
export function appendEpoch(input: unknown, epoch: PointsEpoch): PointsLedger {
  const ledger = validateLedger(input);
  if (ledger.epochs.some((e) => e.end === epoch.end))
    throw Error("Week already settled");
  return validateLedger({ ...ledger, epochs: [...ledger.epochs, epoch] });
}
export function projectPoints(
  ledger: PointsLedger,
  address: string | null,
  page: number | null,
  now = new Date(),
): PointsResponse {
  if (
    ledger.epochs.some(
      (epoch) =>
        new Date(epoch.end) > now || new Date(epoch.calculatedAt) > now,
    )
  )
    throw Error("Future points settlement is not public");
  const balances = new Map(
    ledger.baseline.balances.map((r) => [r.address, BigInt(r.points)]),
  );
  for (const epoch of ledger.epochs)
    for (const row of epoch.awards)
      balances.set(
        row.address,
        (balances.get(row.address) ?? 0n) +
          BigInt(row.walletPoints) +
          BigInt(row.lpPoints),
      );
  const ranked = [...balances.entries()]
    .filter(([, n]) => n > 0n)
    .sort(([a, x], [b, y]) => (x > y ? -1 : x < y ? 1 : a.localeCompare(b)));
  const lastSettledAt = ledger.epochs.at(-1)?.end ?? ledger.baseline.cutoff;
  const due = new Date(lastSettledAt).getTime() + WEEK_SECONDS * 1000;
  const pages = Math.max(1, Math.ceil(ranked.length / 20));
  const currentPage = page === null ? 0 : Math.min(page, pages - 1);
  const history = address
    ? [...ledger.epochs].reverse().map((e) => {
        const row = e.awards.find((r) => r.address === address);
        const walletPoints = row?.walletPoints ?? "0",
          lpPoints = row?.lpPoints ?? "0";
        return {
          start: e.start,
          end: e.end,
          walletPoints,
          lpPoints,
          total: String(BigInt(walletPoints) + BigInt(lpPoints)),
        };
      })
    : [];
  const rank = address ? ranked.findIndex(([a]) => a === address) : -1;
  return {
    version: ledger.version,
    lastSettledAt,
    nextCutoff:
      due <= now.getTime() ? new Date(due).toISOString() : nextSunday(now),
    weeklyPool: String(WEEKLY_POOL),
    status: due <= now.getTime() ? "processing" : "accruing",
    account: address
      ? {
          address,
          total: String(balances.get(address) ?? 0n),
          carriedOver:
            ledger.baseline.balances.find((r) => r.address === address)
              ?.points ?? "0",
          rank: rank < 0 ? null : rank + 1,
          lastAward: history[0]?.total ?? "0",
          history,
        }
      : null,
    leaderboard:
      page === null
        ? null
        : {
            rows: ranked
              .slice(currentPage * 20, (currentPage + 1) * 20)
              .map(([address, total], i) => ({
                address,
                total: String(total),
                rank: currentPage * 20 + i + 1,
              })),
            total: ranked.length,
            page: currentPage,
            pages,
          },
  };
}
