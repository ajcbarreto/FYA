import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
loadEnvFile(".env.test.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (url !== "http://127.0.0.1:54321")
  throw new Error("Seed is restricted to the dedicated local instance");
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const password = "Fya-local-Only-2026!";
const accounts = {};
for (const [name, role] of [
  ["adopter", "user"],
  ["other", "user"],
  ["shelter", "canil"],
  ["other-shelter", "canil"],
  ["admin", "user"],
]) {
  const email = `${name}@fya.test`;
  const { data: existing, error: listError } = await admin.auth.admin.listUsers(
    { perPage: 1000 },
  );
  if (listError) throw listError;
  let user = existing.users.find((u) => u.email === email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        full_name: `FYA Test ${name}`,
        shelter_name: `FYA Test ${name}`,
        shelter_location: "Lisboa",
      },
    });
    if (error) throw error;
    user = data.user;
  }
  accounts[name] = { email, password, id: user.id };
}
// Bootstrap a local administrator using the DB owner, never an application privilege bypass.
execFileSync(
  "docker",
  [
    "exec",
    "-i",
    "supabase_db_fya-local",
    "psql",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-v",
    "ON_ERROR_STOP=1",
  ],
  {
    input:
      "update public.profiles set role='admin' where email='admin@fya.test';",
    stdio: ["pipe", "ignore", "pipe"],
  },
);
const { data: shelters, error } = await admin
  .from("canis")
  .select("id,owner_profile_id");
if (error) throw error;
for (const name of ["shelter", "other-shelter"])
  accounts[name].shelterId = shelters.find(
    (s) => s.owner_profile_id === accounts[name].id,
  )?.id;
writeFileSync(".local-test/accounts.json", JSON.stringify(accounts, null, 2), {
  mode: 0o600,
});
console.log(
  "Five local test accounts ready. See .local-test/accounts.json (ignored by Git).",
);
