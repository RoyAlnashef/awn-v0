import type { CrewResumeData } from "@/lib/crew/build-resume-data"
import { formatResumeCredit } from "@/lib/crew/format-resume-credit"
import { getPersonSocialLinks } from "@/lib/social-links"

import "./crew-print.css"

function ResumeSkills({ data }: { data: CrewResumeData }) {
  const skills = data.person.skills

  if (skills.length === 0) return null

  return (
    <section>
      <h2 className="crew-resume-section-title mb-3">Skills</h2>
      <ul className="crew-resume-sidebar-list">
        {skills.map((skill) => (
          <li key={skill} className="crew-resume-sidebar-list-item">
            {skill}
          </li>
        ))}
      </ul>
    </section>
  )
}

function ResumeLinks({ data }: { data: CrewResumeData }) {
  const socialLinks = getPersonSocialLinks(data.person)
  if (socialLinks.length === 0) return null

  return (
    <section>
      <h2 className="crew-resume-section-title mb-3">Links</h2>
      <ul className="crew-resume-sidebar-list">
        {socialLinks.map((link) => (
          <li key={link.id} className="crew-resume-sidebar-list-item">
            <span className="crew-resume-link-display">{link.display}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ResumeProfileLink({ data }: { data: CrewResumeData }) {
  return (
    <section>
      <h2 className="crew-resume-section-title mb-3">Profile</h2>
      <p className="crew-resume-link-display text-sm">{data.displayProfileUrl}</p>
    </section>
  )
}

export function CrewResumeDocument({ data }: { data: CrewResumeData }) {
  const { person, tourCredits, bio } = data
  const location = person.homeBase || person.city
  const subtitle = [person.role, location].filter(Boolean).join(" • ")

  return (
    <div className="crew-print-only crew-resume-sheet">
      <div className="mx-auto max-w-204">
        <header className="crew-resume-header px-8 pt-5">
          <div className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-5">
            <div>
              <h1 className="crew-resume-name text-2xl font-semibold tracking-tight">
                {person.name}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex flex-col items-end">
              <img
                src="/apple-touch-icon.png"
                alt="AWN"
                className="size-8 rounded-[22%]"
              />
              <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-neutral-500 uppercase">
                A Wright Network
              </p>
            </div>
          </div>
        </header>

        <div className="px-8 py-6">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-8">
            <aside className="space-y-5">
              <ResumeSkills data={data} />
              <ResumeLinks data={data} />
              <ResumeProfileLink data={data} />
            </aside>

            <main className="space-y-6">
              {bio ? (
                <p className="crew-resume-bio text-sm leading-relaxed text-neutral-800 whitespace-pre-line">
                  {bio}
                </p>
              ) : null}

              {tourCredits.length > 0 ? (
                <section>
                  <h2 className="crew-resume-section-title mb-3">Credits</h2>
                  <ul>
                    {tourCredits.map((credit, index) => {
                      const display = formatResumeCredit(credit)

                      return (
                        <li
                          key={credit.id ?? `${credit.title}-${index}`}
                          className="border-b border-neutral-200 py-3 first:pt-0 last:border-0"
                        >
                          <div className="flex items-baseline justify-between gap-4">
                            <span className="crew-resume-name text-sm font-semibold text-neutral-900">
                              {display.primary}
                            </span>
                            {credit.years && credit.years !== "—" ? (
                              <span className="shrink-0 text-sm text-neutral-700">
                                {credit.years}
                              </span>
                            ) : null}
                          </div>
                          {display.subtitle ? (
                            <p className="mt-0.5 text-sm text-neutral-700">
                              {display.subtitle}
                            </p>
                          ) : null}
                          {display.metadata.length > 0 ? (
                            <p className="mt-1 text-xs text-neutral-500">
                              {display.metadata.join(" • ")}
                            </p>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ) : null}
            </main>
          </div>

          <footer className="mt-8 flex items-end justify-between border-t border-neutral-200 pt-4 text-[10px] text-neutral-500">
            <span>{data.displayProfileUrl}</span>
            <span className="font-semibold tracking-[0.08em]">
              AWN • People. Community. Opportunity.
            </span>
          </footer>
        </div>
      </div>
    </div>
  )
}
