import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, realpath, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  assetDestinationFor,
  destinationFor,
  githubSourceUrlFor,
  manualRouteFor,
  resolveApprovedPath,
  safeRelativePath,
} from '../../scripts/manual/lib/paths.mjs';

test('preserves nested chapter routes', () => {
  assert.equal(
    destinationFor('ko', 'ko/modules/bluetape4k-coroutines/lifecycle.md', '1.11'),
    'src/content/docs/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-coroutines/lifecycle.md',
  );
});

test('publishes repository-owned manual assets under one stable namespace', () => {
  assert.equal(
    assetDestinationFor('bluetape4k-projects', 'assets/coroutines/scope-lifecycle.svg', '1.11'),
    'public/manual-assets/bluetape4k-projects/1.11/coroutines/scope-lifecycle.svg',
  );
});

test('normalizes safe relative paths after exactly one percent decode', () => {
  assert.equal(safeRelativePath('modules/core%20api.md'), 'modules/core api.md');
  assert.equal(safeRelativePath('modules/core.md'), 'modules/core.md');
});

test('rejects every path form that can escape or reinterpret its approved namespace', () => {
  for (const unsafe of [
    '', '.', '..', '../x', 'a/../x', '/tmp/x', 'a\\b', '\0', '//evil/x',
    'https://evil/x', 'x:q', 'x?q=1', 'x#part', '%2e%2e/x', '%252e%252e/x',
    '%2fetc/passwd', 'a//b', '%E0%A4%A',
  ]) {
    assert.throws(() => safeRelativePath(unsafe), /PATH_UNSAFE/, unsafe);
  }
});

test('builds only contained locale, repository, and minor routes', () => {
  assert.equal(
    destinationFor('ko', 'ko/modules/core.md', '1.11'),
    'src/content/docs/ko/manual/bluetape4k-projects/1.11/modules/core.md',
  );
  assert.equal(
    manualRouteFor('en', 'bluetape4k-projects', '1.11', 'modules/core.md'),
    '/manual/bluetape4k-projects/1.11/modules/core/',
  );
  assert.equal(
    manualRouteFor('ko', 'bluetape4k-projects', '1.11', 'guide/index.md'),
    '/ko/manual/bluetape4k-projects/1.11/guide/',
  );
  for (const call of [
    () => destinationFor('ja', 'ja/modules/core.md', '1.11'),
    () => destinationFor('ko', 'ko/modules/core.md', 'v1.11'),
    () => manualRouteFor('ko', 'other', '1.11', 'modules/core.md'),
    () => assetDestinationFor('other', 'assets/core/model.svg', '1.11'),
  ]) assert.throws(call, /(?:LOCALE_UNSUPPORTED|REPOSITORY_UNSUPPORTED|MINOR_UNSAFE)/);
});

test('creates fixed-origin release source URLs with encoded path segments', () => {
  assert.equal(
    githubSourceUrlFor({
      repositoryFullName: 'bluetape4k/bluetape4k-projects',
      releaseRef: '1.11.0',
      sourcePath: 'src/core API/Core.kt',
      kind: 'blob',
    }),
    'https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/src/core%20API/Core.kt',
  );
  assert.equal(
    githubSourceUrlFor({
      repositoryFullName: 'bluetape4k/bluetape4k-projects',
      releaseRef: 'v1.11.2',
      sourcePath: 'bluetape4k/core',
      kind: 'tree',
    }),
    'https://github.com/bluetape4k/bluetape4k-projects/tree/v1.11.2/bluetape4k/core',
  );
  for (const sourcePath of ['/x', '//evil/x', 'https://evil/x', '../x', '%2e%2e/x', 'x?q=1', 'x#part']) {
    assert.throws(() => githubSourceUrlFor({
      repositoryFullName: 'bluetape4k/bluetape4k-projects', releaseRef: '1.11.0', sourcePath, kind: 'blob',
    }), /PATH_UNSAFE/, sourcePath);
  }
  assert.throws(() => githubSourceUrlFor({
    repositoryFullName: 'evil/repo', releaseRef: '1.11.0', sourcePath: 'src/Core.kt', kind: 'blob',
  }), /REPOSITORY_UNSUPPORTED/);
  assert.throws(() => githubSourceUrlFor({
    repositoryFullName: 'bluetape4k/bluetape4k-projects', releaseRef: 'main', sourcePath: 'src/Core.kt', kind: 'blob',
  }), /RELEASE_UNSAFE/);
});

test('resolves only real non-symlink paths inside an approved root', async (context) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'manual-paths-'));
  context.after(async () => (await import('node:fs/promises')).rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'safe'), { recursive: true });
  await writeFile(path.join(root, 'safe', 'manual.md'), 'safe');
  await symlink(os.tmpdir(), path.join(root, 'escape'));

  const approvedRoot = await realpath(root);
  assert.equal(await resolveApprovedPath(root, 'safe/manual.md'), path.join(approvedRoot, 'safe', 'manual.md'));
  assert.equal(
    await resolveApprovedPath(root, 'safe/generated.md', { allowMissing: true }),
    path.join(approvedRoot, 'safe', 'generated.md'),
  );
  await assert.rejects(resolveApprovedPath(root, 'escape/secret.md', { allowMissing: true }), /PATH_SYMLINK/);
  await assert.rejects(resolveApprovedPath(root, '../outside', { allowMissing: true }), /PATH_UNSAFE/);
});
