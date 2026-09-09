import type { Metadata } from "next"

import { termsOfService } from "@/components/legal/content"
import { LegalDocumentView } from "@/components/legal/legal-document"
import { MarketingContentPage } from "@/components/landing/marketing-content-page"

export const metadata: Metadata = {
  title: "Terms of Service — AWN",
  description:
    "The rules for using AWN — a private, vetted network for touring professionals.",
}

export default function TermsPage() {
  return (
    <MarketingContentPage
      title={termsOfService.title}
      subtitle={termsOfService.subtitle}
    >
      <LegalDocumentView document={termsOfService} />
    </MarketingContentPage>
  )
}
