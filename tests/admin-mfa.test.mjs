import { test } from "node:test";
import assert from "node:assert/strict";
import { createTestDatabase } from "../scripts/test-database.mjs";

test("administrators without a second factor have no privileged access", async () => {
  const db = await createTestDatabase();
  try {
    const admin = "10000000-0000-0000-0000-000000000001",
      shelterOwner = "20000000-0000-0000-0000-000000000001";
    for (const [id, role] of [
      [admin, "user"],
      [shelterOwner, "canil"],
    ])
      await db.query(
        "insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)",
        [id, id + "@test.local", JSON.stringify({ role })],
      );
    await db.query("update profiles set role='admin' where id=$1", [admin]);
    const as = async (id, aal, sql, args = []) => {
      await db.exec("set role authenticated");
      await db.query(
        "select set_config('request.jwt.claim.sub',$1,false), set_config('request.jwt.claim.aal',$2,false)",
        [id, aal],
      );
      try {
        return await db.query(sql, args);
      } finally {
        await db.exec(
          "reset role; select set_config('request.jwt.claim.sub','',false), set_config('request.jwt.claim.aal','',false)",
        );
      }
    };
    await db.query(
      "insert into pilot_requests(organization,contact_name,email,location) values('Patas','Ana','ana@test.local','Porto')",
    );
    const triage = "update pilot_requests set status='contacted' returning id";

    assert.equal(
      (
        await as(admin, "aal1", "select role from profiles where id=$1", [
          admin,
        ])
      ).rows[0].role,
      "admin",
      "the application can still identify the administrator to ask for MFA",
    );
    assert.equal(
      (await as(admin, "aal1", "select private.is_admin() as ok")).rows[0].ok,
      false,
    );
    assert.equal((await as(admin, "aal1", triage)).rows.length, 0);
    assert.equal(
      (await as(admin, "aal1", "select id from canis")).rows.length,
      0,
      "a password-only admin session reads no application data",
    );

    assert.equal(
      (await as(admin, "aal2", "select private.is_admin() as ok")).rows[0].ok,
      true,
    );
    assert.equal((await as(admin, "aal2", triage)).rows.length, 1);

    assert.equal(
      (await as(shelterOwner, "aal1", "select id from canis")).rows.length,
      1,
      "other roles are not affected by the admin MFA requirement",
    );
  } finally {
    await db.close();
  }
});
