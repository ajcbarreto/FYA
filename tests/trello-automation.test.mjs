import test from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  webhook,
  eventCard,
  processJob,
  Trello,
} from "../lib/trello-automation/core.mjs";
const card = "a".repeat(24),
  eventId = "b".repeat(24);
const cfg = {
  enabled: true,
  board: "board",
  ready: "ready",
  review: "review",
  key: "test",
  token: "test",
  secret: "test-only",
  callback: "https://example.test/api/webhooks/trello",
};
const event = {
  model: { id: "board" },
  action: {
    id: eventId,
    type: "updateCard",
    data: {
      board: { id: "board" },
      card: { id: card },
      listBefore: { id: "backlog" },
      listAfter: { id: "ready" },
    },
  },
};
async function database() {
  const db = new PGlite();
  await db.exec(
    "create role anon;create role authenticated;create role service_role;",
  );
  await db.exec(
    await readFile(
      new URL(
        "../supabase/migrations/202609090002_trello_automation.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  return db;
}
const enqueue = (db, id = eventId) =>
  db.query("select trello_enqueue($1,$2) queued", [id, card]);
const claim = (db) =>
  db.query("select * from trello_claim($1,$2)", [randomUUID(), "test-worker"]);
test("valid move, unrelated changes and bot loops", () => {
  assert.equal(eventCard(event, cfg), card);
  assert.equal(
    eventCard(
      { ...event, action: { ...event.action, type: "commentCard" } },
      cfg,
    ),
    null,
  );
  assert.equal(
    eventCard({ ...event, model: { id: "another-board" } }, cfg),
    null,
  );
});
test("signed webhook, duplicate, tampering and store retry", async () => {
  const seen = new Set();
  const store = {
    enqueue: async (id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    },
  };
  const raw = JSON.stringify(event);
  const sig = createHmac("sha1", cfg.secret)
    .update(raw + cfg.callback)
    .digest("base64");
  const req = () =>
    new Request(cfg.callback, {
      method: "POST",
      headers: { "x-trello-webhook": sig },
      body: raw,
    });
  assert.deepEqual(await (await webhook(req(), cfg, store)).json(), {
    queued: true,
  });
  assert.deepEqual(await (await webhook(req(), cfg, store)).json(), {
    queued: false,
  });
  assert.equal(
    (
      await webhook(
        new Request(cfg.callback, { method: "POST", body: raw }),
        cfg,
        store,
      )
    ).status,
    401,
  );
  assert.equal(
    (
      await webhook(req(), cfg, {
        enqueue: async () => {
          throw Error();
        },
      })
    ).status,
    503,
  );
});
test("database deduplication, concurrent claim, active and terminal exclusion, fenced saves", async () => {
  const db = await database();
  try {
    assert.equal((await enqueue(db)).rows[0].queued, true);
    assert.equal((await enqueue(db)).rows[0].queued, false);
    const claims = await Promise.all([claim(db), claim(db)]);
    assert.equal(claims.flatMap((c) => c.rows).length, 1);
    const job = claims.flatMap((c) => c.rows)[0];
    assert.equal((await enqueue(db, "c".repeat(24))).rows[0].queued, false);
    assert.equal((await claim(db)).rows.length, 0);
    const saved = await db.query(
      "select trello_save($1,$2,'PAUSED',null,'{}',false,0) ok",
      [card, randomUUID()],
    );
    assert.equal(saved.rows[0].ok, false);
    await db.query(
      "select trello_save($1,$2,'PAUSED','codex/task','{\"commit\":\"abc\"}',false,0)",
      [card, job.run_id],
    );
    const resumed = (await claim(db)).rows[0];
    assert.equal(resumed.checkpoint.commit, "abc");
    assert.equal(resumed.attempts, 2);
    await db.query("update trello_jobs set state='DONE' where card_id=$1", [
      card,
    ]);
    await enqueue(db, "d".repeat(24));
    assert.equal((await claim(db)).rows.length, 0);
    await db.exec("set role anon");
    await assert.rejects(db.query("select * from trello_jobs"));
    await assert.rejects(enqueue(db));
  } finally {
    await db.close();
  }
});
function harness({
  failRun = false,
  failMove = false,
  permanent = false,
  delivery = false,
} = {}) {
  const saves = [],
    notes = [];
  let runs = 0,
    moves = 0;
  const job = {
    card_id: card,
    run_id: randomUUID(),
    attempts: 1,
    branch: "codex/task",
    checkpoint: {
      commit: "old",
      completed: ["endpoint"],
      remaining: ["tests"],
      ready: true,
    },
    delivery_pending: delivery,
  };
  const deps = {
    cfg,
    store: {
      save: async (j, state, branch, checkpoint, pending) => {
        saves.push({ state, branch, checkpoint, pending });
        return true;
      },
    },
    trello: {
      card: async () => ({ id: card, idBoard: "board", idList: "ready" }),
      note: async (...args) => notes.push(args),
      review: async () => {
        moves++;
        if (failMove) throw Error();
      },
    },
    runner: {
      prepare: async () => job.branch,
      run: async (j, c, checkpoint) => {
        runs++;
        assert.equal(j.checkpoint.commit, "old");
        await checkpoint({
          commit: "new",
          completed: ["endpoint", "tests"],
          remaining: [],
        });
        if (failRun) {
          const e = Error();
          e.permanent = permanent;
          throw e;
        }
        return {
          ready: true,
          commit: "new",
          completed: ["endpoint", "tests"],
          remaining: [],
          tests: ["unit"],
        };
      },
    },
  };
  return {
    job,
    deps,
    saves,
    notes,
    get runs() {
      return runs;
    },
    get moves() {
      return moves;
    },
  };
}
test("interruption saves progress; resume uses persisted context and moves to Review", async () => {
  const h = harness({ failRun: true });
  await processJob(h.job, h.deps);
  assert.equal(h.saves.at(-1).state, "PAUSED");
  assert.equal(h.saves.at(-1).checkpoint.commit, "new");
  const resumed = harness();
  await processJob(resumed.job, resumed.deps);
  assert.equal(resumed.saves.at(-1).state, "REVIEW");
  assert.equal(resumed.moves, 1);
  assert.ok(resumed.notes.some((n) => n[2].includes("Ready for review")));
});
test("delivery failure resumes delivery without rerunning agent", async () => {
  const h = harness({ failMove: true });
  await processJob(h.job, h.deps);
  assert.equal(h.saves.at(-1).state, "PAUSED");
  assert.equal(h.saves.at(-1).pending, true);
  const retry = harness({ delivery: true });
  await processJob(retry.job, retry.deps);
  assert.equal(retry.runs, 0);
  assert.equal(retry.saves.at(-1).state, "REVIEW");
});
test("permanent API errors and retry budget require intervention", async () => {
  const trello = new Trello(
    cfg,
    async () => new Response("redacted", { status: 401 }),
  );
  await assert.rejects(trello.card(card), (e) => e.permanent === true);
  const h = harness({ failRun: true, permanent: true });
  await processJob(h.job, h.deps);
  assert.equal(h.saves.at(-1).state, "FAILED");
});
test("current card eligibility checked before agent execution", async () => {
  const h = harness();
  h.deps.trello.card = async () => ({ idBoard: "board", idList: "elsewhere" });
  await processJob(h.job, h.deps);
  assert.equal(h.runs, 0);
  assert.equal(h.saves.at(-1).state, "FAILED");
});
test("ambiguous Trello comment delivery reconciles marker", async () => {
  let posts = 0;
  const api = new Trello(cfg, async (url, opts) => {
    if (opts.method === "POST") {
      posts++;
      return Response.json({});
    }
    return Response.json([{ data: { text: "checkpoint [marker]" } }]);
  });
  await api.note(card, "[marker]", "text");
  assert.equal(posts, 0);
});

test("Review database failure keeps delivery resumable", async () => {
  const h = harness();
  const original = h.deps.store.save;
  h.deps.store.save = async (...args) => {
    if (args[1] === "REVIEW") throw new Error("temporary outage");
    return original(...args);
  };
  await processJob(h.job, h.deps);
  assert.equal(h.saves.at(-1).state, "PAUSED");
  assert.equal(h.saves.at(-1).pending, true);
});

test("local command adapter passes stdin, isolates secrets and terminates on timeout", async () => {
  const { command } = await import("../lib/trello-automation/runner.mjs");
  process.env.TRELLO_TEST_PRIVATE = "must-not-inherit";
  try {
    let recorded = false;
    const result = await command(
      process.execPath,
      [
        "-e",
        'let s="";process.stdin.on("data",b=>s+=b);process.stdin.on("end",()=>console.log(s+":"+(process.env.TRELLO_TEST_PRIVATE||"isolated")))',
      ],
      process.cwd(),
      {
        input: "specification",
        onSpawn: async (pid) => {
          assert.ok(pid > 0);
          recorded = true;
        },
      },
    );
    assert.equal(recorded, true);
    assert.equal(result, "specification:isolated");
    await assert.rejects(
      command(
        process.execPath,
        ["-e", "setInterval(()=>{},1000)"],
        process.cwd(),
        { timeout: 100 },
      ),
    );
  } finally {
    delete process.env.TRELLO_TEST_PRIVATE;
  }
});

test("local runner reuses branch and reconstructs context without a Codex session", async () => {
  const { LocalRunner } = await import("../lib/trello-automation/runner.mjs");
  const { mkdtemp, mkdir, writeFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "trello-runner-"));
  const branch = `codex/trello-${card}`;
  const calls = [];
  const execute = async (bin, args, cwd, options) => {
    calls.push([bin, args]);
    if (bin === "git") {
      if (args[0] === "for-each-ref") return branch;
      if (args[0] === "branch") return branch;
      if (args[0] === "rev-parse") return "persisted-commit";
      if (args[0] === "log") return "persisted-commit previous work";
      return "";
    }
    if (args[0] === "exec") {
      assert.ok(options.input.includes("previous checkpoint"));
      assert.ok(options.input.includes("persisted-commit previous work"));
      assert.ok(args.includes("workspace-write"));
      assert.ok(!args.includes("resume"));
      await writeFile(
        args[args.indexOf("--output-last-message") + 1],
        JSON.stringify({
          ready: true,
          completed: ["task"],
          remaining: [],
          summary: "done",
          limitations: [],
        }),
      );
    }
    return "";
  };
  try {
    await mkdir(join(root, card, ".git"), { recursive: true });
    const runner = new LocalRunner(root, { execute, push: false });
    const job = {
      card_id: card,
      branch,
      run_id: randomUUID(),
      checkpoint: { notes: "previous checkpoint" },
    };
    assert.equal(await runner.prepare(job), branch);
    const result = await runner.run(job, { name: "Test task" }, async () => {});
    assert.equal(result.ready, true);
    assert.equal(result.commit, "persisted-commit");
    assert.ok(
      !calls.some(
        ([bin, args]) =>
          bin === "git" && ["checkout", "push"].includes(args[0]),
      ),
    );
    assert.deepEqual(
      calls
        .filter(([bin, args]) => bin === "npm" && args[0] === "run")
        .map(([, args]) => args[1]),
      ["test", "lint", "typecheck", "build"],
    );
    const missing = new LocalRunner(root, {
      execute: async (bin, args) =>
        args[0] === "for-each-ref" ? "" : execute(bin, args),
    });
    await assert.rejects(missing.prepare(job), /Persisted branch missing/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
