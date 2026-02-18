import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getMaxItems, resolveUserTier } from '@/lib/rate-limit'
import { GroomedItemsSchema, type GroomedItem } from '@/lib/schemas'
import { trackUsage, calculateCost } from '@/lib/telemetry'

interface GroomRequest {
  items: string[]
  context?: string
  useUserStories?: boolean
  useGherkin?: boolean
}

const MODEL = 'claude-3-5-haiku-20241022'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const GROOMING_PROMPT = `You are an expert product manager and scrum master. Transform messy backlog items into well-structured, actionable work items.

For each item, provide:
1. **title**: Clean, actionable title
2. **problem**: Why this matters — the problem statement (1-2 sentences)
3. **acceptanceCriteria**: Array of 2-4 testable acceptance criteria
4. **estimate**: T-shirt size: XS (< 1 day), S (1-2 days), M (3-5 days), L (1-2 weeks), XL (2+ weeks)
5. **priority**: "HIGH", "MEDIUM", or "LOW" with a brief rationale in format "LEVEL — rationale"
6. **tags**: Array of 1-3 suggested labels/categories (e.g., "bug", "feature", "security", "ux", "performance", "tech-debt")
7. **assumptions**: Array of 0-2 assumptions or open questions that should be clarified before implementation (optional — only include if genuinely ambiguous)

Be opinionated. Make realistic estimates.

Return ONLY a valid JSON array, no markdown fences or explanation:
[{"title":"...","problem":"...","acceptanceCriteria":["..."],"estimate":"M","priority":"HIGH — rationale","tags":["bug"],"assumptions":["Assumes export is for current view only, not historical data"]}]`

function parseClaudeJson(text: string): unknown {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    const body: GroomRequest = await request.json()

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'No backlog items provided. Send { items: string[] }' }, { status: 400 })
    }

    // Resolve tier from license key
    const licenseKey = request.headers.get('x-license-key')
    const tier = await resolveUserTier(licenseKey)

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const rateCheck = await checkRateLimit(ip, tier)
    
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Daily request limit reached on the free tier (3 requests/day). Upgrade to Pro for unlimited requests at $9/month.',
          upgrade: 'https://refinebacklog.com/pricing',
          tier: rateCheck.tier,
        },
        { status: 429 }
      )
    }

    const maxItems = getMaxItems(tier)
    const cleanItems = body.items.filter(i => i.trim())

    if (cleanItems.length === 0) {
      return NextResponse.json({ error: 'All items were empty' }, { status: 400 })
    }

    if (cleanItems.length > maxItems) {
      const upgradeMsg = tier === 'free'
        ? `Free tier is limited to ${maxItems} items per request. Upgrade to Pro ($9/mo) for 25 items or Team ($29/mo) for 50 items. Get a license key at https://refinebacklog.com/pricing and pass it via the x-license-key header.`
        : `${tier} tier is limited to ${maxItems} items per request. You sent ${cleanItems.length}.`
      return NextResponse.json(
        {
          error: upgradeMsg,
          upgrade: tier === 'free' ? 'https://refinebacklog.com/pricing' : undefined,
          tier,
          itemsReceived: cleanItems.length,
          itemsAllowed: maxItems,
        },
        { status: 400 }
      )
    }

    const items = cleanItems.slice(0, maxItems)
    const contextLine = body.context ? `\n\nProject context: ${body.context}` : ''
    const userStoryLine = body.useUserStories ? `\n\nIMPORTANT: Keep the "title" field as a short, clean one-liner (e.g., "Fix Session Timeout Authentication Bug"). Add a SEPARATE field called "userStory" with the full user story in "As a [role], I want [goal], so that [benefit]" format. The title must NOT be a user story.` : ''
    const gherkinLine = body.useGherkin ? `\n\nIMPORTANT: Write ALL acceptance criteria in Gherkin format using Given/When/Then syntax. Each criterion must start with "Given", "When", or "Then".` : ''
    const itemsList = items.map((item, i) => `${i + 1}. ${item}`).join('\n')

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `${GROOMING_PROMPT}${contextLine}${userStoryLine}${gherkinLine}\n\nBacklog items:\n${itemsList}`
        }
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse and validate
    let groomedItems: GroomedItem[]
    let parsed: unknown
    try {
      parsed = parseClaudeJson(content.text)
    } catch {
      console.error('Failed to parse Claude response:', content.text)
      throw new Error('Failed to parse grooming results')
    }

    const validation = GroomedItemsSchema.safeParse(parsed)
    if (validation.success) {
      groomedItems = validation.data
    } else {
      // Retry once with correction prompt
      console.warn('Validation failed, retrying:', validation.error.issues)
      const retryResponse = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4000,
        temperature: 0.1,
        messages: [
          { role: 'user', content: `${GROOMING_PROMPT}${contextLine}${userStoryLine}${gherkinLine}\n\nBacklog items:\n${itemsList}` },
          { role: 'assistant', content: content.text },
          { role: 'user', content: `Your response had validation errors: ${JSON.stringify(validation.error.issues)}. Fix and return valid JSON array. Priority must be "HIGH — rationale", "MEDIUM — rationale", or "LOW — rationale". Estimate must be XS/S/M/L/XL. Return ONLY the JSON array.` }
        ],
      })

      const retryContent = retryResponse.content[0]
      if (retryContent.type !== 'text') throw new Error('Retry failed')

      try {
        const retryParsed = parseClaudeJson(retryContent.text)
        const retryValidation = GroomedItemsSchema.safeParse(retryParsed)
        if (retryValidation.success) {
          groomedItems = retryValidation.data
        } else {
          console.error('Retry validation also failed:', retryValidation.error.issues)
          return NextResponse.json(
            { error: 'AI output failed validation after retry', details: retryValidation.error.issues },
            { status: 502 }
          )
        }
      } catch {
        throw new Error('Failed to parse retry response')
      }
    }

    // Track usage telemetry (non-blocking)
    const inputTokens = response.usage?.input_tokens ?? 0
    const outputTokens = response.usage?.output_tokens ?? 0
    const costUsd = calculateCost(MODEL, inputTokens, outputTokens)
    const latencyMs = Date.now() - startTime

    trackUsage({
      requestId,
      timestamp: new Date().toISOString(),
      model: MODEL,
      tier,
      itemCount: items.length,
      inputTokens,
      outputTokens,
      costUsd,
      latencyMs,
      retried: !validation.success,
      ip: ip,
    }).catch(() => {}) // fire-and-forget

    return NextResponse.json({
      items: groomedItems,
      _meta: {
        requestId,
        model: MODEL,
        inputTokens,
        outputTokens,
        costUsd: Math.round(costUsd * 1_000_000) / 1_000_000, // 6 decimal places
        latencyMs,
        promptVersion: '1.0',
        tier,
      }
    }, { status: 200 })

  } catch (error) {
    console.error('API Error:', error)

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 503 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Refine Backlog API',
    usage: 'POST /api/groom with { items: string[], context?: string }',
    limit: '5 items per request (free tier), 25 (Pro), 50 (Team)',
  })
}
