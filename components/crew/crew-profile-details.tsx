import { Button } from "@/components/ui/button"
import {
  buildProfileDetailsRows,
  type ProfileDetailsRow,
} from "@/lib/crew/profile-details-rows"
import { getPersonSocialLinks } from "@/lib/social-links"
import type { Person } from "@/lib/people-data"
import { cn } from "@/lib/utils"

import { CrewProfileSectionLabel } from "./crew-profile-section-label"

function DetailsList({ rows }: { rows: ProfileDetailsRow[] }) {
  if (rows.length === 0) return null

  return (
    <dl className="flex flex-col">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={cn(
            "flex flex-col gap-0.5 py-3",
            index > 0 && "border-t border-border",
          )}
        >
          <dt className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            {row.label}
          </dt>
          <dd className="text-sm text-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function SocialLinks({ person }: { person: Person }) {
  const socialLinks = getPersonSocialLinks(person)
  if (socialLinks.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <CrewProfileSectionLabel>Social</CrewProfileSectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {socialLinks.map((link) => {
          const LinkIcon = link.icon
          return (
            <Button
              key={link.id}
              variant="outline"
              size="icon-sm"
              aria-label={`${link.label}: ${link.display}`}
              nativeButton={false}
              render={
                <a href={link.href} target="_blank" rel="noreferrer" />
              }
            >
              <LinkIcon />
            </Button>
          )
        })}
      </div>
    </section>
  )
}

export function CrewProfileDetailsSidebar({ person }: { person: Person }) {
  const rows = buildProfileDetailsRows(person)

  return (
    <aside className="flex flex-col gap-8">
      <SocialLinks person={person} />
      {rows.length > 0 ? (
        <section className="flex flex-col gap-3">
          <CrewProfileSectionLabel>Details</CrewProfileSectionLabel>
          <DetailsList rows={rows} />
        </section>
      ) : null}
    </aside>
  )
}

export function CrewProfileDetailsMobile({ person }: { person: Person }) {
  const rows = buildProfileDetailsRows(person)
  if (rows.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <CrewProfileSectionLabel>Details</CrewProfileSectionLabel>
      <DetailsList rows={rows} />
    </section>
  )
}

export function CrewProfileSocialMobile({ person }: { person: Person }) {
  return <SocialLinks person={person} />
}
