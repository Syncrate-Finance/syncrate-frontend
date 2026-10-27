# Syncrate Phase 1 — Foundation implementation

October 27, 2026. Implemented locally from the owner-supplied archive. **Functional foundation is verified; security/release gates remain open.** No production system was changed, no blockchain transaction was submitted, and nothing was pushed to GitHub. Phase 2's dashboard is not yet implemented.

## Implemented

- Reviewed the existing package, routes, provider, contract configuration and workflow before installation. Retained the existing Next.js/React application rather than creating a replacement scaffold.
- Pinned compatible dependencies and Node/pnpm versions, created a lockfile, added strict TypeScript configuration, and configured shadcn/ui for the next phase.
- Separated website and CMS root layouts using route groups. Existing public and mint routes retain their URLs. New Payload CMS: /cms; CMS API: /cms-api. Existing /admin stays the onchain control panel.
- Added PostgreSQL migrations for staff accounts, draft/versioned pages and articles, private media metadata, audit events and CMS support tables. Disabled automatic schema push. Tested migration apply, rollback and reapplication against disposable local PostgreSQL/WASM instances.
- Added editor/publisher/admin authorization, protected role management, blocked public first-user registration, published-only public reads, private revisions, disabled-account checks and append-only audit access. Server content services explicitly enforce CMS access control.
- Added a local-only administrator bootstrap command. Preview/production disable local password authentication and require a signed identity token with verified issuer/audience/expiry/MFA plus an explicitly provisioned staff subject. The real provider has not yet been selected or connected.
- Added validated environment boundaries, mandatory certificate-verifying PostgreSQL TLS outside local/test, safe configuration errors, upload limits, restricted media formats and baseline HTTP security headers. Unconfigured email fails without logging reset tokens.
- Added health endpoints, verification CI with a native PostgreSQL service, and aligned the existing weekly workflow with the pinned runtime/lockfile. No workflow was executed remotely.
- Fixed baseline build issues: a mouse/touch handler type, invalid Next page props, missing favicon reference, and missing peer packages in the retained Coinbase connector. Existing financial transaction logic was not rewritten.

## Verification

| Check | Result |
| --- | --- |
| Frozen-lockfile installation | Passed |
| Peer compatibility | No unresolved peer warnings |
| Strict TypeScript and optimized Next.js build | Passed |
| Unit tests | 8 passed |
| Database/authorization integration tests | 5 passed |
| Migration up/down/up | Passed on PostgreSQL/WASM |
| Built-server HTTP checks | 10 passed |
| Browser inspection | CMS login rendered correctly with isolated layout/styles |
| Dependency release audit | 0 critical, 1 high and 2 moderate findings remain |

HTTP checks verified health/readiness, denied public staff listing, denied first-user registration even with a submitted bootstrap context, local login, authenticated staff access, published-content access, CMS login rendering, home and existing mint URLs.

## Verification limits and unfinished requirements

- Native PostgreSQL could not start inside the Windows sandbox. Local SQL checks used PostgreSQL/WASM with a wire-protocol wrapper. CI is configured for native PostgreSQL but has not run on GitHub; concurrency/native-server behavior still needs that verification.
- A sandbox-only local runtime adapter was needed because Windows account lookup is restricted here. It is external to the delivered application; normal development and CI do not need it.
- The real staff identity provider/MFA policy, production database, object storage, email, monitoring and recovery procedures remain deployment prerequisites. The local cryptographic tests do not verify a real provider configuration.
- One high and two moderate dependency findings remain in legacy wallet SDK/migration-tool dependencies. See docs/dependency-security.md. No advisories were hidden. The audit currently fails the high-severity gate; Phase 1 must not be treated as fully security-cleared or production-ready.
- Baseline legacy product pages contain hardcoded pricing/reserve values and floating-point financial displays. The legacy request form and leaderboard data path also need later review. Those pages were retained; this phase does not certify their accuracy or safety.
- No new staking contracts, live APYs, dashboard balances, sySGLD deposits, contact delivery or production-ready storage integration were invented. The new dashboard, approved live data and further backend services belong to subsequent phases.

## Delivery

The source ZIP includes application source, assets, lockfile, migration, tests, CI and setup documentation. It excludes environment files except .env.example, dependency/build output, uploaded media and all local databases/credentials. Original Git history is absent because the input was a ZIP.

Next work: close the outstanding security/native-integration gates, then implement the Theo-style dashboard phase with the approved three upcoming Prime offers and informational sySGLD. Production release still requires separate explicit approval.
