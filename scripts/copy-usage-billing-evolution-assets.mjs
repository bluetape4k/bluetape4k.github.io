import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const descriptorPath = join(repositoryRoot, 'src/data/visual-companions/repositories.json');
const outputRoot = join(repositoryRoot, 'public/assets/blog/usage-billing/part1');
const sourceRoot = resolve(readArgument('--source-root'));
const sourceAssetRoot = join(sourceRoot, 'docs/images/visual-companions');
const views = ['ledger', 'event-sourcing', 'microservices'];
const locales = ['en', 'ko'];
const themes = ['light', 'dark'];
const assets = views.flatMap((view) =>
  locales.flatMap((locale) =>
    themes.map((theme) => `usage-billing-evolution-${view}.${locale}.${theme}.png`),
  ),
);
const blogAliases = [
  ['usage-billing-evolution-ledger.en.dark.png', 'usage-billing-ledger-01-en.png'],
  ['usage-billing-evolution-ledger.ko.dark.png', 'usage-billing-ledger-01-ko.png'],
];

const descriptor = JSON.parse(await readFile(descriptorPath, 'utf8')).repositories.find(
  ({ repository }) => repository === 'bluetape4k/bluetape4k-workshop',
);
if (!descriptor) {
  throw new Error('VISUAL_SOURCE_DESCRIPTOR_MISSING: bluetape4k/bluetape4k-workshop');
}

const sourceHead = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: sourceRoot,
  encoding: 'utf8',
}).trim();
if (sourceHead !== descriptor.sourceRef) {
  throw new Error(`VISUAL_SOURCE_REF_MISMATCH: ${sourceHead} != ${descriptor.sourceRef}`);
}

await mkdir(outputRoot, { recursive: true });
let hashMatches = 0;
for (const asset of assets) {
  const source = join(sourceAssetRoot, asset);
  const target = join(outputRoot, basename(asset));
  await copyFile(source, target);

  const [sourceStat, targetStat, sourceHash, targetHash] = await Promise.all([
    stat(source),
    stat(target),
    sha256(source),
    sha256(target),
  ]);
  if (sourceStat.size !== targetStat.size || sourceHash !== targetHash) {
    throw new Error(`VISUAL_ASSET_COPY_MISMATCH: ${asset}`);
  }
  hashMatches += 1;
}

for (const [sourceName, targetName] of blogAliases) {
  const source = join(sourceAssetRoot, sourceName);
  const target = join(outputRoot, targetName);
  await copyFile(source, target);
  if ((await stat(source)).size !== (await stat(target)).size || (await sha256(source)) !== (await sha256(target))) {
    throw new Error(`VISUAL_ASSET_ALIAS_MISMATCH: ${targetName}`);
  }
}

console.log(
  `Usage billing assets copied: sourceRef=${sourceHead} assets=${assets.length} hashMatches=${hashMatches} aliases=${blogAliases.length}`,
);

function readArgument(name) {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value || value.startsWith('--')) {
    throw new Error(`missing required argument: ${name}`);
  }
  return value;
}

async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}
