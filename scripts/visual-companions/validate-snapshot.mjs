#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { validateVisualCompanionSnapshot } from './lib/snapshot.mjs';
import { loadVisualCompanionRepositories } from './lib/repositories.mjs';

const siteRoot = fileURLToPath(new URL('../../', import.meta.url));
const registry = loadVisualCompanionRepositories(
  new URL('../../src/data/visual-companions/repositories.json', import.meta.url),
);

try {
  const results = [];
  for (const { repository } of registry.repositories) {
    results.push(await validateVisualCompanionSnapshot({ siteRoot, repository }));
  }
  const documentCount = results.reduce((sum, result) => sum + result.documentCount, 0);
  const assetCount = results.reduce((sum, result) => sum + result.assetCount, 0);
  process.stdout.write(
    `Validated ${results.length} repositories / ${documentCount} documents / ${assetCount} locale assets\n`,
  );
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
