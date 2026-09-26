import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { accounts, admin, login, createAnimal } from "./helpers";
test.beforeEach(async () => {
  await admin
    .from("shelter_memberships")
    .delete()
    .eq("profile_id", accounts.other.id)
    .eq("canil_id", accounts.shelter.shelterId!);
  await admin
    .from("shelter_invitations")
    .delete()
    .eq("email", accounts.other.email)
    .eq("canil_id", accounts.shelter.shelterId!);
});
async function client(name: string) {
  const c = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { error } = await c.auth.signInWithPassword(accounts[name]);
  if (error) throw error;
  return c;
}
test("private animal record, real storage upload, authenticated dossier and revocation", async ({
  browser,
}) => {
  test.setTimeout(120000);
  await admin
    .from("canis")
    .update({ verificado: true })
    .eq("id", accounts.shelter.shelterId!);
  const animal = await createAnimal(`E2E Dossier ${Date.now()}`);
  const sc = await browser.newContext(),
    uc = await browser.newContext(),
    oc = await browser.newContext();
  const s = await sc.newPage(),
    u = await uc.newPage(),
    other = await oc.newPage();
  await login(s, "shelter");
  await s.goto(`/pt/canil/animais/${animal.id}/registos`);
  await s.locator("[name=internal_ref]").fill("E2E-REG");
  await s.locator("[name=internal_notes]").fill("NOTA PRIVADA");
  await s.locator("[name=handover_notes]").fill("Cuidados para a família");
  await s.getByRole("button", { name: "Guardar ficha", exact: true }).click();
  await expect(s).toHaveURL(/success=saved/);
  await s.locator("[name=title]").fill("Boletim de teste");
  await s.locator("[name=shareable]").check();
  await s.locator("[name=document]").setInputFiles({
    name: "boletim.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\nTest document\n%%EOF"),
  });
  await s
    .getByRole("button", { name: "Adicionar documento", exact: true })
    .click();
  await expect(
    s.getByRole("link", { name: "Boletim de teste", exact: true }),
  ).toBeVisible();
  const { data: docs, error: de } = await admin
    .from("animal_documents")
    .select("id")
    .eq("animal_id", animal.id);
  if (de) throw de;
  expect(docs).toHaveLength(1);
  const adopter = await client("adopter");
  const owner = await client("shelter");
  const { error: ae } = await adopter.rpc("submit_adoption", {
    p_animal: animal.id,
    p_answers: {},
    p_message: "Candidatura de teste",
  });
  if (ae) throw ae;
  const { data: r } = await admin
    .from("pedidos_adocao")
    .select("id")
    .eq("animal_id", animal.id)
    .single();
  const { error: te } = await owner.rpc("transition_adoption", {
    p_request: r!.id,
    p_status: "entrevista",
    p_notes: "",
  });
  if (te) throw te;
  const share = randomUUID();
  const { error: se } = await owner.rpc("share_animal_documents", {
    p_id: share,
    p_request: r!.id,
    p_documents: [docs![0].id],
    p_days: 7,
  });
  if (se) throw se;
  await login(u, "adopter");
  await u.goto(`/pt/dossier/${share}`);
  await expect(u.getByText("Cuidados para a família")).toBeVisible();
  await expect(u.getByText("NOTA PRIVADA")).toHaveCount(0);
  const download = await u.request.get(`/api/documents/${docs![0].id}`);
  expect(download.status()).toBe(200);
  expect(download.headers()["cache-control"]).toContain("no-store");
  await login(other, "other");
  await other.goto(`/pt/dossier/${share}`);
  await expect(
    other.getByRole("heading", { name: "Dossier indisponível" }),
  ).toBeVisible();
  expect(
    (await other.request.get(`/api/documents/${docs![0].id}`)).status(),
  ).toBe(404);
  await s.reload();
  await s.getByRole("button", { name: "Revogar acesso" }).click();
  await expect(s.getByRole("button", { name: "Revogar acesso" })).toHaveCount(
    0,
  );
  await u.reload();
  await expect(
    u.getByRole("heading", { name: "Dossier indisponível" }),
  ).toBeVisible();
  expect((await u.request.get(`/api/documents/${docs![0].id}`)).status()).toBe(
    404,
  );
  await s.setViewportSize({ width: 390, height: 844 });
  await s.screenshot({
    path: "test-results/animal-record-mobile.png",
    fullPage: true,
  });
  expect(
    await s.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await sc.close();
  await uc.close();
  await oc.close();
});
test("team invitation, reader permissions, task and atomic CSV import", async ({
  browser,
}) => {
  const sc = await browser.newContext(),
    rc = await browser.newContext();
  const s = await sc.newPage(),
    r = await rc.newPage();
  await login(s, "shelter");
  await s.goto("/pt/canil/equipa");
  await s.locator("[name=email]").fill(accounts.other.email);
  await s.locator("[name=role]").selectOption("reader");
  await s.getByRole("button", { name: "Criar convite", exact: true }).click();
  await expect(s).toHaveURL(/success=saved/);
  await login(r, "other");
  await r.goto("/pt/convites");
  await r.getByRole("button", { name: "Aceitar convite" }).click();
  await expect(r).toHaveURL(/canil\/equipa/);
  const reader = await client("other");
  const { error } = await reader.from("shelter_tasks").insert({
    canil_id: accounts.shelter.shelterId,
    title: "Not allowed",
    due_at: new Date().toISOString(),
  });
  expect(error).toBeTruthy();
  await s.goto("/pt/canil/operacao");
  const taskTitle = `Tarefa de teste ${Date.now()}`;
  await s.locator("[name=title]").fill(taskTitle);
  await s.locator("input[type=datetime-local]").fill("2030-01-01T12:00");
  await s.getByRole("button", { name: "Criar tarefa", exact: true }).click();
  await expect(s.getByText(taskTitle, { exact: true })).toBeVisible();
  await s.goto("/pt/canil/importar");
  await s
    .locator("[name=csv]")
    .fill(
      `reference,name,species,breed,age,description\nTEST-${Date.now()},CSV Luna,cao,,2,Imported privately`,
    );
  await s.getByRole("button", { name: "Confirmar importação" }).click();
  await expect(s).toHaveURL(/success=1/);
  const exported = await s.request.get("/api/animals/export");
  expect(exported.status()).toBe(200);
  expect(await exported.text()).toContain("CSV Luna");
  await s.goto("/pt/canil/equipa");
  await s.getByRole("button", { name: "Remover acesso" }).click();
  await expect(s.getByRole("button", { name: "Remover acesso" })).toHaveCount(
    0,
  );
  await r.goto("/pt/canil/operacao");
  await expect(r).toHaveURL(/unauthorized/);
  await sc.close();
  await rc.close();
});

