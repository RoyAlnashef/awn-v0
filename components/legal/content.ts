export type LegalSection = {
  id: string
  title: string
  paragraphs: string[]
}

export type LegalDocument = {
  title: string
  subtitle: string
  lastUpdated: string
  sections: LegalSection[]
}

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  subtitle:
    "How A Wright Network LLC collects, uses, and protects your information on AWN.",
  lastUpdated: "September 2, 2026",
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      paragraphs: [
        "A Wright Network LLC (\"AWN,\" \"we,\" \"us,\" or \"our\") operates a private, invitation-only network for touring professionals. This Privacy Policy explains what information we collect, how we use it, and the choices you have.",
        "AWN is not a public directory. Membership is vetted by hand, and we treat member information with the same discretion the road expects.",
      ],
    },
    {
      id: "information-we-collect",
      title: "Information we collect",
      paragraphs: [
        "Account information: name, email address, password (stored securely), and authentication credentials when you sign in.",
        "Application data: information you submit when requesting access or applying with an invite code, including your reason for joining and professional background.",
        "Profile information: bio, tour credits, work history, availability, photos, and other details you choose to add to your member profile.",
        "Usage data: how you interact with AWN features such as messages, rooms, jobs, and Help Now — including timestamps, device type, and general activity logs used to keep the network secure and functional.",
      ],
    },
    {
      id: "how-we-use-information",
      title: "How we use your information",
      paragraphs: [
        "We use your information to review and approve membership applications, operate network features, facilitate communication between vetted members, and maintain the integrity of the community.",
        "We may use aggregated or de-identified data to understand how AWN is used and to improve the service. We do not sell member data to recruiters, staffing agencies, or third-party marketing lists.",
        "We may send transactional emails related to your account, application status, security alerts, or important service updates.",
      ],
    },
    {
      id: "confidentiality",
      title: "Confidentiality expectations",
      paragraphs: [
        "AWN is a private network. Member profiles, messages, and community discussions are not publicly indexed or searchable outside the platform.",
        "Members are expected to respect the confidentiality of the network. Do not screenshot, export, or share member information outside AWN without consent. Community guidelines and Terms of Service apply.",
      ],
    },
    {
      id: "data-sharing",
      title: "Data sharing",
      paragraphs: [
        "We share information only as needed to operate AWN: with service providers who help us host, secure, and deliver the platform (under contractual obligations to protect your data), when required by law, or to protect the rights and safety of AWN and its members.",
        "We do not share member contact information with employers, recruiters, or external parties for lead generation or marketing purposes.",
      ],
    },
    {
      id: "retention-and-security",
      title: "Retention and security",
      paragraphs: [
        "We retain your information for as long as your account is active or as needed to provide the service, comply with legal obligations, resolve disputes, and enforce our policies.",
        "We use industry-standard measures to protect your data, including encryption in transit and access controls. No system is completely secure; please use a strong password and report suspected unauthorized access promptly.",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights",
      paragraphs: [
        "Depending on your location, you may have rights to access, correct, delete, or export your personal information, or to object to certain processing. Contact us to make a request.",
        "You may update much of your profile information directly in your account settings. You may also request account deletion by contacting us.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: [
        "Questions about this Privacy Policy or your data? Email us at info@awrightnetwork.com.",
      ],
    },
  ],
}

export const termsOfService: LegalDocument = {
  title: "Terms of Service",
  subtitle:
    "The rules for using AWN — a private, vetted network for touring professionals.",
  lastUpdated: "September 2, 2026",
  sections: [
    {
      id: "acceptance",
      title: "Acceptance",
      paragraphs: [
        "By accessing or using AWN (\"the Service\"), operated by A Wright Network LLC, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the Service.",
      ],
    },
    {
      id: "eligibility",
      title: "Eligibility",
      paragraphs: [
        "AWN is invitation-only. You must be at least 18 years old and a touring or live-event professional (or otherwise approved by AWN) to apply.",
        "Every member is vetted by hand. Approval is at AWN's sole discretion. Having an invite code or submitting an application does not guarantee membership.",
        "You are responsible for keeping your login credentials secure and for all activity under your account.",
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      paragraphs: [
        "AWN exists for vetted touring professionals to connect, collaborate, and share trusted intel. You agree to use the Service in good faith and in line with community standards.",
        "You may not: screenshot, scrape, or export member data for use outside AWN; farm contacts for recruiting, staffing, or solicitation; harass, defame, or badmouth other members or vendors; impersonate others or misrepresent your credits or experience; use AWN for spam, bulk outreach, or unauthorized commercial solicitation; attempt to bypass vetting, access controls, or security measures; or violate any applicable law.",
        "The road has its own rules. What happens here stays here — and that's exactly why people talk freely.",
      ],
    },
    {
      id: "account-actions",
      title: "Account suspension and termination",
      paragraphs: [
        "We may suspend or terminate your account at any time if you violate these Terms, community guidelines, or if your continued membership is not in the best interest of the network.",
        "You may stop using AWN at any time. Upon termination, your right to access the Service ends immediately, subject to any data retention described in our Privacy Policy.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      paragraphs: [
        "AWN and its branding, design, software, and content (excluding member-submitted content) are owned by A Wright Network LLC or its licensors. You may not copy, modify, or distribute them without permission.",
        "You retain ownership of content you submit. By posting on AWN, you grant us a limited license to host, display, and distribute that content as needed to operate the Service for members.",
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      paragraphs: [
        "AWN is provided \"as is\" without warranties of any kind. We do not guarantee uninterrupted access, job placements, or the accuracy of member-submitted information, reviews, or intel.",
        "Interactions between members — including hiring, messaging, and vendor recommendations — are between those parties. AWN is not responsible for disputes, employment outcomes, or third-party services.",
      ],
    },
    {
      id: "limitation-of-liability",
      title: "Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, A Wright Network LLC and its officers, employees, and affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of AWN.",
        "Our total liability for any claim related to the Service is limited to the amount you paid us in the twelve months before the claim, or one hundred U.S. dollars if you have not paid us, whichever is greater.",
      ],
    },
    {
      id: "changes",
      title: "Changes to these Terms",
      paragraphs: [
        "We may update these Terms from time to time. We will post the revised Terms on this page and update the \"Last updated\" date. Continued use of AWN after changes take effect constitutes acceptance of the updated Terms.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: [
        "Questions about these Terms? Email us at info@awrightnetwork.com.",
      ],
    },
  ],
}
