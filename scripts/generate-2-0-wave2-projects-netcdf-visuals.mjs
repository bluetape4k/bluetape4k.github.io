import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { projectsNetCdfProgressCompanion as companion } from '../src/data/visual-companions/wave2-projects-netcdf-progress.mjs';

const WIDTH = 1800;
const HEIGHT = 4400;
const ASSET_DIR = 'public/assets/visual-companions/wave2';
const LEDGER_DIR = 'docs/diagrams/visual-companions-wave2';
const CHECK = process.argv.includes('--check');

const colors = {
  coordinates: { stroke: '#55c7e8', fill: '#123b55', marker: 'arrow-coordinates' },
  boundedImport: { stroke: '#f4b35f', fill: '#49351f', marker: 'arrow-import' },
  progress: { stroke: '#60d19a', fill: '#153e33', marker: 'arrow-progress' },
  failure: { stroke: '#f58ca0', fill: '#4a2836', marker: 'arrow-failure' },
  muted: { stroke: '#91a4bf', fill: '#22344d', marker: 'arrow-muted' },
};

const copy = {
  en: {
    title: 'NetCDF 2D CF import: three contracts, one resumable workflow',
    subtitle: 'Coordinate meaning, bounded I/O, and durable progress advance together — but never collapse into one responsibility.',
    sections: ['1 · Register first, then resolve coordinate meaning', '2 · Validate before planning bounded work', '3 · Use two passes and one sequential writer', '4 · Advance only a committed slice checkpoint', '5 · Prove worker shutdown before retry', '6 · Keep the caller / library boundary explicit'],
    nodes: {
      registration: ['Durable registration', 'fileId preserved', 'fingerprint is heuristic', 'PENDING'],
      axes: ['CF axis resolution', '2D lat/lon grid', 'or 1D axis expansion', 'no ambiguous guesses'],
      validation: ['Typed validation', 'finite + range + shape', 'supported CRS only', 'SRID 4326 lon/lat'],
      plan: ['Bounded plan', 'slice ≤ 1,000,000 cells', 'tile ≤ 65,536 cells', 'batch ≤ 1,000 rows'],
      preflight: ['PASS 1 · duplicate preflight', 'stream cell identities', 'duplicate set ≤ 32 MiB', 'zero writes in this pass'],
      write: ['PASS 2 · fenced write', 'one worker / one DB connection', 'sequential tile + batch', 'fence tile start + commit'],
      checkpoint: ['Slice checkpoint', 'last tile commits lastSliceIdx', 'resume = lastSliceIdx + 1', 'completed import is a no-op'],
      timeout: ['Cooperative timeout', 'request cancellation', 'close worker path', 'await bounded shutdown'],
      decision: ['Worker terminated?', 'YES · retry may resume', 'NO · recovery stays blocked', 'never overlap owners'],
      ownershipLibrary: ['Library', 'CF resolution + validation', 'bounded two-pass import', 'fencing + durable progress'],
      ownershipCaller: ['Caller', 'authN/Z + tenant/root', 'executor + deadline + retry', 'DTO redaction + lifecycle'],
    },
    progressStates: ['missing', 'pending', 'in-progress', 'completed', 'failed'],
    limits: ['file ≤ 64 GiB', 'metadata ≤ 1 MiB', 'cells ≤ 100,000,000', 'owned working set ≤ 128 MiB', 'coordinate cache ≤ 64 MiB', 'aux JSONB ≤ 8,192 bytes'],
    notes: ['fileKey|size|lastModifiedTime is not a content hash or TOCTOU proof.', 'No parallel tile fan-out. A timeout is not cleanup proof.', 'fileId is an identity, never an authorization token.'],
  },
  ko: {
    title: 'NetCDF 2D CF import: 세 가지 계약과 하나의 resume workflow',
    subtitle: 'Coordinate 의미, bounded I/O, durable progress는 함께 진행하지만 하나의 책임으로 뒤섞이지 않습니다.',
    sections: ['1 · 먼저 등록하고 coordinate 의미를 해석합니다', '2 · Bounded 작업을 계획하기 전에 검증합니다', '3 · 두 번의 pass와 하나의 순차 writer를 사용합니다', '4 · Commit된 slice checkpoint만 전진시킵니다', '5 · Retry 전에 worker 종료를 증명합니다', '6 · Caller / library 경계를 명시합니다'],
    nodes: {
      registration: ['Durable 등록', 'fileId 보존', 'fingerprint는 heuristic', 'PENDING'],
      axes: ['CF axis 해석', '2D lat/lon grid', '또는 1D axis 확장', '모호하면 추측하지 않음'],
      validation: ['Typed validation', '유한값 + 범위 + shape', '지원하는 CRS만 허용', 'SRID 4326 lon/lat'],
      plan: ['Bounded plan', 'slice ≤ 1,000,000 cells', 'tile ≤ 65,536 cells', 'batch ≤ 1,000 rows'],
      preflight: ['PASS 1 · duplicate preflight', 'cell identity를 stream', 'duplicate set ≤ 32 MiB', '이 pass에서는 write 0건'],
      write: ['PASS 2 · fenced write', 'worker 하나 / DB connection 하나', '순차 tile + batch', 'tile 시작 + commit fencing'],
      checkpoint: ['Slice checkpoint', '마지막 tile이 lastSliceIdx commit', 'resume = lastSliceIdx + 1', '완료된 import는 no-op'],
      timeout: ['Cooperative timeout', 'cancellation 요청', 'worker 경로 닫기', 'bounded shutdown 대기'],
      decision: ['Worker가 종료됐는가?', 'YES · retry resume 가능', 'NO · recovery 계속 차단', 'owner를 절대 겹치지 않음'],
      ownershipLibrary: ['Library', 'CF 해석 + validation', 'bounded two-pass import', 'fencing + durable progress'],
      ownershipCaller: ['Caller', 'authN/Z + tenant/root', 'executor + deadline + retry', 'DTO redaction + lifecycle'],
    },
    progressStates: ['missing', 'pending', 'in-progress', 'completed', 'failed'],
    limits: ['file ≤ 64 GiB', 'metadata ≤ 1 MiB', 'cells ≤ 100,000,000', 'owned working set ≤ 128 MiB', 'coordinate cache ≤ 64 MiB', 'aux JSONB ≤ 8,192 bytes'],
    notes: ['fileKey|size|lastModifiedTime은 content hash나 TOCTOU proof가 아닙니다.', 'Parallel tile fan-out은 없습니다. Timeout만으로 cleanup을 증명하지 못합니다.', 'fileId는 identity이며 authorization token이 아닙니다.'],
  },
};

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function marker(id, color, role = 'primary') {
  return `<marker id="${id}" viewBox="0 0 14 14" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse" data-role="${role}" data-tip-direction="positive-x"><path d="M1 1 L13 7 L1 13 Z" fill="${color}"/></marker>`;
}

