"use client"

import Link from "next/link"
import { Settings, LayoutDashboard, LogOut } from "lucide-react"
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
          className="h-10 rounded-full px-2"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
            {initial}
          </span>
          <span className="hidden max-w-[130px] truncate pr-1 font-semibold sm:inline">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-2xl">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-bold">{displayName}</p>
          {email ? <p className="truncate text-xs text-muted-foreground">{email}</p> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardHref} className="cursor-pointer">
            <LayoutDashboard className="h-4 w-4" />
            <span>
              {menuCopy.panel}: {dashboardLabel}
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={settingsHref} className="cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>
              {menuCopy.settings}: {settingsLabel}
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logout}>
          <input type="hidden" name="locale" value={locale} />
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full cursor-pointer">
              <LogOut className="h-4 w-4" />
              <span>{menuCopy.logout}</span>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
