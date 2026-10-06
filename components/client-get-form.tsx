"use client";

import { notifyNavigationStart } from "@/lib/navigation-events";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode } from "react";

type ClientGetFormProps = {
  action: string;
  children: ReactNode;
  className?: string;
  /** Submit as soon as a chip, checkbox or select changes, so filters apply on click. */
  autoSubmit?: boolean;
};

export function ClientGetForm({
  action,
  children,
  className,
  autoSubmit,
}: ClientGetFormProps) {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim()) {
        params.set(key, value.trim());
      }
    }

    const query = params.toString();
    notifyNavigationStart();
    router.push(query ? `${action}?${query}` : action);
  };

  return (
    <form
      action={action}
      method="get"
      onSubmit={handleSubmit}
      onChange={(event) => {
        const target = event.target as EventTarget as HTMLInputElement;
        if (
          autoSubmit &&
          ["radio", "checkbox", "select-one"].includes(target.type)
        )
          event.currentTarget.requestSubmit();
      }}
      className={className}
    >
      {children}
    </form>
  );
}
