# Syncrate frontend

Next.js, React, TypeScript, Tailwind, Wagmi/RainbowKit, Payload CMS and PostgreSQL. This is local development work from the owner-provided archive. No production deployment is authorized.

## Requirements

Node 24.22.1 and pnpm 11.25.0; a local PostgreSQL database. Keep separate databases and secrets for local development, tests, previews and production. Package versions and the lockfile are included; use pnpm install --frozen-lockfile.

## Local setup

1. Copy .env.example to .env.local; set an independent random PAYLOAD_SECRET and a local DATABASE_URL. Do not overwrite an existing environment file blindly.
2. Run pnpm db:migrate, pnpm cms:types and pnpm cms:importmap.
3. To create the first LOCAL administrator only, set CMS_BOOTSTRAP_EMAIL and CMS_BOOTSTRAP_PASSWORD (at least 16 characters) in your shell environment, then run pnpm cms:bootstrap. Do not pass credentials as command arguments. Public staff registration is disabled.
4. Run pnpm dev. The CMS is at /cms; the existing onchain /admin and /app routes keep their URLs.

Run pnpm typecheck and pnpm test. Integration tests require APP_ENV=test and a disposable local DATABASE_URL whose database name ends in _test. Run pnpm db:migrate then pnpm test:integration. The test database may be modified; never use customer or production data.

Database schema changes use Payload migrations (pnpm payload migrate:create). Automatic schema push is disabled. Review generated SQL and commit the migration. Run and validate migrations explicitly; application startup does not silently migrate production.

## Staff security boundary

Local/test environments support password login for development. Preview/production disable local passwords and require an identity-aware proxy to supply X-Syncrate-Identity as a signed JWT. Its issuer, audience and fixed JWKS URL are configured on the server. The token must have a verified signature, exp, iat, sub and an amr array including mfa, and be no older than 15 minutes. Only explicitly provisioned active staff subjects are authorized. The signed token, not a raw email header, proves identity.

Before any hosted release, configure and test the real identity provider and MFA policy, production database/secrets, object storage, observability, backups and provisioning procedure. No real identity provider is configured by this local phase. The custom strategy is a fail-closed integration boundary, not a deployed SSO service. Never reuse local Payload secrets on a hosted environment. Role guards cover REST, admin and access-controlled Local API calls; server content services explicitly set overrideAccess:false.

Preview/production database URLs must set sslmode=verify-full. Email delivery is deliberately disabled until an adapter is configured; reset tokens are never printed as a console-delivery fallback. Local password recovery requires a local administrator or a configured email adapter.

Editors can draft, publishers can publish, administrators manage accounts. Drafts and revisions are not public. Audit records cannot be changed through access-controlled APIs. Uploaded media is private in this foundation; publication/object-storage integration follows in the content phase.

## Scope boundaries

The public homepage and /dashboard now use the Theo-inspired composition. /dashboard reads real SGLD balances on Base and Buy SGLD links to https://syncrate.org/app. No new transaction executor is included. Prime 3/6/9-month offers remain Upcoming; sySGLD is informational only. See docs/repository-review.md for baseline findings and the external approved architecture specification for full scope.

## Public site and CMS publishing

The rebuilt homepage is `/`; the read-only portfolio is `/dashboard`. `/dashboard?view=positions` opens My Positions. `/sysgld` is informational only. The existing `/app` mint route is preserved.

Publish Pages through the CMS to make them available at `/content/<slug>`. Publish Articles to expose them at `/insights/<slug>` and the paginated `/insights` index; the newest articles also appear on the homepage. These routes enforce anonymous published-only access, read the database on each request, and immediately reflect unpublishing. Drafts return 404. This phase does not add public draft previews. SEO titles and descriptions come from the CMS's SEO fields. Private uploads are intentionally omitted from public rich text until storage/publication access is configured. Older static articles retain their existing URLs.

Read-only wallet queries use the public Base transport provided by Wagmi. Wallet addresses are sent to the selected public RPC provider; they are not stored in the CMS. The new overview requests no signature or transaction. USD valuations and earnings/APY remain unavailable until verified data integrations exist. Prime's 3/6/9-month terms are upcoming with no actions or invented rates. An account change selects a separate cache key; a network mismatch or read failure hides the balance. Displayed token amounts use BigInt rather than floating-point arithmetic.

See docs/phase2-status.md for verification and remaining work, docs/dependency-security.md for release blockers, and docs/homepage-assets.md for the original visual asset. The build does not establish production readiness. No deployment, GitHub push or blockchain write has been made.


## Dependency build-script policy

Normal installs use `pnpm install --frozen-lockfile`. The committed `allowBuilds` policy in `pnpm-workspace.yaml` approves only the reviewed esbuild installer versions and explicitly denies optional native builds for bufferutil, keccak and utf-8-validate. Their JavaScript fallbacks remain available. Unknown build scripts still fail installation because `strictDepBuilds` stays enabled. Review new script-bearing dependencies before extending the policy. CI runs the normal installer so Vercel-style `ERR_PNPM_IGNORED_BUILDS` failures are caught before merging.
