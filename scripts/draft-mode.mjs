import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const sourceBlogDir = path.join(root, 'docs', 'blog');
const generatedDocsDir = path.join(root, 'src', 'content', 'docs', 'drafts');
const sourceImagesDir = path.join(root, 'docs', 'images');
const generatedAssetsDir = path.join(root, 'public', 'draft-assets', 'images');

const command = process.argv[2] ?? 'sync';

function clean() {
  fs.rmSync(generatedDocsDir, { recursive: true, force: true });
  fs.rmSync(path.join(root, 'public', 'draft-assets'), { recursive: true, force: true });
}

function titleFromMarkdown(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallback;
}

function hasFrontmatter(markdown) {
  return markdown.startsWith('---\n') || markdown.startsWith('---\r\n');
}

function withFrontmatter(markdown, sourceName) {
  if (hasFrontmatter(markdown)) {
    return markdown;
  }

  const title = titleFromMarkdown(markdown, sourceName.replace(/\.(md|mdx)$/i, ''));
  return [
    '---',
    `title: ${JSON.stringify(`Draft: ${title}`)}`,
    `description: ${JSON.stringify('Local draft preview. This page is excluded from publish builds.')}`,
    '---',
    '',
    `> Draft preview. Source: \`docs/blog/${sourceName}\`.`,
    '',
    markdown,
  ].join('\n');
}

function rewriteDraftLinks(markdown) {
  return markdown.replaceAll('../images/', '/draft-assets/images/');
}

function sync() {
  clean();

  if (!fs.existsSync(sourceBlogDir)) {
    console.log(`No blog draft directory found: ${sourceBlogDir}`);
    return;
  }

  fs.mkdirSync(generatedDocsDir, { recursive: true });

  if (fs.existsSync(sourceImagesDir)) {
    fs.cpSync(sourceImagesDir, generatedAssetsDir, { recursive: true });
  }

  const draftFiles = fs
    .readdirSync(sourceBlogDir)
    .filter((name) => /\.(md|mdx)$/i.test(name))
    .sort();

  for (const sourceName of draftFiles) {
    const sourcePath = path.join(sourceBlogDir, sourceName);
    const targetName = sourceName.replace(/\.md$/i, '.mdx');
    const targetPath = path.join(generatedDocsDir, targetName);
    const markdown = fs.readFileSync(sourcePath, 'utf8');
    const previewMarkdown = rewriteDraftLinks(withFrontmatter(markdown, sourceName));
    fs.writeFileSync(targetPath, previewMarkdown);
  }

  console.log(`Synced ${draftFiles.length} blog draft(s) to src/content/docs/drafts.`);
}

if (command === 'clean') {
  clean();
  console.log('Draft preview content removed.');
} else if (command === 'sync') {
  sync();
} else {
  console.error(`Unknown command: ${command}`);
  process.exitCode = 1;
}
