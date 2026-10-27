import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Landmark, Layers3 } from 'lucide-react'
import { DashboardShell } from '@/features/dashboard/shell'
import { Button } from '@/components/ui/button'
import styles from '@/features/dashboard/dashboard.module.css'
export const metadata: Metadata = {
  title: 'sySGLD | Syncrate',
  description:
    'Understand sySGLD and how a gold-financing strategy differs from holding SGLD.',
  alternates: { canonical: '/sysgld' },
}
export const viewport = { themeColor: '#f5f7f8' }
export default function SySGLDPage() {
  return (
    <DashboardShell active="information">
      <main className={styles.infoMain} id="main-content">
        <Link className={styles.backLink} href="/dashboard">
          <ArrowLeft size={13} /> Back to overview
        </Link>
        <section className={styles.infoHero}>
          <span className={styles.infoEyebrow}>
            sySGLD <span>·</span> Product overview
          </span>
          <h1>A separate path for productive gold.</h1>
          <p>
            sySGLD is designed to give eligible holders exposure to returns from
            short-term gold financing. It is separate from holding SGLD and
            introduces additional financing and counterparty risk.
          </p>
          <Button asChild>
            <a
              href="https://syncrate-1.gitbook.io/syncrate-docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the documentation <ArrowUpRight size={15} />
            </a>
          </Button>
        </section>
        <div className={styles.infoCards}>
          <section className={styles.infoCard}>
            <Landmark size={25} strokeWidth={1.3} />
            <h2>SGLD: gold exposure</h2>
            <p>
              SGLD brings gold-backed exposure to Base. Holding SGLD does not
              itself generate yield.
            </p>
          </section>
          <section className={styles.infoCard}>
            <Layers3 size={25} strokeWidth={1.3} />
            <h2>sySGLD: a financing strategy</h2>
            <p>
              sySGLD is a separate product designed around short-term
              gold-financing activity. Participation depends on eligibility and
              the applicable product terms. There is no deposit interface on
              this page.
            </p>
          </section>
        </div>
        <p className={styles.infoRisk}>
          Returns are variable and not guaranteed. Gold financing introduces
          counterparty, custody, operational and market risks, including
          potential loss. Review the{' '}
          <Link href="/terms">terms and disclosures</Link> before considering
          any product.
        </p>
      </main>
    </DashboardShell>
  )
}
