import test from "node:test";
import assert from "node:assert/strict";
import {
  parseSupportQuantity,
  externalDonationUrl,
} from "../lib/support/format.ts";
test("support amounts preserve cents and reject ambiguous or unsafe inputs", () => {
  assert.equal(parseSupportQuantity("12,50", "money"), 1250);
  assert.equal(parseSupportQuantity("0.10", "money"), 10);
  assert.equal(parseSupportQuantity("1.234", "money"), null);
  assert.equal(parseSupportQuantity("1e4", "money"), null);
  assert.equal(parseSupportQuantity("-1", "goods"), null);
  assert.equal(parseSupportQuantity("2.5", "goods"), null);
  assert.equal(parseSupportQuantity("10", "goods"), 10);
  assert.throws(() => externalDonationUrl("javascript:alert(1)"));
  assert.throws(() => externalDonationUrl("https://user:password@example.com"));
  assert.equal(externalDonationUrl(""), null);
});
