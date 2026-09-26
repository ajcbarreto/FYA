import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, cpSync } from "node:fs";
const directory = "/private/tmp/fya-launch-test";
mkdirSync(`${directory}/supabase`, { recursive: true });
const config = readFileSync("supabase/config.toml", "utf8")
  .replace('project_id = "fya-local"', 'project_id = "fya-launch-test"')
  .replaceAll("5432", "5433")
  .replace(
    'site_url = "http://127.0.0.1:3000"',
    'site_url = "http://127.0.0.1:3100"',
  );
writeFileSync(`${directory}/supabase/config.toml`, config);
cpSync("supabase/migrations", `${directory}/supabase/migrations`, {
  recursive: true,
});
try {
  execFileSync(
    "npx",
    [
      "supabase",
      "start",
      "--workdir",
      directory,
      "--exclude",
      "studio,postgres-meta",
    ],
    { stdio: "pipe", timeout: 240000 },
  );
} catch (error) {
  const output = String(error.stderr ?? "");
  console.error(
    output
      .replace(
        /(?:eyJ|sb_secret_|sb_publishable_)[A-Za-z0-9_.-]+/g,
        "[redacted]",
      )
      .slice(-5000),
  );
  process.exit(1);
}
const status = JSON.parse(
  execFileSync(
    "npx",
    ["supabase", "status", "--workdir", directory, "-o", "json"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ),
);
if (status.API_URL !== "http://127.0.0.1:54331")
  throw new Error("Unexpected test API");
const values = {
  NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3100",
  CRON_SECRET: "fya-launch-test-only",
  FYA_E2E_MAIL_URL: "http://127.0.0.1:54334",
  FYA_E2E_ACCOUNTS: ".local-test/launch-accounts.json",
  FYA_E2E_DB_CONTAINER: "supabase_db_fya-launch-test",
};
writeFileSync(
  ".env.launch-test.local",
  Object.entries(values)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n") + "\n",
  { mode: 0o600 },
);
console.log(
  "Isolated launch test database ready on loopback port 54331; credentials saved to ignored file.",
);
