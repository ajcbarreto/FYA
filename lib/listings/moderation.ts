import type { Locale } from "@/lib/i18n/config";

export type ModerationState = "aprovado" | "pendente" | "rejeitado";

export const MAX_INDIVIDUAL_LISTINGS = 3;

const reasonLabels: Record<string, { pt: string; en: string }> = {
  menciona_dinheiro: {
    pt: "Fala em pagamentos, preço ou venda",
    en: "Mentions payment, price or sale",
  },
  contactos_externos: {
    pt: "Tem contactos fora da FYA (telefone, email, redes ou links)",
    en: "Has contacts outside FYA (phone, email, social or links)",
  },
  raca_procurada_cachorro: {
    pt: "Raça muito procurada em idade de cachorro",
    en: "Sought-after breed at puppy age",
  },
  conta_recente: {
    pt: "Conta criada há menos de 48 horas",
    en: "Account created less than 48 hours ago",
  },
  texto_duplicado: {
    pt: "Descrição igual à de outro anúncio",
    en: "Description identical to another listing",
  },
  reenviado_apos_rejeicao: {
    pt: "Alterado depois de ter sido rejeitado",
    en: "Edited after being rejected",
  },
  revisao_manual: {
    pt: "Revisão manual ativa para todos os particulares",
    en: "Manual review is on for all individuals",
  },
};

export function moderationReasonLabel(reason: string, locale: Locale) {
  return reasonLabels[reason]?.[locale] ?? reason;
}

/** Messages for the errors the database raises when screening a listing. */
export function listingErrorMessages(locale: Locale) {
  return locale === "pt"
    ? {
        payment_terms:
          "A adoção na FYA é gratuita. Retira referências a pagamentos, preços, MB Way, IBAN ou portes e tenta de novo.",
        listing_limit: `Podes ter no máximo ${MAX_INDIVIDUAL_LISTINGS} animais ativos. Arquiva ou marca como adotado um deles antes de criar outro.`,
      }
    : {
        payment_terms:
          "Adoption on FYA is free. Remove references to payments, prices, bank transfers or shipping costs and try again.",
        listing_limit: `You can have at most ${MAX_INDIVIDUAL_LISTINGS} active animals. Archive one or mark it as adopted before adding another.`,
      };
}
