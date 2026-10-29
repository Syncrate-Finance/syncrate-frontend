import { APP_ORIGIN } from "@/config/site";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { listPublishedArticles } from "@/server/services/content";
import { DashboardShell } from "@/features/dashboard/shell";
import styles from "@/features/content/content.module.css";
export const dynamic = "force-dynamic";
export const viewport = { themeColor: "#f5f7f8" };
export const metadata: Metadata = {
  title: "Insights | Syncrate",
  description: "Product updates and insights from Syncrate.",
  alternates: { canonical: "/insights" },
};
export default async function Insights({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: value } = await searchParams;
  if (value && !/^[1-9][0-9]{0,3}$/.test(value)) notFound();
  const page = Number(value || 1);
  const result = await listPublishedArticles(page);
  if (page > 1 && page > result.totalPages) notFound();
  return (
    <DashboardShell active="information">
      <main className={styles.main} id="main-content">
        <Link className={styles.back} href={APP_ORIGIN}>
          <ArrowLeft size={14} /> Back to overview
        </Link>
        <header className={styles.indexHeading}>
          <span className={styles.eyebrow}>From Syncrate</span>
          <h1>Insights</h1>
          <p className={styles.summary}>
            Product updates and perspectives on gold in onchain finance.
          </p>
        </header>
        <div className={styles.articleList}>
          {result.docs.map((article) => (
            <article key={article.id}>
              <span className={styles.eyebrow}>Insight</span>
              <h2>
                <Link href={`/insights/${article.slug}`}>
                  {article.title}
                  <ArrowUpRight size={18} />
                </Link>
              </h2>
              {article.summary && <p>{article.summary}</p>}
            </article>
          ))}
        </div>
        <nav className={styles.pagination} aria-label="Insights pagination">
          {result.hasPrevPage && (
            <Link href={`/insights?page=${page - 1}`}>Previous</Link>
          )}
          {result.totalDocs > 0 && (
            <span>
              Page {page} of {result.totalPages}
            </span>
          )}
          {result.hasNextPage && (
            <Link href={`/insights?page=${page + 1}`}>Next</Link>
          )}
        </nav>
        {page === 1 && (
          <section className={styles.archive}>
            <span className={styles.eyebrow}>From the archive</span>
            <h2>Earlier perspectives</h2>
            <Link href="/blog/sgld-is-live">
              SGLD is Live: Gold Built for DeFi <ArrowUpRight size={16} />
            </Link>
            <Link href="/blog/rethinking-the-gold-thesis">
              The Opportunity Cost: Rethinking the Gold Thesis{" "}
              <ArrowUpRight size={16} />
            </Link>
          </section>
        )}
      </main>
    </DashboardShell>
  );
}
