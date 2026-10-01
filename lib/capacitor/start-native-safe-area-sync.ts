import {
  dismissSplashWhenReady,
  scheduleSplashDismissWithFallback,
} from "@/lib/capacitor/dismiss-splash-when-ready"
import { syncSafeAreaInsets } from "@/lib/capacitor/sync-safe-area-insets"
import { getNativePlatform, isNativePlatform } from "@/lib/push/is-native-platform"

const IOS_COLD_START_RETRY_MS = [50, 150, 400] as const

export function startNativeSafeAreaSync(): () => void {
  if (!isNativePlatform()) {
    return () => {}
  }

  document.documentElement.classList.add("capacitor-native")
  syncSafeAreaInsets()

  const onViewportChange = () => syncSafeAreaInsets()
  window.visualViewport?.addEventListener("resize", onViewportChange)
  window.visualViewport?.addEventListener("scroll", onViewportChange)
  window.addEventListener("orientationchange", onViewportChange)

  const timeoutIds: number[] = []
  if (getNativePlatform() === "ios") {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => syncSafeAreaInsets())
    })
    for (const ms of IOS_COLD_START_RETRY_MS) {
      timeoutIds.push(window.setTimeout(() => syncSafeAreaInsets(), ms))
    }
  }

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
    for (const id of timeoutIds) {
      window.clearTimeout(id)
    }
    appListener?.remove()
    document.documentElement.classList.remove("capacitor-native")
    document.documentElement.style.removeProperty("--site-header-inset-top")
    document.documentElement.style.removeProperty("--safe-area-inset-bottom")
  }
}
