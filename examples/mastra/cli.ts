import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { connectCatalog, createReviewDemo, queueSchema } from './workflow.ts';

const query = process.argv.slice(2).join(' ') || 'react accessibility';
const connection = await connectCatalog();
try {
  const run = await createReviewDemo(connection.catalog).createRun();
  let result = await run.start({ inputData: { query } });
  // The suspended review step makes no further network calls.
  await connection.disconnect();
  if (result.status === 'suspended') {
    const queue = queueSchema.parse(result.steps['select-sources']?.suspendPayload);
    console.log(JSON.stringify(queue, null, 2)); // Escape untrusted text; never execute it.
    if (!stdin.isTTY) throw new Error('Run interactively to select sources, or use npm run validate:live for scripted validation.');
    const prompt = createInterface({ input: stdin, output: stdout });
    try {
      const answer = await prompt.question('IDs to inspect, comma-separated (Enter selects none): ');
      const selectedIds = answer.trim() ? answer.split(',').map(id => id.trim()) : [];
      result = await run.resume({ step: 'select-sources', resumeData: { selectedIds } });
    } finally {
      prompt.close();
    }
  }
  if (result.status !== 'success') throw new Error(`Workflow ended with status ${result.status}`);
  console.log(JSON.stringify(result.result, null, 2));
} finally {
  await connection.disconnect();
}
