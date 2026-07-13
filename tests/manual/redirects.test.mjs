import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { loadRedirectCatalog } from '../../scripts/manual/lib/catalog.mjs';
import { failureReport } from '../../scripts/manual/validate-snapshot.mjs';

const projectRoot = path.resolve(new URL('../..', import.meta.url).pathname);
const repository = 'bluetape4k/bluetape4k-projects';

async function write(root, relative, content) {
  const target = path.join(root, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

function catalogs(redirect = {
  source: '/manual/bluetape4k-projects/modules/shared/',
  target: '/manual/bluetape4k-projects/1.11/modules/shared/',
}) {
  return {
    versions: {
      schema: 1,
      repository,
      latest: '1.11',
      versions: [{
        minorVersion: '1.11', releaseRef: '1.11.0', releaseCommit: 'a'.repeat(40), sourceCommit: 'b'.repeat(40),
        channel: 'stable', documents: { en: ['modules/shared'], ko: ['modules/shared'] },
      }],
    },
    redirects: {
      schema: 1,
      repository,
      redirects: [
        redirect,
        { source: '/ko/manual/bluetape4k-projects/modules/shared/', target: '/ko/manual/bluetape4k-projects/1.11/modules/shared/' },
      ],
    },
  };
}

async function catalogFixture(t, values = catalogs()) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'manual-redirects-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const redirectPath = path.join(root, 'bluetape4k-projects.redirects.json');
  await writeFile(redirectPath, JSON.stringify(values.redirects));
  await writeFile(path.join(root, 'bluetape4k-projects.versions.json'), JSON.stringify(values.versions));
  return pathToFileURL(redirectPath);
}

test('loads production redirects as direct locale-preserving links to the catalog latest', async () => {
  const loaded = loadRedirectCatalog(new URL('../../src/data/manual/bluetape4k-projects.redirects.json', import.meta.url));
  const versions = JSON.parse(await readFile(new URL('../../src/data/manual/bluetape4k-projects.versions.json', import.meta.url), 'utf8'));
  const latest = versions.versions.find(({ minorVersion }) => minorVersion === versions.latest);
  const expectedRedirects = latest.documents.en.length + latest.documents.ko.length;
  assert.equal(loaded.latest, '1.11');
  assert.equal(loaded.entries.length, expectedRedirects);
  assert.equal(new Set(loaded.entries.map(({ source }) => source)).size, loaded.entries.length);
  for (const { source, destination } of loaded.entries) {
    assert.match(destination, /^\/(?:ko\/)?manual\/bluetape4k-projects\/1\.11\//);
    assert.equal(source.startsWith('/ko/'), destination.startsWith('/ko/'));
    assert.ok(!loaded.entries.some((entry) => entry.source === destination), `${source} forms a redirect chain`);
  }
});

test('rejects unsafe, cross-locale, and non-latest redirect routes', async (t) => {
  const cases = [
    ['external URL', { target: 'https://example.com/manual/' }],
    ['protocol-relative URL', { target: '//example.com/manual/' }],
    ['encoded traversal', { target: '/manual/bluetape4k-projects/1.11/%2e%2e/secret/' }],
    ['query', { target: '/manual/bluetape4k-projects/1.11/modules/shared/?from=old' }],
    ['fragment', { target: '/manual/bluetape4k-projects/1.11/modules/shared/#old' }],
    ['wrong locale', { target: '/ko/manual/bluetape4k-projects/1.11/modules/shared/' }],
    ['wrong version', { target: '/manual/bluetape4k-projects/1.10/modules/shared/' }],
    ['versioned source', { source: '/manual/bluetape4k-projects/1.11/modules/shared/' }],
  ];
  for (const [label, mutation] of cases) {
    const base = catalogs();
    Object.assign(base.redirects.redirects[0], mutation);
    const url = await catalogFixture(t, base);
    assert.throws(() => loadRedirectCatalog(url), undefined, label);
  }

  const bogus = catalogs();
  bogus.redirects.redirects.push({
    source: '/manual/bluetape4k-projects/not-a-document/',
    target: '/manual/bluetape4k-projects/1.11/modules/shared/',
  });
  const bogusUrl = await catalogFixture(t, bogus);
  assert.throws(() => loadRedirectCatalog(bogusUrl), /REDIRECT_SOURCE_SET/);

  const missing = catalogs();
  missing.redirects.redirects.pop();
  const missingUrl = await catalogFixture(t, missing);
  assert.throws(() => loadRedirectCatalog(missingUrl), /REDIRECT_SOURCE_SET/);
});

test('Astro static output creates accessible noindex navigation HTML for a legacy route', async (t) => {
  const fixture = await mkdtemp(path.join(projectRoot, '.tmp', 'manual-redirect-build-'));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const values = catalogs();
  await write(fixture, 'src/data/manual/bluetape4k-projects.redirects.json', JSON.stringify(values.redirects));
  await write(fixture, 'src/data/manual/bluetape4k-projects.versions.json', JSON.stringify(values.versions));
  await write(fixture, 'src/pages/manual/bluetape4k-projects/1.11/modules/shared/index.astro', '<h1>Latest manual</h1>\n');
  const loaderUrl = pathToFileURL(path.join(projectRoot, 'scripts/manual/lib/catalog.mjs')).href;
  await write(fixture, 'package.json', '{"type":"module"}\n');
  await write(fixture, 'astro.config.mjs', [
    "import { defineConfig } from 'astro/config';",
    `import { loadRedirectCatalog } from ${JSON.stringify(loaderUrl)};`,
    "const catalog = loadRedirectCatalog(new URL('./src/data/manual/bluetape4k-projects.redirects.json', import.meta.url));",
    'export default defineConfig({ redirects: Object.fromEntries(catalog.entries.map(({ source, destination }) => [source, destination])) });',
    '',
  ].join('\n'));
  const result = spawnSync(path.join(projectRoot, 'node_modules/.bin/astro'), ['build'], {
    cwd: fixture, encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' },
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const html = await readFile(path.join(fixture, 'dist/manual/bluetape4k-projects/modules/shared/index.html'), 'utf8');
  assert.match(html, /<meta[^>]+http-equiv=["']refresh["']/i);
  assert.match(html, /<meta[^>]+name=["']robots["'][^>]+content=["']noindex["']/i);
  assert.equal((html.match(/rel=["']canonical["']/gi) ?? []).length, 1);
  assert.match(html, /<a[^>]+href=["']\/manual\/bluetape4k-projects\/1\.11\/modules\/shared\/["'][^>]*>/i);
});

test('snapshot validation writes a sanitized provenance report and summary', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'manual-validation-report-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const reportPath = path.join(root, 'report.json');
  const validation = spawnSync(process.execPath, ['scripts/manual/validate-snapshot.mjs', '--report', reportPath], {
    cwd: projectRoot, encoding: 'utf8', env: { ...process.env, GITHUB_TOKEN: 'must-not-leak' },
  });
  assert.equal(validation.status, 0, `${validation.stdout}\n${validation.stderr}`);
  const reportBytes = await readFile(reportPath, 'utf8');
  const report = JSON.parse(reportBytes);
  assert.equal(report.status, 'pass');
  assert.equal(report.latest, '1.11');
  assert.match(report.releaseCommit, /^[0-9a-f]{40}$/);
  assert.match(report.sourceCommit, /^[0-9a-f]{40}$/);
  assert.match(report.generationId, /^[0-9a-f]{64}$/);
  for (const secret of ['must-not-leak', 'authorization', 'headers', 'rawBody', 'query']) {
    assert.ok(!reportBytes.toLowerCase().includes(secret.toLowerCase()), secret);
  }

  const summary = spawnSync(process.execPath, ['scripts/manual/write-job-summary.mjs', reportPath], {
    cwd: projectRoot, encoding: 'utf8', env: process.env,
  });
  assert.equal(summary.status, 0, summary.stderr);
  assert.match(summary.stdout, /^## Manual validation/m);
  assert.match(summary.stdout, /1\.11\.0/);
  assert.match(summary.stdout, /6187173b58e8b4c5c435c145e00e94708f31ef75/);

  const token = `ghp_${'x'.repeat(36)}`;
  const failure = failureReport({ code: 'CATALOG_DRIFT', actual: `src/${token}` });
  assert.ok(!JSON.stringify(failure).includes(token));
  const maliciousPath = path.join(root, 'malicious.json');
  await writeFile(maliciousPath, JSON.stringify({ status: 'fail', code: 'DRIFT', driftPaths: [`src/${token}`] }));
  const maliciousSummary = spawnSync(process.execPath, ['scripts/manual/write-job-summary.mjs', maliciousPath], {
    cwd: projectRoot, encoding: 'utf8', env: process.env,
  });
  assert.equal(maliciousSummary.status, 0, maliciousSummary.stderr);
  assert.ok(!maliciousSummary.stdout.includes(token));
});
