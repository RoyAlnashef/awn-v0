import type { Metadata } from "next"

import { faqContent } from "@/components/legal/faq-content"
import { FaqList } from "@/components/legal/faq-list"
import { MarketingContentPage } from "@/components/landing/marketing-content-page"

export const metadata: Metadata = {
  title: "FAQs — AWN",
  description:
    "Common questions about AWN — the private professional community for entertainment.",
}

export default function FaqsPage() {
  return (
    <MarketingContentPage title={faqContent.title} subtitle={faqContent.subtitle}>
      <FaqList items={faqContent.items} />
      <footer className="mt-16 border-t border-border/50 pt-12 text-center">
        <p className="font-heading text-lg font-medium text-balance sm:text-xl">
          {faqContent.closing.headline}
        </p>
        <p className="mt-3 font-heading text-base font-medium">
          {faqContent.closing.subline}
        </p>
      </footer>
    </MarketingContentPage>
  )
}
