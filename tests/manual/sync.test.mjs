import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rename, rm, stat, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

import {
  buildSnapshot,
  parseArgs,
  runCli,
  syncManual,
  validateCommittedRepository,
  validateCommittedSite,
} from '../../scripts/manual/sync-manual.mjs';
import { stagePublication } from '../../scripts/manual/lib/publication.mjs';

const FULL_NAME = 'bluetape4k/bluetape4k-projects';
const SLUG = 'bluetape4k-projects';
const PROJECTS = {
  slug: SLUG,
  repository: FULL_NAME,
  label: { en: 'Projects docs', ko: 'Projects 문서' },
  latestMinor: '1.11',
  route: { en: '/manual/bluetape4k-projects/', ko: '/ko/manual/bluetape4k-projects/' },
};
const EXPOSED = {
  slug: 'bluetape4k-exposed',
  repository: 'bluetape4k/bluetape4k-exposed',
  label: { en: 'Exposed docs', ko: 'Exposed 문서' },
  latestMinor: '1.11',
  route: { en: '/manual/bluetape4k-exposed/', ko: '/ko/manual/bluetape4k-exposed/' },
};
const TEST_REGISTRY = { schema: 1, repositories: [PROJECTS, EXPOSED] };
const RELEASE_COMMIT = '6'.repeat(40);

