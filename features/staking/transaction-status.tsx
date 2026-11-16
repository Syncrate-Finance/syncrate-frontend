"use client";
import { formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { useStakingTransactions } from "./use-transactions";
import { depositQuote } from "./transactions";
import styles from "./staking.module.css";
export function StakingTransactionStatus({
  tx,
}: {
  tx: ReturnType<typeof useStakingTransactions>;
}) {
  const action = tx.review?.action;
  const deposit =
    action && "amount" in action ? depositQuote(action.amount) : undefined;
  return (
    <>
      {(tx.message || tx.error || tx.pending) && (
        <section
          className={styles.positions}
          aria-label="Staking transaction status"
        >
          {tx.message && <p role="status">{tx.message}</p>}
          {tx.error && <p role="alert">{tx.error}</p>}
          {tx.pending && (
            <>
              <p>Waiting for confirmation for {tx.pending.account}.</p>
              <a
                href={`https://basescan.org/tx/${tx.pending.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View transaction
              </a>
              <Button variant="outline" disabled={tx.busy} onClick={tx.retry}>
                Check confirmation
              </Button>
            </>
          )}
        </section>
      )}
      <Dialog
        open={!!tx.review}
        onOpenChange={(open) => {
          if (!open && !tx.busy) tx.setReview(null);
        }}
      >
        <DialogContent>
          <DialogTitle>
            Review{" "}
            {action?.kind === "stake"
              ? "your stake"
              : action?.kind === "withdraw"
                ? "redemption"
                : action?.kind === "restake"
                  ? "restaking"
                  : action?.kind === "claim"
                    ? "reward claim"
                    : "SGLD approval"}
          </DialogTitle>
          <DialogDescription>
            Base network. Check the details before confirming in your wallet.
          </DialogDescription>
          {action && "amount" in action ? (
            <div className={styles.reviewDetails}>
              <p>
                {action.kind === "reset"
                  ? "Reset the current allowance to zero."
                  : `Amount: ${formatUnits(action.amount, 18)} SGLD`}
              </p>
              {action.kind === "stake" ? (
                <>
                  <p>
                    Deposit fee: {formatUnits(deposit!.fee, 18)} SGLD (0.25%).
                  </p>
                  <p>
                    You receive {formatUnits(deposit!.principal, 18)} sySGLD.
                  </p>
                  <p>
                    Principal is locked for {action.term} days. No early
                    redemption. Receipts cannot be transferred. Yield varies
                    with funded lease income.
                  </p>
                </>
              ) : (
                <p>
                  This approval moves no SGLD and is a separate transaction.
                  Return to review and submit the stake afterward.
                </p>
              )}
            </div>
          ) : (
            action && (
              <div className={styles.reviewDetails}>
                <p>Position #{action.id.toString()}</p>
                <p>
                  {action.kind === "withdraw"
                    ? "Redeem this whole matured principal position. A 0.50% fee applies to principal; no yield is included in this transaction. Historical rewards remain separately claimable."
                    : action.kind === "restake"
                      ? `Start another ${action.term}-day lock for the whole principal. No additional protocol fee. Rewards are not compounded.`
                      : `Claim available yield from ${action.epochs.length} periods. No protocol fee.`}
                </p>
              </div>
            )
          )}
          <p className={styles.formIntro}>Network fees are paid in Base ETH.</p>
          <Button disabled={tx.busy} onClick={tx.confirm}>
            {tx.busy ? "Confirm in your wallet…" : "Confirm in wallet"}
          </Button>
          <Button
            variant="outline"
            disabled={tx.busy}
            onClick={() => tx.setReview(null)}
          >
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
