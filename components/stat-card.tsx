import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: "default" | "primary" | "secondary" | "destructive";
};

const valueToneClass: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  destructive: "text-destructive",
};

// Cartao de KPI: label fina por cima, numero grande em destaque. Sem icones
// coloridos para reduzir o ruido visual dos varios cards juntos.
export function StatCard({ label, value, helper, tone = "default" }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-border/25 bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${valueToneClass[tone]}`}>{value}</p>
      {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
    </article>
  );
}
