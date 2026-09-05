import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { awsSqsExtendedCompanion as companion } from '../src/data/visual-companions/wave2-aws-sqs-extended-client.mjs';

const WIDTH = 1800;
const HEIGHT = 4220;
const ASSET_DIR = 'public/assets/visual-companions/wave2';
const LEDGER_DIR = 'docs/diagrams/visual-companions-wave2';
const CHECK = process.argv.includes('--check');

const palette = {
  call: { stroke: '#78a9d8', fill: '#213a54', marker: 'arrow-call' },
  return: { stroke: '#65c5bf', fill: '#1d4142', marker: 'arrow-return' },
  metadata: { stroke: '#cda36c', fill: '#493722', marker: 'arrow-metadata' },
  success: { stroke: '#9ab873', fill: '#2b432c', marker: 'arrow-success' },
  reject: { stroke: '#d88796', fill: '#4b2d39', marker: 'arrow-reject' },
};

const copy = {
  en: {
    title: 'AWS SQS Extended Client: follow the payload through cleanup',
    subtitle: 'Choose inline or S3 offload, restore the exact payload, then delete SQS before marker verification and payload cleanup.',
    overview: 'One payload, two transport paths, one acknowledgement invariant',
    overviewHint: 'inline keeps the body · offload signs a module-local pointer · SQS delete always precedes cleanup',
    overviewCards: [
      ['INLINE', 'Small payload stays in SQS', 'No S3 object, pointer, marker, or payload cleanup is created.'],
      ['OFFLOAD', 'Large payload moves through S3', 'Upload first, publish the signed pointer, then restore within the configured bounds.'],
      ['ACK + CLEANUP', 'Queue receipt is deleted first', 'Only a successful SQS delete may advance to marker verification and payload deletion.'],
    ],
    sequence: 'Producer → storage and queue → restore → handler → acknowledgement → cleanup',
    sequenceHint: 'Numbered message lanes · explicit branch frames · cleanup retry loop · source-backed ordering',
    inlineAlt: 'ALT · inline payload skips S3 upload, marker, and payload delete',
    restoreAlt: 'ALT · missing object or restore validation failure stops before handler',
    ackAlt: 'ALT · failed SQS delete forbids marker and payload cleanup',
    cleanupAlt: 'LOOP · failed payload delete returns an opaque cleanup handle',
    adapter: 'Adapter-owned boundary',
    caller: 'Caller-owned boundary',
    footer: `Issue #423 · source revision ${companion.sourceRevision.slice(0, 12)} · static fallback for the interactive payload lifecycle`,
  },
  ko: {
    title: 'AWS SQS Extended Client: SQS 삭제 후 payload를 정리합니다',
    subtitle: 'inline 또는 S3 offload를 선택하고 정확한 payload를 복원한 뒤 SQS를 먼저 삭제하고 marker 검증과 payload cleanup을 수행합니다.',
    overview: '하나의 payload, 두 개의 전송 path, 하나의 acknowledgement 불변식',
    overviewHint: 'inline은 body 유지 · offload는 module 전용 pointer 서명 · cleanup 전에 항상 SQS delete',
    overviewCards: [
      ['INLINE', '작은 payload는 SQS에 유지', 'S3 object, pointer, marker, payload cleanup을 만들지 않습니다.'],
      ['OFFLOAD', '큰 payload는 S3를 경유', '먼저 upload하고 signed pointer를 게시한 뒤 설정한 범위 안에서 복원합니다.'],
      ['ACK + CLEANUP', 'Queue receipt를 먼저 삭제', 'SQS delete가 성공한 뒤에만 marker 검증과 payload 삭제로 이동합니다.'],
    ],
    sequence: 'Producer → storage와 queue → restore → handler → acknowledgement → cleanup',
    sequenceHint: '번호가 있는 message lane · 명시적 branch frame · cleanup retry loop · source 기반 순서',
    inlineAlt: 'ALT · inline payload는 S3 upload, marker, payload delete를 건너뜁니다',
    restoreAlt: 'ALT · object가 없거나 restore 검증이 실패하면 handler 전에 중단합니다',
    ackAlt: 'ALT · SQS delete 실패 시 marker와 payload cleanup을 금지합니다',
    cleanupAlt: 'LOOP · payload delete 실패 시 불투명한 cleanup handle을 반환합니다',
    adapter: 'Adapter 소유 경계',
    caller: 'Caller 소유 경계',
    footer: `Issue #423 · source revision ${companion.sourceRevision.slice(0, 12)} · interactive payload lifecycle의 static fallback`,
  },
};

