import {
  moderationReasonLabel,
  type ModerationState,
} from "@/lib/listings/moderation";
import type { Locale } from "@/lib/i18n/config";

type ListingModerationNoticeProps = {
  locale: Locale;
  state: ModerationState;
  reasons: string[];
  note: string | null;
  hasPhoto: boolean;
};

export function ListingModerationNotice({
  locale,
  state,
  reasons,
  note,
  hasPhoto,
}: ListingModerationNoticeProps) {
  const pt = locale === "pt";
  const tone =
    state === "rejeitado"
      ? "border-destructive/30 bg-destructive/5"
      : state === "pendente" || !hasPhoto
        ? "border-accent/40 bg-accent/10"
        : "border-primary/30 bg-primary/5";
  const title =
    state === "rejeitado"
      ? pt
        ? "Anúncio rejeitado"
        : "Listing rejected"
      : state === "pendente"
        ? pt
          ? "Anúncio em análise"
          : "Listing under review"
        : !hasPhoto
          ? pt
            ? "Falta uma foto"
            : "A photo is missing"
          : pt
            ? "Anúncio publicado"
            : "Listing published";
  const body =
    state === "rejeitado"
      ? pt
        ? "A equipa FYA não aprovou este anúncio. Se corrigires os dados, volta a ser analisado."
        : "The FYA team did not approve this listing. If you correct it, it will be reviewed again."
      : state === "pendente"
        ? pt
          ? "A verificação automática encontrou pontos a confirmar. A equipa FYA vai rever o anúncio antes de aparecer no catálogo."
          : "Automatic checks found something to confirm. The FYA team will review the listing before it appears in the catalogue."
        : !hasPhoto
          ? pt
            ? "O anúncio só aparece no catálogo depois de carregares pelo menos uma foto."
            : "The listing only appears in the catalogue after you upload at least one photo."
          : pt
            ? "O animal está visível no catálogo. Os pedidos e mensagens chegam a esta área."
            : "The animal is visible in the catalogue. Requests and messages arrive here.";

  return (
    <section className={`rounded-3xl border p-6 ${tone}`} role="status">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {state === "pendente" && reasons.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {reasons.map((reason) => (
            <li key={reason}>{moderationReasonLabel(reason, locale)}</li>
          ))}
        </ul>
      )}
      {note && (
        <p className="mt-3 text-sm">
          <span className="font-semibold">
            {pt ? "Nota da equipa: " : "Team note: "}
          </span>
          {note}
        </p>
      )}
    </section>
  );
}
