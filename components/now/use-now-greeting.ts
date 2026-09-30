"use client"

import * as React from "react"

import {
  formatNowGreeting,
  setUserTimezoneCookie,
} from "@/lib/now/greeting"

export function useNowGreeting(firstName: string, serverGreeting: string) {
  const [greeting, setGreeting] = React.useState(serverGreeting)

  React.useLayoutEffect(() => {
    setUserTimezoneCookie()
    setGreeting(formatNowGreeting(firstName))
  }, [firstName])

  return greeting
}
