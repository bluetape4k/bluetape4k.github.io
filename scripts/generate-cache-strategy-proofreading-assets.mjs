import { execFileSync } from "node:child_process";
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

function marker(id, color) {
  return `<marker id="arrow-${id}" markerWidth="16" markerHeight="16" refX="14" refY="8" orient="auto" markerUnits="userSpaceOnUse"><path d="M1,1 L15,8 L1,15 Z" fill="${color}"/></marker>`;
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
    .connector{fill:none;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
    .line-blue{stroke:${theme.blue};marker-end:url(#arrow-blue)}
    .line-green{stroke:${theme.green};marker-end:url(#arrow-green)}
    .line-amber{stroke:${theme.amber};marker-end:url(#arrow-amber)}
    .line-red{stroke:${theme.red};marker-end:url(#arrow-red)}
    .line-purple{stroke:${theme.purple};marker-end:url(#arrow-purple)}
    .line-cyan{stroke:${theme.cyan};marker-end:url(#arrow-cyan)}
    .dash-blue{stroke:${theme.blue};stroke-dasharray:11 10;marker-end:url(#arrow-blue)}
    .dash-green{stroke:${theme.green};stroke-dasharray:11 10;marker-end:url(#arrow-green)}
    .dash-purple{stroke:${theme.purple};stroke-dasharray:11 10;marker-end:url(#arrow-purple)}`
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
    .mono{font-family:${font(locale, "code")};font-size:15px;fill:${theme.muted}}
    .panel{fill:${theme.panel};stroke:${theme.border};stroke-width:2}
    .row{fill:#0f172a;stroke:#334155;stroke-width:2}
    .row-alt{fill:#111c2f;stroke:#334155;stroke-width:2}
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

function rect(x, y, w, h, color, title, lines = [], locale = "en", opts = {}) {
  void locale;
  const [fill, stroke] = palettes[color];
  const titleLines = Array.isArray(title) ? title : [title];
  const all = [
    ...titleLines.map((text, i) => ({ text, cls: opts.monoTitle ? "mono" : "card-title", gap: i === 0 ? 0 : 28 })),
    ...lines.map((text, i) => ({ text, cls: opts.monoBody ? "mono" : "card-body", gap: i === 0 ? 34 : 22 })),
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

function lane(x, y, w, h, title) {
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="${theme.panel2}" stroke="#26364f" stroke-width="2"/>
  <text x="${x + 24}" y="${y + 38}" class="lane-title">${esc(title)}</text>
</g>`;
}

function line(d, cls = "line-blue", label = "", lx = 0, ly = 0, w = 120, connector = "") {
  const data = connector ? ` data-connector="${connector}"` : "";
  const pill = label
    ? `<rect class="label-bg" x="${lx - w / 2}" y="${ly - 17}" width="${w}" height="30" rx="15"/><text class="small" x="${lx}" y="${ly + 2}" text-anchor="middle">${esc(label)}</text>`
    : "";
  return `<path class="connector ${cls}"${data} d="${d}"/>${pill}`;
}

function writePair(stem, data) {
  for (const locale of ["en", "ko"]) {
    const svgPath = `${out}/${stem}-${locale}.svg`;
    const pngPath = `${out}/${stem}-${locale}.png`;
    writeFileSync(svgPath, cleanSvg(data(locale)));
    execFileSync("xmllint", ["--noout", svgPath]);
    execFileSync("cairosvg", [svgPath, "-o", pngPath, "-s", "2"]);
  }
}

function cleanSvg(svg) {
  return svg.replace(/[ \t]+$/gm, "");
}

function bar(x, y, w, h, value, color) {
  const [fill, stroke] = palettes[color];
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#0f172a" stroke="${stroke}" stroke-width="2"/>
  <rect x="${x}" y="${y}" width="${value}" height="${h}" rx="16" fill="${fill}" stroke="none"/>
</g>`;
}

function benchmarkLabel(locale, y, title, lines, color) {
  return rect(92, y, 292, 112, color, title, lines, locale, { monoTitle: true, monoBody: true });
}

writePair("cache-series-exposed-strategies-01", (locale) => {
  const ko = locale === "ko";
  const title = ko ? "JdbcCacheRepository 캐시 전략 지도" : "JdbcCacheRepository Cache Strategy Map";
  const desc = ko
    ? "Redisson map loader는 read-through를, map writer는 write-through/write-behind를 담당합니다."
    : "Redisson map loader handles read-through; map writer handles write-through or write-behind.";
  return `${svgStart({ width: 1600, height: 1000, title, desc, locale })}
${lane(72, 172, 1456, 690, ko ? "Repository 호출은 같지만 loader/writer 계약이 동작을 바꿉니다" : "The repository call shape stays stable; loader and writer contracts change behavior")}
${rect(110, 400, 296, 132, "blue", "JdbcCacheRepository", ["get · getAll", "put · putAll", "invalidate · clear"], locale, { monoTitle: true, monoBody: true })}
${rect(548, 360, 350, 164, "green", ["RMap", "RLocalCachedMap"], [ko ? "loader + optional writer" : "loader + optional writer", ko ? "Near Cache 활성화 가능" : "Near Cache when enabled"], locale, { monoTitle: true, monoBody: true })}
${rect(1000, 242, 300, 124, "cyan", "EntityMapLoader", ["ExposedEntityMapLoader", ko ? "cache miss -> DB read" : "cache miss -> DB read"], locale, { monoTitle: true, monoBody: true })}
${rect(1000, 574, 300, 124, "amber", "EntityMapWriter", ["ExposedEntityMapWriter", ko ? "put / putAll -> DB write" : "put / putAll -> DB write"], locale, { monoTitle: true, monoBody: true })}
${rect(1304, 392, 204, 168, "purple", "Exposed DB", ["IdTable", ko ? "transaction boundary" : "transaction boundary"], locale, { monoTitle: true, monoBody: true })}
${rect(128, 696, 308, 104, "slate", "READ_ONLY", ["UserCredentials", "WITH_NEAR_CACHE · loader only"], locale, { monoTitle: true, monoBody: true })}
${rect(520, 696, 368, 104, "blue", "READ_WRITE_THROUGH", ["User", "WITH_NEAR_CACHE · loader + writer"], locale, { monoTitle: true, monoBody: true })}
${rect(958, 758, 358, 104, "red", "WRITE_BEHIND", ["UserEvent", "WITH_NEAR_CACHE · async flush"], locale, { monoTitle: true, monoBody: true })}
${line("M406 464 H548", "line-blue", "get / put", 478, 444, 86, "repository-to-map")}
${line("M548 492 H406", "line-green", "cache hit", 478, 518, 84, "map-to-repository-hit")}
${line("M898 412 H940 Q960 412 960 392 V304 Q960 284 980 284 H1000", "line-blue", "cache miss", 952, 270, 104, "map-to-loader")}
${line("M1300 304 H1366 Q1386 304 1386 324 V392", "line-cyan", ko ? "DB에서 읽기" : "read from DB", 1394, 354, 110, "loader-to-db")}
${line("M898 472 H942 Q962 472 962 492 V636 Q962 656 982 656 H1000", "line-amber", "put / putAll", 962, 552, 108, "map-to-writer")}
${line("M1300 636 H1366 Q1386 636 1386 616 V560", "line-amber", ko ? "즉시 쓰기 / async" : "write now / async", 1398, 598, 136, "writer-to-db")}
${line("M282 696 V552 Q282 532 302 532 H588 Q608 532 608 524", "dash-green", "loader only", 448, 680, 98, "readonly-to-map")}
${line("M704 696 V524", "dash-blue", "loader + writer", 780, 680, 128, "readwrite-to-map")}
${line("M1137 758 V698", "dash-purple", "write-behind queue", 1224, 742, 158, "writebehind-to-writer")}
<text x="800" y="924" text-anchor="middle" class="small">${esc(ko ? "핵심: 캐시는 빠른 Map이 아니라 read/write 실패 정책을 가진 repository 계약입니다." : "Key point: cache is not just a fast Map; it is a repository contract with read/write failure policy.")}</text>
</svg>`;
});

writePair("cache-series-exposed-benchmark-01", (locale) => {
  const ko = locale === "ko";
  const title = ko ? "Exposed Cache 벤치마크 스냅샷" : "Exposed Cache Benchmark Snapshot";
  const desc = ko
    ? "exposed-workshop 11장 벤치마크의 평균 지연 시간입니다. 낮을수록 좋습니다."
    : "Average latency from exposed-workshop chapter 11 benchmark. Lower is better.";
  const readingTitle = ko ? "해석" : "Reading";
  const readLine1 = ko ? "READ_THROUGH: 5.5배 빠름" : "READ_THROUGH: 5.5x faster";
  const readLine2 = ko ? "WRITE_THROUGH: 9.9배 빠름" : "WRITE_THROUGH: 9.9x faster";
  const readLine3 = ko ? "읽기 중심 워크로드에서 차이가 큼" : "when reads dominate";
  return `${svgStart({ width: 1420, height: 900, title, desc, locale, markers: false })}
${benchmarkLabel(locale, 190, "NO_CACHE", ["READ_HEAVY", "517.5 us/op"], "slate")}
${benchmarkLabel(locale, 334, "READ_THROUGH", ["READ_HEAVY", "94.3 us/op"], "green")}
${benchmarkLabel(locale, 478, "WRITE_THROUGH", ["READ_HEAVY", "52.1 us/op"], "blue")}
${benchmarkLabel(locale, 622, "WRITE_HEAVY", ["445-508 us/op", ko ? "전략 영향 작음" : "strategy effect small"], "amber")}
${bar(468, 218, 540, 52, 540, "slate")}
${bar(468, 362, 540, 52, 98, "green")}
${bar(468, 506, 540, 52, 55, "blue")}
${bar(468, 650, 540, 52, 468, "amber")}
${rect(1050, 370, 288, 166, "purple", readingTitle, [readLine1, readLine2, readLine3], locale, { monoBody: true })}
<text x="468" y="790" class="small">${esc(ko ? "소스: exposed-workshop 11-high-performance/04-benchmark · AverageTime, us/op" : "Source: exposed-workshop 11-high-performance/04-benchmark · AverageTime, us/op")}</text>
<text x="1208" y="790" text-anchor="end" class="small">${esc(ko ? "막대가 짧을수록 빠릅니다." : "Shorter bars are faster.")}</text>
</svg>`;
});

function rowCard(x, y, w, h, color, title, body, locale) {
  return rect(x, y, w, h, color, title, body, locale, { monoTitle: true, monoBody: true, rx: 16 });
}

function workflowRow({ y, cls, call, cacheTitle, cacheBody, dbBody, labels, locale, kind }) {
  const cacheColor = kind === "writeBehind" ? "red" : "amber";
  const dbColor = kind === "writeBehind" ? "purple" : "green";
  const bottom = kind === "writeBehind";
  return `<rect class="${cls}" x="70" y="${y}" width="1620" height="${bottom ? 250 : 178}" rx="24"/>
${rowCard(118, y + 46, 338, 96, "blue", "JdbcCacheRepository", [call], locale)}
${rowCard(620, y + 38, 332, 112, cacheColor, cacheTitle, cacheBody, locale)}
${rowCard(1264, y + (bottom ? 124 : 42), 300, 104, dbColor, "Exposed DB", dbBody, locale)}
${bottom ? rowCard(1050, y + 40, 300, 104, "purple", "write-behind queue", ["batch / retry"], locale) : ""}
${line(`M456 ${y + 94} H620`, "line-blue", call.split("(")[0], 538, y + 74, 70, `${kind}-repository-to-map`)}
${bottom ? "" : line(`M952 ${y + 82} H1264`, "line-blue", labels.forward, 1108, y + 62, 172, `${kind}-map-to-db`)}
${bottom ? line(`M952 ${y + 92} H1050`, "dash-purple", "enqueue", 1001, y + 70, 90, "writebehind-map-to-queue") : ""}
${bottom ? line(`M1200 ${y + 144} V${y + 196} Q1200 ${y + 218} 1222 ${y + 218} H1264`, "line-purple", "batch flush", 1232, y + 194, 104, "writebehind-queue-to-db") : ""}
${labels.back ? line(`M1264 ${y + 122} H952`, "dash-green", labels.back, 1108, y + 144, 150, `${kind}-db-to-map`) : ""}`;
}

writePair("cache-series-workshop-strategy-01", (locale) => {
  const ko = locale === "ko";
  const title = ko ? "Exposed Workshop 캐시 전략 계약" : "Exposed Workshop cache strategy contracts";
  const desc = ko
    ? "Chapter 11 예제는 repository 호출과 DB 접근을 loader/writer 계약으로 분리합니다."
    : "Chapter 11 separates repository calls from DB access through loader and writer contracts.";
  return `${svgStart({ width: 1760, height: 1080, title, desc, locale })}
${rect(420, 168, 920, 104, "amber", "JdbcCacheRepository", ["get / put / putAll / invalidate"], locale, { monoTitle: true, monoBody: true })}
${workflowRow({
  y: 320,
  cls: "row",
  call: "get(id)",
  cacheTitle: "RMap / Near Cache",
  cacheBody: [ko ? "hit 반환" : "return hit", ko ? "miss 시 loader 호출" : "call loader on miss"],
  dbBody: [ko ? "source of truth" : "source of truth"],
  labels: { forward: "EntityMapLoader.load", back: ko ? "조회 결과 반환" : "loaded entity" },
  locale,
  kind: "readThrough",
})}
${workflowRow({
  y: 540,
  cls: "row-alt",
  call: "put(entity)",
  cacheBody: ["READ_WRITE_THROUGH"],
  dbBody: [ko ? "즉시 DB write" : "immediate DB write"],
  labels: { forward: "EntityMapWriter.write" },
  locale,
  kind: "writeThrough",
})}
${workflowRow({
  y: 750,
  cls: "row",
  call: "putAll(events)",
  cacheBody: ["WRITE_BEHIND"],
  dbBody: ["batch flush"],
  labels: { forward: "enqueue" },
  locale,
  kind: "writeBehind",
})}
<rect x="118" y="940" width="1000" height="52" rx="16" fill="#3b2a08" stroke="${theme.amber}" stroke-width="2"/>
<text class="mono" x="146" y="972">${esc(ko ? "DB write 호출 경로와 분리: queue durability / retry / drain 정책 필요" : "DB write path is separated: queue durability / retry / drain policy required")}</text>
</svg>`;
});
