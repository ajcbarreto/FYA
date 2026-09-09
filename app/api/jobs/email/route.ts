import { timingSafeEqual } from "node:crypto";
import { deliverEmailOutbox } from "@/lib/email/outbox";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const expected = Buffer.from(`Bearer ${secret ?? ""}`),
    provided = Buffer.from(request.headers.get("authorization") ?? "");
  if (
    !secret ||
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await deliverEmailOutbox();
    return Response.json(result, { status: result.configured ? 200 : 503 });
  } catch {
    return Response.json({ error: "Email queue unavailable" }, { status: 503 });
  }
}
