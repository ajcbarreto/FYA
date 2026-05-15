"use client"

import Link from "next/link"
import { Settings, LayoutDashboard, LogOut, ChevronDown } from "lucide-react"
import { logout } from "@/app/auth/register/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type AccountDropdownProps = {
  locale: string
  displayName: string
  email: string | null
  initial: string
  roleLabel: string
  dashboardHref: string
  dashboardLabel: string
  settingsHref: string
  settingsLabel: string
  menuCopy: {
    openMenu: string
    panel: string
    settings: string
    logout: string
  }
}

export function AccountDropdown({
  locale,
  displayName,
  email,
  initial,
  roleLabel,
  dashboardHref,
  dashboardLabel,
  settingsHref,
  settingsLabel,
  menuCopy,
}: AccountDropdownProps) {
  const itemClass =
    "cursor-pointer gap-3 rounded-xl px-2 py-2.5 text-sm font-medium focus:bg-muted"
  const itemIcon =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={menuCopy.openMenu}
          className="group inline-flex h-10 items-center gap-2 rounded-full border border-border/60 bg-card pl-1 pr-2.5 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-black text-primary-foreground">
            {initial}
          </span>
          <span className="hidden max-w-[120px] truncate text-sm font-semibold sm:inline">
            {displayName}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 rounded-2xl border-border/50 p-2 shadow-xl"
      >
        <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-base font-black text-primary-foreground">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{displayName}</p>
            {email ? <p className="truncate text-xs text-muted-foreground">{email}</p> : null}
            <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {roleLabel}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem asChild className={itemClass}>
          <Link href={dashboardHref}>
            <span className={itemIcon}>
              <LayoutDashboard className="h-4 w-4" />
            </span>
            <span>{dashboardLabel}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={itemClass}>
          <Link href={settingsHref}>
            <span className={itemIcon}>
              <Settings className="h-4 w-4" />
            </span>
            <span>{settingsLabel}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <form action={logout}>
          <input type="hidden" name="locale" value={locale} />
          <DropdownMenuItem
            asChild
            variant="destructive"
            className="cursor-pointer gap-3 rounded-xl px-2 py-2.5 text-sm font-medium"
          >
            <button type="submit" className="w-full">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <LogOut className="h-4 w-4" />
              </span>
              <span>{menuCopy.logout}</span>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
