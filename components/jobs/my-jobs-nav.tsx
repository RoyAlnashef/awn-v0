"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Briefcase, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

const NAV_ITEMS = [
  { label: "My Jobs", href: "/my-jobs/created", icon: Briefcase },
  { label: "My Applications", href: "/my-jobs/applications", icon: Send },
] as const

export function MyJobsNav() {
  const pathname = usePathname()
  const router = useRouter()

  const activeItem = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  )

  return (
    <nav aria-label="My Jobs navigation">
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
