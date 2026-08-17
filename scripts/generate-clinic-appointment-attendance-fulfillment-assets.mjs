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

const colors = Object.freeze({
  blue: '#60a5fa',
  cyan: '#2dd4bf',
  amber: '#fbbf24',
  red: '#fb7185',
  purple: '#a78bfa',
});

const text = (className, x, y, value, extra = '') =>
  '<text class="' + className + '" x="' + x + '" y="' + y + '" ' + extra + '>' +
  escapeXml(value) + '</text>';

const markerDefinitions = (locale) => {
  const markers = Object.entries(colors).map(([tone, color]) =>
    '<marker id="' + tone + 'Arrow" viewBox="0 0 10 10" markerWidth="16" markerHeight="16" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" data-role="sequence" data-size="16x16" data-tip-direction="positive-x">' +
    '<path d="M 0 0 L 10 5 L 0 10 Z" fill="' + color + '" data-solid-head="true"/></marker>',
  ).join('');
  return '<defs>' +
    '<linearGradient id="flowCanvas" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071323"/><stop offset="1" stop-color="#111b31"/></linearGradient>' +
    markers +
    '<style>' +
    '.title{font-family:' + fonts(locale) + ';font-size:' + (locale === 'ko' ? 38 : 32) + 'px;font-weight:800;fill:#f4f8ff}' +
    '.subtitle{font-family:' + monoFonts(locale) + ';font-size:16px;fill:#a9bad0}' +
    '.badge{font-family:' + monoFonts(locale) + ';font-size:12px;font-weight:800;fill:#c9dcf3}' +
    '.participant{font-family:' + fonts(locale) + ';font-size:' + (locale === 'ko' ? 15 : 14) + 'px;font-weight:800;fill:#f4f8ff}' +
    '.role{font-family:' + monoFonts(locale) + ';font-size:11px;fill:#91a8c3}' +
    '.label{font-family:' + monoFonts(locale) + ';font-size:' + (locale === 'ko' ? 13 : 12) + 'px;fill:#e7f0fb}' +
    '.outcome{font-family:' + monoFonts(locale) + ';font-size:13px;font-weight:800;fill:#f8fbff}' +
    '.outcomeCode{font-family:' + monoFonts(locale) + ';font-size:20px;font-weight:800;fill:#f8fbff}' +
    '.outcomeDetail{font-family:' + fonts(locale) + ';font-size:17px;fill:#b7c7da}' +
    '.phase{fill:#0b1729;fill-opacity:.3;stroke:#38506d;stroke-width:1.5}' +
    '.phaseLabel{font-family:' + monoFonts(locale) + ';font-size:11px;font-weight:800;fill:#83a0bf}' +
    '.lifeline{fill:none;stroke:#516985;stroke-width:2;stroke-dasharray:8 10}' +
    '.header{fill:#13243b;stroke:#395675;stroke-width:2}' +
    '.activation{fill:#17314e;stroke:#7898b7;stroke-width:2}' +
    '.pill{fill:#0d1b2f;stroke-width:2}' +
    '.call{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}' +
    '.blue-line{stroke:' + colors.blue + ';marker-end:url(#blueArrow)}' +
    '.cyan-line{stroke:' + colors.cyan + ';marker-end:url(#cyanArrow)}' +
    '.amber-line{stroke:' + colors.amber + ';marker-end:url(#amberArrow)}' +
    '.red-line{stroke:' + colors.red + ';marker-end:url(#redArrow)}' +
    '.purple-line{stroke:' + colors.purple + ';marker-end:url(#purpleArrow)}' +
    '.decision{fill:#151f38;stroke:' + colors.purple + ';stroke-width:2}' +
    '.decisionTitle{font-family:' + fonts(locale) + ';font-size:' + (locale === 'ko' ? 20 : 18) + 'px;font-weight:800;fill:#e5d9ff}' +
    '.legend{font-family:' + monoFonts(locale) + ';font-size:11px;fill:#9fb3c8}' +
    '</style></defs>';
};