const participants = {
  en: [
    ['producer', 'Producer', 'size gate + idempotency'],
    ['s3', 'Amazon S3', 'payload + marker'],
    ['sqs', 'Amazon SQS', 'body or signed pointer'],
    ['consumer', 'Extended consumer', 'restore + acknowledgement'],
    ['handler', 'Application handler', 'business completion'],
  ],
  ko: [
    ['producer', 'Producer', 'size gate + idempotency'],
    ['s3', 'Amazon S3', 'payload + marker'],
    ['sqs', 'Amazon SQS', 'body 또는 signed pointer'],
    ['consumer', 'Extended consumer', 'restore + acknowledgement'],
    ['handler', 'Application handler', '업무 처리 완료'],
  ],
};

const rows = {
  en: [
    ['size-gate', 'metadata', 'producer', 'producer', 'Choose inline or offload', 'Validate strict UTF-8 size, maximum payload, queue policy, and the offload idempotency key.', 'Inline sends the body; offload computes a deterministic key and pointer.'],
    ['s3-upload', 'call', 'producer', 's3', 'Store the large payload', 'Upload the payload under the configured bucket, prefix, and encryption identity before SQS publication.', 'Upload failure stops before queue send.'],
    ['send-envelope', 'call', 'producer', 'sqs', 'Send body or signed pointer', 'Inline preserves the original body. Offload sends bt4k-sqs-extended/v1 with policy metadata and HMAC.', 'SQS send failure leaves an explicit orphan candidate.'],
    ['restore', 'return', 'sqs', 'consumer', 'Validate and restore', 'Recognized pointers must pass signature, queue policy, content, encryption, and bounded-size checks.', 'Missing or invalid objects stop before handler admission.'],
    ['handler', 'success', 'consumer', 'handler', 'Run the application handler', 'The handler receives the original payload and owns business authorization, idempotency, and side effects.', 'Handler failure preserves the receipt and payload for retry.'],
    ['handler-complete', 'return', 'handler', 'consumer', 'Complete business work', 'Only a completed handler advances to acknowledgement with the same identity-bound received message.', 'SQS receipt deletion is the next operation.'],
    ['sqs-ack', 'metadata', 'consumer', 'sqs', 'Delete the SQS receipt', 'Validate identity and policy, then delete the receipt before touching cleanup metadata or payload.', 'Failure forbids marker creation and payload deletion.'],
    ['marker', 'metadata', 'consumer', 's3', 'Create or verify cleanup marker', 'Bind queue digest, policy fingerprint, pointer digest, and marker version before payload deletion.', 'Foreign or unverifiable marker metadata blocks deletion.'],
    ['payload-delete', 'success', 'consumer', 's3', 'Delete or retry payload cleanup', 'Delete the exact payload object; on failure return an opaque, policy-bound SqsExtendedCleanupHandle.', 'cleanup(handle) retries only the verified payload cleanup.'],
  ],
  ko: [
    ['size-gate', 'metadata', 'producer', 'producer', 'inline 또는 offload 선택', 'Strict UTF-8 크기, 최대 payload, queue policy, offload idempotency key를 검증합니다.', 'inline은 body를 보내고 offload는 deterministic key와 pointer를 만듭니다.'],
    ['s3-upload', 'call', 'producer', 's3', '큰 payload 저장', 'SQS 게시 전에 설정한 bucket, prefix, encryption identity로 payload를 upload합니다.', 'Upload 실패는 queue send 전에 중단합니다.'],
    ['send-envelope', 'call', 'producer', 'sqs', 'body 또는 signed pointer 전송', 'inline은 원본 body를 유지하고 offload는 policy metadata와 HMAC을 포함한 bt4k-sqs-extended/v1을 보냅니다.', 'SQS send 실패는 명시적인 orphan 후보를 남깁니다.'],
    ['restore', 'return', 'sqs', 'consumer', '검증하고 복원', 'Pointer는 signature, queue policy, content, encryption, bounded-size 검사를 통과해야 합니다.', 'Object가 없거나 유효하지 않으면 handler 전에 중단합니다.'],
    ['handler', 'success', 'consumer', 'handler', 'Application handler 실행', 'Handler는 원본 payload를 받고 업무 인가, idempotency, side effect를 소유합니다.', 'Handler 실패 시 retry를 위해 receipt와 payload를 보존합니다.'],
    ['handler-complete', 'return', 'handler', 'consumer', '업무 처리 완료', '완료된 handler만 같은 identity-bound received message로 acknowledgement를 시작합니다.', '다음 작업은 SQS receipt 삭제입니다.'],
    ['sqs-ack', 'metadata', 'consumer', 'sqs', 'SQS receipt 삭제', 'Identity와 policy를 검증한 뒤 cleanup metadata나 payload보다 먼저 receipt를 삭제합니다.', '실패하면 marker 생성과 payload 삭제를 금지합니다.'],
    ['marker', 'metadata', 'consumer', 's3', 'Cleanup marker 생성 또는 검증', 'Payload 삭제 전에 queue digest, policy fingerprint, pointer digest, marker version을 묶습니다.', '다른 marker이거나 검증할 수 없으면 삭제를 차단합니다.'],
    ['payload-delete', 'success', 'consumer', 's3', 'Payload cleanup 완료 또는 재시도', '정확한 payload object를 삭제하고 실패 시 불투명한 policy-bound SqsExtendedCleanupHandle을 반환합니다.', 'cleanup(handle)은 검증된 payload cleanup만 재시도합니다.'],
  ],
};

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function marker(id, color) {
  return `<marker id="${id}" viewBox="0 0 10 10" markerWidth="16" markerHeight="16" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" data-role="sequence" data-tip-direction="positive-x"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}"/></marker>`;
}

