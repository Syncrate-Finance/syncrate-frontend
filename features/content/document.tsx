import { APP_ORIGIN } from "@/config/site";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Page } from "@/payload-types";
import { DashboardShell } from "@/features/dashboard/shell";
import { PublishedRichText } from "./rich-text";
import styles from "./content.module.css";
export function ContentDocument({
  document,
  article = false,
}: {
  document: Page;
  article?: boolean;
}) {
  return (
    <DashboardShell active="information">
      <main className={styles.main} id="main-content">
        <Link className={styles.back} href={article ? "/insights" : APP_ORIGIN}>
          <ArrowLeft size={14} />{" "}
          {article ? "All insights" : "Back to overview"}
        </Link>
        <article className={styles.document}>
          <header>
            <span className={styles.eyebrow}>
              {article ? "Syncrate insights" : "Syncrate"}
            </span>
            <h1>{document.title}</h1>
            {document.summary && (
              <p className={styles.summary}>{document.summary}</p>
            )}
          </header>
          <div className={styles.prose}>
            <PublishedRichText body={document.body} />
          </div>
        </article>
      </main>
    </DashboardShell>
  );
}
export function ContentNotFound() {
  return (
    <DashboardShell active="information">
      <main className={styles.main} id="main-content">
        <section className={styles.document}>
          <span className={styles.eyebrow}>404</span>
          <h1>Page not found.</h1>
          <p className={styles.summary}>
            This page is not available. It may have moved or is no longer
            published.
          </p>
          <Link className={styles.back} href={APP_ORIGIN}>
            Back to overview <ArrowUpRight size={14} />
          </Link>
        </section>
      </main>
    </DashboardShell>
  );
}
