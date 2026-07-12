function yamlScalar(value) {
  return JSON.stringify(value);
}

export function layerFor(kind) {
  if (kind === 'example') return 'learn';
  if (kind === 'benchmark') return 'apply';
  return 'build';
}

function rewriteManualAssets(content, repository) {
  return content.replaceAll(
    /(!?\[[^\]]*\]\()(?:(?:\.\.\/)+)assets\/([^)]+)(\))/g,
    `$1/manual-assets/${repository}/$2$3`,
  );
}

function rewriteRepositoryLinks(content, repository, sourceCommit) {
  return content.replaceAll(
    /(\]\()(?:(?:\.\.\/){4,})([^)]+)(\))/g,
    `$1https://github.com/bluetape4k/${repository}/blob/${sourceCommit}/$2$3`,
  );
}

export function transformManual({ content, module, chapter, repository, sourceCommit, sourcePath }) {
  if (!content.startsWith('---\n')) throw new Error(`${sourcePath}: YAML frontmatter is required`);
  const end = content.indexOf('\n---\n', 4);
  if (end < 0) throw new Error(`${sourcePath}: YAML frontmatter is not closed`);
  const metadata = [
    'manual:',
    `  id: ${yamlScalar(module.id)}`,
    `  repository: ${yamlScalar(repository)}`,
    `  group: ${yamlScalar(module.group)}`,
    `  kind: ${yamlScalar(module.kind)}`,
    `  sourceCommit: ${yamlScalar(sourceCommit)}`,
    `  sourcePath: ${yamlScalar(sourcePath)}`,
    `  layer: ${yamlScalar(layerFor(module.kind))}`,
    ...(chapter ? [`  chapterId: ${yamlScalar(chapter.id)}`] : []),
  ].join('\n');
  const withMetadata = `${content.slice(0, end)}\n${metadata}${content.slice(end)}`;
  return stripFirstHeading(rewriteRepositoryLinks(
    rewriteManualAssets(withMetadata, repository),
    repository,
    sourceCommit,
  ));
}

export function stripFirstHeading(content) {
  return content
    .replace(/\n# [^\n]+\n/, '\n')
    .replace(/^(#{2,6} .+?) \{#[a-z0-9-]+\}$/gm, '$1');
}
