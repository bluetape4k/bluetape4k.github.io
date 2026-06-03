import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const outDir = "public/assets";
mkdirSync(outDir, { recursive: true });

const awsDiagramDir = "/Users/debop/work/bluetape4k/bluetape4k-aws/docs/assets/readme-diagrams";
const coverageBase = "bluetape4k-aws-service-coverage-chart-05";
const coverageTarget = "bluetape4k-aws-service-coverage-01";

for (const ext of ["dot", "plain", "svg", "png"]) {
  copyFileSync(join(awsDiagramDir, `${coverageBase}.${ext}`), join(outDir, `${coverageTarget}.${ext}`));
}
for (const ext of ["svg", "png"]) {
  copyFileSync(join(awsDiagramDir, `${coverageBase}-sketch.${ext}`), join(outDir, `${coverageTarget}-sketch.${ext}`));
}
const coverageSvgPath = join(outDir, `${coverageTarget}.svg`);
writeFileSync(
  coverageSvgPath,
  readFileSync(coverageSvgPath, "utf8").replace("Core wrappers cover the broad SDK surface;", "Core wrappers cover broad SDK coverage;"),
);
execFileSync("xmllint", ["--noout", coverageSvgPath]);
execFileSync("rsvg-convert", [coverageSvgPath, "-o", join(outDir, `${coverageTarget}.png`)]);

const assets = [
  {
    name: "bluetape4k-aws-part2-api-layers-01",
    dot: `digraph AwsPart2ApiLayers {
  graph [rankdir=LR, bgcolor="#ffffff", pad=0.35, nodesep=0.55, ranksep=0.70, splines=ortho]
  node [shape=box, style="rounded,filled", fontname="Architects Daughter", fontsize=12, margin="0.12,0.08", color="#94a3b8", fillcolor="#f8fafc"]
  edge [fontname="Comic Mono", fontsize=10, color="#64748b", penwidth=1.4, arrowsize=0.7]

  app [label="Kotlin service\\nSpring Boot, Ktor, worker", fillcolor="#ecfeff", color="#06b6d4"]
  java [label="bluetape4k-aws-java\\nsync, async, suspend bridge", fillcolor="#e0f2fe", color="#38bdf8"]
  kotlin [label="bluetape4k-aws-kotlin\\nnative suspend helpers", fillcolor="#dcfce7", color="#22c55e"]
  sdkj [label="AWS Java SDK v2\\nCompletableFuture clients", fillcolor="#fff7ed", color="#fb923c"]
  sdkk [label="AWS Kotlin SDK\\nsuspend clients", fillcolor="#fef3c7", color="#f59e0b"]
  crt [label="CRT and OkHttp choices\\nS3 CRT transfer path", fillcolor="#f3e8ff", color="#a855f7"]
  aws [label="AWS services\\nS3, SQS, DynamoDB, Kinesis", shape=cylinder, fillcolor="#f8fafc", color="#64748b"]

  app -> java [label="Java SDK path"]
  app -> kotlin [label="Kotlin SDK path"]
  java -> sdkj [label="wraps"]
  kotlin -> sdkk [label="uses"]
  sdkj -> crt [label="HTTP clients"]
  sdkk -> crt [label="HTTP engines"]
  crt -> aws [label="requests"]
}`,
    svg: apiLayersSvg(),
  },
  {
    name: "bluetape4k-aws-part2-dependency-selection-01",
    dot: `digraph AwsPart2DependencySelection {
  graph [rankdir=LR, bgcolor="#ffffff", pad=0.35, nodesep=0.55, ranksep=0.70, splines=ortho]
  node [shape=box, style="rounded,filled", fontname="Architects Daughter", fontsize=12, margin="0.12,0.08", color="#94a3b8", fillcolor="#f8fafc"]
  edge [fontname="Comic Mono", fontsize=10, color="#64748b", penwidth=1.4, arrowsize=0.7]

  bom [label="BOM\\nalign bluetape4k-aws versions", fillcolor="#e0f2fe", color="#38bdf8"]
  core [label="core wrapper module\\ncompileOnly service SDKs", fillcolor="#dcfce7", color="#22c55e"]
  app [label="application module\\nchooses actual AWS services", fillcolor="#fef3c7", color="#f59e0b"]
  runtime [label="runtime classpath\\nS3 + SQS + DynamoDB only", fillcolor="#fff7ed", color="#fb923c"]
  lean [label="smaller dependency graph\\nno all-services pull", fillcolor="#f3e8ff", color="#a855f7"]

  bom -> core
  core -> app [label="helpers"]
  app -> runtime [label="implementation"]
  runtime -> lean [label="selective"]
}`,
    svg: dependencySvg(),
  },
];

