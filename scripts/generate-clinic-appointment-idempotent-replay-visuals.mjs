import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDirectory = resolve('public/assets');
const colors = Object.freeze({
  blue: '#60a5fa',
  cyan: '#2dd4bf',
  amber: '#fbbf24',
  purple: '#a78bfa',
  red: '#fb7185',
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
  ? '"goorm Sans Code", "goorm Sans", monospace'
  : '"Comic Mono", "SFMono-Regular", monospace';

const text = (className, x, y, value, extra = '') =>
  `<text class="${className}" x="${x}" y="${y}" ${extra}>${escapeXml(value)}</text>`;

const lines = (className, x, y, values, lineHeight = 23, extra = '') =>
  `<text class="${className}" x="${x}" y="${y}" ${extra}>${values.map((value, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(value)}</tspan>`).join('')}</text>`;

const definitions = (locale, sequence = false) => {
  const markers = Object.entries(colors).map(([tone, color]) => `<marker id="${sequence ? 'sequence-' : ''}${tone}-arrow" viewBox="0 0 10 10" markerWidth="16" markerHeight="16" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" data-role="${sequence ? 'sequence' : 'diagram'}" data-size="16x16" data-tip-direction="positive-x">
      <path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}" data-solid-head="true"/>
    </marker>`).join('');
  return `<defs>
    <linearGradient id="canvas" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071323"/><stop offset="1" stop-color="#111c32"/></linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#091321"/><stop offset="1" stop-color="#101b2e"/></linearGradient>
    ${markers}
    <style>
      .title{font-family:${fonts(locale)};font-size:38px;font-weight:800;fill:#f4f8ff}
      .subtitle{font-family:${monoFonts(locale)};font-size:17px;fill:#a9bad0}
      .badge{font-family:${monoFonts(locale)};font-size:13px;font-weight:800;fill:#c9dcf3}
      .participant{font-family:${fonts(locale)};font-size:${locale === 'ko' ? 19 : 18}px;font-weight:800;fill:#f4f8ff}
      .role{font-family:${monoFonts(locale)};font-size:13px;fill:#9fb3cb}
      .lifeline{stroke:#304964;stroke-width:2;stroke-dasharray:7 9}
      .activation{fill:#182c43;stroke:#50708e;stroke-width:1.5}
      .phase{fill:#0b192c;stroke:#263d59;stroke-width:1.5}
      .phase-label{font-family:${monoFonts(locale)};font-size:13px;font-weight:800;fill:#7fc9ff}
      .call{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
      .call-label{font-family:${monoFonts(locale)};font-size:${locale === 'ko' ? 13 : 12}px;fill:#e7f0fb}
      .pill{fill:#0d1b2f;stroke-width:1.5}
      .pill-number{font-family:${monoFonts(locale)};font-size:12px;font-weight:800;fill:#f8fbff}
      .decision{fill:#171b36;stroke:#a78bfa;stroke-width:2}
      .decision-title{font-family:${fonts(locale)};font-size:${locale === 'ko' ? 23 : 21}px;font-weight:800;fill:#e5d9ff}
      .decision-body{font-family:${monoFonts(locale)};font-size:14px;fill:#d2c4f4}
      .outcome-code{font-family:${monoFonts(locale)};font-size:17px;font-weight:800;fill:#f8fbff}
      .outcome-body{font-family:${fonts(locale)};font-size:14px;fill:#b7c7da}
      .ui-eyebrow,.ui-label,.ui-mono,.ui-button{font-family:${monoFonts(locale)}}
      .ui-title,.ui-section,.ui-value,.ui-card-title{font-family:${fonts(locale)};font-weight:800;fill:#f4f8ff}
      .ui-eyebrow{font-size:12px;font-weight:800;fill:#7fc9ff}
      .ui-title{font-size:34px}.ui-section{font-size:${locale === 'ko' ? 20 : 18}px}.ui-card-title{font-size:21px}
      .ui-label,.ui-mono{font-size:13px;fill:#dce8f5}.ui-mono{font-size:12px}.ui-value{font-size:40px}
      .ui-button{font-size:${locale === 'ko' ? 13 : 12}px;font-weight:800}.ui-muted{font-family:${monoFonts(locale)};font-size:12px;fill:#91a8c3}
      .divider{stroke:#263d59;stroke-width:1}
    </style>
  </defs>`;
};

const sequenceCopy = {
  ko: {
    title: '재시도와 replay가 있어도 예약은 한 번만 바꾼다',
    subtitle: 'HTTP 멱등성, inbox 중복 방지, quarantine 재처리를 하나의 상태 결정으로 연결합니다.',
    badges: ['SCOPE · tenant + clinic', 'IDENTITY · commandId + requestId', 'DATA · 합성 시안'],
    participants: [
      ['호출자', 'client / retry'],
      ['예약 API', 'HTTP boundary'],
      ['예약 트랜잭션', 'aggregate + outbox'],
      ['소비 런타임', 'inbox + handler'],
      ['STAFF replay', 'approval + audit'],
    ],
    phases: ['첫 요청과 HTTP 재시도', 'relay redelivery와 consumer 중복', 'quarantine replay와 최종 상태'],
    messages: [
      ['commandId와 요청 본문 전송', 0, 1, 'blue'],
      ['fingerprint 확인 · bounded wait', 1, 2, 'cyan'],
      ['예약 변경 + outbox를 같은 transaction에 커밋', 2, 3, 'blue'],
      ['같은 commandId 재시도 → 저장된 결과 replay', 1, 2, 'amber'],
      ['event redelivery · logicalConsumerId로 inbox 시작', 2, 3, 'purple'],
      ['이미 PROCESSED면 handler와 side effect를 건너뜀', 3, 4, 'cyan'],
      ['실패 시 RETRYABLE → 시도 한도 초과면 QUARANTINED', 3, 4, 'red'],
      ['requestId · scope · provenance를 확인한 replay 승인', 4, 3, 'amber'],
      ['같은 logical identity로 quarantine row를 재처리', 4, 3, 'purple'],
      ['PROCESSED · DUPLICATE · RETRYABLE · QUARANTINED 결정 기록', 3, 4, 'cyan'],
    ],
    decision: '최종 상태 결정',
    decisionBody: ['한 요청·한 논리 소비자·한 replay 범위마다', '상태와 다음 작업을 하나의 결과로 남긴다'],
    outcomes: [
      ['PROCESSED', '예약 변경과 side effect 완료', 'cyan'],
      ['DUPLICATE', '기존 결과 재사용 · 재변경 없음', 'blue'],
      ['RETRYABLE / QUARANTINED', '다음 시도 또는 STAFF 검토', 'amber'],
    ],
    footer: '실선은 실제 기록·호출 경로입니다. 각 결과 분기는 종료 상태 결정에서 독립적으로 뻗습니다.',
  },
  en: {
    title: 'Retries and replay must change an appointment only once',
    subtitle: 'Connect HTTP idempotency, inbox deduplication, and quarantine replay to one outcome decision.',
    badges: ['SCOPE / tenant + clinic', 'IDENTITY / commandId + requestId', 'DATA / synthetic mockup'],
    participants: [
      ['Caller', 'client / retry'],
      ['Appointment API', 'HTTP boundary'],
      ['Appointment tx', 'aggregate + outbox'],
      ['Consumer runtime', 'inbox + handler'],
      ['STAFF replay', 'approval + audit'],
    ],
    phases: ['First request and HTTP retry', 'Relay redelivery and consumer duplicate', 'Quarantine replay and final outcome'],
    messages: [
      ['send commandId and request body', 0, 1, 'blue'],
      ['check fingerprint and bounded wait', 1, 2, 'cyan'],
      ['commit appointment change and outbox in one transaction', 2, 3, 'blue'],
      ['same commandId retry → replay stored result', 1, 2, 'amber'],
      ['event redelivery → begin inbox by logicalConsumerId', 2, 3, 'purple'],
      ['if already PROCESSED, skip handler and side effects', 3, 4, 'cyan'],
      ['failure becomes RETRYABLE → QUARANTINED after the attempt limit', 3, 4, 'red'],
      ['approve replay after requestId, scope, and provenance checks', 4, 3, 'amber'],
      ['redrive the quarantine row with the same logical identity', 4, 3, 'purple'],
      ['record PROCESSED, DUPLICATE, RETRYABLE, or QUARANTINED', 3, 4, 'cyan'],
    ],
    decision: 'Final State Decision',
    decisionBody: ['For each command, logical consumer, and replay scope,', 'persist the state and next action as one outcome.'],
    outcomes: [
      ['PROCESSED', 'appointment change and side effect complete', 'cyan'],
      ['DUPLICATE', 'reuse prior result · no second change', 'blue'],
      ['RETRYABLE / QUARANTINED', 'next attempt or STAFF review', 'amber'],
    ],
    footer: 'Solid lines are explicit record and call paths. Every outcome branch leaves the final state decision independently.',
  },
};

function sequencePill(number, label, x, y, width, tone) {
  return `<g class="sequence-message"><rect class="pill" x="${x}" y="${y}" width="${width}" height="42" rx="21" stroke="${colors[tone]}"/><circle cx="${x + 21}" cy="${y + 21}" r="14" fill="${colors[tone]}" fill-opacity=".18" stroke="${colors[tone]}"/><text class="pill-number num" x="${x + 21}" y="${y + 25}" text-anchor="middle">${number}</text><text class="call-label" x="${x + 45}" y="${y + 26}">${escapeXml(label)}</text></g>`;
}

function renderSequence(locale) {
  const copy = sequenceCopy[locale];
  const width = 1880;
  const height = 2300;
  const participantXs = [170, 550, 930, 1310, 1690];
  const participantIds = ['caller', 'api', 'transaction', 'consumer', 'replay'];
  const headerY = 190;
  const rowYs = [430, 570, 710, 850, 990, 1130, 1270, 1410, 1550, 1690];
  const headerMarkup = copy.participants.map(([title, role], index) => {
    const x = participantXs[index] - 145;
    return `<g id="${participantIds[index]}" data-node="true"><rect id="${participantIds[index]}-card" x="${x}" y="${headerY}" width="290" height="104" rx="20" fill="#112139" stroke="${[colors.blue, colors.cyan, colors.purple, colors.amber, colors.red][index]}" stroke-width="2"/><text class="participant" x="${participantXs[index]}" y="${headerY + 42}" text-anchor="middle">${escapeXml(title)}</text><text class="role" x="${participantXs[index]}" y="${headerY + 72}" text-anchor="middle">${escapeXml(role)}</text></g>`;
  }).join('\n');
  const lifelines = participantXs.map((x) => `<path class="lifeline" d="M${x} ${headerY + 104} V1810"/>`).join('\n');
  const badgeMarkup = copy.badges.map((label, index) => {
    const x = 72 + index * 380;
    return `<rect x="${x}" y="126" width="350" height="36" rx="18" fill="#12243a" stroke="#3a5877"/><text class="badge" x="${x + 175}" y="150" text-anchor="middle">${escapeXml(label)}</text>`;
  }).join('\n');
  const phaseY = [328, 908, 1468];
  const phaseHeight = [540, 520, 430];
  const phases = copy.phases.map((label, index) => `<rect class="phase" x="42" y="${phaseY[index]}" width="1796" height="${phaseHeight[index]}" rx="24"/><rect x="1380" y="${phaseY[index] + 14}" width="420" height="30" rx="15" fill="#102239" stroke="#38506d"/><text class="phase-label" x="1590" y="${phaseY[index] + 35}" text-anchor="middle">${escapeXml(label)}</text>`).join('\n');
  const activations = `<rect class="activation" x="920" y="390" width="20" height="1410" rx="8"/><rect class="activation" x="1300" y="950" width="20" height="470" rx="8"/>`;
  const messages = copy.messages.map(([label, from, to, tone], index) => {
    const start = participantXs[from];
    const end = participantXs[to];
    const left = Math.min(start, end);
    const right = Math.max(start, end);
    const estimated = Math.min(locale === 'ko' ? 600 : 650, Math.max(300, label.length * (locale === 'ko' ? 11.5 : 7.3) + 78));
    const pillX = Math.max(60, Math.min((start + end - estimated) / 2, width - estimated - 60));
    const rowY = rowYs[index];
    const d = start < end
      ? `M${start} ${rowY} H${end}`
      : `M${start} ${rowY} H${right + 40} Q${right + 58} ${rowY} ${right + 58} ${rowY + 18} V${rowY + 32} Q${right + 58} ${rowY + 48} ${right + 42} ${rowY + 48} H${left - 42} Q${left - 58} ${rowY + 48} ${left - 58} ${rowY + 32} V${rowY + 18} Q${left - 58} ${rowY} ${left - 40} ${rowY} H${end}`;
    return `${sequencePill(index + 1, label, pillX, rowY - 60, estimated, tone)}<g data-from="${participantIds[from]}" data-to="${participantIds[to]}"><path class="call" d="${d}" stroke="${colors[tone]}" marker-end="url(#sequence-${tone}-arrow)" data-connector="message-${index + 1}" data-source-node="${participantIds[from]}" data-target-node="${participantIds[to]}"/></g>`;
  }).join('\n');
  const outcomeY = 2080;
  const outcomes = copy.outcomes.map(([code, body, tone], index) => {
    const x = 68 + index * 442;
    return `<g id="outcome-${index}" data-node="true"><rect id="outcome-${index}-card" x="${x}" y="${outcomeY}" width="400" height="132" rx="20" fill="#101f34" stroke="${colors[tone]}" stroke-width="2"/><text class="outcome-code" x="${x + 200}" y="${outcomeY + 43}" text-anchor="middle">${escapeXml(code)}</text><text class="outcome-body" x="${x + 200}" y="${outcomeY + 77}" text-anchor="middle">${escapeXml(body)}</text><text class="role" x="${x + 200}" y="${outcomeY + 105}" text-anchor="middle">${escapeXml(locale === 'ko' ? '조치 큐에서 확인' : 'visible in action queue')}</text></g>`;
  }).join('\n');
  const outcomePaths = copy.outcomes.map(([, , tone], index) => {
    const sourceX = 930 + (index - (copy.outcomes.length - 1) / 2) * 84;
    const targetX = 68 + index * 442 + 200;
    const branchY = 1930 + index * 16;
    const d = `M${sourceX} 1910 V${branchY - 18} Q${sourceX} ${branchY} ${sourceX + 18} ${branchY} H${targetX - 18} Q${targetX} ${branchY} ${targetX} ${branchY + 18} V${outcomeY}`;
    return `<path class="call" d="${d}" stroke="${colors[tone]}" marker-end="url(#sequence-${tone}-arrow)" data-connector="decision-outcome-${index}" data-source-node="final-decision" data-target-node="outcome-${index}"/>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc" data-locale="${locale}">
<title id="title">${escapeXml(copy.title)}</title><desc id="desc">${escapeXml(copy.subtitle)}</desc>
${definitions(locale, true)}
<rect width="${width}" height="${height}" fill="url(#canvas)"/><rect class="frame" x="24" y="24" width="1832" height="2252" rx="32" fill="none" stroke="#2d4665" stroke-width="2"/>
${text('title', 64, 76, copy.title)}${text('subtitle', 66, 108, copy.subtitle)}${badgeMarkup}${phases}${headerMarkup}${lifelines}${activations}${messages}
<g id="final-decision" data-node="true"><rect id="final-decision-card" class="decision" x="560" y="1750" width="740" height="150" rx="24"/><text class="decision-title" x="930" y="1800" text-anchor="middle">${escapeXml(copy.decision)}</text>${lines('decision-body', 930, 1835, copy.decisionBody, 23, 'text-anchor="middle"')}</g>${outcomePaths}${outcomes}
${text('role', 64, 2240, copy.footer)}
</svg>`;
}

const screenCopy = {
  ko: {
    eyebrow: 'STAFF 운영 화면 · 시안', title: '예약 변경 중복 방지 대시보드', subtitle: '상태, 근거, 다음 작업을 분리해 보여 줍니다. 모든 값은 합성 예시입니다.', scope: 'tenant-blue · clinic-02', route: '예약 변경 운영 · 읽기 전용',
    metrics: [['처리 완료', '18', '이번 범위'], ['중복 감지', '7', '결과 재사용'], ['재시도 대기', '4', '다음 시각 있음'], ['격리·검토', '2', 'STAFF 승인 필요']],
    queueTitle: '조치 큐 · 지금 확인할 항목', queueMeta: 'reason code 우선 · 오래된 항목부터', headers: ['대상', '논리 소비자', '상태', '사유', '다음 작업'],
    rows: [['apt_•••31', 'booking-v1', 'PROCESSED', 'STATE_APPLIED', '예약 변경 결과 조회'], ['evt_•••28', 'booking-v1', 'DUPLICATE', 'INBOX_EXISTS', '기존 결과 재사용'], ['evt_•••11', 'booking-v1', 'RETRYABLE', 'DB_TIMEOUT', '다음 시각 재시도'], ['evt_•••07', 'booking-v1', 'QUARANTINED', 'SCHEMA_MISMATCH', 'replay 승인 검토']],
    selectedTitle: '선택한 항목의 근거', selected: [['tenant · clinic', 'tenant-blue · clinic-02'], ['requestId', 'req_•••7A40'], ['fingerprint', 'sha256: 8a•••91'], ['logicalConsumerId', 'booking-v1'], ['provenance', 'topic / partition / offset'], ['scope 결과', 'ALLOW · 동일 범위']],
    actionsTitle: '허용된 다음 작업', actions: [['결과 조회', 'PROCESSED / DUPLICATE'], ['재시도 예약', 'RETRYABLE / nextAttemptAt'], ['replay 승인', 'scope + provenance 확인'], ['격리 유지', 'QUARANTINED / 원인 보존']],
    foot: '합성 시안 · 원문 payload와 환자 식별정보는 표시하지 않습니다. 운영 화면은 더 많은 정보보다 더 명확한 정보를 제공해야 합니다.',
  },
  en: {
    eyebrow: 'STAFF OPERATIONS SCREEN / DESIGN MOCKUP', title: 'Appointment change deduplication dashboard', subtitle: 'Separate state, evidence, and next action. Every value is synthetic.', scope: 'tenant-blue / clinic-02', route: 'Appointment change operations / read only',
    metrics: [['Processed', '18', 'selected scope'], ['Duplicate', '7', 'reuse prior result'], ['Retry wait', '4', 'next time recorded'], ['Quarantine', '2', 'STAFF approval needed']],
    queueTitle: 'Action queue / items to inspect now', queueMeta: 'reason code first / oldest item first', headers: ['Target', 'Logical consumer', 'State', 'Reason', 'Next action'],
    rows: [['apt_•••31', 'booking-v1', 'PROCESSED', 'STATE_APPLIED', 'read appointment result'], ['evt_•••28', 'booking-v1', 'DUPLICATE', 'INBOX_EXISTS', 'reuse prior result'], ['evt_•••11', 'booking-v1', 'RETRYABLE', 'DB_TIMEOUT', 'retry at next time'], ['evt_•••07', 'booking-v1', 'QUARANTINED', 'SCHEMA_MISMATCH', 'review replay approval']],
    selectedTitle: 'Evidence for selected item', selected: [['tenant / clinic', 'tenant-blue / clinic-02'], ['requestId', 'req_•••7A40'], ['fingerprint', 'sha256: 8a•••91'], ['logicalConsumerId', 'booking-v1'], ['provenance', 'topic / partition / offset'], ['scope result', 'ALLOW / same scope']],
    actionsTitle: 'Permitted next actions', actions: [['Read result', 'PROCESSED / DUPLICATE'], ['Schedule retry', 'RETRYABLE / nextAttemptAt'], ['Approve replay', 'check scope + provenance'], ['Keep quarantined', 'QUARANTINED / preserve reason']],
    foot: 'Synthetic mockup / raw payload and patient identifiers stay hidden. An operations screen should provide clearer information, not simply more information.',
  },
};

function renderScreen(locale) {
  const copy = screenCopy[locale];
  const width = 1800;
  const height = 1360;
  const metrics = copy.metrics.map(([label, value, detail], index) => {
    const x = 72 + index * 420;
    const tone = [colors.cyan, colors.blue, colors.amber, colors.red][index];
    return `<g><rect x="${x}" y="230" width="396" height="142" rx="20" fill="#12243a" stroke="${tone}" stroke-width="2"/><rect x="${x + 22}" y="254" width="8" height="94" rx="4" fill="${tone}"/>${text('ui-mono', x + 50, 267, label)}${text('ui-value', x + 50, 326, value)}${text('ui-muted', x + 186, 323, detail)}</g>`;
  }).join('\n');
  const tableX = 72;
  const tableY = 515;
  const colX = [100, 290, 520, 750, 960];
  const rows = copy.rows.map((row, index) => {
    const y = tableY + 68 + index * 68;
    const stateColor = row[2] === 'PROCESSED' ? colors.cyan : row[2] === 'DUPLICATE' ? colors.blue : row[2] === 'RETRYABLE' ? colors.amber : colors.red;
    return `<g><rect x="${tableX + 2}" y="${y - 40}" width="1110" height="62" fill="${index % 2 === 0 ? '#14263d' : '#102035'}"/><rect x="${tableX + 2}" y="${y - 40}" width="7" height="62" fill="${stateColor}"/>${text('ui-mono', colX[0], y, row[0])}${text('ui-mono', colX[1], y, row[1])}${text('ui-mono', colX[2], y, row[2], `fill="${stateColor}"`)}${text('ui-mono', colX[3], y, row[3], 'fill="#9fd3ff"')}${text('ui-label', colX[4], y, row[4])}</g>`;
  }).join('\n');
  const selected = copy.selected.map(([label, value], index) => {
    const x = 1240 + (index % 2) * 250;
    const y = 614 + Math.floor(index / 2) * 76;
    return `${text('ui-muted', x, y, label)}${text('ui-label', x, y + 26, value)}`;
  }).join('\n');
  const actionCards = copy.actions.map(([action, detail], index) => {
    const x = 72 + index * 420;
    const tone = [colors.cyan, colors.amber, colors.purple, colors.red][index];
    return `<g><rect x="${x}" y="1060" width="396" height="178" rx="18" fill="#122137" stroke="${tone}" stroke-width="2"/><text class="ui-card-title" x="${x + 22}" y="1106">${escapeXml(action)}</text>${lines('ui-label', x + 22, 1144, detail.split(' · '), 24)}<rect x="${x + 22}" y="1180" width="180" height="34" rx="9" fill="#203b55"/><text class="ui-button" x="${x + 112}" y="1203" text-anchor="middle">${escapeXml(locale === 'ko' ? '근거 보기' : 'View evidence')}</text></g>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc" data-locale="${locale}">
<title id="title">${escapeXml(copy.title)}</title><desc id="desc">${escapeXml(copy.subtitle)}</desc>
${definitions(locale)}
<rect width="${width}" height="${height}" fill="#07111e"/><rect x="30" y="28" width="1740" height="1304" rx="28" fill="url(#screen)" stroke="#3b5574" stroke-width="2"/>
${text('ui-eyebrow', 72, 72, copy.eyebrow)}${text('ui-title', 72, 122, copy.title)}${text('ui-label', 72, 153, copy.subtitle)}<text class="ui-label" x="1720" y="106" text-anchor="end">${escapeXml(copy.scope)}</text><rect x="1510" y="126" width="208" height="30" rx="8" fill="#17334a" stroke="#4c7798"/><text class="ui-mono" x="1614" y="147" text-anchor="middle" fill="#7fc9ff">${escapeXml(copy.route)}</text>
${metrics}
${text('ui-section', 72, 465, copy.queueTitle)}${text('ui-muted', 1178, 465, copy.queueMeta, 'text-anchor="end"')}<rect x="72" y="485" width="1120" height="445" rx="16" fill="#101d30" stroke="#2f4865"/><rect x="74" y="487" width="1116" height="50" rx="14" fill="#17263a"/>${copy.headers.map((header, index) => text('ui-mono', colX[index], 518, header)).join('')}${rows}
<rect x="1218" y="485" width="500" height="445" rx="16" fill="#111f32" stroke="#2f4865"/><text class="ui-section" x="1242" y="530">${escapeXml(copy.selectedTitle)}</text><rect x="1540" y="507" width="150" height="30" rx="8" fill="#243f51"/><text class="ui-mono" x="1615" y="527" text-anchor="middle" fill="#74e4d1">SCOPE OK</text>${selected}<line class="divider" x1="1242" y1="868" x2="1694" y2="868"/><text class="ui-label" x="1242" y="900" fill="#fbbf24">${escapeXml(locale === 'ko' ? '원문 payload 대신 안정적인 근거와 상태만 표시합니다.' : 'Show stable evidence and state instead of the raw payload.')}</text>
${text('ui-section', 72, 1010, copy.actionsTitle)}${actionCards}${text('ui-muted', 1718, 1296, copy.foot, 'text-anchor="end"')}
</svg>`;
}

await mkdir(outputDirectory, { recursive: true });
for (const locale of ['ko', 'en']) {
  const assets = [
    [`clinic-appointment-idempotent-replay-sequence-01-${locale}`, renderSequence(locale)],
    [`clinic-appointment-idempotent-replay-operations-screen-${locale}`, renderScreen(locale)],
  ];
  for (const [stem, svg] of assets) {
    const svgPath = resolve(outputDirectory, `${stem}.svg`);
    const pngPath = resolve(outputDirectory, `${stem}.png`);
    await writeFile(svgPath, `${svg.trim()}\n`, 'utf8');
    execFileSync('xmllint', ['--noout', svgPath], { stdio: 'inherit' });
    execFileSync('cairosvg', [svgPath, '-o', pngPath, '-s', '2'], { stdio: 'inherit' });
  }
}
