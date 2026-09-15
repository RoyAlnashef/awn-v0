import type { Metadata } from "next"

import { communityGuidelines } from "@/components/legal/content"
import { LegalDocumentView } from "@/components/legal/legal-document"
import { MarketingContentPage } from "@/components/landing/marketing-content-page"

export const metadata: Metadata = {
  title: "Community Guidelines — AWN",
  description:
    "Rules for respectful, honest, and trustworthy participation on AWN.",
}

export default function CommunityGuidelinesPage() {
  return (
    <MarketingContentPage
      title={communityGuidelines.title}
      subtitle={communityGuidelines.subtitle}
    >
      <LegalDocumentView document={communityGuidelines} />
    </MarketingContentPage>
  )
}
