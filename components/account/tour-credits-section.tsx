"use client"

import { useState, useTransition } from "react"
import { addDays } from "date-fns"
import { toast } from "sonner"
import { Pencil, Plus, ThumbsUp, X } from "lucide-react"

import {
  createTourCredit,
  deleteTourCredit,
  updateTourCredit,
} from "@/lib/account/tour-credits-actions"
import {
  ENGAGEMENT_TYPES,
  engagementTypeDescriptions,
  type AccountTourCredit,
  type EngagementType,
} from "@/lib/account-profile"
import { engagementDisplayLabel, roleGroups } from "@/lib/jobs-data"
import { useAccountProfile } from "@/components/account/account-profile-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DatePicker,
  parseDateOnly,
  toDateOnly,
} from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// ---------------------------------------------------------------------------
// Blank form state
// ---------------------------------------------------------------------------

interface CreditFormState {
  title: string
  role: string
  engagementType: EngagementType | ""
  startedAt: string
  endedAt: string
  isCurrent: boolean
  notes: string
}

const BLANK_FORM: CreditFormState = {
  title: "",
  role: "",
  engagementType: "",
  startedAt: "",
  endedAt: "",
  isCurrent: false,
  notes: "",
}

function creditToFormState(credit: AccountTourCredit): CreditFormState {
  return {
    title: credit.title,
    role: credit.role,
    engagementType: (credit.engagementType as EngagementType) ?? "",
    startedAt: credit.startedAt ?? "",
    endedAt: credit.endedAt ?? "",
    isCurrent: credit.isCurrent,
    notes: credit.notes,
  }
}

function validateDates(form: CreditFormState): boolean {
  if (!form.startedAt) {
    toast.error("Pick a start date")
    return false
  }
  if (!form.isCurrent && !form.endedAt) {
    toast.error("Pick an end date")
    return false
  }
  if (!form.isCurrent && form.endedAt && form.endedAt <= form.startedAt) {
    toast.error("End date must be after start date")
    return false
  }
  return true
}

// ---------------------------------------------------------------------------
// Form Dialog
// ---------------------------------------------------------------------------

interface CreditFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (form: CreditFormState) => void
  isPending: boolean
  initialValues?: CreditFormState
  mode: "add" | "edit"
}

