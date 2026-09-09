export type LandingFeatureIcon =
  | "radio"
  | "users"
  | "book-text"
  | "shield-check"

export type LandingFeature = {
  icon: LandingFeatureIcon
  title: string
  description: string
}

export type LandingNavLink = {
  label: string
  href: string
}

export const landingContent = {
  brand: "awn.",
  navLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "FAQs", href: "/faqs" },
  ] satisfies LandingNavLink[],
  header: {
    signIn: "Sign in",
  },
  hero: {
    title: "The private network for touring professionals.",
    subtitle:
      "By invitation only. Every member is vetted by hand. If you don't have a code, you're not in — yet.",
    primaryCta: "Request access",
    secondaryCta: "Sign in",
    tagline: "Not open to the public",
  },
  features: [
    {
      icon: "radio",
      title: "Now",
      description:
        "The live pulse. Who's on the road, who's between tours, who needs crew today. Not a directory — a room that's always moving.",
    },
    {
      icon: "users",
      title: "People",
      description:
        "Every vetted member. Tour managers, production managers, engineers, backline, wardrobe, drivers, and every discipline in between. If you work behind the show, you belong here.",
    },
    {
      icon: "book-text",
      title: "Intel",
      description:
        "The collective knowledge of the road. Trusted vendors and honest reviews from people who've actually worked them — the intel that used to live in someone else's phone.",
    },
    {
      icon: "shield-check",
      title: "Trust",
      description:
        "Reputation is everything on tour. Peer-verified credits, private messaging, and a network where what you've done speaks for itself.",
    },
  ] satisfies LandingFeature[],
  operate: {
    eyebrow: "How we operate",
    title: "The road has its own rules.",
    body: "No screenshots. No farming contacts. No badmouthing. What happens here stays here — and that's exactly why people talk freely.",
    bullets: [
      ["Vetted by hand", "Not an open directory", "People-first"],
      ["Privacy-driven", "No recruiters/farming", "Community-governed"],
    ],
  },
  cta: {
    title: "If you belong here, you already know it.",
    subtitle: "Every applicant vetted personally.",
    button: "Request access",
    memberPrompt: "Already a member?",
    memberLink: "Sign in",
  },
  footer: {
    copyright: "© 2024 A Wright Network LLC",
    legal: "All rights reserved · Private — by invitation",
    email: "info@awrightnetwork.com",
  },
} as const
