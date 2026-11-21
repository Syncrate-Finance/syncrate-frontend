import { custom, http, type Chain } from "viem";
import { base } from "viem/chains";
import { withPointsHistory, type PointsHistory } from "./history-cache";

const metadataMethods = new Set([
  "eth_getBlockByNumber",
  "eth_getBlockByHash",
  "eth_getCode",
]);

/** Route block metadata explicitly; never replace failed archive logs/state with current data. */
export function pointsTransport(
  archiveUrl: string,
  headerUrl: string,
  options: {
    fetchFn?: typeof fetch;
    intervalMs?: number;
    history?: PointsHistory;
    chain?: Chain;
  } = {},
) {
  for (const url of [archiveUrl, headerUrl])
    if (new URL(url).protocol !== "https:")
      throw Error("Points RPC must use HTTPS");
  const interval = options.intervalMs ?? 1000;
  let gate = Promise.resolve();
  let nextStart = 0;
  const pacedFetch: typeof fetch = async (input, init) => {
    const turn = gate.then(async () => {
      const delay = Math.max(0, nextStart - Date.now());
      if (delay)
        await new Promise<void>((resolve) => setTimeout(resolve, delay));
      nextStart = Date.now() + interval;
    });
    gate = turn.catch(() => {});
    await turn;
    return (options.fetchFn ?? fetch)(input, init);
  };
  const chain = options.chain ?? base;
  const endpoint = (url: string) =>
    http(url, {
      timeout: 30000,
      retryCount: 2,
      retryDelay: 2000,
      fetchFn: pacedFetch,
    })({ chain });
  const archive = endpoint(archiveUrl),
    headers = endpoint(headerUrl);
  let headerNetwork: Promise<void> | undefined;
  const request = async (args: Parameters<typeof archive.request>[0]) => {
    const source = metadataMethods.has(args.method) ? "headers" : "archive";
    try {
      if (metadataMethods.has(args.method)) {
        headerNetwork ??= headers
          .request({ method: "eth_chainId" })
          .then((id) => {
            if (
              typeof id !== "string" ||
              !/^0x[0-9a-f]+$/i.test(id) ||
              BigInt(id) !== BigInt(chain.id)
            )
              throw Error("Wrong points header network");
          });
        await headerNetwork;
        return await headers.request(args);
      }
      return await archive.request(args);
    } catch (cause) {
      // Fixed method/source labels only; provider URLs and response text stay private.
      const label =
        cause instanceof Error &&
        cause.message === "Wrong points header network"
          ? "Wrong points header network"
          : "Points RPC request failed";
      throw Object.assign(new Error(label, { cause }), {
        pointsRpcMethod: args.method,
        pointsRpcSource: source,
      });
    }
  };
  const cached = options.history
    ? withPointsHistory(options.history, request, (block) =>
        request({ method: "eth_getBlockByNumber", params: [block, false] }),
      )
    : request;
  return custom(
    { request: cached },
    { retryCount: 0, name: "Points archive and verified Base history" },
  );
}

export function assertLogBlockHash(
  logHash: string | null,
  headerHash: string | undefined,
) {
  if (
    !logHash ||
    !headerHash ||
    logHash.toLowerCase() !== headerHash.toLowerCase()
  )
    throw Error("Historical log/header block hash mismatch");
}
