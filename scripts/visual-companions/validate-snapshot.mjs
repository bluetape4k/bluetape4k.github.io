#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { validateVisualCompanionSnapshot } from './lib/snapshot.mjs';

const siteRoot = fileURLToPath(new URL('../../', import.meta.url));
const repository = 'bluetape4k/clinic-appointment';

try {
  const result = await validateVisualCompanionSnapshot({ siteRoot, repository });
  process.stdout.write(
    `Validated ${result.documentCount} documents / ${result.assetCount} locale assets; snapshot ${result.snapshotDigest}\n`,
  );
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
