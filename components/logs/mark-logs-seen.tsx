"use client"

import { useEffect } from "react"
import { useSWRConfig } from "swr"

import { markErrorLogsSeen } from "@/lib/logs/last-seen"
import { errorLogsUnreadCountKey } from "@/lib/logs/swr-keys"

export function MarkLogsSeen() {
  const { mutate } = useSWRConfig()

  useEffect(() => {
    markErrorLogsSeen()
    void mutate(errorLogsUnreadCountKey)
  }, [mutate])

  return null
}
