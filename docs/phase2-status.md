# Syncrate Phase 2 — Homepage, dashboard and public content

October 27, 2026. **Implemented locally and available for review. Phase 2 acceptance remains open for the final homepage browser/mobile check and owner content/visual review.** No production deployment, GitHub push, DNS/database production change or blockchain transaction was performed.

## Implemented

- Rebuilt the public `/` homepage after the owner explicitly confirmed that Theo's front page is also in scope. Added its white/teal composition, serif display headings, cinematic hero, navigation menus, partner rows, product switcher, financing content, expandable principles, document carousel, news and footer. Real Syncrate destinations replace reference destinations. Hero motion has a pause control and respects reduced-motion preferences.
- Implemented `/dashboard`: Your portfolio, Buy SGLD, All opportunities and My Positions. Tab state has an addressable URL. Responsive offer cards and accessible Radix dialogs support the three planned Prime terms: 3, 6 and 9 months. They remain Upcoming, with no rates, deposit assets, staking actions or invented positions.
- Added read-only SGLD balance integration using the existing Wagmi/Viem stack. The reader verifies Base chain ID, deployed bytecode and SGLD metadata, and reads balance/metadata at the same block. BigInt formatting preserves large values. Connection, wrong-network, loading, retry and failure states are explicit; account-specific keys prevent mixing wallets. USD valuation and yield metrics are unavailable, rather than invented.
- Added informational `/sysgld`, without a deposit interface. Updated obsolete product-name labels and the transparency anchor while retaining legacy transaction routes and behavior.
- Added public CMS Page routes at `/content/<slug>`, Article routes at `/insights/<slug>` and a paginated `/insights` index. Published articles appear on the homepage. Server reads explicitly enforce anonymous access and published-only filters. Drafts return 404. Per-request rendering reflects unpublishing immediately; no shared draft cache is used. Metadata comes from CMS SEO fields.
- Rich text renders as React nodes, escapes text, blocks unsafe URL schemes/ambiguous destinations and only resolves internal links to published known collections. Private uploads are omitted until the storage/publication integration is approved. CMS failure has a route error state; the marketing homepage retains archived article links when current articles are unavailable.
- Added pinned shadcn/Radix UI dependencies and reusable components. Formatted new modules and updated setup/publishing documentation.

## Verification

| Check | Result |
| --- | --- |
| Optimized Next.js build, including strict TypeScript | Passed |
| Unit tests | 20 passed |
| CMS/database integration tests | 5 passed on disposable PostgreSQL/WASM |
| Built-server HTTP checks | 19 passed |
| Immediate unpublishing checks | 4 passed |
| Real Base token metadata/bytecode read | SGLD, 18 decimals, chain 8453 verified at a recorded block |
| Dashboard development browser review | Desktop and 390px/320px layouts inspected; no horizontal overflow at those mobile widths; tab keyboard navigation, Prime dialog Escape/focus, wallet picker and mobile navigation checked |
| sySGLD information page browser review | Desktop inspected |
| Homepage browser review | Initial 1440px desktop inspected; final interactions/mobile review remains incomplete after local browser connection failure |
| Production dependency audit | 0 critical, 1 high and 2 moderate remain; audit exits nonzero |

The production build completed successfully with Windows webpack cache snapshot warnings. The earlier development preview also reported optional MetaMask React Native storage and chain-barrel dependency warnings. These were not concealed with disabled validation or broad incompatible overrides.

Database checks use PostgreSQL/WASM because a native PostgreSQL process is unavailable in this sandbox. Native PostgreSQL CI and the real identity provider have not been verified. Browser tests did not connect a person's live wallet or sign/submit any transaction; real token reads and bounded RPC fixtures verify the read adapter, while full controlled-wallet connect/account-change journeys remain part of data acceptance.

## Visual match and content limits

This implements Theo's homepage and dashboard composition with Syncrate branding/content. It is **not a pixel-identical media/font copy**: the hero is an original generated mining landscape with a slow CSS pan, and display typography uses Georgia. Exact reference media/typography would require a suitable licensed video and licensed Season Mix font. See docs/homepage-assets.md for the built-in generation tool, final prompt and asset location. The conceptual hero is not evidence of a Syncrate facility.

Partner names and underlying product statements come from the owner-supplied repository/current Syncrate site. Publication of financial, custody, partner and audit statements still needs the owner's content review. The June 2026 PDF is labeled with its date; no continuous audit or live reserve attestation is implied. The homepage calls to action link to the local dashboard, existing mint app and informational sySGLD page.

## Remaining work

- Finish homepage desktop/mobile interactions and detailed visual/accessibility acceptance in a working browser preview. The final local server returned valid HTTP responses but the native browser could not connect after restart. The initial desktop inspection does not establish full responsive acceptance; Phase 2 is not silently marked complete.
- Phase 3: approved SGLD valuation/metrics provider with source/freshness, complete wallet lifecycle/availability acceptance, public opportunity/product projections as needed. The balance adapter and upcoming catalogue are already in place. No price, APY, earnings or live Prime data has been invented.
- Phase 4: durable contact delivery/abuse controls, production media/email integration, publication operations, performance/SEO/accessibility review, legacy data/transaction-page review, monitoring/backups/restore and security remediation. Private uploads and public draft previews are not part of this delivered rendering path.
- Close the existing dependency, native PostgreSQL and real IdP/MFA gates. See docs/dependency-security.md and docs/phase1-status.md.
- Phase 5 requires explicit approval of the exact production release, migration and rollback plan. No approval has been given.

## Source handoff

The source ZIP contains both the Phase 1 foundation and Phase 2 implementation, existing assets, original optimized hero, migration, lockfile, tests and documentation. It excludes environment credentials, database/test fixtures, private uploaded media, dependency/build directories and local verification helpers. Original Git history is absent because the source was provided as a ZIP. Run the README setup with an independent local database and secrets. The original Phase 1 archive is preserved separately.
