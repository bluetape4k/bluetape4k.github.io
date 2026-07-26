import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const technicalClasses = new Set(['bt4k-architecture', 'bt4k-chart', 'bt4k-sequence']);

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(target) : [target];
  }));
  return nested.flat();
}

function technicalAssets(source, file) {
  const assets = [];
  for (const match of source.matchAll(/<figure\b([^>]*)>([\s\S]*?)<\/figure>/g)) {
    const className = match[1].match(/\bclass="([^"]+)"/)?.[1];
    if (!technicalClasses.has(className)) continue;
    const asset = match[2].match(/<img\b[^>]*\bsrc="\/assets\/([^"]+\.png)"/)?.[1];
    assert.ok(asset, `${file}: technical figure must contain one local PNG`);
    assets.push(asset);
  }
  return assets;
}

async function assertAssetPair(asset, file) {
  const svg = asset.replace(/\.png$/, '.svg');
  await assert.doesNotReject(
    access(path.join(root, 'public/assets', asset)),
    `${file}: missing PNG ${asset}`,
  );
  await assert.doesNotReject(
    access(path.join(root, 'public/assets', svg)),
    `${file}: missing canonical SVG ${svg}`,
  );
  const stem = asset.replace(/-(?:en|ko)\.png$/, '');
  for (const locale of ['en', 'ko']) {
    for (const extension of ['png', 'svg']) {
      const counterpart = `${stem}-${locale}.${extension}`;
      await assert.doesNotReject(
        access(path.join(root, 'public/assets', counterpart)),
        `${file}: missing locale counterpart ${counterpart}`,
      );
    }
  }
  return stem;
}

test('blog technical diagrams use explicit locale assets with matching SVG sources', async () => {
  const localeRoots = [
    ['en', path.join(root, 'src/content/docs/blog')],
    ['ko', path.join(root, 'src/content/docs/ko/blog')],
  ];
  const stems = new Set();

  for (const [locale, directory] of localeRoots) {
    const files = (await filesUnder(directory)).filter((file) => file.endsWith('.mdx'));
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      for (const asset of technicalAssets(source, file)) {
        assert.match(asset, new RegExp(`-${locale}\\.png$`), `${file}: ${asset}`);
        stems.add(await assertAssetPair(asset, file));
      }
    }
  }

  assert.equal(stems.size, 161);
});

test('paired English and Korean posts reference the same technical diagram stems', async () => {
  const englishRoot = path.join(root, 'src/content/docs/blog');
  const koreanRoot = path.join(root, 'src/content/docs/ko/blog');
  const englishFiles = (await filesUnder(englishRoot)).filter((file) => file.endsWith('.mdx'));

  for (const englishFile of englishFiles) {
    const relative = path.relative(englishRoot, englishFile);
    const koreanFile = path.join(koreanRoot, relative);
    try {
      await access(koreanFile);
    } catch {
      continue;
    }
    const english = technicalAssets(await readFile(englishFile, 'utf8'), englishFile)
      .map((asset) => asset.replace(/-en\.png$/, ''))
      .sort();
    const korean = technicalAssets(await readFile(koreanFile, 'utf8'), koreanFile)
      .map((asset) => asset.replace(/-ko\.png$/, ''))
      .sort();
    assert.deepEqual(korean, english, relative);
  }
});
