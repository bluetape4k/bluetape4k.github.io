import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { projectsNetCdfDataModelCompanion as companion } from '../src/data/visual-companions/wave2-projects-netcdf-data-model.mjs';

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
    catalog: 'Visual companions', manual: 'Science manual', language: 'Korean',
    phases: 'Follow the data model', phase: 'Stage', question: 'Question', example: 'Example',
    why: 'Why it matters', result: 'Reader takeaway', domains: 'Choose a scientific world',
    domainQuestion: 'The same structure, a different question', variables: 'Variables',
    shape: 'Shape', output: 'Typical output', discipline: 'Domain lens',
    reset: 'Reset', play: 'Play', pause: 'Pause', next: 'Next', step: 'Step', progress: 'Model progress',
    use: 'A reusable reading loop', boundary: 'General model · current library boundary',
    evidence: 'Source evidence', issue: 'Delivery issue', parent: 'Follow-up to #418',
    classic: 'Classic model', enhanced: 'Enhanced netCDF-4',
  },
  ko: {
    catalog: '시각 자료', manual: 'Science 매뉴얼', language: 'English',
    phases: '자료 모델 따라가기', phase: '단계', question: '질문', example: '예시',
    why: '왜 중요한가', result: '읽은 결과', domains: '과학 분야를 선택하세요',
    domainQuestion: '같은 구조, 다른 질문', variables: '변수',
    shape: 'Shape', output: '대표 산출물', discipline: '분야 관점',
    reset: '처음으로', play: '재생', pause: '일시정지', next: '다음', step: '단계', progress: '모델 진행',
    use: '재사용 가능한 읽기 loop', boundary: '일반 모델 · 현재 library 경계',
    evidence: '근거', issue: '제작 이슈', parent: '#418에서 이어짐',
    classic: 'Classic model', enhanced: 'Enhanced netCDF-4',
  },
};

function localizedModel(locale) {
  const localized = (value) => pick(value, locale);
  return {
    phases: companion.phases.map((value) => ({
      id: value.id,
      title: localized(value.title),
      question: localized(value.question),
      example: localized(value.example),
      reason: localized(value.reason),
      result: localized(value.result),
    })),
    visuals: companion.visuals.map((value) => ({
      phase: value.phase,
      nodes: value.nodes.map((node) => ({ id: node.id, label: localized(node.label), detail: localized(node.detail) })),
    })),
    domains: companion.domains.map((value) => ({
      id: value.id,
      label: localized(value.label),
      discipline: localized(value.discipline),
      shape: localized(value.shape),
      variables: localized(value.variables),
      question: localized(value.question),
      output: localized(value.output),
    })),
    usage: companion.usage.map(localized),
    model: {
      classic: localized(companion.model.classic),
      enhanced: localized(companion.model.enhanced),
      contract: localized(companion.model.contract),
    },
    currentImplementation: {
      title: localized(companion.currentImplementation.title),
      detail: localized(companion.currentImplementation.detail),
      boundary: localized(companion.currentImplementation.boundary),
    },
  };
}

