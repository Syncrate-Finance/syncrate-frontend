import "server-only";
import { createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import {
  createPublicClient,
  http,
  isAddress,
  keccak256,
  type Address,
} from "viem";
import { base } from "viem/chains";
import { readServerEnvironment } from "@/server/environment";
import { stakingAbi } from "@/features/staking/abi";
import {
  STAKING_ADDRESS,
  STAKING_CODE_HASH,
} from "@/features/staking/deployment";
import { decodeInvitation, invitationMessage } from "@/features/staking/invite";

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org", {
    timeout: 8000,
    retryCount: 1,
  }),
});
export const privateHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
  "X-Content-Type-Options": "nosniff",
};
const cookieName =
  process.env.APP_ENV === "local" || process.env.APP_ENV === "test"
    ? "syncrate-staking-local"
    : "__Host-syncrate-staking";
function key() {
  return createHash("sha256")
    .update(
      "syncrate-staking-invite-v1:" + readServerEnvironment().PAYLOAD_SECRET,
    )
    .digest();
}
let cached: { admin: Address; paused: boolean; until: number } | undefined;
export async function stakingAccessState() {
  if (cached && cached.until > Date.now()) return cached;
  if ((await client.getChainId()) !== 8453) throw Error("Wrong access network");
  const blockNumber = await client.getBlockNumber({ cacheTime: 0 });
  const block = await client.getBlock({ blockNumber });
  const age = BigInt(Math.floor(Date.now() / 1000)) - block.timestamp;
  if (age < -60n || age > 180n) throw Error("Stale access network");
  const code = await client.getCode({ address: STAKING_ADDRESS, blockNumber });
  if (!code || keccak256(code) !== STAKING_CODE_HASH)
    throw Error("Unverified staking contract");
  const [admin, paused] = await Promise.all([
    client.readContract({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: "defaultAdmin",
      blockNumber,
    }),
    client.readContract({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: "paused",
      blockNumber,
    }),
  ]);
  cached = { admin, paused, until: Date.now() + 15000 };
  return cached;
}
async function sessionAllowed(request: Request, wallet: string, admin: string) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(cookieName + "="))
    ?.slice(cookieName.length + 1);
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, key(), {
      algorithms: ["HS256"],
      issuer: "syncrate-staking",
      audience: STAKING_ADDRESS,
    });
    return (
      payload.sub === wallet.toLowerCase() &&
      payload.admin === admin.toLowerCase()
    );
  } catch {
    return false;
  }
}
function response(body: unknown, status = 200, cookie?: string) {
  return Response.json(body, {
    status,
    headers: { ...privateHeaders, ...(cookie ? { "Set-Cookie": cookie } : {}) },
  });
}
export async function handleAccess(request: Request) {
  try {
    const wallet = new URL(request.url).searchParams.get("wallet");
    if (!wallet || !isAddress(wallet, { strict: false }))
      return response({ error: "Connect a wallet." }, 400);
    if (request.method === "POST") {
      const origin = request.headers.get("origin");
      const local = ["local", "test"].includes(process.env.APP_ENV ?? "");
      const preview =
        process.env.APP_ENV === "preview" &&
        [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL].some(
          (host) => host && origin === `https://${host}`,
        );
      if (
        origin !== "https://app.syncrate.org" &&
        !(local && origin === new URL(request.url).origin) &&
        !preview
      )
        return response({ error: "Origin denied." }, 403);
      if (!request.headers.get("content-type")?.startsWith("application/json"))
        return response({ error: "Use JSON." }, 415);
      const reader = request.body?.getReader();
      if (!reader) return response({ error: "Invite required." }, 400);
      let size = 0;
      const chunks: Uint8Array[] = [];
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > 4096) {
            await reader.cancel();
            return response({ error: "Invite too long." }, 413);
          }
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      let invite;
      try {
        const body = JSON.parse(new TextDecoder().decode(bytes));
        invite = decodeInvitation(body.code);
      } catch {
        return response({ error: "Invalid or expired invite code." }, 403);
      }
      if (invite.wallet.toLowerCase() !== wallet.toLowerCase())
        return response(
          { error: "This invite belongs to a different wallet." },
          403,
        );
      const state = await stakingAccessState();
      if (
        !(await client.verifyMessage({
          address: state.admin,
          message: invitationMessage(invite),
          signature: invite.signature,
        }))
      )
        return response({ error: "Invalid invite code." }, 403);
      const expires = Math.min(
        invite.expires,
        Math.floor(Date.now() / 1000) + 7 * 86400,
      );
      const token = await new SignJWT({ admin: state.admin.toLowerCase() })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(wallet.toLowerCase())
        .setIssuer("syncrate-staking")
        .setAudience(STAKING_ADDRESS)
        .setIssuedAt()
        .setExpirationTime(expires)
        .sign(key());
      const maxAge = expires - Math.floor(Date.now() / 1000);
      return response(
        { allowed: true, admin: state.admin, paused: state.paused },
        200,
        `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${local ? "" : "; Secure"}`,
      );
    }
    const state = await stakingAccessState();
    return response({
      allowed: await sessionAllowed(request, wallet, state.admin),
      admin: state.admin,
      paused: state.paused,
    });
  } catch {
    return response(
      { error: "Access verification is unavailable. Please retry." },
      503,
    );
  }
}
