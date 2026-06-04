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
    name: "bluetape4k-javers-part3-command-sequence-01",
    title: "DDD Command Audit Sequence",
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
const NODE_HALF = NODE_WIDTH / 2;

function dot(diagram) {
  const lines = [
    "digraph G {",
    "  graph [rankdir=LR, splines=ortho, nodesep=0.7, ranksep=1.0];",
    "  node [shape=box, style=rounded];",
  ];
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

function node([id, title, body, x, y, fill]) {
  const lines = body.split("\n");
  const h = lines.length > 1 ? 142 : 118;
  const bodyStart = y + (lines.length > 1 ? 66 : 75);
  return `<g id="${id}">
  <rect x="${x}" y="${y}" width="${NODE_WIDTH}" height="${h}" rx="12" fill="${fill}" stroke="#7B8CA3" stroke-width="2"/>
  <text class="nodeTitle" x="${x + NODE_HALF}" y="${y + 42}" text-anchor="middle">${esc(title)}</text>
  ${lines.map((line, index) => `<text class="nodeBody" x="${x + NODE_HALF}" y="${bodyStart + index * 26}" text-anchor="middle">${esc(line)}</text>`).join("\n  ")}
</g>`;
}

function edge(from, to, nodes) {
  const src = nodes.find((n) => n[0] === from);
  const dst = nodes.find((n) => n[0] === to);
  const [sx, sy] = [src[3], src[4]];
  const [dx, dy] = [dst[3], dst[4]];
  const [scx, scy] = [sx + NODE_HALF, sy + 59];
  const [dcx, dcy] = [dx + NODE_HALF, dy + 59];
  if (Math.abs(scx - dcx) >= Math.abs(scy - dcy)) {
    if (scx < dcx) {
      const x1 = sx + NODE_WIDTH;
      const x2 = dx;
      const mid = Math.round((x1 + x2) / 2);
      return `<path class="edge" d="M${x1} ${scy} H${mid} V${dcy} H${x2 - 12}"/>`;
    }
    const x1 = sx;
    const x2 = dx + NODE_WIDTH;
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
  const width = 1290;
  const height = 680;
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
  execFileSync("rsvg-convert", ["-w", "1290", "-h", "680", "-o", pngPath, svgPath]);
}
