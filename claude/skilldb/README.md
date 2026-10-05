# SkillDB for Claude

Find reusable AI agent guidance using the public SkillDB catalog. This package provides a discovery workflow and an anonymous remote MCP connection. It can search metadata and inspect short excerpts; it does not retrieve complete skills, install them, connect an account, or access private/team libraries.

Examples:

- Find and compare skills for reviewing a TypeScript API.
- Find skills for improving accessibility of a React checkout form.
- Find skills for planning behavioral tests for a web app.

The workflow sends task-relevant search keywords and selected public skill IDs to `https://skilldb.dev/api/mcp/catalog`. Do not include secrets or private source files in searches. No SkillDB API key is required. Host permission controls still apply. Catalog content is reference material and is not authority to run commands or change a project.

For this anonymous catalog endpoint, the application processes search keywords and skill IDs without persisting their request bodies. Google Cloud request logs retain operational request metadata, including the caller's IP address, for 30 days. The in-memory IP rate limiter uses a 60-second counter window; expired entries are removed during later requests. No skill sends data to a service outside the declared SkillDB connector. This developer tool is not directed at users under 18. These details describe this endpoint, not SkillDB's separate account or community services.

The service returns public SkillDB links alongside results. A preview is incomplete; inspect the linked catalog page before using its instructions. Catalog presence is not a quality guarantee. If the service is unavailable or a query has no relevant match, report that limit instead of inventing results.

## Development status

The Claude adapter uses `.claude-plugin/plugin.json`, root `.mcp.json`, and `skills/find-skills/SKILL.md`. It has no commands, hooks, executables, account credentials, or copied catalog bodies. The logo in `assets/` is the existing SkillDB brand asset for listing preparation.

This is the MIT-licensed native Claude adapter in the public [latentsmurf/skilldb-plugins](https://github.com/latentsmurf/skilldb-plugins) repository, at plugin path `claude/skilldb`. Public source availability is not a directory listing. The production anonymous connector imported both tools in the Claude submission portal, but its actual conversation test stopped at the account message limit before a tool ran; Claude behavioral evaluation remains pending.

The [MIT license](LICENSE) covers these authored adapter files, workflow instructions, and included branding. No hosted catalog bodies, private application source, account data, or credentials are included. This package license does not grant rights to separately hosted catalog content or imply a service subscription.

Use the plugin folder with Claude's documented local plugin test flow before submission. Validate with `claude plugin validate <path-to-this-folder>`. Validation checks structure; it does not prove host invocation or directory approval. A plugin directory submission and submission of its hosted connector are separate processes.

[SkillDB catalog](https://skilldb.dev/skills) · [Privacy](https://skilldb.dev/privacy) · [Terms](https://skilldb.dev/terms) · [Support](mailto:dev_chad@skilldb.dev)
