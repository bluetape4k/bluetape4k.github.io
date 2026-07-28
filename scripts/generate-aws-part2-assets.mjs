import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const outDir = "public/assets";
mkdirSync(outDir, { recursive: true });

const awsDiagramDir = "/Users/debop/work/bluetape4k/bluetape4k-aws/docs/images/readme-diagrams";
const coverageBase = "bluetape4k-aws-service-coverage-chart-05";
const coverageTarget = "bluetape4k-aws-service-coverage-01";

for (const ext of ["dot", "plain", "svg", "png"]) {
  copyIfExists(join(awsDiagramDir, `${coverageBase}.${ext}`), join(outDir, `${coverageTarget}.${ext}`));
}
if (process.env.AWS_GENERATE_SKETCHES === "1") {
  for (const ext of ["svg", "png"]) {
    copyIfExists(join(awsDiagramDir, `${coverageBase}-sketch.${ext}`), join(outDir, `${coverageTarget}-sketch.${ext}`));
  }
}
const coverageSvgPath = join(outDir, `${coverageTarget}.svg`);
writeFileSync(
  coverageSvgPath,
  readFileSync(coverageSvgPath, "utf8").replace("Core wrappers cover the broad SDK surface;", "Core wrappers cover broad SDK coverage;"),
);
execFileSync("xmllint", ["--noout", coverageSvgPath]);
renderPng(coverageSvgPath, join(outDir, `${coverageTarget}.png`));

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

  app -> java [label="Java SDK"]
  app -> kotlin [label="Kotlin SDK"]
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
  if (process.env.AWS_GENERATE_SKETCHES === "1") {
    execFileSync("dot", ["-Tsvg", `${base}.dot`, "-o", `${base}-sketch.svg`]);
    renderPng(`${base}-sketch.svg`, `${base}-sketch.png`);
  }
  writeFileSync(`${base}.svg`, asset.svg);
  execFileSync("xmllint", ["--noout", `${base}.svg`]);
  renderPng(`${base}.svg`, `${base}.png`);
}

