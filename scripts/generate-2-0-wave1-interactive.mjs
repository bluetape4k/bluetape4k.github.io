#!/usr/bin/env node

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');

const companions = [
  {
    id: '414',
    repo: 'bluetape4k-image',
    slug: 'image-intelligence-policy-privacy',
    source: 'issue-414-image-intelligence',
    issue: 'https://github.com/bluetape4k/bluetape4k.github.io/issues/414',
    manual: {
      en: '/manual/bluetape4k-image/1.0/modules/spring-boot-image-intelligence-api/',
      ko: '/ko/manual/bluetape4k-image/1.0/modules/spring-boot-image-intelligence-api/',
    },
    title: {
      en: 'Image Intelligence: Policy and Privacy Boundaries',
      ko: 'Image Intelligence 정책·개인정보 경계',
    },
    summary: {
      en: 'Step through qualification, parallel analysis, fail-closed policy, and application-owned privacy side effects.',
      ko: '입력 검증, 병렬 분석, fail-closed 정책, 애플리케이션 소유 개인정보 부작용 경계를 단계별로 확인합니다.',
    },
  },
  {
    id: '415',
    repo: 'bluetape4k-aws',
    slug: 'aws-sqs-reliability',
    source: 'issue-415-aws-sqs-reliability',
    issue: 'https://github.com/bluetape4k/bluetape4k.github.io/issues/415',
    manual: {
      en: '/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging/',
      ko: '/ko/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging/',
    },
    title: {
      en: 'SQS Batch Reliability Flight Recorder',
      ko: 'SQS batch 신뢰성 Flight Recorder',
    },
    summary: {
      en: 'Play five failure scenarios across receive, handler, acknowledgement, redelivery, cancellation, and observation boundaries.',
      ko: 'receive, handler, acknowledgement, redelivery, cancellation, observation 경계를 다섯 장애 시나리오로 재생합니다.',
    },
  },
  {
    id: '416',
    repo: 'bluetape4k-projects',
    slug: 'projects-nearjcache-semantics',
    source: 'issue-416-projects-nearjcache',
    issue: 'https://github.com/bluetape4k/bluetape4k.github.io/issues/416',
    manual: {
      en: '/manual/bluetape4k-projects/2.0/modules/bluetape4k-cache-lettuce/near-cache-l1-l2/',
      ko: '/ko/manual/bluetape4k-projects/2.0/modules/bluetape4k-cache-lettuce/near-cache-l1-l2/',
    },
    title: {
      en: 'NearJCache Consistency Lab',
      ko: 'NearJCache 일관성 실험실',
    },
    summary: {
      en: 'Explore L1 hits, L2 fills, conditional writes, bounded bulk policy, epoch-gated clear, statistics, and JMX.',
      ko: 'L1 hit, L2 fill, conditional write, bounded bulk, epoch 기반 clear, 통계, JMX 의미론을 작업별로 살펴봅니다.',
    },
  },
];

const themeScript = `
    (() => {
      const key = 'bluetape4k-wave1-visual-theme';
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
            const mode = button.dataset.themeButton;
            localStorage.setItem(key, mode);
            apply(mode);
            document.querySelectorAll('[data-theme-button]').forEach((candidate) => {
              candidate.setAttribute('aria-pressed', String(candidate === button));
            });
          });
        });
      });
    })();`;

