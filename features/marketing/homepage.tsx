import Image from 'next/image'
import Link from 'next/link'
import { GeistSans } from 'geist/font/sans'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import {
  MarketingHeader,
  MarketingMotion,
  CinematicHero,
  ProductShowcase,
  TransparencyCarousel,
  MarketingBrand,
} from './interactions'
import { listPublishedArticles } from '@/server/services/content'
import styles from './marketing.module.css'
const partners = [
  'Alluca Gold',
  'Chainlink',
  'Amanat Vaults',
  'Saffron',
  'DWF Labs',
  'Arrakis',
  'RWA.xyz',
  'Uniswap',
  'Veritas',
]
export async function MarketingHomepage() {
  let articles: Awaited<ReturnType<typeof listPublishedArticles>>['docs'] = []
  let contentUnavailable = false
  try {
    articles = (await listPublishedArticles()).docs.slice(0, 3)
  } catch {
    contentUnavailable = true
  }
  return (
    <div className={`${styles.marketing} ${GeistSans.variable}`}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <MarketingHeader />
      <MarketingMotion>
        <main id="main-content">
          <CinematicHero />
          <section
            className={styles.partners}
            aria-labelledby="partners-heading"
            data-reveal
          >
            <span className={styles.eyebrow}>BUILDING WITH</span>
            <h2 id="partners-heading">
              Working With
              <br />
              <em>The Very Best</em>
            </h2>
            <div className={styles.partnerGrid}>
              {partners.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
          </section>
          <section id="products" className={styles.products} data-reveal>
            <div className={styles.sectionIntro}>
              <h2>
                Physical Gold,
                <br />
                <em>Onchain</em>
              </h2>
              <div>
                <span className={styles.eyebrow}>
                  GOLD. INFRASTRUCTURE. CUSTODY.
                </span>
                <div className={styles.infrastructureNames}>
                  <span>Alluca Gold</span>
                  <span>Chainlink</span>
                  <span>Amanat Vaults</span>
                </div>
              </div>
            </div>
            <ProductShowcase />
          </section>
          <section id="financing" className={styles.financing} data-reveal>
            <span className={styles.eyebrow}>PRODUCTIVE GOLD</span>
            <h2>
              Gold Has Value.
              <br />
              <em>Give It Possibility.</em>
            </h2>
            <p>
              Syncrate connects onchain capital with real-world gold financing.
              sySGLD is designed around short-term financing arrangements with
              bullion banks and refiners.
            </p>
            <Link className={styles.outlineButton} href="/sysgld">
              Explore sySGLD <ArrowUpRight size={13} />
            </Link>
            <div className={styles.financingFeature}>
              <Image
                src="/feature-1.PNG"
                alt="Gold bullion bars"
                fill
                sizes="(min-width: 1360px) 1172px, (min-width: 810px) 768px, 100vw"
              />
              <div>
                <span className={styles.eyebrow}>REAL-WORLD ASSETS</span>
                <h3>
                  From gold in a vault.
                  <br />
                  To gold in your wallet.
                </h3>
                <p>
                  Explore SGLD and the infrastructure that brings physical gold
                  to Base.
                </p>
                <Link href="/sgld">
                  Discover SGLD <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </section>
          <section className={styles.values} data-reveal>
            <h2>Our Design, Principles and Purpose</h2>
            <div>
              {[
                {
                  number: '01',
                  title: 'Real yield sources',
                  copy: 'Gold financing activity drives the sySGLD strategy. Returns are variable and are not guaranteed.',
                },
                {
                  number: '02',
                  title: 'Independent custody',
                  copy: 'SGLD is backed by physical gold held in independent UAE vaults. Review the sourcing and custody documentation.',
                },
                {
                  number: '03',
                  title: 'Onchain access',
                  copy: 'Bring gold exposure into decentralized finance on Base, with the information you need to understand the asset.',
                },
              ].map((value) => (
                <details key={value.number}>
                  <summary>
                    <span>{value.number}</span>
                    <h3>{value.title}</h3>
                    <ArrowUpRight size={20} />
                  </summary>
                  <p>{value.copy}</p>
                </details>
              ))}
            </div>
          </section>
          <div className={styles.sectionWidth} data-reveal>
            <TransparencyCarousel />
          </div>
          <section className={styles.news} data-reveal>
            <div>
              <span className={styles.eyebrow}>STAY IN THE KNOW</span>
              <h2>The Latest From Syncrate</h2>
              <div className={styles.newsList}>
                {articles.map((article) => (
                  <Link key={article.id} href={`/insights/${article.slug}`}>
                    <span className={styles.eyebrow}>INSIGHT</span>
                    <h3>{article.title}</h3>
                    <ArrowUpRight size={19} />
                  </Link>
                ))}
                {contentUnavailable && (
                  <p className={styles.contentNotice}>
                    Latest updates are temporarily unavailable. Explore our
                    earlier articles below.
                  </p>
                )}
                <Link href="/blog/sgld-is-live">
                  <span className={styles.eyebrow}>
                    23 JUL, 2026 · ANNOUNCEMENT
                  </span>
                  <h3>SGLD is Live: Gold, Built for DeFi</h3>
                  <ArrowUpRight size={19} />
                </Link>
                <Link href="/blog/rethinking-the-gold-thesis">
                  <span className={styles.eyebrow}>
                    17 JUL, 2026 · PERSPECTIVE
                  </span>
                  <h3>The Opportunity Cost: Rethinking the Gold Thesis</h3>
                  <ArrowUpRight size={19} />
                </Link>
              </div>
              <Link className={styles.textLink} href="/insights">
                All insights <ArrowRight size={13} />
              </Link>
            </div>
            <aside>
              <Image
                src="/blog2.PNG"
                alt="Syncrate Gold"
                width={480}
                height={270}
                sizes="(max-width: 810px) 100vw, 360px"
              />
              <h3>Stay up to date</h3>
              <a
                className={styles.outlineButton}
                href="https://x.com/syncratefinance"
                target="_blank"
                rel="noopener noreferrer"
              >
                Follow us on X <ArrowUpRight size={13} />
              </a>
            </aside>
          </section>
        </main>
      </MarketingMotion>
      <footer className={styles.footer}>
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
            Syncrate is a technology platform. This website does not constitute
            an offer to sell or a solicitation to buy investment products. SGLD
            is not legal tender, is not deposit-insured, and is not guaranteed
            by a bank or financial institution.
          </p>
          <p>
            Returns from gold financing are variable and not guaranteed. Gold
            and financing activity carry custody, counterparty, operational and
            market risks, including potential loss. Availability depends on
            eligibility and jurisdiction. Review the{' '}
            <Link href="/terms">terms and disclosures</Link>.
          </p>
        </div>
        <div className={styles.footerBottom}>
          <span>SYNCRATE ©2026</span>
          <span>MAKING GOLD USEFUL ONCHAIN</span>
        </div>
      </footer>
    </div>
  )
}
