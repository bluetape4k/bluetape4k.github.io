import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rename, rm, stat, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { publishStaged, recoverPublication, stagePublication } from '../../scripts/manual/lib/publication.mjs';

const metadata = new Set(['.manual-sync', '.manual-sync-journal.json', '.manual-sync-generation.json']);

function canonicalBytes(entries) {
  const chunks = [];
  for (const entry of [...entries].sort((a, b) => a.path.localeCompare(b.path))) {
    const name = Buffer.from(entry.path);
    const content = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content);
    chunks.push(Buffer.from(`${name.length}:`), name, Buffer.from(`${content.length}:`), content);
  }
  return Buffer.concat(chunks);
}

const generationFor = (entries) => createHash('sha256').update(canonicalBytes(entries)).digest('hex');
const digest = (value) => createHash('sha256').update(value).digest('hex');

async function digestTree(root) {
  const hash = createHash('sha256');
  const files = [];
  async function visit(directory, prefix = '') {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!prefix && metadata.has(entry.name)) continue;
      const relative = path.posix.join(prefix, entry.name);
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute, relative);
      else files.push([relative, await readFile(absolute)]);
    }
  }
  await visit(root);
  for (const [relative, content] of files.sort(([a], [b]) => a.localeCompare(b))) {
    hash.update(`${Buffer.byteLength(relative)}:${relative}${content.length}:`).update(content);
  }
  return hash.digest('hex');
}

async function digestTargets(root, targets) {
  const hash = createHash('sha256');
  for (const relative of [...targets].sort((left, right) => left.localeCompare(right))) {
    const name = Buffer.from(relative);
    const absolute = path.join(root, relative);
    if (!(await exists(absolute))) {
      hash.update(`M${name.length}:`).update(name);
      continue;
    }
    const content = await readFile(absolute);
    hash.update(`P${name.length}:`).update(name).update(`${content.length}:`).update(content);
  }
  return hash.digest('hex');
}

const exists = async (file) => stat(file).then(() => true, () => false);

const initial = {
  'content/index.md': 'old content\n',
  'assets/logo.svg': '<svg>old</svg>\n',
  'data/catalog.json': '{"old":true}\n',
  'aliases/latest.html': 'old alias\n',
  'redirects/map.json': '[]\n',
};

const entries = Object.entries({
  'content/index.md': 'new content\n',
  'assets/logo.svg': '<svg>new</svg>\n',
  'data/catalog.json': '{"new":true}\n',
  'aliases/latest.html': 'new alias\n',
  'redirects/map.json': '[{"to":"new"}]\n',
  'content/new.md': 'new target without pre-image\n',
}).map(([entryPath, content]) => ({ path: entryPath, content }));

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'manual-publication-'));
  for (const [relative, content] of Object.entries(initial)) {
    const target = path.join(root, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  return root;
}

async function staged(root, source = entries) {
  return stagePublication({ targetRoot: root, entries: source, generationId: generationFor(source) });
}

test('stages canonical input and rejects unsafe, duplicate, and dishonest generations', async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  const result = await staged(root);
  assert.equal(result.generationId, generationFor(entries));
  assert.equal(await readFile(path.join(root, result.stagingRoot, 'content/index.md'), 'utf8'), 'new content\n');
  await assert.rejects(() => stagePublication({ targetRoot: root, entries: [entries[0], entries[0]], generationId: generationFor([entries[0], entries[0]]) }), /PUBLICATION_DUPLICATE/);
  await assert.rejects(() => stagePublication({ targetRoot: root, entries: [{ path: '../outside', content: 'x' }], generationId: 'a'.repeat(64) }), /PUBLICATION_PATH/);
  await assert.rejects(() => stagePublication({ targetRoot: root, entries, generationId: 'A'.repeat(64) }), /PUBLICATION_GENERATION/);
  await assert.rejects(() => stagePublication({ targetRoot: root, entries, generationId: 'a'.repeat(64) }), /PUBLICATION_GENERATION_DIGEST/);
  for (const reserved of ['.manual-sync/attack', '.manual-sync-journal.json', '.manual-sync-generation.json']) {
    const reservedEntries = [{ path: reserved, content: 'x' }];
    await assert.rejects(() => stagePublication({
      targetRoot: root, entries: reservedEntries, generationId: generationFor(reservedEntries),
    }), /PUBLICATION_PATH/);
  }
});

test('rolls back every replacement failure and removes the durable journal', async (t) => {
  for (let failure = 0; failure < entries.length; failure += 1) {
    const root = await fixture();
    t.after(() => rm(root, { recursive: true, force: true }));
    const before = await digestTree(root);
    let replacements = 0;
    await assert.rejects(
      publishStaged({ targetRoot: root, staged: await staged(root), injectFailure(point) {
        if (point === 'afterTargetRename' && replacements++ === failure) throw new Error('injected');
      } }),
      (error) => error.code === 'PUBLICATION_ROLLBACK',
    );
    assert.equal(await digestTree(root), before);
    assert.equal(await exists(path.join(root, '.manual-sync-journal.json')), false);
    assert.equal(await exists(path.join(root, 'content/new.md')), false);
  }
});