const baseStyle = `
    :root {
      color-scheme: light dark;
      --font-size-base: 16px;
      --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
    }
    :root[data-theme="light"] {
      --background: #f4f7fb; --foreground: #152033; --card: #ffffff; --card-foreground: #152033;
      --popover: #ffffff; --popover-foreground: #152033; --primary: #245ea8; --primary-foreground: #ffffff;
      --secondary: #e6edf7; --secondary-foreground: #24364f; --muted: #e8eef6; --muted-foreground: #5b6b80;
      --accent: #dce9fb; --accent-foreground: #173c6b; --destructive: #b93447; --border: #c5d2e2;
      --input: #aebfd3; --ring: #3978c4; --viz-series-1: #2777c7; --viz-series-2: #5a48b5;
      --viz-series-3: #118065; --viz-series-4: #b86612; --viz-series-5: #b93447; --viz-series-6: #087f8c;
      --page-grid: rgba(39, 76, 120, .065); --shadow: rgba(18, 37, 63, .15);
    }
    :root[data-theme="dark"] {
      --background: #07111f; --foreground: #e7eef8; --card: #0f1d31; --card-foreground: #e7eef8;
      --popover: #101f34; --popover-foreground: #e7eef8; --primary: #78b2ff; --primary-foreground: #07111f;
      --secondary: #182b45; --secondary-foreground: #dfe9f7; --muted: #172840; --muted-foreground: #a7b8ce;
      --accent: #19365b; --accent-foreground: #dceaff; --destructive: #ff8292; --border: #2e4767;
      --input: #496584; --ring: #76b0ff; --viz-series-1: #69aff5; --viz-series-2: #b39bff;
      --viz-series-3: #58d3a4; --viz-series-4: #ffc16b; --viz-series-5: #ff8292; --viz-series-6: #59d8e4;
      --page-grid: rgba(116, 155, 207, .075); --shadow: rgba(0, 0, 0, .38);
    }
    * { box-sizing: border-box; }
    html { min-width: 320px; background: var(--background); }
    body {
      margin: 0; min-width: 320px; color: var(--foreground); font: 400 var(--font-size-base)/1.58 var(--font-sans);
      background: linear-gradient(var(--page-grid) 1px, transparent 1px), linear-gradient(90deg, var(--page-grid) 1px, transparent 1px), var(--background);
      background-size: 30px 30px;
    }
    button, input, select { font: inherit; }
    code { font-family: var(--font-mono); }
    a { color: var(--viz-series-1); }
    button:focus-visible, a:focus-visible { outline: 3px solid var(--ring); outline-offset: 3px; }
    .topbar {
      position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between;
      gap: .75rem; min-height: 64px; padding: .65rem clamp(1rem, 4vw, 3.5rem); border-bottom: 1px solid var(--border);
      background: color-mix(in srgb, var(--background) 86%, transparent); backdrop-filter: blur(16px);
    }
    .brand, .top-actions, .theme-picker, .viz-row, .viz-controls { display: flex; align-items: center; gap: .55rem; flex-wrap: wrap; }
    .brand { color: var(--foreground); font-weight: 500; text-decoration: none; }
    .brand-mark { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 10px; color: var(--primary-foreground); background: linear-gradient(135deg, var(--primary), var(--viz-series-2)); }
    .page { width: min(1180px, calc(100% - 2rem)); margin: 0 auto; padding: clamp(1.5rem, 4vw, 3.5rem) 0 4.5rem; }
    .context { margin: 0 0 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
    .context strong { display: block; margin-bottom: .25rem; }
    .context p { margin: 0; color: var(--muted-foreground); }
    h1, h2, h3 { line-height: 1.2; font-weight: 500; }
    h2 { margin: 0 0 1rem; font-size: clamp(1.65rem, 4vw, 2.6rem); letter-spacing: -.025em; }
    .btn {
      min-height: 42px; padding: .55rem .9rem; border: 1px solid var(--border); border-radius: 999px;
      color: var(--foreground); background: var(--card); cursor: pointer; text-decoration: none;
    }
    .btn:hover { border-color: var(--viz-series-1); }
    .btn-primary, .btn[aria-pressed="true"] { border-color: var(--primary); color: var(--primary-foreground); background: var(--primary); }
    .btn-ghost { background: transparent; }
    .text-small { font-size: .82rem; }
    .text-muted { color: var(--muted-foreground); }
    .viz-badge { display: inline-flex; padding: .2rem .55rem; border-radius: 999px; color: var(--accent-foreground); background: var(--accent); }
    .progress { height: .55rem; overflow: hidden; border-radius: 999px; background: color-mix(in srgb, var(--muted) 70%, transparent); }
    .progress-bar { height: 100%; background: var(--viz-series-1); transition: width 380ms ease; }
    .provenance { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border); color: var(--muted-foreground); }
    .provenance a { margin-inline-end: 1rem; }
    @media (max-width: 700px) {
      .topbar { align-items: flex-start; }
      .top-actions { justify-content: flex-end; }
      .top-actions > a { display: none; }
      .page { width: min(100% - 1rem, 1180px); padding-top: 1.25rem; }
    }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; } }`;

