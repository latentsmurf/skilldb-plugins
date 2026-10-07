# SkillDB discovery plugins

MIT-licensed discovery adapters for Cursor, Claude, OpenAI, GitHub Copilot, VS Code, and Gemini CLI hosts. The public package repository is [latentsmurf/skilldb-plugins](https://github.com/latentsmurf/skilldb-plugins). Public source availability does not mean that a platform directory has approved or listed a package.

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

Actual Cursor installation and host behavior remain unverified. These authored package files are distributed under [MIT](LICENSE). The publisher approved Cursor's terms and submitted the application on October 5, 2026; Cursor confirmed receipt and review is pending. This does not establish Marketplace approval or availability.

## Repository layout

- Repository root: portable Cursor discovery package (`plugin.json`, `mcp.json`, `skills/`, and `assets/`).
- `claude/skilldb/`: native Claude adapter; use this plugin path when configuring its GitHub source.
- `openai/skilldb/`: portable OpenAI package with its own manifest and versioned metadata.
- `copilot/skilldb/`: Agent Plugins 1.0 package for GitHub Copilot and VS Code.
- Root `gemini-extension.json`: Gemini CLI adapter using the shared discovery skill and branding.
- `examples/fastmcp/`: runnable Python discovery client with live validation evidence.
- `examples/flowise/`: MCP component example for existing installations of the archived Flowise project.

## Examples for agent builders

The [FastMCP example](examples/fastmcp/README.md) creates a shortlist of skill candidates with exact IDs, incomplete-preview labels and source links for operator review. It was tested with FastMCP 4.0.11 against the live anonymous catalog, including empty results. It complements a local skills library without downloading or installing candidate skills.

The [Flowise example](examples/flowise/README.md) documents Custom MCP configuration and validates the unchanged Flowise MCP toolkit. Flowise is archived; this example is for existing installations. Its full application UI and model conversation remain untested.

Both examples use deterministic live tool calls without a model or SkillDB account. These checks establish client/component compatibility, not independent adoption, host endorsement or a model evaluation. Example scripts are run explicitly by the reader; plugin installation does not execute them.

## Copilot and Gemini CLI

```sh
copilot plugin install latentsmurf/skilldb-plugins:copilot/skilldb
gemini extensions install https://github.com/latentsmurf/skilldb-plugins
```

Review each host's installation prompt and start a new session. Ask: "Use SkillDB to find three skills for reviewing a TypeScript API. Preview the best two and compare their fit with source links."

Copilot CLI 1.0.92 successfully installed the package and enabled its skill in local validation. The test account's organization policy blocked third-party MCP servers, so a complete Copilot discovery conversation is not yet verified. Direct install currently works but warns that future Copilot versions will require a marketplace entry. VS Code supports this portable format; its UI has not been tested here.

Gemini CLI 0.62.0 successfully installed the extension, discovered its skill, and connected to the live catalog server. An authenticated Gemini conversation remains to be tested. Neither result establishes directory approval. The same SkillDB logo is included in `assets/`; display in a host's listing depends on that host's supported metadata.

## Install the discovery instructions with the skills CLI

The [skills CLI](https://github.com/vercel-labs/skills) can install just `find-skills` into one agent's current project. For example, for Continue:

```sh
npx skills add latentsmurf/skilldb-plugins --skill find-skills --agent continue --copy
```

Run this in the project where you want the skill; choose another supported `--agent` value for your host. The command does not use global installation and does not configure MCP. Before installing, check whether that project already has another skill named `find-skills`; do not overwrite a different skill unintentionally.

For Continue, also save the [catalog configuration](hosts/continue/skilldb-catalog.yaml) as `.continue/mcpServers/skilldb-catalog.yaml` in that project, merging with existing configuration when needed. Other hosts can use the [public host setup instructions](hosts/README.md). Confirm that the host exposes `skilldb_search` and `skilldb_get_preview`, then try the example prompt above. The endpoint needs no SkillDB account or key. Without that connection, the installed skill can explain setup and link to the catalog, but cannot supply live tool results.

The CLI normally reports installation telemetry to [skills.sh](https://skills.sh/docs/cli); its documented opt-out is `DISABLE_TELEMETRY=1`. Installation and indexing do not establish a host conversation test or a directory endorsement. Existing [host validation](hosts/HOST-VALIDATION.md) distinguishes the checks actually performed.

Each package includes its license. Only reviewed adapter manifests, workflow instructions, authored example code, sanitized test receipts, documentation, and branding are distributed here. The hosted skill catalog, catalog bodies, private website implementation, account data, and service credentials are not included. The package license does not grant rights to separately hosted catalog content or imply a service subscription. A direct MCP installation supplies transport; it is not a Marketplace listing or approval.

[SkillDB catalog](https://skilldb.dev/skills) · [Privacy](https://skilldb.dev/privacy) · [Terms](https://skilldb.dev/terms) · [Support](mailto:dev_chad@skilldb.dev)
