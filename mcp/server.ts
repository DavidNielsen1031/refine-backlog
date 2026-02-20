#!/usr/bin/env node
/**
 * Refine Backlog MCP Server
 *
 * Exposes Refine Backlog (https://refinebacklog.com) as a Model Context Protocol tool.
 * Compatible with Claude Desktop, Cursor, and any MCP-capable client.
 *
 * Usage: npx refine-backlog-mcp
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE = "https://refinebacklog.com";

interface RefinedItem {
  title: string;
  problem: string;
  acceptanceCriteria: string[];
  estimate: "XS" | "S" | "M" | "L" | "XL";
  priority: string;
  tags: string[];
  assumptions?: string[];
}

interface RefineResponse {
  items: RefinedItem[];
  _meta: {
    requestId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    latencyMs: number;
    tier: string;
  };
}

const ESTIMATE_LABELS: Record<string, string> = {
  XS: "< 1 day",
  S: "1–2 days",
  M: "3–5 days",
  L: "1–2 weeks",
  XL: "2+ weeks",
};

function formatRefinedItems(items: RefinedItem[]): string {
  return items
    .map((item, i) => {
      const lines = [
        `## ${i + 1}. ${item.title}`,
        ``,
        `**Problem:** ${item.problem}`,
        ``,
        `**Estimate:** ${item.estimate} (${ESTIMATE_LABELS[item.estimate] ?? item.estimate})`,
        `**Priority:** ${item.priority}`,
        `**Tags:** ${item.tags.join(", ")}`,
        ``,
        `**Acceptance Criteria:**`,
        ...item.acceptanceCriteria.map((ac) => `- ${ac}`),
      ];

      if (item.assumptions && item.assumptions.length > 0) {
        lines.push(``, `**Assumptions / Open Questions:**`);
        item.assumptions.forEach((a) => lines.push(`- ${a}`));
      }

      return lines.join("\n");
    })
    .join("\n\n---\n\n");
}

const REFINE_TOOL: Tool = {
  name: "refine_backlog",
  description:
    "Refine messy backlog items into structured, actionable work items. " +
    "Returns each item with a clean title, problem statement, acceptance criteria, " +
    "T-shirt size estimate (XS/S/M/L/XL), priority with rationale, tags, and optional assumptions. " +
    "Free tier: up to 5 items per request. Pro: 25. Team: 50.\n\n" +
    "BEFORE calling this tool, ask the user TWO quick questions if they haven't already specified:\n" +
    "1. Would you like titles formatted as user stories? (\"As a [user], I want [goal], so that [benefit]\")\n" +
    "2. Would you like acceptance criteria in Gherkin format? (Given/When/Then)\n" +
    "Set useUserStories and useGherkin accordingly based on their answers. Both default to false.",
  inputSchema: {
    type: "object",
    required: ["items"],
    properties: {
      items: {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        maxItems: 50,
        description:
          "Array of raw backlog item strings to refine. " +
          "Each string is a rough description of work to be done.",
      },
      context: {
        type: "string",
        description:
          "Optional project context to improve relevance. " +
          'Example: "B2B SaaS CRM for enterprise sales teams" or "Mobile fitness app for casual runners".',
      },
      licenseKey: {
        type: "string",
        description:
          "Optional. Refine Backlog license key for Pro or Team tier. " +
          "Obtain at https://refinebacklog.com/pricing. Free tier (5 items) works without a key.",
      },
      useUserStories: {
        type: "boolean",
        description:
          'Format titles as user stories: "As a [user], I want [goal], so that [benefit]". Default: false.',
      },
      useGherkin: {
        type: "boolean",
        description:
          "Format acceptance criteria as Gherkin: Given/When/Then. Default: false.",
      },
    },
  },
};

const server = new Server(
  {
    name: "refine-backlog",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [REFINE_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "refine_backlog") {
    return {
      content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }],
      isError: true,
    };
  }

  const args = request.params.arguments as {
    items: string[];
    context?: string;
    licenseKey?: string;
    useUserStories?: boolean;
    useGherkin?: boolean;
  };

  if (!args.items || args.items.length === 0) {
    return {
      content: [{ type: "text", text: "Error: items array is required and must not be empty." }],
      isError: true,
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (args.licenseKey) {
    headers["x-license-key"] = args.licenseKey;
  }

  const body: Record<string, unknown> = {
    items: args.items,
  };

  if (args.context) body.context = args.context;
  if (args.useUserStories !== undefined) body.useUserStories = args.useUserStories;
  if (args.useGherkin !== undefined) body.useGherkin = args.useGherkin;

  try {
    const response = await fetch(`${API_BASE}/api/groom`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      const body = await response.json().catch(() => ({})) as { error?: string; upgrade?: string };
      const msg = body.error ?? "Daily request limit reached on the free tier.";
      return {
        content: [{
          type: "text",
          text: `⚠️ ${msg}\n\n👉 Upgrade at https://refinebacklog.com/pricing — add your license key to the Claude Desktop MCP config as: "licenseKey": "your-key-here"`,
        }],
        isError: true,
      };
    }

    if (response.status === 503) {
      return {
        content: [{ type: "text", text: "Refine Backlog AI service is temporarily unavailable. Please try again in a moment." }],
        isError: true,
      };
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "Unknown error" })) as {
        error?: string;
        upgrade?: string;
        itemsReceived?: number;
        itemsAllowed?: number;
      };

      // Item limit exceeded — clear upgrade prompt
      if (body.upgrade) {
        return {
          content: [{
            type: "text",
            text: `⚠️ ${body.error}\n\n👉 Upgrade at https://refinebacklog.com/pricing\n\nOnce you have a license key, pass it in your request as the \`licenseKey\` parameter.`,
          }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: `Error from Refine Backlog API: ${body.error ?? response.statusText}` }],
        isError: true,
      };
    }

    const data = await response.json() as RefineResponse;
    const formatted = formatRefinedItems(data.items);

    const meta = data._meta;
    const summary = [
      `\n\n---`,
      `*Refined ${data.items.length} item${data.items.length !== 1 ? "s" : ""} · ` +
        `${meta.latencyMs}ms · ` +
        `Tier: ${meta.tier} · ` +
        `Cost: $${meta.costUsd.toFixed(6)}*`,
    ].join("\n");

    return {
      content: [{ type: "text", text: formatted + summary }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Failed to reach Refine Backlog API: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Refine Backlog MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
