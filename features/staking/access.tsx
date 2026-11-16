"use client";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAddress } from "viem";
import { Button } from "@/components/ui/button";
import { WalletControl } from "@/features/dashboard/shell";
import { encodeInvitation, invitationMessage } from "./invite";
import styles from "./staking.module.css";

export type AccessState = { allowed: boolean; admin: string; paused: boolean };
export async function checkStakingAccess(wallet: string): Promise<AccessState> {
  const response = await fetch(`/api/v1/staking/access?wallet=${wallet}`, {
    cache: "no-store",
  });
  if (!response.ok) throw Error("Access verification is unavailable.");
  return response.json();
}
export function useStakingAccess() {
  const wallet = useAccount();
  const address = wallet.isConnected ? wallet.address : undefined;
  return useQuery({
    queryKey: ["staking-access", address?.toLowerCase()],
    queryFn: () => checkStakingAccess(address!),
    enabled: !!address,
    staleTime: 0,
    refetchInterval: 30000,
    retry: 1,
  });
}
export function InviteGate() {
  const wallet = useAccount();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setCode("");
    setError("");
  }, [wallet.address]);
  return (
    <section className={styles.formCard} aria-labelledby="invite-title">
      <h2 id="invite-title">Your invitation to sySGLD</h2>
      <p className={styles.formIntro}>
        Connect the wallet your invite was issued for, then enter your code to
        unlock staking.
      </p>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (!wallet.address || busy) return;
          setBusy(true);
          setError("");
          try {
            const response = await fetch(
              `/api/v1/staking/access?wallet=${wallet.address}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
              },
            );
            const data = await response.json();
            if (!response.ok) throw Error(data.error || "Invite unavailable.");
            setCode("");
            await queryClient.invalidateQueries({
              queryKey: ["staking-access"],
            });
          } catch (e) {
            setError(e instanceof Error ? e.message : "Please retry.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label htmlFor="staking-invite">Invite code</label>
        <textarea
          className={styles.inviteInput}
          id="staking-invite"
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
          maxLength={2048}
          autoComplete="off"
          spellCheck={false}
        />
        {error && (
          <p role="alert" className={styles.amountError}>
            {error}
          </p>
        )}
        <Button
          type="submit"
          className={styles.stakeButton}
          disabled={!wallet.address || wallet.chainId !== 8453 || !code || busy}
        >
          {busy ? "Checking invite…" : "Unlock staking"}
        </Button>
        <div className={styles.connect}>
          <WalletControl compact />
        </div>
      </form>
    </section>
  );
}
export function InviteIssuer({ admin }: { admin: string }) {
  const wallet = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [recipient, setRecipient] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setCode("");
    setRecipient("");
    setError("");
  }, [wallet.address]);
  if (wallet.address?.toLowerCase() !== admin.toLowerCase()) return null;
  return (
    <section className={styles.positions} aria-labelledby="invite-admin-title">
      <h2 id="invite-admin-title">Create a wallet invitation</h2>
      <p className={styles.formIntro}>
        Admin only. Each code unlocks one wallet for 30 days. Signing creates an
        invitation and moves no tokens. Keep codes private. They expire
        automatically; individual early revocation is not supported.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            busy ||
            !isAddress(recipient, { strict: false }) ||
            wallet.chainId !== 8453
          )
            return;
          setBusy(true);
          setError("");
          setCode("");
          try {
            const current = await checkStakingAccess(wallet.address!);
            if (current.admin.toLowerCase() !== wallet.address?.toLowerCase())
              throw Error("Admin wallet changed.");
            const issued = Math.floor(Date.now() / 1000);
            const invite = {
              v: 1 as const,
              wallet: recipient as `0x${string}`,
              issued,
              expires: issued + 30 * 86400,
              nonce: Array.from(
                crypto.getRandomValues(new Uint8Array(16)),
                (b) => b.toString(16).padStart(2, "0"),
              ).join(""),
            };
            const signature = await signMessageAsync({
              account: wallet.address,
              message: invitationMessage(invite),
            });
            setCode(encodeInvitation({ ...invite, signature }));
          } catch {
            setError(
              "Invitation was not created. Check your connected admin wallet and retry.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label htmlFor="invite-recipient">Recipient wallet</label>
        <input
          className={styles.inviteInput}
          id="invite-recipient"
          value={recipient}
          onChange={(e) => {
            setRecipient(e.target.value);
            setCode("");
          }}
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          type="submit"
          disabled={
            busy ||
            wallet.chainId !== 8453 ||
            !isAddress(recipient, { strict: false })
          }
        >
          {busy ? "Confirm in your wallet…" : "Sign invitation"}
        </Button>
      </form>
      {error && <p role="alert">{error}</p>}
      {code && (
        <>
          <label htmlFor="created-invite">
            Copy this code for the recipient
          </label>
          <textarea
            id="created-invite"
            className={styles.inviteInput}
            readOnly
            value={code}
            onFocus={(e) => e.target.select()}
          />
        </>
      )}
    </section>
  );
}
