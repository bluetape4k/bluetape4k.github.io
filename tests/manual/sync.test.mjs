import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSnapshot } from '../../scripts/manual/sync-manual.mjs';

test('real source produces bilingual deterministic snapshot data', async () => {
  const source = process.env.BLUETAPE4K_PROJECTS_SOURCE;
  if (!source) return test.skip('BLUETAPE4K_PROJECTS_SOURCE is not set');
  const first = await buildSnapshot({ source });
  const second = await buildSnapshot({ source });
  assert.deepEqual(first, second);
  assert.equal(first.snapshot.contentFiles, 186);
  assert.equal(first.contentEntries.filter((entry) => /\/modules\//.test(entry.path)).length, 180);
});
