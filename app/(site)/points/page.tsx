import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APP_ORIGIN, isAppSurface } from "@/config/site";
import { PointsDashboard } from "@/features/points/dashboard";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Points | Syncrate",
  description:
    "Your SGLD holding rewards, weekly distributions and Uniswap points multiplier on Base.",
  alternates: { canonical: APP_ORIGIN + "/points" },
  robots: { index: false, follow: true },
};
export const viewport = { themeColor: "#f5f6f8" };
export default async function PointsPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string | string[] }>;
}) {
  const [h, q] = await Promise.all([headers(), searchParams]);
  if (!isAppSurface(h.get("host"), process.env.APP_ENV, q.preview))
    redirect(APP_ORIGIN + "/points");
  return <PointsDashboard />;
}
