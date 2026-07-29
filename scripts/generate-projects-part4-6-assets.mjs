import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = 'public/assets';
mkdirSync(out, { recursive: true });

const locales = ['en', 'ko'];

const colors = {
  blue: ['#132D55', '#68A7FF'],
  teal: ['#123D43', '#4ED7C7'],
  green: ['#173B2A', '#66D58D'],
  amber: ['#443215', '#F6C55F'],
  rose: ['#4B1F32', '#F285A8'],
  purple: ['#2D255C', '#B29DFF'],
  neutral: ['#253245', '#8FA8C4'],
};

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function tspanLines(lines, x, lineHeight) {
  return lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : lineHeight;
      return `<tspan x="${x}" dy="${dy}">${esc(line)}</tspan>`;
    })
    .join('');
}

function localeStyle(locale) {
  const titleFont = locale === 'ko'
    ? '"goorm Sans","Noto Sans KR","Apple SD Gothic Neo",sans-serif'
    : '"Architects Daughter","Comic Sans MS",cursive';
  const bodyFont = locale === 'ko'
    ? '"goorm Sans Code","goorm Sans","D2Coding",monospace'
    : '"Comic Mono","Courier New",monospace';
  const labelFont = locale === 'ko'
    ? '"goorm Sans","Noto Sans KR","Apple SD Gothic Neo",sans-serif'
    : '"Architects Daughter","Comic Sans MS",cursive';

  return `
    .bg{fill:#07111F}.frame{fill:#0D1B2D;stroke:#213B5E;stroke-width:2}
    .title{font-family:${titleFont};font-size:${locale === 'ko' ? 36 : 42}px;fill:#F7FAFF;font-weight:700}
    .subtitle,.body,.small{font-family:${bodyFont};fill:#C9D6E8}
    .subtitle{font-size:${locale === 'ko' ? 16 : 17}px}.body{font-size:${locale === 'ko' ? 15 : 14}px}.small{font-size:12px;fill:#8DA2BC}
    .label{font-family:${labelFont};font-size:${locale === 'ko' ? 20 : 22}px;fill:#F7FAFF;font-weight:700}
    .card{filter:url(#shadow);stroke-width:2}.connector{fill:none;stroke:#78AFFF;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
    .bar-label{font-family:${bodyFont};font-size:15px;fill:#F7FAFF}.axis{stroke:#47627F;stroke-width:2}
  `;
}

function base(width, height, title, subtitle, locale, hasConnectors = true) {
  const marker = hasConnectors
    ? '<marker id="arrow" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse"><path d="M 2 2 L 12 7 L 2 12 Z" fill="#78AFFF"/></marker>'
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
<title>${esc(title)}</title>
<desc>${esc(subtitle)}</desc>
<defs>
  <filter id="shadow" x="-8%" y="-8%" width="116%" height="116%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#020712" flood-opacity="0.45"/></filter>
${marker}
  <style>${localeStyle(locale)}</style>
</defs>
<rect class="bg" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="70" y="82">${esc(title)}</text>
<text class="subtitle" x="72" y="114">${esc(subtitle)}</text>`;
}

function card({ x, y, w, h, tone, title, lines = [] }) {
  const [fill, stroke] = colors[tone];
  const labelY = y + 34;
  const bodyY = y + 68;
  const bodyLines = Array.isArray(lines) ? lines : [lines];
  return `<g data-card="${esc(title)}">
  <rect class="card" x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${fill}" stroke="${stroke}"/>
  <text class="label" x="${x + w / 2}" y="${labelY}" text-anchor="middle">${tspanLines([title], x + w / 2, 24)}</text>
  <text class="body" x="${x + w / 2}" y="${bodyY}" text-anchor="middle">${tspanLines(bodyLines, x + w / 2, 20)}</text>
</g>`;
}

function connector(name, d) {
  return `<path class="connector" data-connector="${name}" d="${d}"/>`;
}

function bar({ x, y, w, label, value, tone }) {
  const [fill, stroke] = colors[tone];
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="34" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
  <text class="bar-label" x="${x + 14}" y="${y + 23}">${esc(label)}</text>
  <text class="bar-label" x="${x + w - 14}" y="${y + 23}" text-anchor="end">${esc(value)}</text>
</g>`;
}

