import { mkdirSync, writeFileSync } from "node:fs";

const out = "public/assets";
mkdirSync(out, { recursive: true });

const theme = {
  bg: "#0b1220",
  panel: "#111827",
  panel2: "#172033",
  border: "#334155",
  text: "#f8fafc",
  muted: "#cbd5e1",
  faint: "#94a3b8",
  blue: "#60a5fa",
  green: "#86efac",
  amber: "#fbbf24",
  red: "#f87171",
  purple: "#c4b5fd",
  cyan: "#67e8f9",
};

const palettes = {
  blue: ["#172554", "#60a5fa"],
  green: ["#14351f", "#86efac"],
  amber: ["#3b2a08", "#fbbf24"],
  red: ["#3b1217", "#f87171"],
  purple: ["#261943", "#c4b5fd"],
  cyan: ["#12333b", "#67e8f9"],
  slate: ["#1e293b", "#64748b"],
};

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function font(locale, role = "body") {
  if (locale === "ko") {
    return role === "code"
      ? '"goorm Sans Code","goorm Sans","Apple SD Gothic Neo",monospace'
      : '"goorm Sans","Apple SD Gothic Neo",Arial,sans-serif';
  }
  return role === "title"
    ? '"Architects Daughter","Comic Sans MS",Arial,sans-serif'
    : '"Comic Mono","Comic Sans MS",Arial,sans-serif';
}

