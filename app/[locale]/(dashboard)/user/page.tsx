import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  FileText,
  Heart,
  MessageCircle,
  PartyPopper,
  PawPrint,
  Search,
} from "lucide-react";
import type { ComponentType } from "react";
import { isLocale } from "@/lib/i18n/config";
import { getAuthUser } from "@/lib/supabase/get-user";
import {
  getAdoptionRequestsForUser,
  getConversationsForUser,
  localizeRequestStatus,
  type AdoptionRequestRow,
} from "@/lib/adoption/db";
import { getFavoriteAnimalIds } from "@/lib/favorites/db";
import { getUnreadNotificationsCount } from "@/lib/notifications/db";
import { listPhotosForAnimals } from "@/lib/canil/animal-photos";
import { getPublicCatalogPets } from "@/lib/pet-catalog/public-data";
import { PetCard } from "@/components/pet-card";

type UserDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

const RECENT_REJECTION_DAYS = 14;

const statusTone: Record<AdoptionRequestRow["status"], string> = {
  pendente: "bg-muted text-muted-foreground",
  entrevista: "bg-accent/15 text-accent-foreground dark:text-accent",
  aprovado: "bg-secondary/15 text-secondary",
  rejeitado: "bg-destructive/10 text-destructive",
  concluido: "bg-primary/10 text-primary",
};

function isRecentRejection(request: AdoptionRequestRow) {
  const reviewedAt = new Date(request.reviewed_at ?? request.created_at);
  return (
    Date.now() - reviewedAt.getTime() <= RECENT_REJECTION_DAYS * 86_400_000
  );
}

