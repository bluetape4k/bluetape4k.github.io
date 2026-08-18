import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDirectory = resolve('public/assets');

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

const colors = {
  blue: '#60a5fa',
  cyan: '#2dd4bf',
  amber: '#fbbf24',
  red: '#fb7185',
  purple: '#a78bfa',
};

const sharedStyles = (locale) => `
  .title{font-family:${fonts(locale)};font-size:${locale === 'ko' ? 37 : 31}px;font-weight:800;fill:#f4f8ff}
  .subtitle{font-family:${monoFonts(locale)};font-size:17px;fill:#a9bad0}
  .badge{font-family:${monoFonts(locale)};font-size:13px;font-weight:700;fill:#c9dcf3}
  .participant{font-family:${fonts(locale)};font-size:16px;font-weight:800;fill:#f4f8ff}
  .role{font-family:${monoFonts(locale)};font-size:12px;fill:#91a8c3}
  .labelText,.num,.outcome,.decision-title{font-family:${monoFonts(locale)}}
  .labelText{font-size:14px;fill:#e7f0fb}
  .num{font-size:13px;font-weight:800;fill:#f8fbff}
  .outcome{font-size:13px;font-weight:800;fill:#f8fbff}
  .header{fill:#13243b;stroke:#395675;stroke-width:2}
  .frame{fill:none;stroke:#2d4665;stroke-width:2}
  .lifeline{fill:none;stroke:#516985;stroke-width:2;stroke-dasharray:8 10}
  .activation{fill:#17314e;stroke:#7898b7;stroke-width:2}
  .pill{fill:#0d1b2f;stroke-width:2}
  .call{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
  .blue-line{stroke:${colors.blue};marker-end:url(#blueArrow)}
  .cyan-line{stroke:${colors.cyan};marker-end:url(#cyanArrow)}
  .amber-line{stroke:${colors.amber};marker-end:url(#amberArrow)}
  .red-line{stroke:${colors.red};marker-end:url(#redArrow)}
  .purple-line{stroke:${colors.purple};marker-end:url(#purpleArrow)}
  .phase{fill:#0b1729;fill-opacity:.28;stroke:#38506d;stroke-width:1.5}
  .phase-label{font-family:${monoFonts(locale)};font-size:12px;font-weight:700;fill:#83a0bf}
  .decision{fill:#151f38;stroke:${colors.purple};stroke-width:2}
  .decision-title{font-family:${fonts(locale)};font-size:18px;font-weight:800;fill:#e5d9ff}
`;

const definitions = (locale) => `<defs>
  <linearGradient id="canvas" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071323"/><stop offset="1" stop-color="#101a31"/></linearGradient>
  ${Object.entries(colors).map(([id, color]) => `<marker id="${id}Arrow" viewBox="0 0 10 10" markerWidth="16" markerHeight="16" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" data-role="sequence" data-size="16x16" data-tip-direction="positive-x"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}" data-solid-head="true"/></marker>`).join('\n')}
  <style>${sharedStyles(locale)}</style>
</defs>`;

