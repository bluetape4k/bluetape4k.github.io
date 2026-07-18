import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  BLOG_DIAGRAM_SELECTOR,
  MANUAL_DIAGRAM_SELECTOR,
  claimDiagramImage,
  resolveDiagramTitle,
  selectBlogDiagramImages,
  selectManualDiagramImages,
} from '../../src/lib/diagramLightbox.mjs';

const root = new URL('../../', import.meta.url);
const read = (relative) => readFile(new URL(relative, root), 'utf8');

function selectorRoot(expectedSelector, values) {
  return {
    querySelectorAll(selector) {
      assert.equal(selector, expectedSelector);
      return values;
    },
  };
}

test('blog and manual selectors stay inside the approved diagram boundaries', () => {
  assert.equal(
    BLOG_DIAGRAM_SELECTOR,
    'figure:is(.bt4k-architecture, .bt4k-chart, .bt4k-sequence) > img',
  );
  assert.doesNotMatch(BLOG_DIAGRAM_SELECTOR, /blog-hero|post-hero|post-figure/);
  assert.equal(
    MANUAL_DIAGRAM_SELECTOR,
    '.sl-markdown-content img[src^="/manual-assets/"]',
  );
});

test('blog and manual target selection use separate selectors', () => {
  const blogImages = [{ id: 'architecture' }, { id: 'chart' }];
  const manualImages = [{ id: 'manual' }];

  assert.deepEqual(
    selectBlogDiagramImages(selectorRoot(BLOG_DIAGRAM_SELECTOR, blogImages)),
    blogImages,
  );
  assert.deepEqual(
    selectManualDiagramImages(selectorRoot(MANUAL_DIAGRAM_SELECTOR, manualImages)),
    manualImages,
  );
});

test('explicit titles win while only manuals fall back to alt text', () => {
  assert.equal(
    resolveDiagramTitle({
      scope: 'blog',
      explicitTitle: ' 병원 예약 SaaS의 업무 영역 ',
      alt: '긴 접근성 설명',
    }),
    '병원 예약 SaaS의 업무 영역',
  );
  assert.equal(
    resolveDiagramTitle({
      scope: 'manual',
      explicitTitle: '',
      alt: ' 리더 선출의 리스 수명 주기 ',
    }),
    '리더 선출의 리스 수명 주기',
  );
  assert.equal(
    resolveDiagramTitle({
      scope: 'blog',
      explicitTitle: '',
      alt: '파일명을 대신하면 안 되는 긴 설명',
    }),
    '',
  );
});

test('an image can be claimed for enhancement only once', () => {
  const image = {
    dataset: {},
    closest(selector) {
      assert.equal(selector, 'a');
      return null;
    },
  };

  assert.equal(claimDiagramImage(image), true);
  assert.equal(claimDiagramImage(image), false);
});

test('Starlight mounts one localized dialog only for blog posts and manuals', async () => {
  const footer = await read('src/components/StarlightFooter.astro');
  const component = await read('src/components/DiagramLightbox.astro');

  assert.match(footer, /import DiagramLightbox from '.\/DiagramLightbox\.astro'/);
  assert.match(footer, /starlightRoute\.entry\.data\.manual/);
  assert.match(footer, /entryId\.startsWith\('blog\/'\)/);
  assert.match(footer, /entryId\.startsWith\('ko\/blog\/'\)/);
  assert.match(footer, /<DiagramLightbox scope=\{diagramScope\} locale=\{locale\}/);

  assert.match(component, /<dialog/);
  assert.match(component, /data-bt4k-diagram-lightbox/);
  assert.match(component, /data-diagram-backdrop/);
  assert.match(component, /aria-label=\{viewLarger\}/);
  assert.match(component, /크게 보기/);
  assert.match(component, /View larger/);
  assert.match(component, /닫기/);
  assert.match(component, /Close/);
  assert.match(component, /initializeDiagramLightbox/);
});
