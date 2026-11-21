import { test } from "node:test";
import assert from "node:assert/strict";
import { pointsTransport } from "../../server/points/rpc";
test("explicit historical state endpoint preserves the exact block while log reads keep their archive provider", async () => {
  const calls: Array<{ host: string; method: string; params: unknown }> = [];
  const fake: typeof fetch = async (input, init) => {
    const body = JSON.parse(String(init?.body));
    calls.push({
      host: new URL(String(input)).hostname,
      method: body.method,
      params: body.params,
    });
    return Response.json({
      jsonrpc: "2.0",
      id: body.id,
      result:
        body.method === "eth_chainId"
          ? "0x2105"
          : body.method === "eth_getLogs"
            ? []
            : "0x",
    });
  };
  const rpc = pointsTransport(
    "https://archive.invalid/key",
    "https://headers.invalid",
    { stateUrl: "https://state.invalid/key", fetchFn: fake, intervalMs: 0 },
  )({});
  const params = [
    { to: "0x1111111111111111111111111111111111111111", data: "0x18160ddd" },
    "0x123456",
  ];
  await rpc.request({ method: "eth_call", params });
  await rpc.request({
    method: "eth_getLogs",
    params: [{ fromBlock: "0x123456", toBlock: "0x123456" }],
  });
  assert.deepEqual(
    calls.map((x) => [x.host, x.method]),
    [
      ["state.invalid", "eth_chainId"],
      ["state.invalid", "eth_call"],
      ["archive.invalid", "eth_getLogs"],
    ],
  );
  assert.deepEqual(calls[1].params, params);
});
test("a wrong state network fails before the historical query and never falls back to current state", async () => {
  const calls: string[] = [];
  const rpc = pointsTransport(
    "https://archive.invalid",
    "https://headers.invalid",
    {
      stateUrl: "https://state.invalid",
      intervalMs: 0,
      fetchFn: async (_input, init) => {
        const body = JSON.parse(String(init?.body));
        calls.push(body.method);
        return Response.json({ jsonrpc: "2.0", id: body.id, result: "0x1" });
      },
    },
  )({});
  await assert.rejects(
    rpc.request({ method: "eth_call", params: [{}, "0x123456"] }),
    /Wrong points state network/,
  );
  assert.deepEqual(calls, ["eth_chainId"]);
});
