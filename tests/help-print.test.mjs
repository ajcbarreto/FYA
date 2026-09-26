import test from "node:test";
import assert from "node:assert/strict";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { helpGuides, searchGuides } from "../lib/help/guides.ts";
import { publicAnimalUrl } from "../lib/help/public-url.ts";
test("help search ignores accents and case and all guides have real steps in both languages", () => {
  for (const locale of ["pt", "en"]) {
    const guides = helpGuides(locale);
    assert.equal(guides.length, 5);
    assert.equal(new Set(guides.map((g) => g.slug)).size, 5);
    for (const guide of guides) {
      assert.ok(guide.steps.length >= 5);
      assert.ok(guide.faq.length);
      assert.ok(guide.destination.startsWith("canil/"));
    }
  }
  assert.ok(searchGuides("pt", "ADOCAO").length > 0);
  assert.ok(
    searchGuides("pt", "microchip").some((g) => g.slug === "registar-animal"),
  );
  assert.equal(searchGuides("en", "nonexistent-word").length, 0);
});
test("QR can be decoded back to the canonical public animal page", () => {
  const url = publicAnimalUrl(
    "https://example.test/path",
    "pt",
    "10000000-0000-0000-0000-000000000001",
  );
  assert.equal(
    url,
    "https://example.test/pt/pets/10000000-0000-0000-0000-000000000001",
  );
  assert.throws(() =>
    publicAnimalUrl(
      "javascript:alert(1)",
      "pt",
      "10000000-0000-0000-0000-000000000001",
    ),
  );
  const qr = QRCode.create(url, { errorCorrectionLevel: "M" }),
    scale = 6,
    margin = 4,
    size = (qr.modules.size + margin * 2) * scale;
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const r = Math.floor(y / scale) - margin,
        c = Math.floor(x / scale) - margin;
      if (
        r >= 0 &&
        c >= 0 &&
        r < qr.modules.size &&
        c < qr.modules.size &&
        qr.modules.get(r, c)
      ) {
        const offset = (y * size + x) * 4;
        data[offset] = data[offset + 1] = data[offset + 2] = 0;
      }
    }
  assert.equal(jsQR(data, size, size)?.data, url);
});
