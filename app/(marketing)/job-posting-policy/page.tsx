import type { Metadata } from "next"

import { jobPostingPolicy } from "@/components/legal/content"
import { LegalDocumentView } from "@/components/legal/legal-document"
import { MarketingContentPage } from "@/components/landing/marketing-content-page"

export const metadata: Metadata = {
  title: "Job Posting Policy — AWN",
  description:
    "Requirements and restrictions for posting jobs and opportunities on AWN.",
}

export default function JobPostingPolicyPage() {
  return (
    <MarketingContentPage
      title={jobPostingPolicy.title}
      subtitle={jobPostingPolicy.subtitle}
    >
      <LegalDocumentView document={jobPostingPolicy} />
    </MarketingContentPage>
  )
}
