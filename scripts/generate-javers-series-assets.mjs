import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

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
    name: "bluetape4k-javers-part3-command-sequence-01",
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
  <rect x="${x - participantWidth / 2}" y="135" width="${participantWidth}" height="${participantHeight}" rx="10" fill="#EAF4FF" stroke="#7B8CA3" stroke-width="2"/>
  <text class="nodeTitle" x="${x}" y="175" text-anchor="middle">${esc(label)}</text>
  <line class="lifeline" x1="${x}" y1="${lifelineTop + 28}" x2="${x}" y2="${lifelineBottom}"/>
</g>`).join("\n");
  const messages = diagram.messages.map(([from, to, label, y, fill]) => {
    const src = participantMap.get(from);
    const dst = participantMap.get(to);
    const direction = src.x < dst.x ? 1 : -1;
    const x1 = src.x + direction * 38;
    const x2 = dst.x - direction * 38;
    const labelX = Math.round((x1 + x2) / 2);
    const labelWidth = Math.max(230, Math.min(360, label.length * 8 + 40));
    const labelY = y - 40;
    return `<g>
  <rect x="${labelX - labelWidth / 2}" y="${labelY}" width="${labelWidth}" height="30" rx="9" fill="${fill}" stroke="#D7E2EC"/>
  <text class="nodeBody" x="${labelX}" y="${labelY + 20}" text-anchor="middle">${esc(label)}</text>
  <path class="edge" d="M${x1} ${y} H${x2}"/>
</g>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
    <path d="M 1 1 L 7 4 L 1 7 Z" fill="#496A8F"/>
  </marker>
  <style>
    .canvas{fill:#F6F9FC}.frame{fill:#FFFFFF;stroke:#D7E2EC;stroke-width:2}
    .title{font-family:"Architects Daughter","Comic Sans MS",cursive;font-size:42px;fill:#22344A;font-weight:400}
    .subtitle,.footer{font-family:"Comic Sans MS","Comic Sans",sans-serif;font-size:17px;fill:#536476;font-weight:400}
    .nodeTitle{font-family:"Architects Daughter","Comic Sans MS",cursive;font-size:21px;fill:#22344A;font-weight:400}
    .nodeBody{font-family:"Comic Sans MS","Comic Sans",sans-serif;font-size:16px;fill:#3F5269;font-weight:400}
    .edge{fill:none;stroke:#496A8F;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
    .lifeline{stroke:#91A6BD;stroke-width:2;stroke-dasharray:8 8}
  </style>
</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="${width / 2}" y="82" text-anchor="middle">${esc(diagram.title)}</text>
<text class="subtitle" x="${width / 2}" y="116" text-anchor="middle">${esc(diagram.subtitle)}</text>
${participants}
${messages}
<rect x="88" y="590" width="1114" height="56" rx="12" fill="#F8FBFE" stroke="#D7E2EC"/>
<text class="footer" x="${width / 2}" y="613" text-anchor="middle">${esc(diagram.footer[0])}</text>
<text class="footer" x="${width / 2}" y="636" text-anchor="middle">${esc(diagram.footer[1])}</text>
</svg>
`;
}

for (const diagram of diagrams) {
  const dotPath = `${out}/${diagram.name}.dot`;
  const svgPath = `${out}/${diagram.name}.svg`;
  const pngPath = `${out}/${diagram.name}.png`;
  writeFileSync(dotPath, dot(diagram));
  writeFileSync(svgPath, svg(diagram));
  writeFileSync(`${out}/${diagram.name}.plain`, execFileSync("dot", ["-Tplain", dotPath], { encoding: "utf8" }));
  execFileSync("rsvg-convert", [
    "-w",
    String(diagram.width ?? 1290),
    "-h",
    String(diagram.height ?? 680),
    "-o",
    pngPath,
    svgPath,
  ]);
}
