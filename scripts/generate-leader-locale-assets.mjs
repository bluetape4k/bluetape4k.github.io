import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const outDir = path.resolve("public/assets");
const locale = {
  en: {
    titleFont: "Architects Daughter",
    bodyFont: "Comic Mono",
    monoFont: "Comic Mono",
    overviewTitle: "Bluetape4k Leader Repository Map",
    overviewSub: "Application code calls compact leader contracts, then selects backend, framework integration, and scenario examples.",
    core: "Core contracts",
    coreHint: "small API surface used by services",
    backends: "Backend adapters",
    backendHint: "ownership primitives behind the same contract",
    integrations: "Framework integrations",
    examples: "Examples and benchmark",
    footer: "Keep the core vocabulary stable; choose the lease store that matches the workload.",
    erdTitle: "Leader Example Persistence Contracts",
    erdSub: "Example apps keep work identity, lease ownership, and outcome history separate.",
    job: "Work item",
    lock: "Leader lock",
    history: "Outcome history",
    metric: "Metrics event",
    examplesTitle: "Scenario example family",
    examplesSub: "Six runnable examples cover the common duplicate-work failure modes.",
    groupTitle: "LeaderGroupElector Slot Tokens",
    groupSub: "maxLeaders converts one lock name into a bounded set of renewable slots.",
    strategicTitle: "StrategicLeaderElector Decision Flow",
    strategicSub: "All candidates are visible first; the strategy chooses the node that executes.",
    runTitle: "runIfLeader Sequence",
    runSub: "One path executes the body; the contention path skips without side effects.",
    springTitle: "Spring @LeaderElection AOP Sequence",
    springSub: "The advice resolves metadata, chooses an elector, executes the method body, and records outcomes.",
    throughputTitle: "Distributed Backend Throughput",
    throughputSub: "runIfLeader hot path, ops/s. Higher is better; local and H2 are excluded.",
    latencyTitle: "Distributed Backend Latency",
    latencySub: "runIfLeader average time, us/op. Lower is better; local and H2 are excluded.",
    blocking: "Blocking API",
    suspend: "Suspend API",
    higherBetter: "Higher is better",
    lowerBetter: "Lower is better",
  },
  ko: {
    titleFont: "goorm Sans",
    bodyFont: "goorm Sans",
    monoFont: "goorm Sans Code",
    overviewTitle: "Bluetape4k Leader 저장소 지도",
    overviewSub: "서비스 코드는 작은 리더 계약을 호출하고, workload에 맞는 backend, framework 통합, 예제를 고릅니다.",
    core: "Core 계약",
    coreHint: "서비스가 직접 호출하는 작은 API 표면",
    backends: "Backend adapter",
    backendHint: "같은 계약 뒤의 ownership primitive",
    integrations: "Framework 통합",
    examples: "예제와 benchmark",
    footer: "core vocabulary는 유지하고, workload에 맞는 lease 저장소를 고릅니다.",
    erdTitle: "Leader 예제 persistence 계약",
    erdSub: "예제 앱은 작업 식별자, lease ownership, 실행 이력을 분리해서 다룹니다.",
    job: "작업 단위",
    lock: "리더 락",
    history: "실행 이력",
    metric: "Metric 이벤트",
    examplesTitle: "시나리오 예제 묶음",
    examplesSub: "실행 가능한 6개 예제가 중복 실행 failure mode를 각각 보여줍니다.",
    groupTitle: "LeaderGroupElector 슬롯 토큰",
    groupSub: "maxLeaders는 하나의 lockName을 갱신 가능한 슬롯 묶음으로 바꿉니다.",
    strategicTitle: "StrategicLeaderElector 결정 흐름",
    strategicSub: "모든 후보를 먼저 같은 목록으로 보고, strategy가 실행할 노드를 고릅니다.",
    runTitle: "runIfLeader 실행 시퀀스",
    runSub: "한 경로는 body를 실행하고, 경합 경로는 side effect 없이 skip합니다.",
    springTitle: "Spring @LeaderElection AOP 시퀀스",
    springSub: "advice가 metadata를 해석하고 elector를 선택한 뒤 method body와 outcome 기록을 처리합니다.",
    throughputTitle: "분산 backend 처리량",
    throughputSub: "runIfLeader hot path, ops/s. 높을수록 좋으며 local과 H2는 제외했습니다.",
    latencyTitle: "분산 backend 지연 시간",
    latencySub: "runIfLeader 평균 시간, us/op. 낮을수록 좋으며 local과 H2는 제외했습니다.",
    blocking: "Blocking API",
    suspend: "Suspend API",
    higherBetter: "높을수록 좋음",
    lowerBetter: "낮을수록 좋음",
  },
};

