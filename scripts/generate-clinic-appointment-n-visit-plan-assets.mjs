import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(root, 'public/assets');

const locales = {
  ko: {
    comparison: {
      title: '3회 상품 구매는 미래 예약 세 건이 아니다',
      subtitle: '구매 시점에는 방문할 권리와 순서만 만들고, 실제 예약 시간은 각 회차를 정할 때 합의합니다.',
      purchaseTitle: '3회 상품 구매',
      purchaseLines: ['repeatCount = 3', '구매 완료 이벤트'],
      wrongBadge: '잘못된 모델',
      wrongTitle: '미래 예약을 미리 생성',
      wrongLines: ['4월 10일 10:00', '4월 17일 10:00', '4월 24일 10:00'],
      wrongNote: ['환자 동의와 자원 확인 없이', '달력을 점유한다'],
      currentBadge: '현재 모델',
      currentTitle: '방문 계획을 생성',
      currentLines: ['회차 1 · 시간 없음', '회차 2 · 시간 없음', '회차 3 · 시간 없음'],
      currentNote: ['각 회차가 예약 후보가 될 때', '시간을 정한다'],
      noGapTitle: '간격 제약 없음',
      noGapLines: ['임상적 대기 기간이 없다', '같은 방문으로 묶인다는 뜻은 아니다'],
      intervalTitle: 'N~M일 간격',
      intervalLines: ['직전 회차의 실제 완료 시각 기준', '다음 예약 가능 구간을 계산한다'],
      footerTitle: '핵심 경계',
      footerLines: ['상품 구매는 방문 의무를 만든다. 예약 시간과 방문 묶음은 별도의 결정이다.'],
    },
    lifecycle: {
      title: '구매 권리를 회차별 계획과 변경 이력으로 보존한다',
      subtitle: '현재 구현은 회차를 펼치고 완료·환불 결과를 새 계획 버전으로 남긴다.',
      handlerTitle: ['PurchaseCompleted', 'Handler'],
      handlerLines: ['구매 완료 이벤트 수신', '같은 이벤트 재처리 방지'],
      factoryTitle: ['AppointmentPlan', 'Factory'],
      factoryLines: ['repeatCount 읽기', '계획과 최초 버전 생성'],
      treatmentsTitle: 'PlannedTreatment 1..3',
      treatmentsLines: ['sequenceNo = 1, 2, 3', 'earliestStartAt = null', 'latestStartAt = null'],
      completeBadge: '실제 방문 완료',
      completeTitle: '완료 근거 수신',
      completeLines: ['완료된 회차만 COMPLETED', '나머지는 계획 상태 유지'],
      revisionTitle: '새 계획 버전 추가',
      revisionLines: ['이전 버전 보존', '가변 잔여 횟수 차감 아님'],
      refundBadge: '예외',
      refundTitle: '외부 REFUNDED 근거',
      refundLines: ['환불 가능 여부와 금액은', '외부 기준정보가 결정'],
      refundOutcomeTitle: '연결된 의무 취소',
      refundOutcomeLines: ['대상 + BLOCKING 후속 취소', '독립 NON_BLOCKING 의무 유지'],
      gapBadge: '현재 구현 경계',
      gapTitle: '간격 값은 보존하지만 자동 집행 연결은 없다',
      gapLines: ['minimum / preferred / maximum interval은 회차에 복사된다.', '반복 회차 사이의 인접 dependency는 factory가 아직 만들지 않는다.'],
    },
  },
  en: {
    comparison: {
      title: 'A Three-Visit Purchase Is Not Three Future Reservations',
      subtitle: 'Purchase creates visit rights and sequence; each appointment time is agreed only when that visit is scheduled.',
      purchaseTitle: 'Three-Visit Purchase',
      purchaseLines: ['repeatCount = 3', 'purchase completed event'],
      wrongBadge: 'Rejected model',
      wrongTitle: 'Pre-create future reservations',
      wrongLines: ['Apr 10 · 10:00', 'Apr 17 · 10:00', 'Apr 24 · 10:00'],
      wrongNote: ['Occupies the calendar without consent', 'or resource checks'],
      currentBadge: 'Current model',
      currentTitle: 'Create a visit plan',
      currentLines: ['visit 1 · no time', 'visit 2 · no time', 'visit 3 · no time'],
      currentNote: ['Agree on time when each visit', 'becomes a candidate'],
      noGapTitle: 'No interval constraint',
      noGapLines: ['No clinical waiting period', 'Does not imply automatic', 'same-visit grouping'],
      intervalTitle: 'N-to-M-day interval',
      intervalLines: ['Measured from actual', 'prior completion', 'Calculates the next booking window'],
      footerTitle: 'Boundary',
      footerLines: ['Purchase creates visit obligations. Appointment times and visit grouping are separate decisions.'],
    },
    lifecycle: {
      title: 'Preserve Purchased Rights as Occurrences and Revision History',
      subtitle: 'The current implementation expands occurrences and records completion or refund outcomes in new plan revisions.',
      handlerTitle: ['PurchaseCompleted', 'Handler'],
      handlerLines: ['receive purchase event', 'deduplicate replay'],
      factoryTitle: ['AppointmentPlan', 'Factory'],
      factoryLines: ['read repeatCount', 'create plan and first revision'],
      treatmentsTitle: 'PlannedTreatment 1..3',
      treatmentsLines: ['sequenceNo = 1, 2, 3', 'earliestStartAt = null', 'latestStartAt = null'],
      completeBadge: 'Actual completion',
      completeTitle: 'Receive completion fact',
      completeLines: ['only completed occurrence → COMPLETED', 'other occurrences stay planned'],
      revisionTitle: 'Append a new revision',
      revisionLines: ['preserve previous revision', 'not a mutable counter decrement'],
      refundBadge: 'Exception',
      refundTitle: ['External REFUNDED', 'fact'],
      refundLines: ['refund eligibility and amount', 'belong to an external authority'],
      refundOutcomeTitle: 'Cancel linked obligations',
      refundOutcomeLines: ['target + BLOCKING', 'successors cancel', 'independent NON_BLOCKING stays'],
      gapBadge: 'Current boundary',
      gapTitle: 'Interval Values Persist; Enforcement Adjacency Does Not',
      gapLines: ['Minimum, preferred, and maximum intervals are copied to each occurrence.', 'The factory does not yet materialize adjacent dependencies between repeats.'],
    },
  },
};

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const textLines = (lines, x, y, className = 'body', gap = 28, anchor = 'middle') => lines
  .map((line, index) => `<text class="${className}" x="${x}" y="${y + index * gap}" text-anchor="${anchor}">${escapeXml(line)}</text>`)
  .join('\n');

