import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { ShieldCheck } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { verifySecondFactor } from "@/app/auth/mfa/actions";
import { hasSecondFactor } from "@/lib/auth/mfa";
import { safeLocalPath } from "@/lib/auth/redirect";
import { resolveUserRole } from "@/lib/auth/role";
import { isLocale } from "@/lib/i18n/config";
import { getAuthUser } from "@/lib/supabase/get-user";

type MfaPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function MfaPage({ params, searchParams }: MfaPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { next: nextValue, error } = await searchParams;
  const next = safeLocalPath(nextValue);
  const pt = locale === "pt";

  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) redirect(`/${locale}/auth/login`);
  if ((await resolveUserRole(supabase, user)) !== "admin")
    redirect(`/${locale}`);
  if (await hasSecondFactor(supabase)) redirect(next ?? `/${locale}/admin`);

  const { data: factors, error: listError } =
    await supabase.auth.mfa.listFactors();
  if (listError) throw new Error("Unable to load MFA factors");
  let factorId = factors.totp[0]?.id;
  let enrollment: { qr: string; secret: string } | null = null;

  if (!factorId) {
    // A previous enrolment that was never confirmed would block a new one.
    for (const factor of factors.all.filter(
      (f) => f.factor_type === "totp" && f.status === "unverified",
    ))
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "FYA",
    });
    if (enrollError) throw new Error("Unable to start MFA enrolment");
    factorId = data.id;
    enrollment = {
      qr: await QRCode.toDataURL(data.totp.uri, { margin: 2, width: 240 }),
      secret: data.totp.secret,
    };
  }

  const copy = pt
    ? {
        title: enrollment
          ? "Ativar a verificação em dois passos"
          : "Verificação em dois passos",
        intro: enrollment
          ? "As contas de administração precisam de um segundo fator. Lê o código QR com uma aplicação de autenticação (Google Authenticator, Microsoft Authenticator, 1Password ou semelhante)."
          : "Introduz o código de 6 dígitos da tua aplicação de autenticação.",
        manual:
          "Se não conseguires ler o QR, introduz esta chave na aplicação:",
        qrAlt: "Código QR para configurar a aplicação de autenticação",
        code: "Código de 6 dígitos",
        submit: "Confirmar",
        invalid: "Código inválido ou expirado. Tenta novamente.",
      }
    : {
        title: enrollment
          ? "Turn on two-step verification"
          : "Two-step verification",
        intro: enrollment
          ? "Administrator accounts need a second factor. Scan the QR code with an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password or similar)."
          : "Enter the 6-digit code from your authenticator app.",
        manual: "If you cannot scan the QR code, enter this key in the app:",
        qrAlt: "QR code to set up the authenticator app",
        code: "6-digit code",
        submit: "Confirm",
        invalid: "Invalid or expired code. Try again.",
      };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16"
    >
      <div className="rounded-3xl border border-border/30 bg-card p-8 shadow-sm">
        <ShieldCheck className="h-8 w-8 text-primary" aria-hidden />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.intro}</p>

        {enrollment && (
          <div className="mt-6 space-y-3">
            <Image
              src={enrollment.qr}
              alt={copy.qrAlt}
              width={200}
              height={200}
              unoptimized
              className="mx-auto rounded-xl bg-white"
            />
            <p className="text-sm text-muted-foreground">{copy.manual}</p>
            <code
              data-testid="mfa-secret"
              className="block break-all rounded-xl bg-muted px-4 py-3 font-mono text-sm"
            >
              {enrollment.secret}
            </code>
          </div>
        )}

        {error === "invalid_code" && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {copy.invalid}
          </p>
        )}

        <form action={verifySecondFactor} className="mt-6 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="factorId" value={factorId} />
          <input type="hidden" name="next" value={next ?? ""} />
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {copy.code}
            </span>
            <input
              name="code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]{6,7}"
              maxLength={7}
              className="field text-center font-mono text-lg tracking-[0.3em]"
            />
          </label>
          <SubmitButton
            type="submit"
            className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            {copy.submit}
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
