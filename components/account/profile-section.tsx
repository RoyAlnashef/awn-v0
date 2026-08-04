"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { updateMemberProfile } from "@/lib/account/profile-actions"
import {
  availabilityStatuses,
  venueTiers,
  workAuthOptions,
  type Availability,
  type VenueTier,
  type WorkAuth,
} from "@/lib/people-data"
import { useAccountProfile } from "@/components/account/account-profile-provider"
import { AvatarUploadEditor } from "@/components/account/avatar-upload-editor"
import { BannerUploadEditor } from "@/components/account/banner-upload-editor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DatePicker,
  parseDateOnly,
  toDateOnly,
} from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

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

function toggleItem<T extends string>(items: T[], item: T): T[] {
  return items.includes(item) ? items.filter((i) => i !== item) : [...items, item]
}

export function ProfileSection() {
  const { userId, draft, updateDraft, resetDraft, commitSaved, commitSavedPatch } =
    useAccountProfile()
  const [isPending, startTransition] = useTransition()

  function handleHomeBaseChange(value: string) {
    updateDraft({
      homeBase: value,
      city: value.split(",")[0]?.trim() ?? "",
    })
  }

  function handlePhotoPersisted(patch: {
    avatar?: string
    banner?: string
    bannerPositionY?: number
  }) {
    commitSavedPatch(patch)
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateMemberProfile(draft)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      if (result.person) {
        commitSaved(result.person)
      }
      toast.success("Profile saved")
    })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Photos */}
      <section className="flex flex-col gap-3">
        <SectionHeading
          title="Photos"
          description="Your profile photo and banner visible on your public profile card."
        />
        <div>
          <BannerUploadEditor
            userId={userId}
            banner={draft.banner}
            bannerPositionY={draft.bannerPositionY}
            disabled={isPending}
            onChange={(url, positionY) =>
              updateDraft({ banner: url, bannerPositionY: positionY })
            }
            onPersisted={(banner, bannerPositionY) =>
              handlePhotoPersisted({
                banner,
                bannerPositionY: bannerPositionY ?? draft.bannerPositionY,
              })
            }
          >
            <AvatarUploadEditor
              userId={userId}
              avatar={draft.avatar}
              name={draft.name}
              disabled={isPending}
              onChange={(url) => updateDraft({ avatar: url })}
              onPersisted={(avatar) => handlePhotoPersisted({ avatar })}
            />
          </BannerUploadEditor>
        </div>
      </section>

      <Separator />

      {/* Basic Info */}
      <section className="flex flex-col gap-4">
        <SectionHeading
          title="Basic Info"
          description="Your public-facing identity on A Wright Network."
        />
        <div className="flex flex-col gap-4">
          <FieldRow label="Full name">
            <Input
              value={draft.name}
              onChange={(e) => updateDraft({ name: e.target.value })}
              placeholder="Your full name"
            />
          </FieldRow>
          <FieldRow label="Title / Role">
            <Input
              value={draft.role}
              onChange={(e) => updateDraft({ role: e.target.value })}
              placeholder="e.g. Tour Manager"
            />
          </FieldRow>
          <FieldRow label="Company">
            <Input
              value={draft.company ?? ""}
              onChange={(e) => updateDraft({ company: e.target.value })}
              placeholder="Your company or org"
            />
          </FieldRow>
          <FieldRow label="Home base">
            <Input
              value={draft.homeBase}
              onChange={(e) => handleHomeBaseChange(e.target.value)}
              placeholder="City, State"
            />
          </FieldRow>
          <FieldRow label="Years of experience">
            <Input
              type="number"
              value={draft.yearsExperience}
              onChange={(e) =>
                updateDraft({ yearsExperience: Number(e.target.value) || 0 })
              }
              className="max-w-28"
            />
          </FieldRow>
          <FieldRow label="Bio">
            <Textarea
              value={draft.bio ?? ""}
              onChange={(e) => updateDraft({ bio: e.target.value })}
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
              {availabilityStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateDraft({ availability: status as Availability })}
                  className={
                    draft.availability === status
                      ? "inline-flex items-center rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-medium text-primary"
                      : "inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }
                >
                  {status}
                </button>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="Available from">
            <DatePicker
              value={parseDateOnly(draft.availableFrom)}
              onChange={(date) =>
                updateDraft({ availableFrom: date ? toDateOnly(date) : "" })
              }
              maxDate={parseDateOnly(draft.availableTo)}
              placeholder="Pick a date"
              className="max-w-52"
            />
          </FieldRow>
          <FieldRow label="Available to">
            <DatePicker
              value={parseDateOnly(draft.availableTo)}
              onChange={(date) =>
                updateDraft({ availableTo: date ? toDateOnly(date) : "" })
              }
              minDate={parseDateOnly(draft.availableFrom)}
              placeholder="Pick a date"
              className="max-w-52"
            />
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
              {venueTiers.map((tier) => {
                const active = draft.venueTiers.includes(tier)
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() =>
                      updateDraft({
                        venueTiers: toggleItem(draft.venueTiers, tier as VenueTier),
                      })
                    }
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
              {workAuthOptions.map((auth) => {
                const active = draft.workAuth.includes(auth)
                return (
                  <button
                    key={auth}
                    type="button"
                    onClick={() =>
                      updateDraft({
                        workAuth: toggleItem(draft.workAuth, auth as WorkAuth),
                      })
                    }
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
            {draft.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1 font-normal">
                {skill}
                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  className="ml-0.5 rounded-sm opacity-60 hover:opacity-100"
                  onClick={() =>
                    updateDraft({
                      skills: draft.skills.filter((s) => s !== skill),
                    })
                  }
                >
                  ×
                </button>
              </Badge>
            ))}
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              onClick={() => {
                const skill = window.prompt("Add a skill")
                if (skill?.trim() && !draft.skills.includes(skill.trim())) {
                  updateDraft({ skills: [...draft.skills, skill.trim()] })
                }
              }}
            >
              + Add skill
            </button>
          </div>
        </FieldRow>
      </section>

      {/* Save */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={resetDraft}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  )
}
