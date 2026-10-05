import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { landingContent } from "@/components/landing/content"
import { MeshGradientBackground } from "@/components/landing/mesh-gradient-background"
import { Button } from "@/components/ui/button"
import { getSessionUser } from "@/lib/auth/get-session-user"

export const metadata: Metadata = {
  title: "Page not found — A Wright Network",
}

async function resolveHome() {
  try {
    const user = await getSessionUser()
    if (!user) return { href: "/", label: "Back to home", canRequestAccess: true }
    if (!user.isApproved)
      return { href: "/pending", label: "Back to my application", canRequestAccess: false }
    return { href: "/now", label: "Back to home", canRequestAccess: false }
  } catch {
    return { href: "/", label: "Back to home", canRequestAccess: true }
  }
}

export default async function NotFound() {
  const home = await resolveHome()

  return (
    <main className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <MeshGradientBackground />

      <div className="relative z-10 flex flex-col items-center">
        <p
          aria-hidden="true"
          className="animate-in fade-in zoom-in-95 select-none bg-linear-to-b from-foreground via-foreground/60 to-foreground/5 bg-clip-text font-heading text-[clamp(7rem,28vw,18rem)] leading-[0.85] font-semibold tracking-tighter text-transparent duration-700"
        >
          404
        </p>

        <div className="animate-in fade-in slide-in-from-bottom-2 mt-6 flex max-w-md flex-col items-center gap-3 delay-150 duration-700 fill-mode-backwards">
          <h1 className="font-heading text-h2 font-medium tracking-tight text-balance text-foreground">
            This page isn&apos;t on the guest list.
          </h1>
          <p className="text-body-sm text-pretty text-muted-foreground">
            The link may be broken, or the page may have moved. Let&apos;s get
            you back to where the work is.
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 mt-10 flex flex-col items-center gap-3 delay-300 duration-700 fill-mode-backwards sm:flex-row">
          <Button
            size="lg"
            className="min-w-44"
            nativeButton={false}
            render={<Link href={home.href} />}
          >
            <ArrowLeft data-icon="inline-start" />
            {home.label}
          </Button>
          {home.canRequestAccess && (
            <Button
              variant="outline"
              size="lg"
              className="min-w-44"
              nativeButton={false}
              render={<Link href="/request-access" />}
            >
              Request access
            </Button>
          )}
        </div>
      </div>

      <p className="absolute inset-x-0 bottom-8 z-10 text-center text-xs text-muted-foreground">
        {landingContent.brand}
        <span className="mx-2 opacity-40" aria-hidden="true">
          /
        </span>
        {landingContent.footer.legal}
      </p>
    </main>
  )
}
