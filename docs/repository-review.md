# Repository review — October 27, 2026

Source: owner-supplied extracted GitHub archive, originally work/syncrate-frontend-main. No Git history or commit identity was supplied. Review of package.json, app routes, providers, configuration, ABI declarations and the existing workflow completed before dependency installation.

The archive uses Next.js App Router, React, Tailwind v4, Wagmi v2, RainbowKit and Viem. The two owner-supplied contract addresses match config/contracts.ts. Onchain deployment/audit verification is deferred to the real-data phase; matching configuration does not verify contracts.

No CMS, database, lockfile, TypeScript configuration, test suite or verification workflow existed. Runtime dependencies included mutable latest versions. A local environment file contained a WalletConnect variable; its value was not printed and it is excluded from deliverables.

The existing /admin is an onchain reserve manager interface. New CMS routes are /cms and /cms-api; authorization is separate. The /app mint/redeem URL stays intact. Existing pages were grouped under app/(site) without changing URL paths. The CMS has a separate root layout to avoid wallet-provider and style coupling.

The existing /prime route contains a legacy transaction UI. This phase does not add, test with funds, or redesign that UI. The agreed sySGLD informational experience and retirement/navigation decisions belong to the website phase. Staking Prime term offers remain planned; they have no supplied deployment contracts or rates.

The previous read-only integration and stack approval remains applicable. No architecture reapproval is required. Payload CMS was selected because no CMS exists in this archive. No production infrastructure was contacted or changed.

Known baseline issues outside this phase: legacy request form posts directly to a third-party endpoint; a leaderboard API reads results/latest.json while the public snapshot resides elsewhere; the SGLD page uses a hardcoded gold price and reserve quantity, and legacy financial displays use floating-point numbers. These require separate review and replacement with approved evidence/data before production release. The missing favicon reference, mouse/touch handler typing and unsupported custom route-prop signature were fixed while preserving existing page behavior. The CMS foundation does not establish the legacy financial routes as production safe.
