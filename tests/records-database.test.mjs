import test from "node:test";
import assert from "node:assert/strict";
import { createTestDatabase } from "../scripts/test-database.mjs";
async function setup() {
  const db = await createTestDatabase();
  const ids = {
    owner: "20000000-0000-0000-0000-000000000001",
    other: "20000000-0000-0000-0000-000000000002",
    adopter: "10000000-0000-0000-0000-000000000001",
    reader: "10000000-0000-0000-0000-000000000002",
    editor: "10000000-0000-0000-0000-000000000003",
  };
  for (const [name, id] of Object.entries(ids))
    await db.query(
      "insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)",
      [
        id,
        name + "@test.local",
        JSON.stringify({
          role: ["owner", "other"].includes(name) ? "canil" : "user",
        }),
      ],
    );
  const shelter = (
    await db.query("select id from canis where owner_profile_id=$1", [
      ids.owner,
    ])
  ).rows[0].id;
  await db.exec("update canis set verificado=true");
  const animal = (
    await db.query(
      "insert into animais(canil_id,nome,especie) values($1,'Luna','cao') returning id",
      [shelter],
    )
  ).rows[0].id;
  await db.query(
    "insert into shelter_memberships values($1,$2,'reader',now()),($1,$3,'editor',now())",
    [shelter, ids.reader, ids.editor],
  );
  const as = async (name, sql, args = []) => {
    await db.exec("set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      ids[name],
    ]);
    try {
      return await db.query(sql, args);
    } finally {
      await db.exec(
        "reset role; select set_config('request.jwt.claim.sub','',false)",
      );
    }
  };
  return { db, ids, shelter, animal, as };
}
test("private records, documents and storage isolate shelters, readers and adopted families", async () => {
  const { db, animal, as } = await setup();
  try {
    await as(
      "editor",
      "insert into animal_records(animal_id,internal_notes,handover_notes) values($1,'PRIVATE','Care instructions')",
      [animal],
    );
    assert.equal(
      (await as("reader", "select * from animal_records")).rows.length,
      1,
    );
    assert.equal(
      (await as("adopter", "select * from animal_records")).rows.length,
      0,
    );
    assert.equal(
      (await as("other", "select * from animal_records")).rows.length,
      0,
    );
    await assert.rejects(
      as(
        "reader",
        "insert into animal_records(animal_id) values($1) on conflict(animal_id) do update set internal_notes='hacked'",
        [animal],
      ),
    );
    const doc = "30000000-0000-0000-0000-000000000001",
      privateDoc = "30000000-0000-0000-0000-000000000002";
    for (const [id, shareable] of [
      [doc, true],
      [privateDoc, false],
    ])
      await as(
        "editor",
        "insert into animal_documents(id,animal_id,title,category,storage_path,mime_type,size_bytes,shareable) values($1,$2,'Health','health',$3,'application/pdf',10,$4)",
        [id, animal, animal + "/" + id, shareable],
      );
    await db.exec(
      "grant select,insert,delete on storage.objects to authenticated; grant usage on schema storage to authenticated",
    );
    await as(
      "editor",
      "insert into storage.objects(id,bucket_id,name) values($1,'animal-documents',$2)",
      [doc, animal + "/" + doc],
    );
    assert.equal(
      (await as("adopter", "select * from storage.objects")).rows.length,
      0,
    );
    await assert.rejects(
      as(
        "reader",
        "insert into storage.objects(id,bucket_id,name) values($1,'animal-documents',$2)",
        [privateDoc, animal + "/" + privateDoc],
      ),
    );
    await as("adopter", "select submit_adoption($1,'{}','hello')", [animal]);
    const request = (await db.query("select id from pedidos_adocao")).rows[0]
      .id;
    await as("editor", "select transition_adoption($1,'entrevista','')", [
      request,
    ]);
    const share = "40000000-0000-0000-0000-000000000001";
    await assert.rejects(
      as("reader", "select share_animal_documents($1,$2,$3,7)", [
        share,
        request,
        [doc],
      ]),
    );
    await assert.rejects(
      as("editor", "select share_animal_documents($1,$2,$3,7)", [
        share,
        request,
        [privateDoc],
      ]),
    );
    await as("editor", "select share_animal_documents($1,$2,$3,7)", [
      share,
      request,
      [doc],
    ]);
    await as("editor", "select share_animal_documents($1,$2,$3,7)", [
      share,
      request,
      [doc],
    ]);
    assert.equal(
      (await db.query("select * from email_outbox where share_id=$1", [share]))
        .rows.length,
      1,
    );
    assert.equal(
      (await as("adopter", "select * from animal_documents")).rows.length,
      1,
    );
    assert.equal(
      (await as("adopter", "select * from storage.objects")).rows.length,
      1,
    );
    assert.equal(
      (await as("other", "select * from document_shares")).rows.length,
      0,
    );
    assert.equal(
      (await as("adopter", "select handover_notes from document_shares"))
        .rows[0].handover_notes,
      "Care instructions",
    );
    await db.query(
      "update document_shares set expires_at=now()-interval '1 second' where id=$1",
      [share],
    );
    assert.equal(
      (await as("adopter", "select * from storage.objects")).rows.length,
      0,
    );
    await db.query(
      "update document_shares set expires_at=now()+interval '1 day' where id=$1",
      [share],
    );
    await as("editor", "select revoke_document_share($1)", [share]);
    assert.equal(
      (await as("adopter", "select * from animal_documents")).rows.length,
      0,
    );
    await assert.rejects(
      as("adopter", "select manage_animal($1,'archive')", [animal]),
    );
    await as("owner", "select manage_animal($1,'archive')", [animal]);
    assert.equal(
      (await db.query("select * from pedidos_adocao")).rows.length,
      1,
    );
    await assert.rejects(
      as("owner", "delete from animais where id=$1", [animal]),
    );
    await db.exec("set role anon");
    assert.equal((await db.query("select * from animais")).rows.length, 0);
    await db.exec("reset role");
  } finally {
    await db.close();
  }
});
test("team revocation, external adoption, follow-up, import atomicity and selected shelter are enforced in SQL", async () => {
  const { db, ids, shelter, animal, as } = await setup();
  try {
    assert.equal(
      (await as("editor", "select * from my_shelters()")).rows[0].id,
      shelter,
    );
    await assert.rejects(
      as("reader", "select manage_animal($1,'adotado')", [animal]),
    );
    await as("adopter", "select submit_adoption($1,'{}','hello')", [animal]);
    const request = (await db.query("select id from pedidos_adocao")).rows[0]
      .id;
    await as("editor", "select transition_adoption($1,'entrevista','')", [
      request,
    ]);
    await as("editor", "select transition_adoption($1,'aprovado','')", [
      request,
    ]);
    await as("editor", "select transition_adoption($1,'concluido','')", [
      request,
    ]);
    assert.equal(
      (await db.query("select * from shelter_tasks")).rows.length,
      3,
    );
    await assert.rejects(
      as("editor", "select manage_animal($1,'disponivel')", [animal]),
    );
    await assert.rejects(
      as("editor", "select manage_animal($1,'return')", [animal]),
    );
    const rows = [
      {
        reference: "IMP1",
        name: "New",
        species: "cao",
        age: 2,
        description: "",
        breed: "",
      },
    ];
    await as("editor", "select import_animals($1,$2)", [
      shelter,
      JSON.stringify(rows),
    ]);
    await assert.rejects(
      as("editor", "select import_animals($1,$2)", [
        shelter,
        JSON.stringify([{ ...rows[0], reference: "IMP2" }, ...rows]),
      ]),
    );
    assert.equal(
      (await db.query("select * from animal_records where internal_ref='IMP2'"))
        .rows.length,
      0,
    );
    await as(
      "owner",
      "delete from shelter_memberships where canil_id=$1 and profile_id=$2",
      [shelter, ids.editor],
    );
    assert.equal(
      (await as("editor", "select * from my_shelters()")).rows.length,
      0,
    );
    assert.equal(
      (await as("editor", "select * from animal_records")).rows.length,
      0,
    );
    await assert.rejects(
      as("editor", "select manage_animal($1,'archive')", [animal]),
    );
  } finally {
    await db.close();
  }
});
test("visit capacity and rescheduling preserve a full slot and roll back failed reschedules", async () => {
  const { db, animal, shelter, as } = await setup();
  try {
    await as("adopter", "select submit_adoption($1,'{}','hello')", [animal]);
    const r = (await db.query("select * from pedidos_adocao")).rows[0];
    const slot = "2030-01-01T12:00:00Z";
    await as(
      "owner",
      "insert into visit_slots(canil_id,starts_at,capacity) values($1,$2,1)",
      [shelter, slot],
    );
    const v = (
      await as(
        "adopter",
        "insert into visitas(pedido_id,canil_id,animal_id,applicant_profile_id,scheduled_at) values($1,$2,$3,$4,$5) returning id",
        [r.id, shelter, animal, r.applicant_profile_id, slot],
      )
    ).rows[0].id;
    await assert.rejects(
      as(
        "adopter",
        "insert into visitas(pedido_id,canil_id,animal_id,applicant_profile_id,scheduled_at) values($1,$2,$3,$4,$5)",
        [r.id, shelter, animal, r.applicant_profile_id, slot],
      ),
    );
    await assert.rejects(
      as("owner", "select reschedule_visit($1,'2030-01-01T13:00:00Z')", [v]),
    );
    assert.equal(
      (await db.query("select status from visitas where id=$1", [v])).rows[0]
        .status,
      "proposta",
    );
  } finally {
    await db.close();
  }
});

