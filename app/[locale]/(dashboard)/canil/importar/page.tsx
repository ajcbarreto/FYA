import { recordsContext } from "@/lib/records/context";
import { AnimalImport } from "@/components/animal-import";
export default async function ImportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale } = await params,
    c = await recordsContext(locale),
    pt = locale === "pt",
    search = await searchParams;
  return (
    <main id="main-content" className="space-y-6">
      <h1 className="page-title">
        {pt ? "Importar e exportar animais" : "Import and export animals"}
      </h1>
      <p>{c.shelter?.nome}</p>
      {search.success && (
        <p role="status">
          {search.success} {pt ? "animais importados." : "animals imported."}
        </p>
      )}
      {search.error && (
        <p role="alert">
          {pt
            ? "Importação não concluída. Verifica as referências repetidas, os dados e as permissões. Nenhum animal do lote foi criado."
            : "Import failed. Check duplicate references, data and permissions. No animals in this batch were created."}
        </p>
      )}
      <AnimalImport locale={locale} />
      <a download className="inline-block underline" href="/api/animals/export">
        {pt ? "Exportar inventário CSV" : "Export inventory as CSV"}
      </a>
    </main>
  );
}
