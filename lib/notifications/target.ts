/** Notification destinations must stay inside the current locale. */
export function notificationTarget(link: string | null, locale: string) {
  const fallback = `/${locale}/notificacoes`;
  if (
    !link ||
    !link.startsWith("/") ||
    link.startsWith("//") ||
    /[\\\x00-\x20]/.test(link)
  )
    return fallback;
  try {
    const decoded = decodeURIComponent(link);
    if (
      decoded.startsWith("//") ||
      /[\\\x00-\x20]/.test(decoded) ||
      decoded.split(/[/?#]/).includes("..")
    )
      return fallback;
  } catch {
    return fallback;
  }
  const path = link.replace(/^\/(pt|en)(?=\/|$)/, "");
  return `/${locale}${path || "/"}`;
}
