import {
  applyCapacitorNativeHtmlClasses,
  isCapacitorIosWebView,
} from "@/lib/capacitor/is-capacitor-ios-webview"
import { CAPACITOR_IOS_BOTTOM_INSET_PX } from "@/lib/capacitor/ios-native-inset-px"
import { resolveIosHeaderInsetTop } from "@/lib/capacitor/resolve-ios-header-inset-top"
import { isNativePlatform } from "@/lib/push/is-native-platform"

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

function applyInsetCssVar(name: string, px: number): void {
  if (px <= 0) {
    document.documentElement.style.removeProperty(name)
    return
  }
  document.documentElement.style.setProperty(name, `${px}px`)
}

function applyIosCompensatedInsets(): void {
  const top = resolveIosHeaderInsetTop()
  applyInsetCssVar("--site-header-inset-top", top)
  applyInsetCssVar(
    "--safe-area-inset-bottom",
    CAPACITOR_IOS_BOTTOM_INSET_PX,
  )
}

export function syncSafeAreaInsets(): void {
  if (!isNativePlatform() && !isCapacitorIosWebView()) return

  applyCapacitorNativeHtmlClasses()

  if (isCapacitorIosWebView()) {
    applyIosCompensatedInsets()
    return
  }

  const top = measureSafeAreaInsetTop()
  const bottom = measureSafeAreaInsetBottom()
  applyInsetCssVar("--site-header-inset-top", top)
  applyInsetCssVar("--safe-area-inset-bottom", bottom)
}
