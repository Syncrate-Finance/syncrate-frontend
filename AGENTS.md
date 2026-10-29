# Syncrate project instructions

Architecture is approved. Preserve the existing Next.js project; see README.md and docs/repository-review.md. This checkout came from a ZIP and does not carry the original Git commit/history.

- Node 24.22.1, pnpm 11.25.0. Use the committed/included lockfile. No broad dependency upgrades or unsupported peer overrides to conceal audit findings.
- Existing site routes live under app/(site), preserving their URLs. Payload CMS has a separate app/(cms) root and lives at /cms and /cms-api. /admin remains the legacy onchain reserve manager panel.
- CMS collections and PostgreSQL schema are owned by Payload migrations. Automatic schema push is disabled. Explicitly set overrideAccess:false in public/server content reads. Bootstrap is local-only; never reopen public first-user registration.
- Keep staff-role and publication guards on the server. Preview/production must use the verified MFA identity boundary and validated environment configuration. No secrets in client code or logs.
- Do not commit or package .env.local, node_modules, .next, uploaded private media or local database files. .env.example is safe to include.
- Run pnpm typecheck, pnpm test, pnpm test:integration on an explicitly disposable local _test database, and pnpm build. Run pnpm audit:production and keep unresolved findings visible.
- Earn catalogue, revised by the owner October 29, 2026: LP on Uniswap via Saffron is first, followed by SGLD Staking for 30 days and 90 days. Saffron is an external SGLD/USDC Base pool link, with owner-stated 300% APR and 2-week duration. Staking remains coming soon with no rates/actions. Do not imply the APR was verified onchain or positions are indexed. This supersedes the original three Prime month terms. sySGLD is informational only. No new backend financial transaction executor or contracts.
- The owner authorized embedding existing SGLD mint/redeem wallet interactions at https://app.syncrate.org on October 29, 2026, superseding the external Buy SGLD link. See docs/app-mint-redeem.md for verified contracts, integer settlement, queue behavior and acceptance limits. No agent-submitted mainnet transactions are authorized. Legacy /app redirects to the canonical app origin; /app/api routes remain available. CMS public pages are /content/<slug>; articles are /insights/<slug>.
- Phase 1 functional checks pass, but the dependency security gate and native PostgreSQL/real IdP verification remain open. Track them explicitly; do not mark production readiness or silently skip requirements.
- Production deployments, DNS, production database changes and smart-contract writes require explicit user approval. The owner approved dedicated Production database, CMS secrets and staff-auth setup on October 28, 2026; the owner subsequently explicitly approved publishing live and activating app.syncrate.org on October 29, 2026. This does not authorize unrelated data, DNS or smart-contract changes. See docs/production-setup.md.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

- Phase 2 now includes a complete public homepage rebuild using the Theo homepage composition, as explicitly clarified by the owner. The homepage and app are both in scope. Keep truthful product data and preserve legacy mint links through the canonical app redirect. See docs/homepage-assets.md for the original hero and visual-match limits.


- Normal dependency verification must run `pnpm install --frozen-lockfile`, with the explicit version-scoped `allowBuilds` policy in pnpm-workspace.yaml. Do not use --ignore-scripts to hide missing build approvals; unknown dependency build scripts must remain fatal. Vercel's reported install failure was ERR_PNPM_IGNORED_BUILDS after dependencies had downloaded successfully.


- Supabase preview backend: see docs/supabase-staff-setup.md. CMS_AUTH_PROVIDER=supabase requires DATABASE_SCHEMA=cms, a hosted project origin and a publishable key. Use migrations/cms only for a fresh private schema. Public legacy migration history remains unchanged. Never grant the runtime role schema creation or general auth-table access. Reapply the owner-level Supabase access/RLS script after migrations. Production publishing and app-subdomain activation were explicitly approved on October 29, 2026; record actual verification separately.

- Homepage structure now follows the owner's independent Syncrate design and latest main edits. Preserve wording, navy backgrounds and original foreground colors. Validate CSS-module references and local image paths when reviewing edits; TypeScript alone does not catch missing module classes or public assets.
- DATABASE_CA_CERT supports a provider's public PEM CA without weakening TLS. Keep rejectUnauthorized and hostname verification enabled; connection URL SSL parameters must not override the explicit CA policy.

- Homepage metrics/media owner decisions (October 29, 2026): keep reported bullion inventory fixed at 193 troy oz. SGLD market cap uses direct Base supply reads and the verified Chainlink XAU/USD feed; the owner selected this over BaseScan API setup for now. sySGLD has an unqueried zero-address placeholder until a real contract and valuation semantics are verified. The current three-row Earn catalogue is defined above; the original homepage terms row stays removed. See docs/homepage-metrics-media.md.
- The owner will provide public/sySGLD-icon.png later; retain the image path and graceful missing-image handling. Hero media is a licensed local gold GIF with infinite looping and a reduced-motion still, without panel captions. Publishing still uses the existing preview unless separately authorized for Production.
- GitHub native PostgreSQL CI passed for the prior installer fix. New provider/MFA acceptance must be verified separately; do not infer it from local cryptographic tests.

- The root page renders the app only on the exact app.syncrate.org host. Marketing hosts render the homepage. Legacy /dashboard paths and /app redirect to https://app.syncrate.org. Local/test/preview environments additionally allow /?preview=app on loopback or Vercel hosts for review; Production ignores this override. Keep active app links centralized in config/site.ts. The owner approved live release and app DNS activation; never change unrelated DNS or nameservers.
- Your positions follows the protocols integrated into Earn with SGLD. Until real staking, lending and liquidity adapters/contracts are verified, render the requested subtle empty state. Never imply all external DeFi positions are indexed or invent zero balances for unsupported protocols.
