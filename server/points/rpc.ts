import { custom, http } from "viem";
import { base } from "viem/chains";

const headerMethods = new Set(["eth_getBlockByNumber", "eth_getBlockByHash"]);

/** Route headers explicitly; never replace failed archive logs/state with current data. */
export function pointsTransport(
  archiveUrl: string,
  headerUrl: string,
  options: { fetchFn?: typeof fetch; intervalMs?: number } = {},
) {
  for (const url of [archiveUrl, headerUrl])
    if (new URL(url).protocol !== "https:") throw Error("Points RPC must use HTTPS");
  const interval = options.intervalMs ?? 1000;
  let gate = Promise.resolve();
  let nextStart = 0;
  const pacedFetch: typeof fetch = async (input, init) => {
    const turn = gate.then(async () => {
      const delay = Math.max(0, nextStart - Date.now());
      if (delay) await new Promise<void>((resolve) => setTimeout(resolve, delay));
      nextStart = Date.now() + interval;
    });
    gate = turn.catch(() => {});
    await turn;
    return (options.fetchFn ?? fetch)(input, init);
  };
  const endpoint = (url: string) => http(url, {
    timeout: 30000, retryCount: 2, retryDelay: 2000, fetchFn: pacedFetch,
  })({ chain: base });
  const archive = endpoint(archiveUrl), headers = endpoint(headerUrl);
  let headerNetwork: Promise<void> | undefined;
  return custom({
    async request(args: Parameters<typeof archive.request>[0]) {
      if (headerMethods.has(args.method)) {
        headerNetwork ??= headers.request({ method: "eth_chainId" }).then((id) => {
          if (BigInt(id) !== BigInt(base.id)) throw Error("Wrong points header network");
        });
        await headerNetwork;
        return headers.request(args);
      }
      return archive.request(args);
    },
  }, { retryCount: 0, name: "Points archive and verified Base headers" });
}

export function assertLogBlockHash(logHash: string | null, headerHash: string | undefined) {
  if (!logHash || !headerHash || logHash.toLowerCase() !== headerHash.toLowerCase())
    throw Error("Historical log/header block hash mismatch");
}