function render(locale) {
  const copy = labels[locale];
  const model = localizedModel(locale);
  const routePrefix = locale === 'ko' ? '/ko' : '';
  const otherPrefix = locale === 'ko' ? '' : '/ko';
  const other = locale === 'ko' ? 'en' : 'ko';
  const phaseButtons = model.phases.map((value, index) => `<li><button type="button" data-phase-button="${value.id}" aria-current="${index === 0 ? 'step' : 'false'}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(value.title)}</strong></button></li>`).join('');
  const domainButtons = model.domains.map((value, index) => `<button type="button" class="domain-chip" data-domain-button="${value.id}" aria-pressed="${index === 0}">${esc(value.label)}</button>`).join('');

  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <title>${esc(pick(companion.title, locale))} · bluetape4k</title>
  <style>
    :root{--nc-bg:#07111f;--nc-surface:#0d1b2f;--nc-card:#11243b;--nc-soft:#193453;--nc-line:#2f4d70;--nc-fg:#f3f7fc;--nc-muted:#aabbd1;--nc-cyan:#62d5df;--nc-blue:#7eb5ff;--nc-gold:#f6c36b;--nc-green:#63d6a6;--nc-pink:#f58fa8;--nc-shadow:0 18px 50px #02071166;color-scheme:dark;font-family:Inter,"Noto Sans KR",system-ui,sans-serif}
    :root[data-theme="light"]{--nc-bg:#eef4fb;--nc-surface:#fff;--nc-card:#f8fbff;--nc-soft:#e5eef8;--nc-line:#b6c9df;--nc-fg:#10233d;--nc-muted:#526b88;--nc-cyan:#087d89;--nc-blue:#2467bd;--nc-gold:#9d6200;--nc-green:#147a58;--nc-pink:#b83250;--nc-shadow:0 18px 50px #36506a24;color-scheme:light}
    *{box-sizing:border-box}html{min-width:320px;background:var(--nc-bg)}body{margin:0;color:var(--nc-fg);font:400 16px/1.55 var(--nc-font,sans-serif);background:radial-gradient(circle at 10% 0,#1c436522,transparent 34rem),var(--nc-bg)}button,a{font:inherit}a{color:inherit}button:focus-visible,a:focus-visible{outline:3px solid var(--nc-cyan);outline-offset:3px}.topbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:.8rem;padding:.7rem max(1rem,calc((100vw - 1320px)/2));border-bottom:1px solid var(--nc-line);background:color-mix(in srgb,var(--nc-bg) 90%,transparent);backdrop-filter:blur(16px)}.brand,.top-actions,.theme-picker,.controls{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}.brand{text-decoration:none;font-weight:600}.brand-mark{display:grid;place-items:center;width:2.3rem;height:2.3rem;border-radius:.7rem;background:linear-gradient(135deg,var(--nc-cyan),var(--nc-blue));color:#06111d;font-size:.78rem;font-weight:800}.btn,.phase-rail button,.domain-chip{min-height:2.6rem;padding:.55rem .8rem;border:1px solid var(--nc-line);border-radius:.75rem;background:var(--nc-surface);color:var(--nc-fg);cursor:pointer;text-decoration:none}.btn:hover,.phase-rail button:hover,.domain-chip:hover{border-color:var(--nc-cyan)}.btn-primary,.btn[aria-pressed="true"],.domain-chip[aria-pressed="true"]{border-color:var(--nc-cyan);background:color-mix(in srgb,var(--nc-cyan) 18%,var(--nc-surface))}.page{width:min(1320px,calc(100% - 2rem));margin:auto;padding:clamp(1.5rem,4vw,3.6rem) 0 4rem}.hero{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:2rem;align-items:end;padding-bottom:1.6rem;border-bottom:1px solid var(--nc-line)}.eyebrow{margin:0 0 .65rem;color:var(--nc-cyan);font:700 .8rem/1.2 ui-monospace,monospace;letter-spacing:.09em;text-transform:uppercase}.hero h1{max-width:850px;margin:0;font-size:clamp(2.2rem,5.5vw,5rem);font-weight:650;line-height:1.04;letter-spacing:-.045em}.hero p:not(.eyebrow){max-width:850px;margin:1rem 0 0;color:var(--nc-muted);font-size:clamp(1rem,1.8vw,1.2rem);line-height:1.65}.hero-note{padding:1.1rem 1.2rem;border:1px solid var(--nc-gold);border-radius:1rem;background:color-mix(in srgb,var(--nc-gold) 9%,var(--nc-surface));color:var(--nc-fg);font:.88rem/1.65 ui-monospace,monospace}.model-map{margin:1.4rem 0;padding:1.25rem;border:1px solid var(--nc-line);border-radius:1rem;background:var(--nc-surface);box-shadow:var(--nc-shadow)}.section-head{display:flex;justify-content:space-between;gap:1rem;align-items:baseline;margin-bottom:1rem}.section-head h2{margin:0;font-size:clamp(1.25rem,2.5vw,1.8rem);font-weight:550}.section-head span{color:var(--nc-muted);font:.75rem/1.3 ui-monospace,monospace;text-transform:uppercase}.phase-rail{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:.45rem;margin:0;padding:0;list-style:none}.phase-rail button{width:100%;min-height:5.8rem;text-align:left}.phase-rail button span{display:block;margin-bottom:.4rem;color:var(--nc-cyan);font:700 .75rem/1 ui-monospace,monospace}.phase-rail button strong{display:block;font-size:.82rem;line-height:1.3;font-weight:550}.phase-rail button[aria-current="step"]{border-color:var(--nc-cyan);background:linear-gradient(155deg,color-mix(in srgb,var(--nc-cyan) 18%,var(--nc-surface)),var(--nc-surface))}.transport{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin:1rem 0 .6rem}.clock{display:flex;gap:.6rem;align-items:center;color:var(--nc-muted)}.clock strong{color:var(--nc-fg)}.progress{height:.58rem;overflow:hidden;border-radius:999px;background:var(--nc-soft)}.progress-bar{height:100%;width:0;background:linear-gradient(90deg,var(--nc-cyan),var(--nc-blue),var(--nc-gold));transition:width 300ms ease}.journey{display:grid;grid-template-columns:minmax(290px,.8fr) minmax(0,1.2fr);gap:1rem;margin-top:1rem}.phase-copy,.structure-panel{padding:1.25rem;border:1px solid var(--nc-line);border-radius:1rem;background:var(--nc-card);box-shadow:var(--nc-shadow)}.phase-copy{border-top:4px solid var(--nc-cyan)}.phase-copy h2{margin:0;font-size:clamp(1.45rem,3vw,2.4rem);line-height:1.12;font-weight:600}.phase-copy .micro{margin:.55rem 0 1.2rem;color:var(--nc-cyan);font:.78rem/1.3 ui-monospace,monospace;text-transform:uppercase}.detail-grid{display:grid;gap:.7rem}.detail{padding:.8rem;border-radius:.7rem;background:color-mix(in srgb,var(--nc-surface) 78%,transparent)}.detail span{display:block;margin-bottom:.3rem;color:var(--nc-gold);font:700 .72rem/1.2 ui-monospace,monospace;text-transform:uppercase}.detail p{margin:0;line-height:1.55}.structure-panel{display:flex;flex-direction:column;min-height:100%}.structure-head{display:flex;justify-content:space-between;gap:1rem;align-items:start}.structure-head h3{margin:0;font-size:1.1rem;font-weight:550}.structure-head p{margin:.3rem 0 0;color:var(--nc-muted);font-size:.88rem}.structure-flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.8rem;align-items:stretch;margin:auto 0;padding:1.5rem 0}.structure-node{position:relative;display:flex;flex-direction:column;justify-content:center;min-height:8rem;padding:1rem;border:1px solid var(--nc-cyan);border-radius:.85rem;background:linear-gradient(155deg,color-mix(in srgb,var(--nc-cyan) 15%,var(--nc-card)),var(--nc-card))}.structure-node:nth-child(2){border-color:var(--nc-blue);background:linear-gradient(155deg,color-mix(in srgb,var(--nc-blue) 14%,var(--nc-card)),var(--nc-card))}.structure-node:nth-child(3){border-color:var(--nc-gold);background:linear-gradient(155deg,color-mix(in srgb,var(--nc-gold) 14%,var(--nc-card)),var(--nc-card))}.structure-node strong{font-size:1.05rem}.structure-node small{margin-top:.45rem;color:var(--nc-muted);line-height:1.4}.structure-node:not(:last-child)::after{content:'→';position:absolute;right:-.68rem;top:50%;z-index:2;color:var(--nc-cyan);font-size:1.4rem;transform:translateY(-50%)}.structure-node:nth-child(2)::after{color:var(--nc-blue)}.structure-foot{margin-top:auto;padding-top:1rem;border-top:1px solid var(--nc-line);color:var(--nc-muted);font:.8rem/1.5 ui-monospace,monospace}.domains{margin-top:1.2rem;padding:1.25rem;border:1px solid var(--nc-line);border-radius:1rem;background:var(--nc-surface);box-shadow:var(--nc-shadow)}.domain-controls{display:flex;gap:.5rem;flex-wrap:wrap}.domain-chip{border-radius:999px}.domain-panel{display:grid;grid-template-columns:minmax(0,.7fr) minmax(0,1.3fr);gap:1rem;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--nc-line)}.domain-panel h3{margin:0;font-size:clamp(1.3rem,2.5vw,2rem);font-weight:600}.domain-panel .discipline{margin:.35rem 0 1rem;color:var(--nc-muted)}.domain-visual{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem}.domain-stat{padding:.85rem;border-left:3px solid var(--nc-blue);background:var(--nc-card)}.domain-stat span{display:block;margin-bottom:.3rem;color:var(--nc-cyan);font:700 .7rem/1.2 ui-monospace,monospace;text-transform:uppercase}.domain-stat p{margin:0;line-height:1.45}.domain-question{grid-column:1 / -1;margin:0;padding:.9rem 1rem;border:1px solid var(--nc-gold);border-radius:.7rem;color:var(--nc-fg);background:color-mix(in srgb,var(--nc-gold) 8%,var(--nc-card))}.usage{display:grid;grid-template-columns:minmax(230px,.65fr) minmax(0,1.35fr);gap:1rem;margin-top:1.2rem;padding:1.25rem;border:1px solid var(--nc-line);border-radius:1rem;background:var(--nc-card)}.usage h2{margin:0;font-size:1.25rem;font-weight:550}.usage p{margin:.45rem 0 0;color:var(--nc-muted);line-height:1.5}.usage-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem;margin:0;padding:0;list-style:none}.usage-list li{padding:.7rem .8rem;border-radius:.65rem;background:var(--nc-surface);color:var(--nc-fg)}.boundary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin-top:1.2rem}.boundary-card{padding:1.1rem;border:1px solid var(--nc-line);border-radius:1rem;background:var(--nc-surface)}.boundary-card:first-child{border-color:var(--nc-green)}.boundary-card:last-child{border-color:var(--nc-pink)}.boundary-card strong{display:block;margin-bottom:.4rem}.boundary-card p{margin:0;color:var(--nc-muted);line-height:1.6}.provenance{margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--nc-line);color:var(--nc-muted);font-size:.9rem}.provenance a{margin-inline-end:1rem;color:var(--nc-fg)}
    @media(max-width:980px){.hero{grid-template-columns:1fr}.phase-rail{grid-template-columns:repeat(4,minmax(0,1fr))}.journey,.domain-panel,.usage{grid-template-columns:1fr}.hero-note{max-width:none}}
    @media(max-width:620px){.topbar{align-items:flex-start}.top-actions>a:first-child{display:none}.page{width:min(100% - 1rem,1320px)}.phase-rail{grid-template-columns:repeat(2,minmax(0,1fr))}.structure-flow,.domain-visual,.usage-list,.boundary{grid-template-columns:1fr}.structure-node:not(:last-child)::after{right:auto;left:50%;top:auto;bottom:-1.35rem;transform:translateX(-50%) rotate(90deg)}.structure-flow{gap:1.45rem}.domain-chip{flex:1 1 auto}.transport{align-items:flex-start;flex-direction:column}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
  </style>
</head>
<body>
  <nav class="topbar" aria-label="bluetape4k visual companion"><a class="brand" href="${routePrefix}/visual-companions/"><span class="brand-mark" aria-hidden="true">B4K</span><span>${copy.catalog}</span></a><div class="top-actions"><a class="btn" href="${companion.manual[locale]}">${copy.manual}</a><a class="btn" href="${otherPrefix}/visual-companions/${companion.repository}/${companion.slug}/" hreflang="${other}">${copy.language}</a><div class="theme-picker" aria-label="Theme"><button class="btn" type="button" data-theme-button="auto">Auto</button><button class="btn" type="button" data-theme-button="light">Light</button><button class="btn" type="button" data-theme-button="dark">Dark</button></div></div></nav>
  <main class="page">
    <header class="hero"><div><p class="eyebrow">#426 · bluetape4k-projects · 2.0.0 · ${copy.parent}</p><h1>${esc(pick(companion.title, locale))}</h1><p>${esc(pick(companion.summary, locale))}</p></div><aside class="hero-note"><strong>${copy.classic}</strong><br>${esc(model.model.classic)}<br><br><strong>${copy.enhanced}</strong><br>${esc(model.model.enhanced)}</aside></header>
    <section class="model-map" aria-labelledby="phase-title"><div class="section-head"><h2 id="phase-title">${copy.phases}</h2><span>${copy.step} <strong data-step-label>1 / 7</strong></span></div><ol class="phase-rail">${phaseButtons}</ol><div class="transport"><div class="controls" aria-label="Playback controls"><button type="button" class="btn" data-action="reset">${copy.reset}</button><button type="button" class="btn btn-primary" data-action="play" aria-pressed="false">${copy.play}</button><button type="button" class="btn" data-action="next">${copy.next}</button></div><div class="clock"><span>${copy.progress}</span><strong data-phase-name></strong></div></div><div class="progress" role="progressbar" aria-label="${copy.progress}" aria-valuenow="1" aria-valuemin="1" aria-valuemax="7"><div class="progress-bar"></div></div></section>
    <div id="bt4k-issue-426" data-phase="container" data-domain="weather-climate">
      <section class="journey" aria-live="polite"><article class="phase-copy"><p class="micro">${copy.question}</p><h2 data-phase-title></h2><div class="detail-grid"><div class="detail"><span>${copy.question}</span><p data-phase-question></p></div><div class="detail"><span>${copy.example}</span><p data-phase-example></p></div><div class="detail"><span>${copy.why}</span><p data-phase-reason></p></div><div class="detail"><span>${copy.result}</span><p data-phase-result></p></div></div></article><article class="structure-panel"><div class="structure-head"><div><h3 data-structure-title></h3><p>${esc(model.model.contract)}</p></div><span class="micro">${copy.phase}</span></div><div class="structure-flow" data-structure-flow></div><p class="structure-foot" data-structure-foot></p></article></section>
      <section class="domains" aria-labelledby="domain-title"><div class="section-head"><h2 id="domain-title">${copy.domains}</h2><span>${copy.domainQuestion}</span></div><div class="domain-controls" aria-label="${copy.domains}">${domainButtons}</div><div class="domain-panel" aria-live="polite"><div><h3 data-domain-label></h3><p class="discipline" data-domain-discipline></p><p class="domain-question" data-domain-question></p></div><div class="domain-visual"><div class="domain-stat"><span>${copy.shape}</span><p data-domain-shape></p></div><div class="domain-stat"><span>${copy.variables}</span><p data-domain-variables></p></div><div class="domain-stat"><span>${copy.output}</span><p data-domain-output></p></div></div></div></section>
      <section class="usage"><div><h2>${copy.use}</h2><p>${esc(model.model.contract)}</p></div><ol class="usage-list">${model.usage.map((value) => `<li>${esc(value)}</li>`).join('')}</ol></section>
      <section class="boundary"><article class="boundary-card"><strong>${esc(model.currentImplementation.title)}</strong><p>${esc(model.currentImplementation.detail)}</p></article><article class="boundary-card"><strong>${copy.boundary}</strong><p>${esc(model.currentImplementation.boundary)}</p></article></section>
    </div>
    <footer class="provenance"><strong>${copy.evidence}</strong><br><a href="https://github.com/bluetape4k/bluetape4k.github.io/issues/426">${copy.issue} #426</a><a href="https://github.com/bluetape4k/bluetape4k.github.io/issues/418">${copy.parent}</a>${companion.sources.map((source) => `<a href="${source.url}">${esc(source.label)}</a>`).join('')}</footer>
  </main>
  <script>
    (() => {
      const root = document.getElementById('bt4k-issue-426');
      const model = ${scriptJson(model)};
      const labels = ${scriptJson({ play: copy.play, pause: copy.pause })};
      let phaseIndex = 0;
      let domainId = model.domains[0].id;
      let timer = null;
      const playButton = root.parentElement.querySelector('[data-action="play"]');
      const progress = root.parentElement.querySelector('.progress');
      const progressBar = root.parentElement.querySelector('.progress-bar');
      const phase = () => model.phases[phaseIndex];
      const visual = () => model.visuals[phaseIndex];
      const domain = () => model.domains.find((value) => value.id === domainId);
      const stop = () => { if (timer) clearInterval(timer); timer = null; playButton.textContent = labels.play; playButton.setAttribute('aria-pressed', 'false'); };
      const renderStructure = () => {
        const current = visual();
        root.querySelector('[data-structure-flow]').innerHTML = current.nodes.map((node) => '<div class="structure-node" data-node="' + node.id + '"><strong>' + node.label + '</strong><small>' + node.detail + '</small></div>').join('');
        root.querySelector('[data-structure-title]').textContent = phase().title;
        root.querySelector('[data-structure-foot]').textContent = current.phase === 'container' ? model.model.enhanced : phase().result;
      };
      const renderDomain = () => {
        const current = domain();
        root.querySelectorAll('[data-domain-button]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.domainButton === current.id)));
        root.querySelector('[data-domain-label]').textContent = current.label;
        root.querySelector('[data-domain-discipline]').textContent = current.discipline;
        root.querySelector('[data-domain-question]').textContent = current.question;
        root.querySelector('[data-domain-shape]').textContent = current.shape;
        root.querySelector('[data-domain-variables]').textContent = current.variables;
        root.querySelector('[data-domain-output]').textContent = current.output;
      };
      const render = () => {
        const current = phase();
        root.dataset.phase = current.id;
        root.querySelector('[data-phase-title]').textContent = current.title;
        root.querySelector('[data-phase-question]').textContent = current.question;
        root.querySelector('[data-phase-example]').textContent = current.example;
        root.querySelector('[data-phase-reason]').textContent = current.reason;
        root.querySelector('[data-phase-result]').textContent = current.result;
        root.parentElement.querySelectorAll('[data-phase-button]').forEach((button, index) => button.setAttribute('aria-current', index === phaseIndex ? 'step' : 'false'));
        root.parentElement.querySelector('[data-step-label]').textContent = (phaseIndex + 1) + ' / ' + model.phases.length;
        root.parentElement.querySelector('[data-phase-name]').textContent = current.title;
        progress.setAttribute('aria-valuenow', String(phaseIndex + 1));
        progressBar.style.width = ((phaseIndex + 1) / model.phases.length * 100) + '%';
        renderStructure();
        renderDomain();
        if (phaseIndex === model.phases.length - 1) stop();
      };
      root.parentElement.querySelectorAll('[data-phase-button]').forEach((button, index) => button.addEventListener('click', () => { stop(); phaseIndex = index; render(); }));
      root.querySelectorAll('[data-domain-button]').forEach((button) => button.addEventListener('click', () => { domainId = button.dataset.domainButton; renderDomain(); }));
      root.parentElement.querySelector('[data-action="reset"]').addEventListener('click', () => { stop(); phaseIndex = 0; render(); });
      root.parentElement.querySelector('[data-action="next"]').addEventListener('click', () => { stop(); phaseIndex = (phaseIndex + 1) % model.phases.length; render(); });
      playButton.addEventListener('click', () => { if (timer) { stop(); return; } if (phaseIndex === model.phases.length - 1) phaseIndex = 0; playButton.textContent = labels.pause; playButton.setAttribute('aria-pressed', 'true'); render(); timer = setInterval(() => { phaseIndex += 1; render(); }, 2100); });
      document.querySelectorAll('[data-theme-button]').forEach((button) => button.addEventListener('click', () => { const theme = button.dataset.themeButton; if (theme === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = theme; }));
      render();
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
    if (actual !== expected) { console.error(`OUT_OF_DATE ${output}`); mismatches += 1; }
  } else {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, expected);
    console.log(`WROTE ${output}`);
  }
}
if (mismatches) process.exitCode = 1;
