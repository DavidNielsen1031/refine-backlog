import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Refine Backlog — AI-Powered Backlog Refinement Tool",
  description: "Paste your messy product backlog and get it back clean, prioritized, and sprint-ready in seconds. Free tier available. Used by product managers and scrum masters.",
  keywords: ["backlog refinement", "AI backlog refinement", "sprint planning", "backlog cleanup", "product management tool", "AI product management", "backlog refinement tool", "scrum refinement"],
  authors: [{ name: "Perpetual Agility LLC" }],
  creator: "Perpetual Agility LLC",
  metadataBase: new URL("https://refinebacklog.com"),
  alternates: {
    canonical: "https://refinebacklog.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://refinebacklog.com",
    title: "Refine Backlog — AI-Powered Backlog Refinement Tool",
    description: "Paste your messy product backlog and get it back clean, prioritized, and sprint-ready in seconds. Free tier available. Used by product managers and scrum masters.",
    siteName: "Refine Backlog",
    images: [
      {
        url: "https://refinebacklog.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Refine Backlog — AI-Powered Backlog Refinement Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refine Backlog — AI-Powered Backlog Refinement Tool",
    description: "Paste your messy product backlog and get it back clean, prioritized, and sprint-ready in seconds. Free tier available.",
    creator: "@refinebacklog",
    images: ["https://refinebacklog.com/og-image.png"],
  },
  other: {
    "author": "Perpetual Agility LLC",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Refine Backlog",
      "description": "AI-powered backlog refinement tool that turns messy product backlogs into clean, prioritized, sprint-ready stories in seconds.",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": "https://refinebacklog.com",
      "offers": [
        {
          "@type": "Offer",
          "name": "Free",
          "price": "0",
          "priceCurrency": "USD",
          "description": "10 items per session, 3 sessions per month"
        },
        {
          "@type": "Offer",
          "name": "Pro",
          "price": "9",
          "priceCurrency": "USD",
          "billingIncrement": "month",
          "description": "100 items per session, unlimited sessions"
        },
        {
          "@type": "Offer",
          "name": "Team",
          "price": "29",
          "priceCurrency": "USD",
          "billingIncrement": "month",
          "description": "500 items per session, team sharing & collaboration"
        }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "50"
      }
    },
    {
      "@type": "Organization",
      "name": "Perpetual Agility LLC",
      "url": "https://refinebacklog.com",
      "logo": "https://refinebacklog.com/logo.png",
      "sameAs": [
        "https://twitter.com/refinebacklog"
      ]
    },
    {
      "@type": "WebSite",
      "name": "Refine Backlog",
      "url": "https://refinebacklog.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://refinebacklog.com/blog?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is backlog refinement?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Backlog refinement is the process of reviewing, clarifying, and organizing product backlog items so they are ready for sprint planning. It involves adding detail, estimates, priorities, and acceptance criteria to user stories and tasks. Refine Backlog automates this process using AI."
          }
        },
        {
          "@type": "Question",
          "name": "How does AI backlog refinement work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Refine Backlog uses Claude AI to analyze your raw backlog items, deduplicate similar tasks, add clear problem statements, estimate effort using t-shirt sizing (S/M/L/XL), assign priorities (P0-P3), categorize work, and identify dependencies. You paste your items and get structured, sprint-ready stories back in seconds."
          }
        },
        {
          "@type": "Question",
          "name": "How much does Refine Backlog cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Refine Backlog offers three plans: Free (10 items per session, 3 sessions/month, no signup required), Pro at $9/month (100 items per session, unlimited sessions), and Team at $29/month (500 items per session, team sharing & collaboration)."
          }
        },
        {
          "@type": "Question",
          "name": "Can I import from Jira, Linear, or GitHub?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Refine Backlog accepts plain text (one item per line), CSV exports from Jira, Linear, and GitHub Issues, or JSON format. Just paste directly into the text area. You can also export results as CSV compatible with all major project management tools."
          }
        },
        {
          "@type": "Question",
          "name": "Is my data secure?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Refine Backlog does not store your backlog data. Processing happens in real-time and results are returned directly to your browser. No data is retained after your session."
          }
        },
        {
          "@type": "Question",
          "name": "What's the difference between Pro and Team?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pro ($9/month) is for individual product managers and includes 100 items per session with unlimited sessions. Team ($29/month) adds team sharing & collaboration, custom export templates, bulk processing, and dedicated support with 500 items per session."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <meta name="author" content="Perpetual Agility LLC" />
        <link rel="canonical" href="https://refinebacklog.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