test("handover requirements block completion atomically and reminder jobs cancel on task completion", async () => {
  const { db, ids, shelter, animal, as } = await setup();
  try {
    await as(
      "owner",
      "insert into shelter_handover_settings(canil_id,items,required) values($1,array['Care','Documents'],true)",
      [shelter],
    );
    await as("adopter", "select submit_adoption($1,'{}','hello')", [animal]);
    const request = (await db.query("select id from pedidos_adocao")).rows[0]
      .id;
    await as("editor", "select transition_adoption($1,'entrevista','')", [
      request,
    ]);
    await as("editor", "select transition_adoption($1,'aprovado','')", [
      request,
    ]);
    await assert.rejects(
      as("editor", "select transition_adoption($1,'concluido','')", [request]),
    );
    assert.equal(
      (
        await db.query("select status from pedidos_adocao where id=$1", [
          request,
        ])
      ).rows[0].status,
      "aprovado",
    );
    await as(
      "editor",
      "insert into animal_handover(animal_id,checked_items) values($1,array['Care','Documents'])",
      [animal],
    );
    await as("editor", "select transition_adoption($1,'concluido','')", [
      request,
    ]);
    const task = (
      await db.query("select id from shelter_tasks order by due_at")
    ).rows[0].id;
    assert.equal(
      (await db.query("select * from email_outbox where task_id is not null"))
        .rows.length,
      3,
    );
    await as(
      "editor",
      "update shelter_tasks set completed_at=now(),outcome='Contacted' where id=$1",
      [task],
    );
    assert.ok(
      (
        await db.query(
          "select cancelled_at from email_outbox where task_id=$1",
          [task],
        )
      ).rows[0].cancelled_at,
    );
    await assert.rejects(
      as(
        "reader",
        "update shelter_handover_settings set required=false where canil_id=$1 returning canil_id",
        [shelter],
      ).then((r) => {
        if (!r.rows.length) throw new Error("RLS denied");
      }),
    );
    await assert.rejects(
      as("editor", "update animal_documents set storage_path=$1", [
        animal + "/forged",
      ]),
    );
    await assert.rejects(
      as(
        "adopter",
        "insert into terms_acceptances(profile_id,version) values($1,$2)",
        [ids.adopter, "invented"],
      ),
    );
  } finally {
    await db.close();
  }
});

