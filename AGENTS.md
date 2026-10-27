# Syncrate project instructions

Architecture is approved. Preserve the existing Next.js project; see README.md and docs/repository-review.md. This checkout came from a ZIP and does not carry the original Git commit/history.

- Node 24.22.1, pnpm 11.25.0. Use the committed/included lockfile. No broad dependency upgrades or unsupported peer overrides to conceal audit findings.
- Existing site routes live under app/(site), preserving their URLs. Payload CMS has a separate app/(cms) root and lives at /cms and /cms-api. /admin remains the legacy onchain reserve manager panel.
- CMS collections and PostgreSQL schema are owned by Payload migrations. Automatic schema push is disabled. Explicitly set overrideAccess:false in public/server content reads. Bootstrap is local-only; never reopen public first-user registration.
- Keep staff-role and publication guards on the server. Preview/production must use the verified MFA identity boundary and validated environment configuration. No secrets in client code or logs.
- Do not commit or package .env.local, node_modules, .next, uploaded private media or local database files. .env.example is safe to include.
- Run pnpm typecheck, pnpm test, pnpm test:integration on an explicitly disposable local _test database, and pnpm build. Run pnpm audit:production and keep unresolved findings visible.
- Exactly three planned Prime offers: 3, 6 and 9 months, all Upcoming. No invented rates, staking actions or positions. sySGLD is informational only. No new financial transaction executor.
- Phase 2 implements the Theo-style public homepage and /dashboard with read-only SGLD data. Buy SGLD links to https://syncrate.org/app. CMS public pages are /content/<slug>; articles are /insights/<slug>. See docs/phase2-status.md for current verification.
- Phase 1 functional checks pass, but the dependency security gate and native PostgreSQL/real IdP verification remain open. Track them explicitly; do not mark production readiness or silently skip requirements.
- Production deployments, DNS, production database changes and smart-contract writes require explicit user approval. No production approval has been given.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes â€” APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` â€” verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

- Phase 2 now includes a complete public homepage rebuild using the Theo homepage composition, as explicitly clarified by the owner. The homepage and /dashboard are both in scope. Keep truthful product data and preserve /app. See docs/homepage-assets.md for the original hero and visual-match limits.
