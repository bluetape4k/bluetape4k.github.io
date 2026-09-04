import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { projectsNatsFlowCompanion as companion } from '../src/data/visual-companions/wave2-projects-nats-flow.mjs';

const WIDTH = 1800;
const HEIGHT = 4600;
const ASSET_DIR = 'public/assets/visual-companions/wave2';
const LEDGER_DIR = 'docs/diagrams/visual-companions-wave2';
const CHECK = process.argv.includes('--check');

const palette = {
  call: { stroke: '#78a9d8', fill: '#213a54', marker: 'arrow-call', role: 'sequence' },
  return: { stroke: '#65c5bf', fill: '#1d4142', marker: 'arrow-return', role: 'sequence' },
  metadata: { stroke: '#cda36c', fill: '#493722', marker: 'arrow-metadata', role: 'sequence' },
  success: { stroke: '#9ab873', fill: '#2b432c', marker: 'arrow-success', role: 'sequence' },
  'branch-redelivery': { stroke: '#d88796', fill: '#4b2d39', marker: 'arrow-redelivery', role: 'sequence' },
  'branch-drop': { stroke: '#d88796', fill: '#4b2d39', marker: 'arrow-drop', role: 'sequence' },
  'branch-cancel': { stroke: '#d88796', fill: '#4b2d39', marker: 'arrow-cancel', role: 'sequence' },
};

const copy = {
  en: {
    title: 'NATS JetStream Flow: one cold contract, two intake paths',
    subtitle: 'ConsumerContext pull and JetStream push converge on bounded Flow<Message>; acknowledgement, retry, and connection policy remain caller-owned.',
    overview: 'Read the sequence from left to right, then follow the branch frames',
    overviewCards: [
      ['COLD', 'collect creates the handle', 'No subscription or IterableConsumer exists before collection.'],
      ['BOUNDED', 'capacity + pending limits', 'Finite channel and pending ceilings fail closed when state cannot be trusted.'],
      ['MANUAL', 'ack · nak · term stay outside', 'PublishAck confirms storage; business completion is a caller decision.'],
    ],
    sequence: 'Cold collection → bounded delivery → caller policy → cleanup',
    alt: 'ALT · retryable failure → nak or no ack → redelivery',
    else: 'ELSE · pending drop / unreadable state → typed failure',
    loop: 'LOOP · collect again → a fresh adapter handle',
    adapter: 'Adapter-owned boundary',
    caller: 'Caller-owned boundary',
    footer: 'Issue #419 · source revision 0ba5b8699a58 · static fallback for the interactive sequence companion',
  },
  ko: {
    title: 'NATS JetStream Flow: 하나의 cold 계약과 두 개의 입력 경로',
    subtitle: 'ConsumerContext pull과 JetStream push가 bounded Flow<Message>로 합쳐지며 acknowledgement, retry, connection policy는 caller가 소유합니다.',
    overview: '왼쪽에서 오른쪽으로 sequence를 읽고 분기 frame을 따라가세요',
    overviewCards: [
      ['COLD', 'collect할 때 handle 생성', 'collect 전에는 subscription이나 IterableConsumer가 존재하지 않습니다.'],
      ['BOUNDED', 'capacity + pending 제한', '유한한 channel과 pending 상한을 지키며 상태를 확인할 수 없으면 fail closed합니다.'],
      ['MANUAL', 'ack · nak · term은 외부 소유', 'PublishAck는 저장을 확인할 뿐이며 업무 완료는 caller의 결정입니다.'],
    ],
    sequence: 'Cold collection → bounded delivery → caller policy → cleanup',
    alt: 'ALT · retry 가능한 실패 → nak 또는 no ack → redelivery',
    else: 'ELSE · pending drop / 읽을 수 없는 상태 → typed failure',
    loop: 'LOOP · 다시 collect → 새 adapter handle',
    adapter: 'Adapter 소유 경계',
    caller: 'Caller 소유 경계',
    footer: 'Issue #419 · source revision 0ba5b8699a58 · interactive sequence companion의 static fallback',
  },
};

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function marker(id, color, role = 'sequence', size = 16) {
  return `<marker id="${id}" viewBox="0 0 10 10" markerWidth="${size}" markerHeight="${size}" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" data-role="${role}" data-tip-direction="positive-x"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}"/></marker>`;
}

function rect(id, x, y, width, height, tone, className = 'card', radius = 18, extra = '') {
  const color = palette[tone] ?? { stroke: '#3a506b', fill: '#172437' };
  return `<rect id="${id}" class="${className}" x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${color.fill}" stroke="${color.stroke}" ${extra}/>`;
}

