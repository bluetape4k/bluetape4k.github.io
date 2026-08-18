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
  const markers = sequence ? Object.entries(colors).map(([tone, color]) => `<marker id="sequence-${tone}-arrow" viewBox="0 0 10 10" markerWidth="16" markerHeight="16" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" data-role="sequence" data-size="16x16" data-tip-direction="positive-x">
      <path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}" data-solid-head="true"/>
    </marker>`).join('') : '';
  return `<defs>
    <linearGradient id="canvas" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071323"/><stop offset="1" stop-color="#111c32"/></linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#091321"/><stop offset="1" stop-color="#101b2e"/></linearGradient>
${markers ? `    ${markers}\n` : ''}    <style>
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
      .outcome-call{stroke-linecap:butt;stroke-linejoin:miter}
      .outcome-segment{fill:none;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter}
      .call-label{font-family:${monoFonts(locale)};font-size:${locale === 'ko' ? 13 : 12}px;fill:#e7f0fb}
      .pill{fill:#0d1b2f;stroke-width:1.5}
      .pill-number{font-family:${monoFonts(locale)};font-size:12px;font-weight:800;fill:#f8fbff}
      .decision{fill:#171b36;stroke:#a78bfa;stroke-width:2}
      .decision-title{font-family:${fonts(locale)};font-size:${locale === 'ko' ? 23 : 21}px;font-weight:800;fill:#e5d9ff}
      .decision-body{font-family:${monoFonts(locale)};font-size:14px;fill:#d2c4f4}
      .outcome-code{font-family:${monoFonts(locale)};font-size:16px;font-weight:800;fill:#f8fbff}
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
    title: '최신 계산 결과만 예약에 적용한다',
    subtitle: '계산 시점의 원본 버전과 적용 시점의 원본 버전을 비교해 오래된 결과를 차단합니다.',
    badges: ['SCOPE · tenant + clinic', 'FENCE · fact version + CAS', 'DATA · 합성 시안'],
    participants: [
      ['Solver', '기준 데이터 + 결과'],
      ['예약 API', '원자적 적용'],
      ['정책 워커', '영속 명령'],
      ['알림 러너', '리더 + 아웃박스'],
      ['STAFF', '상태 + 다음 작업'],
    ],
    phases: ['계산과 적용 경계', '정책 활성화 재처리', '알림 관측과 운영 판단'],
    messages: [
      ['범위 기준 데이터를 읽고 planningFactVersion 계산', 0, 1, 'blue'],
      ['Solver 결과 + 원본 버전 반환', 0, 1, 'cyan'],
      ['사전 최신성 확인 · 적용 권한은 아님', 1, 0, 'amber'],
      ['SERIALIZABLE 트랜잭션에서 원본 행 잠금', 1, 0, 'purple'],
      ['expectedVersion CAS · 하나라도 다르면 롤백', 1, 0, 'red'],
      ['PENDING 영속 활성화 명령 생성', 1, 2, 'blue'],
      ['작업 임대권(lease)을 확보해 같은 명령을 재실행', 2, 1, 'cyan'],
      ['리더 작업 주기에서 outbox 발행·관측', 1, 3, 'purple'],
      ['Micrometer·상태 점검 신호를 STAFF 화면에 기록', 3, 4, 'amber'],
      ['버전·상태·다음 작업을 함께 확인', 4, 1, 'cyan'],
    ],
    decision: '최종 상태 결정',
    decisionBody: ['현재 원본과 계산 결과의 버전이 맞는지', '확인한 뒤 적용·폐기·재시도·운영 보류를 기록한다'],
    outcomes: [
      ['APPLIED', '원본 버전 일치 · CAS 성공', 'cyan'],
      ['STALE_REJECTED', '오래된 결과 폐기 · 재계산', 'red'],
      ['RETRYABLE', '영속 명령 또는 tick 재시도', 'amber'],
      ['DEGRADED_REVIEW', '관측 저하 · STAFF 확인', 'purple'],
    ],
    footer: '상단 호출선은 둥근 직교 경로입니다. 하단 종료 경로는 최종 상태 결정에서 시작하는 명시적 90도 꺾은 선입니다.',
  },
  en: {
    title: 'Apply only the latest calculation to an appointment',
    subtitle: 'Compare the source version at calculation time with the source version at apply time to block stale results.',
    badges: ['SCOPE / tenant + clinic', 'FENCE / fact version + CAS', 'DATA / synthetic mockup'],
    participants: [
      ['Solver', 'snapshot + result'],
      ['Appointment API', 'atomic apply'],
      ['Policy worker', 'durable command'],
      ['Notification runner', 'leader + outbox'],
      ['STAFF', 'state + next action'],
    ],
    phases: ['Calculation and apply boundary', 'Durable policy activation replay', 'Notification observation and action'],
    messages: [
      ['read scoped snapshot and hash planningFactVersion', 0, 1, 'blue'],
      ['return solver result and source versions', 0, 1, 'cyan'],
      ['advisory freshness check / not apply authority', 1, 0, 'amber'],
      ['lock source rows in a SERIALIZABLE transaction', 1, 0, 'purple'],
      ['expectedVersion CAS / rollback if any check fails', 1, 0, 'red'],
      ['create a PENDING durable activation command', 1, 2, 'blue'],
      ['claim the lease and rerun the same command', 2, 1, 'cyan'],
      ['dispatch outbox and observations inside the leader tick', 1, 3, 'purple'],
      ['record Micrometer and health signals for STAFF', 3, 4, 'amber'],
      ['review version, state, and next action together', 4, 1, 'cyan'],
    ],
    decision: 'Final State Decision',
    decisionBody: ['Compare current source facts with the calculated result,', 'then record apply, discard, retry, or operational review.'],
    outcomes: [
      ['APPLIED', 'source versions match · CAS succeeds', 'cyan'],
      ['STALE_REJECTED', 'discard stale result · recalculate', 'red'],
      ['RETRYABLE', 'retry durable command or tick', 'amber'],
      ['DEGRADED_REVIEW', 'observation degraded · STAFF review', 'purple'],
    ],
    footer: 'Upper calls use rounded orthogonal routes. Terminal paths use explicit 90-degree elbows that start at the Final State Decision.',
  },
};

function sequencePill(number, label, x, y, width, tone) {
  return `<g class="sequence-message"><rect class="pill" x="${x}" y="${y}" width="${width}" height="42" rx="21" stroke="${colors[tone]}"/><circle cx="${x + 21}" cy="${y + 21}" r="14" fill="${colors[tone]}" fill-opacity=".18" stroke="${colors[tone]}"/><text class="pill-number num" x="${x + 21}" y="${y + 25}" text-anchor="middle">${number}</text><text class="call-label" x="${x + 45}" y="${y + 26}">${escapeXml(label)}</text></g>`;
}

function renderSequence(locale) {
  const copy = sequenceCopy[locale];
  const width = 1880;
  const height = 2520;
  const participantXs = [170, 550, 930, 1310, 1690];
  const participantIds = ['solver', 'api', 'policy', 'notification', 'staff'];
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
  const activations = `<rect class="activation" x="540" y="390" width="20" height="1420" rx="8"/><rect class="activation" x="920" y="1090" width="20" height="530" rx="8"/><rect class="activation" x="1300" y="1370" width="20" height="230" rx="8"/>`;
  const messages = copy.messages.map(([label, from, to, tone], index) => {
    const start = participantXs[from];
    const end = participantXs[to];
    const left = Math.min(start, end);
    const right = Math.max(start, end);
    const estimated = Math.min(locale === 'ko' ? 620 : 660, Math.max(330, label.length * (locale === 'ko' ? 11.5 : 7.3) + 78));
    const pillX = Math.max(60, Math.min((start + end - estimated) / 2, width - estimated - 60));
    const rowY = rowYs[index];
    const d = start < end
      ? `M${start} ${rowY} H${end}`
      : `M${start} ${rowY} H${right + 40} Q${right + 58} ${rowY} ${right + 58} ${rowY + 18} V${rowY + 32} Q${right + 58} ${rowY + 48} ${right + 42} ${rowY + 48} H${left - 42} Q${left - 58} ${rowY + 48} ${left - 58} ${rowY + 32} V${rowY + 18} Q${left - 58} ${rowY} ${left - 40} ${rowY} H${end}`;
    return `${sequencePill(index + 1, label, pillX, rowY - 60, estimated, tone)}<g data-from="${participantIds[from]}" data-to="${participantIds[to]}"><path class="call" d="${d}" stroke="${colors[tone]}" marker-end="url(#sequence-${tone}-arrow)" data-connector="message-${index + 1}" data-source-node="${participantIds[from]}" data-target-node="${participantIds[to]}"/></g>`;
  }).join('\n');
  const decisionY = 1810;
  const outcomeY = 2220;
  const outcomes = copy.outcomes.map(([code, body, tone], index) => {
    const x = 48 + index * 448;
    return `<g id="outcome-${index}" data-node="true"><rect id="outcome-${index}-card" x="${x}" y="${outcomeY}" width="408" height="150" rx="20" fill="#101f34" stroke="${colors[tone]}" stroke-width="2"/><text class="outcome-code" x="${x + 204}" y="${outcomeY + 45}" text-anchor="middle">${escapeXml(code)}</text><text class="outcome-body" x="${x + 204}" y="${outcomeY + 83}" text-anchor="middle">${escapeXml(body)}</text><text class="role" x="${x + 204}" y="${outcomeY + 121}" text-anchor="middle">${escapeXml(locale === 'ko' ? '조치 큐에 남김' : 'leave in action queue')}</text></g>`;
  }).join('\n');
  // The terminal outcome subdiagram intentionally uses explicit H/V elbows.
  // The upper sequence message paths retain rounded orthogonal routes.
  const outcomePaths = copy.outcomes.map(([, , tone], index) => {
    const targetX = 48 + index * 448 + 204;
    const sourceX = [620, 760, 1040, 1240][index];
    const branchY = [2020, 2050, 2020, 2050][index];
    const stem = `<path class="outcome-segment" d="M${sourceX} ${decisionY + 152} V${branchY}" stroke="${colors[tone]}"/>`;
    const horizontal = `<path class="outcome-segment" d="M${sourceX} ${branchY} H${targetX}" stroke="${colors[tone]}"/>`;
    const drop = `<path class="outcome-segment" d="M${targetX} ${branchY} V${outcomeY}" stroke="${colors[tone]}" marker-end="url(#sequence-${tone}-arrow)" data-connector="decision-outcome-${index}" data-source-node="final-decision" data-target-node="outcome-${index}" data-corner-style="orthogonal"/>`;
    return `${stem}${horizontal}${drop}`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc" data-locale="${locale}">
<title id="title">${escapeXml(copy.title)}</title><desc id="desc">${escapeXml(copy.subtitle)}</desc>
${definitions(locale, true)}
<rect width="${width}" height="${height}" fill="url(#canvas)"/><rect class="frame" x="24" y="24" width="1832" height="2472" rx="32" fill="none" stroke="#2d4665" stroke-width="2"/>
${text('title', 64, 76, copy.title)}${text('subtitle', 66, 108, copy.subtitle)}${badgeMarkup}${phases}${headerMarkup}${lifelines}${activations}${messages}
<g id="final-decision" data-node="true"><rect id="final-decision-card" class="decision" x="560" y="${decisionY}" width="740" height="150" rx="24"/><text class="decision-title" x="930" y="${decisionY + 50}" text-anchor="middle">${escapeXml(copy.decision)}</text>${lines('decision-body', 930, decisionY + 85, copy.decisionBody, 23, 'text-anchor="middle"')}</g>${outcomePaths}${outcomes}
${text('role', 64, 2470, copy.footer)}
</svg>`;
}

