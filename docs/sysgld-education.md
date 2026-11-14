# sySGLD educational product page — November 14, 2026

The owner requested replacing the institution-oriented sySGLD page with a holder-focused educational page structured like `/sgld`.

## Scope

- Canonical route remains `/sysgld`, with its existing case normalization and `/business` alias unchanged.
- Uses the existing ProductShell, typography, shared product layout and navy process section. A page-specific CSS module isolates new receipt/funding/fee presentation from `/sgld` and other pages.
- Replaces borrower segments, business onboarding steps and the embedded inquiry form with a product hero, four staking facts, product foundations, three staking steps, yield funding explanation, fees/example, accessible native FAQ disclosures and staking/SGLD links.
- The inquiry component, endpoint, delivery credentials and rate-limit policy remain intact; this page no longer renders the form.
- Product mechanics reflect the reviewed staking candidate: gross minimum 1 SGLD; 30/90-day terms; net-principal, initially non-transferable sySGLD receipts; 0.25% deposit and 0.50% principal redemption fees; fee-free yield claims/direct restaking; maturity stops earning; historical rewards remain claimable after principal exit. Cash lease income must be converted into backed SGLD and explicitly funded by treasury.
- No fixed/guaranteed APY, live contract address, fabricated metrics or enabled deposit action. The page states staking is not open yet; Explore staking links only to the existing interface.
- Homepage, SGLD marketing page, staking app, contracts, points calculations and backend remain unchanged.

## Verification

Record final local checks, deployment and browser results in the release handoff. Windows Application Control blocks the native esbuild test runner; the existing TypeScript loader can run the same unit files without bypassing host security. Native CI remains the standard installation/build verification.

## Owner simplification — November 14, 2026

Removed the entire hero receipt visual, The Foundation, Where the yield comes from and Fees made clear sections. Kept the hero, how-it-works, FAQs and final links. The four staking facts are replaced by a two-value public metrics reader, refreshed every minute: sySGLD market cap and yield paid since inception in USD. Missing, stale or failed data shows a dash and Not available yet, never zero.

The existing market-cap API field is reused without activating the legacy ERC-4626 adapter. Added sysgldYieldPaidUsd as an explicitly unconfigured/null field; no rewards, cumulative paid amount or USD history is fabricated. After deployment, receipt valuation must be reviewed against the actual staking ABI (the existing provisional adapter assumes ERC-4626). Lifetime paid USD requires verified holder claim history, complete inception coverage and historical USD valuations at payment; treasury funding is not a holder payout. These sources are not connected yet. The public UI is wired for API updates but cannot show verified live values until this deployment integration is complete.
