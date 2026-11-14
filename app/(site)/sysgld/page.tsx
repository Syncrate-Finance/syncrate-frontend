import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  Clock3,
  Coins,
  LockKeyhole,
} from "lucide-react";
import { APP_ORIGIN, WEBSITE_ORIGIN } from "@/config/site";
import { ProductShell } from "@/features/products/shell";
import { SysgldIcon } from "@/features/marketing/product-icon";
import styles from "@/features/products/products.module.css";
import yieldStyles from "@/features/products/sysgld.module.css";

export const metadata: Metadata = {
  title: "sySGLD | Earn on your gold",
  description:
    "Understand sySGLD: stake SGLD for 30 or 90 days, receive non-transferable receipts and share in funded gold-leasing yield. Explore fees, maturity and rewards.",
  alternates: { canonical: WEBSITE_ORIGIN + "/sysgld" },
};
const documentation = "https://syncrate-1.gitbook.io/syncrate-docs/sysgld";
const faqs = [
  [
    "How is sySGLD different from SGLD?",
    "SGLD represents physical gold and can be held or transferred on Base. Holding SGLD alone does not earn gold-leasing yield. sySGLD is a non-transferable receipt for SGLD committed to a fixed staking term, with additional leasing, counterparty and smart contract risks.",
  ],
  [
    "Is the yield fixed or guaranteed?",
    "No. Rewards depend on actual lease interest received and the SGLD treasury funds into the contract for the relevant earning period. A 90-day term does not automatically offer a higher rate than a 30-day term. Both use the same time-weighted share of funded yield.",
  ],
  [
    "Can I withdraw early or transfer sySGLD?",
    "Principal can only be withdrawn after the selected 30- or 90-day term matures. Initially, sySGLD cannot be transferred, traded, supplied to a liquidity pool or used as transferable lending collateral. Redemption closes the whole position and burns its receipts.",
  ],
  [
    "What happens when my term ends?",
    "Your position stops earning at maturity. You can redeem its principal, less the redemption fee, or explicitly restake the principal for another 30- or 90-day term without an additional fee. There is no automatic renewal or yield compounding. Time between maturity and restaking earns no yield.",
  ],
  [
    "What if lease interest arrives after I withdraw?",
    "Your historical earning weight remains recorded after redemption or restaking. If treasury later funds an earning period that overlapped your stake, you can separately claim your allocated SGLD rewards. Yield claims are fee-free.",
  ],
  [
    "Does my sySGLD balance grow as rewards arrive?",
    "No. Your receipt balance represents net staked principal. Rewards are accounted for separately and paid in SGLD when claimed; funding rewards does not mint additional sySGLD or automatically increase your principal.",
  ],
  [
    "Is staking available now?",
    "Not yet. The staking interface is available to explore, but contracts and frontend integration have not been activated for deposits. Review the published mechanics and launch status before participating.",
  ],
];

