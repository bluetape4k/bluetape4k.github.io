import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, rename, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digestEntries } from './lib/digest.mjs';
import { destinationFor, localeOf } from './lib/paths.mjs';
import { layerFor, transformManual } from './lib/frontmatter.mjs';

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
  const byPath = new Map();
  for (const module of manifest.modules) {
    for (const locale of ['en', 'ko']) {
      const relative = module[locale];
      if (byPath.has(relative)) throw new Error(`Duplicate manual path: ${relative}`);
      byPath.set(relative, module);
    }
  }
  const sourcePaths = (await walk(manualRoot)).filter((item) => /^(en|ko)\/.*\.md$/.test(item));
  const sourceEntries = [];
  const contentEntries = [];
  for (const relative of sourcePaths) {
    const content = await readFile(path.join(manualRoot, relative), 'utf8');
    sourceEntries.push({ path: relative, content });
    const locale = localeOf(relative);
    const module = byPath.get(relative);
    const transformed = module
      ? transformManual({ content, module, repository, sourceCommit: commit, sourcePath: `docs/manual/${relative}` })
      : content;
    contentEntries.push({ path: destinationFor(locale, relative), content: transformed });
  }
  const normalized = {
    repository,
    sourceCommit: commit,
    modules: manifest.modules.map((module) => ({
      ...module,
      layer: layerFor(module.kind),
      routes: {
        en: `/manual/${repository}/${module.en.replace(/^en\//, '').replace(/\.md$/, '')}/`,
        ko: `/ko/manual/${repository}/${module.ko.replace(/^ko\//, '').replace(/\.md$/, '')}/`,
      },
    })),
  };
  const snapshot = {
    repository,
    sourceCommit: commit,
    sourceDigest: digestEntries(sourceEntries),
    contentDigest: digestEntries(contentEntries),
    sourceFiles: sourceEntries.length,
    contentFiles: contentEntries.length,
  };
  contentEntries.push({ path: `src/data/manual/${repository}.manifest.json`, content: `${JSON.stringify(normalized, null, 2)}\n` });
  contentEntries.push({ path: `src/data/manual/${repository}.snapshot.json`, content: `${JSON.stringify(snapshot, null, 2)}\n` });
  return { contentEntries, snapshot };
}

async function currentContent(entries) {
  const current = [];
  for (const entry of entries) {
    try { current.push({ path: entry.path, content: await readFile(path.join(siteRoot, entry.path), 'utf8') }); }
    catch { current.push({ path: entry.path, content: null }); }
  }
  return current;
}

export async function syncManual(options) {
  const built = await buildSnapshot(options);
  if (options.check) {
    const current = await currentContent(built.contentEntries);
    const drift = built.contentEntries.filter((entry, index) => entry.content !== current[index].content).map((entry) => entry.path);
    if (drift.length) throw new Error(`Manual snapshot drift (${drift.length} files): ${drift.slice(0, 5).join(', ')}`);
    return built.snapshot;
  }
  const temp = await mkdtemp(path.join(os.tmpdir(), 'bt4k-manual-sync-'));
  try {
    for (const entry of built.contentEntries) {
      const target = path.join(temp, entry.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, entry.content);
    }
    const targets = [
      `src/content/docs/manual/${options.repository}`,
      `src/content/docs/ko/manual/${options.repository}`,
    ];
    for (const target of targets) {
      const absolute = path.join(siteRoot, target);
      await rm(absolute, { recursive: true, force: true });
      await mkdir(path.dirname(absolute), { recursive: true });
      await rename(path.join(temp, target), absolute);
    }
    for (const entry of built.contentEntries.filter((item) => item.path.startsWith('src/data/'))) {
      const target = path.join(siteRoot, entry.path);
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
