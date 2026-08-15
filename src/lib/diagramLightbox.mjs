export const BLOG_DIAGRAM_SELECTOR =
  'figure:is(.bt4k-architecture, .bt4k-chart, .bt4k-sequence) > img, .bt4k-operations-screen > img';

export const MANUAL_DIAGRAM_SELECTOR =
  [
    '.sl-markdown-content img[src^="/manual-assets/"]',
    '.sl-markdown-content img[src^="https://raw.githubusercontent.com/bluetape4k/"][src*="/docs/images/readme-diagrams/"]',
  ].join(', ');

const README_DIAGRAM_PNG =
  /^https:\/\/raw\.githubusercontent\.com\/bluetape4k\/([a-z0-9][a-z0-9._-]*)\/([a-f0-9]{40})\/docs\/images\/readme-diagrams\/(.+)\.png$/i;
const README_DIAGRAM_SVG_LINK =
  /^https:\/\/github\.com\/bluetape4k\/([a-z0-9][a-z0-9._-]*)\/blob\/([a-f0-9]{40})\/docs\/images\/readme-diagrams\/(.+)\.svg$/i;

function isSafeReadmeDiagramName(name) {
  return name.split('/').every(
    (segment) =>
      /^[a-z0-9][a-z0-9._-]*$/i.test(segment)
      && segment !== '.'
      && segment !== '..',
  );
}

export function selectBlogDiagramImages(root = document) {
  return [...root.querySelectorAll(BLOG_DIAGRAM_SELECTOR)];
}

export function selectManualDiagramImages(root = document) {
  return [...root.querySelectorAll(MANUAL_DIAGRAM_SELECTOR)];
}

export function claimDiagramImage(image, { expectedAnchor = null } = {}) {
  if (image.dataset.bt4kDiagramEnhanced === 'true') return false;
  const anchor = image.closest('a');
  if (anchor && anchor !== expectedAnchor) return false;
  image.dataset.bt4kDiagramEnhanced = 'true';
  return true;
}

export function resolveReadmeDiagramSource({ imageSource = '', linkTarget = '' }) {
  const imageMatch = imageSource.trim().match(README_DIAGRAM_PNG);
  const linkMatch = linkTarget.trim().match(README_DIAGRAM_SVG_LINK);
  if (!imageMatch || !linkMatch) return '';

  const [, imageRepo, imageRevision, imageName] = imageMatch;
  const [, linkRepo, linkRevision, linkName] = linkMatch;
  if (
    !isSafeReadmeDiagramName(imageName)
    || !isSafeReadmeDiagramName(linkName)
    || imageName.includes('?')
    || imageName.includes('#')
    || linkName.includes('?')
    || linkName.includes('#')
    || imageRepo !== linkRepo
    || imageRevision !== linkRevision
    || imageName !== linkName
  ) return '';

  return `https://raw.githubusercontent.com/bluetape4k/${imageRepo}/${imageRevision}/docs/images/readme-diagrams/${imageName}.svg`;
}

export function resolveDiagramTitle({ scope, explicitTitle = '', alt = '' }) {
  const title = explicitTitle.trim();
  if (title) return title;
  return scope === 'manual' ? alt.trim() : '';
}

function setOptionalText(element, text) {
  element.textContent = text;
  element.hidden = !text;
}

function createOpenButton(label) {
  const button = document.createElement('button');
  button.className = 'bt4k-diagram-open';
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.innerHTML = [
    '<svg viewBox="0 0 24 24" aria-hidden="true">',
    '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"></path>',
    '</svg>',
  ].join('');
  return button;
}

function diagramMetadata(image, scope, sourceOverride = '') {
  const visual = image.closest('figure, .bt4k-operations-screen');
  const explicitTitle =
    visual?.dataset.diagramTitle
    ?? visual?.dataset.visualTitle
    ?? '';
  const alt = image.getAttribute('alt')?.trim() ?? '';
  const caption =
    scope === 'blog'
      ? visual?.querySelector('figcaption, .bt4k-operations-screen-caption')?.textContent?.trim() ?? ''
      : '';
  return {
    source: sourceOverride || image.currentSrc || image.getAttribute('src') || '',
    alt,
    title: resolveDiagramTitle({ scope, explicitTitle, alt }),
    caption,
  };
}

