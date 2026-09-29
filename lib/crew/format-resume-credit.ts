import { engagementDisplayLabel } from "@/lib/jobs-data"
import type { TourCredit } from "@/lib/people-data"

export type ResumeCreditDisplay = {
  primary: string
  subtitle: string | null
  metadata: string[]
}

function creditStatus(credit: TourCredit): string | null {
  if (credit.engagementType) {
    return engagementDisplayLabel(credit.engagementType)
  }
  if (credit.isCurrent) return "Current"
  if (credit.endedAt) return "Completed"
  return null
}

export function formatResumeCredit(credit: TourCredit): ResumeCreditDisplay {
  const artist = credit.artist?.trim()
  const title = credit.title.trim()
  const primary = artist || title
  const subtitle =
    artist && title && artist.toLowerCase() !== title.toLowerCase()
      ? title
      : null

  const metadata: string[] = []
  if (credit.role) metadata.push(credit.role)

  const status = creditStatus(credit)
  if (status) metadata.push(status)

  const vouchCount = credit.vouchCount ?? 0
  if (vouchCount > 0) {
    metadata.push(`${vouchCount} ${vouchCount === 1 ? "vouch" : "vouches"}`)
  }

  return { primary, subtitle, metadata }
}
