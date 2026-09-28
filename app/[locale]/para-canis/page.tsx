import { Captcha } from "@/components/captcha";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { requestPilot } from "@/app/records/pilot-actions";
import { SubmitButton } from "@/components/submit-button";
import { staticPageMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs, sectionCrumb } from "@/components/breadcrumbs";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "forShelters");
}
export default async function ForShelters({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const pt = locale === "pt",
    search = await searchParams,
    input = "mt-1 block w-full rounded-xl border bg-background p-3";
  const features = pt
    ? [
        [
          "Cada animal, um registo",
          "Ficha pública e informação privada, documentos e histórico organizados.",
        ],
        [
          "Cada pedido, um acompanhamento",
          "Pesquisa, responsáveis, respostas modelo e visitas para acompanhar cada família.",
        ],
        [
          "Uma equipa, contas individuais",
          "Leitores e editores, tarefas com prazo e seguimento depois da adoção.",
        ],
      ]
    : [
        [
          "One record for each animal",
          "Public profiles, private information, documents and an organised history.",
        ],
        [
          "Follow every application",
          "Search, assignees, reply templates and visits to support each family.",
        ],
        [
          "A team with individual accounts",
          "Readers and editors, deadlines and follow-up after adoption.",
        ],
      ];
  return (
    <main id="main-content" className="page-shell space-y-12">
      <Breadcrumbs
        locale={locale}
        items={[{ label: sectionCrumb(locale, "forShelters").label }]}
        currentPath="/para-canis"
      />
      <header className="rounded-3xl bg-primary p-8 text-primary-foreground md:p-12">
        <p className="text-sm font-bold uppercase tracking-widest">
          {pt
            ? "Para canis e associações"
            : "For shelters and animal organisations"}
        </p>
        <h1 className="display-title mt-4 max-w-3xl text-4xl md:text-6xl">
          {pt
            ? "Mais tempo para os animais. Informação num só lugar."
            : "More time for animals. Information in one place."}
        </h1>
        <p className="my-6 max-w-2xl text-lg">
          {pt
            ? "A FYA reúne registos, candidaturas, documentos e acompanhamento para apoiar o trabalho da tua equipa. Estamos a preparar o piloto com organizações."
            : "FYA brings records, applications, documents and follow-up together to support your team. We are preparing a pilot with organisations."}
        </p>
        <a
          href="#piloto"
          className="inline-block rounded-full bg-white px-6 py-3 font-bold text-[#214e43]"
        >
          {pt ? "Quero conhecer o piloto" : "Explore the pilot"}
        </a>
      </header>
      <section className="grid gap-5 md:grid-cols-3">
        {features.map(([title, text]) => (
          <article className="rounded-2xl border bg-card p-6" key={title}>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-3 leading-7">{text}</p>
          </article>
        ))}
      </section>
      <section className="rounded-3xl bg-muted p-7">
        <h2 className="text-2xl font-bold">
          {pt
            ? "Do primeiro registo ao acompanhamento"
            : "From the first record to follow-up"}
        </h2>
        <ol className="my-5 list-decimal space-y-3 pl-6">
          {(pt
            ? [
                "Prepara o perfil do canil e importa ou regista os animais.",
                "Organiza a equipa, recebe candidaturas e combina visitas.",
                "Prepara o dossier e acompanha a família depois da adoção.",
              ]
            : [
                "Set up the shelter and import or register your animals.",
                "Organise your team, receive applications and arrange visits.",
                "Prepare the dossier and follow up with the family after adoption.",
              ]
          ).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <Link className="underline font-semibold" href={`/${locale}/ajuda`}>
          {pt
            ? "Explorar os guias e o funcionamento"
            : "Explore guides and workflows"}{" "}
          →
        </Link>
      </section>
      <section id="piloto" className="grid scroll-mt-24 gap-8 md:grid-cols-2">
        <div>
          <h2 className="display-title text-3xl">
            {pt ? "Vamos conhecer o teu canil" : "Tell us about your shelter"}
          </h2>
          <p className="mt-4 leading-7">
            {pt
              ? "Deixa um pedido de contacto para uma demonstração e para conhecer as condições do piloto. O pedido não cria uma subscrição nem confirma a participação."
              : "Request contact for a demonstration and information about pilot conditions. This does not create a subscription or confirm participation."}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {pt
              ? "Não incluas dados de adotantes, documentos ou informação clínica neste formulário."
              : "Do not include applicant data, documents or clinical information in this form."}
          </p>
          <Link
            href={`/${locale}/auth/shelter-registration`}
            className="mt-5 inline-block underline"
          >
            {pt
              ? "Já queres criar a conta do canil?"
              : "Ready to create a shelter account?"}
          </Link>
        </div>
        <form
          action={requestPilot}
          className="space-y-4 rounded-2xl border bg-card p-6"
        >
          <input type="hidden" name="locale" value={locale} />
          {search.success && (
            <p role="status">
              {pt
                ? "Pedido recebido. A equipa pode consultá-lo e entrar em contacto pelo email indicado."
                : "Request received. The team can review it and contact the email provided."}
            </p>
          )}
          {search.error && (
            <p role="alert">
              {pt
                ? "Não foi possível receber o pedido. Revê os campos ou tenta novamente mais tarde."
                : "Could not receive your request. Check the fields or try again later."}
            </p>
          )}
          {(
            [
              [
                "organization",
                pt ? "Nome do canil / associação" : "Shelter / organisation",
                160,
              ],
              ["contact", pt ? "O teu nome" : "Your name", 120],
              ["email", "Email", 254],
              ["location", pt ? "Localidade" : "Location", 160],
            ] as const
          ).map(([name, label, max]) => (
            <label className="block" key={name}>
              {label}
              <input
                name={name}
                type={name === "email" ? "email" : "text"}
                required
                minLength={2}
                maxLength={max}
                autoComplete={
                  name === "email"
                    ? "email"
                    : name === "contact"
                      ? "name"
                      : name === "organization"
                        ? "organization"
                        : "address-level2"
                }
                className={input}
              />
            </label>
          ))}
          <label className="block">
            {pt
              ? "O que gostarias de melhorar? (opcional)"
              : "What would you like to improve? (optional)"}
            <textarea
              name="message"
              rows={4}
              maxLength={2000}
              className={input}
            />
          </label>
          <div hidden aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input name="consent" type="checkbox" required className="mt-1" />
            <span>
              {pt
                ? "Li a informação de privacidade e peço que a FYA use estes dados para responder a este contacto sobre o piloto. Não subscrevo comunicações de marketing."
                : "I have read the privacy information and request that FYA use these details to respond about the pilot. This does not subscribe me to marketing."}{" "}
              <Link className="underline" href={`/${locale}/privacidade`}>
                {pt ? "Privacidade" : "Privacy"}
              </Link>
            </span>
          </label>
          <Captcha locale={locale} />
          <SubmitButton className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
            {pt ? "Pedir contacto sobre o piloto" : "Request pilot contact"}
          </SubmitButton>
        </form>
      </section>
    </main>
  );
}
