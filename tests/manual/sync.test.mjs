import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildSnapshot, syncManual } from '../../scripts/manual/sync-manual.mjs';

async function write(root, relative, content) {
  const target = path.join(root, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

function commit(root, message) {
  execFileSync('git', ['-C', root, 'add', '.']);
  execFileSync('git', ['-C', root, 'commit', '-m', message], { stdio: 'ignore' });
}

async function createSourceFixture() {
  const source = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-source-'));
  execFileSync('git', ['-C', source, 'init', '-q']);
  execFileSync('git', ['-C', source, 'config', 'user.name', 'Manual Test']);
  execFileSync('git', ['-C', source, 'config', 'user.email', 'manual@example.com']);
  const manifest = {
    schemaVersion: 2,
    modules: [{
      id: 'sample',
      group: 'foundation',
      kind: 'library',
      en: 'en/modules/sample.md',
      ko: 'ko/modules/sample.md',
      chapters: [{
        id: 'chapter-one',
        en: 'en/modules/sample/chapter-one.md',
        ko: 'ko/modules/sample/chapter-one.md',
      }],
      assets: ['assets/sample/model.svg', 'assets/sample/model.png'],
    }],
  };
  const landing = '---\ntitle: Sample\nmanualId: sample\n---\n\n# Sample\n';
  const chapter = [
    '---',
    'title: Chapter one',
    'manualId: sample',
    'chapterId: chapter-one',
    '---',
    '',
    '# Chapter one',
    '',
    '![Model](../../../assets/sample/model.svg)',
    '',
  ].join('\n');
  await write(source, 'docs/manual/generated/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  await write(source, 'docs/manual/en/modules/sample.md', landing);
  await write(source, 'docs/manual/ko/modules/sample.md', landing);
  await write(source, 'docs/manual/en/modules/sample/chapter-one.md', chapter);
  await write(source, 'docs/manual/ko/modules/sample/chapter-one.md', chapter);
  await write(source, 'docs/manual/assets/sample/model.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>\n');
  await write(source, 'docs/manual/assets/sample/model.png', Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  commit(source, 'Create manual fixture');
  return { source, manifest };
}

test('real source produces bilingual deterministic snapshot data', async () => {
  const source = process.env.BLUETAPE4K_PROJECTS_SOURCE;
  if (!source) return test.skip('BLUETAPE4K_PROJECTS_SOURCE is not set');
  const first = await buildSnapshot({ source });
  const second = await buildSnapshot({ source });
  assert.deepEqual(first, second);
  const manifest = JSON.parse(await readFile(path.join(source, 'docs/manual/generated/manifest.json'), 'utf8'));
  const expectedDocuments = 6 + manifest.modules.reduce(
    (total, module) => total + 2 + 2 * (module.chapters?.length ?? 0),
    0,
  );
  const expectedAssets = manifest.modules.reduce(
    (total, module) => total + (module.assets?.length ?? 0),
    0,
  );
  assert.equal(first.snapshot.documentFiles, expectedDocuments);
  assert.equal(first.snapshot.assetFiles, expectedAssets);
});

test('syncs chapter documents and binary assets and removes stale assets', async () => {
  const { source, manifest } = await createSourceFixture();
  const targetRoot = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-site-'));
  try {
    const first = await buildSnapshot({ source });
    assert.equal(first.snapshot.documentFiles, 4);
    assert.equal(first.snapshot.assetFiles, 2);
    assert.equal(first.snapshot.contentFiles, 6);
    const transformed = first.contentEntries.find((entry) => entry.path.endsWith('/sample/chapter-one.md'));
    assert.match(transformed.content, /chapterId: "chapter-one"/);
    assert.match(transformed.content, /\/manual-assets\/bluetape4k-projects\/sample\/model\.svg/);

    await syncManual({ source, targetRoot });
    const assetPath = path.join(targetRoot, 'public/manual-assets/bluetape4k-projects/sample/model.svg');
    assert.match(await readFile(assetPath, 'utf8'), /<svg/);
    await syncManual({ source, targetRoot, check: true });

    manifest.modules[0].assets = [];
    await write(source, 'docs/manual/generated/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
    await rm(path.join(source, 'docs/manual/assets'), { recursive: true, force: true });
    commit(source, 'Remove manual assets');
    await syncManual({ source, targetRoot });

    await assert.rejects(readFile(assetPath), { code: 'ENOENT' });
  } finally {
    await rm(source, { recursive: true, force: true });
    await rm(targetRoot, { recursive: true, force: true });
  }
});
