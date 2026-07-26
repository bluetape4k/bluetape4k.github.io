import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { resolveBlogTaxonomy } from '../../src/lib/blogTaxonomy.mjs';

test('blog taxonomy derives stable categories without substring false positives', () => {
  const dependencies = resolveBlogTaxonomy(
    {
      slug: 'bluetape4k-dependencies-usage-guide',
      title: 'Bluetape4k Dependencies Usage Guide',
      description: 'Use the BOM and version catalog together.',
    },
    'en',
  );

  assert.equal(dependencies.category.slug, 'dependency-management');
  assert.ok(dependencies.tags.some((tag) => tag.slug === 'dependencies'));
  assert.ok(dependencies.tags.some((tag) => tag.slug === 'bom'));
  assert.equal(dependencies.tags.some((tag) => tag.slug === 'graph'), false);

  const reservation = resolveBlogTaxonomy(
    {
      slug: 'reservation-control-plane-postgresql-authority',
      title: 'PostgreSQL as the Reservation Control Plane Authority',
      description: 'Idempotency and waitlist ownership under one transaction.',
    },
    'ko',
  );

  assert.equal(reservation.category.slug, 'architecture');
  assert.equal(reservation.category.label, '아키텍처');
  assert.ok(reservation.tags.some((tag) => tag.slug === 'postgresql'));
  assert.ok(reservation.tags.some((tag) => tag.slug === 'idempotency'));

  const graph = resolveBlogTaxonomy(
    {
      slug: 'when-to-adopt-graphdb',
      title: 'When Should Backend Services Adopt a GraphDB?',
      description: 'Compare PostgreSQL traversal, AGE, Neo4j, and Memgraph.',
    },
    'en',
  );

  assert.equal(graph.category.slug, 'graph');
  assert.ok(graph.tags.some((tag) => tag.slug === 'graph'));

  const virtualThreads = resolveBlogTaxonomy(
    {
      slug: 'virtual-threads-part1-guide',
      title: 'Virtual Threads Part 1',
      description: 'Blocking code and resource limits.',
    },
    'en',
  );

  assert.equal(virtualThreads.category.slug, 'runtime');
  assert.ok(virtualThreads.tags.some((tag) => tag.slug === 'virtual-threads'));
});

test('frontmatter schema accepts explicit blog category and tags', async () => {
  const source = await readFile('src/content.config.ts', 'utf8');

  assert.match(source, /category:\s*z\.string\(\)\.optional\(\)/);
  assert.match(source, /tags:\s*z\.array\(z\.string\(\)\)\.default\(\[\]\)/);
});

test('blog list renders query-addressable category and tag filters', async () => {
  const source = await readFile('src/components/BlogPostList.astro', 'utf8');

  assert.match(source, /data-blog-filter="category"/);
  assert.match(source, /data-blog-filter="tag"/);
  assert.match(source, /data-category=\{post\.taxonomy\.category\.slug\}/);
  assert.match(source, /data-tags=\{post\.taxonomy\.tags\.map/);
  assert.match(source, /new URLSearchParams\(\{ \[kind\]: value \}\)/);
});
