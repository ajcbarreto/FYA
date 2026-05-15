import { notFound } from "next/navigation";
import { Cat, Dog, Home, PawPrint, Sparkles } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { findMatches } from "@/app/match/actions";

type MatchPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MatchPage({ params }: MatchPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const isPt = locale === "pt";
  const copy = isPt
    ? {
        eyebrow: "Encontra o teu match",
        title: "Qual e o animal certo para ti?",
        subtitle: "Responde a 3 perguntas rapidas e mostramos-te os animais que melhor encaixam no teu estilo de vida.",
        q1: "Que tipo de companheiro procuras?",
        q1Options: [
          { value: "", label: "Indiferente" },
          { value: "cao", label: "Um cao" },
          { value: "gato", label: "Um gato" },
        ],
        q2: "Onde vives?",
        q2Options: [
          { value: "apartamento", label: "Apartamento" },
          { value: "casa", label: "Casa" },
          { value: "casa_grande", label: "Casa com quintal grande" },
        ],
        q3: "Quanto tempo livre tens por dia?",
        q3Options: [
          { value: "pouco", label: "Pouco (trabalho/estudo a tempo inteiro)" },
          { value: "medio", label: "Algum tempo todos os dias" },
          { value: "muito", label: "Bastante tempo para passeios e brincadeira" },
        ],
        submit: "Ver os meus matches",
        hint: "Vamos abrir o catalogo ja filtrado com base nas tuas respostas.",
      }
    : {
        eyebrow: "Find your match",
        title: "Which pet is right for you?",
        subtitle: "Answer 3 quick questions and we'll show the pets that best fit your lifestyle.",
        q1: "What kind of companion are you looking for?",
        q1Options: [
          { value: "", label: "No preference" },
          { value: "cao", label: "A dog" },
          { value: "gato", label: "A cat" },
        ],
        q2: "Where do you live?",
        q2Options: [
          { value: "apartamento", label: "Apartment" },
          { value: "casa", label: "House" },
          { value: "casa_grande", label: "House with a large yard" },
        ],
        q3: "How much free time do you have per day?",
        q3Options: [
          { value: "pouco", label: "Little (full-time work/study)" },
          { value: "medio", label: "Some time every day" },
          { value: "muito", label: "Plenty of time for walks and play" },
        ],
        submit: "See my matches",
        hint: "We'll open the catalog already filtered based on your answers.",
      };

  const questions = [
    { name: "species", label: copy.q1, icon: PawPrint, options: copy.q1Options },
    { name: "home", label: copy.q2, icon: Home, options: copy.q2Options },
    { name: "time", label: copy.q3, icon: Sparkles, options: copy.q3Options },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-16 pt-10 lg:px-8">
      <div className="rounded-3xl bg-gradient-to-br from-primary to-accent p-8 text-center text-primary-foreground md:p-12">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          {copy.eyebrow}
        </p>
        <h1 className="mx-auto mt-5 max-w-md text-3xl font-extrabold tracking-tight md:text-4xl">{copy.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/85">{copy.subtitle}</p>
        <div className="mt-6 flex items-center justify-center gap-4 text-primary-foreground/80">
          <Dog className="h-7 w-7" />
          <Cat className="h-7 w-7" />
        </div>
      </div>

      <form action={findMatches} className="mt-8 space-y-6">
        <input type="hidden" name="locale" value={locale} />
        {questions.map((question, index) => {
          const Icon = question.icon;
          return (
            <fieldset key={question.name} className="rounded-2xl border border-border/40 bg-card p-5">
              <legend className="flex items-center gap-2 px-1 text-sm font-bold">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary">
                  {index + 1}
                </span>
                <Icon className="h-4 w-4 text-primary" />
                {question.label}
              </legend>
              <div className="mt-3 space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={option.value || "any"}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/30 px-4 py-3 text-sm transition-colors hover:border-primary/40 hover:bg-muted/60 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name={question.name}
                      value={option.value}
                      defaultChecked={optionIndex === 0}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}

        <div className="space-y-3 text-center">
          <button
            type="submit"
            className="w-full rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:brightness-105"
          >
            {copy.submit}
          </button>
          <p className="text-xs text-muted-foreground">{copy.hint}</p>
        </div>
      </form>
    </main>
  );
}
