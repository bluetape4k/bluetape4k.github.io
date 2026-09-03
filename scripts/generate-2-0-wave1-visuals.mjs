import { mkdirSync, writeFileSync } from 'node:fs';

const WIDTH = 1800;
const OUT = 'public/assets/visual-companions/wave1';
mkdirSync(OUT, { recursive: true });

const COLORS = {
  blue: { stroke: '#72b7f3', fill: '#173c60', marker: 'arrow-blue' },
  cyan: { stroke: '#58d0d7', fill: '#15434b', marker: 'arrow-cyan' },
  amber: { stroke: '#f4b35f', fill: '#4d3520', marker: 'arrow-amber' },
  rose: { stroke: '#f48c9e', fill: '#4b2937', marker: 'arrow-rose' },
  purple: { stroke: '#b19aff', fill: '#352d5d', marker: 'arrow-purple' },
  green: { stroke: '#61d19a', fill: '#183f34', marker: 'arrow-green' },
  muted: { stroke: '#8fa2bd', fill: '#263750', marker: 'arrow-muted' },
};

const COPY = {
  en: {
    image: {
      title: 'Image Intelligence: facts, states, policy, and privacy boundary',
      subtitle: 'One immutable decode feeds independent lanes; facts stay separate from policy actions and pixel side effects.',
      acquire: '1 · Acquire and decode once', input: 'multipart image input', qualify: 'qualification', decode: 'ImmutableImage.decode', decodeBody: 'one immutable decode · bounded input', fanout: 'parallel analysis fan-out',
      ocr: 'OCR lane', detection: 'Detection lane', barcode: 'ZXing barcode lane', aggregate: 'AnalysisResult aggregate', aggregateBody: 'Completed · Empty · Unavailable · Failed are preserved', state: '2 · Explicit states remain observable', status: 'each lane reports its own outcome and reason', policy: '3 · Ordered policy boundary', policyBody: 'VisitorPassPolicy.decide(facts, states)', policyNote: 'precedence: sensitive → invalid QR → degraded → valid → review', decision: 'VisitorPassDecision', decisionBody: 'action + reasons · no pixel mutation', privacy: '4 · Privacy-safe derivative boundary', derivative: 'immutable derivative snapshot', derivativeBody: 'facts-only payload · redacted metadata', app: 'application-owned effects', appBody: 'render · store · reject · quarantine · manual review', note: 'Detector reports facts → policy chooses action → application owns side effects',
    },
    sqs: {
      title: 'AWS SQS: bounded batch handling with partial acknowledgement',
      subtitle: 'The listener owns bounded concurrency; SQS remains at-least-once and retry/DLQ policy stays caller-owned.',
      application: 'Application', listener: 'Listener', sqs: 'SQS', batch: 'Bounded batch', handler: 'Handler', ack: 'ACK / Delete', observation: 'Observation', receive: 'ReceiveMessage(max=10)', received: 'bounded message batch', emit: 'emit items', handle: 'handle(item)', success: 'item success', del: 'DeleteMessage(entry)', observe: 'low-cardinality outcome', failure: 'item failure', redelivery: 'visibility timeout → redelivery', cancel: 'cancel()', drain: 'cancel children · drain', noDelete: 'failed item is not deleted', lane: '1 · Receive once, process independently', failurePanel: '2 · Partial failure and redelivery', cancelPanel: '3 · Cancellation precedence', note: 'Per-item delete is the acknowledgement boundary. Retry, DLQ, visibility timeout, and backoff remain caller policy.',
    },
    cache: {
      title: 'NearJCache: explicit L1/L2 semantics and safety gates',
      subtitle: 'NearJCache makes tier ownership and safety decisions visible instead of hiding them behind a single cache abstraction.',
      topology: '1 · Two tiers, one immutable configuration snapshot', caller: 'caller', near: 'NearJCache', l1: 'L1 · Caffeine front', l2: 'L2 · Redis back', source: 'source store', config: 'immutable config snapshot', read: '2 · Read path and fill semantics', api: 'get(key)', hit: 'L1 hit → return', miss: 'L1 miss → query L2', l2hit: 'L2 hit → return + populate L1', populate: 'populate-if-at-most(maximumEntryCount)', ops: '3 · Write, clear, bulk, and observability', write: 'write-through', writeBody: 'front write → back completion', clear: 'clear + epoch gate', clearBody: 'invalidate L1 and L2 only after epoch check', bulk: 'bulk policy', bulkBody: 'BypassFront / all-or-nothing', stats: 'logical · front · back stats', statsBody: 'never collapse tier counts', jmx: 'JMX management', jmxBody: 'explicit opt-in surface', disabled: 'disabled mode', disabledBody: 'no tier calls · bounded cost', note: 'Read, write, clear, bulk, and metrics keep their own contracts; provider details are not silently generalized.',
    },
  },
  ko: {
    image: {
      title: 'Image Intelligence: facts·상태·정책·privacy 경계',
      subtitle: '하나의 immutable decode가 독립 lane을 공급하며, facts와 policy action, pixel side effect를 분리합니다.',
      acquire: '1 · 입력 수신과 단일 decode', input: 'multipart 이미지 입력', qualify: 'qualification', decode: 'ImmutableImage.decode', decodeBody: '단일 immutable decode · 입력 크기 제한', fanout: '병렬 분석 fan-out', ocr: 'OCR lane', detection: 'Detection lane', barcode: 'ZXing barcode lane', aggregate: 'AnalysisResult aggregate', aggregateBody: 'Completed · Empty · Unavailable · Failed를 보존', state: '2 · 명시적 상태를 관찰 가능하게 유지', status: '각 lane이 자체 결과와 reason을 보고', policy: '3 · 순서가 있는 policy 경계', policyBody: 'VisitorPassPolicy.decide(facts, states)', policyNote: '우선순위: sensitive → invalid QR → degraded → valid → review', decision: 'VisitorPassDecision', decisionBody: 'action + reasons · pixel을 직접 변경하지 않음', privacy: '4 · privacy-safe derivative 경계', derivative: 'immutable derivative snapshot', derivativeBody: 'facts-only payload · 메타데이터 redaction', app: '애플리케이션 소유 effects', appBody: 'render · store · reject · quarantine · manual review', note: 'Detector는 facts를 보고 → policy가 action을 선택 → application이 side effect를 소유',
    },
    sqs: {
      title: 'AWS SQS: bounded batch와 부분 acknowledgement', subtitle: 'Listener가 bounded concurrency를 소유하고, SQS는 at-least-once를 유지하며 retry/DLQ 정책은 caller가 소유합니다.', application: 'Application', listener: 'Listener', sqs: 'SQS', batch: 'Bounded batch', handler: 'Handler', ack: 'ACK / Delete', observation: 'Observation', receive: 'ReceiveMessage(max=10)', received: '제한된 message batch', emit: 'item 방출', handle: 'handle(item)', success: 'item 성공', del: 'DeleteMessage(entry)', observe: 'low-cardinality outcome', failure: 'item 실패', redelivery: 'visibility timeout → redelivery', cancel: 'cancel()', drain: 'child 취소 · drain', noDelete: '실패 item은 삭제하지 않음', lane: '1 · 한 번 수신하고 독립적으로 처리', failurePanel: '2 · 부분 실패와 redelivery', cancelPanel: '3 · cancellation 우선순위', note: '항목별 delete가 acknowledgement 경계입니다. retry, DLQ, visibility timeout, backoff는 caller 정책입니다.',
    },
    cache: {
      title: 'NearJCache: 명시적인 L1/L2 의미론과 safety gate', subtitle: 'NearJCache는 단일 cache abstraction 뒤에 숨기지 않고 tier 소유권과 safety 결정을 드러냅니다.', topology: '1 · 두 tier와 하나의 immutable configuration snapshot', caller: 'caller', near: 'NearJCache', l1: 'L1 · Caffeine front', l2: 'L2 · Redis back', source: 'source store', config: 'immutable config snapshot', read: '2 · Read path와 fill 의미론', api: 'get(key)', hit: 'L1 hit → return', miss: 'L1 miss → L2 조회', l2hit: 'L2 hit → return + L1 populate', populate: 'populate-if-at-most(maximumEntryCount)', ops: '3 · write·clear·bulk·observability', write: 'write-through', writeBody: 'front write → back 완료', clear: 'clear + epoch gate', clearBody: 'epoch 확인 뒤 L1·L2를 함께 무효화', bulk: 'bulk policy', bulkBody: 'BypassFront / all-or-nothing', stats: 'logical · front · back stats', statsBody: 'tier별 count를 합치지 않음', jmx: 'JMX management', jmxBody: '명시적 opt-in surface', disabled: 'disabled mode', disabledBody: 'tier 호출 없음 · bounded cost', note: 'read·write·clear·bulk·metrics가 각자 계약을 유지하며 provider 세부 동작을 몰래 일반화하지 않습니다.',
    },
  },
};

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function marker(id, color, size, role) {
  return `<marker id="${id}" viewBox="0 0 14 14" markerWidth="${size}" markerHeight="${size}" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse" data-role="${role}" data-tip-direction="positive-x"><path d="M1 1 L13 7 L1 13 Z" fill="${color}" stroke="none" stroke-dasharray="none"/></marker>`;
}

