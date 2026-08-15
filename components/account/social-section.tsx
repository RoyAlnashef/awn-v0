"use client"

import { useTransition } from "react"
import { ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { useAccountProfile } from "@/components/account/account-profile-provider"
import { SOCIAL_FIELD_ICONS } from "@/components/icons/social-brand-icons"
import { updateMemberProfile } from "@/lib/account/profile-actions"
import {
  buildSocialHref,
  type SocialFieldId,
} from "@/lib/social-links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface SocialFieldConfig {
  id: SocialFieldId
  label: string
  placeholder: string
  prefix?: string
  icon: React.ComponentType<{ className?: string }>
}

const SOCIAL_FIELDS: SocialFieldConfig[] = [
  {
    id: "website",
    label: "Website",
    placeholder: "yoursite.com",
    icon: SOCIAL_FIELD_ICONS.website,
  },
  {
    id: "instagram",
    label: "Instagram",
    placeholder: "username",
    prefix: "instagram.com/",
    icon: SOCIAL_FIELD_ICONS.instagram,
  },
  {
    id: "twitter",
    label: "X / Twitter",
    placeholder: "username",
    prefix: "x.com/",
    icon: SOCIAL_FIELD_ICONS.twitter,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/in/…",
    icon: SOCIAL_FIELD_ICONS.linkedin,
  },
  {
    id: "youtube",
    label: "YouTube",
    placeholder: "youtube.com/@…",
    icon: SOCIAL_FIELD_ICONS.youtube,
  },
]

function SocialRow({
  field,
  value,
  onChange,
}: {
  field: SocialFieldConfig
  value: string
  onChange: (value: string) => void
}) {
  const Icon = field.icon
  const href = buildSocialHref(field.id, value)

  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[180px_1fr] sm:items-center sm:gap-4">
      <Label
        htmlFor={field.id}
        className="flex items-center gap-2 text-sm text-muted-foreground sm:justify-end"
      >
        <Icon className="size-4 shrink-0" />
        {field.label}
      </Label>
      <div className="flex items-center gap-2">
        <div className="relative flex flex-1 items-center">
          {field.prefix && (
            <span className="pointer-events-none absolute left-3 select-none text-sm text-muted-foreground">
              {field.prefix}
            </span>
          )}
          <Input
            id={field.id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={field.prefix ? "pl-[calc(var(--prefix-width,0px)+12px)]" : ""}
            style={
              field.prefix
                ? { paddingLeft: `${field.prefix.length * 7.5 + 12}px` }
                : undefined
            }
          />
        </div>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label={`Open ${field.label}`}
          >
            <ExternalLink className="size-4" />
          </a>
        ) : null}
      </div>
    </div>
  )
}

export function SocialSection() {
  const { draft, updateDraft, resetDraft, commitSaved } = useAccountProfile()
  const [isPending, startTransition] = useTransition()

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
      toast.success("Social links saved")
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-0.5">
        <h3 className="font-heading text-base font-semibold">Social Links</h3>
        <p className="text-sm text-muted-foreground">
          Connect your online presence to your profile.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {SOCIAL_FIELDS.map((field) => (
          <SocialRow
            key={field.id}
            field={field}
            value={draft[field.id] ?? ""}
            onChange={(value) => {
              updateDraft({ [field.id]: value })
            }}
          />
        ))}
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={isPending} onClick={resetDraft}>
          Cancel
        </Button>
        <Button disabled={isPending} onClick={handleSave}>
          Save changes
        </Button>
      </div>
    </div>
  )
}
