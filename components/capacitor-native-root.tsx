"use client"

import { useEffect } from "react"

import { scheduleSplashDismissWithFallback } from "@/lib/capacitor/dismiss-splash-when-ready"
import { syncSafeAreaInsets } from "@/lib/capacitor/sync-safe-area-insets"
import { isNativePlatform } from "@/lib/push/is-native-platform"

export function CapacitorNativeRoot() {
  useEffect(() => {
    if (!isNativePlatform()) return

    document.documentElement.classList.add("capacitor-native")
    syncSafeAreaInsets()

    const onViewportChange = () => syncSafeAreaInsets()
    window.visualViewport?.addEventListener("resize", onViewportChange)
    window.addEventListener("orientationchange", onViewportChange)

    void import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
      void StatusBar.setStyle({ style: Style.Dark })
      void StatusBar.setBackgroundColor({ color: "#080807" })
    })

    scheduleSplashDismissWithFallback()

    return () => {
      window.visualViewport?.removeEventListener("resize", onViewportChange)
      window.removeEventListener("orientationchange", onViewportChange)
      document.documentElement.classList.remove("capacitor-native")
      document.documentElement.style.removeProperty("--site-header-inset-top")
      document.documentElement.style.removeProperty("--safe-area-inset-bottom")
    }
  }, [])

  return null
}
