import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const outDir = path.resolve("public/assets");

const locale = {
  en: {
    titleFont: "Architects Daughter",
    bodyFont: "Comic Mono",
    monoFont: "Comic Mono",
    sequenceTitle: "Ktor + Exposed R2DBC tenant routing",
    sequenceSub: "Raw headers stop at the plugin; database routing receives validated values.",
    client: "Client",
    clientRole: "HTTP request",
    plugin: "TenantPlugin",
    pluginRole: "normalize + validate",
    attrs: "Call attributes",
    attrsRole: "Tenants.Tenant",
    helper: "Tenant tx helper",
    helperRole: "suspendTransactionWithTenant",
    db: "R2DBC DB",
    dbRole: "schema state",
    requestTitle: "GET /actors",
    requestSub: "X-TENANT-ID: korean",
    lookup: "Tenants.findById()",
    lookupSub: "reject blank / unknown",
    store: "attributes.put(Tenants.Tenant)",
    read: "route reads currentTenant()",
    tx: "suspendTransactionWithTenant",
    schema: "SET SCHEMA korean",
    query: "query actors",
    rows: "Actor rows",
    branch: "alt invalid header",
    branchSub: "TenantPlugin returns 400 InvalidTenantException before database routing.",
    boundary: "Boundary rule",
    boundaryText: "Do not pass raw header strings to schema selection. Keep request state in ApplicationCall.attributes, then pass explicit validated values.",
    mapTitle: "Same Routing Problem, Different Runtime Boundary",
    mapSub: "Validate once, pass explicit values, and prove isolation.",
    problem: "Reader problem",
    problemA: "Select the right tenant schema or R2DBC target.",
    problemB: "Do it without leaking state to the next request.",
    spring: "Spring / JDBC workshop",
    ktor: "Ktor / Exposed R2DBC workshop",
    carrier: "Carrier",
    boundaryLabel: "Boundary",
    target: "Target choice",
    watch: "Watch out",
    springCarrierA: "ThreadLocal, ScopedValue, ReactorContext",
    springCarrierB: "chosen by runtime model",
    springBoundaryA: "filter / AOP / transaction template",
    springBoundaryB: "bind state before JDBC work",
    springTargetA: "schema or DataSource selection",
    springTargetB: "inside JDBC transaction",
    springWatchA: "Thread affinity and cleanup rules",
    springWatchB: "are correctness rules",
    ktorCarrierA: "ApplicationCall.attributes",
    ktorCarrierB: "stores RoutingRequest or enum",
    ktorBoundaryA: "plugin resolves headers",
    ktorBoundaryB: "repository receives explicit route",
    ktorTargetA: "SET SCHEMA for tenant",
    ktorTargetB: "registry.database(route.key)",
    ktorWatchA: "Headers are routing hints",
    ktorWatchB: "not authentication or policy",
    blocking: "blocking path",
    coroutine: "coroutine path",
    invariant: "Shared invariant",
    invariantA: "Tests prove isolation, invalid input rejection, write target separation,",
    invariantB: "and concurrent request state isolation.",
  },
  ko: {
    titleFont: "goorm Sans",
    bodyFont: "goorm Sans",
    monoFont: "goorm Sans Code",
    sequenceTitle: "Ktor + Exposed R2DBC tenant routing",
    sequenceSub: "원본 header는 plugin에서 멈추고, database routing에는 검증된 값만 넘어갑니다.",
    client: "Client",
    clientRole: "HTTP 요청",
    plugin: "TenantPlugin",
    pluginRole: "정규화 + 검증",
    attrs: "Call attributes",
    attrsRole: "Tenants.Tenant",
    helper: "Tenant tx helper",
    helperRole: "suspendTransactionWithTenant",
    db: "R2DBC DB",
    dbRole: "schema 상태",
    requestTitle: "GET /actors",
    requestSub: "X-TENANT-ID: korean",
    lookup: "Tenants.findById()",
    lookupSub: "blank / unknown 거부",
    store: "attributes.put(Tenants.Tenant)",
    read: "route가 currentTenant() 읽기",
    tx: "suspendTransactionWithTenant",
    schema: "SET SCHEMA korean",
    query: "actors 조회",
    rows: "Actor rows",
    branch: "alt invalid header",
    branchSub: "TenantPlugin이 database routing 전에 400 InvalidTenantException으로 응답합니다.",
    boundary: "Boundary rule",
    boundaryText: "raw header string을 schema 선택으로 넘기지 않습니다. request state는 ApplicationCall.attributes에 두고, 검증된 값을 명시적으로 전달합니다.",
    mapTitle: "같은 routing 문제, 다른 runtime boundary",
    mapSub: "한 번 검증하고, 명시적인 값으로 넘긴 뒤, 격리를 테스트합니다.",
    problem: "Reader problem",
    problemA: "알맞은 tenant schema 또는 R2DBC target을 고릅니다.",
    problemB: "다음 request로 state가 새지 않게 처리합니다.",
    spring: "Spring / JDBC workshop",
    ktor: "Ktor / Exposed R2DBC workshop",
    carrier: "상태 전달자",
    boundaryLabel: "Boundary",
    target: "대상 선택",
    watch: "주의",
    springCarrierA: "ThreadLocal, ScopedValue, ReactorContext",
    springCarrierB: "runtime model에 맞춰 선택",
    springBoundaryA: "filter / AOP / transaction template",
    springBoundaryB: "JDBC 작업 전에 state binding",
    springTargetA: "schema 또는 DataSource 선택",
    springTargetB: "JDBC transaction 안에서 결정",
    springWatchA: "Thread affinity와 cleanup rule",
    springWatchB: "correctness rule로 다룹니다",
    ktorCarrierA: "ApplicationCall.attributes",
    ktorCarrierB: "RoutingRequest 또는 enum 저장",
    ktorBoundaryA: "plugin이 header를 해석",
    ktorBoundaryB: "repository는 explicit route 수신",
    ktorTargetA: "tenant별 SET SCHEMA",
    ktorTargetB: "registry.database(route.key)",
    ktorWatchA: "Header는 routing hint",
    ktorWatchB: "authentication/policy가 아닙니다",
    blocking: "blocking path",
    coroutine: "coroutine path",
    invariant: "공통 불변식",
    invariantA: "테스트는 격리, invalid input rejection, write target 분리,",
    invariantB: "concurrent request state isolation을 증명해야 합니다.",
  },
};

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function text(x, y, value, cls, extra = "") {
  return `<text x="${x}" y="${y}" class="${cls}" ${extra}>${esc(value)}</text>`;
}

