import { BadgeCheck, Sparkles } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const MOCK_MEMBER = {
  name: "Jordan Reyes",
  role: "Tour Manager",
  company: "Reyes Live Co.",
  homeBase: "Nashville, TN",
  avatar: "/images/avatar-jordan.png",
  verified: true,
  founding: true,
  memberSince: "Jan 2021",
  credits: 38,
  vouches: 27,
  following: 12,
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
}

export function AccountHeader() {
  const m = MOCK_MEMBER

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Banner */}
      <div className="h-28 bg-muted" />

      {/* Avatar + identity */}
      <div className="px-6 pb-5">
        <div className="-mt-12 flex items-end justify-between">
          <Avatar className="size-24 ring-4 ring-card">
            <AvatarImage src={m.avatar} alt="" />
            <AvatarFallback className="text-2xl">{initials(m.name)}</AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              {m.name}
            </h2>
            {m.verified && (
              <BadgeCheck className="size-5 text-primary" aria-label="Verified" />
            )}
            {m.founding && (
              <Badge className="gap-1 border-primary/30 bg-primary/15 text-primary">
                <Sparkles className="size-3" />
                Founding Member
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="text-foreground/90">{m.role}</span>
            {m.company && (
              <Badge variant="secondary" className="font-normal">
                {m.company}
              </Badge>
            )}
            <span>· {m.homeBase}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Stats */}
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-base font-semibold tabular-nums">
              {m.credits}
            </span>
            <span className="text-xs text-muted-foreground">Credits</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-base font-semibold tabular-nums">
              {m.vouches}
            </span>
            <span className="text-xs text-muted-foreground">Vouches</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-base font-semibold tabular-nums">
              {m.following}
            </span>
            <span className="text-xs text-muted-foreground">Following</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-base font-semibold">
              {m.memberSince}
            </span>
            <span className="text-xs text-muted-foreground">Member Since</span>
          </div>
        </div>
      </div>
    </div>
  )
}
