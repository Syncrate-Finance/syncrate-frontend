import type { Metadata } from "next";
import { DashboardOverview } from "@/features/dashboard/overview";
import { getOpportunityView } from "@/features/opportunities/catalog";
export const metadata: Metadata = {
  title: "App | Syncrate",
  description:
    "Mint and redeem SGLD on Base, view your portfolio and explore opportunities.",
  alternates: { canonical: "https://app.syncrate.org" },
  robots: { index: false, follow: true },
};
export const viewport = { themeColor: "#f5f7f8" };
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const { view } = await searchParams;
  return <DashboardOverview initialView={getOpportunityView(view)} />;
}
