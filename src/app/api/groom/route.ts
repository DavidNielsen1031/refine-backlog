import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

// Rate limiting storage (in production, use Redis or a database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface GroomRequest {
  items: string
  format: 'text' | 'csv' | 'json'
}

interface GroomedItem {
  title: string
  problem: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  effort: 'S' | 'M' | 'L' | 'XL'
  category: string
  dependencies: string
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key-here',
})

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const dayInMs = 24 * 60 * 60 * 1000
  
  const existing = rateLimitStore.get(ip)
  
  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + dayInMs })
    return { allowed: true, remaining: 2 }
  }
  
  if (existing.count >= 3) {
    return { allowed: false, remaining: 0 }
  }
  
  existing.count++
  return { allowed: true, remaining: 3 - existing.count }
}

const GROOMING_PROMPT = `You are an expert product manager and scrum master. Your job is to take messy, unclear backlog items and transform them into well-groomed, actionable work items.

For each item, you must provide:
1. **Title**: Clear, actionable title (what needs to be done)
2. **Problem Statement**: Why this work matters (the problem it solves)  
3. **Priority**: P0 (critical/blocking), P1 (high), P2 (medium), P3 (low)
4. **Effort**: S (1-2 days), M (3-5 days), L (1-2 weeks), XL (2+ weeks - should be broken down)
5. **Category**: Bug Fix, Feature, Tech Debt, Documentation, etc.
6. **Dependencies**: What else needs to be done first, or "None"

Be opinionated and practical. Don't hedge. Make decisions about priority and effort based on typical software development scenarios.

Return ONLY a valid JSON array of objects, no other text or explanation:

[
  {
    "title": "Fix authentication login bug",
    "problem": "Users cannot log in due to session timeout issues affecting user retention",
    "priority": "P0",
    "effort": "M", 
    "category": "Bug Fix",
    "dependencies": "None"
  }
]

Input backlog items:`

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(clientIP)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Free tier allows 3 sessions per day.' },
        { status: 429 }
      )
    }

    const body: GroomRequest = await request.json()
    
    if (!body.items || !body.items.trim()) {
      return NextResponse.json(
        { error: 'No backlog items provided' },
        { status: 400 }
      )
    }

    // Count items (rough estimate by lines)
    const itemCount = body.items.split('\n').filter(line => line.trim()).length
    
    if (itemCount > 10) {
      return NextResponse.json(
        { error: 'Free tier limited to 10 items per session' },
        { status: 400 }
      )
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `${GROOMING_PROMPT}\n\n${body.items}`
        }
      ],
      temperature: 0.3,
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    let groomedItems: GroomedItem[]
    try {
      groomedItems = JSON.parse(content.text)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text)
      throw new Error('Failed to parse grooming results')
    }

    // Validate the response structure
    if (!Array.isArray(groomedItems)) {
      throw new Error('Invalid response format from AI')
    }

    for (const item of groomedItems) {
      if (!item.title || !item.problem || !item.priority || !item.effort || !item.category) {
        throw new Error('Incomplete grooming results from AI')
      }
    }

    return NextResponse.json(
      { 
        items: groomedItems,
        remaining: rateLimit.remaining - 1
      },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
          'X-RateLimit-Limit': '3'
        }
      }
    )

  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Backlog Groomer API',
      endpoints: {
        'POST /api/groom': 'Groom backlog items'
      }
    }
  )
}