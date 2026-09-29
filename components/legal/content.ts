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
  lastUpdated: "October 1, 2026",
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      paragraphs: [
        "A Wright Network LLC (\"AWN,\" \"we,\" \"us,\" or \"our\") respects your privacy.",
        "This Privacy Policy explains how we collect, use, disclose, retain, and protect information when you use the A Wright Network website, applications, member network, messaging features, job postings, profiles, community spaces, and related services.",
        "By using AWN, you acknowledge the practices described in this Privacy Policy.",
      ],
    },
    {
      id: "information-we-collect",
      title: "1. Information We Collect",
      paragraphs: [
        "We may collect information you provide directly to us, including:",
        "Name, email address, phone number, profile photograph, professional title, professional discipline, location, professional history, professional credits, skills, availability, employment information, references and recommendations, job application information, messages and communications, community posts and comments, information contained in job postings, and information you provide when contacting AWN.",
        "We may also collect information automatically when you use the Services, including IP address, device information, browser type, operating system, pages viewed, actions taken, dates and times of access, and similar technical information.",
      ],
    },
    {
      id: "how-we-use-information",
      title: "2. How We Use Information",
      paragraphs: [
        "We may use information to create and maintain your account, review membership applications, verify members, operate the AWN network, display professional profiles, facilitate communication between members, facilitate job postings and applications, operate community features, respond to requests, provide customer support, maintain security, prevent fraud and abuse, moderate the network, improve the Services, communicate with you, comply with legal obligations, and protect the rights and safety of AWN and its members.",
      ],
    },
    {
      id: "profile-information",
      title: "3. Profile Information",
      paragraphs: [
        "Information you choose to include in your professional profile may be visible to other approved AWN members.",
        "You should carefully consider what information you choose to make available through your profile.",
      ],
    },
    {
      id: "messages",
      title: "4. Messages",
      paragraphs: [
        "Messages sent through AWN are intended to facilitate private communication between members.",
        "AWN does not use private messages as public community content.",
        "However, AWN may access or preserve messages when reasonably necessary for security, abuse prevention, legal compliance, investigation of violations, or protection of AWN and its members.",
      ],
    },
    {
      id: "community-content",
      title: "5. Community Content",
      paragraphs: [
        "Content posted in open community areas may be visible to members who have access to those areas.",
        "You should not post information that you intend to remain completely confidential.",
      ],
    },
    {
      id: "job-information",
      title: "6. Job Information",
      paragraphs: [
        "Information submitted in connection with a job posting or application may be shared with the applicable employer, hiring party, or other users as necessary to facilitate the opportunity.",
        "AWN does not control how another party uses information after receiving it.",
      ],
    },
    {
      id: "how-we-share-information",
      title: "7. How We Share Information",
      paragraphs: [
        "We may share information with other members when necessary to provide the Services, with employers or hiring parties when necessary to facilitate job opportunities, with service providers that help operate AWN, with professional advisors, when required by law, when necessary to protect rights, safety, security, or property, and in connection with a merger, acquisition, financing, restructuring, sale of assets, or similar transaction.",
        "We do not sell private member profiles or private messages as a standalone data product.",
      ],
    },
    {
      id: "service-providers",
      title: "8. Service Providers",
      paragraphs: [
        "AWN may use third-party service providers for hosting, authentication, analytics, communications, payments, security, storage, customer support, and other operational functions.",
        "Those providers may process information on AWN's behalf.",
      ],
    },
    {
      id: "cookies-and-technologies",
      title: "9. Cookies and Technologies",
      paragraphs: [
        "AWN may use cookies, pixels, analytics tools, local storage, and similar technologies to operate and improve the Services.",
        "You may be able to control certain technologies through your browser or device settings.",
      ],
    },
    {
      id: "data-retention",
      title: "10. Data Retention",
      paragraphs: [
        "We retain information for as long as reasonably necessary to provide the Services, maintain legitimate business records, comply with legal obligations, resolve disputes, enforce agreements, prevent fraud, maintain security, and fulfill other legitimate purposes.",
      ],
    },
    {
      id: "security",
      title: "11. Security",
      paragraphs: [
        "AWN uses reasonable administrative, technical, and organizational measures designed to protect information.",
        "However, no system can be guaranteed to be completely secure.",
      ],
    },
    {
      id: "your-rights",
      title: "12. Your Rights",
      paragraphs: [
        "Depending on where you live and applicable law, you may have rights concerning your personal information, including rights to request access, correction, deletion, portability, or information about how your information is used or disclosed.",
        "California residents may have additional rights under applicable California privacy laws.",
        "To submit a privacy request, contact: privacy@awrightnetwork.com",
        "AWN may need to verify your identity before completing certain requests.",
      ],
    },
    {
      id: "california-privacy-rights",
      title: "13. California Privacy Rights",
      paragraphs: [
        "If California privacy law applies to you, you may have additional rights regarding personal information, including rights to know, access, correct, delete, and obtain information regarding certain disclosures or uses of personal information.",
        "You will not be discriminated against for exercising privacy rights provided by applicable law.",
      ],
    },
    {
      id: "children",
      title: "14. Children",
      paragraphs: [
        "AWN is intended for adults.",
        "You must be at least 18 years old to use the Services.",
        "AWN does not knowingly collect personal information from children under 18.",
      ],
    },
    {
      id: "international-users",
      title: "15. International Users",
      paragraphs: [
        "If you access AWN from outside the United States, your information may be transferred to and processed in the United States or other locations where AWN or its service providers operate.",
      ],
    },
    {
      id: "changes",
      title: "16. Changes to This Policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time.",
        "When material changes are made, we may provide notice through the Services or another reasonable method.",
      ],
    },
    {
      id: "contact",
      title: "17. Contact",
      paragraphs: [
        "A Wright Network LLC",
        "[LEGAL ADDRESS]",
        "Privacy inquiries: privacy@awrightnetwork.com",
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
        "Members and approved businesses may post employment, freelance, contract, live event, production, or other professional opportunities through AWN.",
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

export const communityGuidelines: LegalDocument = {
  title: "Community Guidelines",
  subtitle: "The network works because people trust it. Protect that.",
  lastUpdated: "October 1, 2026",
  sections: [
    {
      id: "be-a-real-person",
      title: "Be a Real Person",
      paragraphs: [
        "Use your real identity and represent your experience honestly.",
      ],
    },
    {
      id: "no-contact-farming",
      title: "No Contact Farming",
      paragraphs: [
        "Do not collect, scrape, export, sell, or harvest member information.",
      ],
    },
    {
      id: "no-screenshots",
      title: "No Screenshots",
      paragraphs: [
        "Do not screenshot, record, copy, or redistribute private member conversations or information.",
      ],
    },
    {
      id: "no-spam",
      title: "No Spam",
      paragraphs: [
        "Do not mass message members, flood the community, or use AWN for unsolicited promotion.",
      ],
    },
    {
      id: "no-harassment",
      title: "No Harassment",
      paragraphs: [
        "Treat people with respect.",
        "No threats, stalking, intimidation, discrimination, or abuse.",
      ],
    },
    {
      id: "no-fake-credits",
      title: "No Fake Credits",
      paragraphs: [
        "Your reputation matters here. Keep your credits, experience, recommendations, and professional information accurate.",
      ],
    },
    {
      id: "keep-private-things-private",
      title: "Keep Private Things Private",
      paragraphs: [
        "AWN is a private network. Respect information shared by other members.",
      ],
    },
    {
      id: "use-common-sense",
      title: "Use Common Sense",
      paragraphs: [
        "Not every member, job, recommendation, or opportunity will be right for you. Do your own due diligence.",
      ],
    },
    {
      id: "help-the-community",
      title: "Help the Community",
      paragraphs: [
        "AWN works when members contribute.",
        "Share information. Answer questions. Make introductions. Help when you can.",
      ],
    },
    {
      id: "report-problems",
      title: "Report Problems",
      paragraphs: [
        "If something feels wrong, report it to AWN.",
        "We may remove content, restrict access, suspend accounts, or terminate membership when necessary to protect the community.",
      ],
    },
    {
      id: "the-standard",
      title: "The Standard",
      paragraphs: [
        "Be useful.",
        "Be respectful.",
        "Be honest.",
        "Protect the people in the room.",
      ],
    },
  ],
}

export const jobPostingPolicy: LegalDocument = {
  title: "Job Posting Policy",
  subtitle: "Rules for posting jobs and opportunities on AWN.",
  lastUpdated: "October 1, 2026",
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      paragraphs: [
        "AWN exists to help the right people find the right opportunities.",
        "If you post a job, you are responsible for making sure the opportunity is legitimate, accurate, and appropriate.",
      ],
    },
    {
      id: "job-posters-must",
      title: "Job Posters Must",
      paragraphs: [
        "Provide accurate job information.",
        "Clearly describe the role.",
        "Provide accurate dates and location.",
        "State compensation when appropriate and required.",
        "Identify relevant travel requirements.",
        "Provide accurate application instructions.",
        "Represent employment or contractor status accurately.",
        "Comply with applicable employment laws.",
        "Respond professionally to applicants.",
      ],
    },
    {
      id: "do-not-post",
      title: "Do Not Post",
      paragraphs: [
        "Fake jobs.",
        "Misleading opportunities.",
        "Discriminatory opportunities.",
        "Spam.",
        "Recruiting schemes.",
        "Multi-level marketing opportunities.",
        "Opportunities designed to collect personal information.",
        "Jobs that violate applicable law.",
      ],
    },
    {
      id: "content-farming",
      title: "Content Farming",
      paragraphs: [
        "Do not use AWN job postings to collect resumes, contact information, or member data for purposes unrelated to the posted opportunity.",
        "AWN may remove a posting or restrict a poster's access if we believe a posting violates this policy.",
      ],
    },
    {
      id: "awn-does-not-guarantee",
      title: "AWN Does Not Guarantee",
      paragraphs: [
        "That a job is legitimate.",
        "That a job will remain available.",
        "That an employer will hire anyone.",
        "That an applicant is qualified.",
        "That compensation will be paid.",
        "That either party will perform its obligations.",
        "AWN is a platform connecting people. The employment or business relationship is between the parties involved.",
      ],
    },
  ],
}
