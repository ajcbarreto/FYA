import {
  localizeAnswerKey,
  localizeAnswerValue,
  type AdoptionApplicationAnswers,
} from "@/lib/adoption/application-form";

type AdoptionAnswersProps = {
  answers: Record<string, unknown> | null;
  locale: string;
};

const orderedKeys: Array<keyof AdoptionApplicationAnswers> = [
  "housing_type",
  "household_size",
  "has_garden",
  "has_children",
  "has_other_pets",
  "other_pets_detail",
  "experience",
  "hours_alone",
  "reason",
];

function hasAnswers(answers: Record<string, unknown> | null) {
  if (!answers) return false;
  return orderedKeys.some((key) => {
    const value = answers[key];
    return value !== undefined && value !== null && value !== "";
  });
}

export function AdoptionAnswers({ answers, locale }: AdoptionAnswersProps) {
  if (!hasAnswers(answers)) {
    return (
      <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
        {locale === "pt"
          ? "Sem questionario estruturado para este pedido."
          : "No structured questionnaire for this request."}
      </p>
    );
  }

  return (
    <dl className="grid grid-cols-1 gap-2 rounded-xl bg-muted/60 p-3 text-xs sm:grid-cols-2">
      {orderedKeys.map((key) => {
        const raw = answers?.[key];
        if (raw === undefined || raw === null || raw === "") return null;
        return (
          <div key={key}>
            <dt className="font-bold uppercase tracking-wider text-muted-foreground">
              {localizeAnswerKey(key, locale)}
            </dt>
            <dd className="mt-0.5">{localizeAnswerValue(key, raw, locale)}</dd>
          </div>
        );
      })}
    </dl>
  );
}
