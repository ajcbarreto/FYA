import { execFileSync } from "node:child_process";
import { writeFileSync, existsSync } from "node:fs";

// CLI status addresses only the project_id in supabase/config.toml; never a linked cloud DB.
const status = JSON.parse(
  execFileSync("npx", ["supabase", "status", "-o", "json"], {
    encoding: "utf8",
  }),
);
const url = status.API_URL ?? status.api_url;
if (!url || new URL(url).hostname !== "127.0.0.1")
  throw new Error("Expected loopback Supabase instance");
const values = {
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY ?? status.anon_key,
  SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY ?? status.service_role_key,
  NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3100",
  CRON_SECRET: "fya-local-test-cron-only",
};
if (Object.values(values).some((v) => !v))
  throw new Error("Supabase status is missing required fields");
const contents =
  Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n") + "\n";
writeFileSync(".env.test.local", contents, { mode: 0o600 });
if (!existsSync(".env.local"))
  writeFileSync(".env.local", contents.replace(":3100", ":3000"), {
    mode: 0o600,
  });
console.log(
  "Local environment ready; credentials written to ignored files (not printed).",
);
