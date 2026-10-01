"use client"

import { usePathname } from "next/navigation"
import { useEffect, useLayoutEffect } from "react"

import { isCapacitorIosWebView } from "@/lib/capacitor/is-capacitor-ios-webview"
import { startNativeSafeAreaSync } from "@/lib/capacitor/start-native-safe-area-sync"
import { syncSafeAreaInsets } from "@/lib/capacitor/sync-safe-area-insets"
import { isNativePlatform } from "@/lib/push/is-native-platform"

export function CapacitorNativeRoot() {
  useLayoutEffect(() => startNativeSafeAreaSync(), [])

  const pathname = usePathname()

  useEffect(() => {
    if (!isNativePlatform() && !isCapacitorIosWebView()) return
    syncSafeAreaInsets()
  }, [pathname])

  return null
}
