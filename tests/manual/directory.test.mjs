import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateRepositoryRegistry } from '../../scripts/manual/lib/repositories.mjs';

const registry = validateRepositoryRegistry(JSON.parse(
  await readFile(new URL('../../src/data/manual/repositories.json', import.meta.url), 'utf8'),
));
const { buildStaticSidebar } = await import('../../scripts/manual/lib/sidebar.mjs').catch(() => ({}));

test('global sidebar promotes every repository manual between Ecosystem and Blog', () => {
  assert.equal(typeof buildStaticSidebar, 'function', 'buildStaticSidebar must be implemented');

  const sidebar = buildStaticSidebar(registry);
  assert.deepEqual(sidebar.map(({ label }) => label), ['Start', 'Ecosystem', 'Manuals', 'Blog']);
  assert.deepEqual(sidebar.map(({ translations }) => translations.ko), ['시작', '생태계', '매뉴얼', '블로그']);

  const ecosystem = sidebar.find(({ label }) => label === 'Ecosystem');
  assert.deepEqual(
    ecosystem.items.map(({ label }) => label),
    ['Repositories', 'Ecosystem Atlas', 'Examples', 'Version Governance'],
  );

  const manuals = sidebar.find(({ label }) => label === 'Manuals');
  assert.deepEqual(
    manuals.items.map(({ label }) => label),
    ['Manual Home', ...registry.repositories.map(({ label }) => label.en)],
  );
  assert.deepEqual(
    manuals.items.map(({ translations }) => translations.ko),
    ['매뉴얼 홈', ...registry.repositories.map(({ label }) => label.ko)],
  );
  assert.deepEqual(
    manuals.items.slice(1).map(({ link }) => link),
    registry.repositories.map(({ route }) => route.en),
  );
  assert.deepEqual(
    manuals.items.slice(1).map(({ link }) => `/ko${link}`),
    registry.repositories.map(({ route }) => route.ko),
  );
});
