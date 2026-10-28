# Syncrate homepage: independent composition

Owner direction, October 28, 2026: rebuild only the public homepage so it has its own structure while retaining the professional design quality. This supersedes the earlier requirement to mirror Theo's public homepage. The dashboard composition is unchanged.

## Structure

1. Asymmetric editorial hero: a gold-to-onchain story, original vector illustration and four asset facts. No cinematic background or motion dependency.
2. A dark, three-stage explanation: physical foundation, SGLD on Base, wallet access.
3. Side-by-side SGLD and informational sySGLD stories, followed by the three planned Prime terms. No invented rates or staking actions.
4. An open document library with dated custody/procurement references and the whitepaper, replacing carousel slides.
5. Published CMS insights with archive fallbacks, followed by a separate closing call to action.
6. Reworked homepage navigation and footer styling, with Syncrate branding, forest green, ivory and restrained gold accents.

Buy SGLD still opens https://syncrate.org/app. No dashboard, mint, other product-page, authentication, API or database changes. Artwork is original code-native SVG and conceptual; it is not a live balance or reserve statement. No new dependencies or Theo media/font assets are used.

## Verification

24 unit tests and the five existing CMS authorization tests pass locally. The private-schema test is intentionally skipped in the public-schema local pass; the existing CI private-schema pass covers it. All 134 baseline files outside the homepage were verified unchanged before adding homepage documentation. Build and HTTP results are recorded in the final handoff.

Automated visual review could not be completed because the computer-use tool stopped when it could not establish the active Windows browser URL confidently. Do not claim visual acceptance or pixel-perfect responsive behavior from source/HTTP checks. Navigation uses native details and links, Escape/outside-click dismissal, visible focus and reduced-motion styles.

Production deployment remains unapproved. Existing security, staff-MFA and operational release gates remain open. Dependency audit was attempted during this revision but the npm advisory endpoint was blocked by network access; the last known 1 high, 2 moderate and 1 low findings remain unresolved.

Final local validation: optimized build including TypeScript passed. Rendered homepage returned 200 with one h1/main, unique IDs and valid section anchors. All eight checked product/app/legal/document destinations returned 200. Responsive/reduced-motion CSS is present; this is not a visual layout check. Dashboard/mint/backend source hashes remain unchanged.
