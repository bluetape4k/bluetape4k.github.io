import path from 'node:path';
import { readFileSync } from 'node:fs';
import { parseStableRelease, mergeVersionCatalog as mergeBaseCatalog } from './version.mjs';
import { manualRouteFor, safeRelativePath } from './paths.mjs';
import { validateRepositoryRegistry } from './repositories.mjs';

const SHA = /^[0-9a-f]{40}$/;

function fail(code, actual) {
  const error = new Error(`${code}: ${String(actual)}`);
  error.code = code;
  error.actual = actual;
  throw error;
}

function compareMinor(left, right) {
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  return a[0] - b[0] || a[1] - b[1];
}

function approvedRepository(repository) {
  try {
    return validateRepositoryRegistry({ schema: 1, repositories: [repository] }).repositories[0];
  } catch {
    fail('REPOSITORY_UNSUPPORTED', repository?.repository ?? repository);
  }
}

function canonicalDocumentId(documentId) {
  const safe = safeRelativePath(documentId);
  if (safe === 'index') return safe;
  const canonical = safe.replace(/\/index$/, '');
  if (canonical.split('/').at(-1).includes('.')) fail('CATALOG_DOCUMENT_ID', documentId);
  return canonical;
}

function normalizeDocuments(documents) {
  if (!documents || typeof documents !== 'object') fail('CATALOG_DOCUMENTS', documents);
  return Object.fromEntries(['en', 'ko'].map((locale) => {
    if (!Array.isArray(documents[locale])) fail('CATALOG_DOCUMENTS', documents[locale]);
    const normalized = documents[locale].map(canonicalDocumentId);
    if (new Set(normalized).size !== normalized.length) fail('CATALOG_DUPLICATE_DOCUMENT', locale);
    return [locale, normalized.toSorted()];
  }));
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object') fail('CATALOG_ENTRY', entry);
  const parsed = parseStableRelease(entry.releaseRef);
  if (entry.minorVersion !== parsed.minorVersion) fail('CATALOG_RELEASE_MINOR', entry.minorVersion);
  if (!SHA.test(entry.releaseCommit) || !SHA.test(entry.sourceCommit)) fail('CATALOG_COMMIT', entry.minorVersion);
  if (typeof entry.channel !== 'string') fail('CATALOG_CHANNEL', entry.channel);
  return { ...structuredClone(entry), documents: normalizeDocuments(entry.documents) };
}

export function validateVersionCatalog(catalog, repository) {
  const approved = approvedRepository(repository);
  if (!catalog || typeof catalog !== 'object') fail('CATALOG_TYPE', catalog);
  if (catalog.schema !== 1) fail('CATALOG_SCHEMA', catalog.schema);
  if (catalog.repository !== approved.repository) fail('REPOSITORY_UNSUPPORTED', catalog.repository);
  if (!Array.isArray(catalog.versions)) fail('CATALOG_VERSIONS', catalog.versions);
  const versions = catalog.versions.map(normalizeEntry);
  const minors = versions.map(({ minorVersion }) => minorVersion);
  if (new Set(minors).size !== minors.length) fail('CATALOG_DUPLICATE_MINOR', minors);
  if (minors.some((minor, index) => index > 0 && compareMinor(minors[index - 1], minor) >= 0)) {
    fail('CATALOG_UNSORTED', minors);
  }
  const latest = versions.find(({ minorVersion }) => minorVersion === catalog.latest);
  if (!latest) fail('CATALOG_LATEST', catalog.latest);
  if (latest.channel !== 'stable') fail('CATALOG_LATEST_STABLE', latest.channel);
  return { ...structuredClone(catalog), versions };
}

export function mergeVersionCatalog(previous, entry, repository) {
  const normalized = validateVersionCatalog(previous, repository);
  const nextEntry = normalizeEntry(entry);
  return validateVersionCatalog(mergeBaseCatalog(normalized, nextEntry), repository);
}

function version(catalog, minorVersion) {
  return catalog.versions.find((candidate) => candidate.minorVersion === minorVersion);
}

export function selectorTarget(catalog, request, repository) {
  const approved = approvedRepository(repository);
  const normalized = validateVersionCatalog(catalog, approved);
  const { locale, targetMinor, sourceMinor, documentId } = request;
  if (!['en', 'ko'].includes(locale)) fail('LOCALE_UNSUPPORTED', locale);
  const safeDocument = canonicalDocumentId(documentId);
  const target = version(normalized, targetMinor);
  const source = version(normalized, sourceMinor);
  if (!target || !source) fail('CATALOG_VERSION', !target ? targetMinor : sourceMinor);
  if (!source.documents[locale].includes(safeDocument)) fail('CATALOG_DOCUMENT', safeDocument);
  if (target.documents[locale].includes(safeDocument)) {
    return { kind: 'document', href: manualRouteFor(locale, approved, targetMinor, `${safeDocument}.md`) };
  }
  const localePrefix = locale === 'ko' ? '/ko' : '';
  return {
    kind: 'not-available',
    href: `${localePrefix}/manual/${approved.slug}/${targetMinor}/not-available/from-${sourceMinor}/${safeDocument}/`,
    targetMinor,
    sourceMinor,
    documentId: safeDocument,
  };
}

