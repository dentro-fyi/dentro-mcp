#!/usr/bin/env node
/**
 * Dentro MCP — thin bridge from Claude Desktop to https://dentro.fyi/api.
 *
 * Exposes 5 tools: discover_companies, search_products, get_product,
 * list_categories, get_site_info. All requests go to the live REST API,
 * so the data is always fresh and the company list always up-to-date.
 *
 * Config (Claude Desktop → claude_desktop_config.json):
 *   {
 *     "mcpServers": {
 *       "dentro": {
 *         "command": "node",
 *         "args": ["/absolute/path/to/dentro-mcp/src/index.js"],
 *         "env": { "DENTRO_API_KEY": "your-key-here" }
 *       }
 *     }
 *   }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const API_URL = process.env.DENTRO_API_URL || 'https://dentro.fyi/api';
const API_KEY = process.env.DENTRO_API_KEY;

if (!API_KEY) {
  console.error('[dentro-mcp] ERROR: DENTRO_API_KEY environment variable is required.');
  console.error('[dentro-mcp] Get a key at: https://dentro.fyi (or email hello@dentro.fyi)');
  process.exit(1);
}

async function apiCall(path) {
  const r = await fetch(`${API_URL}${path}`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
  });
  if (!r.ok) {
    return { error: `HTTP ${r.status}`, detail: await r.text().catch(() => '') };
  }
  return await r.json();
}

function qs(obj) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v != null && v !== '') params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

const TOOLS = [
  {
    name: 'discover_companies',
    description: 'Find e-commerce companies in the Dentro network that match a natural language query. Returns ranked matches with company IDs to use in subsequent product searches. Use this first when the user asks about a product type or brand.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Natural-language description of what you are looking for (e.g. "sustainable tote bags", "merino wool socks for men")' },
        category: { type: 'string', description: 'Optional category filter (e.g. "apparel", "footwear")' },
        limit: { type: 'number', description: 'Max results (1-50). Default 10.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_products',
    description: 'Search for products within a specific company. Returns real-time data: name, price, stock status, variants, direct product URL. Call after discover_companies to find specific products at the matched brand.',
    inputSchema: {
      type: 'object',
      properties: {
        company_id: { type: 'string', description: 'Company ID from discover_companies (e.g. "knockaround", "allbirds")' },
        query: { type: 'string', description: 'What to search for (e.g. "polarized sunglasses", "black dress")' },
        limit: { type: 'number', description: 'Max results (1-50). Default 10.' },
      },
      required: ['company_id', 'query'],
    },
  },
  {
    name: 'get_product',
    description: 'Get full details for a specific product — all variants, images, descriptions, stock, pricing.',
    inputSchema: {
      type: 'object',
      properties: {
        company_id: { type: 'string' },
        product_id: { type: 'string', description: 'Product ID or slug from search results' },
      },
      required: ['company_id', 'product_id'],
    },
  },
  {
    name: 'list_categories',
    description: 'List all product categories / collections for a specific company. Useful for browsing.',
    inputSchema: {
      type: 'object',
      properties: {
        company_id: { type: 'string' },
      },
      required: ['company_id'],
    },
  },
  {
    name: 'get_site_info',
    description: 'Get metadata about a company — platform, agent instructions (cookie banners, country selectors, etc.), available tools.',
    inputSchema: {
      type: 'object',
      properties: {
        company_id: { type: 'string' },
      },
      required: ['company_id'],
    },
  },
];

const server = new Server(
  { name: 'dentro', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  let result;

  try {
    switch (name) {
      case 'discover_companies':
        result = await apiCall(`/companies${qs({ query: args.query, category: args.category, limit: args.limit })}`);
        break;
      case 'search_products':
        result = await apiCall(`/companies/${encodeURIComponent(args.company_id)}/products${qs({ query: args.query, limit: args.limit })}`);
        break;
      case 'get_product':
        result = await apiCall(`/companies/${encodeURIComponent(args.company_id)}/products/${encodeURIComponent(args.product_id)}`);
        break;
      case 'list_categories':
        result = await apiCall(`/companies/${encodeURIComponent(args.company_id)}/categories`);
        break;
      case 'get_site_info':
        result = await apiCall(`/companies/${encodeURIComponent(args.company_id)}/site-info`);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (e) {
    result = { error: 'tool_failed', detail: String(e.message || e) };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('[dentro-mcp] Connected. API:', API_URL);
