// Owner-operated only: encrypted keystore signing stays in the local terminal.
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import {
  createPublicClient,
  http,
  isAddress,
  recoverMessageAddress,
} from "viem";
import { base } from "viem/chains";
import { stakingAbi } from "../features/staking/abi";
import { STAKING_ADDRESS } from "../features/staking/deployment";
import {
  encodeInvitation,
  invitationMessage,
} from "../features/staking/invite";

if (!process.stdin.isTTY)
  throw Error(
    "Run this yourself in an interactive terminal. Do not use CI or an agent session.",
  );
const terminal = createInterface({
  input: process.stdin,
  output: process.stdout,
});
try {
  const wallet = (
    await terminal.question("Recipient public wallet address: ")
  ).trim();
  if (!isAddress(wallet, { strict: false }))
    throw Error("Invalid recipient address.");
  const alias =
    (
      await terminal.question(
        "Encrypted Foundry account alias [syncrate-deployer]: ",
      )
    ).trim() || "syncrate-deployer";
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(alias))
    throw Error("Use a local account alias.");
  const client = createPublicClient({
    chain: base,
    transport: http("https://mainnet.base.org"),
  });
  if ((await client.getChainId()) !== 8453) throw Error("Wrong chain.");
  const admin = await client.readContract({
    address: STAKING_ADDRESS,
    abi: stakingAbi,
    functionName: "defaultAdmin",
  });
  const issued = Math.floor(Date.now() / 1000);
  const invitation = {
    v: 1 as const,
    wallet,
    issued,
    expires: issued + 30 * 86400,
    nonce: randomBytes(16).toString("hex"),
  };
  console.log(
    "Signing a 30-day website invitation. No token approval or onchain transaction.",
  );
  terminal.close();
  const result = spawnSync(
    "cast",
    ["wallet", "sign", "--account", alias, invitationMessage(invitation)],
    {
      encoding: "utf8",
      stdio: ["inherit", "pipe", "inherit"],
      windowsHide: true,
    },
  );
  const signature = result.stdout?.match(/0x[0-9a-fA-F]{130}/)?.[0] as
    `0x${string}` | undefined;
  if (
    result.status !== 0 ||
    !signature ||
    (
      await recoverMessageAddress({
        message: invitationMessage(invitation),
        signature,
      })
    ).toLowerCase() !== admin.toLowerCase()
  )
    throw Error(
      "Signing failed or the account does not match the current staking admin.",
    );
  console.log(
    "Keep the following invite private. Give it only to the recipient, who must connect the matching wallet:",
  );
  console.log(encodeInvitation({ ...invitation, signature }));
} finally {
  terminal.close();
}
