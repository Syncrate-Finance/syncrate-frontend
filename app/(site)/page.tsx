import type { Metadata } from "next";
import { headers } from "next/headers";
import { MarketingHomepage } from "@/features/marketing/homepage";
import { DashboardOverview } from "@/features/dashboard/overview";
import { getOpportunityView } from "@/features/opportunities/catalog";
import { APP_ORIGIN, WEBSITE_ORIGIN, isAppSurface } from "@/config/site";
export const dynamic = "force-dynamic";
type PageProps = {
  searchParams: Promise<{
    view?: string | string[];
    preview?: string | string[];
  }>;
};
async function appRequest(props: PageProps) {
  const [requestHeaders, query] = await Promise.all([
    headers(),
    props.searchParams,
  ]);
  return {
    app: isAppSurface(
      requestHeaders.get("host"),
      process.env.APP_ENV,
      query.preview,
    ),
    query,
  };
}
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { app } = await appRequest(props);
  return app
    ? {
        title: "App | Syncrate",
        description:
          "Mint and redeem SGLD on Base, view your portfolio and explore opportunities.",
        alternates: { canonical: APP_ORIGIN },
        openGraph: { title: "App | Syncrate", url: APP_ORIGIN },
        robots: { index: false, follow: true },
      }
    : {
        title: "Syncrate | Gold, Built for Onchain Finance",
        description:
          "Making gold composable, programmable and useful onchain. Explore SGLD on Base and learn about sySGLD gold financing.",
        alternates: { canonical: WEBSITE_ORIGIN },
      };
}
export async function generateViewport(props: PageProps) {
  return { themeColor: (await appRequest(props)).app ? "#f5f7f8" : "#f7f7f0" };
}
export default async function HomePage(props: PageProps) {
  const { app, query } = await appRequest(props);
  return app ? (
    <DashboardOverview initialView={getOpportunityView(query.view)} />
  ) : (
    <MarketingHomepage />
  );
}
