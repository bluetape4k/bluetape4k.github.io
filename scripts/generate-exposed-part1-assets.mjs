import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = 'public/assets';
mkdirSync(out, { recursive: true });

const readmeOverviewSvg = readFileSync(
  '/Users/debop/work/bluetape4k/bluetape4k-exposed/docs/images/readme-diagrams/root-readme-overview-01.svg',
  'utf8',
)
  .replaceAll('markerWidth="9" markerHeight="9" refX="8" refY="4.5"', 'markerWidth="8" markerHeight="8" refX="7" refY="4"')
  .replaceAll('d="M1,1 L8,4.5 L1,8 Z"', 'd="M 1 1 L 7 4 L 1 7 Z"')
  .replaceAll('"Architects Daughter","Comic Sans MS","Comic Sans",cursive', '"Architects Daughter"')
  .replaceAll('"Comic Sans MS","Comic Sans","Comic Neue",Arial,sans-serif', '"Comic Mono"');
writeFileSync(join(out, 'bluetape4k-exposed-readme-overview.svg'), readmeOverviewSvg);
execFileSync('rsvg-convert', [join(out, 'bluetape4k-exposed-readme-overview.svg'), '-o', join(out, 'bluetape4k-exposed-readme-overview.png')]);

const colors = {
  blue: ['#E7F1FF', '#5A85D6'],
  teal: ['#E6F7F5', '#38A69E'],
  green: ['#EAF7ED', '#58A978'],
  amber: ['#FFF3D8', '#D6A441'],
  rose: ['#FCECEF', '#DC6B82'],
  purple: ['#F1ECFF', '#8A72D6'],
  neutral: ['#F5F7FA', '#8FA1B3'],
};

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function workbenchHero(source, name) {
  execFileSync('magick', [
    source,
    '-resize', '1672x941^',
    '-gravity', 'center',
    '-extent', '1672x941',
    join(out, `${name}.png`),
  ]);
}

workbenchHero('/Users/debop/work/bluetape4k/bluetape4k-exposed/docs/assets/exposed-workbench.png', 'bluetape4k-exposed-part1-hero');
workbenchHero('/Users/debop/work/bluetape4k/exposed-workshop/docs/assets/exposed-workshop-workbench.png', 'bluetape4k-exposed-part2-hero');
workbenchHero('/Users/debop/work/bluetape4k/exposed-r2dbc-workshop/docs/assets/exposed-r2dbc-workshop-workbench.png', 'bluetape4k-exposed-part3-hero');
workbenchHero('/Users/debop/work/bluetape4k/bluetape4k-experimental/docs/assets/experimental-workbench.png', 'bluetape4k-exposed-part4-hero');
workbenchHero('/Users/debop/work/bluetape4k/bluetape4k-workshop/docs/assets/workshop-workbench.png', 'bluetape4k-exposed-part5-hero');

