import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const out = "public/assets";

const diagrams = [
  {
    name: "bluetape4k-javers-part1-snapshot-flow-01",
    title: "JaVers Snapshot Flow",
    subtitle: "Domain changes become commits, snapshots, and readable diffs",
    nodes: [
      ["domain", "Domain Object", "Order / Product aggregate", 70, 190, "#EAF4FF"],
      ["commit", "JaVers Commit", "author, commit id, properties", 370, 190, "#FFF4D9"],
      ["repo", "Snapshot Repository", "Exposed / Redis / Kafka adapter", 670, 190, "#EAF8EF"],
      ["query", "Query & Diff", "history, latest snapshot, compare", 970, 190, "#F3ECFF"],
    ],
    edges: [
      ["domain", "commit", "commit(author, entity)"],
      ["commit", "repo", "persist CDO snapshots"],
      ["repo", "query", "findSnapshots / compare"],
    ],
    footer: ["bluetape4k-javers adds Kotlin-friendly helpers around the JaVers audit model.", "Use it when object-level history matters more than a hand-written audit table."],
  },
  {
    name: "bluetape4k-javers-part1-product-audit-sequence-01",
    title: "Small Product Audit Sequence",
    subtitle: "The workshop example commits audit history before updating the current row",
    kind: "sequence",
    participants: [
      ["caller", "Caller", 150],
      ["service", "Audit Service", 420],
      ["javers", "JaVers", 660],
      ["repo", "Snapshot Repo", 930],
      ["table", "ProductTable", 1140],
    ],
    messages: [
      ["caller", "service", "1. save(author, product)", 245, "#EAF4FF"],
      ["service", "javers", "2. commit author and object", 310, "#FFF4D9"],
      ["javers", "repo", "3. persist CDO snapshot", 375, "#EAF8EF"],
      ["service", "table", "4. upsert current row", 440, "#F3ECFF"],
      ["caller", "service", "5. later: history or diff query", 505, "#FFF0E8"],
    ],
    footer: ["The current row and the audit history have different responsibilities.", "A small example is enough to see why commit order matters."],
  },
  {
    name: "bluetape4k-javers-part2-backend-selection-01",
    title: "Persistence Role Map",
    subtitle: "Choose the repository by read/write role, not by module name",
    nodes: [
      ["javers", "JaVers Commit", "one audit boundary", 480, 120, "#FFF4D9"],
      ["exposed", "Exposed JDBC", "durable SQL snapshots\ntransaction fit\nqueryable history", 80, 330, "#EAF4FF"],
      ["redis", "Redis", "cache-friendly reads\nLIST / multimap storage\nfast latest-state lookup", 480, 330, "#EAF8EF"],
      ["kafka", "Kafka", "write-only stream\nsend snapshot events\nread methods return empty", 880, 330, "#FFF0E8"],
    ],
    edges: [
      ["javers", "exposed", "durable store"],
      ["javers", "redis", "read-side cache"],
      ["javers", "kafka", "event stream"],
    ],
    footer: ["Kafka is intentionally not a query repository.", "Pair a stream with Exposed or Redis when readers need history."],
  },
  {
    name: "bluetape4k-javers-part2-composition-map-01",
    title: "Persistence Composition Map",
    subtitle: "Current adapters are role-specific; composite fan-out is planned",
    width: 1500,
    height: 760,
    nodes: [
      ["app", "Application Commit", "current API\nregister one repository", 95, 285, "#EAF4FF", 320],
      ["primary", "Primary Store", "Exposed or Redis\nquery snapshots and diffs", 500, 170, "#EAF8EF", 340],
      ["stream", "Event Stream", "Kafka\nwrite-only snapshot events", 500, 435, "#FFF0E8", 340],
      ["future", "Planned Composite", "read from primary store\nfan out writes to streams", 1000, 285, "#FFF4D9", 370],
    ],
    edges: [
      ["app", "primary", "current query store"],
      ["app", "stream", "current stream store"],
      ["primary", "future", "planned read delegate"],
      ["stream", "future", "planned write fan-out"],
    ],
    footer: ["Exposed + Kafka is a useful production shape, but not a first-class adapter yet.", "Until then, keep the article honest: planned capability, not current API."],
  },
  {
    name: "bluetape4k-javers-part3-command-flow-01",
    title: "DDD Command Audit Flow",
    subtitle: "Persist aggregate state, commit to JaVers, then publish the domain event",
    nodes: [
      ["cmd", "Command Handler", "PlaceOrder / MarkPaid", 70, 170, "#EAF4FF"],
      ["agg", "Order Aggregate", "@Id stable identity", 370, 170, "#F3ECFF"],
      ["store", "Exposed Store", "source of truth", 670, 170, "#EAF8EF"],
      ["javers", "JaVers Audit", "snapshot + commit metadata", 970, 170, "#FFF4D9"],
      ["event", "Event Publisher", "Kafka / Spring / NATS", 970, 420, "#FFF0E8"],
      ["read", "Read Model", "Redis order summary", 670, 420, "#E9F7F5"],
    ],
    edges: [
      ["cmd", "agg", "create transition"],
      ["agg", "store", "persist"],
      ["store", "javers", "commit saved aggregate"],
      ["javers", "event", "publish domain event"],
      ["event", "read", "project summary"],
    ],
    footer: ["AggregateRepository.save() orders the command-side work.", "History queries come from JaVers snapshots; read models come from projected events."],
  },
  {
    name: "bluetape4k-javers-part3-manual-vs-javers-01",
    title: "Manual Audit vs JaVers Snapshot Flow",
    subtitle: "Replace repeated audit-table code with object commits and diff queries",
    nodes: [
      ["manual", "Manual Audit Table", "one history schema per entity\ncopy columns by hand\nharder nested-object diff", 90, 180, "#FFECEC"],
      ["service", "Application Service", "save / update / delete", 480, 180, "#EAF4FF"],
      ["javers", "JaVers Snapshot Flow", "commitShallowDelete\nINITIAL / UPDATE / TERMINAL\ncompare(old, new)", 870, 180, "#EAF8EF"],
      ["history", "Reader", "latest snapshot\nstate history\nfield-level diff", 870, 440, "#F3ECFF"],
    ],
    edges: [
      ["service", "manual", "old habit"],
      ["service", "javers", "preferred audit boundary"],
      ["javers", "history", "query and diff"],
    ],
    footer: ["The workshop still persists the product row with Exposed.", "JaVers owns change history and object diff semantics."],
  },
];

