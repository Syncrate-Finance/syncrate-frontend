'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Menu,
  Pause,
  Play,
  ShieldCheck,
  Layers3,
  Landmark,
  Check,
} from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import styles from './marketing.module.css'

const groups = [
  {
    title: 'Platform',
    links: [
      { label: 'Overview', href: '/dashboard' },
      { label: 'SGLD', href: '/sgld' },
      { label: 'sySGLD', href: '/sysgld' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Gold onchain', href: '/#products' },
      { label: 'Gold financing', href: '/#financing' },
      { label: 'Transparency', href: '/#transparency' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Insights', href: '/insights' },
      { label: 'Documentation', href: 'https://docs.syncrate.org' },
      { label: 'Whitepaper', href: '/whitepaper.pdf' },
      { label: 'Terms & disclosures', href: '/terms' },
    ],
  },
]
export function MarketingBrand() {
  return (
    <Link href="/" className={styles.brand} aria-label="Syncrate home">
      <span aria-hidden="true" />
      <span>syncrate</span>
    </Link>
  )
}
export function MarketingHeader() {
  const header = useRef<HTMLElement>(null)
  useEffect(() => {
    const dismiss = (event: PointerEvent | KeyboardEvent) => {
      const escape = event instanceof KeyboardEvent && event.key === 'Escape'
      if (event instanceof KeyboardEvent && !escape) return
      if (
        !escape &&
        event.target instanceof Node &&
        header.current?.contains(event.target)
      )
        return
      for (const item of header.current?.querySelectorAll<HTMLDetailsElement>(
        'details[open]',
      ) ?? []) {
        item.open = false
        if (escape) item.querySelector('summary')?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', dismiss)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', dismiss)
    }
  }, [])
  return (
    <header ref={header} className={styles.header}>
      <MarketingBrand />
      <nav aria-label="Main navigation" className={styles.desktopNav}>
        {groups.map((group) => (
          <details key={group.title} className={styles.dropdown}>
            <summary>
              {group.title}
              <ChevronDown size={12} />
            </summary>
            <div>
              {group.links.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                  <ArrowUpRight size={13} />
                </a>
              ))}
            </div>
          </details>
        ))}
      </nav>
      <div className={styles.headerActions}>
        <a className={styles.contactLink} href="mailto:team@syncrate.org">
          Get in touch
        </a>
        <Link className={styles.launchButton} href="/dashboard">
          Launch app
        </Link>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="Open navigation"
            className={styles.mobileMenu}
          >
            <Menu size={24} />
          </button>
        </DialogTrigger>
        <DialogContent className={styles.mobileDialog}>
          <DialogTitle>Explore Syncrate</DialogTitle>
          <DialogDescription>
            Gold, built for onchain finance.
          </DialogDescription>
          <nav aria-label="Mobile navigation">
            {groups.map((group) => (
              <div key={group.title}>
                <span>{group.title}</span>
                {group.links.map((link) => (
                  <DialogClose asChild key={link.label}>
                    <a href={link.href}>
                      {link.label}
                      <ArrowUpRight size={15} />
                    </a>
                  </DialogClose>
                ))}
              </div>
            ))}
          </nav>
          <DialogClose asChild>
            <Link className={styles.launchButton} href="/dashboard">
              Launch app <ArrowUpRight size={14} />
            </Link>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </header>
  )
}
export function MarketingMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.animate(
              [
                { opacity: 0.4, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' },
              ],
              { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' },
            )
            observer.unobserve(entry.target)
          }
      },
      { threshold: 0.12 },
    )
    root.current
      ?.querySelectorAll('[data-reveal]')
      .forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
  return <div ref={root}>{children}</div>
}
export function CinematicHero() {
  const [paused, setPaused] = useState(false)
  return (
    <section className={styles.hero} aria-labelledby="home-heading">
      <div className={styles.heroImage} data-paused={paused}>
        <Image
          src="/images/syncrate-mine-hero.webp"
          alt=""
          fill
          sizes="(min-width: 1360px) 1172px, (min-width: 810px) 768px, 100vw"
          priority
          quality={75}
        />
      </div>
      <div className={styles.heroShade} />
      <div className={styles.heroCopy}>
        <h1 id="home-heading">
          Making Gold <br className={styles.tabletBreak} />
          Useful Onchain
        </h1>
        <p>Gold-backed assets, built for decentralized finance.</p>
        <div className={styles.heroActions}>
          <div>
            <span>FOR GOLD HOLDERS</span>
            <Link href="/dashboard">Explore Syncrate</Link>
          </div>
          <div>
            <span>FOR PRODUCTIVE GOLD</span>
            <Link href="/sysgld">Discover sySGLD</Link>
          </div>
        </div>
      </div>
      <button
        className={styles.motionControl}
        type="button"
        onClick={() => setPaused(!paused)}
        aria-label={
          paused ? 'Play background motion' : 'Pause background motion'
        }
        aria-pressed={paused}
      >
        {paused ? <Play size={14} /> : <Pause size={14} />}
      </button>
    </section>
  )
}
export function ProductShowcase() {
  return (
    <Tabs
      defaultValue="sgld"
      orientation="vertical"
      className={styles.showcase}
    >
      <TabsList aria-label="Syncrate products" className={styles.productTabs}>
        <TabsTrigger value="sgld" aria-label="Show SGLD">
          <Image src="/SGLD-icon.png" alt="" width={28} height={28} />
          <span>SGLD</span>
        </TabsTrigger>
        <TabsTrigger value="sysgld" aria-label="Show sySGLD">
          <Layers3 size={25} />
          <span>sySGLD</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="sgld" className={styles.productPanel}>
        <div className={styles.productIntro}>
          <div>
            <h3>
              <Image src="/SGLD-icon.png" alt="" width={46} height={46} />
              SGLD
            </h3>
            <p>
              Syncrate Gold brings physical gold onchain. Backed 1:1 by
              LBMA-standard gold held in independent UAE vaults.
            </p>
            <a className={styles.goldButton} href="https://syncrate.org/app">
              Buy SGLD <ArrowRight size={12} />
            </a>
          </div>
          <Image
            className={styles.productCoin}
            src="/SGLD-icon.png"
            alt=""
            width={250}
            height={250}
          />
        </div>
        <div className={styles.backingPanel}>
          <div className={styles.goldTiles} aria-hidden="true">
            {Array.from({ length: 32 }, (_, i) => (
              <span key={i}>
                <Check size={13} />
              </span>
            ))}
          </div>
          <span className={styles.eyebrow}>
            PHYSICAL GOLD
            <br />
            INDEPENDENT CUSTODY
          </span>
          <a
            href="/Syncrate_Gold_Bureau_Veritas_Audit_Jun_2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the June 2026 report <ArrowUpRight size={12} />
          </a>
        </div>
        <div className={styles.networkPanel}>
          <span className={styles.eyebrow}>SGLD NETWORK</span>
          <strong>Base</strong>
          <p>Access gold exposure in your wallet.</p>
          <div className={styles.chainGraphic} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <Link href="/sgld">
            Explore SGLD <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className={styles.termPanel}>
          <span className={styles.eyebrow}>PRIME STAKING · UPCOMING</span>
          <strong>3, 6 & 9 months</strong>
          <p>
            Three planned opportunities. Rates and deposit assets have not been
            announced.
          </p>
          <div className={styles.termPills}>
            <span>3 months</span>
            <span>6 months</span>
            <span>9 months</span>
          </div>
          <Link href="/dashboard">
            View opportunities <ArrowUpRight size={13} />
          </Link>
        </div>
      </TabsContent>
      <TabsContent value="sysgld" className={styles.productPanel}>
        <div className={styles.productIntro}>
          <div>
            <h3>
              <Layers3 size={42} strokeWidth={1.2} />
              sySGLD
            </h3>
            <p>
              A separate strategy designed around short-term gold financing.
              Returns come from underlying financing activity.
            </p>
            <Link className={styles.goldButton} href="/sysgld">
              Learn about sySGLD <ArrowRight size={12} />
            </Link>
          </div>
          <div className={styles.financingVisual} aria-hidden="true">
            <Landmark size={100} strokeWidth={0.7} />
          </div>
        </div>
        <div className={styles.backingPanel}>
          <ShieldCheck size={58} strokeWidth={0.8} />
          <span className={styles.eyebrow}>
            UNDERSTAND THE STRUCTURE.
            <br />
            UNDERSTAND THE RISKS.
          </span>
          <Link href="/terms">
            Read the disclosures <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className={styles.networkPanel}>
          <span className={styles.eyebrow}>THE YIELD SOURCE</span>
          <strong>Gold financing</strong>
          <p>
            Short-term financing spreads, rather than token emissions, underpin
            the strategy.
          </p>
          <Link href="https://docs.syncrate.org">
            How it works <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className={styles.termPanel}>
          <span className={styles.eyebrow}>PRODUCT INFORMATION</span>
          <strong>Built on real activity.</strong>
          <p>
            Returns vary and are not guaranteed. Eligibility and product terms
            apply. sySGLD remains informational here.
          </p>
          <Link href="/sysgld">
            Explore the strategy <ArrowUpRight size={13} />
          </Link>
        </div>
      </TabsContent>
    </Tabs>
  )
}
const slides = [
  {
    eyebrow: 'ASSET DOCUMENTATION',
    title: (
      <>
        Physical backing.
        <br />
        <em>Open documentation.</em>
      </>
    ),
    body: 'Understand the gold sourcing and custody arrangements behind SGLD. Review the published documents and their dates.',
    link: '/Syncrate_Gold_Bureau_Veritas_Audit_Jun_2026.pdf',
    cta: 'Read the June 2026 report',
    icon: ShieldCheck,
  },
  {
    eyebrow: 'THE GOLD SUPPLY',
    title: (
      <>
        From physical gold.
        <br />
        <em>To onchain access.</em>
      </>
    ),
    body: 'Syncrate’s published gold-procurement documentation describes its relationship with Alluca Gold and the sourcing process.',
    link: '/Syncrate_Gold_Procurement_Alluca_Gold.pdf',
    cta: 'Read the procurement document',
    icon: Landmark,
  },
  {
    eyebrow: 'KNOW THE RISKS',
    title: (
      <>
        Make an informed
        <br />
        <em>decision.</em>
      </>
    ),
    body: 'Gold exposure and gold financing carry custody, counterparty, operational and market risks. Returns are not guaranteed.',
    link: '/terms',
    cta: 'Terms & disclosures',
    icon: Layers3,
  },
]
export function TransparencyCarousel() {
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  const Icon = slide.icon
  return (
    <section
      id="transparency"
      className={styles.transparency}
      aria-label="Transparency and documentation"
      aria-roledescription="carousel"
    >
      <div className={styles.transparencySlide} id="transparency-slide">
        <div>
          <span className={styles.eyebrow}>{slide.eyebrow}</span>
          <h2 aria-live="polite">{slide.title}</h2>
          <p>{slide.body}</p>
          <a href={slide.link} className={styles.textLink}>
            {slide.cta}
            <ArrowUpRight size={13} />
          </a>
        </div>
        <div className={styles.transparencyVisual} aria-hidden="true">
          <Icon size={105} strokeWidth={0.65} />
          <span>SYNCRATE</span>
        </div>
      </div>
      <div className={styles.carouselControls}>
        <span>{String(index + 1).padStart(2, '0')} / 03</span>
        <button
          type="button"
          aria-label="Previous transparency slide"
          aria-controls="transparency-slide"
          onClick={() => setIndex((index + slides.length - 1) % slides.length)}
        >
          <ArrowLeft size={17} />
        </button>
        <button
          type="button"
          aria-label="Next transparency slide"
          aria-controls="transparency-slide"
          onClick={() => setIndex((index + 1) % slides.length)}
        >
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  )
}
