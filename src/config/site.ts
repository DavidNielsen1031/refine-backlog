export const siteConfig = {
  name: "Refine Backlog",
  tagline: "Paste your messy backlog. Get it back refined.",
  description: "AI-powered backlog refinement that turns chaos into clarity. Clean, prioritized, and ready to sprint.",
  
  hero: {
    badge: "Free tier available",
    title: "Your backlog is a mess.\nFix it in 30 seconds.",
    subtitle: "AI-powered refinement that turns vague ideas into sprint-ready stories with priorities, estimates, and acceptance criteria.",
    cta: { text: "Refine My Backlog — Free", href: "#refiner" },
    secondaryCta: { text: "See It In Action", href: "#example" },
  },
  
  features: [
    {
      icon: "Zap",
      title: "Lightning Fast",
      description: "Process 100+ backlog items in under 30 seconds with Claude AI."
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
      q: "What is backlog refinement?",
      a: "Backlog refinement is the process of reviewing, clarifying, and organizing product backlog items so they are ready for sprint planning. It involves adding detail, estimates, priorities, and acceptance criteria to user stories and tasks. Refine Backlog automates this entire process using AI."
    },
    {
      q: "How does AI backlog refinement work?",
      a: "Refine Backlog uses Claude AI to analyze your raw backlog items, deduplicate similar tasks, add clear problem statements, estimate effort using t-shirt sizing (S/M/L/XL), assign priorities (P0-P3), categorize work, and identify dependencies. You paste your items and get structured, sprint-ready stories back in seconds."
    },
    {
      q: "How much does Refine Backlog cost?",
      a: "Refine Backlog offers three plans: Free (10 items per session, 3 sessions/month, no signup required), Pro at $9/month (100 items per session, unlimited sessions), and Team at $29/month (500 items per session, team sharing & collaboration). No long-term contracts — cancel anytime."
    },
    {
      q: "Can I import from Jira, Linear, or GitHub?",
      a: "Yes. Refine Backlog accepts plain text (one item per line), CSV exports from Jira, Linear, and GitHub Issues, or JSON format. Just paste directly into the text area. You can also export results as CSV compatible with all major project management tools."
    },
    {
      q: "Is my data secure?",
      a: "Yes. We don't store your backlog data. Processing happens in real-time and results are returned directly to your browser. No data is retained after your session."
    },
    {
      q: "What's the difference between Pro and Team?",
      a: "Pro ($9/month) is designed for individual product managers and includes 100 items per session with unlimited sessions. Team ($29/month) adds team sharing & collaboration, custom export templates, bulk processing, and dedicated support with 500 items per session."
    },
    {
      q: "What's the difference between effort sizes?",
      a: "S (Small): 1-2 days, one person, straightforward change. M (Medium): 3-5 days, some complexity. L (Large): 1-2 weeks, cross-functional work. XL (Extra Large): 2+ weeks, should probably be broken down into smaller items."
    },
    {
      q: "Do I need to create an account?",
      a: "No. The free tier works instantly with no signup required. Just paste your backlog items and get results. You only need an account if you upgrade to Pro or Team for higher limits."
    }
  ],
  
  footer: {
    links: [
      { text: "Privacy Policy", href: "/privacy" },
      { text: "Terms of Service", href: "/terms" },
      { text: "Support", href: "/support" }
    ],
    social: [
      { name: "Twitter", href: "https://twitter.com/refinebacklog", icon: "Twitter" },
      { name: "GitHub", href: "https://github.com/refinebacklog", icon: "GitHub" }
    ]
  }
}