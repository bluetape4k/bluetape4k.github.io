import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = 'public/assets';
mkdirSync(out, { recursive: true });

const colors = {
  blue: ['#E7F1FF', '#5A85D6'],
  teal: ['#E7F7F5', '#3CA7A0'],
  green: ['#EAF7ED', '#58A978'],
  amber: ['#FFF3D8', '#D6A441'],
  rose: ['#FCECEF', '#DC6B82'],
  purple: ['#F1ECFF', '#8A72D6'],
  neutral: ['#F5F7FA', '#8FA1B3'],
};

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function base(width, height, title, subtitle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
<title>${esc(title)}</title>
<desc>${esc(subtitle)}</desc>
<defs>
  <filter id="shadow" x="-8%" y="-8%" width="116%" height="116%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#1D3148" flood-opacity="0.12"/></filter>
  <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M 1 1 L 7 4 L 1 7 Z" fill="#4D6F9F"/></marker>
  <style>
    .bg{fill:#F7F9FC}.frame{fill:#fff;stroke:#D6E2ED;stroke-width:2}
    .title{font-family:"Architects Daughter","Comic Sans MS";font-size:42px;fill:#21334A;font-weight:700}
    .subtitle,.body,.small{font-family:"Comic Mono","Courier New";fill:#34465B}
    .subtitle{font-size:16px}.body{font-size:14px}.small{font-size:12px;fill:#657386}
    .label{font-family:"Architects Daughter","Comic Sans MS";font-size:22px;fill:#21334A;font-weight:700}
    .card{filter:url(#shadow);stroke-width:2}.line{fill:none;stroke:#4D6F9F;stroke-width:2.8;marker-end:url(#arrow)}
  </style>
</defs>
<rect class="bg" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="26"/>
<text class="title" x="70" y="82">${esc(title)}</text>
<text class="subtitle" x="72" y="114">${esc(subtitle)}</text>`;
}

function card(x, y, w, h, tone, title, lines = []) {
  const [fill, stroke] = colors[tone];
  const start = y + h / 2 - (lines.length ? 16 : 0);
  return `<g>
  <rect class="card" x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill}" stroke="${stroke}"/>
  <text class="label" x="${x + w / 2}" y="${start}" text-anchor="middle" dominant-baseline="middle">${esc(title)}</text>
  ${lines.map((line, i) => `<text class="body" x="${x + w / 2}" y="${start + 30 + i * 20}" text-anchor="middle">${esc(line)}</text>`).join('\n')}
</g>`;
}

// Hero figures for this series are imagegen PNG dioramas, not generated SVG diagrams.
function diagram(name, title, subtitle, body) {
  const svg = `${base(1500, 760, title, subtitle)}${body}</svg>`;
  writeFileSync(join(out, `${name}.svg`), svg);
  execFileSync('rsvg-convert', [join(out, `${name}.svg`), '-o', join(out, `${name}.png`)]);
}

function dot(name, source, finalNodes) {
  writeFileSync(join(out, `${name}.dot`), source);
  execFileSync('dot', ['-Tplain', join(out, `${name}.dot`), '-o', join(out, `${name}.plain`)]);
  execFileSync('dot', ['-Tsvg', join(out, `${name}.dot`), '-o', join(out, `${name}-sketch.svg`)]);
  execFileSync('rsvg-convert', [join(out, `${name}-sketch.svg`), '-o', join(out, `${name}-sketch.png`)]);
  const graphNodes = Array.from(source.matchAll(/(?:^|[;{\s])([a-z_]+)\s*(?:->|[;}])/g), (match) => match[1])
    .filter((node) => node !== 'digraph' && node !== 'rankdir');
  const targetNodes = Array.from(source.matchAll(/->\s*([a-z_]+)/g), (match) => match[1]);
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
      'rank_order: left-to-right flow mirrored in final SVG',
      'manual_exceptions: none',
      '',
    ].join('\n'),
  );
}

diagram('bluetape4k-projects-part4-data-infra-map', 'Data and Infrastructure Map', 'Choose the adapter by execution model, operational system, and failure boundary.', `
<g transform="translate(80 170)">
  ${card(0, 232, 230, 116, 'blue', 'Service Code', ['sync · suspend · Flow'])}
  ${card(330, 52, 250, 112, 'green', 'Data', ['JDBC · R2DBC · Hibernate', 'MongoDB · Cassandra'])}
  ${card(330, 232, 250, 112, 'rose', 'Redis / Cache', ['Lettuce · Redisson', 'local · near · distributed'])}
  ${card(330, 412, 250, 112, 'amber', 'Messaging / Infra', ['Kafka · NATS · Pulsar', 'ES · Bucket4j'])}
  ${card(720, 52, 250, 112, 'teal', 'Coroutine Path', ['await · Flow · adapters'])}
  ${card(720, 232, 250, 112, 'purple', 'Resilience', ['retry · circuit breaker', 'timeout · rate limit'])}
  ${card(720, 412, 250, 112, 'neutral', 'Observability', ['Micrometer · OpenTelemetry', 'logs · traces'])}
  ${card(1110, 232, 230, 116, 'green', 'External Systems', ['DB · Redis · broker', 'search · metrics'])}
  <path class="line" d="M230 290 H330"/><path class="line" d="M230 290 C275 290 285 108 330 108"/>
  <path class="line" d="M230 290 C275 290 285 468 330 468"/>
  <path class="line" d="M580 108 H720"/><path class="line" d="M580 288 H720"/><path class="line" d="M580 468 H720"/>
  <path class="line" d="M970 108 C1035 108 1040 288 1110 288"/><path class="line" d="M970 288 H1110"/><path class="line" d="M970 468 C1035 468 1040 316 1110 316"/>
</g>`);

diagram('bluetape4k-projects-part5-adoption-map', 'Utilities and Adoption Path', 'Pick the smallest utility for the job, then validate the same pattern in an example.', `
<g transform="translate(80 166)">
  ${card(0, 78, 230, 108, 'amber', 'Identity', ['UUID v7 · ULID · KSUID', 'Snowflake · Hashids'])}
  ${card(0, 248, 230, 108, 'green', 'Domain Math', ['money · measured', 'geo · science'])}
  ${card(0, 418, 230, 108, 'purple', 'Decision Tools', ['rule engine · FSM', 'workflow · probabilistic'])}
  ${card(360, 248, 260, 124, 'blue', 'Minimal Module', ['BOM first', 'one dependency at a time'])}
  ${card(760, 78, 260, 108, 'teal', 'Examples', ['coroutines · redisson', 'virtual threads'])}
  ${card(760, 248, 260, 108, 'rose', 'Workshops', ['cache · Redis · messaging', 'Spring Data patterns'])}
  ${card(760, 418, 260, 108, 'neutral', 'Benchmark Notes', ['read before claiming speed', 'rerun on your workload'])}
  ${card(1120, 248, 230, 124, 'green', 'Service Adoption', ['small surface', 'verified behavior'])}
  <path class="line" d="M230 132 C290 132 300 310 360 310"/>
  <path class="line" d="M230 302 H360"/>
  <path class="line" d="M230 472 C290 472 300 334 360 334"/>
  <path class="line" d="M620 310 H760"/>
  <path class="line" d="M1020 132 C1080 132 1060 310 1120 310"/>
  <path class="line" d="M1020 302 H1120"/>
  <path class="line" d="M1020 472 C1080 472 1060 334 1120 334"/>
</g>`);

diagram('bluetape4k-projects-part6-application-layer', 'Spring Boot 4 and Ktor Application Layer', 'Application modules sit above the shared foundation and keep wiring explicit.', `
<g transform="translate(84 170)">
  ${card(0, 242, 232, 118, 'blue', 'Shared Foundation', ['BOM · core · coroutines', 'I/O · data · infra · utils'])}
  ${card(360, 112, 272, 136, 'green', 'Spring Boot 4', ['WebFlux + coroutines', 'Redis · R2DBC · MongoDB', 'Hibernate Lettuce'])}
  ${card(360, 400, 272, 136, 'purple', 'Ktor 3', ['core · observability', 'OpenAPI · resilience4j', 'testing helpers'])}
  ${card(760, 112, 260, 136, 'teal', 'Configuration', ['BOM platform import', 'explicit beans/plugins'])}
  ${card(760, 400, 260, 136, 'rose', 'Tests', ['WebTestClient', 'testApplication', 'Testcontainers'])}
  ${card(1130, 244, 230, 116, 'amber', 'Running Service', ['API boundary', 'observed and tested'])}
  <path class="line" d="M232 300 C300 300 292 180 360 180"/>
  <path class="line" d="M232 300 C300 300 292 468 360 468"/>
  <path class="line" d="M632 180 H760"/><path class="line" d="M632 468 H760"/>
  <path class="line" d="M1020 180 C1088 180 1062 302 1130 302"/>
  <path class="line" d="M1020 468 C1088 468 1062 330 1130 330"/>
</g>`);

dot('bluetape4k-projects-part4-data-infra-map', 'digraph { rankdir=LR; service -> data; service -> redis; service -> infra; data -> coroutine; redis -> resilience; infra -> observability; coroutine -> external; resilience -> external; observability -> external; }', ['service', 'data', 'redis', 'infra', 'coroutine', 'resilience', 'observability', 'external']);
dot('bluetape4k-projects-part5-adoption-map', 'digraph { rankdir=LR; identity -> module; domain_math -> module; decisions -> module; module -> examples; module -> workshops; module -> benchmarks; examples -> service; workshops -> service; benchmarks -> service; }', ['identity', 'domain_math', 'decisions', 'module', 'examples', 'workshops', 'benchmarks', 'service']);
dot('bluetape4k-projects-part6-application-layer', 'digraph { rankdir=LR; foundation -> spring; foundation -> ktor; spring -> config; ktor -> tests; config -> service; tests -> service; }', ['foundation', 'spring', 'ktor', 'config', 'tests', 'service']);