function marker(id, color) {
  return `<marker id="${id}" viewBox="0 0 10 10" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" refX="9" refY="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}" stroke="${color}" stroke-width="0" stroke-dasharray="none" style="stroke-dasharray:none!important"/></marker>`;
}

function defs(l) {
  return `<defs>
    <filter id="shadow" x="-8%" y="-8%" width="116%" height="116%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#28343b" flood-opacity="0.13"/></filter>
    ${marker("arrow-blue", "#3f7d9c")}
    ${marker("arrow-green", "#608a55")}
    ${marker("arrow-amber", "#a27848")}
    ${marker("arrow-red", "#b75f5f")}
    <style>
      .canvas{fill:#fbfcf8}.frame{fill:#fff;stroke:#41545d;stroke-width:2.2}
      .title{font-family:"${l.titleFont}";font-size:40px;fill:#263238;font-weight:700}
      .subtitle,.detail,.body,.cellText,.labelText,.footer,.role{font-family:"${l.bodyFont}";fill:#4e6069}
      .subtitle{font-size:18px}.detail,.body{font-size:15px}.cellText{font-size:16px}.footer{font-size:14px}
      .role{font-family:"${l.monoFont}";font-size:13px}.mono,.code,.badgeText{font-family:"${l.monoFont}";fill:#33454e}
      .participant,.cardTitle,.bandTitle,.cellTitle{font-family:"${l.titleFont}";fill:#1f3138;font-weight:700}
      .participant{font-size:21px}.cardTitle{font-size:25px}.bandTitle{font-size:23px}.cellTitle{font-size:18px}
      .header{fill:#fff;stroke:#546e7a;stroke-width:2;filter:url(#shadow)}
      .headerAlt{fill:#f4fbf6;stroke:#6f9b7a;stroke-width:2;filter:url(#shadow)}
      .lifeline{stroke:#9aaab1;stroke-width:2;stroke-dasharray:7 8}.activation{fill:#e7f2ec;stroke:#5b7e67;stroke-width:1.7}
      .call,.state,.return,.skip,.edge{fill:none;stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round}
      .call{stroke:#3f7d9c;marker-end:url(#arrow-blue)}.state{stroke:#608a55;marker-end:url(#arrow-green)}
      .return{stroke:#a27848;marker-end:url(#arrow-amber);stroke-dasharray:8 7}.skip{stroke:#b75f5f;marker-end:url(#arrow-red)}
      .pill,.label{fill:#fff;stroke:#78909c;stroke-width:1.4}.labelText{font-size:13px}
      .badge{fill:#263238}.badgeText{font-size:12px;font-weight:700;fill:#fff}
      .branch{fill:none;stroke:#78909c;stroke-width:2.2;stroke-dasharray:12 8}.divider{stroke:#78909c;stroke-width:1.4;stroke-dasharray:8 7}
      .note{fill:#fff7e8;stroke:#d4a95f;stroke-width:2}
      .problem{fill:#eef3ff;stroke:#95a7d8;stroke-width:2;filter:url(#shadow)}
      .spring{fill:#fff8eb;stroke:#d2a96c;stroke-width:2;filter:url(#shadow)}
      .ktor{fill:#eafafa;stroke:#62aeb3;stroke-width:2;filter:url(#shadow)}
      .shared{fill:#f1f9ef;stroke:#82ad7a;stroke-width:2;filter:url(#shadow)}
      .row{fill:#fff;stroke:#d7e2e8;stroke-width:1.4}.rowAlt{fill:#f8fbfc;stroke:#d7e2e8;stroke-width:1.4}
      .chip{fill:#fff;stroke:#cad8de;stroke-width:1.4}.chipAlt{fill:#f8fbfc;stroke:#cad8de;stroke-width:1.4}
    </style>
  </defs>`;
}