function assertRedirects(redirects) {
  if (!Array.isArray(redirects)) fail('REDIRECTS_TYPE', redirects);
  const bySource = new Map();
  for (const redirect of redirects) {
    if (bySource.has(redirect.source)) fail('REDIRECT_DUPLICATE', redirect.source);
    bySource.set(redirect.source, redirect.target);
  }
  for (const source of bySource.keys()) {
    const seen = new Set([source]);
    let target = bySource.get(source);
    while (bySource.has(target)) {
      if (seen.has(target)) fail('REDIRECT_LOOP', target);
      seen.add(target);
      target = bySource.get(target);
    }
    if (seen.size > 1) fail('REDIRECT_CHAIN', source);
  }
}

function safeRedirectRoute(value, code) {
  if (typeof value !== 'string'
    || !value.startsWith('/')
    || value.startsWith('//')
    || !value.endsWith('/')
    || value.includes('\\')
    || value.includes('\0')
    || value.includes('?')
    || value.includes('#')) fail(code, value);
  let decoded;
  try { decoded = decodeURIComponent(value); } catch { fail(code, value); }
  if (decoded !== value || value.split('/').some((segment) => segment === '.' || segment === '..')) fail(code, value);
  return value;
}

function parseRedirectSource(value, repository) {
  const safe = safeRedirectRoute(value, 'REDIRECT_SOURCE');
  const match = safe.match(new RegExp(`^/(ko/)?manual/${repository.slug}/(.*)$`));
  if (!match || /^\d+\.\d+(?:\/|$)/.test(match[2])) fail('REDIRECT_SOURCE', value);
  return { locale: match[1] ? 'ko' : 'en', documentId: match[2].replace(/\/$/, '') || 'index' };
}

function parseRedirectDestination(value, repository) {
  const safe = safeRedirectRoute(value, 'REDIRECT_TARGET');
  const match = safe.match(new RegExp(`^/(ko/)?manual/${repository.slug}/(\\d+\\.\\d+)/(.*)$`));
  if (!match) fail('REDIRECT_TARGET', value);
  return {
    locale: match[1] ? 'ko' : 'en',
    minorVersion: match[2],
    documentId: canonicalDocumentId(match[3].replace(/\/$/, '') || 'index'),
  };
}

export function loadRedirectCatalog(redirectUrl, repository) {
  const approved = approvedRepository(repository);
  if (!(redirectUrl instanceof URL) || redirectUrl.protocol !== 'file:') fail('REDIRECT_CATALOG_URL', redirectUrl);
  const name = path.posix.basename(redirectUrl.pathname);
  if (name !== `${approved.slug}.redirects.json`) fail('REDIRECT_CATALOG_URL', redirectUrl.href);
  const versionUrl = new URL(name.replace(/\.redirects\.json$/, '.versions.json'), redirectUrl);
  const redirects = JSON.parse(readFileSync(redirectUrl, 'utf8'));
  const versions = validateVersionCatalog(JSON.parse(readFileSync(versionUrl, 'utf8')), approved);
  if (!redirects || redirects.schema !== 1 || redirects.repository !== approved.repository) fail('REDIRECT_SCHEMA', redirects?.schema);
  assertRedirects(redirects.redirects);
  const expectedSources = new Set();
  for (const catalogVersion of versions.versions) {
    for (const locale of ['en', 'ko']) {
      const localePrefix = locale === 'ko' ? '/ko' : '';
      for (const documentId of catalogVersion.documents[locale]) {
        const suffix = documentId === 'index' ? '' : `${documentId}/`;
        expectedSources.add(`${localePrefix}/manual/${approved.slug}/${suffix}`);
      }
    }
  }
  const actualSources = new Set(redirects.redirects.map(({ source }) => source));
  const unexpected = [...actualSources].find((source) => !expectedSources.has(source));
  const missing = [...expectedSources].find((source) => !actualSources.has(source));
  if (unexpected || missing) fail('REDIRECT_SOURCE_SET', unexpected ?? missing);
  const latest = version(versions, versions.latest);
  const entries = redirects.redirects.map(({ source, target }) => {
    const parsedSource = parseRedirectSource(source, approved);
    const parsedTarget = parseRedirectDestination(target, approved);
    if (parsedSource.locale !== parsedTarget.locale) fail('REDIRECT_LOCALE', `${source} -> ${target}`);
    if (parsedTarget.minorVersion !== versions.latest) fail('REDIRECT_LATEST', target);
    if (!latest.documents[parsedTarget.locale].includes(parsedTarget.documentId)) fail('REDIRECT_DOCUMENT', parsedTarget.documentId);
    return { source, destination: target };
  }).toSorted((left, right) => left.source.localeCompare(right.source));
  return { latest: versions.latest, entries };
}

