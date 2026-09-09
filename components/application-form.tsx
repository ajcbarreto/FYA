"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import { submitAdoptionRequest } from "@/app/adoption/actions";
const fieldNames = [
  "housing_type",
  "household_size",
  "has_garden",
  "has_children",
  "has_other_pets",
  "other_pets_detail",
  "experience",
  "hours_alone",
  "reason",
  "message",
];
export function ApplicationForm({
  petId,
  petName,
  locale,
  userId,
  canApply,
}: {
  petId: string;
  petName: string;
  locale: string;
  userId: string | null;
  canApply: boolean;
}) {
  const pt = locale === "pt";
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [review, setReview] = useState<{ label: string; value: string }[]>([]);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const key = `fya:application:${userId}:${petId}`;
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw || !userId) return;
      const draft = JSON.parse(raw);
      if (Date.now() - draft.time > 86400000) {
        sessionStorage.removeItem(key);
        return;
      }
      for (const name of fieldNames) {
        const el = form.current?.elements.namedItem(name);
        if (el instanceof HTMLInputElement && el.type === "checkbox")
          el.checked = draft.values[name] === "true";
        else if (
          el instanceof HTMLInputElement ||
          el instanceof HTMLSelectElement ||
          el instanceof HTMLTextAreaElement
        )
          el.value =
            typeof draft.values[name] === "string" ? draft.values[name] : "";
      }
    } catch {
      /* Storage can be unavailable in private browsing. The form still works. */
    }
  }, [key, userId]);
  function saveDraft() {
    try {
      if (form.current) {
        const data = new FormData(form.current);
        sessionStorage.setItem(
          key,
          JSON.stringify({
            time: Date.now(),
            values: Object.fromEntries(
              fieldNames.map((name) => [name, data.get(name) ?? ""]),
            ),
          }),
        );
        setSaved(true);
      }
    } catch {
      setSaved(false);
    }
  }
  function next() {
    const fields = form.current?.querySelectorAll<HTMLElement>(
      `[data-step="${step}"] input, [data-step="${step}"] select, [data-step="${step}"] textarea`,
    );
    for (const el of fields ?? []) {
      if (
        (el as HTMLInputElement).reportValidity &&
        !(el as HTMLInputElement).reportValidity()
      )
        return;
    }
    saveDraft();
    setReview(
      fieldNames.flatMap((name) => {
        const el = form.current?.elements.namedItem(name);
        if (!(
          el instanceof HTMLInputElement ||
          el instanceof HTMLSelectElement ||
          el instanceof HTMLTextAreaElement
        ))
          return [];
        const value =
          el instanceof HTMLSelectElement
            ? el.selectedOptions[0]?.text
            : el instanceof HTMLInputElement && el.type === "checkbox"
              ? el.checked
                ? pt
                  ? "Sim"
                  : "Yes"
                : pt
                  ? "Não"
                  : "No"
              : el.value;
        const label =
          el.parentElement?.textContent?.split(value ?? "")[0] ?? name;
        return value
          ? [
              {
                label:
                  el.closest("label")?.childNodes[0]?.textContent?.trim() ||
                  label,
                value,
              },
            ]
          : [];
      }),
    );
    setStep(Math.min(2, step + 1));
    requestAnimationFrame(() => title.current?.focus());
  }
  const select = (
    name: string,
    label: string,
    options: string[][],
    required = false,
  ) => (
    <label className="block text-sm font-medium">
      {label}
      <select
        name={name}
        required={required}
        defaultValue=""
        className="field mt-2"
      >
        <option value="">{pt ? "Selecionar" : "Select"}</option>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
  if (!canApply)
    return (
      <p className="rounded-xl bg-muted p-4 text-sm">
        {pt
          ? "Este animal não está a receber candidaturas neste momento."
          : "This animal is not accepting applications at the moment."}
      </p>
    );
  if (!userId)
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {pt
            ? "Entra na tua conta para te apresentares ao abrigo e conheceres melhor este amigo."
            : "Sign in to introduce yourself to the shelter and get to know this friend."}
        </p>
        <Link
          href={`/${locale}/auth/login?next=/pets/${petId}`}
          className="button-primary w-full"
        >
          {pt ? "Entrar para me candidatar" : "Sign in to apply"}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  return (
    <form
      ref={form}
      onChange={saveDraft}
      onSubmit={(e) => {
        e.preventDefault();
        if (step < 2) {
          next();
          return;
        }
        const data = new FormData(e.currentTarget);
        setError("");
        startTransition(async () => {
          try {
            const result = await submitAdoptionRequest(data);
            if (result.error) {
              setError(
                result.error === "pet_unavailable"
                  ? pt
                    ? "Este animal já não está disponível."
                    : "This animal is no longer available."
                  : result.error === "only_users_can_apply"
                    ? pt
                      ? "Apenas contas de adotante podem candidatar-se."
                      : "Only adopter accounts can apply."
                    : pt
                      ? "Não foi possível enviar. As respostas foram mantidas."
                      : "Could not submit. Your answers have been kept.",
              );
              return;
            }
            try {
              sessionStorage.removeItem(key);
            } catch {
              /* Navigation must succeed even when storage is blocked. */
            }
            router.push(
              `/${locale}/user/mensagens?conversation=${result.conversationId}&success=request_created`,
            );
          } catch {
            setError(
              pt
                ? "Não foi possível enviar. Tenta novamente."
                : "Could not submit. Please try again.",
            );
          }
        });
      }}
      className="space-y-5"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="petId" value={petId} />
      <ol
        aria-label={pt ? "Etapas da candidatura" : "Application steps"}
        className="flex gap-2"
      >
        {[
          pt ? "A tua casa" : "Your home",
          pt ? "A tua rotina" : "Your routine",
          pt ? "Rever" : "Review",
        ].map((label, i) => (
          <li
            key={label}
            aria-current={step === i ? "step" : undefined}
            className={`flex-1 border-t-2 pt-2 text-[11px] font-semibold ${step >= i ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>
      <h3 ref={title} tabIndex={-1} className="text-lg font-semibold">
        {step === 0
          ? pt
            ? "Um pouco sobre a tua casa"
            : "A little about your home"
          : step === 1
            ? pt
              ? "Como seria o vosso dia?"
              : "What would your day look like?"
            : pt
              ? `Tudo pronto para conhecer ${petName}?`
              : `Ready to meet ${petName}?`}
      </h3>
      <fieldset
        data-step="0"
        hidden={step !== 0}
        disabled={pending}
        className="space-y-4"
      >
        <legend className="sr-only">{pt ? "A tua casa" : "Your home"}</legend>
        {select("housing_type", pt ? "Tipo de habitação" : "Housing type", [
          ["apartment", pt ? "Apartamento" : "Apartment"],
          ["house", pt ? "Casa" : "House"],
          ["shared", pt ? "Casa partilhada" : "Shared home"],
          ["other", pt ? "Outro" : "Other"],
        ])}
        {select("household_size", pt ? "Pessoas em casa" : "Household size", [
          ["1", "1"],
          ["2", "2"],
          ["3", "3"],
          ["4+", "4+"],
        ])}
        <div className="grid gap-3">
          {[
            ["has_garden", pt ? "Tenho jardim ou quintal" : "I have a garden"],
            [
              "has_children",
              pt ? "Há crianças em casa" : "There are children at home",
            ],
            [
              "has_other_pets",
              pt ? "Tenho outros animais" : "I have other animals",
            ],
          ].map(([name, label]) => (
            <label key={name} className="flex items-center gap-3 text-sm">
              <input
                name={name}
                type="checkbox"
                value="true"
                className="size-4"
              />
              {label}
            </label>
          ))}
        </div>
        <label className="block text-sm font-medium">
          {pt
            ? "Sobre os outros animais (opcional)"
            : "About your other animals (optional)"}
          <input
            name="other_pets_detail"
            maxLength={500}
            className="field mt-2"
          />
        </label>
      </fieldset>
      <fieldset
        data-step="1"
        hidden={step !== 1}
        disabled={pending}
        className="space-y-4"
      >
        <legend className="sr-only">{pt ? "Rotina" : "Routine"}</legend>
        {select(
          "experience",
          pt ? "Experiência com animais" : "Experience with animals",
          [
            ["none", pt ? "É a minha primeira adoção" : "My first adoption"],
            ["some", pt ? "Alguma experiência" : "Some experience"],
            ["experienced", pt ? "Muita experiência" : "Experienced"],
          ],
        )}
        {select(
          "hours_alone",
          pt ? "Horas sozinho por dia" : "Hours alone per day",
          [
            ["0-2", "0–2"],
            ["3-5", "3–5"],
            ["6-8", "6–8"],
            ["8+", "8+"],
          ],
        )}
        <label className="block text-sm font-medium">
          {pt ? "O que te leva a adotar?" : "What makes you want to adopt?"}
          <textarea
            name="reason"
            maxLength={2000}
            rows={3}
            className="field mt-2"
          />
        </label>
        <label className="block text-sm font-medium">
          {pt ? "Mensagem ao abrigo" : "Message to the shelter"}
          <textarea
            name="message"
            maxLength={4000}
            rows={3}
            className="field mt-2"
          />
        </label>
      </fieldset>
      {step === 2 && (
        <div className="space-y-3 rounded-xl bg-muted p-4">
          <p className="text-sm leading-6">
            {pt
              ? "As tuas respostas serão partilhadas com o abrigo. Depois de enviar, poderás conversar e combinar os próximos passos."
              : "Your answers will be shared with the shelter. After submitting, you can chat and arrange the next steps."}
          </p>
          <dl className="space-y-2 text-xs">
            {review.map(({ label, value }, i) => (
              <div key={i} className="border-t border-border/60 pt-2">
                <dt className="font-semibold">{label}</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        {step > 0 && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setStep(step - 1)}
            className="button-secondary px-4"
            aria-label={pt ? "Voltar" : "Back"}
          >
            <ArrowLeft className="size-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="button-primary flex-1"
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : step === 2 ? (
            <Check className="size-4" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          {step === 2
            ? pt
              ? "Enviar candidatura"
              : "Send application"
            : pt
              ? "Continuar"
              : "Continue"}
        </button>
      </div>
      <p
        role="status"
        className="text-center text-[11px] text-muted-foreground"
      >
        {saved
          ? pt
            ? "Rascunho guardado nesta sessão por 24 horas."
            : "Draft saved in this session for 24 hours."
          : pt
            ? "Uma adoção pensada, um novo começo."
            : "A thoughtful adoption, a new beginning."}
      </p>
    </form>
  );
}
