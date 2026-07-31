"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Briefcase,
  Link2,
  Settings,
  Star,
  User,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

const NAV_ITEMS = [
  { label: "Profile", href: "/account/profile", icon: User },
  { label: "Tour Credits", href: "/account/tour-credits", icon: Star },
  { label: "Jobs", href: "/account/jobs", icon: Briefcase },
  { label: "Network", href: "/account/network", icon: Users },
  { label: "Social", href: "/account/social", icon: Link2 },
  { label: "Settings", href: "/account/settings", icon: Settings },
] as const

export function AccountNav() {
  const pathname = usePathname()
  const router = useRouter()

  const activeItem = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  )

  return (
    <nav aria-label="Account navigation">
      {/* Mobile: select dropdown */}
      <div className="md:hidden">
        <NativeSelect
          value={activeItem?.href ?? ""}
          onChange={(e) => router.push(e.target.value)}
          className="w-full"
        >
          {NAV_ITEMS.map(({ label, href }) => (
            <NativeSelectOption key={href} value={href}>
              {label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {/* Desktop: vertical link list */}
      <ul className="hidden flex-col gap-0.5 md:flex">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary"
                  />
                )}
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
