import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

import {
  clinicAppointmentGroups,
  clinicAppointmentSeries,
} from '../../src/data/clinic-appointment-series.mjs';

test('clinic appointment series keeps the approved published order', () => {
  assert.deepEqual(
    clinicAppointmentGroups.map(({ id }) => id),
    ['prologue', 'design', 'implementation', 'operations'],
  );
  assert.equal(clinicAppointmentSeries.length, 27);
  assert.deepEqual(
    clinicAppointmentGroups.map(({ id }) => [
      id,
      clinicAppointmentSeries.filter(({ group }) => group === id).length,
    ]),
    [
      ['prologue', 1],
      ['design', 7],
      ['implementation', 9],
      ['operations', 10],
    ],
  );
  assert.deepEqual(
    clinicAppointmentSeries.map(({ id }) => id),
    [
      'prologue',
      'design-1',
      'design-2',
      'design-3',
      'design-4',
      'design-5',
      'design-6',
      'design-7',
      'implementation-1',
      'implementation-2',
      'implementation-3',
      'implementation-4',
      'implementation-5',
      'implementation-6',
      'implementation-7',
      'implementation-8',
      'implementation-9',
      'operations-1-1',
      'operations-1-2',
      'operations-1-3',
      'operations-2',
      'operations-3',
      'operations-4',
      'operations-5',
      'operations-6',
      'operations-7',
      'operations-8',
    ],
  );
  assert.equal(new Set(clinicAppointmentSeries.map(({ slug }) => slug)).size, 27);
  assert.equal(clinicAppointmentSeries.at(-1).id, 'operations-8');
  assert.equal(clinicAppointmentSeries.at(-1).slug, 'clinic-appointment-multitenant-data-boundaries');
});

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('every published clinic appointment article uses the shared series navigation', async () => {
  const locales = [
    {
      id: 'en',
      directory: 'src/content/docs/blog',
      importPath: '../../../components/ClinicAppointmentSeries.astro',
      heading: '## Series',
    },
    {
      id: 'ko',
      directory: 'src/content/docs/ko/blog',
      importPath: '../../../../components/ClinicAppointmentSeries.astro',
      heading: '## 시리즈 링크',
    },
  ];

  for (const locale of locales) {
    const files = (await readdir(locale.directory))
      .filter((file) => file.startsWith('clinic-appointment-') && file.endsWith('.mdx'));
    assert.equal(files.length, 27, `${locale.id}: published article count`);

    for (const entry of clinicAppointmentSeries) {
      const source = await readFile(`${locale.directory}/${entry.slug}.mdx`, 'utf8');
      const title = entry[locale.id];
      const footer = source.slice(source.lastIndexOf(locale.heading));

      assert.match(source, new RegExp(`^title: "${escapeRegExp(title)}"$`, 'm'));
      assert.match(
        source,
        new RegExp(`import ClinicAppointmentSeries from '${escapeRegExp(locale.importPath)}';`),
      );
      assert.match(
        footer,
        new RegExp(`<ClinicAppointmentSeries current="${entry.slug}" locale="${locale.id}" />`),
      );
      assert.doesNotMatch(footer, /\]\(\/(?:ko\/)?blog\/clinic-appointment-/);
    }
  }
});

test('clinic appointment related references use series posts instead of issue or pull-request links', async () => {
  const replacements = {
    'clinic-appointment-disruption-recovery': 'clinic-appointment-profile-reevaluation',
    'clinic-appointment-n-visit-purchase-plan': 'clinic-appointment-package-product-execution-graph',
    'clinic-appointment-package-execution-plan': 'clinic-appointment-package-product-execution-graph',
    'clinic-appointment-profile-reevaluation': 'clinic-appointment-disruption-recovery',
    'clinic-appointment-scheduling-policy': 'clinic-appointment-waitlist-core',
    'clinic-appointment-notification-reminder': 'clinic-appointment-attendance-fulfillment',
    'clinic-appointment-external-results': 'clinic-appointment-notification-reminder',
  };

  for (const [slug, relatedSlug] of Object.entries(replacements)) {
    for (const locale of ['en', 'ko']) {
      const directory = locale === 'ko' ? 'src/content/docs/ko/blog' : 'src/content/docs/blog';
      const sourcesHeadings = locale === 'ko' ? ['## 근거 자료'] : ['## Sources', '## References'];
      const seriesHeadings = locale === 'ko' ? ['## 시리즈 링크'] : ['## Series', '## Series navigation'];
      const prefix = locale === 'ko' ? '/ko/' : '/';
      const source = await readFile(`${directory}/${slug}.mdx`, 'utf8');
      const sourcesIndex = Math.min(...sourcesHeadings
        .map((heading) => source.indexOf(heading))
        .filter((index) => index >= 0));
      const seriesIndex = Math.min(...seriesHeadings
        .map((heading) => source.indexOf(heading))
        .filter((index) => index >= 0));
      const references = source.slice(sourcesIndex, seriesIndex);

      assert.doesNotMatch(references, /https?:\/\/github\.com\/[^)\s]+\/(?:issues|pull)\//);
      assert.match(references, new RegExp(`]\\(${prefix}blog/${relatedSlug}/\\)`));
    }
  }
});

test('clinic appointment series component renders groups and the current page', async () => {
  const source = await readFile('src/components/ClinicAppointmentSeries.astro', 'utf8');

  assert.match(source, /clinicAppointmentGroups\.map/);
  assert.match(source, /clinicAppointmentSeries\s*\.filter/);
  assert.match(source, /aria-current="page"/);
  assert.match(source, /throw new Error\(`Unknown clinic appointment series slug:/);
  assert.match(source, /locale === 'ko' \? '\/ko\/blog' : '\/blog'/);
});
