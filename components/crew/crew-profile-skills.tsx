import { Badge } from "@/components/ui/badge"

import { CrewProfileSectionLabel } from "./crew-profile-section-label"

export function CrewProfileSkills({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <CrewProfileSectionLabel>Skills</CrewProfileSectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="font-normal">
            {skill}
          </Badge>
        ))}
      </div>
    </section>
  )
}
