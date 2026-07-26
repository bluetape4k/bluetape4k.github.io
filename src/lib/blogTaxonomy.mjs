const CATEGORY_LABELS = {
  'ai-collaboration': { en: 'AI Collaboration', ko: 'AI 협업' },
  architecture: { en: 'Architecture', ko: '아키텍처' },
  caching: { en: 'Caching', ko: '캐시' },
  'data-access': { en: 'Data Access', ko: '데이터 접근' },
  'dependency-management': { en: 'Dependency Management', ko: '의존성 관리' },
  ecosystem: { en: 'Ecosystem', ko: '생태계' },
  graph: { en: 'Graph', ko: '그래프' },
  image: { en: 'Image', ko: '이미지' },
  leader: { en: 'Leader Election', ko: '리더 선출' },
  messaging: { en: 'Messaging', ko: '메시징' },
  observability: { en: 'Observability', ko: '관측성' },
  runtime: { en: 'Runtime', ko: '런타임' },
  text: { en: 'Text', ko: '텍스트' },
};

const TAG_LABELS = {
  ai: { en: 'AI', ko: 'AI' },
  architecture: { en: 'Architecture', ko: 'Architecture' },
  aws: { en: 'AWS', ko: 'AWS' },
  bom: { en: 'BOM', ko: 'BOM' },
  cache: { en: 'Cache', ko: 'Cache' },
  concurrency: { en: 'Concurrency', ko: '동시성' },
  coroutines: { en: 'Coroutines', ko: 'Coroutines' },
  dependencies: { en: 'Dependencies', ko: 'Dependencies' },
  ecosystem: { en: 'Ecosystem', ko: 'Ecosystem' },
  exposed: { en: 'Exposed', ko: 'Exposed' },
  graph: { en: 'Graph', ko: 'Graph' },
  idempotency: { en: 'Idempotency', ko: '멱등성' },
  image: { en: 'Image', ko: 'Image' },
  javers: { en: 'JaVers', ko: 'JaVers' },
  kafka: { en: 'Kafka', ko: 'Kafka' },
  kotlin: { en: 'Kotlin', ko: 'Kotlin' },
  leader: { en: 'Leader Election', ko: 'Leader Election' },
  migration: { en: 'Migration', ko: 'Migration' },
  outbox: { en: 'Outbox', ko: 'Outbox' },
  postgresql: { en: 'PostgreSQL', ko: 'PostgreSQL' },
  redis: { en: 'Redis', ko: 'Redis' },
  'release-train': { en: 'Release Train', ko: 'Release Train' },
  r2dbc: { en: 'R2DBC', ko: 'R2DBC' },
  search: { en: 'Search', ko: 'Search' },
  spring: { en: 'Spring', ko: 'Spring' },
  text: { en: 'Text', ko: 'Text' },
  'virtual-threads': { en: 'Virtual Threads', ko: 'Virtual Threads' },
};

const CATEGORY_RULES = [
  [/\b(dependencies|dependency|bom|version catalog|release train)\b/, 'dependency-management'],
  [/\b(ai|codex|skill|skills)\b/, 'ai-collaboration'],
  [/\b(bluetape4k projects|introduction bluetape4k|ecosystem)\b/, 'ecosystem'],
  [/\b(graph|graphdb|neo4j|memgraph|tinkerpop|falkordb|age)\b/, 'graph'],
  [/\b(reservation|clinic|control plane|multitenancy|webflux|idempotency|idempotent)\b/, 'architecture'],
  [/\b(outbox|kafka|nats|pulsar|modulith)\b/, 'messaging'],
  [/\b(cache|jcache|redis|lettuce|redisson|hazelcast|caffeine)\b/, 'caching'],
  [/\b(exposed|postgresql|postgres|r2dbc|jdbc|javers|hibernate)\b/, 'data-access'],
  [/\b(image|ocr|vips|captcha)\b/, 'image'],
  [/\b(leader|election|lease)\b/, 'leader'],
  [/\b(text|tokenizer|aho corasick|search)\b/, 'text'],
  [/\b(virtual thread|virtual threads|virtualthreads|coroutine|coroutines|reactive)\b/, 'runtime'],
  [/\b(observability|micrometer|opentelemetry|logging)\b/, 'observability'],
];

const TAG_RULES = [
  [/\baws\b/, 'aws'],
  [/\b(bom|version catalog)\b/, 'bom'],
  [/\b(cache|jcache|hazelcast|caffeine)\b/, 'cache'],
  [/\b(concurrency|concurrent|race|contention|bulkhead|semaphore)\b/, 'concurrency'],
  [/\b(coroutine|coroutines|suspend)\b/, 'coroutines'],
  [/\b(dependencies|dependency|catalog)\b/, 'dependencies'],
  [/\b(bluetape4k projects|introduction bluetape4k|ecosystem)\b/, 'ecosystem'],
  [/\b(exposed|jdbc|transaction|transactions)\b/, 'exposed'],
  [/\b(graph|graphdb|neo4j|memgraph|tinkerpop|falkordb|age)\b/, 'graph'],
  [/\b(idempotency|idempotent)\b/, 'idempotency'],
  [/\b(image|ocr|vips|captcha)\b/, 'image'],
  [/\b(javers|audit)\b/, 'javers'],
  [/\bkafka\b/, 'kafka'],
  [/\b(kotlin|bluetape4k)\b/, 'kotlin'],
  [/\b(leader|election|lease)\b/, 'leader'],
  [/\b(migration|migrate)\b/, 'migration'],
  [/\b(outbox|modulith)\b/, 'outbox'],
  [/\b(postgresql|postgres)\b/, 'postgresql'],
  [/\b(redis|lettuce|redisson)\b/, 'redis'],
  [/\b(release train|release)\b/, 'release-train'],
  [/\b(r2dbc|reactive)\b/, 'r2dbc'],
  [/\b(search|aho corasick|tokenizer)\b/, 'search'],
  [/\b(spring|boot|webflux)\b/, 'spring'],
  [/\b(text|token)\b/, 'text'],
  [/\b(virtual thread|virtual threads|virtualthreads)\b/, 'virtual-threads'],
  [/\b(ai|codex|skill|skills)\b/, 'ai'],
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
  const inferredCategory =
    CATEGORY_RULES.find(([pattern]) => pattern.test(text))?.[1] ?? 'architecture';
  const categorySlug = slugify(input.category) || inferredCategory;
  const inferredTags = TAG_RULES
    .filter(([pattern]) => pattern.test(text))
    .map(([, tag]) => tag);
  const explicitTags = Array.isArray(input.tags) ? input.tags.map(slugify) : [];
  const tags = unique([...inferredTags, ...explicitTags]);
  const normalizedTags = tags.length > 0 ? tags : [categorySlug];

  return {
    category: {
      slug: categorySlug,
      label: localizedLabel(CATEGORY_LABELS, categorySlug, locale),
    },
    tags: normalizedTags.map((slug) => ({
      slug,
      label: localizedLabel(TAG_LABELS, slug, locale),
    })),
  };
}