const exampleData = [
  ["examples-batch-scheduler-architecture-01", "Batch Scheduler", "야간 배치", "batch trigger", "Redis lock", "lease ownership", "settlement job"],
  ["examples-migration-gate-architecture-01", "Migration Gate", "마이그레이션 게이트", "startup pod", "JDBC lock", "Exposed JDBC lock", "schema migration"],
  ["examples-webhook-poller-architecture-01", "Webhook Poller", "Webhook Poller", "remote event", "MongoDB lease", "lease ownership", "event claim"],
  ["examples-cache-warmer-architecture-01", "Cache Warmer", "Cache Warmer", "partition key", "Redis lock", "lease ownership", "warm partition"],
  ["examples-tenant-aggregator-architecture-01", "Tenant Aggregator", "Tenant Aggregator", "tenant loop", "tenant lock", "lease ownership", "aggregate snapshot"],
  ["examples-k8s-operator-architecture-01", "K8s Operator", "K8s Operator", "reconcile tick", "K8s Lease", "Kubernetes Lease", "active reconciler"],
];

const throughput = [
  ["Lettuce Redis", 1454.7, 1402.6],
  ["Redisson Redis", 1415.8, 1386.7],
  ["Hazelcast", 1460.9, 1325.9],
  ["MongoDB", 843.7, 798.4],
  ["ZooKeeper", 804.3, 670.6],
  ["Consul", 593.6, 563.2],
  ["etcd", 443.8, 467.5],
];

const latency = [
  ["Lettuce Redis", 699.4, 675.3],
  ["Redisson Redis", 699.7, 714.9],
  ["Hazelcast", 766.3, 749.0],
  ["MongoDB", 1131.0, 4333.5],
  ["ZooKeeper", 1372.2, 1397.3],
  ["Consul", 1900.6, 1701.8],
  ["etcd", 2167.9, 2239.4],
];

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function text(x, y, value, cls, extra = "") {
  return `<text x="${x}" y="${y}" class="${cls}" ${extra}>${esc(value)}</text>`;
}

function marker(id, color, size = 14) {
  return `<marker id="${id}" viewBox="0 0 10 10" markerUnits="userSpaceOnUse" markerWidth="${size}" markerHeight="${size}" refX="9" refY="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}" stroke="${color}" stroke-width="0" stroke-dasharray="none" style="stroke-dasharray:none!important"/></marker>`;
}

function chartDefs(l) {
  return `<defs><style>
    .canvas{fill:#fbfcf8}.frame{fill:#fff;stroke:#41545d;stroke-width:2.2}
    .title{font-family:"${l.titleFont}";font-size:38px;fill:#263238}
    .subtitle,.footer,.axis,.tick,.legend{font-family:"${l.bodyFont}";fill:#4e6069}
    .subtitle{font-size:16px}.footer{font-size:13px}.axis,.tick,.legend{font-size:13px}
  </style></defs>`;
}

