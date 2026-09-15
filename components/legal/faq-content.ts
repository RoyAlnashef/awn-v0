export type FaqItem = {
  id: string
  question: string
  answer: string
  bullets?: string[]
  outro?: string
}

export const faqContent = {
  title: "FAQs",
  subtitle:
    "Common questions about AWN — the private professional community for entertainment.",
  items: [
    {
      id: "what-is-awn",
      question: "What is AWN?",
      answer:
        "AWN is a private professional community created for the people who make entertainment happen. Our goal is to bring together trusted people across music, sports, film, television, and entertainment in one place to connect, share knowledge, find opportunities, and help one another.",
    },
    {
      id: "who-is-awn-for",
      question: "Who is AWN for?",
      answer:
        "AWN is for the people working behind and around the entertainment industry. Whether you're on the road, in production, in management, working behind the scenes, building a career, or simply looking for the right person or resource, AWN is designed to be a place where you can connect with people who understand the work.",
    },
    {
      id: "why-private",
      question: "Why is AWN private?",
      answer:
        "Because trust matters. Entertainment is a relationship-driven industry, and we wanted to create a space where people can connect in a professional environment built around respect, community, and trust.",
    },
    {
      id: "who-can-join",
      question: "Who can join?",
      answer:
        "AWN welcomes professionals from across the entertainment community. Membership is reviewed to help maintain the quality, integrity, and trust that make the network valuable to everyone inside it.",
    },
    {
      id: "cost",
      question: "Is there a cost to join?",
      answer:
        "Professional membership is currently free. We believe everyone should have access to a strong professional community and the opportunity to connect with people who can help them along the way.",
    },
    {
      id: "what-can-i-use",
      question: "What can I use AWN for?",
      answer: "AWN is a place to:",
      bullets: [
        "Find trusted people",
        "Build professional relationships",
        "Discover opportunities",
        "Ask questions",
        "Share knowledge",
        "Find resources",
        "Get help when you need it",
        "Stay connected with the people who understand your world",
      ],
      outro: "We're continuing to build AWN around the needs of the community.",
    },
    {
      id: "what-makes-different",
      question: "What makes AWN different?",
      answer:
        "AWN is built around a simple idea: No one should have to figure it all out alone. The entertainment industry can be incredibly rewarding, but it can also be complicated, fast-moving, and sometimes isolating. AWN is a place to find people who understand.",
    },
    {
      id: "what-if-question",
      question: "What if I have a question?",
      answer:
        "Ask it. There is no such thing as a dumb question. Whether you're new to the industry, experienced but facing something unfamiliar, or simply don't know who to call, AWN is here to help you find the people and resources you need.",
    },
    {
      id: "need-to-know-someone",
      question: "Do I need to know someone to join?",
      answer:
        "Not necessarily. You can request access directly through AWN. Membership is reviewed to help ensure the community remains a trusted and welcoming place for everyone.",
    },
    {
      id: "invite-someone",
      question: "Can I invite someone to AWN?",
      answer:
        "Yes. We believe the best communities are built by people who care about who they bring into them. Members may be able to invite trusted professionals to join the network.",
    },
    {
      id: "job-board",
      question: "Is AWN a job board?",
      answer:
        "Jobs and opportunities are part of AWN, but they're only one part of the community. We're building a place where people can find opportunities and find the people, knowledge, resources, and support that help them navigate their careers.",
    },
    {
      id: "currently-working",
      question: "Is AWN only for people who are currently working?",
      answer:
        "No. Careers change. People take breaks. People move between industries. People start something new. AWN is intended to remain useful throughout those different stages of a career.",
    },
    {
      id: "where-available",
      question: "Where is AWN available?",
      answer:
        "AWN is being built as a global community for entertainment professionals. Wherever the work takes you, we want AWN to be a place you can come back to.",
    },
    {
      id: "how-to-become-member",
      question: "How do I become a member?",
      answer:
        "Start by submitting a Request Access application. We'll take it from there.",
    },
  ] satisfies FaqItem[],
  closing: {
    headline:
      "You Don't Have to Know Who to Call. You just have to know where to go.",
    subline: "Welcome to AWN.",
  },
} as const
