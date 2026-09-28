import { timingSafeEqual } from "node:crypto";
import * as Sentry from "@sentry/nextjs";
import {
  countExhaustedEmailJobs,
  deliverEmailOutbox,
} from "@/lib/email/outbox";
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
    const exhausted = await countExhaustedEmailJobs();
    if (exhausted > 0)
      Sentry.captureMessage("Email jobs need manual intervention", {
        level: "error",
        extra: { exhausted },
      });
    if (!result.configured)
      Sentry.captureMessage("Email delivery is not configured", "warning");
    return Response.json(
      { ...result, exhausted },
      { status: result.configured ? 200 : 503 },
    );
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: "Email queue unavailable" }, { status: 503 });
  }
}
