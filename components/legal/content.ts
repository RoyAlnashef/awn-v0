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
    "The terms governing your access to and use of AWN — a private professional network for live entertainment.",
  lastUpdated: "October 1, 2026",
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      paragraphs: [
        "Welcome to A Wright Network.",
        "These Terms of Service (\"Terms\") govern your access to and use of the A Wright Network website, applications, services, member network, messaging features, job postings, profiles, community spaces, and related services (collectively, the \"Services\") operated by A Wright Network LLC (\"AWN,\" \"we,\" \"us,\" or \"our\").",
        "By creating an account, requesting access to the Services, accepting an invitation, or otherwise accessing or using the Services, you agree to these Terms and our Privacy Policy.",
        "If you do not agree to these Terms, you may not access or use the Services.",
      ],
    },
    {
      id: "what-awn-is",
      title: "1. What AWN Is",
      paragraphs: [
        "AWN is a private professional network designed to connect people working in and around live entertainment.",
        "AWN may provide members with access to professional profiles, member search and discovery, job postings and employment opportunities, direct messaging, community discussions and communications, member generated content, professional recommendations and references, resources, and other services introduced by AWN from time to time.",
        "AWN is a network and technology platform.",
        "AWN is not an employer, staffing agency, talent agency, employment agency, labor union, payroll provider, or party to any employment, freelance, contractor, booking, or other relationship formed between users.",
        "AWN does not guarantee that any member will obtain employment, work, bookings, clients, income, introductions, or other opportunities through the Services.",
      ],
    },
    {
      id: "private-membership",
      title: "2. Private Membership",
      paragraphs: [
        "AWN is a private network.",
        "Membership is not guaranteed.",
        "AWN may review applications, invitations, profiles, professional information, references, or other information before granting access.",
        "AWN may accept, reject, suspend, restrict, or terminate an application or membership at its discretion, subject to applicable law.",
        "Membership does not create an employment, agency, partnership, fiduciary, or other legal relationship between you and AWN.",
        "You may not represent yourself as an employee, agent, representative, partner, or authorized spokesperson of AWN unless expressly authorized in writing.",
      ],
    },
    {
      id: "eligibility",
      title: "3. Eligibility",
      paragraphs: [
        "You must be at least 18 years old to use AWN.",
        "You must provide accurate information when applying for or maintaining membership.",
        "You may not create an account using another person's identity or credentials.",
        "You may not create multiple accounts without AWN's permission.",
        "AWN may request information reasonably necessary to verify your identity, professional background, or eligibility for membership.",
      ],
    },
    {
      id: "your-account",
      title: "4. Your Account",
      paragraphs: [
        "You are responsible for maintaining the confidentiality of your account credentials and for activity occurring through your account.",
        "You agree to immediately notify AWN if you believe your account has been compromised or accessed without authorization.",
        "You may not share your account with another person, sell or transfer your membership, allow another person to use your account, create an account for another person without authorization, or impersonate another member or person.",
        "AWN may suspend or restrict accounts that present security, fraud, safety, authenticity, or community concerns.",
      ],
    },
    {
      id: "your-profile",
      title: "5. Your Profile",
      paragraphs: [
        "Members may create professional profiles containing information such as name, profile photograph, professional title, industry discipline, location, professional experience, credits, skills, availability, professional information, external professional links, recommendations, references, and other information the member chooses to provide.",
        "You are responsible for the accuracy and legality of information you provide.",
        "You represent that you have the right to provide any information, photograph, logo, credit, biography, or other material that you upload.",
        "You may not knowingly misrepresent your professional experience, credits, qualifications, employment history, identity, or relationships.",
        "AWN may remove or restrict information that it reasonably believes is inaccurate, misleading, unlawful, unsafe, or inconsistent with the purpose of the network.",
      ],
    },
    {
      id: "profile-photographs",
      title: "6. Profile Photographs",
      paragraphs: [
        "If you upload a photograph or other image, you represent that you own the photograph or have permission to use it and that your use of the photograph does not violate another person's rights.",
        "You retain ownership of photographs and other content you upload, subject to the license granted to AWN under these Terms.",
        "AWN may remove profile photographs or other images that violate these Terms or create legal, safety, authenticity, or community concerns.",
      ],
    },
    {
      id: "user-content",
      title: "7. User Content",
      paragraphs: [
        "You retain ownership of content that you submit to AWN, including photographs, profile information, messages, posts, comments, job postings, recommendations, and other material (\"User Content\").",
        "You grant AWN a non-exclusive, worldwide, royalty-free license to host, store, reproduce, display, transmit, format, and otherwise use your User Content solely as reasonably necessary to operate, maintain, secure, improve, and provide the Services.",
        "This license does not transfer ownership of your User Content to AWN.",
        "AWN will not sell your private messages or private profile information as a standalone data product.",
        "Your User Content may remain on AWN's systems as reasonably necessary for legal, security, backup, dispute resolution, fraud prevention, or operational purposes after you deactivate your account.",
        "Our collection and use of personal information is governed by our Privacy Policy.",
      ],
    },
    {
      id: "privacy-and-private-content",
      title: "8. Privacy and Private Content",
      paragraphs: [
        "AWN is a private network, but you understand that information shared within AWN may be viewed by other members.",
        "AWN cannot guarantee that another member will not copy, photograph, screenshot, record, reproduce, disclose, or otherwise distribute information shared through the Services.",
        "Members are prohibited from doing so where prohibited by these Terms or AWN's Community Guidelines.",
        "Do not share information through AWN that you would not want another person to possess.",
        "AWN may access, preserve, review, or disclose information when reasonably necessary to protect members or the public, investigate violations of these Terms, respond to legal process, prevent fraud or abuse, protect AWN's systems, investigate security incidents, or comply with applicable law.",
      ],
    },
    {
      id: "messaging",
      title: "9. Messaging",
      paragraphs: [
        "AWN may provide private messaging between members.",
        "You are responsible for your communications with other members.",
        "You may not use messaging to harass or threaten another person, spam members, mass contact members, harvest contacts, solicit members without appropriate context or permission, scrape or export member information, distribute malicious material, send fraudulent or deceptive communications, engage in unlawful activity, or circumvent AWN's privacy or access controls.",
        "You may not use AWN messaging primarily as a mechanism to collect member contact information for unauthorized use outside the network.",
        "AWN may restrict messaging privileges or suspend accounts that abuse messaging.",
      ],
    },
    {
      id: "no-contact-farming",
      title: "10. No Contact Farming",
      paragraphs: [
        "You may not use AWN to systematically collect, copy, export, scrape, sell, trade, or compile member names, contact information, profiles, photographs, employment information, or other member data for external recruiting, solicitation, marketing, lead generation, database building, or other commercial purposes without AWN's authorization.",
        "You may not use automated tools, bots, crawlers, scripts, scraping software, or similar technology to collect information from AWN.",
        "You may not create fake accounts or use deceptive methods to gain access to member information.",
        "AWN may immediately suspend or terminate accounts involved in contact farming, scraping, data harvesting, or similar conduct.",
      ],
    },
    {
      id: "job-postings",
      title: "11. Job Postings",
      paragraphs: [
        "Members and approved businesses may post employment, freelance, contract, touring, production, or other professional opportunities through AWN.",
        "Job posters are solely responsible for the accuracy of their postings, including job descriptions, compensation, dates, locations, travel requirements, employment or contractor status, qualifications, application instructions, and other material terms.",
        "AWN does not guarantee that a job posting is legitimate, available, accurate, lawful, or suitable for any particular member.",
        "AWN does not guarantee that an employer will hire an applicant or that an applicant will perform satisfactorily.",
        "Job posters are responsible for complying with applicable employment, labor, tax, immigration, discrimination, wage, and other laws.",
        "AWN may remove job postings that are fraudulent, misleading, discriminatory, unlawful, spammy, incomplete, or inconsistent with AWN policies.",
      ],
    },
    {
      id: "awn-is-not-the-employer",
      title: "12. AWN Is Not the Employer",
      paragraphs: [
        "Unless expressly stated in a separate written agreement, AWN is not the employer of any person hired, booked, engaged, referred, introduced, or connected through the Services.",
        "Any employment, freelance, contractor, booking, or business relationship is directly between the parties involved.",
        "You are responsible for evaluating the people and opportunities you interact with through AWN.",
      ],
    },
    {
      id: "open-community",
      title: "13. Open Community",
      paragraphs: [
        "AWN may provide community areas where members can post discussions, questions, requests, information, recommendations, opportunities, photographs, comments, or other content.",
        "These spaces are intended for professional and community use.",
        "You agree to communicate respectfully and professionally.",
        "You may not post harassment, threats, hate speech, doxxing, knowingly false information, fraudulent information, non-consensual intimate material, malware, copyright-infringing material, spam, recruitment spam, misleading job postings, content intended to manipulate or exploit members, content that creates a safety risk, or content that violates applicable law.",
        "AWN may remove content or restrict participation when reasonably necessary to protect the network.",
      ],
    },
    {
      id: "reputation-references-and-reviews",
      title: "14. Reputation, References and Reviews",
      paragraphs: [
        "Where AWN provides recommendations, references, credits, reviews, ratings, endorsements, or other reputation features, members must provide information based on genuine experience.",
        "Members may not manufacture, purchase, manipulate, coordinate, or otherwise falsify reputation information.",
        "AWN may investigate and remove information that appears fraudulent or materially misleading.",
      ],
    },
    {
      id: "prohibited-uses",
      title: "15. Prohibited Uses",
      paragraphs: [
        "You may not use AWN to break the law, commit fraud, impersonate another person, harass or threaten another person, stalk another member, collect member information without authorization, scrape the Services, circumvent access controls, sell or transfer membership, spam members, distribute malicious software, infringe intellectual property rights, publish knowingly false information, engage in unlawful discriminatory conduct, exploit minors, conduct unauthorized commercial solicitation, interfere with the operation of AWN, attempt to gain unauthorized access to accounts or systems, or use AWN for purposes inconsistent with its intended professional and community use.",
      ],
    },
    {
      id: "safety-and-real-world-interactions",
      title: "16. Safety and Real World Interactions",
      paragraphs: [
        "AWN facilitates connections between people.",
        "AWN does not control what happens between members outside the Services.",
        "You are responsible for exercising reasonable judgment when communicating with or meeting another member.",
        "AWN does not guarantee the identity, qualifications, conduct, reliability, safety, criminal history, employment history, or professional performance of every member.",
        "Verification, vetting, references, or other indicators provided by AWN should not be treated as a guarantee of a person's character, safety, qualifications, or performance.",
      ],
    },
    {
      id: "moderation-and-enforcement",
      title: "17. Moderation and Enforcement",
      paragraphs: [
        "AWN may investigate suspected violations of these Terms or Community Guidelines.",
        "Depending on the circumstances, AWN may remove content, restrict content visibility, restrict messaging, restrict job posting privileges, suspend an account, terminate membership, deny an application, preserve information, or refer matters to appropriate authorities.",
        "AWN does not have an obligation to monitor every communication or piece of content posted through the Services.",
      ],
    },
    {
      id: "termination",
      title: "18. Termination",
      paragraphs: [
        "You may stop using AWN at any time.",
        "AWN may suspend or terminate your access if we reasonably believe that you violated these Terms, violated Community Guidelines, created a safety or security risk, engaged in fraud or abuse, misrepresented your identity or professional information, misused member information, used the Services unlawfully, or harmed the integrity of the network.",
        "Certain provisions survive termination, including provisions concerning intellectual property, User Content licenses, privacy, disclaimers, limitations of liability, indemnification, dispute resolution, and other provisions that by their nature should survive.",
      ],
    },
    {
      id: "intellectual-property",
      title: "19. Intellectual Property",
      paragraphs: [
        "The AWN name, trademarks, logos, visual identity, software, website, design, interfaces, text, graphics, databases, systems, and other AWN-owned materials are owned by or licensed to AWN and are protected by applicable intellectual property laws.",
        "Except as expressly permitted, you may not copy, reproduce, modify, distribute, sell, license, reverse engineer, scrape, or create derivative works from AWN's proprietary materials.",
        "Your use of AWN does not grant you ownership of AWN's intellectual property.",
      ],
    },
    {
      id: "copyright-and-dmca",
      title: "20. Copyright and DMCA",
      paragraphs: [
        "Users may not upload or distribute material that infringes another person's copyright.",
        "AWN maintains procedures for receiving copyright infringement notices and responding to qualifying claims in accordance with applicable law.",
        "Copyright complaints may be directed to:",
        "[DMCA AGENT NAME]",
        "[DMCA EMAIL]",
        "[DMCA ADDRESS]",
      ],
    },
    {
      id: "disclaimers",
      title: "21. Disclaimers",
      paragraphs: [
        "TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICES ARE PROVIDED ON AN \"AS IS\" AND \"AS AVAILABLE\" BASIS.",
        "AWN DOES NOT GUARANTEE THAT THE SERVICES WILL ALWAYS BE AVAILABLE, ERROR-FREE, SECURE, OR UNINTERRUPTED.",
        "AWN DOES NOT GUARANTEE EMPLOYMENT, JOB PLACEMENT, HIRING, INCOME, PROFESSIONAL OPPORTUNITIES, MEMBER ACCURACY, MEMBER CONDUCT, MEMBER AVAILABILITY, EMPLOYER PERFORMANCE, CONTRACTOR PERFORMANCE, SAFETY OF INTERACTIONS, ACCURACY OF JOB POSTINGS, OR RESULTS FROM USING THE SERVICES.",
      ],
    },
    {
      id: "third-party-relationships",
      title: "22. Third Party Relationships",
      paragraphs: [
        "AWN may contain links to third-party websites, services, vendors, employers, venues, businesses, or other resources.",
        "AWN is not responsible for third-party services or content.",
        "Your relationship with a third party is governed by that third party's terms and policies.",
      ],
    },
    {
      id: "limitation-of-liability",
      title: "23. Limitation of Liability",
      paragraphs: [
        "TO THE MAXIMUM EXTENT PERMITTED BY LAW, AWN AND ITS MEMBERS, MANAGERS, OFFICERS, EMPLOYEES, CONTRACTORS, AFFILIATES, AND SERVICE PROVIDERS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING FROM OR RELATED TO YOUR USE OF THE SERVICES.",
        "TO THE MAXIMUM EXTENT PERMITTED BY LAW, AWN'S TOTAL LIABILITY ARISING OUT OF OR RELATED TO THE SERVICES WILL BE LIMITED TO THE GREATER OF THE AMOUNT YOU PAID TO AWN FOR THE SERVICES DURING THE TWELVE MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM OR ONE HUNDRED U.S. DOLLARS ($100).",
        "Some jurisdictions do not allow certain limitations, so portions of this section may not apply to you.",
      ],
    },
    {
      id: "indemnification",
      title: "24. Indemnification",
      paragraphs: [
        "To the maximum extent permitted by law, you agree to defend, indemnify, and hold harmless AWN and its officers, directors, employees, contractors, affiliates, and agents from claims, liabilities, damages, losses, costs, and expenses, including reasonable attorneys' fees, arising from your violation of these Terms, your User Content, your use or misuse of the Services, your violation of another person's rights, your interactions or transactions with other members, or your violation of applicable law.",
      ],
    },
    {
      id: "dispute-resolution",
      title: "25. Dispute Resolution",
      paragraphs: [
        "[ATTORNEY TO FINALIZE GOVERNING LAW, VENUE, ARBITRATION, CLASS ACTION WAIVER, JURY WAIVER, AND RELATED PROVISIONS.]",
      ],
    },
    {
      id: "changes",
      title: "26. Changes to These Terms",
      paragraphs: [
        "AWN may update these Terms from time to time.",
        "When material changes are made, AWN may provide notice through the Services, email, or another reasonable method.",
        "Your continued use of the Services after the effective date of updated Terms constitutes acceptance of the updated Terms to the extent permitted by law.",
      ],
    },
    {
      id: "privacy",
      title: "27. Privacy",
      paragraphs: [
        "Your use of the Services is also governed by the AWN Privacy Policy.",
        "The Privacy Policy explains what personal information AWN collects, how it is used, disclosed, retained, and protected, and what privacy rights may apply to you.",
      ],
    },
    {
      id: "contact",
      title: "28. Contact",
      paragraphs: [
        "A Wright Network LLC",
        "[LEGAL ADDRESS]",
        "Email: info@awrightnetwork.com",
      ],
    },
  ],
}
