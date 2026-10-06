import test from "node:test";
import assert from "node:assert/strict";
import { createTestDatabase } from "../scripts/test-database.mjs";

async function setup() {
  const db = await createTestDatabase();
  const ids = {
    admin: "30000000-0000-0000-0000-000000000001",
    seller: "30000000-0000-0000-0000-000000000002",
    adopter: "30000000-0000-0000-0000-000000000003",
    shelterOwner: "30000000-0000-0000-0000-000000000004",
  };
  for (const [name, id] of Object.entries(ids))
    await db.query(
      "insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)",
      [
        id,
        name + "@test.local",
        JSON.stringify({
          role: name === "shelterOwner" ? "canil" : "user",
          full_name: name,
        }),
      ],
    );
  await db.query("update profiles set role='admin' where id=$1", [ids.admin]);
  // Supabase grants table privileges to authenticated by default; RLS and triggers decide.
  await db.exec("grant insert on animais, canis to authenticated");
  // Accounts older than 48 hours, so only the rule under test flags a listing.
  await db.exec("update profiles set created_at=now()-interval '10 days'");
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
  const anon = async (sql, args = []) => {
    await db.exec("set role anon");
    try {
      return await db.query(sql, args);
    } finally {
      await db.exec("reset role");
    }
  };
  return { db, ids, as, anon };
}

const insertAnimal = (canil, nome, extra = {}) => [
  "insert into animais(canil_id,nome,especie,raca,idade_anos,descricao,published) values($1,$2,'cao',$3,$4,$5,true) returning id,moderacao,moderacao_motivos",
  [canil, nome, extra.raca ?? null, extra.idade ?? 3, extra.descricao ?? null],
];

