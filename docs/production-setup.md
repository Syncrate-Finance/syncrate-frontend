# Production configuration and deployment diagnosis

The owner approved Production database, CMS secret and staff-auth setup, and explicitly selected the Syncrate Network organization. Publishing, promotion, DNS and syncrate.org cutover remain separate release actions. Subsequent requests to deploy continue the existing preview workflow.

## Build failure

Main `54168841f55bfeba0284af1b7a3f785e1cb51f27` compiled and passed TypeScript on Vercel, then failed during CMS route configuration. Production had no APP_ENV, SERVER_URL, DATABASE_URL or PAYLOAD_SECRET. All seven existing variables belonged only to Preview branch `codex/configure-supabase-staff`. Do not hide this failure using placeholder secrets, disabled validation or preview credentials.

The owner's latest homepage copy, structure and uploaded SGLD icon are retained. Two nonexistent CSS-module references use the existing textLink and lightLink styles again. The nonexistent sySGLD-icon.png reference uses the existing Layers3 symbol pending an actual supplied asset. Deleted legacy assets are not restored.

## Provisioned configuration

- Dedicated Supabase project `dnpcbfmdejoiszamgvss`, Syncrate Production, Syncrate Network, eu-west-1. The provider quote was $0/month on the existing Free plan; no upgrade was performed.
- Reviewed private Payload baseline applied to the verified empty database. All 14 CMS tables have RLS; anon/authenticated lack schema access. The runtime cannot create schema objects or read auth.users. Migration ownership stays with the separate NOLOGIN migrator.
- Fresh runtime password and Payload secret generated inside PostgreSQL, retained encrypted in Vault and transferred privately to Production-scoped Vercel sensitive variables. No credentials are committed or copied from Preview.
- Production configuration: APP_ENV, SERVER_URL, DATABASE_SCHEMA, CMS_AUTH_PROVIDER, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, DATABASE_URL, PAYLOAD_SECRET and DATABASE_CA_CERT. Canonical origin is the project's existing primary vercel.app alias until approved domain cutover. Preview remains separately configured.
- Production session pooler `aws-0-eu-west-1.pooler.supabase.com:5432` was verified in the selected project's Connect panel. Runtime pool maximum remains three.

## Database trust

The previous preview reported a self-signed certificate-chain error. DATABASE_CA_CERT supplies Supabase's dashboard-published public root CA. The database helper removes URL SSL parameters that node-postgres otherwise uses to overwrite explicit SSL options, then preserves certificate and hostname verification. There is no insecure TLS fallback.

The downloaded Supabase Root 2021 CA expires April 26, 2031; SHA-256 fingerprint `80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`. Obtain it through the selected provider dashboard, not an arbitrary certificate source. Four regression tests exercise actual pg URL parsing, CA preservation, fail-closed TLS settings and safe configuration errors.

## Remaining release requirements

Verify provider signup/redirect/MFA policy, invitation delivery through production-capable SMTP, the owner's password/TOTP enrollment and immutable-subject administrator provisioning. No staff invitation has been sent and no account has been provisioned. Real staff access, revocation and publishing acceptance remain required. Production runtime acceptance cannot be inferred from a preview build. Complete dependency security, monitoring, backups/recovery, media storage and release checks before publishing. The existing /business destination remains unimplemented.
