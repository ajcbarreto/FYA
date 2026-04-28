"use client"

import Link from "next/link"
import { Settings, LayoutDashboard, LogOut, ChevronDown } from "lucide-react"
import { logout } from "@/app/auth/register/actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type AccountDropdownProps = {
  locale: string
  displayName: string
  email: string | null
  initial: string
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
  dashboardHref,
  dashboardLabel,
  settingsHref,
  settingsLabel,
  menuCopy,
}: AccountDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={menuCopy.openMenu}
          className="h-11 rounded-full border-border/50 bg-card/70 px-2 shadow-sm backdrop-blur-sm"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
            {initial}
          </span>
          <span className="hidden max-w-[130px] truncate pr-1 font-semibold sm:inline">
            {displayName}
          </span>
          <ChevronDown className="mr-1 h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl border-border/40 p-2 shadow-2xl">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-bold">{displayName}</p>
          {email ? <p className="truncate text-xs text-muted-foreground">{email}</p> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardHref} className="cursor-pointer rounded-xl">
            <LayoutDashboard className="h-4 w-4" />
            <span>{dashboardLabel}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={settingsHref} className="cursor-pointer rounded-xl">
            <Settings className="h-4 w-4" />
            <span>{settingsLabel}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logout}>
          <input type="hidden" name="locale" value={locale} />
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full cursor-pointer rounded-xl">
              <LogOut className="h-4 w-4" />
              <span>{menuCopy.logout}</span>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
