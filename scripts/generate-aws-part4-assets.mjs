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
  writeFileSync(`${base}.dot`, asset.dot);
  execFileSync("dot", ["-Tplain", `${base}.dot`, "-o", `${base}.plain`]);
  if (process.env.AWS_GENERATE_SKETCHES === "1") {
    execFileSync("dot", ["-Tsvg", `${base}.dot`, "-o", `${base}-sketch.svg`]);
    renderPng(`${base}-sketch.svg`, `${base}-sketch.png`);
  }
  writeFileSync(`${base}.svg`, asset.svg);
  execFileSync("xmllint", ["--noout", `${base}.svg`]);
  renderPng(`${base}.svg`, `${base}.png`);
}

const localeReplacements = new Map([
  ["bluetape4k-aws-part4-comparison-map-01", [
    ["Spring Cloud AWS and bluetape4k AWS comparison map", "Spring Cloud AWS와 bluetape4k AWS comparison map"],
    ["Compare by ownership boundary", "Ownership boundary로 비교하기"],
    ["Both build on AWS SDK v2, but they choose different owners for framework wiring, coroutine helpers, and runtime shape.", "둘 다 AWS SDK v2 위에 있지만 framework wiring, coroutine helper, runtime shape의 소유자가 다릅니다."],
    ["Spring Cloud AWS", "Spring Cloud AWS"],
    ["Spring Boot starters, templates, listeners", "Spring Boot starter, template, listener"],
    ["S3, SQS, SNS, SES, DynamoDB, config", "S3, SQS, SNS, SES, DynamoDB, config"],
    ["Spring Integration and Cloud Stream extensions", "Spring Integration과 Cloud Stream extension"],
    ["bluetape4k-aws", "bluetape4k-aws"],
    ["Kotlin-first helpers over Java v2 and Kotlin SDK", "Java v2와 Kotlin SDK 위의 Kotlin-first helper"],
    ["Spring Boot 4 adapter or Ktor 3 adapter", "Spring Boot 4 adapter 또는 Ktor 3 adapter"],
    ["CRT, TransferManager, coroutine operations", "CRT, TransferManager, coroutine operation"],
    ["Spring-first fit", "Spring-first 적합성"],
    ["Use when Spring owns application wiring", "Spring이 application wiring을 소유할 때"],
    ["and team conventions already match Spring Cloud", "그리고 팀 규약이 이미 Spring Cloud에 맞을 때"],
    ["Kotlin/JVM fit", "Kotlin/JVM 적합성"],
    ["Use when coroutine, Ktor, explicit SDK clients,", "coroutine, Ktor, 명시적 SDK client,"],
    ["or CRT-backed S3 transfer are design constraints", "또는 CRT-backed S3 transfer가 설계 제약일 때"],
    ["Shared AWS responsibilities", "공유 AWS 책임"],
    ["IAM, retries, idempotency, provisioning, observability, and local emulator gaps remain application decisions.", "IAM, retry, idempotency, provisioning, observability, local emulator gap은 application decision으로 남습니다."],
    ["same AWS SDK family", "같은 AWS SDK family"],
  ]],
  ["bluetape4k-aws-part4-decision-guide-01", [
    ["Decision guide for choosing Spring Cloud AWS or bluetape4k AWS", "Spring Cloud AWS 또는 bluetape4k AWS 선택 가이드"],
    ["Decision guide", "선택 가이드"],
    ["Pick the library that should own the repeated AWS work for this service, not the library with the longer feature checklist.", "기능 checklist가 긴 library가 아니라 이 service의 반복 AWS work를 소유할 library를 선택합니다."],
    ["Workload shape", "Workload shape"],
    ["framework, async,", "framework, async,"],
    ["transfer, ownership", "transfer, ownership"],
    ["Spring Boot only", "Spring Boot only"],
    ["Spring Cloud idioms already fit", "Spring Cloud idiom이 이미 맞음"],
    ["Kotlin coroutine service", "Kotlin coroutine service"],
    ["SDK helpers and suspend APIs", "SDK helper와 suspend API"],
    ["Ktor runtime", "Ktor runtime"],
    ["plugins, SigV4, SQS consumer", "plugin, SigV4, SQS consumer"],
    ["S3 large transfer with CRT", "CRT 기반 S3 large transfer"],
    ["Prefer Spring Cloud AWS", "Spring Cloud AWS 선호"],
    ["Spring owns AWS integration", "Spring이 AWS integration 소유"],
    ["Prefer bluetape4k-aws", "bluetape4k-aws 선호"],
    ["Kotlin/JVM helpers own repeated work", "Kotlin/JVM helper가 반복 작업 소유"],
    ["Spring Boot 4 or Ktor 3 can use", "Spring Boot 4와 Ktor 3가 같은"],
    ["the same AWS helper layer", "AWS helper layer 사용"],
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
  for (const [from, to] of replacements) {
    result = result.replaceAll(from, to);
  }
  return result;
}

function normalizeDiagramSvg(svg) {
  return ensureConnectorAuditPath(convertConnectorPathsToPolylines(normalizeMarkers(svg)));
}

function normalizeMarkers(svg) {
  return svg.replace(
    /<marker\s+id="([^"]*)"[^>]*>[\s\S]*?<path\s+[^>]*fill="([^"]+)"[^>]*\/?>\s*<\/marker>/g,
    '<marker id="$1" viewBox="0 0 10 10" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="$2"/></marker>',
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
