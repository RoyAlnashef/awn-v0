"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { Briefcase, ChevronDown, LifeBuoy, LogOut, User } from "lucide-react"

import { signOut } from "@/lib/auth/sign-out"
import { setAppearOffline, touchPresence } from "@/lib/presence/actions"
import { iconWithTextDimClass } from "@/lib/icon-styles"
import { cn } from "@/lib/utils"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"

export type NavUserData = {
  name: string
  title: string
  email: string
  avatarUrl?: string
  initials: string
  appearOffline: boolean
  online: boolean
}

const links = [
  { label: "My Account", href: "/account", icon: User },
  { label: "My Jobs", href: "/my-jobs", icon: Briefcase },
  { label: "Support", href: "/intel", icon: LifeBuoy },
]

export function NavUser({ user }: { user: NavUserData }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [appearOffline, setAppearOfflineState] = useState(user.appearOffline)
  const [online, setOnline] = useState(user.online)

  const showOnlineDot = online && !appearOffline

  useEffect(() => {
    setAppearOfflineState(user.appearOffline)
    setOnline(user.online)
  }, [user.appearOffline, user.online])

  useEffect(() => {
    if (!appearOffline) {
      setOnline(true)
    }
  }, [appearOffline])

  function handleSignOut() {
    setOpen(false)
    startTransition(async () => {
      await signOut()
    })
  }

  function handleAppearOfflineChange(checked: boolean) {
    const previousAppearOffline = appearOffline
    const previousOnline = online

    setAppearOfflineState(checked)
    if (checked) {
      setOnline(false)
    } else {
      setOnline(true)
      void touchPresence()
    }

    void setAppearOffline(checked).then((result) => {
      if (!result.ok) {
        setAppearOfflineState(previousAppearOffline)
        setOnline(previousOnline)
      }
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-8">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt="" />
          ) : null}
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline-block">
          {user.name}
        </span>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:inline-block" />
      </PopoverTrigger>
      {open ? (
        <PopoverContent align="end" className="w-60 gap-0 p-0">
          <div className="flex items-center gap-2.5 p-3">
            <Avatar className="size-9">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt="" />
              ) : null}
              <AvatarFallback>{user.initials}</AvatarFallback>
              <AvatarBadge online={showOnlineDot} className="size-2.5" />
            </Avatar>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.title || user.email}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t px-3 py-2.5">
            <label
              htmlFor="appear-offline"
              className="text-sm font-medium leading-none"
            >
              Appear offline
            </label>
            <Switch
              id="appear-offline"
              checked={appearOffline}
              onCheckedChange={handleAppearOfflineChange}
              aria-label="Appear offline"
            />
          </div>

          <div className="border-t p-1">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none transition-colors",
                  "hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                  iconWithTextDimClass,
                )}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t p-1">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isPending}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                iconWithTextDimClass,
              )}
            >
              <LogOut className="size-4" />
              {isPending ? "Signing out…" : "Log out"}
            </button>
          </div>
        </PopoverContent>
      ) : null}
    </Popover>
  )
}
