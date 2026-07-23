"use client"

import { useLayoutEffect, useState, type ComponentProps } from "react"

import { MessageScrollerItem } from "@/components/ui/message-scroller"
import { cn } from "@/lib/utils"

const MESSAGE_ENTER_MS = 280
const MESSAGE_EXIT_MS = 220

type AnimatedMessageScrollerItemProps = ComponentProps<typeof MessageScrollerItem> & {
  visible?: boolean
  animate?: boolean
}

export function AnimatedMessageScrollerItem({
  visible = true,
  animate = true,
  className,
  children,
  ...props
}: AnimatedMessageScrollerItemProps) {
  const [mounted, setMounted] = useState(visible)
  const [phase, setPhase] = useState<"enter" | "exit" | "idle">(() =>
    visible && animate ? "enter" : "idle",
  )

  useLayoutEffect(() => {
    if (visible) {
      setMounted(true)

      if (!animate) {
        setPhase("idle")
        return
      }

      setPhase("enter")
      const timeout = window.setTimeout(() => {
        setPhase("idle")
      }, MESSAGE_ENTER_MS)

      return () => window.clearTimeout(timeout)
    }

    if (!mounted) return

    if (!animate) {
      setMounted(false)
      setPhase("idle")
      return
    }

    setPhase("exit")
    const timeout = window.setTimeout(() => {
      setMounted(false)
      setPhase("idle")
    }, MESSAGE_EXIT_MS)

    return () => window.clearTimeout(timeout)
  }, [animate, mounted, visible])

  if (!mounted) return null

  return (
    <MessageScrollerItem
      className={cn(
        phase === "enter" && "animate-message-enter [content-visibility:visible]",
        phase === "exit" && "animate-message-exit [content-visibility:visible]",
        className,
      )}
      {...props}
    >
      {children}
    </MessageScrollerItem>
  )
}
