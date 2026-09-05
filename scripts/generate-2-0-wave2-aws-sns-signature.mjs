#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  awsSnsSignatureCompanion as companion,
  buildSnsVerificationStory,
} from '../src/data/visual-companions/wave2-aws-sns-signature.mjs';

const root = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const pick = (value, locale) => typeof value === 'string' ? value : value[locale];
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
    manual: 'AWS manual',
    language: 'Korean',
    auto: 'Auto',
    light: 'Light',
    dark: 'Dark',
    choose: 'Choose a signed SNS story',
    reset: 'Reset',
    play: 'Play',
    pause: 'Pause',
    next: 'Next',
    step: 'Step',
    sequence: 'Security sequence',
    progress: 'Verification progress',
    active: 'active',
    waiting: 'waiting',
    complete: 'verified',
    failed: 'blocked here',
    action: 'What happens',
    guard: 'Guardrail',
    nextDetail: 'What follows',
    signal: 'Visible signal',
    trust: 'Trust boundary',
    policy: 'Policy-owned',
    source: 'Source evidence',
    issue: 'Delivery issue',
    sourceRevision: 'Source revision',
    keyboard: 'Use the step buttons or Left/Right/Home/End. Play advances this offline explanation only.',
    diagram: 'Open static overview',
    nojs: 'JavaScript is disabled. Use the static overview and source contracts below.',
    scroll: 'Scroll horizontally to inspect the full security sequence →',
    outcome: 'Outcome',
    pending: 'Not reached',
    branch: 'Post-verification branch',
  },
  ko: {
    catalog: '시각 자료',
    manual: 'AWS 매뉴얼',
    language: 'English',
    auto: '자동',
    light: '밝게',
    dark: '어둡게',
    choose: '서명된 SNS 시나리오를 선택하세요',
    reset: '처음으로',
    play: '재생',
    pause: '일시정지',
    next: '다음',
    step: '단계',
    sequence: '보안 sequence',
    progress: '검증 진행률',
    active: '진행 중',
    waiting: '대기',
    complete: '검증 완료',
    failed: '여기서 차단',
    action: '무엇을 하는가',
    guard: '보호 계약',
    nextDetail: '다음에는',
    signal: '보이는 신호',
    trust: '신뢰 경계',
    policy: '정책 소유',
    source: '근거',
    issue: '제작 이슈',
    sourceRevision: '소스 revision',
    keyboard: '단계 버튼 또는 Left/Right/Home/End를 사용하세요. 재생은 offline 설명만 진행합니다.',
    diagram: '정적 개요 열기',
    nojs: 'JavaScript가 비활성화되어 있습니다. 정적 개요와 아래 소스 계약을 확인하세요.',
    scroll: '전체 보안 sequence는 가로로 스크롤해서 확인하세요 →',
    outcome: '결과',
    pending: '아직 도달하지 않음',
    branch: '검증 이후 branch',
  },
};

function localizedModel(locale) {
  return {
    participants: companion.participants.map((value) => ({
      id: value.id,
      label: pick(value.label, locale),
      role: pick(value.role, locale),
      tone: value.tone,
    })),
    steps: companion.steps.map((value) => ({
      id: value.id,
      phase: pick(value.phase, locale),
      from: value.from,
      to: value.to,
      tone: value.tone,
      event: pick(value.event, locale),
      action: pick(value.action, locale),
      guard: pick(value.guard, locale),
      next: pick(value.next, locale),
      signal: pick(value.signal, locale),
    })),
    scenarios: companion.scenarios.map((value) => ({
      id: value.id,
      label: pick(value.label, locale),
      summary: pick(value.summary, locale),
      outcome: pick(value.outcome, locale),
      focusAt: value.focusAt,
      failAt: value.failAt,
      terminal: value.terminal,
      failure: value.failure
        ? { at: value.failure.at, code: value.failure.code, text: pick(value.failure.text, locale) }
        : null,
    })),
    stories: Object.fromEntries(companion.scenarios.map((value) => {
      const story = buildSnsVerificationStory(value.id);
      return [value.id, {
        ids: story.ids,
        failure: story.failure
          ? { at: story.failure.at, code: story.failure.code, text: pick(story.failure.text, locale) }
          : null,
        focusAt: story.focusAt,
        terminal: story.terminal,
        networkStarted: story.networkStarted,
        verified: story.verified,
        dispatched: story.dispatched,
        confirmationReached: story.confirmationReached,
        failClosed: story.failClosed,
      }];
    })),
  };
}

