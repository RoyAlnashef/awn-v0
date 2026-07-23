"use client"

import { useLayoutEffect, useRef, useState } from "react"

const MESSAGE_ENTER_MS = 280

const EMPTY_IDS = new Set<string>()

export function useNewMessageIds(messageIds: string[], ready: boolean) {
  const initializedRef = useRef(false)
  const seenIdsRef = useRef(new Set<string>())
  const prevReadyRef = useRef(ready)
  const prevMessageIdsKeyRef = useRef("")
  const [animatingIds, setAnimatingIds] =
    useState<ReadonlySet<string>>(EMPTY_IDS)

  const messageIdsKey = messageIds.join("\0")

  useLayoutEffect(() => {
    if (!ready) {
      if (prevReadyRef.current) {
        initializedRef.current = false
        seenIdsRef.current = new Set()
        prevMessageIdsKeyRef.current = ""
        setAnimatingIds((current) =>
          current.size === 0 ? current : EMPTY_IDS,
        )
      }

      prevReadyRef.current = false
      return
    }

    prevReadyRef.current = true

    if (!initializedRef.current) {
      messageIds.forEach((id) => seenIdsRef.current.add(id))
      initializedRef.current = true
      prevMessageIdsKeyRef.current = messageIdsKey
      return
    }

    if (messageIdsKey === prevMessageIdsKeyRef.current) {
      return
    }

    prevMessageIdsKeyRef.current = messageIdsKey

    const fresh = messageIds.filter((id) => !seenIdsRef.current.has(id))
    messageIds.forEach((id) => seenIdsRef.current.add(id))

    if (fresh.length === 0) return

    setAnimatingIds(new Set(fresh))
    const timeout = window.setTimeout(() => {
      setAnimatingIds((current) =>
        current.size === 0 ? current : EMPTY_IDS,
      )
    }, MESSAGE_ENTER_MS)

    return () => window.clearTimeout(timeout)
    // messageIds is intentionally keyed by messageIdsKey to avoid rerunning
    // when the parent passes a new array reference with the same ids.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageIdsKey, ready])

  return animatingIds
}
