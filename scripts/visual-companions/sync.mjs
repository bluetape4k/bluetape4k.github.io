#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncVisualCompanionSnapshot } from './lib/snapshot.mjs';

function parseArguments(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!['--repository', '--source-root', '--source-ref'].includes(key) || value === undefined) {
      throw new Error(`VISUAL_SYNC_ARGUMENT: ${key ?? ''}`);
    }
    parsed[key.slice(2)] = value;
  }
  if (!parsed.repository || !parsed['source-root'] || !parsed['source-ref']) {
    throw new Error('VISUAL_SYNC_ARGUMENT: repository, source-root, and source-ref are required');
  }
  return {
    repository: parsed.repository,
    sourceRoot: path.resolve(parsed['source-root']),
    sourceRef: parsed['source-ref'],
  };
}

const siteRoot = fileURLToPath(new URL('../../', import.meta.url));

try {
  const result = await syncVisualCompanionSnapshot({
    siteRoot,
    ...parseArguments(process.argv.slice(2)),
  });
  process.stdout.write(
    `Synced ${result.documentCount} documents / ${result.assetCount} locale assets at ${result.snapshot.sourceRef}\n`,
  );
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
