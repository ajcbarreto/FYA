import { test } from "node:test";
import assert from "node:assert/strict";
import { createTestDatabase } from "../scripts/test-database.mjs";

test("migrations protect roles, ownership and the full adoption lifecycle", async () => {
  const db = await createTestDatabase();
  try {
    const u = "10000000-0000-0000-0000-000000000001",
      v = "10000000-0000-0000-0000-000000000002",
      s = "20000000-0000-0000-0000-000000000001",
      t = "20000000-0000-0000-0000-000000000002";
    for (const [id, role] of [
      [u, "admin"],
      [v, "user"],
      [s, "canil"],
      [t, "canil"],
    ])
      await db.query(
        `insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)`,
        [id, id + "@test.local", JSON.stringify({ role })],
      );
    assert.equal(
      (await db.query(`select role from profiles where id=$1`, [u])).rows[0]
        .role,
      "user",
      "signup cannot request admin",
    );
    const shelter = (
      await db.query("select id from canis where owner_profile_id=$1", [s])
    ).rows[0].id;
    const animal = (
      await db.query(
        `insert into animais(canil_id,nome,especie,status) values($1,'Luna','gato','disponivel') returning id`,
        [shelter],
      )
    ).rows[0].id;
    async function as(id, sql, args = []) {
      await db.exec("set role authenticated");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        id,
      ]);
      try {
        return await db.query(sql, args);
      } finally {
        await db.exec("reset role");
        await db.exec("select set_config('request.jwt.claim.sub','',false)");
      }
    }
    assert.equal(
      (await as(u, "select * from profiles")).rows.length,
      1,
      "profile policies do not recurse or reveal others",
    );
    await assert.rejects(
      as(u, "update profiles set role='admin' where id=$1", [u]),
    );
    await assert.rejects(
      as(s, "update canis set verificado=true where id=$1", [shelter]),
    );
    await db.exec(
      `insert into app_settings(key,value) values('platform_settings','{"requireVerificationToPublish":true}')`,
    );
    await assert.rejects(
      as(
        s,
        "insert into animais(canil_id,nome,especie) values($1,'Denied','cao')",
        [shelter],
      ),
    );
    await db.query("update canis set verificado=true where id=$1", [shelter]);
    const conversation = (
      await as(u, "select submit_adoption($1,'{}','Hello') as id", [animal])
    ).rows[0].id;
    assert.equal(
      (await as(u, "select submit_adoption($1,'{}','Retry') as id", [animal]))
        .rows[0].id,
      conversation,
      "retry is idempotent",
    );
    assert.equal(
      (await db.query("select * from mensagens_adocao")).rows.length,
      1,
    );
    const request = (
      await db.query(
        "select id from pedidos_adocao where applicant_profile_id=$1",
        [u],
      )
    ).rows[0].id;
    await assert.rejects(
      as(u, "update pedidos_adocao set status='concluido' where id=$1", [
        request,
      ]),
    );
    await assert.rejects(
      as(t, "select transition_adoption($1,'entrevista','')", [request]),
    );
    await assert.rejects(
      as(s, "select transition_adoption($1,'concluido','')", [request]),
    );
    await as(s, "select transition_adoption($1,'entrevista','Talk soon')", [
      request,
    ]);
    await as(u, "select submit_adoption($1,'{}','Retry')", [animal]);
    assert.equal(
      (
        await db.query("select status from pedidos_adocao where id=$1", [
          request,
        ])
      ).rows[0].status,
      "entrevista",
    );
    await as(v, "select submit_adoption($1,'{}','Second applicant')", [animal]);
    const visit = (
      await as(
        u,
        "insert into visitas(pedido_id,canil_id,animal_id,applicant_profile_id,scheduled_at) values($1,$2,$3,$4,now()+interval '2 days') returning id",
        [request, shelter, animal, u],
      )
    ).rows[0].id;
    await assert.rejects(
      as(u, "update visitas set status='confirmada' where id=$1", [visit]),
    );
    await as(s, "update visitas set status='confirmada' where id=$1", [visit]);
    await assert.rejects(
      as(s, "update visitas set status='realizada' where id=$1", [visit]),
      "future visits cannot be completed",
    );
    await assert.rejects(
      as(
        u,
        "insert into visitas(pedido_id,canil_id,animal_id,applicant_profile_id,scheduled_at) values($1,$2,$3,$4,now()+interval '2 days')",
        [request, shelter, animal, v],
      ),
    );
    assert.equal(
      (
        await as(v, "select id from conversas_adocao where id=$1", [
          conversation,
        ])
      ).rows.length,
      0,
      "other adopters cannot read this conversation",
    );
    await assert.rejects(
      as(
        v,
        "insert into mensagens_adocao(conversa_id,sender_profile_id,conteudo) values($1,$2,'Unauthorized')",
        [conversation, v],
      ),
    );
    await assert.rejects(
      as(
        u,
        "insert into avaliacoes_canil(canil_id,author_profile_id,rating,estado) values($1,$2,5,'aprovada')",
        [shelter, u],
      ),
    );
    await as(s, "select transition_adoption($1,'aprovado','')", [request]);
    await as(s, "select transition_adoption($1,'concluido','')", [request]);
    assert.equal(
      (await db.query("select status from animais where id=$1", [animal]))
        .rows[0].status,
      "adotado",
    );
    assert.equal(
      (
        await db.query(
          "select status from pedidos_adocao where applicant_profile_id=$1",
          [v],
        )
      ).rows[0].status,
      "rejeitado",
    );
    await assert.rejects(
      as(u, "select submit_adoption($1,'{}','again')", [animal]),
    );
    await assert.rejects(as(u, "select * from email_outbox"));
    assert.ok((await db.query("select * from email_outbox")).rows.length >= 4);
    assert.ok((await db.query("select * from audit_events")).rows.length >= 4);
  } finally {
    await db.close();
  }
});
