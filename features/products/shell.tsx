import { GeistSans } from "geist/font/sans";
import { MarketingHeader } from "@/features/marketing/interactions";
import { MarketingFooter } from "@/features/marketing/footer";
import marketing from "@/features/marketing/marketing.module.css";
export function ProductShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${marketing.marketing} ${marketing.homepage} ${GeistSans.variable}`}
    >
      <a href="#main-content" className={marketing.skipLink}>
        Skip to content
      </a>
      <MarketingHeader />
      <main id="main-content">{children}</main>
      <MarketingFooter />
    </div>
  );
}
