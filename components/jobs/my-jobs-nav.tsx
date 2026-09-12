"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bookmark, Briefcase, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

const EMPLOYER_NAV_ITEMS = [
  { label: "Jobs Posted", href: "/my-jobs/created", icon: Briefcase },
  { label: "Saved Jobs", href: "/my-jobs/saved", icon: Bookmark },
  { label: "My Applications", href: "/my-jobs/applications", icon: Send },
]

const MEMBER_NAV_ITEMS = [
  { label: "Saved Jobs", href: "/my-jobs/saved", icon: Bookmark },
  { label: "My Applications", href: "/my-jobs/applications", icon: Send },
]

export function MyJobsNav({ canPostJobs }: { canPostJobs: boolean }) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = canPostJobs ? EMPLOYER_NAV_ITEMS : MEMBER_NAV_ITEMS

  const activeItem = navItems.find(
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
          {navItems.map(({ label, href }) => (
            <NativeSelectOption key={href} value={href}>
              {label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <ul className="hidden flex-wrap items-center gap-2 lg:flex">
        {navItems.map(({ label, href, icon: Icon }) => {
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
