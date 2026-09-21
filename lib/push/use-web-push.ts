"use client"

import { useCallback, useState } from "react"

import { isNativePlatform } from "./is-native-platform"

type WebPushState = {
  enabled: boolean
  loading: boolean
  error: string | null
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export function useWebPush() {
  const [state, setState] = useState<WebPushState>({
    enabled: false,
    loading: false,
    error: null,
  })

  const enableWebPush = useCallback(async () => {
    if (isNativePlatform()) {
      return false
    }

    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator)
    ) {
      setState((current) => ({
        ...current,
        error: "Push notifications are not supported in this browser",
      }))
      return false
    }

    setState((current) => ({ ...current, loading: true, error: null }))

    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setState((current) => ({
          ...current,
          loading: false,
          enabled: false,
          error: "Push permission denied",
        }))
        return false
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!publicKey) {
        setState((current) => ({
          ...current,
          loading: false,
          error: "Web push is not configured yet",
        }))
        return false
      }

      const registration = await navigator.serviceWorker.register("/sw.js")
      await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      const json = subscription.toJSON()
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subscription: json }),
      })

      if (!response.ok) {
        throw new Error("Failed to save push subscription")
      }

      setState({ enabled: true, loading: false, error: null })
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

  const disableWebPush = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return false
    }

    setState((current) => ({ ...current, loading: true, error: null }))

    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js")
      const subscription = await registration?.pushManager.getSubscription()

      if (subscription) {
        const endpoint = subscription.endpoint
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ endpoint }),
        })
        await subscription.unsubscribe()
      }

      setState({ enabled: false, loading: false, error: null })
      return true
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to disable push",
      }))
      return false
    }
  }, [])

  return {
    ...state,
    enableWebPush,
    disableWebPush,
  }
}
