import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const repositoryRoot = process.cwd();
const sourceDirectory = path.join(
  repositoryRoot,
  'docs/diagrams/clinic-appointment-waitlist-operations-screen',
);

const copy = {
  en: {
    lang: 'en',
    eyebrow: 'STAFF OPERATIONS SCREEN · DESIGN MOCKUP',
    title: 'Waitlist operations',
    subtitle: 'A clinic-level view for deciding what to inspect and what to do next',
    clinic: 'Clinic A · morning operations',
    role: 'STAFF',
    readiness: 'READINESS DEGRADED',
    sample: 'Illustrative values · no patient identifiers',
    metrics: [
      ['Waiting', '12', 'waitlist entries'],
      ['In progress', '4', 'active offers'],
      ['Near expiry', '3', 'check expiry and version'],
      ['Needs review', '2', 'delivery result unknown'],
    ],
    queueTitle: 'Action queue',
    queueMeta: 'Deterministic priority · oldest signal first',
    queueHeaders: ['Item', 'State', 'Signal', 'Next task', 'Age'],
    queue: [
      ['o_7F3A…91C2', 'OFFERED', 'expires soon', 'Re-read expiry and version before confirm', '08:12'],
      ['o_2B19…4D08', 'UNKNOWN', 'delivery result unknown', 'Check provider result and offer decision', '11:04'],
      ['o_93DE…7A40', 'STALE', 'old decision', 'Revalidate policy and slot before command', '16:38'],
      ['h_4C01…B8E7', 'HELD', 'stuck hold', 'Inspect reconciliation and recovery evidence', '22:17'],
    ],
    selected: 'Selected item',
    evidence: 'Evidence and permitted work',
    offerRef: 'offerRef',
    offerValue: 'o_7F3A…91C2',
    entryRef: 'entryRef',
    entryValue: 'e_19D0…0B71',
    version: 'version',
    versionValue: '7',
    expiry: 'expiresAt',
    expiryValue: '10:42:18',
    state: 'status',
    stateValue: 'OFFERED',
    delivery: 'deliveryState',
    deliveryValue: 'DELIVERED',
    policy: 'policyVersion',
    policyValue: 'clinic-a-2026-08',
    reason: 'reason category',
    reasonValue: 'slot fit · priority rank',
    privacy: 'No name, phone number, clinical note, or raw score is shown here.',
    commands: 'Permitted work',
    confirm: 'Confirm',
    decline: 'Decline',
    admin: 'Admin-only command',
    resultTitle: 'Terminal outcome decision',
    resultStatus: '202 · IDEMPOTENCY_IN_PROGRESS',
    resultBody: 'Wait for Retry-After: 1, then re-read the decision. Do not send a new key.',
    returnToQueue: 'Return to action queue',
    footer: 'Screen mockup · source-backed states and API outcomes · not a production screenshot',
  },
  ko: {
    lang: 'ko',
    eyebrow: 'STAFF 운영 화면 · 시안',
    title: '대기 목록 운영 화면',
    subtitle: '무엇을 먼저 확인하고 다음에 어떤 작업을 할지 판단하는 병원 단위 화면',
    clinic: '클리닉 A · 오전 운영',
    role: 'STAFF',
    readiness: '운영 준비 DEGRADED',
    sample: '예시 수치 · 환자 식별정보 없음',
    metrics: [
      ['대기', '12', '대기 항목'],
      ['진행 중', '4', '활성 제안'],
      ['만료 임박', '3', '만료·버전 재확인'],
      ['확인 필요', '2', '전송 결과 미확인'],
    ],
    queueTitle: '조치 큐',
    queueMeta: '결정적 우선순위 · 오래된 신호부터',
    queueHeaders: ['항목', '상태', '신호', '다음 작업', '경과'],
    queue: [
      ['o_7F3A…91C2', 'OFFERED', '만료 임박', '만료 시각과 버전을 다시 읽고 확정 판단', '08:12'],
      ['o_2B19…4D08', 'UNKNOWN', '전송 결과 미확인', '제공자 결과와 제안 결정을 재조회', '11:04'],
      ['o_93DE…7A40', 'STALE', '오래된 결정', '명령 전에 정책과 빈시간을 재검증', '16:38'],
      ['h_4C01…B8E7', 'HELD', '보류 정체', '상태 대조·복구 근거를 확인', '22:17'],
    ],
    selected: '선택한 항목',
    evidence: '근거와 허용된 작업',
    offerRef: 'offerRef',
    offerValue: 'o_7F3A…91C2',
    entryRef: 'entryRef',
    entryValue: 'e_19D0…0B71',
    version: 'version',
    versionValue: '7',
    expiry: 'expiresAt',
    expiryValue: '10:42:18',
    state: 'status',
    stateValue: 'OFFERED',
    delivery: 'deliveryState',
    deliveryValue: 'DELIVERED',
    policy: 'policyVersion',
    policyValue: 'clinic-a-2026-08',
    reason: '사유 분류',
    reasonValue: '빈시간 적합 · 우선순위',
    privacy: '이름·전화번호·임상 기록·원시 점수는 이 화면에 표시하지 않습니다.',
    commands: '허용된 작업',
    confirm: '확정',
    decline: '거절',
    admin: 'ADMIN 전용 명령',
    resultTitle: '최종 상태 결정',
    resultStatus: '202 · IDEMPOTENCY_IN_PROGRESS',
    resultBody: 'Retry-After: 1 뒤 결정 결과를 다시 읽습니다. 새 키로 재전송하지 않습니다.',
    returnToQueue: '조치 큐로 돌아가기',
    footer: '화면 시안 · 소스 기반 상태·API 결과 · 실제 운영 화면 캡처 아님',
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const styles = `
  :root {
    color-scheme: dark;
    --canvas: #09111f;
    --surface: #101c2d;
    --surface-raised: #15243a;
    --surface-soft: #1a2d46;
    --line: #2a415e;
    --line-soft: #21364f;
    --text: #edf5ff;
    --muted: #9eb0c5;
    --faint: #6f8299;
    --blue: #7fc9ff;
    --cyan: #74e4d1;
    --amber: #ffd08a;
    --red: #ff9b9b;
    --green: #9de6b5;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; min-width: 1120px; background: var(--canvas); }
  body {
    color: var(--text);
    font-family: 'goorm Sans', 'Apple SD Gothic Neo', system-ui, sans-serif;
    font-size: 16px;
    line-height: 1.45;
  }
  .canvas { padding: 42px; }
  .window {
    width: 100%;
    max-width: 1516px;
    margin: 0 auto;
    overflow: hidden;
    border: 1px solid #38506f;
    border-radius: 22px;
    background: linear-gradient(145deg, #0f1b2d 0%, #0c1728 100%);
    box-shadow: 0 30px 70px rgba(0, 0, 0, .35);
  }
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 26px 32px 22px;
    border-bottom: 1px solid var(--line-soft);
  }
  .eyebrow, .mono, .metric-label, .queue-head, .queue-cell.state, .badge, .detail-label, .footer {
    font-family: 'goorm Sans Code', 'Comic Mono', ui-monospace, monospace;
  }
  .eyebrow { color: var(--blue); font-size: 12px; letter-spacing: .12em; font-weight: 700; }
  h1 { margin: 4px 0 2px; font-size: 31px; letter-spacing: -.04em; }
  .subtitle { margin: 0; color: var(--muted); font-size: 15px; }
  .topbar-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .clinic { color: var(--muted); font-size: 14px; text-align: right; }
  .role { padding: 7px 10px; border: 1px solid #456887; border-radius: 9px; color: var(--blue); font-size: 12px; font-weight: 700; }
  .readiness { padding: 7px 10px; border: 1px solid #8d6a38; border-radius: 9px; background: #2c2416; color: var(--amber); font-size: 12px; font-weight: 700; }
  .content { padding: 28px 32px 26px; }
  .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .metric-card { min-height: 125px; padding: 18px 19px; border: 1px solid var(--line); border-radius: 15px; background: rgba(21, 36, 58, .85); }
  .metric-card:nth-child(2) { border-color: #32617a; }
  .metric-card:nth-child(3), .metric-card:nth-child(4) { border-color: #705936; }
  .metric-label { color: var(--muted); font-size: 12px; letter-spacing: .05em; }
  .metric-value { margin-top: 9px; color: var(--text); font-size: 36px; font-weight: 800; letter-spacing: -.06em; }
  .metric-detail { margin-top: 4px; color: var(--faint); font-size: 13px; }
  .section-bar { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin: 30px 0 12px; }
  h2 { margin: 0; font-size: 20px; letter-spacing: -.025em; }
  .section-meta { color: var(--faint); font-size: 13px; }
  .queue { overflow: hidden; border: 1px solid var(--line); border-radius: 15px; background: rgba(16, 28, 45, .92); }
  .queue-head, .queue-row { display: grid; grid-template-columns: 1.35fr .75fr 1.25fr 2.75fr .55fr; align-items: center; column-gap: 16px; }
  .queue-head { padding: 13px 18px; border-bottom: 1px solid var(--line-soft); color: var(--faint); font-size: 11px; letter-spacing: .07em; text-transform: uppercase; }
  .queue-row { min-height: 64px; padding: 14px 18px; border-bottom: 1px solid rgba(42, 65, 94, .58); }
  .queue-row:last-child { border-bottom: 0; }
  .queue-row.selected { background: linear-gradient(90deg, rgba(45, 87, 118, .36), rgba(45, 87, 118, .08)); box-shadow: inset 3px 0 0 var(--cyan); }
  .queue-cell { color: var(--muted); font-size: 14px; }
  .queue-cell.item { color: var(--text); font-weight: 700; }
  .queue-cell.state { color: var(--blue); font-size: 12px; font-weight: 700; }
  .signal { display: inline-flex; align-items: center; gap: 8px; color: var(--amber); }
  .signal::before { width: 7px; height: 7px; border-radius: 50%; background: currentColor; content: ''; box-shadow: 0 0 0 4px rgba(255, 208, 138, .1); }
  .signal.unknown { color: var(--red); }
  .signal.stale { color: var(--blue); }
  .signal.held { color: var(--cyan); }
  .age { color: var(--faint); text-align: right; }
  .detail-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 14px; margin-top: 14px; }
  .panel { padding: 21px; border: 1px solid var(--line); border-radius: 15px; background: rgba(21, 36, 58, .72); }
  .panel-title { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; margin-bottom: 18px; }
  .panel-title h3 { margin: 0; font-size: 17px; }
  .badge { padding: 5px 8px; border-radius: 7px; background: #193247; color: var(--cyan); font-size: 11px; }
  .details { display: grid; grid-template-columns: repeat(4, 1fr); gap: 13px 16px; }
  .detail-label { color: var(--faint); font-size: 11px; }
  .detail-value { margin-top: 3px; color: var(--text); font-family: 'goorm Sans Code', 'Comic Mono', ui-monospace, monospace; font-size: 13px; overflow-wrap: anywhere; }
  .privacy { margin: 17px 0 0; padding-top: 14px; border-top: 1px solid var(--line-soft); color: var(--muted); font-size: 13px; }
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; margin-top: 17px; }
  .actions-label { width: 100%; color: var(--faint); font-size: 12px; }
  button { border: 0; border-radius: 8px; padding: 9px 13px; font: inherit; font-size: 13px; font-weight: 700; }
  .primary { background: var(--cyan); color: #0c2026; }
  .secondary { border: 1px solid #4f6b87; background: transparent; color: var(--text); }
  .disabled { border: 1px dashed #4c5d71; background: transparent; color: var(--faint); }
  .result { border-color: #7e6339; background: linear-gradient(145deg, rgba(61, 48, 26, .76), rgba(21, 36, 58, .76)); }
  .result .badge { background: #3e301d; color: var(--amber); }
  .result-body { margin: 0; color: var(--muted); font-size: 14px; }
  .result-link { display: inline-block; margin-top: 18px; color: var(--blue); font-size: 13px; font-weight: 700; }
  .footer { padding: 0 32px 26px; color: var(--faint); font-size: 11px; }
  @media (max-width: 1250px) {
    .canvas { padding: 20px; }
    .window { min-width: 1080px; }
    .topbar, .content { padding-left: 24px; padding-right: 24px; }
  }
`;

function metricCards(locale) {
  return locale.metrics.map(([label, value, detail]) => `
    <article class="metric-card">
      <div class="metric-label">${escapeHtml(label)}</div>
      <div class="metric-value">${escapeHtml(value)}<span style="font-size:.5em; letter-spacing:0">${locale.lang === 'ko' ? (label === '대기' ? '명' : '건') : ''}</span></div>
      <div class="metric-detail">${escapeHtml(detail)}</div>
    </article>`).join('').trim();
}

function queueRows(locale) {
  return locale.queue.map(([item, state, signal, task, age], index) => {
    const signalClass = index === 1 ? 'unknown' : index === 2 ? 'stale' : index === 3 ? 'held' : '';
    return `
      <div class="queue-row${index === 0 ? ' selected' : ''}" role="row">
        <div class="queue-cell item" role="cell">${escapeHtml(item)}</div>
        <div class="queue-cell state" role="cell">${escapeHtml(state)}</div>
        <div class="queue-cell" role="cell"><span class="signal ${signalClass}">${escapeHtml(signal)}</span></div>
        <div class="queue-cell" role="cell">${escapeHtml(task)}</div>
        <div class="queue-cell age" role="cell">${escapeHtml(age)}</div>
      </div>`;
  }).join('').trim();
}

function detailMarkup(locale, mode) {
  const commandFocus = mode === 'command';
  return `
    <section class="panel" aria-labelledby="detail-title">
      <div class="panel-title">
        <h3 id="detail-title">${escapeHtml(locale.selected)}</h3>
        <span class="badge">${escapeHtml(locale.stateValue)}</span>
      </div>
      <div class="details">
        <div><div class="detail-label">${escapeHtml(locale.offerRef)}</div><div class="detail-value">${escapeHtml(locale.offerValue)}</div></div>
        <div><div class="detail-label">${escapeHtml(locale.entryRef)}</div><div class="detail-value">${escapeHtml(locale.entryValue)}</div></div>
        <div><div class="detail-label">${escapeHtml(locale.version)}</div><div class="detail-value">${escapeHtml(locale.versionValue)}</div></div>
        <div><div class="detail-label">${escapeHtml(locale.expiry)}</div><div class="detail-value">${escapeHtml(locale.expiryValue)}</div></div>
        <div><div class="detail-label">${escapeHtml(locale.state)}</div><div class="detail-value">${escapeHtml(locale.stateValue)}</div></div>
        <div><div class="detail-label">${escapeHtml(locale.delivery)}</div><div class="detail-value">${escapeHtml(locale.deliveryValue)}</div></div>
        <div><div class="detail-label">${escapeHtml(locale.policy)}</div><div class="detail-value">${escapeHtml(locale.policyValue)}</div></div>
        <div><div class="detail-label">${escapeHtml(locale.reason)}</div><div class="detail-value">${escapeHtml(locale.reasonValue)}</div></div>
      </div>
      <p class="privacy">${escapeHtml(locale.privacy)}</p>
      <div class="actions">
        <div class="actions-label">${escapeHtml(locale.commands)}</div>
        <button class="primary" type="button" aria-label="${escapeHtml(locale.confirm)}">${escapeHtml(locale.confirm)}</button>
        <button class="secondary" type="button" aria-label="${escapeHtml(locale.decline)}">${escapeHtml(locale.decline)}</button>
        <button class="disabled" type="button" disabled aria-label="${escapeHtml(locale.admin)}">${escapeHtml(locale.admin)}</button>
      </div>
    </section>
    <section class="panel result" aria-labelledby="result-title">
      <div class="panel-title">
        <h3 id="result-title">${escapeHtml(locale.resultTitle)}</h3>
        <span class="badge">${escapeHtml(locale.resultStatus)}</span>
      </div>
      <p class="result-body">${escapeHtml(locale.resultBody)}</p>${commandFocus ? `<div class="mono" style="margin-top:17px;color:var(--amber);font-size:12px">GET /offers/${escapeHtml(locale.offerValue)}/decision</div>` : ''}
      <a class="result-link" href="#queue">${escapeHtml(locale.returnToQueue)} →</a>
    </section>`.trim();
}

function render(locale, mode) {
  const title = mode === 'command'
    ? (locale.lang === 'ko' ? '대기 목록 명령 결과 화면' : 'Waitlist command result')
    : locale.title;
  return `<!doctype html>
<html lang="${locale.lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>${styles}</style>
</head>
<body data-workflow-ready="true" data-view="${mode}">
  <main class="canvas">
    <section class="window" aria-label="${escapeHtml(title)}">
      <header class="topbar">
        <div>
          <div class="eyebrow">${escapeHtml(locale.eyebrow)}</div>
          <h1>${escapeHtml(title)}</h1>
          <p class="subtitle">${escapeHtml(locale.subtitle)}</p>
        </div>
        <div class="topbar-right">
          <div class="clinic">${escapeHtml(locale.clinic)}</div>
          <span class="role">${escapeHtml(locale.role)}</span>
          <span class="readiness">${escapeHtml(locale.readiness)}</span>
        </div>
      </header>
      <div class="content">
        <section class="metric-grid" aria-label="${locale.lang === 'ko' ? '병원 단위 운영 지표' : 'Clinic-level operations metrics'}">
          ${metricCards(locale)}
        </section>
        <section id="queue" aria-labelledby="queue-title">
          <div class="section-bar">
            <h2 id="queue-title">${escapeHtml(locale.queueTitle)}</h2>
            <div class="section-meta">${escapeHtml(locale.queueMeta)}</div>
          </div>
          <div class="queue" role="table" aria-label="${escapeHtml(locale.queueTitle)}">
            <div class="queue-head" role="row">${locale.queueHeaders.map((header) => `<div role="columnheader">${escapeHtml(header)}</div>`).join('')}</div>
            ${queueRows(locale)}
          </div>
        </section>
        <div class="detail-grid">
          ${detailMarkup(locale, mode)}
        </div>
      </div>
      <footer class="footer">${escapeHtml(locale.sample)} · ${escapeHtml(locale.footer)}</footer>
    </section>
  </main>
</body>
</html>
`;
}

await mkdir(sourceDirectory, { recursive: true });
for (const [locale, content] of Object.entries(copy)) {
  for (const mode of ['dashboard', 'command']) {
    const output = path.join(sourceDirectory, `operations-screen-${mode}-${locale}.html`);
    await writeFile(output, render(content, mode), 'utf8');
  }
}
