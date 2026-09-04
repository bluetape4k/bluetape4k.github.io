import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { projectsCoroutinesFlowOperatorsCompanion as companion } from '../src/data/visual-companions/wave2-projects-coroutines-flow-operators.mjs';

const WIDTH = 1800;
const HEIGHT = 5200;
const ASSET_DIR = 'public/assets/visual-companions/wave2';
const LEDGER_DIR = 'docs/diagrams/visual-companions-wave2';
const CHECK = process.argv.includes('--check');
const pick = (value, locale) => value[locale];
const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');
const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const palette = {
  transform: ['#62d5df', '#123d4b'],
  admission: ['#f58fa8', '#4a2939'],
  time: ['#f6c36b', '#4c3820'],
  combine: ['#7eb5ff', '#193864'],
  async: ['#bca4ff', '#342d5c'],
  error: ['#ff7795', '#4b2432'],
};

const copy = {
  en: {
    eyebrow: 'BLUETAPE4K PROJECTS · COROUTINES · 2.0.0 · ISSUE #430',
    subtitle: '66 reactive operators · six families · one shared time axis',
    hint: 'The interactive companion lets you select every operator and replay four contract steps.',
    input: 'INPUT',
    output: 'OUTPUT',
    rule: 'OPERATOR RULE',
    boundary: 'Reactive Flow extensions + AsyncFlow/ParallelFlow only · builders, collection materializers, and Subjects helpers excluded',
    footer: 'Static overview · open the interactive route for all sample lanes and step playback',
  },
  ko: {
    eyebrow: 'BLUETAPE4K PROJECTS · COROUTINES · 2.0.0 · ISSUE #430',
    subtitle: 'Reactive operator 66개 · 6개 family · 하나의 공통 시간축',
    hint: 'Interactive companion에서 모든 operator를 선택하고 4단계 계약을 재생할 수 있습니다.',
    input: 'INPUT',
    output: 'OUTPUT',
    rule: 'OPERATOR RULE',
    boundary: 'Reactive Flow extension + AsyncFlow/ParallelFlow만 포함 · builder, collection materializer, Subjects helper 제외',
    footer: '정적 전체 보기 · 샘플 lane과 단계별 재생은 interactive route에서 확인',
  },
};

function svg(locale) {
  const l = copy[locale];
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title desc" data-intent="source-backed Flow operator marble explorer fallback" data-source-revision="${companion.sourceRevision}">`,
    `<title id="title">${esc(pick(companion.title, locale))}</title>`,
    `<desc id="desc">${esc(pick(companion.summary, locale))}</desc>`,
    '<defs><style>.canvas{fill:#07111f}.frame{fill:#0d1b2f;stroke:#294562;stroke-width:2}.title{font:700 48px "Noto Sans KR",sans-serif;fill:#f7faff}.eyebrow{font:700 16px ui-monospace,monospace;letter-spacing:.08em;fill:#62d5df}.subtitle{font:21px "Noto Sans KR",sans-serif;fill:#aabbd1}.family{font:700 30px "Noto Sans KR",sans-serif;fill:#f7faff}.family-id{font:700 15px ui-monospace,monospace;letter-spacing:.08em}.body{font:17px "Noto Sans KR",sans-serif;fill:#aabbd1}.operator{font:16px ui-monospace,monospace;fill:#f7faff}.lane{font:700 13px ui-monospace,monospace;fill:#9db0c9}.rule{font:700 16px ui-monospace,monospace}.footer{font:16px "Noto Sans KR",sans-serif;fill:#9db0c9}</style></defs>',
    `<rect class="canvas" width="${WIDTH}" height="${HEIGHT}"/><rect x="28" y="28" width="1744" height="5144" rx="28" fill="none" stroke="#294562" stroke-width="2"/>`,
    `<text class="eyebrow" x="90" y="92">${esc(l.eyebrow)}</text>`,
    `<text class="title" x="90" y="160">${esc(pick(companion.title, locale))}</text>`,
    `<text class="subtitle" x="90" y="210">${esc(l.subtitle)}</text>`,
    `<text class="body" x="90" y="250">${esc(l.hint)}</text>`,
  ];

  companion.families.forEach((family, familyIndex) => {
    const [color, fill] = palette[family.id];
    const y = 305 + familyIndex * 790;
    const height = 730;
    const operators = family.operators;
    parts.push(`<g id="family-${family.id}" data-family="${family.id}"><rect class="frame" x="75" y="${y}" width="1650" height="${height}" rx="24"/><rect x="75" y="${y}" width="12" height="${height}" rx="6" fill="${color}"/>`);
    parts.push(`<text class="family-id" x="120" y="${y + 48}" fill="${color}">${esc(family.id.toUpperCase())} · ${operators.length}</text>`);
    parts.push(`<text class="family" x="120" y="${y + 92}">${esc(pick(family.label, locale))}</text>`);
    parts.push(`<text class="body" x="120" y="${y + 130}">${esc(pick(family.description, locale))}</text>`);
    const laneY = y + 205;
    parts.push(`<text class="lane" x="120" y="${laneY + 5}">${l.input}</text><line x1="220" y1="${laneY}" x2="700" y2="${laneY}" stroke="#7eb5ff" stroke-width="3"/>`);
    [['A', 310, '#7eb5ff'], ['B', 450, '#f6c36b'], ['C', 590, '#bca4ff']].forEach(([label, x, marble]) => {
      parts.push(`<circle cx="${x}" cy="${laneY}" r="17" fill="${marble}"/><text class="lane" x="${x}" y="${laneY + 5}" text-anchor="middle" fill="#07111f">${label}</text>`);
    });
    parts.push(`<rect x="755" y="${laneY - 32}" width="300" height="64" rx="14" fill="${fill}" stroke="${color}" stroke-width="3"/><text class="rule" x="905" y="${laneY + 6}" text-anchor="middle" fill="${color}">${l.rule}</text>`);
    parts.push(`<text class="lane" x="1110" y="${laneY + 5}">${l.output}</text><line x1="1210" y1="${laneY}" x2="1650" y2="${laneY}" stroke="#63d6a6" stroke-width="3"/>`);
    [['A′', 1320, '#7eb5ff'], ['B′', 1460, '#f6c36b'], ['C′', 1600, '#bca4ff']].forEach(([label, x, marble]) => {
      parts.push(`<circle cx="${x}" cy="${laneY}" r="17" fill="${marble}"/><text class="lane" x="${x}" y="${laneY + 5}" text-anchor="middle" fill="#07111f">${label}</text>`);
    });
    const listY = y + 285;
    operators.forEach((operator, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = 120 + column * 800;
      const itemY = listY + row * 47;
      parts.push(`<g id="operator-${family.id}-${slug(operator.name)}" data-operator="${esc(operator.name)}"><rect x="${x}" y="${itemY}" width="755" height="38" rx="10" fill="${fill}" stroke="${color}" stroke-opacity=".58"/><circle cx="${x + 22}" cy="${itemY + 19}" r="7" fill="${color}"/><text class="operator" x="${x + 42}" y="${itemY + 25}">${String(index + 1).padStart(2, '0')} · ${esc(operator.name)}</text></g>`);
    });
    parts.push('</g>');
  });

  parts.push(`<text class="body" x="90" y="5085">${esc(l.boundary)}</text>`);
  parts.push(`<text class="footer" x="900" y="5135" text-anchor="middle">${esc(l.footer)} · source ${companion.sourceRevision.slice(0, 12)}</text></svg>\n`);
  return parts.join('\n');
}

