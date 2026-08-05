import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));

test('usage billing articles link each locale to the matching visualization stage', async () => {
  const part1Ko = await read('src/content/docs/ko/blog/usage-billing-part1-ledger-and-resumable-close.mdx');
  const part1En = await read('src/content/docs/blog/usage-billing-part1-ledger-and-resumable-close.mdx');
  const part2Ko = await read('src/content/docs/ko/blog/usage-billing-part2-event-sourcing-and-projections.mdx');
  const part2En = await read('src/content/docs/blog/usage-billing-part2-event-sourcing-and-projections.mdx');

  assert.match(part1Ko, /\/ko\/visual-companions\/bluetape4k-workshop\/usage-billing-evolution\/#ledger/);
  assert.match(part1En, /\/visual-companions\/bluetape4k-workshop\/usage-billing-evolution\/#ledger/);
  assert.match(part1Ko, /\/ko\/blog\/usage-billing-part2-event-sourcing-and-projections\//);
  assert.match(part1En, /\/blog\/usage-billing-part2-event-sourcing-and-projections\//);
  assert.match(part2Ko, /\/ko\/visual-companions\/bluetape4k-workshop\/usage-billing-evolution\/#event-sourcing/);
  assert.match(part2En, /\/visual-companions\/bluetape4k-workshop\/usage-billing-evolution\/#event-sourcing/);
  assert.match(part2Ko, /usage-billing-event-sourcing-01-ko\.png/);
  assert.match(part2En, /usage-billing-event-sourcing-01-en\.png/);
  assert.doesNotMatch(part2Ko, /usage-billing-event-sourcing-01-en\.png/);
  assert.doesNotMatch(part2En, /usage-billing-event-sourcing-01-ko\.png/);
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
    exists('public/assets/blog/usage-billing/part2/usage-billing-event-sourcing-01-en.png'),
    exists('public/assets/blog/usage-billing/part2/usage-billing-event-sourcing-01-ko.png'),
    exists('public/assets/blog/usage-billing/part2/usage-billing-part2-hero.png'),
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
