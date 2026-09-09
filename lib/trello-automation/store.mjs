import { createClient } from "@supabase/supabase-js";
export function createStore() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing server Supabase configuration");
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const rpc = async (name, args) => {
    const { data, error } = await db.rpc(name, args);
    if (error) throw new Error("Automation database operation failed");
    return data;
  };
  return {
    db,
    enqueue: (event, card) =>
      rpc("trello_enqueue", { p_event: event, p_card: card }),
    claim: async (run, owner) =>
      (await rpc("trello_claim", { p_run: run, p_owner: owner }))[0],
    save: (job, state, branch, checkpoint, delivery, delay) =>
      rpc("trello_save", {
        p_card: job.card_id,
        p_run: job.run_id,
        p_state: state,
        p_branch: branch,
        p_checkpoint: checkpoint,
        p_delivery: delivery,
        p_delay: delay,
      }),
  };
}
