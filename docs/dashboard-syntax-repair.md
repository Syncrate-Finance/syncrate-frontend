# Dashboard syntax repair — October 29, 2026

Owner main `2a23dae8f778f9a5bebcca92282c68b804f430aa` failed in Vercel deployment `dpl_6PEmfrJF6d23Tqg6cumDVEkDV34A` during webpack compilation. The log reports `Expected '</', got 'jsx text'` in features/dashboard/overview.tsx and features/marketing/homepage.tsx. Installation completed successfully; this failure is syntax, not configuration or pnpm policy.

Isolated TypeScript parser checks reproduced one dashboard error (unclosed opportunities section after deleting the bottom content) and seven cascading homepage errors (the prior unclosed Design container and extra documents closer). The homepage repairs already exist in the tested Preview branch. Main and Preview had diverged at `628e3fb`; main did not contain the embedded swap or the previous homepage repair.

The repair combines current owner main edits with the tested Preview implementation and preserves both histories. It retains the new SGLD image blob directly from GitHub, the removed portfolio labels and the owner's mobile SGLD Staking / deposit asset / network / blank APY content. Desktop catalogue and offer dialogs remain as currently authored. Empty wrappers and the dangling portfolio separator are omitted. No unrelated homepage wording is rewritten.

The dashboard no longer contains the Understand sySGLD strip or the visible Chainlink Quote / time line, as requested. The owner's removed catalogue announcement and bottom note stay removed. The actual live gold price, oracle timestamp validation, swap quote math, receipt handling and wallet guards are unchanged. Informational /sysgld and the footer product link remain available.

Verification uses the existing TypeScript/unit/build/native PostgreSQL CI checks plus hosted desktop/mobile inspection. No new test mirrors these reversible presentation removals. No agent mainnet transactions, Production deployment, main merge, DNS changes or provider configuration changes are part of this Preview repair. Existing dependency and release gates remain open.
