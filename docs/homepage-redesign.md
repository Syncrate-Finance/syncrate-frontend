# Syncrate homepage: independent composition

Owner direction, October 28, 2026: rebuild only the public homepage so it has its own structure while retaining the professional design quality. This supersedes the earlier requirement to mirror Theo's public homepage. The dashboard composition is unchanged.

## Structure

1. Asymmetric editorial hero: a gold-to-onchain story, original vector illustration. No cinematic background or motion dependency.
2. A dark, three-stage explanation: physical foundation, SGLD on Base, wallet access.
3. Side-by-side SGLD and informational sySGLD stories, followed by the three planned Prime terms. No invented rates or staking actions.
4. An open document library with dated custody/procurement references and the whitepaper, replacing carousel slides.
5. Published CMS insights with archive fallbacks, followed by a Building With partner marquee.
6. Reworked homepage navigation and footer styling, with Syncrate branding, forest green, ivory and restrained gold accents.

Buy SGLD still opens https://syncrate.org/app. No dashboard, mint, other product-page, authentication, API or database changes. Artwork is original code-native SVG and conceptual; it is not a live balance or reserve statement. No new dependencies or Theo media/font assets are used.

## Verification

24 unit tests and the five existing CMS authorization tests pass locally. The private-schema test is intentionally skipped in the public-schema local pass; the existing CI private-schema pass covers it. All 134 baseline files outside the homepage were verified unchanged before adding homepage documentation. Build and HTTP results are recorded in the final handoff.

The initial automated visual review was blocked by Windows browser URL verification. The owner subsequently completed visual review and accepted the independent homepage. During the follow-up refinement, the managed in-app browser verified footer alignment at desktop, 390px and 320px widths, logo-only branding and mobile menu/Escape behavior. No horizontal page overflow was observed at those widths. Navigation retains native details/links, visible focus and reduced-motion styles.

Production deployment remains unapproved. Existing security, staff-MFA and operational release gates remain open. Dependency audit was attempted during this revision but the npm advisory endpoint was blocked by network access; the last known 1 high, 2 moderate and 1 low findings remain unresolved.

Final local validation: optimized build including TypeScript passed. Rendered homepage returned 200 with one h1/main, unique IDs and valid section anchors. All eight checked product/app/legal/document destinations returned 200. Responsive/reduced-motion CSS is present; this is not a visual layout check. Dashboard/mint/backend source hashes remain unchanged.


## Owner review refinements - October 28, 2026

The owner completed visual review and accepted the independent homepage direction. Follow-up changes remove the large wordmark from both shared marketing/dashboard brand links, preserve the accessible link names and original logo, remove the entire asset-facts row, and put the footer grid/disclosures/bottom row inside the same centered responsive container used by the homepage. Footer columns use bounded tracks and top alignment. Existing legacy page headers already use the logo without a separate wordmark.

The owner explicitly selected deployment to the existing preview, not syncrate.org. No production activation is authorized. Other product content, wallet behavior, transaction code, backend and schema remain unchanged.


## Building With partner section

Replaces the Your Next Chapter closing call to action with the existing nine-partner catalogue and local logo assets. Two equal-width groups create a seamless 90-second right-to-left loop; the duplicate is hidden from assistive technology. A pause/resume button and hover pause are provided. Reduced-motion preference disables animation and shows a static grid of all nine partners. No new partner relationships, external destinations or dependency changes are introduced.

Partner follow-up validation: local optimized build/TypeScript, 24 unit tests, five authorization integration tests and nine asset HTTP checks passed. Browser checks measured approximately 20.8px/second right-to-left motion, two equal 1872px groups in a 3744px track, functioning pause/resume, nine accessible partner entries and no page overflow at 390px/320px. Logo images load eagerly to avoid blank tiles during the loop. Reduced-motion CSS presents the single complete static grid.
