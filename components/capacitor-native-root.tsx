"use client"

import { useEffect } from "react"

import { isNativePlatform } from "@/lib/push/is-native-platform"

export function CapacitorNativeRoot() {
  useEffect(() => {
    if (!isNativePlatform()) return

    document.documentElement.classList.add("capacitor-native")

    void import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
      void StatusBar.setStyle({ style: Style.Dark })
      void StatusBar.setBackgroundColor({ color: "#080807" })
    })

    return () => {
      document.documentElement.classList.remove("capacitor-native")
    }
  }, [])

  return null
}
