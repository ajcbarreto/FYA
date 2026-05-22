import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FileText, Heart, MessageCircle, Search } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getAdoptionRequestsForUser, getConversationsForUser } from "@/lib/adoption/db";
import { getFavoriteAnimalIds } from "@/lib/favorites/db";
import { PageHeader } from "@/components/page-header";

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

  const copy = getDictionary(locale).userDashboard;

  const stats = {
    total: requests.length,
    pending: requests.filter((request) => ["pendente", "entrevista"].includes(request.status)).length,
    approved: requests.filter((request) => request.status === "aprovado").length,
    chats: conversations.length,
    favorites: favorites.size,
  };

  return (
    <main className="space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <article className="rounded-2xl border border-border/20 bg-card p-5">
          <p className="text-sm text-muted-foreground">{copy.cardTotal}</p>
          <p className="mt-1 text-3xl font-bold">{stats.total}</p>
        </article>
        <article className="rounded-2xl border border-border/20 bg-card p-5">
          <p className="text-sm text-muted-foreground">{copy.cardPending}</p>
          <p className="mt-1 text-3xl font-bold text-primary">{stats.pending}</p>
        </article>
        <article className="rounded-2xl border border-border/20 bg-card p-5">
          <p className="text-sm text-muted-foreground">{copy.cardApproved}</p>
          <p className="mt-1 text-3xl font-bold text-secondary">{stats.approved}</p>
        </article>
        <article className="rounded-2xl border border-border/20 bg-card p-5">
          <p className="text-sm text-muted-foreground">{copy.cardChats}</p>
          <p className="mt-1 text-3xl font-bold">{stats.chats}</p>
        </article>
        <article className="rounded-2xl border border-border/20 bg-card p-5">
          <p className="text-sm text-muted-foreground">{copy.cardFavorites}</p>
          <p className="mt-1 text-3xl font-bold text-primary">{stats.favorites}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href={`/${locale}/pets`} className="flex items-center gap-3 rounded-2xl border border-border/20 bg-card p-5 hover:bg-muted">
          <Search className="h-5 w-5 text-primary" />
          <span className="font-semibold">{copy.browsePets}</span>
        </Link>
        <Link href={`/${locale}/user/favoritos`} className="flex items-center gap-3 rounded-2xl border border-border/20 bg-card p-5 hover:bg-muted">
          <Heart className="h-5 w-5 text-primary" />
          <span className="font-semibold">{copy.viewFavorites}</span>
        </Link>
        <Link href={`/${locale}/user/pedidos`} className="flex items-center gap-3 rounded-2xl border border-border/20 bg-card p-5 hover:bg-muted">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-semibold">{copy.viewRequests}</span>
        </Link>
        <Link href={`/${locale}/user/mensagens`} className="flex items-center gap-3 rounded-2xl border border-border/20 bg-card p-5 hover:bg-muted">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="font-semibold">{copy.openMessages}</span>
        </Link>
      </section>
    </main>
  );
}
