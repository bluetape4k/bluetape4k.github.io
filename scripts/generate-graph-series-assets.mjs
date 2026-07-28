import { execFileSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";

const out = "public/assets";

const colors = {
  blue: "#0C4A6E",
  green: "#14532D",
  amber: "#78350F",
  pink: "#831843",
  teal: "#134E4A",
  lavender: "#4C1D95",
  orange: "#7C2D12",
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
    width: 1900,
    height: 860,
    tables: [
      ["user", "User", ["userId", "email", "risk fields"], 130, 330, colors.blue, 270],
      ["device", "Device", ["deviceId", "fingerprint"], 560, 240, colors.amber, 270],
      ["ip", "IpAddress", ["address", "network"], 560, 510, colors.green, 270],
      ["phone", "PhoneNumber", ["phoneHash"], 1000, 240, colors.lavender, 270],
      ["payment", "PaymentMethod", ["paymentToken", "provider"], 1000, 510, colors.orange, 270],
      ["referral", "User", ["referrer user"], 1450, 370, colors.teal, 270],
    ],
    relations: [
      ["user", "device", "USES_DEVICE"],
      ["user", "phone", "HAS_PHONE"],
      ["user", "referral", "REFERRED_BY"],
      ["user", "payment", "USES_PAYMENT"],
      ["user", "ip", "USES_IP"],
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
      ["friend", "company", "colleague path"],
      ["person", "company", "WORKS_AT"],
      ["person", "follow", "FOLLOWS"],
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
  {
    name: "bluetape4k-graph-part5-call-path-01",
    title: "One Graph API, Two Execution Paths",
    subtitle: "The backend work is the same; only the call path and waiting model change",
    width: 1700,
    height: 820,
    nodes: [
      ["syncCaller", "Caller Thread", "calls GraphOperations\nwaits directly", 90, 230, colors.blue, 310],
      ["syncMethod", "Sync Method", "direct backend call\nsame repository contract", 470, 230, colors.blue, 330],
      ["backend", "Graph Backend", "TinkerGraph or network DB\nsame graph operation", 890, 330, colors.green, 360],
      ["vtCaller", "Caller Thread", "gets CompletableFuture\ncontinues outside wait", 90, 500, colors.pink, 310],
      ["vtAdapter", "Virtual Thread Adapter", "virtualFutureOf { ... }\nwraps sync operation", 470, 500, colors.pink, 330],
      ["wait", "Wait Boundary", "sync caller pays\nVT absorbs blocking wait", 1310, 330, colors.amber, 300],
    ],
    edges: [
      ["syncCaller", "syncMethod"],
      ["syncMethod", "backend"],
      ["vtCaller", "vtAdapter"],
      ["vtAdapter", "backend"],
      ["backend", "wait"],
    ],
    footer: [
      "For in-memory microsecond work, Sync usually wins because wrapping overhead is visible.",
      "For blocking network I/O and many concurrent requests, Virtual Threads can simplify scaling.",
    ],
  },
  {
    name: "bluetape4k-graph-part5-vt-latency-chart-01",
    title: "TinkerGraph: Sync vs Virtual Threads",
    subtitle: "JMH AverageTime, microseconds per operation, lower is faster",
    kind: "chart",
    width: 1580,
    height: 900,
    unit: "us/op",
    direction: "TinkerGraph fixture, lower is faster",
    bars: [
      ["findVertexById Sync", 1.8, colors.blue],
      ["findVertexById VT join", 8.1, colors.pink],
      ["neighbors Sync", 3.0, colors.blue],
      ["neighbors VT join", 10.6, colors.pink],
      ["bfs Sync", 4.2, colors.blue],
      ["bfs VT join", 12.6, colors.pink],
      ["pageRank Sync", 7.3, colors.blue],
      ["pageRank VT join", 15.3, colors.pink],
      ["shortestPath Sync", 22.0, colors.blue],
      ["shortestPath VT join", 31.5, colors.pink],
    ],
    footer: [
      "Fixture: TinkerGraph in-memory. The chart exposes API wrapping cost, not network DB throughput.",
      "Network-backed graph work can shift the tradeoff when blocking wait dominates the operation.",
    ],
  },
];

const NODE_WIDTH = 300;

const locales = ["en", "ko"];

const koLabels = {
  "bluetape4k-graph-part1-backend-selection-01": {
    title: "그래프 저장소 선택 지도",
    subtitle: "작업 부하의 특성, 연산 적합성, 테스트 전략에 따라 그래프 저장소를 선택한다",
    nodes: {
      app: ["애플리케이션 그래프 작업 부하", "경로, 이웃, 순위 계산\n일괄 쓰기 또는 테스트 데이터"],
      neo4j: ["Neo4j", "운영 환경의 기본 후보\n성숙한 운영 기능\nCypher 드라이버"],
      memgraph: ["Memgraph", "짧은 지연 시간의 로컬 그래프\n쓰기 중심 작업 후보\nNeo4j 프로토콜"],
      age: ["Apache AGE", "PostgreSQL 중심 팀\nSQL 위에서 Cypher 사용\n속도보다 통합 우선"],
      tinker: ["TinkerGraph", "단위 테스트와 예제\n메모리 내 테스트 데이터\nDocker 불필요"],
      falkor: ["FalkorDB", "Redis 계열 그래프 서비스\n단순한 읽기 중심 작업\n쓰기 비용 검증 필요"],
    },
    footer: [
      "bluetape4k-graph는 하나의 Kotlin API를 유지하면서 그래프 저장소별 장단점을 보존한다.",
      "테스트는 TinkerGraph로 시작하고 운영 후보는 실제 작업 부하로 측정한다.",
    ],
  },
  "bluetape4k-graph-part1-module-layering-01": {
    title: "bluetape4k-graph 모듈 계층",
    subtitle: "작은 핵심 계약을 중심으로 어댑터, I/O, 프레임워크 모듈을 조합한다",
    nodes: {
      apps: ["애플리케이션과 실전 예제", "부정 사용자 탐지, 추천\n지식 그래프, 소셜 네트워크"],
      framework: ["프레임워크 어댑터", "Spring Boot 4 자동 구성\nKtor 플러그인 생명주기"],
      io: ["그래프 I/O", "CSV, NDJSON, GraphML\nOkIO 확장 경로"],
      core: ["graph-core", "GraphOperations, 스키마 DSL\n병합, 트랜잭션, 알고리즘"],
      storage: ["그래프 저장소 어댑터", "AGE, Neo4j, Memgraph\nTinkerPop, FalkorDB"],
    },
    footer: [
      "공통 API가 중심이며 프레임워크 모듈과 I/O 모듈은 통합을 보조한다.",
      "공통 계층에 맞지 않는 질의에서는 저장소 고유 기능을 그대로 사용할 수 있다.",
    ],
  },
  "bluetape4k-graph-part2-core-api-flow-01": {
    title: "핵심 API 실행 흐름",
    subtitle: "서비스는 graph-core에 의존하고 동기, 가상 스레드, suspend 실행 모델을 선택한다",
    nodes: {
      service: ["도메인 서비스", "서비스 코드는 그래프 용어 사용\n저장소 선택은 외부로 분리"],
      ops: ["GraphOperations", "세션 + 정점 + 간선\n순회 + 알고리즘"],
      schema: ["스키마 DSL", "VertexLabel / EdgeLabel\n속성과 제약 조건"],
      execution: ["실행 모델", "동기 API\n가상 스레드 파사드\nsuspend API"],
      adapter: ["그래프 저장소 어댑터", "Neo4j, Memgraph, AGE\nTinkerGraph, FalkorDB"],
    },
    footer: [
      "스키마, 병합, 트랜잭션 기능은 선택한 저장소가 계약을 지킬 때만 제공된다.",
      "지원하지 않는 연산은 더 약한 의미를 감추지 않고 즉시 실패한다.",
    ],
  },
  "bluetape4k-graph-part2-api-model-benchmark-01": {
    title: "API 모델 벤치마크 결과",
    subtitle: "TinkerGraph BFS 지연 시간, 연산당 마이크로초, 낮을수록 좋다",
    bars: ["BFS depth=5 Sync", "BFS depth=5 VT", "BFS depth=5 Coroutine", "100-way launch Coroutine", "100-way launch VT", "BFS 100-way VT", "BFS 100-way Coroutine"],
    footer: [
      "출처: docs/benchmark/2026-05-21-api-model-results.md, TinkerGraph JMH 단기 실행.",
      "제품 수준의 순위로 해석하기 전에 본문의 오차 범위와 측정 조건을 함께 확인한다.",
    ],
    direction: "로그 눈금, 낮을수록 좋음",
  },
  "bluetape4k-graph-part2-transaction-sequence-01": {
    title: "트랜잭션과 일괄 쓰기 시퀀스",
    subtitle: "서비스가 정점과 간선을 만들고 하나의 파사드로 그래프 관계를 조회한다",
    participants: {
      service: "서비스",
      ops: "GraphOperations",
      tx: "트랜잭션 범위",
      adapter: "저장소 어댑터",
      db: "그래프 DB",
    },
    messages: [
      "1. transaction { ... }",
      "2. CRUD 전용 범위 제공",
      "3. createVertices 일괄 실행",
      "4. createEdges 일괄 실행",
      "5. 커밋 또는 롤백",
      "6. neighbors / shortestPath",
    ],
    footer: [
      "트랜잭션 블록은 생명주기 명령을 제외하여 DDL과 자동 커밋 규칙을 저장소별로 유지한다.",
      "일괄 처리 기본값은 공통 계약을 따르고 어댑터는 저장소 고유의 원자적 동작으로 재정의할 수 있다.",
    ],
  },
  "bluetape4k-graph-part3-io-pipeline-01": {
    title: "그래프 I/O 파이프라인",
    subtitle: "서비스를 특정 파일 형식에 결합하지 않고 형식 어댑터로 그래프 데이터를 이동한다",
    nodes: {
      graph: ["GraphOperations", "정점과 간선 읽기\n가져오기 일괄 쓰기"],
      core: ["graph-io-core", "일괄 처리 계약\n내보내기·가져오기 옵션"],
      formats: ["데이터 형식", "CSV\nNDJSON, GraphML"],
      uses: ["운영 활용", "마이그레이션, 스냅숏\n분석, 재현 가능한 테스트"],
      bench: ["벤치마크 검증", "평균 지연 시간\n주장 전에 제약 조건 확인"],
      decorators: ["I/O 확장", "OkIO, 버퍼링\n압축, 비동기 경로"],
    },
    footer: [
      "CSV는 사람이 확인하기 쉽고, NDJSON은 서비스 간 교환에 적합하며, GraphML은 상호 운용에 유용하다.",
      "벤치마크 차트는 현재 측정 결과의 요약이며 모든 그래프 형태에 대한 성능 보장이 아니다.",
    ],
  },
  "bluetape4k-graph-part3-benchmark-summary-01": {
    title: "그래프 I/O 단기 실행 지연 시간",
    subtitle: "소규모 그래프 내보내기·가져오기, 연산당 밀리초, 낮을수록 좋다",
    bars: ["CSV export", "Jackson3 export", "GraphML export", "CSV import", "Jackson3 import", "GraphML import", "GraphML caching 전"],
    footer: [
      "출처: docs/benchmark/2026-04-18-graph-io-bulk-results.md, 단기 실행 @Fork(0).",
      "회귀 확인에는 단기 결과를 사용하고 분산 판단에는 원시 JSON 벤치마크를 더 길게 실행한다.",
    ],
    direction: "로그 눈금, 낮을수록 좋음",
  },
  "bluetape4k-graph-part4-abuser-erd-01": {
    title: "Abuser Detection 엔터티 그래프",
    subtitle: "사용자는 identifier와 연결되고 공유 identifier가 review evidence가 된다",
    tables: {
      user: ["User", ["userId", "email", "risk field"]],
      device: ["Device", ["deviceId", "fingerprint"]],
      ip: ["IpAddress", ["address", "network"]],
      phone: ["PhoneNumber", ["phoneHash"]],
      payment: ["PaymentMethod", ["paymentToken", "provider"]],
      referral: ["User", ["referrer user"]],
    },
    footer: [
      "graph에는 raw phone number나 card data가 아니라 hash와 safe token만 저장한다.",
      "같은 identifier vertex가 여러 user로 되돌아갈 때 cluster signal이 생긴다.",
    ],
  },
  "bluetape4k-graph-part4-recommendation-erd-01": {
    title: "Recommendation 엔터티 그래프",
    subtitle: "product 후보와 follow 후보는 두 단순한 edge family에서 나온다",
    tables: {
      user: ["User", ["userId", "name"]],
      product: ["Product", ["productId", "name", "category"]],
      followee: ["User", ["followee user"]],
      candidate: ["Candidate", ["score", "reason"]],
    },
    footer: [
      "예제는 candidate generation과 scoring을 분리해서 service rule을 읽기 쉽게 둔다.",
      "큰 production graph에서는 반복 traversal을 native Cypher나 Gremlin으로 바꿔야 한다.",
    ],
  },
  "bluetape4k-graph-part4-knowledge-erd-01": {
    title: "Knowledge Graph 엔터티 그래프",
    subtitle: "document는 entity를 mention하고 entity는 concept 및 다른 entity와 연결된다",
    tables: {
      document: ["Document", ["documentId", "title", "source"]],
      entity: ["Entity", ["entityId", "name", "type"]],
      concept: ["Concept", ["conceptId", "name"]],
      related: ["Entity", ["related entity"]],
    },
    footer: [
      "full-text 또는 vector search로 candidate를 찾고 graph path로 연결 이유를 설명한다.",
      "depth limit은 semantic traversal이 unbounded crawl로 변하지 않게 막아 준다.",
    ],
  },
  "bluetape4k-graph-part4-social-erd-01": {
    title: "Social Network 엔터티 그래프",
    subtitle: "person은 방향성이 있는 관계로 person과 company에 연결된다",
    tables: {
      person: ["Person", ["personId", "name", "location"]],
      friend: ["Person", ["known person"]],
      follow: ["Person", ["followee"]],
      company: ["Company", ["companyId", "name"]],
    },
    footer: [
      "direction과 depth가 path를 recommendation으로 볼지 explanation으로만 볼지 결정한다.",
      "traversal result를 candidate로 바꾸기 전에 self와 이미 연결된 person을 제외한다.",
    ],
  },
  "bluetape4k-graph-part4-abuser-identity-flow-01": {
    title: "Abuser Detection 식별자 흐름",
    subtitle: "한 user에서 시작해 shared identifier를 순회하고 의심 cluster를 ranking한다",
    nodes: {
      seed: ["Seed User", "login, order,\nmoderation event의 userId"],
      ids: ["Shared Identifier", "device, IP, phone hash\npayment token, referral"],
      users: ["Related Users", "identifier에서 reverse traversal\nseed user 제외"],
      paths: ["Suspicion Evidence", "edge path 설명\ncycle detection"],
      rank: ["Risk Ranking", "PageRank topK\ncluster review queue"],
    },
    footer: [
      "workshop은 raw phone과 card data를 graph에 넣지 않고 hash와 PCI-safe payment token을 쓴다.",
      "예제는 traversal shape를 먼저 가르치며 production에는 scoring과 operational guardrail이 더 필요하다.",
    ],
  },
  "bluetape4k-graph-part4-recommendation-flow-01": {
    title: "Recommendation 예제 흐름",
    subtitle: "co-buyer와 friends-of-friends를 찾고 graph evidence로 candidate를 정렬한다",
    nodes: {
      user: ["Seed User", "Alice 또는 현재 viewer"],
      purchased: ["Purchased Products", "이미 구매한 product\ncandidate에서 제외"],
      cobuyers: ["Co-buyers", "seed product를 산\n다른 user"],
      products: ["Product Candidates", "distinct co-buyer로 score\nscore desc 정렬"],
      follows: ["Follow Graph", "direct follow\n2-hop candidate"],
      people: ["Follow Candidates", "mutual follow count\nself와 existing follow 제외"],
    },
    footer: [
      "service code는 traversal을 읽고 테스트할 수 있도록 일부러 명시적으로 유지한다.",
      "큰 graph에서는 N+1 traversal shape를 native Cypher나 Gremlin query로 바꾼다.",
    ],
  },
  "bluetape4k-graph-part5-call-path-01": {
    title: "하나의 Graph API, 두 실행 경로",
    subtitle: "backend work는 같고 call path와 waiting model만 달라진다",
    nodes: {
      syncCaller: ["Caller Thread", "GraphOperations 호출\n직접 대기"],
      syncMethod: ["Sync Method", "직접 backend call\n같은 repository contract"],
      backend: ["Graph Backend", "TinkerGraph 또는 network DB\n같은 graph operation"],
      vtCaller: ["Caller Thread", "CompletableFuture 수신\nwait 바깥에서 계속 진행"],
      vtAdapter: ["Virtual Thread Adapter", "virtualFutureOf { ... }\nsync operation wrapping"],
      wait: ["Wait Boundary", "sync caller가 비용 지불\nVT가 blocking wait 흡수"],
    },
    footer: [
      "in-memory microsecond work에서는 wrapping overhead가 보여서 Sync가 보통 이긴다.",
      "blocking network I/O와 많은 concurrent request에서는 Virtual Threads가 scaling을 단순하게 만든다.",
    ],
  },
  "bluetape4k-graph-part5-vt-latency-chart-01": {
    title: "TinkerGraph: Sync와 Virtual Threads",
    subtitle: "JMH AverageTime, operation당 microseconds, 낮을수록 빠르다",
    bars: ["findVertexById Sync", "findVertexById VT join", "neighbors Sync", "neighbors VT join", "bfs Sync", "bfs VT join", "pageRank Sync", "pageRank VT join", "shortestPath Sync", "shortestPath VT join"],
    footer: [
      "Fixture: TinkerGraph in-memory. 이 chart는 network DB throughput이 아니라 API wrapping cost를 보여준다.",
      "network-backed graph work에서는 blocking wait가 operation을 지배하면 tradeoff가 달라질 수 있다.",
    ],
  },
};

function localize(diagram, locale) {
  if (locale === "en") return diagram;
  const labels = koLabels[diagram.name];
  if (!labels) throw new Error(`missing ko labels for ${diagram.name}`);
  const copy = structuredClone(diagram);
  copy.title = labels.title ?? copy.title;
  copy.subtitle = labels.subtitle ?? copy.subtitle;
  copy.footer = labels.footer ?? copy.footer;
  copy.direction = labels.direction ?? copy.direction;
  if (copy.nodes && labels.nodes) {
    copy.nodes = copy.nodes.map((nodeItem) => {
      const translated = labels.nodes[nodeItem[0]];
      return translated ? [nodeItem[0], translated[0], translated[1], ...nodeItem.slice(3)] : nodeItem;
    });
  }
  if (copy.tables && labels.tables) {
    copy.tables = copy.tables.map((tableItem) => {
      const translated = labels.tables[tableItem[0]];
      return translated ? [tableItem[0], translated[0], translated[1], ...tableItem.slice(3)] : tableItem;
    });
  }
  if (copy.participants && labels.participants) {
    copy.participants = copy.participants.map((item) => [item[0], labels.participants[item[0]] ?? item[1], item[2]]);
  }
  if (copy.messages && labels.messages) {
    copy.messages = copy.messages.map((item, index) => [item[0], item[1], labels.messages[index] ?? item[2], ...item.slice(3)]);
  }
  if (copy.bars && labels.bars) {
    copy.bars = copy.bars.map((bar, index) => [labels.bars[index] ?? bar[0], ...bar.slice(1)]);
  }
  return copy;
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
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="#64748B" stroke-width="2"/>
  <text class="nodeTitle" x="${x + w / 2}" y="${startY}" text-anchor="middle">${esc(title)}</text>
  ${lines.map((line, index) => `<text class="nodeBody" x="${x + w / 2}" y="${startY + 34 + index * 23}" text-anchor="middle">${esc(line)}</text>`).join("\n  ")}
</g>`;
}

function roundedPath(points, radius = 18) {
  if (points.length < 2) throw new Error("roundedPath needs at least two points");
  if (points.length === 4) {
    const [a, b, c, d] = points;
    const middle = Math.hypot(c[0] - b[0], c[1] - b[1]);
    if (middle < 16 && a[0] === b[0] && c[0] === d[0]) {
      const x = Math.round((b[0] + c[0]) / 2);
      return `M${x} ${a[1]} L${x} ${d[1]}`;
    }
    if (middle < 16 && a[1] === b[1] && c[1] === d[1]) {
      const y = Math.round((b[1] + c[1]) / 2);
      return `M${a[0]} ${y} L${d[0]} ${y}`;
    }
  }
  const parts = [`M${points[0][0]} ${points[0][1]}`];
  for (let i = 1; i < points.length - 1; i += 1) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const prevLength = Math.hypot(cx - px, cy - py);
    const nextLength = Math.hypot(nx - cx, ny - cy);
    if ((px === cx && cx === nx) || (py === cy && cy === ny) || prevLength < 16 || nextLength < 16) {
      parts.push(`L${cx} ${cy}`);
      continue;
    }
    const before = [
      cx - Math.sign(cx - px) * Math.min(radius, Math.abs(cx - px) / 2),
      cy - Math.sign(cy - py) * Math.min(radius, Math.abs(cy - py) / 2),
    ];
    const after = [
      cx + Math.sign(nx - cx) * Math.min(radius, Math.abs(nx - cx) / 2),
      cy + Math.sign(ny - cy) * Math.min(radius, Math.abs(ny - cy) / 2),
    ];
    if ((before[0] === cx && before[1] === cy) || (after[0] === cx && after[1] === cy)) {
      parts.push(`L${cx} ${cy}`);
      continue;
    }
    parts.push(`L${Math.round(before[0])} ${Math.round(before[1])}`);
    parts.push(`Q${cx} ${cy} ${Math.round(after[0])} ${Math.round(after[1])}`);
  }
  const last = points.at(-1);
  parts.push(`L${last[0]} ${last[1]}`);
  return parts.join(" ");
}

function portOffset(id, edgeList, index, endpointIndex) {
  const related = edgeList
    .map((edgeItem, edgeIndex) => ({ edgeItem, edgeIndex }))
    .filter(({ edgeItem }) => edgeItem[endpointIndex] === id);
  if (related.length <= 1) return 0;
  const position = related.findIndex(({ edgeIndex }) => edgeIndex === index);
  return (position - (related.length - 1) / 2) * 36;
}

function edge(from, to, nodes, index = 0, edgeList = []) {
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
  const sourceOffset = portOffset(from, edgeList, index, 0);
  const targetOffset = portOffset(to, edgeList, index, 1);
  const connectorName = `${from}-to-${to}`;
  if (Math.abs(scx - dcx) < Math.abs(scy - dcy)) {
    if (scy <= dcy) {
      const y1 = sy + srcHeight;
      const y2 = dy;
      const xStart = Math.round(scx + sourceOffset);
      const xEnd = Math.round(dcx + targetOffset);
      const mid = Math.round((y1 + y2) / 2 + sourceOffset / 3);
      return `<path class="edge" data-connector="${connectorName}" d="${roundedPath([[xStart, y1], [xStart, mid], [xEnd, mid], [xEnd, y2]])}"/>`;
    }
    const y1 = sy;
    const y2 = dy + dstHeight;
    const xStart = Math.round(scx + sourceOffset);
    const xEnd = Math.round(dcx + targetOffset);
    const mid = Math.round((y1 + y2) / 2 - sourceOffset / 3);
    return `<path class="edge" data-connector="${connectorName}" d="${roundedPath([[xStart, y1], [xStart, mid], [xEnd, mid], [xEnd, y2]])}"/>`;
  }
  if (scx <= dcx) {
    const x1 = sx + srcWidth;
    const x2 = dx;
    const yStart = Math.round(scy + sourceOffset);
    const yEnd = Math.round(dcy + targetOffset);
    const mid = Math.round((x1 + x2) / 2 + sourceOffset / 3);
    return `<path class="edge" data-connector="${connectorName}" d="${roundedPath([[x1, yStart], [mid, yStart], [mid, yEnd], [x2, yEnd]])}"/>`;
  }
  const x1 = sx;
  const x2 = dx + dstWidth;
  const yStart = Math.round(scy + sourceOffset);
  const yEnd = Math.round(dcy + targetOffset);
  const mid = Math.round((x1 + x2) / 2 - sourceOffset / 3);
  return `<path class="edge" data-connector="${connectorName}" d="${roundedPath([[x1, yStart], [mid, yStart], [mid, yEnd], [x2, yEnd]])}"/>`;
}

function svg(diagram, locale) {
  if (diagram.kind === "sequence") return sequenceSvg(diagram, locale);
  if (diagram.kind === "chart") return chartSvg(diagram, locale);
  if (diagram.kind === "erd") return erdSvg(diagram, locale);
  if (diagram.kind === "selection") return selectionSvg(diagram, locale);

  const width = diagram.width ?? 1460;
  const height = diagram.height ?? 760;
  const footerY = height - 96;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <marker id="arrow" markerWidth="14" markerHeight="14" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" viewBox="0 0 10 10">
    <path d="M 0 0 L 10 5 L 0 10 Z" fill="#60A5FA"/>
  </marker>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#22344A" flood-opacity="0.12"/>
  </filter>
  ${style(locale)}
</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="${width / 2}" y="82" text-anchor="middle">${esc(diagram.title)}</text>
<text class="subtitle" x="${width / 2}" y="118" text-anchor="middle">${esc(diagram.subtitle)}</text>
${diagram.edges.map(([from, to], index) => edge(from, to, diagram.nodes, index, diagram.edges)).join("\n")}
${diagram.nodes.map(node).join("\n")}
<rect x="88" y="${footerY}" width="${width - 176}" height="62" rx="12" fill="#111827" stroke="#334155"/>
<text class="footer" x="${width / 2}" y="${footerY + 25}" text-anchor="middle">${esc(diagram.footer[0])}</text>
<text class="footer" x="${width / 2}" y="${footerY + 49}" text-anchor="middle">${esc(diagram.footer[1])}</text>
</svg>
`;
}

function selectionSvg(diagram, locale) {
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
  <marker id="arrow" markerWidth="14" markerHeight="14" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" viewBox="0 0 10 10">
    <path d="M 0 0 L 10 5 L 0 10 Z" fill="#60A5FA"/>
  </marker>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#22344A" flood-opacity="0.12"/>
  </filter>
  ${style(locale)}
</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="${width / 2}" y="82" text-anchor="middle">${esc(diagram.title)}</text>
<text class="subtitle" x="${width / 2}" y="118" text-anchor="middle">${esc(diagram.subtitle)}</text>
<path class="bus" d="M${appCenterX} ${appBottom} V${busY}"/>
<path class="bus" d="M${firstCenterX} ${busY} H${lastCenterX}"/>
${targetLines}
${diagram.nodes.map(node).join("\n")}
<rect x="88" y="${footerY}" width="${width - 176}" height="62" rx="12" fill="#111827" stroke="#334155"/>
<text class="footer" x="${width / 2}" y="${footerY + 25}" text-anchor="middle">${esc(diagram.footer[0])}</text>
<text class="footer" x="${width / 2}" y="${footerY + 49}" text-anchor="middle">${esc(diagram.footer[1])}</text>
</svg>
`;
}

function tableHeight(table) {
  return 86 + table[2].length * 30;
}

function layoutErdTables(diagram) {
  const footerY = diagram.height - 96;
  const bodyTop = diagram.erdBodyTop ?? 205;
  const bodyBottom = diagram.erdBodyBottom ?? footerY - 55;
  const minY = Math.min(...diagram.tables.map((item) => item[4]));
  const maxY = Math.max(...diagram.tables.map((item) => item[4] + tableHeight(item)));
  const contentCenter = (minY + maxY) / 2;
  const targetCenter = (bodyTop + bodyBottom) / 2;
  const offsetY = Math.round(targetCenter - contentCenter);
  return diagram.tables.map((item) => {
    const copy = [...item];
    copy[4] += offsetY;
    return copy;
  });
}

function table(table) {
  const [id, title, fields, x, y, fill, width = 280] = table;
  const height = tableHeight(table);
  const headerHeight = 48;
  const rows = fields.map((field, index) => {
    const rowY = y + headerHeight + index * 30;
    return `<line x1="${x}" y1="${rowY}" x2="${x + width}" y2="${rowY}" stroke="#334155"/>
  <text class="tableField" x="${x + 18}" y="${rowY + 21}">${esc(field)}</text>`;
  }).join("\n  ");
  return `<g id="${id}">
  <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="${fill}" stroke="#64748B" stroke-width="2"/>
  <rect x="${x}" y="${y}" width="${width}" height="${headerHeight}" rx="8" fill="#0F172A" fill-opacity="0.58" stroke="#64748B" stroke-width="2"/>
  <line x1="${x}" y1="${y + headerHeight}" x2="${x + width}" y2="${y + headerHeight}" stroke="#64748B" stroke-width="2"/>
  <text class="tableTitle" x="${x + width / 2}" y="${y + 31}" text-anchor="middle">${esc(title)}</text>
  ${rows}
</g>`;
}

function relation(from, to, label, tables, index = 0, relations = []) {
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
  const sourceOffset = portOffset(from, relations, index, 0);
  const targetOffset = portOffset(to, relations, index, 1);
  if (horizontal) {
    const x1 = scx <= dcx ? sx + sw : sx;
    const x2 = scx <= dcx ? dx : dx + dw;
    const yStart = Math.round(scy + sourceOffset);
    const yEnd = Math.round(dcy + targetOffset);
    const mid = Math.round((x1 + x2) / 2 + sourceOffset / 3);
    path = roundedPath([[x1, yStart], [mid, yStart], [mid, yEnd], [x2, yEnd]]);
    labelX = mid;
    labelY = Math.round((yStart + yEnd) / 2) - 10;
  } else {
    const y1 = scy <= dcy ? sy + sh : sy;
    const y2 = scy <= dcy ? dy : dy + dh;
    const xStart = Math.round(scx + sourceOffset);
    const xEnd = Math.round(dcx + targetOffset);
    const mid = Math.round((y1 + y2) / 2 + sourceOffset / 3);
    path = roundedPath([[xStart, y1], [xStart, mid], [xEnd, mid], [xEnd, y2]]);
    labelX = Math.round((xStart + xEnd) / 2);
    labelY = mid - 10;
  }
  const labelWidth = Math.max(120, Math.min(230, label.length * 8 + 34));
  return `<g>
  <path class="edge" data-connector="${from}-to-${to}" d="${path}"/>
  <rect x="${labelX - labelWidth / 2}" y="${labelY - 17}" width="${labelWidth}" height="28" rx="8" fill="#0F172A" stroke="#334155"/>
  <text class="edgeLabel" x="${labelX}" y="${labelY + 2}" text-anchor="middle">${esc(label)}</text>
</g>`;
}

function erdSvg(diagram, locale) {
  const width = diagram.width;
  const height = diagram.height;
  const footerY = height - 96;
  const tables = layoutErdTables(diagram);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <marker id="arrow" markerWidth="14" markerHeight="14" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" viewBox="0 0 10 10">
    <path d="M 0 0 L 10 5 L 0 10 Z" fill="#60A5FA"/>
  </marker>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#22344A" flood-opacity="0.12"/>
  </filter>
  ${style(locale)}
</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="${width / 2}" y="82" text-anchor="middle">${esc(diagram.title)}</text>
<text class="subtitle" x="${width / 2}" y="118" text-anchor="middle">${esc(diagram.subtitle)}</text>
${diagram.relations.map(([from, to, label], index) => relation(from, to, label, tables, index, diagram.relations)).join("\n")}
${tables.map(table).join("\n")}
<rect x="88" y="${footerY}" width="${width - 176}" height="62" rx="12" fill="#111827" stroke="#334155"/>
<text class="footer" x="${width / 2}" y="${footerY + 25}" text-anchor="middle">${esc(diagram.footer[0])}</text>
<text class="footer" x="${width / 2}" y="${footerY + 49}" text-anchor="middle">${esc(diagram.footer[1])}</text>
</svg>
`;
}

function sequenceSvg(diagram, locale) {
  const width = 1500;
  const height = 760;
  const lifelineTop = 190;
  const lifelineBottom = 610;
  const participantWidth = 210;
  const participantHeight = 64;
  const participantMap = new Map(diagram.participants.map(([id, label, x]) => [id, { label, x }]));
  const participants = diagram.participants.map(([, label, x]) => `<g>
  <rect class="header" x="${x - participantWidth / 2}" y="136" width="${participantWidth}" height="${participantHeight}" rx="10" fill="#0C4A6E" stroke="#64748B" stroke-width="2"/>
  <text class="participant" x="${x}" y="176" text-anchor="middle">${esc(label)}</text>
  <line class="lifeline" x1="${x}" y1="${lifelineTop + 28}" x2="${x}" y2="${lifelineBottom}"/>
  <rect class="activation" x="${x - 6}" y="236" width="12" height="360" rx="5" fill="#111827" stroke="#64748B"/>
</g>`).join("\n");
  const messages = diagram.messages.map(([from, to, label, y, fill], index) => {
    const src = participantMap.get(from);
    const dst = participantMap.get(to);
    const direction = src.x < dst.x ? 1 : -1;
    const x1 = src.x + direction * 38;
    const x2 = dst.x - direction * 38;
    const labelX = Math.round((x1 + x2) / 2);
    const labelWidth = Math.max(300, Math.min(440, label.length * 9 + 70));
    const labelY = y - 42;
    const number = label.match(/^\d+/)?.[0] ?? String(index + 1);
    const labelText = label.replace(/^\d+\.\s*/, "");
    return `<g>
  <rect class="label" x="${labelX - labelWidth / 2}" y="${labelY}" width="${labelWidth}" height="31" rx="9" fill="${fill}" stroke="#334155"/>
  <circle cx="${labelX - labelWidth / 2 + 20}" cy="${labelY + 15.5}" r="12" fill="#0F172A" stroke="#64748B"/>
  <text class="num" x="${labelX - labelWidth / 2 + 20}" y="${labelY + 20}" text-anchor="middle">${esc(number)}</text>
  <text class="labelText" x="${labelX + 24}" y="${labelY + 21}" text-anchor="middle">${esc(labelText)}</text>
  <path class="edge" data-connector="${from}-to-${to}" d="M${x1} ${y} H${x2}"/>
</g>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse" viewBox="0 0 10 10">
    <path d="M 0 0 L 10 5 L 0 10 Z" fill="#60A5FA"/>
  </marker>
  ${style(locale)}
</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="${width / 2}" y="82" text-anchor="middle">${esc(diagram.title)}</text>
<text class="subtitle" x="${width / 2}" y="118" text-anchor="middle">${esc(diagram.subtitle)}</text>
${participants}
${messages}
<rect x="88" y="655" width="${width - 176}" height="62" rx="12" fill="#111827" stroke="#334155"/>
<text class="footer" x="${width / 2}" y="680" text-anchor="middle">${esc(diagram.footer[0])}</text>
<text class="footer" x="${width / 2}" y="704" text-anchor="middle">${esc(diagram.footer[1])}</text>
</svg>
`;
}

function chartSvg(diagram, locale) {
  const width = diagram.width;
  const height = diagram.height;
  const left = 350;
  const top = 170;
  const footerY = height - 96;
  const row = Math.min(70, Math.floor((footerY - 60 - top) / Math.max(1, diagram.bars.length - 1)));
  const unit = diagram.unit ?? "ms/op";
  const direction = diagram.direction ?? "log scale, lower is better";
  const max = Math.log10(Math.max(...diagram.bars.map(([, value]) => value)) + 1);
  const barMaxWidth = 880;
  const bars = diagram.bars.map(([label, value, fill], index) => {
    const y = top + index * row;
    const barWidth = Math.max(10, Math.round((Math.log10(value + 1) / max) * barMaxWidth));
    return `<g>
  <text class="nodeBody" x="${left - 28}" y="${y + 25}" text-anchor="end">${esc(label)}</text>
  <rect x="${left}" y="${y}" width="${barWidth}" height="36" rx="9" fill="${fill}" stroke="#64748B"/>
  <text class="nodeBody" x="${left + barWidth + 18}" y="${y + 25}">${value.toFixed(value < 10 ? 3 : 1)} ${unit}</text>
</g>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>${style(locale)}</defs>
<rect class="canvas" width="${width}" height="${height}"/>
<rect class="frame" x="34" y="28" width="${width - 68}" height="${height - 56}" rx="24"/>
<text class="title" x="${width / 2}" y="82" text-anchor="middle">${esc(diagram.title)}</text>
<text class="subtitle" x="${width / 2}" y="118" text-anchor="middle">${esc(diagram.subtitle)}</text>
<text class="axis" x="${left}" y="145">${esc(direction)}</text>
${bars}
<rect x="88" y="${footerY}" width="${width - 176}" height="62" rx="12" fill="#111827" stroke="#334155"/>
<text class="footer" x="${width / 2}" y="${footerY + 25}" text-anchor="middle">${esc(diagram.footer[0])}</text>
<text class="footer" x="${width / 2}" y="${footerY + 49}" text-anchor="middle">${esc(diagram.footer[1])}</text>
</svg>
`;
}

function style(locale) {
  const titleFont = locale === "ko"
    ? '"goorm Sans","Architects Daughter","Comic Sans MS",sans-serif'
    : '"Architects Daughter","Comic Sans MS",cursive';
  const bodyFont = locale === "ko"
    ? '"goorm Sans Code","goorm Sans","Comic Mono","Comic Sans MS",monospace'
    : '"Comic Mono","Comic Sans MS",sans-serif';
  return `<style>
    .canvas{fill:#07111F}.frame{fill:#0F172A;stroke:#334155;stroke-width:2}
    .title{font-family:${titleFont};font-size:42px;fill:#F8FAFC;font-weight:400}
    .subtitle,.footer,.axis{font-family:${bodyFont};font-size:17px;fill:#CBD5E1;font-weight:400}
    .nodeTitle,.participant{font-family:${titleFont};font-size:24px;fill:#F8FAFC;font-weight:400}
    .nodeBody,.labelText,.num{font-family:${bodyFont};font-size:16px;fill:#E2E8F0;font-weight:400}
    .tableTitle{font-family:${titleFont};font-size:24px;fill:#F8FAFC;font-weight:400}
    .tableField,.edgeLabel{font-family:${bodyFont};font-size:15px;fill:#E2E8F0;font-weight:400}
    .edge{fill:none;stroke:#60A5FA;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
    .bus{fill:none;stroke:#60A5FA;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
    .lifeline{stroke:#64748B;stroke-width:2;stroke-dasharray:8 8}
    g[id]{filter:url(#shadow)}
  </style>`;
}

const requestedParts = new Set(process.argv.slice(2));
const selectedDiagrams = requestedParts.size === 0
  ? diagrams
  : diagrams.filter((diagram) => [...requestedParts].some((part) => diagram.name.startsWith(`bluetape4k-graph-${part}-`)));

for (const diagram of selectedDiagrams) {
  for (const locale of locales) {
    const localized = localize(diagram, locale);
    const basePath = `${out}/${diagram.name}-${locale}`;
    const svgPath = `${basePath}.svg`;
    const pngPath = `${basePath}.png`;
    writeFileSync(svgPath, svg(localized, locale));
    execFileSync("xmllint", ["--noout", svgPath]);
    execFileSync("cairosvg", [svgPath, "-o", pngPath, "-s", "2"]);
    rmSync(`${basePath}.dot`, { force: true });
    rmSync(`${basePath}.plain`, { force: true });
  }
}
