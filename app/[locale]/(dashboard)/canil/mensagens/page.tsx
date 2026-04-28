import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";

type CanilMessagesPageProps = {
  params: Promise<{ locale: string }>;
};

const contacts = [
  "Ricardo Silva",
  "Ana Souza",
  "Marcos Oliveira",
  "Emily Chen",
  "James Wilson",
];

export default async function CanilMessagesPage({ params }: CanilMessagesPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/mensagens`);
  }

  const { animals } = await getShelterForUser(supabase, user.id);
  const copy =
    locale === "pt"
      ? {
          title: "Mensagens",
          searchPlaceholder: "Procurar conversas...",
          noConversations: "Sem conversas no momento.",
          inputPlaceholder: "Escreve a tua mensagem...",
          send: "Enviar",
          adopterInfo: "Sobre o adotante",
          profileVerified: "Perfil verificado",
          reminder: "Lembrete",
        }
      : {
          title: "Messages",
          searchPlaceholder: "Search conversations...",
          noConversations: "No conversations yet.",
          inputPlaceholder: "Write your message...",
          send: "Send",
          adopterInfo: "About the adopter",
          profileVerified: "Verified profile",
          reminder: "Reminder",
        };

  const conversations = animals.slice(0, 5).map((animal, index) => ({
    id: `${animal.id}-${index}`,
    contactName: contacts[index % contacts.length],
    petName: animal.nome,
    preview:
      locale === "pt"
        ? `Gostaria de saber mais sobre ${animal.nome}.`
        : `I would like to know more about ${animal.nome}.`,
    lastSeen: index === 0 ? (locale === "pt" ? "Agora" : "Now") : `${index + 1}h`,
  }));

  const activeConversation = conversations[0] ?? null;

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">{copy.title}</h1>
      </header>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className="rounded-3xl border border-border/20 bg-card p-4 xl:col-span-4">
          <div className="mb-4 px-2">
            <input
              type="search"
              placeholder={copy.searchPlaceholder}
              className="h-11 w-full rounded-full bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <p className="px-2 py-4 text-sm text-muted-foreground">{copy.noConversations}</p>
            ) : (
              conversations.map((conversation, index) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`w-full rounded-2xl px-4 py-3 text-left ${
                    index === 0 ? "bg-muted" : "hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{conversation.contactName}</p>
                    <span className="text-xs text-muted-foreground">{conversation.lastSeen}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-primary">{conversation.petName}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{conversation.preview}</p>
                </button>
              ))
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-border/20 bg-card p-6 xl:col-span-5">
          {activeConversation ? (
            <>
              <div className="border-b border-border/20 pb-4">
                <p className="text-lg font-bold">{activeConversation.petName}</p>
                <p className="text-sm text-muted-foreground">
                  {locale === "pt" ? "Conversa com" : "Chat with"} {activeConversation.contactName}
                </p>
              </div>

              <div className="space-y-4 py-6">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm">
                  {locale === "pt"
                    ? `Ola! Vi ${activeConversation.petName} no catalogo e queria saber se ainda esta disponivel.`
                    : `Hi! I saw ${activeConversation.petName} in the catalog and wanted to confirm if still available.`}
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
                  {locale === "pt"
                    ? "Sim, esta disponivel. Posso partilhar os proximos passos para visita."
                    : "Yes, currently available. I can share the next steps for scheduling a visit."}
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-2">
                  <input
                    type="text"
                    placeholder={copy.inputPlaceholder}
                    className="h-9 flex-1 bg-transparent px-2 text-sm outline-none"
                  />
                  <button type="button" className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
                    {copy.send}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{copy.noConversations}</p>
          )}
        </article>

        <article className="rounded-3xl border border-border/20 bg-card p-6 xl:col-span-3">
          <h2 className="text-lg font-bold">{activeConversation?.contactName ?? "-"}</h2>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">{copy.adopterInfo}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="rounded-xl bg-muted px-3 py-2">{copy.profileVerified}</li>
            <li className="rounded-xl bg-muted px-3 py-2">{locale === "pt" ? "Casa com quintal" : "House with backyard"}</li>
            <li className="rounded-xl bg-muted px-3 py-2">{locale === "pt" ? "Resposta media: < 2h" : "Average response: < 2h"}</li>
          </ul>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">{copy.reminder}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "pt"
              ? "Confirmar compatibilidade com outros animais durante a visita presencial."
              : "Confirm compatibility with other pets during the in-person visit."}
          </p>
        </article>
      </section>
    </main>
  );
}
