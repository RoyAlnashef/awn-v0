export type LandingNavLink = {
  label: string
  href: string
}

export const landingContent = {
  brand: "awn.",
  navLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Community", href: "/community-guidelines" },
    { label: "Job Posting", href: "/job-posting-policy" },
    { label: "FAQs", href: "/faqs" },
  ] satisfies LandingNavLink[],
  header: {
    signIn: "Sign in",
  },
  hero: {
    title: "The private network for the people behind live entertainment.",
    subtitle: "By invitation only — every member is vetted by hand.",
    primaryCta: "Request access",
    tagline: "Not open to the public",
  },
  footer: {
    copyright: "© 2026 A Wright Network LLC",
    legal: "Private, by invitation only.",
  },
} as const
