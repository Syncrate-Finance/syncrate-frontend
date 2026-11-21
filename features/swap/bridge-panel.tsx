"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  useAccount,
  useConfig,
  usePublicClient,
  useSendTransaction,
} from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  encodeFunctionData,
  erc20Abi,
  formatUnits,
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
import { isMintChain } from "@/config/networks";
import { parseAmount, displayAmount } from "./model";
import { RECEIVE_OPTIONS, rhAbi } from "./robinhood-model";
import {
  bridgeAbi,
  bridgeContract,
  bridgeToken,
  bridgeTarget,
  bridgeNetwork,
  readBridgeSnapshot,
  readBridgeTransfer,
  decodeBridgeStore,
  bridgeStoreKey,
  type BridgeStore,
  type SavedBridge,
  type BridgeChain,
} from "./bridge-model";
import styles from "./swap.module.css";
type Review = { owner: Address; chainId: BridgeChain; amount: bigint } & (
  | { action: "approve" | "bridge" }
  | { action: "dispatch"; hash: Hash; fee: bigint }
);
function Transfer({
  item,
  owner,
  busy,
  onSend,
}: {
  item: SavedBridge;
  owner: Address;
  busy: boolean;
  onSend: () => void;
}) {
  const base = usePublicClient({ chainId: 8453 }),
    remote = usePublicClient({ chainId: 4663 });
  const q = useQuery({
    queryKey: ["sgld-bridge", owner.toLowerCase(), item.chainId, item.hash],
    queryFn: () =>
      readBridgeTransfer(
        item.chainId === 8453 ? base! : remote!,
        item.chainId === 8453 ? remote! : base!,
        item.chainId,
        item.hash,
        owner,
      ),
    enabled: Boolean(base && remote),
    refetchInterval: 15000,
    retry: 1,
  });
  return (
    <article className={styles.intent}>
      <div>
        <strong>
          {bridgeNetwork(item.chainId)} →{" "}
          {bridgeNetwork(bridgeTarget(item.chainId))}
        </strong>
        <a
          href={`${item.chainId === 8453 ? "https://basescan.org" : "https://robinhoodchain.blockscout.com"}/tx/${item.hash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View transaction ↗
        </a>
      </div>
      <p role="status">
        {q.isError
          ? "Transfer not verified. Check confirmation, source network and wallet."
          : q.data?.delivered
            ? `${displayAmount(q.data.amount, 18)} SGLD delivered`
            : q.data
              ? `${displayAmount(q.data.amount, 18)} SGLD committed; delivery pending`
              : "Checking transfer…"}
      </p>
      {q.data && !q.isError && !q.data.delivered && (
        <button disabled={busy} onClick={onSend}>
          Review delivery fee / retry
        </button>
      )}
    </article>
  );
}
export function BridgePanel() {
  const wallet = useAccount(),
    config = useConfig(),
    queries = useQueryClient();
  const account = wallet.isConnected ? wallet.address : undefined;
  const chainId = isMintChain(wallet.chainId) ? wallet.chainId : 8453;
  const base = usePublicClient({ chainId: 8453 }),
    remote = usePublicClient({ chainId: 4663 });
  const { sendTransactionAsync } = useSendTransaction();
  const [open, setOpen] = useState(false),
    [input, setInput] = useState(""),
    [importHash, setImportHash] = useState("");
  const [saved, setSaved] = useState<{
    owner: Address;
    value: BridgeStore;
  } | null>(null);
  const [review, setReview] = useState<Review | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const busyRef = useRef(false),
    ownerRef = useRef(account);
  ownerRef.current = account;
  const history =
    saved?.owner.toLowerCase() === account?.toLowerCase() ? saved?.value : null;
  useEffect(() => {
    setReview(null);
    setInput("");
    setMessage("");
    setError("");
    if (!account) {
      setSaved(null);
      return;
    }
    try {
      const value = decodeBridgeStore(
        localStorage.getItem(bridgeStoreKey(account)),
      );
      localStorage.setItem(bridgeStoreKey(account), JSON.stringify(value));
      setSaved({ owner: account, value });
    } catch {
      setSaved(null);
      setError(
        "Browser storage unavailable. Enable storage to preserve recovery details before bridging.",
      );
    }
  }, [account]);
  useEffect(() => setReview(null), [wallet.chainId]);
  const snap = useQuery({
    queryKey: ["bridge-snapshot", chainId, account],
    queryFn: () => readBridgeSnapshot(base!, remote!, chainId, account!),
    enabled:
      open && Boolean(base && remote && account) && isMintChain(wallet.chainId),
    refetchInterval: open ? 15000 : false,
    retry: 1,
  });
  function guard(owner: Address, chain: BridgeChain) {
    const c = config.state.current
      ? config.state.connections.get(config.state.current)
      : undefined;
    if (
      config.state.status !== "connected" ||
      c?.accounts[0]?.toLowerCase() !== owner.toLowerCase() ||
      c.chainId !== chain
    )
      throw Error(
        "Wallet changed. Select the source network in your wallet and review again.",
      );
  }
  function save(owner: Address, value: BridgeStore) {
    if (ownerRef.current?.toLowerCase() === owner.toLowerCase())
      setSaved({ owner, value });
    try {
      localStorage.setItem(bridgeStoreKey(owner), JSON.stringify(value));
    } catch {
      setError(
        "Recovery could not be saved. Keep the transaction hash shown here before leaving.",
      );
    }
  }
  async function refresh() {
    await Promise.all([
      queries.invalidateQueries({ queryKey: ["bridge-snapshot"] }),
      queries.invalidateQueries({ queryKey: ["sgld-bridge"] }),
      queries.invalidateQueries({ queryKey: ["sgld-snapshot"] }),
    ]);
  }
  async function run(task: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (e) {
      const text = e instanceof Error ? e.message : "";
      setError(
        /^(Enter|Use at most|Amount|Wallet changed|Insufficient|Bridge|This |Contract |Delivery |Transaction |Add ETH|Select )/.test(
          text,
        )
          ? text.split("\n")[0].slice(0, 220)
          : /rejected|denied/i.test(text)
            ? "Request cancelled in your wallet."
            : "Bridge step unavailable. Refresh and inspect existing transactions before retrying.",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function finish(
    owner: Address,
    prior: BridgeStore,
    pending: NonNullable<BridgeStore["pending"]>,
  ) {
    const source = pending.chainId === 8453 ? base : remote;
    if (!source || !base || !remote) throw Error("Select a supported network.");
    let changed = false;
    const receipt = await source.waitForTransactionReceipt({
      hash: pending.hash,
      confirmations: pending.chainId === 8453 ? 2 : 20,
      timeout: 120000,
      onReplaced: (r) => {
        changed = r.reason !== "repriced";
        pending = { ...pending, hash: r.transaction.hash };
        save(owner, { ...prior, pending });
      },
    });
    let next: BridgeStore = { ...prior, pending: null };
    if (receipt.status !== "success" || changed) {
      save(owner, next);
      throw Error(
        "Transaction reverted or replaced. Check its explorer details before continuing.",
      );
    }
    if (pending.action === "bridge") {
      // Save the confirmed hash even if a later RPC read fails. It can be imported again.
      next = {
        ...next,
        transfers: [
          { chainId: pending.chainId, hash: receipt.transactionHash },
          ...next.transfers.filter((x) => x.hash !== receipt.transactionHash),
        ].slice(0, 20),
      };
      save(owner, next);
      await readBridgeTransfer(
        source,
        pending.chainId === 8453 ? remote : base,
        pending.chainId,
        receipt.transactionHash,
        owner,
      );
    }
    save(owner, next);
    setMessage(
      "Transaction confirmed. A bridge completes only when its destination status shows delivered.",
    );
    await refresh();
  }
  async function send(r: Review, to: Address, data: Hex, value = 0n) {
    if (!base || !remote || !history)
      throw Error("Select a supported network.");
    guard(r.owner, r.chainId);
    // Recheck both deployed identities immediately before every signature.
    await readBridgeSnapshot(base, remote, r.chainId, r.owner);
    guard(r.owner, r.chainId);
    const source = r.chainId === 8453 ? base : remote;
    await source.call({ account: r.owner, to, data, value });
    const [gas, fee, balance] = await Promise.all([
      source.estimateGas({ account: r.owner, to, data, value }),
      source.estimateFeesPerGas(),
      source.getBalance({ address: r.owner }),
    ]);
    const gasLimit = (gas * 120n) / 100n;
    if (balance < value + gasLimit * fee.maxFeePerGas)
      throw Error(
        `Add ETH on ${bridgeNetwork(r.chainId)} for delivery and network gas.`,
      );
    guard(r.owner, r.chainId);
    const hash = await sendTransactionAsync({
      account: r.owner,
      chainId: r.chainId,
      to,
      data,
      value,
      gas: gasLimit,
      maxFeePerGas: fee.maxFeePerGas,
      maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
    });
    const pending = { chainId: r.chainId, hash, action: r.action };
    save(r.owner, { ...history, pending });
    setReview(null);
    setMessage(`Submitted ${hash}. Keep this hash for recovery.`);
    await finish(r.owner, history, pending);
  }
  async function prepare() {
    if (!account || !history || !base || !remote) return;
    guard(account, chainId);
    const amount = parseAmount(input, 18);
    if (amount <= 0n) throw Error("Enter an SGLD amount.");
    const fresh = await readBridgeSnapshot(base, remote, chainId, account);
    guard(account, chainId);
    if (fresh.paused) throw Error("Bridge transfers are not open yet.");
    if (fresh.balance < amount) throw Error("Insufficient SGLD balance.");
    setReview({
      owner: account,
      chainId,
      amount,
      action:
        chainId === 8453 && fresh.allowance < amount ? "approve" : "bridge",
    });
  }
  async function prepareDelivery(item: SavedBridge) {
    if (!account || !base || !remote) return;
    guard(account, item.chainId);
    const source = item.chainId === 8453 ? base : remote;
    const transfer = await readBridgeTransfer(
      source,
      item.chainId === 8453 ? remote : base,
      item.chainId,
      item.hash,
      account,
    );
    if (transfer.delivered) throw Error("Bridge already delivered.");
    const fee = await source.readContract({
      address: bridgeContract(item.chainId),
      abi: rhAbi,
      functionName: "quoteDispatch",
      args: [transfer.messageId, RECEIVE_OPTIONS],
    });
    guard(account, item.chainId);
    setReview({
      owner: account,
      chainId: item.chainId,
      amount: transfer.amount,
      action: "dispatch",
      hash: item.hash,
      fee: (fee.nativeFee * 110n) / 100n,
    });
  }
  async function confirm() {
    const r = review;
    if (!r || !base || !remote) return;
    guard(r.owner, r.chainId);
    const source = r.chainId === 8453 ? base : remote;
    if (r.action === "dispatch") {
      const t = await readBridgeTransfer(
        source,
        r.chainId === 8453 ? remote : base,
        r.chainId,
        r.hash,
        r.owner,
      );
      if (t.delivered) throw Error("Bridge already delivered.");
      const fee = await source.readContract({
        address: bridgeContract(r.chainId),
        abi: rhAbi,
        functionName: "quoteDispatch",
        args: [t.messageId, RECEIVE_OPTIONS],
      });
      if (fee.nativeFee > r.fee)
        throw Error("Delivery fee increased. Review a new quote.");
      await send(
        r,
        bridgeContract(r.chainId),
        encodeFunctionData({
          abi: rhAbi,
          functionName: "dispatch",
          args: [t.messageId, RECEIVE_OPTIONS],
        }),
        r.fee,
      );
      return;
    }
    const fresh = await readBridgeSnapshot(base, remote, r.chainId, r.owner);
    if (fresh.paused || fresh.balance < r.amount)
      throw Error("Bridge availability or balance changed. Review again.");
    if (r.action === "approve")
      await send(
        r,
        bridgeToken(r.chainId),
        encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [bridgeContract(r.chainId), r.amount],
        }),
      );
    else {
      if (r.chainId === 8453 && fresh.allowance < r.amount)
        throw Error("Bridge approval changed. Review again.");
      await send(
        r,
        bridgeContract(r.chainId),
        encodeFunctionData({
          abi: bridgeAbi,
          functionName:
            r.chainId === 8453 ? "bridgeToRobinhood" : "bridgeToBase",
          args: [r.amount, r.owner],
        }),
      );
    }
  }
  const locked = busy || Boolean(history?.pending);
  const currentReview =
    review &&
    review.owner.toLowerCase() === account?.toLowerCase() &&
    review.chainId === wallet.chainId
      ? review
      : null;
  return (
    <details
      className={styles.panel}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className={styles.bridgeSummary}>
        Bridge SGLD <span>Base ↔ Robinhood</span>
      </summary>
      {open && (
        <div>
          <p className={styles.note}>
            Move existing SGLD to the same wallet on{" "}
            {bridgeNetwork(bridgeTarget(chainId))}. Choose your source network
            inside the wallet menu. Bridging commits your SGLD first; send the
            delivery message separately. ETH pays gas and messaging.
          </p>
          {!isMintChain(wallet.chainId) ? (
            <WalletControl compact requiredChainId={null} />
          ) : (
            <>
              <div className={styles.amountBox}>
                <div>
                  <label htmlFor="bridge-amount">
                    From {bridgeNetwork(chainId)}
                  </label>
                  <span className={styles.token}>
                    <Image src="/SGLD-icon.png" width={22} height={22} alt="" />
                    SGLD
                  </span>
                </div>
                <input
                  id="bridge-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setReview(null);
                  }}
                  disabled={locked}
                />
                <small>
                  Balance:{" "}
                  {snap.data && !snap.isError
                    ? displayAmount(snap.data.balance, 18)
                    : "—"}{" "}
                  SGLD
                </small>
              </div>
              <p className={styles.note}>
                {snap.data?.paused
                  ? "Bridge transfers are not open yet."
                  : snap.isError
                    ? "Live balance unavailable. Refresh before continuing."
                    : `Receive the same SGLD amount on ${bridgeNetwork(bridgeTarget(chainId))}.`}
              </p>
              <Button
                className={styles.action}
                disabled={
                  locked ||
                  !history ||
                  !input ||
                  !snap.data ||
                  snap.isError ||
                  snap.data.paused
                }
                onClick={() => void run(prepare)}
              >
                Review bridge
              </Button>
            </>
          )}
          <p className={styles.error} role="status">
            {error}
          </p>
          <p className={styles.message} role="status">
            {message}
          </p>
          {history?.pending && account && (
            <div className={styles.queue}>
              <p>
                Pending transaction: <code>{history.pending.hash}</code>
              </p>
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
          {history && account && (
            <div className={styles.queue}>
              <h3>Your transfers</h3>
              <p className={styles.note}>
                Saved for this wallet in this browser. Switch to a transfer's
                source network in Reown to send or retry it.
              </p>
              {history.transfers.map((item) => (
                <Transfer
                  key={`${item.chainId}:${item.hash}`}
                  item={item}
                  owner={account}
                  busy={locked}
                  onSend={() => void run(() => prepareDelivery(item))}
                />
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    if (
                      !base ||
                      !remote ||
                      !isMintChain(wallet.chainId) ||
                      !/^0x[\da-f]{64}$/i.test(importHash)
                    )
                      throw Error("Enter a valid source transaction hash.");
                    const item = {
                      chainId: wallet.chainId,
                      hash: importHash as Hash,
                    };
                    await readBridgeTransfer(
                      item.chainId === 8453 ? base : remote,
                      item.chainId === 8453 ? remote : base,
                      item.chainId,
                      item.hash,
                      account,
                    );
                    save(account, {
                      ...history,
                      transfers: [
                        item,
                        ...history.transfers.filter(
                          (t) => t.hash !== item.hash,
                        ),
                      ].slice(0, 20),
                    });
                    setImportHash("");
                  });
                }}
              >
                <label htmlFor="bridge-import">
                  Recover a bridge from {bridgeNetwork(chainId)}
                </label>
                <input
                  id="bridge-import"
                  placeholder="Source transaction hash (0x…)"
                  value={importHash}
                  onChange={(e) => setImportHash(e.target.value)}
                  disabled={locked}
                />
                <button disabled={locked || !importHash}>
                  Import transfer
                </button>
              </form>
            </div>
          )}
        </div>
      )}
      <Dialog
        open={Boolean(currentReview)}
        onOpenChange={(v) => {
          if (!v && !busy) setReview(null);
        }}
      >
        <DialogContent>
          <DialogTitle>
            {currentReview?.action === "approve"
              ? "Approve SGLD"
              : currentReview?.action === "dispatch"
                ? "Send bridge message"
                : "Review SGLD bridge"}
          </DialogTitle>
          <DialogDescription>
            {currentReview?.action === "approve"
              ? "Approve only this SGLD amount. You will review a separate bridge transaction afterward."
              : currentReview?.action === "dispatch"
                ? "Pay for this existing transfer's delivery. Retrying does not create another transfer; a message fee is charged again."
                : "Your SGLD is locked on Base or burned on Robinhood. Destination settlement requires a separate fee-funded message; it is not immediate."}
          </DialogDescription>
          {currentReview && (
            <>
              <p>
                {formatUnits(currentReview.amount, 18)} SGLD ·{" "}
                {bridgeNetwork(currentReview.chainId)} →{" "}
                {bridgeNetwork(bridgeTarget(currentReview.chainId))}
              </p>
              {currentReview.action === "dispatch" && (
                <p>
                  Maximum message fee: {formatUnits(currentReview.fee, 18)} ETH.
                  Unused message value returns to your wallet. Network gas is
                  additional.
                </p>
              )}
              <p role="status" className={styles.error}>
                {error}
              </p>
              <Button disabled={busy} onClick={() => void run(confirm)}>
                {busy ? "Please wait…" : "Confirm in wallet"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </details>
  );
}
