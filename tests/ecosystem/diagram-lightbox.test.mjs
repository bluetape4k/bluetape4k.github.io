import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
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
    [
      '.sl-markdown-content img[src^="/manual-assets/"]',
      '.sl-markdown-content img[src^="https://raw.githubusercontent.com/bluetape4k/"][src*="/docs/images/readme-diagrams/"]',
    ].join(', '),
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

test('a validated linked manual diagram can be claimed without enabling arbitrary linked images', () => {
  const anchor = {};
  const linkedImage = {
    dataset: {},
    closest(selector) {
      assert.equal(selector, 'a');
      return anchor;
    },
  };

  assert.equal(claimDiagramImage(linkedImage), false);
  assert.equal(claimDiagramImage(linkedImage, { expectedAnchor: {} }), false);
  assert.equal(claimDiagramImage(linkedImage, { expectedAnchor: anchor }), true);
});

test('README-shared manual diagrams resolve only matching immutable GitHub PNG and SVG pairs', async () => {
  const module = await import('../../src/lib/diagramLightbox.mjs');
  assert.equal(typeof module.resolveReadmeDiagramSource, 'function');

  const revision = '6187173b58e8b4c5c435c145e00e94708f31ef75';
  const imageSource = `https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/${revision}/docs/images/readme-diagrams/root-readme-en-diagram-01.png`;
  const linkTarget = `https://github.com/bluetape4k/bluetape4k-projects/blob/${revision}/docs/images/readme-diagrams/root-readme-en-diagram-01.svg`;
  const expected = `https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/${revision}/docs/images/readme-diagrams/root-readme-en-diagram-01.svg`;

  assert.equal(module.resolveReadmeDiagramSource({ imageSource, linkTarget }), expected);
  assert.equal(
    module.resolveReadmeDiagramSource({
      imageSource,
      linkTarget: linkTarget.replace(revision, '0'.repeat(40)),
    }),
    '',
  );
  assert.equal(
    module.resolveReadmeDiagramSource({
      imageSource: imageSource.replace('/bluetape4k/', '/someone-else/'),
      linkTarget,
    }),
    '',
  );
  assert.equal(
    module.resolveReadmeDiagramSource({
      imageSource: imageSource.replace('/readme-diagrams/', '/screenshots/'),
      linkTarget,
    }),
    '',
  );
  assert.equal(
    module.resolveReadmeDiagramSource({
      imageSource,
      linkTarget: linkTarget.replace('root-readme-en-diagram-01.svg', 'different.svg'),
    }),
    '',
  );
  assert.equal(
    module.resolveReadmeDiagramSource({
      imageSource: imageSource.replace(
        'root-readme-en-diagram-01.png',
        'benchmark/graph-benchmark-architecture-01.png',
      ),
      linkTarget: linkTarget.replace(
        'root-readme-en-diagram-01.svg',
        'benchmark/graph-benchmark-architecture-01.svg',
      ),
    }),
    expected.replace(
      'root-readme-en-diagram-01.svg',
      'benchmark/graph-benchmark-architecture-01.svg',
    ),
  );
  assert.equal(
    module.resolveReadmeDiagramSource({
      imageSource: imageSource.replace(
        'root-readme-en-diagram-01.png',
        'benchmark/../root-readme-en-diagram-01.png',
      ),
      linkTarget: linkTarget.replace(
        'root-readme-en-diagram-01.svg',
        'benchmark/../root-readme-en-diagram-01.svg',
      ),
    }),
    '',
  );
});

test('enhancement removes the README source link and keeps only the large-view interaction', async () => {
  const library = await read('src/lib/diagramLightbox.mjs');

  assert.match(library, /context\.sourceAnchor\?\.remove\(\)/);
  assert.doesNotMatch(library, /preventDefault|metaKey|ctrlKey|shiftKey/);
});

