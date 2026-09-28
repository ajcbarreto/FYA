import { test } from "node:test";
import assert from "node:assert/strict";
import { pageCopy } from "../lib/seo/pages.ts";
import { describe, pageTitle, siteOrigin } from "../lib/seo/site.ts";

test("indexable pages have unique titles and descriptions within length limits", () => {
  const seen = new Set();
  for (const [key, page] of Object.entries(pageCopy)) {
    for (const locale of ["pt", "en"]) {
      const { title, description } = page[locale];
      const full = pageTitle(title);
      assert.ok(!seen.has(full), `${key}/${locale}: duplicate title`);
      assert.ok(
        !seen.has(description),
        `${key}/${locale}: duplicate description`,
      );
      seen.add(full);
      seen.add(description);
      if (page.noindex) continue;
      assert.ok(
        full.length >= 50 && full.length <= 60,
        `${key}/${locale} title: ${full.length}`,
      );
      assert.ok(
        description.length >= 140 && description.length <= 160,
        `${key}/${locale} description: ${description.length}`,
      );
    }
  }
});

test("page titles put the topic first and the brand last", () => {
  assert.equal(pageTitle("Animais para adoção"), "Animais para adoção | FYA");
  assert.equal(pageTitle("Entrar | FYA"), "Entrar | FYA");
});

test("site origin prefers the configured URL, then Vercel's production domain", () => {
  assert.equal(
    siteOrigin({ NEXT_PUBLIC_APP_URL: "https://fya.pt/" }),
    "https://fya.pt",
  );
  assert.equal(
    siteOrigin({ VERCEL_PROJECT_PRODUCTION_URL: "fya.vercel.app" }),
    "https://fya.vercel.app",
  );
  assert.equal(siteOrigin({}), "http://localhost:3000");
});

test("free-text descriptions are trimmed on a word boundary or padded", () => {
  const long = "palavra ".repeat(40);
  const trimmed = describe(long, "extra");
  assert.ok(trimmed.length <= 160);
  assert.ok(trimmed.endsWith("…"));
  assert.equal(describe("", "Texto por omissão."), "Texto por omissão.");
  assert.equal(describe("Curto.", "Mais contexto."), "Curto. Mais contexto.");
});
