"use client"

import type { RefObject } from "react"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

function SectionLabelSkeleton() {
  return <Skeleton className="h-3 w-16 rounded-md" />
}

function CreditCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-popover p-4 pl-5">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-muted"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-[85%] max-w-60" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
        <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
      </div>
    </div>
  )
}

export function PersonProfileCardSkeleton({
  className,
  heroRef,
  reserveTopRightForClose = false,
}: {
  className?: string
  heroRef?: RefObject<HTMLDivElement | null>
  reserveTopRightForClose?: boolean
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden bg-card text-card-foreground",
        className,
      )}
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div ref={heroRef} tabIndex={-1} className="relative shrink-0 outline-none">
        <Skeleton className="aspect-32/9 w-full rounded-none" />
        <Skeleton
          className={cn(
            "absolute top-4 h-7 w-28 rounded-full",
            reserveTopRightForClose ? "right-14" : "right-4",
          )}
        />

        <div className="px-6 pb-2">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="-mt-10 size-20 shrink-0 rounded-full" />
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 pt-6">
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <Skeleton className="h-7 w-48 max-w-full" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 overflow-hidden">
        <div className="flex flex-col gap-6 px-6 py-5">
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[75%]" />
          </div>

          <section className="flex flex-col gap-3">
            <SectionLabelSkeleton />
            <ul className="flex flex-col gap-2.5">
              <li>
                <CreditCardSkeleton />
              </li>
              <li>
                <CreditCardSkeleton />
              </li>
            </ul>
          </section>
        </div>
      </ScrollArea>

      <div className="flex shrink-0 flex-wrap gap-2 border-t border-border px-6 py-4">
        <Skeleton className="h-9 min-w-30 flex-1 rounded-md" />
        <Skeleton className="h-9 min-w-30 flex-1 rounded-md" />
      </div>
    </div>
  )
}