test('every README-shared manual diagram has a matching immutable SVG large-view source', async () => {
  const module = await import('../../src/lib/diagramLightbox.mjs');
  const manualDirectories = ['src/content/docs/manual/', 'src/content/docs/ko/manual/'];
  const failures = [];
  let diagramCount = 0;

  for (const directory of manualDirectories) {
    const names = await readdir(new URL(directory, root), { recursive: true });
    for (const name of names) {
      if (!name.endsWith('.md') && !name.endsWith('.mdx')) continue;
      const relative = `${directory}${name}`;
      const source = await read(relative);
      const rawImages = [
        ...source.matchAll(/https:\/\/raw\.githubusercontent\.com\/bluetape4k\/[^)\s]+\/docs\/images\/readme-diagrams\/[^)\s]+\.png/g),
      ];
      const linkedImages = [
        ...source.matchAll(/\[!\[[^\]]*\]\((https:\/\/raw\.githubusercontent\.com\/bluetape4k\/[^)]+)\)\]\((https:\/\/github\.com\/bluetape4k\/[^)]+)\)/g),
      ];

      diagramCount += rawImages.length;
      if (rawImages.length !== linkedImages.length) {
        failures.push(`${relative}: ${rawImages.length} previews but ${linkedImages.length} source pairs`);
        continue;
      }
      for (const match of linkedImages) {
        if (!module.resolveReadmeDiagramSource({ imageSource: match[1], linkTarget: match[2] })) {
          failures.push(`${relative}: immutable PNG/SVG pair does not match`);
        }
      }
    }
  }

  assert.ok(diagramCount > 0);
  assert.deepEqual(failures, []);
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

