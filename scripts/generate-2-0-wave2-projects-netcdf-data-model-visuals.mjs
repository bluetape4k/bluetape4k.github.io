import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { projectsNetCdfDataModelCompanion as companion } from '../src/data/visual-companions/wave2-projects-netcdf-data-model.mjs';

const WIDTH = 1800;
const HEIGHT = 5200;
const ASSET_DIR = 'public/assets/visual-companions/wave2';
const LEDGER_DIR = 'docs/diagrams/visual-companions-wave2';
const CHECK = process.argv.includes('--check');

const palette = {
  container: { stroke: '#62d5df', fill: '#123d4b', marker: 'arrow-container' },
  dimensions: { stroke: '#7eb5ff', fill: '#193864', marker: 'arrow-dimensions' },
  variables: { stroke: '#f6c36b', fill: '#4c3820', marker: 'arrow-variables' },
  coordinates: { stroke: '#63d6a6', fill: '#164233', marker: 'arrow-coordinates' },
  domains: { stroke: '#bca4ff', fill: '#342d5c', marker: 'arrow-domains' },
  use: { stroke: '#f58fa8', fill: '#4a2939', marker: 'arrow-use' },
  muted: { stroke: '#9db0c9', fill: '#223750', marker: 'arrow-muted' },
};

