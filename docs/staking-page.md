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
