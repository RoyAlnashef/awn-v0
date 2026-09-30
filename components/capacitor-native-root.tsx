"use client"

import { useEffect } from "react"

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

    // Dismiss native splash when the WebView loads (required if the installed shell
    // was built with launchAutoHide: false).
    void import("@capacitor/splash-screen").then(({ SplashScreen }) => {
      const hide = () => {
        void SplashScreen.hide({ fadeOutDuration: 200 })
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(hide)
      })
      window.setTimeout(hide, 15_000)
    })

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
