import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateRepositoryRegistry } from '../../scripts/manual/lib/repositories.mjs';

const registry = validateRepositoryRegistry(JSON.parse(
  await readFile(new URL('../../src/data/manual/repositories.json', import.meta.url), 'utf8'),
));
const configSource = await readFile(new URL('../../astro.config.mjs', import.meta.url), 'utf8');
const componentSource = await readFile(new URL('../../src/components/ManualDirectory.astro', import.meta.url), 'utf8')
  .catch(() => '');
const manualCss = await readFile(new URL('../../src/styles/manual.css', import.meta.url), 'utf8');
const englishPage = await readFile(new URL('../../src/content/docs/manual/index.mdx', import.meta.url), 'utf8')
  .catch(() => '');
const koreanPage = await readFile(new URL('../../src/content/docs/ko/manual/index.mdx', import.meta.url), 'utf8')
  .catch(() => '');
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

test('Astro installs the generated global sidebar without the Projects-only entry', () => {
  assert.match(configSource, /import \{ buildStaticSidebar \} from '.\/scripts\/manual\/lib\/sidebar\.mjs'/);
  assert.match(configSource, /const staticSidebar = buildStaticSidebar\(manualRepositories\)/);
  assert.match(configSource, /sidebar:\s*staticSidebar/);
  assert.doesNotMatch(configSource, /Bluetape4k Manual/);
});

test('manual directory renders localized registry data and task guidance for every repository', () => {
  assert.match(componentSource, /loadRepositoryRegistry/);
  assert.match(componentSource, /type ManualRepository =/);
  assert.match(componentSource, /as \{ repositories: ManualRepository\[\] \}/);
  assert.match(componentSource, /repository\.label\[locale\]/);
  assert.match(componentSource, /repository\.latestMinor/);
  assert.match(componentSource, /repository\.route\[locale\]/);
  assert.match(componentSource, /MANUAL_DIRECTORY_PURPOSE/);
  for (const { slug } of registry.repositories) {
    assert.ok(componentSource.includes(`'${slug}'`), `missing task guidance for ${slug}`);
  }

  assert.match(manualCss, /\.bt4k-manual-directory > ul/);
  assert.match(manualCss, /grid-template-columns:\s*repeat\(2/);
  assert.match(manualCss, /\.bt4k-manual-directory a:focus-visible/);
  assert.match(manualCss, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(manualCss, /@media\s*\(max-width:\s*42rem\)/);
});

test('manual collection homes distinguish Ecosystem, Manuals, and Blog in both locales', () => {
  assert.match(englishPage, /import ManualDirectory from '\.\.\/\.\.\/\.\.\/components\/ManualDirectory\.astro'/);
  assert.match(englishPage, /<ManualDirectory locale="en" \/>/);
  for (const label of ['Ecosystem', 'Manuals', 'Blog']) assert.ok(englishPage.includes(`**${label}**`));

  assert.match(koreanPage, /import ManualDirectory from '\.\.\/\.\.\/\.\.\/\.\.\/components\/ManualDirectory\.astro'/);
  assert.match(koreanPage, /<ManualDirectory locale="ko" \/>/);
  for (const label of ['생태계', '매뉴얼', '블로그']) assert.ok(koreanPage.includes(`**${label}**`));
  assert.match(koreanPage, /왼쪽 목차와 홈·이전·다음 링크도 선택한 버전에 맞춰 바뀝니다/);
});
