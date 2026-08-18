import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const outDir = join(process.cwd(), 'public/assets')
const sourceVersion = 'f0c7614'

const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

const textBlock = (className, x, y, lines, lineHeight = 24, anchor = 'start') =>
  `<text class="${className}" x="${x}" y="${y}" text-anchor="${anchor}">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`).join('')}</text>`

const card = ({ id, x, y, w = 330, h = 156, accent, code, title, body, className = 'card' }) => `
  <g id="${id}" data-node="true">
    <rect id="${id}-card" class="${className}" x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#112139" stroke="${accent}" stroke-width="2"/>
    <rect x="${x + 20}" y="${y + 20}" width="8" height="${h - 40}" rx="4" fill="${accent}" opacity=".9"/>
    <text class="card-code" x="${x + 48}" y="${y + 30}">${esc(code)}</text>
    <text class="card-title" x="${x + 48}" y="${y + 58}">${esc(title)}</text>
    ${textBlock('card-body', x + 48, y + 92, body)}
  </g>`

const label = (x, y, width, value) => `
  <g class="relationshiplabel">
    <rect class="label-bg" x="${x}" y="${y}" width="${width}" height="30" rx="15"/>
    <text class="call-label" x="${x + width / 2}" y="${y + 20}" text-anchor="middle">${esc(value)}</text>
  </g>`

const path = ({ id, from, to, d, color, labelValue, labelX, labelY, labelWidth = 190 }) => {
  const relationLabel = labelValue ? label(labelX, labelY, labelWidth, labelValue) : ''
  return `
  <g data-from="${from}" data-to="${to}">
    <path id="${id}" class="route" d="${d}" stroke="${color}" marker-end="url(#arrow-${color.slice(1)})" data-connector="${id}" data-source-node="${from}" data-target-node="${to}"/>