const flowCopy = {
  ko: {
    title: '내원 확인과 시술 완료는 다른 사실이다',
    subtitle: '예약 상태는 예약 흐름을, 외부 이행 fact는 실제 시술 결과를 기록합니다.',
    badges: ['SCOPE · 내원 / 이행', 'VERSION · immutable revision', 'ROLE · STAFF / 외부 서비스', 'DATA · 합성 시안'],
    participants: [
      ['STAFF', '버튼과 운영 큐'],
      ['예약 API', '예약 상태·이력'],
      ['임상·시술 서비스', '실제 결과 소유'],
      ['외부 fact ingress', '신뢰·schema 검증'],
      ['이행 fact handler', 'Plan revision 투영'],
      ['후속 작업 큐', '다음 작업 표시'],
    ],
    phases: [
      ['예약 흐름', 314, 350],
      ['외부 이행 fact', 674, 390],
      ['운영 후속 처리', 1074, 286],
    ],
    messages: [
      ['CheckIn · 내원 확인', 0, 1, 'blue'],
      ['StartTreatment · 진료 시작', 0, 1, 'cyan'],
      ['Complete · 예약 흐름 종료', 0, 1, 'purple'],
      ['TreatmentFulfillmentEvent · 실제 결과', 2, 3, 'amber'],
      ['payload · schema · signature · source version 검증', 3, 4, 'purple'],
      ['새 Plan revision · 후속 작업 투영', 4, 5, 'cyan'],
      ['상태 · policy · revision 다시 확인', 5, 5, 'blue'],
    ],
    decision: '최종 상태 결정',
    decisionNote: '네 가지 외부 fact outcome 중 하나만 기록합니다.',
    outcomes: [
      ['COMPLETED', '전체 치료 항목 완료', 'Plan 재조회', 'cyan'],
      ['PARTIALLY_FULFILLED', '완료 항목 보존 + 남은 작업', '새 treatment 예약 검토', 'amber'],
      ['RESOURCE_DISRUPTED', '자원 장애와 remaining 정의', '운영 예외 확인', 'red'],
      ['REFUNDED', '환불 fact 투영', 'BLOCKING 후속만 확인', 'purple'],
    ],
    legendSolid: '실선 · 요청 / 검증 / 투영',
    legendDashed: '점선 · 외부 fact 대기 경계',
  },
  en: {
    title: 'Attendance and Treatment Completion Are Different Facts',
    subtitle: 'Appointment states record the booking flow; external fulfillment facts record actual treatment results.',
    badges: ['SCOPE / attendance + fulfillment', 'VERSION / immutable revision', 'ROLE / STAFF + services', 'DATA / synthetic mockup'],
    participants: [
      ['STAFF', 'actions + operations queue'],
      ['Appointment API', 'state + history'],
      ['Clinical/Treatment', 'result owner'],
      ['External fact ingress', 'trust + schema'],
      ['Fulfillment handler', 'Plan revision'],
      ['Follow-up queue', 'next action'],
    ],
    phases: [
      ['Appointment flow', 314, 350],
      ['External fulfillment fact', 674, 390],
      ['Operational follow-up', 1074, 286],
    ],
    messages: [
      ['CheckIn / attendance confirmed', 0, 1, 'blue'],
      ['StartTreatment / treatment starts', 0, 1, 'cyan'],
      ['Complete / appointment flow ends', 0, 1, 'purple'],
      ['TreatmentFulfillmentEvent / actual result', 2, 3, 'amber'],
      ['verify payload, schema, signature, source version', 3, 4, 'purple'],
      ['project new Plan revision + follow-up work', 4, 5, 'cyan'],
      ['recheck state, policy, and revision', 5, 5, 'blue'],
    ],
    decision: 'Final State Decision',
    decisionNote: 'Record exactly one of the four external fulfillment outcomes.',
    outcomes: [
      ['COMPLETED', 'all treatment items complete', 're-read Plan', 'cyan'],
      ['PARTIALLY_FULFILLED', 'preserve completed + remaining work', 'review new treatment booking', 'amber'],
      ['RESOURCE_DISRUPTED', 'resource issue + remaining definition', 'review operational exception', 'red'],
      ['REFUNDED', 'project refund fact', 'review BLOCKING follow-up only', 'purple'],
    ],
    legendSolid: 'solid / request, verification, projection',
    legendDashed: 'dashed / waiting boundary for external fact',
  },
};

