"use client"

import { Orb01 } from "@/components/orbs/orb-01"

export function LandingHeroOrb01() {
  return (
    <Orb01
      size={768}
      state="idle"
      colors={{ tint: "#ffffff" }}
      className="pointer-events-none"
      ariaLabel=""
    />
  )
}
