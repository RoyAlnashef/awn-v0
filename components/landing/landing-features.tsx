import { landingContent } from "@/components/landing/content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LandingFeatures() {
  const { features } = landingContent

  return (
    <section className="relative z-10 px-6 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <Card
                key={feature.title}
                className="border-0 bg-transparent py-0 shadow-none ring-0"
              >
                <CardHeader className="px-0">
                  <div className="mb-3 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <CardTitle className="font-heading text-xl font-medium">
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
