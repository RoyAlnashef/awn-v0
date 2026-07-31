"use client"

import { Plus, ThumbsUp } from "lucide-react"

import { useAccountProfile } from "@/components/account/account-profile-provider"
import { Button } from "@/components/ui/button"

export function TourCreditsSection() {
  const { draft, tourCredits, setTourCredits } = useAccountProfile()

  function handleAddCredit() {
    const id = crypto.randomUUID()
    setTourCredits((prev) => [
      ...prev,
      {
        id,
        title: "New Tour Credit",
        artist: "",
        role: draft.role || "Tour Manager",
        venueTier: draft.venueTiers[0] ?? "Arena",
        years: "2024–26",
        vouches: 0,
      },
    ])
  }

  function handleRemoveCredit(id: string) {
    setTourCredits((prev) => prev.filter((credit) => credit.id !== id))
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
          onClick={handleAddCredit}
        >
          <Plus className="size-3.5" />
          Add credit
        </Button>
      </div>

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
    </div>
  )
}
