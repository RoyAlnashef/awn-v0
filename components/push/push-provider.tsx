"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"

import { useNativePush } from "@/lib/push/use-native-push"
import { useWebPush } from "@/lib/push/use-web-push"

type PushContextValue = {
  native: ReturnType<typeof useNativePush>
  web: ReturnType<typeof useWebPush>
}

const PushContext = createContext<PushContextValue | null>(null)

export function PushProvider({ children }: { children: ReactNode }) {
  const native = useNativePush()
  const web = useWebPush()

  return (
    <PushContext.Provider value={{ native, web }}>{children}</PushContext.Provider>
  )
}

export function usePush() {
  const context = useContext(PushContext)
  if (!context) {
    throw new Error("usePush must be used within PushProvider")
  }
  return context
}
