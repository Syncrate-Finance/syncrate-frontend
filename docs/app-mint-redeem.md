# App overview and SGLD swap

Owner-authorized scope, October 29, 2026: embed the existing Base mint/redeem contracts in the app, remove Net APY and estimated monthly yield, and show “Your positions will appear here”. The public homepage, old /app route, CMS and informational sySGLD are preserved. No new financial backend, router or contracts are introduced.

## Contracts and settlement

Verified on Base (8453), block 53242826:

| Component | Address |
| --- | --- |
| SGLD, 18 decimals | `0x10C5E0643bCc6C915Cad0335f70A96c1532766eb` |
| Engine proxy | `0x37c0078D297243A22ac247cd93f1cafed9Dbe461` |
| Reviewed implementation | `0xD5c82eB3BdFb66f459F3216e53D0ED0A2B1115Ed` |
| Chainlink XAU / USD, 8 decimals | `0x5213eBB69743b85644dbB6E25cdF994aFBb8cF31` |
| Native USDC, 6 decimals | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| USDT, 6 decimals | `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2` |

The engine proxy and implementation have exact-match verified source in [Sourcify](https://sourcify.dev/server/v2/contract/8453/0xD5c82eB3BdFb66f459F3216e53D0ED0A2B1115Ed?fields=all). `features/swap/engine-abi.ts` is the required subset from that implementation; the old proxy-only ABI is insufficient. Source verification is not a security audit.

Mint: `stableAmount * 10^20 / goldPrice`, rounded down to SGLD wei. There is no mint fee in this implementation. Redemption: `sgldAmount * goldPrice / 10^20`, rounded down to stablecoin base units, then subtract `gross * redeemFeeBps / 10000`, rounded down. Read the fee live; observed fee was 25 bps (0.25%). Do not substitute the legacy floating-point estimates or hardcoded gold price.

The UI reads a coherent Base block, verifies fresh block time, bytecode, EIP-1967 implementation, SGLD/feed identities and token/oracle metadata. Oracle age must satisfy the engine's live staleness threshold (observed 86400 seconds), with positive, complete, nonfuture rounds. Unknown implementation/configuration fails closed. Pause, collateral allowlist, reserve capacity including reservations, balances, allowances and native ETH are checked before review and confirmation. Quotes refresh every 15 seconds and immediately before each wallet request.

Approvals cover only the entered amount. An insufficient nonzero allowance is reset first. Approval and mint/redeem each require a separate review and wallet confirmation. Simulation precedes every write; account/network changes invalidate review. Only Base is supported. The agent does not send transactions on the user's behalf.

The contract does not accept min-out or deadline arguments. Estimates may change while awaiting the wallet or mining; the UI must not imply enforced slippage protection. Network fees are additional ETH. After two confirmations, engine events determine actual minted amount, paid amount or queued request index. Successful transaction status alone is not evidence of payment. Approval feedback also checks the exact token/owner/spender/value event. Pending public transaction context persists in session storage; recovery checks receipts without resubmitting a write.

Redemption burns SGLD when the request confirms. If the selected stablecoin buffer cannot cover net payment plus fee, payment enters the existing FIFO queue. The UI discloses this before the request, distinguishes queued from paid, and reads the wallet's pending entries in bounded pages of 20 global queue entries. It does not fabricate queue ranks or guarantee a payout time. Administrative queue processing is not exposed.

## Positions

The owner wants staking, lending and Uniswap liquidity positions for protocols eventually integrated into Earn with SGLD. No live contracts or adapters for those offers are currently supplied. The three Prime offers remain Upcoming; Your positions shows only the requested empty state. This is not an all-wallet DeFi indexer and must not be described as one. Add a verified, account/network-scoped reader with explicit availability/error states for each actual integration when its contracts and semantics are known.

## App origin and release

The exact `app.syncrate.org` host root rewrites to /dashboard, preserving query state. Other host roots keep the marketing page. Dashboard tab changes preserve the current pathname. Dashboard metadata declares the intended canonical app origin and remains noindex.

Read-only Vercel inspection found app.syncrate.org unattached to this project and externally hosted Cloudflare DNS. The hostname did not resolve. No domain or DNS mutation has been made. Prepare the tested Preview first; attaching the hostname and publishing Production require the owner's separate release approval. Recheck Vercel's current domain instructions before any cutover. Do not repoint it to a Preview as a substitute for a reviewed Production release.

## Verification and acceptance limits

- Unit checks cover strict amount parsing, uint256/precision, integer mint/redeem and fee rounding, reserve limits, balance/allowance guards, wallet lifecycle, coherent reads, stale/invalid oracle and identity failures, queue pagination/ownership, receipt decoding and pending recovery.
- `scripts/verify-swap-fork.ts` performs optional acceptance checks against a disposable Anvil Base fork at the hardcoded loopback address `http://127.0.0.1:8545`. It checks the Anvil client before local state overrides, uses local JSON-RPC accounts without private keys, restores its snapshot, and cannot target a public RPC. Both tokens passed mint, immediate redemption, queued redemption, approval consumption and queue receipt checks. No mainnet writes occurred.
- Run it with the pinned Node and `pnpm exec tsx scripts/verify-swap-fork.ts` after starting a local Anvil Base fork on that port. Anvil is a developer verification tool, not an application dependency or Production service. Its upstream fork connection is read-only.
- Production still needs controlled-wallet browser acceptance for real connect/switch/account-change, wallet rejection, confirmation/replacement/reload, mobile wallets and RPC outages. Local fork acceptance does not certify external wallet extensions or contract security.
- Existing dependency findings, real staff/Zoho SMTP/MFA/recovery and broader release gates remain open. No production release, domain change or real blockchain write is part of this preview delivery.
