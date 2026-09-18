"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, Shield, SlidersHorizontal, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

const NAV_ITEMS = [
  { label: "Account", href: "/settings/account", icon: User },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
  { label: "Privacy", href: "/settings/privacy", icon: Shield },
  { label: "Preferences", href: "/settings/preferences", icon: SlidersHorizontal },
] as const

export function SettingsNav() {
  const pathname = usePathname()
  const router = useRouter()

  const activeItem = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  )

  return (
    <nav aria-label="Settings navigation">
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
