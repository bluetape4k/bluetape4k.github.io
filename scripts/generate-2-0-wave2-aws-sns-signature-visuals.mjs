import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { awsSnsSignatureCompanion as companion } from '../src/data/visual-companions/wave2-aws-sns-signature.mjs';

const WIDTH = 1800;
const HEIGHT = 3820;
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
    title: 'AWS SNS: trust is earned before handler admission',
    subtitle: 'Parse structure, reject an unknown TopicArn before network access, then verify the certificate chain and SignatureVersion 1/2.',
    overview: 'Two rejection zones protect one verified handler boundary',
    overviewCards: [
      ['UNTRUSTED', 'Structure is not authenticity', 'Parsed fields remain untrusted until topic, certificate, and signature checks pass.'],
      ['EARLY REJECT', 'Topic and certificate URL first', 'Unknown topics and invalid SNS certificate hosts make zero certificate requests.'],
      ['VERIFIED', 'Handler admission comes last', 'Notification dispatch and subscription confirmation are reachable only after verification.'],
    ],
    sequence: 'Untrusted request → early policy → cryptographic verification → explicit action',
    earlyAlt: 'ALT · malformed / unknown topic / invalid certificate URL → reject before network',
    cryptoAlt: 'ALT · certificate / timeout / version / signature failure → reject before handler',
    boundary: 'Verification boundary',
    caller: 'Caller-owned boundary',
    footer: `Issue #422 · source revision ${companion.sourceRevision.slice(0, 12)} · static fallback for the interactive security sequence`,
  },
  ko: {
    title: 'AWS SNS: handler 진입 전에 신뢰를 검증합니다',
    subtitle: '구조를 파싱하고 unknown TopicArn을 network 접근 전에 거부한 뒤 certificate chain과 SignatureVersion 1/2를 검증합니다.',
    overview: '두 개의 거부 구간이 하나의 verified handler 경계를 보호합니다',
    overviewCards: [
      ['UNTRUSTED', '구조와 신뢰는 다릅니다', '필드를 파싱해도 topic, 인증서, 서명 검사가 끝날 때까지 신뢰하지 않습니다.'],
      ['EARLY REJECT', 'Topic과 인증서 URL 우선', 'Unknown topic과 비허용 SNS certificate host는 인증서 요청 없이 거부합니다.'],
      ['VERIFIED', 'Handler 진입은 마지막', 'Notification dispatch와 subscription confirmation은 검증 성공 뒤에만 도달합니다.'],
    ],
    sequence: '신뢰하지 않는 요청 → 조기 정책 → 암호학적 검증 → 명시적 action',
    earlyAlt: 'ALT · malformed / unknown topic / invalid certificate URL → network 전에 거부',
    cryptoAlt: 'ALT · certificate / timeout / version / signature 실패 → handler 전에 거부',
    boundary: '검증 경계',
    caller: 'Caller 소유 경계',
    footer: `Issue #422 · source revision ${companion.sourceRevision.slice(0, 12)} · interactive security sequence의 static fallback`,
  },
};

const participants = {
  en: [
    ['endpoint', 'HTTP endpoint', 'untrusted request'],
    ['parser', 'Parser', 'structure + URL shape'],
    ['policy', 'Topic policy', 'exact allowlist'],
    ['manager', 'SnsMessageManager', 'certificate + signature'],
    ['handler', 'Handler', 'verified action only'],
  ],
  ko: [
    ['endpoint', 'HTTP endpoint', '신뢰하지 않는 요청'],
    ['parser', 'Parser', '구조 + URL 형식'],
    ['policy', 'Topic 정책', 'exact allowlist'],
    ['manager', 'SnsMessageManager', '인증서 + 서명'],
    ['handler', 'Handler', '검증된 action만'],
  ],
};