const copy = {
  en: {
    title: 'NetCDF: one container, many scientific worlds',
    subtitle: 'Dimensions describe shape. Variables carry values. Coordinates and attributes make those values interpretable across disciplines.',
    container: '1 · A self-describing container',
    containerHint: 'Values travel with the context needed to read them',
    shape: '2 · One model, many reusable shapes',
    shapeHint: 'Rank is an arrangement of axes, not a fixed domain',
    domains: '3 · The same primitives answer different scientific questions',
    domainsHint: 'Change the variables and conventions; keep the container contract',
    use: '4 · From stored structure to a useful result',
    useHint: 'Select the smallest meaningful slice, then pass it to the next tool',
    enhanced: 'Enhanced netCDF-4 adds groups, multiple unlimited dimensions, and user-defined types.',
    containerCards: [
      ['File', 'dataset.nc', 'self-describing boundary'],
      ['Dimensions', 'time · level · lat · lon', 'named lengths and appendable axes'],
      ['Variables', 'temperature: float', 'typed N-dimensional values'],
      ['Attributes', 'units · standard_name · _FillValue', 'global and variable metadata'],
      ['Coordinates', 'degrees_north · degrees_east · time units', 'indexes become physical places and times'],
    ],
    shapes: [
      ['1D · series', '[time]', 'station reading, sensor trace, trend'],
      ['2D · field', '[lat, lon]', 'map, raster, surface observation'],
      ['3D · volume', '[level, lat, lon]', 'vertical profile, atmosphere or ocean layer'],
      ['4D · cube', '[time, level, lat, lon]', 'evolving field through space and time'],
    ],
    domainCards: [
      ['Weather & climate', '[time, level, lat, lon]', 'air_temperature · precipitation · pressure', 'forecast map · anomaly field · seasonal aggregate'],
      ['Ocean & marine', '[time, depth, lat, lon]', 'sea_surface_temperature · salinity · current_u', 'transect · vertical profile · current map'],
      ['Satellite & remote sensing', '[time, band, y, x] + geolocation', 'reflectance bands · quality_flag · latitude/longitude', 'false-color composite · cloud mask · calibrated tile'],
      ['Hydrology & environment', '[time, station] or [time, lat, lon]', 'streamflow · soil_moisture · pm25 · chlorophyll', 'basin summary · exceedance map · station series'],
      ['Geoscience & simulation', '[ensemble, time, z, y, x]', 'displacement · potential · wave_velocity · uncertainty', 'cross-section · uncertainty band · scenario comparison'],
    ],
    useCards: [
      ['Select', 'variable + coordinate metadata', 'Find the variable, time window, level, and region that answer the question.'],
      ['Interpret', 'units + missing + quality', 'Check CF meaning, missing-value rules, and quality flags before comparing values.'],
      ['Transform', 'slice + aggregate + resample', 'Keep the smallest useful subset and preserve the coordinates that explain it.'],
      ['Use', 'map + model + archive', 'Send the derived result to visualization, statistics, simulation, or a shared archive.'],
    ],
    scopeTitle: 'General NetCDF model · bluetape4k-science 2.0.0 boundary',
    scope: [
      'General model: groups, dimensions, variables, attributes, coordinate conventions, and N-dimensional arrays.',
      'Current subset: file metadata, variables, dimensions, global attributes, bounded grid values, rank 1–4, CF numeric auxiliary coordinates, selected CRS, and resumable slices.',
      'Do not read this companion as a claim that the importer implements every NetCDF-4 feature or every domain convention.',
    ],
    footer: 'Issue #426 · follow-up to #418 · source revision 8165a8989e00',
  },
  ko: {
    title: 'NetCDF: 하나의 컨테이너, 여러 과학 세계',
    subtitle: 'Dimension은 shape를 설명하고 variable은 값을 담습니다. Coordinate와 attribute가 분야를 넘어 값을 해석하게 합니다.',
    container: '1 · Self-describing container',
    containerHint: '값과 함께 읽는 데 필요한 맥락을 전달합니다',
    shape: '2 · 하나의 모델, 여러 재사용 shape',
    shapeHint: 'Rank는 고정된 분야가 아니라 축의 배치입니다',
    domains: '3 · 같은 primitive가 다른 과학 질문에 답합니다',
    domainsHint: 'Variable과 convention은 바꾸되 container 계약은 유지합니다',
    use: '4 · 저장 구조에서 실제 결과까지',
    useHint: '의미 있는 최소 slice를 선택한 뒤 다음 도구로 전달합니다',
    enhanced: 'Enhanced netCDF-4는 group, 여러 unlimited dimension, user-defined type을 추가합니다.',
    containerCards: [
      ['File', 'dataset.nc', 'self-describing 경계'],
      ['Dimensions', 'time · level · lat · lon', '이름 있는 길이와 append 가능한 축'],
      ['Variables', 'temperature: float', 'typed N-dimensional 값'],
      ['Attributes', 'units · standard_name · _FillValue', 'global·variable metadata'],
      ['Coordinates', 'degrees_north · degrees_east · time 단위', 'index를 물리적 위치와 시각으로 변환'],
    ],
    shapes: [
      ['1D · series', '[time]', '관측소 값, sensor trace, 추세'],
      ['2D · field', '[lat, lon]', '지도, raster, surface 관측'],
      ['3D · volume', '[level, lat, lon]', '수직 profile, 대기·해양 layer'],
      ['4D · cube', '[time, level, lat, lon]', '시공간에 걸쳐 변하는 field'],
    ],
    domainCards: [
      ['기상·기후', '[time, level, lat, lon]', 'air_temperature · precipitation · pressure', '예보 지도 · anomaly field · 계절 aggregate'],
      ['해양·해양과학', '[time, depth, lat, lon]', 'sea_surface_temperature · salinity · current_u', 'transect · 수직 profile · 해류 지도'],
      ['위성·원격 탐사', '[time, band, y, x] + geolocation', 'reflectance band · quality_flag · latitude/longitude', 'false-color composite · cloud mask · 보정 tile'],
      ['수문·환경', '[time, station] 또는 [time, lat, lon]', 'streamflow · soil_moisture · pm25 · chlorophyll', '유역 요약 · 초과값 지도 · 관측소 series'],
      ['지구과학·시뮬레이션', '[ensemble, time, z, y, x]', 'displacement · potential · wave_velocity · uncertainty', '단면 · uncertainty band · 시나리오 비교'],
    ],
    useCards: [
      ['Select', 'variable + coordinate metadata', '질문에 필요한 variable, time window, level, region을 찾습니다.'],
      ['Interpret', 'units + missing + quality', '비교하기 전에 CF 의미, 결측값 규칙, quality flag를 확인합니다.'],
      ['Transform', 'slice + aggregate + resample', '필요한 최소 subset을 남기고 이를 설명하는 coordinate를 보존합니다.'],
      ['Use', 'map + model + archive', '도출한 결과를 visualization, 통계, simulation, 공유 archive로 보냅니다.'],
    ],
    scopeTitle: '일반 NetCDF 모델 · bluetape4k-science 2.0.0 범위',
    scope: [
      '일반 모델: group, dimension, variable, attribute, coordinate convention, N-dimensional array.',
      '현재 subset: file metadata, variable, dimension, global attribute, bounded grid value, rank 1–4, CF numeric auxiliary coordinate, 일부 CRS, 재개 가능한 slice.',
      '이 자료를 importer가 모든 NetCDF-4 기능이나 모든 분야 convention을 구현한다는 뜻으로 읽지 않습니다.',
    ],
    footer: 'Issue #426 · #418에서 이어짐 · source revision 8165a8989e00',
  },
};

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function marker(id, color, role = 'primary', size = 14) {
  return `<marker id="${id}" viewBox="0 0 14 14" markerWidth="${size}" markerHeight="${size}" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse" data-role="${role}" data-tip-direction="positive-x"><path d="M1 1 L13 7 L1 13 Z" fill="${color}"/></marker>`;
}

