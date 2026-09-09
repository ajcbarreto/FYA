import { createHmac, timingSafeEqual } from "node:crypto";
export const log = (event, fields = {}) =>
  console.log(
    JSON.stringify({ time: new Date().toISOString(), event, ...fields }),
  );
export function config(env = process.env, listSetup = false) {
  const required = (key) => {
    if (
      listSetup &&
      [
        "TRELLO_READY_LIST_ID",
        "TRELLO_REVIEW_LIST_ID",
        "TRELLO_APP_SECRET",
        "TRELLO_WEBHOOK_URL",
      ].includes(key)
    )
      return env[key] || "";
    if (!env[key]) throw new Error(`Missing ${key}`);
    return env[key];
  };
  return {
    enabled: env.TRELLO_AUTOMATION_ENABLED === "true",
    board: required("TRELLO_BOARD_ID"),
    ready: required("TRELLO_READY_LIST_ID"),
    review: required("TRELLO_REVIEW_LIST_ID"),
    key: required("TRELLO_KEY"),
    token: required("TRELLO_TOKEN"),
    secret: required("TRELLO_APP_SECRET"),
    callback: required("TRELLO_WEBHOOK_URL"),
  };
}
export function validSignature(raw, signature, cfg) {
  if (!signature) return false;
  const expected = createHmac("sha1", cfg.secret)
    .update(raw)
    .update(cfg.callback)
    .digest("base64");
  const actual = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}
