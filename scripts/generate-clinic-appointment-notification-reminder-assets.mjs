import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDirectory = resolve('public/assets');
const colors = Object.freeze({
  blue: '#60a5fa',
  cyan: '#2dd4bf',
  amber: '#fbbf24',
  red: '#fb7185',
  purple: '#a78bfa',
});

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const fonts = (locale) => locale === 'ko'
  ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif'
  : '"Architects Daughter", "Comic Sans MS", cursive';

const monoFonts = (locale) => locale === 'ko'
  ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif'
  : '"Comic Mono", "SFMono-Regular", monospace';

const definitions = (locale, includeMarkers = true) => `<defs>
  <linearGradient id="canvas" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071323"/><stop offset="1" stop-color="#101a31"/></linearGradient>
  <linearGradient id="screenCanvas" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#081321"/><stop offset="1" stop-color="#13243a"/></linearGradient>
  ${includeMarkers ? Object.entries(colors).map(([tone, color]) => `<marker id="${tone}Arrow" viewBox="0 0 10 10" markerWidth="16" markerHeight="16" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" data-role="sequence" data-size="16x16" data-tip-direction="positive-x"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}" data-solid-head="true"/></marker>`).join('\n  ') : ''}
  <style>
    .title{font-family:${fonts(locale)};font-size:${locale === 'ko' ? 38 : 34}px;font-weight:800;fill:#f4f8ff}
    .subtitle{font-family:${monoFonts(locale)};font-size:17px;fill:#a9bad0}
    .badge{font-family:${monoFonts(locale)};font-size:13px;font-weight:800;fill:#c9dcf3}
    .card-title{font-family:${fonts(locale)};font-size:${locale === 'ko' ? 20 : 18}px;font-weight:800;fill:#f4f8ff}
    .card-body{font-family:${monoFonts(locale)};font-size:${locale === 'ko' ? 14 : 13}px;fill:#b9cbe0}
    .card-code{font-family:${monoFonts(locale)};font-size:12px;font-weight:800;fill:#7fc9ff}
    .call-label{font-family:${monoFonts(locale)};font-size:${locale === 'ko' ? 13 : 12}px;fill:#e7f0fb}
    .route{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
    .blue-line{stroke:${colors.blue};marker-end:url(#blueArrow)}
    .cyan-line{stroke:${colors.cyan};marker-end:url(#cyanArrow)}
    .amber-line{stroke:${colors.amber};marker-end:url(#amberArrow)}
    .red-line{stroke:${colors.red};marker-end:url(#redArrow)}
    .purple-line{stroke:${colors.purple};marker-end:url(#purpleArrow)}
    .label-bg{fill:#0d1b2f;stroke:#2d4665;stroke-width:1.5}
    .decision-title{font-family:${fonts(locale)};font-size:${locale === 'ko' ? 24 : 22}px;font-weight:800;fill:#e5d9ff}
    .decision-body{font-family:${monoFonts(locale)};font-size:14px;fill:#d2c4f4}
    .outcome-code{font-family:${monoFonts(locale)};font-size:18px;font-weight:800;fill:#f8fbff}
    .outcome-body{font-family:${fonts(locale)};font-size:15px;fill:#b7c7da}
    .ui-eyebrow,.ui-label,.ui-mono,.ui-button{font-family:${monoFonts(locale)}}
    .ui-title,.ui-section,.ui-value,.ui-card-title{font-family:${fonts(locale)};font-weight:800;fill:#f4f8ff}
    .ui-eyebrow{font-size:12px;font-weight:800;fill:#7fc9ff}
    .ui-title{font-size:34px}.ui-section{font-size:${locale === 'ko' ? 20 : 18}px}.ui-card-title{font-size:22px}
    .ui-label,.ui-mono{font-size:13px;fill:#dce8f5}.ui-mono{font-size:12px}.ui-value{font-size:40px}
    .ui-button{font-size:${locale === 'ko' ? 13 : 12}px;font-weight:800}
    .ui-muted{font-family:${monoFonts(locale)};font-size:12px;fill:#91a8c3}
    .divider{stroke:#263d59;stroke-width:1}
  </style>
</defs>`.replace(/\n  \n/g, '\n');

