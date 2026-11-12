"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  type LiquidityOpportunity,
  type OpportunityView,
} from "@/features/opportunities/catalog";
import { PortfolioCard } from "@/features/portfolio/card";
import { stakingHref } from "@/features/staking/model";
import { BaseIcon, DashboardShell } from "./shell";
import { SwapPanel } from "@/features/swap/swap-panel";
import styles from "./dashboard.module.css";
function SgldIcon({ size = 32 }: { size?: number }) {
  return (
    <span className={styles.tokenIcon} style={{ width: size, height: size }}>
      <Image src="/SGLD-icon.png" alt="" width={size} height={size} />
    </span>
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
    <Image
      src="/logo.png"
      width={size + 12}
      height={size + 12}
      alt=""
      className={styles.stakingLogo}
    />
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
  offer: LiquidityOpportunity;
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
          Provide both SGLD and USDC liquidity on Uniswap, via Saffron on Base.
        </DialogDescription>
        <dl className={styles.detailsGrid}>
          <div>
            <dt>Integration</dt>
            <dd>{offer.integration}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>2 weeks</dd>
          </div>
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
                <span className={styles.assetSides}>
                  Both sides of liquidity
                </span>
              </span>
            </dd>
          </div>
          <div>
            <dt>APR</dt>
            <dd>{offer.apr === null ? "Not announced" : `${offer.apr}%`}</dd>
          </div>
        </dl>
        <p className={styles.detailsNote}>
          Stated annual rate (APR): 300%. Program duration: 2 weeks. The pool
          opens on Uniswap.
        </p>
        <div className={styles.detailsActions}>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button asChild>
            <a href={offer.actionUrl} target="_blank" rel="noopener noreferrer">
              View Uniswap pool <ArrowUpRight size={14} />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function OpportunityAction({
  offer,
  children,
  compact = false,
}: {
  offer: EarnOpportunity;
  children: React.ReactNode;
  compact?: boolean;
}) {
  const label =
    offer.kind === "staking"
      ? `Open ${opportunityLabel(offer)}`
      : `View ${opportunityLabel(offer)} details`;
  if (offer.kind === "staking") {
    const link = (
      <Link
        href={stakingHref(offer.days)}
        className={compact ? undefined : styles.opportunityName}
        aria-label={label}
      >
        {children}
      </Link>
    );
    return compact ? (
      <Button
        asChild
        variant="outline"
        size="sm"
        className={styles.mobileDetails}
      >
        {link}
      </Button>
    ) : (
      link
    );
  }
  return (
    <OpportunityDetails offer={offer}>
      {compact ? (
        <Button
          variant="outline"
          size="sm"
          className={styles.mobileDetails}
          aria-label={label}
        >
          {children}
        </Button>
      ) : (
        <button
          type="button"
          className={styles.opportunityName}
          aria-label={label}
        >
          {children}
        </button>
      )}
    </OpportunityDetails>
  );
}
function OpportunitiesTable() {
  return (
    <>
      <div className={styles.tableScroll}>
        <table className={styles.opportunitiesTable}>
          <caption className="sr-only">
            LP on Uniswap via Saffron on Base, stated APR 300% for a two-week
            program.
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
                  <OpportunityAction offer={offer}>
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
                  </OpportunityAction>
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
                  {offer.apr === null ? "–" : `${offer.apr}%`}
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
            <OpportunityAction offer={offer} compact>
              View details <ArrowUpRight size={14} />
            </OpportunityAction>
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
  );
}
