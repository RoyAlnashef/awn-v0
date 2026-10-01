import {
  applyCapacitorNativeHtmlClasses,
  isCapacitorIosWebView,
} from "@/lib/capacitor/is-capacitor-ios-webview"
import { isNativePlatform } from "@/lib/push/is-native-platform"

/** Portrait status-bar inset when the webview is full-bleed under the status bar. */
const IOS_HEADER_INSET_FLOOR_PX = 47

/** env(safe-area-inset-top) below this is treated as a stale partial (e.g. 8px). */
const IOS_TRUSTED_ENV_TOP_PX = 40

/** Header already below the status bar when its screen Y is at least this. */
const IOS_WEBVIEW_INSET_SCREEN_TOP_PX = 20

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

function siteHeaderScreenTop(): number {
  const header = document.querySelector<HTMLElement>('[data-slot="site-header"]')
  return header?.getBoundingClientRect().top ?? 0
}

function resolveIosHeaderInsetTop(): number {
  const envTop = measureSafeAreaInsetTop()
  const headerScreenTop = siteHeaderScreenTop()

  if (headerScreenTop >= IOS_WEBVIEW_INSET_SCREEN_TOP_PX) {
    return 0
  }

  if (envTop >= IOS_TRUSTED_ENV_TOP_PX) {
    return envTop
  }

  return IOS_HEADER_INSET_FLOOR_PX
}

function resolveIosBottomInset(topPadding: number): number {
  const envBottom = measureSafeAreaInsetBottom()

  if (topPadding === 0 && envBottom >= 30) {
    return 0
  }

  if (envBottom >= 30) {
    return envBottom
  }

  if (envBottom > 0) {
    return 34
  }

  return topPadding > 0 ? 34 : 0
}

function applyInsetCssVar(name: string, px: number): void {
  if (px <= 0) {
    document.documentElement.style.removeProperty(name)
    return
  }

  document.documentElement.style.setProperty(name, `${px}px`)
}

function shouldApplyIosSafeAreaFallback(): boolean {
  return isCapacitorIosWebView()
}

export function syncSafeAreaInsets(): void {
  if (!isNativePlatform() && !isCapacitorIosWebView()) return

  applyCapacitorNativeHtmlClasses()

  if (shouldApplyIosSafeAreaFallback()) {
    const top = resolveIosHeaderInsetTop()
    const bottom = resolveIosBottomInset(top)
    applyInsetCssVar("--site-header-inset-top", top)
    applyInsetCssVar("--safe-area-inset-bottom", bottom)
    return
  }

  const top = measureSafeAreaInsetTop()
  const bottom = measureSafeAreaInsetBottom()
  applyInsetCssVar("--site-header-inset-top", top)
  applyInsetCssVar("--safe-area-inset-bottom", bottom)
}
