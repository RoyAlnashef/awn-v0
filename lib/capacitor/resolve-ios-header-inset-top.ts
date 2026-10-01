import { CAPACITOR_IOS_MAX_HEADER_INSET_PX } from "@/lib/capacitor/ios-native-inset-px"

/**
 * Compensates for WKWebView vertical origin so the header control row stays at screen Y≈0.
 * When headerTop is -34, returns 34; when headerTop is 0, returns 0.
 */
export function resolveIosHeaderInsetTop(): number {
  if (typeof document === "undefined") return 0

  const header = document.querySelector<HTMLElement>('[data-slot="site-header"]')
  const anchorTop =
    header?.getBoundingClientRect().top ??
    document.documentElement.getBoundingClientRect().top

  return Math.min(
    CAPACITOR_IOS_MAX_HEADER_INSET_PX,
    Math.max(0, Math.round(-anchorTop)),
  )
}
