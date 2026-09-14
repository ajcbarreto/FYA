"use client";

import { useLinkStatus } from "next/link";

export function DashboardLinkStatus() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`ml-auto size-3 shrink-0 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin ${pending ? "opacity-100" : "opacity-0"}`}
    />
  );
}
