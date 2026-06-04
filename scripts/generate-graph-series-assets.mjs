import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const out = "public/assets";

const colors = {
  blue: "#EAF4FF",
  green: "#EAF8EF",
  amber: "#FFF4D9",
  pink: "#FFF0F1",
  teal: "#E9F7F5",
  lavender: "#F3ECFF",
  orange: "#FFF0E8",
};

const diagrams = [
  {
    name: "bluetape4k-graph-part1-backend-selection-01",
    title: "Graph Storage Selection Map",
    subtitle: "Choose graph storage by workload shape, operations fit, and test strategy",
    kind: "selection",
    width: 2280,
    height: 840,
    nodes: [
      ["app", "Application Graph Workload", "paths, neighbors, rankings\nbulk writes or test fixtures", 910, 165, colors.blue, 460],
      ["neo4j", "Neo4j", "default production choice\nmature operations\nCypher driver", 110, 465, colors.green, 330],
      ["memgraph", "Memgraph", "low-latency local graph\nwrite-heavy candidates\nNeo4j protocol", 520, 465, colors.teal, 330],
      ["age", "Apache AGE", "PostgreSQL-centered teams\nCypher over SQL\nconsolidation over speed", 930, 465, colors.amber, 330],
      ["tinker", "TinkerGraph", "unit tests and examples\nin-memory fixtures\nno Docker required", 1340, 465, colors.lavender, 330],
      ["falkor", "FalkorDB", "Redis-aligned graph service\nsimple read-mostly workloads\nvalidate write cost", 1750, 465, colors.orange, 330],
    ],
    edges: [
      ["app", "neo4j"],
      ["app", "memgraph"],
      ["app", "age"],
      ["app", "tinker"],
      ["app", "falkor"],
    ],
    footer: [
      "bluetape4k-graph keeps one Kotlin API while preserving graph-storage tradeoffs.",
      "Start with TinkerGraph for tests, then measure Neo4j, Memgraph, AGE, or FalkorDB with your workload.",
    ],
  },
  {
    name: "bluetape4k-graph-part1-module-layering-01",
    title: "bluetape4k-graph Module Layers",
    subtitle: "Core contracts stay small; adapters, I/O, and framework modules compose around them",
    width: 1840,
    height: 1000,
    nodes: [
      ["apps", "Apps & Workshop Examples", "abuser detection, recommendation\nknowledge graph, social network", 110, 220, colors.blue, 390],
      ["framework", "Framework Adapters", "Spring Boot 4 auto-configuration\nKtor plugin lifecycle", 725, 220, colors.green, 390],
      ["io", "Graph I/O", "CSV, NDJSON, GraphML\nOkIO decorator paths", 1340, 220, colors.amber, 390],
      ["core", "graph-core", "GraphOperations, schema DSL\nmerge, transaction, algorithms", 725, 475, colors.lavender, 390],
      ["storage", "Graph Storage Adapters", "AGE, Neo4j, Memgraph\nTinkerPop, FalkorDB", 725, 710, colors.teal, 390],
    ],
    edges: [
      ["apps", "framework"],
      ["framework", "core"],
      ["io", "core"],
      ["core", "storage"],
    ],
    footer: [
      "The common API is the center; framework modules and I/O modules are integration helpers.",
      "Native graph-storage features remain available when a query should not be forced through the portable layer.",
    ],
  },
  {
    name: "bluetape4k-graph-part2-core-api-flow-01",
    title: "Core API Execution Flow",
    subtitle: "Services depend on graph-core, then choose sync, virtual-thread, or suspend execution",
    width: 1700,
    height: 780,
    nodes: [
      ["service", "Domain Service", "use graph terms in service code\nkeep storage choice outside", 80, 295, colors.blue, 320],
      ["ops", "GraphOperations", "session + vertex + edge\ntraversal + algorithms", 480, 185, colors.green, 320],
      ["schema", "Schema DSL", "VertexLabel / EdgeLabel\nproperties and constraints", 480, 405, colors.amber, 320],
      ["execution", "Execution Models", "sync API\nvirtual-thread facade\nsuspend API", 880, 295, colors.lavender, 320],
      ["adapter", "Graph Storage Adapter", "Neo4j, Memgraph, AGE\nTinkerGraph, FalkorDB", 1260, 295, colors.teal, 340],
    ],
    edges: [
      ["service", "ops"],
      ["service", "schema"],
      ["ops", "execution"],
      ["schema", "execution"],
      ["execution", "adapter"],
    ],
    footer: [
      "Schema, merge, and transaction features open only when the chosen graph storage can honor the contract.",
      "Unsupported operations fail fast instead of pretending that weaker semantics are safe.",
    ],
  },
  {
    name: "bluetape4k-graph-part2-api-model-benchmark-01",
    title: "API Model Benchmark Snapshot",
    subtitle: "BFS latency on TinkerGraph, microseconds per operation, lower is better",
    kind: "chart",
    width: 1500,
    height: 780,
    unit: "us/op",
    direction: "log scale, lower is better",
    bars: [
      ["BFS depth=5 Sync", 4.724, colors.blue],
      ["BFS depth=5 VT", 18.668, colors.green],
      ["BFS depth=5 Coroutine", 20.244, colors.amber],
      ["100-way launch Coroutine", 5.916, colors.orange],
      ["100-way launch VT", 51.042, colors.lavender],
      ["BFS 100-way VT", 240.903, colors.teal],
      ["BFS 100-way Coroutine", 279.828, colors.pink],
    ],
    footer: [
      "Source: docs/benchmark/2026-05-21-api-model-results.md, JMH smoke run on TinkerGraph.",
      "Read the Error column in the article before treating this as release-grade ranking.",
    ],
  },
  {
    name: "bluetape4k-graph-part2-transaction-sequence-01",
    title: "Transaction + Batch Write Sequence",
    subtitle: "A service creates vertices, creates edges, then queries graph relationships through one facade",
    kind: "sequence",
    participants: [
      ["service", "Service", 145],
      ["ops", "GraphOperations", 420],
      ["tx", "Transaction Scope", 700],
      ["adapter", "Storage Adapter", 985],
      ["db", "Graph DB", 1235],
    ],
    messages: [
      ["service", "ops", "1. transaction { ... }", 250, colors.blue],
      ["ops", "tx", "2. expose CRUD-only scope", 315, colors.green],
      ["tx", "adapter", "3. createVertices batch", 380, colors.amber],
      ["tx", "adapter", "4. createEdges batch", 445, colors.lavender],
      ["adapter", "db", "5. commit or rollback", 510, colors.teal],
      ["service", "ops", "6. neighbors / shortestPath", 575, colors.orange],
    ],
    footer: [
      "Transaction blocks avoid lifecycle commands so DDL and auto-commit rules stay storage-specific.",
      "Batch defaults are portable; adapters can override them for native all-or-fail behavior.",
    ],
  },
  {
    name: "bluetape4k-graph-part3-io-pipeline-01",
    title: "Graph I/O Pipeline",
    subtitle: "Move graph data through format adapters without coupling services to a single file shape",
    width: 1800,
    height: 820,
    nodes: [
      ["graph", "GraphOperations", "read vertices and edges\nwrite imported batches", 90, 230, colors.blue, 320],
      ["core", "graph-io-core", "bulk contracts\nexport/import options", 480, 230, colors.green, 320],
      ["formats", "Data Formats", "CSV\nNDJSON, GraphML", 870, 230, colors.amber, 340],
      ["uses", "Operational Uses", "migration, snapshots\nanalytics, reproducible tests", 1300, 230, colors.lavender, 360],
      ["bench", "Benchmark Gate", "mean latency numbers\nread caveats before claims", 480, 500, colors.teal, 360],
      ["decorators", "I/O Decorators", "OkIO, buffering\ncompression, async paths", 870, 500, colors.orange, 340],
    ],
    edges: [
      ["graph", "core"],
      ["core", "formats"],
      ["formats", "uses"],
      ["core", "bench"],
      ["formats", "decorators"],
      ["decorators", "uses"],
    ],
    footer: [
      "CSV is easy to inspect, NDJSON fits service interchange, GraphML helps interoperability.",
      "Benchmark charts summarize current files; they are not a promise for every graph shape.",
    ],
  },
  {
    name: "bluetape4k-graph-part3-benchmark-summary-01",
    title: "Graph I/O Quick-Run Latency",
    subtitle: "Small graph export/import benchmark, milliseconds per operation, lower is better",
    kind: "chart",
    width: 1460,
    height: 820,
    unit: "ms/op",
    direction: "log scale, lower is better",
    bars: [
      ["CSV export", 1.017, colors.blue],
      ["Jackson3 export", 1.275, colors.green],
      ["GraphML export", 2.582, colors.amber],
      ["CSV import", 17.854, colors.blue],
      ["Jackson3 import", 19.852, colors.green],
      ["GraphML import", 21.111, colors.amber],
      ["GraphML before caching", 413, colors.pink],
    ],
    footer: [
      "Source: docs/benchmark/2026-04-18-graph-io-bulk-results.md, quick-run @Fork(0).",
      "Use this smoke result for regression checks; run longer raw-JSON benchmarks for variance.",
    ],
  },
  {
    name: "bluetape4k-graph-part4-abuser-erd-01",
    title: "Abuser Detection Entity Graph",
    subtitle: "Users connect to identifiers; shared identifiers become review evidence",
    kind: "erd",
    width: 1800,
    height: 860,
    tables: [
      ["user", "User", ["userId", "email", "risk fields"], 130, 210, colors.blue, 270],
      ["device", "Device", ["deviceId", "fingerprint"], 520, 160, colors.amber, 270],
      ["ip", "IpAddress", ["address", "network"], 520, 360, colors.green, 270],
      ["phone", "PhoneNumber", ["phoneHash"], 910, 160, colors.lavender, 270],
      ["payment", "PaymentMethod", ["paymentToken", "provider"], 910, 360, colors.orange, 270],
      ["referral", "User", ["referrer user"], 1300, 260, colors.teal, 270],
    ],
    relations: [
      ["user", "device", "USES_DEVICE"],
      ["user", "ip", "USES_IP"],
      ["user", "phone", "HAS_PHONE"],
      ["user", "payment", "USES_PAYMENT"],
      ["user", "referral", "REFERRED_BY"],
    ],
    footer: [
      "The graph stores hashes and safe tokens, not raw phone numbers or card data.",
      "The same identifier vertex can point back to multiple users, which is the cluster signal.",
    ],
  },
  {
    name: "bluetape4k-graph-part4-recommendation-erd-01",
    title: "Recommendation Entity Graph",
    subtitle: "Product candidates and follow candidates come from two simple edge families",
    kind: "erd",
    width: 1600,
    height: 780,
    tables: [
      ["user", "User", ["userId", "name"], 150, 260, colors.blue, 280],
      ["product", "Product", ["productId", "name", "category"], 660, 160, colors.green, 280],
      ["followee", "User", ["followee user"], 660, 420, colors.lavender, 280],
      ["candidate", "Candidate", ["score", "reason"], 1140, 290, colors.amber, 280],
    ],
    relations: [
      ["user", "product", "PURCHASED"],
      ["user", "followee", "FOLLOWS"],
      ["product", "candidate", "co-buyer score"],
      ["followee", "candidate", "mutual follows"],
    ],
    footer: [
      "The example separates candidate generation from scoring so service rules remain readable.",
      "Large production graphs should replace repeated traversal with native Cypher or Gremlin.",
    ],
  },
  {
    name: "bluetape4k-graph-part4-knowledge-erd-01",
    title: "Knowledge Graph Entity Graph",
    subtitle: "Documents mention entities; entities relate to concepts and to each other",
    kind: "erd",
    width: 1600,
    height: 780,
    tables: [
      ["document", "Document", ["documentId", "title", "source"], 130, 300, colors.blue, 290],
      ["entity", "Entity", ["entityId", "name", "type"], 610, 190, colors.green, 290],
      ["concept", "Concept", ["conceptId", "name"], 1090, 190, colors.amber, 290],
      ["related", "Entity", ["related entity"], 1090, 430, colors.lavender, 290],
    ],
    relations: [
      ["document", "entity", "MENTIONS"],
      ["entity", "concept", "IS_A"],
      ["entity", "related", "RELATED_TO"],
    ],
    footer: [
      "Full-text or vector search finds candidates; graph paths explain why entities are connected.",
      "Depth limits keep semantic traversal useful instead of turning it into an unbounded crawl.",
    ],
  },
  {
    name: "bluetape4k-graph-part4-social-erd-01",
    title: "Social Network Entity Graph",
    subtitle: "People connect to people and companies through direction-aware relationships",
    kind: "erd",
    width: 1600,
    height: 780,
    tables: [
      ["person", "Person", ["personId", "name", "location"], 160, 270, colors.blue, 290],
      ["friend", "Person", ["known person"], 650, 150, colors.green, 290],
      ["follow", "Person", ["followee"], 650, 420, colors.lavender, 290],
      ["company", "Company", ["companyId", "name"], 1120, 270, colors.amber, 290],
    ],
    relations: [
      ["person", "friend", "KNOWS"],
      ["person", "follow", "FOLLOWS"],
      ["person", "company", "WORKS_AT"],
      ["friend", "company", "colleague path"],
    ],
    footer: [
      "Direction and depth decide whether a path becomes a recommendation or only an explanation.",
      "Exclude self and already-connected people before turning traversal results into candidates.",
    ],
  },
  {
    name: "bluetape4k-graph-part4-abuser-identity-flow-01",
    title: "Abuser Detection Identity Flow",
    subtitle: "Start from one user, traverse shared identifiers, then rank suspicious clusters",
    width: 1500,
    height: 780,
    nodes: [
      ["seed", "Seed User", "userId from login, order,\nor moderation event", 90, 310, colors.blue, 320],
      ["ids", "Shared Identifiers", "device, IP, phone hash\npayment token, referral", 490, 185, colors.amber, 340],
      ["users", "Related Users", "reverse traversal from identifiers\nexclude seed user", 900, 185, colors.green, 340],
      ["paths", "Suspicion Evidence", "explain edge paths\ncycle detection", 490, 455, colors.lavender, 340],
      ["rank", "Risk Ranking", "PageRank topK\ncluster review queue", 900, 455, colors.teal, 340],
    ],
    edges: [
      ["seed", "ids"],
      ["ids", "users"],
      ["seed", "paths"],
      ["paths", "rank"],
      ["users", "rank"],
    ],
    footer: [
      "The workshop keeps raw phone and card data out of the graph: use hashes and PCI-safe payment tokens.",
      "The example teaches traversal shape first; production systems still need scoring and operational guardrails.",
    ],
  },
  {
    name: "bluetape4k-graph-part4-recommendation-flow-01",
    title: "Recommendation Example Flow",
    subtitle: "Find co-buyers and friends-of-friends, then sort candidates by graph evidence",
    width: 1700,
    height: 780,
    nodes: [
      ["user", "Seed User", "Alice or current viewer", 90, 305, colors.blue, 300],
      ["purchased", "Purchased Products", "products already bought\nexclude from candidates", 445, 175, colors.green, 320],
      ["cobuyers", "Co-buyers", "other users who bought\nseed products", 820, 175, colors.amber, 320],
      ["products", "Product Candidates", "score by distinct co-buyers\nsort score desc", 1195, 175, colors.teal, 320],
      ["follows", "Follow Graph", "direct follows\n2-hop candidates", 445, 455, colors.lavender, 320],
      ["people", "Follow Candidates", "mutual follow count\nexclude self and existing follows", 820, 455, colors.orange, 360],
    ],
    edges: [
      ["user", "purchased"],
      ["purchased", "cobuyers"],
      ["cobuyers", "products"],
      ["user", "follows"],
      ["follows", "people"],
    ],
    footer: [
      "The service code is intentionally explicit so the traversal can be read and tested.",
      "For large graphs, replace the N+1 traversal shape with native Cypher or Gremlin queries.",
    ],
  },
];