export default function SySgldPage() {
  return (
    <ProductShell>
      <div className={styles.product}>
        <section
          className={`${styles.container} ${styles.hero}`}
          aria-labelledby="sysgld-title"
        >
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>sySGLD · YIELD-BEARING GOLD</span>
            <h1 id="sysgld-title">
              Earn on
              <br />
              <em>your gold.</em>
            </h1>
            <p>
              Put your SGLD to work for 30 or 90 days. sySGLD represents your
              staked gold, with yield sourced from direct gold leasing to vetted
              bullion banks and established counterparties.
            </p>
            <div className={styles.actions}>
              <a href={`${APP_ORIGIN}/stake`} className={styles.primary}>
                Explore staking
              </a>
              <a href="#how-it-works" className={styles.secondary}>
                How it works <ChevronDown size={15} />
              </a>
            </div>
            <span className={styles.network}>
              <i aria-hidden="true" /> Built on Base · Staking is not open yet
            </span>
          </div>
          <div className={yieldStyles.receiptVisual}>
            <div className={yieldStyles.receiptHeading}>
              <SysgldIcon />
              <span>
                YOUR STAKED GOLD<strong>sySGLD</strong>
              </span>
            </div>
            <p className={yieldStyles.receiptStatement}>
              Gold at the centre.
              <br />
              <em>Yield from the real economy.</em>
            </p>
            <ol className={yieldStyles.receiptFlow}>
              <li>
                <span>01</span>
                <div>
                  <strong>Stake SGLD</strong>
                  <p>Choose a 30- or 90-day term.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Receive sySGLD</strong>
                  <p>A receipt for your net staked principal.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Claim SGLD yield</strong>
                  <p>Your share of actual funded lease interest.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>
        <section
          className={`${styles.container} ${styles.metricSection}`}
          aria-label="Staking terms at a glance"
        >
          <dl className={styles.metricGrid}>
            <div>
              <dt>Staking terms</dt>
              <dd>
                30 / 90 days<span>Fixed term per position</span>
              </dd>
            </div>
            <div>
              <dt>Minimum deposit</dt>
              <dd>
                1 SGLD<span>Before the deposit fee</span>
              </dd>
            </div>
            <div>
              <dt>Rewards paid in</dt>
              <dd>
                SGLD<span>Actual funded yield</span>
              </dd>
            </div>
            <div>
              <dt>Your receipt</dt>
              <dd>
                sySGLD<span>Initially non-transferable</span>
              </dd>
            </div>
          </dl>
        </section>
        <section
          className={`${styles.container} ${styles.section}`}
          aria-labelledby="foundation-title"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>THE FOUNDATION</span>
            <h2 id="foundation-title">
              The gold you hold.
              <br />
              <em>A different way to use it.</em>
            </h2>
            <p>
              sySGLD connects a fixed-term SGLD stake to income from physical
              gold leasing.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {[
              {
                Icon: Coins,
                title: "Rooted in physical gold",
                text: "The gold backing staked SGLD is leased to vetted bullion banks and established counterparties. Lease interest is the underlying source of yield.",
              },
              {
                Icon: Clock3,
                title: "A term you choose",
                text: "Commit SGLD for 30 or 90 days. Your net principal and the time it remains eligible determine your share of funded rewards.",
              },
              {
                Icon: LockKeyhole,
                title: "A receipt for your stake",
                text: "Receive one sySGLD for each SGLD of principal after the deposit fee. The receipt stays in your wallet until it is burned on redemption or rolled into a new term.",
              },
            ].map(({ Icon, title, text }) => (
              <article className={styles.featureCard} key={title}>
                <Icon size={29} strokeWidth={1.3} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          className={styles.navySection}
          id="how-it-works"
          aria-labelledby="steps-title"
        >
          <div className={styles.container}>
            <div className={styles.navyHeader}>
              <span className={styles.eyebrow}>HOW IT WORKS</span>
              <h2 id="steps-title">
                From your stake.
                <br />
                <em>Back to your wallet.</em>
              </h2>
              <p>
                Principal and rewards are tracked separately, so you can
                understand what you own and what you earn.
              </p>
            </div>
            <ol className={styles.steps}>
              {[
                [
                  "Choose your term",
                  "Deposit at least 1 SGLD and select 30 or 90 days. After the 0.25% deposit fee, the remaining SGLD becomes your staked principal and you receive the same number of sySGLD receipts.",
                ],
                [
                  "Share in funded yield",
                  "Your eligible principal is weighted by how long it was staked during each earning period. Treasury funds received lease interest in SGLD, which is allocated using those recorded weights.",
                ],
                [
                  "Redeem or restake",
                  "At maturity, redeem your principal with a 0.50% principal redemption fee, or restake directly without an additional fee. Claim available SGLD rewards separately, including eligible interest funded later.",
                ],
              ].map(([title, text], i) => (
                <li key={title}>
                  <span>0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section
          className={`${styles.container} ${styles.splitSection}`}
          aria-labelledby="yield-title"
        >
          <div>
            <span className={styles.eyebrow}>WHERE THE YIELD COMES FROM</span>
            <h2 id="yield-title">
              Physical gold.
              <br />
              <em>Real lease income.</em>
            </h2>
            <p>
              Counterparties pay lease interest in cash. That cash does not
              automatically become an onchain reward: treasury converts it into
              backed SGLD and funds the staking contract.
            </p>
            <a
              className={styles.textLink}
              href={`${documentation}/yield-and-risks`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Read about yield and risks <ArrowUpRight size={16} />
            </a>
          </div>
          <div className={yieldStyles.yieldDetails}>
            <article>
              <span>01 / FUNDING</span>
              <h3>Interest becomes SGLD rewards</h3>
              <p>
                Treasury assigns funded SGLD to a completed earning period.
                Rewards depend on actual funding, rather than a promised APY or
                newly minted, unbacked rewards.
              </p>
            </article>
            <article>
              <span>02 / ALLOCATION</span>
              <h3>Your stake × your time</h3>
              <p>
                Each position receives a share based on net principal multiplied
                by its eligible time in that period, relative to all eligible
                positions. Earning stops at maturity.
              </p>
            </article>
            <article>
              <span>03 / CLAIMS</span>
              <h3>Late interest still belongs to you</h3>
              <p>
                Withdrawing principal does not erase historical eligibility. You
                can claim rewards funded later for periods when your position
                was active.
              </p>
            </article>
          </div>
        </section>
        <section
          className={`${styles.container} ${yieldStyles.feesSection}`}
          aria-labelledby="fees-title"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>FEES, MADE CLEAR</span>
            <h2 id="fees-title">
              Know what goes in.
              <br />
              <em>And what comes back.</em>
            </h2>
          </div>
          <div className={yieldStyles.feeGrid}>
            <article>
              <h3>Deposit</h3>
              <strong>0.25%</strong>
              <p>
                Charged on the amount deposited. sySGLD is minted against the
                remaining principal.
              </p>
            </article>
            <article>
              <h3>Redemption</h3>
              <strong>0.50%</strong>
              <p>
                Charged only on the position’s principal when it leaves the
                vault.
              </p>
            </article>
            <article>
              <h3>Claims & direct restaking</h3>
              <strong>No fee</strong>
              <p>
                Yield claims and direct principal restaking carry no additional
                protocol fee. Base network fees still apply.
              </p>
            </article>
          </div>
          <p className={yieldStyles.feeExample}>
            <strong>For example:</strong> a 100 SGLD deposit creates 99.75
            sySGLD. Redeeming that principal after maturity returns 99.25125
            SGLD, plus any claimable yield. Both fees are paid in SGLD to
            Syncrate’s treasury.
          </p>
        </section>
        <section
          className={`${styles.container} ${styles.faqSection}`}
          aria-labelledby="faq-title"
        >
          <div>
            <span className={styles.eyebrow}>FAQs</span>
            <h2 id="faq-title">
              Before you
              <br />
              <em>put gold to work.</em>
            </h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <ChevronDown size={18} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section
          className={`${styles.container} ${styles.finalCta}`}
          aria-labelledby="explore-title"
        >
          <div>
            <h2 id="explore-title">Get to know your gold.</h2>
            <p>
              Explore the staking interface or start with the asset behind
              sySGLD.
            </p>
          </div>
          <div className={styles.actions}>
            <a href={`${APP_ORIGIN}/stake`} className={styles.primary}>
              Explore staking
            </a>
            <Link href="/sgld" className={styles.secondary}>
              Understand SGLD
            </Link>
          </div>
        </section>
        <p className={`${styles.container} ${styles.riskNote}`}>
          sySGLD adds leasing, counterparty, custody, liquidity and smart
          contract risks. Yield and timely payment are not guaranteed. Read the{" "}
          <a
            href={`${documentation}/yield-and-risks`}
            target="_blank"
            rel="noopener noreferrer"
          >
            yield and risk disclosures
          </a>{" "}
          and <Link href="/terms">terms</Link>.
        </p>
      </div>
    </ProductShell>
  );
}
