import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FileText, Heart, MessageCircle, Search } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getAdoptionRequestsForUser, getConversationsForUser } from "@/lib/adoption/db";
import { getFavoriteAnimalIds } from "@/lib/favorites/db";

type UserDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function UserDashboardPage({ params }: UserDashboardPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/user`);
  }

  const [requests, conversations, favorites] = await Promise.all([
    getAdoptionRequestsForUser(supabase, user.id),
    getConversationsForUser(supabase, user.id),
    getFavoriteAnimalIds(supabase, user.id),
  ]);

  const copy =
    locale === "pt"
      ? {
          title: "Dashboard do Adotante",
          subtitle: "Acompanha pedidos e conversas com os canis.",
          cards: {
            total: "Pedidos enviados",
            pending: "Em analise",
            approved: "Aprovados",
            chats: "Conversas ativas",
            favorites: "Favoritos",
          },
          actions: {
            browsePets: "Explorar pets",
            viewRequests: "Ver pedidos",
            openMessages: "Abrir mensagens",
            viewFavorites: "Ver favoritos",
          },
        }
      : {
          title: "Adopter Dashboard",
          subtitle: "Track your requests and conversations with shelters.",
          cards: {
            total: "Requests sent",
            pending: "In review",
            approved: "Approved",
            chats: "Active chats",
            favorites: "Favorites",
          },
          actions: {
            browsePets: "Browse pets",
            viewRequests: "View requests",
            openMessages: "Open messages",
            viewFavorites: "View favorites",
          },
        };

  const stats = {
    total: requests.length,
    pending: requests.filter((request) => ["pendente", "entrevista"].includes(request.status)).length,
    approved: requests.filter((request) => request.status === "aprovado").length,
    chats: conversations.length,
    favorites: favorites.size,
  };

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <article className="rounded-2xl border border-border/20 bg-card p-5">
          <p className="text-sm text-muted-foreground">{copy.cards.total}</p>
          <p className="mt-1 text-3xl font-bold">{stats.total}</p>
        </article>
        <article className="rounded-2xl border border-border/20 bg-card p-5">
          <p className="text-sm text-muted-foreground">{copy.cards.pending}</p>
          <p className="mt-1 text-3xl font-bold text-primary">{stats.pending}</p>
        </article>
        <article className="rounded-2xl border border-border/20 bg-card p-5">
          <p className="text-sm text-muted-foreground">{copy.cards.approved}</p>
          <p className="mt-1 text-3xl font-bold text-secondary">{stats.approved}</p>
        </article>
        <article className="rounded-2xl border border-border/20 bg-card p-5">
          <p className="text-sm text-muted-foreground">{copy.cards.chats}</p>
          <p className="mt-1 text-3xl font-bold">{stats.chats}</p>
        </article>
        <article className="rounded-2xl border border-border/20 bg-card p-5">
          <p className="text-sm text-muted-foreground">{copy.cards.favorites}</p>
          <p className="mt-1 text-3xl font-bold text-primary">{stats.favorites}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href={`/${locale}/pets`} className="flex items-center gap-3 rounded-2xl border border-border/20 bg-card p-5 hover:bg-muted">
          <Search className="h-5 w-5 text-primary" />
          <span className="font-semibold">{copy.actions.browsePets}</span>
        </Link>
        <Link href={`/${locale}/user/favoritos`} className="flex items-center gap-3 rounded-2xl border border-border/20 bg-card p-5 hover:bg-muted">
          <Heart className="h-5 w-5 text-primary" />
          <span className="font-semibold">{copy.actions.viewFavorites}</span>
        </Link>
        <Link href={`/${locale}/user/pedidos`} className="flex items-center gap-3 rounded-2xl border border-border/20 bg-card p-5 hover:bg-muted">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-semibold">{copy.actions.viewRequests}</span>
        </Link>
        <Link href={`/${locale}/user/mensagens`} className="flex items-center gap-3 rounded-2xl border border-border/20 bg-card p-5 hover:bg-muted">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="font-semibold">{copy.actions.openMessages}</span>
        </Link>
      </section>
    </main>
  );
}
