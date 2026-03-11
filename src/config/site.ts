export const siteConfig = {
  name: "Speclint",
  url: "https://speclint.ai",
  tagline: "Lint your specs before agents touch them.",
  description: "Speclint scores every GitHub issue before your AI coding agent sees it. Bad specs ship broken code. Good specs ship in one pass.",
  
  hero: {
    badge: "Free tier — no credit card",
    title: "Lint your specs before\nagents touch them",
    subtitle: "Speclint scores every GitHub issue before your AI coding agent sees it. Bad specs ship broken code. Good specs ship in one pass.",
    cta: { text: "Get API Key", href: "/get-key" },
    secondaryCta: { text: "Read the docs", href: "/openapi.yaml" },
  },
  
  features: [
    {
      icon: "Target",
      title: "Completeness Score",
      description: "Every issue gets a 0-100 score. Gate your CI on ≥70. Agents only touch agent_ready specs."
    },
    {
      icon: "Zap",
      title: "GitHub Action",
      description: "Install once. Fires on issues.opened. Posts linted spec as comment. Adds agent_ready label automatically."
    },
    {
      icon: "Code",
      title: "Structured JSON Output",
      description: "Not a chat response. Typed schema: title, problem, acceptanceCriteria[], estimate, tags[], completeness_score. Parse it in your pipeline."
    },
    {
      icon: "Shield",
      title: "Codebase Context",
      description: "Pass your tech stack. Get ACs that reference your actual architecture, not generic boilerplate. Pro feature."
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
      description: "Score your first issues",
      features: [
        "5 items per request",
        "5 requests per day",
        "1 rewrite preview per day",
        "completeness_score included",
        "No credit card required"
      ],
      cta: "Get API Key",
      popular: false
    },
    {
      name: "Lite",
      price: 9,
      description: "Full rewrites, no limits on linting",
      features: [
        "Unlimited lint requests",
        "5 items per request",
        "10 full rewrites per day",
        "Complete rewritten spec text"
      ],
      cta: "Upgrade to Lite",
      popular: false
    },
    {
      name: "Solo",
      price: 29,
      description: "For solo devs running agents",
      features: [
        "Unlimited requests + rewrites",
        "25 items per request",
        "codebase_context (pass your tech stack)",
        "Agent profiles (Cursor, Codex, Claude Code)",
        "Structured output"
      ],
      cta: "Upgrade to Solo",
      popular: true
    },
    {
      name: "Team",
      price: 79,
      description: "For small firms automating at scale",
      features: [
        "Unlimited everything",
        "50 items per request",
        "Batch operations",
        "Cross-spec context",
        "Dependency mapping (/api/plan)",
        "SLA"
      ],
      cta: "Upgrade to Team",
      popular: false
    }
  ],
  
  faq: [
    {
      q: "What is Speclint?",
      a: "Speclint is a spec quality gate for AI-native development teams. It scores every GitHub issue from 0-100 before your AI coding agent (Cursor, Codex, Claude Code, Copilot) sees it. Issues that score below your threshold get flagged — so agents only touch specs that are ready to ship."
    },
    {
      q: "How does the completeness score work?",
      a: "Speclint analyzes each issue for problem statement clarity, acceptance criteria presence, scope definition, and implementation readiness. The result is a 0-100 completeness_score. Gate your CI on ≥70 to ensure agents only pick up agent_ready specs."
    },
    {
      q: "How much does Speclint cost?",
      a: "Speclint offers four plans: Free (5 items/request, 5 requests/day, no credit card), Lite at $9/month (unlimited requests, 10 rewrites/day), Solo at $29/month (unlimited requests + rewrites, codebase_context, agent profiles), and Team at $79/month (50 items/request, batch ops, cross-spec context, SLA). Cancel anytime."
    },
    {
      q: "How do I install the GitHub Action?",
      a: "Install once in your repo's workflow file. The action fires on issues.opened, calls the Speclint API, posts the scored spec as a comment, and adds the agent_ready label when the score is ≥70. Full setup in the docs at /openapi.yaml."
    },
    {
      q: "Is my data secure?",
      a: "Yes. We do not store your issue content. Items are processed in memory, sent to the AI API for scoring, and returned directly. All data is encrypted in transit. Read our Privacy Policy for full details."
    },
    {
      q: "What is codebase_context?",
      a: "A Pro/Team feature. Pass your tech stack (e.g. 'Next.js 14, PostgreSQL, Stripe, deployed on Railway') and Speclint generates acceptance criteria that reference your actual architecture — not generic boilerplate. Agents get specs that match the code they'll actually touch."
    },
    {
      q: "What is the /api/plan endpoint?",
      a: "A Team-tier feature for dependency mapping. Submit multiple issues and get back a build order — which specs depend on which, and in what sequence your agents should implement them."
    },
    {
      q: "Do I need to create an account?",
      a: "The free tier requires no account — just grab an API key and start scoring. You only need a paid plan for higher limits, codebase_context, and the GitHub Action."
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