function sequencePill(number, label, x, y, width, tone) {
  return '<g>' +
    '<rect class="pill" x="' + x + '" y="' + y + '" width="' + width + '" height="38" rx="19" stroke="' + colors[tone] + '"/>' +
    '<circle cx="' + (x + 20) + '" cy="' + (y + 19) + '" r="13" fill="' + colors[tone] + '" fill-opacity=".2" stroke="' + colors[tone] + '"/>' +
    text('outcome num', x + 20, y + 24, number, 'text-anchor="middle"') +
    text('label', x + 44, y + 24, label) +
    '</g>';
}

function renderFlow(locale) {
  const copy = flowCopy[locale];
  const width = 1600;
  const height = 2110;
  const participantXs = [130, 398, 666, 934, 1202, 1470];
  const participantIds = ['staff', 'appointmentApi', 'clinicalService', 'ingress', 'handler', 'operationsQueue'];
  const phaseRects = copy.phases.map(([label, y, heightValue]) =>
    '<rect class="phase" x="38" y="' + y + '" width="1524" height="' + heightValue + '" rx="24"/>' +
    '<rect x="1150" y="' + (y + 14) + '" width="330" height="28" rx="14" fill="#102239" stroke="#38506d"/>' +
    text('phaseLabel', 1315, y + 33, label, 'text-anchor="middle"'),
  ).join('');
  const headerRects = copy.participants.map(([title, role], index) => {
    const x = participantXs[index] - 108;
    return '<g><rect class="header" x="' + x + '" y="188" width="216" height="94" rx="18"/>' +
      text('participant', participantXs[index], 226, title, 'text-anchor="middle"') +
      text('role', participantXs[index], 255, role, 'text-anchor="middle"') + '</g>';
  }).join('');
  const lifelines = participantXs.map((x) => '<path class="lifeline" d="M' + x + ' 282 V1386"/>').join('');
  const badgeWidths = [250, 280, 270, 205];
  const badges = copy.badges.map((label, index) => {
    const x = 58 + badgeWidths.slice(0, index).reduce((sum, value) => sum + value + 12, 0);
    return '<rect x="' + x + '" y="124" width="' + badgeWidths[index] + '" height="34" rx="17" fill="#12243a" stroke="#3a5877"/>' +
      text('badge', x + badgeWidths[index] / 2, 147, label, 'text-anchor="middle"');
  }).join('');
  const messageRows = [432, 562, 692, 822, 952, 1082, 1212];
  const messages = copy.messages.map(([label, from, to, tone], index) => {
    const start = participantXs[from];
    const end = participantXs[to];
    const sameParticipant = start === end;
    const rowY = messageRows[index];
    const idealWidth = sameParticipant
      ? 300
      : Math.min(locale === 'ko' ? 610 : 650, Math.max(270, label.length * (locale === 'ko' ? 12.5 : 7.5) + 76));
    const pillX = sameParticipant ? start - idealWidth - 10 : (start + end - idealWidth) / 2;
    const path = sameParticipant
      ? 'M' + (start - 10) + ' ' + rowY + ' Q' + (start - 58) + ' ' + rowY + ' ' + (start - 78) + ' ' + (rowY + 24) + ' Q' + (start - 78) + ' ' + (rowY + 48) + ' ' + (start - 10) + ' ' + (rowY + 48)
      : 'M' + start + ' ' + rowY + ' H' + end;
    return sequencePill(index + 1, label, pillX, rowY - 50, idealWidth, tone) +
      '<path class="call ' + tone + '-line" data-source-node="' + participantIds[from] + '" data-target-node="' + participantIds[to] + '" d="' + path + '"/>';
  }).join('');
  const outcomeCardX = 76;
  const outcomeCardWidth = 342;
  const outcomeCardStep = 370;
  const outcomeCardTop = 1680;
  const decisionNode = { x: 520, y: 1404, width: 560, height: 76, bottom: 1480 };
  const outcomeCenters = copy.outcomes.map((_, index) => outcomeCardX + index * outcomeCardStep + outcomeCardWidth / 2);
  const outcomeRoutes = [
    { sourceX: 650, laneY: 1548 },
    { sourceX: 720, laneY: 1588 },
    { sourceX: 880, laneY: 1588 },
    { sourceX: 950, laneY: 1548 },
  ];
  const outcomeCards = copy.outcomes.map(([code, detail, next, tone], index) => {
    const x = outcomeCardX + index * outcomeCardStep;
    const center = outcomeCenters[index];
    const { sourceX, laneY } = outcomeRoutes[index];
    const direction = center < sourceX ? -1 : 1;
    const cornerRadius = 24;
    const sourceTurnX = sourceX + direction * cornerRadius;
    const targetApproachX = center - direction * cornerRadius;
    const roundedPath = 'M' + sourceX + ' ' + decisionNode.bottom +
      ' V' + (laneY - cornerRadius) +
      ' Q' + sourceX + ' ' + laneY + ' ' + sourceTurnX + ' ' + laneY +
      ' H' + targetApproachX +
      ' Q' + center + ' ' + laneY + ' ' + center + ' ' + (laneY + cornerRadius) +
      ' V' + outcomeCardTop;
    return '<rect id="outcome-' + index + '" x="' + x + '" y="' + outcomeCardTop + '" width="' + outcomeCardWidth + '" height="210" rx="20" fill="#101f34" stroke="' + colors[tone] + '" stroke-width="2"/>' +
      text('outcomeCode', center, 1728, code, 'text-anchor="middle"') +
      text('outcomeDetail', center, 1767, detail, 'text-anchor="middle"') +
      text('outcomeDetail', center, 1804, next, 'text-anchor="middle"') +
      '<path class="call ' + tone + '-line" data-source-node="finalDecision" data-target-node="outcome-' + index + '" d="' + roundedPath + '"/>';
  }).join('');
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-labelledby="flow-title flow-desc" data-locale="' + locale + '">' +
    '<metadata>sequence diagram</metadata>' +
    '<title id="flow-title">' + escapeXml(copy.title) + '</title>' +
    '<desc id="flow-desc">' + escapeXml(copy.subtitle) + '</desc>' +
    markerDefinitions(locale) +
    '<rect width="' + width + '" height="' + height + '" fill="url(#flowCanvas)"/>' +
    '<rect class="frame" x="24" y="24" width="1552" height="2062" rx="32" fill="none" stroke="#2d4665" stroke-width="2"/>' +
    text('title', 62, 76, copy.title) +
    text('subtitle', 64, 108, copy.subtitle) +
    badges + phaseRects + headerRects + lifelines +
    '<rect class="activation" x="388" y="360" width="20" height="620" rx="8"/>' +
    '<rect class="activation" x="1192" y="900" width="20" height="190" rx="8"/>' +
    messages +
    '<rect class="decision" x="44" y="1436" width="1512" height="540" rx="26"/>' +
    '<rect x="' + decisionNode.x + '" y="' + decisionNode.y + '" width="' + decisionNode.width + '" height="' + decisionNode.height + '" rx="23" fill="#19223a" stroke="' + colors.purple + '" stroke-width="2"/>' +
    text('decisionTitle', 800, 1437, copy.decision, 'text-anchor="middle"') +
    text('legend', 800, 1463, copy.decisionNote, 'text-anchor="middle"') +
    outcomeCards +
    text('legend', 800, 1942, copy.legendSolid + '   ·   ' + copy.legendDashed, 'text-anchor="middle"') +
    '<path d="M70 1360 H1530" stroke="#516985" stroke-width="2" stroke-dasharray="8 10" opacity=".8"/>' +
    text('legend', 800, 1392, copy.legendDashed, 'text-anchor="middle"') +
    '</svg>';
}

