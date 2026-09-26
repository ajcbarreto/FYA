import { test, expect } from "@playwright/test";
import { admin, login } from "./helpers";

test("support counts confirmed receipts and keeps promises private", async ({
  page,
  browser,
}) => {
  await login(page, "shelter");
  await page.goto("/pt/canil/apoios");
  await page.locator('[name="title"]').fill(`Ração teste ${Date.now()}`);
  await page
    .locator('textarea[name="description"]')
    .fill("Campanha fictícia de ração para testes locais.");
  await page.locator('[name="unit"]').fill("sacos");
  await page.locator('[name="goal"]').fill("10");
  await page.locator('[name="published"]').check();
  await page.getByRole("button", { name: "Guardar apoio" }).click();
  await expect(page).toHaveURL(/\/canil\/apoios\/[0-9a-f-]+/);
  const id = new URL(page.url()).pathname.split("/").at(-1)!;
  const total = async () => {
    const { data, error } = await admin
      .from("support_projects")
      .select("received")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data.received;
  };
  const context = await browser.newContext();
  try {
    const supporter = await context.newPage();
    await login(supporter, "adopter");
    await supporter.goto(`/pt/apoios/${id}`);
    await supporter.locator('[name="quantity"]').fill("3");
    await supporter
      .locator('[name="message"]')
      .fill("Mensagem privada da promessa.");
    await supporter.locator('[name="contact_consent"]').check();
    await supporter
      .getByRole("button", { name: "Registar promessa de ajuda" })
      .click();
    await expect(supporter.getByRole("status")).toContainText(
      "Promessa registada",
    );
    expect(await total()).toBe(0);
    await page.reload();
    await page
      .getByRole("button", { name: "Confirmar entrega completa" })
      .click();
    await expect.poll(total).toBe(3);
    await supporter.reload();
    await expect(supporter.getByRole("progressbar")).toHaveAttribute(
      "value",
      "3",
    );
    await expect(
      supporter.getByText("Mensagem privada da promessa.", { exact: true }),
    ).toHaveCount(0);
    await page.reload();
    await page.locator('[name="reason"]').fill("Correção de registo de teste");
    await page
      .getByRole("button", { name: "Anular registo", exact: true })
      .click();
    await expect.poll(total).toBe(0);
  } finally {
    await context.close();
  }
});