function manualDiagramContext(image) {
  const imageSource = image.getAttribute('src')?.trim() ?? '';
  if (imageSource.startsWith('/manual-assets/')) {
    return { insertionTarget: image, sourceAnchor: null, sourceOverride: '' };
  }

  const anchor = image.closest('a');
  const linkTarget = anchor?.getAttribute('href')?.trim() ?? '';
  const sourceOverride = resolveReadmeDiagramSource({ imageSource, linkTarget });
  if (!anchor || !sourceOverride) return null;
  return { insertionTarget: anchor, sourceAnchor: anchor, sourceOverride };
}

function enhanceImage({ image, scope, label, open }) {
  const context =
    scope === 'manual'
      ? manualDiagramContext(image)
      : { insertionTarget: image, sourceAnchor: null, sourceOverride: '' };
  if (!context || !claimDiagramImage(image, { expectedAnchor: context.sourceAnchor })) return;

  const wrapper = document.createElement('span');
  wrapper.className = 'bt4k-diagram-trigger';
  context.insertionTarget.before(wrapper);
  wrapper.append(image);
  context.sourceAnchor?.remove();

  const button = createOpenButton(label);
  wrapper.append(button);

  const openCurrent = () => {
    const metadata = diagramMetadata(image, scope, context.sourceOverride);
    if (metadata.source && !button.disabled) open(metadata, button);
  };
  image.addEventListener('click', openCurrent);
  button.addEventListener('click', openCurrent);

  const disable = () => {
    button.disabled = true;
    image.classList.remove('bt4k-diagram-trigger__image');
  };
  image.classList.add('bt4k-diagram-trigger__image');
  if (image.complete && image.naturalWidth === 0) disable();
  else image.addEventListener('error', disable, { once: true });
}

export function initializeDiagramLightbox({ dialog, root = document }) {
  if (dialog.dataset.initialized === 'true') return;
  dialog.dataset.initialized = 'true';

  const scope = dialog.dataset.scope;
  if (scope !== 'blog' && scope !== 'manual') return;

  const modalImage = dialog.querySelector('[data-diagram-image]');
  const title = dialog.querySelector('[data-diagram-title]');
  const caption = dialog.querySelector('[data-diagram-caption]');
  const closeButton = dialog.querySelector('[data-diagram-close]');
  const backdropSurfaces = dialog.querySelectorAll('[data-diagram-backdrop]');
  if (!modalImage || !title || !caption || !closeButton || !backdropSurfaces.length) return;

  let restoreFocus = null;
  const close = () => {
    if (dialog.open) dialog.close();
  };
  const open = (metadata, focusTarget) => {
    restoreFocus = focusTarget;
    modalImage.src = metadata.source;
    modalImage.alt = metadata.alt;
    setOptionalText(title, metadata.title);
    setOptionalText(caption, metadata.caption);
    document.documentElement.classList.add('bt4k-diagram-lightbox-open');
    dialog.showModal();
    closeButton.focus();
  };

  const images =
    scope === 'blog'
      ? selectBlogDiagramImages(root)
      : selectManualDiagramImages(root);
  for (const image of images) {
    try {
      enhanceImage({
        image,
        scope,
        label: dialog.dataset.viewLarger || 'View larger',
        open,
      });
    } catch (error) {
      console.warn('Diagram enlargement could not initialize one image.', error);
    }
  }

  closeButton.addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    if (
      event.target === dialog
      || [...backdropSurfaces].includes(event.target)
    ) close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('bt4k-diagram-lightbox-open');
    modalImage.removeAttribute('src');
    modalImage.alt = '';
    restoreFocus?.focus();
    restoreFocus = null;
  });
}
