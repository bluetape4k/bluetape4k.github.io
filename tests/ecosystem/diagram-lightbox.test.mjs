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

test('dependencies input and BOM articles expose localized diagram titles', async () => {
  const pairs = [
    [
      'src/content/docs/ko/blog/bluetape4k-dependencies-1-3-0-input-boundaries.mdx',
      '입력 경계와 자원 제한',
    ],
    [
      'src/content/docs/blog/bluetape4k-dependencies-1-3-0-input-boundaries.mdx',
      'Input Boundaries and Resource Limits',
    ],
    [
      'src/content/docs/ko/blog/bluetape4k-dependencies-making-part1-why-bom.mdx',
      '중앙 BOM의 호환 버전 조합',
    ],
    [
      'src/content/docs/blog/bluetape4k-dependencies-making-part1-why-bom.mdx',
      'Compatible Version Set Published by the Central BOM',
    ],
    [
      'src/content/docs/ko/blog/bluetape4k-dependencies-making-part2-public-bom.mdx',
      '내부 빌드 계약과 공개 BOM 계약',
    ],
    [
      'src/content/docs/blog/bluetape4k-dependencies-making-part2-public-bom.mdx',
      'Internal Build Contract and Public BOM Contract',
    ],
  ];

  for (const [path, title] of pairs) {
    const source = await read(path);
    assert.match(source, new RegExp(`data-diagram-title="${title}"`));
    assert.doesNotMatch(source, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
  }
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

test('the image and CSV benchmark posts expose localized chart titles without making Heroes zoomable', async () => {
  const koImage = await read('src/content/docs/ko/blog/from-pure-jvm-to-libvips-benchmarking-image-processing.mdx');
  const enImage = await read('src/content/docs/blog/from-pure-jvm-to-libvips-benchmarking-image-processing.mdx');
  const koCsv = await read('src/content/docs/ko/blog/reducing-csv-parser-allocations-with-okio.mdx');
  const enCsv = await read('src/content/docs/blog/reducing-csv-parser-allocations-with-okio.mdx');

  assert.match(
    koImage,
    /class="bt4k-chart"\s+data-diagram-title="자연 사진 처리에서 scrimage와 libvips의 처리 시간 비교"/,
  );
  assert.match(
    enImage,
    /class="bt4k-chart"\s+data-diagram-title="Natural-photo processing time comparison: scrimage and libvips"/,
  );
  assert.match(
    koCsv,
    /class="bt4k-chart"\s+data-diagram-title="CSV 파서의 기존 경로와 Okio 고속 경로 처리량 비교"/,
  );
  assert.match(
    enCsv,
    /class="bt4k-chart"\s+data-diagram-title="CSV parser throughput: existing path and Okio fast path"/,
  );

  for (const source of [koImage, enImage, koCsv, enCsv]) {
    assert.doesNotMatch(source, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
  }
});

test('the ecosystem overview provides localized diagram titles without making the Hero zoomable', async () => {
  const ko = await read('src/content/docs/ko/blog/introduction-bluetape4k-part1-ecosystem.mdx');
  const en = await read('src/content/docs/blog/introduction-bluetape4k-part1-ecosystem.mdx');

  assert.match(
    ko,
    /class="bt4k-architecture"\s+data-diagram-title="Bluetape4k 생태계의 계층과 선택 경계"/,
  );
  assert.match(
    en,
    /class="bt4k-architecture"\s+data-diagram-title="Bluetape4k ecosystem layers and selection boundaries"/,
  );
  assert.doesNotMatch(ko, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
  assert.doesNotMatch(en, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
});

test('the Graph series provides localized titles for every technical figure', async () => {
  const posts = [
    [
      await read('src/content/docs/ko/blog/bluetape4k-graph-part1-overview-database-selection.mdx'),
      ['그래프 데이터베이스 선택 기준', 'bluetape4k-graph 모듈 구성'],
    ],
    [
      await read('src/content/docs/blog/bluetape4k-graph-part1-overview-database-selection.mdx'),
      ['Graph database selection criteria', 'bluetape4k-graph module structure'],
    ],
    [
      await read('src/content/docs/ko/blog/bluetape4k-graph-part2-core-api-schema-execution.mdx'),
      ['그래프 핵심 API의 실행 경계', '그래프 트랜잭션과 일괄 쓰기 순서', '그래프 API 실행 모델 벤치마크'],
    ],
    [
      await read('src/content/docs/blog/bluetape4k-graph-part2-core-api-schema-execution.mdx'),
      ['Graph core API execution boundaries', 'Graph transaction and batch-write sequence', 'Graph API execution-model benchmark'],
    ],
    [
      await read('src/content/docs/ko/blog/bluetape4k-graph-part3-graph-io-benchmarks.mdx'),
      ['그래프 입출력 파이프라인', '그래프 입출력 동기 실행 평균 지연 시간'],
    ],
    [
      await read('src/content/docs/blog/bluetape4k-graph-part3-graph-io-benchmarks.mdx'),
      ['Graph I/O pipeline', 'Mean graph I/O latency for synchronous execution'],
    ],
    [
      await read('src/content/docs/ko/blog/bluetape4k-graph-part4-workshop-service-integration.mdx'),
      ['어뷰저 탐지 식별자 흐름', '어뷰저 탐지 엔터티 그래프', '추천 후보 생성 흐름', '추천 엔터티 그래프', '지식 그래프 엔터티 관계', '소셜 네트워크 엔터티 관계'],
    ],
    [
      await read('src/content/docs/blog/bluetape4k-graph-part4-workshop-service-integration.mdx'),
      ['Abuser Detection Identity Flow', 'Abuser Detection Entity Graph', 'Recommendation Candidate Flow', 'Recommendation Entity Graph', 'Knowledge Graph Entity Relationships', 'Social Network Entity Relationships'],
    ],
    [
      await read('src/content/docs/ko/blog/bluetape4k-graph-part5-virtual-threads-benchmark.mdx'),
      ['동기와 가상 스레드 실행 경로', 'TinkerGraph 동기·가상 스레드 지연 시간'],
    ],
    [
      await read('src/content/docs/blog/bluetape4k-graph-part5-virtual-threads-benchmark.mdx'),
      ['Synchronous and Virtual Thread Call Paths', 'TinkerGraph Synchronous and Virtual Threads Latency'],
    ],
  ];

  for (const [source, titles] of posts) {
    for (const title of titles) {
      assert.match(source, new RegExp(`data-diagram-title="${title}"`));
    }
    assert.doesNotMatch(source, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
  }
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
  const koWorkflowGuide = await read('src/content/docs/ko/blog/bluetape-skills-workflow-guide.mdx');
  const enWorkflowGuide = await read('src/content/docs/blog/bluetape-skills-workflow-guide.mdx');
  const koRuntime = await read('src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx');
  const enRuntime = await read('src/content/docs/blog/bluetape-skills-workflow-runtime-recovery.mdx');
  const koLeader = await read('src/content/docs/ko/blog/bluetape4k-leader-part5-backends-operations-benchmarks.mdx');
  const enLeader = await read('src/content/docs/blog/bluetape4k-leader-part5-backends-operations-benchmarks.mdx');
  const koCio = await read('src/content/docs/ko/blog/when-cio-made-http-benchmarks-weird.mdx');
  const enCio = await read('src/content/docs/blog/when-cio-made-http-benchmarks-weird.mdx');
  const koCsvWriter = await read('src/content/docs/ko/blog/csv-writer-okio-buffered-sink.mdx');
  const enCsvWriter = await read('src/content/docs/blog/csv-writer-okio-buffered-sink.mdx');
  const koBugFixes = await read('src/content/docs/ko/blog/embarrassing-bugs-that-made-better-guards.mdx');
  const enBugFixes = await read('src/content/docs/blog/embarrassing-bugs-that-made-better-guards.mdx');
  const koIds = await read('src/content/docs/ko/blog/id-generators-go-kotlin-performance-comparison.mdx');
  const enIds = await read('src/content/docs/blog/id-generators-go-kotlin-performance-comparison.mdx');
  const koDependencies = await read('src/content/docs/ko/blog/bluetape4k-dependencies-1-3-0-library-stories.mdx');
  const enDependencies = await read('src/content/docs/blog/bluetape4k-dependencies-1-3-0-library-stories.mdx');
  const koDependenciesUsage = await read('src/content/docs/ko/blog/bluetape4k-dependencies-usage-guide.mdx');
  const enDependenciesUsage = await read('src/content/docs/blog/bluetape4k-dependencies-usage-guide.mdx');
  const koDependenciesComposition = await read('src/content/docs/ko/blog/bluetape4k-dependencies-1-3-0-service-composition.mdx');
  const enDependenciesComposition = await read('src/content/docs/blog/bluetape4k-dependencies-1-3-0-service-composition.mdx');
  const koDependenciesSignals = await read('src/content/docs/ko/blog/bluetape4k-dependencies-1-3-0-production-signals.mdx');
  const enDependenciesSignals = await read('src/content/docs/blog/bluetape4k-dependencies-1-3-0-production-signals.mdx');
  const koReleaseTrain = await read('src/content/docs/ko/blog/bluetape4k-dependencies-making-part3-release-train.mdx');
  const enReleaseTrain = await read('src/content/docs/blog/bluetape4k-dependencies-making-part3-release-train.mdx');
  const koKtorTenant = await read('src/content/docs/ko/blog/exposed-r2dbc-ktor-multitenant-routing-patterns.mdx');
  const enKtorTenant = await read('src/content/docs/blog/exposed-r2dbc-ktor-multitenant-routing-patterns.mdx');
  const koBatchBenchmark = await read('src/content/docs/ko/blog/exposed-batch-kotlinx-benchmark-methodology.mdx');
  const enBatchBenchmark = await read('src/content/docs/blog/exposed-batch-kotlinx-benchmark-methodology.mdx');

  for (const [source, titles] of [
    [koWorkflowGuide, ['Bluetape 작업 유형 분류', '7단계 검토의 수렴 과정', '일곱 작업 유형의 실행 경로']],
    [enWorkflowGuide, ['Bluetape workflow type router', 'Seven-tier review convergence', 'Seven workflow execution paths']],
  ]) {
    for (const title of titles) {
      assert.match(source, new RegExp(`class="bt4k-architecture"\\s+data-diagram-title="${title}"`));
    }
  }
  assert.match(koRuntime, /class="bt4k-architecture"\s+data-diagram-title="전체 작업과 실행 단위의 상태·복구 모델"/);
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
  assert.match(koCsvWriter, /class="bt4k-chart"\s+data-diagram-title="CSV writer 처리량 비교"/);
  assert.match(enCsvWriter, /class="bt4k-chart"\s+data-diagram-title="CSV writer throughput comparison"/);
  assert.match(koBugFixes, /class="bt4k-architecture"\s+data-diagram-title="부끄러운 버그 수정의 반복 구조"/);
  assert.match(enBugFixes, /class="bt4k-architecture"\s+data-diagram-title="The loop behind embarrassing bug fixes"/);
  for (const [source, titles] of [
    [koIds, ['전역 고유 ID 생성기 1차 벤치마크', '전역 고유 ID 생성기 2차 벤치마크', '전역 고유 ID 생성기 3차 벤치마크']],
    [enIds, ['Global Unique ID Generator Benchmark · Phase 1', 'Global Unique ID Generator Benchmark · Phase 2', 'Global Unique ID Generator Benchmark · Phase 3']],
    [koDependencies, ['bluetape4k-dependencies 1.3.0이 정렬한 라이브러리 경계']],
    [enDependencies, ['Library Boundaries Aligned by bluetape4k-dependencies 1.3.0']],
    [koDependenciesUsage, ['BOM을 기준으로 관리하는 버전 경계']],
    [enDependenciesUsage, ['Version Boundaries Governed by the BOM']],
    [koDependenciesComposition, ['서비스 경계가 모듈 조합을 결정한다']],
    [enDependenciesComposition, ['Service Boundaries Determine Module Composition']],
    [koDependenciesSignals, ['운영 신호에서 진단 결정까지']],
    [enDependenciesSignals, ['From Operational Signals to Diagnostic Decisions']],
    [koReleaseTrain, ['Maven Central 릴리스 트레인의 검증 순서']],
    [enReleaseTrain, ['Verification order for a Maven Central release train']],
    [koKtorTenant, ['Ktor 요청에서 테넌트 스키마를 선택하는 순서', '실행 환경에 따른 테넌트 상태 전달 방식 비교']],
    [enKtorTenant, ['Tenant schema selection across a Ktor request', 'Tenant state carriers by runtime model']],
    [koBatchBenchmark, ['배치 벤치마크 결과의 생성 경로', '데이터베이스별 시드 적재 작업 처리량', 'PostgreSQL 전체 배치 작업의 파티션별 처리량']],
    [enBatchBenchmark, ['Batch benchmark report generation path', 'Seed job throughput by database', 'PostgreSQL end-to-end job throughput by partition count']],
  ]) {
    for (const title of titles) {
      assert.match(source, new RegExp(`data-diagram-title="${title}"`));
    }
  }

  for (const source of [
    koRuntime,
    enRuntime,
    koLeader,
    enLeader,
    koCio,
    enCio,
    koCsvWriter,
    enCsvWriter,
    koBugFixes,
    enBugFixes,
    koIds,
    enIds,
    koDependencies,
    enDependencies,
    koDependenciesUsage,
    enDependenciesUsage,
    koDependenciesComposition,
    enDependenciesComposition,
    koDependenciesSignals,
    enDependenciesSignals,
    koReleaseTrain,
    enReleaseTrain,
    koKtorTenant,
    enKtorTenant,
    koBatchBenchmark,
    enBatchBenchmark,
  ]) {
    assert.doesNotMatch(source, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
  }
});

test('release, multitenancy, and benchmark articles preserve their reader-facing boundaries', async () => {
  const release = await read('src/content/docs/ko/blog/bluetape4k-dependencies-making-part3-release-train.mdx');
  const tenant = await read('src/content/docs/ko/blog/exposed-r2dbc-ktor-multitenant-routing-patterns.mdx');
  const benchmark = await read('src/content/docs/ko/blog/exposed-batch-kotlinx-benchmark-methodology.mdx');

  assert.match(release, /스냅샷 403만 제한적으로 재시도하고 테스트 실패, 404, 바이너리 비호환은 즉시 실패 처리한다/);
  assert.match(tenant, /입력 검증과 권한 검증을 혼동하면 안 됩니다/);
  assert.match(tenant, /인증 주체와\s+테넌트의 관계를 권한 계층에서 별도로 확인/);
  assert.match(benchmark, /`ops\/sec`는 행 처리량이 아니라\s+`dataSize`만큼의 행을 처리하는 배치 작업 전체를 초당 몇 회 완료했는지/);
  assert.match(benchmark, /`avg ms`는 배치 작업 1회의 평균 시간/);
});

test('Jackson and text-processing articles expose localized diagram titles and preserve input boundaries', async () => {
  const pairs = [
    [
      await read('src/content/docs/ko/blog/spring-boot4-jackson3-workshop-migration.mdx'),
      'Spring Boot 4 예제의 Jackson 3 호환성 경계',
    ],
    [
      await read('src/content/docs/blog/spring-boot4-jackson3-workshop-migration.mdx'),
      'Jackson 3 compatibility boundaries for Spring Boot 4 examples',
    ],
    [
      await read('src/content/docs/ko/blog/bluetape4k-text-part1-overview-quality.mdx'),
      '서비스 텍스트 처리 경계와 품질 검증 흐름',
    ],
    [
      await read('src/content/docs/blog/bluetape4k-text-part1-overview-quality.mdx'),
      'Service text-processing boundaries and quality evidence',
    ],
    [
      await read('src/content/docs/ko/blog/bluetape4k-text-part2-tokenizers-lingua.mdx'),
      '다국어 텍스트 입력의 검증과 처리 경계',
    ],
    [
      await read('src/content/docs/blog/bluetape4k-text-part2-tokenizers-lingua.mdx'),
      'Validation and Processing Boundaries for Multilingual Text',
    ],
  ];

  for (const [source, title] of pairs) {
    assert.match(source, new RegExp(`data-diagram-title="${title}"`));
    assert.doesNotMatch(source, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
  }

  assert.match(pairs[0][0], /`spring\.jackson\.use-jackson2-defaults=true`는 Jackson 2를 활성화하는 설정이 아닙니다/);
  assert.match(pairs[2][0], /이미 메모리에 만들어진 `String`을 대상으로 합니다/);
  assert.match(pairs[4][0], /전송 계층에서 먼저 검사해야 합니다/);
  assert.match(pairs[4][0], /라이브러리 API가 아니라 애플리케이션이 소유하는 의사코드/);
});

test('text-search, dictionary, and outbox articles expose localized diagrams and precise recovery boundaries', async () => {
  const pairs = [
    [
      await read('src/content/docs/ko/blog/bluetape4k-text-part3-aho-corasick-workshop.mdx'),
      ['Aho-Corasick 자동 장치의 준비와 요청 처리 경계'],
    ],
    [
      await read('src/content/docs/blog/bluetape4k-text-part3-aho-corasick-workshop.mdx'),
      ['Aho-Corasick preparation and request-processing boundaries'],
    ],
    [
      await read('src/content/docs/ko/blog/bluetape4k-text-part4-dictionary-quality-gates.mdx'),
      ['사전 변경의 품질 게이트'],
    ],
    [
      await read('src/content/docs/blog/bluetape4k-text-part4-dictionary-quality-gates.mdx'),
      ['Dictionary update quality gate'],
    ],
    [
      await read('src/content/docs/ko/blog/transactional-outbox-idempotency-spring-ktor.mdx'),
      ['트랜잭셔널 아웃박스와 멱등성의 실패 경계', '첫 요청·동일 키 재시도·릴레이 재시도 순서'],
    ],
    [
      await read('src/content/docs/blog/transactional-outbox-idempotency-spring-ktor.mdx'),
      ['Transactional outbox and idempotency failure boundaries', 'First call, same-key retry, and relay retry sequence'],
    ],
  ];

  for (const [source, titles] of pairs) {
    for (const title of titles) {
      assert.match(source, new RegExp(`data-diagram-title="${title}"`));
    }
    assert.doesNotMatch(source, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
  }

  assert.match(pairs[0][0], /Flow 반환형만 보고 항상 첫 항목에서 검색 비용이 끝난다고 가정해서는 안 됩니다/);
  assert.match(pairs[2][0], /런타임에 추가한 단어는 해당 프로세스의 메모리 상태입니다/);
  assert.match(pairs[4][0], /고유 인덱스가 최종 쓰기 경계를\s+보호하고/);
  assert.match(pairs[4][0], /개별 클라이언트가 실제로 수신했다는 보장은 별도의 확인·오프셋 정책/);
});

test('Kafka-first, coroutine observability, and Flow articles expose localized diagrams and implementation-accurate boundaries', async () => {
  const pairs = [
    [
      await read('src/content/docs/ko/blog/transactional-outbox-kafka-first-fallback-part2.mdx'),
      ['Kafka 우선 발행과 영속 대체 경로', 'Kafka 우선 발행의 성공·실패 시퀀스'],
    ],
    [
      await read('src/content/docs/blog/transactional-outbox-kafka-first-fallback-part2.mdx'),
      ['Kafka-first publication and durable fallback', 'Kafka-first success and fallback sequence'],
    ],
    [
      await read('src/content/docs/ko/blog/coroutine-observability-micrometer-readiness.mdx'),
      ['코루틴 업무 경로와 관찰 경로', '준비 상태 점검의 성공·실패 시퀀스'],
    ],
    [
      await read('src/content/docs/blog/coroutine-observability-micrometer-readiness.mdx'),
      ['Coroutine work path and observation path', 'Readiness probe contract'],
    ],
    [
      await read('src/content/docs/ko/blog/bluetape4k-flow-extensions-workshop.mdx'),
      ['검색 입력에서 최신 요청까지', '경쟁·순차 대체·부분 병합 정책', '독립 작업의 병렬 보강'],
    ],
    [
      await read('src/content/docs/blog/bluetape4k-flow-extensions-workshop.mdx'),
      ['Search input to latest request', 'Race, ordered fallback, and partial merge', 'Parallel enrichment of independent work'],
    ],
  ];

  for (const [source, titles] of pairs) {
    for (const title of titles) {
      assert.match(source, new RegExp(`data-diagram-title="${title}"`));
    }
    assert.doesNotMatch(source, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
  }

  assert.match(pairs[0][0], /이벤트 직접 발행 실패와 대체 행 저장 사이에 유실 공백/);
  assert.match(pairs[2][0], /`ThreadLocal`에만 의존하면 span 트리의 부모·자식 관계가 끊길 수 있습니다/);
  assert.match(pairs[4][0], /`bufferingDebounce`는 연속 입력을 `List<String>`으로 묶습니다/);
  assert.match(pairs[5][0], /`bufferingDebounce` emits each burst as a `List<String>`/);
});
