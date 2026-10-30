import { getAddress } from "viem";
import { getPoints } from "@/server/points/service";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const keys = [...url.searchParams.keys()];
  const raw = url.searchParams.get("address");
  const page = url.searchParams.get("page");
  const json = (data: unknown, status = 200) =>
    Response.json(data, {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  if (
    keys.some((k) => !["address", "page"].includes(k)) ||
    keys.length !== new Set(keys).size ||
    (page !== null && !/^(0|[1-9][0-9]{0,5})$/.test(page))
  )
    return json({ error: "Invalid points request." }, 400);
  let address: string | null = null;
  if (raw !== null) {
    try {
      address = getAddress(raw).toLowerCase();
    } catch {
      return json({ error: "Invalid wallet address." }, 400);
    }
  }
  try {
    return json(getPoints(address, page === null ? null : Number(page)));
  } catch {
    return json({ error: "Points are temporarily unavailable." }, 503);
  }
}
