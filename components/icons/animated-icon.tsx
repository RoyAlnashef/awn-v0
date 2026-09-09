"use client"

import {
  forwardRef,
  useEffect,
  useRef,
  type ComponentType,
  type HTMLAttributes,
  type Ref,
} from "react"

export interface AnimatedIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

type AnimatedIconComponent = ComponentType<
  HTMLAttributes<HTMLDivElement> & {
    ref?: Ref<AnimatedIconHandle>
    size?: number
  }
>

type AnimatedIconProps = HTMLAttributes<HTMLDivElement> & {
  icon: AnimatedIconComponent
  size?: number
}

export const AnimatedIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function AnimatedIcon({ icon: Icon, className, size, ...props }, ref) {
    const iconRef = useRef<AnimatedIconHandle>(null)

    useEffect(() => {
      iconRef.current?.startAnimation()
    }, [])

    return (
      <Icon
        ref={(node) => {
          iconRef.current = node
          if (typeof ref === "function") {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        className={className}
        size={size}
        onMouseEnter={(event) => {
          iconRef.current?.startAnimation()
          props.onMouseEnter?.(event)
        }}
        onMouseLeave={(event) => {
          iconRef.current?.stopAnimation()
          props.onMouseLeave?.(event)
        }}
        {...props}
      />
    )
  },
)
