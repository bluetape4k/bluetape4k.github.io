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

const sharedStyles = (locale) => `
  .title{font-family:${fonts(locale)};font-size:${locale === 'ko' ? 38 : 31}px;font-weight:800;fill:#f4f8ff}
  .subtitle{font-family:${monoFonts(locale)};font-size:17px;fill:#a9bad0}
  .badge{font-family:${monoFonts(locale)};font-size:13px;font-weight:700;fill:#c9dcf3}
  .participant{font-family:${fonts(locale)};font-size:17px;font-weight:800;fill:#f4f8ff}
  .role{font-family:${monoFonts(locale)};font-size:12px;fill:#91a8c3}
  .labelText,.num,.outcome,.ui-label,.ui-mono{font-family:${monoFonts(locale)}}
  .labelText{font-size:14px;fill:#e7f0fb}
  .num{font-size:13px;font-weight:800;fill:#f8fbff}
  .outcome{font-size:14px;font-weight:800;fill:#f8fbff}
  .header{fill:#13243b;stroke:#395675;stroke-width:2}
  .frame{fill:none;stroke:#2d4665;stroke-width:2}
  .lifeline{fill:none;stroke:#516985;stroke-width:2;stroke-dasharray:8 10}
  .activation{fill:#17314e;stroke:#7898b7;stroke-width:2}
  .pill{fill:#0d1b2f;stroke-width:2}
  .call{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
  .blue-line{stroke:#60a5fa;marker-end:url(#blueArrow)}
  .cyan-line{stroke:#2dd4bf;marker-end:url(#cyanArrow)}
  .amber-line{stroke:#fbbf24;marker-end:url(#amberArrow)}
  .red-line{stroke:#fb7185;marker-end:url(#redArrow)}
  .purple-line{stroke:#a78bfa;marker-end:url(#purpleArrow)}
  .phase{fill:#0b1729;fill-opacity:.28;stroke:#38506d;stroke-width:1.5}
  .phase-label{font-family:${monoFonts(locale)};font-size:12px;font-weight:700;fill:#83a0bf}
  .decision{fill:#151f38;stroke:#a78bfa;stroke-width:2}
  .decision-title{font-family:${fonts(locale)};font-size:18px;font-weight:800;fill:#e5d9ff}
`;

const definitions = (locale) => `<defs>
  <linearGradient id="canvas" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071323"/><stop offset="1" stop-color="#101a31"/></linearGradient>
  ${[
    ['blue', '#60a5fa'],
    ['cyan', '#2dd4bf'],
    ['amber', '#fbbf24'],
    ['red', '#fb7185'],
    ['purple', '#a78bfa'],
  ].map(([id, color]) => `<marker id="${id}Arrow" viewBox="0 0 10 10" markerWidth="16" markerHeight="16" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" data-role="sequence" data-size="16x16" data-tip-direction="positive-x"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}" data-solid-head="true"/></marker>`).join('\n')}
  <style>${sharedStyles(locale)}</style>
</defs>`;