function targetDocument(target, repository) {
  const match = target.match(new RegExp(`^/(ko/)?manual/${repository.slug}/\\d+\\.\\d+/(.*)$`));
  if (!match) fail('REDIRECT_TARGET', target);
  return { locale: match[1] ? 'ko' : 'en', documentId: match[2].replace(/\/$/, '') || 'index' };
}

function successorFor(successors, locale, documentId) {
  const configured = successors?.[locale]?.[documentId];
  return configured === undefined ? undefined : canonicalDocumentId(configured);
}

export function buildRedirectCatalog({ repository, previous, latestEntry, successors = {} }) {
  const approved = approvedRepository(repository);
  if (!previous || previous.schema !== 1 || previous.repository !== approved.repository) fail('REDIRECT_SCHEMA', previous?.schema);
  assertRedirects(previous.redirects);
  const latest = normalizeEntry(latestEntry);
  const redirects = new Map();
  for (const redirect of previous.redirects) {
    const { locale, documentId } = targetDocument(redirect.target, approved);
    const configured = successorFor(successors, locale, documentId);
    const targetId = latest.documents[locale].includes(documentId)
      ? documentId
      : configured ?? 'index';
    if (!latest.documents[locale].includes(targetId)) fail('REDIRECT_DOCUMENT', targetId);
    redirects.set(redirect.source, manualRouteFor(locale, approved, latest.minorVersion, `${targetId}.md`));
  }
  for (const locale of ['en', 'ko']) {
    const localePrefix = locale === 'ko' ? '/ko' : '';
    for (const documentId of latest.documents[locale]) {
      const sourceSuffix = documentId === 'index' ? '' : `${documentId}/`;
      const source = `${localePrefix}/manual/${approved.slug}/${sourceSuffix}`;
      redirects.set(source, manualRouteFor(locale, approved, latest.minorVersion, `${documentId}.md`));
    }
  }
  return {
    schema: 1,
    repository: approved.repository,
    redirects: [...redirects].map(([source, target]) => ({ source, target })).toSorted((a, b) => a.source.localeCompare(b.source)),
  };
}

function stableValue(value, key = '') {
  if (Array.isArray(value)) {
    const items = value.map((item) => stableValue(item));
    if (items.every((item) => typeof item === 'string')) return items.toSorted();
    if (key === 'versions') return items.toSorted((a, b) => compareMinor(a.minorVersion, b.minorVersion));
    if (key === 'redirects') return items.toSorted((a, b) => a.source.localeCompare(b.source));
    return items;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).toSorted().map((childKey) => [childKey, stableValue(value[childKey], childKey)]));
  }
  return value;
}

export function stableJson(value) {
  return `${JSON.stringify(stableValue(value), null, 2)}\n`;
}

export function buildUnavailablePage({ repository, locale, targetMinor, sourceMinor, documentId }) {
  const approved = approvedRepository(repository);
  if (!['en', 'ko'].includes(locale)) fail('LOCALE_UNSUPPORTED', locale);
  const safeDocument = canonicalDocumentId(documentId);
  if (!/^\d+\.\d+$/.test(targetMinor) || !/^\d+\.\d+$/.test(sourceMinor)) fail('MINOR_UNSAFE', targetMinor);
  const prefix = locale === 'ko' ? 'src/content/docs/ko' : 'src/content/docs';
  const route = manualRouteFor(locale, approved, sourceMinor, `${safeDocument}.md`);
  const unavailableId = `not-available/from-${sourceMinor}/${safeDocument}`;
  const slug = manualRouteFor(locale, approved, targetMinor, `${unavailableId}.md`)
    .replace(/^\//, '')
    .replace(/\/$/, '');
  const title = locale === 'ko'
    ? `이 문서는 ${targetMinor} 버전에 없습니다`
    : `This page is not available in version ${targetMinor}`;
  const body = locale === 'ko'
    ? `문서 ID: \`${safeDocument}\`\n\n이 문서는 해당 버전 이후에 추가되었습니다.\n\n[${sourceMinor} 버전으로 돌아가기](${route})`
    : `Document ID: \`${safeDocument}\`\n\nThis document was added after this version.\n\n[Return to version ${sourceMinor}](${route})`;
  return {
    path: path.posix.join(prefix, `manual/${approved.slug}/${targetMinor}/not-available/from-${sourceMinor}/${safeDocument}.md`),
    content: `---\ntitle: ${JSON.stringify(title)}\nslug: ${JSON.stringify(slug)}\npagefind: false\nsidebar:\n  hidden: true\n---\n\n# ${title}\n\n${body}\n`,
  };
}
