import { ThumbsUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { engagementDisplayLabel } from "@/lib/jobs-data"
import type { TourCredit } from "@/lib/people-data"

import { CrewProfileSectionLabel } from "./crew-profile-section-label"

function creditStatus(credit: TourCredit): string | null {
  if (credit.engagementType) {
    return engagementDisplayLabel(credit.engagementType)
  }
  if (credit.isCurrent) return "Current"
  if (credit.endedAt) return "Completed"
  return null
}

export function CrewProfileCredits({ credits }: { credits: TourCredit[] }) {
  if (credits.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <CrewProfileSectionLabel>Credits</CrewProfileSectionLabel>
      <ul className="flex flex-col gap-2.5">
        {credits.map((credit, index) => {
          const status = creditStatus(credit)
          const vouchCount = credit.vouchCount ?? 0

          return (
            <li
              key={credit.id ?? `${credit.title}-${index}`}
              className="relative overflow-hidden rounded-xl border border-border bg-card p-4 pl-5"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1 bg-primary"
              />
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-heading text-sm font-semibold">
                    {credit.title}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                    {credit.role ? <span>{credit.role}</span> : null}
                    {credit.role && credit.years && credit.years !== "—" ? (
                      <span>·</span>
                    ) : null}
                    {credit.years && credit.years !== "—" ? (
                      <span>{credit.years}</span>
                    ) : null}
                  </div>
                </div>
                {status ? (
                  <Badge variant="secondary" className="shrink-0 font-normal">
                    {status}
                  </Badge>
                ) : null}
              </div>
              {vouchCount > 0 ? (
                <div className="mt-3 flex justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <ThumbsUp className="size-3" />
                    {vouchCount} {vouchCount === 1 ? "vouch" : "vouches"}
                  </span>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
