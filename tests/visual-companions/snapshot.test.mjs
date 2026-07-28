import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import {
  syncVisualCompanionSnapshot,
  validateVisualCompanionSnapshot,
} from '../../scripts/visual-companions/lib/snapshot.mjs';

const execute = promisify(execFile);
const repository = 'bluetape4k/clinic-appointment';

async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function git(root, ...args) {
  const { stdout } = await execute('git', args, { cwd: root });
  return stdout.trim();
}

function document(id, source, enHtml, koHtml, extra = {}) {
  return {
    id,
    source,
    status: 'approved',
    public: true,
    presentation: {
      mode: 'hybrid',
      defaultView: 'simulation',
      views: ['simulation', 'history'],
    },
    locales: {
      en: { title: `${id} English`, html: enHtml },
      ko: { title: `${id} 한국어`, html: koHtml },
    },
    ...extra,
  };
}

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'visual-snapshot-'));
  const sourceRoot = path.join(root, 'source');
  const siteRoot = path.join(root, 'site');
  await mkdir(path.join(sourceRoot, 'docs/specs'), { recursive: true });
  await mkdir(siteRoot, { recursive: true });

  const documents = [
    document(
      'appointment-plan-and-capacity',
      'docs/specs/plan.md',
      'docs/specs/plan.en.html',
      'docs/specs/plan.html',
      { sourceOnlyMetadata: 'must not be projected' },
    ),
    document(
      'scheduling-policy-foundation',
      'docs/specs/policy.md',
      'docs/specs/policy.en.html',
      'docs/specs/policy.html',
    ),
    { ...document('private-draft', 'docs/specs/private.md', 'docs/specs/private.en.html', 'docs/specs/private.html'), public: false },
  ];
  await writeJson(path.join(sourceRoot, 'docs/visual-companions/manifest.json'), {
    schemaVersion: 1,
    repository,
    documents,
    ignoredSourceMetadata: true,
  });
  for (const [name, content] of [
    ['plan.en.html', '<!doctype html><html lang="en"><body id="simulation"><a href="plan.md">source</a><a href="plan.html">한국어</a></body></html>'],
    ['plan.html', '<!doctype html><html lang="ko"><body id="history"><a href="plan.md">원문</a><a href="plan.en.html">English</a></body></html>'],
    ['policy.en.html', '<!doctype html><html lang="en"><body id="simulation">policy en</body></html>'],
    ['policy.html', '<!doctype html><html lang="ko"><body id="history">policy ko</body></html>'],
    ['private.en.html', '<!doctype html><html lang="en"><body>private en</body></html>'],
    ['private.html', '<!doctype html><html lang="ko"><body>private ko</body></html>'],
    ['outside.html', '<!doctype html><html><body>outside</body></html>'],
  ]) {
    await writeFile(path.join(sourceRoot, 'docs/specs', name), content);
  }
  for (const name of ['plan.md', 'policy.md', 'private.md']) {
    await writeFile(path.join(sourceRoot, 'docs/specs', name), `# ${name}\n`);
  }

  await git(sourceRoot, 'init');
  await git(sourceRoot, 'config', 'user.email', 'test@example.com');
  await git(sourceRoot, 'config', 'user.name', 'Test');
  await git(sourceRoot, 'add', '.');
  await git(sourceRoot, 'commit', '-m', 'fixture');
  const sourceRef = await git(sourceRoot, 'rev-parse', 'HEAD');
  await writeJson(path.join(siteRoot, 'src/data/visual-companions/repositories.json'), {
    schemaVersion: 1,
    repositories: [{
      repository,
      sourceRef,
      manifestPath: 'docs/visual-companions/manifest.json',
    }],
  });

  return { root, siteRoot, sourceRoot, sourceRef };
}

test('visual companion snapshot copies only public manifest locale assets to fixed routes', async () => {
  const setup = await fixture();
  const result = await syncVisualCompanionSnapshot({ ...setup, repository });

  assert.equal(result.documentCount, 2);
  assert.equal(result.assetCount, 4);
  assert.deepEqual(result.snapshot.documents.map(({ id }) => id), [
    'appointment-plan-and-capacity',
    'scheduling-policy-foundation',
  ]);
  assert.equal('ignoredSourceMetadata' in result.snapshot, false);
  assert.equal('sourceOnlyMetadata' in result.snapshot.documents[0], false);
  assert.match(result.snapshot.documents[0].locales.en.sourceSha256, /^[0-9a-f]{64}$/);
  assert.deepEqual(
    result.snapshot.documents.flatMap(({ locales }) => Object.values(locales).map(({ route }) => route)),
    [
      '/visual-companions/clinic-appointment/appointment-plan-and-capacity/',
      '/ko/visual-companions/clinic-appointment/appointment-plan-and-capacity/',
      '/visual-companions/clinic-appointment/scheduling-policy-foundation/',
      '/ko/visual-companions/clinic-appointment/scheduling-policy-foundation/',
    ],
  );
  await assert.rejects(
    access(path.join(setup.siteRoot, 'public/visual-companions/clinic-appointment/private-draft/index.html')),
  );
  await assert.rejects(
    access(path.join(setup.siteRoot, 'public/visual-companions/clinic-appointment/outside/index.html')),
  );
  const english = await readFile(
    path.join(setup.siteRoot, 'public/visual-companions/clinic-appointment/appointment-plan-and-capacity/index.html'),
    'utf8',
  );
  assert.match(
    english,
    new RegExp(`https://github.com/bluetape4k/clinic-appointment/blob/${setup.sourceRef}/docs/specs/plan.md`),
  );
  assert.match(
    english,
    /href="\/ko\/visual-companions\/clinic-appointment\/appointment-plan-and-capacity\/"/,
  );
  assert.doesNotMatch(english, /href="plan\.(?:md|html)"/);
  assert.equal((await validateVisualCompanionSnapshot({ siteRoot: setup.siteRoot, repository })).assetCount, 4);
});

