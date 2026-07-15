"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, User, Settings, LifeBuoy, LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const user = {
  name: "Jordan Ellis",
  role: "Production Manager",
  email: "jordan@awrightnetwork.com",
  avatar: "/images/avatar-jordan.png",
}

const links = [
  { label: "My profile", href: "/settings", icon: User },
  { label: "Account settings", href: "/settings", icon: Settings },
  { label: "Support", href: "/intel", icon: LifeBuoy },
]

export function NavUser() {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-8">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt="" />
          <AvatarFallback>JE</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline-block">
          {user.name}
        </span>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:inline-block" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 gap-0 p-0">
        <div className="flex items-center gap-2.5 p-3">
          <Avatar className="size-9">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt="" />
            <AvatarFallback>JE</AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.role}</span>
          </div>
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
              )}
            >
              <link.icon className="size-4 text-muted-foreground" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="border-t p-1">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
