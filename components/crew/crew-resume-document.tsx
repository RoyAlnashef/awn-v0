import type { CrewResumeData } from "@/lib/crew/build-resume-data"
import { availabilityConfig, initials } from "@/lib/people-data"

import "./crew-print.css"

export function CrewResumeDocument({ data }: { data: CrewResumeData }) {
  const { person, tourCredits, bio, competencies, socialLinks, workAuth } = data
  const availability = availabilityConfig[person.availability]
  const location = person.homeBase || person.city
  const subtitle = [person.role, location].filter(Boolean).join(" · ")

  return (
    <div className="crew-print-only crew-resume-sheet">
      <div className="mx-auto max-w-204 px-8 py-8">
        <header className="mb-6 flex items-start justify-between gap-6 border-b border-neutral-200 pb-5">
          <div className="flex items-start gap-4">
            {person.avatar ? (
              <img
                src={person.avatar}
                alt=""
                className="size-16 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg font-semibold text-neutral-600">
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
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {availability.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <img
              src="/awn-logo-mark.svg"
              alt="AWN"
              className="ml-auto size-8 opacity-90"
            />
            <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-neutral-500 uppercase">
              A Wright Network
            </p>
          </div>
        </header>

        <div className="grid grid-cols-[1fr_2fr] gap-8">
          <aside className="space-y-5">
            {(person.skills.length > 0 || person.department) && (
              <section>
                <h2 className="crew-resume-section-title mb-2">Skills</h2>
                <ul className="space-y-1 text-sm text-neutral-700">
                  {person.department ? <li>{person.department}</li> : null}
                  {person.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </section>
            )}

            {socialLinks.length > 0 && (
              <section>
                <h2 className="crew-resume-section-title mb-2">Links</h2>
                <ul className="space-y-1 text-sm">
                  {socialLinks.map((link) => (
                    <li key={link.id}>
                      <span className="text-neutral-800">{link.label}: </span>
                      <span className="text-neutral-600">{link.display}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {workAuth.length > 0 && (
              <section>
                <h2 className="crew-resume-section-title mb-2">
                  Touring Passport
                </h2>
                <ul className="space-y-1 text-sm text-neutral-700">
                  {workAuth.map((auth) => (
                    <li key={auth}>{auth}</li>
                  ))}
                </ul>
              </section>
            )}

            {(person.yearsExperience > 0 || person.venueTiers.length > 0) && (
              <section>
                <h2 className="crew-resume-section-title mb-2">Experience</h2>
                <ul className="space-y-1 text-sm text-neutral-700">
                  {person.yearsExperience > 0 ? (
                    <li>{person.yearsExperience}+ years touring</li>
                  ) : null}
                  {person.venueTiers.map((tier) => (
                    <li key={tier}>{tier}</li>
                  ))}
                </ul>
              </section>
            )}
          </aside>

          <main className="space-y-5">
            {bio ? (
              <section>
                <h2 className="crew-resume-section-title mb-2">
                  Professional Summary
                </h2>
                <p className="text-sm leading-relaxed text-neutral-800 whitespace-pre-line">
                  {bio}
                </p>
              </section>
            ) : null}

            {competencies.length > 0 && (
              <section>
                <h2 className="crew-resume-section-title mb-2">
                  Core Competencies
                </h2>
                <ul className="list-disc space-y-1 pl-4 text-sm text-neutral-800">
                  {competencies.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {tourCredits.length > 0 && (
              <section>
                <h2 className="crew-resume-section-title mb-3">Tour Credits</h2>
                <ul className="space-y-2">
                  {tourCredits.map((credit, index) => (
                    <li
                      key={credit.id ?? `${credit.title}-${index}`}
                      className="flex items-baseline justify-between gap-4 border-b border-neutral-100 pb-2 text-sm last:border-0"
                    >
                      <div>
                        <span className="crew-resume-name font-semibold text-neutral-900">
                          {credit.title}
                        </span>
                        {credit.role ? (
                          <span className="ml-2 text-neutral-600">
                            {credit.role}
                          </span>
                        ) : null}
                      </div>
                      {credit.years && credit.years !== "—" ? (
                        <span
                          className={
                            index === 0
                              ? "crew-resume-accent shrink-0 font-medium"
                              : "shrink-0 text-neutral-500"
                          }
                        >
                          {credit.years}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </main>
        </div>

        <footer className="mt-8 flex items-end justify-between border-t border-neutral-200 pt-4 text-[10px] text-neutral-500">
          <span>{data.profileUrl}</span>
          <span>A Wright Network — By Invitation Only</span>
        </footer>
      </div>
    </div>
  )
}
