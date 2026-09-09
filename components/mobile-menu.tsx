"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { Menu, X } from "lucide-react";
import { Brand } from "@/components/brand";
export type MobileLink = { href: string; label: string };
export function MobileMenu({
  links,
  closeLabel,
  openLabel,
}: {
  links: MobileLink[];
  closeLabel: string;
  openLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger aria-label={openLabel} className="icon-button lg:hidden">
        <Menu className="size-5" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-foreground/35 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-[101] flex w-80 max-w-[90vw] flex-col gap-2 overflow-y-auto bg-background p-6 shadow-2xl"
        >
          <Dialog.Title className="mb-6">
            <Brand />
          </Dialog.Title>
          <Dialog.Close
            aria-label={closeLabel}
            className="icon-button absolute right-5 top-6"
          >
            <X className="size-5" />
          </Dialog.Close>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`rounded-xl px-4 py-3 text-sm font-semibold ${pathname === link.href ? "bg-primary text-white" : "hover:bg-muted"}`}
            >
              {link.label}
            </Link>
          ))}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
