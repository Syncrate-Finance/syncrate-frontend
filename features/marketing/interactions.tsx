"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
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
  const menu = useRef<HTMLDetailsElement>(null);
  const close = () => {
    if (menu.current) menu.current.open = false;
  };
  useEffect(() => {
    const dismiss = (event: PointerEvent | KeyboardEvent) => {
      if (!menu.current?.open) return;
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") {
          close();
          menu.current.querySelector("summary")?.focus();
        }
      } else if (
        event.target instanceof Node &&
        !menu.current.contains(event.target)
      )
        close();
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, []);
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
        <Link
          className={styles.headerLaunch}
          href="/dashboard"
          aria-label="Open app"
        >
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
        <details ref={menu} className={styles.mobileMenu}>
          <summary aria-label="Toggle navigation">
            <Menu className={styles.menuOpen} size={22} />
            <X className={styles.menuClose} size={22} />
          </summary>
          <nav aria-label="Mobile navigation">
            {navigation.map((link) => (
              <a onClick={close} key={link.href} href={link.href}>
                {link.label}
                <ArrowUpRight size={17} />
              </a>
            ))}
            <Link onClick={close} href="/dashboard">
              Open app
              <ArrowUpRight size={17} />
            </Link>
            <a onClick={close} href="https://docs.syncrate.org">
              Documentation
              <ArrowUpRight size={17} />
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
