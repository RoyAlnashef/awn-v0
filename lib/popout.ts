export const POPOUT_WINDOW_FEATURES =
  "width=390,height=844,menubar=no,toolbar=no,location=no,status=no,resizable=yes"

export type PopoutPath = "/popout/messages" | "/popout/groups"

export function buildPopoutUrl(
  path: PopoutPath,
  params?: Record<string, string>,
): string {
  if (!params || Object.keys(params).length === 0) {
    return path
  }

  const search = new URLSearchParams(params)
  return `${path}?${search.toString()}`
}

export function openPopoutWindow(url: string, windowName: string): void {
  window.open(url, windowName, POPOUT_WINDOW_FEATURES)
}
