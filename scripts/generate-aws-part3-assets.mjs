import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const outDir = "public/assets";
mkdirSync(outDir, { recursive: true });

const assets = [
  {
    name: "bluetape4k-aws-part3-framework-flow-01",
    dot: `digraph AwsPart3FrameworkFlow {
  graph [rankdir=TB, bgcolor="#ffffff", pad=0.35, nodesep=0.52, ranksep=0.66, splines=ortho]
  node [shape=box, style="rounded,filled", fontname="Architects Daughter", fontsize=12, margin="0.12,0.08", color="#94a3b8", fillcolor="#f8fafc"]
  edge [fontname="Comic Mono", fontsize=10, color="#64748b", penwidth=1.4, arrowsize=0.7]

  app [label="Application code\\ncontrollers, routes, workers", fillcolor="#ecfeff", color="#06b6d4"]
  spring [label="Spring Boot 4 adapter\\nauto-config, templates, listeners", fillcolor="#e0f2fe", color="#38bdf8"]
  ktor [label="Ktor 3 adapter\\nplugins, lifecycle, SigV4", fillcolor="#dcfce7", color="#22c55e"]
  core [label="Shared AWS contracts\\naws-java, aws-kotlin, aws-exposed", fillcolor="#fef3c7", color="#f59e0b"]
  sdk [label="AWS SDK clients\\nJava v2 and Kotlin SDK", fillcolor="#fff7ed", color="#fb923c"]
  local [label="Local verification\\nFloci, LocalStack, Testcontainers", fillcolor="#f3e8ff", color="#a855f7"]
  aws [label="AWS services\\nS3, SQS, DynamoDB, config", shape=cylinder, fillcolor="#f8fafc", color="#64748b"]

  app -> spring
  app -> ktor
  spring -> core
  ktor -> core
  core -> sdk
  sdk -> local
  sdk -> aws
}`,
    svg: frameworkFlowSvg(),
  },
  {
    name: "bluetape4k-aws-part3-spring-sequence-01",
    dot: `digraph AwsPart3SpringSequence {
  graph [rankdir=LR, bgcolor="#ffffff", pad=0.35, nodesep=0.55, ranksep=0.70, splines=ortho]
  node [shape=box, style="rounded,filled", fontname="Architects Daughter", fontsize=12, margin="0.12,0.08", color="#94a3b8", fillcolor="#f8fafc"]
  edge [fontname="Comic Mono", fontsize=10, color="#64748b", penwidth=1.4, arrowsize=0.7]

  boot [label="Spring Boot startup\\nproperties and classpath", fillcolor="#e0f2fe", color="#38bdf8"]
  autoconfig [label="Auto-configuration\\nclients, templates, listeners", fillcolor="#dcfce7", color="#22c55e"]
  app [label="Application bean\\ncontroller or @SqsListener", fillcolor="#fef3c7", color="#f59e0b"]
  core [label="bluetape4k AWS helper\\nS3Operations, SqsOperations", fillcolor="#fff7ed", color="#fb923c"]
  sdk [label="AWS SDK v2 client\\nasync + coroutine bridge", fillcolor="#f3e8ff", color="#a855f7"]
  aws [label="LocalStack or AWS\\nS3, SQS, DynamoDB", shape=cylinder, fillcolor="#f8fafc", color="#64748b"]

  boot -> autoconfig -> app -> core -> sdk -> aws
}`,
    svg: springSequenceSvg(),
  },
  {
    name: "bluetape4k-aws-part3-ktor-sequence-01",
    dot: `digraph AwsPart3KtorSequence {
  graph [rankdir=LR, bgcolor="#ffffff", pad=0.35, nodesep=0.55, ranksep=0.70, splines=ortho]
  node [shape=box, style="rounded,filled", fontname="Architects Daughter", fontsize=12, margin="0.12,0.08", color="#94a3b8", fillcolor="#f8fafc"]
  edge [fontname="Comic Mono", fontsize=10, color="#64748b", penwidth=1.4, arrowsize=0.7]

  app [label="Ktor application\\ninstall plugins", fillcolor="#dcfce7", color="#22c55e"]
  plugin [label="AWS plugin runtime\\nAwsKtorCore, SqsConsumer", fillcolor="#e0f2fe", color="#38bdf8"]
  route [label="Route or handler\\nS3KtorClient, repository", fillcolor="#fef3c7", color="#f59e0b"]
  core [label="bluetape4k AWS helper\\nSigV4, DynamoDB, Exposed", fillcolor="#fff7ed", color="#fb923c"]
  sdk [label="AWS client\\nSDK or signed HTTP", fillcolor="#f3e8ff", color="#a855f7"]
  aws [label="LocalStack or AWS\\nservices", shape=cylinder, fillcolor="#f8fafc", color="#64748b"]

  app -> plugin -> route -> core -> sdk -> aws
  plugin -> app [label="stop lifecycle"]
}`,
    svg: ktorSequenceSvg(),
  },
  {
    name: "bluetape4k-aws-part3-example-matrix-01",
    dot: `digraph AwsPart3ExampleMatrix {
  graph [rankdir=LR, bgcolor="#ffffff", pad=0.35, nodesep=0.55, ranksep=0.70, splines=ortho]
  node [shape=box, style="rounded,filled", fontname="Architects Daughter", fontsize=12, margin="0.12,0.08", color="#94a3b8", fillcolor="#f8fafc"]
  edge [fontname="Comic Mono", fontsize=10, color="#64748b", penwidth=1.4, arrowsize=0.7]

  spring [label="Spring Boot examples\\nS3, SQS/SNS, DynamoDB, Exposed", fillcolor="#e0f2fe", color="#38bdf8"]
  ktor [label="Ktor examples\\nS3, SQS, DynamoDB, Exposed", fillcolor="#dcfce7", color="#22c55e"]
  s3 [label="S3\\nobjects, presigned URLs, config", fillcolor="#fef3c7", color="#f59e0b"]
  sqs [label="SQS\\nlistener, consumer, ack/nack", fillcolor="#fff7ed", color="#fb923c"]
  dynamo [label="DynamoDB\\nrepository and table setup", fillcolor="#f3e8ff", color="#a855f7"]
  exposed [label="Exposed\\nregistry, transaction helper", fillcolor="#ecfeff", color="#06b6d4"]
  emulator [label="Local emulator tests\\nFloci and LocalStack", fillcolor="#f8fafc", color="#64748b"]

  spring -> s3
  spring -> sqs
  spring -> dynamo
  spring -> exposed
  ktor -> s3
  ktor -> sqs
  ktor -> dynamo
  ktor -> exposed
  s3 -> emulator
  sqs -> emulator
  dynamo -> emulator
  exposed -> emulator
}`,
    svg: exampleMatrixSvg(),
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
  ["bluetape4k-aws-part3-framework-flow-01", [
    ["Framework adapters over shared AWS contracts", "공유 AWS 계약 위의 프레임워크 어댑터"],
    ["Spring Boot owns auto-configuration; Ktor owns plugins and lifecycle. Both meet the same core AWS helpers below.", "Spring Boot는 자동 설정을, Ktor는 플러그인과 생명주기를 담당합니다. 둘 다 같은 핵심 AWS 도우미로 이어집니다."],
    ["Application code", "애플리케이션 코드"],
    ["controllers, routes, scheduled jobs, queue handlers", "컨트롤러, 라우트, 예약 작업, 큐 처리기"],
    ["Spring Boot 4 adapter", "Spring Boot 4 어댑터"],
    ["auto-configured clients and templates", "자동 설정된 클라이언트와 템플릿"],
    ["@SqsListener, Environment sources", "@SqsListener, 환경 설정 소스"],
    ["S3, SNS, SES, DynamoDB, KMS, Exposed", "S3, SNS, SES, DynamoDB, KMS, Exposed"],
    ["Ktor 3 adapter", "Ktor 3 어댑터"],
    ["application plugins and lifecycle runtimes", "애플리케이션 플러그인과 생명주기 실행 환경"],
    ["SigV4 client, SQS consumer, DynamoDB plugin", "SigV4 클라이언트, SQS 소비자, DynamoDB 플러그인"],
    ["S3 REST client, AwsExposedPlugin", "S3 REST 클라이언트, AwsExposedPlugin"],
    ["Shared AWS contracts", "공유 AWS 계약"],
    ["aws-java, aws-kotlin, aws-exposed, BOM, explicit runtime dependencies", "aws-java, aws-kotlin, aws-exposed, BOM, 명시적 실행 의존성"],
    ["AWS SDK clients", "AWS SDK 클라이언트"],
    ["Floci / LocalStack tests", "Floci / LocalStack 테스트"],
    ["AWS services", "AWS 서비스"],
  ]],
  ["bluetape4k-aws-part3-spring-sequence-01", [
    ["Spring Boot 4 AWS integration sequence", "Spring Boot 4 AWS 통합 동작 순서"],
    ["Spring Boot 4 sequence", "Spring Boot 4 동작 순서"],
    ["Auto-configuration creates framework beans first; application code then calls small coroutine-friendly operations.", "자동 설정이 먼저 프레임워크 빈을 만들고, 애플리케이션 코드는 작은 코루틴 친화 작업을 호출합니다."],
    ["Boot startup", "Boot 시작"],
    ["properties", "속성"],
    ["Auto-config", "자동 설정"],
    ["clients, beans", "클라이언트, 빈"],
    ["App bean", "애플리케이션 빈"],
    ["controller/listener", "컨트롤러/리스너"],
    ["AWS helper", "AWS 도우미"],
    ["Operations", "작업 API"],
    ["AWS runtime", "AWS 실행 환경"],
    ["SDK + service", "SDK + 서비스"],
    ["bind bluetape4k.aws.* properties", "bluetape4k.aws.* 속성 바인딩"],
    ["create S3/SQS/DynamoDB/KMS beans", "S3/SQS/DynamoDB/KMS 빈 생성"],
    ["call S3Operations or @SqsListener", "S3Operations 또는 @SqsListener 호출"],
    ["delegate to AWS SDK v2 client", "AWS SDK v2 클라이언트로 위임"],
    ["suspend result, Flow, ack/nack outcome", "suspend 결과, Flow, ack/nack 처리 결과"],
    ["Spring owns bean creation and listener containers; application code keeps controller and handler logic small.", "Spring은 빈 생성과 리스너 컨테이너를 담당하고, 애플리케이션 코드는 컨트롤러와 처리 로직을 작게 유지합니다."],
  ]],
  ["bluetape4k-aws-part3-ktor-sequence-01", [
    ["Ktor 3 AWS integration sequence", "Ktor 3 AWS 통합 동작 순서"],
    ["Ktor 3 sequence", "Ktor 3 동작 순서"],
    ["Plugins install explicit runtimes; route code calls helpers while lifecycle events start and stop owned clients.", "플러그인이 명시적 실행 환경을 설치하고, 라우트 코드는 도우미를 호출하며 생명주기 이벤트가 소유한 클라이언트를 시작하고 종료합니다."],
    ["Application", "애플리케이션"],
    ["install plugins", "플러그인 설치"],
    ["Plugin runtime", "플러그인 실행 환경"],
    ["lifecycle", "생명주기"],
    ["Route handler", "라우트 처리기"],
    ["call helpers", "도우미 호출"],
    ["AWS helper", "AWS 도우미"],
    ["SigV4/SQS/DDB", "SigV4/SQS/DDB"],
    ["AWS runtime", "AWS 실행 환경"],
    ["client/service", "클라이언트/서비스"],
    ["install AwsKtorCore and service plugins", "AwsKtorCore와 서비스 플러그인 설치"],
    ["ApplicationStarted opens plugin-owned clients", "ApplicationStarted가 플러그인 소유 클라이언트를 시작"],
    ["route calls S3KtorClient or repository", "라우트가 S3KtorClient 또는 저장소 호출"],
    ["sign request, poll SQS, or call SDK", "요청 서명, SQS 폴링 또는 SDK 호출"],
    ["ApplicationStopping drains and closes owned runtime", "ApplicationStopping이 소유한 실행 환경을 비우고 종료"],
    ["Ktor keeps startup, shutdown, route helpers, and application-owned clients explicit.", "Ktor는 시작, 종료, 라우트 도우미, 애플리케이션 소유 클라이언트를 명시적으로 유지합니다."],
  ]],
  ["bluetape4k-aws-part3-example-matrix-01", [
    ["bluetape4k AWS Part 3 runnable example matrix", "bluetape4k AWS Part 3 실행 예제 구성표"],
    ["Runnable examples by framework and service", "프레임워크와 서비스별 실행 예제"],
    ["Part 3 maps the examples; Part 5 can walk through full adoption flows in detail.", "Part 3은 예제 지도를 제공하고 Part 5는 전체 도입 흐름을 자세히 설명합니다."],
    ["Framework", "프레임워크"],
    ["Spring Boot", "Spring Boot"],
    ["adapter examples", "어댑터 예제"],
    ["S3Operations", "S3Operations"],
    ["presigned URL", "사전 서명 URL"],
    ["encrypted object", "암호화 객체"],
    ["SqsOperations", "SqsOperations"],
    ["@SqsListener", "@SqsListener"],
    ["SNS fanout", "SNS 팬아웃"],
    ["Repository base", "저장소 기반"],
    ["Enhanced Async", "Enhanced Async"],
    ["table prefix", "테이블 접두사"],
    ["Auto registry", "자동 등록"],
    ["DataSource alias", "DataSource 별칭"],
    ["remote secrets", "원격 비밀값"],
    ["S3KtorClient", "S3KtorClient"],
    ["stream/config", "스트림/설정"],
    ["SqsConsumer", "SqsConsumer"],
    ["ack/nack", "ack/nack"],
    ["lifecycle hooks", "생명주기 훅"],
    ["DynamoDbPlugin", "DynamoDbPlugin"],
    ["auto-create", "자동 생성"],
    ["AwsExposed", "AwsExposed"],
    ["transaction", "트랜잭션"],
    ["repository", "저장소"],
    ["resolver hook", "리졸버 훅"],
    ["All examples are wired for local emulator testing with Floci, LocalStack, or Testcontainers depending on the module.", "모든 예제는 모듈에 따라 Floci, LocalStack, Testcontainers 기반 로컬 에뮬레이터 테스트에 연결됩니다."],
  ]],
]);

