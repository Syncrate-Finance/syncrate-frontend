"use client";
import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useConfig,
  usePublicClient,
  useWriteContract,
} from "wagmi";
import { erc20Abi, type Address, type Hash } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { stakingAbi } from "./abi";
import { STAKING_ADDRESS } from "./deployment";
import { checkStakingAccess } from "./access";
import { readStakingSnapshot } from "./read";
import { hasStakeReceipt, type StakeAction } from "./transactions";

type Pending = { hash: Hash; account: Address; action: StakeAction };
const storageKey = "syncrate-staking-pending-v1";
export function useStakingTransactions() {
  const wallet = useAccount();
  const config = useConfig();
  const client = usePublicClient({ chainId: 8453 });
  const cache = useQueryClient();
  const { writeContractAsync } = useWriteContract();
  const active = useRef(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [review, setReview] = useState<{
    account: Address;
    action: StakeAction;
  } | null>(null);
  useEffect(() => {
    setReview(null);
    setError("");
    setMessage("");
  }, [wallet.address, wallet.chainId]);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return;
      const value = JSON.parse(raw, (key, item) =>
        ["amount", "id"].includes(key) &&
        typeof item === "string" &&
        /^\d+$/.test(item)
          ? BigInt(item)
          : key === "epochs" &&
              Array.isArray(item) &&
              item.every((v) => typeof v === "string" && /^\d+$/.test(v))
            ? item.map(BigInt)
            : item,
      );
      if (
        /^0x[0-9a-fA-F]{64}$/.test(value.hash) &&
        /^0x[0-9a-fA-F]{40}$/.test(value.account) &&
        ["approve", "reset", "stake", "withdraw", "restake", "claim"].includes(
          value.action?.kind,
        )
      )
        setPending(value);
    } catch {
      /* Malformed or disabled storage never authorizes a transaction. */
    }
  }, []);
  function remember(value: Pending | null) {
    setPending(value);
    try {
      if (value)
        sessionStorage.setItem(
          storageKey,
          JSON.stringify(value, (_, v) =>
            typeof v === "bigint" ? v.toString() : v,
          ),
        );
      else sessionStorage.removeItem(storageKey);
    } catch {
      /* Keep in-memory tracking. */
    }
  }
  function guard(account: Address) {
    const c = config.state.current
      ? config.state.connections.get(config.state.current)
      : undefined;
    if (
      config.state.status !== "connected" ||
      c?.chainId !== 8453 ||
      c.accounts[0]?.toLowerCase() !== account.toLowerCase()
    )
      throw Error("Wallet changed. Connect the original wallet on Base.");
  }
  async function finish(value: Pending) {
    if (!client) return;
    let replaced = false;
    const receipt = await client.waitForTransactionReceipt({
      hash: value.hash,
      confirmations: 2,
      timeout: 120000,
      onReplaced: (e) => {
        remember({ ...value, hash: e.transaction.hash });
        if (e.reason !== "repriced") replaced = true;
      },
    });
    remember(null);
    if (receipt.status !== "success")
      throw Error("Transaction reverted. Check its details before retrying.");
    if (replaced)
      setMessage("Transaction replaced. Check the result on BaseScan.");
    else if (value.action.kind === "stake")
      setMessage(
        hasStakeReceipt(
          receipt,
          value.account,
          value.action.amount,
          value.action.term,
        )
          ? "Your SGLD stake is confirmed."
          : "Transaction confirmed. Check its result on BaseScan.",
      );
    else
      setMessage(
        value.action.kind === "approve" || value.action.kind === "reset"
          ? "Approval confirmed. Review the next step to continue."
          : "Transaction confirmed. Your positions are refreshing.",
      );
    await cache.invalidateQueries({ queryKey: ["staking"] });
    await cache.invalidateQueries({ queryKey: ["sgld-snapshot"] });
    await cache.invalidateQueries({ queryKey: ["public-homepage-metrics"] });
  }
  async function confirm() {
    if (!review || !client || active.current || pending) return;
    active.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    let submitted = false;
    try {
      const { account, action } = review;
      guard(account);
      const snapshot = await readStakingSnapshot(client, account);
      guard(account);
      if (snapshot.ethBalance === 0n)
        throw Error("Add ETH on Base for network fees.");
      if (["approve", "reset", "stake", "restake"].includes(action.kind)) {
        const access = await checkStakingAccess(account);
        guard(account);
        if (!access.allowed)
          throw Error("Unlock staking with your invite code first.");
        if (snapshot.paused) throw Error("Deposits are currently paused.");
      }
      let hash: Hash;
      if ("amount" in action) {
        if (action.amount < 10n ** 18n || action.amount > snapshot.balance)
          throw Error("Refresh your amount and SGLD balance.");
        if (action.kind === "stake") {
          if (snapshot.allowance < action.amount)
            throw Error("Approve this SGLD amount first.");
          const simulation = await client.simulateContract({
            address: STAKING_ADDRESS,
            abi: stakingAbi,
            functionName: "stake",
            args: [action.amount, BigInt(action.term)],
            account,
          });
          guard(account);
          hash = await writeContractAsync({
            ...simulation.request,
            chainId: 8453,
          });
        } else {
          const simulation = await client.simulateContract({
            address: CONTRACT_ADDRESSES.SGLD_TOKEN,
            abi: erc20Abi,
            functionName: "approve",
            args: [
              STAKING_ADDRESS,
              action.kind === "reset" ? 0n : action.amount,
            ],
            account,
          });
          if (simulation.result === false) throw Error("Approval unavailable.");
          guard(account);
          hash = await writeContractAsync({
            ...simulation.request,
            chainId: 8453,
          });
        }
      } else if (action.kind === "withdraw") {
        const simulation = await client.simulateContract({
          address: STAKING_ADDRESS,
          abi: stakingAbi,
          functionName: "withdraw",
          args: [action.id, []],
          account,
        });
        guard(account);
        hash = await writeContractAsync({
          ...simulation.request,
          chainId: 8453,
        });
      } else if (action.kind === "restake") {
        const simulation = await client.simulateContract({
          address: STAKING_ADDRESS,
          abi: stakingAbi,
          functionName: "restake",
          args: [action.id, BigInt(action.term)],
          account,
        });
        guard(account);
        hash = await writeContractAsync({
          ...simulation.request,
          chainId: 8453,
        });
      } else {
        if (!action.epochs.length || action.epochs.length > 32)
          throw Error("Choose up to 32 reward periods.");
        const simulation = await client.simulateContract({
          address: STAKING_ADDRESS,
          abi: stakingAbi,
          functionName: "claim",
          args: [action.id, action.epochs],
          account,
        });
        guard(account);
        hash = await writeContractAsync({
          ...simulation.request,
          chainId: 8453,
        });
      }
      submitted = true;
      const value = { hash, account, action };
      remember(value);
      setReview(null);
      await finish(value);
    } catch (e) {
      setError(
        submitted
          ? "Confirmation is pending. Check the transaction before submitting again."
          : e instanceof Error &&
              /^(Wallet changed|Add ETH|Unlock staking|Deposits are|Refresh your|Approve this|Choose up)/.test(
                e.message,
              )
            ? e.message
            : "Request not completed. Check your wallet and retry.",
      );
    } finally {
      active.current = false;
      setBusy(false);
    }
  }
  return {
    busy,
    pending,
    review,
    message,
    error,
    confirm,
    setReview,
    request: (action: StakeAction) => {
      if (
        wallet.address &&
        wallet.chainId === 8453 &&
        !active.current &&
        !pending
      ) {
        setError("");
        setReview({ account: wallet.address, action });
      }
    },
    retry: async () => {
      if (!pending || busy) return;
      setBusy(true);
      try {
        await finish(pending);
        setError("");
      } catch {
        setError("Confirmation still pending. Check BaseScan before retrying.");
      } finally {
        setBusy(false);
      }
    },
  };
}
