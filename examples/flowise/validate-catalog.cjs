#!/usr/bin/env node
'use strict';

// Deterministic component integration check. No model or Flowise server is used.
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const packageRoot = path.resolve(process.argv[2] || path.join(__dirname, 'package'));
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'mcp-server-config.json'), 'utf8'));
const expectedHashes = {
  'dist/nodes/tools/MCP/core.js': 'b976824e21d83268f7f89a951a809ae7a083dacfdc1ef8aba9a11a730bc577c5',
  'dist/src/httpSecurity.js': 'e09d16a61941343e3615b4ee7ffd84209be7374f54841db3180a9aa839820a63'
};

function readResult(raw) {
  const blocks = JSON.parse(raw);
  assert(Array.isArray(blocks), 'Expected Flowise MCPTool JSON content blocks');
  const texts = blocks.filter(block => block.type === 'text');
  assert.equal(texts.length, 1, 'Expected one catalog JSON text result');
  return JSON.parse(texts[0].text);
}

function publicUrl(value) {
  const url = new URL(value);
  assert.equal(url.protocol, 'https:');
  assert.equal(url.hostname, 'skilldb.dev');
  assert(url.pathname.startsWith('/skills/'));
  return value;
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  assert.equal(manifest.name, 'flowise-components');
  assert.equal(manifest.version, '3.1.4', 'This evidence fixture is pinned to Flowise components 3.1.4');
  for (const [relative, expected] of Object.entries(expectedHashes)) {
    const actual = createHash('sha256').update(fs.readFileSync(path.join(packageRoot, relative))).digest('hex');
    assert.equal(actual, expected, `Unexpected bytes in ${relative}; do not report this as the pinned validation`);
  }
  assert.deepEqual(config, { url: 'https://skilldb.dev/api/mcp/catalog' });
  const { MCPToolkit, validateMCPServerConfig } = require(path.join(packageRoot, 'dist/nodes/tools/MCP/core.js'));
  validateMCPServerConfig(config);

  // CustomMCP in 3.1.4 uses the historical label "sse" for remote URLs.
  // Its unchanged MCPToolkit tries Streamable HTTP first, then legacy SSE.
  const toolkit = new MCPToolkit(config, 'sse');
  await toolkit.initialize();
  const tools = new Map(toolkit.tools.map(tool => [tool.name, tool]));
  assert.deepEqual([...tools.keys()].sort(), ['skilldb_get_preview', 'skilldb_search']);

  const query = 'react accessibility';
  const search = readResult(await tools.get('skilldb_search').invoke({ query, limit: 3 }));
  assert(Array.isArray(search.skills) && search.skills.length > 0, 'Expected a live result; catalog contents can change');
  const selected = search.skills[0];
  assert.equal(typeof selected.id, 'string');
  const preview = readResult(await tools.get('skilldb_get_preview').invoke({ id: selected.id })).skill;
  assert(preview, 'Expected a public preview object');
  assert.equal(preview.id, selected.id, 'Preview must use the exact live search result ID');
  assert.equal(preview.access, 'preview');
  assert.equal(typeof preview.contentPreview, 'string');
  assert(preview.contentPreview.length > 0);
  assert(!Object.hasOwn(preview, 'content'), 'Full content was not expected');
  publicUrl(selected.url);
  publicUrl(preview.url);

  const empty = readResult(await tools.get('skilldb_search').invoke({ query: 'zzskilldb-flowise-no-match-20261007', limit: 2 }));
  assert.deepEqual(empty.skills, []);
  assert.equal(empty.pagination.total, 0);
  assert.equal(empty.pagination.hasMore, false);

  // Deliberately omit excerpt text, credentials, and conversations from the receipt.
  console.log(JSON.stringify({
    checkedAt: new Date().toISOString(),
    status: 'passed',
    scope: 'deterministic-flowise-mcp-toolkit-component-integration',
    node: process.version,
    package: `${manifest.name}@${manifest.version}`,
    endpoint: config.url,
    credentialsUsed: false,
    modelUsed: false,
    flowiseServerOrUiUsed: false,
    tools: [...tools.keys()].sort(),
    search: { query, returned: search.skills.length, total: search.pagination.total },
    preview: { id: preview.id, access: preview.access, excerptCharacters: preview.contentPreview.length, url: preview.url },
    emptySearch: { returned: 0, total: 0, hasMore: false },
    upstreamFileSha256: expectedHashes
  }, null, 2));
}

// Bound failures including a dead remote transport. Connections are closed by
// Flowise's own initialize/invoke implementations before successful completion.
const timeout = setTimeout(() => {
  console.error('Catalog component validation timed out after 90 seconds');
  process.exit(1);
}, 90_000);

main().then(() => {
  clearTimeout(timeout);
  process.exit(0);
}).catch(error => {
  clearTimeout(timeout);
  console.error(`Catalog component validation failed: ${error.message}`);
  process.exit(1);
});
