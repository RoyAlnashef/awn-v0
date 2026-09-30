import type { LegalDocument } from "@/components/legal/content"
import { cn } from "@/lib/utils"

type LegalDocumentViewProps = {
  document: LegalDocument
  variant?: "page" | "embedded"
}

export function LegalDocumentView({
  document,
  variant = "page",
}: LegalDocumentViewProps) {
  const embedded = variant === "embedded"

  return (
    <div className={cn(embedded ? "space-y-6" : "space-y-10")}>
      <header className={cn(embedded && "space-y-1")}>
        {embedded ? (
          <h2 className="font-heading text-base font-medium tracking-tight text-foreground sm:text-lg">
            {document.title}
          </h2>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Last updated {document.lastUpdated}
        </p>
      </header>

      {document.sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className={cn(embedded ? "scroll-mt-0" : "scroll-mt-24")}
        >
          <h2
            className={cn(
              "font-heading tracking-tight",
              embedded
                ? "text-sm font-semibold sm:text-base"
                : "text-h4 font-medium sm:text-h3",
            )}
          >
            {section.title}
          </h2>
          <div className={cn(embedded ? "mt-2 space-y-3" : "mt-4 space-y-4")}>
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={cn(
                  "text-sm text-muted-foreground text-pretty",
                  !embedded && "sm:text-base",
                )}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
