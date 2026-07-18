export const BLOG_DIAGRAM_SELECTOR =
  'figure:is(.bt4k-architecture, .bt4k-chart, .bt4k-sequence) > img';

export const MANUAL_DIAGRAM_SELECTOR =
  '.sl-markdown-content img[src^="/manual-assets/"]';

export function selectBlogDiagramImages(root = document) {
  return [...root.querySelectorAll(BLOG_DIAGRAM_SELECTOR)];
}

export function selectManualDiagramImages(root = document) {
  return [...root.querySelectorAll(MANUAL_DIAGRAM_SELECTOR)];
}

export function claimDiagramImage(image) {
  if (image.dataset.bt4kDiagramEnhanced === 'true') return false;
  if (image.closest('a')) return false;
  image.dataset.bt4kDiagramEnhanced = 'true';
  return true;
}

export function resolveDiagramTitle({ scope, explicitTitle = '', alt = '' }) {
  const title = explicitTitle.trim();
  if (title) return title;
  return scope === 'manual' ? alt.trim() : '';
}
