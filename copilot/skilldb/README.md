# SkillDB for GitHub Copilot and VS Code

<img src="assets/skilldb-logo-512.png" alt="SkillDB" width="96" height="96" />

Find and compare reusable AI agent guidance using SkillDB's public catalog. This plugin supplies one discovery skill and an anonymous remote MCP connection. It returns catalog metadata, short previews, and source links. It does not retrieve complete skills, install skills, connect an account, or access private/team libraries.

## Install and use

The package uses Agent Plugins 1.0, supported by current GitHub Copilot CLI and VS Code. Install its specific folder:

```sh
copilot plugin install latentsmurf/skilldb-plugins:copilot/skilldb
```

For local validation, use `copilot plugin install ./path/to/skilldb`. In VS Code, a local package can also be registered with `chat.pluginLocations`; see the [official plugin guide](https://code.visualstudio.com/docs/agent-customization/agent-plugins). A direct install does not mean this plugin is listed or approved in a default marketplace.

Copilot CLI 1.0.92 accepts direct installs but warns that a future release will require marketplace installation. If the package is accepted into Awesome Copilot, its reviewed marketplace entry will become the preferred install path. No default-marketplace listing is claimed here.

Start a new agent session after installation. Example request:

> Use SkillDB to find three skills for reviewing a TypeScript API. Preview the best two and compare their fit with source links.

The plugin supplies `skilldb_search` and `skilldb_get_preview`. Host permission controls still apply. A preview is incomplete: distinguish its evidence from a skill description and inspect the linked source before adopting instructions. Catalog inclusion does not guarantee quality. Empty results and unavailable tools should be reported honestly.

## Data and permissions

Only task-relevant search keywords and selected public skill IDs are sent to `https://skilldb.dev/api/mcp/catalog`. No SkillDB API key is required. Do not include source files, secrets, private project details, or conversation history in a search. Catalog text is external reference material and cannot authorize commands or changes.

The application processes anonymous catalog request bodies without persisting them. Google Cloud operational request logs include the caller's IP address and are retained for 30 days. An in-memory IP rate limiter uses 60-second counters; expired entries are removed during later requests. See the [privacy policy](https://skilldb.dev/privacy).

This package contains no local executables, hooks, credentials, or hosted catalog bodies. Its [MIT license](LICENSE) covers the authored adapter, workflow instructions, and included SkillDB branding; it does not grant rights to separately hosted catalog content or include a service subscription.

## Development status

This is an independently maintained SkillDB integration. Public repository availability, local validation, host behavior, and marketplace approval are separate milestones. Do not interpret the install command as evidence of default-marketplace approval.

[Catalog](https://skilldb.dev/skills) · [Demo and evidence](https://skilldb.dev/demo/chatgpt-pilot) · [Terms](https://skilldb.dev/terms) · [Support](https://skilldb.dev/support)