const screenCopy = {
  ko: {
    eyebrow: 'STAFF 운영 화면 · 설계 시안',
    title: '내원·시술 이행 운영',
    subtitle: '예약 흐름과 실제 시술 사실을 분리해 다음 작업을 선택합니다.',
    clinic: '클리닉 A · 피부과',
    metrics: [
      ['오늘 예약', '18', '예약 목록'],
      ['내원 확인', '11', 'CHECKED_IN'],
      ['진행 중', '3', 'IN_PROGRESS'],
      ['예약 종료', '7', '예약 COMPLETED'],
      ['외부 사실 대기', '4', '검증 필요'],
      ['후속 작업 큐', '5', '조치 필요'],
    ],
    queueTitle: '조치 큐',
    queueMeta: '현재 상태와 다음 작업을 함께 표시',
    queueHeaders: ['예약 참조', '현재 상태', '외부 사실', '다음 작업'],
    queue: [
      ['a_7F3A…91C2', 'CHECKED_IN', '대기', '시술 결과 확인'],
      ['a_2B19…4D08', 'COMPLETED', '미수신', '외부 fact 대기'],
      ['a_93DE…7A40', 'COMPLETED', 'PARTIAL', '남은 작업 검토'],
      ['a_4C01…B8E7', 'COMPLETED', 'REFUNDED', 'BLOCKING 후속 확인'],
      ['a_1D02…5E76', 'IN_PROGRESS', '—', '진행 상태 확인'],
    ],
    stateTitle: '상태 비교',
    stateRows: [
      ['CHECKED_IN', '예약 서비스', '내원 확인'],
      ['예약 COMPLETED', '예약 서비스', '예약 종료'],
      ['시술 완료 fact', '임상 서비스', 'Plan 투영'],
      ['PARTIAL / 장애', '외부 fact', '남은 작업'],
      ['REFUNDED', '결제 서비스', 'BLOCKING 확인'],
    ],
    actionTitle: '운영자가 지금 할 일',
    actions: ['시술 결과 확인 대기', '부분 이행 검토', '자원 장애 예외 확인', '환불 후속 확인'],
    boundaryTitle: '소유권 경계',
    boundary: '예약 서비스는 임상 완료나 환불 금액을 추정하지 않습니다.',
    footer: '설계 시안 · 실제 환자 정보 없음 · 운영 대시보드 API의 구현을 의미하지 않음',
  },
  en: {
    eyebrow: 'STAFF OPERATIONS SCREEN / DESIGN MOCKUP',
    title: 'Attendance and fulfillment operations',
    subtitle: 'Separate the appointment flow from treatment facts before choosing the next task.',
    clinic: 'Clinic A / dermatology',
    metrics: [
      ['Today', '18', 'appointments'],
      ['Arrived', '11', 'CHECKED_IN'],
      ['In progress', '3', 'IN_PROGRESS'],
      ['Appointment end', '7', 'appointment COMPLETED'],
      ['External facts', '4', 'awaiting verify'],
      ['Follow-up queue', '5', 'action needed'],
    ],
    queueTitle: 'Action queue',
    queueMeta: 'current state and next task together',
    queueHeaders: ['Appointment ref', 'Current state', 'External fact', 'Next task'],
    queue: [
      ['a_7F3A…91C2', 'CHECKED_IN', 'waiting', 'Review treatment result'],
      ['a_2B19…4D08', 'COMPLETED', 'missing', 'Wait for external fact'],
      ['a_93DE…7A40', 'COMPLETED', 'PARTIAL', 'Review remaining work'],
      ['a_4C01…B8E7', 'COMPLETED', 'REFUNDED', 'Review BLOCKING follow-up'],
      ['a_1D02…5E76', 'IN_PROGRESS', '—', 'Check progress state'],
    ],
    stateTitle: 'State comparison',
    stateRows: [
      ['CHECKED_IN', 'Appointment', 'attendance confirmed'],
      ['Appointment COMPLETED', 'Appointment', 'booking flow ended'],
      ['Treatment fact', 'Clinical service', 'project to Plan'],
      ['PARTIAL / disruption', 'External fact', 'remaining work'],
      ['REFUNDED', 'Payment service', 'review BLOCKING'],
    ],
    actionTitle: 'What STAFF does next',
    actions: ['Wait for treatment result', 'Review partial fulfillment', 'Review resource exception', 'Review refund follow-up'],
    boundaryTitle: 'Ownership boundary',
    boundary: 'The appointment service does not infer clinical completion or refund amounts.',
    footer: 'Design mockup / no patient data / does not claim a production dashboard API',
  },
};