function participantHeaders(model) {
  return model.participants.map((value) => `<article class="participant participant-${value.tone}" data-participant="${value.id}"><strong>${esc(value.label)}</strong><span>${esc(value.role)}</span></article>`).join('');
}

function sequenceRows(model, copy) {
  return model.steps.map((value, index) => `<li class="message-row tone-${value.tone}" data-step-index="${index}" data-from="${value.from}" data-to="${value.to}">
      <button type="button" class="step-pill" data-step-button="${index}" aria-label="${esc(copy.step)} ${index + 1}: ${esc(value.phase)}"><span>${String(index + 1).padStart(2, '0')}</span></button>
      <div class="message-track"><span class="message-origin" aria-hidden="true"></span><span class="message-line" aria-hidden="true"></span><span class="message-head" aria-hidden="true">➤</span><span class="message-label">${esc(value.event)}</span></div>
      <div class="message-meta"><strong>${esc(value.phase)}</strong><span data-row-state>${copy.waiting}</span></div>
    </li>`).join('');
}

function render(locale) {
  const copy = labels[locale];
  const model = localizedModel(locale);
  const routePrefix = locale === 'ko' ? '/ko' : '';
  const otherPrefix = locale === 'ko' ? '' : '/ko';
  const other = locale === 'ko' ? 'en' : 'ko';
  const route = `/visual-companions/${companion.repository}/${companion.slug}/`;
  const asset = `/assets/visual-companions/wave2/${companion.slug}-${locale}`;
  const scenarioButtons = model.scenarios.map((value, index) => `<button type="button" class="scenario-chip" data-scenario-button="${value.id}" aria-pressed="${index === 0}">${esc(value.label)}</button>`).join('');

  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <meta name="description" content="${esc(pick(companion.summary, locale))}">
  <link rel="icon" href="data:,">
  <title>${esc(pick(companion.title, locale))} · bluetape4k</title>
  <style>
    :root{--bg:#0b111b;--surface:#111a28;--card:#172437;--soft:#20324a;--line:#3a506b;--fg:#f6f8fb;--muted:#aebed2;--blue:#78a9d8;--teal:#65c5bf;--amber:#cda36c;--rose:#d88796;--good:#9ab873;--focus:#f2d18a;--shadow:0 18px 48px #02060d88;color-scheme:dark;font-family:Inter,"Noto Sans KR",system-ui,sans-serif}
    :root[data-theme="light"]{--bg:#f1f5f8;--surface:#fff;--card:#f7fafc;--soft:#e4edf3;--line:#b6c8d8;--fg:#17263a;--muted:#526b84;--blue:#477ba8;--teal:#277f7d;--amber:#8b5f26;--rose:#a54358;--good:#5b7b3a;--focus:#7c4d00;--shadow:0 16px 42px #35536a22;color-scheme:light}
    @media(prefers-color-scheme:light){:root:not([data-theme]){--bg:#f1f5f8;--surface:#fff;--card:#f7fafc;--soft:#e4edf3;--line:#b6c8d8;--fg:#17263a;--muted:#526b84;--blue:#477ba8;--teal:#277f7d;--amber:#8b5f26;--rose:#a54358;--good:#5b7b3a;--focus:#7c4d00;--shadow:0 16px 42px #35536a22;color-scheme:light}}
    *{box-sizing:border-box}html{min-width:320px;background:var(--bg);scroll-behavior:smooth}body{margin:0;color:var(--fg);background:radial-gradient(circle at 15% 0,#24496666,transparent 38rem),var(--bg);font:400 16px/1.55 Inter,"Noto Sans KR",system-ui,sans-serif}button,a{font:inherit}button:focus-visible,a:focus-visible{outline:3px solid var(--focus);outline-offset:3px}a{color:inherit}.scroll-hint{display:none}.topbar{position:sticky;top:0;z-index:20;display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.7rem max(1rem,calc((100vw - 1460px)/2));border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(16px)}.brand,.top-actions,.theme-picker,.controls{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}.brand{text-decoration:none;font-weight:650}.brand-mark{display:grid;place-items:center;width:2.4rem;height:2.4rem;border:1px solid var(--teal);border-radius:.75rem;background:color-mix(in srgb,var(--teal) 22%,var(--surface));font:800 .78rem/1 ui-monospace,monospace}.btn,.scenario-chip,.step-pill{min-height:2.6rem;padding:.55rem .85rem;border:1px solid var(--line);border-radius:.72rem;background:var(--surface);color:var(--fg);cursor:pointer;text-decoration:none}.btn:hover,.scenario-chip:hover,.step-pill:hover{border-color:var(--focus)}.btn-primary,.scenario-chip[aria-pressed="true"]{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 18%,var(--surface))}.page{width:min(1460px,calc(100% - 2rem));margin:auto;padding:clamp(1.5rem,4vw,3.8rem) 0 4rem}.hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,350px);gap:2rem;align-items:end;padding-bottom:1.6rem;border-bottom:1px solid var(--line)}.eyebrow{margin:0 0 .6rem;color:var(--teal);font:700 .8rem/1.2 ui-monospace,monospace;letter-spacing:.09em;text-transform:uppercase}.hero h1{max-width:970px;margin:0;font-size:clamp(2.2rem,5.7vw,5rem);font-weight:650;line-height:1.02;letter-spacing:-.045em}.hero p:not(.eyebrow){max-width:980px;margin:1rem 0 0;color:var(--muted);font-size:clamp(1rem,1.7vw,1.2rem);line-height:1.65}.invariant{padding:1.15rem 1.2rem;border:1px solid var(--amber);border-radius:1rem;background:color-mix(in srgb,var(--amber) 9%,var(--surface));font:.86rem/1.65 ui-monospace,monospace}.invariant strong{color:var(--fg)}.scenario-deck,.sequence-panel,.detail-panel,.ownership{margin-top:1.25rem;padding:1.25rem;border:1px solid var(--line);border-radius:1rem;background:var(--surface);box-shadow:var(--shadow)}.section-head{display:flex;justify-content:space-between;gap:1rem;align-items:baseline;margin-bottom:.85rem}.section-head h2{margin:0;font-size:clamp(1.25rem,2.5vw,1.75rem);font-weight:580}.section-head span{color:var(--muted);font:.75rem/1.3 ui-monospace,monospace;text-transform:uppercase}.scenario-controls{display:flex;gap:.5rem;flex-wrap:wrap}.scenario-chip{border-radius:999px}.scenario-note{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,.65fr);gap:1rem;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--line);color:var(--muted)}.scenario-note strong{color:var(--fg);text-align:right}.transport{display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin:1.2rem 0 .65rem}.transport-buttons{display:flex;gap:.45rem;flex-wrap:wrap}.clock{display:flex;gap:.55rem;align-items:center;color:var(--muted)}.clock strong{color:var(--fg)}.progress{height:.58rem;overflow:hidden;border-radius:999px;background:var(--soft)}.progress-bar{height:100%;width:0;background:linear-gradient(90deg,var(--blue),var(--teal),var(--good),var(--amber));transition:width 240ms ease}.sequence-panel{overflow:hidden}.sequence-board{min-width:930px}.participant-grid{display:grid;grid-template-columns:88px repeat(5,minmax(145px,1fr));gap:.5rem;align-items:stretch}.participant-spacer{border-bottom:1px solid var(--line)}.participant{min-height:78px;padding:.8rem;border:1px solid var(--blue);border-radius:.75rem;background:color-mix(in srgb,var(--blue) 13%,var(--card));text-align:center}.participant strong{display:block;font-size:.92rem;line-height:1.25}.participant span{display:block;margin-top:.35rem;color:var(--muted);font:.72rem/1.35 ui-monospace,monospace}.participant-policy{border-color:var(--amber);background:color-mix(in srgb,var(--amber) 13%,var(--card))}.participant-manager{border-color:var(--rose);background:color-mix(in srgb,var(--rose) 10%,var(--card))}.participant-application{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 13%,var(--card))}.life-grid{display:grid;grid-template-columns:88px repeat(5,minmax(145px,1fr));gap:.5rem;margin-top:.5rem}.life-spacer{border-right:1px solid transparent}.life{position:relative;min-height:23px;border-left:2px dashed color-mix(in srgb,var(--line) 85%,transparent);border-right:2px dashed color-mix(in srgb,var(--line) 85%,transparent)}.life::before{content:"";position:absolute;left:50%;top:-.5rem;bottom:-.5rem;border-left:1px dashed color-mix(in srgb,var(--line) 70%,transparent)}.message-list{display:grid;gap:.45rem;margin:.45rem 0 0;padding:0;list-style:none}.message-row{display:grid;grid-template-columns:88px minmax(0,1fr) 195px;gap:.5rem;align-items:center;min-height:82px;padding:.35rem 0;border-top:1px solid color-mix(in srgb,var(--line) 66%,transparent);transition:opacity 160ms ease,transform 160ms ease,background 160ms ease}.message-row:first-child{border-top:0}.message-row.is-muted{opacity:.48}.message-row.is-active{opacity:1;transform:translateX(4px)}.message-row.is-failed{opacity:1}.step-pill{display:grid;place-items:center;width:3.1rem;min-height:3.1rem;padding:0;border-radius:50%;justify-self:center;font:700 .82rem/1 ui-monospace,monospace}.is-active .step-pill{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 18%,var(--surface))}.is-done .step-pill{border-color:var(--good);color:var(--good)}.is-failed .step-pill{border-color:var(--rose);background:color-mix(in srgb,var(--rose) 16%,var(--surface));color:var(--rose)}.message-track{position:relative;display:grid;grid-template-columns:58px minmax(80px,1fr) 34px;align-items:center;min-height:62px}.message-line{height:3px;background:var(--blue);grid-column:1 / -1;grid-row:1;border-radius:99px}.message-head{z-index:1;grid-column:3;grid-row:1;color:var(--blue);font-size:1.25rem;line-height:1;text-align:right}.message-origin{z-index:1;grid-column:1;grid-row:1;width:13px;height:13px;border:3px solid var(--blue);border-radius:50%;background:var(--surface)}.message-label{z-index:2;grid-column:2;grid-row:1;justify-self:center;max-width:90%;padding:.35rem .65rem;border:1px solid var(--blue);border-radius:.55rem;background:var(--surface);color:var(--fg);font:.78rem/1.35 ui-monospace,monospace;text-align:center}.tone-policy .message-line,.tone-policy .message-head,.tone-policy .message-origin,.tone-policy .message-label{color:var(--amber);border-color:var(--amber);background-color:color-mix(in srgb,var(--amber) 6%,var(--surface))}.tone-policy .message-line{background:var(--amber)}.tone-certificate .message-line,.tone-certificate .message-head,.tone-certificate .message-origin,.tone-certificate .message-label{color:var(--rose);border-color:var(--rose);background-color:color-mix(in srgb,var(--rose) 6%,var(--surface))}.tone-certificate .message-line{background:var(--rose)}.tone-signature .message-line,.tone-signature .message-head,.tone-signature .message-origin,.tone-signature .message-label{color:var(--teal);border-color:var(--teal);background-color:color-mix(in srgb,var(--teal) 6%,var(--surface))}.tone-signature .message-line{background:var(--teal)}.tone-success .message-line,.tone-success .message-head,.tone-success .message-origin,.tone-success .message-label{color:var(--good);border-color:var(--good);background-color:color-mix(in srgb,var(--good) 6%,var(--surface))}.tone-success .message-line{background:var(--good)}.message-meta{align-self:stretch;display:flex;flex-direction:column;justify-content:center;padding:.4rem .6rem;border-left:1px solid var(--line)}.message-meta strong{font-size:.8rem;line-height:1.3}.message-meta span{margin-top:.25rem;color:var(--muted);font:.7rem/1.2 ui-monospace,monospace;text-transform:uppercase}.is-active .message-meta span{color:var(--teal)}.is-failed .message-meta span{color:var(--rose)}.detail-layout{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:1rem}.detail-panel{margin-top:1.25rem}.detail-title{display:flex;justify-content:space-between;gap:1rem;align-items:start}.detail-title h2{margin:0;font-size:clamp(1.45rem,3vw,2.2rem);font-weight:600;line-height:1.12}.detail-title span{color:var(--teal);font:700 .75rem/1.2 ui-monospace,monospace;text-transform:uppercase}.detail-event{margin:.65rem 0 1rem;padding:.75rem 1rem;border-left:3px solid var(--teal);background:color-mix(in srgb,var(--teal) 8%,var(--card));font:700 .88rem/1.5 ui-monospace,monospace}.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem}.detail-card{padding:.85rem;border-radius:.7rem;background:var(--card)}.detail-card span{display:block;margin-bottom:.35rem;color:var(--amber);font:700 .72rem/1.2 ui-monospace,monospace;text-transform:uppercase}.detail-card p{margin:0;line-height:1.55}.flow-notes{display:grid;gap:.7rem}.flow-note{padding:.95rem 1rem;border:1px solid var(--line);border-left:3px solid var(--amber);border-radius:.75rem;background:var(--card)}.flow-note:last-child{border-left-color:var(--teal)}.flow-note strong{display:block;font-size:.9rem}.flow-note p{margin:.35rem 0 0;color:var(--muted);line-height:1.55}.ownership{display:grid;grid-template-columns:1fr auto 1fr;gap:1rem;align-items:stretch}.ownership-card{padding:1rem;border:1px solid var(--line);border-radius:.8rem;background:var(--card)}.ownership-card:first-child{border-color:var(--amber)}.ownership-card:last-child{border-color:var(--teal)}.ownership-card strong{display:block}.ownership-card p{margin:.45rem 0 0;color:var(--muted);line-height:1.6}.boundary{display:grid;place-items:center;color:var(--rose);font:700 .76rem/1.2 ui-monospace,monospace;writing-mode:vertical-rl}.provenance{margin-top:1.4rem;padding-top:1rem;border-top:1px solid var(--line);color:var(--muted);font-size:.9rem}.provenance a{display:inline-block;margin:.25rem 1rem .25rem 0;color:var(--fg)}
    @media(max-width:980px){.hero{grid-template-columns:1fr}.invariant{max-width:none}.scenario-note{grid-template-columns:1fr}.scenario-note strong{text-align:left}.detail-layout{grid-template-columns:1fr}}
    @media(max-width:650px){.hero h1{font-size:clamp(2rem,9.6vw,2.6rem);word-break:keep-all}.scroll-hint{display:block;position:sticky;left:0;width:max-content;max-width:calc(100vw - 2rem);margin:.7rem 0;color:var(--muted);font:700 .72rem/1.4 ui-monospace,monospace}.topbar{align-items:flex-start}.top-actions>a:first-child{display:none}.page{width:min(100% - 1rem,1460px)}.sequence-panel{overflow-x:auto;padding-inline:.75rem}.sequence-board{min-width:760px}.participant-grid,.life-grid{grid-template-columns:66px repeat(5,minmax(132px,1fr))}.message-row{grid-template-columns:66px minmax(0,1fr) 130px}.message-track{grid-template-columns:42px minmax(70px,1fr) 28px}.detail-grid{grid-template-columns:1fr}.ownership{grid-template-columns:1fr}.boundary{writing-mode:initial}.transport{align-items:flex-start;flex-direction:column}.scenario-deck,.detail-panel,.ownership{padding:.9rem}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
  </style>
</head>
<body>
  <nav class="topbar" aria-label="bluetape4k visual companion"><a class="brand" href="${routePrefix}/visual-companions/"><span class="brand-mark" aria-hidden="true">B4K</span><span>${copy.catalog}</span></a><div class="top-actions"><a class="btn" href="${companion.manual[locale]}">${copy.manual}</a><a class="btn" href="${otherPrefix}${route}" hreflang="${other}">${copy.language}</a><div class="theme-picker" aria-label="Theme"><button class="btn" type="button" data-theme-button="auto">${copy.auto}</button><button class="btn" type="button" data-theme-button="light">${copy.light}</button><button class="btn" type="button" data-theme-button="dark">${copy.dark}</button></div></div></nav>
  <main class="page">
    <header class="hero"><div><p class="eyebrow">#422 · bluetape4k-aws · ${companion.version} · SNS security</p><h1>${esc(pick(companion.title, locale))}</h1><p>${esc(pick(companion.summary, locale))}</p></div><aside class="invariant"><strong>${esc(pick(companion.invariant, locale))}</strong><br><br><span>01 parse → 02 TopicArn → 03 certificate URL → 04 chain → 05 signature → 06 verified branch</span></aside></header>
    <div id="bt4k-issue-422" data-sns-ready="true" data-sequence="true" data-scenario="valid-v1" data-step="0">
      <section class="scenario-deck" aria-labelledby="scenario-title"><div class="section-head"><h2 id="scenario-title">${copy.choose}</h2><span>${copy.branch} × ${model.scenarios.length}</span></div><div class="scenario-controls" aria-label="${copy.choose}">${scenarioButtons}</div><div class="scenario-note" aria-live="polite"><span data-scenario-summary></span><strong data-scenario-outcome></strong></div></section>
      <section class="sequence-panel" aria-labelledby="sequence-title"><div class="section-head"><h2 id="sequence-title">${copy.sequence}</h2><span>${copy.step} <strong data-step-label>0 / ${model.steps.length - 1}</strong></span></div><div class="transport"><div class="transport-buttons" aria-label="Playback controls"><button type="button" class="btn" data-action="reset">${copy.reset}</button><button type="button" class="btn btn-primary" data-action="play" aria-pressed="false">${copy.play}</button><button type="button" class="btn" data-action="next">${copy.next}</button></div><div class="clock"><span>${copy.progress}</span><strong data-current-phase>${esc(model.steps[0].phase)}</strong></div></div><div class="progress" role="progressbar" aria-label="${copy.progress}" aria-valuenow="0" aria-valuemin="0" aria-valuemax="${model.steps.length - 1}"><div class="progress-bar"></div></div><p class="scroll-hint" data-scroll-hint>${copy.scroll}</p><div class="sequence-board" data-sequence-board><div class="participant-grid"><span class="participant-spacer" aria-hidden="true"></span>${participantHeaders(model)}</div><div class="life-grid" aria-hidden="true"><span class="life-spacer"></span>${model.participants.map(() => '<span class="life"></span>').join('')}</div><ol class="message-list">${sequenceRows(model, copy)}</ol></div></section>
      <section class="detail-layout"><article class="detail-panel" aria-live="polite"><div class="detail-title"><h2 data-detail-phase>${esc(model.steps[0].phase)}</h2><span data-detail-state>${copy.waiting}</span></div><p class="detail-event" data-detail-event>${esc(model.steps[0].event)}</p><div class="detail-grid"><div class="detail-card"><span>${copy.action}</span><p data-detail="action"></p></div><div class="detail-card"><span>${copy.guard}</span><p data-detail="guard"></p></div><div class="detail-card"><span>${copy.nextDetail}</span><p data-detail="next"></p></div><div class="detail-card"><span>${copy.signal}</span><p data-detail="signal"></p></div></div></article><aside class="flow-notes"><div class="flow-note"><strong>${copy.trust}</strong><p>${esc(pick(companion.ownership.adapter, locale))}</p></div><div class="flow-note"><strong>${copy.policy}</strong><p>${esc(pick(companion.ownership.caller, locale))}</p></div></aside></section>
      <section class="ownership"><div class="ownership-card"><strong>${copy.trust}</strong><p>${esc(pick(companion.ownership.boundary, locale))}</p></div><span class="boundary">│ fail closed │</span><div class="ownership-card"><strong>${copy.policy}</strong><p>${esc(pick(companion.caveats, locale))}</p></div></section>
      <p class="hint">${copy.keyboard}</p><noscript><p>${copy.nojs} <a href="${asset}.png">${copy.diagram}</a></p></noscript>
    </div>
    <footer class="provenance"><strong>${copy.source}</strong><br><a href="https://github.com/bluetape4k/bluetape4k.github.io/issues/422">${copy.issue} #422</a><a href="https://github.com/bluetape4k/bluetape4k-aws/issues/457">SNS signature issue #457</a>${companion.sources.slice(0, 4).map((source) => `<a href="${source.url}">${esc(source.label)}</a>`).join('')}<span>${copy.sourceRevision}: ${esc(companion.sourceRevision)}</span><br><a href="${asset}.png">${copy.diagram}</a></footer>
  </main>
  <script>
    (() => {
      const root = document.getElementById('bt4k-issue-422');
      const model = ${scriptJson(model)};
      const labels = ${scriptJson({ play: copy.play, pause: copy.pause, active: copy.active, waiting: copy.waiting, complete: copy.complete, failed: copy.failed, pending: copy.pending })};
      const stepsById = Object.fromEntries(model.steps.map((value) => [value.id, value]));
      const scenariosById = Object.fromEntries(model.scenarios.map((value) => [value.id, value]));
      let scenarioId = model.scenarios[0].id;
      let step = 0;
      let timer = null;
      const playButton = root.querySelector('[data-action="play"]');
      const progress = root.querySelector('.progress');
      const progressBar = root.querySelector('.progress-bar');
      const stop = () => { if (timer !== null) window.clearInterval(timer); timer = null; playButton.textContent = labels.play; playButton.setAttribute('aria-pressed', 'false'); };
      const story = () => model.stories[scenarioId];
      const currentStep = () => stepsById[story().ids[step]];
      const render = () => {
        const selected = scenariosById[scenarioId];
        const current = story();
        const item = currentStep();
        const terminal = step === current.ids.length - 1;
        const failed = terminal && current.failure;
        root.dataset.scenario = scenarioId;
        root.dataset.step = String(step);
        root.dataset.terminal = String(terminal);
        root.dataset.status = failed ? 'FAILED' : terminal ? 'VERIFIED' : 'IN_PROGRESS';
        root.dataset.workflowReady = 'true';
        root.querySelector('[data-scenario-summary]').textContent = selected.summary;
        root.querySelector('[data-scenario-outcome]').textContent = terminal ? (failed ? labels.failed : selected.outcome) : labels.pending;
        root.querySelector('[data-step-label]').textContent = (step + 1) + ' / ' + current.ids.length;
        root.querySelector('[data-current-phase]').textContent = item.phase;
        root.querySelector('[data-detail-phase]').textContent = item.phase;
        root.querySelector('[data-detail-state]').textContent = failed ? labels.failed : terminal ? labels.complete : step === 0 ? labels.waiting : labels.active;
        root.querySelector('[data-detail-event]').textContent = failed ? current.failure.code : item.event;
        root.querySelector('[data-detail="action"]').textContent = failed ? current.failure.text : item.action;
        root.querySelector('[data-detail="guard"]').textContent = item.guard;
        root.querySelector('[data-detail="next"]').textContent = failed ? current.failure.text : item.next;
        root.querySelector('[data-detail="signal"]').textContent = item.signal;
        progress.setAttribute('aria-valuenow', String(step));
        progress.setAttribute('aria-valuemax', String(Math.max(0, current.ids.length - 1)));
        progressBar.style.width = (step / Math.max(1, current.ids.length - 1) * 100) + '%';
        root.querySelectorAll('[data-step-index]').forEach((row, index) => {
          const visibleIndex = current.ids.indexOf(model.steps[index].id);
          const reached = visibleIndex >= 0 && visibleIndex < step;
          const active = visibleIndex === step;
          const blocked = failed && active;
          row.classList.toggle('is-muted', visibleIndex < 0 || visibleIndex > step);
          row.classList.toggle('is-done', reached && !blocked);
          row.classList.toggle('is-active', active && !blocked);
          row.classList.toggle('is-failed', blocked);
          row.querySelector('[data-row-state]').textContent = blocked ? labels.failed : reached ? labels.complete : active ? labels.active : labels.waiting;
        });
        root.querySelector('[data-action="next"]').disabled = terminal;
        if (terminal) stop();
      };
      const setScenario = (button) => {
        stop();
        scenarioId = button.dataset.scenarioButton;
        step = 0;
        root.querySelectorAll('[data-scenario-button]').forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
        render();
      };
      root.querySelectorAll('[data-scenario-button]').forEach((button) => button.addEventListener('click', () => setScenario(button)));
      root.querySelectorAll('[data-step-button]').forEach((button) => button.addEventListener('click', () => {
        stop();
        const requestedId = model.steps[Number(button.closest('[data-step-index]').dataset.stepIndex)].id;
        const nextStep = story().ids.indexOf(requestedId);
        if (nextStep >= 0) { step = nextStep; render(); button.focus({ preventScroll: true }); }
      }));
      root.querySelector('[data-action="reset"]').addEventListener('click', () => { stop(); step = 0; render(); });
      root.querySelector('[data-action="next"]').addEventListener('click', () => { stop(); step = Math.min(step + 1, story().ids.length - 1); render(); });
      playButton.addEventListener('click', () => {
        if (timer !== null) { stop(); return; }
        if (step === story().ids.length - 1) step = 0;
        playButton.textContent = labels.pause;
        playButton.setAttribute('aria-pressed', 'true');
        render();
        timer = window.setInterval(() => { step = Math.min(step + 1, story().ids.length - 1); render(); }, 1450);
      });
      root.addEventListener('keydown', (event) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        stop();
        if (event.key === 'ArrowRight') step = Math.min(step + 1, story().ids.length - 1);
        if (event.key === 'ArrowLeft') step = Math.max(step - 1, 0);
        if (event.key === 'Home') step = 0;
        if (event.key === 'End') step = story().ids.length - 1;
        render();
      });
      document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
      document.querySelectorAll('[data-theme-button]').forEach((button) => button.addEventListener('click', () => {
        const theme = button.dataset.themeButton;
        if (theme === 'auto') delete document.documentElement.dataset.theme;
        else document.documentElement.dataset.theme = theme;
        document.querySelectorAll('[data-theme-button]').forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
      }));
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
