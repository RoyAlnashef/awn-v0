"use client"

import { MeshGradient } from "@paper-design/shaders-react"

export function MeshGradientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <MeshGradient
        speed={0.2}
        scale={1}
        distortion={1}
        swirl={0.14}
        colors={["#18181B", "#0B0809", "#27272A", "#000000"]}
        fit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}