const NODE_WIDTH = 300;

function dot(diagram) {
  const lines = [
    "digraph G {",
    "  graph [rankdir=LR, splines=ortho, nodesep=0.7, ranksep=1.0];",
    "  node [shape=box, style=rounded];",
  ];
  const items = diagram.kind === "sequence"
    ? diagram.participants
    : diagram.kind === "erd"
      ? diagram.tables
      : diagram.nodes ?? [];
  for (const [id, label] of items) {
    lines.push(`  "${id}" [label="${label}"];`);
  }
  const edges = diagram.kind === "sequence"
    ? diagram.messages
    : diagram.kind === "erd"
      ? diagram.relations
      : diagram.edges ?? [];
  for (const [from, to, label] of edges) {
    lines.push(`  "${from}" -> "${to}"${label ? ` [label="${label}"]` : ""};`);
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

function nodeWidth(item) {
  return item[6] ?? NODE_WIDTH;
}

function nodeHeight(item) {
  const body = item[2] ?? "";
  return body.split("\n").length > 1 ? 142 : 118;
}

function node(item) {
  const [id, title, body, x, y, fill] = item;
  const w = nodeWidth(item);
  const h = nodeHeight(item);
  const lines = body.split("\n");
  const totalTextHeight = 31 + lines.length * 22;
  const startY = y + h / 2 - totalTextHeight / 2 + 24;
  return `<g id="${id}">
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="#7B8CA3" stroke-width="2"/>
  <text class="nodeTitle" x="${x + w / 2}" y="${startY}" text-anchor="middle">${esc(title)}</text>
  ${lines.map((line, index) => `<text class="nodeBody" x="${x + w / 2}" y="${startY + 34 + index * 23}" text-anchor="middle">${esc(line)}</text>`).join("\n  ")}
</g>`;
}

function edge(from, to, nodes) {
  const src = nodes.find((n) => n[0] === from);
  const dst = nodes.find((n) => n[0] === to);
  const srcWidth = nodeWidth(src);
  const dstWidth = nodeWidth(dst);
  const srcHeight = nodeHeight(src);
  const dstHeight = nodeHeight(dst);
  const [sx, sy] = [src[3], src[4]];
  const [dx, dy] = [dst[3], dst[4]];
  const scx = sx + srcWidth / 2;
  const scy = sy + srcHeight / 2;
  const dcx = dx + dstWidth / 2;
  const dcy = dy + dstHeight / 2;
  if (Math.abs(scx - dcx) < Math.abs(scy - dcy)) {
    if (scy <= dcy) {
      const y1 = sy + srcHeight;
      const y2 = dy;
      const mid = Math.round((y1 + y2) / 2);
      return `<path class="edge" d="M${scx} ${y1} V${mid} H${dcx} V${y2 - 8}"/>`;
    }
    const y1 = sy;
    const y2 = dy + dstHeight;
    const mid = Math.round((y1 + y2) / 2);
    return `<path class="edge" d="M${scx} ${y1} V${mid} H${dcx} V${y2 + 8}"/>`;
  }
  if (scx <= dcx) {
    const x1 = sx + srcWidth;
    const x2 = dx;
    const mid = Math.round((x1 + x2) / 2);
    return `<path class="edge" d="M${x1} ${scy} H${mid} V${dcy} H${x2 - 8}"/>`;
  }
  const x1 = sx;
  const x2 = dx + dstWidth;
  const mid = Math.round((x1 + x2) / 2);
  return `<path class="edge" d="M${x1} ${scy} H${mid} V${dcy} H${x2 + 8}"/>`;
}

function svg(diagram) {
  if (diagram.kind === "sequence") return sequenceSvg(diagram);
  if (diagram.kind === "chart") return chartSvg(diagram);
  if (diagram.kind === "erd") return erdSvg(diagram);
  if (diagram.kind === "selection") return selectionSvg(diagram);

  const width = diagram.width ?? 1460;
  const height = diagram.height ?? 760;
  const footerY = height - 96;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
    <path d="M 1 1 L 7 4 L 1 7 Z" fill="#496A8F"/>
  </marker>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#22344A" flood-opacity="0.12"/>
  </filter>
  ${style()}
</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="${width / 2}" y="82" text-anchor="middle">${esc(diagram.title)}</text>
<text class="subtitle" x="${width / 2}" y="118" text-anchor="middle">${esc(diagram.subtitle)}</text>
${diagram.edges.map(([from, to]) => edge(from, to, diagram.nodes)).join("\n")}
${diagram.nodes.map(node).join("\n")}
<rect x="88" y="${footerY}" width="${width - 176}" height="62" rx="12" fill="#F8FBFE" stroke="#D7E2EC"/>
<text class="footer" x="${width / 2}" y="${footerY + 25}" text-anchor="middle">${esc(diagram.footer[0])}</text>
<text class="footer" x="${width / 2}" y="${footerY + 49}" text-anchor="middle">${esc(diagram.footer[1])}</text>
</svg>
`;
}

function selectionSvg(diagram) {
  const width = diagram.width;
  const height = diagram.height;
  const footerY = height - 96;
  const app = diagram.nodes.find((n) => n[0] === "app");
  const targets = diagram.nodes.filter((n) => n[0] !== "app");
  const appCenterX = app[3] + nodeWidth(app) / 2;
  const appBottom = app[4] + nodeHeight(app);
  const busY = 365;
  const firstCenterX = targets[0][3] + nodeWidth(targets[0]) / 2;
  const lastCenterX = targets.at(-1)[3] + nodeWidth(targets.at(-1)) / 2;
  const targetLines = targets.map((target) => {
    const x = target[3] + nodeWidth(target) / 2;
    const y = target[4];
    return `<path class="edge" d="M${x} ${busY} V${y - 8}"/>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
    <path d="M 1 1 L 7 4 L 1 7 Z" fill="#496A8F"/>
  </marker>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#22344A" flood-opacity="0.12"/>
  </filter>
  ${style()}
</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="${width / 2}" y="82" text-anchor="middle">${esc(diagram.title)}</text>
<text class="subtitle" x="${width / 2}" y="118" text-anchor="middle">${esc(diagram.subtitle)}</text>
<path class="bus" d="M${appCenterX} ${appBottom} V${busY}"/>
<path class="bus" d="M${firstCenterX} ${busY} H${lastCenterX}"/>
${targetLines}
${diagram.nodes.map(node).join("\n")}
<rect x="88" y="${footerY}" width="${width - 176}" height="62" rx="12" fill="#F8FBFE" stroke="#D7E2EC"/>
<text class="footer" x="${width / 2}" y="${footerY + 25}" text-anchor="middle">${esc(diagram.footer[0])}</text>
<text class="footer" x="${width / 2}" y="${footerY + 49}" text-anchor="middle">${esc(diagram.footer[1])}</text>
</svg>
`;
}

function tableHeight(table) {
  return 86 + table[2].length * 30;
}

function table(table) {
  const [id, title, fields, x, y, fill, width = 280] = table;
  const height = tableHeight(table);
  const headerHeight = 48;
  const rows = fields.map((field, index) => {
    const rowY = y + headerHeight + index * 30;
    return `<line x1="${x}" y1="${rowY}" x2="${x + width}" y2="${rowY}" stroke="#D7E2EC"/>
  <text class="tableField" x="${x + 18}" y="${rowY + 21}">${esc(field)}</text>`;
  }).join("\n  ");
  return `<g id="${id}">
  <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="${fill}" stroke="#7B8CA3" stroke-width="2"/>
  <rect x="${x}" y="${y}" width="${width}" height="${headerHeight}" rx="8" fill="#FFFFFF" fill-opacity="0.45" stroke="#7B8CA3" stroke-width="2"/>
  <line x1="${x}" y1="${y + headerHeight}" x2="${x + width}" y2="${y + headerHeight}" stroke="#7B8CA3" stroke-width="2"/>
  <text class="tableTitle" x="${x + width / 2}" y="${y + 31}" text-anchor="middle">${esc(title)}</text>
  ${rows}
</g>`;
}

function relation(from, to, label, tables) {
  const src = tables.find((n) => n[0] === from);
  const dst = tables.find((n) => n[0] === to);
  const sw = src[6] ?? 280;
  const dw = dst[6] ?? 280;
  const sh = tableHeight(src);
  const dh = tableHeight(dst);
  const sx = src[3];
  const sy = src[4];
  const dx = dst[3];
  const dy = dst[4];
  const scx = sx + sw / 2;
  const scy = sy + sh / 2;
  const dcx = dx + dw / 2;
  const dcy = dy + dh / 2;
  const horizontal = Math.abs(scx - dcx) >= Math.abs(scy - dcy);
  let path;
  let labelX;
  let labelY;
  if (horizontal) {
    const x1 = scx <= dcx ? sx + sw : sx;
    const x2 = scx <= dcx ? dx : dx + dw;
    const mid = Math.round((x1 + x2) / 2);
    path = `M${x1} ${scy} H${mid} V${dcy} H${x2}`;
    labelX = mid;
    labelY = Math.round((scy + dcy) / 2) - 10;
  } else {
    const y1 = scy <= dcy ? sy + sh : sy;
    const y2 = scy <= dcy ? dy : dy + dh;
    const mid = Math.round((y1 + y2) / 2);
    path = `M${scx} ${y1} V${mid} H${dcx} V${y2}`;
    labelX = Math.round((scx + dcx) / 2);
    labelY = mid - 10;
  }
  const labelWidth = Math.max(120, Math.min(230, label.length * 8 + 34));
  return `<g>
  <path class="edge" d="${path}"/>
  <rect x="${labelX - labelWidth / 2}" y="${labelY - 17}" width="${labelWidth}" height="28" rx="8" fill="#FFFFFF" stroke="#D7E2EC"/>
  <text class="edgeLabel" x="${labelX}" y="${labelY + 2}" text-anchor="middle">${esc(label)}</text>
</g>`;
}

function erdSvg(diagram) {
  const width = diagram.width;
  const height = diagram.height;
  const footerY = height - 96;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
    <path d="M 1 1 L 7 4 L 1 7 Z" fill="#496A8F"/>
  </marker>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#22344A" flood-opacity="0.12"/>
  </filter>
  ${style()}
</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="${width / 2}" y="82" text-anchor="middle">${esc(diagram.title)}</text>
<text class="subtitle" x="${width / 2}" y="118" text-anchor="middle">${esc(diagram.subtitle)}</text>
${diagram.relations.map(([from, to, label]) => relation(from, to, label, diagram.tables)).join("\n")}
${diagram.tables.map(table).join("\n")}
<rect x="88" y="${footerY}" width="${width - 176}" height="62" rx="12" fill="#F8FBFE" stroke="#D7E2EC"/>
<text class="footer" x="${width / 2}" y="${footerY + 25}" text-anchor="middle">${esc(diagram.footer[0])}</text>
<text class="footer" x="${width / 2}" y="${footerY + 49}" text-anchor="middle">${esc(diagram.footer[1])}</text>
</svg>
`;
}

function sequenceSvg(diagram) {
  const width = 1500;
  const height = 760;
  const lifelineTop = 190;
  const lifelineBottom = 610;
  const participantWidth = 210;
  const participantHeight = 64;
  const participantMap = new Map(diagram.participants.map(([id, label, x]) => [id, { label, x }]));
  const participants = diagram.participants.map(([, label, x]) => `<g>
  <rect x="${x - participantWidth / 2}" y="136" width="${participantWidth}" height="${participantHeight}" rx="10" fill="#EAF4FF" stroke="#7B8CA3" stroke-width="2"/>
  <text class="nodeTitle" x="${x}" y="176" text-anchor="middle">${esc(label)}</text>
  <line class="lifeline" x1="${x}" y1="${lifelineTop + 28}" x2="${x}" y2="${lifelineBottom}"/>
</g>`).join("\n");
  const messages = diagram.messages.map(([from, to, label, y, fill]) => {
    const src = participantMap.get(from);
    const dst = participantMap.get(to);
    const direction = src.x < dst.x ? 1 : -1;
    const x1 = src.x + direction * 38;
    const x2 = dst.x - direction * 38;
    const labelX = Math.round((x1 + x2) / 2);
    const labelWidth = Math.max(255, Math.min(410, label.length * 8 + 48));
    const labelY = y - 42;
    return `<g>
  <rect x="${labelX - labelWidth / 2}" y="${labelY}" width="${labelWidth}" height="31" rx="9" fill="${fill}" stroke="#D7E2EC"/>
  <text class="nodeBody" x="${labelX}" y="${labelY + 21}" text-anchor="middle">${esc(label)}</text>
  <path class="edge" d="M${x1} ${y} H${x2}"/>
</g>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
    <path d="M 1 1 L 7 4 L 1 7 Z" fill="#496A8F"/>
  </marker>
  ${style()}
</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="${width / 2}" y="82" text-anchor="middle">${esc(diagram.title)}</text>
<text class="subtitle" x="${width / 2}" y="118" text-anchor="middle">${esc(diagram.subtitle)}</text>
${participants}
${messages}
<rect x="88" y="655" width="${width - 176}" height="62" rx="12" fill="#F8FBFE" stroke="#D7E2EC"/>
<text class="footer" x="${width / 2}" y="680" text-anchor="middle">${esc(diagram.footer[0])}</text>
<text class="footer" x="${width / 2}" y="704" text-anchor="middle">${esc(diagram.footer[1])}</text>
</svg>
`;
}

function chartSvg(diagram) {
  const width = diagram.width;
  const height = diagram.height;
  const left = 350;
  const top = 170;
  const row = 70;
  const unit = diagram.unit ?? "ms/op";
  const direction = diagram.direction ?? "log scale, lower is better";
  const max = Math.log10(Math.max(...diagram.bars.map(([, value]) => value)) + 1);
  const barMaxWidth = 880;
  const bars = diagram.bars.map(([label, value, fill], index) => {
    const y = top + index * row;
    const barWidth = Math.max(10, Math.round((Math.log10(value + 1) / max) * barMaxWidth));
    return `<g>
  <text class="nodeBody" x="${left - 28}" y="${y + 25}" text-anchor="end">${esc(label)}</text>
  <rect x="${left}" y="${y}" width="${barWidth}" height="36" rx="9" fill="${fill}" stroke="#7B8CA3"/>
  <text class="nodeBody" x="${left + barWidth + 18}" y="${y + 25}">${value.toFixed(value < 10 ? 3 : 1)} ${unit}</text>
</g>`;
  }).join("\n");
  const footerY = height - 96;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>${style()}</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="${width / 2}" y="82" text-anchor="middle">${esc(diagram.title)}</text>
<text class="subtitle" x="${width / 2}" y="118" text-anchor="middle">${esc(diagram.subtitle)}</text>
<text class="axis" x="${left}" y="145">${esc(direction)}</text>
${bars}
<rect x="88" y="${footerY}" width="${width - 176}" height="62" rx="12" fill="#F8FBFE" stroke="#D7E2EC"/>
<text class="footer" x="${width / 2}" y="${footerY + 25}" text-anchor="middle">${esc(diagram.footer[0])}</text>
<text class="footer" x="${width / 2}" y="${footerY + 49}" text-anchor="middle">${esc(diagram.footer[1])}</text>
</svg>
`;
}

function style() {
  return `<style>
    .canvas{fill:#F6F9FC}.frame{fill:#FFFFFF;stroke:#D7E2EC;stroke-width:2}
    .title{font-family:"Architects Daughter","Comic Sans MS",cursive;font-size:42px;fill:#22344A;font-weight:400}
    .subtitle,.footer,.axis{font-family:"Comic Mono","Comic Sans MS",sans-serif;font-size:17px;fill:#536476;font-weight:400}
    .nodeTitle{font-family:"Architects Daughter","Comic Sans MS",cursive;font-size:24px;fill:#22344A;font-weight:400}
    .nodeBody{font-family:"Comic Mono","Comic Sans MS",sans-serif;font-size:16px;fill:#3F5269;font-weight:400}
    .tableTitle{font-family:"Architects Daughter","Comic Sans MS",cursive;font-size:24px;fill:#22344A;font-weight:400}
    .tableField,.edgeLabel{font-family:"Comic Mono","Comic Sans MS",sans-serif;font-size:15px;fill:#3F5269;font-weight:400}
    .edge{fill:none;stroke:#496A8F;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
    .bus{fill:none;stroke:#496A8F;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
    .lifeline{stroke:#91A6BD;stroke-width:2;stroke-dasharray:8 8}
    g[id]{filter:url(#shadow)}
  </style>`;
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
    String(diagram.width ?? 1500),
    "-h",
    String(diagram.height ?? 760),
    "-o",
    pngPath,
    svgPath,
  ]);
}
