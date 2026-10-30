import { getPoints } from "@/server/points/service";
export const dynamic = "force-dynamic";
// Preserve the old operator/API URL while serving the current, paginated program.
export async function GET() {
  try {
    return Response.json(getPoints(null, 0), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Points are temporarily unavailable." },
      { status: 503 },
    );
  }
}
