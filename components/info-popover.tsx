"use client";

import type { ReactNode } from "react";
import { Popover } from "radix-ui";
import { Info, X } from "lucide-react";

type InfoPopoverProps = {
  /** Accessible name for the ⓘ button. */
  label: string;
  closeLabel: string;
  children: ReactNode;
};

export function InfoPopover({ label, closeLabel, children }: InfoPopoverProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={label}
        className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted data-[state=open]:text-primary"
      >
        <Info className="size-5" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="z-50 w-72 rounded-2xl border border-border bg-card p-4 pr-10 text-sm leading-6 text-muted-foreground shadow-lg"
        >
          {children}
          <Popover.Close
            aria-label={closeLabel}
            className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </Popover.Close>
          <Popover.Arrow className="fill-card" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
