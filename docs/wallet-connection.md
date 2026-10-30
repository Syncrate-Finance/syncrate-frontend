# Wallet connections with Reown AppKit

Owner request: replace the broken mobile wallet picker with Reown's interface. The preceding points JSX repair is independent and changes only the owner's empty conditional.

## Cause and implementation

The hosted project had no `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`. The previous provider deliberately fell back to an injected connector only. Ordinary mobile browsers typically have no injected wallet, leaving RainbowKit's wallet-education view with no usable pairing choices.

The shared provider now uses pinned `@reown/appkit` and `@reown/appkit-adapter-wagmi` 1.8.24 with the existing Wagmi2/Viem2/React Query5 stack. RainbowKit's direct package/provider/styles are removed. One Base Wagmi configuration and one AppKit modal serve overview, points and the retained legacy/admin wallet triggers. The existing styled triggers remain; the small render-prop bridge supplies account/network controls without altering any financial handler.

AppKit provides wallet selection, WalletConnect QR pairing, mobile wallet links, account/disconnect and network selection. Base8453 remains the only configured network. Mint/redeem guards, transaction simulation, exact approvals, queue handling and wallet-change invalidation remain unchanged. No automatic transaction or signing request is added.

AppKit email/social login, embedded-wallet onboarding, analytics, swaps, on-ramp, send/receive and history features are disabled. Existing external wallets remain the connection method. The modal uses light styling and navy accent; vendor branding is retained. Public Base RPC remains the ordinary read transport; the unrelated archive points job is not reconfigured.

## Public Project ID and origins

Create a project at `https://dashboard.reown.com/`. Save its32-character hexadecimal public Project ID as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in Vercel Production and the configured Preview branch. This identifier is public in the browser; it is not a wallet private key, seed phrase, RPC secret or staff credential. No real identifier is committed to source or this document.

The owner entered Production's identifier and replied Configured. The agent completed the requested Preview scope using the same public identifier for branch `codex/configure-supabase-staff`. Both environments require a new build after changing a NEXT_PUBLIC variable.

Allow the actual website origins in the Reown dashboard: `https://app.syncrate.org` for the active app; marketing origins if using retained `/admin` or `/prime` wallet tools. For preview acceptance add the exact configured branch preview origin, `https://syncrate-frontend-git-codex-configu-727b52-zyneth-labs-projects.vercel.app`, and explicitly permitted local test origins when needed. Do not broadly wildcard unrelated sites or spoof an allowed Origin to bypass provider restrictions. Wallet metadata uses the actual browser origin, with the canonical app origin as the server fallback.

A missing/malformed identifier does not prevent public content or read-only queries rendering. Connection triggers show an honest temporary-unavailability dialog instead of an empty wallet picker. It is not a substitute for hosted configuration: verify the real wallet list and pairing in the exact deployment before declaring mobile connections fixed.

## Dependency and license handling

The new packages fit the pinned Wagmi/Viem peers. No broad runtime upgrade or peer override was added. AppKit1.8.24 has a postinstall version-alignment checker; it was inspected and version-scoped in the existing strict `allowBuilds` policy. Unknown scripts remain fatal. Normal frozen installation must pass, with no `--ignore-scripts` bypass.

Portions © 2025 Reown, Inc. All Rights Reserved. The exact bundled Community License is served at `/notices/reown-appkit-LICENSE.txt` and linked in the terms-page footer. The SDK/license was not modified. The current license lists commercial thresholds of500monthly active users or2.5millionmonthly RPCs; the owner was informed. No paid plan, upgrade, billing or new provider account was purchased by the agent.

## Acceptance

Run the normal frozen install, TypeScript, unit/integration checks and optimized build. Check the configured preview at desktop and mobile widths: actual wallet choices, WalletConnect pairing view, close/reopen, existing account/network controls and no layout overflow. Do not record or print pairing URIs, session keys or QR payloads. A browser-width check does not prove native iOS/Android wallet handoff or personal-wallet signing; document those separately. No agent-submitted mainnet transaction is authorized.

The delivery handoff records exact commits, CI/deployment evidence and any remaining mobile/native-wallet acceptance. Broader points-archive and staff/dependency gates remain separate.