const localeReplacements = new Map([
  ["bluetape4k-aws-module-map-01", [
    ["bluetape4k-aws overview", "bluetape4k-aws 한눈에 보기"],
    ["Kotlin applications choose Java SDK adapters, native suspend helpers, or framework integrations.", "Kotlin 애플리케이션은 Java SDK 어댑터, 네이티브 suspend 도우미, 프레임워크 통합 중에서 선택합니다."],
    ["Kotlin application surfaces", "Kotlin 애플리케이션 표면"],
    ["plain services, Spring Boot 4, Ktor 3", "일반 서비스, Spring Boot 4, Ktor 3"],
    ["version alignment", "버전 정렬"],
    ["Runtime modules", "런타임 모듈"],
    ["Framework integrations", "프레임워크 통합"],
    ["Spring operations and listeners", "Spring 작업 API와 리스너"],
    ["Ktor SigV4, S3, SQS, DynamoDB", "Ktor SigV4, S3, SQS, DynamoDB"],
    ["Runnable examples", "실행 가능한 예제"],
    ["Ktor and Spring Boot samples", "Ktor와 Spring Boot 샘플"],
    ["LocalStack, Floci, PostgreSQL", "LocalStack, Floci, PostgreSQL"],
    ["Local verification", "로컬 검증"],
    ["emulators + Testcontainers", "에뮬레이터 + Testcontainers"],
    ["AWS service surface", "AWS 서비스 표면"],
    ["Repository role", "저장소 역할"],
    ["One AWS integration stack with local emulator verification and published BOM alignment.", "로컬 에뮬레이터 검증과 공개 BOM 정렬을 함께 제공하는 AWS 통합 스택입니다."],
  ]],
  ["bluetape4k-aws-request-flow-01", [
    ["AWS request flow through bluetape4k wrappers", "bluetape4k wrapper를 지나는 AWS 요청 흐름"],
    ["Kotlin service requests move through framework adapters, bluetape4k AWS wrappers, AWS SDK clients, and then either local emulators or AWS services.", "Kotlin 서비스 요청은 프레임워크 어댑터, bluetape4k AWS 래퍼, AWS SDK 클라이언트를 지나 로컬 에뮬레이터나 AWS 서비스로 이동합니다."],
    ["AWS request flow", "AWS 요청 흐름"],
    ["Service code keeps a Kotlin-first surface while the runtime chooses a local emulator or real AWS.", "서비스 코드는 Kotlin 우선 인터페이스를 유지하고 실행 환경은 로컬 에뮬레이터 또는 실제 AWS를 선택합니다."],
    ["Kotlin service", "Kotlin 서비스"],
    ["plain service", "일반 서비스"],
    ["Spring Boot 4 / Ktor 3", "Spring Boot 4 / Ktor 3"],
    ["Framework adapter", "프레임워크 어댑터"],
    ["configuration", "설정"],
    ["clients and listeners", "클라이언트와 리스너"],
    ["bluetape4k AWS", "bluetape4k AWS"],
    ["suspend helpers", "suspend 도우미"],
    ["coroutine bridge", "코루틴 연결"],
    ["thin SDK wrapper", "얇은 SDK 래퍼"],
    ["AWS SDK", "AWS SDK"],
    ["client", "클라이언트"],
    ["Java SDK v2 async", "Java SDK v2 async"],
    ["or Kotlin SDK", "또는 Kotlin SDK"],
    ["local tests", "로컬 테스트"],
    ["runtime", "실행 환경"],
    ["LocalStack / Floci", "LocalStack / Floci"],
    ["Testcontainers loop", "Testcontainers 검증"],
    ["AWS services", "AWS 서비스"],
    ["S3, SQS, SNS, DynamoDB", "S3, SQS, SNS, DynamoDB"],
    ["KMS, SES, CloudWatch", "KMS, SES, CloudWatch"],
    ["Design goal", "설계 목표"],
    ["framework-neutral core, framework-aware edges,", "프레임워크 중립 핵심과 프레임워크 인지 경계,"],
    ["emulator-backed tests.", "에뮬레이터 기반 테스트."],
  ]],
  ["bluetape4k-aws-service-coverage-01", [
    ["AWS service coverage", "AWS 서비스 지원 범위"],
    ["Selected AWS Service Integration Matrix", "선별된 AWS 서비스 통합 구성표"],
    ["Runtime modules share core AWS services while framework modules expose focused operations.", "실행 모듈은 핵심 AWS 서비스를 공유하고 프레임워크 모듈은 목적별 작업 API를 제공합니다."],
    ["Established cross-module integrations; module-only services are documented in module tables and READMEs.", "검증된 모듈 간 통합만 표시하며 단일 모듈 서비스는 모듈 표와 README에 문서화합니다."],
    ["Module", "모듈"],
    ["Java SDK v2 wrappers", "Java SDK v2 래퍼"],
    ["AWS Kotlin SDK helpers", "AWS Kotlin SDK 도우미"],
    ["database config foundation", "데이터베이스 설정 기반"],
    ["auto-config and operations", "자동 설정과 작업 API"],
    ["client/server plugins", "클라이언트/서버 플러그인"],
    ["Ktor and Spring Boot apps", "Ktor와 Spring Boot 애플리케이션"],
    ["Legend", "범례"],
    ["stable module support", "안정적 모듈 지원"],
    ["optional feature or SDK dependency", "선택 기능 또는 SDK 의존성"],
    ["example coverage only", "예제에서만 검증"],
    ["planned when backed by roadmap evidence", "로드맵 근거가 있을 때 계획"],
    ["not a module concern", "모듈 대상 아님"],
    ["BOM is intentionally excluded from this matrix because it aligns dependency versions rather than implementing AWS service components.", "BOM은 AWS 서비스 구성 요소 구현이 아니라 의존성 버전 정렬을 담당하므로 이 구성표에서 제외합니다."],
    ["Coverage role", "지원 범위 역할"],
    ["Core wrappers cover broad SDK coverage; Spring Boot and Ktor add framework entry points.", "핵심 래퍼는 넓은 SDK 범위를 다루고 Spring Boot와 Ktor는 프레임워크 진입점을 더합니다."],
    [">yes<", ">지원<"],
    [">examples<", ">예제<"],
  ]],
  ["bluetape4k-aws-part2-api-layers-01", [
    ["Two SDK approaches, one service shape", "두 SDK 접근, 하나의 서비스 형태"],
    ["Java SDK v2 keeps broad coverage; Kotlin SDK keeps native suspend calls. bluetape4k smooths the service boundary.", "Java SDK v2는 넓은 범위를, Kotlin SDK는 네이티브 suspend 호출을 담당합니다. bluetape4k는 서비스 경계를 정리합니다."],
    ["Kotlin service", "Kotlin 서비스"],
    ["Spring Boot 4", "Spring Boot 4"],
    ["Ktor 3 / worker", "Ktor 3 / 워커"],
    ["aws-java", "aws-java"],
    ["sync / async clients", "동기 / 비동기 클라이언트"],
    ["suspend adapters", "suspend 어댑터"],
    ["aws-kotlin", "aws-kotlin"],
    ["native suspend API", "네이티브 suspend API"],
    ["DSL and lifecycle helpers", "DSL과 생명주기 도우미"],
    ["Java SDK v2", "Java SDK v2"],
    ["CompletableFuture async", "CompletableFuture async"],
    ["CRT S3 transfer path", "CRT S3 전송 경로"],
    ["Kotlin SDK", "Kotlin SDK"],
    ["suspend operations", "suspend 작업"],
    ["CRT default engine", "CRT 기본 엔진"],
    ["AWS services", "AWS 서비스"],
    ["S3, SQS, DynamoDB", "S3, SQS, DynamoDB"],
    ["Kinesis, KMS, SES", "Kinesis, KMS, SES"],
    ["Selection rule", "선택 기준"],
    ["aws-java for broad Java SDK v2 and S3 transfer; aws-kotlin for native suspend code.", "넓은 Java SDK v2와 S3 전송은 aws-java, 네이티브 suspend 코드는 aws-kotlin을 선택합니다."],
  ]],
  ["bluetape4k-aws-part2-dependency-selection-01", [
    ["Dependency selection stays application-owned", "의존성 선택은 애플리케이션이 담당합니다"],
    ["Core modules compile against many AWS service SDKs; each service app chooses only the runtime artifacts it needs.", "핵심 모듈은 여러 AWS 서비스 SDK에 맞춰 컴파일하고, 각 서비스 애플리케이션은 필요한 실행 아티팩트만 선택합니다."],
    ["align versions", "버전 정렬"],
    ["no service choice", "서비스 선택 없음"],
    ["core wrapper", "핵심 래퍼"],
    ["compileOnly SDKs", "compileOnly SDK"],
    ["helper APIs", "도우미 API"],
    ["broad source coverage", "넓은 소스 범위"],
    ["application", "애플리케이션"],
    ["declares S3, SQS", "S3, SQS 선언"],
    ["or DynamoDB only", "또는 DynamoDB만"],
    ["owns runtime classpath", "실행 클래스패스 소유"],
    ["runtime", "실행 환경"],
    ["smaller graph", "작은 의존성 그래프"],
    ["fewer clients", "적은 클라이언트"],
    ["clear ownership", "명확한 책임"],
    ["compileOnly: wrapper source access", "compileOnly: 래퍼 소스 접근"],
    ["implementation: service choice", "implementation: service 선택"],
    ["BOM: version alignment", "BOM: 버전 정렬"],
    ["Result", "결과"],
    ["Many services are supported; each app carries only the AWS artifacts it uses.", "많은 서비스를 지원하지만 각 애플리케이션은 사용하는 AWS 아티팩트만 포함합니다."],
  ]],
]);

