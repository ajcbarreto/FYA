// Envio de emails transacionais via Resend.
// Funciona apenas se RESEND_API_KEY estiver definido; caso contrario faz no-op
// (regista um aviso) para nao quebrar o fluxo em dev/sem provider configurado.

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "FYA <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY nao definido — email para ${to} ("${subject}") ignorado.`);
    return;
  }
  if (!to || !to.includes("@")) {
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!response.ok) {
      console.error(`[email] Resend respondeu ${response.status} para ${to}.`);
    }
  } catch (error) {
    console.error("[email] Falha ao enviar email:", error);
  }
}

export function emailLayout(title: string, body: string, ctaLabel?: string, ctaUrl?: string) {
  const cta =
    ctaLabel && ctaUrl
      ? `<p style="margin:24px 0;"><a href="${ctaUrl}" style="background:#9d4f00;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;display:inline-block;">${ctaLabel}</a></p>`
      : "";
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#383833;">
    <p style="font-size:22px;font-weight:800;color:#9d4f00;margin:0 0 16px;">FYA</p>
    <h1 style="font-size:18px;margin:0 0 12px;">${title}</h1>
    <div style="font-size:14px;line-height:1.6;color:#5b5b54;">${body}</div>
    ${cta}
    <p style="font-size:12px;color:#9a9a92;margin-top:32px;">FYA — Found Your Animal</p>
  </div>`;
}
