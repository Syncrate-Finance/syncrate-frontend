import {
  readFile,
  writeFile,
  rename,
  mkdir,
  open,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import {
  PROGRAM_START,
  WEEK_SECONDS,
  type PointsEpoch,
} from "../features/points/model";
import { validateLedger, appendEpoch } from "../server/points/ledger";
import { calculateHoldingsWeek, pointsClient } from "../server/points/chain";
import { diagnosePointsFailure } from "../server/points/diagnostics";

const root = path.resolve("data/points");
const ledgerPath = path.join(root, "ledger.json");
const args = new Set(process.argv.slice(2));
if ([...args].some((arg) => !["--dry-run", "--verify-current"].includes(arg)))
  throw Error("Unknown points command option");
const dryRun = args.has("--dry-run") || args.has("--verify-current");
async function atomic(file: string, data: unknown) {
  const temporary = file + `.${process.pid}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(data, null, 2) + "\n", {
      flag: "wx",
    });
    await rename(temporary, file);
  } finally {
    await unlink(temporary).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
}
async function main() {
  await mkdir(root, { recursive: true });
  const lock = path.join(root, ".settlement.lock");
  const handle = await open(lock, "wx");
  try {
    let ledger = validateLedger(JSON.parse(await readFile(ledgerPath, "utf8")));
    const now = new Date();
    const cutoff = Math.floor(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - now.getUTCDay(),
      ) / 1000,
    );
    let start = Math.floor(
      new Date(ledger.epochs.at(-1)?.end ?? PROGRAM_START).getTime() / 1000,
    );
    if (args.has("--verify-current")) {
      const client = pointsClient();
      if ((await client.getChainId()) !== 8453)
        throw Error("Points RPC network must be Base Mainnet (8453)");
      console.log("Connected to Base Mainnet for historical verification.");
      const finalized = await client.getBlock({ blockTag: "finalized" });
      const end = Number(finalized.timestamp);
      if (end <= start) throw Error("No finalized current interval");
      const report = await calculateHoldingsWeek(
        client,
        start,
        end,
        console.log,
      );
      console.log(
        JSON.stringify({
          mode: "verification-only",
          start: report.start,
          end: report.end,
          wallets: report.awards.length,
          totalPoints: report.distributed,
          endBlock: report.endBlock,
          endBlockHash: report.endBlockHash,
        }),
      );
      return;
    }
    let processed = 0;
    while (start + WEEK_SECONDS <= cutoff) {
      if (processed++ >= 8)
        throw Error("Catch-up exceeds eight weeks; review before continuing");
      const end = start + WEEK_SECONDS;
      const file = path.join(
        root,
        "epochs",
        new Date(start * 1000).toISOString().slice(0, 10) + ".json",
      );
      let epoch: PointsEpoch;
      try {
        epoch = JSON.parse(await readFile(file, "utf8"));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        epoch = await calculateHoldingsWeek(
          pointsClient(),
          start,
          end,
          console.log,
        );
      }
      const next = appendEpoch(ledger, epoch);
      if (!dryRun) {
        await mkdir(path.dirname(file), { recursive: true });
        try {
          await writeFile(file, JSON.stringify(epoch, null, 2) + "\n", {
            flag: "wx",
          });
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        }
        await atomic(ledgerPath, next);
      }
      ledger = next;
      start = end;
      console.log(
        `${dryRun ? "Verified without publishing" : "Settled"} cutoff ${epoch.end}; ${epoch.distributed} points.`,
      );
    }
    if (!processed)
      console.log(
        "No unsettled completed Sunday interval. Existing points unchanged.",
      );
  } finally {
    await handle.close();
    await unlink(lock);
  }
}
main().catch((error: unknown) => {
  if (!process.env.POINTS_RPC_URL) {
    console.error(
      "Configure the repository Actions secret POINTS_RPC_URL with an archive-enabled Base HTTPS endpoint. Existing points are unchanged.",
    );
    process.exitCode = 1;
    return;
  }
  console.error(
    "Points calculation failed. Incomplete ranges are never published; inspect RPC availability, archive support and ledger validation.",
  );
  console.error(JSON.stringify(diagnosePointsFailure(error)));
  process.exitCode = 1;
});
