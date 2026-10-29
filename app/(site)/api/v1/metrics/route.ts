import { getPublicMetrics } from "@/server/services/metrics";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const data = await getPublicMetrics();
    const complete =
      data.inventory.state === "ready" && data.sgldMarketCap.state === "ready";
    return Response.json(data, {
      headers: {
        "Cache-Control": complete
          ? "public, max-age=0, s-maxage=30"
          : "no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "Metrics temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
