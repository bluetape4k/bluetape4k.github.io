import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));

test('usage billing part 1 links each locale to the ledger visualization', async () => {
  const ko = await read('src/content/docs/ko/blog/usage-billing-part1-ledger-and-resumable-close.mdx');
  const en = await read('src/content/docs/blog/usage-billing-part1-ledger-and-resumable-close.mdx');

  assert.match(ko, /\/ko\/visual-companions\/bluetape4k-workshop\/usage-billing-evolution\/#ledger/);
  assert.match(en, /\/visual-companions\/bluetape4k-workshop\/usage-billing-evolution\/#ledger/);
  assert.match(ko, /usage-billing-ledger-01-ko\.png/);
  assert.match(en, /usage-billing-ledger-01-en\.png/);
  assert.doesNotMatch(ko, /usage-billing-ledger-01-en\.png/);
  assert.doesNotMatch(en, /usage-billing-ledger-01-ko\.png/);
});

test('usage billing publication contains every locale and theme fallback', async () => {
  const views = ['ledger', 'event-sourcing', 'microservices'];
  const locales = ['en', 'ko'];
  const themes = ['light', 'dark'];

  await Promise.all(
    views.flatMap((view) =>
      locales.flatMap((locale) =>
        themes.map((theme) =>
          exists(`public/assets/blog/usage-billing/part1/usage-billing-evolution-${view}.${locale}.${theme}.png`),
        ),
      ),
    ),
  );
  await Promise.all([
    exists('public/assets/blog/usage-billing/part1/usage-billing-ledger-01-en.png'),
    exists('public/assets/blog/usage-billing/part1/usage-billing-ledger-01-ko.png'),
    exists('public/visual-companions/bluetape4k-workshop/usage-billing-evolution/index.html'),
    exists('public/ko/visual-companions/bluetape4k-workshop/usage-billing-evolution/index.html'),
  ]);
});

async function read(path) {
  return readFile(join(repositoryRoot, path), 'utf8');
}

async function exists(path) {
  return access(join(repositoryRoot, path));
}