test("individuals list animals through a personal shelter with automatic screening", async () => {
  const { db, as, anon } = await setup();
  try {
    await assert.rejects(
      as(
        "shelterOwner",
        "select start_individual_listing('Porto','912345678')",
      ),
      /Adopter account required/,
    );
    await assert.rejects(
      as("seller", "select start_individual_listing('Porto','12')"),
      /Invalid listing contact/,
    );
    const canil = (
      await as(
        "seller",
        "select start_individual_listing('Porto','912345678') id",
      )
    ).rows[0].id;
    assert.equal(
      (
        await as(
          "seller",
          "select start_individual_listing('Lisboa','912345678') id",
        )
      ).rows[0].id,
      canil,
      "one personal shelter per person",
    );
    const publicRow = (
      await anon("select nome,telefone,email_contacto from canis where id=$1", [
        canil,
      ])
    ).rows[0];
    assert.deepEqual(
      publicRow,
      { nome: "seller", telefone: null, email_contacto: null },
      "no personal contacts on the public row",
    );
    assert.equal(
      (await as("seller", "select telefone from individual_contacts")).rows[0]
        .telefone,
      "912345678",
    );
    assert.equal(
      (await as("adopter", "select * from individual_contacts")).rows.length,
      0,
    );
    assert.equal(
      (await as("admin", "select * from individual_contacts")).rows.length,
      1,
    );
    await assert.rejects(
      as(
        "seller",
        "insert into canis(owner_profile_id,nome,localizacao,tipo) values(auth.uid(),'x','y','particular')",
      ),
      /Protected shelter fields|permission denied/,
    );
    await assert.rejects(
      as("seller", "update canis set verificado=true where id=$1", [canil]),
      /Protected shelter fields|permission denied/,
    );

    // Clean listing: approved, but hidden until it has a photo.
    const clean = (
      await as(
        "seller",
        ...insertAnimal(canil, "Bobi", {
          descricao: "Muito meigo, dá-se bem com crianças.",
        }),
      )
    ).rows[0];
    assert.equal(clean.moderacao, "aprovado");
    assert.equal(
      (await anon("select id from animais where id=$1", [clean.id])).rows
        .length,
      0,
    );
    await db.query(
      "insert into animal_fotos(animal_id,storage_path,public_url,is_primary) values($1,'p/1.jpg','https://x/1.jpg',true)",
      [clean.id],
    );
    assert.equal(
      (await anon("select id from animais where id=$1", [clean.id])).rows
        .length,
      1,
    );
    assert.equal(
      (
        await anon("select id from canis where id=$1 and tipo='particular'", [
          canil,
        ])
      ).rows.length,
      1,
    );

    // Payment requests are refused outright.
    for (const descricao of [
      "Envio por MB Way",
      "Taxa de reserva de 50€",
      "pagamento por IBAN",
    ])
      await assert.rejects(
        as("seller", ...insertAnimal(canil, "Rex", { descricao })),
        /FYA_PAYMENT_TERMS/,
      );

    // Suspicious patterns wait for an administrator.
    const flagged = (
      await as(
        "seller",
        ...insertAnimal(canil, "Mimi", {
          raca: "Bulldog Francês",
          idade: 0,
          descricao: "Liga para 912 345 678 ou WhatsApp",
        }),
      )
    ).rows[0];
    assert.equal(flagged.moderacao, "pendente");
    assert.deepEqual(flagged.moderacao_motivos, [
      "contactos_externos",
      "raca_procurada_cachorro",
    ]);
    await db.query(
      "insert into animal_fotos(animal_id,storage_path,public_url,is_primary) values($1,'p/2.jpg','https://x/2.jpg',true)",
      [flagged.id],
    );
    assert.equal(
      (await anon("select id from animais where id=$1", [flagged.id])).rows
        .length,
      0,
    );
    await assert.rejects(
      as("adopter", "select submit_adoption($1,'{}'::jsonb,'Olá')", [
        flagged.id,
      ]),
      /Animal unavailable/,
    );
    await assert.rejects(
      as("seller", "update animais set moderacao='aprovado' where id=$1", [
        flagged.id,
      ]),
      /permission denied/,
    );
    await assert.rejects(
      as("seller", "select moderate_animal($1,'aprovado')", [flagged.id]),
      /Administrator required/,
    );
    await as(
      "admin",
      "select moderate_animal($1,'aprovado','Confirmado por telefone')",
      [flagged.id],
    );
    assert.equal(
      (await anon("select id from animais where id=$1", [flagged.id])).rows
        .length,
      1,
    );
    // A status change keeps the decision; editing the text screens it again.
    await as("seller", "select manage_animal($1,'reservado')", [flagged.id]);
    assert.equal(
      (
        await db.query("select moderacao from animais where id=$1", [
          flagged.id,
        ])
      ).rows[0].moderacao,
      "aprovado",
    );
    await as("seller", "select save_animal_details($1,$2)", [
      flagged.id,
      {
        nome: "Mimi",
        especie: "cao",
        raca: "Bulldog Francês",
        idade_anos: 0,
        descricao: "Contacto: mimi@exemplo.pt",
        status: "reservado",
        compatibilidades: [],
      },
    ]);
    assert.equal(
      (
        await db.query("select moderacao from animais where id=$1", [
          flagged.id,
        ])
      ).rows[0].moderacao,
      "pendente",
    );

    // At most three active listings per person.
    await as("seller", ...insertAnimal(canil, "Tico"));
    await assert.rejects(
      as("seller", ...insertAnimal(canil, "Teco")),
      /FYA_LISTING_LIMIT/,
    );

    // Owners cannot apply for their own animal; adopters can.
    await assert.rejects(
      as("seller", "select submit_adoption($1,'{}'::jsonb,'Olá')", [clean.id]),
      /Owners cannot adopt/,
    );
    await as("adopter", "select submit_adoption($1,'{}'::jsonb,'Olá')", [
      clean.id,
    ]);
    assert.equal(
      (
        await as("seller", "select id from pedidos_adocao where animal_id=$1", [
          clean.id,
        ])
      ).rows.length,
      1,
      "the individual receives the request like a shelter",
    );
  } finally {
    await db.close();
  }
});

test("new accounts and the manual review setting send listings to the queue", async () => {
  const { db, ids, as } = await setup();
  try {
    await db.query("update profiles set created_at=now() where id=$1", [
      ids.seller,
    ]);
    const canil = (
      await as(
        "seller",
        "select start_individual_listing('Braga','+351 912345678') id",
      )
    ).rows[0].id;
    const recent = (await as("seller", ...insertAnimal(canil, "Nina"))).rows[0];
    assert.deepEqual(recent.moderacao_motivos, ["conta_recente"]);
    await db.query(
      "update profiles set created_at=now()-interval '10 days' where id=$1",
      [ids.seller],
    );
    await db.query(
      "insert into app_settings(key,value) values('platform_settings','{\"requireIndividualReview\":true}') on conflict(key) do update set value=excluded.value",
    );
    const manual = (await as("seller", ...insertAnimal(canil, "Kiko"))).rows[0];
    assert.deepEqual(manual.moderacao_motivos, ["revisao_manual"]);
    // Shelters are never screened.
    const shelter = (
      await db.query("select id from canis where owner_profile_id=$1", [
        ids.shelterOwner,
      ])
    ).rows[0].id;
    const shelterAnimal = (
      await as(
        "shelterOwner",
        ...insertAnimal(shelter, "Luna", { descricao: "Liga 912345678" }).map(
          (v, i) => (i === 0 ? v.replace(",true)", ",false)") : v),
        ),
      )
    ).rows[0];
    assert.equal(shelterAnimal.moderacao, "aprovado");
  } finally {
    await db.close();
  }
});
