# Robinhood launch and points

The owner approved wallet holdings on Base and Robinhood. There is no per-user USDG mint ceiling: the canonical backed inventory cap remains authoritative. Current inventory is 193 SGLD and can increase only through the authorized backed-inventory process.

## Points accounting

New epochs use `sgld-holdings-v3`, preserving all old v2 epochs and opening balances. The single global pool remains 10 million per completed Sunday-to-Sunday UTC week. Sum each wallet's SGLD-seconds across both chains, add three times its eligible directly owned Base Uniswap SGLD principal-seconds, then divide the one pool. Do not allocate a separate pool per chain. Bridge transit earns no wallet exposure. Base controller `ddD8` backing custody and the Robinhood engine are excluded. Prime earns no new points.

Each v3 epoch records chain-specific cutoff blocks/hashes and weights, plus the verified Robinhood deployment receipt. Before that deployment there is provably no Robinhood weight; an RPC outage is never interpreted as zero holdings. Existing settled awards and their v2 files remain unchanged. Once a v3 epoch is appended, reverting to Base-only settlement is rejected.

Base retains its historical state, pool and NFT reconciliation. The native Robinhood RPC rejects old storage calls. For Robinhood, verify the deployed implementation and the complete proxy upgrade history, replay every canonical Transfer since creation, and reconcile total supply and every touched wallet against one recent anchor. Integrate the same complete event history only over the finalized weekly interval. Later transfers validate the anchor; they do not contribute to an earlier week's weight. Any extra upgrade requires review before using the known implementation's event/state invariant. Record the anchor hash/supply and recheck both anchor and cutoff hashes. Incomplete logs, a stale anchor, an unexpected upgrade or a balance mismatch fail the whole week. This is historical reconstruction, not a present-balance snapshot or fallback award calculation.

The optional server-only Actions secret `POINTS_ROBINHOOD_RPC_URL` can replace the native public RPC if needed. Do not paste provider keys into source. Base's existing `POINTS_RPC_URL` is retained. Safe diagnostics emit fixed method/source labels and numeric codes only. `--verify-current` and `--dry-run` publish nothing.

## User operations

Network selection stays inside Reown. No large in-page chain toggle or SGLD icon replacement. The points summary is wallet-wide; its live token balance explicitly names the currently selected chain. The Uniswap multiplier remains Base only.

Mint and redemption are asynchronous: request, fee-funded source dispatch, delivery to Base, separately fee-funded Base reply, then Robinhood settlement. Anyone can fund a committed message's dispatch; there is no deployed automatic relayer in this release. The recovery interface supports imported request IDs, retries, authenticated cancellation/refunds, FIFO allocation and pull payout. Payment-event lookup uses bounded pages and canonical anchors. A failed/incomplete scan stays unknown; it never reports payment or enables an action on invented state.

## Remaining launch acceptance

Preview code is not proof of a real cross-chain delivery. Mainnet owner signing must demonstrate mint, both bridge directions, redemption/payout and cancellation/refund, with hashes verified against the deployed contracts. Local fork endpoint impersonation does not test live DVNs/executors. The new Robinhood contracts are not covered by the old Base audit merely because that audit appears on the homepage. Independent security/storage review remains outstanding.

Both contracts stay paused until the owner receives a concrete rehearsal/activation package. Unpausing exposes public entry points, including Base bridging, rather than creating a private canary. No agent signs, broadcasts, uses a keystore, moves funds or raises inventory. Production publication and points operational status must be reported from actual deployment/run results.