function rect(id, x, y, width, height, tone, className = 'card', radius = 18, extra = '') {
  const color = palette[tone] ?? { stroke: '#3a506b', fill: '#172437' };
  return `<rect id="${id}" class="${className}" x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${color.fill}" stroke="${color.stroke}" ${extra}/>`;
}

function text(className, x, y, value, anchor = 'start') {
  return `<text class="${className}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(value)}</text>`;
}

function wrap(value, max = 105) {
  const lines = [];
  let line = '';
  for (const word of String(value).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && [...next].reduce((n, ch) => n + (/[가-힣]/.test(ch) ? 2 : 1), 0) > max) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function lineText(parts, className, x, y, value, max = 105, gap = 27) {
  wrap(value, max).slice(0, 3).forEach((line, index) => parts.push(text(className, x, y + index * gap, line)));
}

function svg(locale) {
  const l = copy[locale];
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title desc" data-intent="source-backed AWS SQS Extended Client payload lifecycle" data-source-read="${companion.sourceRevision}">`];
  parts.push(`<title id="title">${esc(l.title)}</title><desc id="desc">${esc(l.subtitle)}</desc><defs>`);
  for (const [name, value] of Object.entries(palette)) parts.push(marker(value.marker, value.stroke, name));
  parts.push(`<style>.canvas{fill:#0b111b}.outer{fill:none;stroke:#304760;stroke-width:2}.frame{fill:#111a28;fill-opacity:.86;stroke:#3a506b;stroke-width:2}.card,.activation,.labelPill{stroke-width:2}.title{font:700 44px "goorm Sans","Architects Daughter",sans-serif;fill:#f6f8fb}.subtitle{font:18px "goorm Sans Code","Comic Mono",monospace;fill:#aebed2}.section{font:700 27px "goorm Sans","Architects Daughter",sans-serif;fill:#f6f8fb}.hint,.small{font:15px "goorm Sans Code","Comic Mono",monospace;fill:#aebed2}.participant,.cardTitle{font:700 21px "goorm Sans","Architects Daughter",sans-serif;fill:#f6f8fb}.role{font:14px "goorm Sans Code","Comic Mono",monospace;fill:#aebed2}.body{font:17px "goorm Sans",sans-serif;fill:#d6e1ef}.mono,.labelText,.note{font:700 16px "goorm Sans Code","Comic Mono",monospace;fill:#f6f8fb}.phase{font:700 17px "goorm Sans",sans-serif;fill:#65c5bf}.num{font:700 17px "goorm Sans Code","Comic Mono",monospace;fill:#0b111b}.branchTitle{font:700 16px "goorm Sans Code","Comic Mono",monospace;fill:#d88796}.lifeline{stroke:#526b84;stroke-width:2;stroke-dasharray:8 10}.connector{fill:none;stroke-linecap:round;stroke-linejoin:round}</style></defs>`);
  parts.push(`<rect class="canvas" width="${WIDTH}" height="${HEIGHT}"/><rect class="outer" x="28" y="28" width="1744" height="4164" rx="28"/>`);
  parts.push(text('title', 900, 84, l.title, 'middle'), text('subtitle', 900, 119, l.subtitle, 'middle'));
  parts.push(rect('overview', 80, 165, 1640, 310, 'call', 'frame', 24), text('section', 120, 215, l.overview), text('hint', 120, 248, l.overviewHint));
  [120, 665, 1210].forEach((x, index) => {
    const tone = index === 0 ? 'call' : index === 1 ? 'metadata' : 'success';
    const [tag, title, detail] = l.overviewCards[index];
    parts.push(rect(`overview-${index + 1}`, x, 285, 470, 165, tone, 'card', 16), text('mono', x + 24, 319, tag), text('cardTitle', x + 24, 354, title));
    lineText(parts, 'small', x + 24, 389, detail, 50, 23);
  });
  parts.push(rect('sequence-frame', 80, 520, 1640, 3490, 'call', 'frame', 24), text('section', 120, 570, l.sequence), text('hint', 120, 603, l.sequenceHint));
  const xs = { producer: 180, s3: 520, sqs: 860, consumer: 1200, handler: 1540 };
  participants[locale].forEach(([id, label, role], index) => {
    const tone = index === 2 || index === 3 ? 'metadata' : index === 4 ? 'success' : 'call';
    parts.push(rect(`participant-${id}`, xs[id] - 135, 650, 270, 96, tone, 'card', 16, `data-participant="${id}"`), text('participant', xs[id], 689, label, 'middle'), text('role', xs[id], 718, role, 'middle'), `<line class="lifeline" x1="${xs[id]}" y1="746" x2="${xs[id]}" y2="3840" data-lifeline="${id}"/>`);
  });
  const firstY = 870;
  const rowHeight = 330;
  rows[locale].forEach(([id, tone, from, to, event, action, guard], index) => {
    const y = firstY + index * rowHeight;
    const color = palette[tone];
    parts.push(`<rect id="row-${id}" x="112" y="${y - 122}" width="1576" height="250" rx="16" fill="${color.fill}" fill-opacity=".34" stroke="#2f465f" data-step="${index + 1}"/>`);
    if (id === 'size-gate') parts.push(`<rect id="inline-branch" class="alt" x="100" y="${y - 116}" width="1600" height="250" rx="16" fill="none" stroke="${palette.metadata.stroke}" stroke-width="2" stroke-dasharray="10 8" data-branch="inline-offload"/>`, text('branchTitle', 1660, y - 94, l.inlineAlt, 'end'));
    if (id === 'restore') parts.push(`<rect id="restore-failure" class="alt" x="100" y="${y - 116}" width="1600" height="250" rx="16" fill="none" stroke="${palette.reject.stroke}" stroke-width="2" stroke-dasharray="10 8" data-branch="restore-failure"/>`, text('branchTitle', 1660, y - 94, l.restoreAlt, 'end'));
    if (id === 'sqs-ack') parts.push(`<rect id="ack-failure" class="alt" x="100" y="${y - 116}" width="1600" height="250" rx="16" fill="none" stroke="${palette.reject.stroke}" stroke-width="2" stroke-dasharray="10 8" data-branch="ack-failure"/>`, text('branchTitle', 1660, y - 94, l.ackAlt, 'end'));
    if (id === 'payload-delete') parts.push(`<rect id="cleanup-retry" class="alt" x="100" y="${y - 116}" width="1600" height="250" rx="16" fill="none" stroke="${palette.reject.stroke}" stroke-width="2" stroke-dasharray="10 8" data-branch="cleanup-retry" data-loop="cleanup-handle"/>`, text('branchTitle', 1660, y - 94, l.cleanupAlt, 'end'));
    parts.push(text('phase', 122, y - 98, `${index + 1} · ${event}`));
    if (from === to) {
      parts.push(`<path id="decision-${id}" data-decision="${id}" d="M ${xs[from]} ${y - 28} l 26 28 -26 28 -26 -28 Z" fill="${color.fill}" stroke="${color.stroke}" stroke-width="4"/>`);
    } else {
      const direction = xs[to] >= xs[from] ? 1 : -1;
      parts.push(`<path id="message-${id}" data-connector="message-${id}" data-source="participant-${from}" data-target="participant-${to}" class="connector" d="M ${xs[from] + direction * 22} ${y} H ${xs[to] - direction * 22}" stroke="${color.stroke}" stroke-width="4" marker-end="url(#${color.marker})"/>`);
    }
    const numberWidth = from === to ? 32 : 58;
    parts.push(rect(`label-${id}`, 122, y - 53, numberWidth, 34, tone, 'labelPill', 14), text('num', 122 + numberWidth / 2, y - 29, String(index + 1), 'middle'), text('labelText', 215, y - 29, event));
    if (from !== to) parts.push(`<rect class="activation" x="${xs[from] - 11}" y="${y - 36}" width="22" height="116" rx="8" fill="${color.fill}" stroke="${color.stroke}"/>`);
    if (from !== to) parts.push(`<rect class="activation" x="${xs[to] - 11}" y="${y + 26}" width="22" height="54" rx="8" fill="${color.fill}" stroke="${color.stroke}"/>`);
    lineText(parts, 'body', 215, y + 48, action, 116, 26);
    lineText(parts, 'small', 215, y + 101, `Guardrail · ${guard}`, 116, 24);
  });
  parts.push(rect('boundary-frame', 120, 3840, 1560, 105, 'metadata', 'card', 14), text('note', 900, 3883, `${l.adapter} · signed pointer / bounded restore / identity-bound ack / cleanup handle`, 'middle'), text('note', 900, 3917, `${l.caller} · bucket / IAM / encryption / lifecycle / retry / orphan cleanup`, 'middle'), text('small', 900, 4110, l.footer, 'middle'), '</svg>');
  return `${parts.join('\n')}\n`;
}

function ledger(locale) {
  const source = 'src/data/visual-companions/wave2-aws-sqs-extended-client.mjs';
  const manual = locale === 'ko'
    ? 'src/content/docs/ko/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging.md'
    : 'src/content/docs/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging.md';
  const localized = rows[locale];
  return `${JSON.stringify({
    kind: 'sequence',
    source: {
      question: locale === 'ko'
        ? 'SQS Extended Client는 inline과 offload payload를 어떻게 복원하고 SQS acknowledgement 후 marker와 payload를 정리하는가?'
        : 'How does the SQS Extended Client restore inline and offloaded payloads, then clean marker and payload only after SQS acknowledgement?',
      revision: companion.sourceRevision,
      paths: [manual, source],
    },
    references: [
      'public/assets/visual-companions/wave1/aws-sqs-reliability-en.png',
      'public/assets/visual-companions/wave2/aws-streams-shard-consumers-en.png',
    ],
    nodes: localized.map(([id, , , , label]) => ({ id, label, source })),
    edges: localized.slice(0, -1).map(([id], index) => ({ id: `${id}-${localized[index + 1][0]}`, from: id, to: localized[index + 1][0], kind: 'sequence', source })),
    behavior: { branches: 3, loops: 1 },
    repairs: [],
  }, null, 2)}\n`;
}

function output(path, content) {
  if (CHECK) {
    if (!existsSync(path) || readFileSync(path, 'utf8') !== content) throw new Error(`Generated output is stale: ${path}`);
  } else {
    writeFileSync(path, content, 'utf8');
    console.log(`WROTE ${path}`);
  }
}

mkdirSync(ASSET_DIR, { recursive: true });
mkdirSync(LEDGER_DIR, { recursive: true });
for (const locale of ['en', 'ko']) {
  const svgPath = `${ASSET_DIR}/${companion.slug}-${locale}.svg`;
  const pngPath = `${ASSET_DIR}/${companion.slug}-${locale}.png`;
  output(svgPath, svg(locale));
  output(`${LEDGER_DIR}/${companion.slug}-${locale}.semantic.json`, ledger(locale));
  if (CHECK) {
    if (!existsSync(pngPath)) throw new Error(`Missing rendered PNG: ${pngPath}`);
  } else {
    execFileSync('cairosvg', [svgPath, '-o', pngPath, '-s', '2'], { stdio: 'inherit' });
    console.log(`WROTE ${pngPath}`);
  }
}
