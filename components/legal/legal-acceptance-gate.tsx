"use client"

import * as React from "react"
import { Check, ChevronRight } from "lucide-react"
import { toast } from "sonner"

import type { LegalDocument } from "@/components/legal/content"
import { LegalDocumentView } from "@/components/legal/legal-document"
import { acceptLegalDocuments } from "@/lib/legal/actions"
import type { LegalDocumentKey } from "@/lib/legal/documents"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type OutstandingLegalDocument = {
  key: LegalDocumentKey
  title: string
  document: LegalDocument
}

type LegalAcceptanceGateProps = {
  outstanding: OutstandingLegalDocument[]
}

const LEGAL_TAB_SHORT_LABELS: Record<LegalDocumentKey, string> = {
  "community-guidelines": "Community",
  terms: "Terms",
  privacy: "Privacy",
  "job-posting-policy": "Jobs",
}

function getLegalTabShortLabel(key: LegalDocumentKey) {
  return LEGAL_TAB_SHORT_LABELS[key]
}

export function LegalAcceptanceGate({ outstanding }: LegalAcceptanceGateProps) {
  const [open, setOpen] = React.useState(true)
  const [activeIndex, setActiveIndex] = React.useState(0)
  /** Furthest section unlocked via Continue; tab navigation may go back without lowering this. */
  const [maxUnlockedIndex, setMaxUnlockedIndex] = React.useState(0)
  const [reachedEnd, setReachedEnd] = React.useState<
    Record<string, boolean>
  >({})
  const [isSubmitting, startSubmit] = React.useTransition()

  const activeEntry = outstanding[activeIndex]
  const activeKey = activeEntry?.key
  const isLastStep = activeIndex === outstanding.length - 1
  const canContinue = Boolean(activeKey && reachedEnd[activeKey])
  const sectionsReviewed = maxUnlockedIndex

  const markReachedEnd = React.useCallback((key: LegalDocumentKey) => {
    setReachedEnd((curr) => (curr[key] ? curr : { ...curr, [key]: true }))
  }, [])

  function handleContinue() {
    if (!canContinue || isSubmitting || !activeKey) return

    if (!isLastStep) {
      const nextIndex = activeIndex + 1
      setActiveIndex(nextIndex)
      setMaxUnlockedIndex((max) => Math.max(max, nextIndex))
      return
    }

    startSubmit(async () => {
      const result = await acceptLegalDocuments(
        outstanding.map((entry) => entry.key),
      )
      if (result.ok) {
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleTabChange(value: string) {
    const nextIndex = outstanding.findIndex((entry) => entry.key === value)
    if (nextIndex === -1 || nextIndex > maxUnlockedIndex) return
    setActiveIndex(nextIndex)
  }

  if (outstanding.length === 0 || !activeEntry) return null

  return (
    <Dialog open={open} onOpenChange={() => {}} disablePointerDismissal>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] max-w-[calc(100%-1rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden px-4 py-5 sm:max-w-2xl sm:gap-4 sm:px-6 sm:py-6"
      >
        <DialogHeader>
          <DialogTitle>Conduct + Legal...</DialogTitle>
          <DialogDescription>
            Scroll to the bottom of each set of terms and guidelines, then
            continue to the next section.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeKey}
          onValueChange={handleTabChange}
          className="flex min-h-0 flex-col gap-3 overflow-hidden"
        >
          <TabsList
            variant="line"
            className="flex h-auto min-h-9 w-full shrink-0 flex-nowrap justify-start gap-1 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
          >
            {outstanding.map((entry, index) => (
              <TabsTrigger
                key={entry.key}
                value={entry.key}
                disabled={index > maxUnlockedIndex}
                className="flex-none shrink-0 px-2 text-xs sm:px-2.5 sm:text-sm"
              >
                {index < maxUnlockedIndex ? (
                  <Check className="text-primary" aria-hidden />
                ) : null}
                {getLegalTabShortLabel(entry.key)}
              </TabsTrigger>
            ))}
          </TabsList>

          {outstanding.map((entry, index) => (
            <TabsContent
              key={entry.key}
              value={entry.key}
              className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-hidden:hidden"
            >
              <LegalDocumentPanel
                entry={entry}
                isActive={activeIndex === index}
                reachedEnd={Boolean(reachedEnd[entry.key])}
                onReachedEnd={markReachedEnd}
              />
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter className="items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {sectionsReviewed} of {outstanding.length} sections reviewed
          </p>
          <Button
            type="button"
            disabled={!canContinue || isSubmitting}
            onClick={handleContinue}
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                {isLastStep ? "I accept" : "Continue"}
                {isLastStep && canContinue ? (
                  <Check aria-hidden />
                ) : (
                  <ChevronRight aria-hidden />
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type LegalDocumentPanelProps = {
  entry: OutstandingLegalDocument
  isActive: boolean
  reachedEnd: boolean
  onReachedEnd: (key: LegalDocumentKey) => void
}

function LegalDocumentPanel({
  entry,
  isActive,
  reachedEnd,
  onReachedEnd,
}: LegalDocumentPanelProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const key = entry.key

  React.useEffect(() => {
    if (!isActive) return
    const root = scrollRef.current
    if (root) root.scrollTop = 0
  }, [isActive, key])

  React.useEffect(() => {
    if (!isActive || reachedEnd) return
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return

    const scrollRoot = root

    function markIfFullyScrolled() {
      if (scrollRoot.scrollHeight <= scrollRoot.clientHeight + 2) {
        onReachedEnd(key)
      }
    }

    markIfFullyScrolled()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const observed of entries) {
          if (observed.isIntersecting) {
            onReachedEnd(key)
          }
        }
      },
      { root: scrollRoot, threshold: 0, rootMargin: "0px 0px -4px 0px" },
    )
    observer.observe(sentinel)
    scrollRoot.addEventListener("scroll", markIfFullyScrolled, { passive: true })
    return () => {
      observer.disconnect()
      scrollRoot.removeEventListener("scroll", markIfFullyScrolled)
    }
  }, [isActive, reachedEnd, key, onReachedEnd])

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-background/40 px-3 py-4 pb-5 sm:p-4 sm:pb-6"
    >
      <LegalDocumentView document={entry.document} variant="embedded" />
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />
    </div>
  )
}