function text(className, x, y, value, anchor = 'start') {
  return `<text class="${className}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(value)}</text>`;
}

function wrap(value, max = 108) {
  const words = String(value).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && candidate.length > max) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function lineText(parts, className, x, y, value, max = 108, gap = 28) {
  wrap(value, max).slice(0, 4).forEach((line, index) => parts.push(text(className, x, y + index * gap, line)));
}

function message(parts, frame, index, xPositions, y) {
  const tone = palette[frame.tone];
  const sourceX = xPositions[frame.from];
  const targetX = xPositions[frame.to];
  const direction = targetX >= sourceX ? 1 : -1;
  const start = sourceX + direction * 22;
  const end = targetX - direction * 22;
  const labelLines = wrap(frame.event, 72).slice(0, 2);
  parts.push(`<path id="message-${frame.id}" data-connector="message-${frame.id}" data-source="participant-${frame.from}" data-target="participant-${frame.to}" class="${frame.tone.startsWith('branch') ? 'error' : frame.tone === 'return' ? 'return' : frame.tone === 'metadata' ? 'amber' : frame.tone === 'success' ? 'green' : 'call'}" d="M ${start} ${y} H ${end}" stroke="${tone.stroke}" stroke-width="4" marker-end="url(#${tone.marker})"/>`);
  parts.push(rect(`message-label-${frame.id}`, 122, y - 53, 58, 34, frame.tone, 'labelPill', 14, `data-message="${frame.id}"`));
  parts.push(text('num', 151, y - 29, String(index + 1), 'middle'));
  labelLines.forEach((line, lineIndex) => parts.push(text('labelText', 215, y - 57 - (labelLines.length - 1 - lineIndex) * 25, line)));
  parts.push(`<rect class="activation" x="${sourceX - 11}" y="${y - 36}" width="22" height="116" rx="8" fill="${tone.fill}" stroke="${tone.stroke}"/>`);
  parts.push(`<rect class="activation" x="${targetX - 11}" y="${y + 26}" width="22" height="54" rx="8" fill="${tone.fill}" stroke="${tone.stroke}"/>`);
}

function branchFrame(parts, id, y, title, tone) {
  const color = palette[tone];
  parts.push(`<rect id="${id}" class="alt" x="100" y="${y - 116}" width="1600" height="250" rx="16" fill="none" stroke="${color.stroke}" stroke-width="2" stroke-dasharray="10 8" data-branch="${id}"/>`);
  parts.push(text('branchTitle', 1660, y - 101, title, 'end'));
  parts.push(`<line class="branchDivider" x1="125" y1="${y - 83}" x2="1675" y2="${y - 83}" stroke="${color.stroke}" stroke-width="1.5" stroke-dasharray="6 8"/>`);
}

