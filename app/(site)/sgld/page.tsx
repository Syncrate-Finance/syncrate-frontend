import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Coins,
  Vault,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { APP_ORIGIN, WEBSITE_ORIGIN } from "@/config/site";
import { ProductShell } from "@/features/products/shell";
import { SgldMetrics } from "@/features/products/sgld-metrics";
import styles from "@/features/products/products.module.css";
export const metadata: Metadata = {
  title: "SGLD | Physical gold, onchain",
  description:
    "Explore Syncrate Gold: one troy ounce of physical gold per SGLD, held in the UAE and available on Base. View supply, market cap and bullion metrics.",
  alternates: { canonical: WEBSITE_ORIGIN + "/sgld" },
};
export const viewport = { themeColor: "#f7f7f0" };
const faqs = [
  [
    "What is SGLD?",
    "Syncrate Gold (SGLD) represents one troy ounce of physical gold bullion. The underlying gold is held in custodial storage in the UAE; the token is available on Base.",
  ],
  [
    "How is SGLD different from sySGLD?",
    "SGLD provides gold-backed exposure. Holding it does not itself earn a yield. sySGLD is a separate gold-financing product, with additional financing and counterparty risks.",
  ],
  [
    "How do I mint or redeem SGLD?",
    "Use the Syncrate app on Base to mint with supported USDC or USDT, or request a redemption into either stablecoin. You approve and confirm each transaction in your own wallet. Redemptions may enter a payout queue when immediate stablecoin liquidity is unavailable.",
  ],
  [
    "What fees apply?",
    "The existing SGLD redemption interface applies a 0.25% redemption fee. Your wallet also needs ETH on Base for network fees. Review the current quote before confirming a transaction.",
  ],
  [
    "Can I redeem physical gold?",
    "The published physical redemption terms specify a minimum of 160.75 SGLD (approximately 5 kg), a 5% physical redemption fee and identity checks. Contact the Syncrate team to confirm the applicable delivery arrangements and current requirements before proceeding.",
  ],
  [
    "How can I review the backing?",
    "Read the published asset statements and verification documents. Their dates and scope matter: reported inventory and an onchain token supply are different sources, and the metrics on this page are not a continuous reserve attestation.",
  ],
];
export default function SgldPage() {
  return (
    <ProductShell>
      <div className={styles.product}>
        <section
          className={`${styles.container} ${styles.hero}`}
          aria-labelledby="sgld-title"
        >
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}></span>
            <h1 id="sgld-title">
              Physical gold.
              <br />
              <em>Brought onchain.</em>
            </h1>
            <p>
              Own gold with the freedom to move it. Each SGLD token represents a direct ownership to one
              troy ounce of 99.99% pure physical gold, held in secure custody in the UAE.
            </p>
            <div className={styles.actions}>
              <a href={APP_ORIGIN} className={styles.primary}>
                Buy SGLD
              </a>
              <a href="#how-it-works" className={styles.secondary}>
                How it works;
              </a>
            </div>
            <span className={styles.network}>
              <i aria-hidden="true" /> powered by Base
            </span>
          </div>
          <div className={styles.goldVisual}>
            <Image
              src="/images/gold-bullion-still.webp"
              alt="Gold bullion bars"
              fill
              priority
              sizes="(max-width: 760px) 90vw, 45vw"
              className={styles.goldPhoto}
            />
            <div className={styles.assetStamp}>
              <Image src="/SGLD-icon.png" alt="" width={50} height={50} />
              <div>
                <strong>SGLD</strong>
                <span>Tokenized gold, built for DeFi.</span>
              </div>
            </div>
            <span className={styles.visualLabel}></span>
          </div>
        </section>
        <div className={styles.container}>
          <SgldMetrics />
        </div>
        <section
          className={`${styles.container} ${styles.section}`}
          aria-labelledby="foundation-title"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>THE FOUNDATION</span>
            <h2 id="foundation-title">
              A familiar asset.
              <br />
              <em>A more useful form.</em>
            </h2>
            <p>
              Physical gold sits at the centre. Digital ownership makes it
              easier to hold, transfer and use across DeFi.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {[
              {
                Icon: Coins,
                title: "Bullion quality",
                text: "Each SGLD token is backed by 99.99% pure LBMA-certified gold bars sourced from Sharjah refiners through Alluca Gold. SGLD brings that gold exposure into a transferrable ERC-20 token.",
              },
              {
                Icon: Vault,
                title: "Custodial storage",
                text: "The underlying gold bars backing SGLD is held in secure vaults with Amanat Vaults in the UAE. Periodic asset statements are published in our transparency dashboard",
              },
              {
                Icon: ShieldCheck,
                title: "Accessible everywhere",
                text: "SGLD is accessible across different decentralized and centralized exchanges for seamless ownership",
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
                Your gold.
                <br />
                <em>Your next move.</em>
              </h2>
              <p>
                A quick glance on how SGLD Minting and Redemption works
              </p>
            </div>
            <ol className={styles.steps}>
              {[
                [
                  "Connect on Base",
                  "Choose a supported wallet and select USDC or USDT. Keep ETH on Base available for network fees.",
                ],
                [
                  "Review and mint",
                  "See the live gold quote, enter an amount and sign the transaction in your wallet.",
                ],
                [
                  "Hold, transfer or put it to work",
                  "Explore our ecosystem of DeFi integrations and use SGLD across the broader DeFi ecosystem.",
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
          id="transparency"
          aria-labelledby="transparency-title"
        >
          <div>
            <span className={styles.eyebrow}>TRANSPARENCY</span>
            <h2 id="transparency-title">
              Trust starts
              <br />
              with <em>visibility.</em>
            </h2>
            <p>
              Understand how SGLD Z
            </p>
          </div>
          <div className={styles.resourceList}>
            <a
              href="/Syncrate_Gold_Procurement_Alluca_Gold.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>01</span>
              <div>
                <h3>Asset statements</h3>
                <p>published bi-annually by Alluca Gold</p>
              </div>
              <ArrowUpRight size={20} />
            </a>
            <a
              href="https://syncrate-1.gitbook.io/syncrate-docs/sgld/asset-verification"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>02</span>
              <div>
                <h3>Audits</h3>
                <p>conducted by Bureau Veritas, published quaterly</p>
              </div>
              <ArrowUpRight size={20} />
            </a>
          </div>
        </section>
        <section
          className={`${styles.container} ${styles.faqSection}`}
          aria-labelledby="faq-title"
        >
          <div>
            <span className={styles.eyebrow}>FAQs</span>
            <h2 id="faq-title">
              A few good
              <br />
              <em>questions.</em>
            </h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <ChevronDown size={18} />
                </summary>
                <p>{a}</p>
                {q === "Can I redeem physical gold?" && (
                  <a href="mailto:team@syncrate.org">
                    Contact the team <ArrowUpRight size={14} />
                  </a>
                )}
              </details>
            ))}
          </div>
        </section>
        <p className={`${styles.container} ${styles.riskNote}`}>
          Trading SGLD involves custody, operational and smart contract risks. SGLD is
          not a securities or legal tender and is not deposit-insured. Read the{" "}
          <Link href="/terms">terms and disclosures</Link>.
        </p>
      </div>
    </ProductShell>
  );
}
