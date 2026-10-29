import { test } from "node:test";
import assert from "node:assert/strict";
import { APP_ORIGIN, isAppSurface } from "../../config/site";

test("the production app renders only on its exact canonical host", () => {
  assert.equal(APP_ORIGIN, "https://app.syncrate.org");
  for (const host of [
    "app.syncrate.org",
    "APP.SYNCRATE.ORG",
    "app.syncrate.org:443",
  ])
    assert.equal(isAppSurface(host, "production", undefined), true);
  for (const host of [
    "syncrate.org",
    "www.syncrate.org",
    "syncrate-preview.vercel.app",
    "app.syncrate.org.attacker.test",
    null,
  ])
    for (const preview of [undefined, "app", ["app"]])
      assert.equal(isAppSurface(host, "production", preview), false);
});
test("review access is restricted to explicit non-production requests on preview or loopback hosts", () => {
  for (const host of [
    "syncrate-branch.vercel.app",
    "localhost:4000",
    "127.0.0.1:4000",
    "[::1]:4000",
  ]) {
    assert.equal(isAppSurface(host, "preview", "app"), true);
    assert.equal(isAppSurface(host, "local", "app"), true);
    assert.equal(isAppSurface(host, "preview", undefined), false);
    assert.equal(isAppSurface(host, undefined, "app"), false);
  }
  for (const host of [
    "syncrate.org",
    "attacker.test",
    "preview.vercel.app.attacker.test",
    null,
  ])
    assert.equal(isAppSurface(host, "preview", "app"), false);
});