const screenCopy = {
  ko: {
    eyebrow: 'STAFF 운영 화면 · 시안', title: '최신 결과 적용 대시보드', subtitle: '상태, 버전 근거, 다음 작업을 분리해 보여 줍니다. 모든 값은 합성 예시입니다.', scope: 'tenant-blue · clinic-02', route: '예약 계산 운영 · 읽기 전용',
    metrics: [['적용 완료', '14', 'CAS 성공'], ['오래된 결과 거부', '3', '재계산 필요'], ['정책 활성화 대기', '2', 'PENDING'], ['알림 관측 저하', '1', 'DEGRADED']],
    queueTitle: '조치 큐 · 지금 확인할 항목', queueMeta: '버전 불일치·오래된 항목부터', headers: ['대상', '계산/정책 버전', '현재 버전', '상태', '다음 작업'],
    rows: [['solver-•••24', 'fact 7f2…', 'fact 80a…', 'STALE', '결과 폐기·재계산'], ['solver-•••19', 'fact 9a…', 'fact 9a…', 'APPLIED', '적용 결과 확인'], ['policy-•••08', 'rev 12', 'gen 8', 'PENDING', '활성화 작업 확인'], ['notify-•••03', 'leader tick', 'backlog 4m', 'DEGRADED', '작업 임대권·backlog 확인']],
    selectedTitle: '선택한 항목의 근거', selected: [['tenant · clinic', 'tenant-blue · clinic-02'], ['planningFactVersion', 'sha256: 9a•••4c'], ['예약 원본 버전', '12건 · 모두 일치'], ['policy command', 'cmd_•••08 · PENDING'], ['리더 잠금', 'notify-recovery · held'], ['지표', 'solver.apply · outbox.age']],
    actionsTitle: '허용된 다음 작업', actions: [['재계산 예약', 'STALE · 최신 기준 데이터'], ['활성화 재시도', 'PENDING · 작업 임대권 확인'], ['알림 관측 열기', 'DEGRADED · 대기열·상태 확인'], ['최종 상태 확인', 'APPLIED · 원본 근거']],
    foot: '합성 시안 · 원문 데이터(payload)와 환자 식별정보는 표시하지 않습니다. 운영 화면은 더 많은 정보보다 더 명확한 정보를 제공해야 합니다.',
  },
  en: {
    eyebrow: 'STAFF OPERATIONS SCREEN / DESIGN MOCKUP', title: 'Latest-result application dashboard', subtitle: 'Separate state, version evidence, and next action. Every value is synthetic.', scope: 'tenant-blue / clinic-02', route: 'Appointment calculation operations / read only',
    metrics: [['Applied', '14', 'CAS succeeded'], ['Stale rejected', '3', 'recalculate'], ['Policy pending', '2', 'PENDING'], ['Notification degraded', '1', 'DEGRADED']],
    queueTitle: 'Action queue / items to inspect now', queueMeta: 'version mismatch and oldest first', headers: ['Target', 'Calc / policy version', 'Current version', 'State', 'Next action'],
    rows: [['solver-•••24', 'fact 7f2…', 'fact 80a…', 'STALE', 'discard / recalculate'], ['solver-•••19', 'fact 9a…', 'fact 9a…', 'APPLIED', 'verify applied result'], ['policy-•••08', 'rev 12', 'gen 8', 'PENDING', 'inspect activation'], ['notify-•••03', 'leader tick', 'backlog 4m', 'DEGRADED', 'check lease / backlog']],
    selectedTitle: 'Evidence for selected item', selected: [['tenant / clinic', 'tenant-blue / clinic-02'], ['planningFactVersion', 'sha256: 9a•••4c'], ['source versions', '12 appointments / match'], ['policy command', 'cmd_•••08 / PENDING'], ['leader lock', 'notify-recovery / held'], ['metrics', 'solver.apply / outbox.age']],
    actionsTitle: 'Permitted next actions', actions: [['Schedule recalculation', 'STALE / latest snapshot'], ['Retry activation', 'PENDING / check lease'], ['Open notification view', 'DEGRADED / backlog + health'], ['Confirm final state', 'APPLIED / source evidence']],
    foot: 'Synthetic mockup / raw payload and patient identifiers stay hidden. An operations screen should provide clearer information, not simply more information.',
  },
};

