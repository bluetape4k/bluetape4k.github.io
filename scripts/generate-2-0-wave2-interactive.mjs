#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

import { awsStreamsCompanion as companion } from '../src/data/visual-companions/wave2-aws-streams.mjs';

const root = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const pick = (value, locale) => value[locale];
const escapeScript = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

function localizedModel(locale) {
  return {
    frames: companion.frames.map((frame) => ({
      id: frame.id,
      phase: pick(frame.phase, locale),
      kinesis: Object.fromEntries(Object.entries(frame.kinesis).map(([key, value]) => [key, pick(value, locale)])),
      dynamodb: Object.fromEntries(Object.entries(frame.dynamodb).map(([key, value]) => [key, pick(value, locale)])),
    })),
    scenarios: companion.scenarios.map((scenario) => ({
      id: scenario.id,
      label: pick(scenario.label, locale),
      summary: pick(scenario.summary, locale),
      failAt: scenario.failAt,
      targets: scenario.targets,
      kinesis: pick(scenario.kinesis, locale),
      dynamodb: pick(scenario.dynamodb, locale),
    })),
  };
}

function render(locale) {
  const ko = locale === 'ko';
  const model = localizedModel(locale);
  const copy = ko ? {
    catalog: '시각 자료', manual: '매뉴얼', language: 'English', auto: '자동', light: '밝게', dark: '어둡게',
    issue: '작업 이슈', evidence: '근거와 범위', reset: '↺ 처음', play: '▶ 재생', pause: 'Ⅱ 일시정지', next: '+1 다음',
    scenario: '실행 시나리오', step: '단계', adapter: 'Adapter 책임', caller: 'Caller 책임',
    action: '현재 동작', guard: '보장되는 계약', nextTransition: '다음 전이',
    progress: 'shard consumer 처리 진행률', lane: 'service 비교 lane', failure: '실패 경계', complete: '완료', waiting: '대기', active: '실행 중',
  } : {
    catalog: 'Visual companions', manual: 'Manual', language: 'KO', auto: 'Auto', light: 'Light', dark: 'Dark',
    issue: 'Delivery issue', evidence: 'Evidence and scope', reset: '↺ Reset', play: '▶ Play', pause: 'Ⅱ Pause', next: '+1 Next',
    scenario: 'Execution scenarios', step: 'Step', adapter: 'Adapter-owned', caller: 'Caller-owned',
    action: 'Current action', guard: 'Guaranteed contract', nextTransition: 'Next transition',
    progress: 'Shard consumer processing progress', lane: 'Service comparison lane', failure: 'Failure boundary', complete: 'Complete', waiting: 'Waiting', active: 'Active',
  };
  const other = ko ? 'en' : 'ko';
  const routePrefix = ko ? '/ko' : '';
  const otherPrefix = ko ? '' : '/ko';
  const stages = model.frames.map((frame, index) => `<li data-stage-index="${index}"><span>${index}</span><strong>${frame.phase}</strong></li>`).join('');
  const scenarios = model.scenarios.map((scenario, index) => `<button type="button" class="btn${index === 0 ? ' btn-primary' : ''}" data-scenario-button="${scenario.id}" aria-pressed="${index === 0}">${scenario.label}</button>`).join('');
  const service = (id) => {
    const serviceCopy = companion.servicesCopy[id];
    return `<section class="service-lane" data-service="${id}" aria-label="${pick(serviceCopy.name, locale)} ${copy.lane}">
      <header><div><span class="service-mark" aria-hidden="true">${id === 'kinesis' ? 'K' : 'D'}</span><div><h3>${pick(serviceCopy.name, locale)}</h3><p>${pick(serviceCopy.concurrency, locale)} · ${pick(serviceCopy.order, locale)}</p></div></div><strong data-lane-status>${copy.waiting}</strong></header>
      <ol class="stage-track">${stages}</ol>
      <div class="lane-detail" aria-live="polite">
        <div><span>${copy.action}</span><p data-detail="action"></p></div>
        <div><span>${copy.guard}</span><p data-detail="guard"></p></div>
        <div><span>${copy.nextTransition}</span><p data-detail="next"></p></div>
      </div>
      <p class="terminal"><strong>${pick(serviceCopy.terminal, locale)}</strong></p>
    </section>`;
  };

  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <link rel="icon" href="data:,">
  <title>${pick(companion.title, locale)} · bluetape4k</title>
  <meta name="description" content="${pick(companion.summary, locale)}">
  <script>
    (() => {
      const key = 'bluetape4k-visual-theme';
      const stored = localStorage.getItem(key) || 'auto';
      const apply = (mode) => {
        const dark = matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.dataset.theme = mode === 'auto' ? (dark ? 'dark' : 'light') : mode;
        document.documentElement.dataset.themeMode = mode;
      };
      apply(stored);
      addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-theme-button]').forEach((button) => {
          button.setAttribute('aria-pressed', String(button.dataset.themeButton === stored));
          button.addEventListener('click', () => {
            localStorage.setItem(key, button.dataset.themeButton);
            apply(button.dataset.themeButton);
            document.querySelectorAll('[data-theme-button]').forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
          });
        });
      });
    })();
  </script>
  <style>
    :root { color-scheme: light dark; --font-sans: Inter, ui-sans-serif, system-ui, sans-serif; --font-mono: "SFMono-Regular", Consolas, monospace; }
    :root[data-theme="light"] { --bg:#f4f7fb; --fg:#152033; --card:#fff; --muted:#5b6b80; --line:#c5d2e2; --primary:#245ea8; --primary-fg:#fff; --kinesis:#2777c7; --ddb:#684fd1; --good:#118065; --warn:#b86612; --bad:#b93447; --soft:#e8eef6; --grid:rgba(39,76,120,.065); }
    :root[data-theme="dark"] { --bg:#07111f; --fg:#e7eef8; --card:#0f1d31; --muted:#a7b8ce; --line:#2e4767; --primary:#78b2ff; --primary-fg:#07111f; --kinesis:#69aff5; --ddb:#b39bff; --good:#58d3a4; --warn:#ffc16b; --bad:#ff8292; --soft:#172840; --grid:rgba(116,155,207,.075); }
    * { box-sizing:border-box; } html { min-width:320px; background:var(--bg); } body { margin:0; color:var(--fg); font:400 16px/1.55 var(--font-sans); background:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px),var(--bg); background-size:30px 30px; }
    button { font:inherit; } code { font-family:var(--font-mono); } a { color:var(--kinesis); } button:focus-visible,a:focus-visible { outline:3px solid var(--primary); outline-offset:3px; }
    .topbar { position:sticky; top:0; z-index:20; display:flex; align-items:center; justify-content:space-between; gap:.75rem; padding:.65rem clamp(1rem,4vw,3.5rem); border-bottom:1px solid var(--line); background:color-mix(in srgb,var(--bg) 88%,transparent); backdrop-filter:blur(16px); }
    .brand,.top-actions,.theme-picker,.controls,.transport { display:flex; align-items:center; gap:.55rem; flex-wrap:wrap; } .brand { color:var(--fg); font-weight:500; text-decoration:none; } .brand-mark { display:grid; width:34px; height:34px; place-items:center; border-radius:10px; color:var(--primary-fg); background:linear-gradient(135deg,var(--primary),var(--ddb)); }
    .btn { min-height:42px; padding:.55rem .9rem; border:1px solid var(--line); border-radius:999px; color:var(--fg); background:var(--card); cursor:pointer; text-decoration:none; } .btn:hover { border-color:var(--primary); } .btn-primary,.btn[aria-pressed="true"] { color:var(--primary-fg); border-color:var(--primary); background:var(--primary); } .btn-ghost { background:transparent; }
    .page { width:min(1260px,calc(100% - 2rem)); margin:0 auto; padding:clamp(1.5rem,4vw,3.5rem) 0 4rem; } .context { margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--line); } .context strong { display:block; } .context p { margin:.25rem 0 0; color:var(--muted); }
    h1,h2,h3 { line-height:1.2; font-weight:500; } h1 { margin:0; font-size:clamp(1.8rem,4vw,3rem); } h2 { margin:0; font-size:clamp(1.5rem,3vw,2.3rem); } h3 { margin:0; font-size:1.08rem; }
    .scenario-deck { margin:1.2rem 0; } .scenario-deck > strong { display:block; margin-bottom:.55rem; } .scenario-note { min-height:3.3rem; margin:.75rem 0; padding:.8rem 0; border-block:1px solid var(--line); color:var(--muted); }
    .transport-deck { display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; } .clock { display:flex; gap:.6rem; align-items:center; color:var(--muted); } .clock strong { color:var(--fg); } .progress { height:.55rem; margin:.7rem 0 1.25rem; overflow:hidden; border-radius:999px; background:var(--soft); } .progress-bar { height:100%; width:0; background:linear-gradient(90deg,var(--kinesis),var(--ddb)); transition:width 360ms ease; }
    .comparison { display:grid; gap:1rem; } .service-lane { padding:1rem; border:1px solid var(--line); border-radius:14px; background:var(--card); box-shadow:0 12px 34px color-mix(in srgb,var(--bg) 75%,transparent); } .service-lane[data-service="kinesis"] { --lane:var(--kinesis); } .service-lane[data-service="dynamodb"] { --lane:var(--ddb); }
    .service-lane > header { display:flex; justify-content:space-between; gap:1rem; align-items:start; } .service-lane > header > div { display:flex; gap:.75rem; align-items:center; } .service-mark { display:grid; width:42px; height:42px; place-items:center; border-radius:12px; color:var(--bg); background:var(--lane); font-weight:500; } .service-lane header p { margin:.2rem 0 0; color:var(--muted); font-family:var(--font-mono); font-size:.78rem; } [data-lane-status] { color:var(--lane); white-space:nowrap; }
    .stage-track { display:grid; grid-template-columns:repeat(9,minmax(0,1fr)); gap:.35rem; margin:1rem 0; padding:0; list-style:none; } .stage-track li { position:relative; min-height:78px; padding:.55rem .35rem; border-top:3px solid var(--line); color:var(--muted); text-align:center; transition:background 180ms ease,border-color 180ms ease; } .stage-track li span { display:grid; width:1.45rem; height:1.45rem; margin:0 auto .35rem; place-items:center; border-radius:50%; background:var(--soft); font:500 .75rem/1 var(--font-mono); } .stage-track li strong { font-size:.72rem; font-weight:500; } .stage-track li.is-done { border-color:var(--good); color:var(--fg); } .stage-track li.is-active { border-color:var(--lane); color:var(--fg); background:color-mix(in srgb,var(--lane) 11%,transparent); } .stage-track li.is-failed { border-color:var(--bad); color:var(--bad); background:color-mix(in srgb,var(--bad) 10%,transparent); }
    .lane-detail { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.8rem; padding-top:.8rem; border-top:1px solid var(--line); } .lane-detail > div { min-width:0; } .lane-detail span { display:block; margin-bottom:.2rem; color:var(--muted); font-size:.76rem; } .lane-detail p { margin:0; } .terminal { margin:.85rem 0 0; color:var(--muted); font-size:.8rem; } .terminal strong { color:var(--fg); }
    .ownership { display:grid; grid-template-columns:1fr auto 1fr; gap:1rem; align-items:center; margin:1.3rem 0; padding-block:1rem; border-block:1px solid var(--line); text-align:center; } .ownership p { margin:.25rem 0 0; color:var(--muted); } .ownership .boundary { color:var(--warn); font-family:var(--font-mono); }
    .provenance { margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--line); color:var(--muted); } .provenance a { margin-inline-end:1rem; }
    @media (max-width:820px) { .stage-track { grid-template-columns:repeat(3,minmax(0,1fr)); } .lane-detail { grid-template-columns:1fr; } .ownership { grid-template-columns:1fr; } .ownership .boundary { writing-mode:initial; } }
    @media (max-width:600px) { .topbar { align-items:flex-start; } .top-actions > a:first-child { display:none; } .page { width:min(100% - 1rem,1260px); } .stage-track { grid-template-columns:repeat(2,minmax(0,1fr)); } .service-lane > header { flex-direction:column; } }
    @media (prefers-reduced-motion:reduce) { *,*::before,*::after { transition-duration:.01ms!important; animation-duration:.01ms!important; scroll-behavior:auto!important; } }
  </style>
