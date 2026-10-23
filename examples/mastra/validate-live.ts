import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import {
  connectCatalog, createReviewDemo, ENDPOINT, TOOL_KEYS, queueSchema, handoffSchema,
  type Catalog,
} from './workflow.ts';

const connection = await connectCatalog();
const calls: string[] = [];
const catalog: Catalog = { call: async (name, args) => {
  calls.push(name);
  return connection.catalog.call(name, args);
} };
try {
  const workflow = createReviewDemo(catalog);
  const run = await workflow.createRun();
  const suspended = await run.start({ inputData: { query: 'react accessibility' } });
  assert.equal(suspended.status, 'suspended');
  const queue = queueSchema.parse(suspended.steps['select-sources']?.suspendPayload);
  assert.ok(queue.candidates.length > 0);
  const callsBeforeResume = calls.length;
  // A scripted selection tests mechanics. It is not a human source review.
  const resumed = await run.resume({
    step: 'select-sources', resumeData: { selectedIds: [queue.candidates[0].id] },
  });
  assert.equal(resumed.status, 'success');
  if (resumed.status !== 'success') throw new Error('Resume failed');
  const handoff = handoffSchema.parse(resumed.result);
  assert.equal(handoff.outcome, 'selected_for_source_review');
  assert.equal(calls.length, callsBeforeResume);
  const callsDuringResume = calls.length - callsBeforeResume;
  const primaryCalls = [...calls];
  calls.length = 0;
  const emptyRun = await workflow.createRun();
  const empty = await emptyRun.start({ inputData: { query: 'zzskilldb-mastra-no-match-20261023' } });
  assert.equal(empty.status, 'success');
  if (empty.status !== 'success') throw new Error('Empty control failed');
  assert.equal(empty.result.outcome, 'no_matches');
  assert.deepEqual(calls, ['catalog_skilldb_search']);
  const pkg = JSON.parse(await readFile(new URL('./package.json', import.meta.url), 'utf8'));
  const receipt = {
    checked_at_utc: new Date().toISOString(), node: process.version,
    versions: pkg.dependencies, overrides: pkg.overrides, endpoint: ENDPOINT, tools: TOOL_KEYS,
    scope: 'Live native Mastra workflow and MCP calls; scripted source selection, no LLM or human review.',
    primary: {
      initial_status: suspended.status, final_status: resumed.status, total_matches: queue.total_matches,
      candidates: queue.candidates.map(({ untrusted_preview: _, ...reference }) => reference),
      tool_call_sequence: primaryCalls, calls_during_resume: callsDuringResume, handoff,
    },
    empty_control: { result: empty.result, tool_call_sequence: [...calls] },
  };
  const output = JSON.stringify(receipt, null, 2) + '\n';
  // The receipt deliberately excludes all excerpt text and raw workflow snapshots.
  await writeFile(new URL('./live-receipt.local.json', import.meta.url), output);
  console.log(output);
} finally {
  await connection.disconnect();
}
