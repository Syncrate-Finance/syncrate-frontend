'use client'
import { DashboardShell } from '@/features/dashboard/shell'
import { Button } from '@/components/ui/button'
import styles from '@/features/content/content.module.css'
export default function ContentError({ reset }: { reset: () => void }) {
  return (
    <DashboardShell active="information">
      <main className={styles.main} id="main-content">
        <section className={styles.document}>
          <h1>Content is temporarily unavailable.</h1>
          <p className={styles.summary}>Please try again in a moment.</p>
          <Button onClick={reset}>Try again</Button>
        </section>
      </main>
    </DashboardShell>
  )
}