const flowCopy = {
  ko: {
    title: 'CRM 프로필 변경과 예약 재평가의 경계',
    subtitle: 'PROPOSED·HELD만 다시 평가하고, CONFIRMED 예약은 보호합니다.',
    badges: ['SCOPE · 프로필 재평가', 'VERSION · revision fence', 'ROLE · STAFF / ADMIN', 'PRIVACY · 최소 이벤트'],
    participants: [
      ['CRM 이벤트', '최소 변경 신호'],
      ['예약 API', '인증·scope 경계'],
      ['재평가 워커', '공정 dispatch'],
      ['assessment 제공자', '평가 결과 참조'],
      ['상태·운영 저장소', '결과·outbox·메트릭'],
    ],
    phases: ['이벤트 수신과 대상 확인', 'assessment 조회와 상태 결정', '운영 결과와 제한된 redrive'],
    messages: [
      ['profileRevision · assessmentRef 이벤트', 0, 1, 'blue'],
      ['신뢰 검증 · 최신 revision 병합', 1, 2, 'cyan'],
      ['PROPOSED · HELD 대상 조회', 2, 4, 'cyan'],
      ['assessment 조회', 2, 3, 'amber'],
      ['결과와 policy generation 반환', 3, 2, 'cyan'],
      ['상태 · 아웃박스(outbox) · 메트릭 저장', 2, 4, 'purple'],
      ['운영 기준 데이터 · backlog · drainState 갱신', 4, 1, 'blue'],
      ['PREVIEW 또는 ADMIN scoped redrive', 1, 2, 'amber'],
      ['대상 revision 재확인', 2, 4, 'red'],
    ],
    decision: '최종 상태 결정',
    branches: [
      ['PROPOSED', '제안 교체 또는 유지', 'blue'],
      ['HELD', 'hold 유지 또는 교체', 'cyan'],
      ['CONFIRMED', '확정 예약 보호', 'purple'],
      ['실패', 'RETRY_WAIT / QUARANTINE', 'red'],
    ],
  },
  en: {
    title: 'The Boundary between CRM Profile Changes and Reevaluation',
    subtitle: 'Reevaluate PROPOSED and HELD, while protecting CONFIRMED visit commitments.',
    badges: ['SCOPE / PROFILE REEVALUATION', 'VERSION / REVISION FENCE', 'ROLE / STAFF + ADMIN', 'PRIVACY / MINIMAL EVENT'],
    participants: [
      ['CRM event', 'minimal change signal'],
      ['Reservation API', 'auth and scope boundary'],
      ['Reevaluation worker', 'fair dispatch'],
      ['Assessment provider', 'assessment reference'],
      ['State / ops store', 'outcome, outbox, metrics'],
    ],
    phases: ['Receive event and identify targets', 'Lookup assessment and decide state', 'Operational result and scoped redrive'],
    messages: [
      ['profileRevision + assessmentRef event', 0, 1, 'blue'],
      ['verify trust + merge latest revision', 1, 2, 'cyan'],
      ['load PROPOSED + HELD targets', 2, 4, 'cyan'],
      ['lookup assessment', 2, 3, 'amber'],
      ['return result + policy generation', 3, 2, 'cyan'],
      ['store state, outbox, and metrics', 2, 4, 'purple'],
      ['refresh snapshot, backlog, and drainState', 4, 1, 'blue'],
      ['PREVIEW or ADMIN scoped redrive', 1, 2, 'amber'],
      ['recheck target revision', 2, 4, 'red'],
    ],
    decision: 'Final State Decision',
    branches: [
      ['PROPOSED', 'replace or keep proposal', 'blue'],
      ['HELD', 'keep or replace hold', 'cyan'],
      ['CONFIRMED', 'protect visit commitment', 'purple'],
      ['Failure', 'RETRY_WAIT / QUARANTINE', 'red'],
    ],
  },
};

function sequencePill(number, label, x, y, width, color) {
  return `<g><rect class="pill" x="${x}" y="${y}" width="${width}" height="38" rx="19" stroke="${color}"/><circle cx="${x + 20}" cy="${y + 19}" r="13" fill="${color}" fill-opacity=".2" stroke="${color}"/><text class="num" x="${x + 20}" y="${y + 24}" text-anchor="middle">${number}</text><text class="labelText" x="${x + 43}" y="${y + 24}">${escapeXml(label)}</text></g>`;
}

