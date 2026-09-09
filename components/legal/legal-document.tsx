import type { LegalDocument } from "@/components/legal/content"

type LegalDocumentProps = {
  document: LegalDocument
}

export function LegalDocumentView({ document }: LegalDocumentProps) {
  return (
    <div className="space-y-10">
      <p className="text-xs text-muted-foreground">
        Last updated {document.lastUpdated}
      </p>

      {document.sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-24">
          <h2 className="font-heading text-h4 font-medium tracking-tight sm:text-h3">
            {section.title}
          </h2>
          <div className="mt-4 space-y-4">
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-sm text-muted-foreground text-pretty sm:text-base"
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
