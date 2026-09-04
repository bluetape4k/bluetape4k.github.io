import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { awsStreamsCompanion } from '../src/data/visual-companions/wave2-aws-streams.mjs';

const WIDTH = 1800;
const HEIGHT = 3600;
const ASSET_DIR = 'public/assets/visual-companions/wave2';
const LEDGER_DIR = 'docs/diagrams/visual-companions-wave2';
const CHECK = process.argv.includes('--check');

const palette = {
  kinesis: { stroke: '#62b0f2', fill: '#153c61', marker: 'arrow-kinesis' },
  dynamodb: { stroke: '#b29aff', fill: '#352d5d', marker: 'arrow-dynamodb' },
  green: { stroke: '#60d19a', fill: '#173f34', marker: 'arrow-green' },
  amber: { stroke: '#f4b35f', fill: '#4c3520', marker: 'arrow-amber' },
  rose: { stroke: '#f58ca0', fill: '#4b2937', marker: 'arrow-rose' },
  muted: { stroke: '#91a4bf', fill: '#263750', marker: 'arrow-muted' },
};

const copy = {
  en: {
    title: 'AWS Streams: two shard consumers, one explicit reliability boundary',
    subtitle: 'Kinesis and DynamoDB Streams share at-least-once delivery, but differ in discovery, dependency gates, concurrency, and ownership.',
    discovery: '1 · Discover every shard before scheduling work',
    kDiscovery: ['ListShards pages until nextToken is absent', 'Record parentShardId + adjacentParentShardId', 'Rebuild the graph when the discovery interval fires'],
    dDiscovery: ['DescribeStream pages until LastEvaluatedShardId is absent', 'Record ParentShardId and group root trees', 'A completed parent exposes its child shard'],
    graph: '2 · Respect graph order while bounding active work',
    kGraph: ['Parent + adjacent parent must both reach ShardEnd', 'Semaphore(maxShardConcurrency) bounds workers', 'Lease + fencing token excludes stale owners'],
    dGraph: ['Each root tree is sequential: parent, then child', 'flatMapMerge(maxShardConcurrency) bounds root trees', 'No lease or fencing contract in this adapter'],
    process: '3 · Emit first; checkpoint only after downstream acceptance',
    stages: ['Get records', 'emit(record)', 'checkpoint(sequence)', 'Shard end'],
    kStage: ['Poll with a renewed lease', 'Wait for collector acknowledgement', 'Persist sequence under fencing token', 'Persist KinesisCheckpoint.ShardEnd'],
    dStage: ['Poll the current shard iterator', 'Wait for collector acknowledgement', 'Persist sequence after emission', 'Iterator completion unlocks the child'],
    resume: 'Inclusive resume deliberately allows the checkpointed record to appear again. Both adapters are at-least-once.',
    failures: '4 · Terminal and recovery paths stay visible',
    failureCards: [
      ['Lease loss', 'Kinesis stops the stale worker; DynamoDB Streams has no lease path.'],
      ['Checkpoint failure', 'Fail the flow after emit; the uncommitted record may be replayed.'],
      ['Cancellation', 'Cancel discovery and workers, then release owned Kinesis leases.'],
      ['Shard end', 'Persist the terminal state before dependent shards advance.'],
    ],
    boundary: '5 · Adapter guarantee vs caller policy',
    adapter: ['Paginated discovery', 'Graph ordering + bounded concurrency', 'Emit-then-checkpoint', 'Cancellation and terminal-state cleanup'],
    caller: ['Retry and backoff policy', 'Retention and replay horizon', 'Idempotent side effects / deduplication', 'Monitoring thresholds and operator response'],
    warning: 'Neither adapter promises exactly-once delivery or unbounded concurrency.',
  },
  ko: {
    title: 'AWS Streams: 서로 다른 두 shard consumer와 하나의 명시적 reliability 경계',
    subtitle: 'Kinesis와 DynamoDB Streams는 at-least-once를 공유하지만 discovery, dependency gate, concurrency, 소유권은 다릅니다.',
    discovery: '1 · 작업을 예약하기 전에 모든 shard를 발견합니다',
    kDiscovery: ['nextToken이 없을 때까지 ListShards page 조회', 'parentShardId와 adjacentParentShardId 기록', 'discovery interval마다 graph를 다시 구성'],
    dDiscovery: ['LastEvaluatedShardId가 없을 때까지 DescribeStream page 조회', 'ParentShardId를 기록하고 root tree로 그룹화', '완료된 parent가 child shard를 활성화'],
    graph: '2 · Graph 순서를 지키면서 활성 작업 수를 제한합니다',
    kGraph: ['parent와 adjacent parent가 모두 ShardEnd여야 진행', 'Semaphore(maxShardConcurrency)가 worker 수 제한', 'lease와 fencing token이 오래된 owner를 배제'],
    dGraph: ['각 root tree는 parent 다음 child 순서로 실행', 'flatMapMerge(maxShardConcurrency)가 root tree 수 제한', '이 adapter에는 lease나 fencing 계약이 없음'],
    process: '3 · 먼저 emit하고 downstream 수락 뒤 checkpoint합니다',
    stages: ['Record 조회', 'emit(record)', 'checkpoint(sequence)', 'Shard 종료'],
    kStage: ['갱신된 lease를 확인하며 poll', 'collector acknowledgement까지 대기', 'fencing token으로 sequence 저장', 'KinesisCheckpoint.ShardEnd 저장'],
    dStage: ['현재 shard iterator로 poll', 'collector acknowledgement까지 대기', 'emit 성공 뒤 sequence 저장', 'iterator 완료가 child를 활성화'],
    resume: 'Inclusive resume은 checkpoint된 record의 재등장을 의도적으로 허용합니다. 두 adapter 모두 at-least-once입니다.',
    failures: '4 · 종료와 복구 경로를 숨기지 않습니다',
    failureCards: [
      ['Lease 상실', 'Kinesis는 오래된 worker를 중단합니다. DynamoDB Streams에는 lease 경로가 없습니다.'],
      ['Checkpoint 실패', 'emit 뒤 flow가 실패하며 저장되지 않은 record가 다시 전달될 수 있습니다.'],
      ['Cancellation', 'discovery와 worker를 취소하고 소유한 Kinesis lease를 해제합니다.'],
      ['Shard 종료', 'dependent shard가 진행하기 전에 terminal state를 저장합니다.'],
    ],
    boundary: '5 · Adapter 보장과 caller 정책의 경계',
    adapter: ['Pagination을 포함한 discovery', 'Graph ordering과 bounded concurrency', 'Emit-then-checkpoint', 'Cancellation과 terminal-state cleanup'],
    caller: ['Retry와 backoff 정책', 'Retention과 replay 기간', 'Idempotent side effect / deduplication', '관찰 임계값과 운영자 대응'],
    warning: '어느 adapter도 exactly-once나 unbounded concurrency를 약속하지 않습니다.',
  },
};

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function marker(id, color, role = 'primary', size = 14) {
  return `<marker id="${id}" viewBox="0 0 14 14" markerWidth="${size}" markerHeight="${size}" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse" data-role="${role}" data-tip-direction="positive-x"><path d="M1 1 L13 7 L1 13 Z" fill="${color}"/></marker>`;
}

