"use client"

import { landingContent, type LandingFeatureIcon } from "@/components/landing/content"
import { AnimatedIcon } from "@/components/icons/animated-icon"
import { BookTextIcon } from "@/components/ui/book-text"
import { RadioIcon } from "@/components/ui/radio"
import { ShieldCheckIcon } from "@/components/ui/shield-check"
import { UsersIcon } from "@/components/ui/users"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnimatedIconHandle } from "@/components/icons/animated-icon"
import type { ComponentType, HTMLAttributes, Ref } from "react"

const landingFeatureIcons: Record<
  LandingFeatureIcon,
  ComponentType<
    HTMLAttributes<HTMLDivElement> & {
      ref?: Ref<AnimatedIconHandle>
      size?: number
    }
  >
> = {
  radio: RadioIcon,
  users: UsersIcon,
  "book-text": BookTextIcon,
  "shield-check": ShieldCheckIcon,
}

export function LandingFeatures() {
  const { features } = landingContent

  return (
    <section className="relative z-10 px-6 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          {features.map((feature) => {
            const Icon = landingFeatureIcons[feature.icon]

            return (
              <Card
                key={feature.title}
                className="border-0 bg-transparent py-0 shadow-none ring-0"
              >
                <CardHeader className="px-0">
                  <div className="mb-3 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <AnimatedIcon icon={Icon} size={16} />
                  </div>
                  <CardTitle className="font-heading text-h4 font-medium">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <p className="text-sm text-muted-foreground text-pretty">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
