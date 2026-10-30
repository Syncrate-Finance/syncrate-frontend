"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X, Plus } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { GeistSans } from "geist/font/sans";
import { APP_ORIGIN, WEBSITE_ORIGIN } from "@/config/site";
import styles from "./marketing.module.css";

const navigation = [
  { label: "Our products", href: "/#products" },
  { label: "The approach", href: "/#approach" },
  { label: "Transparency", href: "/#transparency" },
  { label: "Insights", href: "/#insights" },
];
export function MarketingBrand() {
  return (
    <Link href="/" className={styles.brand} aria-label="Syncrate home">
      <span aria-hidden="true" />
    </Link>
  );
}
export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <MarketingBrand />
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navigation.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className={styles.menuTrigger}
              aria-label="Open navigation"
            >
              <Menu size={23} />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className={styles.menuOverlay} />
            <Dialog.Content
              className={`${styles.menuPanel} ${GeistSans.variable}`}
            >
              <Dialog.Title className="sr-only">Explore Syncrate</Dialog.Title>
              <Dialog.Description className="sr-only">
                Products, resources and the Syncrate app.
              </Dialog.Description>
              <div className={styles.menuTop}>
                <a
                  href={WEBSITE_ORIGIN}
                  className={styles.menuBrand}
                  onClick={close}
                  aria-label="Syncrate home"
                >
                  <span aria-hidden="true" />
                </a>
                <span></span>
                <Dialog.Close
                  className={styles.menuDismiss}
                  aria-label="Close navigation"
                >
                  <X size={25} />
                </Dialog.Close>
              </div>
              <div className={styles.menuBody}>
                <div className={styles.menuIntro}>
                  <span></span>
                  <h2>
                    A new way
                    <br />
                    to store value.
                  </h2>
                </div>
                <nav
                  className={styles.menuLinks}
                  aria-label="Full screen navigation"
                >
                  <details className={styles.menuGroup}>
                    <summary>
                      <span className={styles.menuNumber}>01</span>Products
                      <Plus size={22} aria-hidden="true" />
                    </summary>
                    <div className={styles.menuChildren}>
                      <a href={WEBSITE_ORIGIN + "/sgld"} onClick={close}>
                        SGLD<span>Syncrate's tokenized gold asset</span>
                      </a>
                      <a href={WEBSITE_ORIGIN + "/sysgld"} onClick={close}>
                        sySGLD<span>Syncrate's yield bearing gold asset</span>
                      </a>
                    </div>
                  </details>
                  <details className={styles.menuGroup}>
                    <summary>
                      <span className={styles.menuNumber}>02</span>Resources
                      <Plus size={22} aria-hidden="true" />
                    </summary>
                    <div className={styles.menuChildren}>
                      <a
                        href={WEBSITE_ORIGIN + "/#transparency"}
                        onClick={close}
                      >
                        Transparency<span>Assets and reports</span>
                      </a>
                      <a
                        href="https://syncrate-1.gitbook.io/syncrate-docs/"
                        onClick={close}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Documentation<span>Explore the details</span>
                      </a>
                    </div>
                  </details>
                  <a
                    href={WEBSITE_ORIGIN + "/#approach"}
                    onClick={close}
                    className={styles.menuRow}
                  >
                    <span className={styles.menuNumber}>03</span>The approach
                    <ArrowUpRight size={22} />
                  </a>
                  <a
                    href={WEBSITE_ORIGIN + "/insights"}
                    onClick={close}
                    className={styles.menuRow}
                  >
                    <span className={styles.menuNumber}>04</span>Insights
                    <ArrowUpRight size={22} />
                  </a>
                </nav>
              </div>
              <div className={styles.menuBottom}>
                <span>
                  Gold, built for onchain finance.<small>BUILT ON BASE</small>
                </span>
                <a href={APP_ORIGIN} onClick={close} className={styles.menuApp}>
                  Launch app
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
