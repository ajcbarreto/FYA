import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getAuthUser } from "@/lib/supabase/get-user";
import { SubmitButton } from "@/components/submit-button";
import { ToastFeedback } from "@/components/toast-feedback";
import { MAX_INDIVIDUAL_LISTINGS } from "@/lib/listings/moderation";
import { startIndividualListing } from "./actions";

export default async function IndividualListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const pt = locale === "pt";
  const { error } = await searchParams;
  const { supabase, user } = await getAuthUser();
  if (!user || !supabase) redirect(`/${locale}/auth/login?next=/user/animais`);

  const [{ data: profile }, { data: existing }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase
      .from("canis")
      .select("id,localizacao")
      .eq("owner_profile_id", user.id)
      .eq("tipo", "particular")
      .maybeSingle(),
  ]);
  // Shelters already publish from their own area; returning individuals go straight to their listings.
  if (profile?.role === "canil" || existing)
    redirect(`/${locale}/canil/animais`);

  const errors: Record<string, string> = pt
    ? {
        invalid_data:
          "Indica a localidade, um telefone válido e confirma que não vais pedir dinheiro.",
        not_adopter: "Esta opção é só para contas de particulares.",
      }
    : {
        invalid_data:
          "Enter your town, a valid phone number and confirm you will not ask for money.",
        not_adopter: "This option is only for individual accounts.",
      };
  const rules = pt
    ? [
        "A adoção é gratuita. Anúncios que peçam dinheiro, MB Way, IBAN ou portes são recusados.",
        "O contacto com quem adota faz-se pelas mensagens da FYA. Não ponhas telefone, email ou links na descrição.",
        "Cada anúncio é verificado automaticamente. Se algo precisar de confirmação, a equipa FYA revê-o antes de ficar público.",
        `Podes ter até ${MAX_INDIVIDUAL_LISTINGS} animais ativos e cada um precisa de pelo menos uma foto.`,
      ]
    : [
        "Adoption is free. Listings asking for money, bank transfers or shipping costs are refused.",
        "Adopters contact you through FYA messages. Do not put a phone, email or links in the description.",
        "Every listing is checked automatically. If something needs confirming, the FYA team reviews it before it goes public.",
        `You can have up to ${MAX_INDIVIDUAL_LISTINGS} active animals and each needs at least one photo.`,
      ];

  return (
    <main id="main-content" tabIndex={-1} className="space-y-6">
      <header className="surface">
        <p className="eyebrow">{pt ? "Particulares" : "Individuals"}</p>
        <h1 className="display-title mt-3 text-4xl">
          {pt ? "Dar um animal para adoção" : "Rehome an animal"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {pt
            ? "Se precisas de encontrar uma nova família para um animal teu, podes publicá-lo na FYA. Os pedidos de adoção e as mensagens chegam à tua conta."
            : "If you need to find a new family for your animal, you can list it on FYA. Adoption requests and messages arrive in your account."}
        </p>
      </header>

      <ToastFeedback
        message={error ? (errors[error] ?? null) : null}
        variant="error"
      />

      <section className="surface max-w-2xl">
        <h2 className="font-semibold">
          {pt ? "Antes de começar" : "Before you start"}
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <form
        action={startIndividualListing}
        className="surface max-w-2xl space-y-5"
      >
        <input type="hidden" name="locale" value={locale} />
        <label className="block text-sm font-semibold">
          {pt ? "Localidade ou concelho" : "Town or municipality"}
          <input
            name="localizacao"
            required
            minLength={2}
            maxLength={120}
            autoComplete="address-level2"
            className="field mt-2"
          />
        </label>
        <label className="block text-sm font-semibold">
          {pt ? "Telefone" : "Phone"}
          <input
            name="telefone"
            type="tel"
            required
            pattern="\+?[0-9 ]{9,20}"
            autoComplete="tel"
            className="field mt-2"
          />
          <span className="mt-1 block text-xs font-normal text-muted-foreground">
            {pt
              ? "Não é público. Só a equipa FYA o vê, se precisar de confirmar um anúncio."
              : "Not public. Only the FYA team sees it, if a listing needs confirming."}
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="sem_pagamentos"
            required
            className="mt-1"
          />
          <span>
            {pt
              ? "Confirmo que o animal é meu e que não vou pedir dinheiro pela adoção."
              : "I confirm the animal is mine and I will not ask for money for the adoption."}
          </span>
        </label>
        <SubmitButton className="button-primary">
          {pt
            ? "Continuar e adicionar o animal"
            : "Continue and add the animal"}
        </SubmitButton>
      </form>
    </main>
  );
}
