"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useAccount,
  useConfig,
  usePublicClient,
  useWriteContract,
} from "wagmi";
import {
  erc20Abi,
  formatUnits,
  type Address,
  type Hash,
  type TransactionReceipt,
} from "viem";
import { ArrowDownUp, ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WalletControl } from "@/features/dashboard/shell";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { engineAbi } from "./engine-abi";
import {
  assertWalletContext,
  displayAmount,
  inputToken,
  parseAmount,
  quoteSwap,
  requiredAction,
  STABLECOINS,
  type Stablecoin,
  type SwapMode,
  type SwapQuote,
  type SwapSnapshot,
} from "./model";
import { readQueuedPayouts, readSwapSnapshot } from "./read";
import { hasApprovalReceipt, readSwapOutcome } from "./receipt";
import {
  decodePending,
  encodePending,
  PENDING_KEY,
  type PendingSwap,
} from "./pending";
import styles from "./swap.module.css";

type Review = {
  account: Address;
  mode: SwapMode;
  stablecoin: Stablecoin;
  amount: bigint;
  quote: SwapQuote;
  snapshot: SwapSnapshot;
  action: "reset" | "approve" | "swap";
};
function readableError(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    (Reflect.get(error, "code") === 4001 ||
      /rejected|denied/i.test(String(Reflect.get(error, "shortMessage") ?? "")))
  )
    return "Request cancelled in your wallet.";
  if (
    error instanceof Error &&
    /^(Enter|Use at most|Amount|Insufficient|Add ETH|Wallet changed|Swaps |This asset|Refresh|Quote|Network data|Live gold|Swap configuration|Transaction reverted)/.test(
      error.message,
    )
  )
    return error.message;
  return "The request could not be completed. Refresh and try again.";
}
function Token({ symbol }: { symbol: string }) {
  return (
    <span className={styles.token}>
      <Image
        src={
          symbol === "SGLD"
            ? "/SGLD-icon.png"
            : symbol === "USDC"
              ? "/usdc-icon.png"
              : "/usdt-icon.png"
        }
        width={22}
        height={22}
        alt=""
      />
      {symbol}
    </span>
  );
}
function QueuedPayouts({ account }: { account: Address }) {
  const client = usePublicClient({ chainId: 8453 });
  const [offset, setOffset] = useState(0n);
  useEffect(() => setOffset(0n), [account]);
  const query = useQuery({
    queryKey: ["sgld-queue", account.toLowerCase(), offset.toString()],
    queryFn: () => readQueuedPayouts(client!, account, offset),
    enabled: Boolean(client),
    refetchInterval: 15000,
    retry: 1,
  });
  if (
    offset === 0n &&
    !query.data?.rows.length &&
    !query.data?.nextOffset &&
    !query.isError
  )
    return null;
  return (
    <div className={styles.queue}>
      <h3>Queued payouts</h3>
      {query.data && !query.data.rows.length && (
        <p>No matching payouts in these entries.</p>
      )}
      {query.isError ? (
        <p>Queue status is temporarily unavailable.</p>
      ) : (
        query.data?.rows.map((row) => {
          const token = (Object.keys(STABLECOINS) as Stablecoin[]).find(
            (symbol) =>
              STABLECOINS[symbol].address.toLowerCase() ===
              row.token.toLowerCase(),
          );
          return (
            <p key={row.index.toString()}>
              Request #{row.index.toString()}{" "}
              <span>
                {token
                  ? `${displayAmount(row.amount, 6)} ${token}`
                  : "Unsupported asset"}{" "}
                · Pending
              </span>
            </p>
          );
        })
      )}
      {query.data?.nextOffset !== null &&
        query.data?.nextOffset !== undefined && (
          <button
            type="button"
            onClick={() => setOffset(query.data!.nextOffset!)}
          >
            Check next queue entries
          </button>
        )}
      {offset > 0n && (
        <button type="button" onClick={() => setOffset(0n)}>
          Back to first entries
        </button>
      )}
    </div>
  );
}

