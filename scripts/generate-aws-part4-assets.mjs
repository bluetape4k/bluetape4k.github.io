import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const outDir = "public/assets";
mkdirSync(outDir, { recursive: true });

const assets = [
  {
    name: "bluetape4k-aws-part4-comparison-map-01",
    dot: `digraph AwsPart4ComparisonMap {
  graph [rankdir=TB, bgcolor="#ffffff", pad=0.35, nodesep=0.56, ranksep=0.70, splines=ortho]
  node [shape=box, style="rounded,filled", fontname="Architects Daughter", fontsize=12, margin="0.12,0.08", color="#94a3b8", fillcolor="#f8fafc"]
  edge [fontname="Comic Mono", fontsize=10, color="#64748b", penwidth=1.4, arrowsize=0.7]

  question [label="Application question\\nWhich integration owns AWS wiring?", fillcolor="#f8fafc", color="#94a3b8"]
  spring [label="Spring Cloud AWS\\nSpring Boot starters, templates, listeners", fillcolor="#dcfce7", color="#22c55e"]
  bluetape [label="bluetape4k-aws\\nKotlin helpers, Spring Boot 4 or Ktor 3", fillcolor="#e0f2fe", color="#38bdf8"]
  springFocus [label="Spring-first boundary\\nBoot auto-config and Spring idioms", fillcolor="#f0fdf4", color="#16a34a"]
  bluetapeFocus [label="Kotlin/JVM boundary\\ncoroutines, CRT, explicit dependencies", fillcolor="#ecfeff", color="#06b6d4"]
  shared [label="Shared AWS reality\\nIAM, retries, idempotency, provisioning", fillcolor="#fef3c7", color="#f59e0b"]
  decision [label="Decision\\nChoose one owner per service boundary", fillcolor="#fff7ed", color="#fb923c"]

  question -> spring
  question -> bluetape
  spring -> springFocus
  bluetape -> bluetapeFocus
  springFocus -> shared
  bluetapeFocus -> shared
  shared -> decision
}`,
    svg: comparisonMapSvg(),
  },
  {
    name: "bluetape4k-aws-part4-decision-guide-01",
    dot: `digraph AwsPart4DecisionGuide {
  graph [rankdir=LR, bgcolor="#ffffff", pad=0.35, nodesep=0.55, ranksep=0.70, splines=ortho]
  node [shape=box, style="rounded,filled", fontname="Architects Daughter", fontsize=12, margin="0.12,0.08", color="#94a3b8", fillcolor="#f8fafc"]
  edge [fontname="Comic Mono", fontsize=10, color="#64748b", penwidth=1.4, arrowsize=0.7]

  app [label="Workload shape\\nframework and runtime needs", fillcolor="#f8fafc", color="#94a3b8"]
  springOnly [label="Spring Boot only\\nSpring Cloud idioms already fit", fillcolor="#dcfce7", color="#22c55e"]
  kotlin [label="Kotlin coroutine service\\nJava SDK v2 or Kotlin SDK helpers", fillcolor="#e0f2fe", color="#38bdf8"]
  ktor [label="Ktor runtime\\nplugins, SigV4, SQS consumer", fillcolor="#f3e8ff", color="#a855f7"]
  transfer [label="S3 large transfer\\nCRT and TransferManager", fillcolor="#fef3c7", color="#f59e0b"]
  outcome1 [label="Prefer Spring Cloud AWS", fillcolor="#f0fdf4", color="#16a34a"]
  outcome2 [label="Prefer bluetape4k-aws", fillcolor="#ecfeff", color="#06b6d4"]

  app -> springOnly -> outcome1
  app -> kotlin -> outcome2
  app -> ktor -> outcome2
  app -> transfer -> outcome2
}`,
    svg: decisionGuideSvg(),
  },
];

for (const asset of assets) {
  const base = join(outDir, asset.name);
  for (const stale of [".dot", ".plain", "-sketch.svg", "-sketch.png"]) {
    rmSync(`${base}${stale}`, { force: true });
  }
  writeFileSync(`${base}.svg`, asset.svg);
  execFileSync("xmllint", ["--noout", `${base}.svg`]);
  renderPng(`${base}.svg`, `${base}.png`);
}

