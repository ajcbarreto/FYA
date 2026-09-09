import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
export const accounts = JSON.parse(
  readFileSync(".local-test/accounts.json", "utf8"),
) as Record<
  string,
  { email: string; password: string; id: string; shelterId?: string }
>;
export const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);
export async function login(page: Page, name: string) {
  await page.goto("/pt/auth/login");
  await page.locator("[name=email]").fill(accounts[name].email);
  await page.locator("[name=password]").fill(accounts[name].password);
  await page.locator("main form button[type=submit]").click();
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
        await fetch("http://127.0.0.1:54324/api/v1/messages")
      ).json();
      messageId = body.messages?.find(
        (m: { ID: string; Subject: string; To: { Address: string }[] }) =>
          m.Subject.includes(subject) && m.To.some((t) => t.Address === email),
      )?.ID;
      return Boolean(messageId);
    })
    .toBe(true);
  const body = await (
    await fetch(`http://127.0.0.1:54324/api/v1/message/${messageId}`)
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
