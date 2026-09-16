"use client"

import { useEffect } from "react"

import {
  contextFromPathname,
  reportClientError,
} from "@/lib/logs/report-client-error"

const DEDUPE_TTL_MS = 5000

const recentErrors = new Map<string, number>()

function shouldReport(key: string): boolean {
  const now = Date.now()
  const lastSeen = recentErrors.get(key)
  if (lastSeen && now - lastSeen < DEDUPE_TTL_MS) {
    return false
  }
  recentErrors.set(key, now)
  return true
}

function errorKey(message: string, context: string): string {
  return `${context}:${message}`
}

export function ErrorReporter() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      const message =
        event.error instanceof Error
          ? event.error.message
          : event.message || "Unknown error"
      const stack =
        event.error instanceof Error ? event.error.stack ?? null : null
      const context = contextFromPathname(window.location.pathname)

      if (!shouldReport(errorKey(message, context))) return

      void reportClientError({
        message,
        stack,
        context,
        url: window.location.href,
      })
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "Unhandled promise rejection"
      const stack = reason instanceof Error ? reason.stack : null
      const context = contextFromPathname(window.location.pathname)

      if (!shouldReport(errorKey(message, context))) return

      void reportClientError({
        message,
        stack,
        context,
        url: window.location.href,
      })
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  return null
}
