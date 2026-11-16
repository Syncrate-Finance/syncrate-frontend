import { test } from "node:test";
import assert from "node:assert/strict";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  recoverMessageAddress,
  encodeEventTopics,
  encodeAbiParameters,
  type TransactionReceipt,
} from "viem";
import {
  decodeInvitation,
  encodeInvitation,
  invitationMessage,
} from "../../features/staking/invite";
import { STAKING_ADDRESS } from "../../features/staking/deployment";
import {
  depositQuote,
  hasStakeReceipt,
} from "../../features/staking/transactions";
const wallet = "0x1111111111111111111111111111111111111111" as const;
const issued = Math.floor(Date.now() / 1000);
const invitation = {
  v: 1 as const,
  wallet,
  issued,
  expires: issued + 86400,
  nonce: "ab".repeat(16),
};

test("wallet-specific invitation signatures bind recipient, expiry, origin and deployment", async () => {
  const signer = privateKeyToAccount(generatePrivateKey());
  const signature = await signer.signMessage({
    message: invitationMessage(invitation),
  });
  const parsed = decodeInvitation(
    encodeInvitation({ ...invitation, signature }),
    issued,
  );
  assert.equal(
    await recoverMessageAddress({
      message: invitationMessage(parsed),
      signature,
    }),
    signer.address,
  );
  assert.notEqual(
    await recoverMessageAddress({
      message: invitationMessage({
        ...parsed,
        wallet: "0x2222222222222222222222222222222222222222",
      }),
      signature,
    }),
    signer.address,
  );
  assert.notEqual(
    await recoverMessageAddress({
      message: invitationMessage({ ...parsed, expires: parsed.expires + 1 }),
      signature,
    }),
    signer.address,
  );
  assert.ok(invitationMessage(invitation).includes(STAKING_ADDRESS));
  assert.ok(invitationMessage(invitation).includes("https://app.syncrate.org"));
});
test("malformed, future, oversized and expired invitation payloads fail closed", () => {
  const signature = ("0x" + "11".repeat(65)) as `0x${string}`;
  for (const value of [
    "bad",
    "SYNC1." + "A".repeat(2049),
    encodeInvitation({ ...invitation, signature, expires: issued }),
    encodeInvitation({ ...invitation, signature, issued: issued + 100 }),
    encodeInvitation({
      ...invitation,
      signature,
      expires: issued + 31 * 86400,
    }),
  ])
    assert.throws(() => decodeInvitation(value, issued));
});
test("gross deposits mint only net receipt principal with integer fee rounding", () => {
  assert.deepEqual(depositQuote(100n * 10n ** 18n), {
    fee: 25n * 10n ** 16n,
    principal: 9975n * 10n ** 16n,
  });
  assert.deepEqual(depositQuote(10n ** 18n), {
    fee: 25n * 10n ** 14n,
    principal: 9975n * 10n ** 14n,
  });
});
test("a successful receipt requires the exact deployed staking event, account and net amount", () => {
  const amount = 10n ** 18n;
  const log = {
    address: STAKING_ADDRESS,
    topics: encodeEventTopics({
      abi: [
        {
          type: "event",
          name: "Staked",
          inputs: [
            { name: "owner", type: "address", indexed: true },
            { name: "positionId", type: "uint256", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
            { name: "maturesAt", type: "uint256", indexed: false },
          ],
        },
      ],
      eventName: "Staked",
      args: { owner: wallet, positionId: 0n },
    }),
    data: encodeAbiParameters(
      [{ type: "uint256" }, { type: "uint256" }],
      [depositQuote(amount).principal, 1800000000n],
    ),
  };
  const receipt = {
    status: "success",
    logs: [log],
  } as unknown as TransactionReceipt;
  assert.equal(hasStakeReceipt(receipt, wallet, amount, 30), true);
  assert.equal(hasStakeReceipt(receipt, wallet, amount + 100000n, 30), false);
  assert.equal(
    hasStakeReceipt({ ...receipt, status: "reverted" }, wallet, amount, 30),
    false,
  );
  assert.equal(
    hasStakeReceipt({ ...receipt, logs: [] }, wallet, amount, 30),
    false,
  );
});
