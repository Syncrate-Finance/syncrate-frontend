"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useAccount,
  useConfig,
  usePublicClient,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import {
  decodeEventLog,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  keccak256,
  type Address,
  type Hash,
  type Hex,
} from "viem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WalletControl } from "@/features/dashboard/shell";
import {
  displayAmount,
  IMPLEMENTATION_SLOT,
  parseAmount,
  type SwapMode,
} from "./model";
import {
  RH,
  RECEIVE_OPTIONS,
  rhAbi,
  quoteRobinhood,
  type RobinhoodSnapshot,
} from "./robinhood-model";
import {
  readRobinhoodIntent,
  readRobinhoodSnapshot,
  type RobinhoodIntent,
} from "./robinhood-read";
import {
  addRemoteId,
  decodeRemoteHistory,
  emptyRemoteHistory,
  remoteHistoryKey,
  type RemoteHistory,
  type RemotePending,
} from "./robinhood-storage";
import styles from "./swap.module.css";

type Review = {
  account: Address;
  mode: SwapMode;
  amount: bigint;
  minimum: bigint;
  output: bigint;
  action: "approve" | "mint" | "redeem";
};
type RecoveryAction =
  | "dispatch"
  | "reply"
  | "cancel"
  | "refund"
  | "claim"
  | "queue";
const explorer = (chainId: number, hash: Hash) =>
  `${chainId === 8453 ? "https://basescan.org" : "https://robinhoodchain.blockscout.com"}/tx/${hash}`;
function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/rejected|denied|cancelled/i.test(message))
    return "Request cancelled in your wallet.";
  if (
    /^(Enter|Use at most|Amount|This request|Insufficient|Network data|Contract configuration|Wallet changed|Quote|Minting|Add ETH|Transaction|Approval)/.test(
      message,
    )
  )
    return message.split("\n")[0].slice(0, 200);
  return "Unable to complete this step. Refresh the status before trying again.";
}
function statusText(intent: RobinhoodIntent) {
  if (intent.state === 4) return "USDG refunded";
  if (intent.state === 3)
    return intent.request.kind === 0
      ? "Rejected · refund available"
      : "Rejected · SGLD restored";
  if (intent.state === 2)
    return intent.request.kind === 0
      ? "SGLD minted"
      : intent.claimable > 0n
        ? "USDG ready to claim"
        : intent.paid === true
          ? "USDG paid"
          : intent.paid === null
            ? "Redemption accepted · check payout status"
            : "Redemption accepted · awaiting liquidity allocation";
  if (intent.hasResponse) return "Base settled · send settlement reply";
  return intent.expired
    ? "Awaiting settlement · cancellation available"
    : "Awaiting cross-chain settlement";
}
function IntentCard({
  id,
  account,
  onAction,
  disabled,
}: {
  id: Hash;
  account: Address;
  onAction: (id: Hash, action: RecoveryAction) => void;
  disabled: boolean;
}) {
  const base = usePublicClient({ chainId: 8453 }),
    remote = usePublicClient({ chainId: 4663 });
  const query = useQuery({
    queryKey: ["rh-intent", account.toLowerCase(), id],
    queryFn: () => readRobinhoodIntent(base!, remote!, id, account),
    enabled: Boolean(base && remote),
    refetchInterval: 15000,
    retry: 1,
  });
  const intent = query.data;
  return (
    <article className={styles.intent}>
      <div>
        <strong>{intent?.request.kind === 1 ? "Redeem" : "Mint"} SGLD</strong>
        <code title={id}>
          {id.slice(0, 10)}…{id.slice(-6)}
        </code>
      </div>
      <p role="status">
        {query.isError
          ? "Request status unavailable. Refresh before taking action."
          : intent
            ? statusText(intent)
            : "Checking request…"}
      </p>
      {intent && !query.isError && (
        <div className={styles.intentActions}>
          {intent.state === 1 && !intent.hasResponse && (
            <button
              disabled={disabled}
              onClick={() => onAction(id, "dispatch")}
            >
              {intent.cancellationQueued
                ? "Send / retry cancellation"
                : "Send / retry request"}
            </button>
          )}
          {intent.state === 1 && intent.hasResponse && (
            <button disabled={disabled} onClick={() => onAction(id, "reply")}>
              Send / retry settlement reply (Base)
            </button>
          )}
          {intent.state === 1 &&
            intent.expired &&
            !intent.hasResponse &&
            !intent.cancellationQueued && (
              <button
                disabled={disabled}
                onClick={() => onAction(id, "cancel")}
              >
                Request cancellation
              </button>
            )}
          {intent.state === 3 && intent.request.kind === 0 && (
            <button disabled={disabled} onClick={() => onAction(id, "refund")}>
              Claim USDG refund
            </button>
          )}
          {intent.state === 2 &&
            intent.request.kind === 1 &&
            intent.claimable > 0n && (
              <button disabled={disabled} onClick={() => onAction(id, "claim")}>
                Claim USDG
              </button>
            )}
          {intent.state === 2 &&
            intent.request.kind === 1 &&
            intent.claimable === 0n &&
            intent.paid === false && (
              <button disabled={disabled} onClick={() => onAction(id, "queue")}>
                Process payout queue
              </button>
            )}
        </div>
      )}
      <button
        disabled={disabled || query.isFetching}
        onClick={() => void query.refetch()}
      >
        Refresh status
      </button>
    </article>
  );
}

