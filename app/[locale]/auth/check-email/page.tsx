import Link from "next/link";
import { MailCheck, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";

export default async function CheckEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string; type?: string }>;
}) {
  const { locale } = await params;
  const { email, type } = await searchParams;
  if (!isLocale(locale)) notFound();
  const pt = locale === "pt";
  const shelter = type === "shelter";
  return (
    <main id="main-content" className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-border/30 bg-card p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
          <MailCheck className="h-8 w-8" />
        </div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-secondary">FYA</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {pt ? "Confirma o teu email" : "Confirm your email"}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          {pt
            ? `Enviámos um link de confirmação para ${email || "o teu email"}. Abre a mensagem e clica no botão para ativar a conta.`
            : `We sent a confirmation link to ${email || "your email"}. Open the message and click the button to activate your account.`}
        </p>
        {shelter && <p className="mt-5 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">{pt ? "Depois da confirmação, o pedido do canil será analisado pela nossa equipa antes de ficar ativo." : "After confirmation, the shelter request will be reviewed by our team before activation."}</p>}
        <p className="mt-6 text-xs text-muted-foreground">{pt ? "Não encontras o email? Verifica o spam ou tenta novamente dentro de alguns minutos." : "Can’t find it? Check your spam folder or try again in a few minutes."}</p>
        <Link href={`/${locale}/auth/login`} className="mt-8 inline-flex items-center gap-2 rounded-full border border-border/40 px-5 py-2.5 text-sm font-semibold hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> {pt ? "Ir para o login" : "Go to login"}
        </Link>
      </section>
    </main>
  );
}