const diagrams = [
  {
    name: 'bluetape4k-projects-overview-01',
    width: 1540,
    height: 760,
    labels: {
      en: {
        title: 'Bluetape4k Projects Overview',
        subtitle: 'The shared foundation keeps common Kotlin/JVM service decisions together.',
        cards: [
          ['BOM', ['version alignment', 'pick modules selectively']],
          ['Foundation', ['core · coroutines · logging', 'I/O · serializers · time']],
          ['Runtime Adapters', ['data · cache · infra', 'Spring Boot · Ktor']],
          ['Applications', ['service code', 'tests and examples']],
          ['Split Repositories', ['AWS · Exposed · Image', 'Text · Leader · JaVers']],
        ],
      },
      ko: {
        title: 'Bluetape4k Projects 개요',
        subtitle: '공통 Kotlin/JVM 서비스 결정을 공유 기반 안에서 정렬합니다.',
        cards: [
          ['BOM', ['버전 정렬', '필요한 모듈만 선택']],
          ['공유 기반', ['core · coroutines · logging', 'I/O · serializer · time']],
          ['런타임 어댑터', ['data · cache · infra', 'Spring Boot · Ktor']],
          ['애플리케이션', ['서비스 코드', '테스트와 예제']],
          ['분리 저장소', ['AWS · Exposed · Image', 'Text · Leader · JaVers']],
        ],
      },
    },
    layout(locale) {
      const l = this.labels[locale];
      const [bom, foundation, adapters, apps, split] = l.cards;
      const cards = [
        { x: 60, y: 315, w: 180, h: 116, tone: 'amber', title: bom[0], lines: bom[1] },
        { x: 300, y: 315, w: 260, h: 116, tone: 'blue', title: foundation[0], lines: foundation[1] },
        { x: 620, y: 315, w: 260, h: 116, tone: 'green', title: adapters[0], lines: adapters[1] },
        { x: 940, y: 315, w: 220, h: 116, tone: 'teal', title: apps[0], lines: apps[1] },
        { x: 1220, y: 315, w: 260, h: 116, tone: 'purple', title: split[0], lines: split[1] },
      ];
      return [
        ...cards.map(card),
        connector('bom-to-foundation', 'M240 373 H300'),
        connector('foundation-to-runtime-adapters', 'M560 373 H620'),
        connector('runtime-adapters-to-applications', 'M880 373 H940'),
        connector('applications-to-split-repositories', 'M1160 373 H1220'),
      ].join('\n');
    },
  },
  {
    name: 'bluetape4k-projects-module-map-01',
    width: 1580,
    height: 840,
    labels: {
      en: {
        title: 'Projects Module Map',
        subtitle: 'Choose a module by the boundary your service actually touches.',
        rows: [
          ['Foundation', 'core · coroutines · logging · bom', 'Kotlin style, execution, dependency alignment'],
          ['I/O and Wire', 'io · okio · csv · protobuf · jackson · http · grpc', 'bytes, serializers, HTTP, RPC'],
          ['Data and Infra', 'jdbc · r2dbc · hibernate · redis · kafka · nats', 'persistence and operational systems'],
          ['Application and Tests', 'spring-boot/* · ktor/* · assertions · junit5', 'service entrypoints and reusable proof'],
        ],
      },
      ko: {
        title: 'Projects 모듈 지도',
        subtitle: '서비스가 실제로 만나는 경계를 기준으로 모듈을 고릅니다.',
        rows: [
          ['공유 기반', 'core · coroutines · logging · bom', 'Kotlin 스타일, 실행 모델, 의존성 정렬'],
          ['I/O와 전송', 'io · okio · csv · protobuf · jackson · http · grpc', 'byte, serializer, HTTP, RPC 경계'],
          ['Data와 Infra', 'jdbc · r2dbc · hibernate · redis · kafka · nats', '영속성과 운영 시스템 경계'],
          ['앱과 테스트', 'spring-boot/* · ktor/* · assertions · junit5', '서비스 진입점과 반복 가능한 검증'],
        ],
      },
    },
    layout(locale) {
      const rows = this.labels[locale].rows;
      const y0 = 185;
      return rows.map((row, index) => {
        const y = y0 + index * 145;
        return [
          card({ x: 80, y, w: 240, h: 98, tone: ['blue', 'teal', 'green', 'purple'][index], title: row[0], lines: [] }),
          card({
            x: 430,
            y,
            w: 470,
            h: 98,
            tone: 'neutral',
            title: locale === 'ko' ? '대표 모듈' : 'Representative modules',
            lines: [row[1]],
          }),
          card({
            x: 1010,
            y,
            w: 430,
            h: 98,
            tone: 'amber',
            title: locale === 'ko' ? '도입 기준' : 'Adoption trigger',
            lines: [row[2]],
          }),
          connector(`module-row-${index + 1}-to-modules`, `M320 ${y + 49} H430`),
          connector(`module-row-${index + 1}-to-trigger`, `M900 ${y + 49} H1010`),
        ].join('\n');
      }).join('\n');
    },
  },
  {
    name: 'bluetape4k-projects-module-chart-01',
    width: 1480,
    height: 760,
    labels: {
      en: {
        title: 'Module Composition Snapshot',
        subtitle: 'The repository is broad, so start with the largest boundary groups first.',
        bars: [
          ['Foundation and test support', 'core · coroutines · logging · junit5', 1040, 'blue'],
          ['I/O, serialization, HTTP, RPC', 'io · okio · csv · protobuf · json · grpc', 930, 'teal'],
          ['Data, cache, and infrastructure', 'jdbc · r2dbc · hibernate · Redis · Kafka', 1110, 'green'],
          ['Application frameworks', 'Spring Boot 4 · Ktor 3 · examples', 760, 'purple'],
          ['Focused utilities', 'IDs · money · measured · workflow · states', 860, 'amber'],
        ],
      },
      ko: {
        title: '모듈 구성 스냅샷',
        subtitle: '넓은 저장소일수록 큰 경계 그룹부터 보고 필요한 영역만 고릅니다.',
        bars: [
          ['공유 기반과 테스트 지원', 'core · coroutines · logging · junit5', 1040, 'blue'],
          ['I/O, 직렬화, HTTP, RPC', 'io · okio · csv · protobuf · json · grpc', 930, 'teal'],
          ['Data, cache, infrastructure', 'jdbc · r2dbc · hibernate · Redis · Kafka', 1110, 'green'],
          ['애플리케이션 프레임워크', 'Spring Boot 4 · Ktor 3 · examples', 760, 'purple'],
          ['전용 유틸리티', 'IDs · money · measured · workflow · states', 860, 'amber'],
        ],
      },
    },
    layout(locale) {
      const bars = this.labels[locale].bars;
      return [
        '<line class="axis" x1="180" y1="620" x2="1280" y2="620"/>',
        ...bars.map(([label, value, width, tone], index) => bar({ x: 190, y: 190 + index * 78, w: width, label, value, tone })),
        `<text class="small" x="190" y="660">${locale === 'ko' ? '값은 정확한 모듈 수가 아니라 README가 보여주는 영역의 상대적 폭입니다.' : 'Values show relative README surface area, not an exact module count.'}</text>`,
      ].join('\n');
    },
  },
  {
    name: 'bluetape4k-projects-part2-flow',
    width: 1540,
    height: 760,
    labels: {
      en: {
        title: 'Core, Coroutines, Logging, Tests',
        subtitle: 'Request code and proof code reuse the same small service foundation.',
        cards: [
          ['Service Code', ['input · request', 'worker']],
          ['Core Validation', ['require* helpers', 'non-null invariants']],
          ['Coroutines', ['Deferred · Flow', 'cancellation policy']],
          ['Logging', ['lazy messages', 'MDC across suspension']],
          ['Tests', ['assertions · junit5', 'Testcontainers fixtures']],
        ],
      },
      ko: {
        title: 'Core, Coroutines, Logging, Tests',
        subtitle: '요청 코드와 검증 코드가 같은 작은 서비스 기반을 공유합니다.',
        cards: [
          ['서비스 코드', ['input · request', 'worker']],
          ['Core 검증', ['require* helper', 'non-null invariant']],
          ['Coroutines', ['Deferred · Flow', 'cancellation policy']],
          ['Logging', ['lazy message', 'suspend 경계의 MDC']],
          ['Tests', ['assertions · junit5', 'Testcontainers fixture']],
        ],
      },
    },
    layout(locale) {
      const [service, core, coroutines, logging, tests] = this.labels[locale].cards;
      const cards = [
        { x: 60, y: 315, w: 220, h: 116, tone: 'blue', title: service[0], lines: service[1] },
        { x: 340, y: 315, w: 250, h: 116, tone: 'green', title: core[0], lines: core[1] },
        { x: 650, y: 315, w: 250, h: 116, tone: 'teal', title: coroutines[0], lines: coroutines[1] },
        { x: 960, y: 315, w: 250, h: 116, tone: 'amber', title: logging[0], lines: logging[1] },
        { x: 1270, y: 315, w: 250, h: 116, tone: 'purple', title: tests[0], lines: tests[1] },
      ];
      return [
        ...cards.map(card),
        connector('service-to-core-validation', 'M280 373 H340'),
        connector('core-validation-to-coroutines', 'M590 373 H650'),
        connector('coroutines-to-logging', 'M900 373 H960'),
        connector('logging-to-tests', 'M1210 373 H1270'),
      ].join('\n');
    },
  },
  {
    name: 'bluetape4k-projects-part3-pipeline',
    width: 1580,
    height: 760,
    labels: {
      en: {
        title: 'The Path Bytes Take',
        subtitle: 'Conversion, transport, storage, and protection rules meet at service boundaries.',
        cards: [
          ['Bytes', ['file · buffer', 'payload']],
          ['I/O Utilities', ['compression · ZIP', 'binary serializer']],
          ['Okio Streams', ['Source · Sink · Buffer', 'NIO and coroutine I/O']],
          ['Serializers', ['JSON · Avro · Protobuf', 'wire compatibility']],
          ['Transport', ['HTTP · gRPC', 'timeouts and clients']],
          ['Storage Boundary', ['cache · column · object']],
          ['Tink', ['encrypt · decrypt', 'keyset boundary']],
        ],
      },
      ko: {
        title: '바이트가 지나가는 경로',
        subtitle: '변환, 전송, 저장, 보호 규칙은 서비스 경계에서 만납니다.',
        cards: [
          ['바이트', ['file · buffer', 'payload']],
          ['I/O 유틸리티', ['compression · ZIP', 'binary serializer']],
          ['Okio Streams', ['Source · Sink · Buffer', 'NIO와 coroutine I/O']],
          ['직렬화기', ['JSON · Avro · Protobuf', 'wire compatibility']],
          ['전송', ['HTTP · gRPC', 'timeout과 client']],
          ['스토리지 경계', ['cache · column · object']],
          ['Tink', ['encrypt · decrypt', 'keyset boundary']],
        ],
      },
    },
    layout(locale) {
      const c = this.labels[locale].cards;
      const positions = [
        [50, 315, 170, 'blue'],
        [270, 315, 200, 'green'],
        [520, 315, 210, 'teal'],
        [780, 315, 220, 'amber'],
        [1050, 315, 190, 'purple'],
        [1290, 315, 190, 'rose'],
        [1290, 500, 190, 'neutral'],
      ];
      const cards = c.map(([title, lines], index) => {
        const [x, y, w, tone] = positions[index];
        return { x, y, w, h: 116, tone, title, lines };
      });
      return [
        ...cards.map(card),
        connector('bytes-to-io-utilities', 'M220 373 H270'),
        connector('io-utilities-to-okio-streams', 'M470 373 H520'),
        connector('okio-streams-to-serializers', 'M730 373 H780'),
        connector('serializers-to-transport', 'M1000 373 H1050'),
        connector('transport-to-storage-boundary', 'M1240 373 H1290'),
        connector('storage-boundary-to-tink', 'M1385 431 V500'),
      ].join('\n');
    },
  },
  {
    name: 'bluetape4k-projects-part4-data-infra-map',
    width: 1580,
    height: 800,
    labels: {
      en: {
        title: 'Data and Infrastructure Map',
        subtitle: 'Choose the adapter by execution model, operational system, and failure boundary.',
        cards: [
          ['Service Code', ['sync · suspend · Flow']],
          ['Data', ['JDBC · R2DBC · Hibernate', 'MongoDB · Cassandra']],
          ['Redis / Cache', ['Lettuce · Redisson', 'local · near · distributed']],
          ['Messaging / Infra', ['Kafka · NATS · Pulsar', 'ES · Bucket4j']],
          ['Coroutine Path', ['await · Flow · adapters']],
          ['Resilience', ['retry · circuit breaker', 'timeout · rate limit']],
          ['Observability', ['Micrometer · OpenTelemetry', 'logs · traces']],
          ['External Systems', ['DB · Redis · broker', 'search · metrics']],
        ],
      },
      ko: {
        title: 'Data와 Infrastructure 지도',
        subtitle: '실행 모델, 운영 시스템, 실패 경계를 기준으로 어댑터를 고릅니다.',
        cards: [
          ['서비스 코드', ['sync · suspend · Flow']],
          ['Data', ['JDBC · R2DBC · Hibernate', 'MongoDB · Cassandra']],
          ['Redis / Cache', ['Lettuce · Redisson', 'local · near · distributed']],
          ['Messaging / Infra', ['Kafka · NATS · Pulsar', 'ES · Bucket4j']],
          ['Coroutine 경로', ['await · Flow · adapter']],
          ['Resilience', ['retry · circuit breaker', 'timeout · rate limit']],
          ['Observability', ['Micrometer · OpenTelemetry', 'log · trace']],
          ['외부 시스템', ['DB · Redis · broker', 'search · metrics']],
        ],
      },
    },
    layout(locale) {
      const c = this.labels[locale].cards;
      const positions = [
        [60, 170, 210, 'blue'],
        [350, 170, 260, 'green'],
        [690, 170, 250, 'teal'],
        [1020, 170, 250, 'green'],
        [60, 335, 210, 'blue'],
        [350, 335, 260, 'rose'],
        [690, 335, 250, 'purple'],
        [1020, 335, 250, 'green'],
        [60, 500, 210, 'blue'],
        [350, 500, 260, 'amber'],
        [690, 500, 250, 'neutral'],
        [1020, 500, 250, 'green'],
      ];
      const rowCards = [c[0], c[1], c[4], c[7], c[0], c[2], c[5], c[7], c[0], c[3], c[6], c[7]];
      const cards = rowCards.map(([title, lines], index) => {
        const [x, y, w, tone] = positions[index];
        return { x, y, w, h: 116, tone, title, lines };
      });
      return [
        ...cards.map(card),
        connector('service-to-data', 'M270 228 H350'),
        connector('data-to-coroutine-path', 'M610 228 H690'),
        connector('coroutine-path-to-external-systems', 'M940 228 H1020'),
        connector('service-to-redis-cache', 'M270 393 H350'),
        connector('redis-cache-to-resilience', 'M610 393 H690'),
        connector('resilience-to-external-systems', 'M940 393 H1020'),
        connector('service-to-messaging-infra', 'M270 558 H350'),
        connector('messaging-infra-to-observability', 'M610 558 H690'),
        connector('observability-to-external-systems', 'M940 558 H1020'),
      ].join('\n');
    },
  },
  {
    name: 'bluetape4k-projects-part5-adoption-map',
    width: 1580,
    height: 800,
    labels: {
      en: {
        title: 'Utilities and Adoption Path',
        subtitle: 'Pick the smallest utility for the job, then validate the same pattern in an example.',
        cards: [
          ['Identity', ['UUID v7 · ULID · KSUID', 'Snowflake · Hashids']],
          ['Domain Math', ['money · measured', 'geo · science']],
          ['Decision Tools', ['rule engine · FSM', 'workflow · probabilistic']],
          ['Minimal Module', ['BOM first', 'one dependency at a time']],
          ['Examples', ['coroutines · redisson', 'virtual threads']],
          ['Workshops', ['cache · Redis · messaging', 'Spring Data patterns']],
          ['Benchmark Notes', ['read before claiming speed', 'rerun on your workload']],
          ['Service Adoption', ['small surface', 'verified behavior']],
        ],
      },
      ko: {
        title: '유틸리티와 도입 경로',
        subtitle: '필요한 유틸리티 하나를 고르고, 예제에서 같은 패턴을 검증합니다.',
        cards: [
          ['식별자', ['UUID v7 · ULID · KSUID', 'Snowflake · Hashids']],
          ['도메인 계산', ['money · measured', 'geo · science']],
          ['의사결정 도구', ['rule engine · FSM', 'workflow · probabilistic']],
          ['최소 모듈', ['BOM 우선', 'dependency는 하나씩']],
          ['예제', ['coroutines · redisson', 'virtual threads']],
          ['Workshop', ['cache · Redis · messaging', 'Spring Data pattern']],
          ['벤치마크 노트', ['속도 주장 전에 읽기', '내 workload에서 재측정']],
          ['서비스 도입', ['작은 표면', '검증된 동작']],
        ],
      },
    },
    layout(locale) {
      const c = this.labels[locale].cards;
      const positions = [
        [60, 170, 250, 'amber'],
        [390, 170, 260, 'blue'],
        [730, 170, 260, 'teal'],
        [1070, 170, 250, 'green'],
        [60, 335, 250, 'green'],
        [390, 335, 260, 'blue'],
        [730, 335, 260, 'rose'],
        [1070, 335, 250, 'green'],
        [60, 500, 250, 'purple'],
        [390, 500, 260, 'blue'],
        [730, 500, 260, 'neutral'],
        [1070, 500, 250, 'green'],
      ];
      const rowCards = [c[0], c[3], c[4], c[7], c[1], c[3], c[5], c[7], c[2], c[3], c[6], c[7]];
      const cards = rowCards.map(([title, lines], index) => {
        const [x, y, w, tone] = positions[index];
        return { x, y, w, h: 116, tone, title, lines };
      });
      return [
        ...cards.map(card),
        connector('identity-to-minimal-module', 'M310 228 H390'),
        connector('minimal-module-to-examples', 'M650 228 H730'),
        connector('examples-to-service-adoption', 'M990 228 H1070'),
        connector('domain-math-to-minimal-module', 'M310 393 H390'),
        connector('minimal-module-to-workshops', 'M650 393 H730'),
        connector('workshops-to-service-adoption', 'M990 393 H1070'),
        connector('decision-tools-to-minimal-module', 'M310 558 H390'),
        connector('minimal-module-to-benchmark-notes', 'M650 558 H730'),
        connector('benchmark-notes-to-service-adoption', 'M990 558 H1070'),
      ].join('\n');
    },
  },
  {
    name: 'bluetape4k-projects-part6-application-layer',
    width: 1580,
    height: 780,
    labels: {
      en: {
        title: 'Spring Boot 4 and Ktor Application Layer',
        subtitle: 'Application modules sit above the shared foundation and keep wiring explicit.',
        cards: [
          ['Shared Foundation', ['BOM · core · coroutines', 'I/O · data · infra · utils']],
          ['Spring Boot 4', ['WebFlux + coroutines', 'Redis · R2DBC · MongoDB', 'Hibernate Lettuce']],
          ['Ktor 3', ['core · observability', 'OpenAPI · resilience4j', 'testing helpers']],
          ['Configuration', ['BOM platform import', 'explicit beans/plugins']],
          ['Tests', ['WebTestClient', 'testApplication', 'Testcontainers']],
          ['Running Service', ['API boundary', 'observed and tested']],
        ],
      },
      ko: {
        title: 'Spring Boot 4와 Ktor 애플리케이션 계층',
        subtitle: '애플리케이션 모듈은 공유 기반 위에서 wiring을 명시적으로 유지합니다.',
        cards: [
          ['공유 기반', ['BOM · core · coroutines', 'I/O · data · infra · utils']],
          ['Spring Boot 4', ['WebFlux + coroutines', 'Redis · R2DBC · MongoDB', 'Hibernate Lettuce']],
          ['Ktor 3', ['core · observability', 'OpenAPI · resilience4j', 'testing helpers']],
          ['설정', ['BOM platform import', '명시적인 bean/plugin']],
          ['테스트', ['WebTestClient', 'testApplication', 'Testcontainers']],
          ['실행 중인 서비스', ['API boundary', '관측하고 검증한 runtime']],
        ],
      },
    },
    layout(locale) {
      const c = this.labels[locale].cards;
      const positions = [
        [60, 210, 260, 'blue'],
        [420, 210, 300, 'green'],
        [820, 210, 300, 'teal'],
        [1220, 210, 250, 'amber'],
        [60, 470, 260, 'blue'],
        [420, 470, 300, 'purple'],
        [820, 470, 300, 'rose'],
        [1220, 470, 250, 'amber'],
      ];
      const rowCards = [c[0], c[1], c[3], c[5], c[0], c[2], c[4], c[5]];
      const cards = rowCards.map(([title, lines], index) => {
        const [x, y, w, tone] = positions[index];
        return { x, y, w, h: 126, tone, title, lines };
      });
      return [
        ...cards.map(card),
        connector('foundation-to-spring-boot-4', 'M320 273 H420'),
        connector('spring-boot-4-to-configuration', 'M720 273 H820'),
        connector('configuration-to-running-service', 'M1120 273 H1220'),
        connector('foundation-to-ktor-3', 'M320 533 H420'),
        connector('ktor-3-to-tests', 'M720 533 H820'),
        connector('tests-to-running-service', 'M1120 533 H1220'),
      ].join('\n');
    },
  },
];

function renderDiagram(diagram, locale) {
  const labels = diagram.labels[locale];
  const hasConnectors = diagram.name !== 'bluetape4k-projects-module-chart-01';
  return `${base(diagram.width, diagram.height, labels.title, labels.subtitle, locale, hasConnectors)}
${diagram.layout(locale)}
</svg>`;
}

function renderPng(svgPath, pngPath) {
  execFileSync('cairosvg', [svgPath, '-o', pngPath, '-s', '2']);
}

for (const diagram of diagrams) {
  for (const locale of locales) {
    const svgPath = join(out, `${diagram.name}-${locale}.svg`);
    const pngPath = join(out, `${diagram.name}-${locale}.png`);
    writeFileSync(svgPath, renderDiagram(diagram, locale));
    execFileSync('xmllint', ['--noout', svgPath]);
    renderPng(svgPath, pngPath);
  }

  for (const extension of ['svg', 'png', 'dot', 'plain']) {
    rmSync(join(out, `${diagram.name}.${extension}`), { force: true });
  }
  for (const suffix of ['sketch.svg', 'sketch.png', 'graphviz-summary.txt']) {
    rmSync(join(out, `${diagram.name}-${suffix}`), { force: true });
  }
}
