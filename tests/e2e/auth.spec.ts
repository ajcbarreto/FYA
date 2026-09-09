import { test, expect } from "@playwright/test";
import { accounts, admin, login, mailLink } from "./helpers";

test("registration, email confirmation and login for adopter and shelter", async ({
  page,
}) => {
  for (const role of ["user", "canil"]) {
    const email = `registration-${role}-${Date.now()}@fya.test`;
    await page.goto("/pt/auth/register");
    await page.locator("[name=full_name]").fill("Registo de teste");
    await page.locator("[name=email]").fill(email);
    await page.locator("[name=password]").fill("Fya-registration-2026!");
    await page.locator("[name=role]").selectOption(role);
    await page.locator("main input[type=checkbox]").check();
    await page.locator("main form button[type=submit]").click();
    await expect(page).toHaveURL(/success=/);
    const confirmation = await mailLink(email, "Confirm");
    await page.goto(confirmation);
    await page.goto("/pt/auth/login");
    await page.locator("[name=email]").fill(email);
    await page.locator("[name=password]").fill("Fya-registration-2026!");
    await page.locator("main form button[type=submit]").click();
    await expect(page).toHaveURL(
      new RegExp(`/pt/${role === "user" ? "user" : "canil"}$`),
    );
    await page.context().clearCookies();
  }
});

test("invalid login, persistent session, route isolation and logout", async ({
  page,
}) => {
  await page.goto("/pt/auth/login");
  await page.locator("[name=email]").fill(accounts.adopter.email);
  await page.locator("[name=password]").fill("Wrong-password-123");
  await page.locator("main form button[type=submit]").click();
  await expect(page).toHaveURL(/error=/);
  await login(page, "adopter");
  await page.reload();
  await expect(page).toHaveURL(/\/pt\/user$/);
  for (const path of ["/pt/admin", "/pt/canil"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/pt\/user|\/pt\?error=unauthorized/);
  }
  await page.getByRole("button", { name: "Abrir menu da conta" }).click();
  await page.getByRole("menuitem", { name: "Terminar sessao" }).click();
  await expect(page).toHaveURL(/\/pt$/);
  await page.goto("/pt/user");
  await expect(page).toHaveURL(/auth\/login/);
});

test("password recovery through local mailbox", async ({ page }) => {
  const email = `recovery-${Date.now()}@fya.test`;
  const { error } = await admin.auth.admin.createUser({
    email,
    password: "Original-password-2026!",
    email_confirm: true,
  });
  if (error) throw error;
  await page.goto("/pt/auth/forgot-password");
  await page.locator("[name=email]").fill(email);
  await page.locator("main form button[type=submit]").click();
  await expect(page).toHaveURL(/success=sent/);
  await page.goto(await mailLink(email, "Reset"));
  await expect(page).toHaveURL(/\/pt\/auth\/reset-password/);
  await page.locator("[name=password]").fill("Changed-password-2026!");
  await page.locator("[name=confirm_password]").fill("Changed-password-2026!");
  await page.locator("main form button[type=submit]").click();
  await expect(page).toHaveURL(/success=password_updated/);
  await page.context().clearCookies();
  await page.goto("/pt/auth/login");
  await page.locator("[name=email]").fill(email);
  await page.locator("[name=password]").fill("Changed-password-2026!");
  await page.locator("main form button[type=submit]").click();
  await expect(page).toHaveURL(/\/pt\/user$/);
});
