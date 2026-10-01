import {
  applyCapacitorNativeHtmlClasses,
  isCapacitorIosWebView,
} from "@/lib/capacitor/is-capacitor-ios-webview"
import { isNativePlatform } from "@/lib/push/is-native-platform"

/** Typical portrait inset when env(safe-area-inset-top) is 0 in WKWebView. */
const IOS_FALLBACK_INSET_TOP_PX = 47

/** Typical home-indicator inset when env(safe-area-inset-bottom) is 0 in WKWebView. */
const IOS_FALLBACK_INSET_BOTTOM_PX = 34

function measureEnvInset(edge: "top" | "bottom"): number {
  if (typeof document === "undefined") return 0

  const prop =
    edge === "top"
      ? "padding-top:env(safe-area-inset-top,0px)"
      : "padding-bottom:env(safe-area-inset-bottom,0px)"

  const probe = document.createElement("div")
  probe.style.cssText = `position:fixed;visibility:hidden;pointer-events:none;${prop}`
  document.documentElement.appendChild(probe)
  const style = getComputedStyle(probe)
  const value =
    edge === "top"
      ? parseFloat(style.paddingTop) || 0
      : parseFloat(style.paddingBottom) || 0
  probe.remove()
  return value
}

export function measureSafeAreaInsetTop(): number {
  return measureEnvInset("top")
}

export function measureSafeAreaInsetBottom(): number {
  return measureEnvInset("bottom")
}

function shouldApplyIosSafeAreaFallback(): boolean {
  return isCapacitorIosWebView()
}

export function syncSafeAreaInsets(): void {
  if (!isNativePlatform() && !isCapacitorIosWebView()) return

  applyCapacitorNativeHtmlClasses()

  let top = measureSafeAreaInsetTop()
  let bottom = measureSafeAreaInsetBottom()

  if (shouldApplyIosSafeAreaFallback()) {
    if (top === 0) top = IOS_FALLBACK_INSET_TOP_PX
    if (bottom === 0) bottom = IOS_FALLBACK_INSET_BOTTOM_PX
  }

  document.documentElement.style.setProperty(
    "--site-header-inset-top",
    `${top}px`,
  )
  document.documentElement.style.setProperty(
    "--safe-area-inset-bottom",
    `${bottom}px`,
  )
}
