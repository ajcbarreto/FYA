import { test, expect } from "@playwright/test";
import { accounts, admin, createAnimal, login } from "./helpers";

test("public shelter filters, visiting information, news and verified reviews work end to end", async ({
  page,
  browser,
}) => {
  const stamp = Date.now(),
    title = `Novidade ${stamp}`,
    dog = await createAnimal(`Companheiro ${stamp}`);
  const { error: adoptionError } = await admin.from("pedidos_adocao").insert({
    animal_id: dog.id,
    canil_id: accounts.shelter.shelterId,
    applicant_profile_id: accounts.adopter.id,
    status: "concluido",
  });
  if (adoptionError) throw adoptionError;
  await login(page, "shelter");
  await page.goto("/pt/canil/pagina-publica");
  await page.locator('[name="visit_hours"]').fill("Segunda a sexta, 10h–17h");
  await page
    .locator('[name="visit_instructions"]')
    .fill("Marca a visita por email antes de te deslocares.");
  await page
    .getByRole("button", { name: "Guardar informações", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Guardado");
  await page.locator('[name="title"]').fill(title);
  await page
    .locator('[name="body"]')
    .fill("Hoje recebemos novos apoios para os nossos animais.");
  await page.locator('input[type="checkbox"][name="published"]').check();
  await page
    .getByRole("button", { name: "Guardar novidade", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  const context = await browser.newContext();
  try {
    const adopter = await context.newPage();
    await login(adopter, "adopter");
    await adopter.goto(`/pt/canis/${accounts.shelter.shelterId}`);
    await expect(adopter.locator("#contactos")).toContainText(
      "Segunda a sexta, 10h–17h",
    );
    await expect(adopter.locator("#novidades")).toContainText(title);
    await adopter
      .getByRole("searchbox", { name: "Nome ou raça" })
      .fill(dog.nome);
    await expect(adopter.locator('#animais a[href*="/pets/"]')).toHaveCount(1);
    await adopter
      .getByRole("combobox", { name: "Espécie", exact: true })
      .selectOption("gato");
    await expect(adopter.locator("#animais")).toContainText(
      "Não há animais com estes filtros",
    );
    await adopter
      .getByRole("button", { name: "Limpar filtros", exact: true })
      .click();
    await adopter.locator('[name="rating"]').selectOption("2");
    await adopter
      .locator('[name="comentario"]')
      .fill(`Experiência de adoção ${stamp}: há aspetos a melhorar.`);
    await adopter
      .getByRole("button", { name: "Enviar avaliação", exact: true })
      .click();
    await expect(adopter.locator("#comentarios")).toContainText(
      `Experiência de adoção ${stamp}`,
    );
    await expect(adopter.locator("#comentarios")).toContainText(
      "Adoção confirmada",
    );
    const { data: review, error } = await admin
      .from("avaliacoes_canil")
      .select("id")
      .eq("canil_id", accounts.shelter.shelterId)
      .eq("author_profile_id", accounts.adopter.id)
      .single();
    if (error) throw error;
    await page.goto("/pt/canil/avaliacoes");
    const article = page
      .locator("article")
      .filter({ hasText: `Experiência de adoção ${stamp}` });
    await expect(
      article.getByRole("button", { name: "Aprovar", exact: true }),
    ).toHaveCount(0);
    await article
      .locator('[name="body"]')
      .fill("Obrigado pelo comentário. Vamos melhorar o acompanhamento.");
    await article.getByRole("button", { name: "Guardar resposta" }).click();
    await expect(page.getByRole("status")).toContainText("Resposta guardada");
    await adopter.reload();
    await expect(adopter.locator("#comentarios")).toContainText(
      "Vamos melhorar o acompanhamento.",
    );
    await page.goto("/pt/canil/avaliacoes");
    const reportArticle = page
      .locator("article")
      .filter({ hasText: `Experiência de adoção ${stamp}` });
    await reportArticle.locator("summary").click();
    await reportArticle
      .locator('[name="reason"]')
      .fill("Solicitamos análise do conteúdo pela plataforma.");
    await reportArticle
      .getByRole("button", { name: "Enviar denúncia" })
      .click();
    const adminContext = await browser.newContext();
    try {
      const moderator = await adminContext.newPage();
      await login(moderator, "admin");
      await moderator.goto("/pt/admin/avaliacoes");
      const item = moderator.locator("article").filter({
        has: moderator.locator(`input[name="reviewId"][value="${review.id}"]`),
      });
      await expect(item).toContainText("Solicitamos análise");
      await item.locator('[name="decision"]').selectOption("aprovada");
      await item
        .locator('[name="reason"]')
        .fill("Opinião válida sobre a experiência; manter visível.");
      await item.getByRole("button", { name: "Registar decisão" }).click();
      await expect(moderator.getByRole("status")).toContainText(
        "Decisão registada",
      );
      await adopter.reload();
      await expect(adopter.locator("#comentarios")).toContainText(
        `Experiência de adoção ${stamp}`,
      );
    } finally {
      await adminContext.close();
    }
  } finally {
    await context.close();
  }
});
