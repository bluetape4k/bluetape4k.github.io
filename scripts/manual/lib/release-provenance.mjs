import { validateVersionCatalog } from './catalog.mjs';
import { resolveRelease } from './release.mjs';

function fail(code, expected, actual, repository) {
  const error = new Error(`${code}: release provenance rejected`);
  error.code = code;
  error.expected = expected;
  error.actual = actual;
  error.repository = repository;
  throw error;
}

export async function verifyReleaseProvenance({
  repository,
  catalog,
  resolveReleaseImpl = resolveRelease,
}) {
  const normalized = validateVersionCatalog(catalog, repository);
  const latest = normalized.versions.find(({ minorVersion }) => minorVersion === normalized.latest);
  const resolved = await resolveReleaseImpl({ repository, releaseRef: latest.releaseRef });

  if (resolved?.repository !== repository.repository) {
    fail('REPOSITORY_IDENTITY', repository.repository, resolved?.repository ?? null, repository.repository);
  }
  if (resolved?.releaseRef !== latest.releaseRef) {
    fail('RELEASE_TAG_MISMATCH', latest.releaseRef, resolved?.releaseRef ?? null, repository.repository);
  }
  if (resolved?.releaseCommit !== latest.releaseCommit) {
    fail('RELEASE_MOVED', latest.releaseCommit, resolved?.releaseCommit ?? null, repository.repository);
  }

  return {
    repository: repository.repository,
    latest: normalized.latest,
    releaseRef: latest.releaseRef,
    releaseCommit: latest.releaseCommit,
    verified: true,
  };
}
