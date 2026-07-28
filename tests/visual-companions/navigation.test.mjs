import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildStaticSidebar } from '../../scripts/manual/lib/sidebar.mjs';

const root = new URL('../../', import.meta.url);
const registry = JSON.parse(
  await readFile(new URL('src/data/manual/repositories.json', root), 'utf8'),
);

test('visual companion navigation stays between manuals and blog in both locales', () => {
  const sidebar = buildStaticSidebar(registry);
  assert.deepEqual(sidebar.map(({ label }) => label), [
    'Start',
    'Ecosystem',
    'Manuals',
    'Visual Companions',
    'Blog',
  ]);
  assert.deepEqual(sidebar.map(({ translations }) => translations.ko), [
    '시작',
    '생태계',
    '매뉴얼',
    '시각 자료',
    '블로그',
  ]);
  assert.deepEqual(sidebar[3].items, [{
    label: 'Clinic Appointment',
    translations: { ko: '병원 예약' },
    slug: 'visual-companions/clinic-appointment',
  }]);
});

test('visual companion landing pages are source-equivalent and link locale routes', async () => {
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
    assert.match(source, /85a09e4ba16644219c15e91d94c5a4ccb7619a64/);
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