test('publishes deterministically and identical input is unchanged', async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  const first = await publishStaged({ targetRoot: root, staged: await staged(root) });
  const firstDigest = await digestTree(root);
  const firstMarker = await readFile(path.join(root, '.manual-sync-generation.json'));
  assert.deepEqual(first, { changed: true });
  const second = await publishStaged({ targetRoot: root, staged: await staged(root) });
  assert.deepEqual(second, { changed: false });
  assert.equal(await digestTree(root), firstDigest);
  assert.deepEqual(await readFile(path.join(root, '.manual-sync-generation.json')), firstMarker);
  assert.doesNotMatch(firstMarker.toString(), /timestamp|created|updated/i);
});

test('ignores unrelated repository files and symlinks while preserving them', async (t) => {
  const root = await fixture();
  const external = await mkdtemp(path.join(os.tmpdir(), 'manual-unrelated-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  t.after(() => rm(external, { recursive: true, force: true }));
  await writeFile(path.join(external, 'sentinel'), 'external');
  await mkdir(path.join(root, 'node_modules', '.bin'), { recursive: true });
  await symlink(path.join(external, 'sentinel'), path.join(root, 'node_modules', '.bin', 'tool'));

  const first = await publishStaged({ targetRoot: root, staged: await staged(root) });
  await writeFile(path.join(root, 'unrelated.txt'), 'changed outside the publication');
  const second = await publishStaged({ targetRoot: root, staged: await staged(root) });

  assert.deepEqual(first, { changed: true });
  assert.deepEqual(second, { changed: false });
  assert.equal(await readFile(path.join(root, 'unrelated.txt'), 'utf8'), 'changed outside the publication');
  assert.equal(await readFile(path.join(root, 'node_modules', '.bin', 'tool'), 'utf8'), 'external');
});

test('kill/restart recovers every persistence boundary idempotently', async (t) => {
  const points = [
    'beforeJournalPersistence', 'afterJournalPersistence',
    'beforeBackupPersistence', 'duringBackupPersistence', 'afterBackupPersistence',
    'beforeIntentPersistence', 'afterIntentPersistence',
    'beforeTargetRename', 'afterTargetRename',
    'beforeCompletionPersistence', 'afterCompletionPersistence',
    'beforeCommitMarkerPersistence', 'afterCommitMarkerPersistence',
    'beforeCleanup', 'afterCleanup',
  ];
  const moduleUrl = pathToFileURL(path.resolve('scripts/manual/lib/publication.mjs')).href;
  for (const point of points) {
    const root = await fixture();
    t.after(() => rm(root, { recursive: true, force: true }));
    const before = await digestTree(root);
    const stage = await staged(root);
    const child = spawnSync(process.execPath, ['--input-type=module', '-e', `
      import { publishStaged } from ${JSON.stringify(moduleUrl)};
      const [root, staged, point] = JSON.parse(process.env.CASE);
      await publishStaged({ targetRoot: root, staged, injectFailure(at) {
        if (at === point) process.kill(process.pid, 'SIGKILL');
      }});
    `], { env: { ...process.env, CASE: JSON.stringify([root, stage, point]) } });
    assert.notEqual(child.status, 0, point);
    await recoverPublication(root);
    await recoverPublication(root);
    const committed = ['afterCommitMarkerPersistence', 'beforeCleanup', 'afterCleanup'].includes(point);
    if (committed) assert.equal(await digestTargets(root, entries.map(({ path: entryPath }) => entryPath)), stage.treeDigest, point);
    else assert.equal(await digestTree(root), before, point);
    assert.equal(await exists(path.join(root, '.manual-sync-journal.json')), false, point);
  }
});

test('recovers interrupted backups and committed journal residue', async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  const before = await digestTree(root);
  const stage = await staged(root);
  await assert.rejects(publishStaged({ targetRoot: root, staged: stage, injectFailure(point) {
    if (point === 'afterTargetRename') process.nextTick(() => {}), (() => { throw new Error('stop'); })();
  } }), /PUBLICATION_ROLLBACK/);
  assert.equal(await digestTree(root), before);

  await publishStaged({ targetRoot: root, staged: await staged(root), injectFailure(point) {
    if (point === 'afterCommitMarkerPersistence') throw Object.assign(new Error('committed'), { committed: true });
  }}).catch(() => {});
  await recoverPublication(root);
  assert.equal(await digestTargets(root, entries.map(({ path: entryPath }) => entryPath)), stage.treeDigest);
  assert.equal(await exists(path.join(root, '.manual-sync-journal.json')), false);
});

test('rejects forged journal paths, invalid generations, and symlink swaps without external writes', async (t) => {
  const root = await fixture();
  const external = await mkdtemp(path.join(os.tmpdir(), 'manual-external-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  t.after(() => rm(external, { recursive: true, force: true }));
  await writeFile(path.join(external, 'sentinel'), 'untouched');
  const validGeneration = 'a'.repeat(64);
  const forged = {
    schema: 1,
    generationId: validGeneration,
    stagingRoot: `.manual-sync/staging/${validGeneration}`,
    preTreeDigest: validGeneration,
    expectedTreeDigest: validGeneration,
    targets: [{
      target: '../manual-external/sentinel',
      staged: `.manual-sync/staging/${validGeneration}/sentinel`,
      backup: '../manual-external/sentinel',
      existedBefore: true,
      preImageDigest: validGeneration,
      backupComplete: true,
      expectedDigest: validGeneration,
      intentPersisted: true,
      completionPersisted: false,
    }],
  };
  await writeFile(path.join(root, '.manual-sync-journal.json'), JSON.stringify(forged));
  await assert.rejects(() => recoverPublication(root), /PUBLICATION_PATH/);
  assert.equal(await readFile(path.join(external, 'sentinel'), 'utf8'), 'untouched');

  await writeFile(path.join(root, '.manual-sync-journal.json'), JSON.stringify({ ...forged, generationId: 'x' }));
  await assert.rejects(() => recoverPublication(root), /PUBLICATION_GENERATION/);

  const inRootSentinel = path.join(root, 'unrelated.txt');
  await writeFile(inRootSentinel, 'keep me');
  const forgedInternal = structuredClone(forged);
  forgedInternal.targets[0].target = 'content/index.md';
  forgedInternal.targets[0].staged = `.manual-sync/staging/${validGeneration}/content/index.md`;
  forgedInternal.targets[0].backup = 'unrelated.txt';
  await writeFile(path.join(root, '.manual-sync-journal.json'), JSON.stringify(forgedInternal));
  await assert.rejects(() => recoverPublication(root), /PUBLICATION_JOURNAL_PATH/);
  assert.equal(await readFile(inRootSentinel, 'utf8'), 'keep me');

  await rm(path.join(root, '.manual-sync-journal.json'));
  const stage = await staged(root);
  const beforeSwap = await digestTree(root);
  await assert.rejects(publishStaged({ targetRoot: root, staged: stage, injectFailure(point) {
    if (point === 'afterIntentPersistence') {
      return rm(path.join(root, 'content'), { recursive: true }).then(() => symlink(external, path.join(root, 'content')));
    }
  }}), /PUBLICATION_ROLLBACK/);
  assert.equal(await readFile(path.join(external, 'sentinel'), 'utf8'), 'untouched');
  assert.equal(await digestTree(root), beforeSwap);
  assert.equal(await exists(path.join(root, '.manual-sync-journal.json')), false);
});

test('cleans an interrupted partial backup without treating it as verified', async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  const stage = await staged(root, [entries[0]]);
  const before = await digestTargets(root, [entries[0].path]);
  const generation = stage.generationId;
  const backup = `.manual-sync/backups/${generation}/000000`;
  const journal = {
    schema: 1,
    generationId: generation,
    stagingRoot: stage.stagingRoot,
    preTreeDigest: before,
    expectedTreeDigest: stage.treeDigest,
    targets: [{
      target: entries[0].path,
      staged: stage.expected[0].staged,
      backup,
      existedBefore: true,
      preImageDigest: digest(initial[entries[0].path]),
      backupComplete: false,
      expectedDigest: stage.expected[0].digest,
      intentPersisted: false,
      completionPersisted: false,
    }],
  };
  const partial = path.join(root, `${backup}.partial-crash`);
  await mkdir(path.dirname(partial), { recursive: true });
  await writeFile(partial, 'partial');
  await writeFile(path.join(root, '.manual-sync-journal.json'), JSON.stringify(journal));
  assert.deepEqual(await recoverPublication(root), { recovered: true, committed: false });
  assert.equal(await digestTargets(root, [entries[0].path]), before);
  assert.equal(await exists(path.join(root, '.manual-sync-journal.json')), false);
  assert.equal(await exists(partial), false);
});

test('uses byte content rather than text normalization for generation identity', async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  const binary = [{ path: 'assets/raw.bin', content: Buffer.from([0, 13, 10, 255]) }];
  const stage = await stagePublication({ targetRoot: root, entries: binary, generationId: generationFor(binary) });
  assert.equal(stage.expected[0].digest, digest(binary[0].content));
});

test('recomputes canonical generation and tree digests before publishing a staged object', async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  const stage = await staged(root);
  const forgedGeneration = 'b'.repeat(64);
  const forgedRoot = `.manual-sync/staging/${forgedGeneration}`;
  await rename(path.join(root, stage.stagingRoot), path.join(root, forgedRoot));
  const forged = {
    ...stage,
    generationId: forgedGeneration,
    stagingRoot: forgedRoot,
    expected: stage.expected.map((item) => ({
      ...item,
      staged: path.posix.join(forgedRoot, item.target),
    })),
  };
  await assert.rejects(() => publishStaged({ targetRoot: root, staged: forged }), /PUBLICATION_GENERATION_DIGEST/);
  assert.equal(await exists(path.join(root, '.manual-sync-generation.json')), false);
});
