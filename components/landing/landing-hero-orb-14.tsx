"use client"

import { Orb14 } from "@/components/orbs/orb-14"

export function LandingHeroOrb14() {
  return (
    <Orb14
      size={768}
      state="idle"
      colors={{ ink: "#141414", paper: "#ffffff" }}
      className="pointer-events-none"
      ariaLabel=""
    />
  )
}