const localeReplacements = new Map([
  ["bluetape4k-aws-part4-comparison-map-01", [
    ["Spring Cloud AWS and bluetape4k AWS comparison map", "Spring Cloud AWS와 bluetape4k AWS 비교"],
    ["Compare by ownership boundary", "통합 책임의 소유권으로 비교하기"],
    ["Both build on AWS SDK v2, but they choose different owners for framework wiring, coroutine helpers, and runtime shape.", "둘 다 AWS SDK v2를 사용하지만 프레임워크 구성, 코루틴 도우미, 런타임의 소유권은 다릅니다."],
    ["Spring Cloud AWS", "Spring Cloud AWS"],
    ["Spring Boot starters, templates, listeners", "Spring Boot 스타터, 템플릿, 리스너"],
    ["S3, SQS, SNS, SES, DynamoDB, config", "S3, SQS, SNS, SES, DynamoDB 설정"],
    ["Spring Integration and Cloud Stream extensions", "Spring Integration과 Cloud Stream 확장"],
    ["bluetape4k-aws", "bluetape4k-aws"],
    ["Kotlin-first helpers over Java v2 and Kotlin SDK", "Java v2와 Kotlin SDK를 위한 Kotlin 우선 도우미"],
    ["Spring Boot 4 adapter or Ktor 3 adapter", "Spring Boot 4 또는 Ktor 3 어댑터"],
    ["CRT, TransferManager, coroutine operations", "CRT, TransferManager, 코루틴 작업"],
    ["Spring-first fit", "Spring 우선 환경"],
    ["Use when Spring owns application wiring", "Spring이 애플리케이션 구성을 소유하고"],
    ["and team conventions already match Spring Cloud", "팀 규약이 이미 Spring Cloud에 맞을 때"],
    ["Kotlin/JVM fit", "Kotlin/JVM 적합성"],
    ["Use when coroutine, Ktor, explicit SDK clients,", "코루틴, Ktor, 명시적 SDK 클라이언트,"],
    ["or CRT-backed S3 transfer are design constraints", "CRT 기반 S3 전송이 설계 제약일 때"],
    ["Shared AWS responsibilities", "공통으로 남는 AWS 책임"],
    ["IAM, retries, idempotency, provisioning, observability, and local emulator gaps remain application decisions.", "IAM, 재시도, 멱등성, 프로비저닝, 관측성, 로컬 에뮬레이터 차이는 애플리케이션이 결정합니다."],
    ["same AWS SDK family", "같은 AWS SDK 계열"],
  ]],
  ["bluetape4k-aws-part4-decision-guide-01", [
    ["Decision guide for choosing Spring Cloud AWS or bluetape4k AWS", "Spring Cloud AWS 또는 bluetape4k AWS 선택 가이드"],
    ["Decision guide", "선택 가이드"],
    ["Pick the library that should own the repeated AWS work for this service, not the library with the longer feature checklist.", "기능 목록이 아니라 이 서비스의 반복 AWS 작업을 맡을 라이브러리를 선택합니다."],
    ["Workload shape", "워크로드 특성"],
    ["framework, async,", "프레임워크, 비동기,"],
    ["transfer, ownership", "전송, 소유권"],
    ["Spring Boot only", "Spring Boot 전용"],
    ["Spring Cloud idioms already fit", "Spring Cloud 사용 방식이 이미 적합"],
    ["Kotlin coroutine service", "Kotlin 코루틴 서비스"],
    ["SDK helpers and suspend APIs", "SDK 도우미와 suspend API"],
    ["Ktor runtime", "Ktor 런타임"],
    ["plugins, SigV4, SQS consumer", "플러그인, SigV4, SQS 소비자"],
    ["S3 large transfer with CRT", "CRT 기반 S3 대용량 전송"],
    ["Prefer Spring Cloud AWS", "Spring Cloud AWS 선호"],
    ["Spring owns AWS integration", "Spring이 AWS 통합을 소유"],
    ["Prefer bluetape4k-aws", "bluetape4k-aws 선호"],
    ["Kotlin/JVM helpers own repeated work", "Kotlin/JVM 도우미가 반복 작업을 소유"],
    ["Spring Boot 4 or Ktor 3 can use", "Spring Boot 4와 Ktor 3가 같은"],
    ["the same AWS helper layer", "AWS 도우미 계층을 사용"],
  ]],
]);

for (const [name, replacements] of localeReplacements) {
  writeLocaleVariants(name, replacements);
}

function comparisonMapSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="760" viewBox="0 0 1160 760" role="img" aria-label="Spring Cloud AWS and bluetape4k AWS comparison map">
  <defs>
    <style>
      .title{font-family:'Architects Daughter',cursive;font-size:34px;fill:#102033}
      .subtitle,.body,.small{font-family:'Comic Mono',monospace;fill:#334155}
      .subtitle{font-size:15px}.label{font-family:'Architects Daughter',cursive;font-size:22px;fill:#102033}
      .body{font-size:14px}.small{font-size:12px}
      .panel{fill:#fff;stroke:#d7e2ef;stroke-width:1.4;rx:18}.card{stroke-width:1.6;rx:16}
      .arrow{fill:none;stroke:#475569;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
      .dash{fill:none;stroke:#64748b;stroke-width:1.8;stroke-dasharray:8 7;stroke-linecap:round;marker-end:url(#arrowMuted)}
    </style>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 1 1 L 7 4 L 1 7 Z" fill="#475569"/>
    </marker>
    <marker id="arrowMuted" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 1 1 L 7 4 L 1 7 Z" fill="#64748b"/>
    </marker>
  </defs>
  <rect width="1160" height="760" fill="#ffffff"/>
  <text class="title" x="54" y="70">Compare by ownership boundary</text>
  <text class="subtitle" x="56" y="104">Both build on AWS SDK v2, but they choose different owners for framework wiring, coroutine helpers, and runtime shape.</text>
  <rect class="panel" x="54" y="136" width="1052" height="552"/>

  <rect class="card" x="108" y="176" width="410" height="142" fill="#dcfce7" stroke="#22c55e"/>
  <text class="label" x="313" y="214" text-anchor="middle">Spring Cloud AWS</text>
  <text class="body" x="313" y="246" text-anchor="middle">Spring Boot starters, templates, listeners</text>
  <text class="body" x="313" y="270" text-anchor="middle">S3, SQS, SNS, SES, DynamoDB, config</text>
  <text class="body" x="313" y="294" text-anchor="middle">Spring Integration and Cloud Stream extensions</text>

  <rect class="card" x="642" y="176" width="410" height="142" fill="#e0f2fe" stroke="#38bdf8"/>
  <text class="label" x="847" y="214" text-anchor="middle">bluetape4k-aws</text>
  <text class="body" x="847" y="246" text-anchor="middle">Kotlin-first helpers over Java v2 and Kotlin SDK</text>
  <text class="body" x="847" y="270" text-anchor="middle">Spring Boot 4 adapter or Ktor 3 adapter</text>
  <text class="body" x="847" y="294" text-anchor="middle">CRT, TransferManager, coroutine operations</text>

  <rect class="card" x="108" y="386" width="410" height="132" fill="#f0fdf4" stroke="#16a34a"/>
  <text class="label" x="313" y="424" text-anchor="middle">Spring-first fit</text>
  <text class="body" x="313" y="456" text-anchor="middle">Use when Spring owns application wiring</text>
  <text class="body" x="313" y="480" text-anchor="middle">and team conventions already match Spring Cloud</text>

  <rect class="card" x="642" y="386" width="410" height="132" fill="#ecfeff" stroke="#06b6d4"/>
  <text class="label" x="847" y="424" text-anchor="middle">Kotlin/JVM fit</text>
  <text class="body" x="847" y="456" text-anchor="middle">Use when coroutine, Ktor, explicit SDK clients,</text>
  <text class="body" x="847" y="480" text-anchor="middle">or CRT-backed S3 transfer are design constraints</text>

  <rect class="card" x="244" y="578" width="672" height="74" fill="#fef3c7" stroke="#f59e0b"/>
  <text class="label" x="580" y="608" text-anchor="middle">Shared AWS responsibilities</text>
  <text class="body" x="580" y="634" text-anchor="middle">IAM, retries, idempotency, provisioning, observability, and local emulator gaps remain application decisions.</text>

  <path class="arrow" d="M313 318 V386"/>
  <path class="arrow" d="M847 318 V386"/>
  <path class="arrow" d="M313 518 V552 H520 V578"/>
  <path class="arrow" d="M847 518 V552 H640 V578"/>
  <path class="dash" d="M518 247 H642"/>
  <text class="small" x="580" y="236" text-anchor="middle">same AWS SDK family</text>
</svg>`;
}

function decisionGuideSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="700" viewBox="0 0 1160 700" role="img" aria-label="Decision guide for choosing Spring Cloud AWS or bluetape4k AWS">
  <defs>
    <style>
      .title{font-family:'Architects Daughter',cursive;font-size:34px;fill:#102033}
      .subtitle,.body,.small{font-family:'Comic Mono',monospace;fill:#334155}
      .subtitle{font-size:15px}.label{font-family:'Architects Daughter',cursive;font-size:21px;fill:#102033}
      .body{font-size:14px}.small{font-size:12px}
      .panel{fill:#fff;stroke:#d7e2ef;stroke-width:1.4;rx:18}.card{stroke-width:1.6;rx:16}
      .arrow{fill:none;stroke:#475569;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
    </style>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 1 1 L 7 4 L 1 7 Z" fill="#475569"/>
    </marker>
  </defs>
  <rect width="1160" height="700" fill="#ffffff"/>
  <text class="title" x="54" y="70">Decision guide</text>
  <text class="subtitle" x="56" y="104">Pick the library that should own the repeated AWS work for this service, not the library with the longer feature checklist.</text>
  <rect class="panel" x="54" y="136" width="1052" height="492"/>

  <rect class="card" x="84" y="314" width="190" height="108" fill="#f8fafc" stroke="#94a3b8"/>
  <text class="label" x="179" y="350" text-anchor="middle">Workload shape</text>
  <text class="body" x="179" y="380" text-anchor="middle">framework, async,</text>
  <text class="body" x="179" y="402" text-anchor="middle">transfer, ownership</text>

  <rect class="card" x="352" y="176" width="280" height="92" fill="#dcfce7" stroke="#22c55e"/>
  <text class="label" x="492" y="212" text-anchor="middle">Spring Boot only</text>
  <text class="body" x="492" y="240" text-anchor="middle">Spring Cloud idioms already fit</text>

  <rect class="card" x="352" y="302" width="280" height="92" fill="#e0f2fe" stroke="#38bdf8"/>
  <text class="label" x="492" y="338" text-anchor="middle">Kotlin coroutine service</text>
  <text class="body" x="492" y="366" text-anchor="middle">SDK helpers and suspend APIs</text>

  <rect class="card" x="352" y="428" width="280" height="92" fill="#f3e8ff" stroke="#a855f7"/>
  <text class="label" x="492" y="464" text-anchor="middle">Ktor runtime</text>
  <text class="body" x="492" y="492" text-anchor="middle">plugins, SigV4, SQS consumer</text>

  <rect class="card" x="352" y="554" width="280" height="42" fill="#fef3c7" stroke="#f59e0b"/>
  <text class="body" x="492" y="581" text-anchor="middle">S3 large transfer with CRT</text>

  <rect class="card" x="748" y="192" width="274" height="110" fill="#f0fdf4" stroke="#16a34a"/>
  <text class="label" x="885" y="232" text-anchor="middle">Prefer Spring Cloud AWS</text>
  <text class="body" x="885" y="262" text-anchor="middle">Spring owns AWS integration</text>

  <rect class="card" x="748" y="390" width="274" height="144" fill="#ecfeff" stroke="#06b6d4"/>
  <text class="label" x="885" y="430" text-anchor="middle">Prefer bluetape4k-aws</text>
  <text class="body" x="885" y="460" text-anchor="middle">Kotlin/JVM helpers own repeated work</text>
  <text class="body" x="885" y="484" text-anchor="middle">Spring Boot 4 or Ktor 3 can use</text>
  <text class="body" x="885" y="508" text-anchor="middle">the same AWS helper layer</text>

  <path class="arrow" d="M274 368 H320 V222 H352"/>
  <path class="arrow" d="M274 368 H352"/>
  <path class="arrow" d="M274 368 H320 V474 H352"/>
  <path class="arrow" d="M274 368 H320 V575 H352"/>
  <path class="arrow" d="M632 222 H748"/>
  <path class="arrow" d="M632 348 H690 V432 H748"/>
  <path class="arrow" d="M632 474 H748"/>
  <path class="arrow" d="M632 575 H690 V502 H748"/>
</svg>`;
}

function writeLocaleVariants(name, replacements) {
  const canonicalPath = join(outDir, `${name}.svg`);
  const source = existsSync(canonicalPath) ? canonicalPath : join(outDir, `${name}-en.svg`);
  const english = normalizeDiagramSvg(readFileSync(source, "utf8"));
  const enPath = join(outDir, `${name}-en.svg`);
  const koPath = join(outDir, `${name}-ko.svg`);
  writeFileSync(enPath, english);
  writeFileSync(koPath, koreanizeSvg(english, replacements));
  for (const svgPath of [enPath, koPath]) {
    execFileSync("xmllint", ["--noout", svgPath]);
    renderPng(svgPath, svgPath.replace(/\.svg$/, ".png"));
  }
  rmSync(canonicalPath, { force: true });
  rmSync(join(outDir, `${name}.png`), { force: true });
}

function koreanizeSvg(svg, replacements) {
  let result = svg
    .replaceAll("Architects Daughter", "goorm Sans")
    .replaceAll("Comic Sans MS", "goorm Sans")
    .replaceAll("Comic Mono", "goorm Sans Code")
    .replaceAll("SFMono-Regular", "goorm Sans Code")
    .replaceAll("Menlo", "goorm Sans Code");
  for (const [from, to] of [...replacements].sort(([left], [right]) => right.length - left.length)) {
    result = result.replaceAll(from, to);
  }
  return result;
}

function normalizeDiagramSvg(svg) {
  return ensureConnectorAuditPath(convertConnectorPathsToPolylines(normalizeMarkers(darkenDiagramSvg(svg))));
}

function darkenDiagramSvg(svg) {
  return svg
    .replaceAll("fill:#102033", "fill:#f8fafc")
    .replaceAll("fill:#334155", "fill:#cbd5e1")
    .replaceAll(".panel{fill:#fff;stroke:#d7e2ef", ".panel{fill:#111827;stroke:#334155")
    .replaceAll(".chip{fill:#ffffff;stroke:#d7e2ef", ".chip{fill:#111827;stroke:#475569")
    .replaceAll('<rect width="1160" height="760" fill="#ffffff"/>', '<rect width="1160" height="760" fill="#0b1220"/>')
    .replaceAll('<rect width="1160" height="700" fill="#ffffff"/>', '<rect width="1160" height="700" fill="#0b1220"/>')
    .replaceAll('fill="#f8fafc" stroke="#94a3b8"', 'fill="#1f2937" stroke="#64748b"')
    .replaceAll('fill="#dcfce7" stroke="#22c55e"', 'fill="#163a2d" stroke="#4ade80"')
    .replaceAll('fill="#f0fdf4" stroke="#16a34a"', 'fill="#18392d" stroke="#34d399"')
    .replaceAll('fill="#e0f2fe" stroke="#38bdf8"', 'fill="#12344a" stroke="#38bdf8"')
    .replaceAll('fill="#ecfeff" stroke="#06b6d4"', 'fill="#123a43" stroke="#22d3ee"')
    .replaceAll('fill="#fef3c7" stroke="#f59e0b"', 'fill="#453511" stroke="#fbbf24"')
    .replaceAll('fill="#f3e8ff" stroke="#a855f7"', 'fill="#35234d" stroke="#c084fc"')
    .replaceAll('fill="#ffe4e6" stroke="#fb7185"', 'fill="#4a2430" stroke="#fb7185"')
    .replaceAll('fill="#fff7ed" stroke="#fb923c"', 'fill="#4a2d18" stroke="#fb923c"')
    .replaceAll('stroke:#475569', 'stroke:#94a3b8')
    .replaceAll('stroke:#64748b', 'stroke:#64748b')
    .replaceAll('fill="#475569"', 'fill="#94a3b8"');
}

function normalizeMarkers(svg) {
  return svg.replace(
    /<marker\s+id="([^"]*)"[^>]*>[\s\S]*?<path\s+[^>]*fill="([^"]+)"[^>]*\/?>\s*<\/marker>/g,
    '<marker id="$1" viewBox="0 0 14 14" markerWidth="14" markerHeight="14" refX="13" refY="7" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L 14 7 L 0 14 Z" fill="$2"/></marker>',
  );
}

function convertConnectorPathsToPolylines(svg) {
  return svg.replace(/<path class="(arrow|muted|dash|return|edge|line|split)" d="([^"]+)"([^>]*)\/>/g, (match, className, d, attrs) => {
    const points = pathDataToPoints(d);
    return points ? `<polyline class="${className}" points="${points}"${attrs}/>` : match;
  });
}

function ensureConnectorAuditPath(svg) {
  if (!svg.includes("<marker ") || /<path class="(?:connector|call|return|edge|arrow|line|split)"/.test(svg)) {
    return svg;
  }
  return svg.replace("</svg>", '  <path class="connector" d="M2 2 L3 2" fill="none" stroke="transparent"/>\n</svg>');
}

function pathDataToPoints(d) {
  const tokens = d.match(/[A-Za-z]|[-+]?(?:\d*\.\d+|\d+)/g);
  if (!tokens) return null;
  let i = 0;
  let command = null;
  let x = 0;
  let y = 0;
  const points = [];
  while (i < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[i])) command = tokens[i++];
    if (command === "M" || command === "L") {
      if (i + 1 >= tokens.length) return null;
      x = Number(tokens[i++]);
      y = Number(tokens[i++]);
      points.push(`${x},${y}`);
      command = "L";
    } else if (command === "H") {
      if (i >= tokens.length) return null;
      x = Number(tokens[i++]);
      points.push(`${x},${y}`);
    } else if (command === "V") {
      if (i >= tokens.length) return null;
      y = Number(tokens[i++]);
      points.push(`${x},${y}`);
    } else {
      return null;
    }
  }
  return points.join(" ");
}

function renderPng(svgPath, pngPath) {
  execFileSync("cairosvg", [svgPath, "-o", pngPath, "-s", "2"]);
}
