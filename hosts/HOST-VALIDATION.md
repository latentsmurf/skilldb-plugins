# Host validation

Observed October 5, 2026. Public package tested: [commit b9d4da827896e3e4e4a94dc309f6360f930cd95b](https://github.com/latentsmurf/skilldb-plugins/commit/b9d4da827896e3e4e4a94dc309f6360f930cd95b). These results distinguish installation, transport, and model behavior.

| Host or check | Observed result | Limit |
| --- | --- | --- |
| Continue configuration | Official `@continuedev/config-yaml` 1.42.0 accepted the [YAML block](continue/skilldb-catalog.yaml) using both `parseBlock` and `parseConfigYaml`. | Format validation alone does not prove host behavior. |
| Continue CLI 1.5.47 | The actual CLI advertised both catalog tools, called live `skilldb_search`, passed an exact returned skill ID into live `skilldb_get_preview`, and received an excerpt and public source URL. | A deterministic loopback model fixture requested the tool calls. This tests real host transport/dispatch, not a real LLM's activation, judgment, ranking, or recommendation. |
| goose CLI 1.53.0 | Installed the public root package at the commit above and imported `skilldb:find-skills`. | MCP auto-registration and successful remote tool calls were not established. A model was not configured; `goose doctor` reported that limitation. No successful model conversation is claimed. |
| Public Catalog MCP | Handshake, exact two-tool listing, search, preview, source links, empty results, and read-only access-boundary checks passed. | Direct protocol testing is separate from a host/model evaluation. |
| Kiro, Devin/Cascade, JetBrains AI Assistant, LM Studio, Zed | Configuration templates reviewed against current official host documentation. | Actual host installation and tool calls are untested. Zed's anonymous connection behavior needs an explicit check. |
| Kiro, LM Studio, goose install links | Encoded payloads round-trip to exactly `https://skilldb.dev/api/mcp/catalog`. | No deep link was tested through its host UI. |

CLI validation used isolated test homes. Continue was installed from the official npm package without lifecycle scripts. The goose Windows release archive matched the official SHA-256 digest `3a951c661f12415f7947daac2bb4651af1a7b41532f34d7c2f05ea6636eadaa9`. The Continue fixture used no real model API or account credentials.

For a complete host test, connect the template and ask:

> Use SkillDB to find three skills for reviewing a TypeScript API. Preview the best two and compare their fit with source links.

Verify actual tool calls, exact returned IDs, relevant source links, and clear excerpt limitations. Also test an unsupported installation request and a deliberately nonexistent search. No configuration grants full-content retrieval, execution, account access, or installation of catalog skills.

The goose project [retired new submissions to its own directory](https://github.com/aaif-goose/goose/discussions/10830) in favor of the Official MCP Registry. Kiro Powers supports the [Agent Plugins format](https://kiro.dev/docs/powers/create/), but a format match is not a Kiro listing or a completed Kiro test.

Configuration sources: [Continue](https://docs.continue.dev/customize/deep-dives/mcp), [goose](https://goose-docs.ai/docs/getting-started/using-extensions/), [Kiro](https://kiro.dev/docs/mcp/configuration/), [Kiro install links](https://kiro.dev/docs/mcp/servers/), [Devin/Cascade](https://docs.devin.ai/desktop/cascade/mcp), [JetBrains](https://www.jetbrains.com/help/ai-assistant/mcp.html), [LM Studio](https://lmstudio.ai/docs/app/mcp), [LM Studio deep links](https://lmstudio.ai/docs/app/mcp/deeplink), [Zed](https://zed.dev/docs/ai/mcp).
