'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Layers3,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { formatUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import {
  PRIME_OPPORTUNITIES,
  type PrimeOpportunity,
  type OpportunityView,
} from '@/features/opportunities/catalog'
import { useSgldBalance } from '@/features/portfolio/use-sgld-balance'
import { formatSgldBalance } from '@/features/portfolio/sgld-read'
import { BaseIcon, DashboardShell, WalletControl } from './shell'
import styles from './dashboard.module.css'
function Help({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={styles.helpButton}
          aria-label={`About ${label}`}
        >
          <CircleHelp size={12} />
        </button>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  )
}
function SgldIcon({ size = 32 }: { size?: number }) {
  return (
    <span className={styles.tokenIcon} style={{ width: size, height: size }}>
      <Image src="/SGLD-icon.png" alt="" width={size} height={size} />
    </span>
  )
}
function BuyButton({ teal = false }: { teal?: boolean }) {
  return (
    <Button asChild variant={teal ? 'teal' : 'default'} size="sm">
      <a href="https://syncrate.org/app">
        Buy SGLD <ArrowRight size={14} />
      </a>
    </Button>
  )
}
function PortfolioCard() {
  const { phase, snapshot, isFetching, refetch } = useSgldBalance()
  const balance = snapshot
    ? formatSgldBalance(snapshot.balance, snapshot.decimals)
    : '—'
  return (
    <section
      className={styles.portfolioCard}
      aria-labelledby="portfolio-heading"
    >
      <div className={styles.portfolioHeading}>
        <h2 id="portfolio-heading">Your portfolio</h2>
        <span>SGLD · Base</span>
      </div>
      <div
        className={styles.portfolioValue}
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          className={styles.balance}
          title={
            snapshot
              ? `${formatUnits(snapshot.balance, snapshot.decimals)} SGLD`
              : undefined
          }
        >
          {balance}
        </span>
        {snapshot && <span className={styles.balanceUnit}>SGLD</span>}
        <Help label="portfolio balance">
          {snapshot
            ? `Your SGLD balance on Base, read at block ${snapshot.blockNumber.toLocaleString('en-US')}. Dollar valuation is not available yet.`
            : 'Connect a wallet on Base to read its SGLD balance. This overview never requests a signature or executes a transaction.'}
        </Help>
      </div>
      <div className={styles.portfolioStatus} role="status">
        {phase === 'disconnected' &&
          'Connect your wallet to view your holdings.'}
        {phase === 'connecting' && 'Connecting to your wallet…'}
        {phase === 'wrong-network' &&
          'Switch your wallet to Base to view SGLD.'}
        {phase === 'loading' && 'Reading your SGLD balance…'}
        {phase === 'error' && (
          <>
            <span>Balance unavailable.</span>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className={styles.retryButton}
            >
              <RefreshCw size={12} /> {isFetching ? 'Retrying…' : 'Try again'}
            </button>
          </>
        )}
        {phase === 'ready' && (
          <>
            <span className={styles.liveDot} />
            {isFetching ? 'Updating balance…' : 'SGLD balance on Base'}
            <span className={styles.valueDivider}>·</span>
            <span>USD valuation unavailable</span>
          </>
        )}
      </div>
      <dl className={styles.metrics}>
        <div>
          <dt>
            Net APY{' '}
            <Help label="net APY">
              SGLD itself does not generate yield. Prime staking opportunities
              are upcoming, so no portfolio yield rate is available.
            </Help>
          </dt>
          <dd className={styles.tealDash}>—</dd>
        </div>
        <div>
          <dt>
            Est. monthly yield{' '}
            <Help label="estimated monthly yield">
              There are no live Prime positions to calculate a yield estimate
              from. No rate or monthly payout is assumed.
            </Help>
          </dt>
          <dd>—</dd>
        </div>
        <div>
          <dt>
            Total earned{' '}
            <Help label="total earned">
              Earnings will be shown only when supported positions and verified
              reward history are available. A token balance is not a record of
              earnings.
            </Help>
          </dt>
          <dd>—</dd>
        </div>
      </dl>
    </section>
  )
}
function OpportunityDetails({
  offer,
  children,
}: {
  offer: PrimeOpportunity
  children: React.ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={styles.opportunityDialog}>
        <div className={styles.detailsIcon}>
          <Layers3 size={23} />
        </div>
        <span className={styles.upcomingBadge}>Upcoming</span>
        <DialogTitle className={styles.detailsTitle}>
          Prime <span>· {offer.months} months</span>
        </DialogTitle>
        <DialogDescription className={styles.detailsDescription}>
          A planned staking opportunity from Syncrate. It is not open for
          deposits.
        </DialogDescription>
        <dl className={styles.detailsGrid}>
          <div>
            <dt>Timeframe</dt>
            <dd>{offer.months} months</dd>
          </div>
          <div>
            <dt>Planned network</dt>
            <dd>
              <BaseIcon /> Base
            </dd>
          </div>
          <div>
            <dt>Deposit asset</dt>
            <dd>Not announced</dd>
          </div>
          <div>
            <dt>APY</dt>
            <dd>Not announced</dd>
          </div>
        </dl>
        <p className={styles.detailsNote}>
          Rates, eligibility and participation terms will be published when
          approved. No staking contract or deposit action is available for this
          offer.
        </p>
        <div className={styles.detailsActions}>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button asChild>
            <Link href="/sgld">
              Explore SGLD <ArrowUpRight size={14} />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
function OpportunitiesTable() {
  return (
    <>
      <div className={styles.tableScroll}>
        <table className={styles.opportunitiesTable}>
          <caption className="sr-only">
            Three upcoming Prime staking opportunities on Base. Rates and
            deposit assets have not been announced.
          </caption>
          <thead>
            <tr>
              <th scope="col">Opportunity</th>
              <th scope="col">Deposit asset</th>
              <th scope="col">Type</th>
              <th scope="col">Network</th>
              <th scope="col">APY</th>
            </tr>
          </thead>
          <tbody>
            {PRIME_OPPORTUNITIES.map((offer) => (
              <tr key={offer.id}>
                <td>
                  <OpportunityDetails offer={offer}>
                    <button
                      type="button"
                      className={styles.opportunityName}
                      aria-label={`View Prime ${offer.months} month details`}
                    >
                      <span className={styles.primeIcon}>
                        <Layers3 size={19} />
                      </span>
                      <span>
                        <span className={styles.offerTitle}>
                          Prime <span>· {offer.months} months</span>
                          <ChevronRight size={13} />
                        </span>
                        <span className={styles.providerName}>Syncrate</span>
                      </span>
                    </button>
                  </OpportunityDetails>
                </td>
                <td>
                  <span className={styles.unannounced}>Not announced</span>
                </td>
                <td>Staking</td>
                <td>
                  <span className={styles.networkLabel}>
                    <BaseIcon />
                    <span>
                      Base<span className={styles.plannedLabel}>Planned</span>
                    </span>
                  </span>
                </td>
                <td>
                  <span className={styles.rateCell}>
                    <span className={styles.upcomingBadge}>Upcoming</span>
                    <span>Not announced</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        className={styles.mobileOffers}
        role="list"
        aria-label="Upcoming Prime opportunities"
      >
        {PRIME_OPPORTUNITIES.map((offer) => (
          <article
            className={styles.mobileOffer}
            role="listitem"
            key={offer.id}
          >
            <div className={styles.mobileOfferHeading}>
              <span className={styles.primeIcon}>
                <Layers3 size={19} />
              </span>
              <div>
                <h3>
                  Prime <span>· {offer.months} months</span>
                </h3>
                <span>Syncrate</span>
              </div>
              <span className={styles.upcomingBadge}>Upcoming</span>
            </div>
            <dl>
              <div>
                <dt>Deposit asset</dt>
                <dd>Not announced</dd>
              </div>
              <div>
                <dt>APY</dt>
                <dd>Not announced</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>Staking</dd>
              </div>
              <div>
                <dt>Planned network</dt>
                <dd>
                  <BaseIcon /> Base
                </dd>
              </div>
            </dl>
            <OpportunityDetails offer={offer}>
              <Button
                variant="outline"
                size="sm"
                className={styles.mobileDetails}
                aria-label={`View Prime ${offer.months} month details`}
              >
                View details <ArrowUpRight size={14} />
              </Button>
            </OpportunityDetails>
          </article>
        ))}
      </div>
    </>
  )
}
function Positions() {
  const { isConnected } = useSgldBalance()
  return (
    <div className={styles.emptyPositions}>
      <span className={styles.emptyIcon}>
        {isConnected ? (
          <Layers3 size={28} strokeWidth={1.3} />
        ) : (
          <Wallet size={28} strokeWidth={1.3} />
        )}
      </span>
      <h3>
        {isConnected
          ? 'Prime is on the way'
          : 'Your positions, all in one place'}
      </h3>
      <p>
        {isConnected
          ? 'Prime staking is upcoming. There are no live Prime positions to display here yet.'
          : 'Connect your wallet to explore your portfolio. Prime staking opportunities are coming soon.'}
      </p>
      {!isConnected && <WalletControl compact />}
      <span className={styles.emptyNote}>
        Your SGLD holdings are shown in Your portfolio.
      </span>
    </div>
  )
}
export function DashboardOverview({
  initialView,
}: {
  initialView: OpportunityView
}) {
  const [view, setView] = useState<OpportunityView>(initialView)
  const router = useRouter()
  useEffect(() => setView(initialView), [initialView])
  function changeView(next: string) {
    const selected = next === 'positions' ? 'positions' : 'all'
    setView(selected)
    router.replace(
      selected === 'positions' ? '/dashboard?view=positions' : '/dashboard',
      { scroll: false },
    )
  }
  return (
    <TooltipProvider delayDuration={250}>
      <DashboardShell>
        <main className={styles.main} id="main-content">
          <h1 className="sr-only">Syncrate overview</h1>
          <div className={styles.topGrid}>
            <PortfolioCard />
            <section
              className={styles.buyCard}
              aria-labelledby="buy-sgld-heading"
            >
              <div className={styles.buyCardHeading}>
                <SgldIcon size={34} />
                <h2 id="buy-sgld-heading">SGLD</h2>
              </div>
              <p>Gold-backed exposure, built for onchain finance.</p>
              <BuyButton />
            </section>
          </div>
          <section
            className={styles.opportunitiesCard}
            aria-labelledby="opportunities-heading"
          >
            <Tabs value={view} onValueChange={changeView}>
              <div className={styles.opportunitiesToolbar}>
                <div className={styles.opportunitiesHeading}>
                  <h2 id="opportunities-heading">
                    {view === 'positions' ? 'Your positions' : 'Earn with'}
                  </h2>
                  {view === 'all' ? (
                    <span className={styles.assetPill}>
                      <SgldIcon size={24} /> SGLD
                    </span>
                  ) : (
                    <span className={styles.positionsSubtitle}>
                      Prime · Base
                    </span>
                  )}
                </div>
                <div className={styles.opportunitiesActions}>
                  {view === 'all' && <BuyButton teal />}
                  <TabsList aria-label="Opportunity view">
                    <TabsTrigger value="all">All opportunities</TabsTrigger>
                    <TabsTrigger value="positions">My Positions</TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <TabsContent value="all">
                <OpportunitiesTable />
              </TabsContent>
              <TabsContent value="positions">
                <Positions />
              </TabsContent>
            </Tabs>
            <div className={styles.catalogueNote}>
              <Clock3 size={13} />
              <span>
                Prime is in development. Terms and rates will be announced
                before launch.
              </span>
            </div>
          </section>
          <section
            className={styles.informationStrip}
            aria-labelledby="sysgld-overview"
          >
            <span className={styles.informationIcon}>
              <ShieldCheck size={22} strokeWidth={1.3} />
            </span>
            <div>
              <h2 id="sysgld-overview">Understand sySGLD</h2>
              <p>
                A separate gold-financing strategy. Explore how it differs from
                holding SGLD.
              </p>
            </div>
            <Link href="/sysgld">
              Learn more <ArrowUpRight size={15} />
            </Link>
          </section>
          <div className={styles.readOnlyNote}>
            <Check size={12} /> Read-only overview <span>·</span>
            <Link href="/terms">
              Terms & disclosures <ArrowUpRight size={11} />
            </Link>
          </div>
        </main>
      </DashboardShell>
    </TooltipProvider>
  )
}
