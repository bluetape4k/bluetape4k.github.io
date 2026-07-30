import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  cloudflareAnalyticsScriptTag,
  resolveCloudflareAnalytics,
} from '../site/cloudflare-analytics.mjs';

async function collectIndexFiles(root) {
  const found = [];
  async function visit(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile() && entry.name === 'index.html') found.push(absolute);
    }
  }
  await visit(root);
  return found.sort();
}

export function injectCloudflareAnalyticsIntoHtml(content, analytics) {
  if (!analytics) return content;

  const closingHeads = content.match(/<\/head\s*>/gi) ?? [];
  if (closingHeads.length !== 1) {
    throw new Error(`VISUAL_ANALYTICS_HEAD: expected 1 closing head, found ${closingHeads.length}`);
  }

  const tag = cloudflareAnalyticsScriptTag(analytics);
  const beacons = content.match(/\bdata-cf-beacon\s*=/gi) ?? [];
  if (beacons.length > 0) {
    if (beacons.length === 1 && content.includes(tag)) return content;
    throw new Error(`CLOUDFLARE_ANALYTICS_CONFLICT: found ${beacons.length} existing beacon(s)`);
  }

  return content.replace(/<\/head\s*>/i, `  ${tag}\n</head>`);
}

export async function injectVisualCompanionAnalytics({
  siteRoot,
  analytics,
}) {
  const publicRoot = path.join(siteRoot, 'public');
  const sourceRoots = [
    path.join(publicRoot, 'visual-companions'),
    path.join(publicRoot, 'ko/visual-companions'),
  ];
  const sources = (await Promise.all(sourceRoots.map(collectIndexFiles))).flat().sort();
  const pages = sources.map((source) => (
    path.join(siteRoot, 'dist', path.relative(publicRoot, source))
  ));
  if (pages.length === 0) throw new Error('VISUAL_ANALYTICS_PAGES: no visual companion pages found');

  let changedCount = 0;
  for (const page of pages) {
    const before = await readFile(page, 'utf8');
    const after = injectCloudflareAnalyticsIntoHtml(before, analytics);
    if (after !== before) {
      await writeFile(page, after);
      changedCount += 1;
    }
  }
  return { pageCount: pages.length, changedCount };
}

async function main() {
  const result = await injectVisualCompanionAnalytics({
    siteRoot: process.cwd(),
    analytics: resolveCloudflareAnalytics({ production: true }),
  });
  process.stdout.write(
    `Injected Cloudflare Web Analytics into ${result.changedCount}/${result.pageCount} Visual Companion pages.\n`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
