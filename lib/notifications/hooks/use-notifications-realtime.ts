"use client"

import { useEffect } from "react"
import { mutate as mutateSwr } from "swr"

import { notificationsKey } from "@/lib/notifications/swr-keys"
import { createClient } from "@/lib/supabase/client"

export function useNotificationsRealtime({
  enabled = true,
  userId,
}: {
  enabled?: boolean
  userId: string
}) {
  useEffect(() => {
    if (!enabled || !userId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void mutateSwr(notificationsKey)
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [enabled, userId])
}
