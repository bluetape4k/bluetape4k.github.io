import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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
  assert.equal(clinicAppointmentSeries.length, 19);
  assert.deepEqual(
    clinicAppointmentGroups.map(({ id }) => [
      id,
      clinicAppointmentSeries.filter(({ group }) => group === id).length,
    ]),
    [
      ['prologue', 1],
      ['design', 7],
      ['implementation', 7],
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
      'operations-1-1',
      'operations-1-2',
      'operations-1-3',
      'operations-2',
    ],
  );
  assert.equal(new Set(clinicAppointmentSeries.map(({ slug }) => slug)).size, 19);
});

test('clinic appointment series component renders groups and the current page', async () => {
  const source = await readFile('src/components/ClinicAppointmentSeries.astro', 'utf8');

  assert.match(source, /clinicAppointmentGroups\.map/);
  assert.match(source, /clinicAppointmentSeries\s*\.filter/);
  assert.match(source, /aria-current="page"/);
  assert.match(source, /throw new Error\(`Unknown clinic appointment series slug:/);
  assert.match(source, /locale === 'ko' \? '\/ko\/blog' : '\/blog'/);
});
