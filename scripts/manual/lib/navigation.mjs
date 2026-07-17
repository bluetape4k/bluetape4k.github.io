import { validateVersionCatalog } from './catalog.mjs';
import { manualRouteFor } from './paths.mjs';
import { validateRepositoryRegistry } from './repositories.mjs';

const SECTION_ORDER = [
  'getting-started',
  'architecture',
  'guides',
  'modules',
  'core',
  'integrations',
  'native',
  'backends',
  'frameworks',
  'persistence',
  'graph-io',
  'examples',
  'operations',
  'quality',
  'benchmarks',
];

const SECTION_LABELS = {
  architecture: { en: 'Architecture', ko: '아키텍처' },
  guides: { en: 'Guides', ko: '가이드' },
  modules: { en: 'Modules', ko: '모듈' },
  core: { en: 'Core', ko: '핵심 기능' },
  integrations: { en: 'Integrations', ko: '통합' },
  native: { en: 'Native', ko: '네이티브' },
  backends: { en: 'Backends', ko: '백엔드' },
  frameworks: { en: 'Frameworks', ko: '프레임워크' },
  persistence: { en: 'Persistence', ko: '영속성' },
  'graph-io': { en: 'Graph I/O', ko: '그래프 입출력' },
  examples: { en: 'Examples', ko: '예제' },
  operations: { en: 'Operations', ko: '운영' },
  quality: { en: 'Quality', ko: '품질' },
  benchmarks: { en: 'Benchmarks', ko: '벤치마크' },
};

const MODULE_GROUP_ORDER = [
  'foundation',
  'concurrency',
  'io',
  'caching',
  'data',
  'messaging',
  'web',
  'spring',
  'operations',
  'testing',
  'utilities',
  'examples',
];

const MODULE_GROUP_LABELS = {
  foundation: { en: 'Foundations', ko: '기초' },
  concurrency: { en: 'Concurrency', ko: '동시성' },
  io: { en: 'I/O and Serialization', ko: 'I/O와 직렬화' },
  caching: { en: 'Caching', ko: '캐시' },
  data: { en: 'Data Access', ko: '데이터 접근' },
  messaging: { en: 'Messaging', ko: '메시징' },
  web: { en: 'Web and Ktor', ko: '웹과 Ktor' },
  spring: { en: 'Spring Integrations', ko: 'Spring 통합' },
  operations: { en: 'Operations and Observability', ko: '운영과 관측성' },
  testing: { en: 'Testing', ko: '테스트' },
  utilities: { en: 'Utilities', ko: '유틸리티' },
  examples: { en: 'Examples and Benchmarks', ko: '예제와 성능 비교' },
};

function fail(code, actual) {
  const error = new Error(`${code}: ${String(actual)}`);
  error.code = code;
  error.actual = actual;
  throw error;
}

