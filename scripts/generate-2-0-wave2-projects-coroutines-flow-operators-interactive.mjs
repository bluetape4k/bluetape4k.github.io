import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { projectsCoroutinesFlowOperatorsCompanion as companion } from '../src/data/visual-companions/wave2-projects-coroutines-flow-operators.mjs';

const root = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const pick = (value, locale) => value[locale];
const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');
const scriptJson = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

const labels = {
  en: {
    catalog: 'Visual companions',
    manual: 'Coroutines Flow manual',
    language: 'Korean',
    scope: '6 families · 66 marble-suitable operators',
    boundary: 'Selection boundary',
    familyCount: 'operators',
    reset: 'Reset',
    play: 'Play',
    pause: 'Pause',
    next: 'Next',
    step: 'Step',
    operatorContract: 'Operator contract',
    sample: 'Sample data flow',
    walkthrough: 'How it works · step by step',
    diagram: 'Marble diagram',
    diagramHint: 'input → operator → output',
    input: 'INPUT',
    output: 'OUTPUT',
    evidence: 'Source evidence',
    issue: 'Delivery issue',
    fallback: 'Static overview',
    stepNames: ['Input signals', 'Operator rule', 'Output mapping', 'Terminal contract'],
  },
  ko: {
    catalog: '시각 자료',
    manual: 'Coroutines Flow 매뉴얼',
    language: 'English',
    scope: '6개 family · Marble Diagram에 적합한 operator 66개',
    boundary: '선정 경계',
    familyCount: '개 operator',
    reset: '처음으로',
    play: '재생',
    pause: '일시정지',
    next: '다음',
    step: '단계',
    operatorContract: 'Operator 계약',
    sample: '샘플 데이터 흐름',
    walkthrough: '단계별 동작',
    diagram: 'Marble Diagram',
    diagramHint: 'input → operator → output',
    input: 'INPUT',
    output: 'OUTPUT',
    evidence: '근거',
    issue: '제작 이슈',
    fallback: '정적 전체 보기',
    stepNames: ['입력 신호', 'Operator 규칙', 'Output mapping', 'Terminal 계약'],
  },
};

function localizedModel(locale) {
  return {
    preferredOperators: companion.preferredOperators,
    families: companion.families.map((family) => ({
      id: family.id,
      label: pick(family.label, locale),
      description: pick(family.description, locale),
      operators: family.operators.map((operator) => ({
        family: operator.family,
        name: operator.name,
        receiver: operator.receiver,
        signature: operator.signature,
        summary: pick(operator.summary, locale),
        rule: pick(operator.rule, locale),
        steps: operator.steps[locale],
        inputs: operator.inputs,
        outputs: operator.outputs,
        windows: operator.windows,
        connections: operator.connections,
      })),
    })),
  };
}

function renderFamily(locale, family, preferred) {
  const copy = labels[locale];
  const selected = family.operators.find(({ name }) => name === preferred) ?? family.operators[0];
  const tabs = family.operators.map((operator, index) => {
    const active = operator.name === selected.name;
    return `<button type="button" class="operator-button" role="tab" id="operator-tab-${family.id}-${index}" aria-selected="${active}" aria-controls="operator-panel-${family.id}" data-action="select" data-family="${family.id}" data-operator-button="${esc(operator.name)}"><span class="tab-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span class="tab-name">${esc(operator.name)}</span></button>`;
  }).join('');
  return `<section class="family-section" data-family-section="${family.id}" aria-labelledby="family-${family.id}">
    <header class="family-head"><div><p class="family-kicker"><span aria-hidden="true"></span>${esc(family.id)}</p><h2 id="family-${family.id}">${esc(family.label)}</h2><p>${esc(family.description)}</p></div><strong>${family.operators.length} ${copy.familyCount}</strong></header>
    <div class="operator-tabs" role="tablist" aria-label="${esc(family.label)}">${tabs}</div>
    <div class="operator-panel" id="operator-panel-${family.id}" role="tabpanel" aria-labelledby="operator-tab-${family.id}-0" data-operator-panel="${family.id}">
      <div class="transport"><div class="controls" aria-label="${esc(selected.name)} playback"><button type="button" class="btn" data-action="reset" data-family="${family.id}">${copy.reset}</button><button type="button" class="btn btn-primary" data-action="play" data-family="${family.id}" aria-pressed="false">${copy.play}</button><button type="button" class="btn" data-action="next" data-family="${family.id}">${copy.next}</button></div><div class="clock"><span>${copy.step}</span><strong data-step-label>1 / 4</strong></div></div>
      <div class="progress" role="progressbar" aria-label="${esc(selected.name)} playback" aria-valuenow="1" aria-valuemin="1" aria-valuemax="4"><div class="progress-bar"></div></div>
      <div class="operator-journey" aria-live="polite"><article class="operator-detail"><p class="micro">${copy.operatorContract}</p><code>${esc(selected.signature)}</code><p>${esc(selected.summary)}</p></article><article class="diagram-panel"><strong>${copy.diagram}</strong><p>${copy.diagramHint}</p></article></div>
    </div>
  </section>`;
}

