export const siteConfig = {
  name: "Refine Backlog",
  tagline: "Paste your messy backlog. Get it back refined.",
  description: "AI-powered backlog refinement that turns chaos into clarity. Clean, prioritized, and ready to sprint.",
  
  hero: {
    badge: "Free tier available",
    title: "Turn messy backlogs into\nsprint-ready stories.",
    subtitle: "Paste rough backlog items. Get structured user stories with acceptance criteria, effort estimates, and priority suggestions in 30 seconds.",
    cta: { text: "Refine My Backlog — Free", href: "#refiner" },
    secondaryCta: { text: "See It In Action", href: "#example" },
  },
  
  features: [
    {
      icon: "Zap",
      title: "Lightning Fast",
      description: "Refine up to 50 backlog items per request in under 30 seconds."
    },
    {
      icon: "Target",
      title: "Opinionated Refinement",
      description: "Not just cleanup — adds problem statements, effort estimates, and priorities."
    },
    {
      icon: "Download",
      title: "Export Ready",
      description: "CSV output compatible with Jira, Linear, GitHub Issues, and more."
    },
    {
      icon: "Shield",
      title: "No Signup Required",
      description: "Free tier requires no signup. Paste and go, zero friction."
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
        "5 items per request",
        "3 requests per day", 
        "CSV export",
        "Free tier requires no signup"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: 9,
      description: "For developers using the API",
      features: [
        "25 items per request",
        "Unlimited API requests",
        "License key for scripts & pipelines",
        "Email support"
      ],
      cta: "Upgrade to Pro",
      popular: true
    },
    {
      name: "Team",
      price: 29,
      description: "For engineering orgs automating at scale", 
      features: [
        "50 items per request",
        "Unlimited API requests",
        "5 license keys for team automation",
        "Dedicated support"
      ],
      cta: "Upgrade to Team",
      popular: false
    }
  ],
  
  faq: [
    {
      q: "What is backlog refinement?",
      a: "Backlog refinement is the process of reviewing, clarifying, and organizing product backlog items so they are ready for sprint planning. It involves adding detail, estimates, priorities, and acceptance criteria to user stories and tasks. Refine Backlog automates this entire process using AI."
    },
    {
      q: "How does AI backlog refinement work?",
      a: "Refine Backlog uses Claude AI to analyze your raw backlog items, deduplicate similar tasks, add clear problem statements, estimate effort using t-shirt sizing (S/M/L/XL), assign priorities (P0-P3), categorize work, and identify dependencies. You paste your items and get structured, sprint-ready stories back in seconds."
    },
    {
      q: "How much does Refine Backlog cost?",
      a: "Refine Backlog offers three plans: Free (5 items per request, 3 requests per day, no signup required), Pro at $9/month (25 items per request, unlimited requests), and Team at $29/month (50 items per request, up to 5 seats). No long-term contracts — cancel anytime."
    },
    {
      q: "Can I import from Jira, Linear, or GitHub?",
      a: "Yes. Refine Backlog accepts plain text (one item per line), CSV exports from Jira, Linear, and GitHub Issues, or JSON format. Just paste directly into the text area. You can also export results as CSV compatible with all major project management tools."
    },
    {
      q: "Is my data secure?",
      a: "Yes. We do not store your backlog content. Your items are processed in memory, sent to Anthropic's Claude API for refinement, and returned directly to your browser. Anthropic retains API logs for 7 days then deletes them. API data is never used for model training. All data is encrypted in transit. Read our Privacy Policy for full details."
    },
    {
      q: "What's the difference between Pro and Team?",
      a: "Pro ($9/month) is designed for developers automating backlog refinement — pipe items through scripts, CI/CD pipelines, or GitHub Actions with a license key. Team ($29/month) gives your whole engineering org access with 5 license keys, 50 items per request, and dedicated support."
    },
    {
      q: "What's the difference between effort sizes?",
      a: "S (Small): 1-2 days, one person, straightforward change. M (Medium): 3-5 days, some complexity. L (Large): 1-2 weeks, cross-functional work. XL (Extra Large): 2+ weeks, should probably be broken down into smaller items."
    },
    {
      q: "Do I need to create an account?",
      a: "No. The free tier requires no signup — just paste your backlog items and get results. You only need a license key if you upgrade to Pro or Team for higher limits."
    }
  ],
  
  footer: {
    links: [
      { text: "Privacy Policy", href: "/privacy" },
      { text: "Terms of Service", href: "/terms" },
      { text: "Support", href: "/support" }
    ],
    social: [] as { name: string; href: string; icon: string }[]
  }
}