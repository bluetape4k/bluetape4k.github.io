import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { resolveBlogTaxonomy } from '../../src/lib/blogTaxonomy.mjs';

function explicitBlogTags(source) {
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const tags = frontmatter.match(/^\s{2}tags:\s*\[([^\]]*)\]\s*$/m)?.[1];
  if (tags === undefined) return undefined;

  return tags
    .split(',')
    .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

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

test('explicit tags are the canonical ordered taxonomy across locales', () => {
  const input = {
    slug: 'spring-cache-multitenancy-production',
    title: 'Production Examples with Cache and Multi-Tenancy',
    description: 'A hands-on service with transactions and tests.',
    tags: ['kotlin', 'exposed', 'multitenancy', 'practical-example', 'performance'],
  };
  const expected = input.tags;

  assert.deepEqual(resolveBlogTaxonomy(input, 'en').tags.map((tag) => tag.slug), expected);
  assert.deepEqual(
    resolveBlogTaxonomy(
      {
        ...input,
        title: 'Spring Cache 멀티테넌시 실전 예제',
        description: '트랜잭션과 테스트를 포함한 운영 서비스',
      },
      'ko',
    ).tags.map((tag) => tag.slug),
    expected,
  );
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
  assert.match(source, /data-blog-count[^>]*aria-live="polite"/);
  assert.match(source, /new URL\(link\.href\)/);
  assert.match(source, /setAttribute\('aria-current',\s*'true'\)/);
});

test('blog list separates popular tags from an alphabetical full directory', async () => {
  const source = await readFile('src/components/BlogPostList.astro', 'utf8');

  assert.match(source, /const popularTags = tagsByPopularity\.slice\(0,\s*12\)/);
  assert.match(source, /const allTags = \[\.\.\.tagsByPopularity\]\.sort/);
  assert.match(source, /data-blog-popular-tags/);
  assert.match(source, /data-blog-tag-directory/);
  assert.match(source, /<details/);
  assert.match(source, /directory\.open =/);
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

test('blog taxonomy exposes practical application and architecture concerns', () => {
  const practical = resolveBlogTaxonomy(
    {
      slug: 'bluetape4k-exposed-part5-spring-cache-multitenancy-production',
      title: 'Production Examples with Cache and Multi-Tenancy',
      description: 'A hands-on Ktor service with metrics, Kafka messaging, transactions, tests, and tenant security.',
    },
    'ko',
  );
  const tags = new Map(practical.tags.map((tag) => [tag.slug, tag.label]));

  assert.equal(tags.get('practical-example'), '실전 예제');
  assert.equal(tags.get('multitenancy'), '멀티테넌시');
  assert.equal(tags.get('ktor'), 'Ktor');
  assert.equal(tags.get('observability'), '관측성');
  assert.equal(tags.get('messaging'), '메시징');
  assert.equal(tags.get('transactions'), '트랜잭션');
  assert.equal(tags.get('testing'), '테스트');
  assert.equal(tags.get('security'), '보안');

  const comparison = resolveBlogTaxonomy(
    {
      slug: 'spring-modulith-publications-vs-outbox',
      title: 'Spring Modulith Publications vs Transactional Outbox',
      description: 'Compare failure recovery and retry trade-offs for resilient delivery.',
    },
    'en',
  );
  const comparisonTags = new Set(comparison.tags.map((tag) => tag.slug));

  assert.ok(comparisonTags.has('comparison'));
  assert.ok(comparisonTags.has('resilience'));
});

test('every bilingual blog pair has identical explicit tags', async () => {
  const enDirectory = 'src/content/docs/blog';
  const koDirectory = 'src/content/docs/ko/blog';
  const isPost = (file) => file.endsWith('.mdx') && file !== 'index.mdx';
  const enFiles = (await readdir(enDirectory)).filter(isPost).sort();
  const koFiles = (await readdir(koDirectory)).filter(isPost).sort();

  assert.equal(enFiles.length, 89);
  assert.deepEqual(koFiles, enFiles);

  const counts = new Map();
  for (const file of enFiles) {
    const [enSource, koSource] = await Promise.all([
      readFile(`${enDirectory}/${file}`, 'utf8'),
      readFile(`${koDirectory}/${file}`, 'utf8'),
    ]);
    const enTags = explicitBlogTags(enSource);
    const koTags = explicitBlogTags(koSource);

    assert.ok(enTags?.length, `${file} is missing English blog.tags`);
    assert.deepEqual(koTags, enTags, `${file} has different Korean blog.tags`);
    assert.deepEqual(
      resolveBlogTaxonomy({ slug: file, title: enSource, tags: enTags }, 'en').tags.map((tag) => tag.slug),
      resolveBlogTaxonomy({ slug: file, title: koSource, tags: koTags }, 'ko').tags.map((tag) => tag.slug),
      `${file} renders different tag order across locales`,
    );
    for (const tag of enTags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }

  assert.ok((counts.get('practical-example') ?? 0) >= 25);
  assert.ok((counts.get('comparison') ?? 0) >= 12);
  assert.ok((counts.get('multitenancy') ?? 0) >= 4);
});

test('future non-kotlin posts can be classified by language tags', () => {
  const go = resolveBlogTaxonomy({ slug: 'golang-worker-runtime', title: 'Go worker runtime' }, 'en');
  const python = resolveBlogTaxonomy({ slug: 'python-data-pipeline', title: 'Python pipeline' }, 'en');
  const rust = resolveBlogTaxonomy({ slug: 'rust-performance-agent', title: 'Rust performance agent' }, 'en');

  assert.ok(go.tags.some((tag) => tag.slug === 'golang'));
  assert.ok(python.tags.some((tag) => tag.slug === 'python'));
  assert.ok(rust.tags.some((tag) => tag.slug === 'rust'));
});
