import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { validateCatalog } from '../../src/data/ecosystem/schema.mjs';

test('requires unique ids and valid relation targets', () => {
  const errors = validateCatalog({
    nodes: [
      node({ id: 'projects', relations: ['missing'] }),
      node({ id: 'projects', type: 'workshop', layer: 'learn' }),
    ],
  });

  assert(errors.some((error) => error.includes('duplicate id')));
  assert(errors.some((error) => error.includes('missing relation target')));
});

test('requires supported types, layers, localized copy, groups, and destinations', () => {
  const errors = validateCatalog({
    nodes: [
      node({
        type: 'unknown',
        layer: 'other',
        group: '',
        label: { en: 'Projects' },
        description: { en: '' },
        route: 'ecosystem/projects',
        url: undefined,
      }),
    ],
  });

  for (const expected of ['invalid type', 'invalid layer', 'group', 'label.ko', 'description.en', 'description.ko', 'valid route or URL']) {
    assert(errors.some((error) => error.includes(expected)), `missing error containing ${expected}: ${errors.join(', ')}`);
  }
});

test('accepts a valid bilingual catalog node', () => {
  assert.deepEqual(validateCatalog({ nodes: [node()] }), []);
});

test('the checked-in catalog covers the Build, Learn, and Apply ecosystem', async () => {
  const catalog = JSON.parse(await readFile(new URL('../../src/data/ecosystem/catalog.json', import.meta.url), 'utf8'));

  assert.deepEqual(validateCatalog(catalog), []);
  assert.deepEqual(new Set(catalog.nodes.map(({ layer }) => layer)), new Set(['build', 'learn', 'apply']));

  const ids = new Set(catalog.nodes.map(({ id }) => id));
  for (const id of [
    'bluetape4k-projects', 'bluetape4k-exposed', 'bluetape4k-aws', 'bluetape4k-graph',
    'bluetape4k-leader', 'bluetape4k-text', 'bluetape4k-image', 'bluetape4k-javers',
    'bluetape4k-dependencies', 'bluetape-go', 'bluetape-rs', 'bluetape-py',
    'bluetape4k-workshop', 'exposed-workshop', 'exposed-r2dbc-workshop', 'timefold-workshop',
    'bluetape-go-workshop', 'bluetape-rs-workshop', 'clinic-appointment',
  ]) {
    assert(ids.has(id), `missing ecosystem node: ${id}`);
  }
});

function node(overrides = {}) {
  return {
    id: 'projects',
    type: 'repository',
    layer: 'build',
    group: 'Kotlin/JVM',
    label: { en: 'Projects', ko: '프로젝트' },
    description: { en: 'Core libraries.', ko: '핵심 라이브러리.' },
    url: 'https://github.com/bluetape4k/bluetape4k-projects',
    relations: [],
    ...overrides,
  };
}