function baseDefs(l, extra = "") {
  const extraStyle = extra ? `\n      ${extra}` : "";
  return `<defs>
    <filter id="shadow" x="-8%" y="-8%" width="116%" height="116%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#28343b" flood-opacity="0.13"/></filter>
    ${marker("arrow-blue", "#3f7d9c")}
    ${marker("arrow-green", "#6e8f4f")}
    ${marker("arrow-amber", "#b98240")}
    ${marker("arrow-red", "#b86868")}
    ${marker("arrow-slate", "#78909c")}
    <style>
      .canvas{fill:#fbfcf8}.frame{fill:#fff;stroke:#41545d;stroke-width:2.2}
      .title{font-family:"${l.titleFont}";font-size:38px;fill:#263238}
      .subtitle,.detail,.labelText,.footer,.axis,.tick,.legend,.role{font-family:"${l.bodyFont}";fill:#4e6069}
      .subtitle{font-size:16px}.detail{font-size:14px}.footer{font-size:13px}.axis,.tick,.legend{font-size:13px}
      .role{font-family:"${l.monoFont}";font-size:12.5px}
      .bandTitle,.cardTitle,.participant{font-family:"${l.titleFont}";fill:#1f3138}
      .bandTitle{font-size:23px}.cardTitle{font-size:22px}.participant{font-size:19px}
      .mono,.code,.badgeText{font-family:"${l.monoFont}";fill:#33454e}
      .band{fill:#f5f9fb;stroke:#c8d7df;stroke-width:1.6}.bandAlt{fill:#fbfdf8;stroke:#d7e0d0;stroke-width:1.6}
      .card{filter:url(#shadow);stroke-width:2}.header{fill:#fff;stroke:#546e7a;stroke-width:2}
      .edge,.call,.return,.skip,.state{fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
      .call{stroke:#3f7d9c;marker-end:url(#arrow-blue)}.state{stroke:#6e8f4f;marker-end:url(#arrow-green)}
      .return{stroke:#9b7d54;marker-end:url(#arrow-amber);stroke-dasharray:8 7}.skip{stroke:#b86868;marker-end:url(#arrow-red)}
      .pill,.label{fill:#fff;stroke-width:1.5}.labelText{font-size:12.5px}.badgeText{font-size:12px;font-weight:700}
      .lifeline{stroke:#9aaab1;stroke-width:2;stroke-dasharray:7 8}.activation{fill:#e6f2ec;stroke:#5b7e67;stroke-width:1.7}
      .branch{fill:none;stroke:#78909c;stroke-width:2.2;stroke-dasharray:12 8}.divider{stroke:#78909c;stroke-width:1.4;stroke-dasharray:8 7}${extraStyle}
    </style>
  </defs>`;
}

