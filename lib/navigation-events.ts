export function notifyNavigationStart() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("fya:navigation-start"));
  }
}
