import { test, expect } from "@playwright/test";
import { accounts, admin, login } from "./helpers";
test("notification bell opens in place, marks read and supports mobile and keyboard", async ({
  page,
}, testInfo) => {
  const { data: rows, error } = await admin
    .from("notificacoes")
    .insert([
      {
        user_profile_id: accounts.adopter.id,
        tipo: "pedido_status",
        referencia: "entrevista",
        link: "/user/pedidos",
      },
      {
        user_profile_id: accounts.shelter.id,
        tipo: "pedido_status",
        referencia: "entrevista",
        link: "/canil/pedidos",
      },
    ])
    .select("id");
  if (error) throw error;
  try {
    await login(page, "adopter");
    const original = page.url();
    const bell = page.getByRole("button", {
      name: "Notificacoes",
      exact: true,
    });
    await bell.click();
    const panel = page.getByRole("dialog", {
      name: "Notificações",
      exact: true,
    });
    await expect(panel).toBeVisible();
    await expect(
      panel.getByText("Pedido de adoção atualizado").first(),
    ).toBeVisible();
    expect(page.url()).toBe(original);
    await page.screenshot({
      path: testInfo.outputPath("notifications-desktop.png"),
      fullPage: false,
    });
    await panel
      .getByRole("button", { name: "Marcar todas como lidas" })
      .click();
    await expect(
      panel.getByRole("button", { name: "Marcar todas como lidas" }),
    ).toHaveCount(0);
    expect(page.url()).toBe(original);
    const { data: other } = await admin
      .from("notificacoes")
      .select("lida")
      .eq("id", rows![1].id)
      .single();
    expect(other?.lida).toBe(false);
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(bell).toBeFocused();
    await page.setViewportSize({ width: 320, height: 740 });
    await bell.click();
    await expect(panel).toBeVisible();
    await expect(
      panel.getByText("Pedido de adoção atualizado").first(),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    const box = await panel.boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(741);
    await page.screenshot({
      path: testInfo.outputPath("notifications-mobile.png"),
      fullPage: false,
    });
    await panel
      .getByRole("button")
      .filter({ hasText: "Pedido de adoção atualizado" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/pt\/user\/pedidos$/);
    await expect(panel).toHaveCount(0);
    await bell.click();
    await expect(panel).toBeVisible();
    await panel.getByRole("link", { name: "Ver todas" }).click();
    await expect(page).toHaveURL(/\/pt\/notificacoes$/);
  } finally {
    await admin
      .from("notificacoes")
      .delete()
      .in(
        "id",
        rows!.map((r) => r.id),
      );
  }
});
