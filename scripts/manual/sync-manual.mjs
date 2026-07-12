import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, rename, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digestEntries } from './lib/digest.mjs';
import { assetDestinationFor, destinationFor, localeOf } from './lib/paths.mjs';
import { layerFor, stripFirstHeading, transformManual } from './lib/frontmatter.mjs';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function walk(root, prefix = '') {
  const entries = [];
  for (const item of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    const relative = path.posix.join(prefix, item.name);
    if (item.isDirectory()) entries.push(...await walk(root, relative));
    else entries.push(relative);
  }
  return entries.sort();
}

function parseArgs(argv) {
  const result = { repository: 'bluetape4k-projects', check: false };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--check') result.check = true;
    else if (argv[index] === '--source') result.source = argv[++index];
    else if (argv[index] === '--repository') result.repository = argv[++index];
  }
  if (!result.source) throw new Error('--source is required');
  return result;
}

function sourceCommit(source) {
  return execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

export async function buildSnapshot({ source, repository = 'bluetape4k-projects' }) {
  const root = path.resolve(source);
  const commit = sourceCommit(root);
  if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error(`Invalid source commit: ${commit}`);
  const manualRoot = path.join(root, 'docs/manual');
  const manifest = JSON.parse(await readFile(path.join(manualRoot, 'generated/manifest.json'), 'utf8'));
  if (manifest.schemaVersion !== 2) throw new Error(`Unsupported manual schema: ${manifest.schemaVersion}`);
  const byPath = new Map();
  for (const module of manifest.modules) {
    for (const locale of ['en', 'ko']) {
      const relative = module[locale];
      if (byPath.has(relative)) throw new Error(`Duplicate manual path: ${relative}`);
      byPath.set(relative, { module, chapter: null });
    }
    for (const chapter of module.chapters ?? []) {
      for (const locale of ['en', 'ko']) {
        const relative = chapter[locale];
        if (byPath.has(relative)) throw new Error(`Duplicate manual path: ${relative}`);
        byPath.set(relative, { module, chapter });
      }
    }
  }
  const sourcePaths = (await walk(manualRoot)).filter((item) => /^(en|ko)\/.*\.md$/.test(item));
  const sourceEntries = [];
  const contentEntries = [];
  for (const relative of sourcePaths) {
    const content = await readFile(path.join(manualRoot, relative), 'utf8');
    sourceEntries.push({ path: relative, content });
    const locale = localeOf(relative);
    const owner = byPath.get(relative);
    const transformed = owner
      ? transformManual({
          content,
          module: owner.module,
          chapter: owner.chapter,
          repository,
          sourceCommit: commit,
          sourcePath: `docs/manual/${relative}`,
        })
      : stripFirstHeading(content);
    contentEntries.push({ path: destinationFor(locale, relative), content: transformed });
  }
  const assetPaths = manifest.modules.flatMap((module) => module.assets ?? []);
  if (new Set(assetPaths).size !== assetPaths.length) throw new Error('Duplicate manual asset path');
  const assetEntries = [];
  for (const relative of assetPaths.sort()) {
    const content = await readFile(path.join(manualRoot, relative));
    assetEntries.push({ path: assetDestinationFor(repository, relative), content });
  }
  const normalized = {
    schemaVersion: manifest.schemaVersion,
    repository,
    sourceCommit: commit,
    modules: manifest.modules.map((module) => ({
      ...module,
      layer: layerFor(module.kind),
      routes: {
        en: `/manual/${repository}/${module.en.replace(/^en\//, '').replace(/\.md$/, '')}/`,
        ko: `/ko/manual/${repository}/${module.ko.replace(/^ko\//, '').replace(/\.md$/, '')}/`,
      },
      chapters: (module.chapters ?? []).map((chapter) => ({
        ...chapter,
        routes: {
          en: `/manual/${repository}/${chapter.en.replace(/^en\//, '').replace(/\.md$/, '')}/`,
          ko: `/ko/manual/${repository}/${chapter.ko.replace(/^ko\//, '').replace(/\.md$/, '')}/`,
        },
      })),
    })),
  };
  const snapshot = {
    repository,
    sourceCommit: commit,
    sourceDigest: digestEntries(sourceEntries),
    contentDigest: digestEntries(contentEntries),
    assetDigest: digestEntries(assetEntries),
    sourceFiles: sourceEntries.length,
    documentFiles: contentEntries.length,
    assetFiles: assetEntries.length,
    contentFiles: contentEntries.length + assetEntries.length,
  };
  contentEntries.push({ path: `src/data/manual/${repository}.manifest.json`, content: `${JSON.stringify(normalized, null, 2)}\n` });
  contentEntries.push({ path: `src/data/manual/${repository}.snapshot.json`, content: `${JSON.stringify(snapshot, null, 2)}\n` });
  return { contentEntries, assetEntries, snapshot };
}

async function currentContent(entries, targetRoot) {
  const current = [];
  for (const entry of entries) {
    try { current.push({ path: entry.path, content: await readFile(path.join(targetRoot, entry.path)) }); }
    catch { current.push({ path: entry.path, content: null }); }
  }
  return current;
}

export async function syncManual(options) {
  const repository = options.repository ?? 'bluetape4k-projects';
  const built = await buildSnapshot({ ...options, repository });
  const targetRoot = options.targetRoot ?? siteRoot;
  if (options.check) {
    const expected = [...built.contentEntries, ...built.assetEntries];
    const current = await currentContent(expected, targetRoot);
    const drift = expected
      .filter((entry, index) => {
        const actual = current[index].content;
        return actual === null || !Buffer.from(entry.content).equals(actual);
      })
      .map((entry) => entry.path);
    if (drift.length) throw new Error(`Manual snapshot drift (${drift.length} files): ${drift.slice(0, 5).join(', ')}`);
    return built.snapshot;
  }
  const temp = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-sync-'));
  try {
    const generatedEntries = [...built.contentEntries, ...built.assetEntries];
    for (const entry of generatedEntries) {
      const target = path.join(temp, entry.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, entry.content);
    }
    const targets = [
      `src/content/docs/manual/${repository}`,
      `src/content/docs/ko/manual/${repository}`,
      `public/manual-assets/${repository}`,
    ];
    for (const target of targets) {
      const staged = path.join(temp, target);
      await mkdir(staged, { recursive: true });
      const absolute = path.join(targetRoot, target);
      await rm(absolute, { recursive: true, force: true });
      await mkdir(path.dirname(absolute), { recursive: true });
      await rename(staged, absolute);
    }
    for (const entry of built.contentEntries.filter((item) => item.path.startsWith('src/data/'))) {
      const target = path.join(targetRoot, entry.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, entry.content);
    }
    return built.snapshot;
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const snapshot = await syncManual(options);
    console.log(`Manual snapshot ${options.check ? 'matches' : 'written'}: ${snapshot.contentFiles} files @ ${snapshot.sourceCommit}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
