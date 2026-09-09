import { config, webhook } from "@/lib/trello-automation/core.mjs";
import { createStore } from "@/lib/trello-automation/store.mjs";
export const runtime = "nodejs";
export function HEAD() {
  return new Response(null, { status: 200 });
}
export async function POST(request: Request) {
  try {
    return await webhook(request, config(), createStore());
  } catch {
    return new Response("Automation unavailable", { status: 503 });
  }
}
