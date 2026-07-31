"use client"

import { AtSign, Briefcase, Camera, ExternalLink, Globe, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface SocialField {
  id: string
  label: string
  placeholder: string
  prefix?: string
  icon: React.ComponentType<{ className?: string }>
  value: string
}

const SOCIAL_FIELDS: SocialField[] = [
  {
    id: "website",
    label: "Website",
    placeholder: "yoursite.com",
    icon: Globe,
    value: "reyestouring.com",
  },
  {
    id: "instagram",
    label: "Instagram",
    placeholder: "username",
    prefix: "instagram.com/",
    icon: Camera,
    value: "reyestouring",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    placeholder: "username",
    prefix: "x.com/",
    icon: AtSign,
    value: "jordanreyes_tm",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/in/…",
    icon: Briefcase,
    value: "linkedin.com/in/jordanreyes",
  },
  {
    id: "youtube",
    label: "YouTube",
    placeholder: "youtube.com/@…",
    icon: Video,
    value: "",
  },
]

function SocialRow({ field }: { field: SocialField }) {
  const Icon = field.icon

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
            defaultValue={field.value}
            placeholder={field.placeholder}
            className={field.prefix ? "pl-[calc(var(--prefix-width,0px)+12px)]" : ""}
            style={
              field.prefix
                ? { paddingLeft: `${field.prefix.length * 7.5 + 12}px` }
                : undefined
            }
          />
        </div>
        {field.value && (
          <a
            href={field.id === "website" ? `https://${field.value}` : "#"}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label={`Open ${field.label}`}
          >
            <ExternalLink className="size-4" />
          </a>
        )}
      </div>
    </div>
  )
}

export function SocialSection() {
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
          <SocialRow key={field.id} field={field} />
        ))}
      </div>

      <Separator />

      {/* Save */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save changes</Button>
      </div>
    </div>
  )
}
