import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";

type CanilDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CanilDashboardPage({ params }: CanilDashboardPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const dashboardTitle = locale === "pt" ? "Dashboard do Canil" : "Shelter Dashboard";
  const dashboardSubtitle =
    locale === "pt"
      ? "Area protegida para utilizadores com role canil."
      : "Protected area for users with role canil.";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold">{dashboardTitle}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{dashboardSubtitle}</p>
      <Button asChild className="mt-5">
        <Link href={`/${locale}/canil/perfil`}>{dictionary.canilProfile.openProfileCta}</Link>
      </Button>
    </main>
  );
}
