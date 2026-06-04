import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const outDir = "public/assets";
mkdirSync(outDir, { recursive: true });

const assets = [
  {
    name: "bluetape4k-aws-part5-adoption-flow-01",
    dot: `digraph AwsPart5AdoptionFlow {
  graph [rankdir=LR, bgcolor="#ffffff", pad=0.35, nodesep=0.55, ranksep=0.72, splines=ortho]
  node [shape=box, style="rounded,filled", fontname="Architects Daughter", fontsize=12, margin="0.12,0.08", color="#94a3b8", fillcolor="#f8fafc"]
  edge [fontname="Comic Mono", fontsize=10, color="#64748b", penwidth=1.4, arrowsize=0.7]

  app [label="Example application\\ncontroller, route, worker", fillcolor="#ecfeff", color="#06b6d4"]
  spring [label="Spring Boot path\\nS3Operations, @SqsListener, repository", fillcolor="#e0f2fe", color="#38bdf8"]
  ktor [label="Ktor path\\nS3KtorClient, routes, plugins", fillcolor="#dcfce7", color="#22c55e"]
  helpers [label="bluetape4k-aws helpers\\ncoroutine bridge, CRT, explicit SDK modules", fillcolor="#fef3c7", color="#f59e0b"]
  emulator [label="Local verification\\nFloci or LocalStack, Testcontainers", fillcolor="#f3e8ff", color="#a855f7"]
  aws [label="AWS services\\nS3, SQS, DynamoDB, KMS", shape=cylinder, fillcolor="#fff7ed", color="#fb923c"]

  app -> spring
  app -> ktor
  spring -> helpers
  ktor -> helpers
  helpers -> emulator
  helpers -> aws
}`,
    svg: adoptionFlowSvg(),
  },
  {
    name: "bluetape4k-aws-part5-storage-profile-switch-01",
    dot: `digraph AwsPart5StorageProfiles {
  graph [rankdir=TB, bgcolor="#ffffff", pad=0.35, nodesep=0.55, ranksep=0.72, splines=ortho]
  node [shape=box, style="rounded,filled", fontname="Architects Daughter", fontsize=12, margin="0.12,0.08", color="#94a3b8", fillcolor="#f8fafc"]
  edge [fontname="Comic Mono", fontsize=10, color="#64748b", penwidth=1.4, arrowsize=0.7]

  app [label="Application code\\nuses StorageService only", fillcolor="#ecfeff", color="#06b6d4"]
  contract [label="StorageService\\nupload, download, getUrl, delete", fillcolor="#fef3c7", color="#f59e0b"]
  local [label="local profile\\nLocalStorageService, Files", fillcolor="#f8fafc", color="#94a3b8"]
  s3 [label="s3 profile\\nS3StorageService, S3Client", fillcolor="#e0f2fe", color="#38bdf8"]
  presigned [label="s3-presigned profile\\nS3PresignedStorageService, S3Presigner", fillcolor="#dcfce7", color="#22c55e"]
  verify [label="Tests\\nno Docker local, Floci-backed S3 profiles", fillcolor="#f3e8ff", color="#a855f7"]

  app -> contract
  contract -> local
  contract -> s3
  contract -> presigned
  local -> verify
  s3 -> verify
  presigned -> verify
}`,
    svg: storageProfileSvg(),
  },
  {
    name: "bluetape4k-aws-part5-spring-s3-example-flow-01",
    dot: `digraph AwsPart5SpringS3Example {
  graph [rankdir=LR, bgcolor="#ffffff", pad=0.35, nodesep=0.55, ranksep=0.72, splines=ortho]
  node [shape=box, style="rounded,filled", fontname="Architects Daughter", fontsize=12, margin="0.12,0.08", color="#94a3b8", fillcolor="#f8fafc"]
  edge [fontname="Comic Mono", fontsize=10, color="#64748b", penwidth=1.4, arrowsize=0.7]

  client [label="HTTP client / test\\ndocument route calls", fillcolor="#ecfeff", color="#06b6d4"]
  controller [label="S3DocumentController\\nupload, download, list, presigned URL, delete", fillcolor="#dcfce7", color="#22c55e"]
  operations [label="S3Operations\\nS3CoroutinesTemplate, transfer, presign", fillcolor="#fef3c7", color="#f59e0b"]
  encryption [label="Encryption routes\\nclient-side envelope, tenant context", fillcolor="#f3e8ff", color="#a855f7"]
  kms [label="KmsOperations\\ndata key metadata", fillcolor="#ffe4e6", color="#fb7185"]
  s3 [label="S3 endpoint\\nLocalStack or AWS", shape=cylinder, fillcolor="#fff7ed", color="#fb923c"]

  client -> controller
  controller -> operations
  controller -> encryption
  operations -> s3
  encryption -> kms
  encryption -> s3
}`,
    svg: springS3ExampleFlowSvg(),
  },
  {
    name: "bluetape4k-aws-part5-sqs-sns-scenario-01",
    dot: `digraph AwsPart5SqsSnsScenario {
  graph [rankdir=LR, bgcolor="#ffffff", pad=0.35, nodesep=0.55, ranksep=0.72, splines=ortho]
  node [shape=box, style="rounded,filled", fontname="Architects Daughter", fontsize=12, margin="0.12,0.08", color="#94a3b8", fillcolor="#f8fafc"]
  edge [fontname="Comic Mono", fontsize=10, color="#64748b", penwidth=1.4, arrowsize=0.7]

  client [label="HTTP client / test\\nqueue, topic, listener routes", fillcolor="#ecfeff", color="#06b6d4"]
  api [label="Spring WebFlux API\\nSqsSnsExampleController", fillcolor="#dcfce7", color="#22c55e"]
  ops [label="SQS / SNS operations\\ncoroutine templates", fillcolor="#fef3c7", color="#f59e0b"]
  fanout [label="SNS to SQS fanout\\npolicy, subscription, redrive", fillcolor="#ffe4e6", color="#fb7185"]
  aws [label="LocalStack SQS/SNS\\nor AWS endpoints", shape=cylinder, fillcolor="#fff7ed", color="#fb923c"]
  listener [label="@SqsListener container\\ntyped payloads, manual ack, retry", fillcolor="#f3e8ff", color="#a855f7"]
  store [label="ReceivedOrderStore\\nmessages, orders, events", fillcolor="#e0f2fe", color="#38bdf8"]

  client -> api
  api -> ops
  ops -> fanout
  ops -> aws
  aws -> listener
  listener -> store
  listener -> aws [label="ack or retry"]
}`,
    svg: sqsSnsScenarioSvg(),
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

function adoptionFlowSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="720" viewBox="0 0 1160 720" role="img" aria-label="bluetape4k AWS real example adoption flow">
  <defs>
    <style>
      .title{font-family:'Architects Daughter',cursive;font-size:34px;fill:#102033}
      .subtitle,.body,.small{font-family:'Comic Mono',monospace;fill:#334155}
      .subtitle{font-size:15px}.label{font-family:'Architects Daughter',cursive;font-size:22px;fill:#102033}
      .body{font-size:14px}.small{font-size:12px}
      .panel{fill:#fff;stroke:#d7e2ef;stroke-width:1.4;rx:18}.card{stroke-width:1.6;rx:16}
      .arrow{fill:none;stroke:#475569;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
      .muted{fill:none;stroke:#64748b;stroke-width:1.9;stroke-dasharray:8 7;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrowMuted)}
    </style>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 1 1 L 7 4 L 1 7 Z" fill="#475569"/>
    </marker>
    <marker id="arrowMuted" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 1 1 L 7 4 L 1 7 Z" fill="#64748b"/>
    </marker>
  </defs>
  <rect width="1160" height="720" fill="#ffffff"/>
  <text class="title" x="54" y="70">From example code to verified AWS behavior</text>
  <text class="subtitle" x="56" y="104">The examples show where framework code ends, helper code begins, and local AWS verification proves the flow.</text>
  <rect class="panel" x="54" y="136" width="1052" height="520"/>

  <rect class="card" x="96" y="302" width="214" height="118" fill="#ecfeff" stroke="#06b6d4"/>
  <text class="label" x="203" y="340" text-anchor="middle">Example app</text>
  <text class="body" x="203" y="370" text-anchor="middle">controller, route,</text>
  <text class="body" x="203" y="393" text-anchor="middle">worker, repository</text>

  <rect class="card" x="390" y="196" width="252" height="124" fill="#e0f2fe" stroke="#38bdf8"/>
  <text class="label" x="516" y="234" text-anchor="middle">Spring Boot path</text>
  <text class="body" x="516" y="264" text-anchor="middle">S3Operations, @SqsListener,</text>
  <text class="body" x="516" y="287" text-anchor="middle">DynamoDB repository</text>

  <rect class="card" x="390" y="406" width="252" height="124" fill="#dcfce7" stroke="#22c55e"/>
  <text class="label" x="516" y="444" text-anchor="middle">Ktor path</text>
  <text class="body" x="516" y="474" text-anchor="middle">S3KtorClient, routes,</text>
  <text class="body" x="516" y="497" text-anchor="middle">plugins and lifecycle</text>

  <rect class="card" x="720" y="302" width="270" height="118" fill="#fef3c7" stroke="#f59e0b"/>
  <text class="label" x="855" y="340" text-anchor="middle">bluetape4k-aws helpers</text>
  <text class="body" x="855" y="370" text-anchor="middle">coroutine bridge, explicit SDK,</text>
  <text class="body" x="855" y="393" text-anchor="middle">CRT and transfer choices</text>

  <rect class="card" x="650" y="536" width="232" height="82" fill="#f3e8ff" stroke="#a855f7"/>
  <text class="label" x="766" y="568" text-anchor="middle">Local verification</text>
  <text class="body" x="766" y="594" text-anchor="middle">Floci or LocalStack tests</text>

  <rect class="card" x="922" y="536" width="136" height="82" fill="#fff7ed" stroke="#fb923c"/>
  <text class="label" x="990" y="568" text-anchor="middle">AWS</text>
  <text class="body" x="990" y="594" text-anchor="middle">S3, SQS, DynamoDB</text>

  <path class="arrow" d="M310 361 H350 V258 H390"/>
  <path class="arrow" d="M310 361 H350 V468 H390"/>
  <path class="arrow" d="M642 258 H680 V361 H720"/>
  <path class="arrow" d="M642 468 H680 V361 H720"/>
  <path class="arrow" d="M855 420 V478 H766 V536"/>
  <path class="muted" d="M990 420 V536"/>
  <text class="small" x="948" y="476" text-anchor="middle">real cloud later</text>
</svg>`;
}

function storageProfileSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="720" viewBox="0 0 1160 720" role="img" aria-label="StorageService profile switch diagram">
  <defs>
    <style>
      .title{font-family:'Architects Daughter',cursive;font-size:34px;fill:#102033}
      .subtitle,.body,.small{font-family:'Comic Mono',monospace;fill:#334155}
      .subtitle{font-size:15px}.label{font-family:'Architects Daughter',cursive;font-size:22px;fill:#102033}
      .body{font-size:14px}.small{font-size:12px}
      .panel{fill:#fff;stroke:#d7e2ef;stroke-width:1.4;rx:18}.card{stroke-width:1.6;rx:16}
      .arrow{fill:none;stroke:#475569;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
    </style>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 1 1 L 7 4 L 1 7 Z" fill="#475569"/>
    </marker>
  </defs>
  <rect width="1160" height="720" fill="#ffffff"/>
  <text class="title" x="54" y="70">StorageService profile switch</text>
  <text class="subtitle" x="56" y="104">Application code keeps one contract while Spring profiles swap local files, S3, and pre-signed URL behavior.</text>
  <rect class="panel" x="54" y="136" width="1052" height="520"/>

  <rect class="card" x="360" y="174" width="440" height="84" fill="#ecfeff" stroke="#06b6d4"/>
  <text class="label" x="580" y="208" text-anchor="middle">Application code</text>
  <text class="body" x="580" y="234" text-anchor="middle">uses StorageService; does not know the active backend</text>

  <rect class="card" x="260" y="318" width="640" height="92" fill="#fef3c7" stroke="#f59e0b"/>
  <text class="label" x="580" y="352" text-anchor="middle">StorageService</text>
  <text class="body" x="580" y="379" text-anchor="middle">upload(key, bytes, contentType) · download(key) · getUrl(key) · delete(key)</text>

  <rect class="card" x="108" y="500" width="260" height="96" fill="#f8fafc" stroke="#94a3b8"/>
  <text class="label" x="238" y="536" text-anchor="middle">local profile</text>
  <text class="body" x="238" y="566" text-anchor="middle">LocalStorageService</text>
  <text class="small" x="238" y="588" text-anchor="middle">java.nio.file.Files, no Docker</text>

  <rect class="card" x="450" y="500" width="260" height="96" fill="#e0f2fe" stroke="#38bdf8"/>
  <text class="label" x="580" y="536" text-anchor="middle">s3 profile</text>
  <text class="body" x="580" y="566" text-anchor="middle">S3StorageService</text>
  <text class="small" x="580" y="588" text-anchor="middle">S3Client via Floci</text>

  <rect class="card" x="792" y="500" width="260" height="96" fill="#dcfce7" stroke="#22c55e"/>
  <text class="label" x="922" y="536" text-anchor="middle">s3-presigned profile</text>
  <text class="body" x="922" y="566" text-anchor="middle">S3PresignedStorageService</text>
  <text class="small" x="922" y="588" text-anchor="middle">S3Presigner, X-Amz-Expires</text>

  <path class="arrow" d="M580 258 V318"/>
  <path class="arrow" d="M580 410 V450 H238 V500"/>
  <path class="arrow" d="M580 410 V500"/>
  <path class="arrow" d="M580 410 V450 H922 V500"/>
</svg>`;
}

function springS3ExampleFlowSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="760" viewBox="0 0 1160 760" role="img" aria-label="Spring Boot S3 example flow">
  <defs>
    <style>
      .title{font-family:'Architects Daughter',cursive;font-size:34px;fill:#102033}
      .subtitle,.body,.small{font-family:'Comic Mono',monospace;fill:#334155}
      .subtitle{font-size:15px}.label{font-family:'Architects Daughter',cursive;font-size:22px;fill:#102033}
      .body{font-size:14px}.small{font-size:12px}
      .panel{fill:#fff;stroke:#d7e2ef;stroke-width:1.4;rx:18}.card{stroke-width:1.6;rx:16}
      .arrow{fill:none;stroke:#475569;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
      .muted{fill:none;stroke:#64748b;stroke-width:1.9;stroke-dasharray:8 7;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrowMuted)}
      .chip{fill:#ffffff;stroke:#d7e2ef;stroke-width:1;rx:10}.footer{fill:#102033;stroke:#102033;stroke-width:1.2;rx:10}
      .footerText{font-family:'Comic Mono',monospace;font-size:12px;fill:#ffffff}
    </style>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 1 1 L 7 4 L 1 7 Z" fill="#475569"/>
    </marker>
    <marker id="arrowMuted" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 1 1 L 7 4 L 1 7 Z" fill="#64748b"/>
    </marker>
  </defs>
  <rect width="1160" height="760" fill="#ffffff"/>
  <text class="title" x="54" y="70">Spring Boot S3 example flow</text>
  <text class="subtitle" x="56" y="104">WebFlux routes use S3Operations for object APIs and optional client-side encryption through KMS-backed metadata.</text>
  <rect class="panel" x="54" y="136" width="1052" height="560"/>

  <rect class="card" x="86" y="214" width="226" height="92" fill="#ecfeff" stroke="#06b6d4"/>
  <text class="label" x="199" y="250" text-anchor="middle">HTTP client / test</text>
  <text class="body" x="199" y="278" text-anchor="middle">document route calls</text>

  <rect class="card" x="390" y="184" width="290" height="112" fill="#dcfce7" stroke="#22c55e"/>
  <text class="label" x="535" y="224" text-anchor="middle">S3DocumentController</text>
  <text class="body" x="535" y="252" text-anchor="middle">upload, download, list,</text>
  <text class="body" x="535" y="274" text-anchor="middle">presigned URL, delete</text>

  <rect class="card" x="764" y="184" width="276" height="112" fill="#fef3c7" stroke="#f59e0b"/>
  <text class="label" x="902" y="224" text-anchor="middle">S3Operations</text>
  <text class="body" x="902" y="252" text-anchor="middle">S3CoroutinesTemplate</text>
  <text class="body" x="902" y="274" text-anchor="middle">transfer and presign</text>

  <rect class="card" x="390" y="406" width="290" height="108" fill="#f3e8ff" stroke="#a855f7"/>
  <text class="label" x="535" y="444" text-anchor="middle">Encryption routes</text>
  <text class="body" x="535" y="472" text-anchor="middle">client-side envelope</text>
  <text class="body" x="535" y="494" text-anchor="middle">tenant context</text>

  <rect class="card" x="764" y="406" width="276" height="108" fill="#ffe4e6" stroke="#fb7185"/>
  <text class="label" x="902" y="444" text-anchor="middle">KmsOperations</text>
  <text class="body" x="902" y="472" text-anchor="middle">data key metadata</text>
  <text class="body" x="902" y="494" text-anchor="middle">and encryption context</text>

  <rect class="card" x="596" y="576" width="284" height="70" fill="#fff7ed" stroke="#fb923c"/>
  <text class="label" x="738" y="606" text-anchor="middle">S3 endpoint</text>
  <text class="body" x="738" y="630" text-anchor="middle">LocalStack, Floci, or AWS</text>

  <path class="arrow" d="M312 260 H350 V240 H390"/>
  <path class="arrow" d="M680 240 H764"/>
  <rect class="chip" x="704" y="204" width="48" height="24"/>
  <text class="small" x="728" y="221" text-anchor="middle">object</text>

  <path class="arrow" d="M535 296 V406"/>
  <rect class="chip" x="556" y="340" width="74" height="24"/>
  <text class="small" x="593" y="357" text-anchor="middle">optional</text>

  <path class="arrow" d="M680 460 H764"/>
  <rect class="chip" x="704" y="424" width="48" height="24"/>
  <text class="small" x="728" y="441" text-anchor="middle">KMS</text>

  <path class="arrow" d="M902 296 V336 H738 V576"/>
  <path class="muted" d="M535 514 V546 H738 V576"/>
  <path class="muted" d="M902 514 V546 H738"/>

  <rect class="footer" x="86" y="670" width="988" height="36"/>
  <text class="footerText" x="580" y="693" text-anchor="middle">Example role: show object APIs, pre-signed URLs, object listing, and envelope encryption extension points.</text>
</svg>`;
}

function sqsSnsScenarioSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="760" viewBox="0 0 1160 760" role="img" aria-label="Spring Boot SQS and SNS example runtime scenario">
  <defs>
    <style>
      .title{font-family:'Architects Daughter',cursive;font-size:34px;fill:#102033}
      .subtitle,.body,.small{font-family:'Comic Mono',monospace;fill:#334155}
      .subtitle{font-size:15px}.label{font-family:'Architects Daughter',cursive;font-size:22px;fill:#102033}
      .body{font-size:14px}.small{font-size:12px}
      .panel{fill:#fff;stroke:#d7e2ef;stroke-width:1.4;rx:18}.card{stroke-width:1.6;rx:16}
      .arrow{fill:none;stroke:#475569;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
      .return{fill:none;stroke:#64748b;stroke-width:1.9;stroke-dasharray:8 7;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrowMuted)}
      .chip{fill:#ffffff;stroke:#d7e2ef;stroke-width:1;rx:10}.footer{fill:#102033;stroke:#102033;stroke-width:1.2;rx:10}
      .footerText{font-family:'Comic Mono',monospace;font-size:12px;fill:#ffffff}
    </style>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 1 1 L 7 4 L 1 7 Z" fill="#475569"/>
    </marker>
    <marker id="arrowMuted" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 1 1 L 7 4 L 1 7 Z" fill="#64748b"/>
    </marker>
  </defs>
  <rect width="1160" height="760" fill="#ffffff"/>
  <text class="title" x="54" y="70">Spring Boot SQS/SNS example flow</text>
  <text class="subtitle" x="56" y="104">REST publishing, SNS fanout, SQS listener lifecycle, manual acknowledgement, retry, and DLQ setup meet in one runnable example.</text>
  <rect class="panel" x="54" y="136" width="1052" height="560"/>

  <rect class="card" x="86" y="214" width="214" height="100" fill="#ecfeff" stroke="#06b6d4"/>
  <text class="label" x="193" y="250" text-anchor="middle">HTTP client / test</text>
  <text class="body" x="193" y="278" text-anchor="middle">queue, topic, listener</text>
  <text class="body" x="193" y="300" text-anchor="middle">and DLQ routes</text>

  <rect class="card" x="388" y="184" width="260" height="112" fill="#dcfce7" stroke="#22c55e"/>
  <text class="label" x="518" y="224" text-anchor="middle">Spring WebFlux API</text>
  <text class="body" x="518" y="252" text-anchor="middle">SqsSnsExampleController</text>
  <text class="body" x="518" y="274" text-anchor="middle">delegates to service</text>

  <rect class="card" x="760" y="184" width="254" height="112" fill="#fef3c7" stroke="#f59e0b"/>
  <text class="label" x="887" y="224" text-anchor="middle">SQS / SNS operations</text>
  <text class="body" x="887" y="252" text-anchor="middle">coroutine templates</text>
  <text class="body" x="887" y="274" text-anchor="middle">and SDK clients</text>

  <rect class="card" x="760" y="374" width="254" height="108" fill="#ffe4e6" stroke="#fb7185"/>
  <text class="label" x="887" y="412" text-anchor="middle">SNS to SQS fanout</text>
  <text class="body" x="887" y="440" text-anchor="middle">topic, queue policy,</text>
  <text class="body" x="887" y="462" text-anchor="middle">subscription, redrive</text>

  <rect class="card" x="456" y="514" width="254" height="104" fill="#fff7ed" stroke="#fb923c"/>
  <text class="label" x="583" y="552" text-anchor="middle">LocalStack SQS/SNS</text>
  <text class="body" x="583" y="580" text-anchor="middle">or real AWS endpoints</text>

  <rect class="card" x="134" y="424" width="268" height="110" fill="#f3e8ff" stroke="#a855f7"/>
  <text class="label" x="268" y="462" text-anchor="middle">@SqsListener container</text>
  <text class="body" x="268" y="490" text-anchor="middle">typed payloads, manual ack,</text>
  <text class="body" x="268" y="512" text-anchor="middle">retry/backoff and interceptors</text>

  <rect class="card" x="92" y="594" width="310" height="62" fill="#e0f2fe" stroke="#38bdf8"/>
  <text class="label" x="247" y="622" text-anchor="middle">ReceivedOrderStore</text>
  <text class="body" x="247" y="645" text-anchor="middle">messages, orders, attempts, events</text>

  <path class="arrow" d="M300 264 H344 V240 H388"/>
  <path class="arrow" d="M648 240 H760"/>
  <rect class="chip" x="670" y="204" width="68" height="24"/>
  <text class="small" x="704" y="221" text-anchor="middle">publish</text>

  <path class="arrow" d="M887 296 V374"/>
  <rect class="chip" x="908" y="324" width="66" height="24"/>
  <text class="small" x="941" y="341" text-anchor="middle">fanout</text>

  <path class="arrow" d="M887 482 V566 H710"/>
  <path class="arrow" d="M1014 240 H1046 V566 H710"/>
  <path class="arrow" d="M456 566 H268 V534"/>
  <rect class="chip" x="324" y="548" width="78" height="24"/>
  <text class="small" x="363" y="565" text-anchor="middle">messages</text>

  <path class="return" d="M268 424 V356 H518 V296"/>
  <rect class="chip" x="432" y="326" width="64" height="24"/>
  <text class="small" x="464" y="343" text-anchor="middle">events</text>

  <path class="return" d="M402 478 H583 V514"/>
  <rect class="chip" x="442" y="446" width="92" height="24"/>
  <text class="small" x="488" y="463" text-anchor="middle">ack / retry</text>

  <path class="arrow" d="M268 534 V594"/>

  <rect class="footer" x="86" y="670" width="988" height="36"/>
  <text class="footerText" x="580" y="693" text-anchor="middle">Example role: prove REST publishing, listener lifecycle, typed conversion, acknowledgement, fanout, and DLQ behavior locally.</text>
</svg>`;
}
