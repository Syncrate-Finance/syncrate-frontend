# SGLD staking page

Owner request, November 11, 2026. The canonical page is `https://app.syncrate.org/stake`. This release builds the frontend; staking contracts and backend integration are deferred by the owner.

## User flow

- The app header, mobile menu and footer include Stake. Both existing 30-day and 90-day Earn entries open the staking page with their term selected through `?term=30` or `?term=90`. The former staking detail dialogs are removed; the Saffron LP dialog is preserved.
- The page shares the existing mint overview's Your portfolio component and verified, address-specific Base SGLD balance reader. Mint/redeem handlers remain in the overview.
- Visitors choose 30 or 90 days, type an SGLD amount and use Max when a verified connected-wallet balance is available. Max preserves all 18 decimals. Invalid input, excessive precision and an amount above the known balance show an inline error.
- The term is addressable in the URL. Changing it preserves the entered amount; browser navigation restores the selected term.
- Staking is explicitly coming soon. The submit button is always disabled and form submission is prevented. The wallet control only opens the existing Reown connection/account/network interface. This release contains no staking API, allowance, approval, contract-write, signing or receipt-minting handler.
- The receipt asset is sySGLD. Yield rate, share conversion, minted quantity, redemption terms, live staked balances and positions are not invented. The positions section has a subtle upcoming empty state.

## Product description

The owner's supplied description governs the new page: sySGLD is Syncrate's yield-bearing gold asset. Users will stake SGLD for 30 or 90 days and receive sySGLD. The physical gold backing the staked SGLD will be leased directly to vetted bullion banks and established counterparties; their lease interest flows back as yield to sySGLD holders. No counterparty names, guaranteed yield, APY, conversion rate or new points eligibility is asserted.

## Routing and review

The route follows the existing app-host boundary: Production app content renders on exact `app.syncrate.org`; marketing-host requests redirect there. Local/test/Preview review uses `/stake?preview=app`, optionally with `&term=90`. Production ignores the review override. Metadata has the canonical app URL and no-index setting.

The shared portfolio component remains in `features/portfolio/card.tsx`; staking content and styles are under `features/staking/`. The existing catalogue remains upcoming with null rates/actions, preserving its meaning as unavailable financial participation while UI navigation opens the new page.

## Activation prerequisites

Before enabling deposits, verify the actual staking and sySGLD contracts/ABIs, fixed-term accounting, rate and share semantics, redemption/withdrawal behavior, deployed bytecode, account/network guards, exact approvals, simulation, transaction lifecycle and authoritative position reads. These are future implementation requirements, not part of this frontend release. Existing points rules and ledgers are unchanged.

## Verification checkpoint

Local TypeScript and all 82 existing unit tests pass. The local test run uses a scratch TypeScript loader because Windows Application Control blocks native esbuild. Clean Linux CI also passed normal installation, TypeScript and all 82 tests, then stopped at the existing points historical RPC gate (`unsupported-rpc-method`, code -32603); migrations/integration/build were not reached in that job. No gate was disabled or failed history skipped.

The actual Next.js development page rendered using same-version official WebAssembly compiler/CSS fallbacks kept outside application source. Browser checks at 1280px, 900px, 390px and 320px found no horizontal overflow or broken images. Term selection updates the URL and preserves the exact entered amount; a nineteenth decimal produces an inline error; Enter does not submit. The coming-soon deposit control and disconnected Max remain disabled. Input carets stay visible and static text retains a transparent caret. Mobile navigation includes Stake. Eight HTTP checks passed for term selection, invalid/duplicate query defaults, exact app-host rendering and marketing/spoofed-host redirects.

Full local production compilation remains blocked by Windows Application Control on Sharp's existing CMS image processing. Local integration execution is likewise blocked by native esbuild. The audit reports one high, two moderate and one low existing dependency finding; dependencies were not changed. These are explicit validation limits, not successful checks.

PR #22 contains the implementation for review. Vercel rejected its Preview because the project is on the Hobby plan with a private organization repository. No plan, repository visibility, billing, provider secrets, main branch or Production deployment was changed. A successful full build and approved release remain necessary before claiming that the new route is live.

## Metrics and minimum stake - November 12, 2026

The owner replaced the Gold with a Purpose explainer with bold sySGLD metrics and removed the SGLD-to-sySGLD eyebrow. Market cap uses the existing /api/v1/metrics source, polls every minute while active, and rejects errors or snapshots older than two minutes. The existing sySGLD adapter is still unconfigured until actual deployed contracts and share semantics are verified. No zero address is queried or fabricated market cap displayed.

Historical APY is defined by the owner as trailing 30-day APY. There is no authoritative yield-history source yet, so this metric explicitly remains unavailable; its backend calculation and dynamic feed remain future contract/data integration work. No projected rate substitutes for realized APY.

The form displays a minimum stake of 1 SGLD and validates the exact 18-decimal token amount before checking wallet balance. Deposits remain disabled until the staking backend is built. This is frontend validation only; the future backend/contracts must enforce the same minimum independently.
