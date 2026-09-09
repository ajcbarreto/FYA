import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { escapeHtml, emailLayout } from "@/lib/email/send";

export async function deliverEmailOutbox() {
  const admin = createAdminSupabaseClient();
  if (!admin || !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)
    return { configured: false, sent: 0, failed: 0 };
  const { data: jobs, error } = await admin.rpc("claim_email_jobs");
  if (error) throw new Error("Unable to claim email jobs", { cause: error });
  const results = await Promise.all(
    (jobs ?? []).map(
      async (job: {
        id: string;
        recipient: string;
        animal_name: string;
        status: string | null;
      }) => {
        const subject = job.status
          ? `FYA · Atualização da candidatura / Application update — ${job.animal_name}`
          : `FYA · Nova candidatura / New application — ${job.animal_name}`;
        const body = job.status
          ? `O estado da candidatura mudou para <strong>${escapeHtml(job.status)}</strong>. / The application status has changed to <strong>${escapeHtml(job.status)}</strong>.`
          : `Recebeste uma candidatura para <strong>${escapeHtml(job.animal_name)}</strong>. / You received an application for <strong>${escapeHtml(job.animal_name)}</strong>.`;
        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            signal: AbortSignal.timeout(10000),
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
              "Idempotency-Key": job.id,
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM,
              to: job.recipient,
              subject,
              html: emailLayout(subject, body),
            }),
          });
          if (!response.ok)
            throw new Error(`Email provider ${response.status}`);
          const { error } = await admin
            .from("email_outbox")
            .update({ sent_at: new Date().toISOString(), locked_at: null })
            .eq("id", job.id);
          if (error) throw error;
          return true;
        } catch {
          await admin
            .from("email_outbox")
            .update({ locked_at: null })
            .eq("id", job.id);
          return false;
        }
      },
    ),
  );
  return {
    configured: true,
    sent: results.filter(Boolean).length,
    failed: results.filter((x) => !x).length,
  };
}