function rect(id, x, y, width, height, tone = 'muted', className = 'card', radius = 22) {
  const color = colors[tone];
  return `<rect id="${id}" class="${className}" x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${color.fill}" stroke="${color.stroke}"/>`;
}

function text(className, x, y, value, anchor = 'start') {
  return `<text class="${className}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(value)}</text>`;
}

function lines(x, y, values, className = 'body', gap = 35, numbered = false) {
  return values.map((value, index) => text(className, x, y + index * gap, numbered ? `${index + 1}. ${value}` : value)).join('\n');
}

function connector(id, d, tone, source, target, dashed = false) {
  const color = colors[tone];
  return `<path id="${id}" class="connector" data-connector="${id}" data-source="${source}" data-target="${target}" d="${d}" stroke="${color.stroke}" stroke-width="4"${dashed ? ' stroke-dasharray="10 9"' : ''} marker-end="url(#${color.marker})"/>`;
}

function card(parts, { id, x, y, width, height, tone, title, details, lane }) {
  parts.push(`<g data-lane="${lane}">`);
  parts.push(rect(id, x, y, width, height, tone));
  parts.push(text('cardTitle', x + 32, y + 46, title));
  parts.push(lines(x + 32, y + 86, details, 'body', 34));
  parts.push('</g>');
}

