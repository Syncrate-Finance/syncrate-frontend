# Dependency security review — October 27, 2026

Production dependency audit after compatible security updates: **0 critical, 1 high, 2 moderate, 0 low**. This is a registry advisory scan, not a penetration test or proof of exploitability. No advisories were ignored or suppressed.

Fixed resolved-package findings: DOMPurify 3.4.17, Happy DOM 21.0.4, ws 8.22.0 and decode-uri-component 0.5.1. Application validation uses Zod 4.6.7. Abitype was updated within major version 1 to support the current validator; the retained external-store shim uses a React-19-compatible version. Tests and build were rerun after these changes.

Open findings:

| Severity | Dependency and path | Required follow-up |
| --- | --- | --- |
| High | Legacy Zod 3 remains in the retained Coinbase/wallet SDK graph | The SDK declares Zod 3. Do not blindly force a breaking major upgrade throughout third-party code. Review/upgrade or replace the affected integration, verify actual use, then rescan before release. |
| Moderate | uuid under the legacy wallet SDK graph | Upgrade the owning integration or test a supported dependency migration. |
| Moderate | Older esbuild under Drizzle migration tooling | Review upstream migration-tool compatibility. This application does not expose an esbuild development server; retain the finding until resolved or formally assessed. |

References: [Zod advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), [uuid advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq), [esbuild advisory](https://github.com/advisories/GHSA-67mh-4wv8-2f99).

Run pnpm audit:production to reproduce the release audit. It currently returns a nonzero result. The security release gate remains open; do not represent this phase as production-ready. Dependency fixes do not validate the legacy onchain workflows or attest backing/reserves.

## October 29 release audit

The latest registry scan reports **2 high, 2 moderate, 1 low**, with no critical findings. High findings are transitive Zod (GHSA-mrhx-c7xc-m3w5) and graphql-scalars (GHSA-x8rm-f576-gq67); moderate findings are uuid and migration-tool esbuild; the low finding is deepmerge (GHSA-gcqx-w48m-w2h4). Dependencies are unchanged by the Saffron/menu/domain update. No advisory is suppressed or treated as resolved.

The owner explicitly authorized publishing live and activating app.syncrate.org on October 29, superseding the earlier preview-only deployment restriction. This authorization does not clear the dependency findings, controlled personal-wallet acceptance, or staff SMTP/MFA/recovery work. Keep those items visible in the release handoff.
