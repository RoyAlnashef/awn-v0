"use client"

import { useLayoutEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CrewProfileBio({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    function measure() {
      const el = textRef.current
      if (!el || expanded) return
      setCanExpand(el.scrollHeight > el.clientHeight + 1)
    }

    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [bio, expanded])

  return (
    <div className="flex w-full flex-col">
      <p
        ref={textRef}
        className={cn(
          "text-sm leading-relaxed text-foreground/90 text-pretty whitespace-pre-line sm:text-base",
          !expanded && "line-clamp-4",
        )}
      >
        {bio}
      </p>
      {canExpand && !expanded ? (
        <div className="relative mt-3 flex w-full items-center justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-border"
          />
          <Button
            variant="outline"
            size="xs"
            className="relative z-10 rounded-full !bg-background px-3 text-muted-foreground hover:!bg-background hover:text-foreground focus-visible:!bg-background active:!bg-background"
            onClick={() => setExpanded(true)}
          >
            More
          </Button>
        </div>
      ) : null}
    </div>
  )
}
