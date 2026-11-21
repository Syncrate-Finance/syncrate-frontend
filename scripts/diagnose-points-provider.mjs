import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Emit fixed provider labels/booleans only, never a hostname supplied by a secret. */
export function providerSummary(raw) {
  try {
    const u = new URL(raw);
    return {
      provider:
        u.hostname === "base-mainnet.chainnodes.org"
          ? "chainnodes-base"
          : "unrecognized-endpoint",
      https: u.protocol === "https:",
      credentialsPresent: u.pathname.length > 1,
      valid:
        u.protocol === "https:" &&
        u.hostname === "base-mainnet.chainnodes.org" &&
        (!u.port || u.port === "443") &&
        !u.username &&
        !u.password &&
        u.pathname.length > 1 &&
        !u.hash,
    };
  } catch {
    return {
      provider: "invalid-endpoint",
      https: false,
      credentialsPresent: false,
      valid: false,
    };
  }
}
export function safeRpcFailure(status, body) {
  const candidate = body?.error?.code;
  const code =
    Number.isInteger(candidate) &&
    ((candidate >= -32768 && candidate <= -32000) ||
      [401, 403, 429].includes(candidate))
      ? candidate
      : undefined;
  return {
    httpStatus: status,
    ...(code === undefined ? {} : { rpcCode: code }),
    category:
      status === 401 || status === 403
        ? "authentication"
        : status === 429 || code === 429
          ? "rate-limit"
          : code === -32014
            ? "historical-block-unavailable"
            : "rpc-failure",
  };
}

async function main() {
  const url = process.env.POINTS_RPC_URL;
  const summary = providerSummary(url);
  console.log(JSON.stringify({ check: "configured-provider", ...summary }));
  // A secret may be wrong. Never send it to an unrecognized endpoint or print it.
  if (!summary.valid) {
    process.exitCode = 1;
    return;
  }
  let sequence = 0,
    throttled = false;
  async function probe(check, method, params, validate) {
    if (throttled) return null;
    await new Promise((resolve) => setTimeout(resolve, 1200));
    try {
      const response = await fetch(url, {
        method: "POST",
        redirect: "error",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: ++sequence,
          method,
          params,
        }),
        signal: AbortSignal.timeout(20000),
      });
      let body;
      try {
        body = await response.json();
      } catch {
        console.log(
          JSON.stringify({
            check,
            method,
            httpStatus: response.status,
            category: "non-json-response",
          }),
        );
        return null;
      }
      if (!response.ok || body.error || !("result" in body)) {
        if (response.status === 429 || body?.error?.code === 429) {
          throttled = true;
          process.exitCode = 1;
        }
        console.log(
          JSON.stringify({
            check,
            method,
            ...safeRpcFailure(response.status, body),
          }),
        );
        return null;
      }
      const result = validate(body.result);
      console.log(JSON.stringify({ check, method, ...result }));
      return body.result;
    } catch {
      console.log(
        JSON.stringify({
          check,
          method,
          category: "connection-or-response-failure",
        }),
      );
      return null;
    }
  }
  const id = await probe("network", "eth_chainId", [], (value) => ({
    matches:
      typeof value === "string" &&
      /^0x[\da-f]+$/i.test(value) &&
      BigInt(value) === 8453n,
  }));
  if (
    typeof id !== "string" ||
    !/^0x[\da-f]+$/i.test(id) ||
    BigInt(id) !== 8453n
  ) {
    process.exitCode = 1;
    return;
  }
  const history = JSON.parse(
    fs.readFileSync(
      new URL(
        "../data/points/history/base-through-53350926.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const known = history.logs.find((log) => log.address === history.token);
  for (const block of [53350926n, 53350927n, 54528121n])
    await probe(
      `header-${block}`,
      "eth_getBlockByNumber",
      ["0x" + block.toString(16), false],
      (value) => ({
        present: Boolean(value?.hash),
        numberMatches: value?.number ? BigInt(value.number) === block : false,
        ...(block === 53350926n
          ? { canonicalAnchorMatches: value?.hash === history.throughBlockHash }
          : {}),
      }),
    );
  await probe(
    "known-token-event",
    "eth_getLogs",
    [
      {
        address: history.token,
        fromBlock: known.blockNumber,
        toBlock: known.blockNumber,
      },
    ],
    (value) => ({
      array: Array.isArray(value),
      knownEventMatches:
        Array.isArray(value) &&
        value.some(
          (log) =>
            log.transactionHash === known.transactionHash &&
            log.logIndex === known.logIndex &&
            log.blockHash === known.blockHash,
        ),
    }),
  );
  for (const size of [1n, 500n])
    await probe(
      `uncached-token-logs-${size}-blocks`,
      "eth_getLogs",
      [
        {
          address: history.token,
          fromBlock: "0x" + 53350927n.toString(16),
          toBlock: "0x" + (53350927n + size - 1n).toString(16),
        },
      ],
      (value) => ({
        array: Array.isArray(value),
        count: Array.isArray(value) ? value.length : undefined,
      }),
    );
  await probe(
    "cutoff-token-supply",
    "eth_call",
    [{ to: history.token, data: "0x18160ddd" }, "0x" + 54528121n.toString(16)],
    (value) => ({
      validUint: typeof value === "string" && /^0x[\da-f]{64}$/i.test(value),
    }),
  );
  console.log(
    "Provider diagnostics finished. These probes do not calculate or publish rewards; full reconciliation remains required.",
  );
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main().catch(() => {
    console.error(
      "Provider diagnostics failed; credential-bearing errors are suppressed.",
    );
    process.exitCode = 1;
  });
