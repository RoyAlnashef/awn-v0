"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

const MOCK = {
  fullName: "Jordan Reyes",
  title: "Tour Manager",
  company: "Reyes Touring Co.",
  homeBase: "Nashville, TN",
  city: "Nashville",
  bio: "Seasoned Tour Manager with 14+ years advancing global arena and stadium runs. Founder of Reyes Touring Co., handling routing, settlements, and visa logistics for touring artists and their crews.",
  availability: "Available Now",
  availableFrom: "2026-08-01",
  availableTo: "2026-12-20",
  yearsExperience: 14,
  venueTiers: ["Stadium", "Arena"] as string[],
  workAuth: ["USA", "Passport"] as string[],
  skills: ["Advancing", "Settlement", "Visa Logistics"],
}

const ALL_VENUE_TIERS = ["Stadium", "Arena", "Festival", "Theater", "Club"]
const ALL_WORK_AUTH = ["Passport", "USA", "Canada", "UK", "EU", "Australia", "Worldwide"]

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-0.5 pb-2">
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[180px_1fr] sm:items-start sm:gap-4">
      <Label className="pt-2 text-sm text-muted-foreground sm:text-right">
        {label}
      </Label>
      <div>{children}</div>
    </div>
  )
}

export function ProfileSection() {
  return (
    <div className="flex flex-col gap-8">
      {/* Basic Info */}
      <section className="flex flex-col gap-4">
        <SectionHeading
          title="Basic Info"
          description="Your public-facing identity on A Wright Network."
        />
        <div className="flex flex-col gap-4">
          <FieldRow label="Full name">
            <Input defaultValue={MOCK.fullName} placeholder="Your full name" />
          </FieldRow>
          <FieldRow label="Title / Role">
            <Input defaultValue={MOCK.title} placeholder="e.g. Tour Manager" />
          </FieldRow>
          <FieldRow label="Company">
            <Input defaultValue={MOCK.company} placeholder="Your company or org" />
          </FieldRow>
          <FieldRow label="Home base">
            <Input defaultValue={MOCK.homeBase} placeholder="City, State" />
          </FieldRow>
          <FieldRow label="Years of experience">
            <Input
              type="number"
              defaultValue={MOCK.yearsExperience}
              className="max-w-28"
            />
          </FieldRow>
          <FieldRow label="Bio">
            <Textarea
              defaultValue={MOCK.bio}
              rows={4}
              placeholder="Tell the network about yourself…"
              className="resize-none"
            />
          </FieldRow>
        </div>
      </section>

      <Separator />

      {/* Availability */}
      <section className="flex flex-col gap-4">
        <SectionHeading
          title="Availability"
          description="Let the network know when and where you're available."
        />
        <div className="flex flex-col gap-4">
          <FieldRow label="Status">
            <div className="flex flex-wrap gap-1.5">
              {(["Available Now", "Between Tours", "On Tour"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={
                    MOCK.availability === s
                      ? "inline-flex items-center rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-medium text-primary"
                      : "inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="Available from">
            <Input type="date" defaultValue={MOCK.availableFrom} className="max-w-44" />
          </FieldRow>
          <FieldRow label="Available to">
            <Input type="date" defaultValue={MOCK.availableTo} className="max-w-44" />
          </FieldRow>
        </div>
      </section>

      <Separator />

      {/* Venue Tiers */}
      <section className="flex flex-col gap-4">
        <SectionHeading
          title="Venue Tiers &amp; Work Auth"
          description="Markets you operate in and regions you can work."
        />
        <div className="flex flex-col gap-4">
          <FieldRow label="Venue tiers">
            <div className="flex flex-wrap gap-1.5">
              {ALL_VENUE_TIERS.map((tier) => {
                const active = MOCK.venueTiers.includes(tier)
                return (
                  <button
                    key={tier}
                    type="button"
                    className={
                      active
                        ? "inline-flex items-center rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-medium text-primary"
                        : "inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }
                  >
                    {tier}
                  </button>
                )
              })}
            </div>
          </FieldRow>
          <FieldRow label="Work auth">
            <div className="flex flex-wrap gap-1.5">
              {ALL_WORK_AUTH.map((auth) => {
                const active = MOCK.workAuth.includes(auth)
                return (
                  <button
                    key={auth}
                    type="button"
                    className={
                      active
                        ? "inline-flex items-center rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-medium text-primary"
                        : "inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }
                  >
                    {auth}
                  </button>
                )
              })}
            </div>
          </FieldRow>
        </div>
      </section>

      <Separator />

      {/* Skills */}
      <section className="flex flex-col gap-4">
        <SectionHeading
          title="Skills"
          description="Specific competencies that appear on your public profile."
        />
        <FieldRow label="Skills">
          <div className="flex flex-wrap gap-1.5">
            {MOCK.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1 font-normal">
                {skill}
                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  className="ml-0.5 rounded-sm opacity-60 hover:opacity-100"
                >
                  ×
                </button>
              </Badge>
            ))}
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            >
              + Add skill
            </button>
          </div>
        </FieldRow>
      </section>

      {/* Save */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save changes</Button>
      </div>
    </div>
  )
}
