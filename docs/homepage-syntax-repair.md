# Owner homepage edit repair — October 29, 2026

Main 628e3fbbcb6535a32f2ccc9ee8dc287dd664deb5 failed in Vercel during webpack parsing, before TypeScript. A local check reproduced seven cascading JSX diagnostics. The Design section's container closing tag had been deleted; the document introduction retained an extra closing tag after its removed controls.

Restored the two wrapper boundaries, imported supported Coins, Vault and ClipboardCheck icons in place of undeclared GoldBars/Vault/Audit symbols, and used the card title as the React key because the owner intentionally removed the numeric labels. Corrected the nonexistent /transparency destination to the existing #transparency section and the case-sensitive /sySGLD destination to /sysgld. The owner's new wording, headings, document labels and removed copy are retained.

Main and the existing review branch had diverged. The final change combines these owner edits with the already approved gold GIF, product buttons, Numbers metrics and CMS certificate fix. Both histories are retained; do not replace either tree wholesale or restore the old main homepage over the reviewed features.

The pending cursor request is included. A homepage-only class uses the default arrow over ordinary text and hides the text caret. Links/buttons retain pointer cursors and keyboard focus outlines. Text selection remains available, and actual text inputs/editable controls retain text cursors and normal carets. The homepage does not enable contentEditable or document design mode.

Validate the final commit through TypeScript, existing unit tests, native PostgreSQL CI, Vercel build and hosted browser checks. Production publishing and main merge remain separate release actions; this task updates the existing Preview.