function text(className, x, y, value, anchor = 'start') {
  return `<text class="${className}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(value)}</text>`;
}

function rect(id, x, y, width, height, tone = 'muted', className = 'card', radius = 20) {
  const color = palette[tone];
  return `<rect id="${id}" class="${className}" x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${color.fill}" stroke="${color.stroke}" data-intent="source-backed card" data-evidence="${id}"/>`;
}

function lines(x, y, values, className = 'body', gap = 34, numbered = false) {
  return values.map((value, index) => text(className, x, y + index * gap, numbered ? `${index + 1}. ${value}` : value)).join('\n');
}

function connector(id, d, tone, source, target, dashed = false) {
  const color = palette[tone];
  return `<path id="${id}" data-connector="${id}" data-source="${source}" data-target="${target}" class="connector" d="${d}" stroke="${color.stroke}" stroke-width="4"${dashed ? ' stroke-dasharray="10 9"' : ''} marker-end="url(#${color.marker})"/>`;
}

function card(parts, { id, x, y, width, height, tone, title, detail, note, titleClass = 'cardTitle' }) {
  parts.push(rect(id, x, y, width, height, tone));
  parts.push(text(titleClass, x + 28, y + 43, title));
  parts.push(text('mono', x + 28, y + 82, detail));
  if (note) parts.push(text('small', x + 28, y + height - 28, note));
}

