"use client"

import type { RefObject } from "react"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

export function PersonProfileCardSkeleton({
  className,
  heroRef,
}: {
  className?: string
  heroRef?: RefObject<HTMLDivElement | null>
  /** @deprecated Spacing handled by drawer close button overlay; kept for API compatibility. */
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
        <div className="px-6 pb-2">
          <Skeleton className="-mt-10 size-20 shrink-0 rounded-full" />
          <div className="mt-3 flex flex-col gap-2">
            <Skeleton className="h-7 w-48 max-w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 overflow-hidden">
        <div className="flex flex-col gap-5 px-6 py-5">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[70%]" />
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </ScrollArea>

      <div className="border-t border-border px-6 py-4">
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  )
}