for (const [name, replacements] of localeReplacements) {
  writeLocaleVariants(name, replacements);
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
  <text class="title" x="54" y="70">Two SDK approaches, one service shape</text>
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
  <path class="arrow" d="M848 234 H880 V322 H910"/>
  <path class="arrow" d="M848 422 H880 V362 H910"/>

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
  const replacementMap = new Map(replacements);
  const pattern = [...replacementMap.keys()]
    .sort((left, right) => right.length - left.length)
    .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  if (pattern) {
    result = result.replace(new RegExp(pattern, "g"), (match) => replacementMap.get(match));
  }
  return result;
}

function normalizeDiagramSvg(svg) {
  return ensureConnectorAuditPath(convertConnectorPathsToPolylines(normalizeMarkers(darkenDiagramSvg(svg), 14)));
}

function darkenDiagramSvg(svg) {
  return svg
    .replaceAll("background:#F5F7FA", "background:#08111f")
    .replaceAll("fill:#FFFFFF;stroke:#D9E2EC", "fill:#0e1a2b;stroke:#315270")
    .replaceAll("flood-color=\"#AAB7C6\"", "flood-color=\"#020617\"")
    .replaceAll("#66758A", "#6fb6e8")
    .replaceAll("#D9E2EC", "#315270")
    .replaceAll("#EAF7EF", "#102a24")
    .replaceAll("#E8F3FF", "#11283f")
    .replaceAll("#FFF3D9", "#2a2615")
    .replaceAll("#F4F7FA", "#12243a")
    .replaceAll("#F1ECFF", "#211b36")
    .replaceAll("#E9F7F6", "#10283c")
    .replaceAll("#FFF0E3", "#2b2117")
    .replaceAll("#526274", "#b8c7dc")
    .replaceAll("#243447", "#d8e4f5")
    .replaceAll("#344456", "#c5d2e5")
    .replace(/(<rect\b[^>]*\bwidth="(?:1160|1200)"[^>]*\bheight="(?:680|720|760)"[^>]*\bfill=")#ffffff("[^>]*\/>)/, "$1#0b1220$2")
    .replaceAll(".panel{fill:#fff;", ".panel{fill:#111d2f;")
    .replaceAll(".band{fill:#f8fafc;", ".band{fill:#12243a;")
    .replaceAll(".frame{fill:#fff;", ".frame{fill:#0e1a2b;")
    .replaceAll(".labelPill{fill:#ffffff;", ".labelPill{fill:#12243a;")
    .replaceAll(".activation{fill:#dbeafe;", ".activation{fill:#17345b;")
    .replaceAll('fill="#ffffff"', 'fill="#111d2f"')
    .replaceAll('fill="#fff"', 'fill="#111d2f"')
    .replaceAll('fill="#f8fafc"', 'fill="#12243a"')
    .replaceAll('fill="#f1f5f9"', 'fill="#12243a"')
    .replaceAll('fill="#ecfeff"', 'fill="#10283c"')
    .replaceAll('fill="#ecfdf5"', 'fill="#102a24"')
    .replaceAll('fill="#e0f2fe"', 'fill="#11283f"')
    .replaceAll('fill="#eff6ff"', 'fill="#11283f"')
    .replaceAll('fill="#dcfce7"', 'fill="#102a24"')
    .replaceAll('fill="#fff7ed"', 'fill="#2b2117"')
    .replaceAll('fill="#fef3c7"', 'fill="#2a2615"')
    .replaceAll('fill="#fefce8"', 'fill="#2a2615"')
    .replaceAll('fill="#f3e8ff"', 'fill="#211b36"')
    .replaceAll("fill:#102033", "fill:#e8eefc")
    .replaceAll("fill: #102033", "fill: #e8eefc")
    .replaceAll(".canvas{fill:#f8fafc}", ".canvas{fill:#08111f}")
    .replaceAll(".frame{fill:#ffffff;stroke:#8aa6cf", ".frame{fill:#0e1a2b;stroke:#315270")
    .replaceAll(".title{font-family:\"Architects Daughter\";font-size:48px;fill:#17233a}", ".title{font-family:\"Architects Daughter\";font-size:48px;fill:#e8eefc}")
    .replaceAll(".matrix{fill:#ffffff;stroke:#cbd5e1", ".matrix{fill:#0e1a2b;stroke:#315270")
    .replaceAll(".head{fill:#eff6ff;stroke:#cbd5e1", ".head{fill:#12243a;stroke:#315270")
    .replaceAll(".rowA{fill:#ffffff}", ".rowA{fill:#0e1a2b}")
    .replaceAll(".rowB{fill:#fbfdff}", ".rowB{fill:#111d2f}")
    .replaceAll(".line{stroke:#e2e8f0", ".line{stroke:#20334a")
    .replaceAll(".strongLine{stroke:#cbd5e1", ".strongLine{stroke:#315270")
    .replaceAll("fill:#17233a", "fill:#e8eefc")
    .replaceAll("fill:#64748b", "fill:#9fb0c8")
    .replaceAll(".stable{fill:#dcfce7;stroke:#16a34a", ".stable{fill:#102a24;stroke:#58a978")
    .replaceAll(".optional{fill:#ffedd5;stroke:#f97316", ".optional{fill:#2b2117;stroke:#e79b45")
    .replaceAll(".example{fill:#ede9fe;stroke:#8b5cf6", ".example{fill:#211b36;stroke:#9b83e8")
    .replaceAll(".empty{fill:#fbfdff;stroke:#dbe4ef", ".empty{fill:#12243a;stroke:#315270")
    .replaceAll(".planned{fill:#eef2ff;stroke:#6366f1", ".planned{fill:#11283f;stroke:#6d87ff")
    .replaceAll(".footer{fill:#f8fafc;stroke:#cbd5e1", ".footer{fill:#12243a;stroke:#315270")
    .replaceAll('fill="#17233a"', 'fill="#e8eefc"')
    .replaceAll('fill="#94a3b8"', 'fill="#9fb0c8"')
    .replaceAll("fill:#334155", "fill:#b8c7dc")
    .replaceAll("fill:#475569", "fill:#6fb6e8")
    .replaceAll("stroke:#475569", "stroke:#6fb6e8")
    .replaceAll('stroke="#475569"', 'stroke="#6fb6e8"')
    .replaceAll('fill="#475569"', 'fill="#6fb6e8"')
    .replaceAll("stroke:#64748b", "stroke:#86a2c2")
    .replaceAll('stroke="#64748b"', 'stroke="#86a2c2"')
    .replaceAll('fill="#64748b"', 'fill="#86a2c2"')
    .replaceAll("stroke:#94a3b8", "stroke:#6d87a8")
    .replaceAll('stroke="#94a3b8"', 'stroke="#6d87a8"')
    .replaceAll("stroke:#d7e2ef", "stroke:#315270")
    .replaceAll('stroke="#d7e2ef"', 'stroke="#315270"')
    .replaceAll('stroke="#d8e0ea"', 'stroke="#315270"')
    .replaceAll("fill:#e2e8f0", "fill:#d8e4f5");
}

function normalizeMarkers(svg, markerSize) {
  return svg.replace(
    /<marker\s+id="([^"]*)"[^>]*>[\s\S]*?<path\s+[^>]*fill="([^"]+)"[^>]*\/?>\s*<\/marker>/g,
    `<marker id="$1" viewBox="0 0 10 10" markerWidth="${markerSize}" markerHeight="${markerSize}" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="$2" stroke="$2" stroke-width="0" stroke-dasharray="none"/></marker>`,
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

function copyIfExists(source, target) {
  if (existsSync(source)) {
    copyFileSync(source, target);
  }
}
