import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { projectsNetCdfProgressCompanion as companion } from '../src/data/visual-companions/wave2-projects-netcdf-progress.mjs';

const root = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const pick = (value, locale) => value[locale];
const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const scriptJson = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

const labels = {
  en: {
    catalog: 'Visual companions', manual: 'Science manual', language: 'Korean', scenario: 'Choose a scenario',
    reset: 'Reset', play: 'Play', pause: 'Pause', next: 'Next', step: 'Step', progress: 'Workflow progress',
    action: 'What happens', guard: 'Guardrail', nextDetail: 'What follows', budget: 'Budget / state',
    waiting: 'waiting', active: 'active', complete: 'complete', blocked: 'blocked here',
    library: 'Library guarantees', caller: 'Caller owns', evidence: 'Source evidence', issue: 'Delivery issue',
    laneNames: { coordinates: 'Coordinate semantics', boundedImport: 'Bounded import', progress: 'Progress & recovery' },
    laneHints: { coordinates: 'CF axes · CRS · cell identity', boundedImport: 'one worker · two passes · fenced commits', progress: 'durable state · checkpoint · retry gate' },
  },
  ko: {
    catalog: '시각 자료', manual: 'Science 매뉴얼', language: 'English', scenario: '시나리오 선택',
    reset: '처음으로', play: '재생', pause: '일시정지', next: '다음', step: '단계', progress: 'Workflow 진행',
    action: '무엇을 하는가', guard: '무엇을 막는가', nextDetail: '다음에는', budget: '예산 / 상태',
    waiting: '대기', active: '진행 중', complete: '완료', blocked: '여기서 중단',
    library: 'Library가 보장', caller: 'Caller가 소유', evidence: '근거', issue: '제작 이슈',
    laneNames: { coordinates: 'Coordinate 의미론', boundedImport: 'Bounded import', progress: 'Progress와 recovery' },
    laneHints: { coordinates: 'CF axis · CRS · cell identity', boundedImport: 'worker 하나 · two pass · fenced commit', progress: 'durable state · checkpoint · retry gate' },
  },
};

function localizedModel(locale) {
  return {
    lanes: companion.lanes,
    scenarios: companion.scenarios.map((scenario) => ({
      id: scenario.id,
      label: pick(scenario.label, locale),
      summary: pick(scenario.summary, locale),
      outcome: pick(scenario.outcome, locale),
      failAt: scenario.failAt,
      targets: scenario.targets,
    })),
    frames: companion.frames.map((frame) => ({
      id: frame.id,
      phase: pick(frame.phase, locale),
      ...Object.fromEntries(companion.lanes.map((laneName) => [laneName, Object.fromEntries(
        Object.entries(frame[laneName]).map(([key, value]) => [key, pick(value, locale)]),
      )])),
    })),
  };
}

