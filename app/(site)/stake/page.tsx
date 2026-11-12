import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APP_ORIGIN, isAppSurface } from "@/config/site";
import { StakingDashboard } from "@/features/staking/dashboard";
import { getStakingTerm } from "@/features/staking/model";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Stake SGLD | Syncrate",
  description:
    "Explore 30-day and 90-day SGLD staking and sySGLD, Syncrate's yield-bearing gold asset. Staking is coming soon.",
  alternates: { canonical: APP_ORIGIN + "/stake" },
  robots: { index: false, follow: true },
};
export const viewport = { themeColor: "#f5f6f8" };

export default async function StakePage({
  searchParams,
}: {
  searchParams: Promise<{
    preview?: string | string[];
    term?: string | string[];
  }>;
}) {
  const [h, query] = await Promise.all([headers(), searchParams]);
  const term = getStakingTerm(query.term);
  if (!isAppSurface(h.get("host"), process.env.APP_ENV, query.preview))
    redirect(`${APP_ORIGIN}/stake?term=${term}`);
  return <StakingDashboard initialTerm={term} />;
}
