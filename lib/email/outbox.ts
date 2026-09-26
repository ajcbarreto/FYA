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
        share_id: string | null;
        task_id: string | null;
        visit_id: string | null;
      }) => {
        const subject =
          job.task_id || job.visit_id
            ? `FYA · Lembrete / Reminder — ${job.animal_name}`
            : job.share_id
              ? `FYA · Documentação de adoção / Adoption dossier — ${job.animal_name}`
              : job.status
                ? `FYA · Atualização da candidatura / Application update — ${job.animal_name}`
                : `FYA · Nova candidatura / New application — ${job.animal_name}`;
        const body =
          job.task_id || job.visit_id
            ? `Tens uma tarefa ou visita agendada: <strong>${escapeHtml(job.animal_name)}</strong>. Consulta a tua área na FYA para confirmar os detalhes e o horário. / You have a scheduled task or visit. Sign in to FYA to check the details and time.`
            : job.share_id
              ? `O canil partilhou a documentação de <strong>${escapeHtml(job.animal_name)}</strong>. Entra com a tua conta para consultar os documentos. / Sign in to your account to access the animal’s documents.`
              : job.status
                ? `O estado da candidatura mudou para <strong>${escapeHtml(job.status)}</strong>. / The application status has changed to <strong>${escapeHtml(job.status)}</strong>.`
                : `Recebeste uma candidatura para <strong>${escapeHtml(job.animal_name)}</strong>. / You received an application for <strong>${escapeHtml(job.animal_name)}</strong>.`;
        try {
          if (job.task_id || job.visit_id) {
            let cancelled = false;
            if (job.task_id) {
              const result = await admin
                .from("shelter_tasks")
                .select("completed_at")
                .eq("id", job.task_id)
                .maybeSingle();
              if (result.error) throw new Error("Reminder unavailable");
              cancelled = !result.data || Boolean(result.data.completed_at);
            } else {
              const result = await admin
                .from("visitas")
                .select("status")
                .eq("id", job.visit_id!)
                .maybeSingle();
              if (result.error) throw new Error("Reminder unavailable");
              cancelled = result.data?.status !== "confirmada";
            }
            if (cancelled) {
              const result = await admin
                .from("email_outbox")
                .update({
                  cancelled_at: new Date().toISOString(),
                  locked_at: null,
                })
                .eq("id", job.id);
              if (result.error) throw new Error("Reminder unavailable");
              return "cancelled";
            }
          }
          if (job.share_id) {
            const { data: share, error: shareError } = await admin
              .from("document_shares")
              .select("revoked_at,expires_at")
              .eq("id", job.share_id)
              .maybeSingle();
            if (
              shareError ||
              !share ||
              share.revoked_at ||
              new Date(share.expires_at).getTime() <= Date.now()
            )
              throw new Error("Share unavailable");
            if (!process.env.NEXT_PUBLIC_APP_URL)
              throw new Error("App URL missing");
          }
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
              html: emailLayout(
                subject,
                body,
                job.share_id ? "Consultar dossier / Open dossier" : undefined,
                job.share_id
                  ? `${process.env.NEXT_PUBLIC_APP_URL}/pt/dossier/${job.share_id}`
                  : undefined,
              ),
            }),
          });
          if (!response.ok)
            throw new Error(`Email provider ${response.status}`);
          const { error } = await admin
            .from("email_outbox")
            .update({
              sent_at: new Date().toISOString(),
              locked_at: null,
              last_error: null,
            })
            .eq("id", job.id);
          if (error) throw error;
          return "sent";
        } catch (error) {
          await admin
            .from("email_outbox")
            .update({
              locked_at: null,
              last_error:
                error instanceof Error &&
                /^(Email provider \d+|Share unavailable|App URL missing)$/.test(
                  error.message,
                )
                  ? error.message
                  : "Delivery failed",
            })
            .eq("id", job.id);
          return "failed";
        }
      },
    ),
  );
  return {
    configured: true,
    sent: results.filter((x) => x === "sent").length,
    cancelled: results.filter((x) => x === "cancelled").length,
    failed: results.filter((x) => x === "failed").length,
  };
}