function card(x, y, w, h, title, detail, fill = "#fff", stroke = "#78909c") {
  const titleY = h < 62 ? y + 28 : y + 34;
  const detailY = h < 62 ? y + h - 10 : y + 60;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="card" fill="${fill}" stroke="${stroke}"/>
    ${text(x + w / 2, titleY, title, "cardTitle", 'text-anchor="middle"')}
    ${text(x + w / 2, detailY, detail, "detail", 'text-anchor="middle"')}</g>`;
}

function overviewSvg(lang) {
  const l = locale[lang];
  const chips = [
    ["Blocking", "LeaderElector"],
    ["Coroutine", "SuspendLeaderElector"],
    ["Group slots", "LeaderGroupElector"],
    ["Strategic", "StrategicLeaderElector"],
  ];
  const backends = [
    ["Redis", "Lettuce / Redisson"],
    ["SQL / R2DBC", "Exposed adapters"],
    ["Document", "MongoDB / DynamoDB"],
    ["Control", "etcd / Consul / K8s"],
    ["Cluster", "Hazelcast / ZooKeeper"],
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900" role="img" aria-labelledby="title desc">
  <title id="title">${esc(l.overviewTitle)}</title><desc id="desc">${esc(l.overviewSub)}</desc>${baseDefs(l)}
  <rect class="canvas" width="1400" height="900"/><rect class="frame" x="44" y="36" width="1312" height="828" rx="18"/>
  ${text(700, 92, l.overviewTitle, "title", 'text-anchor="middle"')}${text(700, 124, l.overviewSub, "subtitle", 'text-anchor="middle"')}
  <rect x="92" y="162" width="1216" height="188" rx="14" class="band"/>
  ${text(126, 206, l.core, "bandTitle")}${text(126, 236, l.coreHint, "detail")}
  ${chips.map(([a,b], i) => card(500 + (i % 2) * 330, 184 + Math.floor(i / 2) * 78, 292, 58, a, b, "#fff", "#8faed8")).join("")}
  <path d="M 700 350 L 700 392" class="call"/>
  <rect x="92" y="392" width="1216" height="186" rx="14" class="bandAlt"/>
  ${text(126, 436, l.backends, "bandTitle")}${text(126, 466, l.backendHint, "detail")}
  ${backends.map(([a,b], i) => card(246 + i * 210, 480, 176, 64, a, b, "#fff", "#8dc7b5")).join("")}
  <path d="M 386 578 L 386 622" class="state"/><path d="M 1014 578 L 1014 622" class="state"/>
  <rect x="92" y="622" width="588" height="132" rx="14" fill="#fff7e8" stroke="#e7c988" stroke-width="2"/>
  ${text(126, 666, l.integrations, "bandTitle")}${["Spring Boot", "Ktor 3.x", "Micrometer"].map((v,i)=>card(154+i*170,690,142,50,v,"adapter","#fff","#d9b76e")).join("")}
  <rect x="720" y="622" width="588" height="132" rx="14" fill="#f6efff" stroke="#c9b3ee" stroke-width="2"/>
  ${text(754, 666, l.examples, "bandTitle")}${["examples/*", "benchmark", "BOM"].map((v,i)=>card(790+i*170,690,142,50,v,i===0?"scenarios":"evidence","#fff","#b99de0")).join("")}
  <rect x="110" y="786" width="1180" height="54" rx="16" fill="#f8fbff" stroke="#d4deeb" stroke-width="2"/>
  ${text(700, 810, l.footer, "footer", 'text-anchor="middle"')}${text(700, 832, "github.com/bluetape4k/bluetape4k-leader", "footer", 'text-anchor="middle"')}
  </svg>`;
}

function erdSvg(lang) {
  const l = locale[lang];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="860" viewBox="0 0 1400 860" role="img" aria-labelledby="title desc">
  <title id="title">${esc(l.erdTitle)}</title><desc id="desc">${esc(l.erdSub)}</desc>${baseDefs(l)}
  <rect class="canvas" width="1400" height="860"/><rect class="frame" x="40" y="34" width="1320" height="792" rx="16"/>
  ${text(700, 90, l.erdTitle, "title", 'text-anchor="middle"')}${text(700, 122, l.erdSub, "subtitle", 'text-anchor="middle"')}
  ${table(96, 220, 280, l.job, ["lockName", "tenantId", "payloadKey"])}
  ${table(560, 198, 280, l.lock, ["lockName PK", "ownerId", "leaseUntil"])}
  ${table(1018, 220, 286, l.history, ["lockName FK", "result", "startedAt"])}
  ${table(560, 556, 280, l.metric, ["lockName", "outcome", "duration"])}
  <path d="M 376 300 L 560 300" class="call"/>
  <path d="M 840 300 L 1018 300" class="state"/>
  <path d="M 700 372 L 700 556" class="return"/>
  ${text(456, 284, "1", "mono")}${text(534, 284, "N", "mono")}${text(902, 284, "1", "mono")}${text(992, 284, "N", "mono")}
  ${text(720, 486, lang === "ko" ? "outcome 기록" : "records outcome", "detail")}
  </svg>`;
}

function table(x, y, w, title, rows) {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${174}" rx="8" class="card" fill="#fff" stroke="#6f8791"/>
  <rect x="${x}" y="${y}" width="${w}" height="46" rx="8" fill="#eaf2ff" stroke="#6f8791" stroke-width="2"/>
  ${text(x + w / 2, y + 31, title, "cardTitle", 'text-anchor="middle"')}
  ${rows.map((r,i)=>`${text(x+24,y+78+i*30,r,"mono")}<line x1="${x+16}" y1="${y+90+i*30}" x2="${x+w-16}" y2="${y+90+i*30}" stroke="#e0e8ee" stroke-width="1"/>`).join("")}</g>`;
}