function renderFlow(locale) {
  const copy = flowCopy[locale];
  const width = 1440;
  const height = 1900;
  const participantXs = [130, 420, 710, 1000, 1290];
  const participantIds = ['crm', 'api', 'worker', 'assessment', 'store'];
  const messageRows = [390, 510, 630, 750, 870, 990, 1110, 1230, 1350];
  const headers = copy.participants.map(([title, role], index) => {
    const x = participantXs[index] - 120;
    return `<g><rect id="${participantIds[index]}" class="header card" x="${x}" y="190" width="240" height="92" rx="20"/><text class="participant" x="${participantXs[index]}" y="228" text-anchor="middle">${escapeXml(title)}</text><text class="role" x="${participantXs[index]}" y="256" text-anchor="middle">${escapeXml(role)}</text></g>`;
  }).join('\n');
  const lifelines = participantXs.map((x) => `<path class="lifeline" d="M${x} 282 V1438"/>`).join('\n');
  const widths = [248, 250, 230, 250];
  const badges = copy.badges.map((label, index) => {
    const x = 58 + widths.slice(0, index).reduce((sum, value) => sum + value + 12, 0);
    return `<rect x="${x}" y="126" width="${widths[index]}" height="34" rx="17" fill="#12243a" stroke="#3a5877"/><text class="badge" x="${x + widths[index] / 2}" y="148" text-anchor="middle">${escapeXml(label)}</text>`;
  }).join('\n');
  const phaseY = [304, 676, 1052];
  const phaseHeight = [348, 354, 346];
  const phases = copy.phases.map((label, index) => `<rect class="phase" x="42" y="${phaseY[index]}" width="1356" height="${phaseHeight[index]}" rx="24"/><rect x="1038" y="${phaseY[index] + 12}" width="330" height="28" rx="14" fill="#102239" stroke="#38506d"/><text class="phase-label" x="1203" y="${phaseY[index] + 31}" text-anchor="middle">${escapeXml(label)}</text>`).join('\n');
  const messages = copy.messages.map(([label, from, to, tone], index) => {
    const start = participantXs[from];
    const end = participantXs[to];
    const idealWidth = Math.min(locale === 'ko' ? 525 : 560, Math.max(275, label.length * (locale === 'ko' ? 13.3 : 8.1) + 72));
    const pillX = (start + end - idealWidth) / 2;
    const rowY = messageRows[index];
    return `${sequencePill(index + 1, label, pillX, rowY - 50, idealWidth, colors[tone])}<path class="call ${tone}-line" data-source-node="${participantIds[from]}" data-target-node="${participantIds[to]}" d="M${start} ${rowY} H${end}"/>`;
  }).join('\n');
  const branchCards = copy.branches.map(([title, detail, tone], index) => {
    const x = 74 + index * 330;
    const targetX = x + 153;
    return `<rect id="branch-${index}" x="${x}" y="1570" width="306" height="118" rx="20" fill="#101f34" stroke="${colors[tone]}" stroke-width="2"/><text class="outcome" x="${targetX}" y="1610" text-anchor="middle">${escapeXml(title)}</text><text class="role" x="${targetX}" y="1644" text-anchor="middle">${escapeXml(detail)}</text><path class="call ${tone}-line" data-source-node="decision" data-target-node="branch-${index}" d="M${targetX} 1490 V1570"/>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc" data-locale="${locale}">
<title id="title">${escapeXml(copy.title)}</title><desc id="desc">${escapeXml(copy.subtitle)}</desc>
${definitions(locale)}
<rect width="${width}" height="${height}" fill="url(#canvas)"/><rect class="frame" x="24" y="24" width="1392" height="1852" rx="32"/>
<text class="title" x="62" y="76">${escapeXml(copy.title)}</text><text class="subtitle" x="64" y="108">${escapeXml(copy.subtitle)}</text>
${badges}${phases}${headers}${lifelines}<rect class="activation" x="700" y="360" width="20" height="1000" rx="8"/><rect class="activation" x="990" y="720" width="20" height="240" rx="8"/>
${messages}
<rect id="decision" class="decision" x="44" y="1468" width="1352" height="330" rx="26"/><rect x="490" y="1446" width="460" height="44" rx="22" fill="#19223a" stroke="${colors.purple}" stroke-width="2"/><text class="decision-title" x="720" y="1475" text-anchor="middle">${escapeXml(copy.decision)}</text><text class="role" x="720" y="1730" text-anchor="middle">${locale === 'ko' ? '상태·정책·revision을 확인한 뒤 결과를 하나만 기록합니다.' : 'Record one outcome after checking state, policy, and revision.'}</text>${branchCards}
<text class="role" x="720" y="1832" text-anchor="middle">${locale === 'ko' ? '실패는 재시도와 격리를 구분하고, 확정 예약은 보호합니다.' : 'Separate retry from quarantine, and protect confirmed visit commitments.'}</text>
</svg>`;
}

const screenCopy = {
  ko: {
    eyebrow: 'STAFF 운영 화면 · 시안', title: '프로필 재평가 운영', subtitle: 'CRM 변경 신호를 확인하고, 재평가 작업의 다음 조치를 선택합니다.', clinic: '클리닉 A · 피부과',
    metrics: [['PENDING', '12', '재평가 대기'], ['RUNNING', '3', '활성 작업'], ['RETRY_WAIT', '4', '다음 시도 예약'], ['FAILED', '1', '수동 확인']],
    health: [['활성 lease', '3'], ['가장 오래된 대기', '18분'], ['lease 갱신 실패', '0'], ['연속 assessment 실패', '1'], ['drainState', 'ACTIVE']],
    queueTitle: '조치 큐', queueMeta: 'HELD_PRESENT 우선 · scope별 표시', queueHeaders: ['작업 참조', 'targetRevision', '상태', '다음 시도', '최근 실패', '결과'],
    queue: [['job_7F3A…91C2', 'r-42', 'PENDING', '09:45', '—', '0 / 3'], ['job_2B19…4D08', 'r-41', 'RETRY_WAIT', '10:05', 'ASSESSMENT_TIMEOUT', '1 / 2'], ['job_93DE…7A40', 'r-40', 'RUNNING', '지금', '—', '2 / 2'], ['job_4C01…B8E7', 'r-39', 'FAILED', '—', 'PRIVACY_BOUNDARY', '0 / 0']],
    selected: '선택한 재평가 작업', selectedValues: [['scope', 'clinic-a / tenant-01'], ['profileRevision', 'r-42'], ['policy', 'policy-ref-08 · gen 12'], ['state', 'HELD · eligible'], ['outcome', 'HOLD_REPLACED'], ['dueAt', '2026-08-17 10:00']],
    preview: 'STAFF PREVIEW', redrive: 'ADMIN scoped redrive', quarantine: 'QUARANTINE 확인', warningTitle: '개인정보·권한 경계', warning: '원본 프로필·특징·점수·assessment 본문은 표시하지 않습니다. ADMIN redrive는 인증·clinic scope·권한을 다시 확인합니다.', footer: '예시 수치 · 환자 식별정보 없음 · 실제 운영 화면 캡처 아님',
  },
  en: {
    eyebrow: 'STAFF OPERATIONS SCREEN / DESIGN MOCKUP', title: 'Profile reevaluation operations', subtitle: 'Review CRM change signals and choose the next action for each reevaluation job.', clinic: 'Clinic A / dermatology',
    metrics: [['PENDING', '12', 'awaiting reevaluation'], ['RUNNING', '3', 'active jobs'], ['RETRY_WAIT', '4', 'scheduled retry'], ['FAILED', '1', 'manual review']],
    health: [['Active leases', '3'], ['Oldest backlog', '18 min'], ['Lease renew failures', '0'], ['Consecutive assessment failures', '1'], ['drainState', 'ACTIVE']],
    queueTitle: 'Action queue', queueMeta: 'HELD_PRESENT first / scoped view', queueHeaders: ['Job reference', 'targetRevision', 'State', 'Next attempt', 'Last failure', 'Outcomes'],
    queue: [['job_7F3A…91C2', 'r-42', 'PENDING', '09:45', '—', '0 / 3'], ['job_2B19…4D08', 'r-41', 'RETRY_WAIT', '10:05', 'ASSESSMENT_TIMEOUT', '1 / 2'], ['job_93DE…7A40', 'r-40', 'RUNNING', 'Now', '—', '2 / 2'], ['job_4C01…B8E7', 'r-39', 'FAILED', '—', 'PRIVACY_BOUNDARY', '0 / 0']],
    selected: 'Selected reevaluation job', selectedValues: [['scope', 'clinic-a / tenant-01'], ['profileRevision', 'r-42'], ['policy', 'policy-ref-08 / gen 12'], ['state', 'HELD / eligible'], ['outcome', 'HOLD_REPLACED'], ['dueAt', '2026-08-17 10:00']],
    preview: 'STAFF PREVIEW', redrive: 'ADMIN scoped redrive', quarantine: 'Review QUARANTINE', warningTitle: 'Privacy and authority boundary', warning: 'Raw profiles, features, scores, and assessment bodies stay hidden. ADMIN redrive rechecks authentication, clinic scope, and authority.', footer: 'Illustrative values / no patient identifiers / not a production screenshot',
  },
};

function renderScreen(locale) {
  const copy = screenCopy[locale];
  const width = 1680;
  const height = 1240;
  const metricCards = copy.metrics.map(([label, value, detail], index) => {
    const x = 70 + index * 366;
    const tone = [colors.blue, colors.cyan, colors.amber, colors.red][index];
    return `<rect x="${x}" y="244" width="346" height="116" rx="16" fill="#14243a" stroke="${tone}" stroke-opacity=".7"/><text class="ui-mono" x="${x + 20}" y="273" fill="#91a8c3">${escapeXml(label)}</text><text class="ui-value" x="${x + 20}" y="320">${escapeXml(value)}</text><text class="ui-label" x="${x + 112}" y="318" fill="#9fb3c8">${escapeXml(detail)}</text>`;
  }).join('\n');
  const health = copy.health.map(([label, value], index) => {
    const x = 70 + index * 306;
    return `<rect x="${x}" y="378" width="286" height="64" rx="12" fill="#101e31" stroke="#2f4865"/><text class="ui-mono" x="${x + 16}" y="402" fill="#7189a4">${escapeXml(label)}</text><text class="ui-label" x="${x + 16}" y="425" fill="${index === 4 ? colors.cyan : '#dce8f5'}">${escapeXml(value)}</text>`;
  }).join('\n');
  const queueRows = copy.queue.map((row, index) => {
    const y = 566 + index * 54;
    const stateColor = row[2] === 'FAILED' ? colors.red : row[2] === 'RETRY_WAIT' ? colors.amber : row[2] === 'RUNNING' ? colors.cyan : colors.blue;
    return `<rect x="72" y="${y - 32}" width="980" height="50" fill="${index === 0 ? '#18344b' : index % 2 ? '#101d30' : '#122137'}"/><text class="ui-mono" x="92" y="${y}">${escapeXml(row[0])}</text><text class="ui-mono" x="292" y="${y}" fill="#dce8f5">${escapeXml(row[1])}</text><text class="ui-mono" x="422" y="${y}" fill="${stateColor}">${escapeXml(row[2])}</text><text class="ui-label" x="570" y="${y}">${escapeXml(row[3])}</text><text class="ui-mono" x="692" y="${y}" fill="${row[4] === '—' ? '#8ea4bd' : colors.amber}">${escapeXml(row[4])}</text><text class="ui-label" x="928" y="${y}">${escapeXml(row[5])}</text>`;
  }).join('\n');
  const detailFields = copy.selectedValues.map(([label, value], index) => {
    const x = 1116 + (index % 2) * 224;
    const y = 552 + Math.floor(index / 2) * 65;
    return `<text class="ui-mono" x="${x}" y="${y}" fill="#7189a4">${escapeXml(label)}</text><text class="ui-label" x="${x}" y="${y + 25}" fill="${label === 'state' ? colors.cyan : '#dce8f5'}">${escapeXml(value)}</text>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc" data-locale="${locale}">
<title id="title">${escapeXml(copy.title)}</title><desc id="desc">${escapeXml(copy.subtitle)}</desc>
<defs><linearGradient id="screen-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#091321"/><stop offset="1" stop-color="#101b2e"/></linearGradient><style>
  .ui-title,.ui-section{font-family:${fonts(locale)};fill:#f4f8ff;font-weight:800}.ui-title{font-size:34px}.ui-section{font-size:${locale === 'ko' ? 19 : 17}px}.ui-label,.ui-mono,.ui-button{font-family:${monoFonts(locale)};fill:#dce8f5}.ui-label{font-size:13px}.ui-mono{font-size:12px}.ui-button{font-size:${locale === 'ko' ? 12 : 11}px;font-weight:800}.ui-value{font-family:${fonts(locale)};fill:#f4f8ff;font-size:37px;font-weight:900}.divider{stroke:#263d59;stroke-width:1}
</style></defs>
<rect width="${width}" height="${height}" fill="#07111e"/><rect x="30" y="28" width="1620" height="1184" rx="28" fill="url(#screen-bg)" stroke="#3b5574" stroke-width="2"/>
<text class="ui-mono" x="70" y="72" fill="#7fc9ff" font-weight="800">${escapeXml(copy.eyebrow)}</text><text class="ui-title" x="70" y="116">${escapeXml(copy.title)}</text><text class="ui-label" x="70" y="145" fill="#9aacc1">${escapeXml(copy.subtitle)}</text><text class="ui-label" x="1580" y="105" fill="#a9bad0" text-anchor="end">${escapeXml(copy.clinic)}</text><rect x="1486" y="122" width="94" height="30" rx="8" fill="#17334a" stroke="#4c7798"/><text class="ui-mono" x="1533" y="142" text-anchor="middle" fill="#7fc9ff" font-weight="800">STAFF</text>
${metricCards}${health}
<text class="ui-section" x="70" y="486">${escapeXml(copy.queueTitle)}</text><text class="ui-label" x="1052" y="486" fill="#7189a4" text-anchor="end">${escapeXml(copy.queueMeta)}</text><rect x="70" y="502" width="992" height="286" rx="16" fill="#101d30" stroke="#2f4865"/><rect x="72" y="504" width="988" height="44" rx="14" fill="#17263a"/><text class="ui-mono" x="92" y="532" fill="#7189a4">${escapeXml(copy.queueHeaders[0])}</text><text class="ui-mono" x="292" y="532" fill="#7189a4">${escapeXml(copy.queueHeaders[1])}</text><text class="ui-mono" x="422" y="532" fill="#7189a4">${escapeXml(copy.queueHeaders[2])}</text><text class="ui-mono" x="570" y="532" fill="#7189a4">${escapeXml(copy.queueHeaders[3])}</text><text class="ui-mono" x="692" y="532" fill="#7189a4">${escapeXml(copy.queueHeaders[4])}</text><text class="ui-mono" x="928" y="532" fill="#7189a4">${escapeXml(copy.queueHeaders[5])}</text>${queueRows}
<rect x="1086" y="502" width="494" height="286" rx="16" fill="#111f32" stroke="#2f4865"/><text class="ui-section" x="1110" y="540">${escapeXml(copy.selected)}</text><rect x="1450" y="517" width="106" height="28" rx="8" fill="#18344b"/><text class="ui-mono" x="1503" y="536" text-anchor="middle" fill="#74e4d1">HELD</text>${detailFields}<line class="divider" x1="1110" y1="724" x2="1556" y2="724"/><text class="ui-label" x="1110" y="754" fill="#fbbf24">${locale === 'ko' ? '대상 revision과 scope를 다시 확인한 뒤 실행합니다.' : 'Recheck target revision and scope before execution.'}</text>
<text class="ui-section" x="70" y="834">${locale === 'ko' ? '허용된 작업' : 'Permitted work'}</text><text class="ui-label" x="1580" y="834" fill="#7189a4" text-anchor="end">${locale === 'ko' ? '원본 프로필은 이 화면에 없음' : 'Raw profile data is not shown here'}</text><rect x="70" y="852" width="1510" height="142" rx="16" fill="#111f32" stroke="#2f4865"/><rect x="96" y="888" width="220" height="46" rx="10" fill="#2dd4bf"/><text class="ui-button" x="206" y="917" text-anchor="middle" fill="#092028">${escapeXml(copy.preview)}</text><rect x="334" y="888" width="266" height="46" rx="10" fill="#223850" stroke="#496583"/><text class="ui-button" x="467" y="917" text-anchor="middle">${escapeXml(copy.redrive)}</text><rect x="618" y="888" width="220" height="46" rx="10" fill="#2b2230" stroke="#8d5b73"/><text class="ui-button" x="728" y="917" text-anchor="middle">${escapeXml(copy.quarantine)}</text><text class="ui-label" x="96" y="968" fill="#9fb3c8">${locale === 'ko' ? 'STAFF는 읽기와 미리보기, ADMIN은 인증된 범위의 제한 redrive만 수행합니다.' : 'STAFF reads and previews; ADMIN performs only an authenticated, scoped redrive.'}</text>
<rect x="70" y="1020" width="1510" height="112" rx="16" fill="#2b2218" stroke="#9b743d"/><text class="ui-mono" x="94" y="1050" fill="#fbbf24" font-weight="800">${escapeXml(copy.warningTitle)}</text><text class="ui-label" x="94" y="1080" fill="#dccbaa">${escapeXml(copy.warning)}</text><text class="ui-mono" x="1580" y="1178" fill="#6f8299" text-anchor="end">${escapeXml(copy.footer)}</text>
</svg>`;
}

await mkdir(outputDirectory, { recursive: true });
for (const locale of ['ko', 'en']) {
  const assets = [
    [`clinic-appointment-profile-reevaluation-flow-01-${locale}`, renderFlow(locale)],
    [`clinic-appointment-profile-reevaluation-operations-screen-${locale}`, renderScreen(locale)],
  ];
  for (const [stem, svg] of assets) {
    const svgPath = resolve(outputDirectory, `${stem}.svg`);
    const pngPath = resolve(outputDirectory, `${stem}.png`);
    await writeFile(svgPath, `${svg.trim()}\n`, 'utf8');
    execFileSync('xmllint', ['--noout', svgPath], { stdio: 'inherit' });
    execFileSync('cairosvg', [svgPath, '-o', pngPath, '-s', '2'], { stdio: 'inherit' });
  }
}