function svg(locale) {
  const l = copy[locale];
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title desc" data-intent="source-backed scientific data model explainer" data-source-read="${companion.sourceRevision}">`, `<title id="title">${esc(l.title)}</title><desc id="desc">${esc(l.subtitle)}</desc>`, '<defs>', Object.values(palette).map((value) => marker(value.marker, value.stroke, value.marker === 'muted' ? 'secondary' : 'primary', value.marker === 'muted' ? 10 : 14)).join('\n'), `<style>.canvas{fill:#07111f}.frame{fill:#0c1a2d;fill-opacity:.83;stroke:#294562;stroke-width:2}.card{stroke-width:2}.title{font:700 46px "goorm Sans","Noto Sans KR",sans-serif;fill:#f7faff}.subtitle{font:19px "goorm Sans Code","Noto Sans KR",monospace;fill:#aabbd1}.section{font:700 30px "goorm Sans","Noto Sans KR",sans-serif;fill:#f7faff}.sectionHint{font:17px "goorm Sans","Noto Sans KR",sans-serif;fill:#aabbd1}.cardTitle{font:700 23px "goorm Sans","Noto Sans KR",sans-serif;fill:#f7faff}.body{font:18px "goorm Sans","Noto Sans KR",sans-serif;fill:#d6e1ef}.small{font:16px "goorm Sans","Noto Sans KR",sans-serif;fill:#aabbd1}.mono{font:17px "goorm Sans Code","Noto Sans KR",monospace;fill:#d6e4f4}.label{font:700 15px "goorm Sans Code","Noto Sans KR",monospace;letter-spacing:.08em;fill:#9db0c9}.connector{fill:none;stroke-linecap:round;stroke-linejoin:round}.note{font:700 18px "goorm Sans","Noto Sans KR",sans-serif;fill:#f6c36b}.footer{font:16px "goorm Sans Code","Noto Sans KR",monospace;fill:#9db0c9}.domainTitle{font:700 22px "goorm Sans","Noto Sans KR",sans-serif;fill:#f7faff}.domainDetail{font:17px "goorm Sans","Noto Sans KR",sans-serif;fill:#d6e1ef}</style>`, '</defs>', `<rect class="canvas" width="${WIDTH}" height="${HEIGHT}"/><rect x="28" y="28" width="1744" height="${HEIGHT - 56}" rx="28" fill="none" stroke="#294362" stroke-width="2"/>`, text('title', 900, 88, l.title, 'middle'), text('subtitle', 900, 128, l.subtitle, 'middle')];

  parts.push(rect('container-frame', 80, 180, 1640, 820, 'muted', 'frame', 28));
  parts.push(text('section', 120, 235, l.container));
  parts.push(text('sectionHint', 120, 270, l.containerHint));
  const cards = l.containerCards;
  card(parts, { id: 'container', x: 120, y: 335, width: 430, height: 220, tone: 'container', title: cards[0][0], detail: cards[0][1], note: cards[0][2] });
  card(parts, { id: 'dimensions', x: 685, y: 335, width: 430, height: 220, tone: 'dimensions', title: cards[1][0], detail: cards[1][1], note: cards[1][2] });
  card(parts, { id: 'variables', x: 1250, y: 335, width: 430, height: 220, tone: 'variables', title: cards[2][0], detail: cards[2][1], note: cards[2][2] });
  parts.push(connector('container-dimensions', 'M550 445 H685', 'container', 'container', 'dimensions'));
  parts.push(connector('dimensions-variables', 'M1115 445 H1250', 'dimensions', 'dimensions', 'variables'));
  card(parts, { id: 'attributes', x: 120, y: 660, width: 730, height: 220, tone: 'muted', title: cards[3][0], detail: cards[3][1], note: cards[3][2] });
  card(parts, { id: 'coordinates', x: 970, y: 660, width: 710, height: 220, tone: 'coordinates', title: cards[4][0], detail: cards[4][1], note: cards[4][2] });
  parts.push(rect('container-note', 120, 920, 1560, 42, 'container', 'card', 14));
  parts.push(text('note', 900, 948, l.enhanced, 'middle'));

  parts.push(rect('shape-frame', 80, 1050, 1640, 980, 'muted', 'frame', 28));
  parts.push(text('section', 120, 1105, l.shape));
  parts.push(text('sectionHint', 120, 1140, l.shapeHint));
  const shapePositions = [[120, 1210], [930, 1210], [120, 1530], [930, 1530]];
  l.shapes.forEach(([title, detail, note], index) => {
    const [x, y] = shapePositions[index];
    card(parts, { id: ['series', 'field', 'volume', 'cube'][index], x, y, width: 750, height: 235, tone: index === 0 ? 'container' : index === 1 ? 'coordinates' : index === 2 ? 'domains' : 'variables', title, detail, note });
  });
  parts.push(connector('coordinates-series', 'M1100 880 V900 Q1100 920 1080 920 H60 Q40 920 40 940 V1120 Q40 1140 60 1140 H280 Q300 1140 300 1160 V1210', 'coordinates', 'coordinates', 'series', true));
  parts.push(connector('dimensions-field', 'M900 555 V560 Q900 570 920 560 H1400 Q1790 590 1790 600 V1140 Q1790 1160 1770 1160 H1240 Q1220 1160 1220 1180 V1210', 'dimensions', 'dimensions', 'field', true));
  parts.push(connector('field-volume', 'M1000 1445 V1480 Q1000 1500 980 1500 H820 Q800 1500 800 1510 V1530', 'domains', 'field', 'volume'));
  parts.push(connector('volume-cube', 'M870 1647 H930', 'variables', 'volume', 'cube'));
  parts.push(rect('shape-note', 120, 1875, 1560, 90, 'muted', 'card', 16));
  parts.push(text('body', 150, 1910, locale === 'ko' ? '같은 차원 집합도 질문에 따라 slice, aggregate, resample할 수 있습니다.' : 'The same dimension set can be sliced, aggregated, or resampled according to the question.'));
  parts.push(text('small', 150, 1945, locale === 'ko' ? 'Rank는 domain label이 아니라 재사용 가능한 축 배치입니다.' : 'Rank is a reusable axis arrangement, not a domain label.'));

  parts.push(rect('domains-frame', 80, 2070, 1640, 1740, 'muted', 'frame', 28));
  parts.push(text('section', 120, 2125, l.domains));
  parts.push(text('sectionHint', 120, 2160, l.domainsHint));
  const domainPositions = [[120, 2230], [930, 2230], [120, 2780], [930, 2780], [525, 3230]];
  const domainTones = ['container', 'coordinates', 'domains', 'variables', 'use'];
  l.domainCards.forEach(([title, shape, variables, output], index) => {
    const [x, y] = domainPositions[index];
    const tone = domainTones[index];
    parts.push(rect(`domain-${index + 1}`, x, y, 750, 440, tone, 'card', 22));
    parts.push(text('domainTitle', x + 30, y + 48, title));
    parts.push(text('label', x + 30, y + 91, 'SHAPE'));
    parts.push(text('mono', x + 30, y + 124, shape));
    parts.push(text('label', x + 30, y + 170, 'VARIABLES'));
    parts.push(text('domainDetail', x + 30, y + 204, variables));
    parts.push(text('label', x + 30, y + 258, 'ASK / PRODUCE'));
    parts.push(text('domainDetail', x + 30, y + 292, output));
    parts.push(text('small', x + 30, y + 375, locale === 'ko' ? '좌표와 품질 metadata가 분야별 해석을 보존' : 'Coordinates and quality metadata preserve domain meaning'));
  });
  parts.push(connector('cube-domains', 'M1300 1765 V1810 Q1300 1830 1320 1830 H1700 Q1720 1830 1720 1850 V2040 Q1720 2060 1700 2060 H900 Q880 2060 880 2050 V2070', 'domains', 'cube', 'domains-frame', true));
  parts.push(connector('domain-weather-entry', 'M300 2190 V2230', 'domains', 'domains-frame', 'domain-1', true));
  parts.push(connector('domain-ocean-entry', 'M1300 2190 V2230', 'domains', 'domains-frame', 'domain-2', true));
  parts.push(connector('domain-satellite-entry', 'M300 2740 V2780', 'domains', 'domains-frame', 'domain-3', true));
  parts.push(connector('domain-hydrology-entry', 'M1300 2740 V2780', 'domains', 'domains-frame', 'domain-4', true));
  parts.push(connector('domain-geoscience-entry', 'M900 3190 V3230', 'domains', 'domains-frame', 'domain-5', true));
  parts.push(rect('domain-note', 120, 3700, 1560, 95, 'domains', 'card', 16));
  parts.push(text('body', 150, 3740, locale === 'ko' ? '분야가 달라도 container 계약은 유지됩니다. 바뀌는 것은 variable 이름, 단위, 축, quality convention입니다.' : 'The container contract stays stable across disciplines; variable names, units, axes, and quality conventions change.'));
  parts.push(text('small', 150, 3775, locale === 'ko' ? '그래서 같은 reader가 map, profile, section, volume workflow를 공유할 수 있습니다.' : 'That lets the same reader share map, profile, section, and volume workflows.'));

  parts.push(rect('use-frame', 80, 3900, 1640, 1190, 'muted', 'frame', 28));
  parts.push(text('section', 120, 3955, l.use));
  parts.push(text('sectionHint', 120, 3990, l.useHint));
  const useY = [4080, 4330];
  l.useCards.forEach(([title, detail, body], index) => {
    const x = index % 2 === 0 ? 120 : 930;
    const y = useY[Math.floor(index / 2)];
    const tone = index === 0 ? 'container' : index === 1 ? 'coordinates' : index === 2 ? 'variables' : 'use';
    parts.push(rect(`use-${index + 1}`, x, y, 750, 190, tone, 'card', 18));
    parts.push(text('cardTitle', x + 30, y + 42, `${index + 1}. ${title}`));
    parts.push(text('mono', x + 30, y + 78, detail));
    parts.push(text('small', x + 30, y + 128, body));
  });
  parts.push(connector('use-select-interpret', 'M870 4175 H930', 'coordinates', 'use-1', 'use-2'));
  parts.push(connector('use-interpret-transform', 'M1305 4270 V4330', 'variables', 'use-2', 'use-3'));
  parts.push(connector('use-transform-result', 'M870 4425 H930', 'use', 'use-3', 'use-4'));
  parts.push(rect('scope', 120, 4620, 1560, 225, 'muted', 'card', 18));
  parts.push(text('cardTitle', 150, 4665, l.scopeTitle));
  parts.push(lines(150, 4710, l.scope, 'small', 38, true));
  parts.push(text('footer', 900, 4980, l.footer, 'middle'));
  parts.push('</svg>');
  return `${parts.join('\n')}\n`;
}

