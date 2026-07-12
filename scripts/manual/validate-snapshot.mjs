import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digestEntries } from './lib/digest.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repository = process.argv[2] ?? 'bluetape4k-projects';
const manifest = JSON.parse(await readFile(path.join(root, `src/data/manual/${repository}.manifest.json`), 'utf8'));
const snapshot = JSON.parse(await readFile(path.join(root, `src/data/manual/${repository}.snapshot.json`), 'utf8'));
const ids = manifest.modules.map((module) => module.id);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate manual IDs in site manifest');
const entries = [];
for (const module of manifest.modules) {
  for (const locale of ['en', 'ko']) {
    const routePath = module[locale].replace(new RegExp(`^${locale}/`), '');
    const base = locale === 'ko' ? 'src/content/docs/ko/manual' : 'src/content/docs/manual';
    const file = path.join(base, repository, routePath);
    const content = await readFile(path.join(root, file), 'utf8');
    if (!content.includes(`id: ${JSON.stringify(module.id)}`)) throw new Error(`${file}: manual ID mismatch`);
    entries.push({ path: file, content });
  }
  for (const chapter of module.chapters ?? []) {
    for (const locale of ['en', 'ko']) {
      const routePath = chapter[locale].replace(new RegExp(`^${locale}/`), '');
      const base = locale === 'ko' ? 'src/content/docs/ko/manual' : 'src/content/docs/manual';
      const file = path.join(base, repository, routePath);
      const content = await readFile(path.join(root, file), 'utf8');
      if (!content.includes(`id: ${JSON.stringify(module.id)}`)) throw new Error(`${file}: manual ID mismatch`);
      if (!content.includes(`chapterId: ${JSON.stringify(chapter.id)}`)) throw new Error(`${file}: chapter ID mismatch`);
      entries.push({ path: file, content });
    }
  }
}
const allContent = [];
for (const locale of ['en', 'ko']) {
  for (const relative of ['index.md', 'getting-started.md', 'architecture/repository-map.md']) {
    const base = locale === 'ko' ? 'src/content/docs/ko/manual' : 'src/content/docs/manual';
    const file = path.join(base, repository, relative);
    allContent.push({ path: file, content: await readFile(path.join(root, file), 'utf8') });
  }
}
allContent.push(...entries);
if (digestEntries(allContent) !== snapshot.contentDigest) throw new Error('Manual snapshot content digest mismatch');
if (manifest.schemaVersion === 2) {
  const assets = [];
  for (const relative of manifest.modules.flatMap((module) => module.assets ?? [])) {
    const file = path.join('public/manual-assets', repository, relative.replace(/^assets\//, ''));
    assets.push({ path: file, content: await readFile(path.join(root, file)) });
  }
  if (digestEntries(assets) !== snapshot.assetDigest) throw new Error('Manual snapshot asset digest mismatch');
  if (snapshot.documentFiles !== allContent.length) throw new Error('Manual snapshot document count mismatch');
  if (snapshot.assetFiles !== assets.length) throw new Error('Manual snapshot asset count mismatch');
  if (snapshot.contentFiles !== allContent.length + assets.length) throw new Error('Manual snapshot total count mismatch');
} else if (snapshot.contentFiles !== allContent.length) {
  throw new Error('Manual snapshot legacy content count mismatch');
}
console.log(
  `Manual snapshot valid: ${manifest.modules.length} modules, ${allContent.length} localized files, ${snapshot.assetFiles ?? 0} assets.`,
);
