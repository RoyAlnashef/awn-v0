"use client"

import * as React from "react"

import {
  type BoardViewMode,
  type BoardViewScope,
  readBoardViewMode,
  writeBoardViewMode,
} from "@/lib/board-view-mode"

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)

  function onStorage(event: StorageEvent) {
    if (event.key?.startsWith("boardViewMode:")) {
      listener()
    }
  }

  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

export function useBoardViewMode(
  scope: BoardViewScope,
): [BoardViewMode, (mode: BoardViewMode) => void] {
  const view = React.useSyncExternalStore(
    subscribe,
    () => readBoardViewMode(scope),
    (): BoardViewMode => "grid",
  )

  const setView = React.useCallback(
    (mode: BoardViewMode) => {
      writeBoardViewMode(scope, mode)
      emitChange()
    },
    [scope],
  )

  return [view, setView]
}
