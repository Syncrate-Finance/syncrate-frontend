# Saffron opportunity, homepage menu and app release

The owner approved publishing live and activating app.syncrate.org on October 29, 2026.

Earn starts with LP on Uniswap, via Saffron, followed by SGLD Staking for 30 and 90 days. The LP offer shows Base, SGLD/USDC (both sides), Liquidity Provision, a two-week duration and the owner-stated 300% annual APR. It opens the exact owner-supplied Uniswap pool URL in a separate tab. No Saffron transaction executor, reward claim or position indexer is implemented. Staking actions remain disabled.

Read-only Base verification at block 53257221 confirmed deployed code and SGLD/native USDC token0/token1 for pool 0xC5963Bd6d6Cf713F0994fFd867D4d639AD45EC6E. The pool check does not establish the APR or reward program. The owner-supplied JPEG is copied without modification to public/saffron-logo.jpg (SHA-256 28977d70fa31d8e04fc5e1263a21ad37f3067ad5686c57c3c8a6508d69b91911).

The homepage hero uses smaller two-line copy. The Numbers retains live metrics and unavailable-value dashes, without the configuration, quote or timestamp annotations. The hamburger opens a full-screen navy/gloss dialog with focus trapping, Escape dismissal and scroll locking. Products and Resources each expand to two links. The separate header app arrow is removed; the menu retains an explicit Launch app action.

config/site.ts centralizes the canonical app and website origins. Only exact app.syncrate.org renders the app at the root in Production. The public dashboard page is removed; its old URLs and /app redirect to the app origin, preserving query strings. Existing /app/api routes are unchanged. Explicit /?preview=app review is allowed only in local/test/preview environments on loopback or Vercel hosts. App tabs preserve this review query. Module imports under features/dashboard are component paths, not public URLs. Historical status reports retain the URLs that were tested at that time.

Release verification must cover unit/type/build checks, native PostgreSQL CI, public homepage and app rendering, old-route redirects, mobile layouts, menu keyboard behavior, Saffron details/link, live metrics/readiness, DNS and HTTPS. No mainnet transactions should be submitted by the agent. Existing dependency advisories, real staff SMTP/MFA/recovery and controlled personal-wallet lifecycle acceptance remain open and are not cleared by a successful deployment.
