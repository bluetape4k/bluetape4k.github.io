function yamlScalar(value) {
  return JSON.stringify(value);
}

export function layerFor(kind) {
  if (kind === 'example') return 'learn';
  if (kind === 'benchmark') return 'apply';
  return 'build';
}

export function transformManual({ content, module, repository, sourceCommit, sourcePath }) {
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
  ].join('\n');
  const withMetadata = `${content.slice(0, end)}\n${metadata}${content.slice(end)}`;
  return withMetadata.replaceAll(
    /\]\(\.\.\/\.\.\/\.\.\/\.\.\/([^)]+)\)/g,
    `](https://github.com/bluetape4k/${repository}/blob/${sourceCommit}/$1)`,
  );
}
