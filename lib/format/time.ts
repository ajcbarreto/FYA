// Formata um timestamp ISO numa string curta e localizada para listagens de
// conversas e atividade recente. Volta a uma data curta (12 Mar) para tudo
// que tenha mais de 6 dias.
export function formatRelativeTime(iso: string, locale: string) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";

  const diffSeconds = Math.max(0, Math.round((now - then) / 1000));
  const isPt = locale === "pt";

  if (diffSeconds < 45) {
    return isPt ? "agora" : "now";
  }
  const minutes = Math.round(diffSeconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} h`;
  }
  const days = Math.round(hours / 24);
  if (days === 1) {
    return isPt ? "ontem" : "yesterday";
  }
  if (days < 7) {
    return `${days} d`;
  }

  try {
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(new Date(iso));
  } catch {
    return new Date(iso).toISOString().slice(0, 10);
  }
}