for (const [name, replacements] of localeReplacements) {
  writeLocaleVariants(name, replacements);
}

function frameworkFlowSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="720" viewBox="0 0 1160 720" role="img" aria-label="bluetape4k AWS Part 3 framework integration flow">
  <defs>
    <style>
      .title{font-family:'Architects Daughter',cursive;font-size:34px;fill:#102033}
      .subtitle,.body{font-family:'Comic Mono',monospace;fill:#334155}
      .subtitle{font-size:15px}.label{font-family:'Architects Daughter',cursive;font-size:22px;fill:#102033}
      .footerLabel{font-family:'Architects Daughter',cursive;font-size:22px;fill:#ffffff}.footerText{font-family:'Comic Mono',monospace;font-size:15px;fill:#e2e8f0}
      .body{font-size:14px}.small{font-family:'Comic Mono',monospace;font-size:12px;fill:#334155}
      .arrow{fill:none;stroke:#475569;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
      .panel{fill:#fff;stroke:#d7e2ef;stroke-width:1.4;rx:18}.band{fill:#f8fafc;stroke:#d7e2ef;stroke-width:1.2;rx:14}
    </style>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 1 1 L 7 4 L 1 7 Z" fill="#475569"/>
    </marker>
  </defs>
  <rect width="1160" height="720" fill="#ffffff"/>
  <text class="title" x="54" y="70">Framework adapters over shared AWS contracts</text>
  <text class="subtitle" x="56" y="104">Spring Boot owns auto-configuration; Ktor owns plugins and lifecycle. Both meet the same core AWS helpers below.</text>

  <rect class="panel" x="54" y="136" width="1052" height="464"/>
  <rect class="band" x="90" y="176" width="980" height="84"/>
  <text class="label" x="580" y="210" text-anchor="middle">Application code</text>
  <text class="body" x="580" y="237" text-anchor="middle">controllers, routes, scheduled jobs, queue handlers</text>

  <rect x="112" y="318" width="420" height="132" rx="14" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.6"/>
  <text class="label" x="322" y="356" text-anchor="middle">Spring Boot 4 adapter</text>
  <text class="body" x="322" y="386" text-anchor="middle">auto-configured clients and templates</text>
  <text class="body" x="322" y="409" text-anchor="middle">@SqsListener, Environment sources</text>
  <text class="body" x="322" y="432" text-anchor="middle">S3, SNS, SES, DynamoDB, KMS, Exposed</text>

  <rect x="628" y="318" width="420" height="132" rx="14" fill="#dcfce7" stroke="#22c55e" stroke-width="1.6"/>
  <text class="label" x="838" y="356" text-anchor="middle">Ktor 3 adapter</text>
  <text class="body" x="838" y="386" text-anchor="middle">application plugins and lifecycle runtimes</text>
  <text class="body" x="838" y="409" text-anchor="middle">SigV4 client, SQS consumer, DynamoDB plugin</text>
  <text class="body" x="838" y="432" text-anchor="middle">S3 REST client, AwsExposedPlugin</text>

  <rect x="250" y="500" width="660" height="70" rx="14" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.6"/>
  <text class="label" x="580" y="528" text-anchor="middle">Shared AWS contracts</text>
  <text class="body" x="580" y="554" text-anchor="middle">aws-java, aws-kotlin, aws-exposed, BOM, explicit runtime dependencies</text>

  <path class="arrow" d="M420 260 V318"/>
  <path class="arrow" d="M740 260 V318"/>
  <path class="arrow" d="M322 450 V475 H510 V500"/>
  <path class="arrow" d="M838 450 V475 H650 V500"/>

  <rect x="96" y="632" width="210" height="46" rx="23" fill="#f8fafc" stroke="#94a3b8"/>
  <text class="small" x="201" y="660" text-anchor="middle">AWS SDK clients</text>
  <rect x="380" y="632" width="230" height="46" rx="23" fill="#f8fafc" stroke="#94a3b8"/>
  <text class="small" x="495" y="660" text-anchor="middle">Floci / LocalStack tests</text>
  <rect x="684" y="632" width="210" height="46" rx="23" fill="#f8fafc" stroke="#94a3b8"/>
  <text class="small" x="789" y="660" text-anchor="middle">AWS services</text>
  <path class="arrow" d="M320 570 V606 H201 V632"/>
  <path class="arrow" d="M495 570 V632"/>
  <path class="arrow" d="M790 570 V632"/>
</svg>`;
}

function springSequenceSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="740" viewBox="0 0 1160 740" role="img" aria-label="Spring Boot 4 AWS integration sequence">
  <defs>
    <style>
      .title{font-family:'Architects Daughter',cursive;font-size:34px;fill:#102033}
      .subtitle,.body,.small{font-family:'Comic Mono',monospace;fill:#334155}
      .subtitle{font-size:15px}.participant{font-family:'Architects Daughter',cursive;font-size:19px;fill:#102033}
      .body{font-size:13px}.small{font-size:12px}.label,.detail,.num{font-family:'Comic Mono',monospace;font-size:12px;fill:#334155}
      .num{font-weight:700}.frame{fill:#fff;stroke:#d7e2ef;stroke-width:1.4;rx:18}.header{stroke-width:1.5;rx:10}
      .lifeline{stroke:#94a3b8;stroke-width:1.4;stroke-dasharray:7 7}.call{fill:none;stroke:#475569;stroke-width:2;marker-end:url(#arrow)}
      .return{fill:none;stroke:#64748b;stroke-width:1.6;stroke-dasharray:7 6;marker-end:url(#arrowMuted)}
      .labelPill{fill:#ffffff;stroke:#d7e2ef;stroke-width:1.1;rx:8}.activation{fill:#dbeafe;stroke:#60a5fa;stroke-width:1.1;rx:5}
    </style>
    <marker id="arrow" viewBox="0 0 10 10" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M 0 0 L 10 5 L 0 10 Z" fill="#475569"/>
    </marker>
    <marker id="arrowMuted" viewBox="0 0 10 10" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M 0 0 L 10 5 L 0 10 Z" fill="#64748b"/>
    </marker>
  </defs>
  <rect width="1160" height="740" fill="#ffffff"/>
  <text class="title" x="54" y="70">Spring Boot 4 sequence</text>
  <text class="subtitle" x="56" y="104">Auto-configuration creates framework beans first; application code then calls small coroutine-friendly operations.</text>
  <rect class="frame" x="54" y="136" width="1052" height="548"/>

  <rect class="header" x="86" y="170" width="150" height="64" fill="#ecfeff" stroke="#06b6d4"/>
  <text class="participant" x="161" y="198" text-anchor="middle">Boot startup</text>
  <text class="small" x="161" y="218" text-anchor="middle">properties</text>
  <rect class="header" x="292" y="170" width="150" height="64" fill="#e0f2fe" stroke="#38bdf8"/>
  <text class="participant" x="367" y="198" text-anchor="middle">Auto-config</text>
  <text class="small" x="367" y="218" text-anchor="middle">clients, beans</text>
  <rect class="header" x="498" y="170" width="150" height="64" fill="#fef3c7" stroke="#f59e0b"/>
  <text class="participant" x="573" y="198" text-anchor="middle">App bean</text>
  <text class="small" x="573" y="218" text-anchor="middle">controller/listener</text>
  <rect class="header" x="704" y="170" width="150" height="64" fill="#fff7ed" stroke="#fb923c"/>
  <text class="participant" x="779" y="198" text-anchor="middle">AWS helper</text>
  <text class="small" x="779" y="218" text-anchor="middle">Operations</text>
  <rect class="header" x="910" y="170" width="150" height="64" fill="#f3e8ff" stroke="#a855f7"/>
  <text class="participant" x="985" y="198" text-anchor="middle">AWS runtime</text>
  <text class="small" x="985" y="218" text-anchor="middle">SDK + service</text>

  <path class="lifeline" d="M161 234 V638"/><path class="lifeline" d="M367 234 V638"/><path class="lifeline" d="M573 234 V638"/><path class="lifeline" d="M779 234 V638"/><path class="lifeline" d="M985 234 V638"/>
  <rect class="activation" x="359" y="266" width="16" height="110"/>
  <rect class="activation" x="771" y="338" width="16" height="182"/>
  <rect class="activation" x="977" y="482" width="16" height="96"/>

${seqCall(161, 367, 278, "1. bind bluetape4k.aws.* properties")}
${seqCall(367, 779, 350, "2. create S3/SQS/DynamoDB/KMS beans")}
${seqCall(573, 779, 422, "3. call S3Operations or @SqsListener")}
${seqCall(779, 985, 494, "4. delegate to AWS SDK v2 client")}
${seqReturn(985, 573, 566, "5. suspend result, Flow, ack/nack outcome")}

  <rect x="86" y="646" width="974" height="36" rx="18" fill="#f8fafc" stroke="#94a3b8"/>
  <text class="small" x="573" y="669" text-anchor="middle">Spring owns bean creation and listener containers; application code keeps controller and handler logic small.</text>
</svg>`;
}

function ktorSequenceSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="740" viewBox="0 0 1160 740" role="img" aria-label="Ktor 3 AWS integration sequence">
  <defs>
    <style>
      .title{font-family:'Architects Daughter',cursive;font-size:34px;fill:#102033}
      .subtitle,.body,.small{font-family:'Comic Mono',monospace;fill:#334155}
      .subtitle{font-size:15px}.participant{font-family:'Architects Daughter',cursive;font-size:19px;fill:#102033}
      .body{font-size:13px}.small{font-size:12px}.label,.detail,.num{font-family:'Comic Mono',monospace;font-size:12px;fill:#334155}
      .num{font-weight:700}.frame{fill:#fff;stroke:#d7e2ef;stroke-width:1.4;rx:18}.header{stroke-width:1.5;rx:10}
      .lifeline{stroke:#94a3b8;stroke-width:1.4;stroke-dasharray:7 7}.call{fill:none;stroke:#475569;stroke-width:2;marker-end:url(#arrow)}
      .return{fill:none;stroke:#64748b;stroke-width:1.6;stroke-dasharray:7 6;marker-end:url(#arrowMuted)}
      .labelPill{fill:#ffffff;stroke:#d7e2ef;stroke-width:1.1;rx:8}.activation{fill:#dbeafe;stroke:#60a5fa;stroke-width:1.1;rx:5}
    </style>
    <marker id="arrow" viewBox="0 0 10 10" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M 0 0 L 10 5 L 0 10 Z" fill="#475569"/>
    </marker>
    <marker id="arrowMuted" viewBox="0 0 10 10" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M 0 0 L 10 5 L 0 10 Z" fill="#64748b"/>
    </marker>
  </defs>
  <rect width="1160" height="740" fill="#ffffff"/>
  <text class="title" x="54" y="70">Ktor 3 sequence</text>
  <text class="subtitle" x="56" y="104">Plugins install explicit runtimes; route code calls helpers while lifecycle events start and stop owned clients.</text>
  <rect class="frame" x="54" y="136" width="1052" height="548"/>

  <rect class="header" x="86" y="170" width="150" height="64" fill="#dcfce7" stroke="#22c55e"/>
  <text class="participant" x="161" y="198" text-anchor="middle">Application</text>
  <text class="small" x="161" y="218" text-anchor="middle">install plugins</text>
  <rect class="header" x="292" y="170" width="150" height="64" fill="#e0f2fe" stroke="#38bdf8"/>
  <text class="participant" x="367" y="198" text-anchor="middle">Plugin runtime</text>
  <text class="small" x="367" y="218" text-anchor="middle">lifecycle</text>
  <rect class="header" x="498" y="170" width="150" height="64" fill="#fef3c7" stroke="#f59e0b"/>
  <text class="participant" x="573" y="198" text-anchor="middle">Route handler</text>
  <text class="small" x="573" y="218" text-anchor="middle">call helpers</text>
  <rect class="header" x="704" y="170" width="150" height="64" fill="#fff7ed" stroke="#fb923c"/>
  <text class="participant" x="779" y="198" text-anchor="middle">AWS helper</text>
  <text class="small" x="779" y="218" text-anchor="middle">SigV4/SQS/DDB</text>
  <rect class="header" x="910" y="170" width="150" height="64" fill="#f3e8ff" stroke="#a855f7"/>
  <text class="participant" x="985" y="198" text-anchor="middle">AWS runtime</text>
  <text class="small" x="985" y="218" text-anchor="middle">client/service</text>

  <path class="lifeline" d="M161 234 V638"/><path class="lifeline" d="M367 234 V638"/><path class="lifeline" d="M573 234 V638"/><path class="lifeline" d="M779 234 V638"/><path class="lifeline" d="M985 234 V638"/>
  <rect class="activation" x="359" y="266" width="16" height="322"/>
  <rect class="activation" x="565" y="410" width="16" height="84"/>
  <rect class="activation" x="771" y="410" width="16" height="110"/>
  <rect class="activation" x="977" y="338" width="16" height="182"/>

${seqCall(161, 367, 278, "1. install AwsKtorCore and service plugins")}
${seqCall(367, 985, 350, "2. ApplicationStarted opens plugin-owned clients")}
${seqCall(573, 779, 422, "3. route calls S3KtorClient or repository")}
${seqCall(779, 985, 494, "4. sign request, poll SQS, or call SDK")}
${seqReturn(985, 367, 566, "5. ApplicationStopping drains and closes owned runtime")}

  <rect x="86" y="646" width="974" height="36" rx="18" fill="#f8fafc" stroke="#94a3b8"/>
  <text class="small" x="573" y="669" text-anchor="middle">Ktor keeps startup, shutdown, route helpers, and application-owned clients explicit.</text>
</svg>`;
}

function seqCall(fromX, toX, y, label) {
  const match = label.match(/^(\d+)\.\s+(.*)$/);
  const number = match?.[1] ?? "";
  const detail = match?.[2] ?? label;
  const left = Math.min(fromX, toX);
  const width = Math.abs(toX - fromX);
  const estimatedTextWidth = detail.length * 7.2 + 54;
  const labelWidth = Math.max(230, Math.min(Math.max(width + 70, estimatedTextWidth), 520));
  const labelX = left + width / 2 - labelWidth / 2;
  const arrowStart = fromX < toX ? fromX + 12 : fromX - 12;
  const arrowEnd = fromX < toX ? toX - 12 : toX + 12;
  return `
  <rect class="labelPill" x="${labelX}" y="${y - 34}" width="${labelWidth}" height="24"/>
  <text class="num" x="${labelX + 18}" y="${y - 18}" text-anchor="middle">${number}</text>
  <text class="detail" x="${left + width / 2 + 10}" y="${y - 18}" text-anchor="middle">${detail}</text>
  <path class="call" d="M${arrowStart} ${y} H${arrowEnd}"/>`;
}

function seqReturn(fromX, toX, y, label) {
  const match = label.match(/^(\d+)\.\s+(.*)$/);
  const number = match?.[1] ?? "";
  const detail = match?.[2] ?? label;
  const left = Math.min(fromX, toX);
  const width = Math.abs(toX - fromX);
  const labelWidth = Math.max(280, Math.min(width + 70, 520));
  const labelX = left + width / 2 - labelWidth / 2;
  const arrowStart = fromX > toX ? fromX - 12 : fromX + 12;
  const arrowEnd = fromX > toX ? toX + 12 : toX - 12;
  return `
  <rect class="labelPill" x="${labelX}" y="${y - 34}" width="${labelWidth}" height="24"/>
  <text class="num" x="${labelX + 18}" y="${y - 18}" text-anchor="middle">${number}</text>
  <text class="detail" x="${left + width / 2 + 10}" y="${y - 18}" text-anchor="middle">${detail}</text>
  <path class="return" d="M${arrowStart} ${y} H${arrowEnd}"/>`;
}

function exampleMatrixSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="700" viewBox="0 0 1160 700" role="img" aria-label="bluetape4k AWS Part 3 runnable example matrix">
  <defs>
    <style>
      .title{font-family:'Architects Daughter',cursive;font-size:34px;fill:#102033}
      .subtitle,.body{font-family:'Comic Mono',monospace;fill:#334155}
      .subtitle{font-size:15px}.label{font-family:'Architects Daughter',cursive;font-size:22px;fill:#102033}.head{font-family:'Architects Daughter',cursive;font-size:24px;fill:#102033}
      .body{font-size:14px}.small{font-family:'Comic Mono',monospace;font-size:12px;fill:#334155}.panel{fill:#fff;stroke:#d7e2ef;stroke-width:1.4;rx:18}
    </style>
  </defs>
  <rect width="1160" height="700" fill="#ffffff"/>
  <text class="title" x="54" y="70">Runnable examples by framework and service</text>
  <text class="subtitle" x="56" y="104">Part 3 maps the examples; Part 5 can walk through full adoption flows in detail.</text>

  <rect class="panel" x="54" y="136" width="1052" height="486"/>
  <text class="head" x="214" y="188" text-anchor="middle">Framework</text>
  <text class="head" x="422" y="188" text-anchor="middle">S3</text>
  <text class="head" x="610" y="188" text-anchor="middle">SQS</text>
  <text class="head" x="798" y="188" text-anchor="middle">DynamoDB</text>
  <text class="head" x="986" y="188" text-anchor="middle">Exposed</text>

${row(230, "Spring Boot", "#e0f2fe", "#38bdf8", [
    ["S3Operations", "presigned URL", "encrypted object"],
    ["SqsOperations", "@SqsListener", "SNS fanout"],
    ["Repository base", "Enhanced Async", "table prefix"],
    ["Auto registry", "DataSource alias", "remote secrets"],
  ])}
${row(428, "Ktor", "#dcfce7", "#22c55e", [
    ["S3KtorClient", "stream/config", "presigned URL"],
    ["SqsConsumer", "ack/nack", "lifecycle hooks"],
    ["DynamoDbPlugin", "auto-create", "repository"],
    ["AwsExposed", "transaction", "resolver hook"],
  ])}

  <rect x="94" y="596" width="972" height="44" rx="22" fill="#f8fafc" stroke="#94a3b8"/>
  <text class="small" x="580" y="623" text-anchor="middle">All examples are wired for local emulator testing with Floci, LocalStack, or Testcontainers depending on the module.</text>
</svg>`;
}

function row(y, framework, fill, stroke, cells) {
  const label = `
  <rect x="96" y="${y}" width="236" height="150" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>
  <text class="label" x="214" y="${y + 66}" text-anchor="middle">${framework}</text>
  <text class="body" x="214" y="${y + 96}" text-anchor="middle">adapter examples</text>`;
  const xs = [348, 536, 724, 912];
  const blocks = cells.map((lines, index) => {
    const x = xs[index];
    return `
  <rect x="${x}" y="${y}" width="150" height="150" rx="14" fill="#ffffff" stroke="#d7e2ef" stroke-width="1.3"/>
  <text class="body" x="${x + 75}" y="${y + 52}" text-anchor="middle">${lines[0]}</text>
  <text class="small" x="${x + 75}" y="${y + 82}" text-anchor="middle">${lines[1]}</text>
  <text class="small" x="${x + 75}" y="${y + 106}" text-anchor="middle">${lines[2]}</text>`;
  }).join("");
  return `${label}${blocks}`;
}

function writeLocaleVariants(name, replacements) {
  const canonicalPath = join(outDir, `${name}.svg`);
  const source = existsSync(canonicalPath) ? canonicalPath : join(outDir, `${name}-en.svg`);
  const english = normalizeDiagramSvg(readFileSync(source, "utf8"), name.includes("sequence"));
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

function normalizeDiagramSvg(svg, isSequence) {
  const normalized = normalizeMarkers(darkenDiagramSvg(svg), isSequence ? 16 : 14);
  return isSequence ? normalized : ensureConnectorAuditPath(convertConnectorPathsToPolylines(normalized));
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
    .replaceAll("font-size:19px;fill:#102033", "font-size:17px;fill:#102033")
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
