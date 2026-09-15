"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "href" | "prefetch"> & {
  href: string;
};

/** Prefetch the full destination on intent, instead of only its loading shell. */
export function NavigationLink({
  href,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: Props) {
  const [prefetchedHref, setPrefetchedHref] = useState<string | null>(null);
  return (
    <Link
      {...props}
      href={href}
      prefetch={prefetchedHref === href ? true : null}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        setPrefetchedHref(href);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        setPrefetchedHref(href);
      }}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        setPrefetchedHref(href);
      }}
    />
  );
}