const text = (className, x, y, value, extra = '') =>
  `<text class="${className}" x="${x}" y="${y}" ${extra}>${escapeXml(value)}</text>`;

const lineText = (className, x, y, lines, lineHeight = 24, extra = '') =>
  `<text class="${className}" x="${x}" y="${y}" ${extra}>${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`).join('')}</text>`;

function card({ id, x, y, width, height, title, body, tone = 'blue', code = '' }) {
  const accent = colors[tone];
  const titleY = y + 46;
  const bodyY = y + 82;
  return `<g id="${id}"><rect id="${id}-card" class="card" x="${x}" y="${y}" width="${width}" height="${height}" rx="22" fill="#112139" stroke="${accent}" stroke-width="2"/><rect x="${x + 20}" y="${y + 18}" width="8" height="${height - 36}" rx="4" fill="${accent}" opacity=".8"/>${code ? text('card-code', x + 46, y + 26, code) : ''}${text('card-title', x + 46, titleY, title)}${lineText('card-body', x + 46, bodyY, body, 23)}</g>`;
}

function labelBox({ x, y, width, label }) {
  return `<g class="relationshiplabel"><rect class="label-bg" x="${x}" y="${y}" width="${width}" height="28" rx="14"/>${text('call-label', x + width / 2, y + 19, label, 'text-anchor="middle"')}</g>`;
}

function connector({ id, from, to, tone, d, label, labelBox: box }) {
  return `<g data-from="${from}" data-to="${to}"><path id="${id}" class="route ${tone}-line" data-connector="${id}" data-source-node="${from}" data-target-node="${to}" d="${d}"/>${label ? labelBox({ ...box, label }) : ''}</g>`;
}

const flowCopy = {
  ko: {
    title: '예약 확정과 알림 전달의 책임을 나눈다',
    subtitle: '예약 트랜잭션은 의도를 기록하고, 알림 서비스는 발송 결과와 다음 작업을 남깁니다.',
    badges: ['SCOPE · 선택한 clinic', 'VERSION · f0c7614', 'DATA · 합성 시안'],
    cards: {
      appointmentCommand: ['예약 명령 트랜잭션', ['알림 의도 + 멱등성 키', 'provider 호출 없음'], 'COMMAND'],
      outbox: ['알림 아웃박스(outbox)', ['최소 행을 durable 저장', '예약 트랜잭션과 분리'], 'DURABLE'],
      routeGate: ['전달 경로 게이트', ['SHADOW · CANARY · ACTIVE', 'PAUSED는 provider 우회'], 'ROUTE'],
      leaseClaim: ['lease·fencing 선점', ['DB lease로 작업 선점', '중복 작업을 차단'], 'CLAIM'],
      profileResolver: ['회원 알림 프로필 resolver', ['발송 직전에 읽음', '연락처 · 언어 · 동의'], 'READ AT SEND'],
      templateRenderer: ['typed template renderer', ['동의·목적지 검증', '채널 payload 구성'], 'TYPED'],
      provider: ['제공자(provider) 채널', ['SMS·email 호출 경계', '원본 payload는 저장하지 않음'], 'BOUNDARY'],
      durableOutcome: ['durable outcome·STAFF 상태 조회', ['상태 + reason code', '다음 작업 + 다음 시각'], 'QUERY'],
      recoveryScanner: ['리마인더 복구 스캐너', ['future · due · missed', 'already exists로 수렴'], 'RECOVERY'],
      finalDecision: ['최종 상태 결정', ['SENT · SUPPRESSED', 'RETRY_WAIT · EXHAUSTED'], 'TERMINAL'],
    },
    labels: {
      commandOutbox: '알림 의도 기록', outboxRoute: 'route gate 확인', routeLease: '워커 선점', leaseProfile: '발송 시점 프로필', profileTemplate: 'typed payload', templateProvider: 'provider 호출', providerOutcome: '결과 저장', outcomeDecision: 'STAFF 조치 조회', recoveryFuture: 'future', recoveryDue: 'due enqueue', recoveryMissed: 'missed 억제', recoveryExisting: 'already exists', recoveryStatus: 'checkpoint 조회', durableDecision: '결과와 정책 확인', recoveryDecision: '복구 결과 확인',
    },
    outcomes: [
      ['SENT', '상태 조회에서 완료 확인', 'cyan'],
      ['SUPPRESSED', '동의·목적지 확인', 'purple'],
      ['RETRY_WAIT', '다음 시각까지 대기', 'amber'],
      ['EXHAUSTED', '알림 지원 담당자 문의', 'red'],
    ],
  },
  en: {
    title: 'Separate Appointment Confirmation from Notification Delivery',
    subtitle: 'The appointment transaction records intent; the notification service records delivery outcomes and next actions.',
    badges: ['SCOPE / selected clinic', 'VERSION / f0c7614', 'DATA / synthetic mockup'],
    cards: {
      appointmentCommand: ['Appointment command transaction', ['notification intent + idempotency key', 'no provider call'], 'COMMAND'],
      outbox: ['Notification outbox', ['store the minimum row durably', 'separate from booking transaction'], 'DURABLE'],
      routeGate: ['Delivery route gate', ['SHADOW · CANARY · ACTIVE', 'PAUSED bypasses provider'], 'ROUTE'],
      leaseClaim: ['Lease and fencing claim', ['claim work with a DB lease', 'fence duplicate workers'], 'CLAIM'],
      profileResolver: ['Member notification profile resolver', ['read at send time', 'contact · language · consent'], 'READ AT SEND'],
      templateRenderer: ['Typed template renderer', ['validate consent and destination', 'build channel payload'], 'TYPED'],
      provider: ['Provider channel', ['SMS and email call boundary', 'do not store raw payload'], 'BOUNDARY'],
      durableOutcome: ['Durable outcome and STAFF status query', ['status + reason code', 'next action + next time'], 'QUERY'],
      recoveryScanner: ['Reminder recovery scanner', ['future · due · missed', 'converge on already exists'], 'RECOVERY'],
      finalDecision: ['Final State Decision', ['SENT · SUPPRESSED', 'RETRY_WAIT · EXHAUSTED'], 'TERMINAL'],
    },
    labels: {
      commandOutbox: 'record notification intent', outboxRoute: 'check route gate', routeLease: 'claim work', leaseProfile: 'profile at send time', profileTemplate: 'typed payload', templateProvider: 'call provider', providerOutcome: 'store outcome', outcomeDecision: 'query STAFF action', recoveryFuture: 'future', recoveryDue: 'due enqueue', recoveryMissed: 'missed suppression', recoveryExisting: 'already exists', recoveryStatus: 'query checkpoint', durableDecision: 'check outcome and policy', recoveryDecision: 'check recovery result',
    },
    outcomes: [
      ['SENT', 'Re-read status to confirm', 'cyan'],
      ['SUPPRESSED', 'Check consent or destination', 'purple'],
      ['RETRY_WAIT', 'Wait for the next time', 'amber'],
      ['EXHAUSTED', 'Contact notification support', 'red'],
    ],
  },
};

function renderFlow(locale) {
  const copy = flowCopy[locale];
  const width = 1800;
  const height = 1710;
  const positions = {
    appointmentCommand: [80, 230, 320, 150],
    outbox: [500, 230, 320, 150],
    routeGate: [920, 230, 320, 150],
    leaseClaim: [1340, 230, 320, 150],
    profileResolver: [1340, 620, 320, 150],
    templateRenderer: [920, 620, 320, 150],
    provider: [500, 620, 320, 150],
    durableOutcome: [80, 620, 320, 150],
    recoveryScanner: [80, 930, 420, 150],
    finalDecision: [600, 930, 560, 190],
  };
  const renderedCards = Object.entries(positions).map(([id, [x, y, w, h]]) => {
    if (id === 'finalDecision') return '';
    const [title, body, code] = copy.cards[id];
    const tone = id === 'finalDecision' ? 'purple' : id === 'recoveryScanner' ? 'amber' : id === 'provider' ? 'red' : 'blue';
    return card({ id, x, y, width: w, height: h, title, body, tone, code });
  }).join('\n');
  const connectors = [
    connector({ id: 'command-outbox', from: 'appointmentCommand', to: 'outbox', tone: 'blue', d: 'M400 305 H500', label: copy.labels.commandOutbox, labelBox: { x: 390, y: 185, width: 200 } }),
    connector({ id: 'outbox-route', from: 'outbox', to: 'routeGate', tone: 'purple', d: 'M820 305 H920', label: copy.labels.outboxRoute, labelBox: { x: 810, y: 185, width: 200 } }),
    connector({ id: 'route-lease', from: 'routeGate', to: 'leaseClaim', tone: 'blue', d: 'M1240 305 H1340', label: copy.labels.routeLease, labelBox: { x: 1230, y: 185, width: 200 } }),
    connector({ id: 'lease-profile', from: 'leaseClaim', to: 'profileResolver', tone: 'cyan', d: 'M1500 380 V620', label: copy.labels.leaseProfile, labelBox: { x: 1515, y: 475, width: 240 } }),
    connector({ id: 'profile-template', from: 'profileResolver', to: 'templateRenderer', tone: 'cyan', d: 'M1340 695 H1240', label: copy.labels.profileTemplate, labelBox: { x: 1170, y: 575, width: 240 } }),
    connector({ id: 'template-provider', from: 'templateRenderer', to: 'provider', tone: 'amber', d: 'M920 695 H820', label: copy.labels.templateProvider, labelBox: { x: 770, y: 575, width: 200 } }),
    connector({ id: 'provider-outcome', from: 'provider', to: 'durableOutcome', tone: 'cyan', d: 'M500 695 H400', label: copy.labels.providerOutcome, labelBox: { x: 310, y: 575, width: 230 } }),
    connector({ id: 'durable-decision', from: 'durableOutcome', to: 'finalDecision', tone: 'blue', d: 'M240 770 V850 Q240 880 270 880 H570 Q600 880 600 910 V930', label: copy.labels.durableDecision, labelBox: { x: 300, y: 820, width: 280 } }),
    connector({ id: 'recovery-decision', from: 'recoveryScanner', to: 'finalDecision', tone: 'amber', d: 'M500 1005 H600' }),
    connector({ id: 'recovery-status', from: 'recoveryScanner', to: 'durableOutcome', tone: 'blue', d: 'M160 930 V770', label: copy.labels.recoveryStatus, labelBox: { x: 10, y: 820, width: 200 } }),
  ].join('\n');
  const outcomeCards = copy.outcomes.map(([code, body, tone], index) => {
    const x = 72 + index * 420;
    return `<g id="outcome-${index}"><rect id="outcome-${index}-card" class="card" x="${x}" y="1340" width="360" height="190" rx="22" fill="#101f34" stroke="${colors[tone]}" stroke-width="2"/>${text('outcome-code', x + 180, 1398, code, 'text-anchor="middle"')}${text('outcome-body', x + 180, 1440, body, 'text-anchor="middle"')}${text('outcome-body', x + 180, 1492, locale === 'ko' ? '조치 큐에서 확인' : 'visible in the action queue', 'text-anchor="middle"')}</g>`;
  }).join('\n');
  const outcomePaths = [
    ['outcome-0', 'M720 1120 V1160 Q720 1190 690 1190 H280 Q250 1190 250 1220 V1340', 'cyan'],
    ['outcome-1', 'M820 1120 V1200 Q820 1230 790 1230 H700 Q670 1230 670 1260 V1340', 'purple'],
    ['outcome-2', 'M940 1120 V1240 Q940 1270 970 1270 H1060 Q1090 1270 1090 1300 V1340', 'amber'],
    ['outcome-3', 'M1040 1120 V1140 Q1040 1170 1070 1170 H1480 Q1510 1170 1510 1200 V1340', 'red'],
  ].map(([target, d, tone]) => `<path id="decision-${target}" class="route ${tone}-line" data-connector="decision-${target}" data-source-node="finalDecision" data-target-node="${target}" d="${d}"/>`).join('\n');
  const legend = `${text('ui-muted', 72, 1630, locale === 'ko' ? '실선은 명시적 기록·호출 경로입니다. 결과 분기는 각각 독립된 rounded orthogonal 경로입니다.' : 'Solid lines are explicit record and call paths. Every outcome branch is an independent rounded orthogonal route.')}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc" data-locale="${locale}">
