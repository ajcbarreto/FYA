import Link from "next/link";
import { contactContext } from "@/lib/contact/context";
export async function ContactAdminSummary({ locale }: { locale: string }) {
  const c = await contactContext(locale, true);
  if (!c.ready) return null;
  const counts = await Promise.all(
    (["partnership", "help"] as const).map(async (kind) => {
      const { count, error } = await c.supabase
        .from("contact_requests")
        .select("id", { head: true, count: "exact" })
        .eq("kind", kind)
        .in("status", [
          "new",
          "reviewing",
          "negotiating",
          "in_progress",
          "waiting",
        ]);
      if (error) throw error;
      return { kind, count: count ?? 0 };
    }),
  );
  return (
    <section
      className="grid gap-4 sm:grid-cols-2"
      aria-label={
        locale === "pt" ? "Contactos por acompanhar" : "Requests to follow up"
      }
    >
      {counts.map(({ kind, count }) => (
        <Link
          key={kind}
          href={`/${locale}/admin/contactos?kind=${kind}`}
          className="rounded-2xl border bg-card p-5"
        >
          <p className="text-3xl font-semibold">{count}</p>
          <p>
            {kind === "partnership"
              ? locale === "pt"
                ? "Parcerias por concluir"
                : "Partnerships to follow up"
              : locale === "pt"
                ? "Pedidos de ajuda por concluir"
                : "Help requests to follow up"}
          </p>
        </Link>
      ))}
    </section>
  );
}
