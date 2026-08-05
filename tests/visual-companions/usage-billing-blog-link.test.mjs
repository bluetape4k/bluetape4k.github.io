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
  const part3Ko = await read('src/content/docs/ko/blog/usage-billing-part3-microservices-outbox-inbox.mdx');
  const part3En = await read('src/content/docs/blog/usage-billing-part3-microservices-outbox-inbox.mdx');
  const part4Ko = await read('src/content/docs/ko/blog/usage-billing-part4-failure-recovery-and-reconciliation.mdx');
  const part4En = await read('src/content/docs/blog/usage-billing-part4-failure-recovery-and-reconciliation.mdx');

  assert.match(part1Ko, /title: "사용량 과금 Part 1: 중복 수집부터 재시작 가능한 마감과 원장까지"/);
  assert.match(part1En, /title: "Usage Billing Part 1: Duplicate Ingestion, Resumable Closing, and the Ledger"/);
  assert.match(part2Ko, /title: "사용량 과금 Part 2: Event Sourcing, Replay와 Projection 운영"/);
  assert.match(part2En, /title: "Usage Billing Part 2: Event Sourcing, Replay, and Projection Operations"/);
  assert.match(part3Ko, /title: "사용량 과금 Part 3: 마이크로서비스, Outbox와 Inbox"/);
  assert.match(part3En, /title: "Usage Billing Part 3: Microservices, Outbox, and Inbox"/);
  assert.match(part4Ko, /title: "사용량 과금 Part 4: 장애 탐지, 격리, 재처리와 정합성 검증"/);
  assert.match(part4En, /title: "Usage Billing Part 4: Detection, Isolation, Reprocessing, and Reconciliation"/);

  const koreanSeriesTitles = [
    '사용량 과금 Part 1: 중복 수집부터 재시작 가능한 마감과 원장까지',
    '사용량 과금 Part 2: Event Sourcing, Replay와 Projection 운영',
    '사용량 과금 Part 3: 마이크로서비스, Outbox와 Inbox',
    '사용량 과금 Part 4: 장애 탐지, 격리, 재처리와 정합성 검증',
  ];
  const englishSeriesTitles = [
    'Usage Billing Part 1: Duplicate Ingestion, Resumable Closing, and the Ledger',
    'Usage Billing Part 2: Event Sourcing, Replay, and Projection Operations',
    'Usage Billing Part 3: Microservices, Outbox, and Inbox',
    'Usage Billing Part 4: Detection, Isolation, Reprocessing, and Reconciliation',
  ];

  for (const article of [part1Ko, part2Ko, part3Ko, part4Ko]) {
    for (const title of koreanSeriesTitles) {
      assert.ok(article.includes(title), `Korean series navigation is missing: ${title}`);
    }
  }
  for (const article of [part1En, part2En, part3En, part4En]) {
    for (const title of englishSeriesTitles) {
      assert.ok(article.includes(title), `English series navigation is missing: ${title}`);
    }
  }

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
  assert.match(part2Ko, /\/ko\/blog\/usage-billing-part3-microservices-outbox-inbox\//);
  assert.match(part2En, /\/blog\/usage-billing-part3-microservices-outbox-inbox\//);
  assert.match(part3Ko, /\/ko\/visual-companions\/bluetape4k-workshop\/usage-billing-evolution\/#microservices/);
  assert.match(part3En, /\/visual-companions\/bluetape4k-workshop\/usage-billing-evolution\/#microservices/);
  assert.match(part3Ko, /usage-billing-service-boundaries-01-ko\.png/);
  assert.match(part3En, /usage-billing-service-boundaries-01-en\.png/);
  assert.doesNotMatch(part3Ko, /usage-billing-microservices-01-(?:ko|en)\.png/);
  assert.doesNotMatch(part3En, /usage-billing-microservices-01-(?:ko|en)\.png/);
  assert.doesNotMatch(part3Ko, /usage-billing-service-boundaries-01-en\.png/);
  assert.doesNotMatch(part3En, /usage-billing-service-boundaries-01-ko\.png/);
  assert.match(part1Ko, /\/ko\/blog\/usage-billing-part4-failure-recovery-and-reconciliation\//);
  assert.match(part1En, /\/blog\/usage-billing-part4-failure-recovery-and-reconciliation\//);
  assert.match(part2Ko, /\/ko\/blog\/usage-billing-part4-failure-recovery-and-reconciliation\//);
  assert.match(part2En, /\/blog\/usage-billing-part4-failure-recovery-and-reconciliation\//);
  assert.match(part3Ko, /\/ko\/blog\/usage-billing-part4-failure-recovery-and-reconciliation\//);
  assert.match(part3En, /\/blog\/usage-billing-part4-failure-recovery-and-reconciliation\//);
  assert.match(part4Ko, /\/ko\/visual-companions\/bluetape4k-workshop\/usage-billing-evolution\//);
  assert.match(part4En, /\/visual-companions\/bluetape4k-workshop\/usage-billing-evolution\//);
  assert.match(part4Ko, /usage-billing-recovery-01-ko\.png/);
  assert.match(part4En, /usage-billing-recovery-01-en\.png/);
  assert.doesNotMatch(part4Ko, /usage-billing-recovery-01-en\.png/);
  assert.doesNotMatch(part4En, /usage-billing-recovery-01-ko\.png/);
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
    exists('public/assets/blog/usage-billing/part3/usage-billing-service-boundaries-01-en.svg'),
    exists('public/assets/blog/usage-billing/part3/usage-billing-service-boundaries-01-en.png'),
    exists('public/assets/blog/usage-billing/part3/usage-billing-service-boundaries-01-ko.svg'),
    exists('public/assets/blog/usage-billing/part3/usage-billing-service-boundaries-01-ko.png'),
    exists('public/assets/blog/usage-billing/part3/usage-billing-part3-hero.png'),
    exists('public/assets/blog/usage-billing/part4/usage-billing-recovery-01-en.png'),
    exists('public/assets/blog/usage-billing/part4/usage-billing-recovery-01-ko.png'),
    exists('public/assets/blog/usage-billing/part4/usage-billing-part4-hero.png'),
    exists('public/visual-companions/bluetape4k-workshop/usage-billing-evolution/index.html'),
    exists('public/ko/visual-companions/bluetape4k-workshop/usage-billing-evolution/index.html'),
  ]);
});

test('usage billing parts are scheduled one day apart in both locales', async () => {
  const expected = [
    ['usage-billing-part1-ledger-and-resumable-close.mdx', '2026-08-05'],
    ['usage-billing-part2-event-sourcing-and-projections.mdx', '2026-08-06'],
    ['usage-billing-part3-microservices-outbox-inbox.mdx', '2026-08-07'],
    ['usage-billing-part4-failure-recovery-and-reconciliation.mdx', '2026-08-08'],
  ];

  for (const [file, date] of expected) {
    for (const localeRoot of ['src/content/docs/blog', 'src/content/docs/ko/blog']) {
      assert.match(await read(`${localeRoot}/${file}`), new RegExp(`date: ${date}T12:00:00\\+09:00`));
    }
  }
});

async function read(path) {
  return readFile(join(repositoryRoot, path), 'utf8');
}

async function exists(path) {
  return access(join(repositoryRoot, path));
}