function participant(x, y, w, title, role, alt = false) {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="86" rx="8" class="${alt ? "headerAlt" : "header"}"/>
    ${text(x + w / 2, y + 34, title, "participant", 'text-anchor="middle"')}
    ${text(x + w / 2, y + 62, role, "role", 'text-anchor="middle"')}
  </g>`;
}

function activation(x, y, h) {
  return `<rect x="${x - 8}" y="${y}" width="16" height="${h}" rx="5" class="activation"/>`;
}

function label(x, y, n, value, width, sub = "") {
  const height = sub ? 50 : 32;
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" class="pill label"/>
    <circle cx="${x + 18}" cy="${y + 16}" r="11" class="badge"/>
    ${text(x + 18, y + 20, n, "badgeText", 'text-anchor="middle"')}
    ${text(x + 38, y + 21, value, "labelText")}${sub ? `\n    ${text(x + 38, y + 42, sub, "detail")}` : ""}
  </g>`;
}

function message({ y, from, to, cls, n, title, sub, width = 268, dy = -46 }) {
  const left = Math.min(from, to);
  const pillX = left + (Math.abs(to - from) - width) / 2;
  const labelY = sub ? y - 62 : y + dy;
  return `<g>
    ${label(pillX, labelY, n, title, width, sub)}
    <path d="M ${from} ${y} L ${to} ${y}" class="${cls}"/>
  </g>`;
}

