const STABLE_RELEASE = /^(?:v)?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export class ManualVersionError extends Error {
  constructor(code, expected, actual) {
    super(`${code}: expected ${String(expected)}, received ${String(actual)}`);
    this.name = 'ManualVersionError';
    this.code = code;
    this.expected = expected;
    this.actual = actual;
  }
}

function fail(code, expected, actual) {
  throw new ManualVersionError(code, expected, actual);
}

export function parseStableRelease(releaseRef) {
  const match = typeof releaseRef === 'string' && STABLE_RELEASE.exec(releaseRef);
  if (!match) fail('RELEASE_SEMVER', 'stable semantic release', releaseRef);

  const captures = match.slice(1);
  const numbers = captures.map((capture) => Number(capture));
  const unsafeIndex = numbers.findIndex((value) => !Number.isSafeInteger(value));
  if (unsafeIndex !== -1) fail('RELEASE_SEMVER_RANGE', 'safe integer', captures[unsafeIndex]);
  const [major, minor, patch] = numbers;
  return {
    releaseRef,
    major,
    minor,
    patch,
    minorVersion: `${major}.${minor}`,
    channel: 'stable',
  };
}

function compareMinor(left, right) {
  return left.major - right.major || left.minor - right.minor;
}

function parsedEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    fail('CATALOG_ENTRY', 'version entry object', entry ?? null);
  }
  const parsed = parseStableRelease(entry.releaseRef);
  if (entry.minorVersion !== parsed.minorVersion) {
    fail('CATALOG_RELEASE_MINOR', parsed.minorVersion, entry.minorVersion);
  }
  if (typeof entry.channel !== 'string') {
    fail('CATALOG_CHANNEL', 'string', entry.channel);
  }
  return parsed;
}

export function validateCatalog(catalog) {
  if (!catalog || typeof catalog !== 'object') fail('CATALOG_TYPE', 'catalog object', catalog ?? null);
  if (catalog.schema !== 1) fail('CATALOG_SCHEMA', 1, catalog.schema);
  if (!Array.isArray(catalog.versions)) fail('CATALOG_VERSIONS', 'array', catalog.versions);

  let previous;
  const minors = new Set();
  for (const entry of catalog.versions) {
    const parsed = parsedEntry(entry);
    if (minors.has(entry.minorVersion)) {
      fail('CATALOG_DUPLICATE_MINOR', 'unique minor versions', entry.minorVersion);
    }
    if (previous && compareMinor(previous, parsed) >= 0) {
      fail('CATALOG_UNSORTED', 'ascending numeric minor versions', entry.minorVersion);
    }
    minors.add(entry.minorVersion);
    previous = parsed;
  }

  const latest = catalog.versions.find((entry) => entry.minorVersion === catalog.latest);
  if (!latest) fail('CATALOG_LATEST', 'a published stable minor', catalog.latest);
  if (latest.channel !== 'stable') fail('CATALOG_LATEST_STABLE', 'stable', latest.channel);
  return catalog;
}

export function mergeVersionCatalog(previous, entry) {
  validateCatalog(previous);
  const incomingVersion = parsedEntry(entry);
  const existing = previous.versions.find((candidate) => candidate.minorVersion === entry.minorVersion);

  if (existing) {
    const currentVersion = parseStableRelease(existing.releaseRef);
    if (entry.channel !== existing.channel) {
      fail('CATALOG_CHANNEL_CHANGE', existing.channel, entry.channel);
    }
    if (incomingVersion.patch < currentVersion.patch) {
      fail('CATALOG_PATCH_DOWNGRADE', currentVersion.patch, incomingVersion.patch);
    }
    if (incomingVersion.patch === currentVersion.patch) {
      fail('CATALOG_PATCH_NOT_HIGHER', `> ${currentVersion.patch}`, incomingVersion.patch);
    }
  }

  const versions = previous.versions
    .filter((candidate) => candidate.minorVersion !== entry.minorVersion)
    .concat({ ...entry })
    .sort((left, right) => compareMinor(parseStableRelease(left.releaseRef), parseStableRelease(right.releaseRef)));
  const stableVersions = versions.filter((candidate) => candidate.channel === 'stable');
  const latest = stableVersions.at(-1)?.minorVersion;
  const merged = { ...previous, latest, versions };
  validateCatalog(merged);
  return merged;
}
