import { mkdirSync, writeFileSync } from 'node:fs';

const out = 'public/assets';
mkdirSync(out, { recursive: true });

const palette = {
  blue: ['#E8F3FF', '#5B8DEF'],
  green: ['#EAF7EF', '#58A978'],
  amber: ['#FFF3D9', '#D6A441'],
  rose: ['#FDECEF', '#DC6B82'],
  teal: ['#E9F7F6', '#45A7A1'],
  purple: ['#F1ECFF', '#8A72D6'],
  neutral: ['#F5F7FB', '#93A4B7'],
};

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function header(width, height, title, subtitle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(subtitle)}</desc>
<defs>
  <filter id="shadow" x="-8%" y="-8%" width="116%" height="116%"><feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="#203040" flood-opacity="0.10"/></filter>
  <marker id="arrowBlue" markerWidth="14" markerHeight="14" refX="13" refY="7" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L14,7 L0,14 Z" fill="#4E7FC2"/></marker>
  <marker id="arrowGreen" markerWidth="14" markerHeight="14" refX="13" refY="7" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L14,7 L0,14 Z" fill="#3C9B72"/></marker>
  <marker id="arrowAmber" markerWidth="14" markerHeight="14" refX="13" refY="7" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L14,7 L0,14 Z" fill="#C98A22"/></marker>
  <marker id="arrowRose" markerWidth="14" markerHeight="14" refX="13" refY="7" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L14,7 L0,14 Z" fill="#C85A73"/></marker>
  <style>
    .canvas{fill:#F7F9FC}.frame{fill:#FFFFFF;stroke:#D7E2EC;stroke-width:2}
    .title{font-family:"Architects Daughter","Comic Sans MS","Comic Sans",Arial,sans-serif;font-size:42px;fill:#22344A;font-weight:700}
    .subtitle{font-family:"Comic Mono","Comic Sans MS","Comic Sans",Arial,sans-serif;font-size:16px;fill:#536476;font-weight:400}
    .label{font-family:"Architects Daughter","Comic Sans MS","Comic Sans",Arial,sans-serif;font-size:24px;fill:#22344A;font-weight:700}
    .smallLabel{font-family:"Architects Daughter","Comic Sans MS","Comic Sans",Arial,sans-serif;font-size:20px;fill:#22344A;font-weight:700}
    .body{font-family:"Comic Mono","Comic Sans MS","Comic Sans",Arial,sans-serif;font-size:14px;fill:#34465B;font-weight:400}
    .small{font-family:"Comic Mono","Comic Sans MS","Comic Sans",Arial,sans-serif;font-size:12px;fill:#627184;font-weight:400}
    .num{font-family:"Comic Mono","Comic Sans MS","Comic Sans",Arial,sans-serif;font-size:16px;fill:#22344A;font-weight:700}
    .card{filter:url(#shadow);stroke-width:2}.soft{stroke-width:1.6}
    .lineBlue{fill:none;stroke:#4E7FC2;stroke-width:2.4;marker-end:url(#arrowBlue)}
    .lineGreen{fill:none;stroke:#3C9B72;stroke-width:2.4;marker-end:url(#arrowGreen)}
    .lineAmber{fill:none;stroke:#C98A22;stroke-width:2.4;marker-end:url(#arrowAmber)}
    .lineRose{fill:none;stroke:#C85A73;stroke-width:2.4;marker-end:url(#arrowRose)}
    .dashBlue{fill:none;stroke:#4E7FC2;stroke-width:2.2;stroke-dasharray:8 7;marker-end:url(#arrowBlue)}
    .dashGreen{fill:none;stroke:#3C9B72;stroke-width:2.2;stroke-dasharray:8 7;marker-end:url(#arrowGreen)}
    .pill{fill:#FFFFFF;stroke:#D7E2EC;stroke-width:1.2}
  </style>
</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="26"/>
<text class="title" x="70" y="82">${esc(title)}</text>
<text class="subtitle" x="72" y="115">${esc(subtitle)}</text>`;
}

function footer(_note, _width, _y) {
  return `</svg>\n`;
}

function content(items, offsetY = 44) {
  return `<g transform="translate(0 ${offsetY})">\n${items.join('\n')}\n</g>`;
}

function centeredTextBlock(parts, x, centerY, anchor = 'middle') {
  let cursor = 0;
  const positioned = parts.map((part, index) => {
    if (index > 0) {
      cursor += part.gapBefore;
    }
    return { ...part, offset: cursor };
  });
  const first = positioned.at(0)?.offset ?? 0;
  const last = positioned.at(-1)?.offset ?? 0;
  const shift = centerY - (first + last) / 2;

  return positioned
    .map((part) => `<text class="${part.cls}" x="${x}" y="${shift + part.offset}" text-anchor="${anchor}" dominant-baseline="middle">${esc(part.text)}</text>`)
    .join('\n');
}

function centeredCardText(title, body, x, centerY, options = {}) {
  const titleLines = Array.isArray(title) ? title : [title];
  const parts = [
    ...titleLines.map((text, index) => ({
      text,
      cls: options.titleClass ?? 'smallLabel',
      gapBefore: index === 0 ? 0 : (options.titleGap ?? 24),
    })),
    ...body.map((text, index) => ({
      text,
      cls: options.bodyClass ?? 'body',
      gapBefore: index === 0 ? (options.titleBodyGap ?? 28) : (options.bodyGap ?? 18),
    })),
  ];
  return centeredTextBlock(parts, x, centerY + (options.centerOffsetY ?? 0), options.anchor ?? 'middle');
}

function card(x, y, w, h, color, title, body = [], options = {}) {
  const [fill, stroke] = palette[color];
  return `<g>
  <rect class="card" x="${x}" y="${y}" width="${w}" height="${h}" rx="${options.rx ?? 16}" fill="${fill}" stroke="${stroke}"/>
  ${centeredCardText(title, body, x + w / 2, y + h / 2, options)}
</g>`;
}

function cylinder(x, y, w, h, color, title, body = []) {
  const [fill, stroke] = palette[color];
  return `<g>
  <path class="card" d="M${x},${y + 18} C${x},${y - 6} ${x + w},${y - 6} ${x + w},${y + 18} L${x + w},${y + h - 18} C${x + w},${y + h + 6} ${x},${y + h + 6} ${x},${y + h - 18} Z" fill="${fill}" stroke="${stroke}"/>
  <ellipse class="soft" cx="${x + w / 2}" cy="${y + 18}" rx="${w / 2}" ry="18" fill="#FFFFFF" opacity="0.50" stroke="${stroke}"/>
  ${centeredCardText(title, body, x + w / 2, y + h / 2 + 8)}
</g>`;
}

function path(d, cls = 'lineBlue', label = '', lx = 0, ly = 0, pillW = 0) {
  const labelSvg = label
    ? `<rect class="pill" x="${lx - pillW / 2}" y="${ly - 18}" width="${pillW}" height="24" rx="12"/><text class="small" x="${lx}" y="${ly - 2}" text-anchor="middle">${esc(label)}</text>`
    : '';
  return `<path class="connector ${cls}" d="${d}"/>${labelSvg}`;
}

const koReplacements = [
  ['Bluetape4k Cache Module Map', 'Bluetape4k Cache 모듈 지도'],
  ['cache-core defines the common language; provider modules plug in local and distributed behavior.', 'cache-core가 공통 언어를 정의하고 provider 모듈이 local/distributed 동작을 연결합니다.'],
  ['Application Code', '애플리케이션 코드'],
  ['Kotlin services', 'Kotlin 서비스'],
  ['JCache helpers · SuspendCache', 'JCache helper · SuspendCache'],
  ['Memoizer contracts · NearCache APIs', 'Memoizer 계약 · NearCache API'],
  ['resilience decorators · statistics', 'resilience decorator · 통계'],
  ['Local Providers', 'Local Provider'],
  ['Memoizers', 'Memoizer'],
  ['Distributed Store', 'Distributed Store'],
  ['uses', '사용'],
  ['Near Cache Read and Invalidation Flow', 'Near Cache 읽기와 무효화 흐름'],
  ['Hot reads finish in the JVM L1 cache; misses and writes coordinate with Redis L2 and invalidation signals.', 'hot read는 JVM L1 cache에서 끝나고 miss/write는 Redis L2와 invalidation signal을 조율합니다.'],
  ['Application', '애플리케이션'],
  ['repository / service', 'repository / service'],
  ['L1 Front Cache', 'L1 Front Cache'],
  ['Caffeine in JVM', 'JVM의 Caffeine'],
  ['microsecond hot path', '마이크로초 hot path'],
  ['L2 Remote Cache', 'L2 Remote Cache'],
  ['Redis shared state', 'Redis 공유 상태'],
  ['RESP3 Tracking', 'RESP3 Tracking'],
  ['server push', 'server push'],
  ['key invalidation', 'key invalidation'],
  ['Pub/Sub Topic', 'Pub/Sub Topic'],
  ['client-managed', 'client 관리'],
  ['broadcast invalidation', 'broadcast invalidation'],
  ['Local Stats', 'Local 통계'],
  ['hit · miss · invalidated', 'hit · miss · invalidated'],
  ['miss load', 'miss load'],
  ['write-through', 'write-through'],
  ['changed key', '변경된 key'],
  ['publish', '발행'],
  ['record', '기록'],
  ['Lettuce Near Cache Benchmark Summary', 'Lettuce Near Cache 벤치마크 요약'],
  ['Throughput is ops/ms. Higher is better. L1 reads are intentionally shown on a separate scale.', 'throughput 단위는 ops/ms입니다. 높을수록 좋고 L1 read는 별도 scale로 표시합니다.'],
  ['L1 hit', 'L1 hit'],
  ['L2 hit / miss', 'L2 hit / miss'],
  ['Practical Reading', '실전 해석'],
  ['maximize L1 hit ratio', 'L1 hit ratio 극대화'],
  ['watch write cost', 'write cost 관찰'],
  ['split large payload batches', '큰 payload batch 분리'],
  ['L1 memory path', 'L1 memory path'],
  ['Redis RTT dominated', 'Redis RTT 지배'],
  ['SET + tracking GET', 'SET + tracking GET'],
  ['payload bandwidth', 'payload bandwidth'],
  ['JdbcCacheRepository Strategy Map', 'JdbcCacheRepository 전략 지도'],
  ['Redisson map loader handles read-through; map writer handles write-through or write-behind.', 'Redisson map loader는 read-through를, map writer는 write-through/write-behind를 담당합니다.'],
  ['loader + optional writer', 'loader + optional writer'],
  ['Near Cache when enabled', '활성화 시 Near Cache'],
  ['EntityMapLoader', 'EntityMapLoader'],
  ['ExposedEntityMapLoader', 'ExposedEntityMapLoader'],
  ['cache miss -> DB read', 'cache miss -> DB read'],
  ['EntityMapWriter', 'EntityMapWriter'],
  ['ExposedEntityMapWriter', 'ExposedEntityMapWriter'],
  ['put / putAll -> DB write', 'put / putAll -> DB write'],
  ['Exposed DB', 'Exposed DB'],
  ['transaction boundary', 'transaction boundary'],
  ['loader only', 'loader only'],
  ['loader + writer', 'loader + writer'],
  ['write-behind queue', 'write-behind queue'],
  ['read from DB', 'DB에서 읽기'],
  ['write now / async', '즉시 쓰기 / async'],
  ['Exposed Cache Benchmark Snapshot', 'Exposed Cache 벤치마크 스냅샷'],
  ['Average latency from exposed-workshop chapter 11 benchmark. Lower is better.', 'exposed-workshop 11장 benchmark의 평균 latency입니다. 낮을수록 좋습니다.'],
  ['strategy effect small', 'strategy 영향 작음'],
  ['Reading', '해석'],
  ['5.5x faster', '5.5x 빠름'],
  ['9.9x faster', '9.9x 빠름'],
  ['when reads dominate', 'read 중심일 때'],
  ['write-heavy', 'write-heavy'],
  ['Workshop Cache Profiles', 'Workshop Cache profile'],
  ['The same ProductCacheService contract can compare no cache, local cache, remote cache, and near cache behavior.', '같은 ProductCacheService 계약으로 no cache, local cache, remote cache, near cache 동작을 비교합니다.'],
  ['Spring Service', 'Spring Service'],
  ['No Cache', 'No Cache'],
  ['DB baseline', 'DB baseline'],
  ['local JVM cache', 'local JVM cache'],
  ['Redis', 'Redis'],
  ['remote shared cache', 'remote shared cache'],
  ['Near Cache', 'Near Cache'],
  ['local + remote', 'local + remote'],
  ['Product DB', 'Product DB'],
  ['repository storage', 'repository storage'],
  ['Benchmark', 'Benchmark'],
  ['compare profiles', 'profile 비교'],
  ['Resilience Example', 'Resilience 예제'],
  ['Redis primary', 'Redis primary'],
  ['Caffeine fallback', 'Caffeine fallback'],
  ['fallback path', 'fallback path'],
  ['remote read', 'remote read'],
  ['measure', '측정'],
  ['fallback state', 'fallback state'],
  ['Workshop Cache Benchmark Profiles', 'Workshop Cache 벤치마크 profile'],
  ['Read and write throughput from bluetape4k-workshop cache-benchmark. Higher is better.', 'bluetape4k-workshop cache-benchmark의 read/write throughput입니다. 높을수록 좋습니다.'],
  ['read ~8.2k', 'read ~8.2k'],
  ['write ~8.2k ops/s', 'write ~8.2k ops/s'],
  ['read ~490k', 'read ~490k'],
  ['write ~8.1k ops/s', 'write ~8.1k ops/s'],
  ['read ~465k', 'read ~465k'],
  ['write ~7.2k ops/s', 'write ~7.2k ops/s'],
  ['Redis Cache', 'Redis Cache'],
  ['read ~43k', 'read ~43k'],
  ['write ~7.3k ops/s', 'write ~7.3k ops/s'],
  ['Write-Through', 'Write-Through'],
  ['read ~41k', 'read ~41k'],
  ['write ~5.6k ops/s', 'write ~5.6k ops/s'],
  ['Write-Behind', 'Write-Behind'],
  ['read ~42k', 'read ~42k'],
  ['write ~24k ops/s', 'write ~24k ops/s'],
  ['Read throughput', 'Read throughput'],
  ['Write throughput', 'Write throughput'],
  ['60x read', '60x read'],
  ['57x read', '57x read'],
  ['5x read', '5x read'],
  ['3x write', '3x write'],
];

function koreanize(svg) {
  let localized = svg
    .replaceAll('"Architects Daughter","Comic Sans MS","Comic Sans",Arial,sans-serif', '"goorm Sans","Apple SD Gothic Neo",Arial,sans-serif')
    .replaceAll('"Comic Mono","Comic Sans MS","Comic Sans",Arial,sans-serif', '"goorm Sans Code","goorm Sans","Apple SD Gothic Neo",monospace')
    .replaceAll('"Architects Daughter", "Comic Mono", ui-monospace, monospace', '"goorm Sans", "goorm Sans Code", "Apple SD Gothic Neo", sans-serif')
    .replaceAll('"Comic Mono", ui-monospace, monospace', '"goorm Sans Code", "goorm Sans", "Apple SD Gothic Neo", monospace');
  for (const [from, to] of koReplacements) {
    localized = localized.split(esc(from)).join(esc(to));
    localized = localized.split(from).join(to);
  }
  return localized;
}

function write(name, svg) {
  writeFileSync(`${out}/${name}-en.svg`, svg);
  writeFileSync(`${out}/${name}-ko.svg`, koreanize(svg));
}

write(
  'cache-series-module-map-01',
  header(1400, 864, 'Bluetape4k Cache Module Map', 'cache-core defines the common language; provider modules plug in local and distributed behavior.') +
    content([
      card(548, 150, 304, 118, 'blue', 'Application Code', ['Kotlin services', 'Spring / Ktor / Exposed']),
      card(498, 330, 404, 138, 'purple', 'cache-core', ['JCache helpers · SuspendCache', 'Memoizer contracts · NearCache APIs', 'resilience decorators · statistics']),
      card(86, 560, 236, 96, 'green', 'Local Providers', ['Caffeine · Cache2k · Ehcache']),
      card(372, 560, 204, 96, 'amber', 'Memoizers', ['sync · async · suspend']),
      card(626, 560, 214, 96, 'teal', 'Lettuce', ['Redis RESP3 NearCache']),
      card(890, 560, 214, 96, 'rose', 'Redisson', ['RLocalCachedMap']),
      card(1154, 560, 214, 96, 'neutral', 'Hazelcast', ['IMap NearCache']),
      cylinder(732, 700, 210, 64, 'rose', 'Redis'),
      cylinder(1128, 700, 236, 64, 'neutral', 'Distributed Store'),
      path('M700 268 V330', 'lineBlue', 'uses', 735, 306, 58),
      path('M498 410 H220 Q204 410 204 426 V560', 'lineGreen'),
      path('M548 468 V560', 'lineAmber'),
      path('M710 468 V560', 'lineBlue'),
      path('M794 468 V502 Q794 518 810 518 H981 Q997 518 997 534 V560', 'lineRose'),
      path('M902 410 H1245 Q1261 410 1261 426 V560', 'lineBlue'),
      path('M733 656 V700', 'lineBlue'),
      path('M997 656 V670 Q997 682 985 682 H849 Q837 682 837 694 V700', 'lineRose'),
      path('M1261 656 V700', 'lineBlue'),
    ]) +
    footer('Graphviz structure evidence: cache-series-module-map-01.dot / .plain / -sketch.svg', 1400, 830),
);

write(
  'cache-series-near-cache-flow-01',
  header(1480, 864, 'Near Cache Read and Invalidation Flow', 'Hot reads finish in the JVM L1 cache; misses and writes coordinate with Redis L2 and invalidation signals.') +
    content([
      card(76, 330, 238, 110, 'blue', 'Application', ['repository / service']),
      card(420, 260, 282, 132, 'green', 'L1 Front Cache', ['Caffeine in JVM', 'microsecond hot path']),
      cylinder(820, 265, 270, 130, 'rose', 'L2 Remote Cache', ['Redis shared state']),
      card(1190, 198, 226, 106, 'teal', 'RESP3 Tracking', ['server push', 'key invalidation']),
      card(1190, 432, 226, 106, 'amber', 'Pub/Sub Topic', ['client-managed', 'broadcast invalidation']),
      card(458, 525, 210, 92, 'purple', 'Local Stats', ['hit · miss · invalidated']),
      path('M314 365 H420', 'lineBlue', 'get', 366, 390, 52),
      path('M420 350 H314', 'lineGreen', 'L1 hit', 365, 316, 64),
      path('M702 326 H820', 'lineBlue', 'miss load', 761, 312, 92),
      path('M820 358 H702', 'lineGreen', 'fill', 760, 382, 48),
      path('M194 440 V689 Q194 705 210 705 H939 Q955 705 955 689 V395', 'lineAmber', 'write-through', 570, 692, 112),
      path('M1090 288 H1190', 'lineGreen', 'changed key', 1138, 274, 104),
      path('M1190 252 H702', 'dashGreen', 'invalidate', 962, 238, 92),
      path('M1090 360 H1122 Q1138 360 1138 376 V469 Q1138 485 1154 485 H1190', 'lineAmber', 'publish', 1139, 423, 70),
      path('M1416 485 H1450 Q1462 485 1462 473 V178 Q1462 166 1450 166 H572 Q560 166 560 178 V260', 'dashBlue', 'invalidate', 980, 152, 92),
      path('M560 392 V525', 'lineBlue', 'record', 606, 458, 64),
    ]) +
    footer('Graphviz structure evidence: cache-series-near-cache-flow-01.dot / .plain / -sketch.svg', 1480, 830),
);

write(
  'cache-series-benchmark-chart-01',
  header(1320, 804, 'Lettuce Near Cache Benchmark Summary', 'Throughput is ops/ms. Higher is better. L1 reads are intentionally shown on a separate scale.') +
    content([
      card(84, 164, 234, 96, 'green', 'L1 hit', ['~64,000 ops/ms']),
      card(84, 296, 234, 96, 'blue', 'L2 hit / miss', ['~4 ops/ms']),
      card(84, 428, 234, 96, 'amber', 'putSingle', ['~2 ops/ms']),
      card(84, 560, 234, 96, 'rose', 'putAll 16KB', ['~0.4 ops/ms']),
      '<g><rect x="402" y="183" width="760" height="56" rx="14" fill="#EAF7EF" stroke="#58A978" stroke-width="2"/><rect x="402" y="183" width="730" height="56" rx="14" fill="#58A978" opacity="0.24"/></g>',
      '<g><rect x="402" y="315" width="180" height="56" rx="14" fill="#E8F3FF" stroke="#5B8DEF" stroke-width="2"/><rect x="402" y="315" width="92" height="56" rx="14" fill="#5B8DEF" opacity="0.25"/></g>',
      '<g><rect x="402" y="447" width="180" height="56" rx="14" fill="#FFF3D9" stroke="#D6A441" stroke-width="2"/><rect x="402" y="447" width="56" height="56" rx="14" fill="#D6A441" opacity="0.28"/></g>',
      '<g><rect x="402" y="579" width="180" height="56" rx="14" fill="#FDECEF" stroke="#DC6B82" stroke-width="2"/><rect x="402" y="579" width="22" height="56" rx="11" fill="#DC6B82" opacity="0.32"/></g>',
      card(832, 386, 318, 128, 'purple', 'Practical Reading', ['maximize L1 hit ratio', 'watch write cost', 'split large payload batches']),
      path('M1150 450 H1212 Q1228 450 1228 434 V228 Q1228 212 1212 212 H1162', 'lineGreen', 'L1 memory path', 1218, 218, 116),
      path('M832 450 H776 Q760 450 760 434 V359 Q760 343 744 343 H582', 'lineBlue', 'Redis RTT dominated', 672, 329, 154),
      path('M832 476 H582', 'lineAmber', 'SET + tracking GET', 678, 461, 150),
      path('M832 502 H744 Q728 502 728 518 V591 Q728 607 712 607 H582', 'lineRose', 'payload bandwidth', 682, 593, 142),
    ]) +
    footer('Source data: cache-lettuce/Benchmark.ko.md. Graphviz evidence: cache-series-benchmark-chart-01.dot / .plain / -sketch.svg', 1320, 770),
);

write(
  'cache-series-exposed-strategies-01',
  header(1500, 904, 'JdbcCacheRepository Strategy Map', 'Redisson map loader handles read-through; map writer handles write-through or write-behind.') +
    content([
      card(72, 332, 304, 126, 'blue', 'JdbcCacheRepository', ['get · getAll', 'put · putAll', 'invalidate · clear']),
      card(514, 300, 330, 164, 'green', ['RMap', 'RLocalCachedMap'], ['loader + optional writer', 'Near Cache when enabled']),
      card(944, 178, 292, 116, 'teal', 'EntityMapLoader', ['ExposedEntityMapLoader', 'cache miss -> DB read']),
      card(944, 508, 292, 120, 'amber', 'EntityMapWriter', ['ExposedEntityMapWriter', 'put / putAll -> DB write']),
      cylinder(1120, 330, 262, 142, 'purple', 'Exposed DB', ['IdTable', 'transaction boundary']),
      card(126, 610, 300, 90, 'neutral', 'READ_ONLY', ['UserCredentials', 'WITH_NEAR_CACHE · loader only']),
      card(486, 610, 348, 90, 'blue', 'READ_WRITE_THROUGH', ['User', 'WITH_NEAR_CACHE · loader + writer']),
      card(894, 690, 344, 90, 'rose', 'WRITE_BEHIND', ['UserEvent', 'WITH_NEAR_CACHE · async flush']),
      path('M376 382 H514', 'lineBlue', 'get / put', 446, 368, 78),
      path('M514 418 H376', 'lineGreen', 'cache hit', 446, 444, 76),
      path('M844 350 H884 Q900 350 900 334 V252 Q900 236 916 236 H944', 'lineBlue', 'cache miss', 886, 222, 92),
      path('M1236 236 H1296 Q1312 236 1312 252 V330', 'lineBlue', 'read from DB', 1318, 288, 104),
      path('M844 428 H886 Q902 428 902 444 V552 Q902 568 918 568 H944', 'lineAmber', 'put / putAll', 900, 494, 98),
      path('M1236 568 H1296 Q1312 568 1312 552 V472', 'lineAmber', 'write now / async', 1320, 526, 130),
      path('M276 610 V480 Q276 464 292 464 H544 Q560 464 560 480 V464', 'dashGreen', 'loader only', 398, 594, 88),
      path('M660 610 V464', 'dashBlue', 'loader + writer', 730, 594, 118),
      path('M1066 690 V628', 'dashBlue', 'write-behind queue', 1148, 674, 146),
    ]) +
    footer('Graphviz structure evidence: cache-series-exposed-strategies-01.dot / .plain / -sketch.svg', 1500, 870),
);

write(
  'cache-series-exposed-benchmark-01',
  header(1320, 804, 'Exposed Cache Benchmark Snapshot', 'Average latency from exposed-workshop chapter 11 benchmark. Lower is better.') +
    content([
      card(84, 164, 250, 92, 'neutral', 'NO_CACHE', ['READ_HEAVY', '517.5 us/op']),
      card(84, 296, 250, 92, 'green', 'READ_THROUGH', ['READ_HEAVY', '94.3 us/op']),
      card(84, 428, 250, 92, 'blue', 'WRITE_THROUGH', ['READ_HEAVY', '52.1 us/op']),
      card(84, 560, 250, 92, 'amber', 'WRITE_HEAVY', ['445-508 us/op', 'strategy effect small']),
      '<g><rect x="430" y="190" width="720" height="42" rx="12" fill="#F5F7FB" stroke="#93A4B7" stroke-width="2"/><rect x="430" y="190" width="720" height="42" rx="12" fill="#93A4B7" opacity="0.24"/></g>',
      '<g><rect x="430" y="322" width="720" height="42" rx="12" fill="#EAF7EF" stroke="#58A978" stroke-width="2"/><rect x="430" y="322" width="131" height="42" rx="12" fill="#58A978" opacity="0.28"/></g>',
      '<g><rect x="430" y="454" width="720" height="42" rx="12" fill="#E8F3FF" stroke="#5B8DEF" stroke-width="2"/><rect x="430" y="454" width="72" height="42" rx="12" fill="#5B8DEF" opacity="0.30"/></g>',
      '<g><rect x="430" y="586" width="720" height="42" rx="12" fill="#FFF3D9" stroke="#D6A441" stroke-width="2"/><rect x="430" y="586" width="620" height="42" rx="12" fill="#D6A441" opacity="0.24"/></g>',
      card(830, 326, 320, 116, 'purple', 'Reading', ['READ_THROUGH 5.5x faster', 'WRITE_THROUGH 9.9x faster', 'when reads dominate']),
      path('M334 210 H430', 'lineBlue'),
      path('M334 342 H430', 'lineGreen', '5.5x faster', 382, 328, 96),
      path('M334 474 H430', 'lineBlue', '9.9x faster', 382, 460, 96),
      path('M334 606 H430', 'lineAmber', 'write-heavy', 382, 592, 92),
    ]) +
    footer('Source: exposed-workshop 11-high-performance/04-benchmark. Graphviz evidence: cache-series-exposed-benchmark-01.dot / .plain / -sketch.svg', 1320, 770),
);

write(
  'cache-series-workshop-profile-01',
  header(1480, 864, 'Workshop Cache Profiles', 'The same ProductCacheService contract can compare no cache, local cache, remote cache, and near cache behavior.') +
    content([
      card(86, 334, 254, 116, 'blue', 'Spring Service', ['ProductCacheService']),
      card(486, 162, 232, 100, 'neutral', 'No Cache', ['DB baseline']),
      card(486, 306, 232, 100, 'green', 'Caffeine', ['local JVM cache']),
      card(486, 450, 232, 100, 'rose', 'Redis', ['remote shared cache']),
      card(486, 594, 232, 100, 'teal', 'Near Cache', ['local + remote']),
      cylinder(902, 334, 250, 128, 'purple', 'Product DB', ['repository storage']),
      card(1210, 334, 200, 116, 'amber', 'Benchmark', ['compare profiles']),
      card(876, 594, 298, 100, 'rose', 'Resilience Example', ['Redis primary', 'Caffeine fallback']),
      path('M340 356 H388 Q404 356 404 340 V228 Q404 212 420 212 H486', 'lineBlue'),
      path('M340 384 H486', 'lineGreen'),
      path('M340 412 H388 Q404 412 404 428 V484 Q404 500 420 500 H486', 'lineRose'),
      path('M340 440 H386 Q402 440 402 456 V628 Q402 644 418 644 H486', 'lineBlue'),
      path('M718 212 H886 Q902 212 902 228 V334', 'lineBlue'),
      path('M718 356 H902', 'lineGreen'),
      path('M718 500 H886 Q902 500 902 484 V462', 'lineRose'),
      path('M718 644 H876', 'lineBlue', 'fallback path', 798, 630, 106),
      path('M650 594 V570 Q650 554 666 554 H1025 Q1041 554 1041 538 V462', 'lineRose', 'remote read', 870, 540, 100),
      path('M1152 398 H1210', 'lineAmber', 'measure', 1180, 384, 70),
      path('M1025 594 V462', 'lineRose', 'fallback state', 1088, 540, 112),
    ]) +
    footer('Graphviz structure evidence: cache-series-workshop-profile-01.dot / .plain / -sketch.svg', 1480, 830),
);

write(
  'cache-series-workshop-benchmark-01',
  header(1380, 984, 'Workshop Cache Benchmark Profiles', 'Read and write throughput from bluetape4k-workshop cache-benchmark. Higher is better.') +
    content([
      card(72, 148, 230, 86, 'neutral', 'No Cache', ['read ~8.2k', 'write ~8.2k ops/s']),
      card(72, 264, 230, 86, 'green', 'Caffeine', ['read ~490k', 'write ~8.1k ops/s']),
      card(72, 380, 230, 86, 'teal', 'Near Cache', ['read ~465k', 'write ~7.2k ops/s']),
      card(72, 496, 230, 86, 'rose', 'Redis Cache', ['read ~43k', 'write ~7.3k ops/s']),
      card(72, 612, 230, 86, 'blue', 'Write-Through', ['read ~41k', 'write ~5.6k ops/s']),
      card(72, 728, 230, 86, 'amber', 'Write-Behind', ['read ~42k', 'write ~24k ops/s']),
      '<g><text class="smallLabel" x="395" y="132">Read throughput</text><rect x="395" y="166" width="12" height="28" rx="10" fill="#F5F7FB" stroke="#93A4B7"/><rect x="395" y="282" width="700" height="28" rx="10" fill="#EAF7EF" stroke="#58A978"/><rect x="395" y="398" width="664" height="28" rx="10" fill="#E9F7F6" stroke="#45A7A1"/><rect x="395" y="514" width="61" height="28" rx="10" fill="#FDECEF" stroke="#DC6B82"/><rect x="395" y="630" width="59" height="28" rx="10" fill="#E8F3FF" stroke="#5B8DEF"/><rect x="395" y="746" width="60" height="28" rx="10" fill="#FFF3D9" stroke="#D6A441"/></g>',
      '<g><text class="smallLabel" x="1142" y="132">Write throughput</text><rect x="1142" y="166" width="68" height="28" rx="10" fill="#F5F7FB" stroke="#93A4B7"/><rect x="1142" y="282" width="67" height="28" rx="10" fill="#EAF7EF" stroke="#58A978"/><rect x="1142" y="398" width="59" height="28" rx="10" fill="#E9F7F6" stroke="#45A7A1"/><rect x="1142" y="514" width="60" height="28" rx="10" fill="#FDECEF" stroke="#DC6B82"/><rect x="1142" y="630" width="46" height="28" rx="10" fill="#E8F3FF" stroke="#5B8DEF"/><rect x="1142" y="746" width="198" height="28" rx="10" fill="#FFF3D9" stroke="#D6A441"/></g>',
      path('M302 296 H395', 'lineGreen', '60x read', 352, 282, 72),
      path('M302 412 H395', 'lineGreen', '57x read', 352, 398, 72),
      path('M302 760 H395', 'lineAmber', '5x read', 350, 746, 64),
      path('M302 793 H1092 Q1108 793 1108 777 V776 Q1108 760 1124 760 H1142', 'lineAmber', '3x write', 720, 779, 72),
    ]) +
    footer('Source: bluetape4k-workshop spring-boot/cache-benchmark README. Graphviz evidence: cache-series-workshop-benchmark-01.dot / .plain / -sketch.svg', 1380, 950),
);
