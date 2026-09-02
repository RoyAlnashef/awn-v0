export type FaqItem = {
  id: string
  question: string
  answer: string
}

export const faqContent = {
  title: "FAQs",
  subtitle: "Common questions about AWN — the private network for touring professionals.",
  items: [
    {
      id: "what-is-awn",
      question: "What is AWN?",
      answer:
        "AWN (A Wright Network) is a private, invitation-only network for touring and live-event professionals. It is not a public directory — it is a vetted community where tour managers, production managers, engineers, backline, wardrobe, drivers, and every discipline behind the show can connect, find work, and share trusted intel.",
    },
    {
      id: "who-is-it-for",
      question: "Who is AWN for?",
      answer:
        "AWN is for people who work behind the show — touring crew, production staff, and related live-event professionals. If you live on the road and your reputation is built on what you've done, you likely belong here. AWN is not open to recruiters, staffing agencies, or the general public.",
    },
    {
      id: "how-to-join",
      question: "How do I join?",
      answer:
        "Membership is by invitation. If you have an invite code from an existing member, you can apply directly. If you don't have a code, you can request access from the landing page — every applicant is reviewed by hand. Approval is not guaranteed, and having a code does not bypass our vetting process.",
    },
    {
      id: "vetting-process",
      question: "What does the vetting process involve?",
      answer:
        "Every application is reviewed personally. We look at your professional background, reason for joining, and fit with the community. The goal is to keep AWN a trusted space — not an open directory. Review typically takes up to 48 hours, though timing may vary.",
    },
    {
      id: "pending-approval",
      question: "What happens while my application is pending?",
      answer:
        "If you create an account before approval, you can sign in but will see a pending status screen. You won't have access to the main network features until your application is approved. You can check your status or sign out at any time from that screen.",
    },
    {
      id: "privacy-rules",
      question: "What are AWN's privacy and confidentiality rules?",
      answer:
        "AWN is privacy-driven by design. Member profiles and conversations are not publicly searchable. Members are expected not to screenshot, export, or share network content outside AWN without consent. No contact farming, no recruiters, no badmouthing — what happens here stays here.",
    },
    {
      id: "cost",
      question: "Is AWN free?",
      answer:
        "AWN membership details, including any fees, are communicated during the application and approval process. If you have questions about pricing, contact us at info@awrightnetwork.com.",
    },
    {
      id: "support",
      question: "How do I get help or contact support?",
      answer:
        "Email us at info@awrightnetwork.com for application questions, account issues, or general support. Approved members can also use in-app support features where available.",
    },
  ] satisfies FaqItem[],
} as const
