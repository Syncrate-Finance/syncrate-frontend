import Link from "next/link";
import { APP_ORIGIN } from "@/config/site";
import { MarketingBrand } from "./interactions";
import styles from "./marketing.module.css";
export function MarketingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div>
            <MarketingBrand />
            <h2>Syncrate Finance</h2>
            <a
              className={styles.outlineButton}
              href="https://syncrate-1.gitbook.io/syncrate-docs/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read our documentation{" "}
            </a>
            <span className={styles.socialLabel}>SOCIALS</span>
            <div className={styles.socials}>
              <a
                href="https://x.com/syncratefinance"
                target="_blank"
                rel="noopener noreferrer"
              >
                X (formerly Twitter)
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
            <h3>PRODUCT</h3>
            <Link href="/sgld">SGLD</Link>
            <Link href="/sysgld">sySGLD</Link>
            <a href={APP_ORIGIN}>Buy SGLD</a>
            <a href="/#transparency">Transparency</a>
          </div>
          <div className={styles.footerLinks}>
            <h3>RESOURCES</h3>
            <Link href="/insights">Insights</Link>
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
            Syncrate is a technology platform. This website does not constitute
            an offer to sell or a solicitation to buy investment products. SGLD
            is not legal tender, is not deposit-insured, and is not guaranteed
            by a bank or financial institution.
          </p>
          <p>
            Returns from gold financing are variable and not guaranteed. Gold
            and financing activity carry custody, counterparty, operational and
            market risks, including potential loss. Availability depends on
            eligibility and jurisdiction. Review the{" "}
            <Link href="/terms">terms and disclosures</Link>.
          </p>
        </div>
        <div className={styles.footerBottom}>
          <span>SYNCRATE ©2026</span>
          <span></span>
        </div>
      </div>
    </footer>
  );
}
