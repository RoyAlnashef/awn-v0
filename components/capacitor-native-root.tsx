"use client"

import { useEffect } from "react"

import { startNativeSafeAreaSync } from "@/lib/capacitor/start-native-safe-area-sync"

export function CapacitorNativeRoot() {
  useEffect(() => startNativeSafeAreaSync(), [])

  return null
}
