import type { ComponentType, ReactNode } from "react";

type PageEmptyProps = {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
};

// Empty state plano e uniforme para listas em vazio. Usa um circulo subtil
// com icone (quando dado) e um slot opcional para uma CTA.
export function PageEmpty({ title, description, icon: Icon, action }: PageEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/25 bg-card px-6 py-10 text-center">
      {Icon && (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="max-w-md text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
