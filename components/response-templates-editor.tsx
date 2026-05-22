import { Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { ResponseTemplate } from "@/lib/adoption/response-templates";
import {
  createResponseTemplate,
  deleteResponseTemplate,
} from "@/app/adoption/response-templates-actions";

type ResponseTemplatesEditorProps = {
  locale: Locale;
  context: "canil" | "user";
  templates: ResponseTemplate[];
};

// Editor de respostas-modelo, partilhado entre canil e user (particular).
// Usa server actions para criar/apagar, sem precisar de Client Component.
export function ResponseTemplatesEditor({ locale, context, templates }: ResponseTemplatesEditorProps) {
  const t = getDictionary(locale).responseTemplates;

  return (
    <section className="rounded-2xl border border-border/25 bg-card p-6">
      <header>
        <h2 className="text-lg font-bold">{t.sectionTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.sectionSubtitle}</p>
      </header>

      <form action={createResponseTemplate} className="mt-4 space-y-3 rounded-xl border border-border/25 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.addTitle}</p>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="context" value={context} />
        <div className="space-y-2">
          <label htmlFor="resp-titulo" className="text-xs font-semibold">
            {t.labelTitulo}
          </label>
          <input
            id="resp-titulo"
            name="titulo"
            required
            placeholder={t.placeholderTitulo}
            className="h-10 w-full rounded-lg border border-border/30 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="resp-conteudo" className="text-xs font-semibold">
            {t.labelConteudo}
          </label>
          <textarea
            id="resp-conteudo"
            name="conteudo"
            required
            rows={3}
            placeholder={t.placeholderConteudo}
            className="w-full rounded-lg border border-border/30 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t.submitAdd}
        </button>
      </form>

      <div className="mt-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.listTitle}</h3>
        {templates.length === 0 ? (
          <p className="rounded-xl bg-muted/60 px-4 py-6 text-center text-xs text-muted-foreground">{t.empty}</p>
        ) : (
          <ul className="space-y-2">
            {templates.map((template) => (
              <li key={template.id} className="rounded-xl border border-border/25 p-3">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{template.titulo}</p>
                  <form action={deleteResponseTemplate}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="context" value={context} />
                    <input type="hidden" name="templateId" value={template.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      {t.deleteAction}
                    </button>
                  </form>
                </header>
                <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{template.conteudo}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
