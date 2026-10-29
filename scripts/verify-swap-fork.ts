/** Optional acceptance check. All writes target a disposable, loopback-only Anvil fork. */
import assert from "node:assert/strict";
import {
  createPublicClient,
  createWalletClient,
  encodeAbiParameters,
  erc20Abi,
  http,
  keccak256,
  toHex,
  type Address,
  type Hex,
} from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { engineAbi } from "../features/swap/engine-abi";
import { quoteSwap, requiredAction, STABLECOINS } from "../features/swap/model";
import { readQueuedPayouts, readSwapSnapshot } from "../features/swap/read";
import { hasApprovalReceipt, readSwapOutcome } from "../features/swap/receipt";

const endpoint = "http://127.0.0.1:8545";
const transport = http(endpoint, { retryCount: 0, timeout: 30000 });
const client = createPublicClient({ chain: base, transport });
async function localRpc(method: string, params: unknown[] = []) {
  // This endpoint is deliberately not configurable: never run state overrides against a public RPC.
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const data = await response.json();
  if (data.error) throw Error(data.error.message);
  return data.result;
}
assert.match(await localRpc("web3_clientVersion"), /anvil/i);
assert.equal(await client.getChainId(), 8453);
const fork = await localRpc("evm_snapshot");
const wallet = createWalletClient({ chain: base, transport });
const [account] = await wallet.getAddresses();
assert.ok(account);
async function setTokenBalance(token: Address, owner: Address, amount: bigint) {
  for (let slot = 0; slot < 120; slot++) {
    const key = keccak256(
      encodeAbiParameters(
        [{ type: "address" }, { type: "uint256" }],
        [owner, BigInt(slot)],
      ),
    );
    const previous = await client.getStorageAt({ address: token, slot: key });
    await localRpc("anvil_setStorageAt", [
      token,
      key,
      toHex(amount, { size: 32 }),
    ]);
    let matches = false;
    try {
      matches =
        (await client.readContract({
          address: token,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [owner],
        })) === amount;
    } catch {
      /* Try the next layout slot in this isolated fork. */
    }
    if (matches) return;
    await localRpc("anvil_setStorageAt", [
      token,
      key,
      previous ?? toHex(0n, { size: 32 }),
    ]);
  }
  throw Error("Could not locate test token balance storage");
}
async function send(request: Parameters<typeof wallet.writeContract>[0]) {
  const hash = await wallet.writeContract(request);
  const receipt = await client.waitForTransactionReceipt({
    hash,
    timeout: 30000,
  });
  assert.equal(receipt.status, "success");
  return receipt;
}
const results: object[] = [];
try {
  await localRpc("evm_setNextBlockTimestamp", [Math.floor(Date.now() / 1000)]);
  await localRpc("evm_mine");
  for (const stablecoin of ["USDC", "USDT"] as const) {
    const token = STABLECOINS[stablecoin].address;
    await setTokenBalance(token, account, 1000_000000n);
    let data = await readSwapSnapshot(client, stablecoin, account);
    const input = 100_000000n;
    if (data.stableAllowance > 0n)
      await send({
        account,
        address: token,
        abi: erc20Abi,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.SYNCRATE_ENGINE, 0n],
      });
    assert.equal(
      requiredAction(
        "mint",
        input,
        await readSwapSnapshot(client, stablecoin, account),
      ),
      "approve",
    );
    await send({
      account,
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.SYNCRATE_ENGINE, input / 2n],
    });
    assert.equal(
      requiredAction(
        "mint",
        input,
        await readSwapSnapshot(client, stablecoin, account),
      ),
      "reset",
    );
    const reset = await client.simulateContract({
      account,
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.SYNCRATE_ENGINE, 0n],
    });
    assert.equal(
      hasApprovalReceipt(
        await send(reset.request),
        account,
        "mint",
        stablecoin,
        0n,
      ),
      true,
    );
    const approval = await client.simulateContract({
      account,
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.SYNCRATE_ENGINE, input],
    });
    assert.equal(
      hasApprovalReceipt(
        await send(approval.request),
        account,
        "mint",
        stablecoin,
        input,
      ),
      true,
    );
    data = await readSwapSnapshot(client, stablecoin, account);
    assert.equal(requiredAction("mint", input, data), "swap");
    const quote = quoteSwap("mint", input, data);
    const mint = await client.simulateContract({
      account,
      address: CONTRACT_ADDRESSES.SYNCRATE_ENGINE,
      abi: engineAbi,
      functionName: "mint",
      args: [input, token],
    });
    const minted = readSwapOutcome(
      await send(mint.request),
      account,
      "mint",
      stablecoin,
      input,
    );
    assert.equal(minted?.kind, "minted");
    assert.equal(minted?.amount, quote.output);
    assert.equal(
      (await readSwapSnapshot(client, stablecoin, account)).stableAllowance,
      0n,
    );
    // Provide sufficient test buffer for the immediate branch, then drain only the fork for the queued branch.
    await setTokenBalance(
      token,
      CONTRACT_ADDRESSES.SYNCRATE_ENGINE,
      1000_000000n,
    );
    const half = minted!.amount / 2n;
    await send({
      account,
      address: CONTRACT_ADDRESSES.SGLD_TOKEN,
      abi: erc20Abi,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.SYNCRATE_ENGINE, half],
    });
    data = await readSwapSnapshot(client, stablecoin, account);
    const redemptionQuote = quoteSwap("redeem", half, data);
    const redemption = await client.simulateContract({
      account,
      address: CONTRACT_ADDRESSES.SYNCRATE_ENGINE,
      abi: engineAbi,
      functionName: "redeem",
      args: [half, token],
    });
    const paid = readSwapOutcome(
      await send(redemption.request),
      account,
      "redeem",
      stablecoin,
      half,
    );
    assert.equal(paid?.kind, "paid");
    assert.equal(paid?.amount, redemptionQuote.output);
    await setTokenBalance(token, CONTRACT_ADDRESSES.SYNCRATE_ENGINE, 0n);
    await send({
      account,
      address: CONTRACT_ADDRESSES.SGLD_TOKEN,
      abi: erc20Abi,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.SYNCRATE_ENGINE, half],
    });
    data = await readSwapSnapshot(client, stablecoin, account);
    assert.equal(quoteSwap("redeem", half, data).queues, true);
    const queuedSimulation = await client.simulateContract({
      account,
      address: CONTRACT_ADDRESSES.SYNCRATE_ENGINE,
      abi: engineAbi,
      functionName: "redeem",
      args: [half, token],
    });
    const queued = readSwapOutcome(
      await send(queuedSimulation.request),
      account,
      "redeem",
      stablecoin,
      half,
    );
    assert.equal(queued?.kind, "queued");
    const payouts = await readQueuedPayouts(client, account);
    assert.ok(
      payouts.rows.some(
        (row) =>
          row.index === queued?.queueIndex && row.amount === queued.amount,
      ),
    );
    results.push({
      stablecoin,
      mint: "passed",
      immediateRedemption: "passed",
      queuedRedemption: "passed",
      limitedApprovalConsumed: true,
    });
  }
  // Invalid and depleted input must revert during simulation, before any wallet request.
  await assert.rejects(
    client.simulateContract({
      account,
      address: CONTRACT_ADDRESSES.SYNCRATE_ENGINE,
      abi: engineAbi,
      functionName: "mint",
      args: [0n, STABLECOINS.USDC.address],
    }),
  );
  console.log(
    JSON.stringify(
      { endpoint, client: "Anvil", mainnetWrites: 0, results },
      null,
      2,
    ),
  );
} finally {
  await localRpc("evm_revert", [fork]);
}
