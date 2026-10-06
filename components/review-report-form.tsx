import { reportReview } from "@/app/canil/reviews/actions";
import { SubmitButton } from "@/components/submit-button";
export function ReviewReportForm({
  locale,
  reviewId,
}: {
  locale: string;
  reviewId: string;
}) {
  const pt = locale === "pt";
  return (
    <details className="mt-3 border-t pt-2">
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium underline">
        {pt ? "Denunciar à plataforma" : "Report to the platform"}
      </summary>
      <form action={reportReview} className="space-y-3">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="reviewId" value={reviewId} />
        <label className="block text-sm font-medium">
          {pt ? "Motivo (privado)" : "Reason (private)"}
          <textarea
            name="reason"
            required
            minLength={10}
            maxLength={2000}
            className="field"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          {pt
            ? "Para conteúdo abusivo, falso ou com dados pessoais. A denúncia não remove automaticamente a avaliação; a equipa FYA analisa-a."
            : "For abusive, false or personal content. Reports do not automatically remove reviews; the FYA team assesses them."}
        </p>
        <SubmitButton className="button-secondary">
          {pt ? "Enviar denúncia" : "Send report"}
        </SubmitButton>
      </form>
    </details>
  );
}