function rect(x, y, width, height, tone = 'muted', className = 'card', radius = 22, id = '') {
  const color = palette[tone];
  return `<rect${id ? ` id="${id}"` : ''} class="${className}" x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${color.fill}" stroke="${color.stroke}"/>`;
}

function text(className, x, y, value, anchor = 'start') {
  return `<text class="${className}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(value)}</text>`;
}

function lines(x, y, values, className = 'body', gap = 34) {
  return values.map((value, index) => text(className, x, y + index * gap, `${index + 1}. ${value}`)).join('\n');
}

function connector(id, d, tone, source, target, dashed = false) {
  const color = palette[tone];
  return `<path id="${id}" data-connector="${id}" data-source="${source}" data-target="${target}" class="connector" d="${d}" stroke="${color.stroke}" stroke-width="4"${dashed ? ' stroke-dasharray="9 9"' : ''} marker-end="url(#${color.marker})"/>`;
}

function base(locale) {
  const l = copy[locale];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title desc">
<title id="title">${esc(l.title)}</title>
<desc id="desc">${esc(l.subtitle)}</desc>
<defs>
${Object.entries(palette).map(([name, value]) => marker(value.marker, value.stroke, name === 'muted' ? 'secondary' : 'primary', name === 'muted' ? 10 : 14)).join('\n')}
<style>.canvas{fill:#07101f}.frame{fill:#0c172a;fill-opacity:.78;stroke-width:2}.card{stroke-width:2}.title{font:700 43px 'goorm Sans','Architects Daughter',sans-serif;fill:#f8fafc}.subtitle{font:19px 'goorm Sans Code','Comic Mono',monospace;fill:#a9b8d4}.section{font:700 27px 'goorm Sans','Architects Daughter',sans-serif;fill:#f8fafc}.lane{font:700 25px 'goorm Sans','Architects Daughter',sans-serif;fill:#f8fafc}.cardTitle{font:700 21px 'goorm Sans','Architects Daughter',sans-serif;fill:#f8fafc}.body{font:18px 'goorm Sans','Architects Daughter',sans-serif;fill:#cbd7ea}.small{font:16px 'goorm Sans','Architects Daughter',sans-serif;fill:#a9b8d4}.mono{font:17px 'goorm Sans Code','Comic Mono',monospace;fill:#d7e3f5}.connector{fill:none;stroke-linecap:round;stroke-linejoin:round}.divider{stroke:#304866;stroke-width:2}.badge{font:700 16px 'goorm Sans Code','Comic Mono',monospace;fill:#07101f}.note{fill:#101d32;stroke-width:1.5}</style>
</defs>
<rect class="canvas" width="${WIDTH}" height="${HEIGHT}"/>
<rect x="28" y="28" width="1744" height="3544" rx="28" fill="none" stroke="#294362" stroke-width="2"/>
${text('title', 900, 82, l.title, 'middle')}
${text('subtitle', 900, 120, l.subtitle, 'middle')}`;
}

function laneHeader(parts, x, y, tone, label, detail) {
  parts.push(rect(x, y, 750, 90, tone));
  parts.push(text('lane', x + 40, y + 40, label));
  parts.push(text('small', x + 40, y + 70, detail));
}

function discoverySection(parts, locale) {
  const l = copy[locale];
  parts.push(rect(80, 170, 1640, 720, 'muted', 'frame', 28));
  parts.push(text('section', 120, 220, l.discovery));
  laneHeader(parts, 120, 260, 'kinesis', 'Amazon Kinesis', 'ListShards · parent + adjacent parent');
  laneHeader(parts, 930, 260, 'dynamodb', 'DynamoDB Streams', 'DescribeStream · ParentShardId');
  for (const [index, tone] of ['kinesis', 'dynamodb'].entries()) {
    const x = index === 0 ? 120 : 930;
    const values = index === 0 ? l.kDiscovery : l.dDiscovery;
    parts.push(`<g data-service="${tone}">`);
    parts.push(rect(x, 390, 750, 180, tone, 'card', 22, `${tone}-discover`));
    parts.push(lines(x + 36, 435, values));
    parts.push(rect(x + 130, 670, 490, 120, tone, 'card', 22, `${tone}-graph`));
    parts.push(text('cardTitle', x + 375, 720, index === 0 ? 'Shard dependency graph' : 'Root shard trees', 'middle'));
    parts.push(text('small', x + 375, 758, index === 0 ? 'refreshable topology snapshot' : 'parent → child chains', 'middle'));
    parts.push(connector(`${tone}-discover-graph`, `M${x + 375} 570 V670`, tone, `${tone}-discover`, `${tone}-graph`));
    parts.push('</g>');
  }
}

function graphSection(parts, locale) {
  const l = copy[locale];
  parts.push(rect(80, 930, 1640, 820, 'muted', 'frame', 28));
  parts.push(text('section', 120, 980, l.graph));
  for (const [index, tone] of ['kinesis', 'dynamodb'].entries()) {
    const x = index === 0 ? 120 : 930;
    const values = index === 0 ? l.kGraph : l.dGraph;
    parts.push(`<g data-service="${tone}">`);
    laneHeader(parts, x, 1020, tone, index === 0 ? 'Kinesis gate' : 'DynamoDB Streams gate', index === 0 ? 'dependency barrier + lease ownership' : 'sequential tree + bounded merge');
    parts.push(rect(x, 1140, 750, 175, tone, 'card', 22, `${tone}-gate`));
    parts.push(lines(x + 36, 1185, values));
    const centers = [x + 155, x + 375, x + 595];
    centers.forEach((center, nodeIndex) => {
      parts.push(rect(center - 80, 1410, 160, 86, nodeIndex === 2 ? 'green' : tone, 'card', 18, `${tone}-shard-${nodeIndex + 1}`));
      parts.push(text('mono', center, 1462, `shard-${nodeIndex + 1}`, 'middle'));
    });
    parts.push(connector(`${tone}-shard-1-2`, `M${centers[0] + 80} 1453 H${centers[1] - 80}`, tone, `${tone}-shard-1`, `${tone}-shard-2`));
    parts.push(connector(`${tone}-shard-2-3`, `M${centers[1] + 80} 1453 H${centers[2] - 80}`, tone, `${tone}-shard-2`, `${tone}-shard-3`));
    parts.push(rect(x, 1570, 750, 110, 'amber', 'note', 18));
    parts.push(text('mono', x + 375, 1614, index === 0 ? 'Semaphore(maxShardConcurrency)' : 'flatMapMerge(maxShardConcurrency)', 'middle'));
    parts.push(text('small', x + 375, 1652, index === 0 ? 'Lease loss closes this worker immediately' : 'Concurrency applies across root trees, never within one tree', 'middle'));
    parts.push('</g>');
  }
}

function processSection(parts, locale) {
  const l = copy[locale];
  parts.push(rect(80, 1790, 1640, 780, 'muted', 'frame', 28));
  parts.push(text('section', 120, 1840, l.process));
  for (const [index, tone] of ['kinesis', 'dynamodb'].entries()) {
    const x = index === 0 ? 120 : 930;
    const values = index === 0 ? l.kStage : l.dStage;
    parts.push(`<g data-service="${tone}">`);
    laneHeader(parts, x, 1880, tone, index === 0 ? 'Kinesis worker' : 'DynamoDB Streams tree worker', index === 0 ? 'lease renew + fencing check' : 'one shard iterator at a time');
    l.stages.forEach((stage, stageIndex) => {
      const y = 2010 + stageIndex * 118;
      const stageTone = stageIndex === 3 ? 'green' : tone;
      parts.push(rect(x, y, 750, 84, stageTone, 'card', 18, `${tone}-stage-${stageIndex + 1}`));
      parts.push(text('cardTitle', x + 32, y + 34, `${stageIndex + 1}. ${stage}`));
      parts.push(text('small', x + 32, y + 65, values[stageIndex]));
      if (stageIndex > 0) parts.push(connector(`${tone}-stage-${stageIndex}-${stageIndex + 1}`, `M${x + 700} ${y - 34} V${y}`, stageTone, `${tone}-stage-${stageIndex}`, `${tone}-stage-${stageIndex + 1}`));
    });
    parts.push('</g>');
  }
  parts.push(rect(120, 2498, 1560, 46, 'amber', 'note', 14));
  parts.push(text('small', 900, 2528, l.resume, 'middle'));
}

function failureSection(parts, locale) {
  const l = copy[locale];
  parts.push(rect(80, 2610, 1640, 475, 'muted', 'frame', 28));
  parts.push(text('section', 120, 2660, l.failures));
  l.failureCards.forEach(([title, detail], index) => {
    const x = 120 + index * 395;
    const tone = index === 0 ? 'rose' : index === 1 ? 'amber' : index === 2 ? 'dynamodb' : 'green';
    parts.push(rect(x, 2720, 355, 285, tone));
    parts.push(text('cardTitle', x + 28, 2770, title));
    const words = detail.split(' ');
    const rows = [];
    let row = '';
    const widthOf = (value) => Array.from(value).reduce((width, character) => width + (/[가-힣]/.test(character) ? 18 : 9), 0);
    for (const word of words) {
      const candidate = `${row} ${word}`.trim();
      if (row && widthOf(candidate) > 270) { rows.push(row); row = word; } else row = candidate;
    }
    if (row) rows.push(row);
    parts.push(rows.slice(0, 5).map((value, rowIndex) => text('small', x + 28, 2820 + rowIndex * 34, value)).join('\n'));
  });
}

function boundarySection(parts, locale) {
  const l = copy[locale];
  parts.push(rect(80, 3125, 1640, 395, 'muted', 'frame', 28));
  parts.push(text('section', 120, 3175, l.boundary));
  parts.push(rect(120, 3220, 750, 215, 'green'));
  parts.push(text('cardTitle', 155, 3265, locale === 'ko' ? 'Adapter가 보장' : 'Adapter guarantees'));
  parts.push(lines(155, 3305, l.adapter, 'small', 29));
  parts.push(rect(930, 3220, 750, 215, 'amber'));
  parts.push(text('cardTitle', 965, 3265, locale === 'ko' ? 'Caller가 소유' : 'Caller owns'));
  parts.push(lines(965, 3305, l.caller, 'small', 29));
  parts.push(rect(120, 3460, 1560, 42, 'rose', 'note', 14));
  parts.push(text('cardTitle', 900, 3489, l.warning, 'middle'));
}

function svg(locale) {
  const parts = [base(locale)];
  discoverySection(parts, locale);
  graphSection(parts, locale);
  processSection(parts, locale);
  failureSection(parts, locale);
  boundarySection(parts, locale);
  parts.push('</svg>');
  return `${parts.join('\n')}\n`;
}

function ledger(locale) {
  const sourcePath = locale === 'ko'
    ? 'src/content/docs/ko/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging.md'
    : 'src/content/docs/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging.md';
  const source = 'storage-and-messaging.md';
  return `${JSON.stringify({
    kind: 'workflow',
    source: {
      question: locale === 'ko'
        ? 'Kinesis와 DynamoDB Streams consumer는 shard 순서, concurrency, checkpoint, 실패 경계를 어떻게 다르게 보장하는가?'
        : 'How do Kinesis and DynamoDB Streams consumers differ in shard order, concurrency, checkpoints, and failure boundaries?',
      revision: awsStreamsCompanion.sourceRevision,
      paths: [sourcePath, 'src/data/visual-companions/wave2-aws-streams.mjs'],
    },
    nodes: [
      ['kinesis_discovery', 'Kinesis ListShards discovery'], ['dynamodb_discovery', 'DynamoDB DescribeStream discovery'],
      ['kinesis_graph', 'Kinesis dependency graph'], ['dynamodb_tree', 'DynamoDB root shard trees'],
      ['bounded_gate', 'Bounded concurrency gate'], ['poll', 'Record polling'], ['emit', 'Collector emission'],
      ['checkpoint', 'Durable checkpoint'], ['shard_end', 'Terminal shard state'], ['caller_policy', 'Caller-owned retry and retention'],
    ].map(([id, label]) => ({ id, label, source })),
    edges: [
      ['kinesis-discovery-graph', 'kinesis_discovery', 'kinesis_graph', 'builds'],
      ['dynamodb-discovery-tree', 'dynamodb_discovery', 'dynamodb_tree', 'builds'],
      ['kinesis-graph-gate', 'kinesis_graph', 'bounded_gate', 'parent-barrier'],
      ['dynamodb-tree-gate', 'dynamodb_tree', 'bounded_gate', 'sequential-tree'],
      ['gate-poll', 'bounded_gate', 'poll', 'permits'], ['poll-emit', 'poll', 'emit', 'delivers'],
      ['emit-checkpoint', 'emit', 'checkpoint', 'acknowledged-before'], ['checkpoint-poll', 'checkpoint', 'poll', 'continues'],
      ['checkpoint-shard-end', 'checkpoint', 'shard_end', 'terminates'], ['checkpoint-caller', 'checkpoint', 'caller_policy', 'replay-boundary'],
    ].map(([id, from, to, kind]) => ({ id, from, to, kind, source })),
    behavior: { branches: 3, loops: 1 },
    repairs: [],
  }, null, 2)}\n`;
}

const readme = `# Wave 2 visual companion assets

Generated source-backed assets for Epic #413, wave 2, and its linked follow-up visual issues. Each delivery issue keeps its own interactive route and locale-matched static assets.

| Issue | English | 한국어 | Interactive |
| --- | --- | --- | --- |
| #417 | [SVG](/assets/visual-companions/wave2/aws-streams-shard-consumers-en.svg) · [PNG](/assets/visual-companions/wave2/aws-streams-shard-consumers-en.png) | [SVG](/assets/visual-companions/wave2/aws-streams-shard-consumers-ko.svg) · [PNG](/assets/visual-companions/wave2/aws-streams-shard-consumers-ko.png) | [EN](/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/) · [KO](/ko/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/) |
| #418 | [SVG](/assets/visual-companions/wave2/projects-netcdf-cf-progress-en.svg) · [PNG](/assets/visual-companions/wave2/projects-netcdf-cf-progress-en.png) | [SVG](/assets/visual-companions/wave2/projects-netcdf-cf-progress-ko.svg) · [PNG](/assets/visual-companions/wave2/projects-netcdf-cf-progress-ko.png) | [EN](/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/) · [KO](/ko/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/) |
| #419 | [SVG](/assets/visual-companions/wave2/projects-nats-jetstream-flow-en.svg) · [PNG](/assets/visual-companions/wave2/projects-nats-jetstream-flow-en.png) | [SVG](/assets/visual-companions/wave2/projects-nats-jetstream-flow-ko.svg) · [PNG](/assets/visual-companions/wave2/projects-nats-jetstream-flow-ko.png) | [EN](/visual-companions/bluetape4k-projects/projects-nats-jetstream-flow/) · [KO](/ko/visual-companions/bluetape4k-projects/projects-nats-jetstream-flow/) |
| #420 | [SVG](/assets/visual-companions/wave2/aws-modulith-event-externalization-en.svg) · [PNG](/assets/visual-companions/wave2/aws-modulith-event-externalization-en.png) | [SVG](/assets/visual-companions/wave2/aws-modulith-event-externalization-ko.svg) · [PNG](/assets/visual-companions/wave2/aws-modulith-event-externalization-ko.png) | [EN](/visual-companions/bluetape4k-aws/aws-modulith-event-externalization/) · [KO](/ko/visual-companions/bluetape4k-aws/aws-modulith-event-externalization/) |
| #426 | [SVG](/assets/visual-companions/wave2/projects-netcdf-data-model-en.svg) · [PNG](/assets/visual-companions/wave2/projects-netcdf-data-model-en.png) | [SVG](/assets/visual-companions/wave2/projects-netcdf-data-model-ko.svg) · [PNG](/assets/visual-companions/wave2/projects-netcdf-data-model-ko.png) | [EN](/visual-companions/bluetape4k-projects/projects-netcdf-data-model/) · [KO](/ko/visual-companions/bluetape4k-projects/projects-netcdf-data-model/) |
| #430 | [SVG](/assets/visual-companions/wave2/projects-coroutines-flow-operators-en.svg) · [PNG](/assets/visual-companions/wave2/projects-coroutines-flow-operators-en.png) | [SVG](/assets/visual-companions/wave2/projects-coroutines-flow-operators-ko.svg) · [PNG](/assets/visual-companions/wave2/projects-coroutines-flow-operators-ko.png) | [EN](/visual-companions/bluetape4k-projects/projects-coroutines-flow-operators/) · [KO](/ko/visual-companions/bluetape4k-projects/projects-coroutines-flow-operators/) |

![AWS Streams shard consumers (EN)](./aws-streams-shard-consumers-en.png)
![AWS Streams shard consumers (KO)](./aws-streams-shard-consumers-ko.png)

![Spring Modulith event externalization (EN)](./aws-modulith-event-externalization-en.png)
![Spring Modulith event externalization (KO)](./aws-modulith-event-externalization-ko.png)

![Projects NetCDF CF progress (EN)](./projects-netcdf-cf-progress-en.png)
![Projects NetCDF CF progress (KO)](./projects-netcdf-cf-progress-ko.png)

![Projects NATS JetStream Flow (EN)](./projects-nats-jetstream-flow-en.png)
![Projects NATS JetStream Flow (KO)](./projects-nats-jetstream-flow-ko.png)

![Projects NetCDF data model (EN)](./projects-netcdf-data-model-en.png)
![Projects NetCDF data model (KO)](./projects-netcdf-data-model-ko.png)

![Projects Coroutines Flow operators (EN)](./projects-coroutines-flow-operators-en.png)
![Projects Coroutines Flow operators (KO)](./projects-coroutines-flow-operators-ko.png)

Regenerate Issue #417 SVG and semantic ledgers with \`node scripts/generate-2-0-wave2-visuals.mjs\`; regenerate Issue #418 with \`node scripts/generate-2-0-wave2-projects-netcdf-visuals.mjs\`; regenerate Issue #419 interactive output with \`node scripts/generate-2-0-wave2-projects-nats-flow-interactive.mjs\` and its SVG/PNG/semantic ledgers with \`node scripts/generate-2-0-wave2-projects-nats-flow-visuals.mjs\`; regenerate Issue #420 with \`node scripts/generate-2-0-wave2-aws-modulith.mjs\` and \`node scripts/generate-2-0-wave2-aws-modulith-visuals.mjs\`; regenerate Issue #426 with \`node scripts/generate-2-0-wave2-projects-netcdf-data-model-visuals.mjs\`; regenerate Issue #430 with \`node scripts/generate-2-0-wave2-projects-coroutines-flow-operators-interactive.mjs\` and \`node scripts/generate-2-0-wave2-projects-coroutines-flow-operators-visuals.mjs\`. PNG files are rendered from the generated SVG files at 2x resolution.
`;

function output(path, content) {
  if (CHECK) {
    if (!existsSync(path) || readFileSync(path, 'utf8') !== content) throw new Error(`Generated output is stale: ${path}`);
    return;
  }
  writeFileSync(path, content, 'utf8');
  console.log(`WROTE ${path}`);
}

mkdirSync(ASSET_DIR, { recursive: true });
mkdirSync(LEDGER_DIR, { recursive: true });
for (const locale of ['en', 'ko']) {
  output(`${ASSET_DIR}/aws-streams-shard-consumers-${locale}.svg`, svg(locale));
  output(`${LEDGER_DIR}/aws-streams-shard-consumers-${locale}.semantic.json`, ledger(locale));
}
output(`${ASSET_DIR}/README.md`, readme);