const sequenceCopy = {
  ko: {
    title: '병원 사정으로 바뀐 예약은 검증과 확정을 나눠 복구한다',
    subtitle: '후보 계산은 트랜잭션 밖에서, 상태 변경은 버전을 다시 확인한 뒤 저장합니다.',
    badges: ['SCOPE · STAFF 운영 복구', 'VERSION · develop 90e50da4', 'SYNC · 일괄 원자성', 'STREAM · 예약별 커밋'],
    participants: [
      ['STAFF', '운영자'],
      ['운영 UI · API', '요청 경계'],
      ['ClosureRescheduleService', '복구 오케스트레이션'],
      ['예약 · 후보 저장소', '현재 상태와 version'],
      ['이력 · 상태 이벤트 · outbox', '복구 근거'],
    ],
    phases: ['영향 범위와 후보 계산', '쓰기 전 재검증과 복구 대기', 'STAFF 확정과 최종 저장'],
    messages: [
      ['휴진 범위 · 원인 · searchDays 제출', 0, 1, 'blue'],
      ['영향 예약 복구 요청', 1, 2, 'blue'],
      ['활성 예약 기준 데이터 · version 조회', 2, 3, 'cyan'],
      ['트랜잭션 밖에서 대체 후보 계산', 2, 3, 'amber'],
      ['현재 상태 · version 재확인', 2, 3, 'cyan'],
      ['PENDING_RESCHEDULE · 이력 · 상태 이벤트 · 후보 저장', 2, 4, 'purple'],
      ['영향 8 · 후보 있음 6 · 후보 없음 2 반환', 2, 1, 'blue'],
      ['후보 선택 또는 자동 재배정', 0, 1, 'amber'],
      ['원본 예약 범위와 후보로 확정 요청', 1, 2, 'amber'],
      ['대체 CONFIRMED · 기존 RESCHEDULED · 선택 후보 · outbox 저장', 2, 4, 'cyan'],
    ],
    decision: '최종 상태 결정',
    outcomes: [
      ['후보 없음', 'STAFF 별도 처리', 'amber'],
      ['상태 · 버전 변경', '동기식 일괄 롤백', 'red'],
      ['스트림 항목 실패', '커밋된 항목과 대조', 'purple'],
      ['확정 완료', '대체 예약 CONFIRMED', 'cyan'],
    ],
  },
  en: {
    title: 'Recover Disrupted Appointments through Separate Validation and Confirmation',
    subtitle: 'Calculate candidates outside the transaction, then recheck state and version before writes.',
    badges: ['SCOPE / STAFF RECOVERY', 'VERSION / develop 90e50da4', 'SYNC / BATCH ATOMICITY', 'STREAM / PER-BOOKING COMMIT'],
    participants: [
      ['STAFF', 'operator'],
      ['Operations UI / API', 'request boundary'],
      ['ClosureRescheduleService', 'recovery orchestration'],
      ['Booking / candidate store', 'current state and version'],
      ['History / status event / outbox', 'recovery evidence'],
    ],
    phases: ['Scope and candidate calculation', 'Write-time revalidation and pending recovery', 'STAFF confirmation and final write'],
    messages: [
      ['submit closure range, cause, and searchDays', 0, 1, 'blue'],
      ['request affected-booking recovery', 1, 2, 'blue'],
      ['read active booking snapshot and version', 2, 3, 'cyan'],
      ['calculate replacement candidates outside transaction', 2, 3, 'amber'],
      ['recheck current state and version', 2, 3, 'cyan'],
      ['store PENDING_RESCHEDULE, history, status event, candidates', 2, 4, 'purple'],
      ['return affected 8, candidates 6, no candidates 2', 2, 1, 'blue'],
      ['select candidate or run automatic reschedule', 0, 1, 'amber'],
      ['confirm scoped original and candidate', 1, 2, 'amber'],
      ['store replacement CONFIRMED, original RESCHEDULED, candidate, outbox', 2, 4, 'cyan'],
    ],
    decision: 'Terminal Outcome Decision',
    outcomes: [
      ['No candidate', 'separate STAFF task', 'amber'],
      ['State or version changed', 'synchronous batch rollback', 'red'],
      ['Stream item failed', 'reconcile committed items', 'purple'],
      ['Confirmation complete', 'replacement is CONFIRMED', 'cyan'],
    ],
  },
};

function sequencePill(number, label, x, y, width, color) {
  return `<g><rect class="pill" x="${x}" y="${y}" width="${width}" height="38" rx="19" stroke="${color}"/><circle cx="${x + 20}" cy="${y + 19}" r="13" fill="${color}" fill-opacity=".2" stroke="${color}"/><text class="num" x="${x + 20}" y="${y + 24}" text-anchor="middle">${number}</text><text class="labelText" x="${x + 43}" y="${y + 24}">${escapeXml(label)}</text></g>`;
}

