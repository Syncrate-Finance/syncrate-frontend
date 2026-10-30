import { test } from "node:test";
import assert from "node:assert/strict";
import { readWalletProjectId } from "../../features/wallet/settings";

test("unconfigured or malformed wallet identifiers cannot enable a broken relay", () => {
  for (const value of [
    undefined,
    "",
    " ",
    "YOUR_PROJECT_ID",
    "https://rpc.example/key",
    "0x" + "a".repeat(32),
  ])
    assert.equal(readWalletProjectId(value), undefined);
  assert.equal(
    readWalletProjectId("  " + "a".repeat(32) + "\n"),
    "a".repeat(32),
  );
});
