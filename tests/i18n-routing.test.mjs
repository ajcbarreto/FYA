import { test } from "node:test";
import assert from "node:assert/strict";
import {
  localizedPath,
  resolvePreferredLocale,
  stripLocaleFromPath,
} from "../lib/i18n/config.ts";

test("stripLocaleFromPath removes locale prefix", () => {
  assert.equal(stripLocaleFromPath("/pt/pets"), "/pets");
  assert.equal(stripLocaleFromPath("/en"), "/");
  assert.equal(stripLocaleFromPath("/pets"), "/pets");
});

test("localizedPath builds locale-prefixed routes", () => {
  assert.equal(localizedPath("pt", "/pets"), "/pt/pets");
  assert.equal(localizedPath("en", "/pt/pets"), "/en/pets");
  assert.equal(localizedPath("en", "/"), "/en");
});

test("resolvePreferredLocale prefers cookie over Accept-Language", () => {
  assert.equal(
    resolvePreferredLocale("en-US,en;q=0.9", "pt"),
    "pt",
  );
  assert.equal(resolvePreferredLocale("en-US,en;q=0.9", undefined), "en");
  assert.equal(resolvePreferredLocale("pt-PT,pt;q=0.9", undefined), "pt");
  assert.equal(resolvePreferredLocale(null, undefined), "pt");
});