const rows = {
  en: [
    ['receive', 'call', 'endpoint', 'parser', 'Parse bounded SNS JSON', 'Validate type, required fields, message-specific shape, and SigningCertURL syntax.', 'Input remains untrusted.'],
    ['topic', 'metadata', 'parser', 'policy', 'Check exact TopicArn allowlist', 'The configured expected topic list decides admission before certificate retrieval.', 'Mismatch: HTTP 403, certificate requests = 0.'],
    ['admit-verifier', 'return', 'policy', 'parser', 'Allow the parsed topic', 'Only an exact configured match crosses into cryptographic verification.', 'Payload shape never grants trust.'],
    ['verify', 'call', 'parser', 'manager', 'Verify original JSON', 'SnsHttpMessageVerifier delegates to the AWS SDK manager after parser and topic checks.', 'The original signed fields remain intact.'],
    ['certificate', 'metadata', 'manager', 'endpoint', 'Retrieve or reuse signing certificate', 'Use the validated HTTPS SNS host; bounded cache and single-flight avoid unbounded fetches.', 'Certificate chain and validity must pass.'],
    ['signature', 'return', 'manager', 'parser', 'Verify canonical SignatureVersion 1 or 2', 'The AWS SDK canonicalizes the message and rejects unsupported versions or altered fields.', 'Mismatch: fail closed before handler.'],
    ['dispatch', 'success', 'parser', 'handler', 'Admit verified message', 'Notification payload conversion or NotificationStatus resolution starts only now.', 'Handler reached = true.'],
    ['action', 'success', 'handler', 'endpoint', 'Return or confirm explicitly', 'Business handling is caller-owned. Subscription confirmation requires an explicit handler call.', 'Verification success does not imply business completion.'],
  ],
  ko: [
    ['receive', 'call', 'endpoint', 'parser', '크기가 제한된 SNS JSON 파싱', 'Type, 필수 field, message별 구조와 SigningCertURL 형식을 검사합니다.', '입력은 아직 신뢰하지 않습니다.'],
    ['topic', 'metadata', 'parser', 'policy', 'Exact TopicArn allowlist 검사', '구성된 expected topic 목록이 인증서 조회 전에 진입 여부를 결정합니다.', '불일치: HTTP 403, 인증서 요청 = 0.'],
    ['admit-verifier', 'return', 'policy', 'parser', '파싱된 topic 허용', '정확히 구성된 topic만 암호학적 검증 경계로 이동합니다.', 'Payload 구조만으로 신뢰하지 않습니다.'],
    ['verify', 'call', 'parser', 'manager', '원본 JSON 검증', 'Parser와 topic 검사를 통과한 뒤 SnsHttpMessageVerifier가 AWS SDK manager를 호출합니다.', '서명된 원본 field를 유지합니다.'],
    ['certificate', 'metadata', 'manager', 'endpoint', '서명 인증서 조회 또는 cache 재사용', '검증된 HTTPS SNS host만 사용하며 bounded cache와 single-flight로 조회 수를 제한합니다.', 'Certificate chain과 유효 기간을 통과해야 합니다.'],
    ['signature', 'return', 'manager', 'parser', 'Canonical SignatureVersion 1 또는 2 검증', 'AWS SDK가 message를 canonicalize하고 지원하지 않는 version이나 변경된 field를 거부합니다.', '불일치: handler 전에 fail closed.'],
    ['dispatch', 'success', 'parser', 'handler', '검증된 message 진입', '이제 Notification payload 변환 또는 NotificationStatus 해석을 시작합니다.', 'Handler reached = true.'],
    ['action', 'success', 'handler', 'endpoint', '응답 또는 명시적 confirmation', '업무 처리는 caller가 소유합니다. Subscription confirmation은 handler가 명시적으로 호출합니다.', '검증 성공이 업무 완료를 뜻하지 않습니다.'],
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
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title desc" data-intent="source-backed AWS SNS security sequence" data-source-read="${companion.sourceRevision}">`];
  parts.push(`<title id="title">${esc(l.title)}</title><desc id="desc">${esc(l.subtitle)}</desc><defs>`);
  for (const [name, value] of Object.entries(palette)) parts.push(marker(value.marker, value.stroke, name));
  parts.push(`<style>.canvas{fill:#0b111b}.outer{fill:none;stroke:#304760;stroke-width:2}.frame{fill:#111a28;fill-opacity:.86;stroke:#3a506b;stroke-width:2}.card,.activation,.labelPill{stroke-width:2}.title{font:700 44px "goorm Sans","Architects Daughter",sans-serif;fill:#f6f8fb}.subtitle{font:18px "goorm Sans Code","Comic Mono",monospace;fill:#aebed2}.section{font:700 27px "goorm Sans","Architects Daughter",sans-serif;fill:#f6f8fb}.hint,.small{font:15px "goorm Sans Code","Comic Mono",monospace;fill:#aebed2}.participant,.cardTitle{font:700 21px "goorm Sans","Architects Daughter",sans-serif;fill:#f6f8fb}.role{font:14px "goorm Sans Code","Comic Mono",monospace;fill:#aebed2}.body{font:17px "goorm Sans",sans-serif;fill:#d6e1ef}.mono,.labelText,.note{font:700 16px "goorm Sans Code","Comic Mono",monospace;fill:#f6f8fb}.phase{font:700 17px "goorm Sans",sans-serif;fill:#65c5bf}.num{font:700 17px "goorm Sans Code","Comic Mono",monospace;fill:#0b111b}.branchTitle{font:700 16px "goorm Sans Code","Comic Mono",monospace;fill:#d88796}.lifeline{stroke:#526b84;stroke-width:2;stroke-dasharray:8 10}.connector{fill:none;stroke-linecap:round;stroke-linejoin:round}</style></defs>`);
  parts.push(`<rect class="canvas" width="${WIDTH}" height="${HEIGHT}"/><rect class="outer" x="28" y="28" width="1744" height="3764" rx="28"/>`);
  parts.push(text('title', 900, 84, l.title, 'middle'), text('subtitle', 900, 119, l.subtitle, 'middle'));
  parts.push(rect('overview', 80, 165, 1640, 310, 'call', 'frame', 24), text('section', 120, 215, l.overview), text('hint', 120, 248, 'parse ≠ trust · exact allowlist before network · verified action only'));
  [120, 665, 1210].forEach((x, index) => {
    const tone = index === 0 ? 'call' : index === 1 ? 'metadata' : 'success';
    const [tag, title, detail] = l.overviewCards[index];
    parts.push(rect(`overview-${index + 1}`, x, 285, 470, 165, tone, 'card', 16), text('mono', x + 24, 319, tag), text('cardTitle', x + 24, 354, title));
    lineText(parts, 'small', x + 24, 389, detail, 50, 23);
  });
  parts.push(rect('sequence-frame', 80, 520, 1640, 3090, 'call', 'frame', 24), text('section', 120, 570, l.sequence), text('hint', 120, 603, 'Numbered message lanes · lifelines · activation bars · chronological fail-closed frames'));
  const xs = { endpoint: 180, parser: 520, policy: 860, manager: 1200, handler: 1540 };
  participants[locale].forEach(([id, label, role], index) => {
    const tone = index === 2 || index === 3 ? 'metadata' : index === 4 ? 'success' : 'call';
    parts.push(rect(`participant-${id}`, xs[id] - 135, 650, 270, 96, tone, 'card', 16, `data-participant="${id}"`), text('participant', xs[id], 689, label, 'middle'), text('role', xs[id], 718, role, 'middle'), `<line class="lifeline" x1="${xs[id]}" y1="746" x2="${xs[id]}" y2="3480" data-lifeline="${id}"/>`);
  });
  const firstY = 870;
  const rowHeight = 330;
  rows[locale].forEach(([id, tone, from, to, event, action, guard], index) => {
    const y = firstY + index * rowHeight;
    const color = palette[tone];
    parts.push(`<rect id="row-${id}" x="112" y="${y - 122}" width="1576" height="250" rx="16" fill="${color.fill}" fill-opacity=".34" stroke="#2f465f" data-step="${index + 1}"/>`);
    if (id === 'topic') parts.push(`<rect id="early-reject" class="alt" x="100" y="${y - 116}" width="1600" height="250" rx="16" fill="none" stroke="${palette.reject.stroke}" stroke-width="2" stroke-dasharray="10 8" data-branch="early-reject"/>`, text('branchTitle', 1660, y - 94, l.earlyAlt, 'end'));
    if (id === 'signature') parts.push(`<rect id="crypto-reject" class="alt" x="100" y="${y - 116}" width="1600" height="250" rx="16" fill="none" stroke="${palette.reject.stroke}" stroke-width="2" stroke-dasharray="10 8" data-branch="crypto-reject"/>`, text('branchTitle', 1660, y - 94, l.cryptoAlt, 'end'));
    const direction = xs[to] >= xs[from] ? 1 : -1;
    parts.push(text('phase', 122, y - 98, `${index + 1} · ${event}`));
    parts.push(`<path id="message-${id}" data-connector="message-${id}" data-source="participant-${from}" data-target="participant-${to}" class="connector" d="M ${xs[from] + direction * 22} ${y} H ${xs[to] - direction * 22}" stroke="${color.stroke}" stroke-width="4" marker-end="url(#${color.marker})"/>`);
    parts.push(rect(`label-${id}`, 122, y - 53, 58, 34, tone, 'labelPill', 14), text('num', 151, y - 29, String(index + 1), 'middle'), text('labelText', 215, y - 29, event));
    parts.push(`<rect class="activation" x="${xs[from] - 11}" y="${y - 36}" width="22" height="116" rx="8" fill="${color.fill}" stroke="${color.stroke}"/><rect class="activation" x="${xs[to] - 11}" y="${y + 26}" width="22" height="54" rx="8" fill="${color.fill}" stroke="${color.stroke}"/>`);
    lineText(parts, 'body', 215, y + 48, action, 116, 26);
    lineText(parts, 'small', 215, y + 101, `Guardrail · ${guard}`, 116, 24);
  });
  parts.push(rect('boundary-frame', 120, 3440, 1560, 105, 'metadata', 'card', 14), text('note', 900, 3483, `${l.boundary} · parse / allowlist / certificate / signature`, 'middle'), text('note', 900, 3517, `${l.caller} · handler effects / subscription confirmation / retry and operations`, 'middle'), text('small', 900, 3710, l.footer, 'middle'), '</svg>');
  return `${parts.join('\n')}\n`;
}

function ledger(locale) {
  const source = 'src/data/visual-companions/wave2-aws-sns-signature.mjs';
  const manual = locale === 'ko'
    ? 'src/content/docs/ko/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging.md'
    : 'src/content/docs/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging.md';
  const localized = rows[locale];
  return `${JSON.stringify({
    kind: 'sequence',
    source: {
      question: locale === 'ko'
        ? '신뢰하지 않는 SNS HTTP 메시지는 어떤 순서로 구조, TopicArn, 인증서, 서명을 검증하고 언제 handler에 진입하는가?'
        : 'In what order does an untrusted SNS HTTP message validate structure, TopicArn, certificate, and signature before handler admission?',
      revision: companion.sourceRevision,
      paths: [manual, source],
    },
    references: [
      'public/assets/booking-reliability-sequence-01-en.png',
      'public/assets/visual-companions/wave2/projects-nats-jetstream-flow-en.png',
    ],
    nodes: localized.map(([id, , , , label]) => ({ id, label, source })),
    edges: localized.slice(0, -1).map(([id], index) => ({ id: `${id}-${localized[index + 1][0]}`, from: id, to: localized[index + 1][0], kind: 'sequence', source })),
    behavior: { branches: 2, loops: 0 },
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
