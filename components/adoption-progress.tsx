import { Check } from "lucide-react";
export function AdoptionProgress({
  status,
  locale,
}: {
  status: string;
  locale: string;
}) {
  const pt = locale === "pt";
  const stages = ["pendente", "entrevista", "aprovado", "concluido"];
  const current = stages.indexOf(status);
  if (status === "rejeitado")
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        {pt
          ? "Candidatura encerrada. O abrigo pode esclarecer os próximos passos."
          : "Application closed. Contact the shelter for further information."}
      </p>
    );
  return (
    <div className="mt-3 min-w-40">
      <ol
        aria-label={pt ? "Progresso da adoção" : "Adoption progress"}
        className="flex gap-1"
      >
        {stages.map((stage, i) => (
          <li
            key={stage}
            aria-current={i === current ? "step" : undefined}
            className={`flex h-1.5 flex-1 rounded-full ${i <= current ? "bg-primary" : "bg-border/50"}`}
          >
            <span className="sr-only">{stage}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 flex items-start gap-1 text-[11px] text-muted-foreground">
        {current === 3 && <Check className="size-3 shrink-0" />}
        {
          (pt
            ? [
                "O abrigo vai rever as tuas respostas.",
                "Conversa com o abrigo e combina uma visita.",
                "Combina com o abrigo os preparativos da chegada.",
                "Adoção concluída. Um novo capítulo começa.",
              ]
            : [
                "The shelter will review your answers.",
                "Talk to the shelter and arrange a visit.",
                "Arrange the arrival preparations with the shelter.",
                "Adoption completed. A new chapter begins.",
              ])[current]
        }
      </p>
    </div>
  );
}
