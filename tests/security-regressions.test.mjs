import test from "node:test";
import assert from "node:assert/strict";
import { createTestDatabase } from "../scripts/test-database.mjs";
import { CSV_TEMPLATE, parseAnimalCsv } from "../lib/records/csv.ts";

test("the downloadable CSV template is accepted by the importer", () => {
  assert.equal(parseAnimalCsv(CSV_TEMPLATE)[0].species, "cao");
});

test("MFA also protects privileged RPC reads through shelter ownership", async () => {
  const db = await createTestDatabase();
  const admin = "40000000-0000-0000-0000-000000000001";
  try {
    await db.query(
      "insert into auth.users(id,email,raw_user_meta_data) values($1,'admin@test.local','{\"role\":\"canil\"}')",
      [admin],
    );
    const shelter = (
      await db.query("select id from canis where owner_profile_id=$1", [admin])
    ).rows[0].id;
    await db.query("update profiles set role='admin' where id=$1", [admin]);
    await db.exec("set role authenticated");
    await db.query(
      "select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.aal','aal1',false)",
      [admin],
    );
    assert.equal(
      (await db.query("select * from my_shelters()")).rows.length,
      0,
    );
    await assert.rejects(
      db.query("select shelter_metrics($1)", [shelter]),
      /Access denied/,
    );
    await assert.rejects(
      db.query("select search_shelter_requests($1)", [shelter]),
      /Forbidden/,
    );
    await db.exec("select set_config('request.jwt.claim.aal','aal2',false)");
    assert.equal(
      (await db.query("select * from my_shelters()")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select shelter_metrics($1)", [shelter])).rows.length,
      1,
    );
  } finally {
    await db.close();
  }
});

test("restoring an archived individual listing cannot exceed the active limit and owners receive application emails", async () => {
  const db = await createTestDatabase();
  const seller = "40000000-0000-0000-0000-000000000002";
  const adopter = "40000000-0000-0000-0000-000000000003";
  try {
    for (const [id, email] of [
      [seller, "seller@test.local"],
      [adopter, "adopter@test.local"],
    ])
      await db.query("insert into auth.users(id,email) values($1,$2)", [
        id,
        email,
      ]);
    await db.exec(
      "update profiles set created_at=now()-interval '10 days'; grant insert on animais to authenticated",
    );
    await db.exec("set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      seller,
    ]);
    const shelter = (
      await db.query("select start_individual_listing('Porto','912345678') id")
    ).rows[0].id;
    const insert = async () =>
      (
        await db.query(
          "insert into animais(canil_id,nome,especie,published) values($1,'Bobi','cao',true) returning id",
          [shelter],
        )
      ).rows[0].id;
    const first = await insert();
    await insert();
    await insert();
    await db.query("select manage_animal($1,'archive')", [first]);
    const fourth = await insert();
    await assert.rejects(
      db.query("select manage_animal($1,'restore')", [first]),
      /FYA_LISTING_LIMIT/,
    );
    await db.query("select manage_animal($1,'archive')", [fourth]);
    await db.query("select manage_animal($1,'restore')", [first]);
    await db.query("select manage_animal($1,'publish')", [first]);
    await db.exec("reset role");
    await db.query(
      "insert into animal_fotos(animal_id,storage_path,public_url) values($1,'p/test.jpg','https://example.com/test.jpg')",
      [first],
    );
    await db.exec("set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      adopter,
    ]);
    await db.query("select submit_adoption($1,'{}','Olá')", [first]);
    await db.exec("reset role");
    assert.equal(
      (await db.query("select recipient from email_outbox")).rows[0]?.recipient,
      "seller@test.local",
    );
  } finally {
    await db.close();
  }
});
