import "server-only";
import source from "@/data/points/ledger.json";
import { validateLedger, projectPoints } from "./ledger";
let cached: ReturnType<typeof validateLedger> | undefined;
export function getPoints(address: string | null, page: number | null) {
  cached ??= validateLedger(source);
  return projectPoints(cached, address, page);
}