function renderScreen(locale) {
  const copy = screenCopy[locale];
  const width = 1680;
  const height = 1280;
  const metricWidth = 244;
  const metricCards = copy.metrics.map(([label, value, detail], index) => {
    const x = 78 + index * 255;
    const tone = [colors.blue, colors.cyan, colors.cyan, colors.purple, colors.amber, colors.red][index];
    return '<rect x="' + x + '" y="242" width="' + metricWidth + '" height="112" rx="16" fill="#14243a" stroke="' + tone + '" stroke-opacity=".7"/>' +
      text('ui-mono', x + 18, 270, label) +
      text('ui-value', x + 18, 318, value) +
      text('ui-label', x + 92, 317, detail);
  }).join('');
  const queueRows = copy.queue.map((row, index) => {
    const y = 512 + index * 54;
    const tone = row[2] === 'REFUNDED' ? colors.purple : row[2] === 'PARTIAL' ? colors.amber : row[2] === 'missing' || row[2] === '미수신' ? colors.red : colors.cyan;
    return '<rect x="80" y="' + (y - 32) + '" width="900" height="50" fill="' + (index === 0 ? '#18344b' : index % 2 ? '#101d30' : '#122137') + '"/>' +
      text('ui-mono', 98, y, row[0]) +
      text('ui-mono', 300, y, row[1], 'fill="' + (row[1] === 'COMPLETED' ? colors.purple : colors.cyan) + '"') +
      text('ui-mono', 555, y, row[2], 'fill="' + tone + '"') +
      text('ui-label', 735, y, row[3]);
  }).join('');
  const stateRows = copy.stateRows.map(([state, owner, meaning], index) => {
    const y = 520 + index * 50;
    return '<rect x="1044" y="' + (y - 30) + '" width="532" height="50" fill="' + (index % 2 ? '#101d30' : '#122137') + '"/>' +
      text('ui-mono', 1060, y, state, 'fill="' + (index === 2 ? colors.cyan : index === 4 ? colors.purple : '#dce8f5') + '"') +
      text('ui-label', 1230, y, owner) +
      text('ui-label', 1390, y, meaning);
  }).join('');
  const actions = copy.actions.map((label, index) => {
    const x = 84 + index * 368;
    const tone = [colors.blue, colors.amber, colors.red, colors.purple][index];
    return '<rect x="' + x + '" y="904" width="340" height="92" rx="14" fill="#111f32" stroke="' + tone + '" stroke-opacity=".75"/>' +
      text('ui-mono', x + 18, 938, '0' + (index + 1), 'fill="' + tone + '"') +
      text('ui-label', x + 52, 938, label) +
      text('ui-button', x + 18, 972, locale === 'ko' ? '다음 작업 보기' : 'Open next task');
  }).join('');
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-labelledby="screen-title screen-desc" data-locale="' + locale + '">' +
    '<title id="screen-title">' + escapeXml(copy.title) + '</title>' +
    '<desc id="screen-desc">' + escapeXml(copy.subtitle) + '</desc>' +
    '<defs><linearGradient id="screenCanvas" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#091321"/><stop offset="1" stop-color="#101b2e"/></linearGradient><style>' +
    '.screen{font-family:' + fonts(locale) + ';fill:#f4f8ff}.ui-title,.ui-section{font-family:' + fonts(locale) + ';fill:#f4f8ff}.ui-title{font-size:36px;font-weight:900}.ui-section{font-size:' + (locale === 'ko' ? 20 : 18) + 'px;font-weight:800}.ui-label,.ui-mono,.ui-button{font-family:' + monoFonts(locale) + ';fill:#dce8f5}.ui-label{font-size:12px}.ui-mono{font-size:11px}.ui-button{font-size:11px;font-weight:800}.ui-value{font-family:' + fonts(locale) + ';fill:#f4f8ff;font-size:36px;font-weight:900}.divider{stroke:#263d59;stroke-width:1}' +
    '</style></defs>' +
    '<rect width="' + width + '" height="' + height + '" fill="#07111e"/><rect x="36" y="30" width="1608" height="1214" rx="30" fill="url(#screenCanvas)" stroke="#3b5574" stroke-width="2"/>' +
    text('ui-mono', 80, 76, copy.eyebrow, 'fill="#7fc9ff" font-weight="800"') +
    text('ui-title', 80, 122, copy.title) +
    text('ui-label', 80, 151, copy.subtitle, 'fill="#9aacc1"') +
    text('ui-label', 1568, 101, copy.clinic, 'text-anchor="end"') +
    '<rect x="1480" y="118" width="90" height="30" rx="8" fill="#17334a" stroke="#4c7798"/>' +
    text('ui-mono', 1525, 138, 'STAFF', 'text-anchor="middle" fill="#7fc9ff" font-weight="800"') +
    metricCards +
    '<text class="ui-section" x="80" y="404">' + escapeXml(copy.queueTitle) + '</text>' +
    text('ui-label', 980, 404, copy.queueMeta, 'text-anchor="end" fill="#7189a4"') +
    '<rect x="80" y="420" width="904" height="354" rx="16" fill="#101d30" stroke="#2f4865"/>' +
    '<rect x="82" y="422" width="900" height="54" rx="14" fill="#17263a"/>' +
    text('ui-mono', 98, 456, copy.queueHeaders[0], 'fill="#7189a4"') +
    text('ui-mono', 300, 456, copy.queueHeaders[1], 'fill="#7189a4"') +
    text('ui-mono', 555, 456, copy.queueHeaders[2], 'fill="#7189a4"') +
    text('ui-mono', 735, 456, copy.queueHeaders[3], 'fill="#7189a4"') +
    queueRows +
    '<rect x="1044" y="420" width="532" height="354" rx="16" fill="#111f32" stroke="#2f4865"/>' +
    '<text class="ui-section" x="1066" y="458">' + escapeXml(copy.stateTitle) + '</text>' +
    stateRows +
    '<text class="ui-section" x="80" y="834">' + escapeXml(copy.actionTitle) + '</text>' +
    actions +
    '<rect x="80" y="1030" width="1496" height="126" rx="16" fill="#2b2218" stroke="#9b743d"/>' +
    text('ui-mono', 104, 1070, copy.boundaryTitle, 'fill="#fbbf24" font-weight="800"') +
    text('ui-label', 104, 1102, copy.boundary, 'fill="#dccbaa"') +
    text('ui-mono', 1560, 1188, copy.footer, 'text-anchor="end" fill="#6f8299"') +
    '</svg>';
}

await mkdir(outputDirectory, { recursive: true });

for (const locale of ['ko', 'en']) {
  const assets = [
    ['clinic-appointment-attendance-fulfillment-operations-screen-' + locale, renderScreen(locale)],
    ['clinic-appointment-attendance-fulfillment-flow-01-' + locale, renderFlow(locale)],
  ];
  for (const [stem, svg] of assets) {
    const svgPath = resolve(outputDirectory, stem + '.svg');
    const pngPath = resolve(outputDirectory, stem + '.png');
    await writeFile(svgPath, svg.trim() + '\n', 'utf8');
    execFileSync('xmllint', ['--noout', svgPath], { stdio: 'inherit' });
    execFileSync('cairosvg', [svgPath, '-o', pngPath, '-s', '2'], { stdio: 'inherit' });
  }
}
