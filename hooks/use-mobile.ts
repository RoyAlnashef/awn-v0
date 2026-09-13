import * as React from "react"

const MOBILE_BREAKPOINT = 768
const LARGE_SCREEN_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsLargeScreen() {
  const [isLargeScreen, setIsLargeScreen] = React.useState(true)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LARGE_SCREEN_BREAKPOINT}px)`)
    const onChange = () => {
      setIsLargeScreen(window.innerWidth >= LARGE_SCREEN_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsLargeScreen(window.innerWidth >= LARGE_SCREEN_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isLargeScreen
}
