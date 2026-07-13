import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import http from 'node:http';
import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { buildUnavailablePage } from '../../scripts/manual/lib/catalog.mjs';

const root = new URL('../../', import.meta.url);
const read = (relative) => readFile(new URL(relative, root), 'utf8');
const readOptional = (relative) => read(relative).catch((error) => {
  if (error?.code === 'ENOENT') return '';
  throw error;
});
const projectRoot = path.resolve(new URL('../..', import.meta.url).pathname);

async function write(targetRoot, relative, content) {
  const target = path.join(targetRoot, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

function manualPage({ locale = 'en', minor, title, id }) {
  const commit = minor === '1.12' ? 'b'.repeat(40) : 'a'.repeat(40);
  return [
    '---', `title: ${JSON.stringify(title)}`, `slug: ${locale === 'ko' ? 'ko/' : ''}manual/bluetape4k-projects/${minor}/modules/${id}`, 'manual:', `  id: ${id}`,
    '  repository: bluetape4k-projects', '  group: fixture', '  kind: library',
    `  sourceCommit: ${commit}`, `  sourcePath: docs/manual/${locale}/modules/${id}.md`,
    `  minorVersion: ${JSON.stringify(minor)}`, `  releaseRef: ${JSON.stringify(`${minor}.0`)}`, `  releaseCommit: ${commit}`,
    '  sourceDir: fixture', '  layer: build', '---', '', `# ${title}`, '',
    `Static navigation fixture for ${minor}.`, '',
  ].join('\n');
}

async function fixtureProject(t) {
  const fixtureParent = path.join(projectRoot, '.tmp');
  await mkdir(fixtureParent, { recursive: true });
  const fixture = await mkdtemp(path.join(fixtureParent, 'bt4k-version-ui-'));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  for (const relative of [
    'src/components/ManualHeader.astro', 'src/components/ManualMobileMenuFooter.astro',
  ]) {
    try {
      await cp(path.join(projectRoot, relative), path.join(fixture, relative), { recursive: true });
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
  for (const relative of [
    'src/components/ManualPageTitle.astro', 'src/components/ManualVersionSelector.astro',
    'src/styles/manual.css', 'src/starlightRouteData.ts',
    'scripts/manual/lib/catalog.mjs', 'scripts/manual/lib/paths.mjs', 'scripts/manual/lib/version.mjs',
  ]) await cp(path.join(projectRoot, relative), path.join(fixture, relative), { recursive: true });
  await write(fixture, 'package.json', '{"type":"module"}\n');
  await write(fixture, 'astro.config.mjs', [
    "import { defineConfig } from 'astro/config';", "import starlight from '@astrojs/starlight';",
    "export default defineConfig({ integrations: [starlight({ title: 'Fixture', locales: { root: { label: 'English', lang: 'en' }, ko: { label: '한국어', lang: 'ko' } }, defaultLocale: 'root', routeMiddleware: './src/starlightRouteData.ts', components: { Header: './src/components/ManualHeader.astro', MobileMenuFooter: './src/components/ManualMobileMenuFooter.astro', PageTitle: './src/components/ManualPageTitle.astro' } })] });", '',
  ].join('\n'));
  await write(fixture, 'src/content.config.ts', await read('src/content.config.ts'));
  await write(fixture, 'src/content/docs/index.md', '---\ntitle: Non manual fixture\n---\n\n# Non manual fixture\n');
  await write(fixture, 'src/content/docs/manual/bluetape4k-projects/1.11/modules/shared.md', manualPage({ minor: '1.11', title: 'Unique Shared Manual Token', id: 'shared' }));
  await write(fixture, 'src/content/docs/manual/bluetape4k-projects/1.12/modules/shared.md', manualPage({ minor: '1.12', title: 'Unique Shared Manual Token', id: 'shared' }));
  await write(fixture, 'src/content/docs/manual/bluetape4k-projects/1.12/modules/new.md', manualPage({ minor: '1.12', title: 'New fixture page', id: 'new' }));
  await write(fixture, 'src/content/docs/manual/bluetape4k-projects/1x11/modules/shared.md', manualPage({ minor: '1.11', title: 'Malformed route fixture', id: 'shared' }).replaceAll('/1.11/', '/1x11/'));
  await write(fixture, 'src/content/docs/ko/manual/bluetape4k-projects/1.12/modules/new.md', manualPage({ locale: 'ko', minor: '1.12', title: '새 테스트 문서', id: 'new' }));
  for (const locale of ['en', 'ko']) {
    const unavailable = buildUnavailablePage({ locale, targetMinor: '1.11', sourceMinor: '1.12', documentId: 'modules/new' });
    await write(fixture, unavailable.path, unavailable.content);
  }
  return fixture;
}

function runFixtureBuild(fixture) {
  return spawnSync(path.join(projectRoot, 'node_modules/.bin/astro'), ['build'], {
    cwd: fixture, encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' },
  });
}

function buildFixture(fixture) {
  const result = runFixtureBuild(fixture);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

async function queryPagefind(dist, term) {
  const server = http.createServer(async (request, response) => {
    try {
      let target = path.join(dist, decodeURIComponent(new URL(request.url, 'http://fixture').pathname));
      if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
      response.end(await readFile(target));
    } catch {
      response.statusCode = 404;
      response.end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const port = server.address().port;
    const pagefind = await import(`${new URL(`file://${path.join(dist, 'pagefind/pagefind.js')}`).href}?fixture=${Date.now()}`);
    await pagefind.options({ basePath: `http://127.0.0.1:${port}/pagefind/` });
    await pagefind.init();
    const result = await pagefind.search(term);
    return await Promise.all(result.results.map(async (item) => (await item.data()).url));
  } finally {
    server.close();
  }
}

test('manual selector is mounted beside language selection and in the mobile preferences', async () => {
  const config = await read('astro.config.mjs');
  const header = await readOptional('src/components/ManualHeader.astro');
  const mobile = await readOptional('src/components/ManualMobileMenuFooter.astro');
  const selector = await read('src/components/ManualVersionSelector.astro');

  assert.match(config, /Header:\s*['"]\.\/src\/components\/ManualHeader\.astro['"]/);
  assert.match(config, /MobileMenuFooter:\s*['"]\.\/src\/components\/ManualMobileMenuFooter\.astro['"]/);
  assert.ok(header.indexOf('<LanguageSelect />') < header.indexOf('<ManualVersionSelector'));
  assert.ok(mobile.indexOf('<ManualVersionSelector') < mobile.indexOf('mobile-preferences'));
  assert.match(selector, /placement:\s*'header'\s*\|\s*'mobile'/);
  assert.match(selector, /bt4k-manual-version--/);
  assert.match(selector, /<summary[^>]+aria-label=/);
  assert.match(selector, /aria-current=.*page/);
  for (const text of [
    'Projects docs', 'Projects 문서', 'Release', '릴리스',
    'Select documentation version', '문서 버전 선택',
    'Latest stable', '최신 안정판',
    'Archived', '보존 버전',
  ]) assert.ok(selector.includes(text), `missing selector copy: ${text}`);
});

test('versioned Projects manuals use the central dependency BOM only', async () => {
  const { output, status } = spawnSync('rg', [
    '-l',
    'io\\.github\\.bluetape4k:bluetape4k-bom:<version>',
    'src/content/docs/manual/bluetape4k-projects',
    'src/content/docs/ko/manual/bluetape4k-projects',
  ], { cwd: projectRoot, encoding: 'utf8' });
  assert.equal(status, 1, `repository BOM leaked into consumer guidance:\n${output}`);

  const central = spawnSync('rg', [
    '-l',
    'io\\.github\\.bluetape4k:bluetape4k-dependencies:<version>',
    'src/content/docs/manual/bluetape4k-projects',
    'src/content/docs/ko/manual/bluetape4k-projects',
  ], { cwd: projectRoot, encoding: 'utf8' });
  assert.equal(central.status, 0, 'central BOM guidance is missing from versioned Projects manuals');
});

test('manual metadata schema pins the minor and exact release provenance', async () => {
  const source = await read('src/content.config.ts');
  assert.ok(source.includes('minorVersion: z.string().regex(/^\\d+\\.\\d+$/)'));
  assert.ok(source.includes('releaseRef: z.string().regex(/^v?\\d+\\.\\d+\\.\\d+$/)'));
  assert.ok(source.includes('releaseCommit: z.string().regex(/^[0-9a-f]{40}$/)'));
});

test('the Pagefind integration remains pinned to the supported Starlight 0.39.2 contract', async () => {
  const upstream = await read('node_modules/@astrojs/starlight/components/Page.astro');
  const digest = createHash('sha256').update(upstream).digest('hex');
  assert.equal(
    digest,
    '44c298784721b9d90a4ed8309e91c925523c8c100ebe1543c745c54f017c27f5',
    'Starlight Page.astro changed: review the supported Page override, update ManualPage.astro, then intentionally update this hash.',
  );
  const componentSchema = await read('node_modules/@astrojs/starlight/schemas/components.ts');
  assert.doesNotMatch(componentSchema, /^\s*Page:\s*z\./m, 'Starlight now supports Page overrides: review whether route middleware is still the narrowest integration.');
  const config = await read('astro.config.mjs');
  const middleware = await read('src/starlightRouteData.ts');
  assert.match(config, /routeMiddleware:\s*['"]\.\/src\/starlightRouteData\.ts['"]/);
  assert.match(middleware, /route\.entry\.data\.pagefind\s*=\s*false/);
});

test('manual version UI styles cover focus, zoom wrapping, contrast, touch, and print', async () => {
  const source = await read('src/styles/manual.css');
  assert.match(source, /\.bt4k-manual-version/);
  assert.match(source, /:focus-visible/);
  assert.match(source, /min-block-size:\s*44px/);
  assert.match(source, /\.bt4k-manual-version--mobile/);
  assert.match(source, /\.bt4k-manual-provenance/);
  assert.match(source, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(source, /@media print/);
});

test('actual Astro builds preserve defaults without a catalog and exclude archived manuals from Pagefind', { timeout: 60_000 }, async (t) => {
  const fixture = await fixtureProject(t);
  const versionedPage = path.join(fixture, 'src/content/docs/manual/bluetape4k-projects/1.11/modules/shared.md');
  const validSource = await readFile(versionedPage, 'utf8');
  await writeFile(versionedPage, validSource
    .replace(/^  minorVersion:.*\n/m, '')
    .replace(/^  releaseCommit:.*\n/m, ''));
  const invalidBuild = runFixtureBuild(fixture);
  assert.notEqual(invalidBuild.status, 0, 'a versioned manual without release provenance must fail the Astro build');
  assert.match(`${invalidBuild.stdout}\n${invalidBuild.stderr}`, /minorVersion|releaseCommit|InvalidContentEntryDataError/);
  await writeFile(versionedPage, validSource);

  buildFixture(fixture);
  const missingCatalogManual = await readFile(path.join(fixture, 'dist/manual/bluetape4k-projects/1.11/modules/shared/index.html'), 'utf8');
  const missingCatalogNonManual = await readFile(path.join(fixture, 'dist/index.html'), 'utf8');
  assert.match(missingCatalogManual, /<main[^>]*data-pagefind-body/);
  assert.doesNotMatch(missingCatalogManual, /bt4k-manual-version/);
  assert.match(missingCatalogNonManual, /<main[^>]*data-pagefind-body/);

  const catalog = {
    schema: 1, repository: 'bluetape4k/bluetape4k-projects', latest: '1.12',
    versions: [
      { minorVersion: '1.11', releaseRef: '1.11.0', releaseCommit: 'a'.repeat(40), sourceCommit: 'a'.repeat(40), channel: 'archived', documents: { en: ['modules/shared'], ko: [] } },
      { minorVersion: '1.12', releaseRef: '1.12.0', releaseCommit: 'b'.repeat(40), sourceCommit: 'b'.repeat(40), channel: 'stable', documents: { en: ['modules/new', 'modules/shared'], ko: ['modules/new'] } },
    ],
  };
  await write(fixture, 'src/data/manual/bluetape4k-projects.versions.json', `${JSON.stringify(catalog, null, 2)}\n`);
  buildFixture(fixture);

  const archived = await readFile(path.join(fixture, 'dist/manual/bluetape4k-projects/1.11/modules/shared/index.html'), 'utf8');
  const latest = await readFile(path.join(fixture, 'dist/manual/bluetape4k-projects/1.12/modules/shared/index.html'), 'utf8');
  const latestNew = await readFile(path.join(fixture, 'dist/manual/bluetape4k-projects/1.12/modules/new/index.html'), 'utf8');
  const latestNewKo = await readFile(path.join(fixture, 'dist/ko/manual/bluetape4k-projects/1.12/modules/new/index.html'), 'utf8');
  const malformedRoute = await readFile(path.join(fixture, 'dist/manual/bluetape4k-projects/1x11/modules/shared/index.html'), 'utf8');
  const unavailable = await readFile(path.join(fixture, 'dist/manual/bluetape4k-projects/1.11/not-available/from-1.12/modules/new/index.html'), 'utf8');
  const unavailableKo = await readFile(path.join(fixture, 'dist/ko/manual/bluetape4k-projects/1.11/not-available/from-1.12/modules/new/index.html'), 'utf8');
  assert.match(archived, />Archived</);
  assert.match(archived, /aria-label="Projects docs 1\.11 — Select documentation version"/);
  assert.match(archived, /bt4k-manual-version--header/);
  assert.match(archived, /bt4k-manual-version--mobile/);
  assert.match(archived, />Projects docs<\/span>\s*<span>1\.11<\/span>/);
  assert.match(latestNewKo, />Projects 문서<\/span>\s*<span>1\.12<\/span>/);
  assert.doesNotMatch(archived, /<main[^>]*data-pagefind-body/);
  assert.doesNotMatch(malformedRoute, /bt4k-manual-version/);
  assert.match(latest, /<main[^>]*data-pagefind-body/);
  assert.match(archived, /href="\/manual\/bluetape4k-projects\/1\.12\/modules\/shared\/"/);
  assert.match(latestNew, /href="\/manual\/bluetape4k-projects\/1\.11\/not-available\/from-1\.12\/modules\/new\/"/);
  assert.match(latestNew, /releases\/tag\/1\.12\.0/);
  assert.match(latestNewKo, /releases\/tag\/1\.12\.0/);
  assert.match(latestNew, /Based on Projects release 1\.12\.0/);
  assert.match(latestNewKo, /Projects 1\.12\.0 릴리스 기준/);
  assert.doesNotMatch(latestNew, /Source 1\.12\.0/);
  assert.doesNotMatch(latestNewKo, /소스 1\.12\.0/);
  assert.doesNotMatch(missingCatalogNonManual, /bt4k-manual-version--(?:header|mobile)/);
  for (const text of ['This page is not available in version 1.11', 'Document ID: ', 'modules/new', 'This document was added after this version.', 'Return to version 1.12']) assert.ok(unavailable.includes(text));
  for (const text of ['이 문서는 1.11 버전에 없습니다', '문서 ID: ', 'modules/new', '이 문서는 해당 버전 이후에 추가되었습니다.', '1.12 버전으로 돌아가기']) assert.ok(unavailableKo.includes(text));
  assert.match(unavailable, /\/manual\/bluetape4k-projects\/1\.12\/modules\/new\//);
  assert.doesNotMatch(unavailable, /<main[^>]*data-pagefind-body/);

  const urls = await queryPagefind(path.join(fixture, 'dist'), 'Unique Shared Manual Token');
  const manualUrls = urls.filter((url) => url.includes('/manual/bluetape4k-projects/'));
  assert.equal(manualUrls.length, 1, manualUrls.join('\n'));
  assert.match(manualUrls[0], /\/1\.12\/modules\/shared\/$/);
});
