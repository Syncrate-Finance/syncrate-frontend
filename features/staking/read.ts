import { erc20Abi, keccak256, type Address, type PublicClient } from "viem";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { stakingAbi } from "./abi";
import { STAKING_ADDRESS, STAKING_CODE_HASH } from "./deployment";

type StakingReadClient = Pick<
  PublicClient,
  | "getChainId"
  | "getBlockNumber"
  | "getBlock"
  | "getCode"
  | "readContract"
  | "getBalance"
>;
export async function readStakingSnapshot(
  client: StakingReadClient,
  account: Address,
) {
  if ((await client.getChainId()) !== 8453) throw Error("Switch to Base.");
  const blockNumber = await client.getBlockNumber({ cacheTime: 0 });
  const block = await client.getBlock({ blockNumber });
  const age = BigInt(Math.floor(Date.now() / 1000)) - block.timestamp;
  if (age < -60n || age > 180n) throw Error("Refresh network data.");
  const code = await client.getCode({ address: STAKING_ADDRESS, blockNumber });
  if (!code || keccak256(code) !== STAKING_CODE_HASH)
    throw Error("Staking contract verification failed.");
  const [
    paused,
    asset,
    depositBps,
    redemptionBps,
    minimum,
    admin,
    epochCount,
    positionCount,
    balance,
    allowance,
    receipts,
    ethBalance,
  ] = await Promise.all([
    client.readContract({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: "paused",
      blockNumber,
    }),
    client.readContract({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: "sgld",
      blockNumber,
    }),
    client.readContract({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: "DEPOSIT_FEE_BPS",
      blockNumber,
    }),
    client.readContract({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: "REDEMPTION_FEE_BPS",
      blockNumber,
    }),
    client.readContract({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: "MINIMUM_STAKE",
      blockNumber,
    }),
    client.readContract({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: "defaultAdmin",
      blockNumber,
    }),
    client.readContract({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: "epochCount",
      blockNumber,
    }),
    client.readContract({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: "positionCount",
      blockNumber,
    }),
    client.readContract({
      address: CONTRACT_ADDRESSES.SGLD_TOKEN,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [account],
      blockNumber,
    }),
    client.readContract({
      address: CONTRACT_ADDRESSES.SGLD_TOKEN,
      abi: erc20Abi,
      functionName: "allowance",
      args: [account, STAKING_ADDRESS],
      blockNumber,
    }),
    client.readContract({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: "balanceOf",
      args: [account],
      blockNumber,
    }),
    client.getBalance({ address: account, blockNumber }),
  ]);
  if (
    asset.toLowerCase() !== CONTRACT_ADDRESSES.SGLD_TOKEN.toLowerCase() ||
    depositBps !== 25n ||
    redemptionBps !== 50n ||
    minimum !== 10n ** 18n
  )
    throw Error("Staking configuration verification failed.");
  return {
    account,
    blockNumber,
    timestamp: block.timestamp,
    paused,
    balance,
    allowance,
    receipts,
    ethBalance,
    admin,
    epochCount,
    positionCount,
  };
}
export type StakingSnapshot = Awaited<ReturnType<typeof readStakingSnapshot>>;
export async function readPositionPage(
  client: StakingReadClient,
  account: Address,
  before: bigint | null,
) {
  const snapshot = await readStakingSnapshot(client, account);
  const end =
    before === null
      ? snapshot.positionCount
      : before < snapshot.positionCount
        ? before
        : snapshot.positionCount;
  const start = end > 20n ? end - 20n : 0n;
  const ids = Array.from(
    { length: Number(end - start) },
    (_, i) => end - 1n - BigInt(i),
  );
  const rows = await Promise.all(
    ids.map(async (id) => {
      const p = await client.readContract({
        address: STAKING_ADDRESS,
        abi: stakingAbi,
        functionName: "positions",
        args: [id],
        blockNumber: snapshot.blockNumber,
      });
      return {
        id,
        owner: p[0],
        principal: p[1],
        openedAt: p[2],
        maturesAt: p[3],
        withdrawn: p[4],
      };
    }),
  );
  return {
    rows: rows.filter((p) => p.owner.toLowerCase() === account.toLowerCase()),
    next: start > 0n ? start : undefined,
    snapshot,
  };
}
