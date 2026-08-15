"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Plus, ThumbsUp } from "lucide-react"

import {
  createTourCredit,
  deleteTourCredit,
} from "@/lib/account/tour-credits-actions"
import { useAccountProfile } from "@/components/account/account-profile-provider"
import { Button } from "@/components/ui/button"

export function TourCreditsSection() {
  const { userId, draft, tourCredits, setTourCredits } = useAccountProfile()
  const [isPending, startTransition] = useTransition()

  function handleAddCredit() {
    startTransition(async () => {
      const result = await createTourCredit(userId, {
        title: "New Tour Credit",
        artist: "",
        role: draft.role || "Tour Manager",
        venueTier: draft.venueTiers[0] ?? "Arena",
        years: "2024–26",
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      setTourCredits(result.credits)
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-heading text-base font-semibold">Tour Credits</h3>
          <p className="text-sm text-muted-foreground">
            Your touring history and production credits.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={isPending}
          onClick={handleAddCredit}
        >
          <Plus className="size-3.5" />
          Add credit
        </Button>
      </div>

      {tourCredits.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tour credits yet. Add your first credit to show up on your profile card.
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
                    <span className="text-[10px] font-semibold tracking-wide text-primary uppercase">
                      {credit.venueTier}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{credit.role}</span>
                  <div className="mt-1 flex items-center gap-2">
                    <Button variant="outline" size="xs" className="gap-1">
                      <ThumbsUp className="size-3" />
                      {credit.vouches} vouches
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-muted-foreground"
                      disabled={isPending}
                      onClick={() => handleRemoveCredit(credit.id)}
                    >
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
  )
}