${relationLabel}
  </g>`
}

const defs = (locale) => `
  <defs>
    <linearGradient id="canvas" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071323"/><stop offset="1" stop-color="#101a31"/></linearGradient>
    <linearGradient id="lane" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0b192c"/><stop offset="1" stop-color="#13243a"/></linearGradient>
    ${['60a5fa', '2dd4bf', 'a78bfa', 'fbbf24', 'fb7185'].map((color) => `<marker id="arrow-${color}" viewBox="0 0 10 10" markerWidth="14" markerHeight="14" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" data-role="primary" data-size="14x14" data-tip-direction="positive-x"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#${color}" data-solid-head="true"/></marker>`).join('')}
    <style>
      .title{font-family:${locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Architects Daughter", "Comic Sans MS", cursive'};font-size:38px;font-weight:800;fill:#f4f8ff}
      .subtitle{font-family:${locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Comic Mono", "SFMono-Regular", monospace'};font-size:17px;fill:#a9bad0}
      .lane-title{font-family:${locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Comic Mono", "SFMono-Regular", monospace'};font-size:14px;font-weight:800;fill:#7fc9ff;letter-spacing:1px}
      .badge{font-family:${locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Comic Mono", "SFMono-Regular", monospace'};font-size:13px;font-weight:800;fill:#c9dcf3}
      .card-title{font-family:${locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Comic Mono", "SFMono-Regular", monospace'};font-size:20px;font-weight:800;fill:#f4f8ff}
      .card-body{font-family:${locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Comic Mono", "SFMono-Regular", monospace'};font-size:14px;fill:#b9cbe0}
      .card-code{font-family:${locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Comic Mono", "SFMono-Regular", monospace'};font-size:12px;font-weight:800;fill:#7fc9ff}
      .call-label{font-family:${locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Comic Mono", "SFMono-Regular", monospace'};font-size:13px;fill:#e7f0fb}
      .route{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
      .label-bg{fill:#0d1b2f;stroke:#2d4665;stroke-width:1.5}
      .decision-title{font-family:${locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Comic Mono", "SFMono-Regular", monospace'};font-size:24px;font-weight:800;fill:#e5d9ff}
      .decision-body{font-family:${locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Comic Mono", "SFMono-Regular", monospace'};font-size:14px;fill:#d2c4f4}
      .outcome-code{font-family:${locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Comic Mono", "SFMono-Regular", monospace'};font-size:18px;font-weight:800;fill:#f8fbff}
      .outcome-body{font-family:${locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Comic Mono", "SFMono-Regular", monospace'};font-size:14px;fill:#b7c7da}
      .foot{font-family:${locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Comic Mono", "SFMono-Regular", monospace'};font-size:13px;fill:#91a8c3}
    </style>
  </defs>`

const flowCopy = {
  ko: {
    title: '예약 결과가 외부 시스템과 통계로 갈라지는 경계',
    subtitle: '커밋된 사실은 한 번 기록하고, consumer는 각자의 목적에 맞게 상태를 재구성합니다.',
    lanes: ['예약 서비스', '메시징 계약', '소비자·projection', '운영 확인'],
    badges: ['SCOPE · 선택한 clinic', `VERSION · ${sourceVersion}`, 'DATA · 합성 시안'],
    cards: [
      ['appointment-transaction', 90, 285, '#60a5fa', 'TRANSACTION', '예약 transaction', ['예약 변경 + outbox 의도', '한 DB transaction에서 커밋']],
      ['scheduling-outbox', 460, 285, '#60a5fa', 'DURABLE', 'scheduling_outbox_events', ['eventId · eventVersion', 'relay가 읽을 최소 행']],
      ['kafka-relay', 830, 285, '#2dd4bf', 'RELAY', 'Kafka 4 relay', ['lease·fencing 선점', 'at-least-once 전달']],
      ['schema-gate', 1200, 285, '#a78bfa', 'CONTRACT', 'strict JSON Schema gate', ['v1 envelope 검증', '계약 오류는 격리']],
      ['notification-consumer', 830, 665, '#2dd4bf', 'GROUP · NOTIFY', '알림 consumer', ['독립 consumer group', '발송 결과를 기록']],
      ['statistics-consumer', 1310, 665, '#a78bfa', 'GROUP · STATS', '통계 consumer', ['독립 consumer group', '최신 상태를 projection']],
      ['consumer-inbox', 420, 1005, '#60a5fa', 'DEDUP', 'consumer inbox', ['logicalConsumerId + eventId', '중복 전달을 한 번만 반영']],
      ['projection-transaction', 800, 1005, '#2dd4bf', 'HANDLER', 'handler transaction', ['side effect + inbox processed', '같은 경계에서 커밋']],
      ['projection-bucket', 1210, 1005, '#a78bfa', 'PROJECTION', '최신 통계 projection', ['aggregate lock', 'eventVersion이 최신일 때만 반영']],
      ['current-appointment-query', 90, 1340, '#60a5fa', 'AUTHORITY', '현재 예약 집계', ['Appointments repository', '대시보드의 기준 데이터 원본']],
      ['staff-action-queue', 1260, 1340, '#fbbf24', 'STAFF', 'STAFF 조치 큐', ['projection이 완전하면 사용', '아니면 현재 예약 집계로 fallback']],
      ['final-state-decision', 700, 1340, '#a78bfa', 'DECISION', '최종 상태 결정', ['처리 결과를 네 가지로 분류', '운영자가 다음 작업을 고른다']],
    ],
    edges: [
      ['transaction-outbox', 'appointment-transaction', 'scheduling-outbox', 'M420 363 H460', '#60a5fa', '원자적 outbox 기록', 305, 230, 190],
      ['outbox-relay', 'scheduling-outbox', 'kafka-relay', 'M790 363 H830', '#60a5fa', 'lease·fencing relay', 676, 230, 190],
      ['relay-schema', 'kafka-relay', 'schema-gate', 'M1160 363 H1200', '#2dd4bf', 'strict envelope', 1055, 230, 170],
      ['schema-notification', 'schema-gate', 'notification-consumer', 'M1365 441 V570 Q1365 610 1325 610 H995 Q955 610 955 640 V665', '#2dd4bf', '알림 group', 1090, 535, 155],
      ['schema-statistics', 'schema-gate', 'statistics-consumer', 'M1435 441 V665', '#a78bfa', '통계 group', 1460, 545, 150],
      ['notification-inbox', 'notification-consumer', 'consumer-inbox', 'M995 821 V880 Q995 920 955 920 H560 Q540 920 540 940 V1005', '#2dd4bf', 'eventId dedup', 770, 905, 170],
      ['statistics-inbox', 'statistics-consumer', 'consumer-inbox', 'M1475 821 V930 Q1475 970 1435 970 H720 Q700 970 700 980 V1005', '#a78bfa', null],
      ['inbox-handler', 'consumer-inbox', 'projection-transaction', 'M750 1083 H800', '#60a5fa', 'handler transaction', 650, 1180, 190],
      ['handler-projection', 'projection-transaction', 'projection-bucket', 'M1130 1083 H1210', '#a78bfa', 'latest-version upsert', 1100, 1180, 205],
      ['dashboard-projection', 'projection-bucket', 'staff-action-queue', 'M1375 1161 V1260 Q1375 1300 1415 1300 H1600 Q1640 1300 1640 1340', '#a78bfa', '완전한 projection 조회', 1430, 1240, 205],
      ['dashboard-fallback', 'current-appointment-query', 'staff-action-queue', 'M520 1418 V1280 Q520 1260 540 1260 H1240 Q1260 1260 1260 1280 V1430 Q1260 1450 1240 1450 H1260', '#60a5fa', 'projection 미완료 시 fallback', 540, 1220, 245],
      ['consumer-decision', 'projection-transaction', 'final-state-decision', 'M965 1161 V1230 Q965 1270 1005 1270 H1040 Q1080 1270 1080 1310 V1340', '#a78bfa', '결과 분류', 875, 1220, 145],
      ['processed-outcome', 'final-state-decision', 'processed', 'M760 1530 V1560 Q760 1580 720 1580 H260 Q220 1580 220 1620 V1660', '#2dd4bf', null],
      ['retry-outcome', 'final-state-decision', 'retry', 'M850 1530 V1580 Q850 1600 810 1600 H710 Q690 1600 670 1620 V1660', '#fbbf24', null],
      ['quarantine-outcome', 'final-state-decision', 'quarantined', 'M950 1530 V1600 Q950 1620 990 1620 H1140 Q1160 1620 1180 1640 V1660', '#fb7185', null],
      ['replay-outcome', 'final-state-decision', 'replay-pending', 'M1040 1530 V1590 Q1040 1610 1080 1610 Q1280 1610 1320 1630 H1680 Q1700 1630 1720 1640 V1660', '#a78bfa', null],
    ],
    outcomes: [
      ['processed', 60, '#2dd4bf', 'PROCESSED', ['handler 성공', '처리 완료로 기록']],
      ['retry', 510, '#fbbf24', 'RETRY', ['일시 오류', '다음 시각에 재시도']],
      ['quarantined', 1060, '#fb7185', 'QUARANTINED', ['계약·범위 오류', '메타데이터만 격리']],
      ['replay-pending', 1610, '#a78bfa', 'REPLAY_PENDING', ['승인된 재처리', '감사 경계를 통과']],
    ],
    foot: '실선은 명시적인 기록·전달 경계입니다. 통계 projection과 현재 예약 집계는 같은 의미가 아니며, 최종 상태 결정은 눈에 보이는 카드에서 시작합니다.',
  },
  en: {
    title: 'Where appointment results split into external systems and statistics',
    subtitle: 'Commit one durable fact, then let each consumer rebuild the state it owns.',
    lanes: ['Appointment service', 'Messaging contract', 'Consumers · projection', 'Operations'],
    badges: ['SCOPE · selected clinic', `VERSION · ${sourceVersion}`, 'DATA · synthetic mockup'],
    cards: [
      ['appointment-transaction', 90, 285, '#60a5fa', 'TRANSACTION', 'Appointment transaction', ['appointment change + intent', 'committed in one DB transaction']],
      ['scheduling-outbox', 460, 285, '#60a5fa', 'DURABLE', 'scheduling_outbox_events', ['eventId · eventVersion', 'minimal row for the relay']],
      ['kafka-relay', 830, 285, '#2dd4bf', 'RELAY', 'Kafka 4 relay', ['lease · fencing claim', 'at-least-once delivery']],
      ['schema-gate', 1200, 285, '#a78bfa', 'CONTRACT', 'Strict JSON Schema gate', ['validate the v1 envelope', 'quarantine contract errors']],
      ['notification-consumer', 830, 665, '#2dd4bf', 'GROUP · NOTIFY', 'Notification consumer', ['independent consumer group', 'record delivery outcome']],
      ['statistics-consumer', 1310, 665, '#a78bfa', 'GROUP · STATS', 'Statistics consumer', ['independent consumer group', 'project the latest state']],
      ['consumer-inbox', 420, 1005, '#60a5fa', 'DEDUP', 'Consumer inbox', ['logicalConsumerId + eventId', 'apply duplicate delivery once']],
      ['projection-transaction', 800, 1005, '#2dd4bf', 'HANDLER', 'Handler transaction', ['side effect + inbox processed', 'commit at the same boundary']],
      ['projection-bucket', 1210, 1005, '#a78bfa', 'PROJECTION', 'Latest statistics projection', ['aggregate lock', 'apply only the newest eventVersion']],
      ['current-appointment-query', 90, 1340, '#60a5fa', 'AUTHORITY', 'Current appointment aggregate', ['Appointments repository', 'dashboard source of truth']],
      ['staff-action-queue', 1260, 1340, '#fbbf24', 'STAFF', 'STAFF action queue', ['read the projection when complete', 'fallback to current aggregate']],
      ['final-state-decision', 700, 1340, '#a78bfa', 'DECISION', 'Final State Decision', ['classify four outcomes', 'give staff the next action']],
    ],
    edges: [
      ['transaction-outbox', 'appointment-transaction', 'scheduling-outbox', 'M420 363 H460', '#60a5fa', 'atomic outbox write', 305, 230, 190],
      ['outbox-relay', 'scheduling-outbox', 'kafka-relay', 'M790 363 H830', '#60a5fa', 'lease · fencing relay', 676, 230, 190],
      ['relay-schema', 'kafka-relay', 'schema-gate', 'M1160 363 H1200', '#2dd4bf', 'strict envelope', 1055, 230, 170],
      ['schema-notification', 'schema-gate', 'notification-consumer', 'M1365 441 V570 Q1365 610 1325 610 H995 Q955 610 955 640 V665', '#2dd4bf', 'notification group', 1090, 535, 170],
      ['schema-statistics', 'schema-gate', 'statistics-consumer', 'M1435 441 V665', '#a78bfa', 'statistics group', 1460, 545, 165],
      ['notification-inbox', 'notification-consumer', 'consumer-inbox', 'M995 821 V880 Q995 920 955 920 H560 Q540 920 540 940 V1005', '#2dd4bf', 'eventId dedup', 770, 905, 170],
      ['statistics-inbox', 'statistics-consumer', 'consumer-inbox', 'M1475 821 V930 Q1475 970 1435 970 H720 Q700 970 700 980 V1005', '#a78bfa', null],
      ['inbox-handler', 'consumer-inbox', 'projection-transaction', 'M750 1083 H800', '#60a5fa', 'handler transaction', 650, 1180, 190],
      ['handler-projection', 'projection-transaction', 'projection-bucket', 'M1130 1083 H1210', '#a78bfa', 'latest-version upsert', 1100, 1180, 205],
      ['dashboard-projection', 'projection-bucket', 'staff-action-queue', 'M1375 1161 V1260 Q1375 1300 1415 1300 H1600 Q1640 1300 1640 1340', '#a78bfa', 'read complete projection', 1430, 1240, 205],
      ['dashboard-fallback', 'current-appointment-query', 'staff-action-queue', 'M520 1418 V1280 Q520 1260 540 1260 H1240 Q1260 1260 1260 1280 V1430 Q1260 1450 1240 1450 H1260', '#60a5fa', 'fallback when projection is incomplete', 540, 1220, 275],
      ['consumer-decision', 'projection-transaction', 'final-state-decision', 'M965 1161 V1230 Q965 1270 1005 1270 H1040 Q1080 1270 1080 1310 V1340', '#a78bfa', 'classify outcome', 875, 1220, 150],
      ['processed-outcome', 'final-state-decision', 'processed', 'M760 1530 V1560 Q760 1580 720 1580 H260 Q220 1580 220 1620 V1660', '#2dd4bf', null],
      ['retry-outcome', 'final-state-decision', 'retry', 'M850 1530 V1580 Q850 1600 810 1600 H710 Q690 1600 670 1620 V1660', '#fbbf24', null],
      ['quarantine-outcome', 'final-state-decision', 'quarantined', 'M950 1530 V1600 Q950 1620 990 1620 H1140 Q1160 1620 1180 1640 V1660', '#fb7185', null],
      ['replay-outcome', 'final-state-decision', 'replay-pending', 'M1040 1530 V1590 Q1040 1610 1080 1610 Q1280 1610 1320 1630 H1680 Q1700 1630 1720 1640 V1660', '#a78bfa', null],
    ],
    outcomes: [
      ['processed', 60, '#2dd4bf', 'PROCESSED', ['handler succeeded', 'record completion']],
      ['retry', 510, '#fbbf24', 'RETRY', ['transient failure', 'retry at next time']],
      ['quarantined', 1060, '#fb7185', 'QUARANTINED', ['contract or scope error', 'quarantine metadata only']],
      ['replay-pending', 1610, '#a78bfa', 'REPLAY_PENDING', ['approved replay', 'cross the audit boundary']],
    ],
    foot: 'Solid lines are explicit record and delivery boundaries. A statistics projection is not the same thing as the current appointment aggregate; every outcome starts at a visible decision card.',
  },
}

const flowSvg = (locale) => {
  const copy = flowCopy[locale]
  const laneRects = [
    [60, 220, 2080, 300, copy.lanes[0]],
    [60, 600, 2080, 300, copy.lanes[1]],
    [60, 940, 2080, 330, copy.lanes[2]],
    [60, 1280, 2080, 590, copy.lanes[3]],
  ].map(([x, y, w, h, title]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="url(#lane)" stroke="#263d59" stroke-width="1.5"/><text class="lane-title" x="${x + 30}" y="${y + 32}">${esc(title.toUpperCase())}</text>`).join('')
  const cards = copy.cards.filter(([id]) => id !== 'final-state-decision').map(([id, x, y, accent, code, title, body]) => card({ id, x, y, accent, code, title, body })).join('')
  const edgePaths = copy.edges.map(([id, from, to, d, color, labelValue, labelX, labelY, labelWidth]) => path({ id, from, to, d, color, labelValue, labelX, labelY, labelWidth })).join('')
  const outcomes = copy.outcomes.map(([id, x, accent, code, body]) => `
    <g id="${id}" data-node="true">
      <rect id="${id}-card" class="card" x="${x}" y="1660" width="470" height="170" rx="22" fill="#101f34" stroke="${accent}" stroke-width="2"/>
      <text class="outcome-code" x="${x + 235}" y="1720" text-anchor="middle">${esc(code)}</text>
      ${textBlock('outcome-body', x + 235, 1760, body, 24, 'middle')}
    </g>`).join('')
  const decision = `<g id="final-state-decision" data-node="true"><rect class="card" id="final-state-decision-card" x="700" y="1340" width="430" height="190" rx="22" fill="#171b36" stroke="#a78bfa" stroke-width="2" opacity=".98"/><text class="decision-title" x="915" y="1404" text-anchor="middle">${esc(locale === 'ko' ? '최종 상태 결정' : 'Final State Decision')}</text>${textBlock('decision-body', 915, 1446, locale === 'ko' ? ['PROCESSED · RETRY', 'QUARANTINED · REPLAY_PENDING'] : ['PROCESSED · RETRY', 'QUARANTINED · REPLAY_PENDING'], 26, 'middle')}</g>`
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="1900" viewBox="0 0 2200 1900" role="img" aria-labelledby="title desc" data-locale="${locale}">
  <title id="title">${esc(copy.title)}</title><desc id="desc">${esc(copy.subtitle)}</desc>${defs(locale)}
  <rect width="2200" height="1900" fill="url(#canvas)"/><rect x="24" y="24" width="2152" height="1852" rx="32" fill="none" stroke="#2d4665" stroke-width="2"/>
  <text class="title" x="64" y="76">${esc(copy.title)}</text><text class="subtitle" x="66" y="108">${esc(copy.subtitle)}</text>
  ${copy.badges.map((badgeText, index) => `<rect x="${72 + index * 330}" y="130" width="300" height="34" rx="17" fill="#12243a" stroke="#3a5877"/><text class="badge" x="${222 + index * 330}" y="152" text-anchor="middle">${esc(badgeText)}</text>`).join('')}
  ${laneRects}${edgePaths}${cards}${decision}${outcomes}<text class="foot" x="72" y="1855">${esc(copy.foot)}</text>
</svg>`
}

const dashboardCopy = {
  ko: {
    title: '예약 결과 전달 · STAFF 운영 대시보드 시안',
    eyebrow: 'OPERATIONS / EXTERNAL RESULTS',
    subtitle: '합성 데이터로 그린 화면입니다. 숫자보다 상태의 경계와 다음 작업을 먼저 보여 줍니다.',
    cards: [['이벤트 대기', '18', 'relay가 읽을 outbox 행', '#60a5fa'], ['처리 중', '6', 'consumer handler 실행', '#2dd4bf'], ['재시도 대기', '3', '다음 시각이 정해짐', '#fbbf24'], ['격리·검토 필요', '2', '계약·범위 오류', '#fb7185']],
    queueTitle: '조치 큐 · 지금 확인할 항목',
    columns: ['항목 참조', 'consumer', '상태', '사유 코드', '다음 작업'],
    rows: [
      ['evt_7a31 · 10:42', 'statistics', 'RETRY', 'DB_TIMEOUT', '10:47에 재시도'],
      ['evt_7a28 · 10:38', 'notification', 'QUARANTINED', 'SCHEMA_V1', '계약 담당자 검토'],
      ['evt_7a11 · 10:21', 'statistics', 'REPLAY_PENDING', 'BACKFILL_SCOPE', '승인 후 dry-run'],
    ],
    detailTitle: '선택한 항목의 판단 근거',
    detail: [['scope', 'clinic-a'], ['schemaVersion', 'v1'], ['eventVersion', '42'], ['projection', 'incomplete'], ['기준 데이터 원본', '현재 예약 집계'], ['다음 작업', '재시도 전 영향 범위 확인']],
    footerCards: [['현재 예약 집계', 'Appointments repository', '예약 상태를 확인하는 기준 데이터 원본', '#60a5fa'], ['통계 projection', 'latest eventVersion', '완전할 때만 대시보드 보조 지표로 사용', '#a78bfa'], ['재처리·백필', 'dry-run → 승인 → 실행', '운영자가 감사 경계를 확인한 뒤 진행', '#fbbf24']],
    foot: '화면의 수치와 식별자는 설명을 위한 합성 값이며, 원본 payload나 개인정보를 표시하지 않습니다.',
  },
  en: {
    title: 'Appointment delivery · STAFF operations dashboard mockup',
    eyebrow: 'OPERATIONS / EXTERNAL RESULTS',
    subtitle: 'A synthetic screen: show state boundaries and the next action before showing more numbers.',
    cards: [['Events waiting', '18', 'outbox rows for the relay', '#60a5fa'], ['In progress', '6', 'consumer handlers running', '#2dd4bf'], ['Retry waiting', '3', 'next attempt scheduled', '#fbbf24'], ['Quarantine review', '2', 'contract or scope error', '#fb7185']],
    queueTitle: 'Action queue · items to inspect now',
    columns: ['Reference', 'consumer', 'status', 'reason code', 'next action'],
    rows: [
      ['evt_7a31 · 10:42', 'statistics', 'RETRY', 'DB_TIMEOUT', 'retry at 10:47'],
      ['evt_7a28 · 10:38', 'notification', 'QUARANTINED', 'SCHEMA_V1', 'contract review'],
      ['evt_7a11 · 10:21', 'statistics', 'REPLAY_PENDING', 'BACKFILL_SCOPE', 'dry-run after approval'],
    ],
    detailTitle: 'Evidence for the selected item',
    detail: [['scope', 'clinic-a'], ['schemaVersion', 'v1'], ['eventVersion', '42'], ['projection', 'incomplete'], ['source of truth', 'current appointment aggregate'], ['next action', 'check impact before retry']],
    footerCards: [['Current appointment aggregate', 'Appointments repository', 'source of truth for appointment state', '#60a5fa'], ['Statistics projection', 'latest eventVersion', 'secondary dashboard signal when complete', '#a78bfa'], ['Replay · backfill', 'dry-run → approve → run', 'cross the audit boundary with staff review', '#fbbf24']],
    foot: 'All values and identifiers are synthetic. The screen never exposes raw payloads or patient data.',
  },
}

const dashboardSvg = (locale) => {
  const copy = dashboardCopy[locale]
  const font = locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Comic Mono", "SFMono-Regular", monospace'
  const metricCards = copy.cards.map(([labelText, value, note, accent], index) => {
    const x = 70 + index * 520
    return `<g><rect x="${x}" y="175" width="480" height="150" rx="22" fill="#112139" stroke="${accent}" stroke-width="2"/><rect x="${x + 20}" y="195" width="8" height="110" rx="4" fill="${accent}"/><text class="eyebrow" x="${x + 48}" y="213">${esc(labelText)}</text><text class="value" x="${x + 48}" y="267">${esc(value)}</text><text class="muted" x="${x + 180}" y="265">${esc(note)}</text></g>`
  }).join('')
  const tableX = 70
  const colX = [tableX + 24, tableX + 340, tableX + 670, tableX + 1000, tableX + 1320]
  const headers = copy.columns.map((header, index) => `<text class="table-head" x="${colX[index]}" y="${650}">${esc(header)}</text>`).join('')
  const rows = copy.rows.map((row, rowIndex) => {
    const y = 680 + rowIndex * 76
    return `<g><rect x="${tableX + 14}" y="${y - 28}" width="1660" height="60" rx="12" fill="${rowIndex % 2 === 0 ? '#102139' : '#0d1b2f'}" stroke="#253d59"/><rect x="${tableX + 14}" y="${y - 28}" width="8" height="60" rx="4" fill="${row[2] === 'RETRY' ? '#fbbf24' : row[2] === 'QUARANTINED' ? '#fb7185' : '#a78bfa'}"/>${row.map((value, index) => `<text class="table-cell ${index === 0 ? 'mono' : ''}" x="${colX[index]}" y="${y + 5}">${esc(value)}</text>`).join('')}</g>`
  }).join('')
  const detailRows = copy.detail.map(([key, value], index) => `<g><text class="detail-key" x="1868" y="${555 + index * 38}">${esc(key)}</text><text class="detail-value" x="1868" y="${578 + index * 38}">${esc(value)}</text></g>`).join('')
  const footerCards = copy.footerCards.map(([title, code, body, accent], index) => {
    const x = 70 + index * 555
    return `<g><rect x="${x}" y="1000" width="520" height="180" rx="20" fill="#112139" stroke="${accent}" stroke-width="2"/><text class="footer-title" x="${x + 28}" y="1040">${esc(title)}</text><text class="footer-code" x="${x + 28}" y="1074">${esc(code)}</text><text class="footer-body" x="${x + 28}" y="1120">${esc(body)}</text></g>`
  }).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="1280" viewBox="0 0 2200 1280" role="img" aria-labelledby="title desc" data-locale="${locale}">
  <title id="title">${esc(copy.title)}</title><desc id="desc">${esc(copy.subtitle)}</desc>
  <style>
    .eyebrow,.table-head,.detail-key,.footer-code{font-family:${font};font-size:14px;font-weight:800;fill:#7fc9ff;letter-spacing:.4px}.value{font-family:${font};font-size:48px;font-weight:800;fill:#f4f8ff}.muted{font-family:${font};font-size:13px;fill:#91a8c3}.table-head{font-size:13px;fill:#b9cbe0}.table-cell{font-family:${font};font-size:15px;fill:#e7f0fb}.mono{font-size:13px}.detail-key{font-size:12px;fill:#91a8c3}.detail-value{font-family:${font};font-size:16px;fill:#f4f8ff}.footer-title{font-family:${font};font-size:20px;font-weight:800;fill:#f4f8ff}.footer-code{font-size:13px}.footer-body{font-family:${font};font-size:14px;fill:#b9cbe0}.screen-title{font-family:${font};font-size:34px;font-weight:800;fill:#f4f8ff}.screen-subtitle{font-family:${font};font-size:16px;fill:#a9bad0}.screen-section{font-family:${font};font-size:22px;font-weight:800;fill:#f4f8ff}.divider{stroke:#263d59;stroke-width:1}
  </style>
  <rect width="2200" height="1280" fill="#071323"/><rect x="24" y="24" width="2152" height="1232" rx="30" fill="#0c1b2e" stroke="#2d4665" stroke-width="2"/>
  <text class="eyebrow" x="70" y="72">${esc(copy.eyebrow)}</text><text class="screen-title" x="70" y="116">${esc(copy.title)}</text><text class="screen-subtitle" x="70" y="148">${esc(copy.subtitle)}</text><rect x="1810" y="74" width="300" height="32" rx="16" fill="#12243a" stroke="#3a5877"/><text class="eyebrow" x="1960" y="95" text-anchor="middle">SCOPE · clinic-a</text>
  ${metricCards}
  <rect x="70" y="370" width="1740" height="570" rx="22" fill="#0a1728" stroke="#263d59"/><text class="screen-section" x="94" y="423">${esc(copy.queueTitle)}</text><rect x="94" y="452" width="1680" height="1" class="divider"/>${headers}${rows}
  <rect x="1840" y="370" width="300" height="570" rx="18" fill="#101f34" stroke="#a78bfa"/><text class="eyebrow" x="1990" y="423" text-anchor="middle">DETAIL</text>${detailRows}
  ${footerCards}<text class="muted" x="70" y="1220">${esc(copy.foot)}</text>
</svg>`
}

await mkdir(outDir, { recursive: true })
for (const locale of ['ko', 'en']) {
  await writeFile(join(outDir, `clinic-appointment-external-results-flow-01-${locale}.svg`), flowSvg(locale))
  await writeFile(join(outDir, `clinic-appointment-external-results-operations-screen-${locale}.svg`), dashboardSvg(locale))
}
