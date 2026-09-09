import { test } from "node:test";
import assert from "node:assert/strict";
import { createTestDatabase } from "../scripts/test-database.mjs";
test("shelter likes are unique and private; unsafe donation URLs are rejected", async () => {
  const db = await createTestDatabase();
  try {
    const owner = "20000000-0000-0000-0000-000000000001";
    const visitor = "10000000-0000-0000-0000-000000000001";
    const other = "10000000-0000-0000-0000-000000000002";
    for (const id of [owner, visitor, other]) await db.query(
      "insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)",
      [id, id + "@test.local", JSON.stringify({role: id === owner ? "canil" : "user"})]);
    const shelter = (await db.query("select id from canis where owner_profile_id=$1", [owner])).rows[0].id;
    await assert.rejects(db.query("update canis set donation_url='javascript:alert(1)' where id=$1", [shelter]));
    await db.exec("set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [visitor]);
    await db.query("insert into canil_likes values($1,$2)", [shelter,visitor]);
    await assert.rejects(db.query("insert into canil_likes values($1,$2)", [shelter,visitor]));
    await assert.rejects(db.query("insert into canil_likes values($1,$2)", [shelter,other]));
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [other]);
    assert.equal((await db.query("select * from canil_likes")).rows.length, 0);
    await db.query("delete from canil_likes where canil_id=$1", [shelter]);
    await db.exec("reset role");
    assert.equal((await db.query("select * from canil_likes")).rows.length, 1);
  } finally { await db.close(); }
});