test("application queue searches globally, protects assignments and tracks actual replies", async () => {
  const { db, ids, shelter, animal, as } = await setup();
  try {
    await as("adopter", "select submit_adoption($1,'{}','hello')", [animal]);
    const request = (await db.query("select id from pedidos_adocao")).rows[0]
      .id;
    await db.query(
      "update pedidos_adocao set created_at=now()-interval '3 days' where id=$1",
      [request],
    );
    const search = async (
      name,
      q = "",
      status = "",
      assignee = "",
      days = 0,
      unanswered = false,
      page = 1,
    ) =>
      (
        await as(
          name,
          "select search_shelter_requests($1,$2,$3,$4,$5,$6,'oldest',$7) result",
          [shelter, q, status, assignee, days, unanswered, page],
        )
      ).rows[0].result;
    assert.equal((await search("reader", "LUNA")).total, 1);
    assert.equal((await search("owner", "adopter@test.local")).total, 1);
    assert.equal((await search("owner", "%", "", "", 0)).total, 0);
    assert.equal(
      (await search("owner", "", "pendente", "unassigned", 2, true)).total,
      1,
    );
    assert.equal((await search("owner", "", "entrevista")).total, 0);
    assert.equal((await search("owner", "", "", "", 4)).total, 0);
    await assert.rejects(search("other"));
    await assert.rejects(search("adopter"));
    await as(
      "editor",
      "insert into request_internal_notes(request_id,notes,assignee_id) values($1,'private',$2)",
      [request, ids.editor],
    );
    assert.equal((await search("owner", "", "", ids.editor)).total, 1);
    assert.equal(
      (
        await as(
          "reader",
          "update request_internal_notes set assignee_id=$1 where request_id=$2 returning request_id",
          [ids.owner, request],
        )
      ).rows.length,
      0,
    );
    await assert.rejects(
      as(
        "owner",
        "update request_internal_notes set assignee_id=$1 where request_id=$2",
        [ids.other, request],
      ),
    );
    await as("owner", "select transition_adoption($1,'entrevista','')", [
      request,
    ]);
    assert.equal((await search("owner", "", "", "", 0, true)).total, 1);
    await as(
      "owner",
      "delete from shelter_memberships where canil_id=$1 and profile_id=$2",
      [shelter, ids.editor],
    );
    assert.equal((await search("owner", "", "", "unassigned")).total, 1);
    const message = "30000000-0000-0000-0000-000000000001";
    await assert.rejects(
      as("reader", "select reply_to_application($1,$2,$3)", [
        request,
        message,
        "hello family",
      ]),
    );
    await as("owner", "select reply_to_application($1,$2,$3)", [
      request,
      message,
      "hello family",
    ]);
    await as("owner", "select reply_to_application($1,$2,$3)", [
      request,
      message,
      "hello family",
    ]);
    assert.equal(
      (
        await db.query(
          "select count(*)::int n from mensagens_adocao where id=$1",
          [message],
        )
      ).rows[0].n,
      1,
    );
    await assert.rejects(
      as("owner", "select reply_to_application($1,$2,$3)", [
        request,
        message,
        "different retry",
      ]),
    );
    assert.equal((await search("owner", "", "", "", 0, true)).total, 0);
    const first = (await search("owner")).items[0].first_response_at;
    await as(
      "owner",
      "select transition_adoption($1,'entrevista','shared follow-up')",
      [request],
    );
    assert.equal((await search("owner")).items[0].first_response_at, first);
    assert.equal(
      (
        await db.query(
          "select notes from request_internal_notes where request_id=$1",
          [request],
        )
      ).rows[0].notes,
      "private",
    );
    // Search/filter and count happen before pagination, including matches beyond row 25.
    for (let i = 0; i < 26; i++)
      await db
        .query(
          "insert into animais(canil_id,nome,especie) values($1,$2,'cao') returning id",
          [shelter, `Queue ${i}`],
        )
        .then(async (r) => {
          await as("adopter", "select submit_adoption($1,'{}','hello')", [
            r.rows[0].id,
          ]);
        });
    assert.equal((await search("owner")).total, 27);
    assert.equal(
      (await search("owner", "", "", "", 0, false, 2)).items.length,
      2,
    );
    assert.equal((await search("owner", "Queue 25")).items.length, 1);
    assert.equal(
      (await search("owner", "Queue 25", "", "", 0, false, 900)).page,
      1,
    );
  } finally {
    await db.close();
  }
});
test("reply templates are editable by the team and isolated from adopters and other shelters", async () => {
  const { db, shelter, as } = await setup();
  try {
    const id = (
      await as(
        "editor",
        "insert into shelter_reply_templates(canil_id,title,body) values($1,'Hello','Hello {adotante}') returning id",
        [shelter],
      )
    ).rows[0].id;
    assert.equal(
      (await as("reader", "select * from shelter_reply_templates")).rows.length,
      1,
    );
    assert.equal(
      (await as("adopter", "select * from shelter_reply_templates")).rows
        .length,
      0,
    );
    assert.equal(
      (await as("other", "select * from shelter_reply_templates")).rows.length,
      0,
    );
    assert.equal(
      (
        await as(
          "reader",
          "update shelter_reply_templates set body='bad' where id=$1 returning id",
          [id],
        )
      ).rows.length,
      0,
    );
    await as(
      "owner",
      "update shelter_reply_templates set body='Welcome {animal}' where id=$1",
      [id],
    );
    assert.equal(
      (await as("reader", "select body from shelter_reply_templates")).rows[0]
        .body,
      "Welcome {animal}",
    );
    await as("editor", "delete from shelter_reply_templates where id=$1", [id]);
    assert.equal(
      (await as("reader", "select * from shelter_reply_templates")).rows.length,
      0,
    );
  } finally {
    await db.close();
  }
});

