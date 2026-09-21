export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false

  const capacitor = (
    window as Window & {
      Capacitor?: { isNativePlatform?: () => boolean }
    }
  ).Capacitor

  return capacitor?.isNativePlatform?.() ?? false
}

export function getNativePlatform(): "ios" | "android" | "web" {
  if (!isNativePlatform()) return "web"

  const platform = (
    window as Window & {
      Capacitor?: { getPlatform?: () => string }
    }
  ).Capacitor?.getPlatform?.()

  if (platform === "ios" || platform === "android") {
    return platform
  }

  return "web"
}
