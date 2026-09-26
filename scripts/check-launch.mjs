import { loadEnvFile } from "node:process";
import { existsSync } from "node:fs";
if (existsSync(".env.local")) loadEnvFile(".env.local");
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "CRON_SECRET",
  "LEGAL_ENTITY_NAME",
  "SUPPORT_EMAIL",
  "PRIVACY_EMAIL",
  "LEGAL_APPROVED_AT",
];
const missing = required.filter((key) => !process.env[key]?.trim());
for (const key of missing) console.error(`Pending: ${key}`);
for (const key of ["NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_SUPABASE_URL"]) {
  try {
    if (new URL(process.env[key]).protocol !== "https:") {
      console.error(`Pending: HTTPS for ${key}`);
      missing.push(key);
    }
  } catch {
    if (!missing.includes(key)) missing.push(key);
  }
}
if (process.env.CRON_SECRET && process.env.CRON_SECRET.length < 32) {
  console.error("Pending: CRON_SECRET must contain at least 32 characters");
  missing.push("CRON_SECRET");
}
console.log(
  "This check verifies configuration presence only. Complete the deployment and restore checklist in docs/entrega-centro-registos.md.",
);
process.exitCode = missing.length ? 1 : 0;
