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

function diagramMetadata(image, scope) {
  const figure = image.closest('figure');
  const explicitTitle = figure?.dataset.diagramTitle ?? '';
  const alt = image.getAttribute('alt')?.trim() ?? '';
  const caption =
    scope === 'blog'
      ? figure?.querySelector('figcaption')?.textContent?.trim() ?? ''
      : '';
  return {
    source: image.currentSrc || image.getAttribute('src') || '',
    alt,
    title: resolveDiagramTitle({ scope, explicitTitle, alt }),
    caption,
  };
}

function enhanceImage({ image, scope, label, open }) {
  if (!claimDiagramImage(image)) return;

  const wrapper = document.createElement('span');
  wrapper.className = 'bt4k-diagram-trigger';
  image.before(wrapper);
  wrapper.append(image);

  const button = createOpenButton(label);
  wrapper.append(button);

  const openCurrent = () => {
    const metadata = diagramMetadata(image, scope);
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