test("application queue filters, assigns and sends an edited reusable reply", async ({
  browser,
}) => {
  const animal = await createAnimal(`E2E Fila ${Date.now()}`);
  const adopter = await client("adopter");
  const { error } = await adopter.rpc("submit_adoption", {
    p_animal: animal.id,
    p_answers: {},
    p_message: "Local queue test",
  });
  if (error) throw error;
  const { data: request, error: requestError } = await admin
    .from("pedidos_adocao")
    .select("id")
    .eq("animal_id", animal.id)
    .single();
  if (requestError) throw requestError;
  await admin
    .from("pedidos_adocao")
    .update({ created_at: new Date(Date.now() - 3 * 86400000).toISOString() })
    .eq("id", request!.id);
  await admin
    .from("request_internal_notes")
    .insert({ request_id: request!.id, notes: "INTERNAL-NOTE-PRESERVED" });
  const context = await browser.newContext(),
    s = await context.newPage();
  await login(s, "shelter");
  await s.goto("/pt/canil/pedidos");
  await s
    .getByRole("searchbox", { name: "Pesquisar animal ou adotante" })
    .fill(animal.nome);
  await s.locator("[name=days]").fill("2");
  await s.locator("[name=unanswered]").check();
  await s.getByRole("button", { name: "Filtrar candidaturas" }).click();
  await expect(
    s.getByText("1 candidaturas encontradas", { exact: true }),
  ).toBeVisible();
  await expect(
    s.getByText("Sem resposta há mais de 48h", { exact: true }),
  ).toBeVisible();
  await s
    .getByLabel("Responsável pela candidatura")
    .selectOption(accounts.shelter.id);
  await s
    .getByRole("button", { name: "Guardar responsável", exact: true })
    .click();
  await expect
    .poll(
      async () =>
        (
          await admin
            .from("request_internal_notes")
            .select("assignee_id")
            .eq("request_id", request!.id)
            .single()
        ).data?.assignee_id,
    )
    .toBe(accounts.shelter.id);
  expect(
    (
      await admin
        .from("request_internal_notes")
        .select("notes")
        .eq("request_id", request!.id)
        .single()
    ).data?.notes,
  ).toBe("INTERNAL-NOTE-PRESERVED");
  await expect(
    s.getByRole("button", { name: "Guardar responsável", exact: true }),
  ).toBeEnabled();
  await s.getByText("Gerir respostas modelo", { exact: true }).click();
  const title = `E2E Modelo ${Date.now()}`;
  const newTemplate = s.locator("form").filter({
    has: s.getByRole("button", { name: "Criar modelo", exact: true }),
  });
  await newTemplate.getByLabel("Título do modelo").fill(title);
  await newTemplate
    .getByLabel("Texto do modelo")
    .fill("Olá {adotante}, vamos conversar sobre {animal}. Equipa {canil}.");
  await newTemplate
    .getByRole("button", { name: "Criar modelo", exact: true })
    .click();
  await expect
    .poll(
      async () =>
        (
          await admin
            .from("shelter_reply_templates")
            .select("id")
            .eq("title", title)
        ).data?.length,
    )
    .toBe(1);
  await expect(
    s.locator("button").filter({ hasText: "Criar modelo" }),
  ).toBeEnabled();
  // The selected filters survive mutations.
  expect(new URL(s.url()).searchParams.get("q")).toBe(animal.nome);
  await s.getByText("Responder ao adotante", { exact: true }).click();
  await s
    .getByRole("combobox", { name: "Resposta modelo", exact: true })
    .selectOption({ label: title });
  await s.getByRole("button", { name: "Inserir modelo no texto" }).click();
  const message = s.getByRole("textbox", {
    name: "Mensagem para o adotante",
    exact: true,
  });
  await expect(message).toHaveValue(new RegExp(animal.nome));
  expect(await message.inputValue()).not.toContain("{adotante}");
  const text = (await message.inputValue()) + " Texto revisto.";
  await message.fill(text);
  await s.getByRole("button", { name: "Enviar mensagem", exact: true }).click();
  await expect(
    s.getByText("0 candidaturas encontradas", { exact: true }),
  ).toBeVisible();
  const { data: conversation } = await admin
    .from("conversas_adocao")
    .select("id")
    .eq("pedido_id", request!.id)
    .single();
  const { data: messages } = await admin
    .from("mensagens_adocao")
    .select("conteudo")
    .eq("conversa_id", conversation!.id)
    .eq("sender_profile_id", accounts.shelter.id);
  expect(messages?.map((m) => m.conteudo)).toEqual([text]);
  expect(
    (
      await admin
        .from("pedidos_adocao")
        .select("status")
        .eq("id", request!.id)
        .single()
    ).data?.status,
  ).toBe("pendente");
  await context.close();
});
