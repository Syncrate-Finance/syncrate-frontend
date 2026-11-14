import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { APP_ORIGIN, WEBSITE_ORIGIN } from "@/config/site";
import { ProductShell } from "@/features/products/shell";
import { SysgldMetrics } from "@/features/products/sysgld-metrics";
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
          className={`${styles.container} ${styles.hero} ${yieldStyles.hero}`}
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
        </section>
        <div className={styles.container}>
          <SysgldMetrics />
        </div>

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