function render(locale) {
  const copy = labels[locale];
  const model = localizedModel(locale);
  const routePrefix = locale === 'ko' ? '/ko' : '';
  const otherPrefix = locale === 'ko' ? '' : '/ko';
  const other = locale === 'ko' ? 'en' : 'ko';
  const scenarioButtons = model.scenarios.map((scenario, index) => `<button type="button" class="chip" data-scenario-button="${scenario.id}" aria-pressed="${index === 0}">${esc(scenario.label)}</button>`).join('');
  const stages = model.frames.map((frame, index) => `<li data-stage-index="${index}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(frame.phase)}</strong></li>`).join('');
  const laneCards = companion.lanes.map((laneName) => `<article class="lane lane-${laneName}" data-lane="${laneName}">
        <header><div><span class="lane-mark" aria-hidden="true">${laneName === 'coordinates' ? 'XY' : laneName === 'boundedImport' ? 'IO' : '↺'}</span><div><h2>${copy.laneNames[laneName]}</h2><p>${copy.laneHints[laneName]}</p></div></div><strong data-lane-status>${copy.waiting}</strong></header>
        <ol class="stage-track">${stages}</ol>
        <div class="details"><section><span>${copy.action}</span><p data-detail="action"></p></section><section><span>${copy.guard}</span><p data-detail="guard"></p></section><section><span>${copy.nextDetail}</span><p data-detail="next"></p></section><section><span>${copy.budget}</span><p data-detail="budget"></p></section></div>
      </article>`).join('');

  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <title>${esc(pick(companion.title, locale))} · bluetape4k</title>
  <style>
    :root{--bg:#07101f;--surface:#0c172a;--card:#101f35;--soft:#182b45;--line:#2e4768;--fg:#f4f7fb;--muted:#a6b6ce;--xy:#55c7e8;--io:#f4b35f;--state:#60d19a;--bad:#f58ca0;--focus:#ffffff;--shadow:0 18px 55px #02071388;color-scheme:dark;font-family:Inter,"Noto Sans KR",system-ui,sans-serif}
    :root[data-theme="light"]{--bg:#eef4fb;--surface:#fff;--card:#f8fbff;--soft:#e5eef8;--line:#b8c9dc;--fg:#10233d;--muted:#536983;--focus:#07101f;--shadow:0 18px 55px #36506a22;color-scheme:light}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0,#15345555,transparent 36rem),var(--bg);color:var(--fg)}button,a{font:inherit}a{color:inherit}.topbar{position:sticky;top:0;z-index:10;display:flex;justify-content:space-between;gap:1rem;align-items:center;padding:.8rem max(1rem,calc((100vw - 1420px)/2));border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(16px)}.brand{display:flex;align-items:center;gap:.65rem;text-decoration:none}.brand-mark{display:grid;place-items:center;width:2.4rem;height:2.4rem;border-radius:.75rem;background:var(--xy);color:#06111e;font-weight:800}.actions,.controls,.transport{display:flex;gap:.45rem;flex-wrap:wrap}.btn,.chip{min-height:2.6rem;padding:.55rem .8rem;border:1px solid var(--line);border-radius:.7rem;background:var(--surface);color:var(--fg);cursor:pointer}.btn:hover,.chip:hover,.btn:focus-visible,.chip:focus-visible{border-color:var(--focus);outline:2px solid transparent}.chip[aria-pressed="true"],.btn-primary{border-color:var(--xy);background:color-mix(in srgb,var(--xy) 20%,var(--surface))}.page{width:min(1420px,calc(100% - 2rem));margin:auto;padding:clamp(1.5rem,4vw,3.5rem) 0 4rem}.hero{display:grid;grid-template-columns:1fr auto;gap:2rem;align-items:end;padding-bottom:1.4rem;border-bottom:1px solid var(--line)}.eyebrow{margin:0 0 .65rem;color:var(--xy);font:700 .82rem/1.2 ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase}h1,h2{margin:0;line-height:1.12}h1{max-width:900px;font-size:clamp(2.1rem,5vw,4.5rem);font-weight:650;letter-spacing:-.04em}.hero p{max-width:920px;margin:1rem 0 0;color:var(--muted);font-size:clamp(1rem,1.8vw,1.22rem);line-height:1.65}.invariant{max-width:340px;padding:1rem 1.1rem;border:1px solid var(--io);border-radius:1rem;background:color-mix(in srgb,var(--io) 9%,var(--surface));font:700 .9rem/1.6 ui-monospace,monospace}.scenario{margin:1.3rem 0;padding:1.2rem;border:1px solid var(--line);border-radius:1rem;background:var(--surface);box-shadow:var(--shadow)}.scenario>strong{display:block;margin-bottom:.75rem}.scenario-note{display:grid;grid-template-columns:1fr auto;gap:1rem;align-items:center;min-height:4rem;margin:.9rem 0 0;padding-top:.9rem;border-top:1px solid var(--line);color:var(--muted)}.scenario-note strong{max-width:440px;color:var(--fg);text-align:right}.transport-deck{display:flex;justify-content:space-between;gap:1rem;align-items:center;margin:1.2rem 0 .6rem}.clock{display:flex;gap:.6rem;align-items:center;color:var(--muted)}.clock strong{color:var(--fg)}.progress{height:.65rem;margin-bottom:1.2rem;border-radius:999px;overflow:hidden;background:var(--soft)}.progress-bar{height:100%;width:0;background:linear-gradient(90deg,var(--xy),var(--io),var(--state));transition:width 320ms ease}.lanes{display:grid;gap:1rem}.lane{--lane:var(--state);padding:1.15rem;border:1px solid var(--line);border-left:4px solid var(--lane);border-radius:1rem;background:var(--card);box-shadow:var(--shadow)}.lane-coordinates{--lane:var(--xy)}.lane-boundedImport{--lane:var(--io)}.lane>header{display:flex;justify-content:space-between;gap:1rem;align-items:start}.lane>header>div{display:flex;gap:.8rem;align-items:center}.lane-mark{display:grid;place-items:center;width:3rem;height:3rem;border-radius:.8rem;background:var(--lane);color:#07101f;font:800 .9rem/1 ui-monospace,monospace}.lane h2{font-size:1.35rem}.lane header p{margin:.3rem 0 0;color:var(--muted);font:.78rem/1.3 ui-monospace,monospace}.lane [data-lane-status]{color:var(--lane);font:.8rem/1.3 ui-monospace,monospace;text-transform:uppercase}.stage-track{display:grid;grid-template-columns:repeat(11,minmax(0,1fr));gap:.3rem;margin:1.1rem 0;padding:0;list-style:none}.stage-track li{min-width:0;padding:.5rem .25rem;border-top:3px solid var(--line);color:var(--muted);text-align:center;transition:background 180ms ease,border 180ms ease}.stage-track span{display:grid;place-items:center;width:1.6rem;height:1.6rem;margin:0 auto .4rem;border-radius:50%;background:var(--soft);font:700 .7rem/1 ui-monospace,monospace}.stage-track strong{display:block;font-size:.68rem;line-height:1.25;overflow-wrap:anywhere}.stage-track .is-done{border-color:var(--state);color:var(--fg)}.stage-track .is-active{border-color:var(--lane);background:color-mix(in srgb,var(--lane) 12%,transparent);color:var(--fg)}.stage-track .is-failed{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 12%,transparent);color:var(--bad)}.details{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.75rem;padding-top:.9rem;border-top:1px solid var(--line)}.details section{padding:.85rem;border-radius:.75rem;background:color-mix(in srgb,var(--surface) 75%,transparent)}.details span{display:block;margin-bottom:.35rem;color:var(--lane);font:700 .72rem/1.2 ui-monospace,monospace;text-transform:uppercase}.details p{margin:0;line-height:1.55}.ownership{display:grid;grid-template-columns:1fr auto 1fr;gap:1rem;align-items:stretch;margin-top:1.3rem}.ownership article{padding:1.15rem;border:1px solid var(--line);border-radius:1rem;background:var(--surface)}.ownership article:first-child{border-color:var(--state)}.ownership article:last-child{border-color:var(--io)}.ownership p{margin:.5rem 0 0;color:var(--muted);line-height:1.6}.boundary{display:grid;place-items:center;color:var(--bad);font:700 .78rem/1.3 ui-monospace,monospace;writing-mode:vertical-rl}.provenance{margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--line);color:var(--muted)}.provenance a{margin-right:1rem;color:var(--fg)}
    @media(max-width:1000px){.stage-track{grid-template-columns:repeat(4,minmax(0,1fr))}.details{grid-template-columns:repeat(2,minmax(0,1fr))}.hero{grid-template-columns:1fr}.invariant{max-width:none}.scenario-note{grid-template-columns:1fr}.scenario-note strong{text-align:left}}
    @media(max-width:650px){.topbar{align-items:flex-start}.actions>a:first-child{display:none}.page{width:min(100% - 1rem,1420px)}.stage-track{grid-template-columns:repeat(2,minmax(0,1fr))}.details,.ownership{grid-template-columns:1fr}.boundary{writing-mode:initial}.transport-deck{align-items:flex-start;flex-direction:column}.lane>header{flex-direction:column}.scenario{padding:.8rem}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
  </style>
</head>
<body>
  <nav class="topbar" aria-label="bluetape4k visual companion"><a class="brand" href="${routePrefix}/visual-companions/"><span class="brand-mark" aria-hidden="true">B4K</span><span>${copy.catalog}</span></a><div class="actions"><a class="btn" href="${companion.manual[locale]}">${copy.manual}</a><a class="btn" href="${otherPrefix}/visual-companions/${companion.repository}/${companion.slug}/" hreflang="${other}">${copy.language}</a><div class="controls" aria-label="Theme"><button class="btn" type="button" data-theme-button="auto">Auto</button><button class="btn" type="button" data-theme-button="light">Light</button><button class="btn" type="button" data-theme-button="dark">Dark</button></div></div></nav>
  <main class="page">
    <header class="hero"><div><p class="eyebrow">#418 · bluetape4k-projects · 2.0.0</p><h1>${esc(pick(companion.title, locale))}</h1><p>${esc(pick(companion.summary, locale))}</p></div><aside class="invariant">≤ 128 MiB owned working set<br>one worker / one DB connection<br>resume = lastSliceIdx + 1</aside></header>
    <div id="bt4k-issue-418" data-scenario="normal-2d" data-step="0">
      <section class="scenario"><strong>${copy.scenario}</strong><div class="controls" aria-label="${copy.scenario}">${scenarioButtons}</div><div class="scenario-note" aria-live="polite"><span data-scenario-note></span><strong data-scenario-outcome></strong></div></section>
      <div class="transport-deck"><div class="transport" aria-label="Playback controls"><button type="button" class="btn" data-action="reset">${copy.reset}</button><button type="button" class="btn btn-primary" data-action="play" aria-pressed="false">${copy.play}</button><button type="button" class="btn" data-action="next">${copy.next}</button></div><div class="clock"><span>${copy.step}</span><strong data-step-label>0 / 10</strong></div></div>
      <div class="progress" role="progressbar" aria-label="${copy.progress}" aria-valuenow="0" aria-valuemin="0" aria-valuemax="10"><div class="progress-bar"></div></div>
      <section class="lanes">${laneCards}</section>
      <section class="ownership"><article><strong>${copy.library}</strong><p>${esc(pick(companion.ownership.library, locale))}</p></article><span class="boundary">│ explicit boundary │</span><article><strong>${copy.caller}</strong><p>${esc(pick(companion.ownership.caller, locale))}</p></article></section>
    </div>
    <footer class="provenance"><strong>${copy.evidence}</strong><br><a href="https://github.com/bluetape4k/bluetape4k.github.io/issues/418">${copy.issue} #418</a>${companion.sources.map((source) => `<a href="${source.url}">${source.label}</a>`).join('')}</footer>
  </main>
  <script>
    (() => {
      const root = document.getElementById('bt4k-issue-418');
      const model = ${scriptJson(model)};
      const labels = ${scriptJson({ play: copy.play, pause: copy.pause, waiting: copy.waiting, active: copy.active, complete: copy.complete, blocked: copy.blocked })};
      let scenario = model.scenarios[0]; let step = 0; let timer = null;
      const playButton = root.querySelector('[data-action="play"]'); const progress = root.querySelector('.progress'); const bar = root.querySelector('.progress-bar');
      const stop = () => { if (timer) clearInterval(timer); timer = null; playButton.textContent = labels.play; playButton.setAttribute('aria-pressed', 'false'); };
      const failed = (laneName, index) => scenario.failAt !== null && scenario.targets.includes(laneName) && index >= scenario.failAt;
      const renderLane = (laneName) => {
        const element = root.querySelector('[data-lane="' + laneName + '"]'); const isFailed = failed(laneName, step);
        element.querySelectorAll('[data-stage-index]').forEach((stage, index) => { stage.classList.toggle('is-done', index < step && !failed(laneName, index)); stage.classList.toggle('is-active', index === step && !isFailed); stage.classList.toggle('is-failed', index === Math.min(step, scenario.failAt) && failed(laneName, index)); });
        element.querySelector('[data-lane-status]').textContent = isFailed ? labels.blocked : step === model.frames.length - 1 ? labels.complete : step === 0 ? labels.waiting : labels.active;
        const detail = model.frames[step][laneName]; for (const field of ['action','guard','next','budget']) element.querySelector('[data-detail="' + field + '"]').textContent = detail[field];
      };
      const render = () => { root.dataset.scenario = scenario.id; root.dataset.step = String(step); root.querySelector('[data-scenario-note]').textContent = scenario.summary; root.querySelector('[data-scenario-outcome]').textContent = scenario.outcome; root.querySelector('[data-step-label]').textContent = step + ' / ' + (model.frames.length - 1) + ' · ' + model.frames[step].phase; progress.setAttribute('aria-valuenow', String(step)); bar.style.width = (step / (model.frames.length - 1) * 100) + '%'; model.lanes.forEach(renderLane); if (step === model.frames.length - 1) stop(); };
      root.querySelectorAll('[data-scenario-button]').forEach((button) => button.addEventListener('click', () => { stop(); scenario = model.scenarios.find(({ id }) => id === button.dataset.scenarioButton); step = 0; root.querySelectorAll('[data-scenario-button]').forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button))); render(); }));
      root.querySelector('[data-action="reset"]').addEventListener('click', () => { stop(); step = 0; render(); });
      root.querySelector('[data-action="next"]').addEventListener('click', () => { stop(); step = (step + 1) % model.frames.length; render(); });
      playButton.addEventListener('click', () => { if (timer) { stop(); return; } if (step === model.frames.length - 1) step = 0; playButton.textContent = labels.pause; playButton.setAttribute('aria-pressed', 'true'); render(); timer = setInterval(() => { step += 1; render(); }, 1700); });
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