function render(locale) {
  const copy = labels[locale];
  const model = localizedModel(locale);
  const routePrefix = locale === 'ko' ? '/ko' : '';
  const otherPrefix = locale === 'ko' ? '' : '/ko';
  const other = locale === 'ko' ? 'en' : 'ko';
  const familySections = model.families
    .map((family) => renderFamily(locale, family, model.preferredOperators[family.id]))
    .join('');
  const fallback = `/assets/visual-companions/wave2/projects-coroutines-flow-operators-${locale}.png`;

  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <title>${esc(pick(companion.title, locale))} · bluetape4k</title>
  <style>
    :root{--flow-bg:#07111f;--flow-surface:#0d1b2f;--flow-card:#11243b;--flow-soft:#193453;--flow-line:#2f4d70;--flow-fg:#f3f7fc;--flow-muted:#aabbd1;--flow-cyan:#62d5df;--flow-blue:#7eb5ff;--flow-gold:#f6c36b;--flow-green:#63d6a6;--flow-pink:#f58fa8;--flow-purple:#bca4ff;--flow-red:#ff7795;--flow-shadow:0 18px 50px #02071166;color-scheme:dark;font-family:Inter,"Noto Sans KR",system-ui,sans-serif}
    :root[data-theme="light"]{--flow-bg:#eef4fb;--flow-surface:#fff;--flow-card:#f8fbff;--flow-soft:#e5eef8;--flow-line:#b6c9df;--flow-fg:#10233d;--flow-muted:#526b88;--flow-cyan:#087d89;--flow-blue:#2467bd;--flow-gold:#9d6200;--flow-green:#147a58;--flow-pink:#b83250;--flow-purple:#6d4db5;--flow-red:#bd2849;--flow-shadow:0 18px 50px #36506a24;color-scheme:light}
    *{box-sizing:border-box}html{min-width:320px;background:var(--flow-bg);scroll-behavior:smooth}body{margin:0;color:var(--flow-fg);font:400 16px/1.55 Inter,"Noto Sans KR",system-ui,sans-serif;background:radial-gradient(circle at 10% 0,#1c436522,transparent 34rem),var(--flow-bg)}button,a{font:inherit}a{color:inherit}button:focus-visible,a:focus-visible{outline:3px solid var(--family,var(--flow-cyan));outline-offset:3px}.topbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:.8rem;padding:.7rem max(1rem,calc((100vw - 1320px)/2));border-bottom:1px solid var(--flow-line);background:color-mix(in srgb,var(--flow-bg) 90%,transparent);backdrop-filter:blur(16px)}.brand,.top-actions,.theme-picker,.controls{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}.brand{text-decoration:none;font-weight:600}.brand-mark{display:grid;place-items:center;width:2.3rem;height:2.3rem;border-radius:.7rem;background:linear-gradient(135deg,var(--flow-cyan),var(--flow-blue));color:#06111d;font-size:.78rem;font-weight:800}.btn{min-height:2.6rem;padding:.55rem .8rem;border:1px solid var(--flow-line);border-radius:.75rem;background:var(--flow-surface);color:var(--flow-fg);cursor:pointer;text-decoration:none}.btn:hover{border-color:var(--family,var(--flow-cyan))}.btn-primary,.btn[aria-pressed="true"]{border-color:var(--family,var(--flow-cyan));background:color-mix(in srgb,var(--family,var(--flow-cyan)) 18%,var(--flow-surface))}.page{width:min(1320px,calc(100% - 2rem));margin:auto;padding:clamp(1.5rem,4vw,3.6rem) 0 4rem}.hero{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:2rem;align-items:end;padding-bottom:1.8rem;border-bottom:1px solid var(--flow-line)}.eyebrow{margin:0 0 .65rem;color:var(--flow-cyan);font:700 .8rem/1.2 ui-monospace,monospace;letter-spacing:.09em;text-transform:uppercase}.hero h1{max-width:920px;margin:0;font-size:clamp(2.2rem,5.5vw,5rem);font-weight:650;line-height:1.04;letter-spacing:-.045em}.hero p:not(.eyebrow){max-width:900px;margin:1rem 0 0;color:var(--flow-muted);font-size:clamp(1rem,1.8vw,1.2rem);line-height:1.65}.hero-note{padding:1.1rem 1.2rem;border:1px solid var(--flow-gold);border-radius:1rem;background:color-mix(in srgb,var(--flow-gold) 9%,var(--flow-surface));color:var(--flow-fg);font:.88rem/1.65 ui-monospace,monospace}.legend{display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin:1.2rem 0;color:var(--flow-muted);font-size:.88rem}.legend span{display:inline-flex;align-items:center;gap:.38rem}.legend i{display:inline-block;width:.72rem;height:.72rem;border-radius:50%;background:var(--flow-cyan)}.legend .key-a{background:var(--flow-blue)}.legend .key-b{background:var(--flow-gold)}.legend .key-c{background:var(--flow-purple)}.legend .result{background:var(--flow-green)}.legend .dropped{background:transparent;border:2px dashed var(--flow-muted)}.family-list{display:grid;gap:1.4rem}.family-section{--family:var(--flow-cyan);--family-alt:var(--flow-blue);--family-third:var(--flow-purple);--family-result:var(--flow-green);padding:1.25rem;border:1px solid var(--flow-line);border-radius:1rem;background:var(--flow-surface);box-shadow:var(--flow-shadow)}.family-section[data-family-section="admission"]{--family:var(--flow-pink);--family-alt:var(--flow-blue);--family-third:var(--flow-gold)}.family-section[data-family-section="time"]{--family:var(--flow-gold);--family-alt:var(--flow-pink);--family-third:var(--flow-blue)}.family-section[data-family-section="combine"]{--family:var(--flow-blue);--family-alt:var(--flow-gold);--family-third:var(--flow-purple)}.family-section[data-family-section="async"]{--family:var(--flow-purple);--family-alt:var(--flow-cyan);--family-third:var(--flow-gold)}.family-section[data-family-section="error"]{--family:var(--flow-red);--family-alt:var(--flow-pink);--family-third:var(--flow-gold)}.family-head{display:flex;justify-content:space-between;gap:1rem;align-items:start;padding-bottom:1rem;border-bottom:1px solid color-mix(in srgb,var(--family) 28%,var(--flow-line))}.family-head h2{margin:.15rem 0;font-size:clamp(1.5rem,3vw,2.4rem);font-weight:600}.family-head p:not(.family-kicker){max-width:820px;margin:.35rem 0 0;color:var(--flow-muted)}.family-head>strong{color:var(--family);white-space:nowrap}.family-kicker{display:flex;gap:.45rem;align-items:center;margin:0;color:var(--family);font:700 .75rem/1.2 ui-monospace,monospace;text-transform:uppercase}.family-kicker span{width:.72rem;height:.72rem;border-radius:50%;background:var(--family);box-shadow:0 0 0 3px color-mix(in srgb,var(--family) 22%,transparent)}.operator-tabs{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.48rem;padding:1rem 0;border-bottom:1px solid var(--flow-line)}.operator-button{display:grid;grid-template-columns:1.8rem minmax(0,1fr);align-items:center;gap:.45rem;width:100%;min-height:2.8rem;padding:.55rem .7rem;border:1px solid var(--flow-line);border-radius:.7rem;background:var(--flow-card);color:var(--flow-fg);cursor:pointer;text-align:left;white-space:nowrap;overflow:hidden}.operator-button:hover{border-color:var(--family)}.operator-button[aria-selected="true"]{border-color:var(--family);background:color-mix(in srgb,var(--family) 17%,var(--flow-card));color:var(--family)}.tab-index{color:var(--family);font:700 .72rem/1 ui-monospace,monospace}.tab-name{min-width:0;overflow:hidden;text-overflow:clip;white-space:nowrap;font:.82rem/1.2 ui-monospace,monospace}.operator-panel{padding-top:1rem}.transport{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}.clock{display:flex;gap:.55rem;align-items:center;color:var(--flow-muted)}.clock strong{color:var(--family)}.progress{height:.55rem;margin-top:.7rem;overflow:hidden;border-radius:999px;background:var(--flow-soft)}.progress-bar{height:100%;width:0;background:var(--family);transition:width 300ms ease}.operator-journey{display:grid;grid-template-columns:minmax(300px,.78fr) minmax(0,1.22fr);gap:1rem;margin-top:1rem}.operator-detail,.diagram-panel{padding:1.1rem;border:1px solid var(--flow-line);border-radius:1rem;background:var(--flow-card)}.operator-detail{border-top:4px solid var(--family)}.operator-detail .micro{margin:0 0 .45rem;color:var(--family);font:700 .72rem/1.2 ui-monospace,monospace;text-transform:uppercase}.operator-signature{display:block;color:var(--flow-fg);font:.94rem/1.5 ui-monospace,monospace;overflow-wrap:anywhere}.operator-summary{margin:.55rem 0 1rem;color:var(--flow-muted)}.detail-section{padding-top:.9rem;margin-top:.9rem;border-top:1px solid var(--flow-line)}.detail-title{margin-bottom:.6rem;font-weight:600}.trace-list{display:grid;gap:.5rem}.trace-row{display:grid;grid-template-columns:4.2rem minmax(5.8rem,.35fr) minmax(0,1fr);gap:.5rem;align-items:center;padding:.45rem 0}.trace-role{color:var(--family);font:700 .68rem/1 ui-monospace,monospace}.trace-lane{color:var(--flow-muted);font-size:.76rem}.trace-sequence{display:flex;align-items:center;gap:.28rem;min-width:0;flex-wrap:wrap}.trace-event{display:inline-flex;align-items:center;gap:.22rem;color:var(--flow-fg)}.trace-marble{width:.68rem;height:.68rem;border-radius:50%;background:var(--family)}.trace-event.key-a .trace-marble{background:var(--flow-blue)}.trace-event.key-b .trace-marble{background:var(--flow-gold)}.trace-event.key-c .trace-marble{background:var(--flow-purple)}.trace-event.is-drop{opacity:.52;text-decoration:line-through}.trace-event.is-future,.trace-terminal.is-future,.trace-error.is-future{opacity:.18}.trace-arrow{color:var(--flow-muted)}.trace-terminal{color:var(--flow-green);font-weight:700}.trace-error{color:var(--flow-red);font-weight:700}.step-list{display:grid;gap:.45rem;margin:0;padding:0;list-style:none}.step-row{display:grid;grid-template-columns:2rem minmax(0,1fr);gap:.6rem;align-items:start;padding:.5rem 0}.step-index{display:grid;place-items:center;width:1.7rem;height:1.7rem;border:1px solid var(--flow-line);border-radius:50%;color:var(--flow-muted);font:.72rem/1 ui-monospace,monospace}.step-copy{display:grid;gap:.18rem}.step-name{font-weight:600}.step-description{color:var(--flow-muted);font-size:.88rem}.step-row.is-current .step-index{border-color:var(--family);background:var(--family);color:var(--flow-bg)}.step-row.is-current .step-name{color:var(--family)}.step-row.is-complete .step-index{border-color:var(--family);color:var(--family)}.diagram-head{display:flex;justify-content:space-between;gap:1rem;align-items:start}.diagram-head strong{display:block}.diagram-head p{margin:.25rem 0 0;color:var(--flow-muted);font-size:.85rem}.diagram-step{color:var(--family);white-space:nowrap;font:700 .78rem/1.2 ui-monospace,monospace}.marble-diagram{margin-top:.8rem;overflow:hidden}.marble-svg{display:block;width:100%;height:auto}.time-tick{stroke:var(--flow-line);stroke-width:1}.axis-label,.lane-label,.window-label{fill:var(--flow-muted);font:11px ui-monospace,monospace}.lane-label{font-size:12px}.lane-line{stroke:var(--flow-line);stroke-width:2}.input-line,.input-arrow{stroke:var(--flow-blue);fill:var(--flow-blue)}.output-line,.output-arrow{stroke:var(--flow-green);fill:var(--flow-green)}.operator-box{fill:color-mix(in srgb,var(--family) 13%,var(--flow-card));stroke:var(--family);stroke-width:2}.op-label{fill:var(--family);font:700 13px ui-monospace,monospace;text-anchor:middle;dominant-baseline:middle}.value{fill:var(--family);stroke:var(--flow-card);stroke-width:2}.value.alt{fill:var(--family-alt)}.value.third{fill:var(--family-third)}.value.result{fill:var(--family-result)}.value.key-a,.drop.key-a{fill:var(--flow-blue)}.value.key-b,.drop.key-b{fill:var(--flow-gold)}.value.key-c,.drop.key-c{fill:var(--flow-purple)}.event-label{fill:var(--flow-fg);font:700 10px ui-monospace,monospace;text-anchor:middle;dominant-baseline:middle}.value-text{fill:var(--flow-bg)}.drop{fill:var(--flow-card);stroke:var(--flow-muted);stroke-width:2;stroke-dasharray:4 3}.drop-line{stroke:var(--flow-muted);stroke-width:2}.terminal{stroke:var(--flow-green);stroke-width:3}.error-line{stroke:var(--flow-red);stroke-width:3}.window{fill:color-mix(in srgb,var(--family) 11%,transparent);stroke:var(--family);stroke-width:1.5;stroke-dasharray:5 4}.connection{fill:none;stroke:var(--family-alt);stroke-width:1.5}.connection.muted{stroke:var(--flow-muted);stroke-dasharray:4 4}.cursor{stroke:var(--family);stroke-width:2;stroke-dasharray:5 4}.cursor-dot{fill:var(--family)}.not-yet{opacity:.12}.provenance{margin-top:1.6rem;padding-top:1rem;border-top:1px solid var(--flow-line);color:var(--flow-muted);font-size:.9rem}.provenance a{margin-inline-end:1rem;color:var(--flow-fg)}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    @media(max-width:980px){.hero{grid-template-columns:1fr}.operator-journey{grid-template-columns:1fr}.hero-note{max-width:none}}
    @media(max-width:620px){.topbar{align-items:flex-start}.top-actions>a:first-child{display:none}.page{width:min(100% - 1rem,1320px)}.family-section{padding:.8rem}.family-head{display:block}.family-head>strong{display:block;margin-top:.6rem}.operator-tabs{grid-template-columns:minmax(0,1fr)}.operator-button{grid-template-columns:1.5rem minmax(0,1fr);padding-inline:.55rem}.transport{align-items:flex-start;flex-direction:column}.trace-row{grid-template-columns:3.6rem minmax(0,1fr)}.trace-sequence{grid-column:2}.operator-detail,.diagram-panel{padding:.8rem}}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
  </style>
</head>
<body>
  <nav class="topbar" aria-label="bluetape4k visual companion"><a class="brand" href="${routePrefix}/visual-companions/"><span class="brand-mark" aria-hidden="true">B4K</span><span>${copy.catalog}</span></a><div class="top-actions"><a class="btn" href="${companion.manual[locale]}">${copy.manual}</a><a class="btn" href="${otherPrefix}/visual-companions/${companion.repository}/${companion.slug}/" hreflang="${other}">${copy.language}</a><div class="theme-picker" aria-label="Theme"><button class="btn" type="button" data-theme-button="auto">Auto</button><button class="btn" type="button" data-theme-button="light">Light</button><button class="btn" type="button" data-theme-button="dark">Dark</button></div></div></nav>
  <main class="page">
    <header class="hero"><div><p class="eyebrow">#430 · bluetape4k-projects · 2.0.0 · coroutines Flow</p><h1>${esc(pick(companion.title, locale))}</h1><p>${esc(pick(companion.summary, locale))}</p></div><aside class="hero-note"><strong>${copy.scope}</strong><br><br><strong>${copy.boundary}</strong><br>${esc(pick(companion.boundary, locale))}</aside></header>
    <div class="legend" aria-label="Marble legend"><span><i class="key-a"></i>Key A / input</span><span><i class="key-b"></i>Key B</span><span><i class="key-c"></i>Key C</span><span><i class="result"></i>output / result</span><span><i class="dropped"></i>dropped</span><span>│ onComplete</span><span>× onError</span></div>
    <div class="family-list" id="bt4k-issue-430">${familySections}</div>
    <footer class="provenance"><strong>${copy.evidence}</strong><br><a href="https://github.com/bluetape4k/bluetape4k.github.io/issues/430">${copy.issue} #430</a><a href="${fallback}">${copy.fallback}</a>${companion.sources.map((source) => `<a href="${source.url}">${esc(source.label)}</a>`).join('')}<span>source ${companion.sourceRevision}</span></footer>
  </main>
  <script>
    (() => {
      const root = document.getElementById('bt4k-issue-430');
      if (!root) return;
      const model = ${scriptJson(model)};
      const labels = ${scriptJson(copy)};
      let width = 736;
      const states = new Map(model.families.map((family) => [family.id, {
        selected: family.operators.some((operator) => operator.name === model.preferredOperators[family.id])
          ? model.preferredOperators[family.id]
          : family.operators[0].name,
        step: 0,
        timer: null,
      }]));
      const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
      const xFor = (t, left, right) => left + t * (right - left);
      const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const familyById = (id) => model.families.find((family) => family.id === id);
      const operatorByName = (family, name) => family.operators.find((operator) => operator.name === name) || family.operators[0];
      function keyClass(label) {
        const text = String(label);
        const matches = (key) => new RegExp('(^|[^A-Za-z])' + key + '(?=$|[^A-Za-z]|[0-9₁₂₃′✓])', 'i').test(text);
        if (matches('A')) return 'key-a';
        if (matches('B')) return 'key-b';
        if (matches('C')) return 'key-c';
        return '';
      }
      function eventMarkup(event, y, left, right, step, side) {
        const x = xFor(event.t, left, right);
        const hidden = event.step > step ? ' not-yet' : '';
        const semanticKey = keyClass(event.label);
        if (event.type === 'complete') return '<g class="' + hidden.trim() + '"><line class="terminal" x1="' + x + '" y1="' + (y - 15) + '" x2="' + x + '" y2="' + (y + 15) + '"/></g>';
        if (event.type === 'error') return '<g class="' + hidden.trim() + '"><line class="error-line" x1="' + (x - 10) + '" y1="' + (y - 10) + '" x2="' + (x + 10) + '" y2="' + (y + 10) + '"/><line class="error-line" x1="' + (x + 10) + '" y1="' + (y - 10) + '" x2="' + (x - 10) + '" y2="' + (y + 10) + '"/></g>';
        const radius = String(event.label).length > 5 ? 21 : String(event.label).length > 3 ? 17 : 14;
        const keyAttr = semanticKey ? ' data-key="' + semanticKey.slice(-1) + '"' : '';
        if (event.type === 'drop') return '<g class="' + hidden.trim() + '" data-flow-role="' + side + '"' + keyAttr + '><circle class="drop ' + semanticKey + '" cx="' + x + '" cy="' + y + '" r="' + radius + '"/><text class="event-label" x="' + x + '" y="' + y + '">' + esc(event.label) + '</text><line class="drop-line ' + semanticKey + '" x1="' + (x - radius + 3) + '" y1="' + (y + radius - 3) + '" x2="' + (x + radius - 3) + '" y2="' + (y - radius + 3) + '"/></g>';
        const tone = event.tone ? ' ' + event.tone : '';
        return '<g class="' + hidden.trim() + '" data-flow-role="' + side + '"' + keyAttr + '><circle class="value' + tone + (semanticKey ? ' ' + semanticKey : '') + '" cx="' + x + '" cy="' + y + '" r="' + radius + '"/><text class="event-label value-text" x="' + x + '" y="' + y + '">' + esc(event.label) + '</text></g>';
      }
      function traceEventMarkup(event, step) {
        const future = event.step > step ? ' is-future' : '';
        if (event.type === 'complete') return '<span class="trace-terminal' + future + '" aria-label="onComplete">│</span>';
        if (event.type === 'error') return '<span class="trace-error' + future + '" aria-label="onError">×</span>';
        const semanticKey = keyClass(event.label);
        const drop = event.type === 'drop' ? ' is-drop' : '';
        return '<span class="trace-event' + (semanticKey ? ' ' + semanticKey : '') + drop + future + '"><i class="trace-marble" aria-hidden="true"></i><code>' + esc(event.label) + '</code></span>';
      }
      function traceLaneMarkup(lane, side, step) {
        const sequence = lane.events.map((event, index) => (index ? '<span class="trace-arrow" aria-hidden="true">→</span>' : '') + traceEventMarkup(event, step)).join('');
        return '<div class="trace-row" data-flow-role="' + side + '"><span class="trace-role">' + labels[side] + '</span><code class="trace-lane">' + esc(lane.label) + '</code><div class="trace-sequence">' + sequence + '</div></div>';
      }
      function operatorDetailMarkup(item, step) {
        const sampleFlow = item.inputs.map((lane) => traceLaneMarkup(lane, 'input', step)).concat(item.outputs.map((lane) => traceLaneMarkup(lane, 'output', step))).join('');
        const walkthrough = item.steps.map((description, index) => {
          const stateClass = index === step ? ' is-current' : index < step ? ' is-complete' : '';
          return '<li class="step-row' + stateClass + '"><span class="step-index">' + (index + 1) + '</span><div class="step-copy"><span class="step-name">' + esc(labels.stepNames[index]) + '</span><span class="step-description">' + esc(description) + '</span></div></li>';
        }).join('');
        return '<div class="detail-section"><div class="detail-title">' + labels.sample + '</div><div class="trace-list">' + sampleFlow + '</div></div><div class="detail-section"><div class="detail-title">' + labels.walkthrough + '</div><ol class="step-list">' + walkthrough + '</ol><span class="sr-only" aria-live="polite">' + labels.step + ' ' + (step + 1) + ': ' + esc(item.steps[step]) + '</span></div>';
      }
      function diagramMarkup(item, step, diagramWidth) {
        const compact = diagramWidth < 500;
        const left = compact ? 66 : 94;
        const right = diagramWidth - 22;
        const laneGap = compact ? 58 : 62;
        const top = 68;
        const inputHeight = Math.max(1, item.inputs.length) * laneGap;
        const opY = top + inputHeight + 18;
        const outputTop = opY + 72;
        const height = outputTop + Math.max(1, item.outputs.length) * laneGap + 48;
        const inputYs = item.inputs.map((_, index) => top + index * laneGap);
        const outputYs = item.outputs.map((_, index) => outputTop + index * laneGap);
        const ticks = [0, .25, .5, .75, 1];
        const lineMarkup = (lane, y, side, index) => {
          const windows = item.windows.filter((windowItem) => windowItem.side === side && windowItem.lane === index && windowItem.step <= step).map((windowItem) => {
            const x1 = xFor(windowItem.from, left, right);
            const x2 = xFor(windowItem.to, left, right);
            return '<g><rect class="window" x="' + x1 + '" y="' + (y - 23) + '" width="' + Math.max(8, x2 - x1) + '" height="46" rx="8"/><text class="window-label" x="' + (x1 + 6) + '" y="' + (y - 29) + '">' + esc(windowItem.label) + '</text></g>';
          }).join('');
          return windows + '<text class="lane-label ' + side + '-label" x="4" y="' + (y + 4) + '">' + esc(lane.label) + '</text><line class="lane-line ' + side + '-line" x1="' + left + '" y1="' + y + '" x2="' + (right - 7) + '" y2="' + y + '"/><path class="lane-arrow ' + side + '-arrow" d="M ' + (right - 9) + ' ' + (y - 5) + ' L ' + (right - 2) + ' ' + y + ' L ' + (right - 9) + ' ' + (y + 5) + '"/>' + lane.events.map((event) => eventMarkup(event, y, left, right, step, side)).join('');
        };
        const connections = item.connections.filter((connection) => connection.step <= step).map((connection) => {
          const y1 = inputYs[connection.fromLane] ?? inputYs[0];
          const y2 = outputYs[connection.toLane] ?? outputYs[0];
          const x1 = xFor(connection.fromT, left, right);
          const x2 = xFor(connection.toT, left, right);
          const mid = (y1 + y2) / 2;
          return '<path class="connection' + (connection.muted ? ' muted' : '') + '" d="M ' + x1 + ' ' + (y1 + 16) + ' C ' + x1 + ' ' + mid + ', ' + x2 + ' ' + mid + ', ' + x2 + ' ' + (y2 - 16) + '"/>';
        }).join('');
        const cursorX = xFor([.02, .35, .68, .98][step], left, right);
        const tickMarkup = ticks.map((tick) => {
          const x = xFor(tick, left, right);
          return '<line class="time-tick" x1="' + x + '" y1="18" x2="' + x + '" y2="' + (height - 30) + '"/><text class="axis-label" x="' + x + '" y="14" text-anchor="middle">' + Math.round(tick * 100) + '%</text>';
        }).join('');
        const operatorLabel = item.name.includes('.') ? item.name : item.receiver + '.' + item.name;
        const id = slug(item.family + '-' + item.name);
        return '<svg class="marble-svg" viewBox="0 0 ' + diagramWidth + ' ' + height + '" role="img" aria-labelledby="marble-title-' + id + ' marble-desc-' + id + '"><title id="marble-title-' + id + '">' + esc(item.name) + ' marble diagram</title><desc id="marble-desc-' + id + '">' + esc(item.summary) + '</desc>' + tickMarkup + item.inputs.map((lane, index) => lineMarkup(lane, inputYs[index], 'input', index)).join('') + '<rect class="operator-box" x="' + left + '" y="' + (opY - 22) + '" width="' + (right - left) + '" height="44" rx="10"/><text class="op-label" x="' + ((left + right) / 2) + '" y="' + opY + '">' + esc(operatorLabel) + '</text>' + connections + item.outputs.map((lane, index) => lineMarkup(lane, outputYs[index], 'output', index)).join('') + '<line class="cursor" x1="' + cursorX + '" y1="20" x2="' + cursorX + '" y2="' + (height - 30) + '"/><circle class="cursor-dot" cx="' + cursorX + '" cy="20" r="4"/><text class="axis-label" x="' + right + '" y="' + (height - 10) + '" text-anchor="end">time →</text></svg>';
      }
      function renderFamily(familyId) {
        const family = familyById(familyId);
        const state = states.get(familyId);
        const item = operatorByName(family, state.selected);
        const section = root.querySelector('[data-family-section="' + familyId + '"]');
        const panel = section.querySelector('[data-operator-panel]');
        section.querySelectorAll('[data-operator-button]').forEach((button) => {
          const selected = button.dataset.operatorButton === item.name;
          button.setAttribute('aria-selected', String(selected));
          if (selected) panel.setAttribute('aria-labelledby', button.id);
        });
        const playButton = section.querySelector('[data-action="play"]');
        playButton.textContent = state.timer ? labels.pause : labels.play;
        playButton.setAttribute('aria-pressed', String(Boolean(state.timer)));
        section.querySelector('[data-step-label]').textContent = (state.step + 1) + ' / 4';
        const progress = section.querySelector('.progress');
        progress.setAttribute('aria-label', item.name + ' playback');
        progress.setAttribute('aria-valuenow', String(state.step + 1));
        section.querySelector('.progress-bar').style.width = (state.step / 3 * 100) + '%';
        const panelWidth = Math.max(280, Math.round((section.querySelector('.diagram-panel') || section).getBoundingClientRect().width - 36));
        panel.querySelector('.operator-journey').innerHTML = '<article class="operator-detail"><p class="micro">' + labels.operatorContract + '</p><code class="operator-signature">' + esc(item.signature) + '</code><p class="operator-summary">' + esc(item.summary) + '</p>' + operatorDetailMarkup(item, state.step) + '</article><article class="diagram-panel"><div class="diagram-head"><div><strong>' + labels.diagram + '</strong><p>' + labels.diagramHint + '</p></div><span class="diagram-step">' + labels.step + ' ' + (state.step + 1) + ' / 4</span></div><div class="marble-diagram">' + diagramMarkup(item, state.step, panelWidth) + '</div></article>';
      }
      function stopFamily(familyId) {
        const state = states.get(familyId);
        if (state.timer) window.clearInterval(state.timer);
        state.timer = null;
      }
      root.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button || !root.contains(button)) return;
        const familyId = button.dataset.family;
        const state = states.get(familyId);
        if (!state) return;
        if (button.dataset.action === 'select') {
          stopFamily(familyId);
          state.selected = button.dataset.operatorButton;
          state.step = 0;
          renderFamily(familyId);
          return;
        }
        if (button.dataset.action === 'play') {
          if (state.timer) {
            stopFamily(familyId);
            renderFamily(familyId);
            return;
          }
          if (state.step === 3) state.step = 0;
          state.timer = window.setInterval(() => {
            if (state.step === 3) stopFamily(familyId);
            else state.step += 1;
            renderFamily(familyId);
          }, 1150);
          renderFamily(familyId);
          return;
        }
        stopFamily(familyId);
        state.step = button.dataset.action === 'reset' ? 0 : (state.step + 1) % 4;
        renderFamily(familyId);
      });
      document.querySelectorAll('[data-theme-button]').forEach((button) => button.addEventListener('click', () => {
        const theme = button.dataset.themeButton;
        if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
        else document.documentElement.dataset.theme = theme;
      }));
      const observer = new ResizeObserver(() => {
        const nextWidth = Math.max(280, Math.round(root.getBoundingClientRect().width));
        if (Math.abs(nextWidth - width) > 8) {
          width = nextWidth;
          model.families.forEach((family) => renderFamily(family.id));
        }
      });
      observer.observe(root);
      model.families.forEach((family) => renderFamily(family.id));
    })();
  </script>
</body>
</html>
`;
}

let mismatches = 0;
for (const locale of ['en', 'ko']) {
  const prefix = locale === 'ko' ? 'ko' : '';
  const output = resolve(root, 'public', prefix, 'visual-companions', companion.repository, companion.slug, 'index.html');
  const expected = render(locale);
  if (check) {
    const actual = await readFile(output, 'utf8').catch(() => null);
    if (actual !== expected) {
      console.error(`OUT_OF_DATE ${output}`);
      mismatches += 1;
    }
  } else {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, expected);
    console.log(`WROTE ${output}`);
  }
}
if (mismatches) process.exitCode = 1;
