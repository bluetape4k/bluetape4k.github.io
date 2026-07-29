import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = 'public/assets';
mkdirSync(out, { recursive: true });

const readmeOverviewSvg = readFileSync(
  '/Users/debop/work/bluetape4k/bluetape4k-exposed/docs/images/readme-diagrams/root-readme-overview-01.svg',
  'utf8',
)
  .replaceAll('markerWidth="9" markerHeight="9" refX="8" refY="4.5"', 'markerWidth="8" markerHeight="8" refX="7" refY="4"')
  .replaceAll('d="M1,1 L8,4.5 L1,8 Z"', 'd="M 1 1 L 7 4 L 1 7 Z"')
  .replaceAll('"Architects Daughter","Comic Sans MS","Comic Sans",cursive', '"Architects Daughter"')
  .replaceAll('"Comic Sans MS","Comic Sans","Comic Neue",Arial,sans-serif', '"Comic Mono"');
writeFileSync(join(out, 'bluetape4k-exposed-readme-overview.svg'), readmeOverviewSvg);
execFileSync('rsvg-convert', [join(out, 'bluetape4k-exposed-readme-overview.svg'), '-o', join(out, 'bluetape4k-exposed-readme-overview.png')]);

const colors = {
  blue: ['#163761', '#5EA0FF'],
  teal: ['#123F3C', '#35D0C5'],
  green: ['#173D27', '#4BDB85'],
  amber: ['#4B3212', '#F0B84D'],
  rose: ['#4A1E2B', '#F07A9B'],
  purple: ['#2D2359', '#A993FF'],
  neutral: ['#1E293B', '#94A3B8'],
};

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function workbenchHero(source, name) {
  execFileSync('magick', [
    source,
    '-resize', '1672x941^',
    '-gravity', 'center',
    '-extent', '1672x941',
    join(out, `${name}.png`),
  ]);
}

if (process.env.EXPOSED_GENERATE_HEROES === '1') {
  workbenchHero('/Users/debop/work/bluetape4k/bluetape4k-exposed/docs/assets/exposed-workbench.png', 'bluetape4k-exposed-part1-hero');
  workbenchHero('/Users/debop/work/bluetape4k/exposed-workshop/docs/assets/exposed-workshop-workbench.png', 'bluetape4k-exposed-part2-hero');
  workbenchHero('/Users/debop/work/bluetape4k/exposed-r2dbc-workshop/docs/assets/exposed-r2dbc-workshop-workbench.png', 'bluetape4k-exposed-part3-hero');
  workbenchHero('/Users/debop/work/bluetape4k/bluetape4k-experimental/docs/assets/experimental-workbench.png', 'bluetape4k-exposed-part4-hero');
  workbenchHero('/Users/debop/work/bluetape4k/bluetape4k-workshop/docs/assets/workshop-workbench.png', 'bluetape4k-exposed-part5-hero');
}

