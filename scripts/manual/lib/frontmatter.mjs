import path from 'node:path';
import { githubSourceUrlFor, manualRouteFor } from './paths.mjs';

function yamlScalar(value) {
  return JSON.stringify(value);
}

function withFrontmatter(content, sourcePath) {
  if (content.startsWith('---\n')) return content;
  const heading = /^# ([^\n]+)\n(?:\n)?/.exec(content);
  if (!heading) throw new Error(`${sourcePath}: YAML frontmatter or a leading H1 is required`);
  return `---\ntitle: ${yamlScalar(heading[1].trim())}\n---\n\n${content}`;
}

export function layerFor(kind) {
  if (kind === 'example') return 'learn';
  if (kind === 'benchmark') return 'apply';
  return 'build';
}

function rewriteManualAssets(content, repository, minorVersion) {
  return content.replaceAll(
    /(!?\[[^\]]*\]\()(?:(?:\.\.\/)+)assets\/([^)]+)(\))/g,
    `$1/manual-assets/${repository.slug}/${minorVersion}/$2$3`,
  );
}

function rewriteRepositoryLinks(content, repository, releaseRef) {
  return content.replaceAll(
    /(\]\()(?:(?:\.\.\/){4,})([^)]+)(\))/g,
    (_match, prefix, repositoryPath, suffix) => {
      const leaf = repositoryPath.split('/').at(-1);
      const view = leaf.includes('.') ? 'blob' : 'tree';
      return `${prefix}${githubSourceUrlFor({
        repository,
        releaseRef,
        sourcePath: repositoryPath,
        kind: view,
      })}${suffix}`;
    },
  );
}

function rewriteManualLinks(content, repository, minorVersion, sourcePath) {
  return content.replaceAll(
    /(\]\()([^)\s]+\.md)(#[^)]*)?(\))/g,
    (match, prefix, href, fragment = '', suffix) => {
      if (/^(?:[a-z][a-z+.-]*:|\/|#)/i.test(href)) return match;
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), href));
      const localized = /^docs\/manual\/(en|ko)\/(.+)\.md$/.exec(target);
      if (!localized) return match;
      const [, locale, relative] = localized;
      const route = manualRouteFor(locale, repository, minorVersion, `${relative}.md`);
      return `${prefix}${route}${fragment}${suffix}`;
    },
  );
}

export function transformManual({
  content,
  module,
  chapter,
  repository,
  sourceCommit,
  sourcePath,
  releaseRef,
  releaseCommit,
  minorVersion,
}) {
  content = withFrontmatter(content, sourcePath);
  const end = content.indexOf('\n---\n', 4);
  if (end < 0) throw new Error(`${sourcePath}: YAML frontmatter is not closed`);
  const metadata = [
    'manual:',
    `  id: ${yamlScalar(module.id)}`,
    `  repository: ${yamlScalar(repository.slug)}`,
    `  group: ${yamlScalar(module.group)}`,
    `  kind: ${yamlScalar(module.kind)}`,
    `  sourceCommit: ${yamlScalar(sourceCommit)}`,
    `  sourcePath: ${yamlScalar(sourcePath)}`,
    `  minorVersion: ${yamlScalar(minorVersion)}`,
    `  releaseRef: ${yamlScalar(releaseRef)}`,
    `  releaseCommit: ${yamlScalar(releaseCommit)}`,
    `  sourceDir: ${yamlScalar(module.sourceDir)}`,
    `  layer: ${yamlScalar(layerFor(module.kind))}`,
    ...(chapter ? [`  chapterId: ${yamlScalar(chapter.id)}`] : []),
  ].join('\n');
  const withMetadata = `${content.slice(0, end)}\n${metadata}${content.slice(end)}`;
  return stripFirstHeading(rewriteManualLinks(
    rewriteRepositoryLinks(
      rewriteManualAssets(withMetadata, repository, minorVersion),
      repository,
      releaseRef,
    ),
    repository,
    minorVersion,
    sourcePath,
  )).replace(/\n+$/, '\n');
}

export function setDocumentSlug(content, repository, slug) {
  const route = manualRouteFor('en', repository, repository.latestMinor, 'index.md');
  const expectedSlug = route.split('/')[2];
  if (typeof slug !== 'string' || !new RegExp(`^(?:ko/)?manual/${expectedSlug}/\\d+\\.\\d+(?:/.*)?$`).test(slug)) {
    throw new Error(`SLUG_UNSAFE: ${String(slug)}`);
  }
  if (!content.startsWith('---\n')) throw new Error('YAML frontmatter is required before setting a slug');
  const end = content.indexOf('\n---\n', 4);
  if (end < 0) throw new Error('YAML frontmatter is not closed before setting a slug');
  const frontmatter = content.slice(4, end);
  const next = /^slug:/m.test(frontmatter)
    ? frontmatter.replace(/^slug:.*$/m, `slug: ${yamlScalar(slug)}`)
    : `slug: ${yamlScalar(slug)}\n${frontmatter}`;
  return `---\n${next}${content.slice(end)}`;
}

export function stripFirstHeading(content) {
  return content
    .replace(/\n# [^\n]+\n/, '\n')
    .replace(/^(#{2,6} .+?) \{#[a-z0-9-]+\}$/gm, '$1');
}
