const TAG_LABELS = {
  ai: { en: 'AI', ko: 'AI' },
  architecture: { en: 'Architecture', ko: 'Architecture' },
  aws: { en: 'AWS', ko: 'AWS' },
  bom: { en: 'BOM', ko: 'BOM' },
  cache: { en: 'Cache', ko: 'Cache' },
  concurrency: { en: 'Concurrency', ko: '동시성' },
  coroutines: { en: 'Coroutines', ko: 'Coroutines' },
  dependencies: { en: 'Dependencies', ko: 'Dependencies' },
  ddd: { en: 'DDD', ko: 'DDD' },
  ecosystem: { en: 'Ecosystem', ko: 'Ecosystem' },
  exposed: { en: 'Exposed', ko: 'Exposed' },
  golang: { en: 'Golang', ko: 'Golang' },
  graph: { en: 'Graph', ko: 'Graph' },
  idempotency: { en: 'Idempotency', ko: '멱등성' },
  image: { en: 'Image', ko: 'Image' },
  javers: { en: 'JaVers', ko: 'JaVers' },
  jdbc: { en: 'JDBC', ko: 'JDBC' },
  kafka: { en: 'Kafka', ko: 'Kafka' },
  kotlin: { en: 'Kotlin', ko: 'Kotlin' },
  leader: { en: 'Leader Election', ko: 'Leader Election' },
  migration: { en: 'Migration', ko: 'Migration' },
  optimization: { en: 'Optimization', ko: 'Optimization' },
  outbox: { en: 'Outbox', ko: 'Outbox' },
  performance: { en: 'Performance', ko: 'Performance' },
  persistence: { en: 'Persistence', ko: 'Persistence' },
  postgresql: { en: 'PostgreSQL', ko: 'PostgreSQL' },
  python: { en: 'Python', ko: 'Python' },
  r2dbc: { en: 'R2DBC', ko: 'R2DBC' },
  redis: { en: 'Redis', ko: 'Redis' },
  'release-train': { en: 'Release Train', ko: 'Release Train' },
  rust: { en: 'Rust', ko: 'Rust' },
  search: { en: 'Search', ko: 'Search' },
  spring: { en: 'Spring', ko: 'Spring' },
  text: { en: 'Text', ko: 'Text' },
  timefold: { en: 'Timefold', ko: 'Timefold' },
  'virtual-threads': { en: 'Virtual Threads', ko: 'Virtual Threads' },
};

const TAG_RULES = [
  [/\baws\b/, 'aws'],
  [/\b(ai|codex|skill|skills)\b/, 'ai'],
  [/\b(reservation|clinic|control plane|multitenancy|architecture)\b/, 'architecture'],
  [/\b(bom|version catalog)\b/, 'bom'],
  [/\b(cache|jcache|hazelcast|caffeine)\b/, 'cache'],
  [/\b(concurrency|concurrent|race|contention|bulkhead|semaphore)\b/, 'concurrency'],
  [/\b(coroutine|coroutines|suspend)\b/, 'coroutines'],
  [/\b(dependencies|dependency|catalog)\b/, 'dependencies'],
  [/\b(ddd|domain driven|domain-driven|aggregate|aggregates)\b/, 'ddd'],
  [/\b(bluetape4k projects|introduction bluetape4k|ecosystem)\b/, 'ecosystem'],
  [/\b(exposed|transaction|transactions)\b/, 'exposed'],
  [/\b(golang|go lang|go worker|go runtime|go service)\b/, 'golang'],
  [/\b(graph|graphdb|neo4j|memgraph|tinkerpop|falkordb|age)\b/, 'graph'],
  [/\b(idempotency|idempotent)\b/, 'idempotency'],
  [/\b(image|ocr|vips|captcha)\b/, 'image'],
  [/\b(javers|audit)\b/, 'javers'],
  [/\bjdbc\b/, 'jdbc'],
  [/\bkafka\b/, 'kafka'],
  [
    /\b(kotlin|jvm|java|spring|ktor|exposed|r2dbc|jdbc|coroutine|coroutines|virtual thread|virtual threads|timefold|javers|bluetape4k)\b/,
    'kotlin',
  ],
  [/\b(leader|election|lease)\b/, 'leader'],
  [/\b(migration|migrate)\b/, 'migration'],
  [/\b(optimization|optimize|optimized|solver|constraint|constraints)\b/, 'optimization'],
  [/\b(outbox|modulith)\b/, 'outbox'],
  [/\b(performance|benchmark|benchmarks|allocation|allocations|latency|throughput)\b/, 'performance'],
  [/\b(persistence|repository|repositories|database|storage)\b/, 'persistence'],
  [/\b(postgresql|postgres)\b/, 'postgresql'],
  [/\b(python|pytest|fastapi|django)\b/, 'python'],
  [/\b(r2dbc|reactive)\b/, 'r2dbc'],
  [/\b(redis|lettuce|redisson)\b/, 'redis'],
  [/\b(release train|release)\b/, 'release-train'],
  [/\b(rust|cargo|tokio)\b/, 'rust'],
  [/\b(search|aho corasick|tokenizer)\b/, 'search'],
  [/\b(spring|boot|webflux)\b/, 'spring'],
  [/\b(text|token)\b/, 'text'],
  [/\b(timefold)\b/, 'timefold'],
  [/\b(virtual thread|virtual threads|virtualthreads)\b/, 'virtual-threads'],
];

function slugify(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function labelFromSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => (part.length <= 4 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1)))
    .join(' ');
}

function localizedLabel(labels, slug, locale) {
  return labels[slug]?.[locale] ?? labels[slug]?.en ?? labelFromSlug(slug);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function resolveBlogTaxonomy(input, locale = 'en') {
  const text = ` ${input.slug ?? ''} ${input.title ?? ''} ${input.description ?? ''} `
    .toLowerCase()
    .replace(/[-_/]+/g, ' ');
  const inferredTags = TAG_RULES.filter(([pattern]) => pattern.test(text)).map(([, tag]) => tag);
  const explicitTags = Array.isArray(input.tags) ? input.tags.map(slugify) : [];
  const tags = unique([...inferredTags, ...explicitTags]);
  const normalizedTags = tags.length > 0 ? tags : ['architecture'];

  return {
    tags: normalizedTags.map((slug) => ({
      slug,
      label: localizedLabel(TAG_LABELS, slug, locale),
    })),
  };
}