const NODE_WIDTH = 260;

function dot(diagram) {
  const lines = [
    "digraph G {",
    "  graph [rankdir=LR, splines=ortho, nodesep=0.7, ranksep=1.0];",
    "  node [shape=box, style=rounded];",
  ];
  if (diagram.kind === "sequence") {
    for (const [id, label] of diagram.participants) {
      lines.push(`  ${id} [label="${label}"];`);
    }
    for (const [from, to, label] of diagram.messages) {
      lines.push(`  ${from} -> ${to} [label="${label}"];`);
    }
    lines.push("}");
    return lines.join("\n") + "\n";
  }
  for (const [id, label] of diagram.nodes) {
    lines.push(`  ${id} [label="${label}"];`);
  }
  for (const [from, to] of diagram.edges) {
    lines.push(`  ${from} -> ${to};`);
  }
  lines.push("}");
  return lines.join("\n") + "\n";
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function node(item) {
  const [id, title, body, x, y, fill] = item;
  const w = nodeWidth(item);
  const lines = body.split("\n");
  const h = lines.length > 1 ? 142 : 118;
  const bodyStart = y + (lines.length > 1 ? 66 : 75);
  return `<g id="${id}">
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="#7B8CA3" stroke-width="2"/>
  <text class="nodeTitle" x="${x + w / 2}" y="${y + 42}" text-anchor="middle">${esc(title)}</text>
  ${lines.map((line, index) => `<text class="nodeBody" x="${x + w / 2}" y="${bodyStart + index * 26}" text-anchor="middle">${esc(line)}</text>`).join("\n  ")}
</g>`;
}

function nodeWidth(item) {
  return item[6] ?? NODE_WIDTH;
}

function edge(from, to, nodes) {
  const src = nodes.find((n) => n[0] === from);
  const dst = nodes.find((n) => n[0] === to);
  const srcWidth = nodeWidth(src);
  const dstWidth = nodeWidth(dst);
  const [sx, sy] = [src[3], src[4]];
  const [dx, dy] = [dst[3], dst[4]];
  const [scx, scy] = [sx + srcWidth / 2, sy + 59];
  const [dcx, dcy] = [dx + dstWidth / 2, dy + 59];
  if (Math.abs(scx - dcx) >= Math.abs(scy - dcy)) {
    if (scx < dcx) {
      const x1 = sx + srcWidth;
      const x2 = dx;
      const mid = Math.round((x1 + x2) / 2);
      return `<path class="edge" d="M${x1} ${scy} H${mid} V${dcy} H${x2 - 12}"/>`;
    }
    const x1 = sx;
    const x2 = dx + dstWidth;
    const mid = Math.round((x1 + x2) / 2);
    return `<path class="edge" d="M${x1} ${scy} H${mid} V${dcy} H${x2 + 12}"/>`;
  }
  if (scy < dcy) {
    const y1 = sy + (src[2].split("\n").length > 1 ? 142 : 118);
    const y2 = dy;
    const mid = Math.round((y1 + y2) / 2);
    return `<path class="edge" d="M${scx} ${y1} V${mid} H${dcx} V${y2 - 12}"/>`;
  }
  const y1 = sy;
  const y2 = dy + (dst[2].split("\n").length > 1 ? 142 : 118);
  const mid = Math.round((y1 + y2) / 2);
  return `<path class="edge" d="M${scx} ${y1} V${mid} H${dcx} V${y2 + 12}"/>`;
}

function svg(diagram) {
  if (diagram.kind === "sequence") {
    return sequenceSvg(diagram);
  }
  const width = diagram.width ?? 1290;
  const height = diagram.height ?? 680;
  const footerY = height - 90;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
    <path d="M 1 1 L 7 4 L 1 7 Z" fill="#496A8F"/>
  </marker>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#22344A" flood-opacity="0.12"/>
  </filter>
  <style>
    .canvas{fill:#F6F9FC}.frame{fill:#FFFFFF;stroke:#D7E2EC;stroke-width:2}
    .title{font-family:"Architects Daughter","Comic Sans MS",cursive;font-size:42px;fill:#22344A;font-weight:400}
    .subtitle,.footer{font-family:"Comic Sans MS","Comic Sans",sans-serif;font-size:17px;fill:#536476;font-weight:400}
    .nodeTitle{font-family:"Architects Daughter","Comic Sans MS",cursive;font-size:25px;fill:#22344A;font-weight:400}
    .nodeBody,.edgeLabel{font-family:"Comic Sans MS","Comic Sans",sans-serif;font-size:16px;fill:#3F5269;font-weight:400}
    .edge{fill:none;stroke:#496A8F;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
    g[id]{filter:url(#shadow)}
  </style>
</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="${width / 2}" y="82" text-anchor="middle">${esc(diagram.title)}</text>
<text class="subtitle" x="${width / 2}" y="116" text-anchor="middle">${esc(diagram.subtitle)}</text>
${diagram.edges.map(([from, to]) => edge(from, to, diagram.nodes)).join("\n")}
${diagram.nodes.map(node).join("\n")}
<rect x="88" y="${footerY}" width="${width - 176}" height="56" rx="12" fill="#F8FBFE" stroke="#D7E2EC"/>
<text class="footer" x="${width / 2}" y="${footerY + 23}" text-anchor="middle">${esc(diagram.footer[0])}</text>
<text class="footer" x="${width / 2}" y="${footerY + 46}" text-anchor="middle">${esc(diagram.footer[1])}</text>
</svg>
`;
}

function sequenceSvg(diagram) {
  const width = 1290;
  const height = 680;
  const lifelineTop = 190;
  const lifelineBottom = 545;
  const participantWidth = 210;
  const participantHeight = 64;
  const participantMap = new Map(diagram.participants.map(([id, label, x]) => [id, { label, x }]));
  const participants = diagram.participants.map(([, label, x]) => `<g>
  <rect class="header" x="${x - participantWidth / 2}" y="135" width="${participantWidth}" height="${participantHeight}" rx="10" fill="#EAF4FF" stroke="#7B8CA3" stroke-width="2"/>
  <text class="participant" x="${x}" y="175" text-anchor="middle">${esc(label)}</text>
  <line class="lifeline" x1="${x}" y1="${lifelineTop + 28}" x2="${x}" y2="${lifelineBottom}"/>
</g>`).join("\n");
  const messages = diagram.messages.map(([from, to, label, y, fill]) => {
    const src = participantMap.get(from);
    const dst = participantMap.get(to);
    const direction = src.x < dst.x ? 1 : -1;
    const x1 = src.x + direction * 38;
    const x2 = dst.x - direction * 38;
    const labelX = Math.round((x1 + x2) / 2);
    const match = label.match(/^(\d+)\.\s+(.*)$/);
    const number = match?.[1] ?? "";
    const detail = match?.[2] ?? label;
    const labelWidth = Math.max(230, Math.min(390, detail.length * 8 + 68));
    const labelY = y - 40;
    return `<g>
  <rect class="label" x="${labelX - labelWidth / 2}" y="${labelY}" width="${labelWidth}" height="30" rx="9" fill="${fill}" stroke="#D7E2EC"/>
  <text class="num" x="${labelX - labelWidth / 2 + 20}" y="${labelY + 20}" text-anchor="middle">${number}</text>
  <text class="detail" x="${labelX + 10}" y="${labelY + 20}" text-anchor="middle">${esc(detail)}</text>
  <path class="call" d="M${x1} ${y} H${x2}"/>
</g>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" viewBox="0 0 10 10">
    <path d="M 0 0 L 10 5 L 0 10 Z" fill="#496A8F"/>
  </marker>
  <style>
    .canvas{fill:#F6F9FC}.frame{fill:#FFFFFF;stroke:#D7E2EC;stroke-width:2}
    .title{font-family:"Architects Daughter","Comic Sans MS",cursive;font-size:42px;fill:#22344A;font-weight:400}
    .subtitle,.footer{font-family:"Comic Sans MS","Comic Sans",sans-serif;font-size:17px;fill:#536476;font-weight:400}
    .participant{font-family:"Architects Daughter","Comic Sans MS",cursive;font-size:21px;fill:#22344A;font-weight:400}
    .detail,.num{font-family:"Comic Sans MS","Comic Sans",sans-serif;font-size:16px;fill:#3F5269;font-weight:400}
    .num{font-weight:700}
    .call{fill:none;stroke:#496A8F;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
    .lifeline{stroke:#91A6BD;stroke-width:2;stroke-dasharray:8 8}
  </style>
</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="${width / 2}" y="82" text-anchor="middle">${esc(diagram.title)}</text>
<text class="subtitle" x="${width / 2}" y="116" text-anchor="middle">${esc(diagram.subtitle)}</text>
${participants}
<rect class="activation" x="412" y="245" width="16" height="300" rx="6" fill="#EAF4FF" stroke="#75A9E8"/>
${messages}
<rect x="88" y="590" width="1114" height="56" rx="12" fill="#F8FBFE" stroke="#D7E2EC"/>
<text class="footer" x="${width / 2}" y="613" text-anchor="middle">${esc(diagram.footer[0])}</text>
<text class="footer" x="${width / 2}" y="636" text-anchor="middle">${esc(diagram.footer[1])}</text>
</svg>
`;
}

const localeTranslations = new Map([
  ["bluetape4k-javers-part1-snapshot-flow-01", [
    ["JaVers Snapshot Flow", "JaVers 스냅샷 흐름"],
    ["Domain changes become commits, snapshots, and readable diffs", "도메인 변경이 커밋, 스냅샷, 읽기 쉬운 차이로 이어집니다"],
    ["Domain Object", "도메인 객체"],
    ["Order / Product aggregate", "Order / Product 애그리거트"],
    ["JaVers Commit", "JaVers 커밋"],
    ["author, commit id, properties", "작성자, 커밋 ID, 속성"],
    ["Snapshot Repository", "스냅샷 저장소"],
    ["Exposed / Redis / Kafka adapter", "Exposed / Redis / Kafka 어댑터"],
    ["Query &amp; Diff", "조회와 차이"],
    ["history, latest snapshot, compare", "이력, 최신 스냅샷, 비교"],
    ["bluetape4k-javers adds Kotlin-friendly helpers around the JaVers audit model.", "bluetape4k-javers는 JaVers 감사 모델에 Kotlin 친화 도우미를 더합니다."],
    ["Use it when object-level history matters more than a hand-written audit table.", "직접 만든 감사 테이블보다 객체 수준 이력이 중요할 때 사용합니다."],
  ]],
  ["bluetape4k-javers-part1-product-audit-sequence-01", [
    ["Small Product Audit Sequence", "작은 상품 감사 동작 순서"],
    ["The workshop example commits audit history before updating the current row", "워크숍 예제는 현재 행을 갱신하기 전에 감사 이력을 커밋합니다"],
    ["Caller", "호출자"],
    ["Audit Service", "감사 서비스"],
    ["Snapshot Repo", "스냅샷 저장소"],
    ["ProductTable", "상품 테이블"],
    ["1. save(author, product)", "1. save(author, product)"],
    ["2. commit author and object", "2. 작성자와 객체 커밋"],
    ["3. persist CDO snapshot", "3. CDO 스냅샷 저장"],
    ["4. upsert current row", "4. 현재 행 저장 또는 갱신"],
    ["5. later: history or diff query", "5. 이후 이력 또는 차이 조회"],
    ["commit author and object", "작성자와 객체 커밋"],
    ["persist CDO snapshot", "CDO 스냅샷 저장"],
    ["upsert current row", "현재 행 저장 또는 갱신"],
    ["later: history or diff query", "이후 이력 또는 차이 조회"],
    ["The current row and the audit history have different responsibilities.", "현재 행과 감사 이력은 서로 다른 책임을 가집니다."],
    ["A small example is enough to see why commit order matters.", "작은 예제만으로도 커밋 순서가 중요한 이유를 확인할 수 있습니다."],
  ]],
  ["bluetape4k-javers-part2-backend-selection-01", [
    ["Persistence Role Map", "영속성 역할 구성"],
    ["Choose the repository by read/write role, not by module name", "모듈 이름이 아니라 읽기/쓰기 역할에 따라 저장소를 고릅니다"],
    ["JaVers Commit", "JaVers 커밋"],
    ["one audit boundary", "하나의 감사 경계"],
    ["durable SQL snapshots", "내구성 있는 SQL 스냅샷"],
    ["transaction fit", "트랜잭션 연계"],
    ["queryable history", "조회 가능한 이력"],
    ["cache-friendly reads", "캐시 친화적 읽기"],
    ["LIST / multimap storage", "LIST / multimap 저장"],
    ["fast latest-state lookup", "빠른 최신 상태 조회"],
    ["write-only stream", "쓰기 전용 스트림"],
    ["send snapshot events", "스냅샷 이벤트 전송"],
    ["read methods return empty", "읽기 메서드는 빈 결과 반환"],
    ["Kafka is intentionally not a query repository.", "Kafka는 의도적으로 조회 저장소가 아닙니다."],
    ["Pair a stream with Exposed or Redis when readers need history.", "읽는 쪽에 이력이 필요하면 스트림을 Exposed 또는 Redis와 조합합니다."],
  ]],
  ["bluetape4k-javers-part2-composition-map-01", [
    ["Persistence Composition Map", "영속성 조합 구성"],
    ["Current adapters are role-specific; composite fan-out is planned", "현재 어댑터는 역할별이며 복합 팬아웃은 계획 단계입니다"],
    ["Application Commit", "애플리케이션 커밋"],
    ["current API", "현재 API"],
    ["register one repository", "저장소 하나 등록"],
    ["Primary Store", "주 저장소"],
    ["Exposed or Redis", "Exposed 또는 Redis"],
    ["query snapshots and diffs", "스냅샷과 차이 조회"],
    ["Event Stream", "이벤트 스트림"],
    ["write-only snapshot events", "쓰기 전용 스냅샷 이벤트"],
    ["Planned Composite", "계획된 복합 저장소"],
    ["read from primary store", "주 저장소에서 읽기"],
    ["fan out writes to streams", "스트림으로 쓰기 팬아웃"],
    ["Exposed + Kafka is a useful production shape, but not a first-class adapter yet.", "Exposed + Kafka는 유용한 운영 구성이지만 아직 일급 어댑터는 아닙니다."],
    ["Until then, keep the article honest: planned capability, not current API.", "그전까지는 현재 API가 아니라 계획된 기능임을 분명히 합니다."],
  ]],
  ["bluetape4k-javers-part3-command-flow-01", [
    ["DDD Command Audit Flow", "DDD 명령 감사 흐름"],
    ["Persist aggregate state, commit to JaVers, then publish the domain event", "애그리거트 상태를 저장하고 JaVers에 커밋한 다음 도메인 이벤트를 발행합니다"],
    ["Command Handler", "명령 처리기"],
    ["Order Aggregate", "Order 애그리거트"],
    ["@Id stable identity", "@Id 안정 식별자"],
    ["Exposed Store", "Exposed 저장소"],
    ["source of truth", "데이터 기준점"],
    ["JaVers Audit", "JaVers 감사"],
    ["snapshot + commit metadata", "스냅샷 + 커밋 메타데이터"],
    ["Event Publisher", "이벤트 발행기"],
    ["Read Model", "읽기 모델"],
    ["Redis order summary", "Redis 주문 요약"],
    ["AggregateRepository.save() orders the command-side work.", "AggregateRepository.save()가 명령 측 작업 순서를 정합니다."],
    ["History queries come from JaVers snapshots; read models come from projected events.", "이력 조회는 JaVers 스냅샷에서, 읽기 모델은 투영된 이벤트에서 가져옵니다."],
  ]],
  ["bluetape4k-javers-part3-manual-vs-javers-01", [
    ["Manual Audit vs JaVers Snapshot Flow", "수동 감사와 JaVers 스냅샷 흐름 비교"],
    ["Replace repeated audit-table code with object commits and diff queries", "반복되는 감사 테이블 코드를 객체 커밋과 차이 조회로 바꿉니다"],
    ["Manual Audit Table", "수동 감사 테이블"],
    ["one history schema per entity", "엔티티마다 이력 스키마"],
    ["copy columns by hand", "컬럼을 직접 복사"],
    ["harder nested-object diff", "중첩 객체 차이가 어려움"],
    ["Application Service", "애플리케이션 서비스"],
    ["save / update / delete", "저장 / 갱신 / 삭제"],
    ["JaVers Snapshot Flow", "JaVers 스냅샷 흐름"],
    ["Reader", "조회자"],
    ["latest snapshot", "최신 스냅샷"],
    ["state history", "상태 이력"],
    ["field-level diff", "필드 수준 차이"],
    ["The workshop still persists the product row with Exposed.", "워크숍은 상품 행을 계속 Exposed로 저장합니다."],
    ["JaVers owns change history and object diff semantics.", "JaVers는 변경 이력과 객체 차이 의미를 담당합니다."],
  ]],
  ["bluetape4k-javers-part3-example-cqrs-flow-01", [
    ["javers-exposed-ddd CQRS flow", "javers-exposed-ddd CQRS 흐름"],
    ["Command writes to SQL snapshots, Kafka events, and the Redis projection.", "명령이 SQL 스냅샷, Kafka 이벤트, Redis 투영을 기록합니다."],
    ["Command side", "명령 측"],
    ["Exposed order table", "Exposed 주문 테이블"],
    ["source of truth", "데이터 기준점"],
    ["JaVers snapshots", "JaVers 스냅샷"],
    ["audit history", "감사 이력"],
    ["Kafka order events", "Kafka 주문 이벤트"],
    ["domain event stream", "도메인 이벤트 스트림"],
    ["Projection consumer", "투영 소비자"],
    ["poll and apply", "폴링 후 반영"],
    ["Redis read model", "Redis 읽기 모델"],
    ["Read API", "읽기 API"],
  ]],
  ["bluetape4k-javers-part3-example-sequence-01", [
    ["javers-exposed-ddd command and projection sequence", "javers-exposed-ddd 명령과 투영 동작 순서"],
    ["Preserves the README Mermaid flow: command persistence, JaVers commit, Kafka event, Redis projection, and read lookup.", "README Mermaid 흐름인 명령 저장, JaVers 커밋, Kafka 이벤트, Redis 투영, 읽기 조회를 보존합니다."],
    ["Client", "클라이언트"],
    ["OrderCommandHandler", "명령 처리기"],
    ["Exposed order table", "Exposed 주문 테이블"],
    ["order table", "주문 테이블"],
    ["JaVers commit", "JaVers 커밋"],
    ["Kafka topic", "Kafka 토픽"],
    ["Projection", "투영"],
    ["event consumer", "이벤트 소비자"],
    ["Redis summary", "Redis 요약"],
    ["insert/update Order", "Order 저장/갱신"],
    ["poll event", "이벤트 폴링"],
    ["upsert summary", "요약 저장 또는 갱신"],
  ]],
]);

function normalizeFonts(source, locale) {
  const normalized = source.replaceAll('markerUnits="strokeWidth"', 'markerUnits="userSpaceOnUse"');
  if (locale === "ko") {
    return normalized
      .replaceAll('"Architects Daughter","Comic Sans MS",cursive', '"goorm Sans"')
      .replaceAll('"Architects Daughter","Comic Sans MS","Comic Sans",cursive', '"goorm Sans"')
      .replaceAll('"Comic Sans MS","Comic Sans",sans-serif', '"goorm Sans Code"')
      .replaceAll('"Comic Sans MS","Comic Sans","Comic Neue",Arial,sans-serif', '"goorm Sans Code"')
      .replaceAll('"Comic Mono"', '"goorm Sans Code"')
      .replaceAll("Architects Daughter", "goorm Sans")
      .replaceAll("Comic Mono", "goorm Sans Code");
  }
  return normalized
    .replaceAll('"Architects Daughter","Comic Sans MS",cursive', '"Architects Daughter"')
    .replaceAll('"Architects Daughter","Comic Sans MS","Comic Sans",cursive', '"Architects Daughter"')
    .replaceAll('"Comic Sans MS","Comic Sans",sans-serif', '"Comic Mono"')
    .replaceAll('"Comic Sans MS","Comic Sans","Comic Neue",Arial,sans-serif', '"Comic Mono"')
    .replaceAll("markerUnits=\"strokeWidth\"", "markerUnits=\"userSpaceOnUse\"");
}

function normalizeStructure(name, source) {
  if (name === "bluetape4k-javers-part2-backend-selection-01") {
    return source
      .replace('d="M480 179 H410 V389 H352"', 'd="M480 179 H420 Q410 179 410 189 V379 Q410 389 400 389 H352"')
      .replace('d="M740 179 H810 V389 H868"', 'd="M740 179 H800 Q810 179 810 189 V379 Q810 389 820 389 H868"');
  }
  if (name === "bluetape4k-javers-part2-composition-map-01") {
    return source
      .replace('d="M415 344 H458 V229 H488"', 'd="M255 285 V260 Q255 250 265 250 H488"')
      .replace('d="M415 344 H458 V494 H488"', 'd="M415 344 H448 Q458 344 458 354 V484 Q458 494 468 494 H488"')
      .replace('d="M840 229 H920 V344 H988"', 'd="M840 229 H1175 Q1185 229 1185 239 V273"')
      .replace('d="M840 494 H920 V344 H988"', 'd="M840 494 H910 Q920 494 920 484 V354 Q920 344 930 344 H988"');
  }
  if (name === "bluetape4k-javers-part3-example-cqrs-flow-01") {
    return source
      .replace('.line{', '.edge{')
      .replaceAll('class="line"', 'class="edge"')
      .replaceAll('class="line-event"', 'class="edge line-event"')
      .replaceAll('class="line-query"', 'class="edge line-query"')
      .replace('d="M288 295 H340 V194 H390"', 'd="M188 252 V204 Q188 194 198 194 H390"')
      .replace('d="M188 252 V194 H390"', 'd="M188 252 V204 Q188 194 198 194 H390"')
      .replace('d="M288 295 H340 V458 H390"', 'd="M188 338 V448 Q188 458 198 458 H390"')
      .replace('d="M188 338 V458 H390"', 'd="M188 338 V448 Q188 458 198 458 H390"')
      .replace('d="M988 458 H1035 V326 H1080"', 'd="M988 458 H1025 Q1035 458 1035 448 V360 Q1035 350 1045 350 H1068"')
      .replace('d="M868 414 V390 H1195 V382"', 'd="M988 458 H1025 Q1035 458 1035 448 V360 Q1035 350 1045 350 H1068"')
      .replace('d="M988 194 H1035 V326 H1080"', 'd="M988 194 H1025 Q1035 194 1035 204 V316 Q1035 326 1045 326 H1068"');
  }
  if (name === "bluetape4k-javers-part3-example-sequence-01") {
    let result = source
      .replace(
        /<marker id="arrow"[^>]*><path[^>]*><\/marker>/,
        '<marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" viewBox="0 0 10 10"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#56708C"/></marker>',
      )
      .replace('.line{', '.call{')
      .replace('.dash{', '.return{')
      .replace('.actor{', '.participant{')
      .replace('.box{', '.header{')
      .replace('.label-bg{', '.label{')
      .replaceAll('class="line"', 'class="call"')
      .replaceAll('class="dash"', 'class="return"')
      .replaceAll('class="box"', 'class="header"')
      .replaceAll('class="actor"', 'class="participant"')
      .replaceAll('class="label-bg"', 'class="label"')
      .replace(
        '<rect class="activation" x="337" y="250" width="16" height="360" rx="6" fill="#EAF4FF" stroke="#75A9E8"/>',
        '<rect class="activation" x="337" y="265" width="16" height="345" rx="6" fill="#EAF4FF" stroke="#75A9E8"/>',
      )
      .replace(
        /(<rect class="activation" x="337" y="265" width="16" height="345" rx="6" fill="#EAF4FF" stroke="#75A9E8"\/>){2,}/,
        '<rect class="activation" x="337" y="265" width="16" height="345" rx="6" fill="#EAF4FF" stroke="#75A9E8"/>',
      )
      .replace('d="M140 610 H1330 V640 H1470"', 'd="M140 610 H1320 Q1330 610 1330 620 V630 Q1330 640 1340 640 H1470"');
    if (!result.includes('class="activation"')) {
      result = result.replace(
        '<path class="life" d="M140 210 V675"/>',
        '<rect class="activation" x="337" y="265" width="16" height="345" rx="6" fill="#EAF4FF" stroke="#75A9E8"/><path class="life" d="M140 210 V675"/>',
      );
    }
    return result;
  }
  return source;
}

function addSequenceNumbers(source) {
  if (source.includes('class="num"')) return source;
  let number = 0;
  return source.replace(
    /(<rect class="label" x="([0-9.]+)" y="([0-9.]+)" width="[^"]+" height="[^"]+" rx="[^"]+"\/>)/g,
    (match, rect, x, y) => {
      number += 1;
      return `${rect}<text class="num" x="${Number(x) + 16}" y="${Number(y) + 17}" text-anchor="middle">${number}</text>`;
    },
  );
}

function widenSequenceLabels(name, source) {
  if (name !== "bluetape4k-javers-part3-example-sequence-01") return source;
  const layouts = new Map([
    ["1", [168, 168]],
    ["2", [382, 180]],
    ["3", [510, 140]],
    ["4", [625, 145]],
    ["5", [1070, 165]],
    ["6", [1275, 180]],
    ["7", [590, 190]],
    ["8", [720, 170]],
  ]);
  return source.replace(
    /<rect class="label" x="[^"]+" y="([^"]+)" width="[^"]+" height="24" rx="8"\/><text class="num" x="[^"]+" y="([^"]+)" text-anchor="middle">(\d+)<\/text><text class="msg" x="[^"]+" y="[^"]+" text-anchor="middle">([^<]*)<\/text>/g,
    (match, rectY, textY, number, message) => {
      const [x, width] = layouts.get(number);
      return `<rect class="label" x="${x}" y="${rectY}" width="${width}" height="24" rx="8"/><text class="num" x="${x + 18}" y="${textY}" text-anchor="middle">${number}</text><text class="msg" x="${x + width / 2 + 8}" y="${textY}" text-anchor="middle">${message}</text>`;
    },
  );
}

function localize(source, translations) {
  let result = source;
  for (const [from, to] of [...translations].sort((a, b) => b[0].length - a[0].length)) {
    result = result.replaceAll(from, to);
  }
  return result;
}

for (const diagram of diagrams) {
  const dotPath = `${out}/${diagram.name}.dot`;
  const svgPath = `${out}/${diagram.name}.svg`;
  writeFileSync(dotPath, dot(diagram));
  writeFileSync(svgPath, svg(diagram));
  writeFileSync(`${out}/${diagram.name}.plain`, execFileSync("dot", ["-Tplain", dotPath], { encoding: "utf8" }));
}

for (const [name, translations] of localeTranslations) {
  const canonicalPath = `${out}/${name}.svg`;
  const sourcePath = existsSync(canonicalPath) ? canonicalPath : `${out}/${name}-en.svg`;
  const source = widenSequenceLabels(name, addSequenceNumbers(normalizeStructure(name, readFileSync(sourcePath, "utf8"))));
  const enPath = `${out}/${name}-en.svg`;
  const koPath = `${out}/${name}-ko.svg`;
  writeFileSync(enPath, normalizeFonts(source, "en"));
  writeFileSync(koPath, normalizeFonts(localize(source, translations), "ko"));
  for (const svgPath of [enPath, koPath]) {
    execFileSync("xmllint", ["--noout", svgPath]);
    execFileSync("cairosvg", [svgPath, "-o", svgPath.replace(/\.svg$/, ".png"), "-s", "2"]);
  }
  rmSync(canonicalPath, { force: true });
  rmSync(`${out}/${name}.png`, { force: true });
}
