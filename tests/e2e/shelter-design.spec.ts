import { test, expect } from "@playwright/test";
import { accounts, createAnimal } from "./helpers";

test("shelter page keeps actions accessible and fits mobile and desktop", async ({
  page,
}, testInfo) => {
  await createAnimal(`Design ${Date.now()}`);
  await page.goto(`/pt/canis/${accounts.shelter.shelterId}`);
  await expect(page.locator("#animais")).toBeVisible();
  await expect(page.locator("#animais")).toContainText("Para adoção");
  await expect(page.locator('header a[href="#contactos"]')).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
    const meet = page.locator('header a[href="#animais"]');
    expect((await meet.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    const positions = await page.evaluate(() => ({
      animals: document.getElementById("animais")!.getBoundingClientRect().top,
      about: document.getElementById("sobre")!.getBoundingClientRect().top,
    }));
    expect(positions.animals).toBeLessThan(positions.about);
    if (width === 390 || width === 1440) {
      await page.screenshot({
        path: testInfo.outputPath(`canil-${width}.png`),
        fullPage: true,
      });
    }
  }
  await page.locator('header a[href="#contactos"]').click();
  await expect(page).toHaveURL(/#contactos$/);
  await expect(page.locator("#contactos")).toBeInViewport();
  const more = page.getByRole("button", { name: /Mostrar mais animais/ });
  if (await more.count()) {
    const before = await page.locator('#animais a[href*="/pets/"]').count();
    await more.click();
    expect(
      await page.locator('#animais a[href*="/pets/"]').count(),
    ).toBeGreaterThan(before);
  }
});

test("shelter directory fits narrow screens and offers clear search", async ({
  page,
}) => {
  await page.goto("/pt/canis");
  await expect(
    page.getByRole("heading", { name: "Canis e abrigos parceiros" }),
  ).toBeVisible();
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  }
});

test("directory filters survive navigation and map loads only on request", async ({
  page,
}) => {
  await page.goto("/pt/canis");
  await expect(
    page.getByRole("heading", { name: "Canis e abrigos parceiros" }),
  ).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page
    .getByRole("searchbox", { name: "Procurar abrigos" })
    .fill("NoMatchingShelter987654");
  await page.getByRole("button", { name: "Procurar", exact: true }).click();
  await expect(
    page.getByText("Sem canis encontrados para essa pesquisa."),
  ).toBeVisible();
  await page.getByRole("link", { name: "Limpar filtros" }).click();
  await expect(
    page.getByRole("searchbox", { name: "Procurar abrigos" }),
  ).toHaveValue("");
  await page.route("https://maps.google.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<p>Map provider stub</p>",
    }),
  );
  await page.getByRole("button", { name: "Carregar mapa" }).click();
  await expect(page.locator("iframe")).toHaveAttribute(
    "src",
    /^https:\/\/maps.google.com\/maps\?q=/,
  );
});
