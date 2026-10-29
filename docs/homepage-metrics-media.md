# Homepage metrics, media and product controls

Owner decisions, October 29, 2026: update the homepage only, keep the latest wording and navy palette, replace the hero illustration with a continuously looping gold image, use the future /sySGLD-icon.png image, give both product information links off-white button backgrounds, and replace the homepage staking-term row with The Numbers. Dashboard Prime offers and transaction routes are unchanged.

## The Numbers

The owner explicitly chose a fixed reported bullion inventory of **193 troy oz**, overriding the initial proposal to read reserveCap. The interface labels it as a fixed reported figure. It is not a real-time physical reserve attestation.

The owner chose **direct Base contract reads for now**, after reviewing the API-key requirement for BaseScan. SGLD market cap is token totalSupply multiplied by Chainlink XAU/USD. Token identity, deployed bytecode, chain ID, block freshness, price description/decimals, positive price and round timestamp are checked. All reads use one block. Integer arithmetic preserves token precision and rounds only the final USD display to cents.

- SGLD: `0x10C5E0643bCc6C915Cad0335f70A96c1532766eb`, symbol SGLD, 18 decimals.
- XAU/USD: `0x5213eBB69743b85644dbB6E25cdF994aFBb8cF31`, verified live on Base as XAU / USD, 8 decimals. The prior unused shared constant pointed to an invalid/undeployed address; the constant now matches the existing mint page's verified feed.
- /api/v1/metrics supplies the read-only public snapshot; the client refreshes every 60 seconds while visible and on focus. Server/CDN caching is at most 30 seconds each; in-flight requests are deduplicated. Partial failures use a shorter process cache and no CDN cache. Failures never become fabricated zero values.
- Block time and oracle quote time are separate in the UI. A block older than five minutes is rejected. Quotes older than 72 hours, future quotes and invalid rounds are rejected. The 72-hour display policy accommodates closed-market weekends; these are indicative display values, not executable prices or proof of liquidity.

sySGLD uses a zero-address placeholder and displays a dash with Contract not configured. No read is made to the placeholder. Set server-only SYSGLD_TOKEN_ADDRESS only after deployment and ABI review. The prepared valuation path requires a verified sySGLD token and an ERC-4626 conversion to SGLD assets; unsupported conversion semantics remain unavailable rather than assuming each share equals one ounce. Update the adapter if the actual contract uses a different design. No deposit or transaction feature was added.

## Product image and buttons

SysgldIcon loads the owner's future `public/sySGLD-icon.png` directly, without optimization caching. Until the file is supplied, an image-error handler removes the broken image and retains its space. No replacement spiral or invented logo is shown. Add the actual PNG and redeploy to activate it. Both existing information links retain their destinations and wording and use the same off-white button class with hover and existing focus treatment.

## Hero asset

Source: [Digital Animation of Gold Bars by crazy motions, Pexels](https://www.pexels.com/video/digital-animation-of-gold-bars-8733007/). The [Pexels license](https://www.pexels.com/license/) permits website use and modification. Source licensing was checked before downloading. This is stock imagery, not an image of Syncrate custody holdings and not an endorsement.

The selected two-second segment is played forward and backward into a four-second repeating GIF. The local 320 × 320 asset is approximately 1.15 MB, six frames per second, with GIF loop count zero (infinite). A local WebP still replaces it for prefers-reduced-motion. No labels, captions, illustration or control buttons remain in the hero media panel. Raw source video and media conversion tooling stay outside source deliverables.

Assets: `public/images/gold-bullion-loop.gif`, `public/images/gold-bullion-still.webp`.

## Verification

Eight new unit tests cover coherent block reads, token/network verification, large-integer USD arithmetic, true zero supply, rejected oracle quotes, placeholder behavior, underlying-share conversion and stale RPC blocks. A live read at block 53235694 returned reported inventory 193, SGLD market cap $8,634.83 and sySGLD unconfigured. Values are a dated verification sample, not defaults. Complete optimized build, native PostgreSQL CI, hosted endpoint checks and responsive browser review before marking the change accepted.

References: [Viem contract reads](https://viem.sh/docs/contract/readContract), [Chainlink timestamp guidance](https://docs.chain.link/data-feeds/overview), [Chainlink Base XAU/USD feed](https://data.chain.link/feeds/base/base/xau-usd), [Etherscan/BaseScan supply API](https://docs.etherscan.io/api-reference/endpoint/tokensupply).
