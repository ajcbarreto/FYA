import { hostname } from "node:os";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { resolve, join } from "node:path";
import {
  config,
  Trello,
  processJob,
  log,
} from "../lib/trello-automation/core.mjs";
import { createStore } from "../lib/trello-automation/store.mjs";
import { LocalRunner } from "../lib/trello-automation/runner.mjs";
const cfg = config();
if (!cfg.enabled) {
  log("disabled");
  process.exit(0);
}
const root = resolve(process.env.TRELLO_WORKSPACE_ROOT || ".trello-worker");
const owner = `${hostname()}:${root}`;
await mkdir(root, { recursive: true, mode: 0o700 });
const lock = join(root, "worker.lock");
const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code !== "ESRCH";
  }
};
try {
  await writeFile(
    lock,
    JSON.stringify({ pid: process.pid, host: hostname() }),
    { flag: "wx", mode: 0o600 },
  );
} catch (e) {
  if (e.code !== "EEXIST") throw e;
  const previous = JSON.parse(await readFile(lock, "utf8"));
  if (previous.host !== hostname() || alive(previous.pid))
    throw new Error("Worker already running or foreign host lock");
  // Only one restart supervisor should launch this worker. Atomic recovery lock prevents contenders.
  await writeFile(`${lock}.recovery`, "recovery", { flag: "wx" });
  try {
    await unlink(lock);
    await writeFile(
      lock,
      JSON.stringify({ pid: process.pid, host: hostname() }),
      { flag: "wx" },
    );
  } finally {
    await unlink(`${lock}.recovery`);
  }
}
const store = createStore();
let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    stopping = true;
    log("shutdown_requested");
  });
try {
  let agent;
  try {
    agent = JSON.parse(
      await readFile(join(root, "agent-process.json"), "utf8"),
    );
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  if (agent && alive(-agent.pid))
    throw new Error(
      "Previous agent process group still running; retry after it exits",
    );
  // Stable owner + dead worker and agent prove that same-host claims can be resumed.
  const { error } = await store.db
    .from("trello_jobs")
    .update({ state: "PAUSED", next_attempt_at: new Date().toISOString() })
    .eq("owner", owner)
    .in("state", ["CLAIMED", "IN_PROGRESS"]);
  if (error) throw new Error("Recovery failed");
  do {
    const job = await store.claim(randomUUID(), owner);
    if (job) {
      log("claim_acquired", { card: job.card_id, run: job.run_id });
      await processJob(job, {
        store,
        trello: new Trello(cfg),
        runner: new LocalRunner(root),
        cfg,
      });
    }
    if (process.argv.includes("--once")) break;
    if (!stopping) await new Promise((r) => setTimeout(r, 5000));
  } while (!stopping);
} finally {
  await unlink(lock);
}
