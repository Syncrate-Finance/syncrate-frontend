import Image from "next/image";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import {
  ArrowRight,
  ArrowUpRight,
  Coins,
  Vault,
  ClipboardCheck,
} from "lucide-react";
import { MarketingHeader, MarketingBrand } from "./interactions";
import { PartnerMarquee } from "./partners";
import { SysgldIcon } from "./product-icon";
import { HomepageNumbers } from "./numbers";
import { listPublishedArticles } from "@/server/services/content";
import styles from "./marketing.module.css";
export async function MarketingHomepage() {
  let articles: Awaited<ReturnType<typeof listPublishedArticles>>["docs"] = [];
  let contentUnavailable = false;
  try {
    articles = (await listPublishedArticles()).docs.slice(0, 3);
  } catch {
    contentUnavailable = true;
  }
  return (
    <div className={`${styles.marketing} ${styles.homepage} ${GeistSans.variable}`}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <MarketingHeader />
      <main id="main-content">
        <section
          className={`${styles.container} ${styles.hero}`}
          aria-labelledby="home-heading"
        >
          <div className={styles.heroCopy}>
            <h1 id="home-heading">
              Tokenized gold,
              <br />
              built for 
              <br />
              <em>DeFi.</em>
            </h1>
            <p className={styles.heroDescription}>
              Syncrate channels onchain capital into productive real-world assets, delivering transparent, gold-backed yield built on DeFi rails.
            </p>
            <div className={styles.heroActions}>
              <Link href="/dashboard" className={styles.primaryButton}>
                Explore SGLD
              </Link>
              <a href="/business" className={styles.businessButton}>
                For Businesses
              </a>
            </div>
            <div className={styles.heroFootnote}>
              <span className={styles.baseMark} aria-hidden="true" />
              Powered by Base
            </div>
          </div>
          <div className={styles.heroMedia}>
            <picture>
              <source media="(prefers-reduced-motion: reduce)" srcSet="/images/gold-bullion-still.webp" />
              <img src="/images/gold-bullion-loop.gif" width={480} height={480} alt="Gold bullion bars" fetchPriority="high" />
            </picture>
          </div>
 </section>
        <section
          id="products"
          className={`${styles.container} ${styles.products}`}
          aria-labelledby="products-heading"
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>PRODUCT</p>
              <h2 id="products-heading">
                One foundation.
                <br />
                Different possibilities.
              </h2>
            </div>
          </div>
          <div className={styles.productGrid}>
            <article className={styles.sgldProduct}>
              <div className={styles.productTop}>
                <span className={styles.productLabel}>
                </span>
                <span></span>
              </div>
              <div className={styles.sgldHeading}>
                <Image src="/SGLD-icon.png" width={68} height={68} alt="" />
                <h3>SGLD</h3>
              </div>
              <h4>
                Physical gold.
                <br />
                Digital possibilities.
              </h4>
              <p>
                Each Syncrate Gold (SGLD) is backed 1:1 by LMBA-standard physical gold bars, held in secure vaults with reputable custodians in the United Arab Emirates. 
              </p>
              <div className={styles.productLinks}>
                <a
                  className={styles.primaryButton}
                  href="https://syncrate.org/app"
                >
                  Explore SGLD
                </a>
                <Link className={styles.productInfoButton} href="/sgld">
                  Learn more about SGLD
                </Link>
              </div>
              <div className={styles.productTechnical}>
                <a
                  href="https://basescan.org/token/0x10C5E0643bCc6C915Cad0335f70A96c1532766eb"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Basescan
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </article>
            <article id="financing" className={styles.yieldProduct}>
              <div className={styles.productTop}>
                <span className={styles.productLabel}>GOLD FINANCING</span>
                <span></span>
              </div>
              <div className={styles.sgldHeading}>
                <SysgldIcon />
                <h3>sySGLD</h3>
                </div>
              <h4>
                Yield, funded by
                <br />
                the gold market.
              </h4>
              <p>
                sySGLD is Syncrate's yield-bearing gold asset, generating yield from short term gold leasing with reputable gold resellers and bullion banks in the UAE.
              </p>
              <Link href="/sysgld" className={styles.productInfoButton}>
                Understand sySGLD
              </Link>
            </article>
          </div>
          <HomepageNumbers />
        </section>
        <section
          id="approach"
          className={styles.approach}
          aria-labelledby="approach-heading"
        >
          <div className={styles.container}>
            <div className={styles.approachIntro}>
              <div>
                <p className={styles.eyebrow}>Design</p>
                <h2 id="approach-heading">
                  Real gold.
                  <br />A connected system.
                </h2>
              </div>
            </div>
            <div className={styles.process}>
              {[
                {
                  number: "",
                  title: "Gold Sourcing",
                  copy: "The underlying gold backing SGLD and sySGLD is sourced directly from Sharjah Refinery through a partnership with Alluca Gold, a DMCC-licensed gold trading company.",
                  href: "#transparency",
                  cta: "See asset statements",
                  Icon: Coins,
                },
                {
                  number: "",
                  title: "Custody",
                  copy: "The underlying gold backing SGLD is held in secure custodial storage with Amanat Vaults, a leading custodian in the UAE.",
                  href: "#transparency",
                  cta: "See custody reports",
                  Icon: Vault,
                },
                {
                  number: "",
                  title: "Transparency",
                  copy: "Syncrate conducts bi-annual inventory audit with Bureau Veritas, ensuring every circulating SGLD and sySGLD is always backed by physical gold bars.",
                  href: "/dashboard",
                  cta: "Read audit reports",
                  Icon: ClipboardCheck,
                },
              ].map(({ number, title, copy, href, cta, Icon }) => (
                <article key={title}>
                  <span className={styles.processNumber}>{number}</span>
                  <Icon
                    className={styles.processIcon}
                    size={28}
                    strokeWidth={1.1}
                  />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <Link href={href}>
                    {cta}
                    <ArrowUpRight size={15} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          id="transparency"
          className={styles.transparency}
          aria-labelledby="transparency-heading"
        >
          <div className={`${styles.container} ${styles.documentGrid}`}>
            <div className={styles.documentIntro}>
              <p className={styles.eyebrow}>TRANSPARENCY</p>
              <h2 id="transparency-heading">
                Trust starts
                <br />
                with context.
              </h2>
              <p>
                Understand the structure before making a decision. Our document
                library brings the sourcing, custody and product information
                together.
              </p>
            </div>
            <div className={styles.documentList}>
              {[
                {
                  number: "01",
                  title: "Audit Reports",
                  detail: "By Bureau Veritas · 2026",
                  href: "/Syncrate_Gold_Bureau_Veritas_Audit_Jun_2026.pdf",
                },
                {
                  number: "02",
                  title: "Asset Statements",
                  detail: "By Alluca Gold",
                  href: "/Syncrate_Gold_Procurement_Alluca_Gold.pdf",
                  type: "PDF",
                },
                {
                  number: "03",
                  title: "The sySGLD Framework",
                  detail: "Our gold financing arrangements",
                  href: "/sysgld",
                },
              ].map((doc) => (
                <a
                  key={doc.number}
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles.documentNumber}>{doc.number}</span>
                  <div>
                    <span className={styles.documentType}>{doc.type}</span>
                    <h3>{doc.title}</h3>
                    <p>{doc.detail}</p>
                  </div>
                  <ArrowUpRight size={22} strokeWidth={1.3} />
                </a>
              ))}
              <p className={styles.documentNote}>
                Documents reflect their stated dates and scope and are subject to change.
              </p>
            </div>
          </div>
        </section>
        <section
          id="insights"
          className={`${styles.container} ${styles.insights}`}
          aria-labelledby="insights-heading"
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>BLOG</p>
              <h2 id="insights-heading">The evolving gold story.</h2>
            </div>
            <Link className={styles.textLink} href="/insights">
              All insights
              <ArrowRight size={16} />
            </Link>
          </div>
          {contentUnavailable && (
            <p className={styles.contentNotice}>
              Latest updates are temporarily unavailable. Our earlier articles
              are available below.
            </p>
          )}
          <div className={styles.insightGrid}>
            {[
              ...articles.map((article) => ({
                title: article.title,
                href: `/insights/${article.slug}`,
                label: "SYNCRATE INSIGHT",
                summary:
                  article.summary ??
                  "Read the latest perspective from Syncrate.",
              })),
              {
                title: "SGLD is live: gold, built for DeFi",
                href: "/blog/sgld-is-live",
                label: "ANNOUNCEMENT · JUL 2026",
                summary:
                  "Meet Syncrate Gold and the next step in bringing physical gold to onchain finance.",
              },
              {
                title: "Rethinking the gold thesis",
                href: "/blog/rethinking-the-gold-thesis",
                label: "PERSPECTIVE · JUL 2026",
                summary:
                  "A closer look at gold’s role, its opportunity cost and what comes next.",
              },
            ]
              .slice(0, 3)
              .map((article, index) => (
                <Link
                  key={article.href}
                  href={article.href}
                  className={styles.insightCard}
                >
                  <span className={styles.eyebrow}>{article.label}</span>
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                  <div>
                    <span>Read the story</span>
                    <ArrowUpRight size={20} strokeWidth={1.3} />
                  </div>
                  <span className={styles.articleNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              ))}
          </div>
        </section>
        <PartnerMarquee />
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div>
              <MarketingBrand />
              <h2>Need more information?</h2>
              <a
                className={styles.outlineButton}
                href="https://docs.syncrate.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read our documentation <ArrowUpRight size={13} />
              </a>
              <span className={styles.socialLabel}>SOCIALS</span>
              <div className={styles.socials}>
                <a
                  href="https://x.com/syncratefinance"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  X
                </a>
                <a
                  href="https://t.me/syncratefi"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram
                </a>
                <a
                  href="https://discord.gg/p5v4P8qEbj"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Discord
                </a>
              </div>
            </div>
            <div className={styles.footerLinks}>
              <h3>PLATFORM</h3>
              <Link href="/dashboard">Overview</Link>
              <Link href="/sgld">SGLD</Link>
              <Link href="/sysgld">sySGLD</Link>
              <a href="https://syncrate.org/app">Buy SGLD</a>
              <a href="/#transparency">Transparency</a>
            </div>
            <div className={styles.footerLinks}>
              <h3>RESOURCES</h3>
              <Link href="/insights">Insights</Link>
              <a href="https://docs.syncrate.org">Documentation</a>
              <a href="/whitepaper.pdf">Whitepaper</a>
              <Link href="/terms">Terms & disclosures</Link>
              <a href="mailto:team@syncrate.org">Contact</a>
              <a
                href="https://github.com/Syncrate-Finance"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className={styles.disclosures}>
            <p>
              Syncrate is a technology platform. This website does not
              constitute an offer to sell or a solicitation to buy investment
              products. SGLD is not legal tender, is not deposit-insured, and is
              not guaranteed by a bank or financial institution.
            </p>
            <p>
              Returns from gold financing are variable and not guaranteed. Gold
              and financing activity carry custody, counterparty, operational
              and market risks, including potential loss. Availability depends
              on eligibility and jurisdiction. Review the{" "}
              <Link href="/terms">terms and disclosures</Link>.
            </p>
          </div>
          <div className={styles.footerBottom}>
            <span>SYNCRATE ©2026</span>
            <span>MAKING GOLD USEFUL ONCHAIN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
