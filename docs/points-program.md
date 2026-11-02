# Sync Points: holding-based rewards

Owner decisions, October 30, 2026. The app page is `https://app.syncrate.org/points`. The independent Syncrate design uses wallet totals, weekly distributions, multipliers and an initially collapsed, paginated public leaderboard. Reading points requests no signature. Marketing `/points` redirects to the app origin; non-production local/Vercel review supports `/points?preview=app`.

## Rules and preserved history

- Keep all 18 balances in the last legacy snapshot: **17,000,338 points**. The immutable opening balance records the source SHA-256. Legacy snapshot files remain available; they are no longer the active calculation source. Previously earned points are not recalculated.
- Start holding-based accrual at the last legacy cutoff, **October 25, 2026, 00:00 UTC**. The first new weekly cutoff is **November 1, 2026, 00:00 UTC**. This start is the documented implementation assumption following the owner's request to continue the existing program.
- Each interval is half-open `[Sunday 00:00 UTC, next Sunday 00:00 UTC)`. Changes at the closing cutoff belong to the next interval. Blocks at the cutoff must be finalized before settlement.
- Wallet-held SGLD has **1×** weight. The SGLD principal in directly owned positions in the canonical Base Uniswap v3 SGLD/USDC pool has **3×** weight. This is three times total LP weight, not a 1× balance plus another 3× bonus.
- Pool: `0xC5963Bd6d6Cf713F0994fFd867D4d639AD45EC6E`. NFT manager: `0x03a520b32c04bf3beef7beb72e919cf822ed34f1`. The reader verifies chain, token identities, factory, fee tier and canonical pool before calculating.
- Integrate actual SGLD principal over elapsed block timestamps, including balance transfers, LP liquidity changes, NFT ownership transfers and pool price changes. Multiply LP SGLD-wei-seconds by three. Divide the **10,000,000** weekly pool proportionally, using integers and deterministic largest-remainder rounding. Zero total weight leaves that pool unallocated rather than inventing recipients.
- USDC, uncollected LP fees, unsupported pools and underlying users of custodial/vault positions do not receive an attributed LP boost. Smart-contract wallets can own positions directly; there is no inference of underlying users through contracts. Known system/custody balances are excluded, including the eligible pool, engine, NFT manager and legacy Prime custody address. Pool balances are never also credited as ordinary wallet holdings.
- No new Prime deposit rewards. No new staking contracts, signing flow or financial transaction executor. The upcoming staking catalogue remains separate from points calculation.

## Data and integrity

`data/points/ledger.json` contains the opening balances and settled epochs. Each new epoch is also written under `data/points/epochs/`. Each record includes the interval, block boundaries, end-block hash, calculation time, per-wallet integer weights and awards. These are public onchain reward data, not CMS customer records.

`server/points/chain.ts` fetches complete token, pool and NFT histories, replays events, then reconciles the final supply, wallet balances, NFT ownership/liquidity, core-position liquidity and pool price against historical contract reads. Failed ranges stop the job; they are never skipped. A second end-block hash check rejects a changed history. Archive read errors are not replaced with current balances. Same-block temporary holdings have no elapsed weight.

Block headers and deployment bytecode use public Base by default, optionally configured with server-only `POINTS_BLOCK_RPC_URL`. The configured archive endpoint remains responsible for logs, receipts and historical contract state. This separates metadata lookups after the selected archive provider returned internal errors for old headers/bytecode while public Base served those reads successfully. Routing is explicit, not a fallback for missing reward history: failures remain fatal. The metadata endpoint's chain8453 is checked and weekly event block hashes must match their fetched headers; finalized settlement hashes are checked again before returning an allocation. Safe diagnostic output contains fixed labels and numeric codes only, never provider error messages or credentials.

Ledger validation rejects duplicate wallets, invalid/future publications, nonconsecutive cutoffs, inconsistent award totals and awards that do not match their weights. A local exclusive lock, atomic ledger replacement, immutable epoch files and workflow concurrency prevent overlapping local/job publications. Rerunning a settled cutoff does not award it twice. The calculator catches up at most eight weeks per run; longer gaps require operator review.

`GET /api/v1/points` validates wallet addresses and pagination. Personalized responses contain only the requested wallet. The public leaderboard is requested separately, 20 entries per page. Responses are `no-store`; account-specific query keys and address matching prevent displaying a previous wallet's cached totals. A disconnected wallet has a connection prompt, not a fabricated zero. No current-week reward estimate is invented. Overdue unpublished cutoffs remain marked processing.

The old `/app/api/points/leaderboard` URL now returns the same paginated program projection. The legacy mint page links to the canonical points page instead of rendering its retired mint/Prime widget. The legacy `/prime` page no longer contains a deposit tab, deposit/approval methods or its obsolete snapshot leaderboard; existing sySGLD holders retain the same redemption contract and arguments. Its points link opens the current app dashboard. Keep `node scripts/calculate-week.cjs` as the operator entry point.