for (const asset of assets) {
  const base = join(outDir, asset.name);
  writeFileSync(`${base}.dot`, asset.dot);
  execFileSync("dot", ["-Tplain", `${base}.dot`, "-o", `${base}.plain`]);
  execFileSync("dot", ["-Tsvg", `${base}.dot`, "-o", `${base}-sketch.svg`]);
  execFileSync("rsvg-convert", [`${base}-sketch.svg`, "-o", `${base}-sketch.png`]);
  writeFileSync(`${base}.svg`, asset.svg);
  execFileSync("xmllint", ["--noout", `${base}.svg`]);
  execFileSync("rsvg-convert", [`${base}.svg`, "-o", `${base}.png`]);
}

function apiLayersSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="680" viewBox="0 0 1160 680" role="img" aria-label="bluetape4k AWS Part 2 API layers">
  <defs>
    <style>
      .title{font-family:'Architects Daughter',cursive;font-size:34px;fill:#102033}
      .subtitle,.caption,.body{font-family:'Comic Mono',monospace;fill:#334155}
      .subtitle{font-size:15px}.label{font-family:'Architects Daughter',cursive;font-size:22px;fill:#102033}.footerLabel{font-family:'Architects Daughter',cursive;font-size:22px;fill:#ffffff}
      .footerText{font-family:'Comic Mono',monospace;font-size:15px;fill:#e2e8f0}
      .body{font-size:14px}.small{font-size:12px}.arrow{fill:none;stroke:#475569;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
      .thin{fill:none;stroke:#94a3b8;stroke-width:1.4;stroke-dasharray:7 7}.panel{fill:#fff;stroke:#d7e2ef;stroke-width:1.4;rx:18}
    </style>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 1 1 L 7 4 L 1 7 Z" fill="#475569"/>
    </marker>
  </defs>
  <rect width="1160" height="680" fill="#ffffff"/>
  <text class="title" x="54" y="70">Two SDK paths, one service shape</text>
  <text class="subtitle" x="56" y="104">Java SDK v2 keeps broad coverage; Kotlin SDK keeps native suspend calls. bluetape4k smooths the service boundary.</text>

  <rect class="panel" x="54" y="138" width="1052" height="410"/>
  <rect x="85" y="252" width="170" height="118" rx="14" fill="#ecfeff" stroke="#06b6d4" stroke-width="1.6"/>
  <text class="label" x="170" y="292" text-anchor="middle">Kotlin service</text>
  <text class="body" x="170" y="323" text-anchor="middle">Spring Boot 4</text>
  <text class="body" x="170" y="346" text-anchor="middle">Ktor 3 / worker</text>

  <rect x="330" y="170" width="218" height="128" rx="14" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.6"/>
  <text class="label" x="439" y="210" text-anchor="middle">aws-java</text>
  <text class="body" x="439" y="241" text-anchor="middle">sync / async clients</text>
  <text class="body" x="439" y="264" text-anchor="middle">suspend adapters</text>

  <rect x="330" y="358" width="218" height="128" rx="14" fill="#dcfce7" stroke="#22c55e" stroke-width="1.6"/>
  <text class="label" x="439" y="398" text-anchor="middle">aws-kotlin</text>
  <text class="body" x="439" y="429" text-anchor="middle">native suspend API</text>
  <text class="body" x="439" y="452" text-anchor="middle">DSL and lifecycle helpers</text>

  <rect x="630" y="170" width="218" height="128" rx="14" fill="#fff7ed" stroke="#fb923c" stroke-width="1.6"/>
  <text class="label" x="739" y="210" text-anchor="middle">Java SDK v2</text>
  <text class="body" x="739" y="241" text-anchor="middle">CompletableFuture async</text>
  <text class="body" x="739" y="264" text-anchor="middle">CRT S3 transfer path</text>

  <rect x="630" y="358" width="218" height="128" rx="14" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.6"/>
  <text class="label" x="739" y="398" text-anchor="middle">Kotlin SDK</text>
  <text class="body" x="739" y="429" text-anchor="middle">suspend operations</text>
  <text class="body" x="739" y="452" text-anchor="middle">CRT default engine</text>

  <path class="arrow" d="M255 288 H330"/>
  <path class="arrow" d="M255 334 H292 V422 H330"/>
  <path class="arrow" d="M548 234 H630"/>
  <path class="arrow" d="M548 422 H630"/>
  <path class="arrow" d="M848 234 H910 V322"/>
  <path class="arrow" d="M848 422 H910 V362"/>

  <rect x="910" y="278" width="162" height="128" rx="14" fill="#f8fafc" stroke="#64748b" stroke-width="1.6"/>
  <text class="label" x="991" y="318" text-anchor="middle">AWS services</text>
  <text class="body" x="991" y="349" text-anchor="middle">S3, SQS, DynamoDB</text>
  <text class="body" x="991" y="372" text-anchor="middle">Kinesis, KMS, SES</text>

  <rect x="54" y="578" width="1052" height="58" rx="8" fill="#0f253a"/>
  <text class="footerLabel" x="75" y="611">Selection rule</text>
  <text class="footerText" x="230" y="611">aws-java for broad Java SDK v2 and S3 transfer; aws-kotlin for native suspend code.</text>
</svg>`;
}

function dependencySvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="620" viewBox="0 0 1160 620" role="img" aria-label="bluetape4k AWS dependency selection">
  <defs>
    <style>
      .title{font-family:'Architects Daughter',cursive;font-size:34px;fill:#102033}
      .subtitle,.caption,.body{font-family:'Comic Mono',monospace;fill:#334155}
      .subtitle{font-size:15px}.label{font-family:'Architects Daughter',cursive;font-size:22px;fill:#102033}.footerLabel{font-family:'Architects Daughter',cursive;font-size:22px;fill:#ffffff}
      .footerText{font-family:'Comic Mono',monospace;font-size:15px;fill:#e2e8f0}
      .body{font-size:14px}.small{font-size:12px}.arrow{fill:none;stroke:#475569;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
      .panel{fill:#fff;stroke:#d7e2ef;stroke-width:1.4;rx:18}.chip{font-family:'Comic Mono',monospace;font-size:12px;fill:#334155}
    </style>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 1 1 L 7 4 L 1 7 Z" fill="#475569"/>
    </marker>
  </defs>
  <rect width="1160" height="620" fill="#ffffff"/>
  <text class="title" x="54" y="70">Dependency selection stays application-owned</text>
  <text class="subtitle" x="56" y="104">Core modules compile against many AWS service SDKs; each service app chooses only the runtime artifacts it needs.</text>

  <rect class="panel" x="54" y="138" width="1052" height="342"/>
  <rect x="92" y="226" width="176" height="110" rx="14" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.6"/>
  <text class="label" x="180" y="264" text-anchor="middle">BOM</text>
  <text class="body" x="180" y="294" text-anchor="middle">align versions</text>
  <text class="body" x="180" y="317" text-anchor="middle">no service choice</text>

  <rect x="330" y="202" width="220" height="158" rx="14" fill="#dcfce7" stroke="#22c55e" stroke-width="1.6"/>
  <text class="label" x="440" y="240" text-anchor="middle">core wrapper</text>
  <text class="body" x="440" y="271" text-anchor="middle">compileOnly SDKs</text>
  <text class="body" x="440" y="294" text-anchor="middle">helper APIs</text>
  <text class="body" x="440" y="317" text-anchor="middle">broad source coverage</text>

  <rect x="612" y="202" width="220" height="158" rx="14" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.6"/>
  <text class="label" x="722" y="240" text-anchor="middle">application</text>
  <text class="body" x="722" y="271" text-anchor="middle">declares S3, SQS</text>
  <text class="body" x="722" y="294" text-anchor="middle">or DynamoDB only</text>
  <text class="body" x="722" y="317" text-anchor="middle">owns runtime classpath</text>

  <rect x="894" y="202" width="176" height="158" rx="14" fill="#fff7ed" stroke="#fb923c" stroke-width="1.6"/>
  <text class="label" x="982" y="240" text-anchor="middle">runtime</text>
  <text class="body" x="982" y="271" text-anchor="middle">smaller graph</text>
  <text class="body" x="982" y="294" text-anchor="middle">fewer clients</text>
  <text class="body" x="982" y="317" text-anchor="middle">clear ownership</text>

  <path class="arrow" d="M268 281 H330"/>
  <path class="arrow" d="M550 281 H612"/>
  <path class="arrow" d="M832 281 H894"/>

  <rect x="90" y="396" width="250" height="42" rx="21" fill="#f8fafc" stroke="#94a3b8"/>
  <text class="chip" x="215" y="422" text-anchor="middle">compileOnly: wrapper source access</text>
  <rect x="374" y="396" width="258" height="42" rx="21" fill="#f8fafc" stroke="#94a3b8"/>
  <text class="chip" x="503" y="422" text-anchor="middle">implementation: service choice</text>
  <rect x="666" y="396" width="220" height="42" rx="21" fill="#f8fafc" stroke="#94a3b8"/>
  <text class="chip" x="776" y="422" text-anchor="middle">BOM: version alignment</text>

  <rect x="54" y="510" width="1052" height="58" rx="8" fill="#0f253a"/>
  <text class="footerLabel" x="75" y="543">Result</text>
  <text class="footerText" x="160" y="543">Many services are supported; each app carries only the AWS artifacts it uses.</text>
</svg>`;
}
