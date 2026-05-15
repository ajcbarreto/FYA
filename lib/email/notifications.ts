import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfileEmail } from "@/lib/supabase/admin-client";
import { emailLayout, sendEmail } from "@/lib/email/send";
import { localizeRequestStatus, type AdoptionRequestRow } from "@/lib/adoption/db";

function appUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return base ? `${base}${path}` : path;
}

// Notifica o canil de que recebeu um novo pedido de adopcao.
// Usa o email de contacto publico do canil (canis.email_contacto).
export async function notifyShelterNewRequest(
  supabase: SupabaseClient,
  options: { canilId: string; animalName: string; locale: string },
) {
  const { data: canil } = await supabase
    .from("canis")
    .select("nome,email_contacto")
    .eq("id", options.canilId)
    .maybeSingle();

  const to = canil?.email_contacto;
  if (!to) return;

  const isPt = options.locale === "pt";
  const subject = isPt
    ? `Novo pedido de adopcao — ${options.animalName}`
    : `New adoption request — ${options.animalName}`;
  const body = isPt
    ? `Recebeste um novo pedido de adopcao para <strong>${options.animalName}</strong>. Entra na FYA para rever a candidatura e responder ao adotante.`
    : `You received a new adoption request for <strong>${options.animalName}</strong>. Sign in to FYA to review the application and reply to the adopter.`;

  await sendEmail({
    to,
    subject,
    html: emailLayout(subject, body, isPt ? "Ver pedidos" : "View requests", appUrl(`/${options.locale}/canil/pedidos`)),
  });
}

// Notifica o adotante de que o estado do seu pedido mudou.
export async function notifyAdopterStatusChange(
  options: { applicantProfileId: string; animalName: string; status: AdoptionRequestRow["status"]; locale: string },
) {
  const to = await getProfileEmail(options.applicantProfileId);
  if (!to) return;

  const isPt = options.locale === "pt";
  const statusLabel = localizeRequestStatus(options.status, options.locale);
  const subject = isPt
    ? `Atualizacao do teu pedido — ${options.animalName}`
    : `Update on your request — ${options.animalName}`;
  const body = isPt
    ? `O estado do teu pedido de adopcao para <strong>${options.animalName}</strong> mudou para <strong>${statusLabel}</strong>.`
    : `Your adoption request for <strong>${options.animalName}</strong> changed status to <strong>${statusLabel}</strong>.`;

  await sendEmail({
    to,
    subject,
    html: emailLayout(subject, body, isPt ? "Ver pedidos" : "View requests", appUrl(`/${options.locale}/user/pedidos`)),
  });
}