export function SwapPanel() {
  const wallet = useAccount(),
    config = useConfig(),
    client = usePublicClient({ chainId: 8453 });
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();
  const [mode, setMode] = useState<SwapMode>("mint");
  const [stablecoin, setStablecoin] = useState<Stablecoin>("USDC");
  const [input, setInput] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false),
    busyRef = useRef(false);
  const [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [pending, setPending] = useState<PendingSwap | null>(null);
  const [transactionHash, setTransactionHash] = useState<Hash>();
  useEffect(() => {
    try {
      const restored = decodePending(sessionStorage.getItem(PENDING_KEY));
      if (restored) {
        setPending(restored);
        setTransactionHash(restored.hash);
        setMode(restored.review.mode);
        setStablecoin(restored.review.stablecoin);
        setMessage("A previous transaction needs a confirmation check.");
      }
    } catch {
      /* Storage can be disabled; receipt tracking still works in this page. */
    }
  }, []);
  function rememberPending(transaction: PendingSwap | null) {
    setPending(transaction);
    try {
      if (transaction)
        sessionStorage.setItem(PENDING_KEY, encodePending(transaction));
      else sessionStorage.removeItem(PENDING_KEY);
    } catch {
      /* Do not interrupt confirmation if browser storage is unavailable. */
    }
  }
  const account =
    wallet.isConnected && wallet.chainId === 8453 ? wallet.address : undefined;
  const query = useQuery({
    queryKey: ["sgld-swap", stablecoin, account?.toLowerCase()],
    queryFn: () => readSwapSnapshot(client!, stablecoin, account),
    enabled: Boolean(client),
    staleTime: 10000,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    retry: 1,
  });
  useEffect(() => {
    setReview(null);
    setError("");
  }, [wallet.address, wallet.chainId, wallet.isConnected]);
  const data =
    query.data?.account?.toLowerCase() === account?.toLowerCase()
      ? query.data
      : undefined;
  let amount: bigint | undefined,
    quote: SwapQuote | undefined,
    inputError = "",
    nextAction: "reset" | "approve" | "swap" | undefined;
  try {
    if (input) amount = parseAmount(input, mode === "mint" ? 6 : 18);
    if (amount && data) {
      quote = quoteSwap(mode, amount, data);
      if (account) nextAction = requiredAction(mode, amount, data);
    }
  } catch (err) {
    inputError = readableError(err);
  }
  const locked = busy || Boolean(review) || Boolean(pending);
  const from = mode === "mint" ? stablecoin : "SGLD",
    to = mode === "mint" ? "SGLD" : stablecoin;
  const balance = data
    ? mode === "mint"
      ? data.stableBalance
      : data.sgldBalance
    : undefined;
  function guard(expected: Address) {
    const connection = config.state.current
      ? config.state.connections.get(config.state.current)
      : undefined;
    assertWalletContext(expected, {
      address: connection?.accounts[0],
      chainId: connection?.chainId,
      connected: config.state.status === "connected",
    });
  }
  async function prepareReview() {
    if (!client || !account || busyRef.current || !amount) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      guard(account);
      const snapshot = await readSwapSnapshot(client, stablecoin, account);
      guard(account);
      setReview({
        account,
        mode,
        stablecoin,
        amount,
        snapshot,
        quote: quoteSwap(mode, amount, snapshot),
        action: requiredAction(mode, amount, snapshot),
      });
    } catch (err) {
      setError(readableError(err));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function finishTransaction(transaction: PendingSwap) {
    if (!client) return;
    let replaced = false;
    const receipt: TransactionReceipt = await client.waitForTransactionReceipt({
      hash: transaction.hash,
      confirmations: 2,
      timeout: 120000,
      onReplaced: (replacement) => {
        setTransactionHash(replacement.transaction.hash);
        rememberPending({ ...transaction, hash: replacement.transaction.hash });
        if (replacement.reason !== "repriced") replaced = true;
      },
    });
    setTransactionHash(receipt.transactionHash);
    rememberPending(null);
    if (replaced) {
      setMessage(
        "The transaction was replaced. Check its details on BaseScan.",
      );
      return;
    }
    if (receipt.status !== "success") {
      setError("Transaction reverted. No swap completed.");
      setMessage("");
      return;
    }
    const context = transaction.review;
    if (context.action !== "swap")
      setMessage(
        !hasApprovalReceipt(
          receipt,
          context.account,
          context.mode,
          context.stablecoin,
          context.action === "reset" ? 0n : context.amount,
        )
          ? "Transaction confirmed. Refresh to check the current allowance."
          : context.action === "reset"
            ? "Allowance reset. Review the approval to continue."
            : "Approval confirmed. Review the swap to continue.",
      );
    else {
      const outcome = readSwapOutcome(
        receipt,
        context.account,
        context.mode,
        context.stablecoin,
        context.amount,
      );
      setMessage(
        !outcome
          ? "Transaction confirmed. Check its result on BaseScan."
          : outcome.kind === "queued"
            ? `Redemption entered the queue as request #${outcome.queueIndex}. SGLD has been burned. Check queued payouts below.`
            : `${displayAmount(outcome.amount, outcome.kind === "minted" ? 18 : 6)} ${outcome.kind === "minted" ? "SGLD minted" : context.stablecoin + " received"}.`,
      );
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["sgld-swap"] }),
      queryClient.invalidateQueries({ queryKey: ["sgld-snapshot"] }),
      queryClient.invalidateQueries({ queryKey: ["sgld-queue"] }),
    ]);
  }
  async function confirm() {
    if (!review || !client || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    let submitted = false;
    try {
      guard(review.account);
      const snapshot = await readSwapSnapshot(
        client,
        review.stablecoin,
        review.account,
      );
      guard(review.account);
      const currentQuote = quoteSwap(review.mode, review.amount, snapshot),
        action = requiredAction(review.mode, review.amount, snapshot);
      if (
        action !== review.action ||
        currentQuote.output !== review.quote.output ||
        currentQuote.fee !== review.quote.fee ||
        currentQuote.queues !== review.quote.queues
      ) {
        setReview({ ...review, snapshot, quote: currentQuote, action });
        setError("Quote updated. Review the amounts and continue.");
        return;
      }
      const engine = CONTRACT_ADDRESSES.SYNCRATE_ENGINE;
      let hash: Hash;
      if (action !== "swap") {
        const simulation = await client.simulateContract({
          account: review.account,
          address: inputToken(review.mode, review.stablecoin),
          abi: erc20Abi,
          functionName: "approve",
          args: [engine, action === "reset" ? 0n : review.amount],
        });
        if (simulation.result === false) throw Error("Approval is unavailable");
        guard(review.account);
        hash = await writeContractAsync({
          ...simulation.request,
          chainId: 8453,
        });
      } else if (review.mode === "mint") {
        const simulation = await client.simulateContract({
          account: review.account,
          address: engine,
          abi: engineAbi,
          functionName: "mint",
          args: [review.amount, STABLECOINS[review.stablecoin].address],
        });
        guard(review.account);
        hash = await writeContractAsync({
          ...simulation.request,
          chainId: 8453,
        });
      } else {
        const simulation = await client.simulateContract({
          account: review.account,
          address: engine,
          abi: engineAbi,
          functionName: "redeem",
          args: [review.amount, STABLECOINS[review.stablecoin].address],
        });
        guard(review.account);
        hash = await writeContractAsync({
          ...simulation.request,
          chainId: 8453,
        });
      }
      submitted = true;
      const transaction = { hash, review };
      setTransactionHash(hash);
      rememberPending(transaction);
      setReview(null);
      setMessage("Transaction submitted. Waiting for confirmation…");
      await finishTransaction(transaction);
    } catch (err) {
      if (submitted)
        setError(
          "Confirmation is taking longer. Check the transaction before trying again.",
        );
      else setError(readableError(err));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function checkPending() {
    if (!pending || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await finishTransaction(pending);
    } catch {
      setError("Confirmation is still unavailable. Check BaseScan.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      className={styles.panel}
      id="buy-sgld"
      aria-labelledby="buy-sgld-heading"
    >
      <div className={styles.heading}>
        <h2 id="buy-sgld-heading">Buy SGLD</h2>
        <span>Base</span>
      </div>
      <div className={styles.modes} aria-label="Swap direction">
        <button
          type="button"
          disabled={locked}
          aria-pressed={mode === "mint"}
          onClick={() => {
            setMode("mint");
            setInput("");
            setError("");
            setMessage("");
          }}
        >
          Mint
        </button>
        <button
          type="button"
          disabled={locked}
          aria-pressed={mode === "redeem"}
          onClick={() => {
            setMode("redeem");
            setInput("");
            setError("");
            setMessage("");
          }}
        >
          Redeem
        </button>
      </div>
      <div className={styles.assetChoice}>
        <label htmlFor="sgld-stablecoin">Pay / receive with</label>
        <select
          id="sgld-stablecoin"
          value={stablecoin}
          disabled={locked}
          onChange={(event) => {
            setStablecoin(event.target.value as Stablecoin);
            setInput("");
            setError("");
            setMessage("");
          }}
        >
          <option>USDC</option>
          <option>USDT</option>
        </select>
      </div>
      <div className={styles.amountBox}>
        <div>
          <label htmlFor="sgld-swap-amount">You pay</label>
          <Token symbol={from} />
        </div>
        <input
          id="sgld-swap-amount"
          type="text"
          inputMode="decimal"
          maxLength={90}
          autoComplete="off"
          placeholder="0.00"
          value={input}
          disabled={locked}
          aria-describedby="sgld-swap-error"
          aria-invalid={Boolean(inputError)}
          onChange={(event) => {
            setInput(event.target.value);
            setError("");
            setMessage("");
          }}
        />
        <div className={styles.balance}>
          Balance:{" "}
          {account && balance !== undefined
            ? displayAmount(balance, mode === "mint" ? 6 : 18)
            : "–"}{" "}
          <button
            type="button"
            disabled={
              !account || balance === undefined || balance === 0n || locked
            }
            onClick={() =>
              setInput(formatUnits(balance!, mode === "mint" ? 6 : 18))
            }
          >
            Max
          </button>
        </div>
      </div>
      <div className={styles.direction}>
        <ArrowDownUp size={16} aria-hidden="true" />
      </div>
      <div className={styles.amountBox}>
        <div>
          <span>Estimated receive</span>
          <Token symbol={to} />
        </div>
        <output aria-live="polite" className={styles.output}>
          {quote ? displayAmount(quote.output, mode === "mint" ? 18 : 6) : "–"}
        </output>
      </div>
      <div className={styles.price}>
        <span className={styles.liveDot} />
        <span>Live SGLD price</span>
        <strong>
          {data && !query.isError
            ? "$" + displayAmount(data.price, 8, 2) + " / oz"
            : query.isPending
              ? "Loading…"
              : "Unavailable"}
        </strong>
        <button
          type="button"
          aria-label="Refresh gold price and quote"
          disabled={query.isFetching || busy}
          onClick={() => void query.refetch()}
        >
          <RefreshCw size={12} />
        </button>
      </div>
      {mode === "redeem" && (
        <p className={styles.note}>
          Redemption fee: {data ? formatUnits(data.feeBps, 2) + "%" : "–"}.
          Redemptions can queue; SGLD is burned when the request confirms.
        </p>
      )}
      <p id="sgld-swap-error" className={styles.error} role="status">
        {error ||
          inputError ||
          (query.isError ? "Quote unavailable. Refresh to try again." : "")}
      </p>
      {!wallet.isConnected || wallet.chainId !== 8453 ? (
        <WalletControl compact />
      ) : (
        <Button
          className={styles.action}
          disabled={locked || !amount || !quote || !nextAction || query.isError}
          onClick={() => void prepareReview()}
        >
          {busy
            ? "Please wait…"
            : pending
              ? "Awaiting confirmation"
              : nextAction === "reset"
                ? "Reset " + from + " allowance"
                : nextAction === "approve"
                  ? "Approve " + from
                  : mode === "mint"
                    ? "Mint SGLD"
                    : "Redeem SGLD"}
        </Button>
      )}
      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}
      {transactionHash && (
        <a
          className={styles.txLink}
          target="_blank"
          rel="noopener noreferrer"
          href={`https://basescan.org/tx/${transactionHash}`}
        >
          View transaction <ArrowUpRight size={12} />
        </a>
      )}
      {pending && !busy && (
        <div>
          <p className={styles.note}>
            Pending transaction for {pending.review.account.slice(0, 6)}…
            {pending.review.account.slice(-4)}
          </p>
          <button
            type="button"
            className={styles.txLink}
            onClick={() => void checkPending()}
          >
            Check confirmation
          </button>
        </div>
      )}
      {mode === "redeem" && account && <QueuedPayouts account={account} />}
      <p className={styles.note}>Estimates can change before confirmation.</p>
      <Dialog
        open={Boolean(review)}
        onOpenChange={(open) => {
          if (!busy && !open) {
            setReview(null);
            setError("");
          }
        }}
      >
        <DialogContent
          className={styles.review}
          onInteractOutside={(event) => {
            if (busy) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <DialogTitle>
            {review?.action === "swap"
              ? "Review " + (review.mode === "mint" ? "mint" : "redemption")
              : review?.action === "reset"
                ? "Reset allowance"
                : "Review approval"}
          </DialogTitle>
          <DialogDescription>
            {review?.action === "swap"
              ? "Check the amounts before confirming in your wallet."
              : "This authorizes only the entered amount. The swap requires a separate confirmation."}
          </DialogDescription>
          {review && (
            <>
              <dl className={styles.reviewDetails}>
                <div>
                  <dt>Network</dt>
                  <dd>Base</dd>
                </div>
                <div>
                  <dt>Wallet</dt>
                  <dd>
                    {review.account.slice(0, 6)}…{review.account.slice(-4)}
                  </dd>
                </div>
                <div>
                  <dt>You pay</dt>
                  <dd>
                    {formatUnits(
                      review.amount,
                      review.mode === "mint" ? 6 : 18,
                    )}{" "}
                    {review.mode === "mint" ? review.stablecoin : "SGLD"}
                  </dd>
                </div>
                <div>
                  <dt>Estimated receive</dt>
                  <dd>
                    {displayAmount(
                      review.quote.output,
                      review.mode === "mint" ? 18 : 6,
                    )}{" "}
                    {review.mode === "mint" ? "SGLD" : review.stablecoin}
                  </dd>
                </div>
              </dl>
              {review.mode === "redeem" && review.action === "swap" && (
                <p className={styles.note}>
                  Redemption fee: {displayAmount(review.quote.fee, 6)}{" "}
                  {review.stablecoin} ({formatUnits(review.snapshot.feeBps, 2)}
                  %). Included in the estimate.
                </p>
              )}
              {review.mode === "redeem" && review.action === "swap" && (
                <p className={styles.note}>
                  {review.quote.queues
                    ? "This redemption is expected to queue. "
                    : "Payment may queue if available funds change. "}
                  SGLD is burned when the request confirms; queued payment
                  arrives later.
                </p>
              )}
              {review.action === "reset" && (
                <p className={styles.note}>
                  Reset the existing allowance to zero first. You can then
                  approve the entered amount.
                </p>
              )}
              <p className={styles.error} role="status">
                {error}
              </p>
              <Button disabled={busy} onClick={() => void confirm()}>
                {busy
                  ? "Waiting for wallet / confirmation…"
                  : "Continue in wallet"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
