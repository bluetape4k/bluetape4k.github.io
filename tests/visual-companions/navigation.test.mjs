import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildStaticSidebar } from '../../scripts/manual/lib/sidebar.mjs';
import { validateVisualCompanionCatalog } from '../../scripts/visual-companions/lib/catalog.mjs';

const root = new URL('../../', import.meta.url);
const registry = JSON.parse(
  await readFile(new URL('src/data/manual/repositories.json', root), 'utf8'),
);
const visualCatalog = JSON.parse(
  await readFile(new URL('src/data/visual-companions/catalog.json', root), 'utf8'),
);
const visualRegistry = JSON.parse(
  await readFile(new URL('src/data/visual-companions/repositories.json', root), 'utf8'),
);

test('visual companion catalog is part of ecosystem navigation in both locales', () => {
  const sidebar = buildStaticSidebar(registry);
  assert.deepEqual(sidebar.map(({ label }) => label), [
    'Start',
    'Ecosystem',
    'Manuals',
    'Blog',
  ]);
  assert.deepEqual(sidebar.map(({ translations }) => translations.ko), [
    '시작',
    '생태계',
    '매뉴얼',
    '블로그',
  ]);
  assert.deepEqual(sidebar[1].items[3], {
    label: 'Visual Companions',
    translations: { ko: '시각 자료' },
    slug: 'visual-companions',
  });
});

test('visual companion catalog maps every listed document to a published snapshot', async () => {
  const catalog = validateVisualCompanionCatalog(visualCatalog);

  for (const repository of catalog.repositories) {
    const slug = repository.repository.split('/')[1];
    const snapshot = JSON.parse(await readFile(
      new URL(`src/data/visual-companions/${slug}.snapshot.json`, root),
      'utf8',
    ));
    assert.equal(snapshot.repository, repository.repository);
    const published = new Set(snapshot.documents.map(({ id }) => id));
    assert.ok(repository.documents.some(({ featured }) => featured));
    for (const document of repository.documents) {
      assert.ok(published.has(document.id), `${repository.repository}:${document.id}`);
      assert.ok(document.summary.en.length > 0);
      assert.ok(document.summary.ko.length > 0);
    }
  }
});

test('visual companion catalog features both exposed-workshop documents', () => {
  const exposedCatalog = visualCatalog.repositories.find(
    ({ repository }) => repository === 'bluetape4k/exposed-workshop',
  );

  assert.ok(exposedCatalog);
  assert.deepEqual(
    exposedCatalog.documents.map(({ id }) => id),
    ['exposed-redis-cache-strategies', 'ddd-modulith-boundaries'],
  );
  assert.ok(exposedCatalog.documents.every(({ featured }) => featured));
});

test('visual companion catalog features all published bluetape4k-workshop documents', () => {
  const workshopCatalog = visualCatalog.repositories.find(
    ({ repository }) => repository === 'bluetape4k/bluetape4k-workshop',
  );

  assert.ok(workshopCatalog);
  assert.deepEqual(
    workshopCatalog.documents.map(({ id }) => id),
    [
      'event-sourced-promotion-voucher',
      'concert-ticket-flash-sale',
      'kafka-outbox-fallback',
    ],
  );
  assert.ok(workshopCatalog.documents.every(({ featured }) => featured));
});

test('visual companion catalog features both bluetape4k-leader documents', () => {
  const leaderCatalog = visualCatalog.repositories.find(
    ({ repository }) => repository === 'bluetape4k/bluetape4k-leader',
  );

  assert.ok(leaderCatalog);
  assert.deepEqual(
    leaderCatalog.documents.map(({ id }) => id),
    ['leader-elector', 'leader-group-elector'],
  );
  assert.ok(leaderCatalog.documents.every(({ featured }) => featured));
});

test('visual companion catalog rejects duplicate and incomplete navigation entries', () => {
  const duplicate = structuredClone(visualCatalog);
  duplicate.repositories.push(structuredClone(duplicate.repositories[0]));
  assert.throws(
    () => validateVisualCompanionCatalog(duplicate),
    /VISUAL_CATALOG_REPOSITORY_DUPLICATE/,
  );

  const incomplete = structuredClone(visualCatalog);
  delete incomplete.repositories[0].documents[0].summary.ko;
  assert.throws(
    () => validateVisualCompanionCatalog(incomplete),
    /VISUAL_CATALOG_SUMMARY_KEYS/,
  );
});

test('example introductions expose the shared visual companion catalog', async () => {
  const english = await readFile(new URL('src/content/docs/ecosystem/examples.mdx', root), 'utf8');
  const korean = await readFile(new URL('src/content/docs/ko/ecosystem/examples.mdx', root), 'utf8');
  assert.match(english, /<VisualCompanionCatalog locale="en" featuredOnly \/>/);
  assert.match(korean, /<VisualCompanionCatalog locale="ko" featuredOnly \/>/);
});

test('visual companion landing pages are source-equivalent and link locale routes', async () => {
  const clinicSourceRef = visualRegistry.repositories.find(
    ({ repository }) => repository === 'bluetape4k/clinic-appointment',
  )?.sourceRef;
  assert.ok(clinicSourceRef);
  const english = await readFile(
    new URL('src/content/docs/visual-companions/clinic-appointment.mdx', root),
    'utf8',
  );
  const korean = await readFile(
    new URL('src/content/docs/ko/visual-companions/clinic-appointment.mdx', root),
    'utf8',
  );

  for (const source of [english, korean]) {
    assert.match(source, /appointment-plan-and-capacity/);
    assert.match(source, /scheduling-policy-foundation/);
    assert.match(source, /hybrid/);
    assert.match(source, /simulation/);
    assert.match(source, new RegExp(clinicSourceRef));
    assert.match(source, /github\.com\/bluetape4k\/clinic-appointment\/blob\//);
  }
  assert.match(
    english,
    /\]\(\/visual-companions\/clinic-appointment\/appointment-plan-and-capacity\/\)/,
  );
  assert.match(
    korean,
    /\]\(\/ko\/visual-companions\/clinic-appointment\/appointment-plan-and-capacity\/\)/,
  );
});
