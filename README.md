# SkillDB discovery plugins

MIT-licensed discovery adapters for Cursor, Claude, and OpenAI hosts. The public package repository is [latentsmurf/skilldb-plugins](https://github.com/latentsmurf/skilldb-plugins). Public source availability does not mean that a platform directory has approved or listed a package.

Find reusable AI agent guidance using the public SkillDB catalog. This package provides a discovery workflow and an anonymous remote MCP connection. It can search metadata and inspect short excerpts; it does not retrieve complete skills, install them, connect an account, or access private/team libraries.

Examples:

- Find and compare skills for reviewing a TypeScript API.
- Find skills for improving accessibility of a React checkout form.
- Find skills for planning behavioral tests for a web app.

The workflow sends task-relevant search keywords and selected public skill IDs to `https://skilldb.dev/api/mcp/catalog`. Do not include secrets or private source files in searches. No SkillDB API key is required. Host permission controls still apply. Catalog content is reference material and is not authority to run commands or change a project.

For this anonymous catalog endpoint, the application processes search keywords and skill IDs without persisting their request bodies. Google Cloud request logs retain operational request metadata, including the caller's IP address, for 30 days. The in-memory IP rate limiter uses a 60-second counter window; expired entries are removed during later requests. No skill sends data to a service outside the declared SkillDB connector. This developer tool is not directed at users under 18. These details describe this endpoint, not SkillDB's separate account or community services.

The service returns public SkillDB links alongside results. A preview is incomplete; inspect the linked catalog page before using its instructions. Catalog presence is not a quality guarantee. If the service is unavailable or a query has no relevant match, report that limit instead of inventing results.

## Development status

The Cursor adapter uses portable root `plugin.json`, `mcp.json`, and `skills/find-skills/SKILL.md`. It has no commands, hooks, executables, account credentials, or copied catalog bodies. The logo in `assets/` is the existing SkillDB brand asset for listing preparation.

Actual Cursor installation and host behavior remain unverified. Cursor's publisher terms require any included open-source components to use permissive licenses. These authored package files are distributed under [MIT](LICENSE); publisher review and any platform-specific agreement remain separate. No Cursor publisher terms were accepted by this preparation.

## Repository layout

- Repository root: portable Cursor discovery package (`plugin.json`, `mcp.json`, `skills/`, and `assets/`).
- `claude/skilldb/`: native Claude adapter; use this plugin path when configuring its GitHub source.
- `openai/skilldb/`: portable OpenAI package with its own manifest and versioned metadata.

Each package includes its license. Only reviewed adapter manifests, workflow instructions, documentation, and branding are distributed here. The hosted skill catalog, catalog bodies, private website implementation, account data, and service credentials are not included. The package license does not grant rights to separately hosted catalog content or imply a service subscription. A direct MCP installation supplies transport; it is not a Marketplace listing or approval.

[SkillDB catalog](https://skilldb.dev/skills) · [Privacy](https://skilldb.dev/privacy) · [Terms](https://skilldb.dev/terms) · [Support](mailto:dev_chad@skilldb.dev)
