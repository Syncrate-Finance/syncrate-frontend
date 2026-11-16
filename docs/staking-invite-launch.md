# Deployed sySGLD and website invitations

Base8453 deployment: `0xA6df4a9d12A5E60E82DD773010775C4DCae26744`, transaction `0x24f1aeb7cb3ab5e6be18e80f491dee5578b42cd44b0d17c52236018d6251ed9e`, block58076512. Creation input exactly matches the reviewed native Foundry build. Runtime matches outside constructor immutables. Roles, asset, fees, treasury and minimum verified independently. Deposits remain paused until the owner signs activation. Source verification is recorded separately.

## Owner-approved boundary

The owner chose website-only invitations and explicitly accepted direct contract deposits once unpaused. This non-upgradeable contract has no allowlist. Codes are not onchain permissions or identity verification.

Each invitation is bound to one wallet and expires after30days. The current staking default admin signs a canonical EIP191 message binding app origin, chain8453, staking address, recipient, issue/expiry times and128-bit nonce. Changed fields invalidate the signature. The server verifies the current admin. The same wallet may reuse its code until expiry to restore browser access. Codes are not single-use coupons. Individual early revocation is not supported; a revocation registry would be separate work.

The admin generates codes in the connected-wallet section of `/stake`, or privately with `pnpm exec tsx scripts/create-staking-invite.ts` and an encrypted Foundry account. The operator script refuses noninteractive execution. Never run it in CI or an agent session. Never commit, log, attach or send private invite codes back to chat. No new database, credentials or Supabase schema changes are needed.

Successful redemption issues a wallet/admin/contract-bound host-only HttpOnly Secure SameSite=Strict cookie for at most7days or invite expiry. A domain-separated key is derived from the existing server secret. POST requests enforce trusted origin, JSON and a bounded body. Responses are private/no-store. Changing admin invalidates old sessions after the15second onchain-state cache expires. Clients recheck access before approvals, deposits and restaking. Failed verification blocks those actions.

Matured principal exits and rewards remain accessible without an invite and while deposits are paused. Actual token actions always require the connected visitor wallet's own transaction signature. The backend submits no financial transactions.

## Interface

- Verify Base, exact runtime hash, SGLD asset, fee constants and minimum using fresh coherent reads. Query keys include the account.
- Gross minimum1SGLD,0.25% entry fee, net1:1 receipts,30/90days. Separate exact approvals/reset and stake reviews; simulate before each signature and recheck account/network.
- Track pending transactions across page refreshes, wait for two confirmations, handle replacement and require exact staking events for a deposit success claim. Never auto-submit a stake after approval.
- Read live receipt balances and paginate historical positions in stable20-entry ID windows. Partial search is explicit.
- Redeem whole matured principal with0.50% principal fee and an empty reward-period list. Preserve historical positions for late claims. Direct rollovers are fee-free but require valid website access and unpaused deposits.
- Rewards are paginated in batches of at most32periods; zero/unavailable batches cannot trigger claims. No automatic compounding or invented APY.
- The verified non-ERC4626 receipt is valued1:1 in SGLD principal with the existing XAU/USD feed. Separate funded rewards are not added to receipt market cap. Historical paid-yield USD/APY feeds remain unavailable pending complete verified payout and price history.

Publish and verify the gated website before owner-only `unpauseDeposits()` signing. Activation immediately permits direct contract deposits by anyone. Report source verification, audit, personal-wallet acceptance and operator readiness as verified or outstanding, without implying tests prove every release gate. The separate historical-points CI check must not be weakened.
