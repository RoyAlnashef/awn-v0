"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Link2,
  Settings,
  Star,
  User,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

const NAV_ITEMS = [
  { label: "Profile", href: "/account/profile", icon: User },
  { label: "Tour Credits", href: "/account/tour-credits", icon: Star },
  { label: "Connections", href: "/account/network", icon: Users },
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
      <div className="lg:hidden">
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

      {/* Desktop: horizontal button nav */}
      <ul className="hidden flex-wrap items-center gap-2 lg:flex">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <li key={href}>
              <Button
                variant={active ? "secondary" : "outline"}
                size="sm"
                nativeButton={false}
                render={<Link href={href} />}
                aria-current={active ? "page" : undefined}
              >
                <Icon />
                {label}
              </Button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