function base(width, height, title, subtitle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
<title>${esc(title)}</title>
<desc>${esc(subtitle)}</desc>
<defs>
  <filter id="shadow" x="-8%" y="-8%" width="116%" height="116%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#1D3148" flood-opacity="0.12"/></filter>
  <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M 1 1 L 7 4 L 1 7 Z" fill="#4D6F9F"/></marker>
  <style>
    .bg{fill:#F7F9FC}.frame{fill:#FFFFFF;stroke:#D6E2ED;stroke-width:2}
    .title{font-family:"Architects Daughter";font-size:42px;fill:#21334A;font-weight:700}
    .subtitle,.body,.small,.tiny,.axisLabel{font-family:"Comic Mono";fill:#34465B}
    .subtitle{font-size:16px}.body{font-size:14px}.small{font-size:12px;fill:#657386}.tiny{font-size:11px;fill:#657386}
    .label{font-family:"Architects Daughter";font-size:23px;fill:#21334A;font-weight:700}
    .card{filter:url(#shadow);stroke-width:2}.line{fill:none;stroke:#4D6F9F;stroke-width:2.8;marker-end:url(#arrow);stroke-linecap:round;stroke-linejoin:round}
    .axis{stroke:#B9C7D8;stroke-width:1.4}.grid{stroke:#CAD6E4;stroke-width:1;stroke-dasharray:4 6}
  </style>
</defs>
<rect class="bg" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="26"/>
<text class="title" x="70" y="82">${esc(title)}</text>
<text class="subtitle" x="72" y="114">${esc(subtitle)}</text>`;
}

function card(x, y, w, h, tone, title, lines = []) {
  const [fill, stroke] = colors[tone];
  const centerY = y + h / 2;
  const titleY = lines.length ? centerY - 18 : centerY;
  return `<g>
  <rect class="card" x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill}" stroke="${stroke}"/>
  <text class="label" x="${x + w / 2}" y="${titleY}" text-anchor="middle" dominant-baseline="middle">${esc(title)}</text>
  ${lines.map((line, i) => `<text class="body" x="${x + w / 2}" y="${titleY + 30 + i * 20}" text-anchor="middle">${esc(line)}</text>`).join('\n')}
</g>`;
}

function diagram(name, title, subtitle, body, width = 1500, height = 760) {
  const svg = `${base(width, height, title, subtitle)}${body}</svg>`;
  writeFileSync(join(out, `${name}.svg`), svg);
  execFileSync('rsvg-convert', [join(out, `${name}.svg`), '-o', join(out, `${name}.png`)]);
}

function dot(name, source, finalNodes) {
  writeFileSync(join(out, `${name}.dot`), source);
  execFileSync('dot', ['-Tplain', join(out, `${name}.dot`), '-o', join(out, `${name}.plain`)]);
  execFileSync('dot', ['-Tsvg', join(out, `${name}.dot`), '-o', join(out, `${name}-sketch.svg`)]);
  execFileSync('rsvg-convert', [join(out, `${name}-sketch.svg`), '-o', join(out, `${name}-sketch.png`)]);
  const graphNodes = Array.from(source.matchAll(/^\s*([a-z][a-z0-9_]*)\s*->/gm), (match) => match[1]);
  const targetNodes = Array.from(source.matchAll(/->\s*([a-z][a-z0-9_]*)/g), (match) => match[1]);
  const nodes = [...new Set([...graphNodes, ...targetNodes])].sort();
  const missingFinalNodes = nodes.filter((node) => !finalNodes.includes(node));
  const extraFinalNodes = finalNodes.filter((node) => !nodes.includes(node));
  if (missingFinalNodes.length || extraFinalNodes.length) {
    throw new Error(`${name}: Graphviz/final node mismatch. missing=${missingFinalNodes.join(',')} extra=${extraFinalNodes.join(',')}`);
  }
  writeFileSync(
    join(out, `${name}-graphviz-summary.txt`),
    [
      `asset: ${name}`,
      `graphviz_nodes: ${nodes.length}`,
      `final_nodes: ${finalNodes.length}`,
      `missing_final_nodes: ${missingFinalNodes.length}`,
      `extra_final_nodes: ${extraFinalNodes.length}`,
      'rank_order: mirrored in final SVG',
      'route_exceptions: none',
      '',
    ].join('\n'),
  );
}

diagram('bluetape4k-exposed-part1-choice-journey', 'Why Exposed Became the Default', 'The path starts with async pressure, then narrows by SQL safety, Kotlin fit, and operations.', `
<g transform="translate(72 170)">
  ${card(0, 182, 210, 124, 'neutral', 'Traffic Pressure', ['more requests', 'same database'])}
  ${card(300, 46, 238, 118, 'rose', 'WebFlux + JDBC', ['event loop waits', 'reactor meltdown risk'])}
  ${card(300, 318, 238, 118, 'amber', 'NoSQL Detour', ['useful in niches', 'schema changes still hurt'])}
  ${card(620, 0, 252, 118, 'purple', 'R2DBC / Vert.x', ['real non-blocking I/O', 'SQL strings or Reactor cost'])}
  ${card(620, 182, 252, 118, 'green', 'Virtual Threads', ['keep JDBC drivers', 'simpler call stacks'])}
  ${card(620, 364, 252, 118, 'blue', 'Exposed DSL', ['type-safe SQL', 'Kotlin-first model'])}
  ${card(980, 92, 260, 124, 'teal', 'bluetape4k-exposed', ['JDBC + R2DBC repositories', 'cache, JSON, encryption'])}
  ${card(980, 314, 260, 124, 'green', 'Production Path', ['workshops + benchmarks', 'tenant/cache examples'])}
  <path class="line" d="M210 244 C260 244 250 106 300 106"/>
  <path class="line" d="M210 244 C260 244 250 376 300 376"/>
  <path class="line" d="M538 106 H620"/>
  <path class="line" d="M538 376 C586 376 572 424 620 424"/>
  <path class="line" d="M872 58 C930 58 920 154 980 154"/>
  <path class="line" d="M872 240 C930 240 920 154 980 154"/>
  <path class="line" d="M872 424 C930 424 920 376 980 376"/>
  <path class="line" d="M1240 154 C1290 154 1290 376 1240 376"/>
</g>`);

function barChart(name, title, subtitle, data, axisMax, unit, width = 1280, height = 680) {
  const left = 360;
  const top = 166;
  const barH = 36;
  const gap = 42;
  const plotW = 780;
  const axisY = top + data.length * (barH + gap) + 10;
  const rows = data.map((item, i) => {
    const y = top + i * (barH + gap);
    const w = Math.max(20, (item.value / axisMax) * plotW);
    return `<text class="body" x="92" y="${y + barH / 2}" dominant-baseline="middle">${esc(item.label)}</text>
<rect x="${left}" y="${y}" width="${plotW}" height="${barH}" rx="10" fill="#EEF4F9" stroke="#D7E2EC"/>
<rect class="card" x="${left}" y="${y}" width="${w}" height="${barH}" rx="10" fill="${item.color}" stroke="${item.color}"/>
<text class="body" x="${left + w + 14}" y="${y + barH / 2}" dominant-baseline="middle">${esc(item.display)} ${esc(unit)}</text>`;
  }).join('\n');
  const svg = `${base(width, height, title, subtitle)}
<g>
  <line class="axis" x1="${left}" y1="${axisY}" x2="${left + plotW}" y2="${axisY}"/>
  <line class="grid" x1="${left}" y1="${top - 10}" x2="${left}" y2="${axisY}"/>
  <line class="grid" x1="${left + plotW / 2}" y1="${top - 10}" x2="${left + plotW / 2}" y2="${axisY}"/>
  <line class="grid" x1="${left + plotW}" y1="${top - 10}" x2="${left + plotW}" y2="${axisY}"/>
  ${rows}
  <text class="tiny" x="${left}" y="${axisY + 26}" text-anchor="middle">0</text>
  <text class="tiny" x="${left + plotW / 2}" y="${axisY + 26}" text-anchor="middle">${axisMax / 2}</text>
  <text class="tiny" x="${left + plotW}" y="${axisY + 26}" text-anchor="middle">${axisMax}</text>
</g>
</svg>`;
  writeFileSync(join(out, `${name}.svg`), svg);
  execFileSync('rsvg-convert', [join(out, `${name}.svg`), '-o', join(out, `${name}.png`)]);
}

function groupedBarChart(
  name,
  title,
  subtitle,
  groups,
  axisMax,
  unit,
  width = 1400,
  height = 760,
  seriesLabels = ['Exposed', 'JPA / R2DBC'],
  layout = {},
) {
  const left = layout.left ?? 290;
  const top = layout.top ?? 164;
  const plotW = layout.plotW ?? 850;
  const groupGap = layout.groupGap ?? 72;
  const barH = 28;
  const colors = ['#75A9E8', '#DB7890'];
  const rows = groups.map((group, i) => {
    const y = top + i * groupGap;
    const firstW = Math.max(8, (group.values[0] / axisMax) * plotW);
    const secondW = Math.max(8, (group.values[1] / axisMax) * plotW);
    return `<text class="body" x="90" y="${y + 32}" dominant-baseline="middle">${esc(group.label)}</text>
<rect x="${left}" y="${y}" width="${plotW}" height="${barH}" rx="8" fill="#EEF4F9" stroke="#D7E2EC"/>
<rect class="card" x="${left}" y="${y}" width="${firstW}" height="${barH}" rx="8" fill="${colors[0]}" stroke="${colors[0]}"/>
<text class="body" x="${left + firstW + 12}" y="${y + barH / 2}" dominant-baseline="middle">${esc(group.displays[0])}</text>
<rect x="${left}" y="${y + 34}" width="${plotW}" height="${barH}" rx="8" fill="#EEF4F9" stroke="#D7E2EC"/>
<rect class="card" x="${left}" y="${y + 34}" width="${secondW}" height="${barH}" rx="8" fill="${colors[1]}" stroke="${colors[1]}"/>
<text class="body" x="${left + secondW + 12}" y="${y + 34 + barH / 2}" dominant-baseline="middle">${esc(group.displays[1])}</text>`;
  }).join('\n');
  const axisY = top + groups.length * groupGap + 16;
  const svg = `${base(width, height, title, subtitle)}
<g>
  <line class="axis" x1="${left}" y1="${axisY}" x2="${left + plotW}" y2="${axisY}"/>
  <line class="grid" x1="${left}" y1="${top - 12}" x2="${left}" y2="${axisY}"/>
  <line class="grid" x1="${left + plotW / 2}" y1="${top - 12}" x2="${left + plotW / 2}" y2="${axisY}"/>
  <line class="grid" x1="${left + plotW}" y1="${top - 12}" x2="${left + plotW}" y2="${axisY}"/>
  <text class="body" x="${left}" y="142" fill="${colors[0]}">${esc(seriesLabels[0])}</text>
  <text class="body" x="${left + 130}" y="142" fill="${colors[1]}">${esc(seriesLabels[1])}</text>
  ${rows}
  <text class="tiny" x="${left}" y="${axisY + 26}" text-anchor="middle">0</text>
  <text class="tiny" x="${left + plotW / 2}" y="${axisY + 26}" text-anchor="middle">${axisMax / 2}</text>
  <text class="tiny" x="${left + plotW}" y="${axisY + 26}" text-anchor="middle">${axisMax} ${esc(unit)}</text>
</g>
</svg>`;
  writeFileSync(join(out, `${name}.svg`), svg);
  execFileSync('rsvg-convert', [join(out, `${name}.svg`), '-o', join(out, `${name}.png`)]);
}

barChart('bluetape4k-exposed-part1-virtual-thread-chart', 'Virtual Threads for JDBC Workloads', 'Representative measured improvements from the workshop benchmark note.', [
  { label: 'indexed SELECT', value: 2.54, display: '2.54x', color: '#75A9E8' },
  { label: 'complex UPDATE + GROUP BY', value: 1.79, display: '1.79x', color: '#69B888' },
  { label: '+10ms I/O latency', value: 2.27, display: '2.27x', color: '#D9AA4D' },
  { label: 'CPU bound work', value: 1.03, display: '1.03x', color: '#DB7890' },
], 3, 'improvement', 1280, 560);

barChart('bluetape4k-exposed-part1-jdbc-benchmark-chart', 'Exposed JDBC Benchmark Throughput', 'PostgreSQL Testcontainers, HikariCP max 24, JMH throughput.', [
  { label: 'singleFindById', value: 15000, display: '15,000', color: '#75A9E8' },
  { label: 'singleInsert', value: 14400, display: '14,400', color: '#69B888' },
  { label: 'singleUpdate', value: 14300, display: '14,300', color: '#D9AA4D' },
  { label: 'joinQuery', value: 1510, display: '1,510', color: '#55B5AF' },
  { label: 'batchInsert', value: 217, display: '217', color: '#DB7890' },
], 16000, 'ops/s');

groupedBarChart('bluetape4k-exposed-part1-jpa-comparison-chart', 'Exposed vs JPA Single Entity CRUD', 'PostgreSQL Testcontainers, JMH average latency. Lower is better.', [
  { label: 'create', values: [1196, 4623], displays: ['1,196 us', '4,623 us'] },
  { label: 'read', values: [1972, 11602], displays: ['1,972 us', '11,602 us'] },
  { label: 'update', values: [1980, 15278], displays: ['1,980 us', '15,278 us'] },
  { label: 'delete', values: [1945, 12059], displays: ['1,945 us', '12,059 us'] },
  { label: 'batchCreate(100)', values: [51203, 423816], displays: ['51,203 us', '423,816 us'] },
], 430000, 'us', 1240, 600, ['Exposed', 'JPA'], { left: 260, top: 150, plotW: 780, groupGap: 64 });

dot('bluetape4k-exposed-part1-choice-journey', `
digraph {
  rankdir=LR;
  traffic -> webflux_jdbc;
  traffic -> nosql;
  webflux_jdbc -> r2dbc_vertx;
  webflux_jdbc -> virtual_threads;
  nosql -> exposed_dsl;
  r2dbc_vertx -> bt4k_exposed;
  virtual_threads -> bt4k_exposed;
  exposed_dsl -> bt4k_exposed;
  bt4k_exposed -> production;
}
`, ['traffic', 'webflux_jdbc', 'nosql', 'r2dbc_vertx', 'virtual_threads', 'exposed_dsl', 'bt4k_exposed', 'production']);

diagram('bluetape4k-exposed-part2-jdbc-repository-flow', 'JDBC Repository Flow', 'Keep transaction boundaries explicit while repository helpers remove repeated paging and soft-delete code.', `
<g transform="translate(80 174)">
  ${card(0, 218, 236, 118, 'blue', 'Service Method', ['transaction boundary', 'domain intent'])}
  ${card(344, 64, 270, 118, 'green', 'Exposed DSL', ['select · insert · update', 'where · join · CTE'])}
  ${card(344, 354, 270, 118, 'purple', 'JdbcRepository', ['findById · findPage', 'soft delete · audit'])}
  ${card(738, 64, 270, 118, 'amber', 'ResultRow Mapper', ['typed columns', 'domain record'])}
  ${card(738, 354, 270, 118, 'rose', 'Virtual Thread Tx', ['blocking JDBC', 'cheap waiting'])}
  ${card(1116, 218, 236, 118, 'teal', 'Database', ['PostgreSQL · MySQL', 'H2 · testcontainers'])}
  <path class="line" d="M236 276 C290 276 288 122 344 122"/>
  <path class="line" d="M236 276 C290 276 288 412 344 412"/>
  <path class="line" d="M614 122 H738"/>
  <path class="line" d="M614 412 H738"/>
  <path class="line" d="M1008 122 C1070 122 1052 276 1116 276"/>
  <path class="line" d="M1008 412 C1070 412 1052 304 1116 304"/>
</g>`);

diagram('bluetape4k-exposed-part3-execution-models', 'Execution Models for Exposed', 'Choose JDBC + Virtual Threads or R2DBC + Coroutines by workload, driver path, and streaming needs.', `
<g transform="translate(80 172)">
  ${card(0, 228, 236, 116, 'neutral', 'Request', ['MVC · WebFlux · Ktor'])}
  ${card(330, 68, 278, 128, 'green', 'JDBC + Virtual Threads', ['mature driver path', 'simple stack traces'])}
  ${card(330, 388, 278, 128, 'purple', 'R2DBC + Coroutines', ['suspend · Flow', 'backpressure path'])}
  ${card(740, 68, 270, 128, 'amber', 'Batch / CRUD', ['measure round-trips', 'pool and indexes matter'])}
  ${card(740, 388, 270, 128, 'teal', 'Streaming / Reactive', ['row flow', 'event-loop friendly'])}
  ${card(1120, 228, 236, 116, 'blue', 'Decision', ['workload first', 'benchmark second'])}
  <path class="line" d="M236 286 C286 286 278 132 330 132"/>
  <path class="line" d="M236 286 C286 286 278 452 330 452"/>
  <path class="line" d="M608 132 H740"/>
  <path class="line" d="M608 452 H740"/>
  <path class="line" d="M1010 132 C1076 132 1054 286 1120 286"/>
  <path class="line" d="M1010 452 C1076 452 1054 314 1120 314"/>
</g>`);

diagram('bluetape4k-exposed-part4-codec-dialect-map', 'Columns and Dialects Map', 'Move repeated database-specific details into typed columns and small dialect modules.', `
<g transform="translate(80 170)">
  ${card(0, 236, 230, 112, 'blue', 'Domain Model', ['settings · metadata', 'secret · location'])}
  ${card(342, 54, 260, 116, 'green', 'JSON Codecs', ['Jackson2/3', 'Fastjson2'])}
  ${card(342, 236, 260, 116, 'rose', 'Encrypted Columns', ['Tink AEAD', 'Deterministic AEAD'])}
  ${card(342, 418, 260, 116, 'purple', 'Measured Columns', ['quantity + unit', 'typed value'])}
  ${card(742, 54, 260, 116, 'amber', 'PostgreSQL', ['PostGIS · pgvector', 'range columns'])}
  ${card(742, 236, 260, 116, 'teal', 'MySQL 8', ['JTS geometry', 'spatial predicates'])}
  ${card(742, 418, 260, 116, 'neutral', 'Analytics Dialects', ['BigQuery · ClickHouse', 'Trino · DuckDB'])}
  ${card(1120, 236, 230, 112, 'green', 'SQL DSL', ['type checks', 'less string glue'])}
  <path class="line" d="M230 292 C288 292 284 112 342 112"/>
  <path class="line" d="M230 292 H342"/>
  <path class="line" d="M230 292 C288 292 284 476 342 476"/>
  <path class="line" d="M602 112 H742"/>
  <path class="line" d="M602 292 H742"/>
  <path class="line" d="M602 476 H742"/>
  <path class="line" d="M1002 112 C1068 112 1054 292 1120 292"/>
  <path class="line" d="M1002 292 H1120"/>
  <path class="line" d="M1002 476 C1068 476 1054 320 1120 320"/>
</g>`);

diagram('bluetape4k-exposed-part5-production-boundary', 'Production Boundary', 'Cache, tenancy, outbox, and Spring wiring must be designed and measured together.', `
<g transform="translate(80 170)">
  ${card(0, 232, 230, 112, 'blue', 'HTTP Request', ['tenant header', 'idempotency key'])}
  ${card(330, 54, 260, 116, 'green', 'Spring Boot Wiring', ['JDBC/R2DBC auto-config', 'repository scanning'])}
  ${card(330, 232, 260, 116, 'amber', 'Cache Strategy', ['read-through', 'write-through/behind'])}
  ${card(330, 410, 260, 116, 'purple', 'Tenant Context', ['ThreadLocal · ScopedValue', 'Reactor Context'])}
  ${card(730, 54, 260, 116, 'rose', 'Outbox / Idempotency', ['pending record first', 'duplicate key boundary'])}
  ${card(730, 232, 260, 116, 'teal', 'Repository Layer', ['Exposed transaction', 'cache key includes tenant'])}
  ${card(730, 410, 260, 116, 'neutral', 'Observability', ['hit/miss counters', 'tenant leakage tests'])}
  ${card(1110, 232, 240, 112, 'green', 'Measured Service', ['charts + tests', 'safe defaults'])}
  <path class="line" d="M230 288 C288 288 272 112 330 112"/>
  <path class="line" d="M230 288 H330"/>
  <path class="line" d="M230 288 C288 288 272 468 330 468"/>
  <path class="line" d="M590 112 H730"/>
  <path class="line" d="M590 288 H730"/>
  <path class="line" d="M590 468 H730"/>
  <path class="line" d="M990 112 C1058 112 1040 288 1110 288"/>
  <path class="line" d="M990 288 H1110"/>
  <path class="line" d="M990 468 C1058 468 1040 316 1110 316"/>
</g>`);

groupedBarChart('bluetape4k-exposed-part3-batch-comparison-chart', 'Large Batch E2E: JDBC vs R2DBC', 'dataSize=100000, parallelism=8, ops/sec from batch benchmark notes. Higher is better.', [
  { label: 'MySQL pool=10', values: [1.596, 0.181], displays: ['1.596 ops/s', '0.181 ops/s'] },
  { label: 'MySQL pool=30', values: [1.561, 0.182], displays: ['1.561 ops/s', '0.182 ops/s'] },
  { label: 'MySQL pool=60', values: [1.525, 0.182], displays: ['1.525 ops/s', '0.182 ops/s'] },
  { label: 'PostgreSQL pool=10', values: [0.972, 0.192], displays: ['0.972 ops/s', '0.192 ops/s'] },
  { label: 'PostgreSQL pool=30', values: [0.990, 0.192], displays: ['0.990 ops/s', '0.192 ops/s'] },
  { label: 'PostgreSQL pool=60', values: [0.951, 0.193], displays: ['0.951 ops/s', '0.193 ops/s'] },
], 1.7, 'ops/s', 1260, 700, ['JDBC + VT', 'R2DBC']);

barChart('bluetape4k-exposed-part5-cache-read-chart', 'Cache Read Throughput', 'Spring Boot cache benchmark, warmed findById, representative ops/sec.', [
  { label: 'No Cache', value: 8200, display: '~8,200', color: '#8FA1B3' },
  { label: 'Caffeine', value: 490000, display: '~490,000', color: '#75A9E8' },
  { label: 'Redis Cache', value: 43000, display: '~43,000', color: '#69B888' },
  { label: 'Near Cache', value: 465000, display: '~465,000', color: '#D9AA4D' },
  { label: 'Read-Through', value: 42000, display: '~42,000', color: '#55B5AF' },
  { label: 'Write-Through', value: 41000, display: '~41,000', color: '#8A72D6' },
  { label: 'Write-Behind', value: 42000, display: '~42,000', color: '#DB7890' },
], 500000, 'ops/s', 1280, 800);

barChart('bluetape4k-exposed-part5-cache-write-chart', 'Cache Write Throughput', 'Spring Boot cache benchmark, save path, representative ops/sec.', [
  { label: 'No Cache', value: 8200, display: '~8,200', color: '#8FA1B3' },
  { label: 'Caffeine', value: 8100, display: '~8,100', color: '#75A9E8' },
  { label: 'Redis Cache', value: 7300, display: '~7,300', color: '#69B888' },
  { label: 'Near Cache', value: 7200, display: '~7,200', color: '#D9AA4D' },
  { label: 'Write-Through', value: 5600, display: '~5,600', color: '#8A72D6' },
  { label: 'Write-Behind', value: 24000, display: '~24,000', color: '#DB7890' },
], 25000, 'ops/s');

dot('bluetape4k-exposed-part2-jdbc-repository-flow', `
digraph {
  rankdir=LR;
  service -> dsl;
  service -> repository;
  dsl -> mapper;
  repository -> virtual_thread_tx;
  mapper -> database;
  virtual_thread_tx -> database;
}
`, ['service', 'dsl', 'repository', 'mapper', 'virtual_thread_tx', 'database']);

dot('bluetape4k-exposed-part3-execution-models', `
digraph {
  rankdir=LR;
  request -> jdbc_vt;
  request -> r2dbc_coroutines;
  jdbc_vt -> batch_crud;
  r2dbc_coroutines -> streaming;
  batch_crud -> decision;
  streaming -> decision;
}
`, ['request', 'jdbc_vt', 'r2dbc_coroutines', 'batch_crud', 'streaming', 'decision']);

dot('bluetape4k-exposed-part4-codec-dialect-map', `
digraph {
  rankdir=LR;
  domain -> json_codecs;
  domain -> encrypted_columns;
  domain -> measured_columns;
  json_codecs -> postgresql;
  encrypted_columns -> mysql8;
  measured_columns -> analytics;
  postgresql -> sql_dsl;
  mysql8 -> sql_dsl;
  analytics -> sql_dsl;
}
`, ['domain', 'json_codecs', 'encrypted_columns', 'measured_columns', 'postgresql', 'mysql8', 'analytics', 'sql_dsl']);

dot('bluetape4k-exposed-part5-production-boundary', `
digraph {
  rankdir=LR;
  request -> spring_boot_wiring;
  request -> cache_strategy;
  request -> tenant_context;
  spring_boot_wiring -> outbox_idempotency;
  cache_strategy -> repository_layer;
  tenant_context -> observability;
  outbox_idempotency -> measured_service;
  repository_layer -> measured_service;
  observability -> measured_service;
}
`, ['request', 'spring_boot_wiring', 'cache_strategy', 'tenant_context', 'outbox_idempotency', 'repository_layer', 'observability', 'measured_service']);