function words(value) {
  return value
    .split('-')
    .map((part) => part.length === 0 ? part : `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function sectionLabel(section, locale) {
  return SECTION_LABELS[section]?.[locale] ?? words(section);
}

function moduleGroupLabel(group, locale) {
  return MODULE_GROUP_LABELS[group]?.[locale] ?? words(group);
}

function link({ label, href, isCurrent = false, documentId }) {
  return {
    type: 'link',
    label,
    href,
    isCurrent,
    badge: undefined,
    attrs: {},
    documentId,
  };
}

function versionFrom(catalog, minorVersion) {
  const version = catalog.versions.find((candidate) => candidate.minorVersion === minorVersion);
  if (!version) fail('NAVIGATION_VERSION_MISSING', minorVersion);
  return version;
}

function descriptorKey({ repository, minorVersion, locale, id }) {
  return `${repository}\u0000${minorVersion}\u0000${locale}\u0000${id}`;
}

export function parseManualRouteId(routeId) {
  if (typeof routeId !== 'string') fail('NAVIGATION_ROUTE_INVALID', routeId);
  const normalized = routeId.replace(/^\/+|\/+$/g, '');
  const match = /^(ko\/)?manual\/([^/]+)\/([^/]+)(?:\/(.+))?$/.exec(normalized);
  if (!match) fail('NAVIGATION_ROUTE_INVALID', routeId);
  return {
    locale: match[1] ? 'ko' : 'en',
    repository: match[2],
    minorVersion: match[3],
    documentId: match[4] ?? 'index',
  };
}

function indexDocuments(documents) {
  const index = new Map();
  for (const document of documents) {
    const key = descriptorKey(document);
    if (index.has(key)) fail('NAVIGATION_CONTENT_DUPLICATE', key);
    if (typeof document.title !== 'string' || document.title.trim() === '') {
      fail('NAVIGATION_TITLE_MISSING', key);
    }
    for (const field of ['learningOrder', 'chapterOrder']) {
      if (
        document[field] !== undefined
        && (!Number.isSafeInteger(document[field]) || document[field] <= 0)
      ) {
        fail('NAVIGATION_ORDER_INVALID', `${key}:${field}`);
      }
    }
    index.set(key, document);
  }
  return index;
}

function documentRank(documentId) {
  if (documentId === 'index') return -2;
  if (documentId === 'getting-started') return -1;
  const section = SECTION_ORDER.indexOf(documentId.split('/')[0]);
  return section >= 0 ? section : SECTION_ORDER.length;
}

function compareDocumentId(left, right) {
  return documentRank(left) - documentRank(right) || left.localeCompare(right, 'en');
}

function documentLink({ document, locale, repository, minorVersion, currentId }) {
  return link({
    label: document.title,
    href: manualRouteFor(locale, repository, minorVersion, `${document.id}.md`),
    isCurrent: document.id === currentId,
    documentId: document.id,
  });
}

function nestedEntries({ ids, prefix, byId, locale, repository, minorVersion, currentId }) {
  const children = [...new Set(ids
    .filter((id) => id.startsWith(`${prefix}/`))
    .map((id) => id.slice(prefix.length + 1).split('/')[0]))]
    .toSorted((left, right) => {
      const leftDocument = byId.get(`${prefix}/${left}`);
      const rightDocument = byId.get(`${prefix}/${right}`);
      return (leftDocument?.chapterOrder ?? Number.MAX_SAFE_INTEGER)
        - (rightDocument?.chapterOrder ?? Number.MAX_SAFE_INTEGER)
        || left.localeCompare(right, locale);
    });
  const entries = [];
  const overview = byId.get(prefix);
  if (overview) {
    entries.push({
      ...documentLink({ document: overview, locale, repository, minorVersion, currentId }),
      label: locale === 'ko' ? '개요' : 'Overview',
    });
  }
  for (const child of children) {
    const id = `${prefix}/${child}`;
    const descendants = ids.some((candidate) => candidate.startsWith(`${id}/`));
    const document = byId.get(id);
    if (descendants) {
      entries.push({
        type: 'group',
        label: document?.title ?? words(child),
        entries: nestedEntries({
          ids,
          prefix: id,
          byId,
          locale,
          repository,
          minorVersion,
          currentId,
        }),
        collapsed: true,
        badge: undefined,
      });
    } else if (document) {
      entries.push(documentLink({ document, locale, repository, minorVersion, currentId }));
    }
  }
  return entries;
}

function moduleEntries({ ids, byId, locale, repository, minorVersion, currentId }) {
  const moduleIds = [...new Set(ids
    .filter((id) => id.startsWith('modules/'))
    .map((id) => id.split('/').slice(0, 2).join('/')))];
  const ordered = moduleIds.filter((id) => Number.isSafeInteger(byId.get(id)?.learningOrder));
  if (ordered.length === 0) {
    return nestedEntries({
      ids,
      prefix: 'modules',
      byId,
      locale,
      repository,
      minorVersion,
      currentId,
    });
  }
  if (ordered.length !== moduleIds.length) {
    fail('NAVIGATION_LEARNING_ORDER_INCOMPLETE', `${repository.slug}@${minorVersion}:${locale}`);
  }
  const learningOrders = new Set();
  for (const id of moduleIds) {
    const document = byId.get(id);
    if (typeof document.group !== 'string' || document.group.trim() === '') {
      fail('NAVIGATION_GROUP_MISSING', `${repository.slug}@${minorVersion}:${locale}:${id}`);
    }
    if (learningOrders.has(document.learningOrder)) {
      fail('NAVIGATION_LEARNING_ORDER_DUPLICATE', `${repository.slug}@${minorVersion}:${locale}:${document.learningOrder}`);
    }
    learningOrders.add(document.learningOrder);
  }
  const groups = [...new Set(moduleIds.map((id) => byId.get(id).group))]
    .toSorted((left, right) => {
      const leftRank = MODULE_GROUP_ORDER.indexOf(left);
      const rightRank = MODULE_GROUP_ORDER.indexOf(right);
      return (leftRank < 0 ? MODULE_GROUP_ORDER.length : leftRank)
        - (rightRank < 0 ? MODULE_GROUP_ORDER.length : rightRank)
        || left.localeCompare(right, 'en');
    });
  return groups.map((group) => ({
    type: 'group',
    label: moduleGroupLabel(group, locale),
    entries: moduleIds
      .filter((id) => byId.get(id).group === group)
      .toSorted((left, right) => byId.get(left).learningOrder - byId.get(right).learningOrder)
      .map((id) => {
        const document = byId.get(id);
        const descendants = ids.some((candidate) => candidate.startsWith(`${id}/`));
        if (!descendants) {
          return documentLink({ document, locale, repository, minorVersion, currentId });
        }
        return {
          type: 'group',
          label: document.title,
          entries: nestedEntries({ ids, prefix: id, byId, locale, repository, minorVersion, currentId }),
          collapsed: true,
          badge: undefined,
        };
      }),
    collapsed: true,
    badge: undefined,
  }));
}

function repositoryEntries({ ids, byId, locale, repository, minorVersion, currentId }) {
  if (!byId.has('index')) {
    fail('NAVIGATION_HOME_MISSING', `${repository.slug}@${minorVersion}:${locale}`);
  }
  const entries = [link({
    label: locale === 'ko' ? '매뉴얼 홈' : 'Manual Home',
    href: manualRouteFor(locale, repository, minorVersion, 'index.md'),
    isCurrent: currentId === 'index',
    documentId: 'index',
  })];
  const gettingStarted = byId.get('getting-started');
  if (gettingStarted) {
    entries.push(documentLink({ document: gettingStarted, locale, repository, minorVersion, currentId }));
  }
  const rootDocuments = ids
    .filter((id) => !id.includes('/') && !['index', 'getting-started'].includes(id))
    .toSorted(compareDocumentId);
  for (const id of rootDocuments) {
    entries.push(documentLink({ document: byId.get(id), locale, repository, minorVersion, currentId }));
  }
  const sections = [...new Set(ids
    .filter((id) => id.includes('/'))
    .map((id) => id.split('/')[0]))]
    .toSorted((left, right) => compareDocumentId(`${left}/`, `${right}/`));
  for (const section of sections) {
    entries.push({
      type: 'group',
      label: sectionLabel(section, locale),
      entries: section === 'modules'
        ? moduleEntries({ ids, byId, locale, repository, minorVersion, currentId })
        : nestedEntries({
            ids,
            prefix: section,
            byId,
            locale,
            repository,
            minorVersion,
            currentId,
          }),
      collapsed: true,
      badge: undefined,
    });
  }
  return entries;
}

function flatten(entries, result = []) {
  for (const entry of entries) {
    if (entry.type === 'link') result.push(entry);
    else flatten(entry.entries, result);
  }
  return result;
}

export function buildManualNavigation({ registry, catalogs, documents, current }) {
  const approvedRegistry = validateRepositoryRegistry(registry);
  if (!['en', 'ko'].includes(current.locale)) {
    fail('NAVIGATION_LOCALE_UNSUPPORTED', current.locale);
  }
  const documentIndex = indexDocuments(documents);
  const currentRepositoryIndex = approvedRegistry.repositories
    .findIndex(({ slug }) => slug === current.repository);
  if (currentRepositoryIndex < 0) fail('NAVIGATION_REPOSITORY_MISSING', current.repository);
  const currentRepository = approvedRegistry.repositories[currentRepositoryIndex];

  const sidebar = approvedRegistry.repositories.map((repository) => {
    const rawCatalog = catalogs[repository.slug];
    if (!rawCatalog) fail('NAVIGATION_CATALOG_MISSING', repository.slug);
    const catalog = validateVersionCatalog(rawCatalog, repository);
    const minorVersion = repository.slug === current.repository
      ? current.minorVersion
      : catalog.latest;
    const version = versionFrom(catalog, minorVersion);
    const ids = version.documents[current.locale].toSorted(compareDocumentId);
    const byId = new Map(ids.map((id) => {
      const document = documentIndex.get(descriptorKey({
        repository: repository.slug,
        minorVersion,
        locale: current.locale,
        id,
      }));
      if (!document) {
        fail('NAVIGATION_CONTENT_MISSING', `${repository.slug}@${minorVersion}:${current.locale}:${id}`);
      }
      return [id, document];
    }));
    if (!byId.has('index')) {
      fail('NAVIGATION_HOME_MISSING', `${repository.slug}@${minorVersion}:${current.locale}`);
    }
    const entries = repositoryEntries({
      ids,
      byId,
      locale: current.locale,
      repository,
      minorVersion,
      currentId: repository.slug === current.repository ? current.documentId : undefined,
    });
    return {
      type: 'group',
      label: repository.label[current.locale],
      entries,
      collapsed: repository.slug !== current.repository,
      badge: undefined,
    };
  });

  const order = flatten(sidebar[currentRepositoryIndex].entries);
  const currentIndex = order.findIndex(({ documentId }) => documentId === current.documentId);
  if (currentIndex < 0 || order.filter(({ documentId }) => documentId === current.documentId).length !== 1) {
    fail(
      'NAVIGATION_CURRENT_MISSING',
      `${current.repository}@${current.minorVersion}:${current.locale}:${current.documentId}`,
    );
  }
  const scopePrefix = manualRouteFor(current.locale, currentRepository, current.minorVersion, 'index.md');
  for (const destination of order) {
    if (!destination.href.startsWith(scopePrefix)) {
      fail('NAVIGATION_SCOPE_CROSSING', destination.href);
    }
  }
  return {
    sidebar,
    order,
    home: order.find(({ documentId }) => documentId === 'index'),
    pagination: {
      prev: order[currentIndex - 1],
      next: order[currentIndex + 1],
    },
  };
}