function exampleSvg(lang, data) {
  const l = locale[lang];
  const [, enTitle, koTitle, trigger, storeTitle, storeDetail, work] = data;
  const title = lang === "ko" ? `${koTitle} 아키텍처` : `${enTitle} Architecture`;
  const sub = lang === "ko" ? `${koTitle}는 같은 lockName으로 하나의 worker만 side effect를 실행하게 합니다.` : `${enTitle} uses one elected worker while peers observe skipped or failed outcomes.`;
  return archSvg(l, title, sub, [
    [lang === "ko" ? "요청" : "Request", trigger],
    ["Leader API", "runIfLeaderResult"],
    [storeTitle, storeDetail],
    [lang === "ko" ? "보호된 작업" : "Protected work", work],
    [lang === "ko" ? "관찰" : "Observers", lang === "ko" ? "metrics / logs" : "metrics / logs"],
  ]);
}

function archSvg(l, title, sub, nodes) {
  const xs = [80, 330, 580, 830, 1080];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="620" viewBox="0 0 1280 620" role="img" aria-labelledby="title desc">
  <title id="title">${esc(title)}</title><desc id="desc">${esc(sub)}</desc>${baseDefs(l)}
  <rect class="canvas" width="1280" height="620"/><rect class="frame" x="28" y="26" width="1224" height="568" rx="14"/>
  ${text(640, 82, title, "title", 'text-anchor="middle"')}${text(640, 114, sub, "subtitle", 'text-anchor="middle"')}
  ${nodes.map((n,i)=>card(xs[i], 260, 190, 92, n[0], n[1], i===0?"#eef7fb":i===4?"#fff5f5":"#fff", i===0?"#3f7d9c":i===4?"#b86868":"#6e8f4f")).join("")}
  <path d="M 270 306 L 330 306" class="call"/>
  <path d="M 520 306 L 580 306" class="state"/>
  <path d="M 770 306 L 830 306" class="state"/>
  <path d="M 1020 306 L 1080 306" class="return"/>
  <path d="M 925 352 L 925 430 Q 925 452 947 452 L 1175 452 Q 1198 452 1198 430 L 1198 352" class="skip"/>
  ${label(286, 218, "1", "candidate")}${label(536, 218, "2", "lease")}${label(786, 218, "3", "execute")}${label(1036, 218, "4", "outcome")}
  ${text(640, 520, "LeaderRunResult: Elected | Skipped | ActionFailed", "footer", 'text-anchor="middle"')}
  </svg>`;
}

function label(x, y, n, value) {
  return `<g><rect x="${x}" y="${y}" width="132" height="30" rx="15" class="pill" stroke="#78909c"/><circle cx="${x+18}" cy="${y+15}" r="11" fill="#fff" stroke="#78909c" stroke-width="1.4"/><text x="${x+18}" y="${y+19}" text-anchor="middle" class="badgeText">${n}</text><text x="${x+36}" y="${y+20}" class="labelText">${esc(value)}</text></g>`;
}

function groupSvg(lang) {
  const l = locale[lang];
  return archSvg(l, l.groupTitle, l.groupSub, [
    ["node-a", 'runIfLeader("job")'],
    ["Group elector", "LeaderGroupElector"],
    ["Slot semaphore", "maxLeaders = 3"],
    [lang === "ko" ? "실행 중" : "Leader work", "activeCount = 3"],
    [lang === "ko" ? "대기 또는 skip" : "Wait or skip", "no token left"],
  ]);
}

function strategicSvg(lang) {
  const l = locale[lang];
  return archSvg(l, l.strategicTitle, l.strategicSub, [
    ["CandidateInfo", "nodeId + metadata"],
    ["Registry", "candidate registry"],
    ["ElectionStrategy", "FIFO / Random / Scored"],
    [lang === "ko" ? "선택된 노드" : "Selected node", "run action"],
    [lang === "ko" ? "결과 기록" : "Result update", "success / failure"],
  ]);
}

function sequenceSvg(lang, kind) {
  const l = locale[lang];
  const spring = kind === "spring";
  const title = spring ? l.springTitle : l.runTitle;
  const sub = spring ? l.springSub : l.runSub;
  const parts = spring
    ? [["Caller", "requester"], ["Spring Proxy", "runtime"], ["Leader Aspect", "LeaderElectionAspect"], ["Backend Elector", "runtime"], ["Body", "work"]]
    : [["Caller", "requester"], ["LeaderElector", "runtime"], ["Backend Lock", "runtime"], ["Action", "work"]];
  const x0 = spring ? [110, 365, 620, 875, 1130] : [150, 420, 690, 960];
  const steps = spring
    ? [["1", "annotated method call", 110, 365, "call"], ["2", "around advice + SpEL", 365, 620, "call"], ["3", "runIfLeaderResult(lockName)", 620, 875, "state"], ["4", "elected: invoke body", 875, 1130, "state"], ["5", "value or body error", 1130, 875, "return"], ["6", "Elected / Skipped / ActionFailed", 875, 620, "return"]]
    : [["1", 'runIfLeader("job")', 150, 420, "call"], ["2", "tryAcquire(lock, wait)", 420, 690, "call"], ["3", "lock acquired", 690, 420, "return"], ["4", "action()", 420, 960, "state"], ["5", "release + result", 420, 150, "return"], ["6", "contention returns null", 690, 150, "skip"]];
  const w = spring ? 1280 : 1100;
  const h = spring ? 860 : 780;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(title)}</title><desc id="desc">${esc(sub)}</desc>${baseDefs(l)}
  <rect class="canvas" width="${w}" height="${h}"/><rect class="frame" x="28" y="26" width="${w-56}" height="${h-52}" rx="14"/>
  ${text(w/2, 80, title, "title", 'text-anchor="middle"')}${text(w/2, 112, sub, "subtitle", 'text-anchor="middle"')}
  ${parts.map(([name, role],i)=>`<rect class="header" x="${x0[i]-82}" y="152" width="164" height="54" rx="8"/>${text(x0[i],180,name,"participant",'text-anchor="middle"')}${text(x0[i],200,role,"role",'text-anchor="middle"')}<line class="lifeline" x1="${x0[i]}" y1="206" x2="${x0[i]}" y2="${h-90}"/><rect class="activation" x="${x0[i]-8}" y="250" width="16" height="${h-390}" rx="5"/>`).join("")}
  <rect x="70" y="${h-218}" width="${w-140}" height="94" rx="8" class="branch"/><line x1="70" y1="${h-170}" x2="${w-70}" y2="${h-170}" class="divider"/>${text(90,h-196,spring?"alt backend failure":"alt not elected","labelText")}${text(90,h-148,spring?"FAIL_OPEN_RUN / SKIP / RETHROW":"skip branch returns null","labelText")}
  ${steps.map((s,i)=>messageRow(268+i*64, s[0], s[1], s[2], s[3], s[4])).join("")}
  </svg>`;
}

