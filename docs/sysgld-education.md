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
