import {
  dismissSplashWhenReady,
  scheduleSplashDismissWithFallback,
} from "@/lib/capacitor/dismiss-splash-when-ready"
import { isCapacitorIosWebView } from "@/lib/capacitor/is-capacitor-ios-webview"
import { syncSafeAreaInsets } from "@/lib/capacitor/sync-safe-area-insets"
import { getNativePlatform, isNativePlatform } from "@/lib/push/is-native-platform"

const IOS_COLD_START_RETRY_MS = [50, 150, 400, 800] as const

/** Capacitor bridge can load after the first React effect on a cold install. */
const CAPACITOR_READY_POLL_MS = [0, 16, 50, 100, 250, 500, 1000, 2000, 3000] as const

function scheduleIosColdStartRetries(timeoutIds: number[]): void {
  if (!isCapacitorIosWebView() && getNativePlatform() !== "ios") return

  requestAnimationFrame(() => {
    requestAnimationFrame(() => syncSafeAreaInsets())
  })

  for (const ms of IOS_COLD_START_RETRY_MS) {
    timeoutIds.push(window.setTimeout(() => syncSafeAreaInsets(), ms))
  }
}

function attachNativeSafeAreaSync(): () => void {
  syncSafeAreaInsets()

  const onViewportChange = () => syncSafeAreaInsets()
  window.visualViewport?.addEventListener("resize", onViewportChange)
  window.visualViewport?.addEventListener("scroll", onViewportChange)
  window.addEventListener("orientationchange", onViewportChange)
  window.addEventListener("pageshow", onViewportChange)

  const timeoutIds: number[] = []
  scheduleIosColdStartRetries(timeoutIds)

  scheduleSplashDismissWithFallback()
  void dismissSplashWhenReady().then(() => syncSafeAreaInsets())

  let appListener: { remove: () => void } | null = null
  void import("@capacitor/app").then(({ App }) => {
    void App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) syncSafeAreaInsets()
    }).then((handle) => {
      appListener = handle
    })
  })

  void import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
    void StatusBar.setOverlaysWebView({ overlay: false })
    void StatusBar.setStyle({ style: Style.Dark })
    void StatusBar.setBackgroundColor({ color: "#080807" }).then(() => {
      syncSafeAreaInsets()
    })
  })

  return () => {
    window.visualViewport?.removeEventListener("resize", onViewportChange)
    window.visualViewport?.removeEventListener("scroll", onViewportChange)
    window.removeEventListener("orientationchange", onViewportChange)
    window.removeEventListener("pageshow", onViewportChange)
    for (const id of timeoutIds) {
      window.clearTimeout(id)
    }
    appListener?.remove()
  }
}

export function startNativeSafeAreaSync(): () => void {
  let attachedCleanup: (() => void) | null = null
  const pollTimeoutIds: number[] = []

  const tryAttach = () => {
    if (attachedCleanup || (!isNativePlatform() && !isCapacitorIosWebView())) {
      return
    }
    attachedCleanup = attachNativeSafeAreaSync()
  }

  tryAttach()
  for (const ms of CAPACITOR_READY_POLL_MS) {
    pollTimeoutIds.push(window.setTimeout(tryAttach, ms))
  }

  return () => {
    for (const id of pollTimeoutIds) {
      window.clearTimeout(id)
    }
    attachedCleanup?.()
    attachedCleanup = null
  }
}
