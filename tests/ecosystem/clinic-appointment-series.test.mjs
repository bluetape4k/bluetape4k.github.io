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
  assert.equal(clinicAppointmentSeries.length, 20);
  assert.deepEqual(
    clinicAppointmentGroups.map(({ id }) => [
      id,
      clinicAppointmentSeries.filter(({ group }) => group === id).length,
    ]),
    [
      ['prologue', 1],
      ['design', 7],
      ['implementation', 8],
      ['operations', 4],
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
      'operations-1-1',
      'operations-1-2',
      'operations-1-3',
      'operations-2',
    ],
  );
  assert.equal(new Set(clinicAppointmentSeries.map(({ slug }) => slug)).size, 20);
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
    assert.equal(files.length, 20, `${locale.id}: published article count`);

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

test('clinic appointment series component renders groups and the current page', async () => {
  const source = await readFile('src/components/ClinicAppointmentSeries.astro', 'utf8');

  assert.match(source, /clinicAppointmentGroups\.map/);
  assert.match(source, /clinicAppointmentSeries\s*\.filter/);
  assert.match(source, /aria-current="page"/);
  assert.match(source, /throw new Error\(`Unknown clinic appointment series slug:/);
  assert.match(source, /locale === 'ko' \? '\/ko\/blog' : '\/blog'/);
});