function svgStart({ width, height, title, desc, locale, markers = true }) {
  const markerDefs = markers
    ? `
  ${marker("blue", theme.blue)}
  ${marker("green", theme.green)}
  ${marker("amber", theme.amber)}
  ${marker("red", theme.red)}
  ${marker("purple", theme.purple)}
  ${marker("cyan", theme.cyan)}`
    : "";
  const connectorStyles = markers
    ? `
    .connector{fill:none;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}
    .line-blue{stroke:${theme.blue};marker-end:url(#arrow-blue)}
    .line-green{stroke:${theme.green};marker-end:url(#arrow-green)}
    .line-amber{stroke:${theme.amber};marker-end:url(#arrow-amber)}
    .line-red{stroke:${theme.red};marker-end:url(#arrow-red)}
    .line-purple{stroke:${theme.purple};marker-end:url(#arrow-purple)}
    .line-cyan{stroke:${theme.cyan};marker-end:url(#arrow-cyan)}
    .dash-blue{stroke:${theme.blue};stroke-dasharray:10 9;marker-end:url(#arrow-blue)}
    .dash-green{stroke:${theme.green};stroke-dasharray:10 9;marker-end:url(#arrow-green)}`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<defs>
  <filter id="shadow" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#020617" flood-opacity="0.35"/></filter>
  ${markerDefs}
  <style>
    .title{font-family:${font(locale, "title")};font-size:44px;font-weight:700;fill:${theme.text}}
    .subtitle{font-family:${font(locale)};font-size:18px;fill:${theme.muted}}
    .lane-title{font-family:${font(locale, "title")};font-size:24px;font-weight:700;fill:${theme.text}}
    .card-title{font-family:${font(locale, "title")};font-size:24px;font-weight:700;fill:${theme.text}}
    .card-body{font-family:${font(locale)};font-size:16px;fill:${theme.muted}}
    .small{font-family:${font(locale)};font-size:14px;fill:${theme.faint}}
    .code{font-family:${font(locale, "code")};font-size:15px;fill:${theme.muted}}
    .panel{fill:${theme.panel};stroke:${theme.border};stroke-width:2}
    .card{filter:url(#shadow);stroke-width:2}
    ${connectorStyles}
    .label-bg{fill:#0f172a;stroke:#475569;stroke-width:1.5}
  </style>
</defs>
<rect width="${width}" height="${height}" fill="${theme.bg}"/>
<rect x="34" y="30" width="${width - 68}" height="${height - 60}" rx="28" class="panel"/>
<text x="70" y="86" class="title">${esc(title)}</text>
<text x="72" y="122" class="subtitle">${esc(desc)}</text>`;
}

function marker(id, color) {
  return `<marker id="arrow-${id}" markerWidth="14" markerHeight="14" refX="13" refY="7" orient="auto" markerUnits="userSpaceOnUse"><path d="M1,1 L13,7 L1,13 Z" fill="${color}"/></marker>`;
}

function rect(x, y, w, h, color, title, lines = [], locale = "en", opts = {}) {
  const [fill, stroke] = palettes[color];
  const titleLines = Array.isArray(title) ? title : [title];
  const all = [
    ...titleLines.map((text, i) => ({ text, cls: opts.monoTitle ? "small" : "card-title", gap: i === 0 ? 0 : 28 })),
    ...lines.map((text, i) => ({ text, cls: opts.monoBody ? "small" : "card-body", gap: i === 0 ? 34 : 22 })),
  ];
  const totalGap = all.slice(1).reduce((sum, line) => sum + line.gap, 0);
  let y0 = y + h / 2 - totalGap / 2 + (opts.offsetY ?? 0);
  const text = all
    .map((line, i) => {
      if (i > 0) y0 += line.gap;
      return `<text x="${x + w / 2}" y="${y0}" text-anchor="middle" dominant-baseline="middle" class="${line.cls}">${esc(line.text)}</text>`;
    })
    .join("\n");
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${opts.rx ?? 18}" fill="${fill}" stroke="${stroke}" class="card"/>
  ${text}
</g>`;
}

function lane(x, y, w, h, title, locale) {
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="${theme.panel2}" stroke="#26364f" stroke-width="2"/>
  <text x="${x + 24}" y="${y + 38}" class="lane-title">${esc(title)}</text>
</g>`;
}

function line(d, cls = "line-blue", label = "", lx = 0, ly = 0, w = 120, locale = "en") {
  const pill = label
    ? `<rect class="label-bg" x="${lx - w / 2}" y="${ly - 17}" width="${w}" height="30" rx="15"/><text class="small" x="${lx}" y="${ly + 2}" text-anchor="middle">${esc(label)}</text>`
    : "";
  return `<path class="connector ${cls}" d="${d}"/>${pill}`;
}

function writePair(stem, data) {
  for (const locale of ["en", "ko"]) {
    const svg = cleanSvg(data(locale));
    writeFileSync(`${out}/${stem}-${locale}.svg`, svg);
  }
}

function cleanSvg(svg) {
  return svg.replace(/[ \t]+$/gm, "");
}

writePair("virtual-threads-part4-spi-01", (locale) => {
  const ko = locale === "ko";
  const title = ko ? "Virtual Threads SPI 경계" : "Virtual Threads SPI Boundary";
  const desc = ko
    ? "애플리케이션은 공통 API만 보고, ServiceLoader가 실행 JDK에 맞는 provider를 선택합니다."
    : "Application code sees one API; ServiceLoader selects the provider that matches the running JDK.";
  return `${svgStart({ width: 1440, height: 820, title, desc, locale })}
${lane(72, 170, 326, 520, ko ? "호출자" : "Caller", locale)}
${lane(446, 170, 452, 520, ko ? "공통 API" : "Common API", locale)}
${lane(946, 170, 422, 600, ko ? "런타임 provider" : "Runtime providers", locale)}
${rect(116, 300, 238, 112, "blue", ko ? "애플리케이션 코드" : "Application code", [ko ? "JDK 분기를 알지 않음" : "does not branch by JDK"], locale)}
${rect(500, 230, 344, 118, "purple", "VirtualThreads", [ko ? "facade · runtimeName()" : "facade · runtimeName()"], locale, { monoTitle: true })}
${rect(500, 445, 344, 126, "cyan", "VirtualThreadRuntime", [ko ? "threadFactory · executorService" : "threadFactory · executorService"], locale, { monoTitle: true, monoBody: true })}
${rect(932, 370, 156, 300, "purple", "ServiceLoader", [ko ? "priority 순서" : "priority order"], locale, { monoTitle: true, monoBody: true })}
${rect(1160, 330, 178, 78, "green", ["Jdk25", "provider"], ["priority = 25"], locale, { monoTitle: true, monoBody: true, titleGap: 20, titleBodyGap: 22 })}
${rect(1160, 475, 178, 78, "amber", ["Jdk21", "provider"], ["priority = 21"], locale, { monoTitle: true, monoBody: true, titleGap: 20, titleBodyGap: 22 })}
${rect(1160, 620, 178, 78, "slate", ko ? "Fallback" : "Fallback", [ko ? "provider 없음" : "no provider"], locale)}
${line("M354 356 H500", "line-blue", ko ? "공통 API 호출" : "call one API", 428, 337, 126, locale)}
${line("M672 348 V445", "line-cyan", "ServiceLoader", 742, 398, 124, locale)}
${line("M844 508 H932", "line-cyan", ko ? "탐색" : "discover", 888, 488, 76, locale)}
${line("M1088 369 H1160", "line-green", ko ? "1순위" : "first", 1124, 348, 74, locale)}
${line("M1088 514 H1160", "line-amber", ko ? "2순위" : "second", 1124, 493, 82, locale)}
${line("M1088 659 H1160", "dash-blue", ko ? "대체" : "fallback", 1124, 638, 82, locale)}
<text x="720" y="738" text-anchor="middle" class="small">${esc(ko ? "소스: virtualthread/api, virtualthread/jdk21, virtualthread/jdk25" : "Sources: virtualthread/api, virtualthread/jdk21, virtualthread/jdk25")}</text>
</svg>
`;
});

writePair("cache-series-module-map-01", (locale) => {
  const ko = locale === "ko";
  const title = ko ? "Bluetape4k Cache 모듈 지도" : "Bluetape4k Cache Module Map";
  const desc = ko
    ? "cache-core가 공통 계약을 정의하고, provider 모듈이 로컬·분산 캐시 동작을 연결합니다."
    : "cache-core defines the common contract; provider modules plug in local and distributed cache behavior.";
  return `${svgStart({ width: 1520, height: 930, title, desc, locale })}
${lane(72, 170, 1376, 610, ko ? "공통 계약에서 provider 구현으로" : "From common contracts to provider implementations", locale)}
${rect(606, 222, 308, 104, "blue", ko ? "애플리케이션 코드" : "Application code", [ko ? "Spring · Ktor · Exposed" : "Spring · Ktor · Exposed"], locale)}
${rect(500, 390, 520, 148, "purple", "cache-core", [ko ? "JCache helper · SuspendCache" : "JCache helpers · SuspendCache", ko ? "Memoizer · NearCache · resilience" : "Memoizer · NearCache · resilience"], locale, { monoTitle: true })}
${rect(118, 640, 242, 100, "green", ko ? "Local provider" : "Local providers", ["Caffeine · Cache2k · Ehcache"], locale)}
${rect(414, 640, 224, 100, "amber", "Memoizer", [ko ? "sync · async · suspend" : "sync · async · suspend"], locale, { monoTitle: true })}
${rect(692, 640, 224, 100, "cyan", "Lettuce", [ko ? "RESP3 NearCache" : "RESP3 NearCache"], locale, { monoTitle: true })}
${rect(970, 640, 224, 100, "red", "Redisson", ["RLocalCachedMap"], locale, { monoTitle: true })}
${rect(1248, 640, 166, 100, "slate", "Hazelcast", ["IMap"], locale, { monoTitle: true })}
${line("M760 326 V390", "line-blue", ko ? "사용" : "uses", 798, 360, 64, locale)}
${line("M500 472 H244 Q224 472 224 492 V640", "line-green", "", 0, 0, 0, locale)}
${line("M604 538 V640", "line-amber", "", 0, 0, 0, locale)}
${line("M784 538 V640", "line-cyan", "", 0, 0, 0, locale)}
${line("M916 538 V590 Q916 610 936 610 H1082 Q1102 610 1102 630 V640", "line-red", "", 0, 0, 0, locale)}
${line("M1020 472 H1331 Q1351 472 1351 492 V640", "line-blue", "", 0, 0, 0, locale)}
<text x="760" y="838" text-anchor="middle" class="small">${esc(ko ? "핵심: 애플리케이션은 provider 차이를 직접 다루지 않고 공통 계약을 사용합니다." : "Key point: application code uses the common contract instead of handling provider differences directly.")}</text>
</svg>
`;
});

writePair("cache-series-near-cache-flow-01", (locale) => {
  const ko = locale === "ko";
  const title = ko ? "Near Cache 읽기와 무효화 흐름" : "Near Cache Read and Invalidation Flow";
  const desc = ko
    ? "L1 hit은 JVM 안에서 끝나고, miss·write·invalidation만 Redis L2와 조율합니다."
    : "L1 hits finish inside the JVM; misses, writes, and invalidation coordinate with Redis L2.";
  return `${svgStart({ width: 1580, height: 980, title, desc, locale })}
${rect(82, 370, 236, 118, "blue", ko ? "애플리케이션" : "Application", [ko ? "repository / service" : "repository / service"], locale)}
${rect(430, 270, 300, 130, "green", "L1 Front Cache", [ko ? "JVM 안 Caffeine" : "Caffeine in JVM", ko ? "hot read 경로" : "hot read path"], locale, { monoTitle: true })}
${rect(840, 270, 300, 130, "red", "Redis L2", [ko ? "공유 상태" : "shared state", ko ? "TTL · eviction" : "TTL · eviction"], locale, { monoTitle: true })}
${rect(1236, 198, 250, 118, "cyan", "RESP3 Tracking", [ko ? "서버 push" : "server push", ko ? "key invalidation" : "key invalidation"], locale, { monoTitle: true })}
${rect(1236, 504, 250, 118, "amber", "Pub/Sub Topic", [ko ? "client 관리" : "client-managed", ko ? "broadcast invalidation" : "broadcast invalidation"], locale, { monoTitle: true })}
${rect(462, 638, 238, 96, "purple", ko ? "Local 통계" : "Local stats", ["hit · miss · invalidated"], locale)}
${line("M318 428 H430", "line-blue", "get", 374, 407, 58, locale)}
${line("M430 354 H318", "line-green", "L1 hit", 374, 334, 72, locale)}
${line("M730 328 H840", "line-blue", ko ? "miss load" : "miss load", 785, 307, 100, locale)}
${line("M840 372 H730", "line-green", "fill", 785, 392, 54, locale)}
${line("M202 488 V820 Q202 840 222 840 H990 Q1010 840 1010 820 V400", "line-amber", "write-through", 610, 818, 126, locale)}
${line("M1140 326 H1236", "line-cyan", ko ? "변경 key" : "changed key", 1188, 305, 104, locale)}
${line("M1236 258 H730", "dash-green", "invalidate", 982, 238, 104, locale)}
${line("M1140 372 H1184 Q1204 372 1204 392 V544 Q1204 564 1224 564 H1236", "line-amber", "publish", 1204, 458, 78, locale)}
${line("M1486 563 H1530 Q1550 563 1550 543 V170 Q1550 150 1530 150 H620 Q600 150 600 170 V270", "dash-blue", "invalidate", 986, 130, 104, locale)}
${line("M580 400 V638", "line-purple", "record", 626, 520, 74, locale)}
<text x="790" y="886" text-anchor="middle" class="small">${esc(ko ? "선택 기준: read-heavy hot key에는 L1 hit ratio, write-heavy 데이터에는 무효화 비용과 stale 허용 범위를 먼저 봅니다." : "Selection rule: for read-heavy hot keys, watch the L1 hit ratio; for write-heavy data, check invalidation cost and staleness tolerance first.")}</text>
</svg>
`;
});

writePair("cache-series-benchmark-chart-01", (locale) => {
  const ko = locale === "ko";
  const title = ko ? "Lettuce Near Cache 벤치마크 요약" : "Lettuce Near Cache Benchmark Summary";
  const desc = ko
    ? "처리량 단위는 ops/ms입니다. 높을수록 좋고, L1 read는 별도 scale로 표시했습니다."
    : "Throughput is ops/ms. Higher is better. L1 reads use a separate visual scale.";
  const labels = ko
    ? ["L1 hit", "L2 hit / miss", "putSingle", "putAll 16KB", "실전 해석", "L1 hit ratio 극대화", "write cost 관찰", "큰 payload batch 분리"]
    : ["L1 hit", "L2 hit / miss", "putSingle", "putAll 16KB", "Practical reading", "maximize L1 hit ratio", "watch write cost", "split large payload batches"];
  return `${svgStart({ width: 1420, height: 900, title, desc, locale, markers: false })}
${rect(86, 208, 264, 96, "green", labels[0], ["~64,000 ops/ms"], locale, { monoTitle: true, monoBody: true })}
${rect(86, 344, 264, 96, "blue", labels[1], ["~4 ops/ms"], locale, { monoTitle: true, monoBody: true })}
${rect(86, 480, 264, 96, "amber", labels[2], ["~2 ops/ms"], locale, { monoTitle: true, monoBody: true })}
${rect(86, 616, 264, 96, "red", labels[3], ["~0.4 ops/ms"], locale, { monoTitle: true, monoBody: true })}
${bar(434, 230, 742, 56, 708, "green")}
${bar(434, 366, 230, 56, 92, "blue")}
${bar(434, 502, 230, 56, 52, "amber")}
${bar(434, 638, 230, 56, 22, "red")}
${rect(820, 428, 350, 132, "purple", labels[4], [labels[5], labels[6], labels[7]], locale)}
<text x="710" y="806" text-anchor="middle" class="small">${esc(ko ? "소스: cache-lettuce/Benchmark.ko.md · Apple M4 Pro, GraalVM 21, Redis 7 Testcontainers, JMH 1.37" : "Source: cache-lettuce/Benchmark.ko.md · Apple M4 Pro, GraalVM 21, Redis 7 Testcontainers, JMH 1.37")}</text>
</svg>
`;
});

function bar(x, y, w, h, value, color) {
  const [fill, stroke] = palettes[color];
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#0f172a" stroke="${stroke}" stroke-width="2"/>
  <rect x="${x}" y="${y}" width="${value}" height="${h}" rx="16" fill="${fill}" stroke="none"/>
</g>`;
}
