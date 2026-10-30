# SGLD and sySGLD product pages

October 29, 2026. The owner requested a descriptive SGLD page and a business-oriented sySGLD page, using Theo's business page as context without copying its design, claims or media. The latest main homepage had an invalid `<aria-hidden="true" />` tag. Removing that tag preserves the owner's footer link removal and latest menu wording. The marketing footer is now shared by the homepage and product pages.

## Routes and content

- `/sgld` describes the asset, custody, mint/redeem process, documentation and FAQs. It reuses existing local bullion imagery and the current canonical app destination.
- `/sysgld` describes gold financing, six Built For business segments, a qualification process and the inquiry form. It is informational and does not implement a deposit app.
- `/sySGLD` permanently redirects to `/sysgld`, preserving query parameters. Case normalization is handled in the proxy because Next config redirects match case-insensitively and would otherwise loop. `/business` also redirects to `/sysgld`.
- No transaction handlers, contracts, CMS schema, staff authentication or DNS records are changed.

## Four SGLD metrics

The existing validated public metrics service now also returns circulating SGLD supply and unallocated bullion. The four SGLD page metrics are market capitalization, bullion weight, circulating supply and unallocated bullion. Inventory stays fixed at the owner's reported 193 troy oz. Unallocated inventory is that reported amount less onchain token supply; it is not an independently verified vault measurement. If supply exceeds reported inventory, the unallocated value is unavailable rather than negative or fabricated.

Market capitalization continues to use coherent Base supply and verified Chainlink XAU/USD reads. Integer arithmetic, oracle validation, failure states and minute refresh are retained. Supply and unallocated inventory remain usable when the price feed fails. sySGLD's contract placeholder remains unqueried.

## Inquiry delivery

The form posts to `/api/v1/inquiries`. The fixed destination is `team@syncrate.org`, as selected by the owner. Nodemailer 10.3.1 sends plain text through the privately configured Zoho account over TLS port 465 with certificate/hostname verification. Server-only `CONTACT_SMTP_HOST`, `CONTACT_SMTP_USER` and `CONTACT_SMTP_PASSWORD` are required for delivery but not page compilation. Never expose or print credentials.

Strict server validation enforces consent, field limits, a blank honeypot, a bounded 16 KiB JSON body and an explicit trusted Origin. Visitors cannot override recipients or mail headers. Failures retain form values and offer the existing contact address. Success is returned only after Zoho accepts the recipient. Logs contain only fixed failure categories, never visitor data or SMTP credentials.

The project firewall rule `sySGLD business inquiries` is limited to POST `/api/v1/inquiries`, with 10 requests per IP per 60-second fixed window and HTTP 429 enforcement. It was published in log mode first, then enforced and checked using empty requests that send no email. `CONTACT_RATE_LIMIT_READY=true` is a deployment provisioning guard; set it only after the applicable hosted deployment's protection is confirmed. Do not enable an unprotected Preview sender.

Production SMTP variables were entered privately by the owner. Metadata shows them scoped to Production; configured Preview has no SMTP credentials. Preview therefore fails closed for real submissions. No credentials were copied across environments.

There is no application database outbox, retry worker or deduplication in this form. Acknowledgement means Zoho accepted the message into its delivery queue, not that a person read it or that inbox placement is guaranteed. Requests that fail before acceptance ask the visitor to retry. A timeout can have an uncertain outcome. Broader durable notification workflows remain future work.

## Validation and acceptance

Local optimized build, TypeScript, 61 unit tests and five disposable public-schema integration tests passed during implementation. Native PostgreSQL CI must cover both schema paths for the final commit. Unit coverage includes actual MIME serialization to a local stream transport, injection/recipient abuse, oversized/chunked bodies, consent, Origin restrictions, provisioned rate-limit guard, awaited SMTP success and redacted failure behavior. No test email has been sent without owner authorization.

Responsive browser checks, hosted deployment IDs, final CI and actual Zoho delivery acceptance are recorded in the release handoff. Existing dependency audit findings (two high, two moderate, one low), real staff MFA/recovery, personal-wallet lifecycle acceptance and DeFi position readers remain separate open work. A successful build is not overall production readiness.
