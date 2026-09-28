import { test, expect } from "@playwright/test";
import jsQR from "jsqr";
import { admin, login, createAnimal } from "./helpers";
test("public help search, pilot contact capture and private administrator follow-up", async ({
  browser,
}) => {
  const context = await browser.newContext(),
    p = await context.newPage();
  await p.goto("/pt/ajuda");
  await p.getByRole("searchbox", { name: "Pesquisar ajuda" }).fill("MICROCHIP");
  await p.getByRole("button", { name: "Pesquisar", exact: true }).click();
  await p.getByRole("link", { name: /Registar e publicar um animal/ }).click();
  await expect(
    p.getByRole("heading", { name: "Registar e publicar um animal" }),
  ).toBeVisible();
  await expect(
    p.getByText(
      "O vídeo ainda está a ser preparado. Os passos estão descritos abaixo.",
    ),
  ).toBeVisible();
  await p.setViewportSize({ width: 390, height: 844 });
  expect(
    await p.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await p.screenshot({ path: "test-results/help-mobile.png", fullPage: true });
  await p.goto("/en/ajuda/documentos-dossier");
  await expect(
    p.getByRole("heading", { name: "Documents and adoption dossier" }),
  ).toBeVisible();
  await p.goto("/pt/para-canis");
  const organization = `E2E Piloto ${Date.now()}`;
  await p
    .getByLabel("Nome do canil / associação", { exact: true })
    .fill(organization);
  await p.getByLabel("O teu nome", { exact: true }).fill("Pessoa Fictícia");
  await p
    .getByRole("textbox", { name: "Email", exact: true })
    .fill(`pilot-${Date.now()}@example.test`);
  await p.getByLabel("Localidade", { exact: true }).fill("Lisboa");
  await p
    .locator("[name=message]")
    .fill("Gostava de uma demonstração. Dados fictícios.");
  await p.locator("[name=consent]").check();
  await p
    .getByRole("button", { name: "Pedir contacto sobre o piloto" })
    .click();
  await expect(p).toHaveURL(/success=received/);
  const { data: request, error } = await admin
    .from("pilot_requests")
    .select("id,status")
    .eq("organization", organization)
    .single();
  if (error) throw error;
  expect(request!.status).toBe("new");
  await p.setViewportSize({ width: 390, height: 844 });
  expect(
    await p.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await p.screenshot({ path: "test-results/pilot-mobile.png", fullPage: true });
  await login(p, "admin");
  await p.goto("/pt/admin/pilotos");
  const form = p.locator("form").filter({
    has: p.getByRole("heading", { name: organization, exact: true }),
  });
  await form
    .getByRole("combobox", { name: "Estado" })
    .selectOption("contacted");
  await form
    .getByRole("textbox", { name: "Notas internas" })
    .fill("Contacto a preparar; teste local.");
  await form.getByRole("button", { name: "Guardar acompanhamento" }).click();
  await expect
    .poll(
      async () =>
        (
          await admin
            .from("pilot_requests")
            .select("status")
            .eq("id", request!.id)
            .single()
        ).data?.status,
    )
    .toBe("contacted");
  await context.close();
});
test("getting started, private timeline and printable public QR preserve data boundaries", async ({
  browser,
}) => {
  const animal = await createAnimal(`E2E Print ${Date.now()}`);
  const { error } = await admin.from("animal_records").insert({
    animal_id: animal.id,
    intake_date: "2026-09-01",
    microchip: "PRIVATE-MICROCHIP",
    internal_notes: "PRIVATE-PRINT-NOTE",
  });
  if (error) throw error;
  const c = await browser.newContext(),
    p = await c.newPage();
  await login(p, "shelter");
  await p.goto("/pt/canil/primeiros-passos");
  await expect(
    p.getByRole("heading", { name: "Primeiros passos", exact: true }),
  ).toBeVisible();
  await expect(p.getByRole("progressbar")).toHaveAttribute("max", "4");
  await p.goto(`/pt/canil/animais/${animal.id}/historico`);
  await expect(
    p.getByRole("heading", { name: "Registo privado atualizado", exact: true }),
  ).toBeVisible();
  await expect(p.getByText("PRIVATE-PRINT-NOTE")).toHaveCount(0);
  await p.goto(`/pt/pets/${animal.id}/imprimir`);
  await expect(
    p.getByRole("heading", { name: animal.nome, exact: true }),
  ).toBeVisible();
  await expect(p.getByText("PRIVATE-MICROCHIP")).toHaveCount(0);
  const img = p.getByTestId("animal-qr");
  await expect
    .poll(() =>
      img.evaluate(
        (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
      ),
    )
    .toBe(true);
  const pixels = await img.evaluate((el: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = el.naturalWidth;
    canvas.height = el.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(el, 0, 0);
    return {
      width: canvas.width,
      height: canvas.height,
      data: Array.from(
        ctx.getImageData(0, 0, canvas.width, canvas.height).data,
      ),
    };
  });
  expect(
    jsQR(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height)?.data,
  ).toBe(`${process.env.NEXT_PUBLIC_APP_URL}/pt/pets/${animal.id}`);
  await p.emulateMedia({ media: "print" });
  await p.setViewportSize({ width: 794, height: 1123 });
  await p.screenshot({ path: "test-results/animal-print.png", fullPage: true });
  const pdf = await p.pdf({
    path: "test-results/animal-print.pdf",
    format: "A4",
    preferCSSPageSize: true,
    printBackground: true,
  });
  expect(pdf.toString("latin1").match(/\/Type \/Page\b/g)?.length).toBe(1);
  await p.emulateMedia({ media: "screen" });
  await admin.from("animais").update({ published: false }).eq("id", animal.id);
  await p.goto(`/pt/pets/${animal.id}/imprimir`);
  await expect(
    p.getByRole("heading", {
      name: "Não encontrámos esta página",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    p.getByRole("heading", { name: animal.nome, exact: true }),
  ).toHaveCount(0);
  const other = await browser.newContext(),
    op = await other.newPage();
  await login(op, "other-shelter");
  await op.goto(`/pt/canil/animais/${animal.id}/historico`);
  await expect(
    op.getByRole("heading", {
      name: "Não encontrámos esta página",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    op.getByText("Registo privado atualizado", { exact: true }),
  ).toHaveCount(0);
  await other.close();
  await c.close();
});
