import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { tenant } from '../src/data/visual-companions/wave2-tenant-context.mjs';

const root = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const bi = (en, ko) => ({ en, ko });
function emit(path, content) {
  const target = resolve(root, path);
  if (check) {
    if (readFileSync(target, 'utf8') !== content) throw new Error(`Stale generated file: ${path}`);
  } else {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}
function wrap(value, width) {
  const lines = [];
  let line = '';
  for (const word of value.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    const units = [...next].reduce((sum, char) => sum + (/[가-힣]/.test(char) ? 2 : 1), 0);
    if (line && units > width) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
const fields = [
  ['owner', bi('CONTEXT OWNER', 'CONTEXT 소유 범위')],
  ['install', bi('EXPLICIT BINDING', '명시적인 설정')],
  ['read', bi('READ', '조회')],
  ['cleanup', bi('LIFETIME AND RESTORATION', '수명과 복원')],
  ['boundary', bi('PROPAGATION BOUNDARY', '전파 경계')],
];
for (const locale of ['en', 'ko']) {
  const t = (value) => typeof value === 'string' ? value : value[locale];
  const font = locale === 'ko' ? 'goorm Sans' : 'Comic Mono';
  const heading = locale === 'ko' ? 'goorm Sans' : 'Architects Daughter';
  const cards = tenant.carriers.map((carrier) => ({
    ...carrier,
    fields: fields.map(([key, label]) => ({ label: t(label), lines: wrap(t(carrier[key]), 52) })),
  }));
  const heights = [0, 1].map((row) => Math.max(...cards.slice(row * 2, row * 2 + 2).map((card) =>
    112 + card.fields.reduce((sum, field) => sum + 38 + field.lines.length * 25, 0))));
  const top = 225, gap = 28, height = top + heights[0] + gap + heights[1] + 150;
  const ledger = {
    kind: 'architecture',
    source: {
      question: t(bi('Which object owns each tenant context, and where does its scope end?', '각 tenant context의 소유 범위와 수명은 어디까지인가?')),
      revision: tenant.sourceRevision,
      paths: ['src/data/visual-companions/wave2-tenant-context.mjs'],
    },
    nodes: cards.map((card, index) => ({ id: card.id, label: card.label, source: tenant.sources[index].url })),
    edges: [],
    behavior: { branches: 0, loops: 0 },
    repairs: [],
  };
  emit(`docs/diagrams/visual-companions-wave2/${tenant.slug}-${locale}.semantic.json`, JSON.stringify(ledger, null, 2) + '\n');
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="${height}" viewBox="0 0 1440 ${height}" role="img" aria-labelledby="title desc"><title id="title">${esc(t(tenant.title))}</title><desc id="desc">${esc(t(tenant.summary))}</desc><style>text{font-family:'${font}',sans-serif;fill:#1c2925}.title{font-family:'${heading}',sans-serif;font-size:46px;font-weight:bold}.heading{font-family:'${heading}',sans-serif;font-size:31px;font-weight:bold}.body{font-size:19px}.label{font-size:14px;fill:#08776a;font-weight:bold}.muted{fill:#52645b;font-size:19px}.card{fill:#fff;stroke:#cbd6cf;stroke-width:2}</style><rect width="1440" height="${height}" fill="#f5f6f3"/>`];
  const text = (cls, x, y, value) => out.push(`<text class="${cls}" x="${x}" y="${y}">${esc(value)}</text>`);
  text('label', 60, 54, 'BLUETAPE4K PROJECTS / TENANT CONTEXT');
  text('title', 60, 115, t(bi('Four carriers. Explicit context ownership.', '네 가지 carrier, 명시적인 context 소유 범위')));
  wrap(t(bi('Choose a scope before crossing a boundary. No default tenant and no automatic bridge.', '경계를 넘기 전에 scope를 선택합니다. 기본 tenant와 자동 bridge는 제공하지 않습니다.')), 110).forEach((line, i) => text('muted', 60, 169 + i * 28, line));
  cards.forEach((card, index) => {
    const row = Math.floor(index / 2), x = index % 2 ? 740 : 60;
    const y = top + (row ? heights[0] + gap : 0);
    out.push(`<rect id="${card.id}" class="card" data-card="true" x="${x}" y="${y}" width="640" height="${heights[row]}" rx="12"/>`);
    text('heading', x + 28, y + 51, card.label);
    let lineY = y + 93;
    for (const field of card.fields) {
      text('label', x + 28, lineY, field.label);
      lineY += 27;
      field.lines.forEach((line) => { text('body', x + 28, lineY, line); lineY += 25; });
      lineY += 11;
    }
  });
  const footerY = height - 105;
  out.push(`<rect x="60" y="${footerY}" width="1320" height="76" rx="8" fill="#e1f1eb"/>`);
  text('label', 82, footerY + 29, t(bi('MISSING CONTEXT', 'CONTEXT 누락')));
  text('body', 82, footerY + 56, 'currentOrNull: null / requireCurrent: MissingTenantContextException');
  out.push('</svg>\n');
  emit(`public/assets/visual-companions/wave2/${tenant.slug}-${locale}.svg`, out.join('\n'));
}
console.log(`Tenant SVG and semantic ledger ${check ? 'checked' : 'generated'}`);
