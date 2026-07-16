import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getCollection } from 'astro:content';
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { validateVersionCatalog } from '../scripts/manual/lib/catalog.mjs';
import { buildManualNavigation } from '../scripts/manual/lib/navigation.mjs';
import { manualRouteFor } from '../scripts/manual/lib/paths.mjs';
import { loadRepositoryRegistry, repositoryBySlug } from '../scripts/manual/lib/repositories.mjs';
import { withBlogSocialPreview } from './lib/socialPreview';

type ManualRepository = {
  slug: string;
  repository: string;
  label: { en: string; ko: string };
  latestMinor: string;
  route: { en: string; ko: string };
};

const root = process.cwd();
const manualRepositories = loadRepositoryRegistry(
  pathToFileURL(path.join(root, 'src/data/manual/repositories.json')),
);

function loadManualCatalog(repository: ManualRepository) {
  const catalogPath = path.join(root, `src/data/manual/${repository.slug}.versions.json`);
  try {
    return validateVersionCatalog(JSON.parse(readFileSync(catalogPath, 'utf8')), repository);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`NAVIGATION_CATALOG_MISSING: ${repository.slug}`);
    }
    throw error;
  }
}

const manualCatalogs = Object.fromEntries(
  manualRepositories.repositories.map((repository: ManualRepository) => [
    repository.slug,
    loadManualCatalog(repository),
  ]),
);

const manualDocuments = (await getCollection('docs')).flatMap((entry) => {
  const manual = entry.data.manual;
  if (!manual) return [];
  return [{
    id: manual.id,
    locale: entry.id.startsWith('ko/') ? 'ko' : 'en',
    repository: manual.repository,
    minorVersion: manual.minorVersion,
    title: entry.data.title,
  }];
});

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const blog = route.entry.data.blog as { image: string; imageAlt: string } | undefined;
  if (blog) {
    route.head = withBlogSocialPreview(
      route.head,
      blog,
      context.site ?? new URL('https://bluetape4k.github.io'),
    );
  }

  const manual = route.entry.data.manual;
  if (!manual) return;

  const repository = repositoryBySlug(manualRepositories, manual.repository);
  const catalog = manualCatalogs[repository.slug];
  const locale = route.locale === 'ko' ? 'ko' : 'en';
  const expectedSlug = manualRouteFor(locale, repository, manual.minorVersion, `${manual.id}.md`)
    .replace(/^\//, '')
    .replace(/\/$/, '');
  if (route.id !== expectedSlug) {
    throw new Error(`NAVIGATION_ROUTE_MISMATCH: ${route.id} != ${expectedSlug}`);
  }
  if (manual.minorVersion !== catalog.latest) {
    route.entry.data.pagefind = false;
  }

  const navigation = buildManualNavigation({
    registry: manualRepositories,
    catalogs: manualCatalogs,
    documents: manualDocuments,
    current: {
      locale,
      repository: repository.slug,
      minorVersion: manual.minorVersion,
      documentId: manual.id,
    },
  });
  route.sidebar = navigation.sidebar;
  route.hasSidebar = true;
  route.pagination = navigation.pagination;
  route.manualNavigation = { home: navigation.home };
});
