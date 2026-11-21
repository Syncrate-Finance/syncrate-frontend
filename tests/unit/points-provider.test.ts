import { test } from "node:test";
import assert from "node:assert/strict";
// The diagnostic is standalone Node JS so it can run before app/provider setup.
import {
  providerSummary,
  safeRpcFailure,
} from "../../scripts/diagnose-points-provider.mjs";
test("provider diagnostics never reveal a secret URL, key, hostname or provider error message", () => {
  const secret = "never-emit-this-key";
  const good = providerSummary(`https://base-mainnet.chainnodes.org/${secret}`);
  assert.equal(good.valid, true);
  for (const raw of [
    `https://${secret}.invalid/${secret}`,
    `https://user:${secret}@base-mainnet.chainnodes.org/key`,
    "not a URL",
    `http://base-mainnet.chainnodes.org/${secret}`,
    `https://base-mainnet.chainnodes.org.evil.invalid/${secret}`,
  ]) {
    const result = providerSummary(raw);
    assert.equal(result.valid, false);
    assert.ok(!JSON.stringify(result).includes(secret));
  }
  assert.ok(!JSON.stringify(good).includes(secret));
  assert.deepEqual(
    safeRpcFailure(200, {
      error: {
        code: -32014,
        message: `https://provider.invalid/${secret}`,
        data: { key: secret },
      },
    }),
    {
      httpStatus: 200,
      rpcCode: -32014,
      category: "historical-block-unavailable",
    },
  );
});