test('diagram styles provide visible controls, modal sizing, accessibility modes, and print exclusion', async () => {
  const config = await read('astro.config.mjs');
  const styles = await read('src/styles/diagram-lightbox.css');

  assert.match(config, /['"]\.\/src\/styles\/diagram-lightbox\.css['"]/);
  assert.match(styles, /\.bt4k-diagram-open/);
  assert.match(
    styles,
    /\.bt4k-diagram-trigger\s*\{[^}]*inline-size:\s*fit-content/s,
  );
  assert.match(styles, /cursor:\s*zoom-in/);
  assert.match(styles, /\.bt4k-diagram-lightbox::backdrop/);
  assert.match(styles, /max-inline-size:\s*100%/);
  assert.match(styles, /max-block-size:\s*100%/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(styles, /@media print/);
});

test('the clinic article provides localized diagram titles without making the Hero zoomable', async () => {
  const ko = await read('src/content/docs/ko/blog/clinic-appointment-part1-not-just-crud.mdx');
  const en = await read('src/content/docs/blog/clinic-appointment-part1-not-just-crud.mdx');

  assert.match(
    ko,
    /class="bt4k-architecture"\s+data-diagram-title="병원 예약 SaaS의 업무 영역"/,
  );
  assert.match(
    en,
    /class="bt4k-architecture"\s+data-diagram-title="Clinic appointment SaaS domain boundaries"/,
  );
  assert.doesNotMatch(ko, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
  assert.doesNotMatch(en, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
});

test('the AI collaboration environment provides localized diagram titles without making the Hero zoomable', async () => {
  const ko = await read('src/content/docs/ko/blog/ai-collaboration-environment.mdx');
  const en = await read('src/content/docs/blog/ai-collaboration-environment.mdx');

  assert.match(
    ko,
    /class="bt4k-architecture"\s+data-diagram-title="AI 협업 환경의 반복 구조"/,
  );
  assert.match(
    en,
    /class="bt4k-architecture"\s+data-diagram-title="The recurring structure of an AI collaboration environment"/,
  );
  assert.doesNotMatch(ko, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
  assert.doesNotMatch(en, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
});

test('the GraphDB adoption post exposes localized chart titles without making its Hero zoomable', async () => {
  const ko = await read('src/content/docs/ko/blog/when-to-adopt-graphdb.mdx');
  const en = await read('src/content/docs/blog/when-to-adopt-graphdb.mdx');

  assert.match(
    ko,
    /class="bt4k-chart"\s+data-diagram-title="GraphDB 도입 판단용 권한 상속 지연 시간 비교"/,
  );
  assert.match(
    en,
    /class="bt4k-chart"\s+data-diagram-title="Authorization inheritance latency comparison for GraphDB adoption"/,
  );
  assert.doesNotMatch(ko, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
  assert.doesNotMatch(en, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
});

test('every blog image is explicitly classified as a technical diagram or an excluded visual', async () => {
  const allowedFigureClasses = new Set([
    'bt4k-architecture',
    'bt4k-chart',
    'bt4k-sequence',
    'bt4k-blog-hero',
    'bt4k-post-hero',
  ]);
  const blogDirectories = ['src/content/docs/blog/', 'src/content/docs/ko/blog/'];
  const failures = [];

  for (const directory of blogDirectories) {
    for (const name of await readdir(new URL(directory, root), { recursive: true })) {
      if (!name.endsWith('.mdx')) continue;
      const relative = `${directory}${name}`;
      const source = await read(relative);

      for (const match of source.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
        failures.push(`${relative}: unclassified Markdown image ${match[1]}`);
      }

      for (const match of source.matchAll(/<figure\b([^>]*)>([\s\S]*?)<\/figure>/g)) {
        if (!/<img\b[^>]*\bsrc\s*=/.test(match[2])) continue;
        const className = /\bclass="([^"]+)"/.exec(match[1])?.[1] ?? '';
        if (!allowedFigureClasses.has(className)) {
          failures.push(`${relative}: unsupported figure class "${className}"`);
          continue;
        }
        if (
          ['bt4k-architecture', 'bt4k-chart', 'bt4k-sequence'].includes(className)
          && !/^\s*<img\b[^>]*\bsrc\s*=/.test(match[2])
        ) {
          failures.push(`${relative}: ${className} image is not a direct figure child`);
        }
      }

      for (const match of source.matchAll(/<img\b([^>]*)>/g)) {
        const attributes = match[1];
        const imageSource = /\bsrc\s*=\s*(["'])(.*?)\1/.exec(attributes)?.[2] ?? '';
        if (!imageSource) {
          failures.push(`${relative}: HTML image without a quoted src`);
          continue;
        }
        if (/\bclass="bt4k-screenshot"/.test(match[1])) continue;
        const before = source.slice(0, match.index);
        const openFigure = before.lastIndexOf('<figure');
        const closeFigure = before.lastIndexOf('</figure>');
        if (openFigure <= closeFigure) {
          failures.push(`${relative}: HTML image ${imageSource} is outside an approved figure`);
        }
      }
    }
  }

  assert.deepEqual(failures, []);
});

test('the repaired blog diagrams expose localized titles while hero and screenshot visuals stay excluded', async () => {
  const koRuntime = await read('src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx');
  const enRuntime = await read('src/content/docs/blog/bluetape-skills-workflow-runtime-recovery.mdx');
  const koLeader = await read('src/content/docs/ko/blog/bluetape4k-leader-part5-backends-operations-benchmarks.mdx');
  const enLeader = await read('src/content/docs/blog/bluetape4k-leader-part5-backends-operations-benchmarks.mdx');
  const koCio = await read('src/content/docs/ko/blog/when-cio-made-http-benchmarks-weird.mdx');
  const enCio = await read('src/content/docs/blog/when-cio-made-http-benchmarks-weird.mdx');

  assert.match(koRuntime, /class="bt4k-architecture"\s+data-diagram-title="Run과 lane의 상태·복구 모델"/);
  assert.match(enRuntime, /class="bt4k-architecture"\s+data-diagram-title="Run and lane state and recovery model"/);
  assert.match(koLeader, /class="bt4k-architecture"\s+data-diagram-title="리더 선출 백엔드 선택 기준"/);
  assert.match(enLeader, /class="bt4k-architecture"\s+data-diagram-title="Leader election backend selection guide"/);
  assert.match(koLeader, /class="bt4k-chart"\s+data-diagram-title="분산 백엔드 처리량 비교"/);
  assert.match(enLeader, /class="bt4k-chart"\s+data-diagram-title="Distributed backend throughput comparison"/);
  assert.match(koLeader, /class="bt4k-chart"\s+data-diagram-title="분산 백엔드 지연 시간 비교"/);
  assert.match(enLeader, /class="bt4k-chart"\s+data-diagram-title="Distributed backend latency comparison"/);
  assert.match(koCio, /class="bt4k-chart"\s+data-diagram-title="HTTP 클라이언트 기본 처리량 비교"/);
  assert.match(enCio, /class="bt4k-chart"\s+data-diagram-title="HTTP client base throughput comparison"/);
  assert.match(koCio, /class="bt4k-chart"\s+data-diagram-title="지연 환경의 HTTP 클라이언트 처리량 비교"/);
  assert.match(enCio, /class="bt4k-chart"\s+data-diagram-title="HTTP client throughput under latency"/);
});
