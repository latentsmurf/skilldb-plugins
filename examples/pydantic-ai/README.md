# A Pydantic AI skill-discovery queue for source review

This example uses `pydantic-ai-skills` to load an authored review procedure, then Pydantic AI's native `MCPToolset` to find candidate skills in SkillDB. It returns exact IDs, source links and incomplete-preview labels for an operator to review before deciding what enters a trusted skill library.

The distinction is visible in the actual agent tool calls:

```text
load_capability(candidate-review)
read_skill_resource(candidate-review, review-checklist)
skilldb_search(public task keywords)
skilldb_get_preview(exact returned ID)
structured review queue
```

Only `candidate-review`, defined in this example's Python source, becomes a loaded skill. Remote results remain reference data. The catalog is not a `GitSkillsRegistry` or complete skill source. An operator would separately assess the linked page, obtain appropriate complete source, and decide whether it belongs in their library. This example stops before that decision.

## Run without a paid model

Use Python 3.11 or newer. The observed environment was Windows with Python 3.14.6. From a directory containing these example files:

```sh
python -m venv .venv
# Windows PowerShell:
.venv/Scripts/python -m pip install -r requirements.txt
.venv/Scripts/python -m unittest -v
.venv/Scripts/python discover.py "react accessibility" --check-empty
# macOS/Linux: use .venv/bin/python for these three commands.
```

The tested API packages are pinned: Pydantic AI slim 2.60.0, pydantic-ai-skills 2.1.0, harness 0.60.0, FastMCP 4.1.3 and MCP SDK 2.3.0. The requirements pin these packages, not every transitive dependency.

The script deliberately uses a **scripted `FunctionModel`**, with `models.ALLOW_MODEL_REQUESTS = False`, and does not configure any provider model. No SkillDB account or model credentials are needed. It exercises real framework dispatch and live MCP calls; it does not measure LLM judgment or answer quality. The successful path has five local FunctionModel steps. The empty path has four. These are local fixture steps, not paid provider calls.

The only application endpoint is `https://skilldb.dev/api/mcp/catalog`, over Streamable HTTP. `Client(..., mode='legacy')` uses the endpoint's initialization protocol. A 20-second client timeout and a 90-second run timeout bound failures. Installation downloads dependencies from PyPI. Pydantic AI may print a startup banner to stderr; its `PYDANTIC_AI_NO_BANNER=1` setting hides that banner without changing the test.

## What the package integration demonstrates

`review_capability()` constructs a programmatic `Skill` with a static `SkillResource`. `SkillsCapability(..., scripts=False, require_loaded=True)` supplies the deferred instruction load and the on-demand resource read. The resource is the included [review checklist](review-checklist.md). No script-execution tool is exposed.

`MCPToolset` supplies the two catalog tools to the same agent. The fixture selects the first returned search result deterministically, previews its exact ID and emits a Pydantic `ReviewQueue` through the agent's structured output tool. This selection is a test fixture, not a relevance ranking or recommendation.

The script checks tool names and read-only annotations, successful tool returns, matching call IDs, exact preview ID and source URL, `access: preview`, bounded excerpt length, and the absence of full content. An empty search yields an empty queue without a preview call. Connection, tool and schema failures exit unsuccessfully instead of becoming “no matches.” With Pydantic AI 2.60, failures can be represented by `ToolReturnPart.outcome`; the example checks that field and rejects retry feedback.

The output omits preview text and dedicated instruction/content/registry fields. Other strings such as titles remain untrusted catalog metadata; their inclusion is not a security certification. `include_instructions=False` prevents the remote server's instructions from becoming agent instructions. The authored review skill is the only skill the scripted model loads.

## Observed result and checks

The October 23, 2026 live run for `react accessibility` produced one reference:

```json
{
  "id": "testing-services-skills/testing-library.md",
  "title": "Testing Library",
  "source_url": "https://skilldb.dev/skills/testing-services-skills/testing-library",
  "preview_characters": 203,
  "access": "preview",
  "review_status": "pending_source_review"
}
```

See [validation-receipt.json](validation-receipt.json) for the exact versions, call sequence and empty control. It contains no excerpt text or conversation dump. Five offline tests cover resource access before loading, disabled script-tool exposure, failed/retried/mismatched tool returns, incomplete-preview boundaries, and omission of instruction-like excerpt text. Those tests use synthetic fixtures; they are not additional live catalog results.

These checks establish deterministic agent integration. They do not establish natural-language model behavior, independent use, project endorsement, a loaded remote skill, or successful source review.

## Access and review boundaries

SkillDB's anonymous catalog provides public metadata, short incomplete previews and source links. It does not install or execute skills, return full skill bodies, or access private/team data. The authenticated `https://skilldb.dev/api/mcp` service is separate, and full-content access there has plan requirements. A catalog-page URL is not a Git repository or a `SKILL.md` URL.

Search keywords and chosen public IDs go to SkillDB. Use only public task keywords; do not include secrets or private source code. [Privacy information](https://skilldb.dev/privacy).

The authored files use the included [MIT license](LICENSE). It does not relicense catalog content or the dependencies.

## Current upstream references

- [Pydantic AI MCP client/toolsets](https://pydantic.dev/docs/ai/mcp/client/)
- [Pydantic AI FunctionModel testing guidance](https://pydantic.dev/docs/ai/guides/testing/)
- [pydantic-ai-skills programmatic skills](https://dougtrajano.github.io/pydantic-ai-skills/programmatic-skills/)
- [pydantic-ai-skills current capability and resource API](https://github.com/DougTrajano/pydantic-ai-skills/blob/cc4ed1559ada58cb290d4665ca5696a78a26d003/pydantic_ai_skills/capability.py)
- [pydantic-ai-skills contribution and testing guidance](https://github.com/DougTrajano/pydantic-ai-skills/blob/cc4ed1559ada58cb290d4665ca5696a78a26d003/docs/contributing.md)
