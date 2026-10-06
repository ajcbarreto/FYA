"use client";
import { useActionState } from "react";
import Link from "next/link";
import { submitPartnership } from "@/app/contact/actions";
import { SubmitButton } from "@/components/submit-button";
import {
  inputClass,
  buttonClass,
  categories,
  partnershipCategories,
  label,
} from "@/lib/contact/config";
export function PartnershipForm({ locale }: { locale: string }) {
  const pt = locale === "pt";
  const [state, action] = useActionState(submitPartnership, { error: "" });
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <div className="hidden" aria-hidden="true">
        <label>
          Fax
          <input name="fax" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl border border-destructive p-3">
          {state.error}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          {pt ? "Empresa / organização" : "Company / organization"}
          <input
            name="organization"
            required
            minLength={2}
            maxLength={160}
            autoComplete="organization"
            className={inputClass}
          />
        </label>
        <label>
          {pt ? "Nome de contacto" : "Contact name"}
          <input
            name="contact"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            className={inputClass}
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className={inputClass}
          />
        </label>
        <label>
          {pt ? "Website (opcional, https://)" : "Website (optional, https://)"}
          <input
            name="website"
            type="url"
            maxLength={500}
            placeholder="https://"
            className={inputClass}
          />
        </label>
      </div>
      <label className="block">
        {pt ? "Tipo de parceria" : "Partnership type"}
        <select name="category" className={inputClass}>
          {partnershipCategories.map((k) => (
            <option key={k} value={k}>
              {label(categories, k, pt)}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        {pt ? "Assunto" : "Subject"}
        <input
          name="subject"
          required
          minLength={3}
          maxLength={160}
          className={inputClass}
        />
      </label>
      <label className="block">
        {pt ? "Conta-nos a tua proposta" : "Tell us about your proposal"}
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          className={inputClass}
        />
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 size-5 shrink-0"
        />
        <span>
          {pt
            ? "Autorizo a FYA a utilizar estes dados para analisar e responder à proposta."
            : "I authorize FYA to use these details to assess and respond to this proposal."}{" "}
          <Link className="underline" href={`/${locale}/privacidade`}>
            {pt ? "Privacidade" : "Privacy"}
          </Link>
        </span>
      </label>
      <SubmitButton className={buttonClass}>
        {pt ? "Enviar proposta" : "Submit proposal"}
      </SubmitButton>
    </form>
  );
}
