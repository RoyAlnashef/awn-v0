import type { Metadata } from "next"

import { faqContent } from "@/components/legal/faq-content"
import { FaqList } from "@/components/legal/faq-list"
import { MarketingContentPage } from "@/components/landing/marketing-content-page"

export const metadata: Metadata = {
  title: "FAQs — AWN",
  description:
    "Common questions about AWN — the private network for touring professionals.",
}

export default function FaqsPage() {
  return (
    <MarketingContentPage title={faqContent.title} subtitle={faqContent.subtitle}>
      <FaqList items={faqContent.items} />
    </MarketingContentPage>
  )
}