test('visual companion snapshot rejects source revision mismatch and a dirty checkout', async () => {
  const setup = await fixture();
  await assert.rejects(
    syncVisualCompanionSnapshot({ ...setup, repository, sourceRef: 'a'.repeat(40) }),
    /VISUAL_SOURCE_REF_MISMATCH/,
  );

  await writeFile(path.join(setup.sourceRoot, 'docs/specs/plan.en.html'), 'changed');
  await assert.rejects(
    syncVisualCompanionSnapshot({ ...setup, repository }),
    /VISUAL_SOURCE_DIRTY/,
  );
});

test('visual companion snapshot rejects source symlink escape and destination traversal', async () => {
  const symlinkSetup = await fixture();
  const external = path.join(symlinkSetup.root, 'external.html');
  await writeFile(external, 'external');
  const linked = path.join(symlinkSetup.sourceRoot, 'docs/specs/linked.en.html');
  await symlink(external, linked);
  const manifestFile = path.join(symlinkSetup.sourceRoot, 'docs/visual-companions/manifest.json');
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  manifest.documents[0].locales.en.html = 'docs/specs/linked.en.html';
  await writeJson(manifestFile, manifest);
  await git(symlinkSetup.sourceRoot, 'add', '.');
  await git(symlinkSetup.sourceRoot, 'commit', '-m', 'symlink');
  symlinkSetup.sourceRef = await git(symlinkSetup.sourceRoot, 'rev-parse', 'HEAD');
  const registryFile = path.join(symlinkSetup.siteRoot, 'src/data/visual-companions/repositories.json');
  const registry = JSON.parse(await readFile(registryFile, 'utf8'));
  registry.repositories[0].sourceRef = symlinkSetup.sourceRef;
  await writeJson(registryFile, registry);
  await assert.rejects(
    syncVisualCompanionSnapshot({ ...symlinkSetup, repository }),
    /VISUAL_SOURCE_SYMLINK/,
  );

  const traversalSetup = await fixture();
  const traversalManifestFile = path.join(traversalSetup.sourceRoot, 'docs/visual-companions/manifest.json');
  const traversalManifest = JSON.parse(await readFile(traversalManifestFile, 'utf8'));
  traversalManifest.documents[0].id = '../escape';
  await writeJson(traversalManifestFile, traversalManifest);
  await git(traversalSetup.sourceRoot, 'add', '.');
  await git(traversalSetup.sourceRoot, 'commit', '-m', 'traversal');
  traversalSetup.sourceRef = await git(traversalSetup.sourceRoot, 'rev-parse', 'HEAD');
  const traversalRegistryFile = path.join(traversalSetup.siteRoot, 'src/data/visual-companions/repositories.json');
  const traversalRegistry = JSON.parse(await readFile(traversalRegistryFile, 'utf8'));
  traversalRegistry.repositories[0].sourceRef = traversalSetup.sourceRef;
  await writeJson(traversalRegistryFile, traversalRegistry);
  await assert.rejects(
    syncVisualCompanionSnapshot({ ...traversalSetup, repository }),
    /VISUAL_DOCUMENT_ID/,
  );
});

test('visual companion snapshot validation detects digest drift and stale assets offline', async () => {
  const driftSetup = await fixture();
  await syncVisualCompanionSnapshot({ ...driftSetup, repository });
  await writeFile(
    path.join(driftSetup.siteRoot, 'public/visual-companions/clinic-appointment/appointment-plan-and-capacity/index.html'),
    'changed',
  );
  await assert.rejects(
    validateVisualCompanionSnapshot({ siteRoot: driftSetup.siteRoot, repository }),
    /VISUAL_ASSET_DIGEST/,
  );

  const staleSetup = await fixture();
  await syncVisualCompanionSnapshot({ ...staleSetup, repository });
  await writeFile(
    path.join(staleSetup.siteRoot, 'public/ko/visual-companions/clinic-appointment/stale.txt'),
    'stale',
  );
  await assert.rejects(
    validateVisualCompanionSnapshot({ siteRoot: staleSetup.siteRoot, repository }),
    /VISUAL_ASSET_STALE/,
  );
});