function ledger(locale) {
  const source = 'wave2-projects-netcdf-data-model.mjs';
  const labels = locale === 'ko'
    ? ['Self-describing NetCDF container', 'Named dimensions and lengths', 'Typed N-dimensional variables', 'Global and variable attributes', 'Coordinate variables and CF meaning', '1D series shape', '2D field shape', '3D volume shape', '4D time-level-space cube', 'Weather and climate domain', 'Ocean and marine domain', 'Satellite and remote-sensing domain', 'Hydrology and environment domain', 'Geoscience and simulation domain', 'Selection, interpretation, and derived result']
    : ['Self-describing NetCDF container', 'Named dimensions and lengths', 'Typed N-dimensional variables', 'Global and variable attributes', 'Coordinate variables and CF meaning', '1D series shape', '2D field shape', '3D volume shape', '4D time-level-space cube', 'Weather and climate domain', 'Ocean and marine domain', 'Satellite and remote-sensing domain', 'Hydrology and environment domain', 'Geoscience and simulation domain', 'Selection, interpretation, and derived result'];
  const ids = ['container', 'dimensions', 'variables', 'attributes', 'coordinates', 'series', 'field', 'volume', 'cube', 'domain_weather', 'domain_ocean', 'domain_satellite', 'domain_hydrology', 'domain_geoscience', 'use_result'];
  const edges = [
    ['container-dimensions', 'container', 'dimensions', 'defines'],
    ['dimensions-variables', 'dimensions', 'variables', 'shapes'],
    ['variables-attributes', 'variables', 'attributes', 'describes'],
    ['coordinates-variables', 'coordinates', 'variables', 'locates'],
    ['coordinates-series', 'coordinates', 'series', 'interprets'],
    ['dimensions-field', 'dimensions', 'field', 'arranges'],
    ['field-volume', 'field', 'volume', 'extends'],
    ['volume-cube', 'volume', 'cube', 'adds-time'],
    ['cube-weather', 'cube', 'domain_weather', 'serves'],
    ['cube-ocean', 'cube', 'domain_ocean', 'serves'],
    ['cube-satellite', 'cube', 'domain_satellite', 'serves'],
    ['cube-hydrology', 'cube', 'domain_hydrology', 'serves'],
    ['cube-geoscience', 'cube', 'domain_geoscience', 'serves'],
    ['use-result', 'cube', 'use_result', 'derives'],
  ];
  return `${JSON.stringify({
    kind: 'architecture',
    source: {
      question: locale === 'ko'
        ? 'NetCDF는 dimension, variable, coordinate, attribute를 어떻게 결합해 여러 과학 분야에서 재사용 가능한 데이터를 만드는가?'
        : 'How do NetCDF dimensions, variables, coordinates, and attributes form reusable data products across scientific disciplines?',
      revision: companion.sourceRevision,
      paths: [
        'src/data/visual-companions/wave2-projects-netcdf-data-model.mjs',
        'src/content/docs/manual/bluetape4k-projects/2.0/modules/bluetape4k-science.md',
      ],
    },
    nodes: ids.map((id, index) => ({ id, label: labels[index], source })),
    edges: edges.map(([id, from, to, kind]) => ({ id, from, to, kind, source })),
    behavior: { branches: 1, loops: 0 },
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
  output(`${ASSET_DIR}/projects-netcdf-data-model-${locale}.svg`, svg(locale));
  output(`${LEDGER_DIR}/projects-netcdf-data-model-${locale}.semantic.json`, ledger(locale));
}
