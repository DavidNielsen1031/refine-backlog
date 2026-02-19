/**
 * POST /api/refine — canonical endpoint name (RB-038)
 *
 * This is the preferred endpoint. /api/groom is kept as a 301 redirect
 * for backwards compatibility with existing integrations and MCP clients.
 *
 * All logic lives in /api/groom/route.ts — imported here to keep a single
 * source of truth until the groom→refine rename is fully propagated.
 */
export { POST, GET } from '@/app/api/groom/route'
