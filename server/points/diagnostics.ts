// Provider errors may embed credential-bearing URLs. Emit only fixed labels and numeric codes.
export function diagnosePointsFailure(error: unknown) {
  const messages: string[] = [];
  const seen = new Set<unknown>();
  let current = error;
  let httpStatus: number | undefined;
  let rpcCode: number | undefined;
  let fromBlock: string | undefined, toBlock: string | undefined;
  for (let depth = 0; depth < 10 && current && !seen.has(current); depth++) {
    seen.add(current);
    if (typeof current !== "object") break;
    const item = current as Record<string, unknown>;
    if (typeof item.pointsFromBlock === "string" && /^\d{1,12}$/.test(item.pointsFromBlock)) fromBlock = item.pointsFromBlock;
    if (typeof item.pointsToBlock === "string" && /^\d{1,12}$/.test(item.pointsToBlock)) toBlock = item.pointsToBlock;
    for (const key of ["name", "message", "shortMessage", "details"]) {
      if (typeof item[key] === "string") messages.push(item[key] as string);
    }
    if (Number.isInteger(item.status) && Number(item.status) >= 100 && Number(item.status) <= 599)
      httpStatus = Number(item.status);
    if (Number.isInteger(item.code) && Number(item.code) >= -32768 && Number(item.code) <= -32000)
      rpcCode = Number(item.code);
    current = item.cause;
  }
  const text = messages.join(" ").toLowerCase();
  const category =
    httpStatus === 401 || httpStatus === 403 || /unauthori[sz]ed|forbidden|invalid api.?key|invalid token/.test(text)
      ? "provider-authentication"
      : httpStatus === 429 || /rate.?limit|too many requests|quota|capacity|limit exceeded/.test(text)
        ? "provider-rate-limit"
        : /points rpc network|wrong.*network|chain.*mismatch/.test(text)
          ? "wrong-network"
          : /archive|pruned|missing trie|historical state|old state/.test(text)
            ? "historical-state-unavailable"
            : /blocknotfound|block.*not found|header not found/.test(text)
              ? "historical-block-unavailable"
              : rpcCode === -32601 || /unsupported|not supported|method.*not found/.test(text)
                ? "unsupported-rpc-method"
                : /timeout|timed out|fetch failed|econn|enotfound/.test(text)
                  ? "provider-connection"
                  : /incomplete|reconcil|ledger|allocation|nonconsecutive|unverified|canonical/.test(text)
                    ? "reconciliation-or-validation"
                    : "unclassified";
  return { category, ...(httpStatus ? { httpStatus } : {}), ...(rpcCode ? { rpcCode } : {}), ...(fromBlock && toBlock ? { fromBlock, toBlock } : {}) };
}
