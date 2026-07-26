import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { resolveBlogTaxonomy } from '../../src/lib/blogTaxonomy.mjs';

test('blog taxonomy derives stable tags without substring false positives', () => {
  const dependencies = resolveBlogTaxonomy(
    {
      slug: 'bluetape4k-dependencies-usage-guide',
      title: 'Bluetape4k Dependencies Usage Guide',
      description: 'Use the BOM and version catalog together.',
    },
    'en',
  );

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

  assert.ok(graph.tags.some((tag) => tag.slug === 'graph'));

  const virtualThreads = resolveBlogTaxonomy(
    {
      slug: 'virtual-threads-part1-guide',
      title: 'Virtual Threads Part 1',
      description: 'Blocking code and resource limits.',
    },
    'en',
  );

  assert.ok(virtualThreads.tags.some((tag) => tag.slug === 'virtual-threads'));
});

test('frontmatter schema accepts explicit blog tags without category taxonomy', async () => {
  const source = await readFile('src/content.config.ts', 'utf8');

  assert.doesNotMatch(source, /category:\s*z\.string\(\)\.optional\(\)/);
  assert.match(source, /tags:\s*z\.array\(z\.string\(\)\)\.default\(\[\]\)/);
});

test('blog list renders query-addressable tag filters only', async () => {
  const source = await readFile('src/components/BlogPostList.astro', 'utf8');

  assert.match(source, /data-blog-filter="tag"/);
  assert.doesNotMatch(source, /data-blog-filter="category"/);
  assert.doesNotMatch(source, /data-blog-filter="language"/);
  assert.doesNotMatch(source, /data-category=/);
  assert.doesNotMatch(source, /data-languages=/);
  assert.match(source, /data-tags=\{post\.taxonomy\.tags\.map/);
  assert.match(source, /post\.taxonomy\.tags\.slice\(0,\s*8\)\.map/);
  assert.match(source, /new URL\(link\.href\)/);
  assert.match(source, /setAttribute\('aria-current',\s*'true'\)/);
});

test('filtered blog cards remain hidden when card layout styles are applied', async () => {
  const source = await readFile('src/styles/custom.css', 'utf8');

  assert.match(source, /\.bt4k-blog-card\[hidden\]\s*\{\s*display:\s*none;\s*\}/);
});

test('blog article tags keep positive space below the title', async () => {
  const source = await readFile('src/styles/custom.css', 'utf8');

  assert.match(source, /\.bt4k-page-taxonomy\s*\{[^}]*margin:\s*0\.75rem 0 1\.15rem;/s);
});

test('blog article title area renders taxonomy links back to the filtered index', async () => {
  const source = await readFile('src/components/ManualPageTitle.astro', 'utf8');

  assert.match(source, /resolveBlogTaxonomy/);
  assert.match(source, /bt4k-page-taxonomy/);
  assert.match(source, /filterHref\('tag'/);
  assert.match(source, /data-blog-filter="tag"/);
  assert.doesNotMatch(source, /filterHref\('category'/);
  assert.doesNotMatch(source, /filterHref\('language'/);
});

test('blog taxonomy exposes expanded technical tags', () => {
  const timefold = resolveBlogTaxonomy(
    {
      slug: 'timefold-workshop-quickstarts-exposed-persistence',
      title: 'Timefold Server in Practice',
      description: 'Global optimization with Exposed persistence, JDBC, and R2DBC integration.',
    },
    'en',
  );

  assert.ok(timefold.tags.some((tag) => tag.slug === 'kotlin'));
  assert.ok(timefold.tags.some((tag) => tag.slug === 'timefold'));
  assert.ok(timefold.tags.some((tag) => tag.slug === 'optimization'));
  assert.ok(timefold.tags.some((tag) => tag.slug === 'persistence'));
  assert.ok(timefold.tags.some((tag) => tag.slug === 'jdbc'));
  assert.ok(timefold.tags.some((tag) => tag.slug === 'r2dbc'));

  const csv = resolveBlogTaxonomy(
    {
      slug: 'reducing-csv-parser-allocations-with-okio',
      title: 'Reducing CSV Parser Allocations with Okio',
      description: 'Performance optimization for a Kotlin parser.',
    },
    'en',
  );

  assert.ok(csv.tags.some((tag) => tag.slug === 'performance'));
  assert.ok(csv.tags.some((tag) => tag.slug === 'optimization'));

  const ddd = resolveBlogTaxonomy(
    {
      slug: 'bluetape4k-javers-part3-ddd-workshop-example',
      title: 'DDD and Workshop Audit Example',
      description: 'JaVers persistence for an aggregate boundary.',
    },
    'ko',
  );

  assert.ok(ddd.tags.some((tag) => tag.slug === 'ddd'));
  assert.equal(ddd.tags.find((tag) => tag.slug === 'ddd')?.label, 'DDD');
});

test('future non-kotlin posts can be classified by language tags', () => {
  const go = resolveBlogTaxonomy({ slug: 'golang-worker-runtime', title: 'Go worker runtime' }, 'en');
  const python = resolveBlogTaxonomy({ slug: 'python-data-pipeline', title: 'Python pipeline' }, 'en');
  const rust = resolveBlogTaxonomy({ slug: 'rust-performance-agent', title: 'Rust performance agent' }, 'en');

  assert.ok(go.tags.some((tag) => tag.slug === 'golang'));
  assert.ok(python.tags.some((tag) => tag.slug === 'python'));
  assert.ok(rust.tags.some((tag) => tag.slug === 'rust'));
});
