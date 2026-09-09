import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { landingContent } from "@/components/landing/content"
import { Button } from "@/components/ui/button"

export function LandingCta() {
  const { cta } = landingContent

  return (
    <section
      id="request-access"
      className="relative z-10 px-6 py-16 text-center sm:px-8 sm:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="font-heading text-h2 font-medium tracking-tight text-balance">
          {cta.title}
        </h2>
        <p className="mt-4 text-body-sm text-muted-foreground">{cta.subtitle}</p>

        <Button
          size="lg"
          className="mt-10 min-w-48"
          nativeButton={false}
          render={<Link href="/request-access" />}
        >
          {cta.button}
          <ChevronRight data-icon="inline-end" />
        </Button>

        <p className="mt-6 text-sm text-muted-foreground">
          {cta.memberPrompt}{" "}
          <Link
            href="/login"
            className="text-foreground underline-offset-4 transition-colors hover:underline"
          >
            {cta.memberLink}
          </Link>
        </p>
      </div>
    </section>
  )
}
