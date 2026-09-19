import type { CrewResumeData } from "@/lib/crew/build-resume-data"
import { formatResumeCredit } from "@/lib/crew/format-resume-credit"
import { availabilityConfig, initials } from "@/lib/people-data"

import { CrewResumeQr } from "./crew-resume-qr"
import "./crew-print.css"

function ResumeSkills({ data }: { data: CrewResumeData }) {
  const skills =
    data.person.skills.length > 0
      ? data.person.skills
      : data.person.department
        ? [data.person.department]
        : []

  if (skills.length === 0) return null

  return (
    <section>
      <h2 className="crew-resume-section-title mb-3">Skills</h2>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span key={skill} className="crew-resume-skill-pill">
            {skill}
          </span>
        ))}
      </div>
    </section>
  )
}

export function CrewResumeDocument({ data }: { data: CrewResumeData }) {
  const { person, tourCredits, bio } = data
  const availability = availabilityConfig[person.availability]
  const location = person.homeBase || person.city
  const subtitle = [person.role, location].filter(Boolean).join(" • ")

  return (
    <div className="crew-print-only crew-resume-sheet">
      <div className="mx-auto max-w-204">
        <header className="crew-resume-header px-8 pt-5">
          <div className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-5">
            <div className="flex items-start gap-4">
              {person.avatar ? (
                <img
                  src={person.avatar}
                  alt=""
                  className="size-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-white text-lg font-semibold text-neutral-600">
                  {initials(person.name)}
                </div>
              )}
              <div>
                <h1 className="crew-resume-name text-2xl font-semibold tracking-tight">
                  {person.name}
                </h1>
                {subtitle ? (
                  <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
                ) : null}
                <p className="mt-2 inline-flex items-center gap-1.5">
                  <span className="crew-resume-availability-dot" />
                  <span className="crew-resume-availability-label">
                    {availability.label}
                  </span>
                </p>
              </div>
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
          {bio ? (
            <p className="mb-6 text-sm leading-relaxed text-neutral-800 whitespace-pre-line">
              {bio}
            </p>
          ) : null}

          <div className="grid grid-cols-[1.6fr_1fr] gap-8">
            <section>
              {tourCredits.length > 0 ? (
                <>
                  <h2 className="crew-resume-section-title mb-3">
                    Tour Credits
                  </h2>
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
                </>
              ) : null}
            </section>

            <aside className="space-y-5">
              {data.detailsRows.length > 0 ? (
                <section>
                  <h2 className="crew-resume-section-title mb-3">Details</h2>
                  <dl className="space-y-2.5">
                    {data.detailsRows.map((row) => (
                      <div key={row.label} className="crew-resume-details-row">
                        <dt className="crew-resume-details-label">
                          {row.label}
                        </dt>
                        <dd className="crew-resume-details-value">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}

              <ResumeSkills data={data} />

              <div className="flex items-center gap-3 pt-1">
                <div className="shrink-0">
                  <CrewResumeQr url={data.profileUrl} />
                </div>
                <p className="text-[10px] leading-snug text-neutral-500">
                  Scan for live profile
                </p>
              </div>
            </aside>
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
