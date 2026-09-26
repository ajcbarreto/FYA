import test from "node:test";
import assert from "node:assert/strict";
import {
  documentMime,
  validId,
  DOCUMENT_LIMIT,
} from "../lib/records/validation.ts";
import { parseAnimalCsv, csvCell } from "../lib/records/csv.ts";
test("documents allow only signatures of supported formats", () => {
  assert.equal(
    documentMime(new TextEncoder().encode("%PDF-1.7")),
    "application/pdf",
  );
  assert.equal(documentMime(new TextEncoder().encode("<script>")), null);
  assert.equal(validId("../../file"), false);
  assert.equal(DOCUMENT_LIMIT, 10485760);
});
test("CSV supports quoted lines, rejects duplicates and neutralises spreadsheet formulas", () => {
  const csv =
    'reference,name,species,breed,age,description\nA,"Luna, Jr",cao,,2,"Line 1\nLine 2"';
  assert.equal(parseAnimalCsv(csv)[0].description, "Line 1\nLine 2");
  assert.throws(() => parseAnimalCsv(csv + "\nA,Other,cao,,2,test"));
  assert.throws(() => parseAnimalCsv("name,species\nTest,cao"));
  assert.equal(csvCell('=HYPERLINK("bad")'), '"\'=HYPERLINK(""bad"")"');
});

import {
  fillReplyTemplate,
  queueFilters,
  queueQuery,
} from "../lib/records/request-queue.ts";
test("reply substitution is literal and filters exclude navigation and malformed values", () => {
  assert.equal(
    fillReplyTemplate("Olá {adotante}, {animal} — {canil}. {unknown}", {
      animal: "$& dog",
      adotante: "{canil}",
      canil: "Shelter",
    }),
    "Olá {canil}, $& dog — Shelter. {unknown}",
  );
  assert.equal(
    queueFilters({ days: "-3", status: "bad", assignee: "evil", order: "bad" })
      .days,
    "0",
  );
  assert.equal(queueFilters({ q: " x ", unanswered: "1" }).q, "x");
  assert.equal(
    queueQuery({ q: "Luna & sol", success: "saved" }).includes("success"),
    false,
  );
  assert.equal(
    new URLSearchParams(queueQuery({ q: "Luna & sol" })).get("q"),
    "Luna & sol",
  );
});
