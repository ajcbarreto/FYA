import { createHmac } from "node:crypto";
import { config, Trello } from "../lib/trello-automation/core.mjs";
import { createStore } from "../lib/trello-automation/store.mjs";
const cfg = config(process.env, process.argv[2] === "lists"),
  trello = new Trello(cfg),
  action = process.argv[2],
  id = process.argv[3];
if (action === "lists") {
  const lists = await trello.request(`boards/${cfg.board}/lists`);
  console.log(lists.map(({ id, name }) => ({ id, name })));
} else if (action === "register") {
  const existing = await trello.request(`tokens/${cfg.token}/webhooks`);
  const match = existing.find(
    (w) => w.callbackURL === cfg.callback && w.idModel === cfg.board,
  );
  const hook =
    match ||
    (await trello.request("webhooks", "POST", {
      callbackURL: cfg.callback,
      idModel: cfg.board,
      description: "FYA development queue",
    }));
  console.log({ webhook_id: hook.id });
} else if (action === "smoke") {
  if (!/^[a-f0-9]{24}$/.test(id || ""))
    throw new Error("Supply a real Ready card ID");
  const card = await trello.card(id);
  if (card.idBoard !== cfg.board || card.idList !== cfg.ready)
    throw new Error("Card must be in Ready");
  const body = JSON.stringify({
    model: { id: cfg.board },
    action: {
      id: id,
      type: "updateCard",
      data: {
        board: { id: cfg.board },
        card: { id },
        listBefore: { id: "smoke" },
        listAfter: { id: cfg.ready },
      },
    },
  });
  const signature = createHmac("sha1", cfg.secret)
    .update(body + cfg.callback)
    .digest("base64");
  for (let i = 0; i < 2; i++) {
    const response = await fetch(cfg.callback, {
      method: "POST",
      headers: {
        "x-trello-webhook": signature,
        "Content-Type": "application/json",
      },
      body,
    });
    console.log(response.status, await response.text());
  }
} else if (["status", "recover", "done", "retry"].includes(action)) {
  const store = createStore();
  if (action === "status") {
    const { data, error } = await store.db
      .from("trello_jobs")
      .select("card_id,state,branch,owner,run_id,attempts,updated_at");
    if (error) throw new Error("Database failed");
    console.log(data);
  } else {
    if (!/^[a-f0-9]{24}$/.test(id || "")) throw new Error("Supply card ID");
    if (action === "recover" && !process.argv.includes("--confirmed-stopped"))
      throw new Error(
        "Stop old worker and all agent descendants first; then pass --confirmed-stopped",
      );
    const states =
      action === "recover"
        ? ["CLAIMED", "IN_PROGRESS"]
        : action === "done"
          ? ["REVIEW"]
          : ["FAILED", "PAUSED"];
    const { data, error } = await store.db
      .from("trello_jobs")
      .update({
        state: action === "done" ? "DONE" : "PAUSED",
        attempts: 0,
        next_attempt_at: new Date().toISOString(),
      })
      .eq("card_id", id)
      .in("state", states)
      .select("card_id,state");
    if (error || !data.length) throw new Error("Transition refused");
    console.log(data);
  }
} else
  throw new Error(
    "Usage: lists | register | smoke CARD | status | retry CARD | recover CARD --confirmed-stopped | done CARD",
  );
