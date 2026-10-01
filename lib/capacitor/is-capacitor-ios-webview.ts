import {
  getNativePlatform,
  isNativePlatform,
} from "@/lib/push/is-native-platform"

const IOS_UA_RE = /iPhone|iPad|iPod/i

/** True in the Capacitor iOS shell (not Mobile Safari browsing the site). */
export function isCapacitorIosWebView(): boolean {
  if (typeof window === "undefined") return false

  if (isNativePlatform() && getNativePlatform() === "ios") {
    return true
  }

  const platform = (
    window as Window & {
      Capacitor?: { getPlatform?: () => string }
    }
  ).Capacitor?.getPlatform?.()

  if (isNativePlatform() && platform === "ios") {
    return true
  }

  const ua = navigator.userAgent
  return (
    IOS_UA_RE.test(ua) &&
    (ua.includes("Capacitor") || ua.includes("CapacitorAWN"))
  )
}

export function applyCapacitorNativeHtmlClasses(): void {
  if (!isCapacitorIosWebView() && !isNativePlatform()) return

  document.documentElement.classList.add("capacitor-native")

  if (isCapacitorIosWebView()) {
    document.documentElement.classList.add("capacitor-native-ios")
  }
}
