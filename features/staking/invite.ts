import { isAddress, type Address, type Hex } from "viem";
import { STAKING_ADDRESS } from "./deployment";

export type Invitation = {
  v: 1;
  wallet: Address;
  issued: number;
  expires: number;
  nonce: string;
  signature: Hex;
};
export function invitationMessage(invite: Omit<Invitation, "signature">) {
  return [
    "Syncrate staking website invitation",
    "Website: https://app.syncrate.org",
    "Chain ID: 8453",
    `Contract: ${STAKING_ADDRESS}`,
    `Wallet: ${invite.wallet.toLowerCase()}`,
    `Issued: ${invite.issued}`,
    `Expires: ${invite.expires}`,
    `Invite: ${invite.nonce}`,
    "This unlocks website access only. It does not approve or move tokens.",
  ].join("\n");
}
export function encodeInvitation(invite: Invitation) {
  return (
    "SYNC1." +
    btoa(JSON.stringify(invite))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
  );
}
export function decodeInvitation(
  code: string,
  now = Math.floor(Date.now() / 1000),
): Invitation {
  if (code.length > 2048 || !/^SYNC1\.[A-Za-z0-9_-]+$/.test(code))
    throw Error("Invalid invitation");
  const invite = JSON.parse(
    atob(code.slice(6).replace(/-/g, "+").replace(/_/g, "/")),
  );
  if (
    !invite ||
    Object.keys(invite).sort().join(",") !==
      "expires,issued,nonce,signature,v,wallet" ||
    invite.v !== 1 ||
    !isAddress(invite.wallet, { strict: false }) ||
    !Number.isSafeInteger(invite.issued) ||
    !Number.isSafeInteger(invite.expires) ||
    invite.issued > now + 60 ||
    invite.expires <= now ||
    invite.expires <= invite.issued ||
    invite.expires - invite.issued > 30 * 86400 ||
    !/^[a-f0-9]{32}$/.test(invite.nonce) ||
    !/^0x[0-9a-fA-F]{130}$/.test(invite.signature)
  )
    throw Error("Invalid or expired invitation");
  return invite;
}
