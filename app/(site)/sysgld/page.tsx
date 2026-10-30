import type { Metadata } from "next";
import {
  ArrowUpRight,
  Gem,
  Store,
  Coins,
  Boxes,
  Factory,
  ChevronDown,
} from "lucide-react";
import { WEBSITE_ORIGIN } from "@/config/site";
import { ProductShell } from "@/features/products/shell";
import { InquiryForm } from "@/features/contact/inquiry-form";
import styles from "@/features/products/products.module.css";
export const metadata: Metadata = {
  title: "sySGLD | Gold financing for your business",
  description:
    "Explore Syncrate’s approach to short-term gold financing. Built for established gold businesses, with a direct inquiry route to the Syncrate team.",
  alternates: { canonical: WEBSITE_ORIGIN + "/sysgld" },
};
export const viewport = { themeColor: "#f7f7f0" };
const segments = [
  {
    Icon: Gem,
    title: "Jewelers",
  },
  {
    Icon: Store,
    title: "Gold retailers",
  },
  {
    Icon: Coins,
    title: "Bullion dealers",
  },
  {
    Icon: Boxes,
    title: "Wholesalers",
  },
  {
    Icon: Factory,
    title: "Refiners",
  },
];
export default function SySgldPage() {
  return (
    <ProductShell>
      <div className={styles.product}>
        <section
          className={`${styles.container} ${styles.businessHero}`}
          aria-labelledby="sysgld-title"
        >
          <div>
            <span className={styles.eyebrow}>sySGLD · GOLD FINANCING</span>
            <h1 id="sysgld-title">
              Gold moves business.
              <br />
              <em>Let’s move yours.</em>
            </h1>
            <p>
              Syncrate leases a portion of it's physical gold inventory to established and vetted counterparties who pay a financing spread that flows back as yield to sySGLD holders.
            </p>
            <div className={styles.actions}>
              <a href="#get-in-touch" className={styles.primary}>
                Talk to our team
              </a>
              <a href="#built-for" className={styles.secondary}>
                Who it’s built for <ChevronDown size={15} />
              </a>
            </div>
          </div>
          <div
            className={styles.financingVisual}
            aria-label="Syncrate connects onchain capital, gold financing and gold businesses"
          >
            <div className={styles.flowHeading}>
              <span>THE sySGLD CONNECTION</span>
              <strong>
                Capital meets
                <br />
                <em>productive gold.</em>
              </strong>
            </div>
            <div className={styles.flowBars} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        </section>
        <section
          className={`${styles.container} ${styles.splitSection} ${styles.businessIntro}`}
          aria-labelledby="purpose-title"
        >
          <div>
            <span className={styles.eyebrow}>A REAL ECONOMY CONNECTION</span>
            <h2 id="purpose-title">
              Gold-backed yield.
              <br />
              <em>Sourced from the gold market.</em>
            </h2>
          </div>
          <div>
            <p>
Built for accredited invesors, Syncrate leases it's gold bullion to established gold resellers, refiners etc. 
            </p>
            <a
              className={styles.textLink}
              href="https://syncrate-1.gitbook.io/syncrate-docs/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read our documentation <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
        <section
          className={styles.navySection}
          id="built-for"
          aria-labelledby="built-for-title"
        >
          <div className={styles.container}>
            <div className={styles.navyHeader}>
              <span className={styles.eyebrow}>BUILT FOR</span>
              <h2 id="built-for-title">
                The businesses
                <br />
                <em>behind the gold.</em>
              </h2>
              <p>
                From the workshop to the storefront. Tell us about your
                operations, your gold requirements and where financing could
                make a difference.
              </p>
            </div>
            <div className={styles.segmentGrid}>
              {segments.map(({ Icon, title }) => (
                <article key={title}>
                  <Icon size={29} strokeWidth={1.2} />
                  <h3>{title}</h3>
                </article>
              ))}
            </div>
              <a href="#get-in-touch" className={styles.lightButton}>
                Talk to our team
              </a>
          </div>
        </section>
        <section
          className={`${styles.container} ${styles.section}`}
          aria-labelledby="process-title"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>HOW IT WORKS</span>
            <h2 id="process-title">
              First, we understand the business.
              <br />
              <em>Then, find the fit.</em>
            </h2>
          </div>
          <ol className={`${styles.steps} ${styles.paperSteps}`}>
            {[
              [
                "Introduce your business",
                "Tell us what you do, where you operate and the gold capacity you are looking for.",
              ],
              [
                "Review the requirements",
                "Our team evaluates your business, performs the required legal checks and explores whether a facility is suitable.",
              ],
              [
                "Agree the structure",
                "Any financing proceeds only after the applicable terms, responsibilities and operational arrangements are agreed.",
              ],
            ].map(([title, text], i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section
          className={`${styles.container} ${styles.contactSection}`}
          id="get-in-touch"
          aria-labelledby="contact-title"
        >
          <div className={styles.contactIntro}>
            <span className={styles.eyebrow}>GET IN TOUCH</span>
            <h2 id="contact-title">
              A conversation
              <br />
              <em>worth its weight.</em>
            </h2>
            <p>
              Tell us about your business. We’ll review your inquiry and discuss a lease arrangement suitable for your business.
            </p>
          </div>
          <InquiryForm />
        </section>
      </div>
    </ProductShell>
  );
}