test("animal timeline is immutable, private and records changes without copying private notes", async () => {
  const { db, animal, as } = await setup();
  try {
    await as(
      "owner",
      "insert into animal_records(animal_id,internal_notes,intake_date) values($1,'SECRET-CLINICAL-NOTE','2026-09-01')",
      [animal],
    );
    await as(
      "owner",
      "update animal_records set internal_notes='ANOTHER-SECRET' where animal_id=$1",
      [animal],
    );
    const events = (
      await as(
        "reader",
        "select * from animal_timeline where animal_id=$1 order by occurred_at,id",
        [animal],
      )
    ).rows;
    assert.ok(events.some((e) => e.kind === "registered"));
    assert.equal(events.filter((e) => e.kind === "record_updated").length, 2);
    assert.equal(JSON.stringify(events).includes("SECRET"), false);
    assert.equal(
      events.find((e) => e.kind === "record_updated").details.intake_date,
      "2026-09-01",
    );
    assert.equal(
      (await as("other", "select * from animal_timeline")).rows.length,
      0,
    );
    assert.equal(
      (await as("adopter", "select * from animal_timeline")).rows.length,
      0,
    );
    await assert.rejects(
      as(
        "owner",
        "insert into animal_timeline(animal_id,kind) values($1,'fake')",
        [animal],
      ),
    );
    await assert.rejects(
      as("owner", "delete from animal_timeline where animal_id=$1", [animal]),
    );
    await as("owner", "insert into animal_handover(animal_id) values($1)", [
      animal,
    ]);
    assert.equal(
      (
        await as(
          "reader",
          "select * from animal_timeline where animal_id=$1 and kind='handover_updated'",
          [animal],
        )
      ).rows.length,
      1,
    );
    await as("owner", "select manage_animal($1,'archive')", [animal]);
    assert.equal(
      (
        await as(
          "reader",
          "select * from animal_timeline where animal_id=$1 and kind='archived'",
          [animal],
        )
      ).rows.length,
      1,
    );
  } finally {
    await db.close();
  }
});
test("pilot contacts accept only server submissions, enforce limits and remain administrator-only", async () => {
  const { db, ids, as } = await setup();
  try {
    const sql =
      "select submit_pilot_request('Canil piloto','Nome Teste',$1,'Lisboa','Demonstração',true)";
    await assert.rejects(as("owner", sql, ["test@example.test"]));
    await db.exec("set role anon");
    await assert.rejects(db.query(sql, ["test@example.test"]));
    await db.exec("reset role; set role service_role");
    try {
      await assert.rejects(
        db.query(
          "select submit_pilot_request('Canil','Teste','wrong','Lisboa','',true)",
        ),
      );
      await assert.rejects(
        db.query(
          "select submit_pilot_request('Canil','Teste','ok@example.test','Lisboa','',false)",
        ),
      );
      for (let i = 0; i < 3; i++) await db.query(sql, ["TEST@example.test"]);
      await assert.rejects(db.query(sql, ["test@example.test"]));
    } finally {
      await db.exec("reset role");
    }
    assert.equal(
      (await as("owner", "select * from pilot_requests")).rows.length,
      0,
    );
    assert.equal(
      (await as("reader", "select * from pilot_requests")).rows.length,
      0,
    );
    await db.query("update profiles set role='admin' where id=$1", [ids.other]);
    const requests = (await as("other", "select * from pilot_requests")).rows;
    assert.equal(requests.length, 3);
    assert.equal(requests[0].email, "test@example.test");
    await as(
      "other",
      "update pilot_requests set status='contacted',internal_notes='Follow up' where id=$1",
      [requests[0].id],
    );
    assert.equal(
      (
        await as("other", "select status from pilot_requests where id=$1", [
          requests[0].id,
        ])
      ).rows[0].status,
      "contacted",
    );
  } finally {
    await db.close();
  }
});