function messageRow(y, n, labelText, from, to, cls) {
  const left = Math.min(from, to), right = Math.max(from, to);
  const labelX = left + (right - left) / 2 - 82;
  const pathD = from < to ? `M ${from} ${y} L ${to-12} ${y}` : `M ${from} ${y} L ${to+12} ${y}`;
  return `<g><rect class="label" x="${labelX}" y="${y-28}" width="164" height="28" rx="14" stroke="#78909c"/><circle cx="${labelX+18}" cy="${y-14}" r="10.5" fill="#fff" stroke="#78909c" stroke-width="1.3"/><text x="${labelX+18}" y="${y-10}" text-anchor="middle" class="badgeText">${n}</text><text x="${labelX+36}" y="${y-9}" class="labelText">${esc(labelText)}</text><path d="${pathD}" class="${cls}"/></g>`;
}

function chartSvg(lang, type) {
  const l = locale[lang];
  const data = type === "throughput" ? throughput : latency;
  const title = type === "throughput" ? l.throughputTitle : l.latencyTitle;
  const sub = type === "throughput" ? l.throughputSub : l.latencySub;
  const max = type === "throughput" ? 1600 : 4500;
  const unit = type === "throughput" ? "ops/s" : "us/op";
  const scale = 820 / max;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1040" viewBox="0 0 1500 1040" role="img" aria-labelledby="title desc">
  <title id="title">${esc(title)}</title><desc id="desc">${esc(sub)}</desc>${chartDefs(l)}
  <rect class="canvas" width="1500" height="1040"/><rect class="frame" x="36" y="32" width="1428" height="970" rx="16"/>
  ${text(750, 92, title, "title", 'text-anchor="middle"')}${text(750, 124, sub, "subtitle", 'text-anchor="middle"')}
  <line x1="380" y1="850" x2="1200" y2="850" stroke="#8aa0a8" stroke-width="2"/><line x1="380" y1="210" x2="380" y2="850" stroke="#8aa0a8" stroke-width="2"/>
  ${[0,0.25,0.5,0.75,1].map(t=>`<line x1="${380+820*t}" y1="210" x2="${380+820*t}" y2="850" stroke="#e4ebef"/><text x="${380+820*t}" y="882" class="tick" text-anchor="middle">${Math.round(max*t).toLocaleString()} ${unit}</text>`).join("")}
  <rect x="1040" y="154" width="18" height="18" fill="#3f7d9c"/><text x="1068" y="168" class="legend">${esc(l.blocking)}</text><rect x="1040" y="184" width="18" height="18" fill="#6e8f4f"/><text x="1068" y="198" class="legend">${esc(l.suspend)}</text>
  ${data.map((row,i)=>barRow(row, i, scale)).join("")}
  ${text(750, 950, `${type === "throughput" ? l.higherBetter : l.lowerBetter} · source: BackendLeaderElectorBenchmark / SuspendBackendLeaderElectorBenchmark`, "footer", 'text-anchor="middle"')}
  </svg>`;
}

function barRow([name, blocking, suspend], i, scale) {
  const y = 230 + i * 82;
  return `${text(350, y+28, name, "axis", 'text-anchor="end"')}<rect x="380" y="${y}" width="${blocking*scale}" height="26" rx="5" fill="#3f7d9c"/><text x="${390+blocking*scale}" y="${y+20}" class="tick">${blocking.toLocaleString()}</text><rect x="380" y="${y+34}" width="${suspend*scale}" height="26" rx="5" fill="#6e8f4f"/><text x="${390+suspend*scale}" y="${y+54}" class="tick">${suspend.toLocaleString()}</text>`;
}

function writeAsset(stem, lang, svg) {
  const svgPath = path.join(outDir, `${stem}-${lang}.svg`);
  const pngPath = path.join(outDir, `${stem}-${lang}.png`);
  fs.writeFileSync(svgPath, svg);
  execFileSync("xmllint", ["--noout", svgPath], { stdio: "inherit" });
  execFileSync("cairosvg", [svgPath, "-o", pngPath, "-s", "2"], { stdio: "inherit" });
}

function backendPickerSvg(lang) {
  const stem = "bluetape4k-leader-part5-backend-picker";
  const canonical = path.join(outDir, `${stem}.svg`);
  const source = fs.readFileSync(fs.existsSync(canonical) ? canonical : path.join(outDir, `${stem}-en.svg`), "utf8");
  const normalized = source.replace(
    /<marker id="arrowHead"[^>]*>/,
    '<marker id="arrowHead" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">',
  );
  if (lang === "en") return normalized;
  const translations = [
    ["Choose the backend by operation shape", "작업 형태에 따라 backend를 선택하세요"],
    ["The API stays similar; lease storage, TTL, failure mode, and observability change.", "API는 비슷하지만 lease 저장소, TTL, failure mode, observability는 달라집니다."],
    ["Start from what you already run", "이미 운영 중인 기반에서 시작"],
    ["Redis first", "Redis 우선"],
    ["Lettuce: lean client path", "Lettuce: 경량 client"],
    ["Redisson: familiar locks", "Redisson: 익숙한 lock"],
    ["TTL + token ownership", "TTL + token 소유권"],
    ["Default when Redis is shared ops.", "Redis 공통 운영 시 기본"],
    ["etcd leases", "etcd lease"],
    ["Native control-plane fit", "control plane에 적합"],
    ["Lease + compare/write", "Lease + compare/write"],
    ["Good reconciler model", "reconciler에 적합"],
    ["Use when etcd owns control state.", "etcd 제어 상태에 사용"],
    ["SQL rows", "SQL 행"],
    ["Rows + conditional update", "행 + 조건부 갱신"],
    ["Audit is easy to inspect", "감사 확인이 쉬움"],
    ["Use when DB ops own the budget.", "DB 운영 시 사용"],
    ["Kubernetes Lease", "Kubernetes Lease"],
    ["Pod/operator lifecycle", "Pod / operator lifecycle"],
    ["K3s benchmark target", "K3s benchmark"],
    ["Best for K8s-native workloads.", "K8s workload에 적합"],
    ["Remaining families are still first-class, but more situational", "나머지 계열도 일급 backend지만 상황에 따라 선택합니다"],
    ["Compare distributed rows with distributed rows. Local/H2 rows are shape checks, not production ranking claims.", "분산 backend끼리 비교하세요. Local/H2 수치는 형태 검증용이며 운영 순위가 아닙니다."],
    ["Operations layer", "운영 계층"],
    ["benchmark caveats", "benchmark 주의사항"],
  ];
  let result = normalized
    .replaceAll('"Architects Daughter", "Comic Sans MS", cursive', '"goorm Sans"')
    .replaceAll('"Comic Mono", "Comic Sans MS", monospace', '"goorm Sans Code"');
  for (const [from, to] of [...translations].sort((a, b) => b[0].length - a[0].length)) {
    result = result.replaceAll(from, to);
  }
  return result;
}

for (const lang of ["en", "ko"]) {
  writeAsset("bluetape4k-leader-overview-01", lang, overviewSvg(lang));
  writeAsset("bluetape4k-leader-examples-erd-01", lang, erdSvg(lang));
  writeAsset("bluetape4k-leader-group-semaphore-01", lang, groupSvg(lang));
  writeAsset("bluetape4k-leader-strategic-election-flow-01", lang, strategicSvg(lang));
  writeAsset("bluetape4k-leader-runifleader-sequence-01", lang, sequenceSvg(lang, "run"));
  writeAsset("bluetape4k-leader-spring-aop-sequence-01", lang, sequenceSvg(lang, "spring"));
  writeAsset("bluetape4k-leader-part5-distributed-throughput-chart-01", lang, chartSvg(lang, "throughput"));
  writeAsset("bluetape4k-leader-part5-distributed-latency-chart-01", lang, chartSvg(lang, "latency"));
  writeAsset("bluetape4k-leader-part5-backend-picker", lang, backendPickerSvg(lang));
  for (const data of exampleData) {
    writeAsset(data[0], lang, exampleSvg(lang, data));
  }
}
