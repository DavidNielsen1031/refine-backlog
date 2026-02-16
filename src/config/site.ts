export const siteConfig = {
  name: "Backlog Groomer",
  tagline: "Paste your messy backlog. Get it back clean.",
  description: "AI-powered backlog grooming that turns chaos into clarity. Clean, prioritized, and ready to sprint.",
  
  hero: {
    badge: "Free tier available",
    title: "Paste your messy backlog.\nGet it back clean.",
    subtitle: "Turn your chaotic project backlog into a clean, prioritized list ready for sprint planning. No more analysis paralysis.",
    cta: { text: "Try It Free", href: "#groomer" },
    secondaryCta: { text: "View Example", href: "#example" },
  },
  
  features: [
    {
      icon: "Zap",
      title: "Lightning Fast",
      description: "Process 100+ backlog items in under 30 seconds with Claude AI."
    },
    {
      icon: "Target",
      title: "Opinionated Grooming",
      description: "Not just cleanup - adds problem statements, effort estimates, and priorities."
    },
    {
      icon: "Download",
      title: "Export Ready",
      description: "CSV output compatible with Jira, Linear, GitHub Issues, and more."
    },
    {
      icon: "Shield",
      title: "No Login Required",
      description: "Free tier works instantly. Paste and go, zero friction."
    }
  ],
  
  example: {
    before: `- fix bug with login
- new feature for dashboard
- update documentation
- performance improvements
- mobile responsive design
- user feedback integration`,
    after: [
      {
        title: "Fix authentication login bug",
        problem: "Users cannot log in due to session timeout issues",
        priority: "P0",
        effort: "M",
        category: "Bug Fix",
        dependencies: "None"
      },
      {
        title: "Implement dashboard analytics feature",
        problem: "Users lack visibility into their usage patterns and metrics",
        priority: "P1", 
        effort: "L",
        category: "Feature",
        dependencies: "Authentication system"
      },
      {
        title: "Update API documentation",
        problem: "Outdated docs causing integration delays for developers",
        priority: "P2",
        effort: "S", 
        category: "Documentation",
        dependencies: "None"
      }
    ]
  },
  
  pricing: [
    {
      name: "Free",
      price: 0,
      description: "Perfect for small backlogs",
      features: [
        "10 items per session",
        "3 sessions per month", 
        "Basic CSV export",
        "No signup required"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: 9,
      description: "For busy product managers",
      features: [
        "100 items per session",
        "Unlimited sessions",
        "Advanced export formats",
        "Priority processing",
        "Email support"
      ],
      cta: "Upgrade to Pro",
      popular: true
    },
    {
      name: "Team",
      price: 29,
      description: "For growing organizations", 
      features: [
        "500 items per session",
        "Team sharing & collaboration",
        "Custom export templates",
        "Bulk processing",
        "Dedicated support"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ],
  
  faq: [
    {
      q: "How does the AI grooming work?",
      a: "We use Claude AI to analyze your backlog items, deduplicate similar tasks, add clear problem statements, estimate effort (S/M/L/XL), assign priorities (P0-P3), categorize work, and identify dependencies."
    },
    {
      q: "What formats can I import?",
      a: "Plain text (one item per line), CSV exports from Jira/Linear/GitHub, or JSON. Just paste directly into the text area."
    },
    {
      q: "Is my data secure?",
      a: "Yes. We don't store your backlog data. Processing happens in real-time and results are returned directly to your browser."
    },
    {
      q: "Can I export back to my tools?",
      a: "Absolutely. We provide CSV exports compatible with Jira, Linear, GitHub Issues, and most project management tools."
    },
    {
      q: "What's the difference between effort sizes?",
      a: "S (Small): 1-2 days, M (Medium): 3-5 days, L (Large): 1-2 weeks, XL (Extra Large): 2+ weeks or should be broken down."
    }
  ],
  
  footer: {
    links: [
      { text: "Privacy Policy", href: "/privacy" },
      { text: "Terms of Service", href: "/terms" },
      { text: "Support", href: "/support" }
    ],
    social: [
      { name: "Twitter", href: "https://twitter.com/backloggroomer", icon: "Twitter" },
      { name: "GitHub", href: "https://github.com/backloggroomer", icon: "GitHub" }
    ]
  }
}