function firstRelation<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function UserDashboardPage({
  params,
}: UserDashboardPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const { supabase, user } = await getAuthUser();

  if (!user || !supabase) {
    redirect(`/${locale}/auth/login?next=/user`);
  }

  const [requests, conversations, favorites, unreadNotifications, profile] =
    await Promise.all([
      getAdoptionRequestsForUser(supabase, user.id),
      getConversationsForUser(supabase, user.id),
      getFavoriteAnimalIds(supabase, user.id),
      getUnreadNotificationsCount(supabase, user.id),
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => data),
    ]);

  const isPt = locale === "pt";
  const copy = isPt
    ? {
        greeting: (name: string | null) => (name ? `Olá, ${name}` : "Olá"),
        subtitle: "Aqui vês o ponto de situação das tuas adoções.",
        browse: "Explorar animais",
        attention: "Precisa da tua atenção",
        notifications: (n: number) =>
          n === 1
            ? "Tens 1 notificação por ler."
            : `Tens ${n} notificações por ler.`,
        interview: (animal: string, shelter: string) =>
          `${shelter} quer conhecer-te para a adoção de ${animal}. Combina a entrevista na conversa.`,
        approved: (animal: string, shelter: string) =>
          `O teu pedido para adotar ${animal} foi aprovado. Combina a entrega com ${shelter}.`,
        rejected: (animal: string) =>
          `O pedido para adotar ${animal} não avançou. Há outros animais à espera de família.`,
        openChat: "Abrir conversa",
        viewRequest: "Ver pedido",
        seeOthers: "Ver outros animais",
        stats: {
          inProgress: "Pedidos em curso",
          approved: "Aprovados",
          chats: "Conversas",
          favorites: "Favoritos",
        },
        recent: "Os teus pedidos recentes",
        viewAll: (n: number) => `Ver todos (${n})`,
        sentOn: "Enviado a",
        emptyTitle: "Ainda não fizeste nenhum pedido",
        emptyBody:
          "Explora os animais disponíveis nos canis e envia o teu primeiro pedido de adoção. Nós ajudamos-te a acompanhar tudo a partir daqui.",
        emptyWithFavorites: (n: number) =>
          `Já guardaste ${n === 1 ? "1 favorito" : `${n} favoritos`}. Escolhe um e envia o teu primeiro pedido de adoção.`,
        viewFavorites: "Ver favoritos",
        suggestions: "Podem ser o teu próximo companheiro",
        animal: "Animal",
        shelter: "Canil",
      }
    : {
        greeting: (name: string | null) => (name ? `Hi, ${name}` : "Hi"),
        subtitle: "Here is where your adoptions stand.",
        browse: "Browse animals",
        attention: "Needs your attention",
        notifications: (n: number) =>
          n === 1
            ? "You have 1 unread notification."
            : `You have ${n} unread notifications.`,
        interview: (animal: string, shelter: string) =>
          `${shelter} would like to meet you about adopting ${animal}. Arrange the interview in the chat.`,
        approved: (animal: string, shelter: string) =>
          `Your request for ${animal} was approved. Arrange the handover with ${shelter}.`,
        rejected: (animal: string) =>
          `Your request for ${animal} did not go ahead. Other animals are waiting for a family.`,
        openChat: "Open chat",
        viewRequest: "View request",
        seeOthers: "See other animals",
        stats: {
          inProgress: "Requests in progress",
          approved: "Approved",
          chats: "Conversations",
          favorites: "Favorites",
        },
        recent: "Your recent requests",
        viewAll: (n: number) => `View all (${n})`,
        sentOn: "Sent on",
        emptyTitle: "You have not sent any requests yet",
        emptyBody:
          "Browse the animals available at shelters and send your first adoption request. You can follow everything from here.",
        emptyWithFavorites: (n: number) =>
          `You have saved ${n === 1 ? "1 favorite" : `${n} favorites`}. Pick one and send your first adoption request.`,
        viewFavorites: "View favorites",
        suggestions: "Your next companion could be here",
        animal: "Animal",
        shelter: "Shelter",
      };

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] ?? null;
  const requestsHref = `/${locale}/user/pedidos`;
  const messagesHref = `/${locale}/user/mensagens`;
  const favoritesHref = `/${locale}/user/favoritos`;
  const petsHref = `/${locale}/pets`;

  const conversationByRequest = new Map(
    conversations
      .filter((conversation) => conversation.pedido_id)
      .map((conversation) => [conversation.pedido_id, conversation.id]),
  );
  const chatHref = (requestId: string) => {
    const conversationId = conversationByRequest.get(requestId);
    return conversationId
      ? `${messagesHref}?conversation=${conversationId}`
      : requestsHref;
  };

  const describe = (request: AdoptionRequestRow) => ({
    animal: firstRelation(request.animais)?.nome ?? copy.animal,
    shelter: firstRelation(request.canis)?.nome ?? copy.shelter,
  });

  const attentionItems: {
    key: string;
    icon: ComponentType<{ className?: string }>;
    text: string;
    href: string;
    cta: string;
  }[] = [];
  for (const request of requests) {
    const { animal, shelter } = describe(request);
    if (request.status === "entrevista") {
      attentionItems.push({
        key: request.id,
        icon: CalendarCheck,
        text: copy.interview(animal, shelter),
        href: chatHref(request.id),
        cta: conversationByRequest.has(request.id)
          ? copy.openChat
          : copy.viewRequest,
      });
    } else if (request.status === "aprovado") {
      attentionItems.push({
        key: request.id,
        icon: PartyPopper,
        text: copy.approved(animal, shelter),
        href: chatHref(request.id),
        cta: conversationByRequest.has(request.id)
          ? copy.openChat
          : copy.viewRequest,
      });
    } else if (request.status === "rejeitado" && isRecentRejection(request)) {
      attentionItems.push({
        key: request.id,
        icon: PawPrint,
        text: copy.rejected(animal),
        href: petsHref,
        cta: copy.seeOthers,
      });
    }
  }
  if (unreadNotifications > 0) {
    attentionItems.push({
      key: "notifications",
      icon: Bell,
      text: copy.notifications(unreadNotifications),
      href: `/${locale}/notificacoes`,
      cta: isPt ? "Ver notificações" : "View notifications",
    });
  }

  const hasRequests = requests.length > 0;
  const recentRequests = requests.slice(0, 3);
  const [requestPhotos, suggestedPets] = await Promise.all([
    listPhotosForAnimals(
      supabase,
      recentRequests.map((request) => request.animal_id),
    ).catch(() => new Map<string, string[]>()),
    hasRequests
      ? Promise.resolve([])
      : getPublicCatalogPets(locale, { limit: 3 }).catch(() => []),
  ]);

  const stats = [
    {
      label: copy.stats.inProgress,
      value: requests.filter((request) =>
        ["pendente", "entrevista"].includes(request.status),
      ).length,
      href: requestsHref,
      icon: FileText,
    },
    {
      label: copy.stats.approved,
      value: requests.filter((request) =>
        ["aprovado", "concluido"].includes(request.status),
      ).length,
      href: requestsHref,
      icon: PartyPopper,
    },
    {
      label: copy.stats.chats,
      value: conversations.length,
      href: messagesHref,
      icon: MessageCircle,
    },
    {
      label: copy.stats.favorites,
      value: favorites.size,
      href: favoritesHref,
      icon: Heart,
    },
  ];

  const dateFormatter = new Intl.DateTimeFormat(isPt ? "pt-PT" : "en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Lisbon",
  });

  return (
    <main id="main-content" tabIndex={-1} className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-border/50 bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="display-title text-3xl sm:text-4xl">
            {copy.greeting(firstName)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        <Link href={petsHref} className="button-primary shrink-0">
          <Search aria-hidden className="size-4" />
          {copy.browse}
        </Link>
      </header>

      {attentionItems.length > 0 && (
        <section
          aria-labelledby="attention-title"
          className="rounded-3xl border border-accent/30 bg-accent/5 p-5 sm:p-6"
        >
          <h2 id="attention-title" className="text-lg font-bold">
            {copy.attention}
          </h2>
          <ul className="mt-3 divide-y divide-border/50">
            {attentionItems.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.key}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center"
                >
                  <Icon aria-hidden className="size-5 shrink-0 text-accent" />
                  <p className="flex-1 text-sm">{item.text}</p>
                  <Link
                    href={item.href}
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    {item.cta}
                    <ArrowRight aria-hidden className="size-4" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {hasRequests ? (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="group rounded-2xl border border-border/20 bg-card p-5 transition-colors hover:border-primary/30 hover:bg-muted"
                >
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon aria-hidden className="size-4" />
                    {stat.label}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-primary">
                    {stat.value}
                  </p>
                </Link>
              );
            })}
          </section>

          <section
            aria-labelledby="recent-title"
            className="rounded-3xl border border-border/50 bg-card p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 id="recent-title" className="text-lg font-bold">
                {copy.recent}
              </h2>
              <Link
                href={requestsHref}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {copy.viewAll(requests.length)}
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-border/50">
              {recentRequests.map((request) => {
                const { animal, shelter } = describe(request);
                const photo = requestPhotos.get(request.animal_id)?.[0];
                return (
                  <li key={request.id}>
                    <Link
                      href={`/${locale}/pets/${request.animal_id}`}
                      className="flex items-center gap-4 rounded-xl py-3 transition-colors hover:bg-muted/60"
                    >
                      {photo ? (
                        <Image
                          src={photo}
                          alt=""
                          width={48}
                          height={48}
                          className="size-12 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                          <PawPrint
                            aria-hidden
                            className="size-5 text-muted-foreground"
                          />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">
                          {animal}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {shelter} · {copy.sentOn}{" "}
                          {dateFormatter.format(new Date(request.created_at))}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusTone[request.status]}`}
                      >
                        {localizeRequestStatus(request.status, locale)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      ) : (
        <>
          <section className="surface flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <PawPrint aria-hidden className="size-10 shrink-0 text-secondary" />
            <div className="flex-1">
              <h2 className="text-lg font-bold">{copy.emptyTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {favorites.size > 0
                  ? copy.emptyWithFavorites(favorites.size)
                  : copy.emptyBody}
              </p>
            </div>
            {favorites.size > 0 ? (
              <Link href={favoritesHref} className="button-primary shrink-0">
                <Heart aria-hidden className="size-4" />
                {copy.viewFavorites}
              </Link>
            ) : (
              <Link href={petsHref} className="button-primary shrink-0">
                <Search aria-hidden className="size-4" />
                {copy.browse}
              </Link>
            )}
          </section>

          {suggestedPets.length > 0 && (
            <section aria-labelledby="suggestions-title" className="space-y-4">
              <h2 id="suggestions-title" className="text-lg font-bold">
                {copy.suggestions}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {suggestedPets.map((pet) => (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    locale={locale}
                    isFavorite={favorites.has(pet.id)}
                    returnTo={`/${locale}/user`}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
