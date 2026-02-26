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

// License key from MCP server environment — set REFINE_BACKLOG_KEY in Claude Desktop config.
// This is the preferred way for MCP users with a paid subscription.
const ENV_LICENSE_KEY = process.env.REFINE_BACKLOG_KEY ?? null;

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
    "Set useUserStories and useGherkin accordingly based on their answers. Both default to false.\n\n" +
    "LICENSE KEY: For unlimited requests and higher item limits, set REFINE_BACKLOG_KEY in your MCP server " +
    "environment config (Claude Desktop → claude_desktop_config.json → env section). " +
    "Get a key at https://refinebacklog.com/pricing",
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
          "Preferred: set REFINE_BACKLOG_KEY in your MCP server env config instead of passing inline. " +
          "Get a key at https://refinebacklog.com/pricing. Free tier (5 items, 3 req/day) works without a key.",
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

const PLAN_TOOL: Tool = {
  name: "plan_sprint",
  description:
    "Pack refined backlog items into an AI-native sprint execution queue. " +
    "Returns a sprint_goal, an ordered execution_queue with parallel groups and dependency chains, " +
    "and deferred items that didn't fit the budget.\n\n" +
    "Ideal for: CI pipelines, GitHub Actions, AI coding agents that need a machine-ready work queue.\n\n" +
    "Items can be plain strings or objects from refine_backlog output.\n\n" +
    "LICENSE KEY: Pro/Team tier required for dependency mapping (parallel_group, depends_on) and deferred queue. " +
    "Set REFINE_BACKLOG_KEY in your MCP env config. Get a key at https://refinebacklog.com/pricing",
  inputSchema: {
    type: "object",
    required: ["items"],
    properties: {
      items: {
        type: "array",
        items: {},
        minItems: 1,
        maxItems: 50,
        description:
          "Array of backlog items. Can be plain strings or objects from refine_backlog output " +
          "(with title, estimate, priority, tags fields).",
      },
      budget: {
        type: "object",
        description: "Optional sprint budget constraints.",
        properties: {
          max_items: {
            type: "integer",
            description: "Maximum number of items to include in the sprint.",
          },
          time_window: {
            type: "string",
            description: 'Sprint duration. Examples: "1 week", "2 weeks", "1 sprint".',
          },
        },
      },
      goal_hint: {
        type: "string",
        description:
          'Optional human direction for the sprint goal. Example: "Focus on auth stability this sprint".',
      },
      context: {
        type: "string",
        description: "Optional project context to improve sprint goal quality.",
      },
      licenseKey: {
        type: "string",
        description:
          "Optional. License key for Pro/Team tier (dependency mapping). " +
          "Preferred: set REFINE_BACKLOG_KEY in MCP env config. Get a key at https://refinebacklog.com/pricing",
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
  tools: [REFINE_TOOL, PLAN_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "refine_backlog" && request.params.name !== "plan_sprint") {
    return {
      content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }],
      isError: true,
    };
  }

  if (request.params.name === "plan_sprint") {
    const planArgs = request.params.arguments as {
      items: Array<string | Record<string, unknown>>;
      budget?: { max_items?: number; time_window?: string };
      goal_hint?: string;
      context?: string;
      licenseKey?: string;
    };

    if (!planArgs.items || planArgs.items.length === 0) {
      return {
        content: [{ type: "text", text: "Error: items array is required and must not be empty." }],
        isError: true,
      };
    }

    const planHeaders: Record<string, string> = { "Content-Type": "application/json" };
    const resolvedPlanKey = planArgs.licenseKey ?? ENV_LICENSE_KEY;
    if (resolvedPlanKey) planHeaders["x-license-key"] = resolvedPlanKey;

    const planBody: Record<string, unknown> = { items: planArgs.items };
    if (planArgs.budget) planBody.budget = planArgs.budget;
    if (planArgs.goal_hint) planBody.goal_hint = planArgs.goal_hint;
    if (planArgs.context) planBody.context = planArgs.context;

    try {
      const planResponse = await fetch(`${API_BASE}/api/plan`, {
        method: "POST",
        headers: planHeaders,
        body: JSON.stringify(planBody),
      });

      if (planResponse.status === 429) {
        const b = await planResponse.json().catch(() => ({})) as { error?: string };
        return {
          content: [{
            type: "text",
            text: `⚠️ ${b.error ?? "Rate limit reached."}\n\n👉 Upgrade at https://refinebacklog.com/pricing`,
          }],
          isError: true,
        };
      }

      if (planResponse.status === 503) {
        return {
          content: [{ type: "text", text: "Refine Backlog AI service is temporarily unavailable. Please try again." }],
          isError: true,
        };
      }

      if (!planResponse.ok) {
        const b = await planResponse.json().catch(() => ({ error: "Unknown error" })) as { error?: string };
        return {
          content: [{ type: "text", text: `Error from Sprint Planner API: ${b.error ?? planResponse.statusText}` }],
          isError: true,
        };
      }

      const planData = await planResponse.json() as {
        sprint_goal: string;
        execution_queue: Array<{
          id: string;
          title: string;
          estimate?: string;
          rationale: string;
          parallel_group?: number;
          depends_on?: string[];
        }>;
        deferred?: Array<{ id: string; title: string }>;
        fit_ratio: number;
        _meta: { latencyMs: number; tier: string; costUsd: number };
      };

      const lines: string[] = [
        `## 🎯 Sprint Goal`,
        ``,
        planData.sprint_goal,
        ``,
        `## 📋 Execution Queue (${planData.execution_queue.length} items)`,
        ``,
      ];

      planData.execution_queue.forEach((item, i) => {
        const groupLabel = item.parallel_group ? ` · Group ${item.parallel_group}` : "";
        const depsLabel = item.depends_on && item.depends_on.length > 0
          ? ` · Depends on: ${item.depends_on.join(", ")}`
          : "";
        const estLabel = item.estimate ? ` [${item.estimate}]` : "";
        lines.push(`**${i + 1}. ${item.title}**${estLabel}${groupLabel}${depsLabel}`);
        lines.push(`   _${item.rationale}_`);
        lines.push(``);
      });

      if (planData.deferred && planData.deferred.length > 0) {
        lines.push(`## 🔜 Deferred (${planData.deferred.length} items)`);
        lines.push(``);
        planData.deferred.forEach(item => lines.push(`- ${item.title}`));
        lines.push(``);
      }

      const meta = planData._meta;
      lines.push(`---`);
      lines.push(`*${planData.execution_queue.length} items · fit ratio: ${Math.round(planData.fit_ratio * 100)}% · ${meta.latencyMs}ms · Tier: ${meta.tier} · Cost: $${meta.costUsd.toFixed(6)}*`);

      return { content: [{ type: "text", text: lines.join("\n") }] };

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Failed to reach Sprint Planner API: ${message}` }],
        isError: true,
      };
    }
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

  // Inline arg takes precedence; env var is the recommended approach for MCP configs
  const resolvedKey = args.licenseKey ?? ENV_LICENSE_KEY;
  if (resolvedKey) {
    headers["x-license-key"] = resolvedKey;
  }

  const body: Record<string, unknown> = {
    items: args.items,
  };

  if (args.context) body.context = args.context;
  if (args.useUserStories !== undefined) body.useUserStories = args.useUserStories;
  if (args.useGherkin !== undefined) body.useGherkin = args.useGherkin;

  try {
    const response = await fetch(`${API_BASE}/api/refine`, {
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
          text: `⚠️ ${msg}\n\n👉 Upgrade at https://refinebacklog.com/pricing\n\nOnce you have a key, add it to your Claude Desktop config:\n{\n  "mcpServers": {\n    "refine-backlog": {\n      "command": "npx",\n      "args": ["-y", "refine-backlog-mcp"],\n      "env": { "REFINE_BACKLOG_KEY": "your-key-here" }\n    }\n  }\n}`,
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