export function eventCard(event, cfg) {
  const a = event?.action,
    d = a?.data;
  if (
    !/^[a-f0-9]{24}$/.test(a?.id ?? "") ||
    !/^[a-f0-9]{24}$/.test(d?.card?.id ?? "")
  )
    return null;
  if (event?.model?.id !== cfg.board || d?.board?.id !== cfg.board) return null;
  if (
    a.type === "updateCard" &&
    d.listAfter?.id === cfg.ready &&
    d.listBefore?.id !== cfg.ready
  )
    return d.card.id;
  if (
    ["createCard", "copyCard", "moveCardToBoard"].includes(a.type) &&
    d.list?.id === cfg.ready
  )
    return d.card.id;
  return null;
}
export async function webhook(request, cfg, store) {
  if (!cfg.enabled) return new Response("Disabled", { status: 503 });
  const reader = request.body?.getReader();
  const chunks = [];
  let size = 0;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 1024 * 1024) {
        await reader.cancel();
        return new Response("Too large", { status: 413 });
      }
      chunks.push(value);
    }
  }
  const raw = Buffer.concat(chunks);
  if (!validSignature(raw, request.headers.get("x-trello-webhook"), cfg))
    return new Response("Unauthorized", { status: 401 });
  let event;
  try {
    event = JSON.parse(raw.toString("utf8"));
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const card = eventCard(event, cfg);
  log("webhook_received");
  if (!card) {
    log("card_ignored", { reason: "unrelated_event" });
    return new Response(null, { status: 204 });
  }
  try {
    const queued = await store.enqueue(event.action.id, card);
    log(queued ? "card_queued" : "card_ignored", {
      card,
      reason: queued ? undefined : "duplicate_or_existing",
    });
    return Response.json({ queued }, { status: 202 });
  } catch {
    log("error", { phase: "enqueue" });
    return new Response("Retry later", { status: 503 });
  }
}
export class Trello {
  constructor(cfg, fetcher = fetch) {
    this.cfg = cfg;
    this.fetcher = fetcher;
  }
  async request(path, method = "GET", body) {
    const url = new URL(`https://api.trello.com/1/${path}`);
    const response = await this.fetcher(url, {
      method,
      redirect: "error",
      headers: {
        Authorization: `OAuth oauth_consumer_key="${this.cfg.key}", oauth_token="${this.cfg.token}"`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    }).catch(() => {
      throw new Error("Trello network unavailable");
    });
    if (!response.ok) {
      const error = new Error(`Trello HTTP ${response.status}`);
      error.permanent = [401, 403, 404].includes(response.status);
      throw error;
    }
    return response.json();
  }
  async card(id) {
    const [card, checklists, comments] = await Promise.all([
      this.request(`cards/${id}`),
      this.request(`cards/${id}/checklists`),
      this.request(`cards/${id}/actions?filter=commentCard&limit=30`),
    ]);
    return { ...card, checklists, comments };
  }
  async note(id, marker, text) {
    // Reconcile an ambiguous POST before retrying. Bounded history: see documentation.
    const comments = await this.request(
      `cards/${id}/actions?filter=commentCard&limit=1000`,
    );
    if (!comments.some((c) => c.data?.text?.includes(marker)))
      await this.request(`cards/${id}/actions/comments`, "POST", {
        text: `${text}\n${marker}`,
      });
  }
  async review(id) {
    await this.request(`cards/${id}`, "PUT", { idList: this.cfg.review });
  }
}
export async function processJob(job, { store, trello, runner, cfg }) {
  let checkpoint = job.checkpoint,
    branch = job.branch,
    delivery = job.delivery_pending;
  const save = async (state, delay = 0, pending = delivery) => {
    if (!(await store.save(job, state, branch, checkpoint, pending, delay)))
      throw new Error("Claim lost");
  };
  try {
    const card = await trello.card(job.card_id);
    if (
      card.idBoard !== cfg.board ||
      card.closed ||
      (!delivery && card.idList !== cfg.ready) ||
      (delivery && ![cfg.ready, cfg.review].includes(card.idList))
    ) {
      checkpoint = {
        ...checkpoint,
        reason: "Card removed from approved queue; human intervention required",
      };
      await save("FAILED");
      log("card_ignored", { card: job.card_id, reason: "not_in_ready" });
      return;
    }
    if (!delivery) {
      branch = await runner.prepare(job, card);
      await save("IN_PROGRESS");
      log("development_started", {
        card: job.card_id,
        run: job.run_id,
        branch,
      });
      await trello.note(
        job.card_id,
        `[codex:${job.run_id}:start]`,
        `🤖 Development started\nBranch: ${branch}\nRun: ${job.run_id}\nTime: ${new Date().toISOString()}`,
      );
      checkpoint = await runner.run(
        { ...job, branch },
        card,
        async (progress) => {
          checkpoint = progress;
          await save("IN_PROGRESS");
          log("checkpoint_created", { card: job.card_id, branch });
          await trello.note(
            job.card_id,
            `[codex:${job.run_id}:checkpoint:${progress.revision || progress.commit}]`,
            `🤖 Progress checkpoint\nBranch: ${branch}\n${JSON.stringify(progress, null, 2)}`,
          );
        },
      );
      if (!checkpoint.ready) throw new Error("Development incomplete");
      delivery = true;
      await save("IN_PROGRESS");
    }
    const latest = await trello.card(job.card_id);
    if (
      latest.idBoard !== cfg.board ||
      latest.closed ||
      ![cfg.ready, cfg.review].includes(latest.idList)
    ) {
      const error = new Error("Card removed before delivery");
      error.permanent = true;
      throw error;
    }
    await trello.note(
      job.card_id,
      `[codex:${job.card_id}:review:${checkpoint.commit}]`,
      `✅ Ready for review\nBranch: ${branch}\n${JSON.stringify(checkpoint, null, 2)}`,
    );
    await trello.review(job.card_id);
    await save("REVIEW", 0, false);
    delivery = false;
    log("execution_finished", { card: job.card_id, branch });
  } catch (error) {
    // Never store subprocess output or raw network errors (they may contain credentials).
    checkpoint = {
      ...checkpoint,
      reason: error.permanent
        ? "Service access requires intervention"
        : "Interrupted; inspect local runner report and resume remaining work",
      interrupted_at: new Date().toISOString(),
    };
    const state = error.permanent || job.attempts >= 5 ? "FAILED" : "PAUSED";
    await save(state, Math.min(3600, 60 * 2 ** job.attempts));
    log(state === "PAUSED" ? "execution_paused" : "error", {
      card: job.card_id,
      branch,
    });
    try {
      await trello.note(
        job.card_id,
        `[codex:${job.run_id}:pause]`,
        `${state === "PAUSED" ? "⏸ Development paused" : "❌ Intervention required"}\nBranch: ${branch ?? "pending"}\n${JSON.stringify(checkpoint, null, 2)}`,
      );
    } catch {
      log("error", { phase: "pause_notification", card: job.card_id });
    }
  }
}
