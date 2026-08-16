import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const repositoryRoot = process.cwd();
const outputDirectory = path.join(
  repositoryRoot,
  'docs/diagrams/clinic-appointment-implementation-operations-screens',
);

const copy = {
  ko: {
    lang: 'ko',
    clinic: '클리닉 A · 진료 운영',
    role: 'STAFF',
    sourceNote: '소스 기반 운영 시안 · 환자 식별정보 없음',
    nVisit: {
      title: '방문 계획 관리',
      subtitle: '구매 권리, 회차별 상태와 다음 예약 가능 구간을 함께 확인합니다.',
      status: 'PLAN ACTIVE',
      metrics: [
        ['총 회차', '3', '구매 시점에 만든 진료 의무'],
        ['완료', '1', '임상 완료 근거 반영'],
        ['남은 회차', '2', '계획 상태에서 계산'],
        ['다음 예약 가능', '09.05–09.26', '1회차 완료 시각 기준'],
      ],
      planTitle: '레이저 시술 3회 방문 계획',
      planMeta: [
        ['planRef', 'plan_7F3A…91C2'],
        ['purchaseRef', 'purchase_31B8…C441'],
        ['상품 버전', 'laser-3x · v12'],
        ['계획 버전', 'revision 2 · ACTIVE'],
      ],
      timelineTitle: '회차별 이행 상태',
      timelineMeta: '저장된 회차와 실제 완료 근거를 기준으로 표시',
      occurrences: [
        {
          no: '01', state: 'COMPLETED', tone: 'complete', title: '레이저 시술 1회차',
          detail: '2026-08-15 14:30 완료 · 임상 완료 근거 확인',
          timing: '완료 이력 보존',
        },
        {
          no: '02', state: 'PLANNED', tone: 'ready', title: '레이저 시술 2회차',
          detail: '최소 21일 · 권장 28일 · 최대 42일',
          timing: '09.05–09.26 제안 가능',
        },
        {
          no: '03', state: 'PLANNED', tone: 'planned', title: '레이저 시술 3회차',
          detail: '2회차의 실제 완료 시각을 아직 알 수 없음',
          timing: '2회차 완료 후 계산',
        },
      ],
      taskTitle: '운영자의 다음 작업',
      tasks: [
        ['1', '환자 희망 일정 확인', '구매 당시 희망 일정은 확정 예약이 아닙니다.'],
        ['2', '병원 수용량 조회', '의료진·장비·진료실을 함께 확인합니다.'],
        ['3', '정확한 시간 제안', '환자 동의 전에는 자원을 확정 점유하지 않습니다.'],
      ],
      boundaryTitle: '화면에서 지켜야 할 경계',
      boundaries: [
        ['미래 예약 자동 생성 없음', 'PLANNED 회차에는 확정 시간이 없습니다.'],
        ['완료 이력 변경 없음', '환불이 생겨도 완료된 1회차 이력은 남습니다.'],
        ['간격 자동 연결은 별도', '현재 구현은 저장된 간격만으로 인접 의존성을 만들지 않습니다.'],
      ],
      footer: '화면의 날짜와 참조 값은 설명용 예시이며 실제 운영 데이터가 아닙니다.',
    },
    package: {
      title: '패키지 실행 계약 관리',
      subtitle: '구매 당시 선택, 정확한 구성 상품 버전과 실행 관계를 한 화면에서 검증합니다.',
      status: 'REVISION ACTIVE',
      metrics: [
        ['선택 조건', '3개 중 2개', '선택군 care'],
        ['선택한 구성', '2', '레이저 토닝 · 진정 마스크'],
        ['실행 항목', '3', '필수 진단 포함'],
        ['검증 결과', '5/5', '구조 검사 통과'],
      ],
      planTitle: '맞춤 피부 관리 패키지 실행 계약',
      planMeta: [
        ['planRef', 'plan_2C7D…A118'],
        ['packageProduct', 'skin-care · v3'],
        ['sourceVersion', '4'],
        ['snapshotHash', '8c10…e52f'],
      ],
      selectionTitle: '구매에서 확정된 구성',
      selectionMeta: '후보 목록이 아니라 실제 선택 결과',
      selections: [
        { state: '필수', tone: 'required', title: '피부 진단', version: 'skin-diagnosis · v2', detail: '첫 방문 · 별도 진행' },
        { state: '선택', tone: 'selected', title: '레이저 토닝', version: 'laser-toning · v8', detail: '진단 완료 후 3일 이상' },
        { state: '제외', tone: 'excluded', title: '수분 집중 관리', version: 'hydration · v5', detail: '선택하지 않은 후보' },
        { state: '선택', tone: 'selected', title: '진정 마스크 관리', version: 'soothing-mask · v4', detail: '레이저 토닝과 같은 방문 가능' },
      ],
      relationTitle: '실행 관계와 방문 구성',
      relations: [
        ['BLOCKING', '피부 진단 → 레이저 토닝', '선행 완료 뒤 최소 3일'],
        ['CAN_SHARE_VISIT', '레이저 토닝 — 진정 마스크', '같은 방문에 배치 가능'],
      ],
      validationTitle: '실행 계약 검증',
      validations: [
        ['처리 상한', 'PASS'],
        ['구성 상품 버전 중복', 'PASS'],
        ['선택 수 2/2', 'PASS'],
        ['근거 이력·관계 참조', 'PASS'],
        ['실행 의존성 순환', 'PASS'],
      ],
      resultTitle: '저장 결과',
      result: [
        ['계획 리비전', 'revision 4 · ACTIVE'],
        ['진료 항목', '3개 행으로 저장'],
        ['관계', '의존성 1 · 방문 묶음 1'],
        ['예약 상태', '아직 제안·확정 없음'],
      ],
      footer: '검증 통과는 실행 계약을 저장할 수 있다는 뜻이며 방문 가능 시간이나 예약 확정을 뜻하지 않습니다.',
    },
  },
  en: {
    lang: 'en',
    clinic: 'Clinic A · care operations',
    role: 'STAFF',
    sourceNote: 'Source-backed operations mockup · no patient identifiers',
    nVisit: {
      title: 'Visit plan management',
      subtitle: 'Review purchased rights, occurrence state, and the next booking window together.',
      status: 'PLAN ACTIVE',
      metrics: [
        ['Total occurrences', '3', 'Treatment obligations created at purchase'],
        ['Completed', '1', 'Clinical completion evidence applied'],
        ['Remaining', '2', 'Calculated from occurrence state'],
        ['Next booking window', 'Sep 05–Sep 26', 'Based on occurrence 1 completion'],
      ],
      planTitle: 'Three-visit laser treatment plan',
      planMeta: [
        ['planRef', 'plan_7F3A…91C2'],
        ['purchaseRef', 'purchase_31B8…C441'],
        ['Product version', 'laser-3x · v12'],
        ['Plan version', 'revision 2 · ACTIVE'],
      ],
      timelineTitle: 'Occurrence fulfillment state',
      timelineMeta: 'Derived from stored occurrences and completion evidence',
      occurrences: [
        {
          no: '01', state: 'COMPLETED', tone: 'complete', title: 'Laser treatment · occurrence 1',
          detail: 'Completed 2026-08-15 14:30 · clinical evidence verified',
          timing: 'Completion history retained',
        },
        {
          no: '02', state: 'PLANNED', tone: 'ready', title: 'Laser treatment · occurrence 2',
          detail: 'Minimum 21 days · preferred 28 · maximum 42',
          timing: 'Propose Sep 05–Sep 26',
        },
        {
          no: '03', state: 'PLANNED', tone: 'planned', title: 'Laser treatment · occurrence 3',
          detail: 'Occurrence 2 has no actual completion time yet',
          timing: 'Calculate after occurrence 2',
        },
      ],
      taskTitle: 'Operator next tasks',
      tasks: [
        ['1', 'Review patient preference', 'A purchase-time preference is not a confirmed reservation.'],
        ['2', 'Search clinic capacity', 'Check practitioner, equipment, and room together.'],
        ['3', 'Propose an exact time', 'Do not commit resources before patient consent.'],
      ],
      boundaryTitle: 'Boundaries this screen must preserve',
      boundaries: [
        ['No automatic future reservations', 'PLANNED occurrences have no confirmed time.'],
        ['Completion history is immutable', 'A later refund does not erase occurrence 1.'],
        ['Interval wiring is separate', 'Stored interval fields do not create adjacency dependencies today.'],
      ],
      footer: 'Dates and references are illustrative and are not production data.',
    },
    package: {
      title: 'Package execution contract management',
      subtitle: 'Review purchase-time choices, exact component versions, and execution relationships in one view.',
      status: 'REVISION ACTIVE',
      metrics: [
        ['Selection rule', 'Choose 2 of 3', 'Selection group care'],
        ['Selected components', '2', 'Laser toning · soothing mask'],
        ['Executable treatments', '3', 'Including required diagnosis'],
        ['Validation', '5/5', 'Structural checks passed'],
      ],
      planTitle: 'Personalized skin-care package execution contract',
      planMeta: [
        ['planRef', 'plan_2C7D…A118'],
        ['packageProduct', 'skin-care · v3'],
        ['sourceVersion', '4'],
        ['snapshotHash', '8c10…e52f'],
      ],
      selectionTitle: 'Components fixed by the purchase',
      selectionMeta: 'Actual choices, not the full candidate list',
      selections: [
        { state: 'REQUIRED', tone: 'required', title: 'Skin diagnosis', version: 'skin-diagnosis · v2', detail: 'First visit · separate' },
        { state: 'SELECTED', tone: 'selected', title: 'Laser toning', version: 'laser-toning · v8', detail: 'At least 3 days after diagnosis' },
        { state: 'EXCLUDED', tone: 'excluded', title: 'Intensive hydration', version: 'hydration · v5', detail: 'Candidate not selected' },
        { state: 'SELECTED', tone: 'selected', title: 'Soothing mask', version: 'soothing-mask · v4', detail: 'May share a visit with laser toning' },
      ],
      relationTitle: 'Execution and visit relationships',
      relations: [
        ['BLOCKING', 'Skin diagnosis → laser toning', 'Minimum 3 days after completion'],
        ['CAN_SHARE_VISIT', 'Laser toning — soothing mask', 'May be placed in one visit'],
      ],
      validationTitle: 'Execution contract validation',
      validations: [
        ['Processing bounds', 'PASS'],
        ['Unique component versions', 'PASS'],
        ['Selection count 2/2', 'PASS'],
        ['Provenance and references', 'PASS'],
        ['Acyclic dependencies', 'PASS'],
      ],
      resultTitle: 'Persistence result',
      result: [
        ['Plan revision', 'revision 4 · ACTIVE'],
        ['Treatments', 'Stored as 3 rows'],
        ['Relationships', '1 dependency · 1 grouping'],
        ['Reservation state', 'No proposal or confirmation yet'],
      ],
      footer: 'Passing validation means the contract can be stored; it does not prove visit availability or a confirmed reservation.',
    },
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
    --canvas: #07111e;
    --surface: #0d1a2b;
    --raised: #13243a;
    --soft: #182d47;
    --line: #2a4362;
    --line-soft: #203852;
    --text: #edf6ff;
    --muted: #a6b9cd;
    --faint: #71869e;
    --blue: #7fc9ff;
    --cyan: #79e6d2;
    --green: #9ce7b5;
    --amber: #ffd08a;
    --red: #ffaaaa;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1600px; min-width: 1600px; min-height: 1050px; background: var(--canvas); }
  body {
    color: var(--text);
    font-family: var(--body-font);
    font-size: 16px;
    line-height: 1.45;
  }
  body[data-locale="ko"] { --body-font: 'goorm Sans', 'Apple SD Gothic Neo', sans-serif; --code-font: 'goorm Sans Code', monospace; }
  body[data-locale="en"] { --body-font: 'Architects Daughter', system-ui, sans-serif; --code-font: 'Comic Mono', monospace; }
  .canvas { width: 1600px; min-height: 1050px; padding: 34px; }
  .window {
    overflow: hidden;
    width: 1532px;
    min-height: 982px;
    border: 1px solid #395776;
    border-radius: 22px;
    background: linear-gradient(145deg, #0f1d30 0%, #0a1626 100%);
    box-shadow: 0 30px 70px rgba(0, 0, 0, .38);
  }
  .topbar { display: flex; justify-content: space-between; gap: 28px; padding: 27px 32px 23px; border-bottom: 1px solid var(--line-soft); }
  .eyebrow, .mono, .metric-label, .badge, .state, .meta-label, .footer { font-family: var(--code-font); }
  .eyebrow { color: var(--blue); font-size: 12px; font-weight: 700; letter-spacing: .12em; }
  h1 { margin: 5px 0 2px; font-size: 34px; letter-spacing: -.035em; }
  .subtitle { margin: 0; color: var(--muted); font-size: 15px; }
  .topbar-right { display: flex; align-items: center; gap: 11px; flex-shrink: 0; }
  .clinic { color: var(--muted); font-size: 14px; text-align: right; }
  .badge { padding: 7px 10px; border: 1px solid #467096; border-radius: 9px; color: var(--blue); font-size: 12px; font-weight: 700; }
  .badge.status { border-color: #3e806f; background: #102f2a; color: var(--cyan); }
  .content { padding: 24px 30px 25px; }
  .metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px; }
  .metric-card { min-height: 112px; padding: 16px 18px; border: 1px solid var(--line); border-radius: 14px; background: rgba(19, 36, 58, .9); }
  .metric-card:last-child { border-color: #3b756c; background: rgba(18, 52, 49, .65); }
  .metric-label { color: var(--muted); font-size: 12px; }
  .metric-value { margin-top: 7px; font-size: 30px; font-weight: 800; letter-spacing: -.045em; }
  .metric-detail { margin-top: 3px; color: var(--faint); font-size: 12px; }
  .plan-strip { display: grid; grid-template-columns: 1.55fr repeat(4, 1fr); gap: 13px; align-items: stretch; margin-top: 14px; }
  .plan-name, .meta-card { padding: 14px 17px; border: 1px solid var(--line); border-radius: 13px; background: rgba(15, 29, 48, .9); }
  .plan-name { display: flex; align-items: center; font-size: 18px; font-weight: 800; }
  .meta-label { color: var(--faint); font-size: 10px; }
  .meta-value { margin-top: 4px; color: var(--text); font-family: var(--code-font); font-size: 12px; overflow-wrap: anywhere; }
  .main-grid { display: grid; grid-template-columns: 1.45fr 1fr; gap: 14px; margin-top: 14px; }
  .panel { padding: 19px; border: 1px solid var(--line); border-radius: 15px; background: rgba(19, 36, 58, .72); }
  .panel-heading { display: flex; justify-content: space-between; gap: 18px; align-items: baseline; margin-bottom: 14px; }
  h2 { margin: 0; font-size: 20px; }
  h3 { margin: 0; font-size: 16px; }
  .section-meta { color: var(--faint); font-size: 12px; text-align: right; }
  .occurrence-list, .selection-list, .task-list, .boundary-list, .validation-list, .result-list { display: grid; gap: 10px; }
  .occurrence { display: grid; grid-template-columns: 48px 1fr auto; gap: 14px; align-items: center; min-height: 101px; padding: 14px; border: 1px solid var(--line); border-radius: 13px; background: #102038; }
  .occurrence.ready { border-color: #447f93; background: #10283b; }
  .occurrence.complete { border-color: #387c68; background: #102b2b; }
  .number { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 11px; background: #193552; color: var(--blue); font-family: var(--code-font); font-weight: 700; }
  .complete .number { background: #17463c; color: var(--green); }
  .item-title { font-size: 17px; font-weight: 800; }
  .item-detail { margin-top: 4px; color: var(--muted); font-size: 13px; }
  .occurrence-side { min-width: 185px; text-align: right; }
  .state { color: var(--blue); font-size: 11px; font-weight: 700; }
  .complete .state { color: var(--green); }
  .timing { margin-top: 7px; color: var(--amber); font-size: 12px; }
  .right-stack { display: grid; gap: 14px; }
  .task, .boundary, .relation { padding: 13px 14px; border: 1px solid var(--line-soft); border-radius: 12px; background: #102038; }
  .task { display: grid; grid-template-columns: 31px 1fr; gap: 11px; }
  .task-no { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; background: #1a3c59; color: var(--blue); font-family: var(--code-font); font-size: 12px; }
  .small-detail { margin-top: 3px; color: var(--muted); font-size: 12px; }
  .boundary strong { color: var(--amber); }
  .selection { display: grid; grid-template-columns: 92px 1fr auto; gap: 13px; align-items: center; min-height: 77px; padding: 12px 13px; border: 1px solid var(--line); border-radius: 12px; background: #102038; }
  .selection.selected { border-color: #447f93; background: #10283b; }
  .selection.required { border-color: #387c68; background: #102b2b; }
  .selection.excluded { opacity: .56; border-style: dashed; }
  .selection-state { color: var(--blue); font-family: var(--code-font); font-size: 11px; font-weight: 700; }
  .required .selection-state { color: var(--green); }
  .excluded .selection-state { color: var(--faint); }
  .version { color: var(--muted); font-family: var(--code-font); font-size: 11px; }
  .relation { border-left: 3px solid var(--cyan); }
  .relation-kind { color: var(--cyan); font-family: var(--code-font); font-size: 11px; font-weight: 700; }
  .relation-name { margin-top: 4px; font-size: 15px; font-weight: 800; }
  .validation-row, .result-row { display: flex; justify-content: space-between; gap: 16px; padding: 10px 12px; border-bottom: 1px solid var(--line-soft); color: var(--muted); font-size: 13px; }
  .validation-row:last-child, .result-row:last-child { border-bottom: 0; }
  .pass { color: var(--green); font-family: var(--code-font); font-weight: 700; }
  .result-value { color: var(--text); font-family: var(--code-font); text-align: right; }
  .notice { margin-top: 14px; padding: 13px 15px; border: 1px solid #7a633a; border-radius: 12px; background: #2b2417; color: var(--amber); font-size: 13px; }
  .footer { padding: 14px 30px 16px; border-top: 1px solid var(--line-soft); color: var(--faint); font-size: 11px; text-align: center; }
`;

function metricCards(metrics) {
  return metrics.map(([label, value, detail]) => `
    <article class="metric-card">
      <div class="metric-label">${escapeHtml(label)}</div>
      <div class="metric-value">${escapeHtml(value)}</div>
      <div class="metric-detail">${escapeHtml(detail)}</div>
    </article>`).join('');
}

function planStrip(screen) {
  return `
    <section class="plan-strip" aria-label="plan metadata">
      <div class="plan-name">${escapeHtml(screen.planTitle)}</div>
      ${screen.planMeta.map(([label, value]) => `
        <div class="meta-card">
          <div class="meta-label">${escapeHtml(label)}</div>
          <div class="meta-value">${escapeHtml(value)}</div>
        </div>`).join('')}
    </section>`;
}

function renderNVisit(screen) {
  return `
    <div class="main-grid">
      <section class="panel" aria-labelledby="occurrence-title">
        <div class="panel-heading">
          <h2 id="occurrence-title">${escapeHtml(screen.timelineTitle)}</h2>
          <div class="section-meta">${escapeHtml(screen.timelineMeta)}</div>
        </div>
        <div class="occurrence-list">
          ${screen.occurrences.map((item) => `
            <article class="occurrence ${escapeHtml(item.tone)}">
              <div class="number">${escapeHtml(item.no)}</div>
              <div>
                <div class="item-title">${escapeHtml(item.title)}</div>
                <div class="item-detail">${escapeHtml(item.detail)}</div>
              </div>
              <div class="occurrence-side">
                <div class="state">${escapeHtml(item.state)}</div>
                <div class="timing">${escapeHtml(item.timing)}</div>
              </div>
            </article>`).join('')}
        </div>
      </section>
      <div class="right-stack">
        <section class="panel" aria-labelledby="task-title">
          <div class="panel-heading"><h2 id="task-title">${escapeHtml(screen.taskTitle)}</h2></div>
          <div class="task-list">
            ${screen.tasks.map(([no, title, detail]) => `
              <article class="task">
                <div class="task-no">${escapeHtml(no)}</div>
                <div><h3>${escapeHtml(title)}</h3><div class="small-detail">${escapeHtml(detail)}</div></div>
              </article>`).join('')}
          </div>
        </section>
        <section class="panel" aria-labelledby="boundary-title">
          <div class="panel-heading"><h2 id="boundary-title">${escapeHtml(screen.boundaryTitle)}</h2></div>
          <div class="boundary-list">
            ${screen.boundaries.map(([title, detail]) => `
              <article class="boundary"><strong>${escapeHtml(title)}</strong><div class="small-detail">${escapeHtml(detail)}</div></article>`).join('')}
          </div>
        </section>
      </div>
    </div>`;
}

function renderPackage(screen) {
  return `
    <div class="main-grid">
      <section class="panel" aria-labelledby="selection-title">
        <div class="panel-heading">
          <h2 id="selection-title">${escapeHtml(screen.selectionTitle)}</h2>
          <div class="section-meta">${escapeHtml(screen.selectionMeta)}</div>
        </div>
        <div class="selection-list">
          ${screen.selections.map((item) => `
            <article class="selection ${escapeHtml(item.tone)}">
              <div class="selection-state">${escapeHtml(item.state)}</div>
              <div><div class="item-title">${escapeHtml(item.title)}</div><div class="small-detail">${escapeHtml(item.detail)}</div></div>
              <div class="version">${escapeHtml(item.version)}</div>
            </article>`).join('')}
        </div>
        <div class="notice">${escapeHtml(screen.footer)}</div>
      </section>
      <div class="right-stack">
        <section class="panel" aria-labelledby="relation-title">
          <div class="panel-heading"><h2 id="relation-title">${escapeHtml(screen.relationTitle)}</h2></div>
          ${screen.relations.map(([kind, name, detail]) => `
            <article class="relation">
              <div class="relation-kind">${escapeHtml(kind)}</div>
              <div class="relation-name">${escapeHtml(name)}</div>
              <div class="small-detail">${escapeHtml(detail)}</div>
            </article>`).join('')}
        </section>
        <section class="panel" aria-labelledby="validation-title">
          <div class="panel-heading"><h2 id="validation-title">${escapeHtml(screen.validationTitle)}</h2></div>
          <div class="validation-list">
            ${screen.validations.map(([label, result]) => `<div class="validation-row"><span>${escapeHtml(label)}</span><span class="pass">${escapeHtml(result)}</span></div>`).join('')}
          </div>
        </section>
        <section class="panel" aria-labelledby="result-title">
          <div class="panel-heading"><h2 id="result-title">${escapeHtml(screen.resultTitle)}</h2></div>
          <div class="result-list">
            ${screen.result.map(([label, value]) => `<div class="result-row"><span>${escapeHtml(label)}</span><span class="result-value">${escapeHtml(value)}</span></div>`).join('')}
          </div>
        </section>
      </div>
    </div>`;
}

function render(locale, kind) {
  const screen = locale[kind];
  const body = kind === 'nVisit' ? renderNVisit(screen) : renderPackage(screen);
  return `<!doctype html>
<html lang="${locale.lang}" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=1600, initial-scale=1" />
  <title>${escapeHtml(screen.title)}</title>
  <style>${styles}</style>
</head>
<body data-locale="${locale.lang}" data-workflow-ready="true" data-screen="${kind}">
  <main class="canvas">
    <section class="window" aria-label="${escapeHtml(screen.title)}">
      <header class="topbar">
        <div>
          <div class="eyebrow">CLINIC APPOINTMENT · OPERATIONS DATA VIEW</div>
          <h1>${escapeHtml(screen.title)}</h1>
          <p class="subtitle">${escapeHtml(screen.subtitle)}</p>
        </div>
        <div class="topbar-right">
          <div class="clinic">${escapeHtml(locale.clinic)}<br />${escapeHtml(locale.sourceNote)}</div>
          <span class="badge">${escapeHtml(locale.role)}</span>
          <span class="badge status">${escapeHtml(screen.status)}</span>
        </div>
      </header>
      <div class="content">
        <section class="metric-grid" aria-label="summary metrics">${metricCards(screen.metrics)}</section>
        ${planStrip(screen)}
        ${body}
      </div>
      <footer class="footer">${escapeHtml(screen.footer)}</footer>
    </section>
  </main>
</body>
</html>`;
}

await mkdir(outputDirectory, { recursive: true });
for (const [localeName, locale] of Object.entries(copy)) {
  const nVisitHtml = render(locale, 'nVisit').replace(/[ \t]+$/gm, '');
  const packageHtml = render(locale, 'package').replace(/[ \t]+$/gm, '');
  await writeFile(path.join(outputDirectory, `n-visit-plan-operations-screen-${localeName}.html`), nVisitHtml, 'utf8');
  await writeFile(path.join(outputDirectory, `package-execution-operations-screen-${localeName}.html`), packageHtml, 'utf8');
}