<title id="title">${escapeXml(copy.title)}</title><desc id="desc">${escapeXml(copy.subtitle)}</desc>
${definitions(locale)}
<rect width="${width}" height="${height}" fill="url(#canvas)"/><rect x="24" y="24" width="1752" height="1662" rx="32" fill="none" stroke="#2d4665" stroke-width="2"/>
${text('title', 64, 76, copy.title)}${text('subtitle', 66, 108, copy.subtitle)}
${copy.badges.map((badge, index) => `<rect x="${72 + index * 330}" y="130" width="300" height="34" rx="17" fill="#12243a" stroke="#3a5877"/>${text('badge', 222 + index * 330, 152, badge, 'text-anchor="middle"')}`).join('')}
${renderedCards}
${connectors}
<rect class="card" id="finalDecision-card" x="600" y="930" width="560" height="190" rx="22" fill="#171b36" stroke="${colors.purple}" stroke-width="2" opacity=".96"/>
${text('decision-title', 880, 1000, copy.cards.finalDecision[0], 'text-anchor="middle"')}${lineText('decision-body', 880, 1040, copy.cards.finalDecision[1], 26, 'text-anchor="middle"')}
${outcomePaths}${outcomeCards}${legend}
</svg>`;
}

const screenCopy = {
  ko: {
    eyebrow: 'STAFF 운영 화면 · 시안', title: '알림 전달 운영 대시보드', subtitle: '지금 확인할 상태와 다음 작업을 한 화면에서 분리해 보여 줍니다.', scope: '클리닉 A · 선택한 운영 범위', route: 'ACTIVE · 단일 provider 경로', sample: '예시 수치 · 환자 식별정보 없음',
    metrics: [['발송 가능 대기', '18', 'outbox 대기'], ['재시도 대기', '4', '다음 시각 있음'], ['억제', '3', '동의·목적지 확인'], ['소진', '1', '지원 요청 필요']],
    queueTitle: '조치 큐', queueMeta: 'reason code 우선 · 오래된 항목부터', headers: ['항목 참조', '상태', 'reason code', '권장 조치', '다음 시각'],
    rows: [['n_7F3A…91C2', 'RETRY_WAIT', 'PROVIDER_TIMEOUT', '다음 시각에 재조회', '10:42'], ['n_2B19…4D08', 'SUPPRESSED', 'CONSENT_DENIED', '회원 동의 설정 확인', '—'], ['n_93DE…7A40', 'SUPPRESSED', 'DESTINATION_UNAVAILABLE', '회원 연락처 확인', '—'], ['n_4C01…B8E7', 'EXHAUSTED', 'DELIVERY_EXHAUSTED', '알림 지원 담당자 문의', '—']],
    selectedTitle: '선택한 항목', selected: [['tenant·clinic', 'clinic-a · dermatology'], ['status', 'RETRY_WAIT'], ['reason code', 'PROVIDER_TIMEOUT'], ['next attempt', '2026-08-17 10:42']], selectedNote: '이름·전화번호·본문·provider 원본 오류는 표시하지 않습니다.',
    recoveryTitle: '리마인더 복구 · 보조 패널', recoveryMeta: 'bounded scan · checkpoint 2026-08-17T09:00Z', recovery: [['notYetDue', '26', '미래 시각 유지'], ['enqueued', '7', 'catch-up enqueue'], ['suppressed', '2', 'missed window'], ['alreadyExists', '3', '같은 키로 수렴']],
    footer: '운영 화면 시안 · 구현 상태와 운영 계약을 바탕으로 한 합성 자료 · 실제 화면 캡처 아님',
  },
  en: {
    eyebrow: 'STAFF OPERATIONS SCREEN / DESIGN MOCKUP', title: 'Notification delivery dashboard', subtitle: 'Separate the states to inspect now from the next task to perform.', scope: 'Clinic A / selected operating scope', route: 'ACTIVE / single provider route', sample: 'Illustrative values / no patient identifiers',
    metrics: [['Ready to send', '18', 'outbox backlog'], ['Retry wait', '4', 'next time recorded'], ['Suppressed', '3', 'check consent or destination'], ['Exhausted', '1', 'support action needed']],
    queueTitle: 'Action queue', queueMeta: 'reason code first / oldest item first', headers: ['Item ref', 'State', 'Reason code', 'Recommended action', 'Next time'],
    rows: [['n_7F3A…91C2', 'RETRY_WAIT', 'PROVIDER_TIMEOUT', 'Re-read at next time', '10:42'], ['n_2B19…4D08', 'SUPPRESSED', 'CONSENT_DENIED', 'Check member consent setting', '—'], ['n_93DE…7A40', 'SUPPRESSED', 'DESTINATION_UNAVAILABLE', 'Check member contact', '—'], ['n_4C01…B8E7', 'EXHAUSTED', 'DELIVERY_EXHAUSTED', 'Contact notification support', '—']],
    selectedTitle: 'Selected item', selected: [['tenant / clinic', 'clinic-a / dermatology'], ['status', 'RETRY_WAIT'], ['reason code', 'PROVIDER_TIMEOUT'], ['next attempt', '2026-08-17 10:42']], selectedNote: 'Names, phone numbers, body text, and raw provider errors stay hidden.',
    recoveryTitle: 'Reminder recovery / supporting panel', recoveryMeta: 'bounded scan / checkpoint 2026-08-17T09:00Z', recovery: [['notYetDue', '26', 'keep future time'], ['enqueued', '7', 'catch-up enqueue'], ['suppressed', '2', 'missed window'], ['alreadyExists', '3', 'converge on same key']],
    footer: 'Operations screen mockup / synthetic source-backed material / not a production screenshot',
  },
};

function renderScreen(locale) {
  const copy = screenCopy[locale];
  const width = 1800;
  const height = 1320;
  const metricCards = copy.metrics.map(([label, value, detail], index) => {
    const x = 72 + index * 414;
    const accent = [colors.cyan, colors.amber, colors.purple, colors.red][index];
    return `<rect class="card" x="${x}" y="250" width="390" height="142" rx="20" fill="#12243a" stroke="${accent}" stroke-width="2"/><rect x="${x + 22}" y="274" width="8" height="94" rx="4" fill="${accent}"/>${text('ui-mono', x + 50, 284, label, 'fill="#91a8c3"')}${text('ui-value', x + 50, 342, value)}${text('ui-muted', x + 178, 339, detail)}`;
  }).join('\n');
  const rowMarkup = copy.rows.map((row, index) => {
    const y = 564 + index * 68;
    const stateColor = row[1] === 'EXHAUSTED' ? colors.red : row[1] === 'SUPPRESSED' ? colors.purple : colors.amber;
    return `<rect x="74" y="${y - 38}" width="1060" height="64" fill="${index % 2 === 0 ? '#14263d' : '#102035'}"/><text class="ui-mono" x="98" y="${y}" fill="#dce8f5">${escapeXml(row[0])}</text><text class="ui-mono" x="292" y="${y}" fill="${stateColor}">${escapeXml(row[1])}</text><text class="ui-mono" x="510" y="${y}" fill="#9fd3ff">${escapeXml(row[2])}</text><text class="ui-label" x="740" y="${y}">${escapeXml(row[3])}</text><text class="ui-mono" x="1082" y="${y}" text-anchor="end" fill="#b7c7da">${escapeXml(row[4])}</text>`;
  }).join('\n');
  const selectedRows = copy.selected.map(([label, value], index) => {
    const x = 1210 + (index % 2) * 260;
    const y = 558 + Math.floor(index / 2) * 86;
    return `${text('ui-muted', x, y, label)}${text('ui-label', x, y + 28, value)}`;
  }).join('\n');
  const recoveryRows = copy.recovery.map(([label, value, detail], index) => {
    const x = 96 + index * 410;
    const accent = [colors.blue, colors.cyan, colors.red, colors.purple][index];
    return `<rect x="${x}" y="1002" width="370" height="176" rx="18" fill="#11243a" stroke="${accent}" stroke-width="2"/>${text('ui-mono', x + 24, 1038, label, `fill="${accent}" font-weight="800"`)}${text('ui-value', x + 24, 1104, value)}${text('ui-label', x + 24, 1142, detail)}`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc" data-locale="${locale}">
<title id="title">${escapeXml(copy.title)}</title><desc id="desc">${escapeXml(copy.subtitle)}</desc>
${definitions(locale, false)}
<rect width="${width}" height="${height}" fill="#07111e"/><rect x="30" y="28" width="1740" height="1264" rx="30" fill="url(#screenCanvas)" stroke="#3b5574" stroke-width="2"/>
${text('ui-eyebrow', 72, 72, copy.eyebrow)}${text('ui-title', 72, 120, copy.title)}${text('ui-label', 72, 154, copy.subtitle)}${text('ui-label', 1725, 110, copy.scope, 'text-anchor="end"')}${text('ui-mono', 1725, 140, copy.route, 'text-anchor="end" fill="#74e4d1"')}${text('ui-muted', 1725, 174, copy.sample, 'text-anchor="end"')}
${metricCards}
${text('ui-section', 72, 452, copy.queueTitle)}${text('ui-muted', 1134, 452, copy.queueMeta, 'text-anchor="end"')}
<rect x="70" y="470" width="1070" height="370" rx="18" fill="#101d30" stroke="#2f4865"/><rect x="72" y="472" width="1066" height="52" rx="16" fill="#17263a"/>${text('ui-mono', 98, 505, copy.headers[0], 'fill="#7189a4"')}${text('ui-mono', 292, 505, copy.headers[1], 'fill="#7189a4"')}${text('ui-mono', 510, 505, copy.headers[2], 'fill="#7189a4"')}${text('ui-mono', 740, 505, copy.headers[3], 'fill="#7189a4"')}${text('ui-mono', 1082, 505, copy.headers[4], 'text-anchor="end" fill="#7189a4"')}${rowMarkup}
<rect x="1180" y="470" width="550" height="370" rx="18" fill="#111f32" stroke="#2f4865"/>${text('ui-section', 1210, 512, copy.selectedTitle)}<rect x="1570" y="486" width="130" height="30" rx="8" fill="#233f51"/>${text('ui-mono', 1635, 507, 'STAFF', 'text-anchor="middle" fill="#74e4d1" font-weight="800"')}${selectedRows}<line class="divider" x1="1210" y1="770" x2="1698" y2="770"/>${text('ui-label', 1210, 805, copy.selectedNote, 'fill="#fbbf24"')}
${text('ui-section', 72, 928, copy.recoveryTitle)}${text('ui-muted', 1725, 928, copy.recoveryMeta, 'text-anchor="end"')}${recoveryRows}
${text('ui-muted', 1725, 1250, copy.footer, 'text-anchor="end"')}
</svg>`;
}

await mkdir(outputDirectory, { recursive: true });
for (const locale of ['ko', 'en']) {
  const assets = [
    [`clinic-appointment-notification-reminder-operations-screen-${locale}`, renderScreen(locale)],
    [`clinic-appointment-notification-reminder-flow-01-${locale}`, renderFlow(locale)],
  ];
  for (const [stem, svg] of assets) {
    const svgPath = resolve(outputDirectory, `${stem}.svg`);
    const pngPath = resolve(outputDirectory, `${stem}.png`);
    await writeFile(svgPath, `${svg.trim()}\n`, 'utf8');
    execFileSync('xmllint', ['--noout', svgPath], { stdio: 'inherit' });
    execFileSync('cairosvg', [svgPath, '-o', pngPath, '-s', '2'], { stdio: 'inherit' });
  }
}