function svg(locale) {
  const l = copy[locale];
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title desc">
<title id="title">${esc(l.title)}</title><desc id="desc">${esc(l.subtitle)}</desc>
<defs>${Object.values(colors).map((value) => marker(value.marker, value.stroke, value.marker === 'arrow-muted' ? 'secondary' : 'primary')).join('')}
<style>.canvas{fill:#07101f}.frame{fill:#0b1729;fill-opacity:.86;stroke-width:2}.card{stroke-width:2}.title{font:700 44px "goorm Sans","Noto Sans KR",sans-serif;fill:#f8fafc}.subtitle{font:19px "goorm Sans Code","Noto Sans KR",monospace;fill:#a9b8d4}.section{font:700 28px "goorm Sans","Noto Sans KR",sans-serif;fill:#f8fafc}.laneLabel{font:700 17px "goorm Sans Code","Noto Sans KR",monospace;letter-spacing:.08em;fill:#91a4bf}.cardTitle{font:700 23px "goorm Sans","Noto Sans KR",sans-serif;fill:#f8fafc}.body{font:18px "goorm Sans","Noto Sans KR",sans-serif;fill:#d4deed}.small{font:16px "goorm Sans","Noto Sans KR",sans-serif;fill:#a9b8d4}.mono{font:17px "goorm Sans Code","Noto Sans KR",monospace;fill:#d7e3f5}.connector{fill:none;stroke-linecap:round;stroke-linejoin:round}.badge{font:700 15px "goorm Sans Code","Noto Sans KR",monospace;fill:#07101f}.rail{stroke:#38526f;stroke-width:3}.warning{font:700 18px "goorm Sans","Noto Sans KR",sans-serif;fill:#f5b2be}</style></defs>
<rect class="canvas" width="${WIDTH}" height="${HEIGHT}"/><rect x="28" y="28" width="1744" height="4344" rx="28" fill="none" stroke="#294362" stroke-width="2"/>
${text('title', 900, 86, l.title, 'middle')}${text('subtitle', 900, 126, l.subtitle, 'middle')}`];

  parts.push(rect('coordinate-frame', 80, 175, 1640, 740, 'muted', 'frame', 28));
  parts.push(text('section', 120, 228, l.sections[0]));
  parts.push(text('laneLabel', 1600, 228, 'COORDINATE SEMANTICS', 'end'));
  card(parts, { id: 'registration', x: 120, y: 280, width: 470, height: 235, tone: 'coordinates', title: l.nodes.registration[0], details: l.nodes.registration.slice(1), lane: 'coordinates' });
  card(parts, { id: 'axis-resolution', x: 665, y: 280, width: 470, height: 235, tone: 'coordinates', title: l.nodes.axes[0], details: l.nodes.axes.slice(1), lane: 'coordinates' });
  card(parts, { id: 'validation', x: 1210, y: 280, width: 470, height: 235, tone: 'coordinates', title: l.nodes.validation[0], details: l.nodes.validation.slice(1), lane: 'coordinates' });
  parts.push(connector('register-axes', 'M590 398 H665', 'coordinates', 'registration', 'axis-resolution'));
  parts.push(connector('axes-validation', 'M1135 398 H1210', 'coordinates', 'axis-resolution', 'validation'));
  parts.push(rect('identity-warning', 120, 570, 1015, 120, 'failure', 'card', 18));
  parts.push(text('cardTitle', 150, 612, 'Identity boundary'));
  parts.push(text('warning', 150, 654, l.notes[0]));
  parts.push(rect('coordinate-limits', 1210, 570, 470, 270, 'muted', 'card', 18));
  parts.push(text('cardTitle', 1240, 614, l.sections[1]));
  parts.push(lines(1240, 656, [l.limits[0], l.limits[1], l.limits[2], l.limits[4], l.limits[5]], 'small', 32));
  parts.push(connector('validation-plan-anchor', 'M1445 515 V570', 'coordinates', 'validation', 'coordinate-limits'));

  parts.push(rect('import-frame', 80, 965, 1640, 1420, 'muted', 'frame', 28));
  parts.push(text('section', 120, 1018, l.sections[2]));
  parts.push(text('laneLabel', 1600, 1018, 'BOUNDED IMPORT', 'end'));
  card(parts, { id: 'tile-plan', x: 120, y: 1080, width: 1560, height: 220, tone: 'boundedImport', title: l.nodes.plan[0], details: l.nodes.plan.slice(1), lane: 'boundedImport' });
  parts.push(rect('budget-bar', 180, 1240, 1440, 34, 'progress', 'card', 14));
  parts.push(text('mono', 900, 1263, `${l.limits[3]}  ·  ${l.nodes.write[1]}`, 'middle'));
  card(parts, { id: 'duplicate-preflight', x: 120, y: 1400, width: 680, height: 310, tone: 'coordinates', title: l.nodes.preflight[0], details: l.nodes.preflight.slice(1), lane: 'boundedImport' });
  card(parts, { id: 'batch-write', x: 1000, y: 1400, width: 680, height: 310, tone: 'boundedImport', title: l.nodes.write[0], details: l.nodes.write.slice(1), lane: 'boundedImport' });
  parts.push(connector('plan-preflight', 'M460 1300 V1400', 'coordinates', 'tile-plan', 'duplicate-preflight'));
  parts.push(connector('preflight-write', 'M800 1555 H1000', 'boundedImport', 'duplicate-preflight', 'batch-write'));
  parts.push(rect('duplicate-failure', 120, 1790, 680, 155, 'failure', 'card', 18));
  parts.push(text('cardTitle', 150, 1835, 'Duplicate found → FAILED'));
  parts.push(text('small', 150, 1878, 'No rows from this slice were written.'));
  parts.push(text('small', 150, 1912, 'The previous lastSliceIdx remains safe.'));
  parts.push(connector('preflight-failure', 'M460 1710 V1790', 'failure', 'duplicate-preflight', 'duplicate-failure', true));
  card(parts, { id: 'slice-checkpoint', x: 1000, y: 1790, width: 680, height: 250, tone: 'progress', title: l.nodes.checkpoint[0], details: l.nodes.checkpoint.slice(1), lane: 'boundedImport' });
  parts.push(connector('write-checkpoint', 'M1340 1710 V1790', 'progress', 'batch-write', 'slice-checkpoint'));
  parts.push(connector('checkpoint-plan', 'M1680 1915 H1700 Q1710 1915 1710 1905 V1190 Q1710 1180 1700 1180 H1680', 'progress', 'slice-checkpoint', 'tile-plan', true));
  parts.push(rect('sequential-warning', 120, 2110, 1560, 190, 'failure', 'card', 18));
  parts.push(text('cardTitle', 150, 2155, 'NON-NEGOTIABLE EXECUTION SHAPE'));
  parts.push(text('warning', 150, 2200, l.notes[1]));
  parts.push(text('mono', 150, 2245, `${l.limits[3]} · ${l.nodes.write[1]} · ${l.nodes.write[2]}`));

  parts.push(rect('progress-frame', 80, 2435, 1640, 660, 'muted', 'frame', 28));
  parts.push(text('section', 120, 2488, l.sections[3]));
  parts.push(text('laneLabel', 1600, 2488, 'PROGRESS & RECOVERY', 'end'));
  parts.push(`<g data-lane="progress">`);
  const stateX = [190, 500, 810, 1120, 1430];
  parts.push(`<path class="rail" d="M190 2660 H1430"/>`);
  l.progressStates.forEach((state, index) => {
    const tone = index === 4 ? 'failure' : index === 3 ? 'progress' : index === 0 ? 'muted' : 'coordinates';
    parts.push(`<circle cx="${stateX[index]}" cy="2660" r="34" fill="${colors[tone].fill}" stroke="${colors[tone].stroke}" stroke-width="4"/>`);
    parts.push(text('mono', stateX[index], 2722, state, 'middle'));
  });
  parts.push(rect('progress-mapping', 120, 2790, 730, 215, 'coordinates', 'card', 18));
  parts.push(text('cardTitle', 150, 2835, 'findImportProgress'));
  parts.push(lines(150, 2876, ['null → missing', 'PENDING → pending', 'IN_PROGRESS → in-progress', 'COMPLETED / FAILED → terminal'], 'small', 30));
  parts.push(rect('resume-rule', 950, 2790, 730, 215, 'progress', 'card', 18));
  parts.push(text('cardTitle', 980, 2835, l.nodes.checkpoint[0]));
  parts.push(lines(980, 2876, l.nodes.checkpoint.slice(1), 'small', 34));
  parts.push('</g>');

  parts.push(rect('recovery-frame', 80, 3145, 1640, 650, 'muted', 'frame', 28));
  parts.push(text('section', 120, 3198, l.sections[4]));
  card(parts, { id: 'worker-check', x: 120, y: 3260, width: 650, height: 300, tone: 'failure', title: l.nodes.timeout[0], details: l.nodes.timeout.slice(1), lane: 'progress' });
  card(parts, { id: 'worker-decision', x: 1030, y: 3260, width: 650, height: 300, tone: 'progress', title: l.nodes.decision[0], details: l.nodes.decision.slice(1), lane: 'progress' });
  parts.push(connector('write-worker', 'M770 3410 H1030', 'failure', 'worker-check', 'worker-decision'));
  parts.push(rect('terminal-state', 575, 3620, 650, 110, 'progress', 'card', 18));
  parts.push(text('cardTitle', 900, 3665, 'COMPLETED · FAILED · retry gate', 'middle'));
  parts.push(text('small', 900, 3702, 'Retry is caller-scheduled only after worker shutdown proof.', 'middle'));
  parts.push(connector('worker-terminal', 'M1355 3560 V3575 Q1355 3590 1340 3590 H915 Q900 3590 900 3605 V3620', 'progress', 'worker-decision', 'terminal-state'));

  parts.push(rect('ownership-frame', 80, 3845, 1640, 470, 'muted', 'frame', 28));
  parts.push(text('section', 120, 3898, l.sections[5]));
  card(parts, { id: 'library-ownership', x: 120, y: 3960, width: 700, height: 265, tone: 'progress', title: l.nodes.ownershipLibrary[0], details: l.nodes.ownershipLibrary.slice(1), lane: 'progress' });
  card(parts, { id: 'caller-policy', x: 980, y: 3960, width: 700, height: 265, tone: 'boundedImport', title: l.nodes.ownershipCaller[0], details: l.nodes.ownershipCaller.slice(1), lane: 'progress' });
  parts.push(connector('terminal-caller', 'M1225 3675 H1625 Q1645 3675 1645 3695 V3960', 'boundedImport', 'terminal-state', 'caller-policy'));
  parts.push(text('warning', 900, 4282, l.notes[2], 'middle'));
  parts.push(text('small', 900, 4340, `Issue #418 · source ${companion.sourceRevision.slice(0, 12)} · release 2.0.0`, 'middle'));
  parts.push('</svg>');
  return `${parts.join('\n')}\n`;
}

function ledger(locale) {
  const source = 'wave2-projects-netcdf-progress.mjs';
  const labels = locale === 'ko'
    ? ['Durable file 등록', 'CF axis 해석', 'Coordinate와 resource 검증', 'Bounded 순차 tile plan', '첫 pass duplicate preflight', '두 번째 pass fenced batch write', 'Commit된 slice checkpoint', 'Timeout worker 생존 확인', 'Completed 또는 failed 상태', 'Caller 소유 retry와 공개 정책']
    : ['Durable file registration', 'CF axis resolution', 'Coordinate and resource validation', 'Bounded sequential tile plan', 'First-pass duplicate preflight', 'Second-pass fenced batch write', 'Committed slice checkpoint', 'Timeout worker-liveness check', 'Completed or failed state', 'Caller-owned retry and publication'];
  const ids = ['registration', 'axis_resolution', 'validation', 'tile_plan', 'duplicate_preflight', 'batch_write', 'slice_checkpoint', 'worker_check', 'terminal_state', 'caller_policy'];
  const edges = [
    ['register-axes', 'registration', 'axis_resolution', 'opens'], ['axes-validation', 'axis_resolution', 'validation', 'binds'],
    ['validation-plan', 'validation', 'tile_plan', 'permits'], ['plan-preflight', 'tile_plan', 'duplicate_preflight', 'first-pass'],
    ['preflight-write', 'duplicate_preflight', 'batch_write', 'second-pass'], ['write-checkpoint', 'batch_write', 'slice_checkpoint', 'last-tile-commit'],
    ['checkpoint-plan', 'slice_checkpoint', 'tile_plan', 'next-slice'], ['checkpoint-terminal', 'slice_checkpoint', 'terminal_state', 'all-slices-done'],
    ['write-worker', 'batch_write', 'worker_check', 'timeout'], ['worker-terminal', 'worker_check', 'terminal_state', 'shutdown-proof'],
    ['terminal-caller', 'terminal_state', 'caller_policy', 'redacted-boundary'], ['caller-registration', 'caller_policy', 'registration', 'permitted-retry'],
  ];
  return `${JSON.stringify({
    kind: 'workflow',
    source: {
      question: locale === 'ko' ? 'NetCDF file을 coordinate 검증, worker 소유권, durable progress와 혼동하지 않으면서 bounded하고 resume 가능한 2D CF spatial row로 어떻게 변환하는가?' : 'How does a NetCDF file become bounded, resumable 2D CF spatial rows without confusing coordinate validation, worker ownership, and durable progress?',
      revision: companion.sourceRevision,
      paths: ['src/data/visual-companions/wave2-projects-netcdf-progress.mjs', 'docs/superpowers/specs/2026-09-04-issue-418-projects-netcdf-progress-design.md'],
    },
    nodes: ids.map((id, index) => ({ id, label: labels[index], source })),
    edges: edges.map(([id, from, to, kind]) => ({ id, from, to, kind, source })),
    behavior: { branches: 3, loops: 1 },
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
  output(`${ASSET_DIR}/projects-netcdf-cf-progress-${locale}.svg`, svg(locale));
  output(`${LEDGER_DIR}/projects-netcdf-cf-progress-${locale}.semantic.json`, ledger(locale));
}
