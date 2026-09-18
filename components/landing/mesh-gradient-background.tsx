"use client"

import { useEffect, useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"

export function MeshGradientBackground() {
  const [frame, setFrame] = useState<number>()

  useEffect(() => {
    setFrame(Math.random() * 100_000)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-0 bg-black">
      {frame !== undefined ? (
        <MeshGradient
          speed={0.2}
          frame={frame}
          scale={1}
          distortion={1}
          swirl={0.14}
          colors={["#18181B", "#0B0809", "#000000"]}
          fit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
    </div>
  )
}
