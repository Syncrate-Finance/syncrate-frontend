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
    "Understand sySGLD: Syncrate's yield-bearing gold asset, powered by gold financing.",
  alternates: { canonical: WEBSITE_ORIGIN + "/sysgld" },
};
const documentation = "https://syncrate-1.gitbook.io/syncrate-docs/sysgld";
const faqs = [
  [
    "How is sySGLD different from SGLD?",
    "SGLD represents a direct exposure to physically vaulted gold. Holding SGLD alone is not yield-bearing. sySGLD is a non-transferable receipt token for SGLD staked to a fixed term, earning yield powered by gold financing.",
  ],
  [
    "Can I withdraw early or transfer sySGLD?",
    "Principal can only be withdrawn after the selected 30- or 90-day term matures. sySGLD cannot be transferred, traded, supplied to a liquidity pool or used as transferable lending collateral",
  ],
  [
    "What happens when my term ends?",
    "Your position stops earning at maturity. You can redeem its principal, less the redemption fee, or explicitly restake the principal for another 30- or 90-day term without an additional fee. There is no automatic renewal or yield compounding.",
  ],
  [
    "What if lease interest arrives after I withdraw?",
    "Your historical earning weight remains recorded after redemption or restaking. If treasury later funds an earning period that overlapped your stake, you can separately claim your allocated SGLD rewards. Yield claims are fee-free.",
  ],
  [
    "Does my sySGLD balance grow as rewards arrive?",
    "No. Your receipt balance represents net staked principal. Rewards are accounted for separately and paid in SGLD when claimed; funding rewards does not mint additional sySGLD or automatically increase your principal.",
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
              sySGLD is Syncrate's yield-bearing gold asset powered by gold financing, with the underlying yield sourced from direct gold leasing to vetted bullion banks and established counterparties.
            </p>
            <div className={styles.actions}>
              <a href={`${APP_ORIGIN}/stake`} className={styles.primary}>
                Open App
              </a>
              <a href="#how-it-works" className={styles.secondary}>
                How it works <ChevronDown size={15} />
              </a>
            </div>
            <span className={styles.network}>
              <i aria-hidden="true" /> Built on Base
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
              <h2 id="steps-title">
                How it works.
                <br />
                <em></em>
              </h2>
            </div>
            <ol className={styles.steps}>
              {[
                [
                  "Choose your term",
                  "Stake at least 1 SGLD for up to 30 or 90 days and are minted sySGLD, representing their staked position.",
                ],
                [
                  "Share in funded yield",
                  "The underlying gold bars backing the staked SGLD is leased to institutional counterparties who pays a finacing spread that flows back to users as yield at the end of the staking epoch.",
                ],
                [
                  "Redeem",
                  "At maturity, users redeemes their principal with a 0.50% principal redemption fee, or restake directly without an additional fee.",
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
            <span className={styles.eyebrow}></span>
            <h2 id="faq-title">
              FAQs
              <br />
              <em></em>
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
            <h2 id="explore-title">Get in touch.</h2>
            <p>
              For businesses looking to lease Syncrate's bullion inventory.
            </p>
          </div>
          <div className={styles.actions}>
            <a href="mailto:team@syncrate.org" className={styles.primary}>
              Talk to our team
            </a>
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
