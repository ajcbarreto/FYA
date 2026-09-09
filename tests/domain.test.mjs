import { test } from "node:test";
import assert from "node:assert/strict";
import { safeLocalPath } from "../lib/auth/redirect.ts";
import { parseApplicationAnswers } from "../lib/adoption/application-form.ts";
import {
  configuredOptions,
  validFilterConfig,
} from "../lib/pet-catalog/options.ts";

test("redirects reject external, backslash and control-character paths", () => {
  for (const path of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/\nevil.test",
    "javascript:alert(1)",
  ])
    assert.equal(safeLocalPath(path), null);
  assert.equal(safeLocalPath("/pt/pets?page=2"), "/pt/pets?page=2");
});
test("application answers validate enum values and length on the server", () => {
  const form = new FormData();
  form.set("housing_type", "apartment");
  form.set("message", "  Hello  ");
  assert.equal(parseApplicationAnswers(form).message, "Hello");
  form.set("housing_type", "untrusted");
  assert.throws(() => parseApplicationAnswers(form));
  form.set("housing_type", "house");
  form.set("message", "x".repeat(4001));
  assert.throws(() => parseApplicationAnswers(form));
});
test("catalog settings accept legacy labels but only produce canonical DB values", () => {
  assert.deepEqual(
    configuredOptions("species", ["Dog", "Cat"], "pt").map((x) => x.value),
    ["cao", "gato"],
  );
  assert.equal(validFilterConfig("sizes", ["Small", "medio"]), true);
  assert.equal(validFilterConfig("sizes", ["invented"]), false);
});