function base(width, height, title, subtitle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
<title>${esc(title)}</title>
<desc>${esc(subtitle)}</desc>
<defs>
  <filter id="shadow" x="-8%" y="-8%" width="116%" height="116%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#020617" flood-opacity="0.42"/></filter>
  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M 1 1 L 9 5 L 1 9 Z" fill="#78AFFF"/></marker>
  <style>
    .bg{fill:#0B1220}.frame{fill:#0F1E33;stroke:#284766;stroke-width:2}
    .title{font-family:"Architects Daughter";font-size:42px;fill:#F5F9FF;font-weight:700}
    .subtitle,.body,.small,.tiny,.axisLabel{font-family:"Comic Mono";fill:#D7E3F5}
    .subtitle{font-size:16px}.body{font-size:14px}.small{font-size:12px;fill:#B8C7DD}.tiny{font-size:11px;fill:#B8C7DD}
    .label{font-family:"Architects Daughter";font-size:23px;fill:#F5F9FF;font-weight:700}
    .card{filter:url(#shadow);stroke-width:2}.line{fill:none;stroke:#78AFFF;stroke-width:3.2;marker-end:url(#arrow);stroke-linecap:round;stroke-linejoin:round}
    .axis{stroke:#55718F;stroke-width:1.4}.grid{stroke:#2F4B67;stroke-width:1;stroke-dasharray:4 6}
  </style>
</defs>
<rect class="bg" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="26"/>
<text class="title" x="70" y="82">${esc(title)}</text>
<text class="subtitle" x="72" y="114">${esc(subtitle)}</text>`;
}

function card(x, y, w, h, tone, title, lines = []) {
  const [fill, stroke] = colors[tone];
  const centerY = y + h / 2;
  const titleY = lines.length ? centerY - 18 : centerY;
  return `<g>
  <rect class="card" x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill}" stroke="${stroke}"/>
  <text class="label" x="${x + w / 2}" y="${titleY}" text-anchor="middle" dominant-baseline="middle">${esc(title)}</text>
  ${lines.map((line, i) => `<text class="body" x="${x + w / 2}" y="${titleY + 30 + i * 20}" text-anchor="middle">${esc(line)}</text>`).join('\n')}
</g>`;
}

function withExplicitLineAttributes(body) {
  const orthogonal = body
    .replaceAll('d="M210 244 C260 244 250 106 300 106"', 'd="M210 228 H250 Q260 228 260 218 V116 Q260 106 270 106 H300"')
    .replaceAll('d="M210 244 C260 244 250 376 300 376"', 'd="M210 260 H250 Q260 260 260 270 V366 Q260 376 270 376 H300"')
    .replaceAll('d="M538 376 C586 376 572 424 620 424"', 'd="M538 376 H572 Q582 376 582 386 V414 Q582 424 592 424 H620"')
    .replaceAll('d="M872 58 C930 58 920 154 980 154"', 'd="M872 58 H920 Q930 58 930 68 V130 Q930 140 940 140 H980"')
    .replaceAll('d="M872 240 C930 240 920 154 980 154"', 'd="M872 240 H920 Q930 240 930 230 V158 Q930 168 940 168 H980"')
    .replaceAll('d="M872 424 C930 424 920 376 980 376"', 'd="M872 424 H920 Q930 424 930 414 V386 Q930 376 940 376 H980"')
    .replaceAll('d="M1240 154 C1290 154 1290 376 1240 376"', 'd="M1240 154 H1290 Q1300 154 1300 164 V366 Q1300 376 1290 376 H1240"')
    .replaceAll('d="M236 276 C290 276 288 122 344 122"', 'd="M236 260 H288 Q298 260 298 250 V132 Q298 122 308 122 H344"')
    .replaceAll('d="M236 276 C290 276 288 412 344 412"', 'd="M236 292 H288 Q298 292 298 302 V402 Q298 412 308 412 H344"')
    .replaceAll('d="M1008 122 C1070 122 1052 276 1116 276"', 'd="M1008 122 H1052 Q1062 122 1062 132 V266 Q1062 276 1072 276 H1116"')
    .replaceAll('d="M1008 412 C1070 412 1052 304 1116 304"', 'd="M1008 412 H1052 Q1062 412 1062 402 V314 Q1062 304 1072 304 H1116"')
    .replaceAll('d="M236 286 C286 286 278 132 330 132"', 'd="M236 270 H278 Q288 270 288 260 V142 Q288 132 298 132 H330"')
    .replaceAll('d="M236 286 C286 286 278 452 330 452"', 'd="M236 302 H278 Q288 302 288 312 V442 Q288 452 298 452 H330"')
    .replaceAll('d="M1010 132 C1076 132 1054 286 1120 286"', 'd="M1010 132 H1054 Q1064 132 1064 142 V276 Q1064 286 1074 286 H1120"')
    .replaceAll('d="M1010 452 C1076 452 1054 314 1120 314"', 'd="M1010 452 H1054 Q1064 452 1064 442 V324 Q1064 314 1074 314 H1120"')
    .replaceAll('d="M230 292 C288 292 284 112 342 112"', 'd="M230 272 H284 Q294 272 294 262 V122 Q294 112 304 112 H342"')
    .replaceAll('d="M230 292 C288 292 284 476 342 476"', 'd="M230 312 H284 Q294 312 294 322 V466 Q294 476 304 476 H342"')
    .replaceAll('d="M1002 112 C1068 112 1054 292 1120 292"', 'd="M1002 112 H1054 Q1064 112 1064 122 V266 Q1064 276 1074 276 H1120"')
    .replaceAll('d="M1002 476 C1068 476 1054 320 1120 320"', 'd="M1002 476 H1054 Q1064 476 1064 466 V330 Q1064 320 1074 320 H1120"')
    .replaceAll('d="M230 288 C288 288 272 112 330 112"', 'd="M230 268 H272 Q282 268 282 258 V122 Q282 112 292 112 H330"')
    .replaceAll('d="M230 288 C288 288 272 468 330 468"', 'd="M230 308 H272 Q282 308 282 318 V458 Q282 468 292 468 H330"')
    .replaceAll('d="M990 112 C1058 112 1040 288 1110 288"', 'd="M990 112 H1040 Q1050 112 1050 122 V262 Q1050 272 1060 272 H1110"')
    .replaceAll('d="M990 468 C1058 468 1040 316 1110 316"', 'd="M990 468 H1040 Q1050 468 1050 458 V326 Q1050 316 1060 316 H1110"');
  return orthogonal.replaceAll(
    '<path class="line" d=',
    '<path class="line" fill="none" stroke="#78AFFF" stroke-width="3.2" marker-end="url(#arrow)" stroke-linecap="round" stroke-linejoin="round" d=',
  );
}

function stripUnusedArrow(svg) {
  if (svg.includes('class="line"') || svg.includes('marker-end=')) return svg;
  return svg
    .replace(/\n  <marker id="arrow"[\s\S]*?<\/marker>/, '')
    .replace(/\.line\{[^}]*\}/, '');
}

const sequencePortFixes = {
  'bluetape4k-exposed-part6-bigquery-dry-run-flow': {
    'd="M 145 318 L 395 318"': 'd="M 145 326 L 388 326"',
    'd="M 395 382 L 925 382"': 'd="M 402 398 L 918 398"',
    'd="M 925 482 L 645 482"': 'd="M 918 490 L 652 490"',
    'd="M 645 578 L 925 578"': 'd="M 652 570 L 918 570"',
    'd="M 925 662 L 1190 662"': 'd="M 932 670 L 1183 670"',
    'd="M 1190 812 L 925 812"': 'd="M 1183 804 L 932 804"',
    'd="M 925 900 L 1455 900"': 'd="M 932 900 H1190 Q1200 900 1200 910 H1448"',
    '<rect x="354" y="326" width="430" height="34" rx="17" class="label callLabel"/>': '<rect x="354" y="350" width="430" height="34" rx="17" class="label callLabel"/>',
    '<circle cx="378" cy="343" r="13" class="badge callBadge"/><text x="378" y="348" text-anchor="middle" class="badgeText callText">2</text>': '<circle cx="378" cy="367" r="13" class="badge callBadge"/><text x="378" y="372" text-anchor="middle" class="badgeText callText">2</text>',
    '<text x="402" y="348" class="msg callText">validateQuery(query, options)</text>': '<text x="402" y="372" class="msg callText">validateQuery(query, options)</text>',
  },
  'bluetape4k-exposed-part6-trino-session-sequence': {
    'd="M 145 318 L 405 318"': 'd="M 145 326 L 398 326"',
    'd="M 405 486 L 690 486"': 'd="M 412 494 L 683 494"',
    'd="M 690 558 L 145 558"': 'd="M 683 550 L 145 550"',
    'd="M 145 642 L 965 642"': 'd="M 145 650 L 958 650"',
    'd="M 965 746 L 1220 746"': 'd="M 972 754 L 1213 754"',
    'd="M 1220 842 L 965 842"': 'd="M 1213 834 L 972 834"',
    'd="M 965 992 L 1460 992"': 'd="M 972 1000 L 1453 1000"',
  },
};

function normalizeSequencePorts(name, svg) {
  let normalized = svg;
  for (const [from, to] of Object.entries(sequencePortFixes[name] ?? {})) {
    if (!normalized.includes(from)) {
      if (normalized.includes(to)) continue;
      throw new Error(`${name}: sequence port source not found: ${from}`);
    }
    normalized = normalized.replaceAll(from, to);
  }
  return normalized;
}

function diagram(name, title, subtitle, body, width = 1500, height = 760) {
  const svg = `${base(width, height, title, subtitle)}${withExplicitLineAttributes(body)}</svg>`;
  writeFileSync(join(out, `${name}.svg`), svg);
  execFileSync('rsvg-convert', [join(out, `${name}.svg`), '-o', join(out, `${name}.png`)]);
}

function renderCairo(name) {
  execFileSync('cairosvg', [join(out, `${name}.svg`), '-o', join(out, `${name}.png`), '-s', '2']);
}

function normalizeLocaleFonts(svg, locale) {
  if (locale === 'ko') {
    return svg
      .replaceAll('"Architects Daughter"', '"goorm Sans"')
      .replaceAll('"Comic Mono"', '"goorm Sans Code","goorm Sans"')
      .replaceAll('"Comic Sans MS","Comic Sans","Comic Neue",Arial,sans-serif', '"goorm Sans Code","goorm Sans"')
      .replaceAll('"Comic Sans MS","Comic Sans","Comic Neue"', '"goorm Sans Code","goorm Sans"')
    .replaceAll('"Comic Sans MS","Comic Sans","Comic Neue",sans-serif', '"goorm Sans Code","goorm Sans"')
    .replaceAll('markerUnits="strokeWidth"', 'markerUnits="userSpaceOnUse"');
  }
  return svg
    .replaceAll('"Architects Daughter","Comic Sans MS","Comic Sans",cursive', '"Architects Daughter"')
    .replaceAll('"Comic Sans MS","Comic Sans","Comic Neue",Arial,sans-serif', '"Comic Mono"')
    .replaceAll('"Comic Sans MS","Comic Sans","Comic Neue"', '"Comic Mono"')
    .replaceAll('"Comic Sans MS","Comic Sans","Comic Neue",sans-serif', '"Comic Mono"')
    .replaceAll('markerUnits="strokeWidth"', 'markerUnits="userSpaceOnUse"');
}

function applyDarkTheme(svg) {
  return svg
    .replaceAll('#fbfcf8', '#0B1220')
    .replaceAll('#ffffff', '#0F1E33')
    .replaceAll('#f8f1e6', '#2D2415')
    .replaceAll('#eef7f5', '#102B2D')
    .replaceAll('#f3ecdf', '#2D2415')
    .replaceAll('#eaf4f8', '#102A43')
    .replaceAll('#fff4df', '#332812')
    .replaceAll('#eef7f0', '#142C22')
    .replaceAll('#fff0f0', '#351923')
    .replaceAll('#fff7e8', '#332812')
    .replaceAll('#263238', '#F5F9FF')
    .replaceAll('#1f3138', '#F5F9FF')
    .replaceAll('#223238', '#F5F9FF')
    .replaceAll('#34454d', '#D7E3F5')
    .replaceAll('#36464f', '#D7E3F5')
    .replaceAll('#3b4d55', '#D7E3F5')
    .replaceAll('#546a73', '#B8C7DD')
    .replaceAll('#5a6b72', '#B8C7DD')
    .replaceAll('#60727d', '#8EA6C4')
    .replaceAll('#41545d', '#284766')
    .replaceAll('#40545d', '#284766')
    .replaceAll('#546e7a', '#365979')
    .replaceAll('#9aaab1', '#55718F')
    .replaceAll('#ccd7da', '#284766')
    .replaceAll('#d7e0e4', '#365979')
    .replaceAll('#9cc2d1', '#4F83B0')
    .replaceAll('#d0b078', '#8F6F2C')
    .replaceAll('#b6c9a4', '#4D7B5E')
    .replaceAll('#d99a9a', '#9F5365')
    .replaceAll('#c8b38f', '#8F6F2C')
    .replaceAll('#3f7d9c', '#78AFFF')
    .replaceAll('#a2743d', '#F2B84B')
    .replaceAll('#6e8f4f', '#6FD28C')
    .replaceAll('#b55f5f', '#FF7F95')
    .replaceAll('#9b7d54', '#EFC46B')
    .replaceAll('#78909c', '#78AFFF')
    .replaceAll('#2f6f8e', '#9DC7FF')
    .replaceAll('#855a29', '#F5C76A')
    .replaceAll('#55783f', '#8DE3A6')
    .replaceAll('#994b4b', '#FF9BAD')
    .replaceAll('#7f6038', '#F5CF7A')
    .replaceAll('#6c9f96', '#4ECBC4')
    .replaceAll('#4f86c6', '#78AFFF')
    .replaceAll('#5b8e51', '#6FD28C')
    .replaceAll('#1A1A1A', '#F5F9FF')
    .replaceAll('#F6F9FC', '#0B1220')
    .replaceAll('#F7F9FC', '#0B1220')
    .replaceAll('#FFFFFF', '#0F1E33')
    .replaceAll('#FBFDFF', '#101C2F')
    .replaceAll('#F3F7FB', '#0D1A2B')
    .replaceAll('#F5F7FA', '#1E293B')
    .replaceAll('#F2F5F9', '#1E293B')
    .replaceAll('#EEF4F9', '#16263A')
    .replaceAll('#E8F3FF', colors.blue[0])
    .replaceAll('#E7F1FF', colors.blue[0])
    .replaceAll('#E9F7F6', colors.teal[0])
    .replaceAll('#E6F7F5', colors.teal[0])
    .replaceAll('#EAF7EF', colors.green[0])
    .replaceAll('#EAF7ED', colors.green[0])
    .replaceAll('#FFF3D9', colors.amber[0])
    .replaceAll('#FFF3D8', colors.amber[0])
    .replaceAll('#FDECEF', colors.rose[0])
    .replaceAll('#FCECEF', colors.rose[0])
    .replaceAll('#F1ECFF', colors.purple[0])
    .replaceAll('#D6E2ED', '#284766')
    .replaceAll('#D9E4EF', '#284766')
    .replaceAll('#C7D7E7', '#284766')
    .replaceAll('#D7E2EC', '#2D4968')
    .replaceAll('#B9C7D8', '#55718F')
    .replaceAll('#CAD6E4', '#2F4B67')
    .replaceAll('#22344A', '#F5F9FF')
    .replaceAll('#21334A', '#F5F9FF')
    .replaceAll('#34465B', '#D7E3F5')
    .replaceAll('#42556B', '#D7E3F5')
    .replaceAll('#536476', '#B8C7DD')
    .replaceAll('#657386', '#B8C7DD')
    .replaceAll('#627184', '#B8C7DD')
    .replaceAll('#536C85', '#78AFFF')
    .replaceAll('#5A85D6', colors.blue[1])
    .replaceAll('#5B8DEF', colors.blue[1])
    .replaceAll('#38A69E', colors.teal[1])
    .replaceAll('#45A7A1', colors.teal[1])
    .replaceAll('#58A978', colors.green[1])
    .replaceAll('#D6A441', colors.amber[1])
    .replaceAll('#DC6B82', colors.rose[1])
    .replaceAll('#8A72D6', colors.purple[1])
    .replaceAll('#8FA1B3', colors.neutral[1])
    .replaceAll('#9AA8B8', colors.neutral[1])
    .replaceAll('#2E8F89', colors.teal[1])
    .replaceAll('#3E9868', colors.green[1])
    .replaceAll('#C94D68', colors.rose[1])
    .replaceAll('#B9851B', colors.amber[1])
    .replaceAll('flood-color="#203040" flood-opacity="0.10"', 'flood-color="#020617" flood-opacity="0.42"')
    .replaceAll('flood-color="#1D3148" flood-opacity="0.12"', 'flood-color="#020617" flood-opacity="0.42"');
}

function translateSvg(svg, translations, name) {
  let localized = svg;
  for (const [from, to] of Object.entries(translations).sort((left, right) => right[0].length - left[0].length)) {
    if (!localized.includes(from)) {
      throw new Error(`${name}: translation source not found: ${from}`);
    }
    localized = localized.replaceAll(from, to);
  }
  return localized;
}

function adjustKoreanLayout(name, svg) {
  if (name !== 'bluetape4k-exposed-readme-overview') return svg;
  return svg
    .replace(
      '<g id="node-예제" data-node="예제" transform="translate(1350,985)">\n    <rect class="shape" x="0" y="0" width="165" height="76"',
      '<g id="node-예제" data-node="예제" transform="translate(1315,985)">\n    <rect class="shape" x="0" y="0" width="250" height="76"',
    )
    .replace(
      '<text class="card-title" x="82.5" y="19" text-anchor="middle" dominant-baseline="middle">예제</text>',
      '<text class="card-title" x="125" y="19" text-anchor="middle" dominant-baseline="middle">예제</text>',
    )
    .replace(
      '<text class="detail" x="82.5" y="38" text-anchor="middle" dominant-baseline="middle">BigQuery 모의 실행</text>',
      '<text class="detail" x="125" y="38" text-anchor="middle" dominant-baseline="middle">BigQuery 모의 실행</text>',
    )
    .replace(
      '<text class="detail" x="82.5" y="57" text-anchor="middle" dominant-baseline="middle">ClickHouse OLTP/OLAP</text>',
      '<text class="detail" x="125" y="57" text-anchor="middle" dominant-baseline="middle">ClickHouse OLTP/OLAP</text>',
    );
}

function writeLocalePair(name, translations) {
  const canonicalPath = join(out, `${name}.svg`);
  const sourcePath = existsSync(canonicalPath) ? canonicalPath : join(out, `${name}-en.svg`);
  const source = stripUnusedArrow(normalizeSequencePorts(name, readFileSync(sourcePath, 'utf8')));
  writeFileSync(join(out, `${name}-en.svg`), applyDarkTheme(normalizeLocaleFonts(source, 'en')));
  renderCairo(`${name}-en`);
  writeFileSync(
    join(out, `${name}-ko.svg`),
    applyDarkTheme(adjustKoreanLayout(name, normalizeLocaleFonts(translateSvg(source, translations, name), 'ko'))),
  );
  renderCairo(`${name}-ko`);
}

function dot(name, source, finalNodes) {
  writeFileSync(join(out, `${name}.dot`), source);
  execFileSync('dot', ['-Tplain', join(out, `${name}.dot`), '-o', join(out, `${name}.plain`)]);
  if (process.env.EXPOSED_GENERATE_SKETCHES === '1') {
    execFileSync('dot', ['-Tsvg', join(out, `${name}.dot`), '-o', join(out, `${name}-sketch.svg`)]);
    execFileSync('rsvg-convert', [join(out, `${name}-sketch.svg`), '-o', join(out, `${name}-sketch.png`)]);
  }
  const graphNodes = Array.from(source.matchAll(/^\s*([a-z][a-z0-9_]*)\s*->/gm), (match) => match[1]);
  const targetNodes = Array.from(source.matchAll(/->\s*([a-z][a-z0-9_]*)/g), (match) => match[1]);
  const nodes = [...new Set([...graphNodes, ...targetNodes])].sort();
  const missingFinalNodes = nodes.filter((node) => !finalNodes.includes(node));
  const extraFinalNodes = finalNodes.filter((node) => !nodes.includes(node));
  if (missingFinalNodes.length || extraFinalNodes.length) {
    throw new Error(`${name}: Graphviz/final node mismatch. missing=${missingFinalNodes.join(',')} extra=${extraFinalNodes.join(',')}`);
  }
  writeFileSync(
    join(out, `${name}-graphviz-summary.txt`),
    [
      `asset: ${name}`,
      `graphviz_nodes: ${nodes.length}`,
      `final_nodes: ${finalNodes.length}`,
      `missing_final_nodes: ${missingFinalNodes.length}`,
      `extra_final_nodes: ${extraFinalNodes.length}`,
      'rank_order: mirrored in final SVG',
      'route_exceptions: none',
      '',
    ].join('\n'),
  );
}

diagram('bluetape4k-exposed-part1-choice-journey', 'Why Exposed Became the Default', 'The path starts with async pressure, then narrows by SQL safety, Kotlin fit, and operations.', `
<g transform="translate(72 170)">
  ${card(0, 182, 210, 124, 'neutral', 'Traffic Pressure', ['more requests', 'same database'])}
  ${card(300, 46, 238, 118, 'rose', 'WebFlux + JDBC', ['event loop waits', 'reactor meltdown risk'])}
  ${card(300, 318, 238, 118, 'amber', 'NoSQL Detour', ['useful in niches', 'schema changes still hurt'])}
  ${card(620, 0, 252, 118, 'purple', 'R2DBC / Vert.x', ['real non-blocking I/O', 'SQL strings or Reactor cost'])}
  ${card(620, 182, 252, 118, 'green', 'Virtual Threads', ['keep JDBC drivers', 'simpler call stacks'])}
  ${card(620, 364, 252, 118, 'blue', 'Exposed DSL', ['type-safe SQL', 'Kotlin-first model'])}
  ${card(980, 92, 260, 124, 'teal', 'bluetape4k-exposed', ['JDBC + R2DBC repositories', 'cache, JSON, encryption'])}
  ${card(980, 314, 260, 124, 'green', 'Production Path', ['workshops + benchmarks', 'tenant/cache examples'])}
  <path class="line" d="M210 244 C260 244 250 106 300 106"/>
  <path class="line" d="M210 244 C260 244 250 376 300 376"/>
  <path class="line" d="M538 106 H620"/>
  <path class="line" d="M538 376 C586 376 572 424 620 424"/>
  <path class="line" d="M872 58 C930 58 920 154 980 154"/>
  <path class="line" d="M872 240 C930 240 920 154 980 154"/>
  <path class="line" d="M872 424 C930 424 920 376 980 376"/>
  <path class="line" d="M1240 154 C1290 154 1290 376 1240 376"/>
</g>`);

function barChart(name, title, subtitle, data, axisMax, unit, width = 1280, height = 680) {
  const left = 360;
  const top = 166;
  const barH = 36;
  const gap = 42;
  const plotW = 780;
  const axisY = top + data.length * (barH + gap) + 10;
  const rows = data.map((item, i) => {
    const y = top + i * (barH + gap);
    const w = Math.max(20, (item.value / axisMax) * plotW);
    return `<text class="body" x="92" y="${y + barH / 2}" dominant-baseline="middle">${esc(item.label)}</text>
<rect x="${left}" y="${y}" width="${plotW}" height="${barH}" rx="10" fill="#EEF4F9" stroke="#D7E2EC"/>
<rect class="card" x="${left}" y="${y}" width="${w}" height="${barH}" rx="10" fill="${item.color}" stroke="${item.color}"/>
<text class="body" x="${left + w + 14}" y="${y + barH / 2}" dominant-baseline="middle">${esc(item.display)} ${esc(unit)}</text>`;
  }).join('\n');
  const svg = `${base(width, height, title, subtitle)}
<g>
  <line class="axis" x1="${left}" y1="${axisY}" x2="${left + plotW}" y2="${axisY}"/>
  <line class="grid" x1="${left}" y1="${top - 10}" x2="${left}" y2="${axisY}"/>
  <line class="grid" x1="${left + plotW / 2}" y1="${top - 10}" x2="${left + plotW / 2}" y2="${axisY}"/>
  <line class="grid" x1="${left + plotW}" y1="${top - 10}" x2="${left + plotW}" y2="${axisY}"/>
  ${rows}
  <text class="tiny" x="${left}" y="${axisY + 26}" text-anchor="middle">0</text>
  <text class="tiny" x="${left + plotW / 2}" y="${axisY + 26}" text-anchor="middle">${axisMax / 2}</text>
  <text class="tiny" x="${left + plotW}" y="${axisY + 26}" text-anchor="middle">${axisMax}</text>
</g>
</svg>`;
  writeFileSync(join(out, `${name}.svg`), svg);
  execFileSync('rsvg-convert', [join(out, `${name}.svg`), '-o', join(out, `${name}.png`)]);
}

function groupedBarChart(
  name,
  title,
  subtitle,
  groups,
  axisMax,
  unit,
  width = 1400,
  height = 760,
  seriesLabels = ['Exposed', 'JPA / R2DBC'],
  layout = {},
) {
  const left = layout.left ?? 290;
  const top = layout.top ?? 164;
  const plotW = layout.plotW ?? 850;
  const groupGap = layout.groupGap ?? 72;
  const barH = 28;
  const colors = ['#75A9E8', '#DB7890'];
  const rows = groups.map((group, i) => {
    const y = top + i * groupGap;
    const firstW = Math.max(8, (group.values[0] / axisMax) * plotW);
    const secondW = Math.max(8, (group.values[1] / axisMax) * plotW);
    return `<text class="body" x="90" y="${y + 32}" dominant-baseline="middle">${esc(group.label)}</text>
<rect x="${left}" y="${y}" width="${plotW}" height="${barH}" rx="8" fill="#EEF4F9" stroke="#D7E2EC"/>
<rect class="card" x="${left}" y="${y}" width="${firstW}" height="${barH}" rx="8" fill="${colors[0]}" stroke="${colors[0]}"/>
<text class="body" x="${left + firstW + 12}" y="${y + barH / 2}" dominant-baseline="middle">${esc(group.displays[0])}</text>
<rect x="${left}" y="${y + 34}" width="${plotW}" height="${barH}" rx="8" fill="#EEF4F9" stroke="#D7E2EC"/>
<rect class="card" x="${left}" y="${y + 34}" width="${secondW}" height="${barH}" rx="8" fill="${colors[1]}" stroke="${colors[1]}"/>
<text class="body" x="${left + secondW + 12}" y="${y + 34 + barH / 2}" dominant-baseline="middle">${esc(group.displays[1])}</text>`;
  }).join('\n');
  const axisY = top + groups.length * groupGap + 16;
  const svg = `${base(width, height, title, subtitle)}
<g>
  <line class="axis" x1="${left}" y1="${axisY}" x2="${left + plotW}" y2="${axisY}"/>
  <line class="grid" x1="${left}" y1="${top - 12}" x2="${left}" y2="${axisY}"/>
  <line class="grid" x1="${left + plotW / 2}" y1="${top - 12}" x2="${left + plotW / 2}" y2="${axisY}"/>
  <line class="grid" x1="${left + plotW}" y1="${top - 12}" x2="${left + plotW}" y2="${axisY}"/>
  <text class="body" x="${left}" y="142" fill="${colors[0]}">${esc(seriesLabels[0])}</text>
  <text class="body" x="${left + 130}" y="142" fill="${colors[1]}">${esc(seriesLabels[1])}</text>
  ${rows}
  <text class="tiny" x="${left}" y="${axisY + 26}" text-anchor="middle">0</text>
  <text class="tiny" x="${left + plotW / 2}" y="${axisY + 26}" text-anchor="middle">${axisMax / 2}</text>
  <text class="tiny" x="${left + plotW}" y="${axisY + 26}" text-anchor="middle">${axisMax} ${esc(unit)}</text>
</g>
</svg>`;
  writeFileSync(join(out, `${name}.svg`), svg);
  execFileSync('rsvg-convert', [join(out, `${name}.svg`), '-o', join(out, `${name}.png`)]);
}

barChart('bluetape4k-exposed-part1-virtual-thread-chart', 'Virtual Threads for JDBC Workloads', 'Representative measured improvements from the workshop benchmark note.', [
  { label: 'indexed SELECT', value: 2.54, display: '2.54x', color: '#75A9E8' },
  { label: 'complex UPDATE + GROUP BY', value: 1.79, display: '1.79x', color: '#69B888' },
  { label: '+10ms I/O latency', value: 2.27, display: '2.27x', color: '#D9AA4D' },
  { label: 'CPU bound work', value: 1.03, display: '1.03x', color: '#DB7890' },
], 3, 'improvement', 1280, 560);

barChart('bluetape4k-exposed-part1-jdbc-benchmark-chart', 'Exposed JDBC Benchmark Throughput', 'PostgreSQL Testcontainers, HikariCP max 24, JMH throughput.', [
  { label: 'singleFindById', value: 15000, display: '15,000', color: '#75A9E8' },
  { label: 'singleInsert', value: 14400, display: '14,400', color: '#69B888' },
  { label: 'singleUpdate', value: 14300, display: '14,300', color: '#D9AA4D' },
  { label: 'joinQuery', value: 1510, display: '1,510', color: '#55B5AF' },
  { label: 'batchInsert', value: 217, display: '217', color: '#DB7890' },
], 16000, 'ops/s');

groupedBarChart('bluetape4k-exposed-part1-jpa-comparison-chart', 'Exposed vs JPA Single Entity CRUD', 'PostgreSQL Testcontainers, JMH average latency. Lower is better.', [
  { label: 'create', values: [1196, 4623], displays: ['1,196 us', '4,623 us'] },
  { label: 'read', values: [1972, 11602], displays: ['1,972 us', '11,602 us'] },
  { label: 'update', values: [1980, 15278], displays: ['1,980 us', '15,278 us'] },
  { label: 'delete', values: [1945, 12059], displays: ['1,945 us', '12,059 us'] },
  { label: 'batchCreate(100)', values: [51203, 423816], displays: ['51,203 us', '423,816 us'] },
], 430000, 'us', 1240, 600, ['Exposed', 'JPA'], { left: 260, top: 150, plotW: 780, groupGap: 64 });

dot('bluetape4k-exposed-part1-choice-journey', `
digraph {
  rankdir=LR;
  traffic -> webflux_jdbc;
  traffic -> nosql;
  webflux_jdbc -> r2dbc_vertx;
  webflux_jdbc -> virtual_threads;
  nosql -> exposed_dsl;
  r2dbc_vertx -> bt4k_exposed;
  virtual_threads -> bt4k_exposed;
  exposed_dsl -> bt4k_exposed;
  bt4k_exposed -> production;
}
`, ['traffic', 'webflux_jdbc', 'nosql', 'r2dbc_vertx', 'virtual_threads', 'exposed_dsl', 'bt4k_exposed', 'production']);

diagram('bluetape4k-exposed-part2-jdbc-repository-flow', 'JDBC Repository Flow', 'Keep transaction boundaries explicit while repository helpers remove repeated paging and soft-delete code.', `
<g transform="translate(80 174)">
  ${card(0, 218, 236, 118, 'blue', 'Service Method', ['transaction boundary', 'domain intent'])}
  ${card(344, 64, 270, 118, 'green', 'Exposed DSL', ['select · insert · update', 'where · join · CTE'])}
  ${card(344, 354, 270, 118, 'purple', 'JdbcRepository', ['findById · findPage', 'soft delete · audit'])}
  ${card(738, 64, 270, 118, 'amber', 'ResultRow Mapper', ['typed columns', 'domain record'])}
  ${card(738, 354, 270, 118, 'rose', 'Virtual Thread Tx', ['blocking JDBC', 'cheap waiting'])}
  ${card(1116, 218, 236, 118, 'teal', 'Database', ['PostgreSQL · MySQL', 'H2 · testcontainers'])}
  <path class="line" d="M236 276 C290 276 288 122 344 122"/>
  <path class="line" d="M236 276 C290 276 288 412 344 412"/>
  <path class="line" d="M614 122 H738"/>
  <path class="line" d="M614 412 H738"/>
  <path class="line" d="M1008 122 C1070 122 1052 276 1116 276"/>
  <path class="line" d="M1008 412 C1070 412 1052 304 1116 304"/>
</g>`);

diagram('bluetape4k-exposed-part3-execution-models', 'Execution Models for Exposed', 'Choose JDBC + Virtual Threads or R2DBC + Coroutines by workload, driver path, and streaming needs.', `
<g transform="translate(80 172)">
  ${card(0, 228, 236, 116, 'neutral', 'Request', ['MVC · WebFlux · Ktor'])}
  ${card(330, 68, 278, 128, 'green', 'JDBC + Virtual Threads', ['mature driver path', 'simple stack traces'])}
  ${card(330, 388, 278, 128, 'purple', 'R2DBC + Coroutines', ['suspend · Flow', 'backpressure path'])}
  ${card(740, 68, 270, 128, 'amber', 'Batch / CRUD', ['measure round-trips', 'pool and indexes matter'])}
  ${card(740, 388, 270, 128, 'teal', 'Streaming / Reactive', ['row flow', 'event-loop friendly'])}
  ${card(1120, 228, 236, 116, 'blue', 'Decision', ['workload first', 'benchmark second'])}
  <path class="line" d="M236 286 C286 286 278 132 330 132"/>
  <path class="line" d="M236 286 C286 286 278 452 330 452"/>
  <path class="line" d="M608 132 H740"/>
  <path class="line" d="M608 452 H740"/>
  <path class="line" d="M1010 132 C1076 132 1054 286 1120 286"/>
  <path class="line" d="M1010 452 C1076 452 1054 314 1120 314"/>
</g>`);

diagram('bluetape4k-exposed-part4-codec-dialect-map', 'Columns and Dialects Map', 'Move repeated database-specific details into typed columns and small dialect modules.', `
<g transform="translate(80 170)">
  ${card(0, 236, 230, 112, 'blue', 'Domain Model', ['settings · metadata', 'secret · location'])}
  ${card(342, 54, 260, 116, 'green', 'JSON Codecs', ['Jackson2/3', 'Fastjson2'])}
  ${card(342, 236, 260, 116, 'rose', 'Encrypted Columns', ['Tink AEAD', 'Deterministic AEAD'])}
  ${card(342, 418, 260, 116, 'purple', 'Measured Columns', ['quantity + unit', 'typed value'])}
  ${card(742, 54, 260, 116, 'amber', 'PostgreSQL', ['PostGIS · pgvector', 'range columns'])}
  ${card(742, 236, 260, 116, 'teal', 'MySQL 8', ['JTS geometry', 'spatial predicates'])}
  ${card(742, 418, 260, 116, 'neutral', 'Analytics Dialects', ['BigQuery · ClickHouse', 'Trino · DuckDB'])}
  ${card(1120, 236, 230, 112, 'green', 'SQL DSL', ['type checks', 'less string glue'])}
  <path class="line" d="M230 292 C288 292 284 112 342 112"/>
  <path class="line" d="M230 292 H342"/>
  <path class="line" d="M230 292 C288 292 284 476 342 476"/>
  <path class="line" d="M602 112 H742"/>
  <path class="line" d="M602 292 H742"/>
  <path class="line" d="M602 476 H742"/>
  <path class="line" d="M1002 112 C1068 112 1054 292 1120 292"/>
  <path class="line" d="M1002 292 H1120"/>
  <path class="line" d="M1002 476 C1068 476 1054 320 1120 320"/>
</g>`);

diagram('bluetape4k-exposed-part5-production-boundary', 'Production Boundary', 'Cache, tenancy, outbox, and Spring wiring must be designed and measured together.', `
<g transform="translate(80 170)">
  ${card(0, 232, 230, 112, 'blue', 'HTTP Request', ['tenant header', 'idempotency key'])}
  ${card(330, 54, 260, 116, 'green', 'Spring Boot Wiring', ['JDBC/R2DBC auto-config', 'repository scanning'])}
  ${card(330, 232, 260, 116, 'amber', 'Cache Strategy', ['read-through', 'write-through/behind'])}
  ${card(330, 410, 260, 116, 'purple', 'Tenant Context', ['ThreadLocal · ScopedValue', 'Reactor Context'])}
  ${card(730, 54, 260, 116, 'rose', 'Outbox / Idempotency', ['pending record first', 'duplicate key boundary'])}
  ${card(730, 232, 260, 116, 'teal', 'Repository Layer', ['Exposed transaction', 'cache key includes tenant'])}
  ${card(730, 410, 260, 116, 'neutral', 'Observability', ['hit/miss counters', 'tenant leakage tests'])}
  ${card(1110, 232, 240, 112, 'green', 'Measured Service', ['charts + tests', 'safe defaults'])}
  <path class="line" d="M230 288 C288 288 272 112 330 112"/>
  <path class="line" d="M230 288 H330"/>
  <path class="line" d="M230 288 C288 288 272 468 330 468"/>
  <path class="line" d="M590 112 H730"/>
  <path class="line" d="M590 288 H730"/>
  <path class="line" d="M590 468 H730"/>
  <path class="line" d="M990 112 C1058 112 1040 288 1110 288"/>
  <path class="line" d="M990 288 H1110"/>
  <path class="line" d="M990 468 C1058 468 1040 316 1110 316"/>
</g>`);

groupedBarChart('bluetape4k-exposed-part3-batch-comparison-chart', 'Large Batch E2E: JDBC vs R2DBC', 'dataSize=100000, parallelism=8, ops/sec from batch benchmark notes. Higher is better.', [
  { label: 'MySQL pool=10', values: [1.596, 0.181], displays: ['1.596 ops/s', '0.181 ops/s'] },
  { label: 'MySQL pool=30', values: [1.561, 0.182], displays: ['1.561 ops/s', '0.182 ops/s'] },
  { label: 'MySQL pool=60', values: [1.525, 0.182], displays: ['1.525 ops/s', '0.182 ops/s'] },
  { label: 'PostgreSQL pool=10', values: [0.972, 0.192], displays: ['0.972 ops/s', '0.192 ops/s'] },
  { label: 'PostgreSQL pool=30', values: [0.990, 0.192], displays: ['0.990 ops/s', '0.192 ops/s'] },
  { label: 'PostgreSQL pool=60', values: [0.951, 0.193], displays: ['0.951 ops/s', '0.193 ops/s'] },
], 1.7, 'ops/s', 1260, 700, ['JDBC + VT', 'R2DBC']);

barChart('bluetape4k-exposed-part5-cache-read-chart', 'Cache Read Throughput', '2026-07-27 Spring Boot cache benchmark, warmed findById, ops/sec.', [
  { label: 'No Cache', value: 320764.485, display: '320,764', color: '#8FA1B3' },
  { label: 'Caffeine', value: 3058547.710, display: '3,058,548', color: '#75A9E8' },
  { label: 'Redis Cache', value: 4030.965, display: '4,031', color: '#69B888' },
  { label: 'Near Cache', value: 3287505.143, display: '3,287,505', color: '#D9AA4D' },
  { label: 'Read-Through', value: 4090.132, display: '4,090', color: '#55B5AF' },
  { label: 'Write-Through', value: 4099.116, display: '4,099', color: '#8A72D6' },
  { label: 'Write-Behind', value: 4194.350, display: '4,194', color: '#DB7890' },
], 3400000, 'ops/s', 1280, 800);

barChart('bluetape4k-exposed-part5-cache-write-chart', 'Cache Write Completion Boundaries', '2026-07-27 benchmark. Compare only operations with the same completion boundary.', [
  { label: 'Write-Behind accepted', value: 3551.936, display: '3,552', color: '#DB7890' },
  { label: 'Write-Through persisted', value: 3034.323, display: '3,034', color: '#8A72D6' },
  { label: 'Write-Behind drained', value: 0.988, display: '0.988', color: '#69B888' },
], 3800, 'ops/s');

dot('bluetape4k-exposed-part2-jdbc-repository-flow', `
digraph {
  rankdir=LR;
  service -> dsl;
  service -> repository;
  dsl -> mapper;
  repository -> virtual_thread_tx;
  mapper -> database;
  virtual_thread_tx -> database;
}
`, ['service', 'dsl', 'repository', 'mapper', 'virtual_thread_tx', 'database']);

dot('bluetape4k-exposed-part3-execution-models', `
digraph {
  rankdir=LR;
  request -> jdbc_vt;
  request -> r2dbc_coroutines;
  jdbc_vt -> batch_crud;
  r2dbc_coroutines -> streaming;
  batch_crud -> decision;
  streaming -> decision;
}
`, ['request', 'jdbc_vt', 'r2dbc_coroutines', 'batch_crud', 'streaming', 'decision']);

dot('bluetape4k-exposed-part4-codec-dialect-map', `
digraph {
  rankdir=LR;
  domain -> json_codecs;
  domain -> encrypted_columns;
  domain -> measured_columns;
  json_codecs -> postgresql;
  encrypted_columns -> mysql8;
  measured_columns -> analytics;
  postgresql -> sql_dsl;
  mysql8 -> sql_dsl;
  analytics -> sql_dsl;
}
`, ['domain', 'json_codecs', 'encrypted_columns', 'measured_columns', 'postgresql', 'mysql8', 'analytics', 'sql_dsl']);

dot('bluetape4k-exposed-part5-production-boundary', `
digraph {
  rankdir=LR;
  request -> spring_boot_wiring;
  request -> cache_strategy;
  request -> tenant_context;
  spring_boot_wiring -> outbox_idempotency;
  cache_strategy -> repository_layer;
  tenant_context -> observability;
  outbox_idempotency -> measured_service;
  repository_layer -> measured_service;
  observability -> measured_service;
}
`, ['request', 'spring_boot_wiring', 'cache_strategy', 'tenant_context', 'outbox_idempotency', 'repository_layer', 'observability', 'measured_service']);

const localeTranslations = {
  'bluetape4k-exposed-readme-overview': {
    'Bluetape4k Exposed Repository Overview': 'Bluetape4k Exposed 저장소 개요',
    'Repository overview rebuilt from root README features, module table, and settings.gradle.kts project mapping.': '루트 README의 기능, 모듈 표, settings.gradle.kts 프로젝트 구성을 바탕으로 다시 만든 저장소 개요입니다.',
    'A production-oriented Exposed toolkit grouped by repository runtime, cache strategy, column extensions, database dialects, and Spring Boot integration.': '저장소 실행 환경, 캐시 전략, 컬럼 확장, 데이터베이스 다이얼렉트, Spring Boot 통합으로 구성한 운영 지향 Exposed 도구 모음입니다.',
    'Foundation and repository runtime': '기반 모듈과 저장소 실행 환경',
    'Cache decorators': '캐시 데코레이터',
    'Column and value extensions': '컬럼과 값 확장',
    'Database dialect and analytics connectors': '데이터베이스 다이얼렉트와 분석 커넥터',
    'Column types, DSL helpers': '컬럼 타입, DSL 도우미',
    'auditable tables, CTE, paging': '감사 테이블, CTE, 페이징',
    'DAO entity extensions': 'DAO 엔티티 확장',
    'audit lifecycle hooks': '감사 생명주기 훅',
    'blocking repository': '블로킹 저장소',
    'Exposed transaction': 'Exposed 트랜잭션',
    'coroutine repository': '코루틴 저장소',
    'suspend transaction': 'suspend 트랜잭션',
    'test fixtures': '테스트 픽스처',
    'JDBC and R2DBC test bases': 'JDBC와 R2DBC 테스트 기반',
    'container-backed verification': '컨테이너 기반 검증',
    'cache repository contracts': '캐시 저장소 계약',
    'mode and resilience config': '모드와 복원력 설정',
    'Caffeine modules': 'Caffeine 모듈',
    'JDBC + local cache': 'JDBC + 로컬 캐시',
    'R2DBC + local cache': 'R2DBC + 로컬 캐시',
    'Redis modules': 'Redis 모듈',
    'Lettuce and Redisson': 'Lettuce와 Redisson',
    'JDBC + R2DBC variants': 'JDBC + R2DBC 변형',
    'chunked batch execution': '분할 배치 실행',
    'benchmark hub': '벤치마크 모음',
    'JSON columns': 'JSON 컬럼',
    'encrypted columns': '암호화 컬럼',
    'searchable deterministic path': '검색 가능한 결정적 암호화',
    'measured columns': '측정값 컬럼',
    'unit-aware values': '단위를 포함한 값',
    'storage conversion': '저장 형식 변환',
    'Timefold persistence': 'Timefold persistence',
    'solver score storage': '솔버 점수 저장',
    'Exposed persistence helpers': 'Exposed 영속성 도우미',
    'SQL dialect modules': 'SQL 다이얼렉트 모듈',
    'analytics connectors': '분석 커넥터',
    'Spring Boot modules': 'Spring Boot 모듈',
    'Spring Modulith events': 'Spring Modulith 이벤트',
    'examples': '예제',
    'BigQuery dry run': 'BigQuery 모의 실행',
    'Start with exposed-jdbc or exposed-r2dbc, then add cache, column codecs, dialect modules, or Spring Boot integration only where the data path needs them.': 'exposed-jdbc 또는 exposed-r2dbc에서 시작하고, 데이터 경로에 필요한 캐시, 컬럼 코덱, 다이얼렉트 모듈, Spring Boot 통합만 추가합니다.',
    'BOM aligns dependency versions; it is not shown as a runtime component.': 'BOM은 의존성 버전을 정렬하므로 실행 구성 요소로 그리지 않습니다.',
  },
  'bluetape4k-exposed-part1-choice-journey': {
    'Why Exposed Became the Default': '왜 Exposed가 기본 선택이 되었나',
    'The path starts with async pressure, then narrows by SQL safety, Kotlin fit, and operations.': '비동기 처리 압박에서 시작해 SQL 안전성, Kotlin 적합성, 운영성 기준으로 선택지를 좁힙니다.',
    'Traffic Pressure': '트래픽 압박',
    'more requests': '요청 증가',
    'same database': '같은 데이터베이스',
    'event loop waits': '이벤트 루프 대기',
    'reactor meltdown risk': 'Reactor 과부하 위험',
    'NoSQL Detour': 'NoSQL 우회',
    'useful in niches': '특정 영역에 유용',
    'schema changes still hurt': '스키마 변경 부담 유지',
    'real non-blocking I/O': '실제 논블로킹 I/O',
    'SQL strings or Reactor cost': '문자열 SQL 또는 Reactor 비용',
    'keep JDBC drivers': 'JDBC 드라이버 유지',
    'simpler call stacks': '단순한 호출 스택',
    'Virtual Threads': '가상 스레드',
    'type-safe SQL': '타입 안전 SQL',
    'Kotlin-first model': 'Kotlin 우선 모델',
    'JDBC + R2DBC repositories': 'JDBC + R2DBC 저장소',
    'cache, JSON, encryption': '캐시, JSON, 암호화',
    'Production Path': '운영 경로',
    'workshops + benchmarks': '워크숍 + 벤치마크',
    'tenant/cache examples': '테넌트/캐시 예제',
  },
  'bluetape4k-exposed-part1-virtual-thread-chart': {
    'Virtual Threads for JDBC Workloads': 'JDBC 작업에서 가상 스레드의 효과',
    'Representative measured improvements from the workshop benchmark note.': '워크숍 벤치마크에서 측정한 대표 개선 수치를 요약합니다.',
    'complex UPDATE + GROUP BY': '복잡한 UPDATE + GROUP BY',
    'CPU bound work': 'CPU 중심 작업',
    'improvement': '개선 배율',
  },
  'bluetape4k-exposed-part1-jdbc-benchmark-chart': {
    'Exposed JDBC Benchmark Throughput': 'Exposed JDBC 벤치마크 처리량',
    'PostgreSQL Testcontainers, HikariCP max 24, JMH throughput.': 'PostgreSQL Testcontainers, HikariCP 최대 24, JMH 처리량입니다.',
  },
  'bluetape4k-exposed-part1-jpa-comparison-chart': {
    'Exposed vs JPA Single Entity CRUD': 'Exposed vs JPA 단건 엔티티 CRUD',
    'PostgreSQL Testcontainers, JMH average latency. Lower is better.': 'PostgreSQL Testcontainers, JMH 평균 지연 시간입니다. 낮을수록 좋습니다.',
  },
  'bluetape4k-exposed-part2-jdbc-repository-flow': {
    'JDBC Repository Flow': 'JDBC 저장소 흐름',
    'Keep transaction boundaries explicit while repository helpers remove repeated paging and soft-delete code.': '트랜잭션 경계는 명시하고, 저장소 도우미가 반복되는 페이징과 논리 삭제 코드를 줄입니다.',
    'Service Method': '서비스 메서드',
    'ResultRow Mapper': 'ResultRow 매퍼',
    'Virtual Thread Tx': '가상 스레드 Tx',
    'transaction boundary': '트랜잭션 경계',
    'domain intent': '도메인 의도',
    'cheap waiting': '낮은 대기 비용',
    'typed columns': '타입 컬럼',
    'domain record': '도메인 레코드',
    'blocking JDBC': '블로킹 JDBC',
    'PostgreSQL · MySQL': 'PostgreSQL · MySQL',
    'H2 · testcontainers': 'H2 · Testcontainers',
  },
  'bluetape4k-exposed-part3-execution-models': {
    'Execution Models for Exposed': 'Exposed 실행 모델',
    'Choose JDBC + Virtual Threads or R2DBC + Coroutines by workload, driver path, and streaming needs.': '작업 특성, 드라이버 경로, 스트리밍 요구에 따라 JDBC + 가상 스레드 또는 R2DBC + 코루틴을 고릅니다.',
    'JDBC + Virtual Threads': 'JDBC + 가상 스레드',
    'R2DBC + Coroutines': 'R2DBC + 코루틴',
    'Request': '요청',
    'Batch / CRUD': '배치 / CRUD',
    'Streaming / Reactive': '스트리밍 / 리액티브',
    'Decision': '선택',
    'row flow': 'row 흐름',
    'backpressure path': '배압 경로',
    'mature driver path': '성숙한 드라이버 경로',
    'simple stack traces': '단순한 스택 추적',
    'measure round-trips': '왕복 비용 측정',
    'pool and indexes matter': '풀과 인덱스가 중요',
    'event-loop friendly': '이벤트 루프 친화',
    'workload first': '작업 특성 우선',
    'benchmark second': '벤치마크로 검증',
  },
  'bluetape4k-exposed-part3-batch-comparison-chart': {
    'Large Batch E2E: JDBC vs R2DBC': '대형 배치 E2E: JDBC vs R2DBC',
    'dataSize=100000, parallelism=8, ops/sec from batch benchmark notes. Higher is better.': 'dataSize=100000, parallelism=8 배치 벤치마크 ops/sec입니다. 높을수록 좋습니다.',
  },
  'bluetape4k-exposed-part4-codec-dialect-map': {
    'Columns and Dialects Map': '컬럼과 데이터베이스 다이얼렉트 구성',
    'Move repeated database-specific details into typed columns and small dialect modules.': '반복되는 DB별 세부사항을 타입 컬럼과 작은 다이얼렉트 모듈로 옮깁니다.',
    'Domain Model': '도메인 모델',
    'JSON Codecs': 'JSON 코덱',
    'Encrypted Columns': '암호화 컬럼',
    'Measured Columns': '측정값 컬럼',
    'range columns': '범위 컬럼',
    'Analytics Dialects': '분석용 다이얼렉트',
    'type checks': '타입 검사',
    'less string glue': '문자열 조합 감소',
  },
  'bluetape4k-exposed-part5-production-boundary': {
    'Production Boundary': '운영 경계',
    'Cache, tenancy, outbox, and Spring wiring must be designed and measured together.': '캐시, 멀티테넌시, 아웃박스, Spring 연결은 함께 설계하고 측정해야 합니다.',
    'HTTP Request': 'HTTP 요청',
    'Spring Boot Wiring': 'Spring Boot 연결',
    'repository scanning': '저장소 스캔',
    'Cache Strategy': '캐시 전략',
    'Tenant Context': '테넌트 컨텍스트',
    'Outbox / Idempotency': '아웃박스 / 멱등성',
    'pending record first': 'pending record 먼저',
    'Repository Layer': '저장소 계층',
    'Exposed transaction': 'Exposed 트랜잭션',
    'Observability': '관측성',
    'cache key includes tenant': '캐시 키에 테넌트 포함',
    'hit/miss counters': '적중/실패 횟수',
    'tenant leakage tests': '테넌트 누출 테스트',
    'Measured Service': '측정된 서비스',
    'safe defaults': '안전한 기본값',
  },
  'bluetape4k-exposed-part5-cache-read-chart': {
    'Cache Read Throughput': '캐시 읽기 처리량',
    '2026-07-27 Spring Boot cache benchmark, warmed findById, ops/sec.': '2026-07-27 Spring Boot 캐시 벤치마크에서 예열된 findById의 ops/sec입니다.',
    'No Cache': '캐시 미사용',
    'Redis Cache': 'Redis 캐시',
    'Near Cache': '근접 캐시',
  },
  'bluetape4k-exposed-part5-cache-write-chart': {
    'Cache Write Completion Boundaries': '캐시 쓰기의 완료 경계',
    '2026-07-27 benchmark. Compare only operations with the same completion boundary.': '2026-07-27 벤치마크입니다. 완료 경계가 같은 연산끼리만 비교해야 합니다.',
    'Write-Behind accepted': 'Write-Behind 요청 수락',
    'Write-Through persisted': 'Write-Through DB 반영',
    'Write-Behind drained': 'Write-Behind 큐 비우기',
  },
  'bluetape4k-exposed-part6-bigquery-dry-run-flow': {
    'BigQuery Dry-Run Query Validation': 'BigQuery 드라이런 쿼리 검증',
    'Exposed SQL is generated locally, mapped to dryRun=true, and verified through a mocked BigQuery REST client.': 'Exposed SQL을 로컬에서 생성하고 dryRun=true로 매핑한 뒤 모의 BigQuery REST 클라이언트로 검증합니다.',
    'Workshop Test': '워크숍 테스트',
    'Exposed Query': 'Exposed 쿼리',
    'H2 Dialect': 'H2 다이얼렉트',
    'SQL generation': 'SQL 생성',
    'Assertions': '검증',
    'request + errors': '요청과 오류',
    'prepare SQL from Exposed Query': 'Exposed 쿼리에서 SQL 준비',
    'standard SQL only': '표준 SQL만 허용',
    'alt mocked dry-run result': '모의 드라이런 결과 분기',
    'success response or errors': '성공 응답 또는 오류',
    'assert request mapping and exception path': '요청 매핑과 예외 경로 검증',
    'Default path stays local: no ADC, service-account files, tokens, endpoint overrides, network calls, or billable BigQuery execution.': '기본 경로는 로컬에 머뭅니다. ADC, 서비스 계정 파일, 토큰, 엔드포인트 재정의, 네트워크 호출, 과금되는 BigQuery 실행이 없습니다.',
  },
  'bluetape4k-exposed-part6-trino-session-sequence': {
    'Trino Session Options and Pushdown Inspection': 'Trino 세션 옵션과 푸시다운 점검',
    'Typed options are validated locally, SQL is generated with Exposed, and Trino EXPLAIN is prepared without network access.': '타입이 있는 옵션을 로컬에서 검증하고 Exposed로 SQL을 만든 뒤 네트워크 없이 Trino EXPLAIN 요청을 준비합니다.',
    'Workshop Test': '워크숍 테스트',
    'JUnit local path': 'JUnit 로컬 경로',
    'Trino Profile': 'Trino 프로필',
    'validated inputs': '검증된 입력',
    'Trino Options': 'Trino 옵션',
    'H2 Dialect': 'H2 다이얼렉트',
    'SQL generation': 'SQL 생성',
    'request shape': '요청 형태',
    'validate catalog, schema, source, tags, session properties': '카탈로그·스키마·소스·태그·세션 속성 검증',
    'prepareSQL in local H2 transaction': '로컬 H2 트랜잭션에서 prepareSQL',
    'SELECT with predicate, order, top-N': '조건식·정렬·top-N을 포함한 SELECT',
    'request-shape only': '요청 형태만 확인',
    'Default path stays local: no Trino endpoint, credentials, network calls, live connector, or pushdown result assertion.': '기본 경로는 로컬에 머뭅니다. Trino 엔드포인트, 인증 정보, 네트워크 호출, 실제 커넥터, 푸시다운 결과 검증이 없습니다.',
  },
  'bluetape4k-exposed-part6-cockroachdb-retry-sequence': {
    'CockroachDB Serializable Retry': 'CockroachDB 직렬화 충돌 재시도',
    'Whole inventory reservation transactions are retried only for CockroachDB restart-transaction errors.': 'CockroachDB 트랜잭션 재시작 오류일 때만 전체 재고 예약 트랜잭션을 재시도합니다.',
    'Workshop Test': '워크숍 테스트',
    'Inventory Service': '재고 서비스',
    'application boundary': '애플리케이션 경계',
    'Retry Helper': '재시도 도우미',
    'one attempt': '단일 시도',
    'Database backed by PostgreSQL JDBC': 'PostgreSQL JDBC 기반 데이터베이스',
    'bootstrap inventory and ledger schema': '재고·원장 스키마 초기화',
    'begin SERIALIZABLE attempt, maxAttempts=1': 'SERIALIZABLE 시도 시작, maxAttempts=1',
    'read inventory, update stock, insert ledger': '재고 조회·수량 갱신·원장 저장',
    'retryable conflict path': '재시도 가능한 충돌 경로',
    'helper classifies CockroachDB retry signature': '도우미가 CockroachDB 재시도 신호 분류',
    'rerun the whole reservation transaction': '전체 예약 트랜잭션 재실행',
    'InventorySnapshot plus one committed ledger row': 'InventorySnapshot과 커밋된 원장 행 1개',
    'Non-retryable SQLSTATE values, cancellation, and interruption stay outside the retry boundary and are rethrown.': '재시도할 수 없는 SQLSTATE, 취소, 인터럽트는 재시도 경계 밖에서 그대로 다시 던집니다.',
  },
  'bluetape4k-exposed-part6-duckdb-architecture': {
    'DuckDB Embedded Analytics': 'DuckDB 내장 분석',
    'A kept-open DuckDB session gives Exposed duplicated connections for local analytical transactions.': '열어 둔 DuckDB 세션이 Exposed에 로컬 분석 트랜잭션용 복제 연결을 제공합니다.',
    'Runtime ownership boundary': '런타임 소유 경계',
    'No warehouse endpoint, container, credential, or network hop sits on the default path.': '기본 경로에는 웨어하우스 엔드포인트, 컨테이너, 인증 정보, 네트워크 구간이 없습니다.',
    'Application Code': '애플리케이션 코드',
    'Exposed table and query DSL': 'Exposed 테이블과 쿼리 DSL',
    'suspend functions for callers': '호출자용 suspend 함수',
    'DuckDB Session': 'DuckDB 세션',
    'duplicate tx connections': '트랜잭션별 복제 연결',
    'DuckDB File': 'DuckDB 파일',
    'embedded JDBC engine': '내장 JDBC 엔진',
    'Analytics Result': '분석 결과',
    'DailyCategorySales rows': 'DailyCategorySales 행',
    'Flow consumption boundary': 'Flow 소비 경계',
    'aggregate rows': '집계 결과 행',
    'Default validation stays local: the file-backed DuckDB session preserves state across Exposed transactions without remote-service setup.': '기본 검증은 로컬에 머뭅니다. 파일 기반 DuckDB 세션이 원격 서비스 설정 없이 Exposed 트랜잭션 사이의 상태를 보존합니다.',
  },
};

for (const name of [
  'bluetape4k-exposed-readme-overview',
  'bluetape4k-exposed-part1-choice-journey',
  'bluetape4k-exposed-part1-virtual-thread-chart',
  'bluetape4k-exposed-part1-jdbc-benchmark-chart',
  'bluetape4k-exposed-part1-jpa-comparison-chart',
  'bluetape4k-exposed-part2-jdbc-repository-flow',
  'bluetape4k-exposed-part3-execution-models',
  'bluetape4k-exposed-part3-batch-comparison-chart',
  'bluetape4k-exposed-part4-codec-dialect-map',
  'bluetape4k-exposed-part5-production-boundary',
  'bluetape4k-exposed-part5-cache-read-chart',
  'bluetape4k-exposed-part5-cache-write-chart',
  'bluetape4k-exposed-part6-bigquery-dry-run-flow',
  'bluetape4k-exposed-part6-trino-session-sequence',
  'bluetape4k-exposed-part6-cockroachdb-retry-sequence',
  'bluetape4k-exposed-part6-duckdb-architecture',
]) {
  writeLocalePair(name, localeTranslations[name]);
}