function routeFor(companion, locale) {
  const prefix = locale === 'ko' ? '/ko' : '';
  return `${prefix}/visual-companions/${companion.repo}/${companion.slug}/`;
}

function renderPage(companion, locale, fragment) {
  const otherLocale = locale === 'ko' ? 'en' : 'ko';
  const labels = locale === 'ko'
    ? { manual: '매뉴얼', issue: '작업 이슈', language: 'English', auto: '자동', light: '밝게', dark: '어둡게', source: '근거와 범위' }
    : { manual: 'Manual', issue: 'Delivery issue', language: '한국어', auto: 'Auto', light: 'Light', dark: 'Dark', source: 'Evidence and scope' };
  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <link rel="icon" href="data:,">
  <title>${companion.title[locale]} · bluetape4k</title>
  <meta name="description" content="${companion.summary[locale]}">
  <script>${themeScript}</script>
  <style>${baseStyle}</style>
</head>
<body>
  <nav class="topbar" aria-label="bluetape4k visual companion">
    <a class="brand" href="${locale === 'ko' ? '/ko/visual-companions/' : '/visual-companions/'}"><span class="brand-mark" aria-hidden="true">B4K</span><span>Visual companions</span></a>
    <div class="top-actions">
      <a class="btn btn-ghost" href="${companion.manual[locale]}">${labels.manual}</a>
      <a class="btn btn-ghost" href="${routeFor(companion, otherLocale)}" hreflang="${otherLocale}">${labels.language}</a>
      <div class="theme-picker" aria-label="Theme">
        <button type="button" class="btn btn-ghost" data-theme-button="auto">${labels.auto}</button>
        <button type="button" class="btn btn-ghost" data-theme-button="light">${labels.light}</button>
        <button type="button" class="btn btn-ghost" data-theme-button="dark">${labels.dark}</button>
      </div>
    </div>
  </nav>
  <main class="page">
    <header class="context"><strong>#${companion.id} · ${companion.repo}</strong><p>${companion.summary[locale]}</p></header>
${fragment}
    <footer class="provenance"><strong>${labels.source}</strong><br><a href="${companion.issue}">${labels.issue} #${companion.id}</a><a href="${companion.manual[locale]}">${labels.manual}</a></footer>
  </main>
</body>
</html>
`;
}

let mismatches = 0;
for (const companion of companions) {
  for (const locale of ['en', 'ko']) {
    const fragmentPath = resolve(root, 'src/visual-companions/wave1', `${companion.source}.${locale}.fragment.html`);
    const outputPath = resolve(root, 'public', locale === 'ko' ? 'ko' : '', 'visual-companions', companion.repo, companion.slug, 'index.html');
    const fragment = await readFile(fragmentPath, 'utf8');
    const expected = renderPage(companion, locale, fragment.trim());
    if (check) {
      const actual = await readFile(outputPath, 'utf8').catch(() => null);
      if (actual !== expected) {
        console.error(`OUT_OF_DATE ${outputPath}`);
        mismatches += 1;
      }
    } else {
      await mkdir(resolve(outputPath, '..'), { recursive: true });
      await writeFile(outputPath, expected);
      console.log(`WROTE ${outputPath}`);
    }
  }
}

if (mismatches > 0) process.exitCode = 1;
