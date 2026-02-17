import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://refinebacklog.com'
  const now = new Date().toISOString()

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/why-sprint-planning-fails`,
      lastModified: '2026-02-17',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/vague-requirements-to-clear-user-stories`,
      lastModified: '2026-02-17',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/hidden-cost-bad-backlog-items`,
      lastModified: '2026-02-17',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/clean-up-messy-backlog-5-minutes`,
      lastModified: '2026-02-16',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/ai-powered-backlog-refinement`,
      lastModified: '2026-02-15',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/backlog-refinement-best-practices`,
      lastModified: '2026-02-14',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: '2026-02-17',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: '2026-02-17',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/success`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]
}
