import Link from "next/link";
import { redirect } from "next/navigation";
import { recordsContext } from "@/lib/records/context";
import { timelineLabel } from "@/lib/records/timeline";
import { loadPaginatedData } from "@/lib/pagination";
import { ListPagination } from "@/components/list-pagination";
import { statusLabel } from "@/lib/i18n/animals";
import {
  localizeRequestStatus,
  type AdoptionRequestRow,
} from "@/lib/adoption/db";
export default async function Timeline({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; animalId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, animalId } = await params,
    c = await recordsContext(locale, animalId),
    pt = locale === "pt",
    base = `/${locale}/canil/animais/${animalId}/historico`;
  const result = await loadPaginatedData({
    requestedPage: (await searchParams).page,
    pageSize: 25,
    count: async () => {
      const { count, error } = await c.supabase
        .from("animal_timeline")
        .select("id", { count: "exact", head: true })
        .eq("animal_id", animalId);
      if (error) throw error;
      return count ?? 0;
    },
    load: async (page) => {
      const { data, error } = await c.supabase
        .from("animal_timeline")
        .select("*")
        .eq("animal_id", animalId)
        .order("occurred_at", { ascending: false })
        .order("id", { ascending: false })
        .range((page - 1) * 25, page * 25 - 1);
      if (error) throw error;
      return data ?? [];
    },
  });
  if (result.redirectPage !== null)
    redirect(`${base}?page=${result.redirectPage}`);
  return (
    <main id="main-content" className="space-y-6">
      <Link
        className="underline"
        href={`/${locale}/canil/animais/${animalId}/registos`}
      >
        ← {pt ? "Registos" : "Records"}
      </Link>
      <h1 className="page-title">
        {pt ? "Cronologia" : "Timeline"} · {c.animal!.nome}
      </h1>
      <p className="max-w-3xl text-sm text-muted-foreground">
        {pt
          ? "Histórico privado da equipa. As alterações detalhadas são registadas desde a ativação desta funcionalidade. Para animais anteriores, mostramos a data de registo e o início do histórico, sem reconstruir acontecimentos antigos."
          : "Private team history. Detailed changes are recorded from feature activation. Older animals show their registration date and the start of detailed history; past events are not reconstructed."}
      </p>
      <ol className="space-y-4 border-l-2 border-primary pl-5">
        {result.items.map((e) => {
          const d = e.details as Record<string, string | boolean | null>;
          return (
            <li key={e.id} className="rounded-2xl border bg-card p-5">
              <time
                dateTime={e.occurred_at}
                className="text-sm text-muted-foreground"
              >
                {new Date(e.occurred_at).toLocaleString(locale)}
              </time>
              <h2 className="mt-1 font-bold">
                {timelineLabel(e.kind, locale)}
              </h2>
              {typeof d.title === "string" && <p>{d.title}</p>}
              {typeof d.to === "string" && (
                <p>
                  {e.kind === "application_status_changed"
                    ? localizeRequestStatus(
                        d.to as AdoptionRequestRow["status"],
                        locale,
                      )
                    : statusLabel(d.to, locale)}
                </p>
              )}
              {typeof d.published === "boolean" && (
                <p>
                  {d.published
                    ? pt
                      ? "Publicado"
                      : "Published"
                    : pt
                      ? "Não publicado"
                      : "Unpublished"}
                </p>
              )}
              {typeof d.intake_date === "string" && (
                <p>
                  {pt ? "Entrada registada" : "Recorded intake"}:{" "}
                  {d.intake_date}
                </p>
              )}
              {typeof d.scheduled_at === "string" && (
                <p>
                  {new Date(d.scheduled_at).toLocaleString(locale)} · {d.status}
                </p>
              )}
              {typeof d.due_at === "string" && (
                <p>
                  {pt ? "Prazo" : "Due"}:{" "}
                  {new Date(d.due_at).toLocaleString(locale)}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <ListPagination
        page={result.page}
        total={result.total}
        base={base}
        locale={locale}
      />
    </main>
  );
}
