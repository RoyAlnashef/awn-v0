"use client"

import { useEffect, useRef, useState } from "react"

import { useMessageScrollerScrollable } from "@/components/ui/message-scroller"
import { Spinner } from "@/components/ui/spinner"

export function LoadOlderMessages({
  hasMore,
  onLoadOlder,
}: {
  hasMore: boolean
  onLoadOlder: () => Promise<void>
}) {
  const { start } = useMessageScrollerScrollable()
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (!start || !hasMore || loading || loadingRef.current) return

    loadingRef.current = true
    setLoading(true)
    void onLoadOlder().finally(() => {
      loadingRef.current = false
      setLoading(false)
    })
  }, [hasMore, loading, onLoadOlder, start])

  if (!hasMore && !loading) return null

  return (
    <div className="flex justify-center py-2">
      {loading ? <Spinner className="size-4 text-muted-foreground" /> : null}
    </div>
  )
}