function sequenceSvg(lang) {
  const l = locale[lang];
  const xs = [170, 480, 800, 1130, 1450];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1680" height="1040" viewBox="0 0 1680 1040" role="img" aria-labelledby="title desc">
  <title id="title">${esc(l.sequenceTitle)}</title><desc id="desc">${esc(l.sequenceSub)}</desc>${defs(l)}
  <rect class="canvas" width="1680" height="1040"/><rect class="frame" x="38" y="32" width="1604" height="964" rx="8"/>
  ${text(840, 88, l.sequenceTitle, "title", 'text-anchor="middle"')}${text(840, 122, l.sequenceSub, "subtitle", 'text-anchor="middle"')}
  ${participant(72, 158, 196, l.client, l.clientRole)}
  ${participant(362, 158, 236, l.plugin, l.pluginRole)}
  ${participant(680, 158, 240, l.attrs, l.attrsRole)}
  ${participant(988, 158, 284, l.helper, l.helperRole)}
  ${participant(1360, 158, 180, l.db, l.dbRole, true)}
  ${xs.map((x) => `<path d="M ${x} 244 L ${x} 914" class="lifeline"/>`).join("")}
  ${activation(xs[1], 278, 476)}${activation(xs[2], 346, 288)}${activation(xs[3], 556, 224)}${activation(xs[4], 626, 154)}
  ${message({ y: 306, from: xs[0], to: xs[1] - 8, cls: "call", n: "1", title: l.requestTitle, sub: l.requestSub, width: 264 })}
  ${message({ y: 374, from: xs[1] + 8, to: xs[2] - 8, cls: "state", n: "2", title: l.lookup, sub: l.lookupSub, width: 278 })}
  ${message({ y: 452, from: xs[2] - 8, to: xs[1] + 8, cls: "return", n: "3", title: l.store, width: 332 })}
  ${message({ y: 532, from: xs[1] + 8, to: xs[2] - 8, cls: "call", n: "4", title: l.read, width: 310 })}
  ${message({ y: 604, from: xs[2] + 8, to: xs[3] - 8, cls: "state", n: "5", title: l.tx, width: 342 })}
  ${message({ y: 674, from: xs[3] + 8, to: xs[4] - 8, cls: "state", n: "6", title: l.schema, width: 282 })}
  ${message({ y: 746, from: xs[3] + 8, to: xs[4] - 8, cls: "call", n: "7", title: l.query, width: 212 })}
  ${message({ y: 820, from: xs[4] - 8, to: xs[0] + 8, cls: "return", n: "8", title: l.rows, width: 214, dy: -48 })}
  <rect x="92" y="852" width="1438" height="64" rx="8" class="branch" fill="none"/>
  ${text(116, 878, l.branch, "mono")}${text(116, 903, l.branchSub, "detail")}
  <g>
    <rect x="102" y="940" width="1476" height="38" rx="8" class="note"/>
    ${text(128, 965, l.boundary, "cellTitle")}${text(306, 965, l.boundaryText, "footer")}
  </g>
  </svg>`;
}

function row(x, y, title, a, b, alt = false) {
  return `<g>
    <rect x="${x}" y="${y}" width="570" height="78" rx="8" class="${alt ? "rowAlt" : "row"}"/>
    ${text(x + 24, y + 29, title, "cellTitle")}
    ${text(x + 24, y + 53, a, "cellText")}
    ${text(x + 24, y + 72, b, "cellText")}
  </g>`;
}

function mapSvg(lang) {
  const l = locale[lang];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1700" height="1040" viewBox="0 0 1700 1040" role="img" aria-labelledby="title desc">
  <title id="title">${esc(l.mapTitle)}</title><desc id="desc">${esc(l.mapSub)}</desc>${defs(l)}
  <rect class="canvas" width="1700" height="1040"/><rect class="frame" x="42" y="34" width="1616" height="962" rx="8"/>
  ${text(850, 90, l.mapTitle, "title", 'text-anchor="middle"')}${text(850, 124, l.mapSub, "subtitle", 'text-anchor="middle"')}
  <g>
    <rect x="380" y="162" width="940" height="116" rx="8" class="problem"/>
    ${text(850, 206, l.problem, "cardTitle", 'text-anchor="middle"')}
    ${text(850, 238, l.problemA, "body", 'text-anchor="middle"')}
    ${text(850, 260, l.problemB, "body", 'text-anchor="middle"')}
  </g>
  <path d="M 500 278 L 500 346" class="call"/><path d="M 1200 278 L 1200 346" class="state"/>
  ${text(500, 325, l.blocking, "labelText", 'text-anchor="middle"')}${text(1200, 325, l.coroutine, "labelText", 'text-anchor="middle"')}
  <g>
    <rect x="110" y="350" width="650" height="452" rx="8" class="spring"/>
    ${text(435, 397, l.spring, "cardTitle", 'text-anchor="middle"')}
    ${row(150, 430, l.carrier, l.springCarrierA, l.springCarrierB)}
    ${row(150, 516, l.boundaryLabel, l.springBoundaryA, l.springBoundaryB, true)}
    ${row(150, 602, l.target, l.springTargetA, l.springTargetB)}
    ${row(150, 688, l.watch, l.springWatchA, l.springWatchB, true)}
  </g>
  <g>
    <rect x="940" y="350" width="650" height="452" rx="8" class="ktor"/>
    ${text(1265, 397, l.ktor, "cardTitle", 'text-anchor="middle"')}
    ${row(980, 430, l.carrier, l.ktorCarrierA, l.ktorCarrierB)}
    ${row(980, 516, l.boundaryLabel, l.ktorBoundaryA, l.ktorBoundaryB, true)}
    ${row(980, 602, l.target, l.ktorTargetA, l.ktorTargetB)}
    ${row(980, 688, l.watch, l.ktorWatchA, l.ktorWatchB, true)}
  </g>
  <path d="M 760 578 L 940 578" class="edge"/>
  <g>
    <rect x="250" y="840" width="1200" height="116" rx="8" class="shared"/>
    ${text(292, 880, l.invariant, "cardTitle")}
    ${text(292, 912, l.invariantA, "body")}
    ${text(292, 936, l.invariantB, "body")}
    <rect x="1060" y="864" width="300" height="30" rx="8" class="chip"/>
    ${text(1080, 885, "korean != english", "mono")}
    <rect x="1060" y="906" width="300" height="30" rx="8" class="chipAlt"/>
    ${text(1080, 927, "acme:rw != acme:ro", "mono")}
  </g>
  </svg>`;
}

const outputs = [
  ["exposed-r2dbc-ktor-tenant-sequence-01-en", sequenceSvg("en")],
  ["exposed-r2dbc-ktor-tenant-sequence-01-ko", sequenceSvg("ko")],
  ["exposed-r2dbc-ktor-routing-strategy-map-01-en", mapSvg("en")],
  ["exposed-r2dbc-ktor-routing-strategy-map-01-ko", mapSvg("ko")],
];

for (const [stem, svg] of outputs) {
  const svgPath = path.join(outDir, `${stem}.svg`);
  const pngPath = path.join(outDir, `${stem}.png`);
  fs.writeFileSync(svgPath, `${svg}\n`);
  execFileSync("xmllint", ["--noout", svgPath], { stdio: "inherit" });
  execFileSync("cairosvg", [svgPath, "-o", pngPath, "-s", "2"], { stdio: "inherit" });
  console.log(`generated ${path.relative(process.cwd(), svgPath)} and ${path.relative(process.cwd(), pngPath)}`);
}
