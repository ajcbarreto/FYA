"use client";

import { notifyNavigationStart } from "@/lib/navigation-events";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode } from "react";

type ClientGetFormProps = {
  action: string;
  children: ReactNode;
  className?: string;
};

export function ClientGetForm({
  action,
  children,
  className,
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
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}
