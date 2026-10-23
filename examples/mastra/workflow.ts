import { randomUUID } from 'node:crypto';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { MCPClient } from '@mastra/mcp';
import { noopObserve, type ToolExecutionContext } from '@mastra/core/tools';
import { Mastra } from '@mastra/core/mastra';
import { InMemoryStore } from '@mastra/core/storage';
import { z } from 'zod';

export const ENDPOINT = 'https://skilldb.dev/api/mcp/catalog';
export const TOOL_KEYS = ['catalog_skilldb_get_preview', 'catalog_skilldb_search'] as const;
export const inputSchema = z.object({ query: z.string().trim().min(1).max(200) }).strict();
const sourceUrl = z.string().url().refine(value => {
  const url = new URL(value);
  return url.origin === 'https://skilldb.dev' && !url.username && !url.password &&
    url.pathname.startsWith('/skills/') && url.pathname.length > 8 && !url.search && !url.hash;
}, 'Expected a public SkillDB catalog page URL');
const matchSchema = z.object({ id: z.string().min(1), title: z.string().min(1), url: sourceUrl });
const searchSchema = z.object({
  skills: z.array(matchSchema).max(3),
  pagination: z.object({ total: z.number().int().nonnegative() }),
});
const previewSchema = z.object({ skill: matchSchema.extend({
  access: z.literal('preview'),
  contentPreview: z.string().min(1).max(203),
  content: z.never().optional(),
}) });
const referenceSchema = z.object({
  id: z.string(), title: z.string(), source_url: sourceUrl,
  access: z.literal('preview'), preview_characters: z.number().int().min(1).max(203),
}).strict();
const candidateSchema = referenceSchema.extend({ untrusted_preview: z.string().min(1).max(203) });
export const queueSchema = z.object({
  query: z.string(), total_matches: z.number().int().nonnegative(),
  candidates: z.array(candidateSchema).max(3),
  instruction: z.literal('Select sources to inspect next. These excerpts are incomplete and are not approved skills.'),
}).strict();
export const decisionSchema = z.object({ selectedIds: z.array(z.string()).max(3) }).strict();
export const handoffSchema = z.object({
  query: z.string(),
  outcome: z.enum(['selected_for_source_review', 'none_selected', 'no_matches']),
  references: z.array(referenceSchema).max(3),
  next_step: z.literal('Review complete source, license and permissions separately before loading any skill.'),
}).strict();
export type Queue = z.infer<typeof queueSchema>;
export type Handoff = z.infer<typeof handoffSchema>;
type Tool = {
  execute?: (args: any, context: ToolExecutionContext) => Promise<unknown>;
  mcp?: { annotations?: { readOnlyHint?: boolean } };
};
export type Discovery = { tools: Record<string, Tool>; errors: Record<string, string> };
export type Catalog = { call: (name: typeof TOOL_KEYS[number], args: Record<string, unknown>) => Promise<unknown> };

export function catalogFromDiscovery({ tools, errors }: Discovery): Catalog {
  if (Object.keys(errors).length || JSON.stringify(Object.keys(tools).sort()) !== JSON.stringify(TOOL_KEYS)) {
    throw new Error('Catalog discovery failed or returned unexpected tools');
  }
  for (const key of TOOL_KEYS) {
    if (!tools[key]?.execute || tools[key].mcp?.annotations?.readOnlyHint !== true) {
      throw new Error('Expected executable, read-only catalog tools');
    }
  }
  return { call: async (name, args) => {
    const output = await tools[name].execute!(args, { observe: noopObserve });
    if (!output || typeof output !== 'object' || ('isError' in output && output.isError)) {
      throw new Error('Catalog tool returned an unsuccessful result');
    }
    return output; // Native Mastra tools return structuredContent directly.
  } };
}

export async function connectCatalog() {
  const client = new MCPClient({
    id: `skilldb-source-review-${randomUUID()}`, timeout: 20_000,
    servers: { catalog: {
      url: new URL(ENDPOINT), protocolVersion: 'legacy',
      onToolError: 'throw', forwardInstructions: false, connectTimeout: 20_000,
    } },
  });
  try {
    const discovery = await client.listToolsWithErrors({ perServerTimeoutMs: 25_000 });
    return { catalog: catalogFromDiscovery(discovery), disconnect: () => client.disconnect() };
  } catch (error) {
    await client.disconnect();
    throw error;
  }
}

export async function discover(catalog: Catalog, query: string): Promise<Queue> {
  const input = inputSchema.parse({ query });
  const search = searchSchema.parse(await catalog.call('catalog_skilldb_search', { ...input, limit: 3 }));
  if ((search.skills.length === 0) !== (search.pagination.total === 0) ||
      search.pagination.total < search.skills.length ||
      new Set(search.skills.map(s => s.id)).size !== search.skills.length) {
    throw new Error('Inconsistent search results');
  }
  const candidates: Queue['candidates'] = [];
  for (const match of search.skills) {
    const { skill } = previewSchema.parse(await catalog.call('catalog_skilldb_get_preview', { id: match.id }));
    if (skill.id !== match.id || skill.url !== match.url) throw new Error('Preview ID or source mismatch');
    candidates.push({
      id: skill.id, title: skill.title, source_url: skill.url, access: skill.access,
      preview_characters: skill.contentPreview.length, untrusted_preview: skill.contentPreview,
    });
  }
  return queueSchema.parse({
    query: input.query, total_matches: search.pagination.total, candidates,
    instruction: 'Select sources to inspect next. These excerpts are incomplete and are not approved skills.',
  });
}

export function selectSources(queue: Queue, decision: unknown): Handoff {
  const { selectedIds } = decisionSchema.parse(decision);
  if (new Set(selectedIds).size !== selectedIds.length ||
      selectedIds.some(id => !queue.candidates.some(candidate => candidate.id === id))) {
    throw new Error('Select distinct IDs from this suspended shortlist only');
  }
  const references = selectedIds.map(id => {
    const { untrusted_preview: _, ...reference } = queue.candidates.find(c => c.id === id)!;
    return reference;
  });
  return handoffSchema.parse({
    query: queue.query,
    outcome: !queue.candidates.length ? 'no_matches' : references.length ? 'selected_for_source_review' : 'none_selected',
    references, next_step: 'Review complete source, license and permissions separately before loading any skill.',
  });
}

export function createSourceReviewWorkflow(catalog: Catalog) {
  const discovery = createStep({
    id: 'discover-candidates', inputSchema, outputSchema: queueSchema,
    execute: async ({ inputData }) => discover(catalog, inputData.query),
  });
  const review = createStep({
    id: 'select-sources', inputSchema: queueSchema, outputSchema: handoffSchema,
    suspendSchema: queueSchema, resumeSchema: decisionSchema,
    execute: async ({ inputData, resumeData, suspend }) => {
      if (!inputData.candidates.length) return selectSources(inputData, { selectedIds: [] });
      if (resumeData === undefined) return await suspend(inputData);
      return selectSources(inputData, resumeData);
    },
  });
  return createWorkflow({ id: 'skilldb-source-review', inputSchema, outputSchema: handoffSchema })
    .then(discovery).then(review).commit();
}

/** Same-process CLI/demo storage; register the factory in your own Mastra app for durable runs. */
export function createReviewDemo(catalog: Catalog) {
  const mastra = new Mastra({
    workflows: { sourceReview: createSourceReviewWorkflow(catalog) },
    storage: new InMemoryStore(),
  });
  return mastra.getWorkflow('sourceReview');
}