The points dashboard describes only the implemented rules: wallet-held SGLD at 1× and directly owned eligible Uniswap SGLD principal at 3×. Trading volume, a 10× multiplier, all-protocol positions and deposits through Saffron or Prime are not reward criteria. Existing historical totals remain intact.

## Zero-cost provider setup

The existing public Base endpoint remains suitable for ordinary app reads. The full-history calculator needs an independently configured endpoint: the tested public endpoints rejected/throttled historical requests. A paid subscription is not a requirement.

The owner encountered OnFinality's "failed to load workspace data" error and requested alternatives. [Chainnodes Core](https://www.chainnodes.org/pricing) is a free candidate with 12.5 million requests/month and 25 requests/second. Its [network documentation](https://www.chainnodes.org/docs/about) includes Base and archive access; its [limits](https://www.chainnodes.org/docs/FAQs/rate_limits) allow a 20,000-block log range. The reader starts with at most 20,000 blocks per request and narrows failed ranges while preserving full coverage.

1. Sign up at `https://www.chainnodes.org/` and remain on the free Core plan. Do not enable a paid upgrade.
2. Select Base Mainnet in the provider dashboard and copy its HTTPS endpoint.
3. Save it as repository Actions secret `POINTS_RPC_URL` in Syncrate-Finance/syncrate-frontend. Never commit or paste the key-bearing URL into chat, logs or issue bodies. This secret is used only by the historical verification and settlement steps, not the browser or Vercel frontend.
4. Run the read-only verification below before enabling publication. The calculator paces requests at one start per second by default; adjust `POINTS_RPC_MIN_INTERVAL_MS` only within the provider's permitted limits. Provider caps/range restrictions can still fail a run.

There is no silent public-provider fallback or purchase. Ordinary `BASE_RPC_URL` is left unchanged. dRPC Free excludes archive access; Alchemy's current free Base log range is ten blocks, making a complete backfill impractical for this worker. Reassess documented free limits before changing providers.

[Infura Core](https://www.infura.io/pricing) is another free candidate: published full archive access, 3 million daily credits and [Base support](https://www.infura.io/networks/ethereum/base). Method credits and result limits apply. OnFinality's [Developer plan](https://onfinality.io/en/pricing) also documents free archive access, 400,000 daily response units and a [Base API](https://documentation.onfinality.io/support/base), but the owner's dashboard setup is currently blocked. These are published capabilities, not proof that Syncrate's full calculation has passed with any provider.

## Operation and verification

- `node scripts/calculate-week.cjs --verify-current`: read-only reconciliation of the oldest unsettled interval, capped at its next Sunday cutoff or finalized history if the week is unfinished. An overdue completed week is verified on its exact reward boundaries. Prints fixed progress/counts and block evidence; writes no awards.
- `node scripts/calculate-week.cjs --dry-run`: validate all completed, unsettled weekly intervals without publishing. Before the first cutoff, exits successfully with no changes and needs no RPC.
- `node scripts/calculate-week.cjs`: settle completed intervals only; never writes an unfinished week.
- Existing Weekly Sync Points Actions workflow keeps manual dispatch. Manual runs default to dry-run. `verify_current=true` is always read-only, regardless of the other input.
- Sunday runs at 00:30, 02:30, 06:30, 12:30 and 18:30 UTC retry the same fixed 00:00 cutoff. GitHub schedule delivery can be delayed. Later successful runs catch up; reruns after success do nothing.
- Unit tests run before the workflow commits only `data/points`. A Git push conflict fails visibly; it is not suppressed or force-pushed. The data commit must trigger a successful Vercel build before the static ledger import changes on the public app. Verify that deployment after the first real Sunday run; do not infer it from the worker's exit code.
- Foundation CI runs the read-only current reconciliation when the Actions secret is present on trusted same-repository PR/push events. Without it, CI explicitly reports that live history acceptance is pending. A green unit/build job without the secret does not prove rewards are operational.

## Acceptance status

Local TypeScript, 72 unit tests, optimized build and 19 HTTP checks passed during implementation. Tests cover time-weighted transfers, zero-duration holdings, LP ownership/price changes, 3× allocation, no pool double counting, exact integer conservation, missing history, Uniswap tick math, all opening balances and immutable weekly settlement. Browser review covered desktop, 390px and 320px, collapsed/expanded leaderboard and wallet picker without signing.

**Still pending:** the full historical reconciliation using an eligible endpoint, actual weekly publication/deployment at the first cutoff, and a personal-wallet account-switch acceptance session. No new weekly points have been published. The local PostgreSQL service was unavailable in this turn; exact-commit native PostgreSQL CI and Vercel preview results are recorded in the delivery handoff. Existing broader staff/recovery/dependency gates remain separate.