test("support totals count only confirmed receipts; retries and corrections cannot double count", async () => {
  const { db, shelter, as } = await setup();
  try {
    const p = (
      await as(
        "owner",
        "insert into support_projects(canil_id,kind,title,description,goal,unit,published) values($1,'goods','Ração','Precisamos de sacos de ração.',20,'sacos',true) returning id",
        [shelter],
      )
    ).rows[0].id;
    const pledge = "40000000-0000-0000-0000-000000000001",
      receipt = "40000000-0000-0000-0000-000000000002";
    await as("adopter", "select pledge_support($1,$2,5,$3)", [
      pledge,
      p,
      "PRIVATE CONTACT NOTE",
    ]);
    await as("adopter", "select pledge_support($1,$2,5,$3)", [
      pledge,
      p,
      "PRIVATE CONTACT NOTE",
    ]);
    assert.equal(
      (await db.query("select received from support_projects where id=$1", [p]))
        .rows[0].received,
      0,
    );
    await assert.rejects(
      as("adopter", "select record_support_receipt($1,$2,5,'confirmed',$3)", [
        receipt,
        p,
        pledge,
      ]),
    );
    await assert.rejects(
      as("reader", "select record_support_receipt($1,$2,5,'confirmed',$3)", [
        receipt,
        p,
        pledge,
      ]),
    );
    await assert.rejects(
      as("owner", "update support_projects set received=900 where id=$1", [p]),
    );
    await as(
      "editor",
      "select record_support_receipt($1,$2,5,'confirmed',$3)",
      [receipt, p, pledge],
    );
    await as(
      "editor",
      "select record_support_receipt($1,$2,5,'confirmed',$3)",
      [receipt, p, pledge],
    );
    assert.equal(
      (await db.query("select received from support_projects where id=$1", [p]))
        .rows[0].received,
      5,
    );
    assert.equal(
      (
        await as("adopter", "select status from support_pledges where id=$1", [
          pledge,
        ])
      ).rows[0].status,
      "received",
    );
    await assert.rejects(
      as("adopter", "select cancel_support_pledge($1)", [pledge]),
    );
    await as("owner", "select void_support_receipt($1,'Duplicate entry')", [
      receipt,
    ]);
    await as("owner", "select void_support_receipt($1,'Duplicate entry')", [
      receipt,
    ]);
    assert.equal(
      (await db.query("select received from support_projects where id=$1", [p]))
        .rows[0].received,
      0,
    );
    assert.equal(
      (await as("owner", "select * from support_receipts")).rows.length,
      1,
    );
    assert.equal(
      (await as("other", "select * from support_receipts")).rows.length,
      0,
    );
    assert.equal(
      (await as("reader", "select * from support_pledges")).rows[0]
        .contact_email,
      "adopter@test.local",
    );
    assert.equal(
      (await as("other", "select * from support_pledges")).rows.length,
      0,
    );
    await db.exec("set role anon");
    assert.equal(
      (await db.query("select * from support_projects")).rows.length,
      1,
    );
    await assert.rejects(db.query("select * from support_pledges"));
    await assert.rejects(db.query("select * from support_receipts"));
    await db.exec("reset role");
    await as(
      "owner",
      "update support_projects set status='closed' where id=$1",
      [p],
    );
    await assert.rejects(
      as(
        "adopter",
        "select pledge_support('40000000-0000-0000-0000-000000000003',$1,1,'')",
        [p],
      ),
    );
    await as(
      "owner",
      "update support_projects set published=false where id=$1",
      [p],
    );
    await db.exec("set role anon");
    assert.equal(
      (await db.query("select * from support_projects")).rows.length,
      0,
    );
    await db.exec("reset role");
  } finally {
    await db.close();
  }
});
test("support publication, updates, deadlines and monetary receipts are scoped to verified shelters", async () => {
  const { db, shelter, as, ids } = await setup();
  try {
    await db.query("update canis set verificado=false where id=$1", [shelter]);
    await assert.rejects(
      as(
        "owner",
        "insert into support_projects(canil_id,kind,title,description,goal,unit,published) values($1,'money','Campanha','Tratamentos para os animais.',10000,'EUR',true)",
        [shelter],
      ),
    );
    const p = (
      await as(
        "owner",
        "insert into support_projects(canil_id,kind,title,description,goal,unit) values($1,'money','Campanha','Tratamentos para os animais.',10000,'EUR') returning id",
        [shelter],
      )
    ).rows[0].id;
    await assert.rejects(
      as(
        "owner",
        "update support_projects set donation_url='javascript:alert(1)' where id=$1",
        [p],
      ),
    );
    await as(
      "owner",
      "insert into support_updates(project_id,body) values($1,'Preparámos a campanha.')",
      [p],
    );
    await db.exec("set role anon");
    assert.equal(
      (await db.query("select * from support_updates")).rows.length,
      0,
    );
    await db.exec("reset role");
    await db.query("update canis set verificado=true where id=$1", [shelter]);
    await as(
      "owner",
      "update support_projects set published=true where id=$1",
      [p],
    );
    await as(
      "editor",
      "select record_support_receipt('40000000-0000-0000-0000-000000000004',$1,1250,'External receipt',null)",
      [p],
    );
    assert.equal(
      (await db.query("select received from support_projects where id=$1", [p]))
        .rows[0].received,
      1250,
    );
    await assert.rejects(
      as(
        "adopter",
        "select pledge_support('40000000-0000-0000-0000-000000000005',$1,5,'')",
        [p],
      ),
    );
    const g = (
      await as(
        "owner",
        "insert into support_projects(canil_id,kind,title,description,goal,unit,published,deadline) values($1,'goods','Mantas','Precisamos de mantas.',10,'mantas',true,current_date-1) returning id",
        [shelter],
      )
    ).rows[0].id;
    await assert.rejects(
      as(
        "adopter",
        "select pledge_support('40000000-0000-0000-0000-000000000006',$1,1,'')",
        [g],
      ),
    );
    await as("owner", "update support_projects set deadline=null where id=$1", [
      g,
    ]);
    await as(
      "adopter",
      "select pledge_support('40000000-0000-0000-0000-000000000006',$1,1,'')",
      [g],
    );
    await assert.rejects(
      as(
        "reader",
        "select cancel_support_pledge('40000000-0000-0000-0000-000000000006')",
      ),
    );
    await as(
      "adopter",
      "select cancel_support_pledge('40000000-0000-0000-0000-000000000006')",
    );
    await db.query("update canis set verificado=false where id=$1", [shelter]);
    await db.exec("set role anon");
    assert.equal(
      (await db.query("select * from support_projects")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from support_updates")).rows.length,
      0,
    );
    await db.exec("reset role");
    assert.ok(ids.owner);
  } finally {
    await db.close();
  }
});
