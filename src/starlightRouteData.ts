import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { validateVersionCatalog } from '../scripts/manual/lib/catalog.mjs';
import { loadRepositoryRegistry, repositoryBySlug } from '../scripts/manual/lib/repositories.mjs';

const manualRepositories = loadRepositoryRegistry(pathToFileURL(path.join(process.cwd(), 'src/data/manual/repositories.json')));
const projectsRepository = repositoryBySlug(manualRepositories, 'bluetape4k-projects');

function latestMinor(): string | undefined {
  try {
    const bytes = readFileSync(
      path.join(process.cwd(), 'src/data/manual/bluetape4k-projects.versions.json'),
      'utf8',
    );
    return validateVersionCatalog(JSON.parse(bytes), projectsRepository).latest;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return undefined;
  }
}

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const manual = route.entry.data.manual as { minorVersion?: string } | undefined;
  const latest = latestMinor();
  if (manual?.minorVersion && latest && manual.minorVersion !== latest) {
    route.entry.data.pagefind = false;
  }
});
