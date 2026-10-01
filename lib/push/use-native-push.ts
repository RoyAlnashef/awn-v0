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

const MAX_TOKEN_REGISTER_ATTEMPTS = 8
const TOKEN_REGISTER_RETRY_MS = 500

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function useNativePush() {
  const router = useRouter()
  const listenersRef = useRef<Array<{ remove: () => void }>>([])
  const pendingTokenRef = useRef<string | null>(null)
  const [state, setState] = useState<NativePushState>({
    enabled: false,
    loading: false,
    error: null,
  })

  const postRegisterToken = useCallback(async (token: string) => {
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

    return fetch("/api/push/register-token", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        token,
        platform: getNativePlatform(),
      }),
    })
  }, [])

  const registerToken = useCallback(
    async (token: string, isCancelled: () => boolean) => {
      pendingTokenRef.current = token

      for (let attempt = 0; attempt < MAX_TOKEN_REGISTER_ATTEMPTS; attempt += 1) {
        if (isCancelled()) return

        const response = await postRegisterToken(token)

        if (response.ok) {
          pendingTokenRef.current = null
          setState((current) => ({ ...current, enabled: true, error: null }))
          return
        }

        if (response.status !== 401) {
          throw new Error("Failed to register push token")
        }

        await sleep(TOKEN_REGISTER_RETRY_MS * (attempt + 1))
      }

      throw new Error("Failed to register push token")
    },
    [postRegisterToken],
  )

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
    const isCancelled = () => cancelled

    const supabase = createClient()
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const pending = pendingTokenRef.current
      if (!session || !pending || cancelled) return

      void registerToken(pending, isCancelled).catch(() => {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            error: "Failed to save push token",
          }))
        }
      })
    })

    void (async () => {
      try {
        const { PushNotifications } = await import(
          "@capacitor/push-notifications"
        )

        const registrationListener = await PushNotifications.addListener(
          "registration",
          (event) => {
            void registerToken(event.value, isCancelled).catch(() => {
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
      authSubscription.unsubscribe()
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
