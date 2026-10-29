# Earn catalogue and owner build repair — October 29, 2026

Owner main a2cbd886e9318a13531ef30f45beb447eba0e059 includes the merged PR #10 plus subsequent homepage/dashboard edits. Vercel deployment dpl_2p1H1FAFHgJRiGFLMTVBVPj7azW2 failed on the raw greater-than character in homepage JSX. Local TypeScript reproduced four parser diagnostics across homepage, interactions and numbers. The repair replaces the two raw arrow characters with the existing arrow icon, gives the icon-only app launch link an accessible name, completes the metrics conditional, and removes stale note destructuring. The removed metric notes/status text stay removed. Owner homepage copy, GitBook destinations, footer/social labels and staking/Sync Points wording are preserved.

Earn now has exactly three entries: SGLD Staking for 30 days, SGLD Staking for 90 days, and Lend on Morpho (Upcoming). The last entry is a credit-market integration placeholder, with no staking lock term, configured deposit asset, rate, market address or live action. Both staking offers remain coming soon because no staking contracts were supplied. All entries use Base.

The catalogue models staking and credit as distinct types. Desktop, mobile and details read the same names and durations; accessible labels use days. The owner's /staking link has no route, so its Explore SGLD Staking button is disabled until access exists. The credit action is also disabled. No staking/lending backend or contracts are implemented. The existing SGLD mint/redeem code and real position-reader scope are unchanged.

The existing catalogue safety test now checks exactly the two day terms, the separate upcoming credit integration without an invented term/asset, unique IDs, Base-only scope and absent rates/actions. Build/TypeScript and native PostgreSQL CI remain the validation gates; browser acceptance checks both layouts and kind-specific details.

Publishing uses the established Preview branch only. Production release, DNS/provider changes and main merge remain separate approval steps. Existing dependency and staff/wallet/release gates are not cleared by this catalogue update.