async function write(root, relative, content) {
  const target = path.join(root, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
}

function commit(root, message) {
  git(root, 'add', '.');
  git(root, 'commit', '-m', message);
  return git(root, 'rev-parse', 'HEAD');
}

const exists = (file) => stat(file).then(() => true, () => false);

async function createSourceFixture({ validatorExit = 0, validatorScript } = {}) {
  const source = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-source-'));
  git(source, 'init', '-q');
  git(source, 'config', 'user.name', 'Manual Test');
  git(source, 'config', 'user.email', 'manual@example.com');
  const manifest = {
    schemaVersion: 2,
    overview: {
      assets: ['assets/overview/repository-map.svg'],
    },
    modules: [{
      id: 'sample', group: 'foundation', kind: 'library', sourceDir: 'sample',
      en: 'en/modules/sample.md', ko: 'ko/modules/sample.md',
      chapters: [{
        id: 'chapter-one', en: 'en/modules/sample/chapter-one.md', ko: 'ko/modules/sample/chapter-one.md',
      }],
      assets: ['assets/sample/model.svg', 'assets/sample/model.png'],
    }],
  };
  const landing = '---\ntitle: Sample\nmanualId: sample\n---\n\n# Sample\n';
  const chapter = [
    '---', 'title: Chapter one', 'manualId: sample', 'chapterId: chapter-one', '---', '',
    '# Chapter one', '', '![Model](../../../assets/sample/model.svg)', '',
  ].join('\n');
  await write(source, 'docs/manual/generated/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  for (const locale of ['en', 'ko']) {
    await write(source, `docs/manual/${locale}/index.md`, '---\ntitle: Manual overview\n---\n\n# Manual overview\n');
    await write(source, `docs/manual/${locale}/getting-started.md`, '---\ntitle: Getting started\n---\n\n# Getting started\n');
    await write(source, `docs/manual/${locale}/architecture/repository-map.md`, '---\ntitle: Repository map\n---\n\n# Repository map\n');
  }
  await write(source, 'docs/manual/en/modules/sample.md', landing);
  await write(source, 'docs/manual/ko/modules/sample.md', landing);
  await write(source, 'docs/manual/en/modules/sample/chapter-one.md', chapter);
  await write(source, 'docs/manual/ko/modules/sample/chapter-one.md', chapter);
  await write(source, 'docs/manual/assets/sample/model.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>\n');
  await write(source, 'docs/manual/assets/sample/model.png', Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  await write(source, 'docs/manual/assets/overview/repository-map.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>\n');
  await write(
    source,
    'scripts/manual/validate_release_manuals.rb',
    validatorScript ?? `warn "incompatible source"\nexit ${validatorExit}\n`,
  );
  const sourceCommit = commit(source, 'Create manual fixture');
  return { source, manifest, sourceCommit };
}

function resolved(source, sourceCommit, releaseRef = '1.11.0', repository = PROJECTS) {
  const [, major, minor] = releaseRef.match(/^(?:v)?(\d+)\.(\d+)\.(\d+)$/);
  return {
    source,
    repository,
    releaseRef,
    releaseCommit: RELEASE_COMMIT,
    minorVersion: `${major}.${minor}`,
    authoringSourceRef: sourceCommit,
    sourceCommit,
  };
}

function dependenciesFor(input, overrides = {}) {
  return {
    resolveReleaseImpl: async () => ({
      repository: input.repository.repository,
      releaseRef: input.releaseRef,
      releaseCommit: input.releaseCommit,
      minorVersion: input.minorVersion,
    }),
    assertReleaseUnmovedImpl: async () => {},
    ...overrides,
  };
}

test('parses explicit CLI modes and rejects conflicting modes', () => {
  assert.deepEqual(parseArgs(['--repository', SLUG, '--source', '/source', '--latest']), {
    repository: SLUG, mode: 'latest', source: '/source',
  });
  assert.deepEqual(parseArgs(['--repository', SLUG, '--source', '/source', '--release', '1.11.0']), {
    repository: SLUG, mode: 'release', source: '/source', releaseRef: '1.11.0',
  });
  assert.deepEqual(parseArgs(['--repository', SLUG, '--source', '/source', '--refresh', '1.11.0']), {
    repository: SLUG, mode: 'refresh', source: '/source', releaseRef: '1.11.0',
  });
  assert.deepEqual(parseArgs(['--check']), { mode: 'check' });
  assert.deepEqual(parseArgs(['--repository', SLUG, '--check']), { repository: SLUG, mode: 'check' });
  assert.deepEqual(parseArgs(['--repository', SLUG, '--recover']), { repository: SLUG, mode: 'recover' });
  assert.throws(() => parseArgs(['--source', '/source', '--latest']), /CLI_REPOSITORY/);
  assert.throws(() => parseArgs(['--latest', '--release', '1.11.0', '--source', '/source']), /CLI_MODE/);
  assert.throws(() => parseArgs(['--repository', SLUG, '--latest']), /CLI_SOURCE/);
  assert.throws(() => parseArgs(['--check', '--source', '/source']), /CLI_MODE/);
  assert.throws(() => parseArgs(['--source', '/source', '--release', 'main']), /CLI_RELEASE/);
  assert.throws(() => parseArgs(['--source', '/source', '--refresh', 'main']), /CLI_RELEASE/);
});

test('an explicit refresh updates authoring provenance without changing release provenance', async (t) => {
  const fixture = await createSourceFixture();
  t.after(() => rm(fixture.source, { recursive: true, force: true }));
  const input = resolved(fixture.source, fixture.sourceCommit);
  const initial = await buildSnapshot(input);
  const refreshedCommit = '9'.repeat(40);

  await assert.rejects(
    buildSnapshot({ ...input, authoringSourceRef: refreshedCommit, sourceCommit: refreshedCommit }, {
      previousCatalog: initial.catalog,
    }),
    /CATALOG_RELEASE_REWRITE/,
  );
  await assert.rejects(
    buildSnapshot({
      ...input,
      releaseCommit: '8'.repeat(40),
      authoringSourceRef: refreshedCommit,
      sourceCommit: refreshedCommit,
    }, {
      previousCatalog: initial.catalog,
      allowReleaseRefresh: true,
    }),
    /CATALOG_RELEASE_COMMIT/,
  );

  const refreshed = await buildSnapshot({
    ...input,
    authoringSourceRef: refreshedCommit,
    sourceCommit: refreshedCommit,
  }, {
    previousCatalog: initial.catalog,
    allowReleaseRefresh: true,
  });
  const entry = refreshed.catalog.versions.find(({ minorVersion }) => minorVersion === '1.11');
  assert.equal(entry.releaseRef, input.releaseRef);
  assert.equal(entry.releaseCommit, input.releaseCommit);
  assert.equal(entry.authoringSourceRef, refreshedCommit);
  assert.equal(entry.sourceCommit, refreshedCommit);
});

test('buildSnapshot accepts resolved provenance, writes nothing, and emits no unversioned Markdown', async (t) => {
  const fixture = await createSourceFixture();
  t.after(() => rm(fixture.source, { recursive: true, force: true }));
  const input = resolved(fixture.source, fixture.sourceCommit);
  const before = git(fixture.source, 'status', '--porcelain');
  const built = await buildSnapshot(input);
  assert.equal(git(fixture.source, 'status', '--porcelain'), before);
  assert.equal(built.snapshot.releaseCommit, RELEASE_COMMIT);
  assert.equal(built.snapshot.minorVersion, '1.11');
  assert.equal(built.snapshot.sourceCommit, fixture.sourceCommit);
  const sample = built.entries.find(({ path: entryPath }) => entryPath === `src/content/docs/manual/${SLUG}/1.11/modules/sample.md`);
  assert.ok(sample);
  assert.match(sample.content, /^slug: "manual\/bluetape4k-projects\/1\.11\/modules\/sample"$/m);
  for (const documentId of ['index', 'getting-started', 'architecture/repository-map']) {
    const overview = built.entries.find(({ path: entryPath }) => entryPath === `src/content/docs/manual/${SLUG}/1.11/${documentId}.md`);
    assert.ok(overview, `missing versioned overview: ${documentId}`);
    assert.match(overview.content, /manual:\n/);
    assert.match(overview.content, new RegExp(`  id: ${JSON.stringify(documentId).replaceAll('/', '\\/')}`));
    assert.match(overview.content, new RegExp(`  sourcePath: "docs/manual/en/${documentId.replaceAll('/', '\\/')}\\.md"`));
    assert.match(overview.content, /  releaseRef: "1\.11\.0"/);
    assert.match(overview.content, /  releaseCommit: "6666666666666666666666666666666666666666"/);
  }
  assert.ok(built.entries.some(({ path: entryPath }) => entryPath === `src/data/manual/${SLUG}.1.11.manifest.json`));
  assert.ok(built.entries.some(({ path: entryPath }) => entryPath === `src/data/manual/${SLUG}.manifest.json`));
  assert.ok(built.entries.some(({ path: entryPath }) => entryPath === `public/manual-assets/${SLUG}/1.11/sample/model.svg`));
  assert.ok(built.entries.some(({ path: entryPath }) => entryPath === `public/manual-assets/${SLUG}/sample/model.svg`));
  assert.ok(built.entries.some(({ path: entryPath }) => entryPath === `public/manual-assets/${SLUG}/1.11/overview/repository-map.svg`));
  assert.ok(built.entries.some(({ path: entryPath }) => entryPath === `public/manual-assets/${SLUG}/overview/repository-map.svg`));
  assert.deepEqual(built.manifest.overview.assets, ['assets/overview/repository-map.svg']);
  assert.equal(built.entries.some(({ path: entryPath }) => new RegExp(`docs/(?:ko/)?manual/${SLUG}/modules/`).test(entryPath)), false);
});

test('publishes a document shared by multiple modules as a neutral guide', async (t) => {
  const fixture = await createSourceFixture();
  t.after(() => rm(fixture.source, { recursive: true, force: true }));
  fixture.manifest.modules.push({
    id: 'sample-peer', group: 'benchmarks', kind: 'benchmark', sourceDir: 'sample-peer',
    en: 'en/modules/sample.md', ko: 'ko/modules/sample.md', chapters: [], assets: [],
  });
  await write(
    fixture.source,
    'docs/manual/generated/manifest.json',
    `${JSON.stringify(fixture.manifest, null, 2)}\n`,
  );

  const built = await buildSnapshot(resolved(fixture.source, fixture.sourceCommit));
  const shared = built.entries.find(({ path: entryPath }) => (
    entryPath === `src/content/docs/manual/${SLUG}/1.11/modules/sample.md`
  ));

  assert.ok(shared);
  assert.match(shared.content, /  id: "modules\/sample"/);
  assert.match(shared.content, /  group: "overview"/);
  assert.match(shared.content, /  kind: "guide"/);
  assert.match(shared.content, /  sourceDir: "docs\/manual"/);
});

test('rejects traversal, absolute, and symlink manifest paths before reading outside the manual root', async (t) => {
  for (const fixtureCase of ['document-traversal', 'asset-absolute', 'document-symlink', 'asset-symlink']) {
    const fixture = await createSourceFixture();
    const external = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-external-'));
    t.after(() => rm(fixture.source, { recursive: true, force: true }));
    t.after(() => rm(external, { recursive: true, force: true }));
    const sentinel = path.join(external, 'sentinel');
    await writeFile(sentinel, 'must not be read');
    const manifestPath = path.join(fixture.source, 'docs/manual/generated/manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    if (fixtureCase === 'document-traversal') manifest.modules[0].en = '../../../external/sentinel.md';
    if (fixtureCase === 'asset-absolute') manifest.modules[0].assets = [sentinel];
    if (fixtureCase === 'document-symlink') {
      const link = path.join(fixture.source, 'docs/manual/en/modules/escape.md');
      await symlink(sentinel, link);
      manifest.modules[0].en = 'en/modules/escape.md';
    }
    if (fixtureCase === 'asset-symlink') {
      const link = path.join(fixture.source, 'docs/manual/assets/sample/escape.svg');
      await symlink(sentinel, link);
      manifest.modules[0].assets = ['assets/sample/escape.svg'];
    }
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await assert.rejects(
      buildSnapshot(resolved(fixture.source, fixture.sourceCommit)),
      /(?:PATH_UNSAFE|PATH_SYMLINK)/,
      fixtureCase,
    );
    assert.equal(await readFile(sentinel, 'utf8'), 'must not be read');
  }
});

test('rejects a symlink source root or docs/manual component before the first manifest read', async (t) => {
  const rootFixture = await createSourceFixture();
  const sourceLinkParent = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-source-link-'));
  const sourceLink = path.join(sourceLinkParent, 'source');
  await symlink(rootFixture.source, sourceLink);
  t.after(() => rm(rootFixture.source, { recursive: true, force: true }));
  t.after(() => rm(sourceLinkParent, { recursive: true, force: true }));
  await assert.rejects(
    buildSnapshot({ ...resolved(rootFixture.source, rootFixture.sourceCommit), source: sourceLink }),
    /PATH_SYMLINK/,
  );

  const componentFixture = await createSourceFixture();
  const external = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-component-'));
  const externalManual = path.join(external, 'manual');
  await rename(path.join(componentFixture.source, 'docs/manual'), externalManual);
  await symlink(externalManual, path.join(componentFixture.source, 'docs/manual'));
  t.after(() => rm(componentFixture.source, { recursive: true, force: true }));
  t.after(() => rm(external, { recursive: true, force: true }));
  await assert.rejects(
    buildSnapshot(resolved(componentFixture.source, componentFixture.sourceCommit)),
    /PATH_SYMLINK/,
  );
});

test('publishes a new minor without changing older content or assets and keeps redirect sources cumulative', async (t) => {
  const fixture = await createSourceFixture();
  const targetRoot = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-site-'));
  t.after(() => rm(fixture.source, { recursive: true, force: true }));
  t.after(() => rm(targetRoot, { recursive: true, force: true }));

  const firstInput = resolved(fixture.source, fixture.sourceCommit, '1.11.0');
  const firstPublication = await syncManual({ ...firstInput, mode: 'release', targetRoot }, dependenciesFor(firstInput));
  assert.equal(firstPublication.changed, true);
  const identicalPublication = await syncManual({ ...firstInput, mode: 'release', targetRoot }, dependenciesFor(firstInput));
  assert.equal(identicalPublication.changed, false);
  const oldDocument = path.join(targetRoot, `src/content/docs/manual/${SLUG}/1.11/modules/sample.md`);
  const oldAsset = path.join(targetRoot, `public/manual-assets/${SLUG}/1.11/sample/model.svg`);
  const oldBytes = [await readFile(oldDocument), await readFile(oldAsset)];
  const firstRedirects = JSON.parse(await readFile(path.join(targetRoot, `src/data/manual/${SLUG}.redirects.json`)));

  await write(fixture.source, 'docs/manual/en/modules/sample.md', '---\ntitle: Sample 1.12\nmanualId: sample\n---\n\n# Sample 1.12\n');
  fixture.manifest.modules.push({
    id: 'new-module', group: 'foundation', kind: 'library', sourceDir: 'new-module',
    en: 'en/modules/new-module.md', ko: 'ko/modules/new-module.md', chapters: [], assets: [],
  });
  await write(
    fixture.source,
    'docs/manual/generated/manifest.json',
    `${JSON.stringify(fixture.manifest, null, 2)}\n`,
  );
  await write(fixture.source, 'docs/manual/en/modules/new-module.md', '---\ntitle: New module\n---\n\n# New module\n');
  await write(fixture.source, 'docs/manual/ko/modules/new-module.md', '---\ntitle: 새 모듈\n---\n\n# 새 모듈\n');
  const nextCommit = commit(fixture.source, 'Prepare 1.12 manual');
  const nextInput = resolved(fixture.source, nextCommit, '1.12.0');
  await syncManual({ ...nextInput, mode: 'release', targetRoot }, dependenciesFor(nextInput));
  await validateCommittedRepository({ targetRoot, repository: { ...PROJECTS, latestMinor: '1.12' } });

  assert.deepEqual(await readFile(oldDocument), oldBytes[0]);
  assert.deepEqual(await readFile(oldAsset), oldBytes[1]);
  const catalog = JSON.parse(await readFile(path.join(targetRoot, `src/data/manual/${SLUG}.versions.json`)));
  assert.deepEqual(catalog.versions.map(({ minorVersion }) => minorVersion), ['1.11', '1.12']);
  assert.equal(catalog.latest, '1.12');
  const redirects = JSON.parse(await readFile(path.join(targetRoot, `src/data/manual/${SLUG}.redirects.json`)));
  assert.ok(firstRedirects.redirects.every(({ source }) => redirects.redirects.some((entry) => entry.source === source)));
  assert.ok(redirects.redirects.every(({ target }) => target.includes('/1.12/')));
  const unavailable = path.join(
    targetRoot,
    `src/content/docs/manual/${SLUG}/1.11/not-available/from-1.12/modules/new-module.md`,
  );
  const unavailableContent = await readFile(unavailable, 'utf8');
  assert.match(unavailableContent, /This page is not available in version 1\.11/);
  assert.match(unavailableContent, /This document was added after this version\./);
  assert.match(unavailableContent, /\[Return to version 1\.12\]\(\/manual\/bluetape4k-projects\/1\.12\/modules\/new-module\/\)/);
  assert.equal(
    (await readdir(path.dirname(unavailable))).filter((name) => name === 'new-module.md').length,
    1,
  );
  await writeFile(unavailable, 'drifted fallback\n');
  await assert.rejects(
    validateCommittedRepository({ targetRoot, repository: { ...PROJECTS, latestMinor: '1.12' } }),
    /UNAVAILABLE_DRIFT/,
  );
  await writeFile(unavailable, unavailableContent);
  assert.deepEqual(
    await readFile(path.join(targetRoot, `src/data/manual/${SLUG}.manifest.json`)),
    await readFile(path.join(targetRoot, `src/data/manual/${SLUG}.1.12.manifest.json`)),
  );
});

test('check mode is source-free, offline, read-only, and validates committed artifacts', async (t) => {
  const fixture = await createSourceFixture();
  const targetRoot = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-site-'));
  t.after(() => rm(fixture.source, { recursive: true, force: true }));
  t.after(() => rm(targetRoot, { recursive: true, force: true }));
  const input = resolved(fixture.source, fixture.sourceCommit);
  await syncManual({ ...input, mode: 'release', targetRoot }, dependenciesFor(input));
  const before = await treeDigest(targetRoot);
  const result = await syncManual({ mode: 'check', repository: SLUG, targetRoot }, {
    fetchImpl: async () => { throw new Error('network forbidden'); },
    buildSnapshotImpl: async () => { throw new Error('build forbidden'); },
  });
  assert.equal(result.mutated, false);
  assert.equal(result.latest, '1.11');
  assert.equal(await treeDigest(targetRoot), before);
  await validateCommittedSite({ targetRoot, repository: SLUG });
  await assert.rejects(
    validateCommittedRepository({ targetRoot, repository: { ...PROJECTS, latestMinor: '1.12' } }),
    /REPOSITORY_LATEST_MINOR/,
  );

  for (const artifact of ['manifest', 'snapshot']) {
    const artifactPath = path.join(targetRoot, `src/data/manual/${SLUG}.1.11.${artifact}.json`);
    const original = await readFile(artifactPath, 'utf8');
    for (const [field, value] of [
      ['releaseRef', '9.9.9'],
      ['releaseCommit', 'c'.repeat(40)],
      ['sourceCommit', 'd'.repeat(40)],
    ]) {
      const tampered = JSON.parse(original);
      tampered[field] = value;
      await writeFile(artifactPath, `${JSON.stringify(tampered, null, 2)}\n`);
      await assert.rejects(
        validateCommittedSite({ targetRoot, repository: SLUG }),
        /SNAPSHOT_PROVENANCE/,
        `${artifact}.${field}`,
      );
      await writeFile(artifactPath, original);
    }
  }

  const markerPath = path.join(targetRoot, `.manual-sync-generation.${SLUG}.json`);
  const markerBytes = await readFile(markerPath, 'utf8');
  for (const field of ['generationId', 'treeDigest']) {
    const marker = JSON.parse(markerBytes);
    marker[field] = (field === 'generationId' ? 'e' : 'f').repeat(64);
    await writeFile(markerPath, `${JSON.stringify(marker, null, 2)}\n`);
    await assert.rejects(
      validateCommittedSite({ targetRoot, repository: SLUG }),
      /PUBLICATION_MARKER/,
      field,
    );
    await writeFile(markerPath, markerBytes);
  }
});

test('publishes and validates Projects and Exposed without cross-repository mutation', async (t) => {
  const fixture = await createSourceFixture();
  const targetRoot = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-multi-site-'));
  t.after(() => rm(fixture.source, { recursive: true, force: true }));
  t.after(() => rm(targetRoot, { recursive: true, force: true }));

  const projectsInput = resolved(fixture.source, fixture.sourceCommit);
  const exposedInput = resolved(fixture.source, fixture.sourceCommit, '1.11.0', EXPOSED);
  const exposedBuilt = await buildSnapshot(exposedInput);
  assert.ok(exposedBuilt.entries.every(({ path: entryPath }) => entryPath.includes(EXPOSED.slug)));

  await syncManual(
    { ...projectsInput, mode: 'release', targetRoot },
    dependenciesFor(projectsInput, { repositoryRegistry: TEST_REGISTRY }),
  );
  const projectsMarkerPath = path.join(targetRoot, `.manual-sync-generation.${SLUG}.json`);
  const projectsSnapshotPath = path.join(targetRoot, `src/data/manual/${SLUG}.snapshot.json`);
  const projectsDocumentPath = path.join(targetRoot, `src/content/docs/manual/${SLUG}/1.11/modules/sample.md`);
  const projectsBefore = await Promise.all([
    readFile(projectsMarkerPath), readFile(projectsSnapshotPath), readFile(projectsDocumentPath),
  ]);

  await syncManual(
    { ...exposedInput, mode: 'release', targetRoot },
    dependenciesFor(exposedInput, { repositoryRegistry: TEST_REGISTRY }),
  );
  assert.deepEqual(await Promise.all([
    readFile(projectsMarkerPath), readFile(projectsSnapshotPath), readFile(projectsDocumentPath),
  ]), projectsBefore);

  const aggregate = await validateCommittedSite({ targetRoot, registry: TEST_REGISTRY });
  assert.deepEqual(aggregate.repositories.map(({ repository }) => repository), [
    PROJECTS.repository,
    EXPOSED.repository,
  ]);
  assert.equal(aggregate.mutated, false);

  const exposedDocument = path.join(targetRoot, `src/content/docs/manual/${EXPOSED.slug}/1.11/modules/sample.md`);
  const original = await readFile(exposedDocument);
  await writeFile(exposedDocument, 'drifted\n');
  const driftedTree = await treeDigest(targetRoot);
  await assert.rejects(
    validateCommittedSite({ targetRoot, registry: TEST_REGISTRY }),
    /DIGEST_MISMATCH/,
  );
  assert.equal(await treeDigest(targetRoot), driftedTree);
  await writeFile(exposedDocument, original);
});

test('offline validation rejects a symlink target root and matching external artifact bytes', async (t) => {
  const fixture = await createSourceFixture();
  const targetRoot = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-site-'));
  const external = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-site-external-'));
  t.after(() => rm(fixture.source, { recursive: true, force: true }));
  t.after(() => rm(targetRoot, { recursive: true, force: true }));
  t.after(() => rm(external, { recursive: true, force: true }));
  const input = resolved(fixture.source, fixture.sourceCommit);
  await syncManual({ ...input, mode: 'release', targetRoot }, dependenciesFor(input));

  const rootLink = path.join(external, 'site-link');
  await symlink(targetRoot, rootLink);
  await assert.rejects(
    validateCommittedSite({ targetRoot: rootLink, repository: SLUG }),
    /PATH_SYMLINK/,
  );

  for (const [name, relative] of [
    ['catalog', `src/data/manual/${SLUG}.versions.json`],
    ['content', `src/content/docs/manual/${SLUG}/1.11/modules/sample.md`],
    ['asset', `public/manual-assets/${SLUG}/1.11/sample/model.svg`],
  ]) {
    const artifact = path.join(targetRoot, relative);
    const bytes = await readFile(artifact);
    const externalArtifact = path.join(external, `${name}.external`);
    await writeFile(externalArtifact, bytes);
    await rm(artifact);
    await symlink(externalArtifact, artifact);
    await assert.rejects(
      validateCommittedSite({ targetRoot, repository: SLUG }),
      /PATH_SYMLINK/,
      name,
    );
    await rm(artifact);
    await writeFile(artifact, bytes);
  }
});

test('release contract failure exits 4 without staging or publication mutation', async (t) => {
  const fixture = await createSourceFixture({ validatorExit: 1 });
  const targetRoot = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-site-'));
  t.after(() => rm(fixture.source, { recursive: true, force: true }));
  t.after(() => rm(targetRoot, { recursive: true, force: true }));
  const input = resolved(fixture.source, fixture.sourceCommit);
  const result = await runCli(
    ['--repository', SLUG, '--source', fixture.source, '--release', '1.11.0'],
    { targetRoot, ...dependenciesFor(input) },
  );
  assert.equal(result.exitCode, 4);
  assert.match(result.stderr, /SOURCE_RELEASE_CONTRACT/);
  assert.match(result.stderr, /"mutated":false/);
  assert.equal(await exists(path.join(targetRoot, '.manual-sync-journal.json')), false);
  assert.equal(await exists(path.join(targetRoot, '.manual-sync')), false);
});

test('runs only the clean HEAD validator with a minimal token-free environment', async (t) => {
  const validatorScript = [
    'forbidden = ENV.keys.grep(/TOKEN|SECRET|AUTHORIZATION|PASSWORD/i)',
    'abort "inherited token environment" unless forbidden.empty?',
    'exit 0',
    '',
  ].join('\n');
  const fixture = await createSourceFixture({ validatorScript });
  const targetRoot = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-site-'));
  t.after(() => rm(fixture.source, { recursive: true, force: true }));
  t.after(() => rm(targetRoot, { recursive: true, force: true }));
  const previous = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = 'ghp_SENTINEL_SUPER_SECRET_1234567890';
  try {
    const input = resolved(fixture.source, fixture.sourceCommit);
    const result = await syncManual({ ...input, mode: 'release', targetRoot }, dependenciesFor(input));
    assert.equal(result.changed, true);
  } finally {
    if (previous === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = previous;
  }
});

test('rejects modified, index-hidden, and symlink validators without executing an external sentinel', async (t) => {
  for (const fixtureCase of ['modified', 'index-hidden', 'symlink']) {
    const fixture = await createSourceFixture();
    const targetRoot = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-site-'));
    const external = await mkdtemp(path.join(os.tmpdir(), 'bt4k-validator-external-'));
    const sentinel = path.join(external, 'sentinel');
    const validator = path.join(fixture.source, 'scripts/manual/validate_release_manuals.rb');
    const malicious = `File.write(${JSON.stringify(sentinel)}, "executed")\nexit 0\n`;
    t.after(() => rm(fixture.source, { recursive: true, force: true }));
    t.after(() => rm(targetRoot, { recursive: true, force: true }));
    t.after(() => rm(external, { recursive: true, force: true }));
    if (fixtureCase === 'symlink') {
      const externalValidator = path.join(external, 'validator.rb');
      await writeFile(externalValidator, malicious);
      await rm(validator);
      await symlink(externalValidator, validator);
    } else {
      await writeFile(validator, malicious);
      if (fixtureCase === 'index-hidden') {
        git(fixture.source, 'update-index', '--assume-unchanged', 'scripts/manual/validate_release_manuals.rb');
      }
    }
    const input = resolved(fixture.source, fixture.sourceCommit);
    const result = await runCli(['--repository', SLUG, '--source', fixture.source, '--release', '1.11.0'], {
      targetRoot,
      ...dependenciesFor(input),
    });
    assert.equal(result.exitCode, 4, fixtureCase);
    assert.match(result.stderr, /(?:SOURCE_DIRTY|SOURCE_VALIDATOR_BLOB|PATH_SYMLINK)/, fixtureCase);
    assert.equal(await exists(sentinel), false, fixtureCase);
    assert.equal(await exists(path.join(targetRoot, '.manual-sync-journal.json')), false, fixtureCase);
  }
});

test('a moved release aborts before staging with exit 3 and sanitized output', async (t) => {
  const fixture = await createSourceFixture();
  const targetRoot = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-site-'));
  t.after(() => rm(fixture.source, { recursive: true, force: true }));
  t.after(() => rm(targetRoot, { recursive: true, force: true }));
  const input = resolved(fixture.source, fixture.sourceCommit);
  const moved = Object.assign(new Error('token ghp_SENTINEL_SUPER_SECRET_1234567890'), {
    code: 'RELEASE_MOVED', expected: RELEASE_COMMIT, actual: '7'.repeat(40),
  });
  const result = await runCli(['--repository', SLUG, '--source', fixture.source, '--release', '1.11.0'], {
    targetRoot,
    ...dependenciesFor(input, { assertReleaseUnmovedImpl: async () => { throw moved; } }),
  });
  assert.equal(result.exitCode, 3);
  assert.match(result.stderr, /RELEASE_MOVED/);
  assert.match(result.stderr, /"mutated":false/);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /SENTINEL|token/i);
  assert.equal(await exists(path.join(targetRoot, '.manual-sync')), false);
});

test('mutating sync recovers every Task 4 interruption before resolving a release', async (t) => {
  const points = [
    'beforeJournalPersistence', 'afterJournalPersistence',
    'beforeBackupPersistence', 'duringBackupPersistence', 'afterBackupPersistence',
    'beforeIntentPersistence', 'afterIntentPersistence', 'beforeTargetRename', 'afterTargetRename',
    'beforeCompletionPersistence', 'afterCompletionPersistence',
    'beforeCommitMarkerPersistence', 'afterCommitMarkerPersistence', 'beforeCleanup', 'afterCleanup',
  ];
  const fixture = await createSourceFixture();
  const input = resolved(fixture.source, fixture.sourceCommit);
  const moduleUrl = pathToFileURL(path.resolve('scripts/manual/lib/publication.mjs')).href;
  t.after(() => rm(fixture.source, { recursive: true, force: true }));
  for (const point of points) {
    const targetRoot = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-orphan-'));
    t.after(() => rm(targetRoot, { recursive: true, force: true }));
    await write(targetRoot, 'orphan.txt', 'before\n');
    const orphanEntries = [{ path: 'orphan.txt', content: 'after\n' }];
    const staged = await stagePublication({
      targetRoot,
      entries: orphanEntries,
      generationId: generationFor(orphanEntries),
      scope: SLUG,
    });
    const child = spawnSync(process.execPath, ['--input-type=module', '-e', `
      import { publishStaged } from ${JSON.stringify(moduleUrl)};
      const [targetRoot, staged, point] = JSON.parse(process.env.CASE);
      await publishStaged({ targetRoot, staged, injectFailure(at) {
        if (at === point) process.kill(process.pid, 'SIGKILL');
      }});
    `], { env: { ...process.env, CASE: JSON.stringify([targetRoot, staged, point]) } });
    assert.notEqual(child.status, 0, point);
    let recovered = false;
    let resolvedAfterRecovery = false;
    await syncManual({ ...input, mode: 'release', targetRoot }, dependenciesFor(input, {
      recoverPublicationImpl: async (root) => {
        const { recoverPublication } = await import('../../scripts/manual/lib/publication.mjs');
        const result = await recoverPublication(root);
        recovered = true;
        return result;
      },
      resolveReleaseImpl: async () => {
        resolvedAfterRecovery = recovered;
        return {
          repository: FULL_NAME, releaseRef: input.releaseRef,
          releaseCommit: input.releaseCommit, minorVersion: input.minorVersion,
        };
      },
    }));
    assert.equal(resolvedAfterRecovery, true, point);
    assert.equal(await exists(path.join(targetRoot, '.manual-sync-journal.json')), false, point);
  }
});

test('recover mode performs recovery only', async () => {
  const calls = [];
  const result = await syncManual({ mode: 'recover', repository: SLUG, targetRoot: '/unused' }, {
    recoverPublicationImpl: async () => { calls.push('recover'); return { recovered: true, committed: false }; },
    resolveReleaseImpl: async () => { calls.push('release'); },
  });
  assert.deepEqual(calls, ['recover']);
  assert.equal(result.changed, false);
  assert.equal(result.recovery.recovered, true);
});

function generationFor(entries) {
  const chunks = [];
  for (const entry of [...entries].sort((a, b) => a.path.localeCompare(b.path))) {
    const name = Buffer.from(entry.path);
    const content = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content);
    chunks.push(Buffer.from(`${name.length}:`), name, Buffer.from(`${content.length}:`), content);
  }
  return createHash('sha256').update(Buffer.concat(chunks)).digest('hex');
}

async function treeDigest(root) {
  const files = [];
  async function visit(directory, prefix = '') {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = path.posix.join(prefix, entry.name);
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute, relative);
      else files.push([relative, await readFile(absolute)]);
    }
  }
  await visit(root);
  const hash = createHash('sha256');
  for (const [relative, content] of files) hash.update(relative).update(content);
  return hash.digest('hex');
}
