import { test, expect } from "@playwright/test";
import { login } from "./helpers";
test("brand proposal and private shelter support reach the admin inbox", async ({
  page,
  browser,
}, testInfo) => {
  const stamp = Date.now(),
    proposal = `Parceria ${stamp}`,
    subject = `Problema ${stamp}`;
  await page.goto("/pt/parcerias");
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  await page.screenshot({
    path: testInfo.outputPath("parcerias-desktop.png"),
    fullPage: true,
  });
  await page.locator("[name=organization]").fill("Marca Solidária");
  await page.locator("[name=contact]").fill("Maria Silva");
  await page.locator("[name=email]").fill(`brand${stamp}@example.org`);
  await page.locator("[name=website]").fill("https://example.org");
  await page.locator("[name=subject]").fill(proposal);
  await page
    .locator("[name=message]")
    .fill("Gostaríamos de apoiar os canis com alimentação.");
  await page.locator("[name=consent]").check();
  await page
    .getByRole("button", { name: "Enviar proposta", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Proposta registada");
  await login(page, "shelter");
  await page.goto("/pt/canil/ajuda-fya");
  await page.getByText("Criar um pedido de ajuda", { exact: true }).click();
  await page.locator("[name=subject]").fill(subject);
  await page
    .locator("[name=message]")
    .fill("Não consigo editar um animal e preciso de ajuda.");
  await page
    .getByRole("button", { name: "Enviar pedido", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: subject, exact: true }),
  ).toBeVisible();
  const helpUrl = page.url();
  const context = await browser.newContext();
  try {
    const manager = await context.newPage();
    await login(manager, "admin");
    await manager.goto("/pt/admin/contactos?kind=partnership");
    await manager.getByRole("link").filter({ hasText: proposal }).click();
    await manager.locator("[name=status]").selectOption("negotiating");
    await manager.locator("[name=body]").fill("Contacto agendado com a marca.");
    await manager
      .getByRole("button", { name: "Guardar acompanhamento" })
      .click();
    await expect(manager.locator("textarea[name=body]")).toHaveValue("");
    await manager.goto("/pt/admin/contactos?kind=help");
    await manager.getByRole("link").filter({ hasText: subject }).click();
    await manager.locator("[name=status]").selectOption("in_progress");
    await manager
      .locator("[name=body]")
      .fill("Nota privada para a administração.");
    await manager.locator("[name=internal]").check();
    await manager
      .getByRole("button", { name: "Guardar acompanhamento" })
      .click();
    await expect(manager.getByText("Nota privada para a administração.", {exact:true})).toBeVisible();
    await page.goto(helpUrl);
    await expect(
      page.getByText("Nota privada para a administração.", { exact: true }),
    ).toHaveCount(0);
    await manager.locator("[name=status]").selectOption("waiting");
    await manager
      .locator("[name=body]")
      .fill("Podes voltar a tentar editar o animal?");
    await manager.locator("[name=internal]").uncheck();
    await manager
      .getByRole("button", { name: "Guardar acompanhamento" })
      .click();
    await expect(manager.getByText("Podes voltar a tentar editar o animal?", {exact:true})).toBeVisible();
    await page.reload();
    await expect(
      page.getByText("Podes voltar a tentar editar o animal?", { exact: true }),
    ).toBeVisible();
    await page.locator("[name=body]").fill("Já funciona, obrigado pelo apoio!");
    await page.getByRole("button", { name: "Guardar acompanhamento" }).click();
    await expect(page.getByText("Já funciona, obrigado pelo apoio!", {exact:true})).toBeVisible();
    await manager.reload();
    await expect(
      manager.getByText("Já funciona, obrigado pelo apoio!", { exact: true }),
    ).toBeVisible();
    await manager.locator("[name=status]").selectOption("resolved");
    await manager
      .locator("[name=body]")
      .fill("Resolução confirmada pelo canil.");
    await manager
      .getByRole("button", { name: "Guardar acompanhamento" })
      .click();
    await expect(manager.getByText("Resolução confirmada pelo canil.", {exact:true})).toBeVisible();
    await page.reload();
    await expect(
      page.getByText("Pedido concluído.", { exact: false }),
    ).toBeVisible();
    await page.setViewportSize({ width: 390, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.screenshot({
      path: testInfo.outputPath("apoio-mobile.png"),
      fullPage: true,
    });
  } finally {
    await context.close();
  }
});
