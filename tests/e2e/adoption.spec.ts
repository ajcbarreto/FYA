import { test, expect } from "@playwright/test";
import { accounts, admin, login, createAnimal } from "./helpers";

test("administrator verifies shelter; shelter creates, edits, uploads and removes animal", async ({
  browser,
}) => {
  const adminContext = await browser.newContext();
  const a = await adminContext.newPage();
  const shelterContext = await browser.newContext();
  const s = await shelterContext.newPage();
  await admin
    .from("canis")
    .update({ verificado: false })
    .eq("id", accounts.shelter.shelterId!);
  await login(a, "admin");
  await a.goto("/pt/admin/canis");
  const verifyForm = a
    .locator("form")
    .filter({
      has: a.locator(
        `input[name=shelterId][value="${accounts.shelter.shelterId}"]`,
      ),
    });
  await verifyForm.locator("button").click();
  await expect(a).toHaveURL(/success=shelter_verified/);
  await login(s, "shelter");
  await s.goto("/pt/canil/animais/novo");
  const name = `E2E Animal ${Date.now()}`;
  await s.locator("[name=nome]").fill(name);
  await s.locator("[name=especie]").selectOption("cao");
  await s.locator("[name=sexo]").selectOption("macho");
  await s.locator("[name=porte]").selectOption("medio");
  await s.locator("[name=idade_anos]").fill("2");
  await s
    .locator("[name=descricao]")
    .fill("Animal fictício criado pelo teste no browser.");
  await s.locator("main form button[type=submit]").click();
  await expect(s).toHaveURL(/animais\/.+\?success=created/);
  const id = new URL(s.url()).pathname.split("/").pop()!;
  await s.locator("[name=nome]").fill(`${name} editado`);
  await s.getByRole("button", { name: "Guardar dados" }).click();
  await expect(s).toHaveURL(/success=/);
  const photo = s.locator("form").filter({ has: s.locator("[name=photo]") });
  await s
    .locator("[name=photo]")
    .setInputFiles({
      name: "test-animal.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ioAAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await photo.locator("button").click();
  await expect(s).toHaveURL(/success=uploaded/);
  const { data: photos } = await admin
    .from("animal_fotos")
    .select("*")
    .eq("animal_id", id);
  expect(photos).toHaveLength(1);
  await s.goto(`/pt/pets/${id}`);
  await expect(
    s.getByRole("heading", { name: `${name} editado`, exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      s
        .locator("main img")
        .first()
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBe(true);
  await s.goto(`/pt/canil/animais/${id}`);
  s.on("dialog", (dialog) => dialog.accept());
  await s.getByRole("button", { name: /Eliminar animal/ }).click();
  await expect(s).toHaveURL(/\/canil\/animais\?success=deleted/);
  await adminContext.close();
  await shelterContext.close();
});

test("favorites, draft, application, two-way realtime chat, reconnect, visit and completed adoption", async ({
  browser,
}) => {
  test.setTimeout(120000);
  const animal = await createAnimal(`E2E Adoção ${Date.now()}`);
  const uc = await browser.newContext();
  const sc = await browser.newContext();
  const u = await uc.newPage();
  const s = await sc.newPage();
  await login(u, "adopter");
  await login(s, "shelter");
  await u.goto(`/pt/pets/${animal.id}`);
  await u.getByRole("button", { name: "Guardar animal", exact: true }).click();
  await expect(
    u.getByRole("button", { name: "Remover dos favoritos" }),
  ).toHaveAttribute("aria-pressed", "true");
  await u.reload();
  await expect(
    u.getByRole("button", { name: "Remover dos favoritos" }),
  ).toBeVisible();
  await u.locator("[name=housing_type]").selectOption("house");
  await u.locator("[name=household_size]").selectOption("3");
  await u.getByRole("button", { name: "Continuar", exact: true }).click();
  await u.locator("[name=experience]").selectOption("some");
  await u.locator("[name=hours_alone]").selectOption("3-5");
  await u
    .locator("[name=reason]")
    .fill("Queremos acolher este animal com carinho e responsabilidade.");
  await u
    .locator("[name=message]")
    .fill("Olá, gostaríamos de conhecer este animal.");
  await u.reload();
  // Draft restoration deliberately returns to the first step.
  await expect(u.locator("[name=housing_type]")).toHaveValue("house");
  await u.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(u.locator("[name=reason]")).toHaveValue(
    "Queremos acolher este animal com carinho e responsabilidade.",
  );
  await u.getByRole("button", { name: "Continuar", exact: true }).click();
  await u.getByRole("button", { name: "Enviar candidatura" }).click();
  await expect(u).toHaveURL(/\/user\/mensagens\?/);
  const { data: request, error } = await admin
    .from("pedidos_adocao")
    .select("id")
    .eq("animal_id", animal.id)
    .eq("applicant_profile_id", accounts.adopter.id)
    .single();
  if (error) throw error;
  const { data: conversation, error: ce } = await admin
    .from("conversas_adocao")
    .select("id")
    .eq("pedido_id", request.id)
    .single();
  if (ce) throw ce;
  await s.goto(`/pt/canil/mensagens?conversation=${conversation.id}`);
  const text = `Mensagem do adotante ${Date.now()}`;
  await u.locator("main textarea").fill(text);
  await u
    .locator("main textarea")
    .locator("..")
    .locator("..")
    .getByRole("button")
    .click();
  await expect(s.getByText(text, { exact: true })).toBeVisible();
  const reply = `Resposta do abrigo ${Date.now()}`;
  await s.locator("main textarea").fill(reply);
  await s
    .locator("main textarea")
    .locator("..")
    .locator("..")
    .getByRole("button")
    .click();
  await expect(u.getByText(reply, { exact: true })).toBeVisible();
  await uc.setOffline(true);
  await u.locator("main textarea").fill("Mensagem recuperada após falha");
  await u
    .locator("main textarea")
    .locator("..")
    .locator("..")
    .getByRole("button")
    .click();
  await expect(u.getByRole("alert")).toContainText("Mensagem não enviada");
  await expect(u.locator("main textarea")).toHaveValue(
    "Mensagem recuperada após falha",
  );
  await uc.setOffline(false);
  await u
    .locator("main textarea")
    .locator("..")
    .locator("..")
    .getByRole("button")
    .click();
  await expect(
    s.getByText("Mensagem recuperada após falha", { exact: true }),
  ).toBeVisible();
  const { count } = await admin
    .from("mensagens_adocao")
    .select("id", { count: "exact", head: true })
    .eq("conversa_id", conversation.id)
    .eq("conteudo", "Mensagem recuperada após falha");
  expect(count).toBe(1);
  await s.goto("/pt/canil/pedidos");
  const statusForm = s
    .locator("form")
    .filter({ has: s.locator(`input[name=requestId][value="${request.id}"]`) });
  await statusForm.locator("select").selectOption("entrevista");
  await statusForm.locator("button").click();
  await expect(s).toHaveURL(/success=/);
  await u.goto("/pt/user/pedidos");
  const visit = u
    .locator("form")
    .filter({ has: u.locator(`input[name=pedidoId][value="${request.id}"]`) });
  const when = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  await visit.locator("[name=scheduledAt]").fill(when);
  await visit.locator("button").click();
  await expect(u).toHaveURL(/success=/);
  await s.reload();
  const row = s
    .locator("tr")
    .filter({ has: s.locator(`input[name=requestId][value="${request.id}"]`) });
  await row.locator("summary").click();
  await row.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(s).toHaveURL(/success=/);
  for (const status of ["aprovado", "concluido"]) {
    await statusForm.locator("select").selectOption(status);
    await statusForm.locator("button").click();
    await expect(s).toHaveURL(/success=/);
  }
  const { data: done } = await admin
    .from("animais")
    .select("status")
    .eq("id", animal.id)
    .single();
  expect(done?.status).toBe("adotado");
  await u.goto("/pt/user/pedidos");
  await expect(u.getByText(animal.nome, { exact: true }).first()).toBeVisible();
  const { count: jobs } = await admin
    .from("email_outbox")
    .select("id", { count: "exact", head: true });
  expect(jobs).toBeGreaterThan(0);
  await uc.close();
  await sc.close();
});