</head>
<body>
  <nav class="topbar" aria-label="bluetape4k visual companion">
    <a class="brand" href="${routePrefix}/visual-companions/"><span class="brand-mark" aria-hidden="true">B4K</span><span>${copy.catalog}</span></a>
    <div class="top-actions">
      <a class="btn btn-ghost" href="${companion.manual[locale]}">${copy.manual}</a>
      <a class="btn btn-ghost" href="${otherPrefix}/visual-companions/${companion.repository}/${companion.slug}/" hreflang="${other}">${copy.language}</a>
      <div class="theme-picker" aria-label="Theme"><button type="button" class="btn btn-ghost" data-theme-button="auto">${copy.auto}</button><button type="button" class="btn btn-ghost" data-theme-button="light">${copy.light}</button><button type="button" class="btn btn-ghost" data-theme-button="dark">${copy.dark}</button></div>
    </div>
  </nav>
  <main class="page">
    <header class="context"><strong>#417 · bluetape4k-aws · 1.0.0</strong><h1>${pick(companion.title, locale)}</h1><p>${pick(companion.summary, locale)}</p></header>
    <div id="bt4k-issue-417" data-scenario="normal" data-step="0">
      <section class="scenario-deck"><strong>${copy.scenario}</strong><div class="controls" aria-label="${copy.scenario}">${scenarios}</div><p class="scenario-note" data-scenario-note aria-live="polite"></p></section>
      <div class="transport-deck"><div class="transport" aria-label="Playback controls"><button type="button" class="btn" data-action="reset">${copy.reset}</button><button type="button" class="btn btn-primary" data-action="play" aria-pressed="false">${copy.play}</button><button type="button" class="btn" data-action="next">${copy.next}</button></div><div class="clock"><span>${copy.step}</span><strong data-step-label>0 / 8</strong></div></div>
      <div class="progress" role="progressbar" aria-label="${copy.progress}" aria-valuenow="0" aria-valuemin="0" aria-valuemax="8"><div class="progress-bar"></div></div>
      <div class="comparison">${service('kinesis')}${service('dynamodb')}</div>
      <section class="ownership"><div><strong>${copy.adapter}</strong><p>${pick(companion.ownership.adapter, locale)}</p></div><span class="boundary">│ at-least-once │</span><div><strong>${copy.caller}</strong><p>${pick(companion.ownership.caller, locale)}</p></div></section>
    </div>
    <footer class="provenance"><strong>${copy.evidence}</strong><br><a href="https://github.com/bluetape4k/bluetape4k.github.io/issues/417">${copy.issue} #417</a>${companion.sources.map((source) => `<a href="${source.url}">${source.label}</a>`).join('')}<a href="https://github.com/bluetape4k/bluetape4k-aws/releases/tag/1.0.0">bluetape4k-aws 1.0.0</a></footer>
  </main>
  <script>
    (() => {
      const root = document.getElementById('bt4k-issue-417');
      const model = ${escapeScript(model)};
      const labels = ${escapeScript({ play: copy.play, pause: copy.pause, failure: copy.failure, complete: copy.complete, waiting: copy.waiting, active: copy.active })};
      let scenario = model.scenarios[0];
      let step = 0;
      let timer = null;
      const playButton = root.querySelector('[data-action="play"]');
      const progress = root.querySelector('.progress');
      const progressBar = root.querySelector('.progress-bar');
      const stop = () => { if (timer) clearInterval(timer); timer = null; playButton.textContent = labels.play; playButton.setAttribute('aria-pressed', 'false'); };
      const laneFailed = (service, index) => scenario.failAt !== null && scenario.targets.includes(service) && index >= scenario.failAt;
      const renderLane = (service) => {
        const lane = root.querySelector('[data-service="' + service + '"]');
        const failed = laneFailed(service, step);
        lane.querySelectorAll('[data-stage-index]').forEach((stage, index) => {
          stage.classList.toggle('is-done', index < step && !laneFailed(service, index));
          stage.classList.toggle('is-active', index === step && !failed);
          stage.classList.toggle('is-failed', laneFailed(service, index) && index === Math.min(step, scenario.failAt));
        });
        lane.querySelector('[data-lane-status]').textContent = failed ? labels.failure : step === model.frames.length - 1 ? labels.complete : step === 0 ? labels.waiting : labels.active;
        const detail = model.frames[step][service];
        lane.querySelector('[data-detail="action"]').textContent = failed ? scenario[service] : detail.action;
        lane.querySelector('[data-detail="guard"]').textContent = detail.guard;
        lane.querySelector('[data-detail="next"]').textContent = failed ? scenario.summary : detail.next;
      };
      const render = () => {
        root.dataset.scenario = scenario.id;
        root.dataset.step = String(step);
        root.querySelector('[data-scenario-note]').textContent = scenario.summary;
        root.querySelector('[data-step-label]').textContent = step + ' / ' + (model.frames.length - 1) + ' · ' + model.frames[step].phase;
        progress.setAttribute('aria-valuenow', String(step));
        progressBar.style.width = (step / (model.frames.length - 1) * 100) + '%';
        renderLane('kinesis');
        renderLane('dynamodb');
        if (step === model.frames.length - 1) stop();
      };
      root.querySelectorAll('[data-scenario-button]').forEach((button) => button.addEventListener('click', () => {
        stop();
        scenario = model.scenarios.find((candidate) => candidate.id === button.dataset.scenarioButton);
        step = 0;
        root.querySelectorAll('[data-scenario-button]').forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
        render();
      }));
      root.querySelector('[data-action="reset"]').addEventListener('click', () => { stop(); step = 0; render(); });
      root.querySelector('[data-action="next"]').addEventListener('click', () => { stop(); step = (step + 1) % model.frames.length; render(); });
      playButton.addEventListener('click', () => {
        if (timer) { stop(); return; }
        if (step === model.frames.length - 1) step = 0;
        playButton.textContent = labels.pause;
        playButton.setAttribute('aria-pressed', 'true');
        render();
        timer = setInterval(() => { step += 1; render(); }, 1400);
      });
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
    await mkdir(resolve(output, '..'), { recursive: true });
    await writeFile(output, expected);
    console.log(`WROTE ${output}`);
  }
}
if (mismatches > 0) process.exitCode = 1;