const badge = (text, x, y, width, tone) => `
  <rect x="${x}" y="${y}" width="${width}" height="30" rx="15" fill="${tone}" opacity=".2"/>
  <text class="badge" x="${x + width / 2}" y="${y + 21}" text-anchor="middle" fill="${tone}">${escapeXml(text)}</text>`;

const card = ({ id, x, y, width, height, stroke, title, lines, fill = '#0f2038', titleY = 58, lineY = 96, compactTitle = false, compactBody = false, lineGap = 28 }) => {
  const titleLines = Array.isArray(title) ? title : [title];
  const bodyShift = (titleLines.length - 1) * 22;
  return `
  <g class="node-card">
    <rect id="${id}" x="${x}" y="${y}" width="${width}" height="${height}" rx="24" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    ${titleLines.map((line, index) => `<text class="card-title${compactTitle ? ' compact-card-title' : ''}" x="${x + width / 2}" y="${y + titleY + index * 24}" text-anchor="middle">${escapeXml(line)}</text>`).join('\n')}
    ${textLines(lines, x + width / 2, y + lineY + bodyShift, compactBody ? 'body compact-body' : 'body', lineGap)}
  </g>`;
};

const svgShell = ({ locale, title, desc, body }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="960" viewBox="0 0 1440 960" role="img" aria-labelledby="title desc" data-locale="${locale}">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(desc)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#06111f"/><stop offset=".58" stop-color="#0b1930"/><stop offset="1" stop-color="#10172b"/></linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="155%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#020617" flood-opacity=".5"/></filter>
    <marker id="blueArrow" viewBox="0 0 14 14" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse" data-role="primary" data-size="14x14" data-tip-direction="positive-x"><path d="M 0 0 L 14 7 L 0 14 Z" fill="#60a5fa" data-solid-head="true"/></marker>
    <marker id="greenArrow" viewBox="0 0 14 14" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse" data-role="primary" data-size="14x14" data-tip-direction="positive-x"><path d="M 0 0 L 14 7 L 0 14 Z" fill="#2dd4bf" data-solid-head="true"/></marker>
    <marker id="redArrow" viewBox="0 0 14 14" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse" data-role="primary" data-size="14x14" data-tip-direction="positive-x"><path d="M 0 0 L 14 7 L 0 14 Z" fill="#fb7185" data-solid-head="true"/></marker>
    <marker id="amberArrow" viewBox="0 0 14 14" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse" data-role="primary" data-size="14x14" data-tip-direction="positive-x"><path d="M 0 0 L 14 7 L 0 14 Z" fill="#fbbf24" data-solid-head="true"/></marker>
    <style>
      .title{font-family:"goorm Sans",sans-serif;font-size:38px;font-weight:700;fill:#f8fafc}
      .title-compact{font-size:32px}
      .subtitle{font-family:"goorm Sans",sans-serif;font-size:18px;fill:#aebed2}
      .card-title{font-family:"goorm Sans",sans-serif;font-size:24px;font-weight:700;fill:#f8fafc}
      .compact-card-title{font-size:20px}
      .body{font-family:"goorm Sans Code","goorm Sans",monospace;font-size:17px;fill:#d7e3f3}
      .compact-body{font-size:15px}
      .note{font-family:"goorm Sans",sans-serif;font-size:16px;fill:#aebed2}
      .badge{font-family:"goorm Sans",sans-serif;font-size:14px;font-weight:700}
      .footer-title{font-family:"goorm Sans",sans-serif;font-size:19px;font-weight:700;fill:#f8fafc}
      .footer-body{font-family:"goorm Sans",sans-serif;font-size:17px;fill:#d7e3f3}
      .gap-title{font-family:"goorm Sans",sans-serif;font-size:21px;font-weight:700;fill:#f8fafc}
      .connector{fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:5}
      .blue-line{stroke:#60a5fa;marker-end:url(#blueArrow)}
      .green-line{stroke:#2dd4bf;marker-end:url(#greenArrow)}
      .red-line{stroke:#fb7185;marker-end:url(#redArrow)}
      .amber-line{stroke:#fbbf24;marker-end:url(#amberArrow)}
    </style>
  </defs>
  <rect width="1440" height="960" fill="url(#bg)"/>
  <rect x="30" y="28" width="1380" height="904" rx="30" fill="none" stroke="#263a5e" stroke-width="2"/>
  <circle cx="1300" cy="120" r="220" fill="#7c3aed" opacity=".07"/>
  <circle cx="120" cy="850" r="210" fill="#0891b2" opacity=".06"/>
  ${body}
</svg>
`;

const renderComparison = (locale, copy) => svgShell({
  locale,
  title: copy.title,
  desc: copy.subtitle,
  body: `
  <text class="title${locale === 'en' ? ' title-compact' : ''}" x="70" y="84">${escapeXml(copy.title)}</text>
  <text class="subtitle" x="72" y="120">${escapeXml(copy.subtitle)}</text>
  <g filter="url(#shadow)">
    ${card({ id: 'purchase', x: 60, y: 350, width: 260, height: 180, stroke: '#60a5fa', title: copy.purchaseTitle, lines: copy.purchaseLines })}
    ${card({ id: 'wrong-reservations', x: 400, y: 180, width: 440, height: 240, stroke: '#fb7185', fill: '#341b2b', title: copy.wrongTitle, lines: copy.wrongLines, lineY: 104, titleY: 62 })}
    ${card({ id: 'visit-plan', x: 400, y: 510, width: 440, height: 240, stroke: '#2dd4bf', fill: '#10333b', title: copy.currentTitle, lines: copy.currentLines, lineY: 104, titleY: 62 })}
    ${card({ id: 'no-gap', x: 960, y: 490, width: 390, height: 160, stroke: '#60a5fa', title: copy.noGapTitle, lines: copy.noGapLines, lineY: 92, titleY: 54, compactBody: locale === 'en', lineGap: 23 })}
    ${card({ id: 'interval-window', x: 960, y: 680, width: 390, height: 160, stroke: '#fbbf24', fill: '#312818', title: copy.intervalTitle, lines: copy.intervalLines, lineY: 92, titleY: 54, compactBody: locale === 'en', lineGap: 23 })}
  </g>
  ${badge(copy.wrongBadge, 425, 200, locale === 'ko' ? 112 : 128, '#fb7185')}
  ${textLines(copy.wrongNote, 620, 378, 'note', 22)}
  ${badge(copy.currentBadge, 425, 530, locale === 'ko' ? 100 : 112, '#2dd4bf')}
  ${textLines(copy.currentNote, 620, 706, 'note', 22)}
  <g id="comparison-edges">
    <path class="connector red-line" data-connector="purchase-wrong" data-source-node="purchase" data-target-node="wrong-reservations" d="M 320 395 H 350 Q 375 395 375 370 V 325 Q 375 300 385 300 H 400"/>
    <path class="connector green-line" data-connector="purchase-plan" data-source-node="purchase" data-target-node="visit-plan" d="M 320 485 H 350 Q 375 485 375 510 V 605 Q 375 630 385 630 H 400"/>
    <path class="connector blue-line" data-connector="plan-no-gap" data-source-node="visit-plan" data-target-node="no-gap" d="M 840 570 H 960"/>
    <path class="connector amber-line" data-connector="plan-interval-window" data-source-node="visit-plan" data-target-node="interval-window" d="M 840 690 H 900 Q 925 690 925 715 V 735 Q 925 760 940 760 H 960"/>
  </g>
  <g filter="url(#shadow)">
    <rect x="60" y="870" width="1290" height="48" rx="18" fill="#0b1628" stroke="#2b4168" stroke-width="2"/>
    <text class="footer-title" x="88" y="901">${escapeXml(copy.footerTitle)}</text>
    <text class="footer-body" x="220" y="901">${escapeXml(copy.footerLines[0])}</text>
  </g>`,
});

const renderLifecycle = (locale, copy) => svgShell({
  locale,
  title: copy.title,
  desc: copy.subtitle,
  body: `
  <text class="title${locale === 'en' ? ' title-compact' : ''}" x="70" y="84">${escapeXml(copy.title)}</text>
  <text class="subtitle" x="72" y="120">${escapeXml(copy.subtitle)}</text>
  <g filter="url(#shadow)">
    ${card({ id: 'purchase-handler', x: 60, y: 180, width: 290, height: 210, stroke: '#60a5fa', title: copy.handlerTitle, lines: copy.handlerLines, titleY: 46, lineY: 112, compactTitle: true, compactBody: locale === 'en' })}
    ${card({ id: 'plan-factory', x: 420, y: 180, width: 290, height: 210, stroke: '#60a5fa', title: copy.factoryTitle, lines: copy.factoryLines, titleY: 46, lineY: 112, compactTitle: true, compactBody: locale === 'en' })}
    ${card({ id: 'planned-treatments', x: 780, y: 170, width: 600, height: 220, stroke: '#2dd4bf', fill: '#10333b', title: copy.treatmentsTitle, lines: copy.treatmentsLines, titleY: 56, lineY: 102 })}
    ${card({ id: 'completion-fact', x: 70, y: 520, width: 360, height: 190, stroke: '#2dd4bf', fill: '#10333b', title: copy.completeTitle, lines: copy.completeLines, titleY: 62, lineY: 112, compactBody: locale === 'en' })}
    ${card({ id: 'new-revision', x: 520, y: 520, width: 360, height: 190, stroke: '#2dd4bf', fill: '#10333b', title: copy.revisionTitle, lines: copy.revisionLines, titleY: 62, lineY: 112, compactBody: locale === 'en' })}
    ${card({ id: 'refund-fact', x: 980, y: 480, width: 360, height: 170, stroke: '#fbbf24', fill: '#312818', title: copy.refundTitle, lines: copy.refundLines, titleY: 60, lineY: 94, compactTitle: Array.isArray(copy.refundTitle), compactBody: locale === 'en', lineGap: 24 })}
    ${card({ id: 'refund-outcome', x: 980, y: 710, width: 360, height: 170, stroke: '#fbbf24', fill: '#312818', title: copy.refundOutcomeTitle, lines: copy.refundOutcomeLines, titleY: 56, lineY: 94, compactBody: locale === 'en', lineGap: 23 })}
  </g>
  ${badge(copy.completeBadge, 92, 540, locale === 'ko' ? 110 : 126, '#2dd4bf')}
  ${badge(copy.refundBadge, 1002, 500, locale === 'ko' ? 68 : 78, '#fbbf24')}
  <g id="lifecycle-edges">
    <path class="connector blue-line" data-connector="handler-factory" data-source-node="purchase-handler" data-target-node="plan-factory" d="M 350 280 H 420"/>
    <path class="connector green-line" data-connector="factory-treatments" data-source-node="plan-factory" data-target-node="planned-treatments" d="M 710 280 H 780"/>
    <path class="connector green-line" data-connector="treatments-completion" data-source-node="planned-treatments" data-target-node="completion-fact" d="M 850 390 V 430 Q 850 455 825 455 H 275 Q 250 455 250 480 V 520"/>
    <path class="connector green-line" data-connector="completion-revision" data-source-node="completion-fact" data-target-node="new-revision" d="M 430 615 H 520"/>
    <path class="connector amber-line" data-connector="refund-outcome-edge" data-source-node="refund-fact" data-target-node="refund-outcome" d="M 1160 650 V 710"/>
  </g>
  <g id="implementation-gap-note" filter="url(#shadow)">
    <rect id="implementation-gap" x="70" y="770" width="810" height="120" rx="22" fill="#241d31" stroke="#c084fc" stroke-width="3" stroke-dasharray="10 10"/>
    ${badge(copy.gapBadge, 94, 790, locale === 'ko' ? 116 : 124, '#c084fc')}
    <text class="gap-title" x="475" y="834" text-anchor="middle">${escapeXml(copy.gapTitle)}</text>
    ${textLines(copy.gapLines, 475, 862, 'note', 23)}
  </g>`,
});

await mkdir(outputDirectory, { recursive: true });

for (const [locale, copy] of Object.entries(locales)) {
  const assets = [
    [`clinic-appointment-n-visit-plan-01-${locale}`, renderComparison(locale, copy.comparison)],
    [`clinic-appointment-n-visit-plan-02-${locale}`, renderLifecycle(locale, copy.lifecycle)],
  ];

  for (const [stem, svg] of assets) {
    const svgPath = resolve(outputDirectory, `${stem}.svg`);
    const pngPath = resolve(outputDirectory, `${stem}.png`);
    await writeFile(svgPath, svg, 'utf8');
    execFileSync('xmllint', ['--noout', svgPath], { stdio: 'inherit' });
    execFileSync('cairosvg', [svgPath, '-o', pngPath, '-s', '2'], { stdio: 'inherit' });
  }
}
