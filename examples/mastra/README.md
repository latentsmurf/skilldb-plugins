# Skill discovery with a human selection step in Mastra

A small TypeScript workflow for builders who want to find external skill candidates before adding anything to an agent's trusted library. It searches SkillDB's anonymous MCP catalog, shows up to three incomplete previews, suspends for source selection, then returns a compact list of links to inspect.

```text
public task keywords
  -> Mastra MCPClient: search + exact-ID previews
  -> workflow suspended: person selects sources, or selects none
  -> source-review handoff (no skill installation)
```

The interactive CLI and reusable workflow run without a model, model credentials, or a SkillDB account. The returned catalog pages are starting points for review, not Git repositories or complete `SKILL.md` files.

## Try a task you are building

Requires Node >=22.13.0. Tested on Windows with Node 24.13.1.

```sh
git clone https://github.com/latentsmurf/skilldb-plugins.git
cd skilldb-plugins/examples/mastra
npm ci --ignore-scripts
npm run check
npm test
npm run discover -- "react accessibility"
```

The CLI prints a shortlist as JSON, including `untrusted_preview` and each source URL. Paste the exact IDs you want to inspect, separated by commas; press Enter to select none. Selection means **inspect this source next**, not approved, safe, loaded or installed. Invalid or duplicate IDs fail. A genuinely empty search finishes with `no_matches` without asking for input.

Try public keywords for your own agent's task. Search keywords and selected public IDs are sent to SkillDB; don't include secrets or private code. No source-page retrieval, model request, workspace write or skill execution occurs in this example. Dependencies are downloaded from npm during setup. [SkillDB privacy information](https://skilldb.dev/privacy).

If you try it, [open a feedback issue](https://github.com/latentsmurf/skilldb-plugins/issues/new) with your Mastra version, public task/query, whether a candidate was useful enough to inspect, and any failed step. A useful negative result is welcome. Never include credentials or private source. That feedback is more useful than a star or installation count.

## Use the workflow in an existing Mastra app

The CLI uses `createReviewDemo()` with `InMemoryStore` so suspension and resumption work in one process. Closing the process loses its snapshots. For an application, register `createSourceReviewWorkflow()` with your own Mastra instance and configured storage:

```ts
import { Mastra } from '@mastra/core/mastra';
import { connectCatalog, createSourceReviewWorkflow } from './workflow.ts';

const connection = await connectCatalog();
const mastra = new Mastra({
  storage: yourConfiguredStorage,
  workflows: { sourceReview: createSourceReviewWorkflow(connection.catalog) },
});
const run = await mastra.getWorkflow('sourceReview').createRun();
const result = await run.start({ inputData: { query: 'react accessibility' } });

if (result.status === 'suspended') {
  // Display result.steps['select-sources'].suspendPayload in your UI.
  // Resume after the operator chooses IDs from that shortlist:
  const handoff = await run.resume({
    step: 'select-sources',
    resumeData: { selectedIds: idsChosenByOperator },
  });
  // Inspect handoff.status; on success use handoff.result.references.
}
// Disconnect at app shutdown (the CLI disconnects before waiting for input).
await connection.disconnect();
```

`yourConfiguredStorage` and `idsChosenByOperator` are application values, not bundled globals. Check the initial status before accessing a suspension or resuming; empty results are already successful. The example does not supply a web UI, durable database or authenticated review endpoint. A deployed app must associate resume requests with its own user/run access rules. Resume data alone is not proof that a human approved anything.

Keep discovery in the first step: resuming `select-sources` does not search or preview again. Runtime snapshots include bounded public excerpts for the selection UI. Render them as text, as the CLI does with JSON escaping. The final handoff omits excerpt text. Treat all catalog fields, including titles, as untrusted reference data if you pass them to another component.

Mastra's [agent skills](https://mastra.ai/docs/skills) load reusable instructions. This workflow stops before loading them. Review the complete source, author, license, dependencies and permissions separately; only then decide what belongs in your own trusted skill library.

## Tested behavior

```sh
npm run validate:live
```

This command runs real MCP calls and native Mastra suspension/resumption, automatically selects the first returned candidate as a **test fixture**, and checks an empty-result control. It writes `live-receipt.local.json`, with excerpts removed. It does not rank candidates, evaluate an LLM, perform human source review, or demonstrate independent adoption.

The [published receipt](validation-receipt.json) records the October 23, 2026 run: `react accessibility` returned the Testing Library candidate, the workflow suspended and resumed successfully, and resumption made zero additional catalog calls. The empty control made only a search call and returned `no_matches`.

All 15 offline tests passed. They exercise real Mastra runs plus synthetic failure fixtures: selection and rejection, no repeated network calls on resume, invalid selections, tool discovery failures, unsuccessful/malformed results, exact ID/source consistency, incomplete-preview limits and instruction-like preview text. These fixtures are not additional live catalog results. Expected failure-case tests print Mastra error logs; the test summary is authoritative.

## Dependencies and error handling

The lockfile pins the full dependency tree. Direct packages are `@mastra/core@1.79.0`, `@mastra/mcp@2.5.0` and `zod@4.6.7`. Overrides pin MCP client/core/server to `2.3.1`: Mastra 2.5.0 otherwise pins the older MCP SDK 2.2.0, which has published [client](https://github.com/advisories/GHSA-6prh-2h8m-c8cw) and [server](https://github.com/advisories/GHSA-jm63-cq47-j5jp) advisories. The overridden tree was type-checked and tested here; this is not a guarantee for other Mastra applications. The production dependency audit reported zero vulnerabilities at validation time.

`connectCatalog()` uses Streamable HTTP with `protocolVersion: 'legacy'`, 20-second request/connection timeouts and a 25-second discovery timeout. It requires exactly the two read-only catalog tools. `listToolsWithErrors()` surfaces discovery failures; `onToolError: 'throw'` and result schemas reject tool errors and validation-error objects. Failures never become an empty shortlist. Server instructions are not forwarded. The client is disconnected on success or failure.

The anonymous catalog supplies metadata, short incomplete previews and source links. It provides no full skill bodies, installation, execution or private/team access. SkillDB's separate authenticated `/api/mcp` service has different access and plan requirements.

## References and license

- [Mastra MCP client](https://mastra.ai/reference/tools/mcp-client)
- [Workflow suspend/resume](https://mastra.ai/docs/workflows/suspend-and-resume)
- [Human input in workflows](https://mastra.ai/docs/workflows/human-in-the-loop)
- [Pinned Mastra MCP implementation](https://github.com/mastra-ai/mastra/tree/4c22623ea342a0ce611e15f89f4ab8b377bf7ee8/packages/mcp)

The authored example is [MIT licensed](LICENSE). That license does not relicense catalog content or dependencies. This is a community example, not an official Mastra integration or endorsement.
