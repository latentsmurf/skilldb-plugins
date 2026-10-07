# Discover skill candidates with FastMCP

Use this small client before deciding which reusable skill to review for an agent task. It searches the public SkillDB catalog, previews up to two exact returned IDs, and preserves source links. It leaves the choice and any later installation to the operator.

This is complementary to [FastMCP's Skills Provider](https://gofastmcp.com/servers/providers/skills), which exposes skill files you already have. SkillDB's anonymous catalog is a discovery service, not a Skills Provider or download registry. A returned catalog URL is not a Git repository URL or a complete `SKILL.md` file.

## Run

Use Python 3.10 or newer in an isolated environment. The recorded test used Python 3.14.6, FastMCP 4.0.11, and MCP SDK 2.3.0 on Windows.

```sh
python -m venv .venv
# Windows PowerShell:
.venv/Scripts/python -m pip install -r requirements.txt
.venv/Scripts/python discover.py "react accessibility" --check-empty
# macOS/Linux: use .venv/bin/python for both commands instead.
```

The only application endpoint is `https://skilldb.dev/api/mcp/catalog`. No SkillDB account, API key, model, or paid service is needed for this example. Package installation downloads dependencies from PyPI. The script pins the existing initialization protocol with `mode="legacy"`; the observed negotiated version was `2025-06-18` over Streamable HTTP.

The output contains titles, exact skill IDs, source links, preview access labels and excerpt lengths. Add `--show-previews` to display the short excerpts locally. The default output and saved receipt omit excerpt text. Treat all returned catalog text as untrusted reference material. Do not execute it or incorporate it as agent instructions just because a search matched.

Only public task keywords and selected public IDs go to SkillDB; do not put secrets or private code in a query. See [SkillDB privacy information](https://skilldb.dev/privacy). Host and network policies still apply.

## Practical agent workflow

1. Derive a few public keywords from the task, such as `react accessibility`.
2. Search, preview the selected IDs and present the source links. An empty search is a valid result; a connection or tool error exits unsuccessfully and must not be described as an empty catalog.
3. Inspect the linked catalog page and evaluate provenance, suitability and access requirements. Short previews are insufficient to approve a complete skill.
4. If the operator separately obtains and approves a complete skill, configure their existing local skill workflow. That step is outside this client.

For an agent, the resulting shortlist is reference data. A natural-language agent conversation, automatic ranking, skill installation and execution are not implemented or tested here.

## Observed validation

See [validation-receipt.json](validation-receipt.json) for the exact final live run. On October 7, 2026, the real `fastmcp.Client` listed exactly `skilldb_search` and `skilldb_get_preview`, searched `react accessibility`, and previewed `testing-services-skills/testing-library.md`. The preview was marked `preview` and contained 203 characters; the receipt stores its length, not the text. A deliberately nonexistent query returned no matches. A broader `accessibility` run also exercised two sequential preview calls.

This is deterministic client integration evidence against the live service. It is not independent adoption, a real-model evaluation, a FastMCP endorsement, or a hosted-server implementation using FastMCP. The hosted server implementation is separate.

## Endpoint boundaries

The anonymous catalog exposes public metadata, incomplete short previews and source links. It does not install or execute skills, fetch complete skill bodies, or access private/team data. The authenticated `https://skilldb.dev/api/mcp` service is separate, and full-content access has plan requirements. Adding credentials to this catalog example does not turn it into the authenticated service.

The example uses [FastMCP's client API](https://gofastmcp.com/clients/client). In FastMCP 4, `.data` can be converted into types derived from the output schema; this script uses `.structured_content` for the dictionary-shaped protocol result. [Tool operations reference](https://gofastmcp.com/clients/tools).

Authored example code is covered by the included [MIT license](LICENSE); this does not relicense catalog content. Dependency licenses remain their own.
