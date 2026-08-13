const TAG_LABELS = {
  ai: { en: 'AI', ko: 'AI' },
  'appointment-service': { en: 'Appointment Service', ko: '예약서비스' },
  architecture: { en: 'Architecture', ko: 'Architecture' },
  aws: { en: 'AWS', ko: 'AWS' },
  bom: { en: 'BOM', ko: 'BOM' },
  cache: { en: 'Cache', ko: 'Cache' },
  comparison: { en: 'Comparison', ko: '비교·선택' },
  concurrency: { en: 'Concurrency', ko: '동시성' },
  coroutines: { en: 'Coroutines', ko: 'Coroutines' },
  dependencies: { en: 'Dependencies', ko: 'Dependencies' },
  ddd: { en: 'DDD', ko: 'DDD' },
  ecosystem: { en: 'Ecosystem', ko: 'Ecosystem' },
  example: { en: 'Example', ko: '예제' },
  exposed: { en: 'Exposed', ko: 'Exposed' },
  golang: { en: 'Golang', ko: 'Golang' },
  graph: { en: 'Graph', ko: 'Graph' },
  idempotency: { en: 'Idempotency', ko: '멱등성' },
  image: { en: 'Image', ko: 'Image' },
  javers: { en: 'JaVers', ko: 'JaVers' },
  jdbc: { en: 'JDBC', ko: 'JDBC' },
  kafka: { en: 'Kafka', ko: 'Kafka' },
  kotlin: { en: 'Kotlin', ko: 'Kotlin' },
  ktor: { en: 'Ktor', ko: 'Ktor' },
  leader: { en: 'Leader Election', ko: 'Leader Election' },
  messaging: { en: 'Messaging', ko: '메시징' },
  migration: { en: 'Migration', ko: 'Migration' },
  multitenancy: { en: 'Multi-Tenancy', ko: '멀티테넌시' },
  observability: { en: 'Observability', ko: '관측성' },
  optimization: { en: 'Optimization', ko: 'Optimization' },
  outbox: { en: 'Outbox', ko: 'Outbox' },
  performance: { en: 'Performance', ko: 'Performance' },
  persistence: { en: 'Persistence', ko: 'Persistence' },
  postgresql: { en: 'PostgreSQL', ko: 'PostgreSQL' },
  'practical-example': { en: 'Practical Example', ko: '실전 예제' },
  python: { en: 'Python', ko: 'Python' },
  r2dbc: { en: 'R2DBC', ko: 'R2DBC' },
  redis: { en: 'Redis', ko: 'Redis' },
  'release-train': { en: 'Release Train', ko: 'Release Train' },
  resilience: { en: 'Resilience', ko: '복원력' },
  rust: { en: 'Rust', ko: 'Rust' },
  search: { en: 'Search', ko: 'Search' },
  security: { en: 'Security', ko: '보안' },
  spring: { en: 'Spring', ko: 'Spring' },
  testing: { en: 'Testing', ko: '테스트' },
  text: { en: 'Text', ko: 'Text' },
  timefold: { en: 'Timefold', ko: 'Timefold' },
  transactions: { en: 'Transactions', ko: '트랜잭션' },
  'virtual-threads': { en: 'Virtual Threads', ko: 'Virtual Threads' },
};

const TAG_RULES = [
  [/\baws\b/, 'aws'],
  [/\b(ai|codex|skill|skills)\b/, 'ai'],
  [/\b(reservation|clinic|control plane|multitenancy|architecture)\b/, 'architecture'],
  [/\b(bom|version catalog)\b/, 'bom'],
  [/\b(cache|jcache|hazelcast|caffeine)\b/, 'cache'],
  [/\b(compare|comparison|versus|vs|trade off|trade offs|trade-off|trade-offs|choosing|choice|select|selection)\b/, 'comparison'],
  [/\b(concurrency|concurrent|race|contention|bulkhead|semaphore)\b/, 'concurrency'],
  [/\b(coroutine|coroutines|suspend)\b/, 'coroutines'],
  [/\b(dependencies|dependency|catalog)\b/, 'dependencies'],
  [/\b(ddd|domain driven|domain-driven|aggregate|aggregates)\b/, 'ddd'],
  [/\b(bluetape4k projects|introduction bluetape4k|ecosystem)\b/, 'ecosystem'],
  [/\b(exposed|transaction|transactions)\b/, 'exposed'],
  [/\b(golang|go|go lang|go worker|go runtime|go service)\b/, 'golang'],
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
  [/\bktor\b/, 'ktor'],
  [/\b(leader|election|lease)\b/, 'leader'],
  [/\b(message|messages|messaging|event publication|event publications|outbox)\b/, 'messaging'],
  [/\b(migration|migrate)\b/, 'migration'],
  [/\b(multitenancy|multi tenancy|multi tenant|tenant context|tenant routing|tenant schema|tenant jobs)\b/, 'multitenancy'],
  [/\b(observability|observable|metric|metrics|tracing|telemetry)\b/, 'observability'],
  [/\b(optimization|optimize|optimized|solver|constraint|constraints)\b/, 'optimization'],
  [/\b(outbox|modulith)\b/, 'outbox'],
  [/\b(performance|benchmark|benchmarks|allocation|allocations|latency|throughput)\b/, 'performance'],
  [/\b(persistence|repository|repositories|database|storage)\b/, 'persistence'],
  [/\b(postgresql|postgres)\b/, 'postgresql'],
  [/\b(practical|hands on|example|examples|workshop|quickstart|quickstarts|in practice|production guide)\b/, 'practical-example'],
  [/\b(python|pytest|fastapi|django)\b/, 'python'],
  [/\b(r2dbc|reactive)\b/, 'r2dbc'],
  [/\b(redis|lettuce|redisson)\b/, 'redis'],
  [/\b(release train|release)\b/, 'release-train'],
  [/\b(resilience|resilient|recovery|retry|retries|failure handling|circuit breaker)\b/, 'resilience'],
  [/\b(rust|cargo|tokio)\b/, 'rust'],
  [/\b(search|aho corasick|tokenizer)\b/, 'search'],
  [/\b(security|secure|authentication|authorization|auth|captcha)\b/, 'security'],
  [/\b(spring|boot|webflux)\b/, 'spring'],
  [/\b(test|tests|testing|junit|kotest|mockk|pytest)\b/, 'testing'],
  [/\b(text|token)\b/, 'text'],
  [/\b(timefold)\b/, 'timefold'],
  [/\b(transaction|transactions|transactional)\b/, 'transactions'],
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
  const tags = unique(explicitTags.length > 0 ? explicitTags : inferredTags);
  const normalizedTags = tags.length > 0 ? tags : ['architecture'];

  return {
    tags: normalizedTags.map((slug) => ({
      slug,
      label: localizedLabel(TAG_LABELS, slug, locale),
    })),
  };
}