export function RobinhoodPanel({ active }: { active: boolean }) {
  const wallet = useAccount(),
    config = useConfig(),
    queryClient = useQueryClient();
  const base = usePublicClient({ chainId: 8453 }),
    remote = usePublicClient({ chainId: 4663 });
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();
  const [mode, setMode] = useState<SwapMode>("mint"),
    [input, setInput] = useState("");
  const [review, setReview] = useState<Review | null>(null),
    [history, setHistory] = useState<RemoteHistory | null>(null);
  const [busy, setBusy] = useState(false),
    busyRef = useRef(false);
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [importId, setImportId] = useState("");
  const [dispatchReview, setDispatchReview] = useState<{
    id: Hash;
    action: RecoveryAction;
    chainId: 8453 | 4663;
    fee: bigint;
  } | null>(null);
  const [page, setPage] = useState(0);
  const account = wallet.isConnected ? wallet.address : undefined;
  const currentAccount = useRef(account);
  currentAccount.current = account;
  useEffect(() => {
    setReview(null);
    setDispatchReview(null);
    setError("");
    setMessage("");
    setPage(0);
    try {
      setHistory(
        account
          ? decodeRemoteHistory(localStorage.getItem(remoteHistoryKey(account)))
          : null,
      );
    } catch {
      setHistory(account ? emptyRemoteHistory() : null);
    }
  }, [account]);
  useEffect(() => {
    setReview(null);
    setDispatchReview(null);
  }, [wallet.chainId]);
  const locked =
    busy ||
    Boolean(review) ||
    Boolean(dispatchReview) ||
    Boolean(history?.pending);
  function save(owner: Address, value: RemoteHistory) {
    if (currentAccount.current?.toLowerCase() === owner.toLowerCase())
      setHistory(value);
    try {
      localStorage.setItem(remoteHistoryKey(owner), JSON.stringify(value));
    } catch {
      setError(
        "Browser storage is unavailable. Keep your transaction hash or request ID to recover this request.",
      );
    }
  }
  const snapshot = useQuery({
    queryKey: ["rh-swap", account?.toLowerCase()],
    queryFn: () => readRobinhoodSnapshot(base!, remote!, account),
    enabled: Boolean(base && remote && active),
    staleTime: 10000,
    refetchInterval: 15000,
    retry: 1,
  });
  const data =
    snapshot.data?.account?.toLowerCase() === account?.toLowerCase()
      ? snapshot.data
      : undefined;
  let amount: bigint | undefined,
    quote: ReturnType<typeof quoteRobinhood> | undefined,
    inputError = "";
  try {
    if (input) amount = parseAmount(input, mode === "mint" ? 6 : 18);
    if (amount && data) quote = quoteRobinhood(mode, amount, data);
  } catch (err) {
    inputError = errorMessage(err);
  }
  function guard(owner: Address, chainId: number) {
    const connection = config.state.current
      ? config.state.connections.get(config.state.current)
      : undefined;
    if (
      config.state.status !== "connected" ||
      connection?.accounts[0]?.toLowerCase() !== owner.toLowerCase() ||
      connection.chainId !== chainId
    )
      throw Error("Wallet changed. Check your account and network.");
  }
  async function identities() {
    if (!base || !remote) throw Error("Network unavailable");
    const [slot, impl, controller] = await Promise.all([
      remote.getStorageAt({ address: RH.engine, slot: IMPLEMENTATION_SLOT }),
      remote.getBytecode({ address: RH.implementation }),
      base.getBytecode({ address: RH.controller }),
    ]);
    if (
      slot?.slice(-40).toLowerCase() !==
        RH.implementation.slice(2).toLowerCase() ||
      !impl ||
      keccak256(impl) !== RH.implementationHash ||
      !controller ||
      keccak256(controller) !== RH.controllerHash
    )
      throw Error("Contract configuration changed. Please contact Syncrate.");
  }
  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["rh-swap"] }),
      queryClient.invalidateQueries({ queryKey: ["rh-intent"] }),
      queryClient.invalidateQueries({ queryKey: ["sgld-snapshot"] }),
    ]);
  }
  async function finish(
    owner: Address,
    prior: RemoteHistory,
    pending: RemotePending,
  ) {
    const client = pending.chainId === 8453 ? base : remote;
    if (!client) throw Error("Network unavailable");
    let replacement = false;
    const receipt = await client.waitForTransactionReceipt({
      hash: pending.hash,
      confirmations: pending.chainId === 8453 ? 2 : 20,
      timeout: 120000,
      onReplaced: (value) => {
        replacement = value.reason !== "repriced";
        pending = { ...pending, hash: value.transaction.hash };
        save(owner, { ...prior, pending });
      },
    });
    let next: RemoteHistory = { ...prior, pending: null };
    if (receipt.status !== "success") {
      save(owner, next);
      throw Error("Transaction reverted. No action completed.");
    }
    if (
      !replacement &&
      (pending.action === "mint" || pending.action === "redeem")
    ) {
      let found = false;
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== RH.engine.toLowerCase()) continue;
        try {
          const event = decodeEventLog({
            abi: rhAbi,
            eventName: "IntentCreated",
            data: log.data,
            topics: log.topics,
          });
          if (event.args.owner.toLowerCase() !== owner.toLowerCase()) continue;
          next = addRemoteId(next, event.args.id);
          found = true;
        } catch {
          /* Other engine events are not creation proof. */
        }
      }
      if (!found) {
        save(owner, next);
        throw Error(
          "Transaction confirmed, but request creation could not be verified. Check the explorer before submitting again.",
        );
      }
    }
    save(owner, next);
    setMessage(
      replacement
        ? "Transaction replaced. Check its explorer details before continuing."
        : pending.action === "approve"
          ? "USDG approval confirmed. Review your mint request to continue."
          : "Transaction confirmed. Cross-chain requests are complete only when their status below confirms settlement.",
    );
    await refresh();
  }
  async function send(
    owner: Address,
    prior: RemoteHistory,
    action: RemotePending["action"],
    chainId: 8453 | 4663,
    to: Address,
    callData: Hex,
    value = 0n,
    id?: Hash,
  ) {
    const client = chainId === 8453 ? base : remote;
    if (!client) throw Error("Network unavailable");
    await identities();
    guard(owner, chainId);
    const result = await client.call({
      account: owner,
      to,
      data: callData,
      value,
    });
    if (action === "approve" && result.data === `0x${"0".repeat(64)}`)
      throw Error("Approval is unavailable.");
    const gas = await client.estimateGas({
      account: owner,
      to,
      data: callData,
      value,
    });
    guard(owner, chainId);
    const hash = await sendTransactionAsync({
      account: owner,
      chainId,
      to,
      data: callData,
      value,
      gas: (gas * 120n) / 100n,
    });
    const pending: RemotePending = { hash, chainId, action, id };
    save(owner, { ...prior, pending });
    setReview(null);
    setDispatchReview(null);
    setMessage("Submitted. Waiting for confirmation…");
    await finish(owner, prior, pending);
  }
  async function run(task: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function validate(
    snapshot: RobinhoodSnapshot,
    mode: SwapMode,
    amount: bigint,
  ) {
    if (snapshot.paused || (mode === "mint" && !snapshot.allowed))
      throw Error("Minting and redemption requests are not open yet.");
    if (
      (mode === "mint" ? snapshot.usdgBalance : snapshot.sgldBalance) < amount
    )
      throw Error("Insufficient balance.");
    if (snapshot.nativeBalance <= 0n)
      throw Error("Add ETH on Robinhood for network fees.");
  }
  async function prepare() {
    if (!account || !amount || !remote || !base || !history) return;
    if (wallet.chainId !== 4663) {
      await switchChainAsync({ chainId: 4663 });
      return;
    }
    guard(account, 4663);
    const fresh = await readRobinhoodSnapshot(base, remote, account);
    guard(account, 4663);
    validate(fresh, mode, amount);
    const quoted = quoteRobinhood(mode, amount, fresh);
    setReview({
      account,
      mode,
      amount,
      ...quoted,
      action: mode === "mint" && fresh.allowance < amount ? "approve" : mode,
    });
  }
  async function confirm() {
    if (!review || !history || !base || !remote) return;
    const r = review;
    guard(r.account, 4663);
    const fresh = await readRobinhoodSnapshot(base, remote, r.account);
    guard(r.account, 4663);
    validate(fresh, r.mode, r.amount);
    const quoted = quoteRobinhood(r.mode, r.amount, fresh);
    const action =
      r.mode === "mint" && fresh.allowance < r.amount ? "approve" : r.mode;
    if (action !== r.action || quoted.output !== r.output) {
      setReview({ ...r, ...quoted, action });
      setError("Quote updated. Review the amounts again.");
      return;
    }
    const block = await remote.getBlock();
    if (BigInt(Math.floor(Date.now() / 1000)) - block.timestamp > 120n)
      throw Error("Network data is outdated.");
    if (action === "approve")
      await send(
        r.account,
        history,
        action,
        4663,
        RH.usdg,
        encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [RH.engine, r.amount],
        }),
      );
    else
      await send(
        r.account,
        history,
        action,
        4663,
        RH.engine,
        encodeFunctionData({
          abi: rhAbi,
          functionName: action === "mint" ? "requestMint" : "requestRedemption",
          args: [r.amount, r.minimum, block.timestamp + 840n, r.account],
        }),
      );
  }
  async function recovery(id: Hash, action: RecoveryAction, confirmed = false) {
    if (!account || !history || history.pending || !base || !remote) return;
    const owner = account;
    const intent = await readRobinhoodIntent(base, remote, id, owner);
    const chainId = action === "reply" ? 8453 : 4663;
    if (wallet.chainId !== chainId) {
      await switchChainAsync({ chainId });
      return;
    }
    guard(owner, chainId);
    let data: Hex,
      value = 0n,
      to: Address = RH.engine;
    if (action === "dispatch" || action === "reply") {
      if (
        intent.state !== 1 ||
        (action === "reply" && !intent.hasResponse) ||
        (action === "dispatch" && intent.hasResponse)
      )
        throw Error("Quote updated. Refresh the request status.");
      to = action === "reply" ? RH.controller : RH.engine;
      const msg =
        action === "reply"
          ? intent.response
          : intent.cancellationQueued
            ? intent.cancellation
            : intent.message;
      const client = action === "reply" ? base : remote;
      const fee = await client.readContract({
        address: to,
        abi: rhAbi,
        functionName: "quoteDispatch",
        args: [msg, RECEIVE_OPTIONS],
      });
      value = (fee.nativeFee * 105n + 99n) / 100n;
      if (
        !confirmed ||
        !dispatchReview ||
        dispatchReview.id !== id ||
        dispatchReview.action !== action ||
        value > dispatchReview.fee
      ) {
        setDispatchReview({ id, action, chainId, fee: value });
        return;
      }
      data = encodeFunctionData({
        abi: rhAbi,
        functionName: "dispatch",
        args: [msg, RECEIVE_OPTIONS],
      });
    } else if (action === "cancel") {
      if (intent.state !== 1 || !intent.expired || intent.hasResponse)
        throw Error("This request cannot be cancelled now.");
      data = encodeFunctionData({
        abi: rhAbi,
        functionName: "requestCancellation",
        args: [id],
      });
    } else if (action === "refund") {
      if (intent.state !== 3 || intent.request.kind !== 0)
        throw Error("This request has no claimable refund.");
      data = encodeFunctionData({
        abi: rhAbi,
        functionName: "claimRefund",
        args: [id, owner],
      });
    } else if (action === "claim") {
      if (
        intent.state !== 2 ||
        intent.request.kind !== 1 ||
        intent.claimable === 0n
      )
        throw Error("This request has no claimable payout.");
      data = encodeFunctionData({
        abi: rhAbi,
        functionName: "claimRedemption",
        args: [id, owner],
      });
    } else {
      if (
        intent.state !== 2 ||
        intent.request.kind !== 1 ||
        intent.claimable > 0n ||
        intent.paid !== false
      )
        throw Error("This request does not need queue processing.");
      data = encodeFunctionData({
        abi: rhAbi,
        functionName: "processPayouts",
        args: [20n],
      });
    }
    await send(
      owner,
      history,
      action === "reply" ? "dispatch" : action,
      chainId,
      to,
      data,
      value,
      id,
    );
  }
  if (
    !active &&
    !history?.ids.length &&
    !history?.pending &&
    !review &&
    !dispatchReview
  )
    return null;
  return (
    <section
      className={styles.panel}
      aria-label={active ? "Robinhood minting" : "Robinhood requests"}
    >
      <div hidden={!active}>
        <div className={styles.heading}>
          <h2 id="rh-mint-heading">Buy SGLD</h2>
          <span>Robinhood</span>
        </div>
        <div className={styles.modes} aria-label="Robinhood swap direction">
          {(["mint", "redeem"] as const).map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={mode === value}
              disabled={locked}
              onClick={() => {
                setMode(value);
                setInput("");
                setError("");
              }}
            >
              {value === "mint" ? "Mint" : "Redeem"}
            </button>
          ))}
        </div>
        <div className={styles.assetChoice}>
          <span>Pay / receive with</span>
          <span>USDG</span>
        </div>
        <div className={styles.amountBox}>
          <div>
            <label htmlFor="rh-amount">You pay</label>
            <span className={styles.token}>
              {mode === "redeem" && (
                <Image src="/SGLD-icon.png" alt="" width={22} height={22} />
              )}
              {mode === "mint" ? "USDG" : "SGLD"}
            </span>
          </div>
          <input
            id="rh-amount"
            inputMode="decimal"
            autoComplete="off"
            maxLength={90}
            placeholder="0.00"
            value={input}
            disabled={locked}
            aria-describedby="rh-error"
            aria-invalid={Boolean(inputError)}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
          />
          <div className={styles.balance}>
            Balance:{" "}
            {account && data
              ? displayAmount(
                  mode === "mint" ? data.usdgBalance : data.sgldBalance,
                  mode === "mint" ? 6 : 18,
                )
              : "–"}
            <button
              disabled={locked || !account || !data}
              onClick={() =>
                setInput(
                  formatUnits(
                    mode === "mint" ? data!.usdgBalance : data!.sgldBalance,
                    mode === "mint" ? 6 : 18,
                  ),
                )
              }
            >
              Max
            </button>
          </div>
        </div>
        <div className={styles.direction} aria-hidden="true">
          ↓
        </div>
        <div className={styles.amountBox}>
          <div>
            <span>Estimated receive</span>
            <span className={styles.token}>
              {mode === "mint" && (
                <Image src="/SGLD-icon.png" alt="" width={22} height={22} />
              )}
              {mode === "mint" ? "SGLD" : "USDG"}
            </span>
          </div>
          <output className={styles.output} aria-live="polite">
            {quote
              ? displayAmount(quote.output, mode === "mint" ? 18 : 6)
              : "–"}
          </output>
        </div>
        <div className={styles.price}>
          <span>Live gold price</span>
          <strong>
            {data && !snapshot.isError
              ? `$${displayAmount(data.goldUSD18, 18, 2)} / oz`
              : "Unavailable"}
          </strong>
          <button
            disabled={snapshot.isFetching}
            onClick={() => void snapshot.refetch()}
          >
            Refresh
          </button>
        </div>
        <p className={styles.note}>
          USDG minting and redemption settle across chains. Sending the request
          and the Base settlement reply each requires ETH. Minimum receive uses
          0.5% slippage protection.
          {mode === "redeem" && data
            ? ` Redemption fee: ${formatUnits(data.feeBps, 2)}%. USDG payouts can queue and require a claim.`
            : ""}
        </p>
        {data?.paused && (
          <p className={styles.note} role="status">
            Robinhood requests are not open yet.
          </p>
        )}
        <p id="rh-error" className={styles.error} role="status">
          {error ||
            inputError ||
            (snapshot.isError
              ? "Live quote unavailable. Refresh before continuing."
              : "")}
        </p>
        {!wallet.isConnected ? (
          <WalletControl compact requiredChainId={4663} />
        ) : (
          <Button
            className={styles.action}
            disabled={
              locked ||
              !history ||
              (wallet.chainId === 4663 &&
                (!quote ||
                  !amount ||
                  !data ||
                  data.paused ||
                  (mode === "mint" && !data.allowed) ||
                  snapshot.isError))
            }
            onClick={() => void run(prepare)}
          >
            {wallet.chainId !== 4663
              ? "Switch to Robinhood"
              : busy
                ? "Please wait…"
                : mode === "mint" && data && amount && data.allowance < amount
                  ? "Approve USDG"
                  : mode === "mint"
                    ? "Review mint"
                    : "Review redemption"}
          </Button>
        )}
      </div>
      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}
      {history?.pending && account && (
        <div className={styles.queue}>
          <a
            href={explorer(history.pending.chainId, history.pending.hash)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View submitted transaction ↗
          </a>
          <button
            disabled={busy}
            onClick={() =>
              void run(() => finish(account, history, history.pending!))
            }
          >
            Check confirmation
          </button>
        </div>
      )}
      {account && history && (
        <div className={styles.queue}>
          <h3>Your Robinhood requests</h3>
          <p className={styles.note}>
            Saved for this wallet in this browser. To recover elsewhere, import
            the request ID from its IntentCreated event. Expiry alone never
            releases funds; cancellation must settle on Base.
          </p>
          {history.ids.slice(page * 5, page * 5 + 5).map((id) => (
            <IntentCard
              key={`${account}:${id}`}
              id={id}
              account={account}
              disabled={locked}
              onAction={(id, action) => void run(() => recovery(id, action))}
            />
          ))}
          {history.ids.length > 5 && (
            <div className={styles.intentActions}>
              <button
                disabled={locked || page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous requests
              </button>
              <button
                disabled={locked || (page + 1) * 5 >= history.ids.length}
                onClick={() => setPage(page + 1)}
              >
                Next requests
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                if (!/^0x[\da-fA-F]{64}$/.test(importId) || !base || !remote)
                  throw Error("Enter a valid request ID.");
                const id = importId as Hash;
                await readRobinhoodIntent(base, remote, id, account);
                save(account, addRemoteId(history, id));
                setImportId("");
              });
            }}
          >
            <label htmlFor="rh-import">Recover a request</label>
            <input
              id="rh-import"
              placeholder="Request ID (0x…)"
              value={importId}
              onChange={(e) => setImportId(e.target.value)}
              disabled={locked}
            />
            <button disabled={locked || !importId}>Import request</button>
          </form>
        </div>
      )}
      <Dialog
        open={Boolean(review)}
        onOpenChange={(open) => {
          if (!open && !busy) setReview(null);
        }}
      >
        <DialogContent>
          <DialogTitle>
            {review?.action === "approve"
              ? "Approve USDG"
              : "Review Robinhood request"}
          </DialogTitle>
          <DialogDescription>
            {review?.action === "approve"
              ? "Approve only the entered USDG amount for the Syncrate engine. This does not mint SGLD."
              : "Your request settles through Base. It is not an instant swap. After confirmation, send the request and settlement reply using the controls below."}
          </DialogDescription>
          {review && (
            <>
              <p>
                {formatUnits(review.amount, review.mode === "mint" ? 6 : 18)}{" "}
                {review.mode === "mint" ? "USDG" : "SGLD"}
              </p>
              {review.action !== "approve" && (
                <p>
                  Minimum receive:{" "}
                  {formatUnits(review.minimum, review.mode === "mint" ? 18 : 6)}{" "}
                  {review.mode === "mint" ? "SGLD" : "USDG"}
                </p>
              )}
              <p className={styles.error} role="status">
                {error}
              </p>
              <Button disabled={busy} onClick={() => void run(confirm)}>
                {busy ? "Please wait…" : "Confirm in wallet"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(dispatchReview)}
        onOpenChange={(open) => {
          if (!open && !busy) setDispatchReview(null);
        }}
      >
        <DialogContent>
          <DialogTitle>Send cross-chain message</DialogTitle>
          <DialogDescription>
            This pays the message delivery fee on{" "}
            {dispatchReview?.chainId === 8453 ? "Base" : "Robinhood"}. It does
            not create a new mint or redemption request. Network gas is
            additional.
          </DialogDescription>
          {dispatchReview && (
            <>
              <p>
                Maximum message fee: {formatUnits(dispatchReview.fee, 18)} ETH.
                The endpoint refunds any excess to your wallet.
              </p>
              <p className={styles.error} role="status">
                {error}
              </p>
              <Button
                disabled={busy}
                onClick={() =>
                  void run(() =>
                    recovery(dispatchReview.id, dispatchReview.action, true),
                  )
                }
              >
                {busy ? "Please wait…" : "Confirm in wallet"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
