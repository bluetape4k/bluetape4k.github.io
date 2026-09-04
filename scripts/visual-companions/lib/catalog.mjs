const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REPOSITORY = /^bluetape4k\/[a-z0-9-]+$/;

function fail(code, value) {
  throw new Error(`${code}: ${String(value)}`);
}

function exactKeys(value, expected, code) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(code, value);
  const actual = Object.keys(value).sort();
  const sorted = [...expected].sort();
  if (actual.length !== sorted.length || actual.some((key, index) => key !== sorted[index])) {
    fail(code, actual.join(','));
  }
}

function localized(value, code) {
  exactKeys(value, ['en', 'ko'], `${code}_KEYS`);
  for (const locale of ['en', 'ko']) {
    if (typeof value[locale] !== 'string' || value[locale].trim() !== value[locale] || value[locale] === '') {
      fail(code, `${locale}:${value[locale]}`);
    }
  }
  return { en: value.en, ko: value.ko };
}

function localPublication(value, repository, documentId) {
  exactKeys(value, ['en', 'ko'], 'VISUAL_CATALOG_LOCALES_KEYS');
  const repositorySlug = repository.split('/')[1];
  const locales = {};
  for (const locale of ['en', 'ko']) {
    const publication = value[locale];
    exactKeys(publication, ['route', 'title'], 'VISUAL_CATALOG_LOCALE_KEYS');
    if (
      typeof publication.title !== 'string'
      || publication.title.trim() !== publication.title
      || publication.title === ''
    ) {
      fail('VISUAL_CATALOG_TITLE', `${locale}:${publication.title}`);
    }
    const prefix = locale === 'ko' ? '/ko' : '';
    const expectedRoute = `${prefix}/visual-companions/${repositorySlug}/${documentId}/`;
    if (publication.route !== expectedRoute) {
      fail('VISUAL_CATALOG_ROUTE', `${publication.route} != ${expectedRoute}`);
    }
    locales[locale] = { title: publication.title, route: publication.route };
  }
  return locales;
}

export function validateVisualCompanionCatalog(value) {
  exactKeys(value, ['repositories', 'schemaVersion'], 'VISUAL_CATALOG_KEYS');
  if (value.schemaVersion !== 1) fail('VISUAL_CATALOG_SCHEMA', value.schemaVersion);
  if (!Array.isArray(value.repositories) || value.repositories.length === 0) {
    fail('VISUAL_CATALOG_REPOSITORIES', value.repositories);
  }

  const repositories = new Set();
  return {
    schemaVersion: 1,
    repositories: value.repositories.map((repository) => {
      exactKeys(
        repository,
        ['description', 'documents', 'label', 'repository'],
        'VISUAL_CATALOG_REPOSITORY_KEYS',
      );
      if (typeof repository.repository !== 'string' || !REPOSITORY.test(repository.repository)) {
        fail('VISUAL_CATALOG_REPOSITORY', repository.repository);
      }
      if (repositories.has(repository.repository)) {
        fail('VISUAL_CATALOG_REPOSITORY_DUPLICATE', repository.repository);
      }
      repositories.add(repository.repository);
      if (!Array.isArray(repository.documents) || repository.documents.length === 0) {
        fail('VISUAL_CATALOG_DOCUMENTS', repository.repository);
      }

      const documentIds = new Set();
      const documents = repository.documents.map((document) => {
        const isLocallyPublished = Object.hasOwn(document, 'locales');
        exactKeys(
          document,
          isLocallyPublished ? ['featured', 'id', 'locales', 'summary'] : ['featured', 'id', 'summary'],
          'VISUAL_CATALOG_DOCUMENT_KEYS',
        );
        if (typeof document.id !== 'string' || !ID.test(document.id)) {
          fail('VISUAL_CATALOG_DOCUMENT_ID', document.id);
        }
        if (documentIds.has(document.id)) {
          fail('VISUAL_CATALOG_DOCUMENT_DUPLICATE', `${repository.repository}:${document.id}`);
        }
        documentIds.add(document.id);
        if (typeof document.featured !== 'boolean') {
          fail('VISUAL_CATALOG_FEATURED', `${repository.repository}:${document.id}`);
        }
        const normalized = {
          id: document.id,
          featured: document.featured,
          summary: localized(document.summary, 'VISUAL_CATALOG_SUMMARY'),
        };
        return isLocallyPublished
          ? { ...normalized, locales: localPublication(document.locales, repository.repository, document.id) }
          : normalized;
      });
      if (!documents.some(({ featured }) => featured)) {
        fail('VISUAL_CATALOG_FEATURED_MISSING', repository.repository);
      }
      return {
        repository: repository.repository,
        label: localized(repository.label, 'VISUAL_CATALOG_LABEL'),
        description: localized(repository.description, 'VISUAL_CATALOG_DESCRIPTION'),
        documents,
      };
    }),
  };
}
