# Supabase preview backend and staff access

The owner selected Supabase project `rtuxnwjltxwpwaxzgnno` (Frontend, Syncrate Network, eu-west-1) for preview setup. This is separate from approval to release Syncrate to production. Vercel variables are scoped to Preview and branch `codex/configure-supabase-staff` only.

## Data and identity boundaries

- Payload owns CMS tables, versions and migration history in private schema `cms`. Existing public-schema migrations remain available for older local databases. Do not apply either baseline over an existing populated database or silently switch its schema setting.
- The new `migrations/cms` baseline was generated from Payload's configured schema. Provision `cms` before running it. The owner-designated preview was initialized with that exact baseline through Supabase's migration API, with its Payload history record, in one transaction.
- Run `scripts/sql/supabase-access.sql` as the database owner before initial migration and after each migration. It installs the private schema, role grants, RLS and a narrowly scoped boolean session check. New tables must receive these guards before activation.
- `syncrate_cms_runtime` can read/write CMS data, use its sequences and call the session checker. It cannot perform DDL or read Auth tables. `syncrate_cms_migrator` owns the CMS schema and tables and remains NOLOGIN until an operator explicitly provisions migration credentials. Neither role is a superuser or has BYPASSRLS. The trusted database operator has SET ROLE access to the migrator.
- PostgreSQL connections require certificate verification. The dashboard-verified IPv4 session pooler is `aws-0-eu-west-1.pooler.supabase.com:5432`. Runtime pool size is capped at three connections per process. Review aggregate connection demand before increasing deployment concurrency.
- Preview runtime and Payload secrets were generated in PostgreSQL and retained encrypted in Supabase Vault. They are transferred privately to Vercel sensitive variables; never commit them or copy them into reports. Rotate both if exposure is suspected. No service-role key is needed by the application.
- CMS authorization uses active Payload records mapped to an immutable provider subject. It does not accept provider user metadata as a role, auto-create staff, or enable first-user registration. Deployed Payload password/JWT authentication stays disabled.
- Supabase ES256/RS256 signatures, exact project issuer/audience, expiry, `aal2`, TOTP method and session ID are required. Account lookup and a database session/revocation check run on CMS authentication. Provider sessions that are deleted, expired or attached to banned/deleted users are rejected.
- Access/refresh tokens stay in encrypted, host-only, Secure, HttpOnly, SameSite=Lax cookies. Absolute application session lifetime is eight hours; refresh preserves the original start time. The proxy refreshes expiring tokens, forwards updated cookies to rendering and sets private/no-store headers. Auth mutations also require the configured same-origin JSON request.

## Provider activation

1. Disable public account sign-up in this preview project's Authentication > Sign In / Providers. Keep email confirmation enabled. Confirm TOTP enrollment and verification are enabled under Multi-Factor. Do not disable other security protections to make testing pass.
2. Set the Auth Site URL and exact allowed redirect URL to the verified branch preview's `/staff` route. Avoid wildcard redirects. The app's SERVER_URL comes from Vercel's trusted VERCEL_BRANCH_URL (falling back to VERCEL_URL) on Preview when no explicit origin is set; it does not trust the request Host header.
3. Ensure invitation email delivery works. Supabase's default SMTP sends only to organization team addresses and has a low limit; custom SMTP is required for other recipients and production delivery. Do not add an administrator to the infrastructure organization merely to work around this restriction.
4. Invite the owner-confirmed business email. The owner must accept the invitation and set their own password/authenticator; no operator should collect those credentials. Staff login is `/staff`; MFA is required to enter `/cms`.
5. Before invitation acceptance, provision the invitation's verified immutable subject in Payload. `scripts/provision-preview-admin.ts` is restricted to APP_ENV=preview, Supabase identity, an empty staff collection and explicit operator confirmation. Supply CMS_PROVISION_STAFF=confirm-preview, CMS_PROVISION_EMAIL and CMS_PROVISION_SUBJECT privately in the operator environment. The subject must be independently matched to the invitation record. Alternatively use a reviewed operator data migration with the same checks. Do not auto-map an arbitrary email on sign-in.
6. Verify invitation/password/MFA, CMS access, role restrictions, sign-out, session revocation and content publication in the real preview. Provider setup is incomplete until these checks pass.

## Validation and release

Run normal frozen installation, import-map generation, TypeScript, unit tests, the existing CMS integration suite and private-schema boundary suite, then optimized build. CI runs both legacy-public and private-cms integration paths against disposable native PostgreSQL. Local integration is guarded to local `_test` databases.

Production environment variables, production migrations, DNS, media storage, SMTP delivery, recovery/monitoring and deployment approval are separate release work. A successful preview build does not establish production readiness. Existing dependency security findings remain open.