function svg(locale) {
  const l = copy[locale];
  const frames = companion.frames.map((frame) => ({
    ...frame,
    phase: frame.phase[locale],
    event: frame.event[locale],
    action: frame.action[locale],
    guard: frame.guard[locale],
    next: frame.next[locale],
    signal: frame.signal[locale],
  }));
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title desc" data-intent="source-backed NATS JetStream Flow sequence" data-source-read="${companion.sourceRevision}">`);
  parts.push(`<title id="title">${esc(l.title)}</title><desc id="desc">${esc(l.subtitle)}</desc>`);
  parts.push('<defs>');
  for (const value of Object.values(palette)) parts.push(marker(value.marker, value.stroke, value.role, 16));
  parts.push(`<style>
    .canvas{fill:#0b111b}.outer{fill:none;stroke:#304760;stroke-width:2}.frame{fill:#111a28;fill-opacity:.86;stroke:#3a506b;stroke-width:2}.card{stroke-width:2}.title{font:700 45px "goorm Sans","Architects Daughter","Noto Sans KR",sans-serif;fill:#f6f8fb}.subtitle{font:18px "goorm Sans Code","Comic Mono","Noto Sans KR",monospace;fill:#aebed2}.section{font:700 27px "goorm Sans","Architects Daughter","Noto Sans KR",sans-serif;fill:#f6f8fb}.sectionHint{font:17px "goorm Sans","Architects Daughter","Noto Sans KR",sans-serif;fill:#aebed2}.participant{font:700 23px "goorm Sans","Architects Daughter","Noto Sans KR",sans-serif;fill:#f6f8fb}.role{font:15px "goorm Sans Code","Comic Mono","Noto Sans KR",monospace;fill:#aebed2}.cardTitle{font:700 20px "goorm Sans","Architects Daughter","Noto Sans KR",sans-serif;fill:#f6f8fb}.body{font:17px "goorm Sans","Architects Daughter","Noto Sans KR",sans-serif;fill:#d6e1ef}.small{font:15px "goorm Sans","Architects Daughter","Noto Sans KR",sans-serif;fill:#aebed2}.mono{font:16px "goorm Sans Code","Comic Mono","Noto Sans KR",monospace;fill:#d5e2f1}.phase{font:700 17px "goorm Sans","Architects Daughter","Noto Sans KR",sans-serif;fill:#65c5bf}.labelText{font:700 16px "goorm Sans Code","Comic Mono","Noto Sans KR",monospace;fill:#f6f8fb}.num{font:700 17px "goorm Sans Code","Comic Mono","Noto Sans KR",monospace;fill:#0b111b}.branchTitle{font:700 16px "goorm Sans Code","Comic Mono","Noto Sans KR",monospace;fill:#d88796}.note{font:700 16px "goorm Sans Code","Comic Mono","Noto Sans KR",monospace;fill:#cda36c}.footer{font:15px "goorm Sans Code","Comic Mono","Noto Sans KR",monospace;fill:#aebed2}.lifeline{stroke:#526b84;stroke-width:2;stroke-dasharray:8 10}.connector{fill:none;stroke-linecap:round;stroke-linejoin:round}.branchDivider{opacity:.65}.labelPill{stroke-width:2}.activation{stroke-width:2;opacity:.95}.arrow-call{stroke:#78a9d8}.arrow-return{stroke:#65c5bf}.arrow-metadata{stroke:#cda36c}.arrow-success{stroke:#9ab873}.arrow-redelivery,.arrow-drop,.arrow-cancel{stroke:#d88796}
  </style>`);
  parts.push('</defs>');
  parts.push(`<rect class="canvas" width="${WIDTH}" height="${HEIGHT}"/><rect class="outer" x="28" y="28" width="1744" height="${HEIGHT - 56}" rx="28"/>`);
  parts.push(text('title', 900, 84, l.title, 'middle'));
  parts.push(text('subtitle', 900, 119, l.subtitle, 'middle'));
  parts.push(rect('overview', 80, 165, 1640, 310, 'call', 'frame', 24));
  parts.push(text('section', 120, 215, l.overview));
  parts.push(text('sectionHint', 120, 248, 'Flow<Message> · JetStreamSubscription · IterableConsumer · manual ack/nak/term'));
  const overviewX = [120, 665, 1210];
  l.overviewCards.forEach(([label, title, detail], index) => {
    const tone = index === 0 ? 'call' : index === 1 ? 'metadata' : 'success';
    const x = overviewX[index];
    parts.push(rect(`overview-${index + 1}`, x, 285, 470, 145, tone, 'card', 16));
    parts.push(text('mono', x + 24, 319, label));
    parts.push(text('cardTitle', x + 24, 354, title));
    lineText(parts, 'small', x + 24, 389, detail, 50, 24);
  });

  parts.push(rect('sequence-frame', 80, 520, 1640, 3850, 'call', 'frame', 24));
  parts.push(text('section', 120, 570, l.sequence));
  parts.push(text('sectionHint', 120, 603, 'Numbered message lanes · lifelines · activation bars · chronological branch frames'));
  const xPositions = { caller: 250, flow: 650, adapter: 1050, nats: 1450 };
  const participantNames = companion.participants.map((value) => ({ id: value.id, label: value.label[locale], role: value.role[locale], tone: value.tone }));
  participantNames.forEach((value) => {
    const color = value.tone === 'caller' ? palette.success : value.tone === 'flow' ? palette.return : value.tone === 'adapter' ? palette.metadata : palette.success;
    parts.push(`<rect id="participant-${value.id}" class="header" x="${xPositions[value.id] - 145}" y="650" width="290" height="96" rx="16" fill="${color.fill}" stroke="${color.stroke}" stroke-width="2" data-participant="${value.id}"/>`);
    parts.push(text('participant', xPositions[value.id], 690, value.label, 'middle'));
    parts.push(text('role', xPositions[value.id], 719, value.role, 'middle'));
    parts.push(`<line class="lifeline" x1="${xPositions[value.id]}" y1="746" x2="${xPositions[value.id]}" y2="4230" data-lifeline="${value.id}"/>`);
  });

  const firstY = 860;
  const rowHeight = 330;
  frames.forEach((frame, index) => {
    const y = firstY + index * rowHeight;
    const rowTone = frame.tone.startsWith('branch') ? frame.tone : frame.tone;
    const color = palette[rowTone];
    parts.push(`<rect id="row-${frame.id}" class="row" x="112" y="${y - 122}" width="1576" height="250" rx="16" fill="${color.fill}" fill-opacity=".34" stroke="#2f465f" stroke-width="1" data-step="${index + 1}"/>`);
    if (frame.id === 'redelivery') branchFrame(parts, 'alt-redelivery', y, l.alt, 'branch-redelivery');
    if (frame.id === 'drop') branchFrame(parts, 'else-drop', y, l.else, 'branch-drop');
    if (frame.id === 'cancel') branchFrame(parts, 'loop-cancel', y, l.loop, 'branch-cancel');
    parts.push(text('phase', 122, y - 101, frame.phase));
    message(parts, frame, index, xPositions, y);
    lineText(parts, 'body', 215, y + 47, frame.action, 118, 27);
    lineText(parts, 'small', 215, y + 101, `${locale === 'ko' ? 'Guardrail' : 'Guardrail'} · ${frame.guard}`, 118, 25);
    parts.push(text('note', 215, y + 166, `${locale === 'ko' ? 'Next' : 'Next'} · ${frame.next}`));
    parts.push(text('small', 215, y + 198, frame.signal));
  });

  parts.push(rect('boundary-frame', 120, 4260, 1560, 78, 'metadata', 'card', 14));
  parts.push(text('note', 900, 4309, `${l.adapter} · ${locale === 'ko' ? 'bounded channel / pending 관찰 / handle cleanup' : 'bounded channel / pending observation / handle cleanup'}  ↔  ${l.caller} · ${locale === 'ko' ? 'connection / durable consumer / ack policy / retry' : 'connection / durable consumer / ack policy / retry'}`, 'middle'));
  parts.push(text('footer', 900, 4470, l.footer, 'middle'));
  parts.push('</svg>');
  return `${parts.join('\n')}\n`;
}

