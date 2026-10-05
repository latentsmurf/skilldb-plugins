# SkillDB public catalog host configurations

![SkillDB](assets/skilldb-logo-512.png)

These configurations connect to the anonymous SkillDB Catalog endpoint. They expose `skilldb_search` and `skilldb_get_preview` for public metadata and short excerpts. They do not install or execute skills, return full catalog content, link an account, or access private/team skills. No API key or local MCP process is required.

Merge the relevant server entry into an existing host configuration; do not replace unrelated settings. The configurations do not grant automatic tool approval. Host policy and model access still apply.

| Host | Configuration | Where to use it | Verification |
| --- | --- | --- | --- |
| Continue | [skilldb-catalog.yaml](continue/skilldb-catalog.yaml) | Save as `.continue/mcpServers/skilldb-catalog.yaml` inside the chosen workspace. Uses Continue's metadata preamble and `streamable-http`. | [Real CLI tool dispatch passed using a scripted local model fixture](HOST-VALIDATION.md). Real LLM conversation untested. |
| goose | [config.yaml](goose/config.yaml) | Merge the extension into goose's `config.yaml`, or use its remote Streamable HTTP extension UI. | [Public plugin skill install passed](HOST-VALIDATION.md). Remote tool invocation and model conversation untested. |
| Devin Desktop / Cascade (formerly Windsurf) | [mcp_config.json](devin-cascade/mcp_config.json) | Open Cascade's Actions menu, then Open MCP config file. Current documented Windows path is `%APPDATA%\devin\mcp_config.json`; older Windsurf builds can have different paths. | Documentation reviewed; actual host untested. |
| Kiro | [mcp.json](kiro/mcp.json) | Merge into `.kiro/settings/mcp.json` or `~/.kiro/settings/mcp.json`. | Documentation reviewed; actual host untested. |
| JetBrains AI Assistant | [mcp.json](jetbrains/mcp.json) | Add this configuration under AI Assistant's Model Context Protocol settings, choosing Streamable HTTP. | Documentation reviewed; actual host untested. |
| LM Studio | [mcp.json](lm-studio/mcp.json) | Program sidebar → Install → Edit mcp.json. Requires a model able to use tools. | Documentation reviewed; actual host untested. |
| Zed | [settings.json](zed/settings.json) | Agent panel settings → Add Server → Add Remote Server, or merge the entry into settings. | Documentation reviewed; actual host untested. Test anonymous connection before promoting; Zed's docs also describe OAuth prompting for remote servers. Do not add a fake bearer token. |

For VS Code/Copilot, use the already published [Copilot adapter](https://github.com/latentsmurf/skilldb-plugins/tree/b9d4da827896e3e4e4a94dc309f6360f930cd95b/copilot/skilldb). The public repository root also uses the Agent Plugins format that current Kiro Powers documentation supports. That format match does not establish Kiro host testing or directory approval.

The [install-links.json](install-links.json) file contains documented Kiro, LM Studio, and goose installation links. Their payloads have been checked; launching them in the actual host UI remains untested. Always review the host's installation prompt.

To import the public discovery skill into goose:

```sh
goose plugin install https://github.com/latentsmurf/skilldb-plugins
```

The observed installation imported `skilldb:find-skills`. Configure the remote extension separately using the YAML above, or start a session with the documented option:

```sh
goose session --with-streamable-http-extension https://skilldb.dev/api/mcp/catalog
```

The second command requires your own configured goose model; it is documented setup guidance, not a completed model test.

Try this after connecting:

> Use SkillDB to find three skills for reviewing a TypeScript API. Preview the best two and compare their fit with source links.

Check that the host exposes exactly the two catalog tools, searches successfully, previews an exact returned ID, and explains that a preview is an excerpt. Ask for a deliberately nonexistent framework to check that empty results remain honest. Do not describe these configurations as host-tested unless the evidence record says so.

Branding for a listing: [SkillDB logo](https://skilldb.dev/logo/skilldb-logo-square-512.png), [demo](https://skilldb.dev/demo#chatgpt-pilot), [public MIT package repository](https://github.com/latentsmurf/skilldb-plugins). The demo records ChatGPT behavior; it is not evidence for the hosts above.

These configuration files and authored documentation are [MIT licensed](LICENSE). That license does not relicense the separately hosted SkillDB catalog. Direct installation does not imply marketplace approval or host endorsement.

The workflow sends search keywords and selected public skill IDs to SkillDB. Avoid secrets and private source code in search queries. See [Privacy](https://skilldb.dev/privacy) and contact [SkillDB support](mailto:dev_chad@skilldb.dev).
