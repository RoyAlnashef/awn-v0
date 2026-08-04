"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

export function SkillAddPopover({
  existingSkills,
  onAdd,
  disabled = false,
}: {
  existingSkills: string[]
  onAdd: (skill: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setValue("")
    setError(null)
  }, [open])

  function submit() {
    const skill = value.trim()
    if (!skill) {
      setError("Enter a skill name.")
      return
    }
    if (existingSkills.includes(skill)) {
      setError("That skill is already on your profile.")
      return
    }

    onAdd(skill)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <Plus className="size-2.5" />
            Add skill
          </button>
        }
      />
      <PopoverContent align="start" side="bottom" sideOffset={6} className="w-72">
        <PopoverHeader>
          <PopoverTitle>Add skill</PopoverTitle>
          <PopoverDescription>
            Add a competency that appears on your public profile.
          </PopoverDescription>
        </PopoverHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="skill-name" className="sr-only">
              Skill name
            </Label>
            <Input
              id="skill-name"
              value={value}
              autoFocus
              placeholder="e.g. Tour budgeting"
              onChange={(e) => {
                setValue(e.target.value)
                if (error) setError(null)
              }}
              aria-invalid={!!error}
            />
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
