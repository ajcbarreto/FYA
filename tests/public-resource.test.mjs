import { test } from "node:test";
import assert from "node:assert/strict";
import { publicResourceFor } from "../lib/routing/public-resource-path.ts";

const id = "00000000-0000-4000-8000-000000000001";

test("public detail routes map to the resource the proxy checks", () => {
  assert.deepEqual(publicResourceFor(["pets", id]), {
    kind: "record",
    table: "animais",
    id,
  });
  assert.deepEqual(publicResourceFor(["pets", id, "imprimir"]), {
    kind: "record",
    table: "animais",
    id,
  });
  assert.deepEqual(publicResourceFor(["canis", id]), {
    kind: "record",
    table: "canis",
    id,
  });
  assert.deepEqual(publicResourceFor(["canis", id, "apoiar"]), {
    kind: "record",
    table: "canis",
    id,
    verifiedOnly: true,
  });
  assert.deepEqual(publicResourceFor(["apoios", id]), {
    kind: "record",
    table: "support_projects",
    id,
  });
  assert.deepEqual(publicResourceFor(["ajuda", "registar-animal"]), {
    kind: "guide",
    slug: "registar-animal",
  });
});

test("listing pages, private areas and deeper paths are left to routing", () => {
  assert.equal(publicResourceFor([]), null);
  assert.equal(publicResourceFor(["pets"]), null);
  assert.equal(publicResourceFor(["canil", "animais", id]), null);
  assert.equal(publicResourceFor(["pets", id, "outra"]), null);
  assert.equal(publicResourceFor(["ajuda", "registar-animal", "x"]), null);
});
