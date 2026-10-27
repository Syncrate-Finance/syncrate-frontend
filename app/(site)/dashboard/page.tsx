import type { Metadata } from 'next'
import { DashboardOverview } from '@/features/dashboard/overview'
import { getOpportunityView } from '@/features/opportunities/catalog'
export const metadata: Metadata = {
  title: 'Overview | Syncrate',
  description:
    'View your SGLD portfolio and explore upcoming Prime opportunities on Base.',
  alternates: { canonical: '/dashboard' },
  robots: { index: false, follow: true },
}
export const viewport = { themeColor: '#f5f7f8' }
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>
}) {
  const { view } = await searchParams
  return <DashboardOverview initialView={getOpportunityView(view)} />
}