function ledger(locale) {
  const source = 'wave2-projects-coroutines-flow-operators.mjs';
  return `${JSON.stringify({
    kind: 'marble-diagram-catalog',
    source: {
      question: locale === 'ko'
        ? 'Reactive Flow extension과 AsyncFlow/ParallelFlow 연산자는 input signal을 어떻게 변환하고 시간, 순서, 오류 계약을 어떻게 바꾸는가?'
        : 'How do reactive Flow extensions and AsyncFlow/ParallelFlow operations transform input signals and change timing, ordering, and error contracts?',
      revision: companion.sourceRevision,
      paths: [
        'src/data/visual-companions/wave2-projects-coroutines-flow-operators.mjs',
        'src/content/docs/manual/bluetape4k-projects/2.0/modules/bluetape4k-coroutines/flow.md',
      ],
    },
    groups: companion.families.map((family) => ({
      id: family.id,
      label: pick(family.label, locale),
      count: family.operators.length,
      source,
    })),
    nodes: companion.families.flatMap((family) => family.operators.map((operator) => ({
      id: `${family.id}_${slug(operator.name)}`,
      group: family.id,
      label: operator.name,
      receiver: operator.receiver,
      signature: operator.signature,
      source,
    }))),
    edges: [],
    behavior: { branches: 6, loops: 6 },
    repairs: [],
  }, null, 2)}\n`;
}

function output(path, content) {
  if (CHECK) {
    if (!existsSync(path) || readFileSync(path, 'utf8') !== content) throw new Error(`Generated output is stale: ${path}`);
    return;
  }
  writeFileSync(path, content, 'utf8');
  console.log(`WROTE ${path}`);
}

mkdirSync(ASSET_DIR, { recursive: true });
mkdirSync(LEDGER_DIR, { recursive: true });
for (const locale of ['en', 'ko']) {
  const svgPath = `${ASSET_DIR}/projects-coroutines-flow-operators-${locale}.svg`;
  const pngPath = `${ASSET_DIR}/projects-coroutines-flow-operators-${locale}.png`;
  output(svgPath, svg(locale));
  output(`${LEDGER_DIR}/projects-coroutines-flow-operators-${locale}.semantic.json`, ledger(locale));
  if (CHECK) {
    if (!existsSync(pngPath)) throw new Error(`Missing rendered PNG: ${pngPath}`);
  } else {
    execFileSync('cairosvg', [svgPath, '-o', pngPath, '-s', '2'], { stdio: 'inherit' });
    console.log(`WROTE ${pngPath}`);
  }
}
