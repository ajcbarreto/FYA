import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
export const accounts = JSON.parse(
  readFileSync(
    process.env.FYA_E2E_ACCOUNTS ?? ".local-test/accounts.json",
    "utf8",
  ),
) as Record<
  string,
  { email: string; password: string; id: string; shelterId?: string }
>;
export const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);
/** RFC 6238 code for the base32 secret shown during enrolment. */
export function totp(secret: string, time = Date.now()) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of secret.replace(/=+$/, "").toUpperCase())
    bits += alphabet.indexOf(char).toString(2).padStart(5, "0");
  const key = Buffer.from(
    bits.match(/.{8}/g)!.map((byte) => parseInt(byte, 2)),
  );
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(time / 30000)));
  const hash = createHmac("sha1", key).update(counter).digest();
  const offset = hash[hash.length - 1] & 15;
  return String((hash.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(
    6,
    "0",
  );
}
async function resetAdminFactors() {
  const userId = accounts.admin.id;
  const { data, error } = await admin.auth.admin.mfa.listFactors({ userId });
  if (error) throw error;
  for (const factor of data.factors)
    await admin.auth.admin.mfa.deleteFactor({ id: factor.id, userId });
}
export async function login(page: Page, name: string) {
  if (name === "admin") await resetAdminFactors();
  await page.goto("/pt/auth/login");
  await page.locator("[name=email]").fill(accounts[name].email);
  await page.locator("[name=password]").fill(accounts[name].password);
  await page
    .locator("main form")
    .filter({
      has: page.locator("input[name=email], input[name=confirm_password]"),
    })
    .locator("button[type=submit]")
    .click();
  if (name === "admin") {
    await expect(page).toHaveURL(/\/pt\/auth\/mfa/);
    const secret = (await page.getByTestId("mfa-secret").textContent())!;
    await page.locator("[name=code]").fill(totp(secret.trim()));
    await page.getByRole("button", { name: "Confirmar" }).click();
  }
  await expect(page).toHaveURL(
    new RegExp(
      `/pt/${name === "admin" ? "admin" : name.includes("shelter") ? "canil" : "user"}$`,
    ),
  );
}
export async function mailLink(email: string, subject: string) {
  let messageId = "";
  await expect
    .poll(async () => {
      const body = await (
        await fetch(
          `${process.env.FYA_E2E_MAIL_URL ?? "http://127.0.0.1:54324"}/api/v1/messages`,
        )
      ).json();
      messageId = body.messages?.find(
        (m: { ID: string; Subject: string; To: { Address: string }[] }) =>
          m.Subject.includes(subject) && m.To.some((t) => t.Address === email),
      )?.ID;
      return Boolean(messageId);
    })
    .toBe(true);
  const body = await (
    await fetch(
      `${process.env.FYA_E2E_MAIL_URL ?? "http://127.0.0.1:54324"}/api/v1/message/${messageId}`,
    )
  ).json();
  const match = body.HTML.match(/href="([^"]*\/auth\/v1\/verify[^" ]*)"/);
  if (!match) throw new Error("No verification URL in captured email");
  return match[1].replaceAll("&amp;", "&");
}
export async function createAnimal(name: string) {
  const { data, error } = await admin
    .from("animais")
    .insert({
      canil_id: accounts.shelter.shelterId,
      nome: name,
      especie: "cao",
      sexo: "macho",
      porte: "medio",
      idade_anos: 2,
      status: "disponivel",
      descricao: "Animal fictício para testes locais.",
      compatibilidades: ["apartment"],
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
