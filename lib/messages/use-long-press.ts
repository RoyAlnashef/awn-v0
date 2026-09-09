"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const DEFAULT_DELAY_MS = 400
const MOVE_THRESHOLD_PX = 10

export function useLongPress(
  onLongPress: () => void,
  options?: { delayMs?: number },
) {
  const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const firedRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") return

      firedRef.current = false
      startRef.current = { x: event.clientX, y: event.clientY }
      clearTimer()

      timerRef.current = setTimeout(() => {
        firedRef.current = true
        onLongPress()
      }, delayMs)
    },
    [clearTimer, delayMs, onLongPress],
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!startRef.current || !timerRef.current) return

      const dx = Math.abs(event.clientX - startRef.current.x)
      const dy = Math.abs(event.clientY - startRef.current.y)
      if (dx > MOVE_THRESHOLD_PX || dy > MOVE_THRESHOLD_PX) {
        clearTimer()
        startRef.current = null
      }
    },
    [clearTimer],
  )

  const onPointerUp = useCallback(() => {
    clearTimer()
    startRef.current = null
  }, [clearTimer])

  const onPointerCancel = useCallback(() => {
    clearTimer()
    startRef.current = null
  }, [clearTimer])

  const onContextMenu = useCallback((event: React.MouseEvent) => {
    if (firedRef.current) {
      event.preventDefault()
      firedRef.current = false
    }
  }, [])

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onContextMenu,
  }
}

export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(hover: none)")
    const update = () => setCoarse(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  return coarse
}
