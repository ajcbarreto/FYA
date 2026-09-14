"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  return <NavigationIndicator key={routeKey} routeKey={routeKey} />;
}

function NavigationIndicator({ routeKey }: { routeKey: string }) {
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);
  const isNavigating = pendingFrom === routeKey;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      setPendingFrom(routeKey);
      clearTimeout(timer);
      timer = setTimeout(() => setPendingFrom(null), 15000);
    };
    const handleClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      try {
        const nextUrl = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (
          nextUrl.origin === currentUrl.origin &&
          `${nextUrl.pathname}${nextUrl.search}` !==
            `${currentUrl.pathname}${currentUrl.search}`
        ) {
          start();
        }
      } catch {
        // Ignore malformed href values.
      }
    };

    const handleNavigationStart = start;

    document.addEventListener("click", handleClick, true);
    window.addEventListener("fya:navigation-start", handleNavigationStart);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("fya:navigation-start", handleNavigationStart);
    };
  }, [routeKey]);

  if (!isNavigating) {
    return null;
  }

  return (
    <div
      className="navigation-progress pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] overflow-hidden bg-primary/10"
      aria-hidden
    >
      <div className="navigation-progress-bar h-full bg-primary" />
    </div>
  );
}
