import assert from "node:assert/strict";
import test from "node:test";
import { MINIMUM_STAKE, stakingAmountError } from "../../features/staking/model";

test("staking enforces the 1 SGLD minimum at full token precision", () => {
  assert.equal(stakingAmountError(""), null);
  assert.equal(stakingAmountError("0.999999999999999999"), "Minimum stake is 1 SGLD.");
  assert.equal(stakingAmountError("1", MINIMUM_STAKE), null);
  assert.equal(stakingAmountError("1.000000000000000001", MINIMUM_STAKE + 1n), null);
  assert.equal(stakingAmountError("1", MINIMUM_STAKE - 1n), "This amount exceeds your available SGLD balance.");
  assert.notEqual(stakingAmountError("1.0000000000000000001"), null);
  assert.notEqual(stakingAmountError("-1"), null);
});