function base(title, subtitle, desc, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-labelledby="title desc">\n<title id="title">${esc(title)}</title>\n<desc id="desc">${esc(desc)}</desc>\n<defs>\n${marker('arrow-blue', COLORS.blue.stroke, 14, 'primary')}\n${marker('arrow-cyan', COLORS.cyan.stroke, 14, 'primary')}\n${marker('arrow-amber', COLORS.amber.stroke, 14, 'primary')}\n${marker('arrow-rose', COLORS.rose.stroke, 14, 'primary')}\n${marker('arrow-purple', COLORS.purple.stroke, 14, 'primary')}\n${marker('arrow-green', COLORS.green.stroke, 14, 'primary')}\n${marker('arrow-muted', COLORS.muted.stroke, 10, 'secondary')}\n${marker('arrow-sequence', COLORS.blue.stroke, 16, 'sequence')}\n<style>.canvas{fill:#07101f}.frame{fill:#0c172a;fill-opacity:.76;stroke:#304866;stroke-width:2}.card{fill:#14243b;stroke-width:2}.mini{fill:#101d32;stroke:#3a5474;stroke-width:1.5}.title{font-family:'goorm Sans','Architects Daughter',sans-serif;font-size:43px;font-weight:700;fill:#f8fafc}.subtitle{font-family:'goorm Sans Code','Comic Mono','goorm Sans',monospace;font-size:19px;fill:#a9b8d4}.section{font-family:'goorm Sans','Architects Daughter',sans-serif;font-size:27px;font-weight:700;fill:#f8fafc}.cardTitle{font-family:'goorm Sans','Architects Daughter',sans-serif;font-size:26px;font-weight:700;fill:#f8fafc}.body{font-family:'goorm Sans','Architects Daughter',sans-serif;font-size:19px;fill:#cbd7ea}.mono{font-family:'goorm Sans Code','Comic Mono','goorm Sans',monospace;font-size:18px;fill:#b9c9e2}.small{font-family:'goorm Sans','Architects Daughter',sans-serif;font-size:16px;fill:#9fb0ca}.tiny{font-family:'goorm Sans Code','Comic Mono','goorm Sans',monospace;font-size:14px;fill:#a9b8d4}.label{font-family:'goorm Sans','Architects Daughter',sans-serif;font-size:17px;font-weight:700;fill:#e7eef9}.connector{fill:none;stroke-linecap:round;stroke-linejoin:round}.lifeline{stroke:#304866;stroke-width:2;stroke-dasharray:7 9}.sequence-line{fill:none;stroke-linecap:round;stroke-width:3;marker-end:url(#arrow-sequence)}.sequence-return{fill:none;stroke:#8fa2bd;stroke-width:2.5;stroke-dasharray:8 8;marker-end:url(#arrow-muted)}.pill{fill:#101d32;stroke-width:1.5}.note{fill:#101d32;stroke:#405a7a;stroke-width:1.5}</style>\n</defs>\n<rect class="canvas" width="${WIDTH}" height="${height}"/>\n<rect x="28" y="28" width="${WIDTH - 56}" height="${height - 56}" rx="28" fill="none" stroke="#294362" stroke-width="2"/>\n<text class="title" x="900" y="82" text-anchor="middle">${esc(title)}</text>\n<text class="subtitle" x="900" y="119" text-anchor="middle">${esc(subtitle)}</text>`;
}

function rect(x, y, w, h, color = 'blue', cls = 'card', rx = 22) {
  const c = COLORS[color] ?? COLORS.blue;
  return `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${c.fill}" stroke="${c.stroke}"/>`;
}

function text(cls, x, y, value, anchor = 'start') {
  return `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(value)}</text>`;
}

function conn(id, d, color = 'blue', target = '', source = '', options = {}) {
  const c = COLORS[color] ?? COLORS.blue;
  const attrs = [`class="${options.className ?? 'connector'}"`, `id="${id}"`, `data-connector="${id}"`];
  if (source) attrs.push(`data-source="${esc(source)}"`);
  if (target) attrs.push(`data-target="${esc(target)}"`);
  attrs.push(`marker-end="url(#${options.marker ?? c.marker})"`);
  if (options.dashed) attrs.push('stroke-dasharray="8 8"');
  return `<path ${attrs.join(' ')} d="${d}" stroke="${c.stroke}" stroke-width="${options.width ?? 4}"/>`;
}

function pill(x, y, w, value, color = 'muted') {
  return `${rect(x, y, w, 36, color, 'pill', 12)}${text('label', x + w / 2, y + 24, value, 'middle')}`;
}

function imageSvg(locale) {
  const l = COPY[locale].image;
  const parts = [base(l.title, l.subtitle, 'Image Intelligence source-backed architecture', 3200)];
  parts.push(rect(100, 165, 1600, 510, 'blue', 'frame', 28));
  parts.push(text('section', 150, 215, l.acquire));
  parts.push(rect(150, 285, 450, 150, 'blue'));
  parts.push(text('mono', 190, 330, l.input));
  parts.push(text('cardTitle', 190, 375, 'multipart/form-data'));
  parts.push(text('small', 190, 410, locale === 'ko' ? 'type · size · content-type 확인' : 'type · size · content-type checks'));
  parts.push(rect(675, 285, 450, 150, 'cyan'));
  parts.push(text('mono', 715, 330, l.qualify));
  parts.push(text('cardTitle', 715, 375, locale === 'ko' ? '입력 자격 확인' : 'Input qualification'));
  parts.push(text('small', 715, 410, locale === 'ko' ? '실패하면 분석 lane을 시작하지 않음' : 'reject before analysis lanes start'));
  parts.push(rect(1200, 285, 450, 150, 'purple'));
  parts.push(text('mono', 1240, 330, l.decode));
  parts.push(text('cardTitle', 1240, 375, locale === 'ko' ? 'immutable image 한 번 생성' : 'create immutable image once'));
  parts.push(text('small', 1240, 410, l.decodeBody));
  parts.push(conn('image-input-qualify', 'M600 360 H675', 'blue', 'qualification', 'multipart input'));
  parts.push(conn('image-qualify-decode', 'M1125 360 H1200', 'cyan', 'immutable decode', 'qualification'));
  parts.push(rect(150, 485, 1500, 120, 'purple'));
  parts.push(text('mono', 190, 530, l.fanout));
  parts.push(text('body', 190, 570, locale === 'ko' ? '같은 immutable image를 OCR · detection · barcode provider가 공유' : 'The same immutable image is shared by OCR, detection, and barcode providers'));
  parts.push(conn('image-decode-fanout', 'M1425 435 V485', 'purple', 'analysis fan-out', 'immutable decode'));

  parts.push(rect(100, 715, 1600, 715, 'cyan', 'frame', 28));
  parts.push(text('section', 150, 765, locale === 'ko' ? '2 · 독립 분석 lane과 상태' : '2 · Independent analysis lanes and states'));
  const laneXs = [150, 650, 1150];
  const laneInfo = [
    ['ocr', l.ocr, 'blue'],
    ['detection', l.detection, 'amber'],
    ['barcode', l.barcode, 'green'],
  ];
  laneInfo.forEach(([id, name, color], index) => {
    const x = laneXs[index];
    parts.push(rect(x, 835, 500, 175, color));
    parts.push(text('mono', x + 40, 880, name));
    parts.push(text('cardTitle', x + 40, 925, id === 'ocr' ? 'text + status' : id === 'detection' ? 'facts + status' : 'values + status'));
    parts.push(text('small', x + 40, 970, locale === 'ko' ? 'status + reason을 원본 facts와 함께 보존' : 'preserve status + reason with source facts'));
    parts.push(conn(`image-fanout-${id}`, `M${x + 250} 605 V835`, color, id, 'analysis fan-out'));
  });
  parts.push(rect(150, 1090, 1500, 170, 'purple'));
  parts.push(text('mono', 190, 1135, l.aggregate));
  parts.push(text('cardTitle', 190, 1180, l.aggregateBody));
  parts.push(text('small', 190, 1220, locale === 'ko' ? 'Empty ≠ Failed · Unavailable은 provider 경계를 드러냄' : 'Empty ≠ Failed · Unavailable keeps the provider boundary visible'));
  laneXs.forEach((x, index) => parts.push(conn(`image-${laneInfo[index][0]}-aggregate`, `M${x + 250} 1010 V1090`, laneInfo[index][2], 'aggregate', laneInfo[index][0])));

  parts.push(rect(100, 1470, 1600, 515, 'amber', 'frame', 28));
  parts.push(text('section', 150, 1520, l.state));
  parts.push(rect(150, 1580, 1500, 145, 'amber'));
  parts.push(text('mono', 190, 1625, locale === 'ko' ? 'state set' : 'state set'));
  parts.push(text('cardTitle', 190, 1670, l.status));
  const statuses = ['Completed', 'Empty', 'Unavailable', 'Failed'];
  statuses.forEach((status, index) => {
    const x = 580 + index * 250;
    const color = index === 0 ? 'green' : index === 1 ? 'blue' : index === 2 ? 'amber' : 'rose';
    parts.push(rect(x, 1738, 220, 48, color, 'mini', 14));
    parts.push(text('label', x + 110, 1769, status, 'middle'));
  });
  parts.push(conn('image-aggregate-status', 'M900 1260 V1580', 'amber', 'state set', 'aggregate'));

  parts.push(rect(100, 2025, 1600, 665, 'purple', 'frame', 28));
  parts.push(text('section', 150, 2075, l.policy));
  parts.push(rect(150, 2135, 1500, 145, 'purple'));
  parts.push(text('mono', 190, 2180, l.policyBody));
  parts.push(text('body', 190, 2225, l.policyNote));
  parts.push(text('small', 190, 2260, locale === 'ko' ? '첫 일치 action 반환 · facts와 treatment command를 같은 타입에 넣지 않음' : 'Return the first matching action · facts and treatment commands stay in separate types'));
  parts.push(rect(350, 2360, 1100, 145, 'purple'));
  parts.push(text('mono', 390, 2405, l.decision));
  parts.push(text('cardTitle', 390, 2450, l.decisionBody));
  parts.push(pill(960, 2400, 210, 'ALLOW', 'green'));
  parts.push(pill(1190, 2400, 220, 'REVIEW', 'amber'));
  parts.push(conn('image-state-policy', 'M900 1786 V2135', 'purple', 'policy', 'state set'));
  parts.push(conn('image-policy-decision', 'M900 2280 V2360', 'purple', 'decision', 'policy'));

  parts.push(rect(100, 2730, 1600, 330, 'green', 'frame', 28));
  parts.push(text('section', 150, 2780, l.privacy));
  parts.push(rect(600, 2840, 600, 140, 'green'));
  parts.push(text('mono', 640, 2885, l.derivative));
  parts.push(text('small', 640, 2930, l.derivativeBody));
  parts.push(rect(1300, 2840, 350, 140, 'blue'));
  parts.push(text('mono', 1320, 2885, l.app));
  parts.push(text('small', 1320, 2925, locale === 'ko' ? 'render · store · reject' : 'render · store · reject'));
  parts.push(text('small', 1320, 2955, locale === 'ko' ? 'quarantine · manual review' : 'quarantine · manual review'));
  parts.push(conn('image-decision-derivative', 'M900 2505 V2840', 'green', 'derivative snapshot', 'decision'));
  parts.push(conn('image-derivative-application', 'M1200 2910 H1300', 'blue', 'application effects', 'derivative snapshot'));
  parts.push(rect(150, 3005, 1500, 42, 'muted', 'note', 14));
  parts.push(text('label', 900, 3032, l.note, 'middle'));
  parts.push('</svg>');
  return parts.join('\n');
}

function sqsSvg(locale) {
  const l = COPY[locale].sqs;
  const participants = [l.application, l.listener, l.sqs, l.batch, l.handler, l.ack, l.observation];
  const centers = [170, 410, 650, 890, 1130, 1370, 1610];
  const parts = [base(l.title, l.subtitle, 'AWS SQS source-backed sequence', 3200)];
  parts.push(rect(80, 165, 1640, 370, 'blue', 'frame', 26));
  parts.push(text('section', 120, 210, l.lane));
  participants.forEach((name, index) => {
    const x = centers[index] - 100;
    parts.push(rect(x, 245, 200, 100, index === 2 ? 'amber' : index === 5 ? 'green' : 'blue'));
    parts.push(text('cardTitle', centers[index], 302, name, 'middle'));
    parts.push(`<line class="lifeline" x1="${centers[index]}" y1="395" x2="${centers[index]}" y2="2860"/>`);
  });
  const row = (number, y, from, to, label, color = 'blue', options = {}) => {
    const x1 = centers[from];
    const x2 = centers[to];
    const id = `sqs-${number}`;
    parts.push(conn(id, `M${x1} ${y} H${x2}`, color, participants[to], participants[from], { className: options.return ? 'sequence-return' : 'sequence-line', marker: options.return ? 'arrow-muted' : 'arrow-sequence', dashed: options.dashed, width: options.return ? 2.5 : 3 }));
    parts.push(text('tiny', (x1 + x2) / 2, y - 12, `${number} · ${label}`, 'middle'));
  };
  row(1, 600, 0, 1, l.receive);
  row(2, 740, 1, 2, l.receive);
  row(3, 880, 2, 1, l.received, 'cyan');
  row(4, 1020, 1, 3, l.emit, 'purple');
  row(5, 1160, 3, 4, l.handle, 'purple');
  row(6, 1300, 4, 5, l.success, 'green');
  row(7, 1440, 5, 2, l.del, 'green');
  row(8, 1580, 4, 6, l.observe, 'cyan');

  parts.push(rect(80, 1700, 1640, 575, 'rose', 'frame', 26));
  parts.push(text('section', 120, 1750, l.failurePanel));
  row(9, 1860, 4, 1, l.failure, 'rose');
  row(10, 2010, 2, 1, l.redelivery, 'amber', { dashed: true });
  parts.push(rect(1030, 2080, 570, 90, 'amber', 'note', 16));
  parts.push(text('label', 1315, 2118, locale === 'ko' ? '실패 entry만 redelivery' : 'Only failed entries redeliver', 'middle'));
  parts.push(text('small', 1315, 2148, l.noDelete, 'middle'));

  parts.push(rect(80, 2390, 1640, 400, 'purple', 'frame', 26));
  parts.push(text('section', 120, 2440, l.cancelPanel));
  row(11, 2525, 0, 1, l.cancel, 'purple');
  row(12, 2665, 1, 4, l.drain, 'purple');
  row(13, 2805, 4, 1, l.noDelete, 'muted', { return: true });
  parts.push(rect(120, 2905, 1560, 140, 'blue', 'note', 18));
  parts.push(text('body', 900, 2960, l.note, 'middle'));
  parts.push(text('small', 900, 3000, locale === 'ko' ? 'Observation은 message body와 tenant 식별자를 기록하지 않는 low-cardinality contract입니다.' : 'Observation stays low-cardinality and does not record message bodies or tenant identifiers.', 'middle'));
  parts.push('</svg>');
  return parts.join('\n');
}

function cacheSvg(locale) {
  const l = COPY[locale].cache;
  const parts = [base(l.title, l.subtitle, 'NearJCache source-backed architecture', 3200)];
  parts.push(rect(90, 165, 1620, 620, 'blue', 'frame', 28));
  parts.push(text('section', 140, 215, l.topology));
  parts.push(rect(130, 320, 360, 130, 'blue'));
  parts.push(text('mono', 170, 365, l.caller));
  parts.push(text('cardTitle', 170, 410, locale === 'ko' ? '요청과 cache key' : 'request and cache key'));
  parts.push(rect(650, 250, 430, 430, 'purple'));
  parts.push(text('mono', 700, 305, l.near));
  parts.push(text('cardTitle', 700, 350, l.config));
  parts.push(text('small', 700, 395, locale === 'ko' ? '설정 snapshot은 변경 불가' : 'configuration is immutable after build'));
  parts.push(text('small', 700, 445, locale === 'ko' ? 'read · write · clear 경계를 조정' : 'coordinates read · write · clear boundaries'));
  parts.push(rect(1200, 260, 420, 130, 'green'));
  parts.push(text('mono', 1240, 305, l.l1));
  parts.push(text('cardTitle', 1240, 350, locale === 'ko' ? 'near / fast lookup' : 'near / fast lookup'));
  parts.push(rect(1200, 500, 420, 130, 'cyan'));
  parts.push(text('mono', 1240, 545, l.l2));
  parts.push(text('cardTitle', 1240, 590, locale === 'ko' ? 'remote / shared state' : 'remote / shared state'));
  parts.push(rect(650, 705, 430, 60, 'amber', 'mini', 14));
  parts.push(text('label', 865, 742, l.source, 'middle'));
  parts.push(conn('cache-caller-near', 'M490 385 H650', 'blue', 'NearJCache', 'caller'));
  parts.push(conn('cache-near-l1', 'M1080 325 H1200', 'green', 'L1', 'NearJCache'));
  parts.push(conn('cache-near-l2', 'M1080 565 H1200', 'cyan', 'L2', 'NearJCache'));
  parts.push(conn('cache-near-source', 'M865 680 V705', 'amber', 'source store', 'NearJCache'));

  parts.push(rect(90, 820, 1620, 760, 'cyan', 'frame', 28));
  parts.push(text('section', 140, 870, l.read));
  parts.push(rect(130, 980, 500, 360, 'blue'));
  parts.push(text('mono', 170, 1030, l.api));
  parts.push(text('cardTitle', 170, 1080, locale === 'ko' ? '먼저 L1을 조회' : 'check L1 first'));
  parts.push(text('small', 170, 1125, locale === 'ko' ? 'hit이면 즉시 반환' : 'return immediately on hit'));
  parts.push(text('small', 170, 1170, locale === 'ko' ? 'miss이면 L2로 이동' : 'on miss, continue to L2'));
  parts.push(rect(760, 940, 420, 120, 'green'));
  parts.push(text('mono', 800, 985, l.hit));
  parts.push(text('small', 800, 1025, locale === 'ko' ? 'front read만 수행' : 'front read only'));
  parts.push(rect(760, 1160, 420, 120, 'amber'));
  parts.push(text('mono', 800, 1205, l.miss));
  parts.push(text('small', 800, 1245, locale === 'ko' ? 'back tier로 질의' : 'query the back tier'));
  parts.push(rect(1280, 1160, 390, 120, 'cyan'));
  parts.push(text('mono', 1320, 1205, l.l2hit));
  parts.push(text('small', 1320, 1245, locale === 'ko' ? '반환과 동시에 L1 채움' : 'return and fill L1'));
  parts.push(rect(1280, 1360, 390, 120, 'purple'));
  parts.push(text('mono', 1320, 1405, 'populate-if-at-most'));
  parts.push(text('small', 1320, 1445, locale === 'ko' ? 'maximumEntryCount gate · 초과 시 건너뜀' : 'maximumEntryCount gate · skip on overflow'));
  parts.push(conn('cache-api-hit', 'M630 1040 H760', 'green', 'L1 hit', 'get(key)'));
  parts.push(conn('cache-api-miss', 'M630 1220 H760', 'amber', 'L1 miss', 'get(key)'));
  parts.push(conn('cache-miss-l2hit', 'M1180 1220 H1280', 'cyan', 'L2 hit', 'L1 miss'));
  parts.push(conn('cache-l2hit-populate', 'M1475 1280 V1360', 'purple', 'populate L1', 'L2 hit'));

  parts.push(rect(90, 1620, 1620, 1040, 'purple', 'frame', 28));
  parts.push(text('section', 140, 1670, l.ops));
  parts.push(rect(130, 1770, 500, 150, 'blue'));
  parts.push(text('mono', 170, 1815, l.write));
  parts.push(text('small', 170, 1860, l.writeBody));
  parts.push(rect(760, 1770, 420, 150, 'rose'));
  parts.push(text('mono', 800, 1815, l.clear));
  parts.push(text('small', 800, 1860, l.clearBody));
  parts.push(rect(1280, 1770, 390, 150, 'amber'));
  parts.push(text('mono', 1320, 1815, l.bulk));
  parts.push(text('small', 1320, 1860, l.bulkBody));
  parts.push(conn('cache-write-clear', 'M630 1845 H760', 'rose', 'clear + epoch', 'write-through'));
  parts.push(conn('cache-clear-bulk', 'M1180 1845 H1280', 'amber', 'bulk policy', 'clear + epoch'));
  parts.push(rect(130, 2070, 500, 150, 'green'));
  parts.push(text('mono', 170, 2115, l.stats));
  parts.push(text('small', 170, 2160, l.statsBody));
  parts.push(rect(760, 2070, 420, 150, 'cyan'));
  parts.push(text('mono', 800, 2115, l.jmx));
  parts.push(text('small', 800, 2160, l.jmxBody));
  parts.push(rect(1280, 2070, 390, 150, 'muted'));
  parts.push(text('mono', 1320, 2115, l.disabled));
  parts.push(text('small', 1320, 2160, l.disabledBody));
  parts.push(conn('cache-write-stats', 'M380 1920 V2070', 'green', 'stats', 'write-through'));
  parts.push(conn('cache-clear-jmx', 'M970 1920 V2070', 'cyan', 'JMX', 'clear + epoch'));
  parts.push(conn('cache-bulk-disabled', 'M1475 1920 V2070', 'muted', 'disabled mode', 'bulk policy'));
  parts.push(rect(130, 2320, 1540, 150, 'blue', 'note', 18));
  parts.push(text('body', 900, 2375, l.note, 'middle'));
  parts.push(text('small', 900, 2415, locale === 'ko' ? 'clear는 두 tier를 함께 무효화하고 epoch로 오래된 작업을 차단합니다.' : 'clear invalidates both tiers and uses an epoch gate to block stale work.', 'middle'));
  parts.push('</svg>');
  return parts.join('\n');
}

const generators = {
  'image-intelligence-policy-privacy': imageSvg,
  'aws-sqs-reliability': sqsSvg,
  'projects-nearjcache-semantics': cacheSvg,
};

const onlyIndex = process.argv.indexOf('--only');
const only = onlyIndex >= 0 ? process.argv[onlyIndex + 1] : null;
const selected = only ? [only] : Object.keys(generators);
for (const name of selected) {
  const generator = generators[name];
  if (!generator) throw new Error(`Unknown visual companion: ${name}`);
  for (const locale of ['en', 'ko']) writeFileSync(`${OUT}/${name}-${locale}.svg`, `${generator(locale)}\n`, 'utf8');
}
