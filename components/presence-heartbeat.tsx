"use client"

import { useEffect } from "react"

import { touchPresence } from "@/lib/presence/actions"

const HEARTBEAT_MS = 60_000

function markOffline() {
  if (typeof window === "undefined") return

  void fetch("/api/presence/offline", {
    method: "POST",
    keepalive: true,
  })
}

export function PresenceHeartbeat() {
  useEffect(() => {
    function ping() {
      void touchPresence()
    }

    ping()

    const intervalId = window.setInterval(ping, HEARTBEAT_MS)

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        ping()
      }
    }

    function handlePageHide() {
      markOffline()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("pagehide", handlePageHide)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("pagehide", handlePageHide)
    }
  }, [])

  return null
}
