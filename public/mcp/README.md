# Refine Backlog MCP Server

Use Refine Backlog directly inside Claude Desktop, Cursor, or any MCP-compatible client.
Tell your AI to refine your backlog and it calls the API automatically — no copy-paste required.

## What it does

Exposes a single tool: `refine_backlog`

Give it a list of rough backlog items. Get back structured work items with:
- Clean, actionable titles
- Problem statements
- Acceptance criteria (2-4 per item)
- T-shirt size estimates (XS/S/M/L/XL)
- Priorities with rationale
- Tags
- Clarifying assumptions (when needed)

## Quick Start

### Option 1: npx (no install)

```bash
npx refine-backlog-mcp
```

### Option 2: Local build

```bash
cd mcp
npm install
npm run build
node dist/server.js
```

## Claude Desktop Setup

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):

**Free tier** (3 requests/day, 5 items):
```json
{
  "mcpServers": {
    "refine-backlog": {
      "command": "npx",
      "args": ["-y", "refine-backlog-mcp"]
    }
  }
}
```

**Pro/Team** (unlimited requests, 25–50 items) — add your license key:
```json
{
  "mcpServers": {
    "refine-backlog": {
      "command": "npx",
      "args": ["-y", "refine-backlog-mcp"],
      "env": {
        "REFINE_BACKLOG_KEY": "your-license-key-here"
      }
    }
  }
}
```

Get a license key at [refinebacklog.com/pricing](https://refinebacklog.com/pricing).

With a license key (Pro/Team tier):

```json
{
  "mcpServers": {
    "refine-backlog": {
      "command": "npx",
      "args": ["refine-backlog-mcp"],
      "env": {
        "REFINE_LICENSE_KEY": "your-license-key-here"
      }
    }
  }
}
```

Restart Claude Desktop. You'll see "refine_backlog" in the tools list.

## Cursor Setup

Add to your Cursor MCP config (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "refine-backlog": {
      "command": "npx",
      "args": ["refine-backlog-mcp"]
    }
  }
}
```

## Usage Examples

Once configured, just talk to your AI naturally:

> "Refine these backlog items: fix login bug, add CSV export, improve dashboard load time"

> "Take these 10 stories and run them through Refine Backlog. Context: we're building a B2B SaaS for HR teams."

> "Refine this backlog item as a user story with Gherkin acceptance criteria: users need to reset their password"

## Rate Limits

| Tier | Items per request | Price |
|------|-------------------|-------|
| Free | 5 | $0 — no key needed |
| Pro  | 25 | $9/month |
| Team | 50 | $29/month |

Get a license key at [refinebacklog.com/pricing](https://refinebacklog.com/pricing)

## API Reference

Full API docs: [refinebacklog.com/llms.txt](https://refinebacklog.com/llms.txt)  
OpenAPI spec: [refinebacklog.com/openapi.yaml](https://refinebacklog.com/openapi.yaml)
