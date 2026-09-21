"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { createClient } from "@/lib/supabase/client"

import { getNativePlatform, isNativePlatform } from "./is-native-platform"

type NativePushState = {
  enabled: boolean
  loading: boolean
  error: string | null
}

export function useNativePush() {
  const router = useRouter()
  const listenersRef = useRef<Array<{ remove: () => void }>>([])
  const [state, setState] = useState<NativePushState>({
    enabled: false,
    loading: false,
    error: null,
  })

  const registerToken = useCallback(async (token: string) => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }

    const response = await fetch("/api/push/register-token", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        token,
        platform: getNativePlatform(),
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to register push token")
    }

    setState((current) => ({ ...current, enabled: true, error: null }))
  }, [])

  const enableNativePush = useCallback(async () => {
    if (!isNativePlatform()) {
      return false
    }

    setState((current) => ({ ...current, loading: true, error: null }))

    try {
      const { PushNotifications } = await import("@capacitor/push-notifications")
      let permission = await PushNotifications.checkPermissions()

      if (permission.receive === "prompt") {
        permission = await PushNotifications.requestPermissions()
      }

      if (permission.receive !== "granted") {
        setState((current) => ({
          ...current,
          loading: false,
          enabled: false,
          error: "Push permission denied",
        }))
        return false
      }

      await PushNotifications.register()
      setState((current) => ({ ...current, loading: false }))
      return true
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Push setup failed",
      }))
      return false
    }
  }, [])

  useEffect(() => {
    if (!isNativePlatform()) return

    let cancelled = false

    void (async () => {
      try {
        const { PushNotifications } = await import(
          "@capacitor/push-notifications"
        )

        const registrationListener = await PushNotifications.addListener(
          "registration",
          (event) => {
            void registerToken(event.value).catch(() => {
              if (!cancelled) {
                setState((current) => ({
                  ...current,
                  error: "Failed to save push token",
                }))
              }
            })
          },
        )

        const actionListener = await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (event) => {
            const url = event.notification.data?.url
            if (typeof url === "string" && url.startsWith("/")) {
              router.push(url)
            }
          },
        )

        const errorListener = await PushNotifications.addListener(
          "registrationError",
          () => {
            if (!cancelled) {
              setState((current) => ({
                ...current,
                error: "Native push registration failed",
              }))
            }
          },
        )

        listenersRef.current = [
          registrationListener,
          actionListener,
          errorListener,
        ]

        await enableNativePush()
      } catch {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            error: "Native push unavailable",
          }))
        }
      }
    })()

    return () => {
      cancelled = true
      for (const listener of listenersRef.current) {
        listener.remove()
      }
      listenersRef.current = []
    }
  }, [enableNativePush, registerToken, router])

  return {
    ...state,
    isNative: isNativePlatform(),
    enableNativePush,
  }
}