function ledger(locale) {
  const sourcePath = locale === 'ko'
    ? 'src/content/docs/ko/manual/bluetape4k-projects/2.0/modules/bluetape4k-nats/jetstream-streams-consumers.md'
    : 'src/content/docs/manual/bluetape4k-projects/2.0/modules/bluetape4k-nats/jetstream-streams-consumers.md';
  const source = 'src/data/visual-companions/wave2-projects-nats-flow.mjs';
  const nodes = companion.frames.map((frame) => ({ id: frame.id, label: frame.phase[locale], source }));
  const edges = companion.frames.slice(0, -1).map((frame, index) => ({
    id: `${frame.id}-${companion.frames[index + 1].id}`,
    from: frame.id,
    to: companion.frames[index + 1].id,
    kind: companion.frames[index + 1].tone.startsWith('branch') ? 'branch' : 'sequence',
    source,
  }));
  edges.push(
    { id: 'deliver-ack-policy', from: 'deliver', to: 'ack', kind: 'caller-policy', source },
    { id: 'drop-caller-recovery', from: 'drop', to: 'terminal', kind: 'caller-recovery', source },
    { id: 'terminal-cold-loop', from: 'terminal', to: 'cold', kind: 'fresh-collection', source },
  );
  return `${JSON.stringify({
    kind: 'sequence',
    source: {
      question: locale === 'ko'
        ? 'NATS JetStream의 pull과 push consumer는 어떻게 하나의 cold bounded Flow<Message>로 합쳐지고, acknowledgement·redelivery·drop·cancellation 소유권을 어디에 남기는가?'
        : 'How do NATS JetStream pull and push consumers converge on one cold bounded Flow<Message>, and where do acknowledgement, redelivery, drop, and cancellation ownership remain?',
      revision: companion.sourceRevision,
      paths: [sourcePath, source],
    },
    references: [
      'public/assets/clinic-appointment-latest-fence-sequence-01-en.png',
      'public/assets/bluetape4k-leader-strategic-election-flow-01-en.png',
    ],
    nodes,
    edges,
    behavior: { branches: 3, loops: 1 },
    repairs: [],
  }, null, 2)}\n`;
}

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
  const svgPath = `${ASSET_DIR}/projects-nats-jetstream-flow-${locale}.svg`;
  const pngPath = `${ASSET_DIR}/projects-nats-jetstream-flow-${locale}.png`;
  output(svgPath, svg(locale));
  output(`${LEDGER_DIR}/projects-nats-jetstream-flow-${locale}.semantic.json`, ledger(locale));
  if (CHECK) {
    if (!existsSync(pngPath)) throw new Error(`Missing rendered PNG: ${pngPath}`);
  } else {
    execFileSync('cairosvg', [svgPath, '-o', pngPath, '-s', '2'], { stdio: 'inherit' });
    console.log(`WROTE ${pngPath}`);
  }
}
