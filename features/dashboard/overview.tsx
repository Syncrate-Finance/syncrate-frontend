"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  CircleHelp,
  Layers3,
  RefreshCw,
} from "lucide-react";
import { formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  EARN_OPPORTUNITIES,
  opportunityLabel,
  type EarnOpportunity,
  type OpportunityView,
} from "@/features/opportunities/catalog";
import { useSgldBalance } from "@/features/portfolio/use-sgld-balance";
import { formatSgldBalance } from "@/features/portfolio/sgld-read";
import { BaseIcon, DashboardShell } from "./shell";
import { SwapPanel } from "@/features/swap/swap-panel";
import styles from "./dashboard.module.css";
function Help({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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
  );
}
function SgldIcon({ size = 32 }: { size?: number }) {
  return (
    <span className={styles.tokenIcon} style={{ width: size, height: size }}>
      <Image src="/SGLD-icon.png" alt="" width={size} height={size} />
    </span>
  );
}
function PortfolioCard() {
  const { phase, snapshot, isFetching, refetch } = useSgldBalance();
  const balance = snapshot
    ? formatSgldBalance(snapshot.balance, snapshot.decimals)
    : "—";
  return (
    <section
      className={styles.portfolioCard}
      aria-labelledby="portfolio-heading"
    >
      <div className={styles.portfolioHeading}>
        <h2 id="portfolio-heading">Your portfolio</h2>
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
            ? `Your SGLD balance on Base, read at block ${snapshot.blockNumber.toLocaleString("en-US")}. Dollar valuation is not available yet.`
            : "Connect a wallet on Base to read its SGLD balance. Portfolio reads require no signature. Minting and redemption require separate wallet confirmations."}
        </Help>
      </div>
      <div className={styles.portfolioStatus} role="status">
        {phase === "disconnected" &&
          "Connect your wallet to view your holdings."}
        {phase === "connecting" && "Connecting to your wallet…"}
        {phase === "wrong-network" &&
          "Switch your wallet to Base to view SGLD."}
        {phase === "loading" && "Reading your SGLD balance…"}
        {phase === "error" && (
          <>
            <span>Balance unavailable.</span>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className={styles.retryButton}
            >
              <RefreshCw size={12} /> {isFetching ? "Retrying…" : "Try again"}
            </button>
          </>
        )}
        {phase === "ready" && (
          <>
            <span className={styles.liveDot} />
            {isFetching ? "Updating balance…" : "SGLD balance on Base"}
          </>
        )}
      </div>
      <dl className={styles.metrics}>
        <div>
          <dt>
            Total earned{" "}
            <Help label="total earned">
              Earnings will be shown only when supported positions and verified
              reward history are available. A token balance is not a record of
              earnings.
            </Help>
            <a
              href="https://syncrate.org/points"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.pointsLink}
              aria-label="View Points (opens in a new tab)"
            >
              View Points <ArrowUpRight size={12} aria-hidden="true" />
            </a>
          </dt>
          <dd>—</dd>
        </div>
      </dl>
    </section>
  );
}
function OfferIcon({
  offer,
  size = 19,
}: {
  offer: EarnOpportunity;
  size?: number;
}) {
  return offer.kind === "liquidity" ? (
    <Image
      src={offer.logo}
      width={size + 12}
      height={size + 12}
      alt=""
      className={styles.saffronLogo}
    />
  ) : (
    <Layers3 size={size} />
  );
}
function OfferTitle({ offer }: { offer: EarnOpportunity }) {
  return (
    <>
      {offer.name}
      {offer.kind === "staking" && (
        <span>
          {" · "}
          {offer.days} days
        </span>
      )}
    </>
  );
}
function statusLabel(offer: EarnOpportunity) {
  return offer.kind === "staking" ? "Coming soon" : `${offer.apr}% APR`;
}
function OpportunityDetails({
  offer,
  children,
}: {
  offer: EarnOpportunity;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={styles.opportunityDialog}>
        <div className={styles.detailsIcon}>
          <OfferIcon offer={offer} size={23} />
        </div>
        <span className={styles.upcomingBadge}>{statusLabel(offer)}</span>
        <DialogTitle className={styles.detailsTitle}>
          <OfferTitle offer={offer} />
        </DialogTitle>
        <DialogDescription className={styles.detailsDescription}>
          {offer.kind === "staking"
            ? "Lock SGLD and earn more SGLD alongside Sync Points. Coming soon; deposits are not open."
            : "Provide both SGLD and USDC liquidity on Uniswap, via Saffron on Base."}
        </DialogDescription>
        <dl className={styles.detailsGrid}>
          <div>
            <dt>{offer.kind === "staking" ? "Timeframe" : "Integration"}</dt>
            <dd>
              {offer.kind === "staking"
                ? `${offer.days} days`
                : offer.integration}
            </dd>
          </div>
          {offer.kind === "liquidity" && (
            <div>
              <dt>Duration</dt>
              <dd>2 weeks</dd>
            </div>
          )}
          <div>
            <dt>Network</dt>
            <dd>
              <BaseIcon /> {offer.network}
            </dd>
          </div>
          <div>
            <dt>Deposit asset</dt>
            <dd>
              <span>
                {offer.depositAsset}
                {offer.kind === "liquidity" && (
                  <span className={styles.assetSides}>
                    Both sides of liquidity
                  </span>
                )}
              </span>
            </dd>
          </div>
          <div>
            <dt>APR</dt>
            <dd>{offer.apr === null ? "Not announced" : `${offer.apr}%`}</dd>
          </div>
        </dl>
        <p className={styles.detailsNote}>
          {offer.kind === "staking"
            ? "Rates, eligibility and participation terms will be published when approved. No staking contract or deposit action is available for this offer."
            : "Stated annual rate (APR): 300%. Program duration: 2 weeks. The pool opens on Uniswap."}
        </p>
        <div className={styles.detailsActions}>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          {offer.kind === "staking" ? (
            <Button disabled>Explore SGLD Staking</Button>
          ) : (
            <Button asChild>
              <a
                href={offer.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Uniswap pool <ArrowUpRight size={14} />
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
function OpportunitiesTable() {
  return (
    <>
      <div className={styles.tableScroll}>
        <table className={styles.opportunitiesTable}>
          <caption className="sr-only">
            LP on Uniswap via Saffron on Base, stated APR 300% for a two-week
            program, followed by upcoming SGLD staking terms of 30 and 90 days.
          </caption>
          <thead>
            <tr>
              <th scope="col">Opportunity</th>
              <th scope="col">Deposit asset</th>
              <th scope="col">Type</th>
              <th scope="col">Network</th>
              <th scope="col">APR</th>
            </tr>
          </thead>
          <tbody>
            {EARN_OPPORTUNITIES.map((offer) => (
              <tr key={offer.id}>
                <td>
                  <OpportunityDetails offer={offer}>
                    <button
                      type="button"
                      className={styles.opportunityName}
                      aria-label={`View ${opportunityLabel(offer)} details`}
                    >
                      <span className={styles.primeIcon}>
                        <OfferIcon offer={offer} />
                      </span>
                      <span>
                        <span className={styles.offerTitle}>
                          <OfferTitle offer={offer} />
                          <ChevronRight size={13} />
                        </span>
                        <span className={styles.providerName}>
                          {offer.provider}
                        </span>
                      </span>
                    </button>
                  </OpportunityDetails>
                </td>
                <td>
                  <span className={styles.unannounced}>
                    {offer.depositAsset ?? "Not announced"}
                  </span>
                </td>
                <td>
                  {offer.kind === "staking" ? "Staking" : "Liquidity Provision"}
                </td>
                <td>
                  <span className={styles.networkLabel}>
                    <BaseIcon />
                    <span>{offer.network}</span>
                  </span>
                </td>
                <td>
                  <span className={styles.rateCell}>
                    <span
                      className={
                        offer.kind === "liquidity"
                          ? styles.aprValue
                          : styles.upcomingBadge
                      }
                    >
                      {statusLabel(offer)}
                    </span>
                    {offer.kind === "liquidity" ? (
                      <span>2 weeks</span>
                    ) : (
                      <span className="sr-only">APR not announced</span>
                    )}
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
        aria-label="Earn opportunities"
      >
        {EARN_OPPORTUNITIES.map((offer) => (
          <article
            className={styles.mobileOffer}
            role="listitem"
            key={offer.id}
          >
            <div className={styles.mobileOfferHeading}>
              <span className={styles.primeIcon}>
                <OfferIcon offer={offer} />
              </span>
              <div>
                <h3>
                  <OfferTitle offer={offer} />
                </h3>
                <span className={styles.providerName}>{offer.provider}</span>
              </div>
              <span className={styles.upcomingBadge}>{statusLabel(offer)}</span>
            </div>
            <dl>
              <div>
                <dt>Deposit asset</dt>
                <dd>{offer.depositAsset ?? "Not announced"}</dd>
              </div>
              <div>
                <dt>APR</dt>
                <dd
                  aria-label={
                    offer.apr === null ? "APR not announced" : undefined
                  }
                >
                  {offer.apr === null ? "—" : `${offer.apr}%`}
                </dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>
                  {offer.kind === "staking" ? "Staking" : "Liquidity Provision"}
                </dd>
              </div>
              <div>
                <dt>Network</dt>
                <dd>
                  <BaseIcon /> {offer.network}
                </dd>
              </div>
              {offer.kind === "liquidity" && (
                <div>
                  <dt>Duration</dt>
                  <dd>2 weeks</dd>
                </div>
              )}
            </dl>
            <OpportunityDetails offer={offer}>
              <Button
                variant="outline"
                size="sm"
                className={styles.mobileDetails}
                aria-label={`View ${opportunityLabel(offer)} details`}
              >
                View details <ArrowUpRight size={14} />
              </Button>
            </OpportunityDetails>
          </article>
        ))}
      </div>
    </>
  );
}
function Positions() {
  return (
    <div className={styles.emptyPositions}>
      <p>Your positions will appear here</p>
    </div>
  );
}
export function DashboardOverview({
  initialView,
}: {
  initialView: OpportunityView;
}) {
  const [view, setView] = useState<OpportunityView>(initialView);
  const router = useRouter();
  useEffect(() => setView(initialView), [initialView]);
  function changeView(next: string) {
    const selected = next === "positions" ? "positions" : "all";
    setView(selected);
    const query = new URLSearchParams(window.location.search);
    if (selected === "positions") query.set("view", "positions");
    else query.delete("view");
    router.replace("/" + (query.size ? "?" + query.toString() : ""), {
      scroll: false,
    });
  }
  return (
    <TooltipProvider delayDuration={250}>
      <DashboardShell>
        <main className={styles.main} id="main-content">
          <h1 className="sr-only">Syncrate overview</h1>
          <div className={styles.topGrid}>
            <PortfolioCard />
            <div className={styles.swapColumn}>
              <SwapPanel />
            </div>
            <section
              className={styles.opportunitiesCard}
              aria-labelledby="opportunities-heading"
            >
              <Tabs value={view} onValueChange={changeView}>
                <div className={styles.opportunitiesToolbar}>
                  <div className={styles.opportunitiesHeading}>
                    <h2 id="opportunities-heading">
                      {view === "positions" ? "Your positions" : "Earn with"}
                    </h2>
                    {view === "all" ? (
                      <span className={styles.assetPill}>
                        <SgldIcon size={24} /> SGLD
                      </span>
                    ) : (
                      <span className={styles.positionsSubtitle}>
                        Staking · Liquidity · Lending
                      </span>
                    )}
                  </div>
                  <div className={styles.opportunitiesActions}>
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
            </section>
          </div>
        </main>
      </DashboardShell>
    </TooltipProvider>
  );
}
