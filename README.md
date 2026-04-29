# dentro MCP

Structured commerce data for AI agents. One MCP server, 22,000+ DTC brands, real-time product data, no scraping, no hallucination.

[![npm version](https://img.shields.io/npm/v/@dentro-fyi/mcp.svg)](https://www.npmjs.com/package/@dentro-fyi/mcp)
[![MCP](https://img.shields.io/badge/MCP-compatible-blue)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What it does

Lets any MCP-compatible agent (Claude Desktop, Cursor, custom agents) query a curated registry of 22,000+ DTC e-commerce brands across 16 countries. Five tools, all returning clean JSON:

- `discover_companies` — find brands by natural-language query
- `search_products` — search products within a brand, real prices and stock
- `get_product` — full product detail with variants, images, descriptions
- `list_categories` — browse a brand's category tree
- `get_site_info` — brand metadata and agent instructions

## Why use it

| Without dentro | With dentro |
|---|---|
| Agent web-searches Google, scrapes 10 storefronts, hallucinates prices | One tool call, structured JSON, real data |
| 30+ second latency, 50K+ tokens | Sub-second, ~2K tokens |
| Generic results dominated by Amazon | Curated DTC brands, agent-optimized |

## Install

```bash
npm install -g @dentro-fyi/mcp
```

Get an API key at [dentro.fyi](https://dentro.fyi) (free tier available).

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dentro": {
      "command": "npx",
      "args": ["-y", "@dentro-fyi/mcp"],
      "env": {
        "DENTRO_API_KEY": "your-key-here"
      }
    }
  }
}
```

Restart Claude Desktop. Try: *"Find me a sustainable tote bag under $30."*

### Cursor / other MCP clients

Same config shape. Any MCP-compatible client can use it.

## Example

```
You: I need merino wool socks for hiking, ideally American-made.
Claude: [calls discover_companies({query: "merino wool hiking socks American-made"})]
        [finds: Darn Tough, Smartwool, Farm to Feet]
        [calls search_products({company_id: "darn-tough", query: "merino hiking"})]
        Here are 3 options from Darn Tough, all in stock, made in Vermont...
```

## Coverage

- 22,173 brands across 16 countries
- 4 verified platforms (Shopify, WooCommerce, WordPress, Magento) plus custom connectors
- Tier 1 (verified): full product API
- Tier 2 (listed): structured data only
- Tier 3 (directory): brand info only

## Pricing

- Free tier: 100 requests/day, all tools
- Paid tiers: higher limits, priority discovery, attribution analytics
- See [dentro.fyi/pricing](https://dentro.fyi/pricing)

## Resources

- Docs: [dentro.fyi/docs](https://dentro.fyi/docs)
- API reference: [dentro.fyi/api](https://dentro.fyi/api)
- Issues: [github.com/dentro-fyi/dentro-mcp/issues](https://github.com/dentro-fyi/dentro-mcp/issues)
- Contact: hello@dentro.fyi

## License

MIT.
