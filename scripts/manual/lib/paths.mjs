import path from 'node:path';

export function destinationFor(locale, relativePath) {
  const base = locale === 'ko'
    ? 'src/content/docs/ko/manual/bluetape4k-projects'
    : 'src/content/docs/manual/bluetape4k-projects';
  return path.posix.join(base, relativePath.replace(new RegExp(`^${locale}/`), ''));
}

export function localeOf(relativePath) {
  if (relativePath.startsWith('en/')) return 'en';
  if (relativePath.startsWith('ko/')) return 'ko';
  throw new Error(`Unsupported manual locale path: ${relativePath}`);
}
