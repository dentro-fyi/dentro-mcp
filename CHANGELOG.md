# Changelog

All notable changes to `@dentro-fyi/mcp` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-04-29

### Added
- `mcpName` field in `package.json` for MCP registry validation (`io.github.dentro-fyi/dentro`).
- Smithery configuration (`smithery.yaml`) for one-click installs from smithery.ai.

### Changed
- Friendly error message when `DENTRO_API_KEY` is missing now points at https://dentro.fyi instead of a stale email address.

## [0.1.0] - 2026-04-29

### Added
- Initial release.
- Five MCP tools: `discover_companies`, `search_products`, `get_product`, `list_categories`, `get_site_info`.
- stdio transport, compatible with Claude Desktop, Cursor, and any MCP client.
- Connects to https://dentro.fyi/api with a per-user API key (`DENTRO_API_KEY` env var).
- MIT license.
