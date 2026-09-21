"use client"

import { useEffect } from "react"

import { isNativePlatform } from "@/lib/push/is-native-platform"

export function CapacitorNativeRoot() {
  useEffect(() => {
    if (!isNativePlatform()) return

    document.documentElement.classList.add("capacitor-native")

    return () => {
      document.documentElement.classList.remove("capacitor-native")
    }
  }, [])

  return null
}
