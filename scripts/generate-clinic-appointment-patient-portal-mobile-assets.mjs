import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDirectory = resolve('public/assets/clinic-appointment-patient-portal-mobile');

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

const lineText = (className, x, y, values, lineHeight = 24, extra = '') =>
  `<text class="${className}" x="${x}" y="${y}" ${extra}>${values.map((value, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(value)}</tspan>`).join('')}</text>`;

const markerDefs = () => Object.entries(colors).map(([tone, color]) => `
  <marker id="portal-${tone}-arrow" viewBox="0 0 10 10" markerWidth="14" markerHeight="14" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" data-role="primary" data-size="14x14" data-tip-direction="positive-x">
    <path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}" data-solid-head="true"/>
  </marker>`).join('');

const sharedDefs = (locale, kind) => `<defs>
  <linearGradient id="canvas" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071323"/><stop offset="1" stop-color="#111c32"/></linearGradient>
  <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#091321"/><stop offset="1" stop-color="#101b2e"/></linearGradient>
  ${kind === 'architecture' ? markerDefs() : ''}
  <style>
    .title{font-family:${fonts(locale)};font-size:${locale === 'ko' ? 38 : 34}px;font-weight:800;fill:#f4f8ff}
    .subtitle{font-family:${monoFonts(locale)};font-size:17px;fill:#a9bad0}
    .lane-title{font-family:${fonts(locale)};font-size:${locale === 'ko' ? 22 : 20}px;font-weight:800;fill:#f4f8ff}
    .lane-subtitle{font-family:${monoFonts(locale)};font-size:12px;fill:#8299b2}
    .card-title{font-family:${fonts(locale)};font-size:${locale === 'ko' ? 22 : 20}px;font-weight:800;fill:#f4f8ff}
    .card-body{font-family:${monoFonts(locale)};font-size:${locale === 'ko' ? 14 : 13}px;fill:#b9cbe0}
    .small{font-family:${monoFonts(locale)};font-size:12px;fill:#8fa7c1}
    .connector{fill:none;stroke-width:4;stroke-linecap:round}
    .decision{fill:#171b36;stroke:${colors.purple};stroke-width:2}
    .decision-title{font-family:${fonts(locale)};font-size:${locale === 'ko' ? 21 : 19}px;font-weight:800;fill:#e5d9ff}
    .decision-body{font-family:${monoFonts(locale)};font-size:12px;fill:#d2c4f4}
    .outcome{font-family:${monoFonts(locale)};font-size:11px;font-weight:800;fill:#f8fbff}
    .ui-eyebrow,.ui-label,.ui-mono,.ui-button{font-family:${monoFonts(locale)}}
    .ui-title,.ui-section,.ui-card-title,.ui-value{font-family:${fonts(locale)};font-weight:800;fill:#f4f8ff}
    .ui-eyebrow{font-size:12px;font-weight:800;fill:#7fc9ff}
    .ui-title{font-size:34px}.ui-section{font-size:${locale === 'ko' ? 21 : 19}px}.ui-card-title{font-size:${locale === 'ko' ? 23 : 21}px}
    .ui-label{font-size:13px;fill:#dce8f5}.ui-mono{font-size:12px;fill:#a9bad0}.ui-value{font-size:34px}.ui-button{font-size:13px;font-weight:800;fill:#dce8f5}
    .muted{font-family:${monoFonts(locale)};font-size:12px;fill:#8299b2}.divider{stroke:#263d59;stroke-width:1}
  </style>
</defs>`;

const architectureCopy = {
  ko: {
    title: '환자 채널은 예약 사실을 보여 주고, 예약 서비스가 결정한다',
    subtitle: '포털·알림·모바일 채널의 화면 상태와 예약 서비스의 기준 데이터 원본을 분리합니다.',
    lanes: [
      ['환자 채널', '사용자가 보고 누르는 표면'],
      ['채널 계약', 'typed API · 재조회 · 권한 경계'],
      ['예약 서비스', '예약 상태와 최종 상태 결정'],
    ],
    cards: [
      [['/portal 화면', 'PATIENT guard · 예약 현황 · 내 정보'], ['Portal API client', 'tenant context · typed model'], ['예약 기준 데이터 원본', 'PROPOSED · HELD · CONFIRMED · EXPIRED · CANCELLED']],
      [['알림 화면', 'SSE 우선 · polling 대체 · 읽음 처리'], ['알림 어댑터', 'sequence 정렬 · 오래된 결과 재조회'], ['알림 이벤트 경계', '예약 상태를 바꾸지 않는 전달 사실']],
      [['모바일 채널 로드맵', 'WebView · PWA · native messaging'], ['모바일 경계', '오프라인 캐시는 표시용 · 재연결 후 재조회'], ['최종 상태 결정', '채널 캐시가 아닌 예약 서비스가 한 가지 결과를 기록']],
    ],
    connectorLabels: ['예약 요청', '알림', '로드맵'],
    outcomes: ['CONFIRMED', 'EXPIRED', 'CANCELLED', 'RETRY'],
    note: '채널이 화면을 새로 고쳐도 예약의 기준 데이터 원본은 바뀌지 않습니다. 버튼은 API 계약으로 요청하고, 결과는 다시 읽어 확인합니다.',
  },
  en: {
    title: 'Patient channels show the appointment; the service decides it',
    subtitle: 'Keep portal, notification, and mobile surfaces separate from the appointment service source of truth.',
    lanes: [
      ['Patient channels', 'surfaces people see and use'],
      ['Channel contract', 'typed API / re-read / auth boundary'],
      ['Appointment service', 'state and final outcome decision'],
    ],
    cards: [
      [['/portal shell', 'PATIENT guard · appointments · profile'], ['Portal API client', 'tenant context · typed model'], ['Appointment source of truth', 'PROPOSED · HELD · CONFIRMED · EXPIRED · CANCELLED']],
      [['Notification view', 'SSE first · polling fallback · read mark'], ['Notification adapter', 'order by sequence · re-read stale data'], ['Notification event boundary', 'delivery facts do not mutate appointments']],
      [['Mobile channel roadmap', 'WebView · PWA · native messaging'], ['Mobile boundary', 'offline cache is display-only · re-read after reconnect'], ['Final State Decision', 'the appointment service records one outcome, not a channel cache']],
    ],
    connectorLabels: ['READ / ACT', 'NOTIFY', 'ROADMAP'],
    outcomes: ['CONFIRMED', 'EXPIRED', 'CANCELLED', 'RETRY'],
    note: 'A refresh may change the channel view, but not the appointment source of truth. Buttons call the API contract, then re-read the result.',
  },
};

function renderArchitecture(locale) {
  const copy = architectureCopy[locale];
  const width = 1860;
  const height = 1240;
  const laneXs = [55, 645, 1235];
  const laneWidth = 570;
  const cardXs = [75, 665, 1255];
  const cardWidth = 500;
  const cardYs = [245, 495, 745];
  const cardHeight = 188;
  const rowColors = [colors.cyan, colors.amber, colors.blue];
  const laneMarkup = copy.lanes.map(([title, subtitle], index) => `<rect x="${laneXs[index]}" y="168" width="${laneWidth}" height="860" rx="26" fill="#0b192c" stroke="#2d4665" stroke-width="2"/><text class="lane-title" x="${laneXs[index] + 28}" y="208">${escapeXml(title)}</text><text class="lane-subtitle" x="${laneXs[index] + 28}" y="232">${escapeXml(subtitle)}</text>`).join('\n');
  const cards = copy.cards.map((row, rowIndex) => row.map(([title, body], colIndex) => {
    const x = cardXs[colIndex];
    const y = cardYs[rowIndex];
    const isDecision = colIndex === 2 && rowIndex === 2;
    const tone = isDecision ? colors.purple : rowColors[rowIndex];
    if (isDecision) {
      const outcomeMarkup = copy.outcomes.map((outcome, index) => `<rect x="${x + 22 + index * 122}" y="${y + 103}" width="108" height="30" rx="15" fill="#202243" stroke="${[colors.cyan, colors.amber, colors.red, colors.purple][index]}"/><text class="outcome" x="${x + 76 + index * 122}" y="${y + 123}" text-anchor="middle">${escapeXml(outcome)}</text>`).join('');
      return `<g id="final-state-decision" data-node="true"><rect class="decision" x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="20"/><text class="card-title" x="${x + 24}" y="${y + 43}">${escapeXml(title)}</text>${lineText('decision-body', x + 24, y + 72, [body], 20)}${outcomeMarkup}</g>`;
    }
    return `<g id="${locale}-node-${rowIndex}-${colIndex}" data-node="true"><rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="20" fill="#12243a" stroke="${tone}" stroke-width="2"/><text class="card-title" x="${x + 24}" y="${y + 49}">${escapeXml(title)}</text>${lineText('card-body', x + 24, y + 84, body.split(' · '), 24)}</g>`;
  }).join('\n')).join('\n');
  const connectors = copy.cards.map((_, rowIndex) => {
    const y = cardYs[rowIndex] + cardHeight / 2;
    const tone = rowColors[rowIndex];
    const labelWidths = locale === 'ko' ? [82, 62, 82] : [96, 68, 84];
    const labelWidth = labelWidths[rowIndex];
    const labelX = (cardXs[0] + cardWidth + cardXs[1] - labelWidth) / 2;
    const label = copy.connectorLabels[rowIndex];
    const fromA = `${locale}-node-${rowIndex}-0`;
    const fromB = `${locale}-node-${rowIndex}-1`;
    const toA = rowIndex === 2 ? 'final-state-decision' : `${locale}-node-${rowIndex}-2`;
    const lineOne = `<path class="connector" d="M${cardXs[0] + cardWidth} ${y} H${cardXs[1]}" stroke="${tone}" marker-end="url(#portal-${['cyan', 'amber', 'blue'][rowIndex]}-arrow)" data-connector="${fromA}-${fromB}" data-source-node="${fromA}" data-target-node="${fromB}"/>`;
    const lineTwo = `<path class="connector" d="M${cardXs[1] + cardWidth} ${y} H${cardXs[2]}" stroke="${tone}" marker-end="url(#portal-${['cyan', 'amber', 'blue'][rowIndex]}-arrow)" data-connector="${fromB}-${toA}" data-source-node="${fromB}" data-target-node="${toA}"/>`;
    const labelMarkup = `<rect x="${labelX}" y="${y - 50}" width="${labelWidth}" height="28" rx="14" fill="#12243a" stroke="${tone}"/><text class="small" x="${labelX + labelWidth / 2}" y="${y - 31}" text-anchor="middle">${escapeXml(label)}</text>`;
    return `${lineOne}${lineTwo}${labelMarkup}`;
  }).join('\n');
  const sourceToDecision = `<path class="connector" d="M${cardXs[2] + cardWidth / 2} ${cardYs[1] + cardHeight} V${cardYs[2]}" stroke="${colors.purple}" marker-end="url(#portal-purple-arrow)" data-connector="notification-to-decision" data-source-node="${locale}-node-1-2" data-target-node="final-state-decision"/>`;
  const note = `<rect x="55" y="1060" width="1750" height="126" rx="22" fill="#101f34" stroke="#38506d"/><text class="small" x="84" y="1100">${escapeXml(copy.note)}</text><text class="small" x="84" y="1136">${escapeXml(locale === 'ko' ? '실제 운영 전에는 모바일 오프라인·푸시·딥 링크 동작을 별도 검증해야 합니다. 이 그림은 현재 구현과 열린 로드맵을 함께 구분합니다.' : 'Before production operations, mobile offline, push, and deep-link behavior needs separate validation. This view separates current implementation from the open roadmap.')}</text>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc" data-locale="${locale}">
<title id="title">${escapeXml(copy.title)}</title><desc id="desc">${escapeXml(copy.subtitle)}</desc>
${sharedDefs(locale, 'architecture')}
<rect width="${width}" height="${height}" fill="url(#canvas)"/><rect x="24" y="24" width="1812" height="1192" rx="32" fill="none" stroke="#2d4665" stroke-width="2"/>
${text('title', 62, 78, copy.title)}${text('subtitle', 64, 112, copy.subtitle)}
${laneMarkup}${connectors}${sourceToDecision}${cards}${note}
</svg>`;
}

const screenCopy = {
  ko: {
    eyebrow: '환자 포털 · 화면 시안',
    title: '예약 현황',
    subtitle: '채널이 보여 주는 상태와 예약 서비스에서 다시 읽은 결과를 나란히 확인합니다.',
    patient: '환자 A · PATIENT',
    nav: ['예약 현황', '알림', '내 정보'],
    status: '확정',
    product: '레이저 토닝',
    clinic: '클리닉 A · 피부과',
    date: '2026년 9월 18일 금요일',
    time: '14:30–15:10',
    session: '3회차 / 10회',
    refresh: '예약 서비스에서 다시 읽음 · 14:32:08',
    mainAction: '예약 변경 요청',
    secondaryAction: '예약 취소',
    noticeTitle: '알림 2건',
    notices: ['예약이 확정되었습니다.', '방문 하루 전 리마인더가 예정되어 있습니다.'],
    boundaryTitle: '이 화면이 맡지 않는 것',
    boundaryBody: ['오프라인 캐시는 표시를 돕지만 예약 사실을 확정하지 않습니다.', '푸시 알림이 늦어도 예약 서비스의 상태를 다시 읽습니다.'],
    mobileLabel: '320px 화면에서도 같은 순서로 재배치',
    footer: '합성 데이터로 만든 화면 시안 · 실제 환자 정보와 운영 데이터가 아님',
  },
  en: {
    eyebrow: 'PATIENT PORTAL / SCREEN MOCKUP',
    title: 'Appointments',
    subtitle: 'Read the channel state beside the result re-read from the appointment service.',
    patient: 'Patient A / PATIENT',
    nav: ['Appointments', 'Notifications', 'Profile'],
    status: 'CONFIRMED',
    product: 'Laser toning',
    clinic: 'Clinic A / dermatology',
    date: 'Friday, September 18, 2026',
    time: '14:30–15:10',
    session: 'Session 3 / 10',
    refresh: 'Re-read from appointment service / 14:32:08',
    mainAction: 'Request change',
    secondaryAction: 'Cancel appointment',
    noticeTitle: '2 notifications',
    notices: ['Your appointment is confirmed.', 'A reminder is scheduled for one day before the visit.'],
    boundaryTitle: 'What this screen does not own',
    boundaryBody: ['Offline cache helps display the view but never confirms an appointment.', 'If push delivery is late, the channel re-reads the appointment service state.'],
    mobileLabel: 'The same order reflows at 320px',
    footer: 'Synthetic screen mockup / no real patient or production data',
  },
};

function renderScreen(locale) {
  const copy = screenCopy[locale];
  const width = 1860;
  const height = 1280;
  const sidebarX = 64;
  const mainX = 398;
  const mainWidth = 1398;
  const navMarkup = copy.nav.map((label, index) => {
    const y = 282 + index * 70;
    const active = index === 0;
    return `<rect x="${sidebarX + 22}" y="${y - 30}" width="282" height="48" rx="12" fill="${active ? '#17334a' : '#0e1b2c'}" stroke="${active ? colors.cyan : '#1d334d'}"/><text class="ui-label" x="${sidebarX + 48}" y="${y}" fill="${active ? '#74e4d1' : '#b9cbe0'}">${escapeXml(label)}</text>`;
  }).join('');
  const noticeMarkup = copy.notices.map((notice, index) => `<g><circle cx="${mainX + 902}" cy="${445 + index * 58}" r="6" fill="${index === 0 ? colors.cyan : colors.amber}"/><text class="ui-label" x="${mainX + 922}" y="${451 + index * 58}">${escapeXml(notice)}</text></g>`).join('');
  const boundaryMarkup = copy.boundaryBody.map((line, index) => `<g><circle cx="${mainX + 34}" cy="${850 + index * 58}" r="5" fill="${colors.amber}"/><text class="ui-label" x="${mainX + 54}" y="${856 + index * 58}">${escapeXml(line)}</text></g>`).join('');
  const phoneX = mainX + 1110;
  const phoneY = 818;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc" data-locale="${locale}">
<title id="title">${escapeXml(copy.title)}</title><desc id="desc">${escapeXml(copy.subtitle)}</desc>
${sharedDefs(locale, 'screen')}
<rect width="${width}" height="${height}" fill="#07111e"/><rect x="28" y="28" width="1804" height="1224" rx="32" fill="url(#screen)" stroke="#3b5574" stroke-width="2"/>
<rect x="64" y="64" width="306" height="1150" rx="22" fill="#0b192c" stroke="#2b4562"/><text class="ui-eyebrow" x="${sidebarX + 24}" y="112">${escapeXml(copy.eyebrow)}</text><text class="ui-section" x="${sidebarX + 24}" y="166">Patient portal</text><rect x="${sidebarX + 22}" y="202" width="282" height="54" rx="14" fill="#12243a"/><circle cx="${sidebarX + 54}" cy="229" r="16" fill="#2d5c84"/><text class="ui-label" x="${sidebarX + 84}" y="224">${escapeXml(copy.patient)}</text><text class="ui-mono" x="${sidebarX + 84}" y="244">tenant-blue / clinic-02</text>${navMarkup}<line class="divider" x1="${sidebarX + 22}" y1="524" x2="${sidebarX + 284}" y2="524"/><text class="muted" x="${sidebarX + 24}" y="560">${escapeXml(locale === 'ko' ? '세션이 만료되면 다시 인증합니다.' : 'Re-authenticate when the session expires.')}</text><rect x="${sidebarX + 22}" y="1136" width="282" height="46" rx="12" fill="#14273d" stroke="#294761"/><text class="ui-button" x="${sidebarX + 163}" y="1165" text-anchor="middle">${escapeXml(locale === 'ko' ? '로그아웃' : 'Log out')}</text>
<text class="ui-eyebrow" x="${mainX}" y="96">${escapeXml(copy.eyebrow)}</text><text class="ui-title" x="${mainX}" y="150">${escapeXml(copy.title)}</text><text class="ui-label" x="${mainX}" y="182">${escapeXml(copy.subtitle)}</text>
<rect x="${mainX}" y="220" width="${mainWidth}" height="470" rx="22" fill="#12243a" stroke="#3b5574"/><text class="ui-section" x="${mainX + 30}" y="266">${escapeXml(copy.product)}</text><text class="ui-label" x="${mainX + 30}" y="302">${escapeXml(copy.clinic)}</text><rect x="${mainX + 1020}" y="246" width="174" height="42" rx="21" fill="#183d45" stroke="${colors.cyan}"/><text class="ui-button" x="${mainX + 1107}" y="273" text-anchor="middle" fill="#74e4d1">${escapeXml(copy.status)}</text><text class="ui-value" x="${mainX + 30}" y="386">${escapeXml(copy.date)}</text><text class="ui-section" x="${mainX + 30}" y="430">${escapeXml(copy.time)}</text><text class="ui-label" x="${mainX + 30}" y="466">${escapeXml(copy.session)}</text><line class="divider" x1="${mainX + 30}" y1="510" x2="${mainX + 1160}" y2="510"/><text class="ui-mono" x="${mainX + 30}" y="548">${escapeXml(copy.refresh)}</text><rect x="${mainX + 30}" y="582" width="232" height="54" rx="12" fill="${colors.cyan}"/><text class="ui-button" x="${mainX + 146}" y="616" text-anchor="middle" fill="#092028">${escapeXml(copy.mainAction)}</text><rect x="${mainX + 280}" y="582" width="184" height="54" rx="12" fill="#1b2d42" stroke="#526b84"/><text class="ui-button" x="${mainX + 372}" y="616" text-anchor="middle">${escapeXml(copy.secondaryAction)}</text>
<rect x="${mainX + 870}" y="320" width="472" height="300" rx="18" fill="#101f34" stroke="#2f4865"/><text class="ui-section" x="${mainX + 902}" y="366">${escapeXml(copy.noticeTitle)}</text>${noticeMarkup}
<rect x="${mainX}" y="726" width="1000" height="360" rx="20" fill="#101f34" stroke="#2f4865"/><text class="ui-section" x="${mainX + 30}" y="770">${escapeXml(copy.boundaryTitle)}</text>${boundaryMarkup}<text class="muted" x="${mainX + 30}" y="1038">${escapeXml(copy.mobileLabel)}</text>
<rect x="${phoneX}" y="${phoneY}" width="258" height="402" rx="32" fill="#07111e" stroke="#6184a5" stroke-width="3"/><rect x="${phoneX + 14}" y="${phoneY + 18}" width="230" height="366" rx="22" fill="#12243a"/><rect x="${phoneX + 92}" y="${phoneY + 25}" width="76" height="12" rx="6" fill="#0a1420"/><text class="ui-mono" x="${phoneX + 30}" y="${phoneY + 74}">${escapeXml(copy.title)}</text><rect x="${phoneX + 30}" y="${phoneY + 98}" width="198" height="120" rx="14" fill="#17334a" stroke="${colors.cyan}"/><text class="ui-label" x="${phoneX + 46}" y="${phoneY + 128}">${escapeXml(copy.product)}</text><text class="ui-mono" x="${phoneX + 46}" y="${phoneY + 156}">${escapeXml(copy.date.split(locale === 'ko' ? '요일' : ',')[0])}</text><rect x="${phoneX + 46}" y="${phoneY + 174}" width="84" height="24" rx="12" fill="#183d45"/><text class="ui-mono" x="${phoneX + 88}" y="${phoneY + 191}" text-anchor="middle" fill="#74e4d1">${escapeXml(copy.status)}</text><text class="ui-mono" x="${phoneX + 30}" y="${phoneY + 258}">${escapeXml(copy.nav[1])}</text><circle cx="${phoneX + 214}" cy="${phoneY + 254}" r="6" fill="${colors.amber}"/><line class="divider" x1="${phoneX + 30}" y1="${phoneY + 282}" x2="${phoneX + 228}" y2="${phoneY + 282}"/><text class="muted" x="${phoneX + 30}" y="${phoneY + 328}">320px</text>
<text class="muted" x="${mainX + mainWidth}" y="1198" text-anchor="end">${escapeXml(copy.footer)}</text>
</svg>`;
}

await mkdir(outputDirectory, { recursive: true });
for (const locale of ['ko', 'en']) {
  const assets = [
    [`clinic-appointment-patient-portal-mobile-authority-01-${locale}`, renderArchitecture(locale)],
    [`clinic-appointment-patient-portal-mobile-portal-screen-${locale}`, renderScreen(locale)],
  ];
  for (const [stem, svg] of assets) {
    const svgPath = resolve(outputDirectory, `${stem}.svg`);
    const pngPath = resolve(outputDirectory, `${stem}.png`);
    await writeFile(svgPath, `${svg.trim()}\n`, 'utf8');
    execFileSync('xmllint', ['--noout', svgPath], { stdio: 'inherit' });
    execFileSync('cairosvg', [svgPath, '-o', pngPath, '-s', '2'], { stdio: 'inherit' });
  }
}