function renderSequence(locale) {
  const copy = sequenceCopy[locale];
  const width = 1440;
  const height = 1770;
  const participantXs = [130, 420, 710, 1000, 1290];
  const participantIds = ['staff', 'api', 'service', 'store', 'outbox'];
  const messageRows = [355, 465, 575, 685, 795, 905, 1015, 1125, 1235, 1345];
  const colors = { blue: '#60a5fa', cyan: '#2dd4bf', amber: '#fbbf24', red: '#fb7185', purple: '#a78bfa' };
  const headers = copy.participants.map(([title, role], index) => {
    const x = participantXs[index] - 120;
    return `<g><rect id="${participantIds[index]}" class="header card" x="${x}" y="190" width="240" height="92" rx="20"/><text class="participant" x="${participantXs[index]}" y="228" text-anchor="middle">${escapeXml(title)}</text><text class="role" x="${participantXs[index]}" y="256" text-anchor="middle">${escapeXml(role)}</text></g>`;
  }).join('\n');
  const lifelines = participantXs.map((x) => `<path class="lifeline" d="M${x} 282 V1435"/>`).join('\n');
  const badges = copy.badges.map((label, index) => {
    const widths = [230, 245, 210, 245];
    const x = 62 + widths.slice(0, index).reduce((sum, value) => sum + value + 12, 0);
    return `<rect x="${x}" y="126" width="${widths[index]}" height="34" rx="17" fill="#12243a" stroke="#3a5877"/><text class="badge" x="${x + widths[index] / 2}" y="148" text-anchor="middle">${escapeXml(label)}</text>`;
  }).join('\n');
  const phaseY = [304, 748, 1084];
  const phaseHeight = [426, 318, 332];
  const phases = copy.phases.map((label, index) => `<rect class="phase" x="42" y="${phaseY[index]}" width="1356" height="${phaseHeight[index]}" rx="24"/><rect x="1038" y="${phaseY[index] + 12}" width="330" height="28" rx="14" fill="#102239" stroke="#38506d"/><text class="phase-label" x="1203" y="${phaseY[index] + 31}" text-anchor="middle">${escapeXml(label)}</text>`).join('\n');
  const messages = copy.messages.map(([label, from, to, tone], index) => {
    const start = participantXs[from];
    const end = participantXs[to];
    const idealWidth = Math.min(locale === 'ko' ? 500 : 560, Math.max(270, label.length * (locale === 'ko' ? 14 : 8.5) + 72));
    const pillWidth = idealWidth;
    const pillX = (start + end - pillWidth) / 2;
    const rowY = messageRows[index];
    return `${sequencePill(index + 1, label, pillX, rowY - 50, pillWidth, colors[tone])}<path class="call ${tone}-line" data-source-node="${participantIds[from]}" data-target-node="${participantIds[to]}" d="M${start} ${rowY} H${end}"/>`;
  }).join('\n');
  const outcomeCards = copy.outcomes.map(([title, detail, tone], index) => {
    const x = 72 + index * 330;
    const color = colors[tone];
    return `<rect x="${x}" y="1572" width="306" height="92" rx="20" fill="#101f34" stroke="${color}" stroke-width="2"/><text class="outcome" x="${x + 153}" y="1609" text-anchor="middle">${escapeXml(title)}</text><text class="role" x="${x + 153}" y="1639" text-anchor="middle">${escapeXml(detail)}</text>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc" data-locale="${locale}">
<title id="title">${escapeXml(copy.title)}</title><desc id="desc">${escapeXml(copy.subtitle)}</desc>
${definitions(locale)}
<rect width="${width}" height="${height}" fill="url(#canvas)"/><rect class="frame" x="24" y="24" width="1392" height="1722" rx="32"/>
<text class="title" x="62" y="76">${escapeXml(copy.title)}</text><text class="subtitle" x="64" y="108">${escapeXml(copy.subtitle)}</text>
${badges}${phases}${headers}${lifelines}<rect class="activation" x="700" y="333" width="20" height="1060" rx="8"/><rect class="activation" x="990" y="545" width="20" height="305" rx="8"/>
${messages}
<rect class="decision" x="44" y="1480" width="1352" height="218" rx="26"/><rect x="510" y="1458" width="420" height="42" rx="21" fill="#19223a" stroke="#a78bfa" stroke-width="2"/><text class="decision-title" x="720" y="1486" text-anchor="middle">${escapeXml(copy.decision)}</text>${outcomeCards}
</svg>`;
}

const screenCopy = {
  ko: {
    eyebrow: 'STAFF 운영 화면 · 시안', title: '예약 변경 복구', subtitle: '병원 사정으로 영향을 받은 예약과 대체 후보를 확인하고 다음 작업을 선택합니다.',
    incident: ['장비 사용 중단', '레이저 장비 L-02'], range: ['영향 범위', '2026-08-17 09:00–18:00'], search: ['후보 검색', '앞으로 14일'], clinic: '클리닉 A · 피부과',
    metrics: [['영향 예약', '8', '복구 대기'], ['후보 있음', '6', '선택 가능'], ['후보 없음', '2', '별도 처리'], ['진행 방식', 'SYNC', '일괄 원자성']],
    queueTitle: '조치 큐', queueMeta: '영향 시각이 빠른 순서', queueHeaders: ['예약 참조', '현재 상태', '후보', '다음 작업'],
    queue: [['a_7F3A…91C2', 'PENDING_RESCHEDULE', '3개', '후보 확인'], ['a_2B19…4D08', 'PENDING_RESCHEDULE', '없음', '환자 연락·별도 조정'], ['a_93DE…7A40', 'PENDING_RESCHEDULE', '2개', '후보 확인'], ['a_4C01…B8E7', 'STALE', '재계산', '상태·버전 재확인']],
    selected: '선택한 예약', selectedValues: [['appointmentRef', 'a_7F3A…91C2'], ['currentVersion', '12 · 읽기 근거'], ['원래 일정', '08-17 10:30'], ['변경 사유', 'EQUIPMENT_UNAVAILABLE']],
    candidatesTitle: '대체 후보', candidateMeta: '우선순위와 필요한 자원을 함께 확인', candidates: [['1순위', '08-19 11:00', '의사 D-04 · 장비 L-03'], ['2순위', '08-20 15:30', '의사 D-02 · 장비 L-03'], ['3순위', '08-22 09:30', '의사 D-04 · 장비 L-01']],
    select: '이 후보로 재배정', auto: '자동 재배정', noCandidate: '후보 없음 별도 처리', warningTitle: '현재 구현 경계', warning: '후보 확정은 대체 예약을 바로 CONFIRMED로 만듭니다. 환자 동의 근거 수집과 자동 보상은 아직 이 화면의 기능이 아닙니다.', footer: '예시 수치 · 환자 식별정보 없음 · 실제 운영 화면 캡처 아님',
  },
  en: {
    eyebrow: 'STAFF OPERATIONS SCREEN / DESIGN MOCKUP', title: 'Appointment disruption recovery', subtitle: 'Review affected appointments and replacement candidates, then choose the next task.',
    incident: ['Incident', 'Laser device L-02 unavailable'], range: ['Affected range', '2026-08-17 09:00-18:00'], search: ['Candidate search', 'Next 14 days'], clinic: 'Clinic A / dermatology',
    metrics: [['Affected', '8', 'awaiting recovery'], ['Candidates', '6', 'ready to select'], ['No candidate', '2', 'separate handling'], ['Execution', 'SYNC', 'batch atomicity']],
    queueTitle: 'Action queue', queueMeta: 'Earliest affected time first', queueHeaders: ['Appointment ref', 'Current state', 'Candidates', 'Next task'],
    queue: [['a_7F3A…91C2', 'PENDING_RESCHEDULE', '3', 'Review candidates'], ['a_2B19…4D08', 'PENDING_RESCHEDULE', 'None', 'Contact patient and arrange'], ['a_93DE…7A40', 'PENDING_RESCHEDULE', '2', 'Review candidates'], ['a_4C01…B8E7', 'STALE', 'Recalculate', 'Recheck state and version']],
    selected: 'Selected appointment', selectedValues: [['appointmentRef', 'a_7F3A…91C2'], ['currentVersion', '12 / read evidence'], ['Original time', 'Aug 17 / 10:30'], ['Reason', 'EQUIPMENT_UNAVAILABLE']],
    candidatesTitle: 'Replacement candidates', candidateMeta: 'Review rank and required resources together', candidates: [['Rank 1', 'Aug 19 / 11:00', 'D-04 / laser L-03'], ['Rank 2', 'Aug 20 / 15:30', 'D-02 / laser L-03'], ['Rank 3', 'Aug 22 / 09:30', 'D-04 / laser L-01']],
    select: 'Reschedule here', auto: 'Auto reschedule', noCandidate: 'No-candidate task', warningTitle: 'Current implementation boundary', warning: 'Confirming a candidate immediately creates a CONFIRMED replacement. Patient-consent evidence and automatic compensation are not implemented by this screen.', footer: 'Illustrative values / no patient identifiers / not a production screenshot',
  },
};

function renderScreen(locale) {
  const copy = screenCopy[locale];
  const width = 1600;
  const height = 1180;
  const metrics = copy.metrics.map(([label, value, detail], index) => {
    const x = 70 + index * 370;
    const tone = index === 2 ? '#fbbf24' : index === 1 ? '#2dd4bf' : '#60a5fa';
    const detailX = value === 'SYNC' ? x + 190 : x + 118;
    return `<rect x="${x}" y="276" width="350" height="126" rx="18" fill="#14243a" stroke="${tone}" stroke-opacity=".65"/><text class="ui-mono" x="${x + 22}" y="307" fill="#91a8c3" font-size="13">${escapeXml(label)}</text><text class="ui-value" x="${x + 22}" y="356">${escapeXml(value)}</text><text class="ui-label" x="${detailX}" y="354" fill="#91a8c3" font-size="14">${escapeXml(detail)}</text>`;
  }).join('\n');
  const queueRows = copy.queue.map((row, rowIndex) => {
    const y = 518 + rowIndex * 56;
    return `<rect x="72" y="${y - 34}" width="820" height="54" fill="${rowIndex === 0 ? '#18344b' : rowIndex % 2 ? '#101d30' : '#122137'}"/><text class="ui-mono" x="92" y="${y}">${escapeXml(row[0])}</text><text class="ui-mono" x="292" y="${y}" fill="${rowIndex === 3 ? '#fb7185' : '#7fc9ff'}">${escapeXml(row[1])}</text><text class="ui-label" x="548" y="${y}">${escapeXml(row[2])}</text><text class="ui-label" x="666" y="${y}">${escapeXml(row[3])}</text>`;
  }).join('\n');
  const details = copy.selectedValues.map(([label, value], index) => {
    const x = 934 + (index % 2) * 286;
    const y = 548 + Math.floor(index / 2) * 72;
    return `<text class="ui-mono" x="${x}" y="${y}" fill="#7189a4" font-size="12">${escapeXml(label)}</text><text class="ui-label" x="${x}" y="${y + 27}" font-size="14">${escapeXml(value)}</text>`;
  }).join('\n');
  const candidates = copy.candidates.map(([rank, time, resources], index) => {
    const x = 70 + index * 350;
    const selected = index === 0;
    return `<rect x="${x}" y="805" width="330" height="198" rx="18" fill="${selected ? '#17334a' : '#122137'}" stroke="${selected ? '#2dd4bf' : '#314a67'}" stroke-width="2"/><text class="ui-mono" x="${x + 22}" y="840" fill="${selected ? '#74e4d1' : '#8ea4bd'}" font-size="13">${escapeXml(rank)}</text><text class="ui-card-title" x="${x + 22}" y="883">${escapeXml(time)}</text><text class="ui-label" x="${x + 22}" y="919" fill="#a9bad0" font-size="14">${escapeXml(resources)}</text><rect x="${x + 22}" y="948" width="190" height="36" rx="9" fill="${selected ? '#2dd4bf' : '#22364e'}"/><text class="ui-button" x="${x + 117}" y="972" text-anchor="middle" fill="${selected ? '#092028' : '#dce8f5'}">${escapeXml(copy.select)}</text>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc" data-locale="${locale}">
<title id="title">${escapeXml(copy.title)}</title><desc id="desc">${escapeXml(copy.subtitle)}</desc>
<defs><linearGradient id="screen-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#091321"/><stop offset="1" stop-color="#101b2e"/></linearGradient><style>
  .ui-title,.ui-section,.ui-card-title{font-family:${fonts(locale)};fill:#f4f8ff;font-weight:800}.ui-title{font-size:34px}.ui-section{font-size:${locale === 'ko' ? 19 : 17}px}.ui-card-title{font-size:22px}.ui-label,.ui-mono,.ui-button{font-family:${monoFonts(locale)};fill:#dce8f5}.ui-label{font-size:13px}.ui-mono{font-size:12px}.ui-button{font-size:${locale === 'ko' ? 13 : 12}px;font-weight:800}.ui-value{font-family:${fonts(locale)};fill:#f4f8ff;font-size:39px;font-weight:900}.divider{stroke:#263d59;stroke-width:1}
</style></defs>
<rect width="${width}" height="${height}" fill="#07111e"/><rect x="30" y="28" width="1540" height="1124" rx="28" fill="url(#screen-bg)" stroke="#3b5574" stroke-width="2"/>
<text class="ui-mono" x="70" y="72" fill="#7fc9ff" font-size="12" font-weight="800">${escapeXml(copy.eyebrow)}</text><text class="ui-title" x="70" y="116">${escapeXml(copy.title)}</text><text class="ui-label" x="70" y="145" fill="#9aacc1" font-size="14">${escapeXml(copy.subtitle)}</text><text class="ui-label" x="1518" y="106" fill="#a9bad0" text-anchor="end">${escapeXml(copy.clinic)}</text><rect x="1432" y="122" width="86" height="30" rx="8" fill="#17334a" stroke="#4c7798"/><text class="ui-mono" x="1475" y="142" text-anchor="middle" fill="#7fc9ff" font-weight="800">STAFF</text>
<rect x="70" y="176" width="1460" height="76" rx="16" fill="#111f32" stroke="#2f4865"/><text class="ui-mono" x="94" y="205" fill="#7189a4">${escapeXml(copy.incident[0])}</text><text class="ui-label" x="94" y="231">${escapeXml(copy.incident[1])}</text><line class="divider" x1="493" y1="191" x2="493" y2="237"/><text class="ui-mono" x="522" y="205" fill="#7189a4">${escapeXml(copy.range[0])}</text><text class="ui-label" x="522" y="231">${escapeXml(copy.range[1])}</text><line class="divider" x1="1054" y1="191" x2="1054" y2="237"/><text class="ui-mono" x="1082" y="205" fill="#7189a4">${escapeXml(copy.search[0])}</text><text class="ui-label" x="1082" y="231">${escapeXml(copy.search[1])}</text><rect x="1374" y="194" width="128" height="38" rx="10" fill="#215778"/><text class="ui-button" x="1438" y="219" text-anchor="middle">${locale === 'ko' ? '영향 조회' : 'Find affected'}</text>
${metrics}
<text class="ui-section" x="70" y="447">${escapeXml(copy.queueTitle)}</text><text class="ui-label" x="892" y="447" fill="#7189a4" text-anchor="end">${escapeXml(copy.queueMeta)}</text><rect x="70" y="463" width="824" height="276" rx="16" fill="#101d30" stroke="#2f4865"/><rect x="72" y="465" width="820" height="46" rx="14" fill="#17263a"/><text class="ui-mono" x="92" y="494" fill="#7189a4">${escapeXml(copy.queueHeaders[0])}</text><text class="ui-mono" x="292" y="494" fill="#7189a4">${escapeXml(copy.queueHeaders[1])}</text><text class="ui-mono" x="548" y="494" fill="#7189a4">${escapeXml(copy.queueHeaders[2])}</text><text class="ui-mono" x="666" y="494" fill="#7189a4">${escapeXml(copy.queueHeaders[3])}</text>${queueRows}
<rect x="918" y="463" width="612" height="276" rx="16" fill="#111f32" stroke="#2f4865"/><text class="ui-section" x="942" y="500">${escapeXml(copy.selected)}</text><rect x="1372" y="478" width="130" height="30" rx="8" fill="#243f51"/><text class="ui-mono" x="1437" y="498" text-anchor="middle" fill="#74e4d1">PENDING</text>${details}<line class="divider" x1="942" y1="681" x2="1502" y2="681"/><text class="ui-label" x="942" y="712" fill="#fbbf24">${locale === 'ko' ? '확정 전에 상태와 version을 다시 확인합니다.' : 'Recheck state and version before confirmation.'}</text>
<text class="ui-section" x="70" y="785">${escapeXml(copy.candidatesTitle)}</text><text class="ui-label" x="1100" y="785" fill="#7189a4" text-anchor="end">${escapeXml(copy.candidateMeta)}</text>${candidates}
<rect x="1120" y="805" width="410" height="198" rx="18" fill="#111f32" stroke="#6d5837"/><text class="ui-section" x="1144" y="842">${locale === 'ko' ? '허용된 작업' : 'Permitted work'}</text><rect x="1144" y="866" width="166" height="40" rx="10" fill="#2dd4bf"/><text class="ui-button" x="1227" y="892" text-anchor="middle" fill="#092028">${escapeXml(copy.auto)}</text><rect x="1322" y="866" width="184" height="40" rx="10" fill="#233850" stroke="#496583"/><text class="ui-button" x="1414" y="892" text-anchor="middle">${escapeXml(copy.noCandidate)}</text><text class="ui-label" x="1144" y="938" fill="#fbbf24">${locale === 'ko' ? '후보 없음 2건은 자동 확정하지 않습니다.' : 'Two no-candidate items are not auto-confirmed.'}</text><text class="ui-label" x="1144" y="966" fill="#8ea4bd">${locale === 'ko' ? '스트림 중단 시 커밋된 항목을 먼저 대조합니다.' : 'After stream interruption, reconcile committed items first.'}</text>
<rect x="70" y="1028" width="1460" height="76" rx="16" fill="#2b2218" stroke="#9b743d"/><text class="ui-mono" x="94" y="1059" fill="#fbbf24" font-weight="800">${escapeXml(copy.warningTitle)}</text><text class="ui-label" x="94" y="1086" fill="#dccbaa">${escapeXml(copy.warning)}</text><text class="ui-mono" x="1530" y="1132" fill="#6f8299" text-anchor="end">${escapeXml(copy.footer)}</text>
</svg>`;
}

await mkdir(outputDirectory, { recursive: true });
for (const locale of ['ko', 'en']) {
  const assets = [
    [`clinic-appointment-disruption-recovery-sequence-${locale}`, renderSequence(locale)],
    [`clinic-appointment-disruption-recovery-operations-screen-${locale}`, renderScreen(locale)],
  ];
  for (const [stem, svg] of assets) {
    const svgPath = resolve(outputDirectory, `${stem}.svg`);
    const pngPath = resolve(outputDirectory, `${stem}.png`);
    await writeFile(svgPath, `${svg.trim()}\n`, 'utf8');
    execFileSync('xmllint', ['--noout', svgPath], { stdio: 'inherit' });
    execFileSync('cairosvg', [svgPath, '-o', pngPath, '-s', '2'], { stdio: 'inherit' });
  }
}
