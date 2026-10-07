import type { Metadata } from "next"

import { privacyPolicy } from "@/components/legal/content"
import { LegalDocumentView } from "@/components/legal/legal-document"
import { MarketingContentPage } from "@/components/landing/marketing-content-page"

export const metadata: Metadata = {
  title: "Privacy Policy — AWN",
  description:
    "How A Wright World LLC, doing business as A Wright Network (AWN), collects, uses, and protects your information on AWN.",
}

export default function PrivacyPage() {
  return (
    <MarketingContentPage
      title={privacyPolicy.title}
      subtitle={privacyPolicy.subtitle}
    >
      <LegalDocumentView document={privacyPolicy} />
    </MarketingContentPage>
  )
}
