import { test, expect } from "@playwright/test";
import { accounts, createAnimal } from "./helpers";

test("shelter page keeps actions accessible and fits mobile and desktop", async ({
  page,
}, testInfo) => {
  await createAnimal(`Design ${Date.now()}`);
  await page.goto(`/pt/canis/${accounts.shelter.shelterId}`);
  await expect(page.locator("#animais")).toBeVisible();
  await expect(page.locator("#animais")).toContainText(
    "disponíveis para adoção",
  );
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
  const more = page.locator("#animais details");
  if (await more.count()) {
    await expect(more).not.toHaveAttribute("open");
    await more.locator("summary").click();
    await expect(more).toHaveAttribute("open", "");
    await expect(more.locator('a[href*="/pets/"]').first()).toBeVisible();
  }
});
