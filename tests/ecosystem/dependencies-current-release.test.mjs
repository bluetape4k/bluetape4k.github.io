import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const projectRoot = new URL('../../', import.meta.url);
const currentGuidancePaths = [
  'src/content/docs/index.mdx',
  'src/content/docs/ko/index.mdx',
  'src/content/docs/getting-started.mdx',
  'src/content/docs/ko/getting-started.mdx',
  'src/content/docs/ecosystem/repositories.mdx',
  'src/content/docs/ko/ecosystem/repositories.mdx',
  'src/content/docs/ecosystem/version-governance.mdx',
  'src/content/docs/ko/ecosystem/version-governance.mdx',
];

async function read(path) {
  return readFile(new URL(path, projectRoot), 'utf8');
}

test('current dependency guidance follows the latest stable manual release', async () => {
  const [manifestSource, repositoriesSource, ...guidanceSources] = await Promise.all([
    read('src/data/manual/bluetape4k-dependencies.manifest.json'),
    read('src/data/manual/repositories.json'),
    ...currentGuidancePaths.map(read),
  ]);
  const manifest = JSON.parse(manifestSource);
  const repositories = JSON.parse(repositoriesSource).repositories;
  const repository = repositories.find(({ slug }) => slug === 'bluetape4k-dependencies');

  assert.ok(repository, 'bluetape4k-dependencies is missing from the manual repository registry');
  assert.equal(manifest.minorVersion, repository.latestMinor);

  for (const [index, source] of guidanceSources.entries()) {
    assert.match(
      source,
      new RegExp(`\\b${manifest.releaseRef.replaceAll('.', '\\.')}\\b`),
      `${currentGuidancePaths[index]} does not advertise the latest stable release ${manifest.releaseRef}`,
    );
  }
});
