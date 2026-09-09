import * as React from "react"

/** True only after the client has hydrated. Safe for SSR/first paint parity. */
export function useHydrated() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}