function CreditFormDialog({
  open,
  onClose,
  onSubmit,
  isPending,
  initialValues = BLANK_FORM,
  mode,
}: CreditFormDialogProps) {
  const [form, setForm] = useState<CreditFormState>(initialValues)

  // Reset when dialog opens with new initial values
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setForm(initialValues)
  }

  function update(patch: Partial<CreditFormState>) {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const selectedType = form.engagementType as EngagementType | ""
  const startedDate = parseDateOnly(form.startedAt)
  const endedDate = parseDateOnly(form.endedAt)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-base uppercase tracking-wide text-muted-foreground">
            {mode === "add" ? "Add Entry" : "Edit Entry"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Artist / Act / Show */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="credit-title" className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Artist / Act / Show <span className="text-destructive">*</span>
            </Label>
            <Input
              id="credit-title"
              placeholder="e.g. Beyoncé, Coachella, MSG Residency"
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              autoFocus
            />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="credit-role" className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Your Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.role}
              onValueChange={(v) => update({ role: v ?? "" })}
            >
              <SelectTrigger id="credit-role" className="w-full">
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {roleGroups.map((group) => (
                  <SelectGroup key={group.department}>
                    <SelectLabel>{group.department}</SelectLabel>
                    {group.roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type of Engagement */}
          <div className="flex flex-col gap-2">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Type of Engagement <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {ENGAGEMENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => update({ engagementType: type })}
                  className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedType === type
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {engagementDisplayLabel(type)}
                </button>
              ))}
            </div>
            {selectedType && (
              <p className="text-xs text-muted-foreground">
                {engagementTypeDescriptions[selectedType]}
              </p>
            )}
          </div>

          {/* Started / Ended */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="credit-started" className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Started <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                value={startedDate}
                onChange={(date) => {
                  const patch: Partial<CreditFormState> = {
                    startedAt: date ? toDateOnly(date) : "",
                  }
                  if (
                    date &&
                    form.endedAt &&
                    form.endedAt <= toDateOnly(date)
                  ) {
                    patch.endedAt = ""
                  }
                  update(patch)
                }}
                placeholder="Pick a start date"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="credit-ended" className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Ended {!form.isCurrent ? <span className="text-destructive">*</span> : null}
              </Label>
              <DatePicker
                value={endedDate}
                onChange={(date) =>
                  update({ endedAt: date ? toDateOnly(date) : "" })
                }
                minDate={
                  startedDate ? addDays(startedDate, 1) : undefined
                }
                defaultMonth={startedDate}
                highlightDate={startedDate}
                placeholder="Pick an end date"
                disabled={form.isCurrent}
              />
            </div>
          </div>

          {/* Current / ongoing */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="credit-current"
              checked={form.isCurrent}
              onCheckedChange={(v) =>
                update({ isCurrent: Boolean(v), endedAt: v ? "" : form.endedAt })
              }
            />
            <Label htmlFor="credit-current" className="cursor-pointer text-sm font-normal">
              Current / ongoing engagement
            </Label>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="credit-notes" className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Notes (Optional)
            </Label>
            <Textarea
              id="credit-notes"
              placeholder="e.g. 62 dates, North America leg"
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!validateDates(form)) return
              onSubmit(form)
            }}
            disabled={
              isPending ||
              !form.title.trim() ||
              !form.role ||
              !form.engagementType ||
              !form.startedAt ||
              (!form.isCurrent && !form.endedAt)
            }
          >
            {mode === "add" ? "Add to timeline" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export function TourCreditsSection() {
  const { userId, tourCredits, setTourCredits } = useAccountProfile()
  const [isPending, startTransition] = useTransition()

  // Add dialog state
  const [addOpen, setAddOpen] = useState(false)

  // Edit dialog state
  const [editCredit, setEditCredit] = useState<AccountTourCredit | null>(null)

  function handleAdd(form: CreditFormState) {
    startTransition(async () => {
      const result = await createTourCredit(userId, {
        title: form.title,
        role: form.role,
        engagementType: form.engagementType || null,
        startedAt: form.startedAt || null,
        endedAt: form.isCurrent ? null : (form.endedAt || null),
        isCurrent: form.isCurrent,
        notes: form.notes || null,
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      setTourCredits(result.credits)
      setAddOpen(false)
      toast.success("Credit added.")
    })
  }

  function handleEdit(form: CreditFormState) {
    if (!editCredit) return
    startTransition(async () => {
      const result = await updateTourCredit(userId, editCredit.id, {
        title: form.title,
        role: form.role,
        engagementType: form.engagementType || null,
        startedAt: form.startedAt || null,
        endedAt: form.isCurrent ? null : (form.endedAt || null),
        isCurrent: form.isCurrent,
        notes: form.notes || null,
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      setTourCredits(result.credits)
      setEditCredit(null)
      toast.success("Credit updated.")
    })
  }

  function handleRemoveCredit(id: string) {
    startTransition(async () => {
      const result = await deleteTourCredit(userId, id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setTourCredits(result.credits)
    })
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-heading text-base font-semibold">Credits</h3>
            <p className="text-sm text-muted-foreground">
              Your work history and production credits.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={isPending}
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-3.5" />
            Add credit
          </Button>
        </div>

        {tourCredits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No credits yet. Add your first credit to show up on your profile card.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {tourCredits.map((credit) => (
              <li
                key={credit.id}
                className="relative overflow-hidden rounded-xl border border-border bg-card p-4 pl-5"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-1 bg-primary"
                />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-sm font-semibold">
                        {credit.title}
                      </span>
                      {credit.engagementType && (
                        <span className="text-[10px] font-semibold tracking-wide text-primary uppercase">
                          {engagementDisplayLabel(credit.engagementType)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{credit.role}</span>
                    {credit.notes && (
                      <span className="text-xs text-muted-foreground/70 italic">
                        {credit.notes}
                      </span>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                        <ThumbsUp className="size-3" />
                        {credit.vouches} {credit.vouches === 1 ? "vouch" : "vouches"}
                      </span>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="h-auto px-1.5 py-0.5 text-muted-foreground"
                        disabled={isPending}
                        onClick={() => setEditCredit(credit)}
                      >
                        <Pencil className="mr-1 size-3" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="h-auto px-1.5 py-0.5 text-muted-foreground"
                        disabled={isPending}
                        onClick={() => handleRemoveCredit(credit.id)}
                      >
                        <X className="mr-1 size-3" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {credit.years}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Dialog */}
      <CreditFormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        isPending={isPending}
        mode="add"
      />

      {/* Edit Dialog */}
      <CreditFormDialog
        open={!!editCredit}
        onClose={() => setEditCredit(null)}
        onSubmit={handleEdit}
        isPending={isPending}
        initialValues={editCredit ? creditToFormState(editCredit) : BLANK_FORM}
        mode="edit"
      />
    </>
  )
}