function renderScreen(locale) {
  const copy = screenCopy[locale];
  const width = 1800;
  const height = 1360;
  const metrics = copy.metrics.map(([label, value, detail], index) => {
    const x = 72 + index * 420;
    const tone = [colors.cyan, colors.red, colors.amber, colors.purple][index];
    return `<g><rect x="${x}" y="230" width="396" height="142" rx="20" fill="#12243a" stroke="${tone}" stroke-width="2"/><rect x="${x + 22}" y="254" width="8" height="94" rx="4" fill="${tone}"/>${text('ui-mono', x + 50, 267, label)}${text('ui-value', x + 50, 326, value)}${text('ui-muted', x + 186, 323, detail)}</g>`;
  }).join('\n');
  const tableX = 72;
  const tableY = 515;
  const colX = [100, 290, 520, 750, 960];
  const rows = copy.rows.map((row, index) => {
    const y = tableY + 68 + index * 68;
    const stateColor = row[3] === 'APPLIED' ? colors.cyan : row[3] === 'STALE' ? colors.red : row[3] === 'PENDING' ? colors.amber : colors.purple;
    return `<g><rect x="${tableX + 2}" y="${y - 40}" width="1110" height="62" fill="${index % 2 === 0 ? '#14263d' : '#102035'}"/><rect x="${tableX + 2}" y="${y - 40}" width="7" height="62" fill="${stateColor}"/>${text('ui-mono', colX[0], y, row[0])}${text('ui-mono', colX[1], y, row[1])}${text('ui-mono', colX[2], y, row[2])}${text('ui-mono', colX[3], y, row[3], `fill="${stateColor}"`)}${text('ui-label', colX[4], y, row[4])}</g>`;
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
<rect x="1218" y="485" width="500" height="445" rx="16" fill="#111f32" stroke="#2f4865"/><text class="ui-section" x="1242" y="530">${escapeXml(copy.selectedTitle)}</text><rect x="1540" y="507" width="150" height="30" rx="8" fill="#243f51"/><text class="ui-mono" x="1615" y="527" text-anchor="middle" fill="#74e4d1">SCOPE OK</text>${selected}<line class="divider" x1="1242" y1="868" x2="1694" y2="868"/><text class="ui-label" x="1242" y="900" fill="#fbbf24">${escapeXml(locale === 'ko' ? '원문 payload 대신 버전 근거와 상태만 표시합니다.' : 'Show version evidence and state instead of the raw payload.')}</text>
${text('ui-section', 72, 1010, copy.actionsTitle)}${actionCards}${text('ui-muted', 1718, 1296, copy.foot, 'text-anchor="end"')}
</svg>`;
}

await mkdir(outputDirectory, { recursive: true });
for (const locale of ['ko', 'en']) {
  const assets = [
    [`clinic-appointment-latest-fence-sequence-01-${locale}`, renderSequence(locale)],
    [`clinic-appointment-latest-fence-operations-screen-${locale}`, renderScreen(locale)],
  ];
  for (const [stem, svg] of assets) {
    const svgPath = resolve(outputDirectory, `${stem}.svg`);
    const pngPath = resolve(outputDirectory, `${stem}.png`);
    await writeFile(svgPath, `${svg.trim()}\n`, 'utf8');
    execFileSync('xmllint', ['--noout', svgPath], { stdio: 'inherit' });
    execFileSync('cairosvg', [svgPath, '-o', pngPath, '-s', '2'], { stdio: 'inherit' });
  }
}
