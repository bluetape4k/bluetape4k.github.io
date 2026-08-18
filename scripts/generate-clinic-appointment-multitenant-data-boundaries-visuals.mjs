import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const outDir = join(process.cwd(), 'public/assets')

const colors = Object.freeze({
  blue: '#60a5fa',
  cyan: '#2dd4bf',
  purple: '#a78bfa',
  amber: '#fbbf24',
  red: '#fb7185',
})

const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

const text = (className, x, y, value, extra = '') =>
  `<text class="${className}" x="${x}" y="${y}" ${extra}>${esc(value)}</text>`

const textBlock = (className, x, y, lines, lineHeight = 24, anchor = 'start') =>
  `<text class="${className}" x="${x}" y="${y}" text-anchor="${anchor}">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`).join('')}</text>`

const markerDefs = (locale, kind = 'primary') => {
  const markerSize = kind === 'sequence' ? 16 : 14
  const markers = Object.entries(colors).map(([tone, color]) => `
    <marker id="${tone}Arrow" viewBox="0 0 10 10" markerWidth="${markerSize}" markerHeight="${markerSize}" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" data-role="${kind}" data-size="${markerSize}x${markerSize}" data-tip-direction="positive-x">
      <path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}" data-solid-head="true"/>
    </marker>`).join('')
  const sans = locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Architects Daughter", "Comic Sans MS", cursive'
  const mono = locale === 'ko' ? '"goorm Sans Code", "goorm Sans", monospace' : '"Comic Mono", "SFMono-Regular", monospace'
  return `<defs>
    <linearGradient id="canvas" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071323"/><stop offset="1" stop-color="#111c32"/></linearGradient>
    <linearGradient id="lane" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0b192c"/><stop offset="1" stop-color="#13243a"/></linearGradient>
    ${markers}
    <style>
      .title{font-family:${sans};font-size:38px;font-weight:800;fill:#f4f8ff}
      .subtitle{font-family:${mono};font-size:17px;fill:#a9bad0}
      .lane-title{font-family:${mono};font-size:14px;font-weight:800;fill:#7fc9ff;letter-spacing:1px}
      .badge{font-family:${mono};font-size:13px;font-weight:800;fill:#c9dcf3}
      .card-code{font-family:${mono};font-size:12px;font-weight:800;fill:#7fc9ff}
      .card-title{font-family:${sans};font-size:21px;font-weight:800;fill:#f4f8ff}
      .card-body{font-family:${mono};font-size:14px;fill:#b9cbe0}
      .route{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
      .route-label{font-family:${mono};font-size:13px;fill:#e7f0fb}
      .label-bg{fill:#0d1b2f;stroke:#2d4665;stroke-width:1.5}
      .table-head{font-family:${mono};font-size:13px;font-weight:800;fill:#7fc9ff}
      .table-key{font-family:${mono};font-size:16px;font-weight:800;fill:#f4f8ff}
      .table-cell{font-family:${sans};font-size:15px;fill:#d5e2f1}
      .table-code{font-family:${mono};font-size:14px;fill:#b9cbe0}
      .note{font-family:${sans};font-size:14px;fill:#a9bad0}
      .foot{font-family:${mono};font-size:13px;fill:#91a8c3}
    </style>
  </defs>`
}

const card = ({ id, x, y, w, h, accent, code, title, body }) => `
  <g id="${id}" data-node="true">
    <rect id="${id}-card" x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#112139" stroke="${accent}" stroke-width="2"/>
    <rect x="${x + 20}" y="${y + 20}" width="8" height="${h - 40}" rx="4" fill="${accent}" opacity=".9"/>
    ${text('card-code', x + 48, y + 32, code)}
    ${text('card-title', x + 48, y + 66, title)}
    ${textBlock('card-body', x + 48, y + 102, body, 23)}
  </g>`

const routeLabel = (x, y, width, value) => `
  <g class="relationshiplabel">
    <rect class="label-bg" x="${x}" y="${y}" width="${width}" height="30" rx="15"/>
    ${text('route-label', x + width / 2, y + 20, value, 'text-anchor="middle"')}
  </g>`

const route = ({ id, from, to, d, tone, label, labelX, labelY, labelWidth = 180 }) => `
  <g data-from="${from}" data-to="${to}">
    <path id="${id}" class="route" d="${d}" stroke="${colors[tone]}" marker-end="url(#${tone}Arrow)" data-connector="${id}" data-source-node="${from}" data-target-node="${to}"/>
    ${label ? routeLabel(labelX, labelY, labelWidth, label) : ''}
  </g>`

const boundaryCopy = {
  ko: {
    title: '여러 병원을 한 예약 서비스로 운영할 때 지켜야 할 데이터 경계',
    subtitle: '요청에서 비동기 이벤트까지 같은 tenant·clinic 범위를 명시적으로 전달합니다.',
    lanes: ['요청과 검증', '명시적 tenant·clinic 범위', '경계가 필요한 하위 처리'],
    badges: ['SCOPE · tenant + clinic', 'DATA · 합성 시안'],
    cards: [
      ['request-path', 90, 280, 330, 158, 'blue', 'REQUEST PATH', '/api/{tenantCode}/...', ['외부 tenant 선택은 경로에서만', 'body·header는 권한 근거가 아님']],
      ['tenant-filter', 480, 280, 330, 158, 'cyan', 'PRE-AUTH + JWT', 'TenantContextFilter', ['경로 문법 → JWT membership', '활성 TenantGroup 조회']],
      ['clinic-guard', 870, 280, 330, 158, 'purple', 'OWNERSHIP', 'TenantClinicAccessChecker', ['clinic이 tenant에 속하는지 확인', 'STAFF/ADMIN clinic 범위 재확인']],
      ['scope-value', 1260, 280, 330, 158, 'amber', 'EXPLICIT VALUE', 'TenantClinicScope', ['tenantGroupId + clinicId', 'core·solver·event에 값으로 전달']],
      ['slot-policy', 90, 650, 430, 148, 'blue', 'QUERY SCOPE', 'slot · holiday · solver · closure', ['같은 scope로 resource를 조회', '범위 밖 데이터는 결과에 넣지 않음']],
      ['cache-query', 620, 650, 430, 148, 'cyan', 'CACHE / QUERY KEY', 'tenantGroupId:clinicId', ['clinicId 단독 키를 만들지 않음', '명시적 predicate로 다시 확인']],
      ['event-inbox', 1150, 650, 430, 148, 'purple', 'ASYNC PROVENANCE', 'event · inbox · projection', ['tenantGroupId와 clinicId를 함께 보존', 'provenance mismatch는 side effect 전에 거부']],
      ['sse-notification', 1680, 650, 430, 148, 'red', 'BACKGROUND / SSE', 'notification · SSE', ['thread-local을 하위 경계에서 읽지 않음', '캡처한 scope로 stream과 worker를 제한']],
    ],
    labels: ['식별자', '권위가 정해지는 범위', '허용된 사용', '섞으면 안 되는 방식', '실패 시 읽을 값'],
    rows: [
      ['tenantCode', '/api/{tenantCode}', 'route + JWT allowedTenants + active tenant', 'body/header의 tenant를 권한으로 승격', '401 / 403 / 404'],
      ['clinicId', 'tenantGroupId + clinicId', 'DB ownership·query·cache 범위', 'clinicId만으로 다른 tenant를 조회', 'scope mismatch'],
      ['appointmentId / eventId', 'tenant + clinic + id', 'aggregate·event·inbox 식별', '전역 ID처럼 조회·재생', 'not found / reject'],
      ['patient reference', 'tenant-scoped opaque reference', '환자 범위 안의 연결·재평가', 'raw identifier로 병원 간 자동 연결', '필요한 범위만 표시'],
    ],
    foot: '표의 식별자는 합성 예시입니다. 운영 화면에는 원본 환자 정보나 내부 식별자를 노출하지 않습니다.',
  },
  en: {
    title: 'Data boundaries for running multiple clinics in one appointment service',
    subtitle: 'Carry the same tenant and clinic scope explicitly from the request to asynchronous events.',
    lanes: ['Request and verification', 'Explicit tenant and clinic scope', 'Downstream boundaries'],
    badges: ['SCOPE · tenant + clinic', 'DATA · synthetic mockup'],
    cards: [
      ['request-path', 90, 280, 330, 158, 'blue', 'REQUEST PATH', '/api/{tenantCode}/...', ['External tenant selection lives in the path', 'body and headers are not authority']],
      ['tenant-filter', 480, 280, 330, 158, 'cyan', 'PRE-AUTH + JWT', 'TenantContextFilter', ['validate path syntax and JWT membership', 'look up the active TenantGroup']],
      ['clinic-guard', 870, 280, 330, 158, 'purple', 'OWNERSHIP', 'TenantClinicAccessChecker', ['verify clinic ownership in the tenant', 'recheck STAFF/ADMIN clinic access']],
      ['scope-value', 1260, 280, 330, 158, 'amber', 'EXPLICIT VALUE', 'TenantClinicScope', ['tenantGroupId + clinicId', 'pass the value into core and workers']],
      ['slot-policy', 90, 650, 430, 148, 'blue', 'QUERY SCOPE', 'slot · holiday · solver · closure', ['query resources with the same scope', 'never add out-of-scope facts']],
      ['cache-query', 620, 650, 430, 148, 'cyan', 'CACHE / QUERY KEY', 'tenantGroupId:clinicId', ['never key a shared cache by clinicId alone', 'repeat the scope predicate in queries']],
      ['event-inbox', 1150, 650, 430, 148, 'purple', 'ASYNC PROVENANCE', 'event · inbox · projection', ['preserve tenantGroupId and clinicId', 'reject provenance mismatch before side effects']],
      ['sse-notification', 1680, 650, 430, 148, 'red', 'BACKGROUND / SSE', 'notification · SSE', ['do not read thread-local state downstream', 'limit streams and workers with captured scope']],
    ],
    labels: ['Identifier', 'Authority scope', 'Allowed use', 'Do not combine it with', 'What the operator sees'],
    rows: [
      ['tenantCode', '/api/{tenantCode}', 'route + JWT allowedTenants + active tenant', 'promote body/header tenant to authority', '401 / 403 / 404'],
      ['clinicId', 'tenantGroupId + clinicId', 'DB ownership, query, and cache scope', 'query another tenant by clinicId alone', 'scope mismatch'],
      ['appointmentId / eventId', 'tenant + clinic + id', 'aggregate, event, and inbox identity', 'look up or replay it as a global ID', 'not found / reject'],
      ['patient reference', 'tenant-scoped opaque reference', 'link and reevaluate inside the patient scope', 'auto-link clinics through a raw identifier', 'show only the required scope'],
    ],
    foot: 'Identifiers in this table are synthetic. The operations screen never exposes raw patient data or internal IDs.',
  },
}

const boundarySvg = (locale) => {
  const copy = boundaryCopy[locale]
  const lane = (x, y, w, h, title) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="url(#lane)" stroke="#263d59" stroke-width="1.5"/>${text('lane-title', x + 30, y + 34, title.toUpperCase())}`
  const cards = copy.cards.map(([id, x, y, w, h, tone, code, title, body]) => card({ id, x, y, w, h, accent: colors[tone], code, title, body })).join('')
  const routes = [
    route({ id: 'path-filter', from: 'request-path', to: 'tenant-filter', d: 'M420 359 H480', tone: 'blue', label: locale === 'ko' ? '경로 문법 확인' : 'validate path syntax', labelX: 292, labelY: 238, labelWidth: 190 }),
    route({ id: 'filter-guard', from: 'tenant-filter', to: 'clinic-guard', d: 'M810 359 H870', tone: 'cyan', label: locale === 'ko' ? 'membership 확인' : 'check membership', labelX: 682, labelY: 238, labelWidth: 180 }),
    route({ id: 'guard-scope', from: 'clinic-guard', to: 'scope-value', d: 'M1200 359 H1260', tone: 'purple', label: locale === 'ko' ? '소유권 확인 후 생성' : 'create after ownership', labelX: 1045, labelY: 238, labelWidth: 220 }),
    route({ id: 'scope-slot', from: 'scope-value', to: 'slot-policy', d: 'M1350 438 V535 Q1350 575 1310 575 H320 Q300 575 300 595 V650', tone: 'amber', label: locale === 'ko' ? '조회 범위' : 'query scope', labelX: 650, labelY: 535, labelWidth: 150 }),
    route({ id: 'scope-cache', from: 'scope-value', to: 'cache-query', d: 'M1410 438 V560 Q1410 600 1370 600 H835 Q815 600 815 620 V650', tone: 'cyan', label: locale === 'ko' ? '키에 범위 포함' : 'scope in key', labelX: 930, labelY: 515, labelWidth: 160 }),
    route({ id: 'scope-event', from: 'scope-value', to: 'event-inbox', d: 'M1470 438 V650', tone: 'purple', label: locale === 'ko' ? 'provenance 보존' : 'preserve provenance', labelX: 1600, labelY: 505, labelWidth: 190 }),
    route({ id: 'scope-notification', from: 'scope-value', to: 'sse-notification', d: 'M1530 438 V535 Q1530 575 1570 575 H1895 Q1915 575 1915 595 V650', tone: 'red', label: locale === 'ko' ? 'worker 범위' : 'worker scope', labelX: 1735, labelY: 600, labelWidth: 150 }),
  ].join('')
  const tableX = 70
  const tableY = 1050
  const tableW = 2070
  const cols = [100, 400, 720, 1160, 1770, 2050]
  const rowY = [1170, 1260, 1350, 1440]
  const header = copy.labels.map((labelText, index) => text('table-head', cols[index], 1108, labelText)).join('')
  const rows = copy.rows.map((row, rowIndex) => {
    const y = rowY[rowIndex]
    const fill = rowIndex % 2 === 0 ? '#102139' : '#0d1b2f'
    return `<g data-row="${rowIndex}"><rect x="${tableX + 14}" y="${y - 34}" width="${tableW - 28}" height="68" rx="12" fill="${fill}" stroke="#253d59"/><rect x="${tableX + 14}" y="${y - 34}" width="8" height="68" rx="4" fill="${[colors.blue, colors.cyan, colors.purple, colors.amber][rowIndex]}"/>${text('table-key', cols[0], y - 3, row[0])}${text('table-code', cols[1], y - 3, row[1])}${text('table-cell', cols[2], y - 3, row[2])}${text('table-cell', cols[3], y - 3, row[3])}${text('table-code', cols[4], y - 3, row[4])}</g>`
  }).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="1620" viewBox="0 0 2200 1620" role="img" aria-labelledby="title desc" data-locale="${locale}">
  <title id="title">${esc(copy.title)}</title><desc id="desc">${esc(copy.subtitle)}</desc>${markerDefs(locale)}
  <rect width="2200" height="1620" fill="url(#canvas)"/><rect x="24" y="24" width="2152" height="1572" rx="32" fill="none" stroke="#2d4665" stroke-width="2"/>
  ${text('title', 70, 80, copy.title)}${text('subtitle', 72, 114, copy.subtitle)}
  ${copy.badges.map((badgeText, index) => {
    const x = 72 + index * 330
    return `<rect x="${x}" y="140" width="300" height="34" rx="17" fill="#12243a" stroke="#3a5877"/><text class="badge" x="${x + 150}" y="162" text-anchor="middle">${esc(badgeText)}</text>`
  }).join('')}
  ${lane(60, 220, 2080, 285, copy.lanes[0])}
  ${lane(60, 520, 2080, 345, copy.lanes[1])}
  ${lane(60, 885, 2080, 650, copy.lanes[2])}
  ${routes}${cards}
  <g id="scope-table" data-node="true"><rect x="${tableX}" y="${tableY}" width="${tableW}" height="460" rx="22" fill="#0a1728" stroke="#263d59"/><text class="card-title" x="${tableX + 28}" y="${tableY + 48}">${esc(locale === 'ko' ? '식별자별 경계 표' : 'Boundary table by identifier')}</text><text class="note" x="${tableX + 28}" y="${tableY + 77}">${esc(locale === 'ko' ? '같은 숫자라도 tenant·clinic 범위가 다르면 다른 데이터입니다.' : 'The same number can name different data when the tenant and clinic scope differs.')}</text>${header}${rows}</g>
  ${text('foot', 72, 1574, copy.foot)}
</svg>`
}

const screenCopy = {
  ko: {
    title: '데이터 경계 · STAFF 운영 화면 시안',
    eyebrow: 'OPERATIONS / TENANT SCOPE',
    subtitle: '현재 선택한 범위와 다음 작업을 먼저 보여 줍니다. 숫자와 ID는 모두 합성 값입니다.',
    scope: 'SCOPE · tenant-blue / clinic-02',
    metrics: [['대기 예약', '18', '현재 clinic 범위', 'blue'], ['오늘 예약', '42', '기준 데이터 원본', 'cyan'], ['범위 경고', '2', '조회 차단·재확인', 'red'], ['검토 필요', '5', 'STAFF 다음 작업', 'amber']],
    queueTitle: '조치 큐 · 지금 확인할 항목',
    columns: ['대상', '범위', '상태', '사유', '다음 작업'],
    rows: [
      ['apt_•••31', 'tenant-blue / clinic-02', 'ALLOW', 'SCOPE_OK', '예약 상세 조회'],
      ['evt_•••28', 'tenant-blue / clinic-03', 'BLOCKED', 'CLINIC_MISMATCH', '선택한 병원 다시 확인'],
      ['apt_•••11', 'tenant-green / clinic-02', 'BLOCKED', 'TENANT_FORBIDDEN', '403 결과만 기록'],
      ['cache_•••7', 'tenant-blue / clinic-02', 'REVIEW', 'KEY_SCOPE_MISSING', '캐시 키 점검'],
    ],
    detailTitle: '선택한 항목의 판단 근거',
    detail: [['tenantCode', 'tenant-blue'], ['clinicId', 'clinic-02'], ['appointmentId', 'apt_•••31'], ['query scope', 'tenant + clinic'], ['cache key', 'tenant:clinic'], ['권한 결과', 'ALLOW · STAFF']],
    bottom: [['조회 기준', 'TenantClinicScope', '현재 tenant와 clinic에 속한 데이터만 조회', 'blue'], ['비동기 경계', 'event · SSE · notification', '캡처한 scope와 provenance를 다시 확인', 'purple'], ['다음 작업', '조회 · 재확인 · 차단 기록', '운영자가 결과와 범위를 함께 판단', 'amber']],
    foot: '실제 병원명·환자 정보·내부 식별자는 표시하지 않습니다. 운영 화면은 더 많은 정보보다 더 명확한 정보를 제공해야 합니다.',
  },
  en: {
    title: 'Data boundaries · STAFF operations screen mockup',
    eyebrow: 'OPERATIONS / TENANT SCOPE',
    subtitle: 'Show the selected scope and the next action first. Every value and ID is synthetic.',
    scope: 'SCOPE · tenant-blue / clinic-02',
    metrics: [['Appointments waiting', '18', 'selected clinic scope', 'blue'], ['Today\'s appointments', '42', 'source-of-truth data', 'cyan'], ['Scope warnings', '2', 'blocked or recheck', 'red'], ['Needs review', '5', 'next STAFF action', 'amber']],
    queueTitle: 'Action queue · items to inspect now',
    columns: ['Target', 'Scope', 'Status', 'Reason', 'Next action'],
    rows: [
      ['apt_•••31', 'tenant-blue / clinic-02', 'ALLOW', 'SCOPE_OK', 'read appointment'],
      ['evt_•••28', 'tenant-blue / clinic-03', 'BLOCKED', 'CLINIC_MISMATCH', 'recheck selected clinic'],
      ['apt_•••11', 'tenant-green / clinic-02', 'BLOCKED', 'TENANT_FORBIDDEN', 'record the 403 result'],
      ['cache_•••7', 'tenant-blue / clinic-02', 'REVIEW', 'KEY_SCOPE_MISSING', 'inspect the cache key'],
    ],
    detailTitle: 'Evidence for the selected item',
    detail: [['tenantCode', 'tenant-blue'], ['clinicId', 'clinic-02'], ['appointmentId', 'apt_•••31'], ['query scope', 'tenant + clinic'], ['cache key', 'tenant:clinic'], ['authorization', 'ALLOW · STAFF']],
    bottom: [['Query authority', 'TenantClinicScope', 'read only data in the selected tenant and clinic', 'blue'], ['Async boundary', 'event · SSE · notification', 'recheck captured scope and provenance', 'purple'], ['Next action', 'read · recheck · record block', 'let STAFF judge result and scope together', 'amber']],
    foot: 'The screen never shows real clinic names, patient data, or internal identifiers. An operations screen should provide clearer information, not simply more information.',
  },
}

const screenSvg = (locale) => {
  const copy = screenCopy[locale]
  const sans = locale === 'ko' ? '"goorm Sans", "Apple SD Gothic Neo", sans-serif' : '"Architects Daughter", "Comic Sans MS", cursive'
  const mono = locale === 'ko' ? '"goorm Sans Code", "goorm Sans", monospace' : '"Comic Mono", "SFMono-Regular", monospace'
  const metricCards = copy.metrics.map(([label, value, note, tone], index) => {
    const x = 70 + index * 510
    return `<g><rect x="${x}" y="175" width="470" height="150" rx="22" fill="#112139" stroke="${colors[tone]}" stroke-width="2"/><rect x="${x + 20}" y="195" width="8" height="110" rx="4" fill="${colors[tone]}"/>${text('metric-label', x + 48, 215, label)}${text('metric-value', x + 48, 272, value)}${text('metric-note', x + 190, 268, note)}</g>`
  }).join('')
  const tableX = 70
  const colX = [100, 350, 690, 1210, 1510]
  const tableHeaders = copy.columns.map((header, index) => text('table-head', colX[index], 455, header)).join('')
  const tableRows = copy.rows.map((row, rowIndex) => {
    const y = 510 + rowIndex * 82
    const tone = row[2] === 'ALLOW' ? colors.cyan : row[2] === 'BLOCKED' ? colors.red : colors.amber
    return `<g><rect x="${tableX + 14}" y="${y - 31}" width="1635" height="64" rx="12" fill="${rowIndex % 2 === 0 ? '#102139' : '#0d1b2f'}" stroke="#253d59"/><rect x="${tableX + 14}" y="${y - 31}" width="8" height="64" rx="4" fill="${tone}"/>${text('table-code', colX[0], y + 4, row[0])}${text('table-cell', colX[1], y + 4, row[1])}${text('table-code', colX[2], y + 4, row[2])}${text('table-code', colX[3], y + 4, row[3])}${text('table-cell', colX[4], y + 4, row[4])}</g>`
  }).join('')
  const detailRows = copy.detail.map(([key, value], index) => `${text('detail-key', 1840, 490 + index * 66, key)}${text('detail-value', 1840, 518 + index * 66, value)}`).join('')
  const bottomCards = copy.bottom.map(([title, code, body, tone], index) => {
    const x = 70 + index * 555
    return `<g><rect x="${x}" y="925" width="520" height="182" rx="20" fill="#112139" stroke="${colors[tone]}" stroke-width="2"/>${text('bottom-title', x + 28, 966, title)}${text('bottom-code', x + 28, 1002, code)}${textBlock('bottom-body', x + 28, 1042, [body], 22)}</g>`
  }).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="1210" viewBox="0 0 2200 1210" role="img" aria-labelledby="title desc" data-locale="${locale}">
  <title id="title">${esc(copy.title)}</title><desc id="desc">${esc(copy.subtitle)}</desc>
  <style>
    .eyebrow,.table-head,.detail-key,.bottom-code{font-family:${mono};font-size:14px;font-weight:800;fill:#7fc9ff;letter-spacing:.4px}
    .screen-title{font-family:${sans};font-size:34px;font-weight:800;fill:#f4f8ff}.screen-subtitle{font-family:${sans};font-size:16px;fill:#a9bad0}
    .metric-label{font-family:${sans};font-size:17px;font-weight:800;fill:#e7f0fb}.metric-value{font-family:${mono};font-size:50px;font-weight:800;fill:#f4f8ff}.metric-note{font-family:${sans};font-size:13px;fill:#91a8c3}
    .table-head{font-size:13px;fill:#b9cbe0}.table-cell{font-family:${sans};font-size:15px;fill:#e7f0fb}.table-code{font-family:${mono};font-size:14px;fill:#d5e2f1}
    .screen-section{font-family:${sans};font-size:22px;font-weight:800;fill:#f4f8ff}.detail-key{font-size:12px;fill:#91a8c3}.detail-value{font-family:${mono};font-size:16px;font-weight:800;fill:#f4f8ff}
    .bottom-title{font-family:${sans};font-size:20px;font-weight:800;fill:#f4f8ff}.bottom-body{font-family:${sans};font-size:14px;fill:#b9cbe0}.muted{font-family:${sans};font-size:13px;fill:#91a8c3}.divider{stroke:#263d59;stroke-width:1}
  </style>
  <rect width="2200" height="1210" fill="#071323"/><rect x="24" y="24" width="2152" height="1162" rx="30" fill="#0c1b2e" stroke="#2d4665" stroke-width="2"/>
  ${text('eyebrow', 70, 72, copy.eyebrow)}${text('screen-title', 70, 116, copy.title)}${text('screen-subtitle', 70, 148, copy.subtitle)}
  <rect x="1690" y="72" width="410" height="34" rx="17" fill="#12243a" stroke="#3a5877"/>${text('eyebrow', 1895, 95, copy.scope, 'text-anchor="middle"')}
  ${metricCards}
  <rect x="70" y="365" width="1660" height="500" rx="22" fill="#0a1728" stroke="#263d59"/><rect x="1760" y="365" width="380" height="500" rx="18" fill="#101f34" stroke="#a78bfa"/><text class="screen-section" x="94" y="418">${esc(copy.queueTitle)}</text><rect x="94" y="445" width="1610" height="1" class="divider"/>${tableHeaders}${tableRows}<text class="eyebrow" x="1950" y="418" text-anchor="middle">DETAIL</text>${detailRows}
  ${bottomCards}${text('muted', 70, 1148, copy.foot)}
</svg>`
}

await mkdir(outDir, { recursive: true })
for (const locale of ['ko', 'en']) {
  await writeFile(join(outDir, `clinic-appointment-multitenant-data-boundaries-boundary-01-${locale}.svg`), boundarySvg(locale))
  await writeFile(join(outDir, `clinic-appointment-multitenant-data-boundaries-operations-screen-${locale}.svg`), screenSvg(locale))
}
