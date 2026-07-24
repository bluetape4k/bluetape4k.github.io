import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const out = "public/assets";

const stems = [
  "csv-okio-writer-throughput-01",
  "csv-okio-throughput-comparison-01",
  "image-processing-benchmark-summary-01",
  "id-generators-benchmark-phase-1-chart-01",
  "id-generators-benchmark-phase-2-chart-01",
  "id-generators-benchmark-phase-3-chart-01",
  "exposed-batch-kotlinx-benchmark-map-01",
  "exposed-batch-kotlinx-benchmark-summary-01",
  "exposed-batch-kotlinx-benchmark-postgresql-e2e-01",
  "io-http-base-throughput-chart-01",
  "io-http-high-latency-throughput-chart-01",
  "graphdb-adoption-latency-chart",
];

const translations = new Map([
  [
    "csv-okio-writer-throughput-01",
    [
      ["CSV writer throughput comparison", "CSV writer 처리량 비교"],
      [
        "Grouped bar chart comparing the existing Writer path and Okio BufferedSink throughput in operations per second for small, medium, and large CSV writer workloads. Higher is better.",
        "small, medium, large CSV writer workload에서 기존 Writer 경로와 Okio BufferedSink 처리량을 ops/s 기준으로 비교한 grouped bar chart입니다. 높을수록 좋습니다.",
      ],
      ["CSV Writer Throughput: Writer vs Okio Sink", "CSV Writer 처리량: Writer vs Okio Sink"],
      [
        "ops/s, higher is better. Each workload panel uses its own scale so the medium and large jumps stay visible.",
        "ops/s, 높을수록 좋음. workload별 scale을 따로 두어 medium/large 구간의 차이를 읽기 쉽게 했습니다.",
      ],
      ["Existing OutputStreamWriter path", "기존 OutputStreamWriter 경로"],
      ["Okio BufferedSink UTF-8 path", "Okio BufferedSink UTF-8 경로"],
      ["Small rows", "Small rows"],
      ["Medium rows", "Medium rows"],
      ["Large rows", "Large rows"],
      ["1.39x faster", "1.39x 빠름"],
      ["3.06x faster", "3.06x 빠름"],
      ["3.25x faster", "3.25x 빠름"],
      ["Existing", "기존"],
      ["Setup cost still matters here.", "여기서는 setup cost 영향이 아직 큽니다."],
      ["The streaming path starts to pull away.", "streaming 경로의 격차가 본격적으로 벌어집니다."],
      ["The large export path gets the clearest win.", "large export 경로에서 이득이 가장 선명합니다."],
      ["What the chart is saying", "차트가 말하는 것"],
      [
        "The Flow already streams rows; Okio removes a character-layer detour in the UTF-8 file path.",
        "Flow는 이미 row를 streaming합니다. Okio는 UTF-8 file path의 문자 계층 우회를 제거합니다.",
      ],
      [
        "Measured with ./gradlew :bluetape4k-csv:testBenchmark. Source tables remain in the post.",
        "./gradlew :bluetape4k-csv:testBenchmark로 측정했습니다. 원본 표는 본문에 유지합니다.",
      ],
    ],
  ],
  [
    "csv-okio-throughput-comparison-01",
    [
      ["CSV Parser Throughput: Existing vs Okio Fast Path", "CSV Parser 처리량: 기존 경로 vs Okio Fast Path"],
      [
        "ops/s, higher is better. Each workload panel uses its own scale so medium and large results stay visible.",
        "ops/s, 높을수록 좋음. workload별 scale을 따로 두어 medium/large 결과가 잘 보이게 했습니다.",
      ],
      ["Existing Reader/Lexer", "기존 Reader/Lexer"],
      ["Okio BufferedSource + UnsafeCursor", "Okio BufferedSource + UnsafeCursor"],
      ["Public reader path", "Public reader 경로"],
      ["Direct lexer path", "Direct lexer 경로"],
      ["Small workload", "Small workload"],
      ["Medium workload", "Medium workload"],
      ["Large workload", "Large workload"],
      ["2.25x faster", "2.25x 빠름"],
      ["2.30x faster", "2.30x 빠름"],
      ["2.32x faster", "2.32x 빠름"],
      ["2.14x faster", "2.14x 빠름"],
      ["2.31x faster", "2.31x 빠름"],
      ["Existing", "기존"],
      [
        "Measured with ./gradlew :bluetape4k-csv:testBenchmark. Source tables remain in the post.",
        "./gradlew :bluetape4k-csv:testBenchmark로 측정했습니다. 원본 표는 본문에 유지합니다.",
      ],
    ],
  ],
  [
    "image-processing-benchmark-summary-01",
    [
      ["Natural photos: scrimage vs libvips", "자연 사진 처리: scrimage vs libvips"],
      [
        "macOS Java 25 run, average of cafe and landscape JPEG inputs, AverageTime ms/op, log scale",
        "macOS Java 25 실행, cafe/landscape JPEG 평균, AverageTime ms/op, log scale",
      ],
      ["Resize 4K to 1080p", "4K를 1080p로 resize"],
      ["JPEG encode", "JPEG encode"],
      ["PNG encode", "PNG encode"],
      ["459x faster", "459x 빠름"],
      ["2.7x faster", "2.7x 빠름"],
      ["1.7x faster", "1.7x 빠름"],
      ["scrimage pure JVM", "scrimage pure JVM"],
      ["libvips Java 25 FFM", "libvips Java 25 FFM"],
      ["Java 21 JNI: N/A on this macOS arm64 run", "Java 21 JNI: 이 macOS arm64 run에서는 N/A"],
      ["Source: bluetape4k-image images-benchmark,", "Source: bluetape4k-image images-benchmark,"],
      [
        "2026-05-28 macOS Java 25 run, cafe.jpg and landscape.jpg natural photos.",
        "2026-05-28 macOS Java 25 run, cafe.jpg 및 landscape.jpg 자연 사진.",
      ],
      [
        "Same-host Java 21 JNI measurement is unavailable on this arm64 host.",
        "동일 host Java 21 JNI 측정값은 이 arm64 host에서 사용할 수 없습니다.",
      ],
    ],
  ],
  [
    "id-generators-benchmark-phase-1-chart-01",
    [
      ["ID Generator Benchmark Phase 1", "ID Generator Benchmark Phase 1"],
      [
        "First Go implementation vs existing Kotlin idgenerators, normalized nanoseconds per ID",
        "첫 Go 구현과 기존 Kotlin idgenerators 비교, ID당 normalized ns",
      ],
      ["log scale, ns/id", "log scale, ns/id"],
      ["Single", "단일 실행"],
      ["Concurrent", "동시 실행"],
      ["faster", "더 빠름"],
      [
        "Source: Issue #168 first comparison. Lower ns/id is faster; Snowflake workloads use different clock models.",
        "Source: Issue #168 첫 비교. ns/id는 낮을수록 빠르며 Snowflake workload는 clock model이 다릅니다.",
      ],
      [
        "Phase 1 showed that Go was not automatically ahead: Kotlin already led several string ID families.",
        "Phase 1에서는 Go가 자동으로 앞서지 않았습니다. 여러 string ID family에서는 Kotlin이 이미 앞섰습니다.",
      ],
    ],
  ],
  [
    "id-generators-benchmark-phase-2-chart-01",
    [
      ["ID Generator Benchmark Phase 2", "ID Generator Benchmark Phase 2"],
      [
        "After Go entropy buffering and KSUIDMillis encoding changes, normalized nanoseconds per ID",
        "Go entropy buffering과 KSUIDMillis encoding 개선 후 비교, ID당 normalized ns",
      ],
      ["log scale, ns/id", "log scale, ns/id"],
      ["Single", "단일 실행"],
      ["Concurrent", "동시 실행"],
      ["faster", "더 빠름"],
      [
        "Source: Issue #192 second comparison. Lower ns/id is faster; Snowflake clock-model caveat still applies.",
        "Source: Issue #192 두 번째 비교. ns/id는 낮을수록 빠르며 Snowflake clock-model caveat는 여전히 적용됩니다.",
      ],
      [
        "Phase 2 changed the shape: Go took UUID v4, KSUID millis, and most concurrent workloads.",
        "Phase 2에서는 구도가 바뀌었습니다. Go가 UUID v4, KSUID millis, 대부분의 concurrent workload를 가져갔습니다.",
      ],
    ],
  ],
  [
    "id-generators-benchmark-phase-3-chart-01",
    [
      ["ID Generator Benchmark Phase 3", "ID Generator Benchmark Phase 3"],
      ["Optimized Go vs Kotlin candidate 3, normalized nanoseconds per ID", "최적화된 Go와 Kotlin candidate 3 비교, ID당 normalized ns"],
      ["log scale, ns/id", "log scale, ns/id"],
      ["Single", "단일 실행"],
      ["Concurrent", "동시 실행"],
      ["faster", "더 빠름"],
      [
        "Source: Issue #192 third comparison. Lower ns/id is faster; Snowflake workloads are not production-equivalent.",
        "Source: Issue #192 세 번째 비교. ns/id는 낮을수록 빠르며 Snowflake workload는 production-equivalent가 아닙니다.",
      ],
      [
        "Phase 3 split by family: Kotlin led ULID single and KSUID seconds; Go led ULID concurrent and KSUID millis single.",
        "Phase 3는 family별로 갈렸습니다. Kotlin은 ULID single과 KSUID seconds, Go는 ULID concurrent와 KSUID millis single에서 앞섰습니다.",
      ],
    ],
  ],
  [
    "exposed-batch-kotlinx-benchmark-map-01",
    [
      ["Batch benchmark comparison map", "Batch benchmark 비교 맵"],
      ["Profile, driver, and scenario structure for generated benchmark docs.", "생성된 benchmark docs의 profile, driver, scenario 구조입니다."],
      ["Benchmark", "Benchmark"],
      ["Profiles", "Profiles"],
      ["Virtual Threads", "Virtual Threads"],
      ["Coroutines", "Coroutines"],
      ["Seed", "Seed"],
      ["source insert", "source insert"],
      ["End-to-End", "End-to-End"],
      ["batch job", "batch job"],
      [
        "Each database detail page carries the measured chart images. The hub shows how profiles fan out into driver and scenario comparisons.",
        "각 database 상세 페이지가 측정 chart를 담고, hub는 profile이 driver와 scenario 비교로 어떻게 펼쳐지는지 보여줍니다.",
      ],
    ],
  ],
  [
    "exposed-batch-kotlinx-benchmark-summary-01",
    [
      ["Batch seed throughput by database", "Database별 batch seed 처리량"],
      ["Representative JDBC vs R2DBC seed throughput from generated benchmark tables.", "생성된 benchmark table에서 대표 JDBC vs R2DBC seed 처리량을 비교합니다."],
      ["Seed benchmark, dataSize 10000, poolSize 30. Log scale shows all DB/driver pairs in one chart.", "Seed benchmark, dataSize 10000, poolSize 30. log scale로 모든 DB/driver pair를 한 차트에 담았습니다."],
      ["ops/s, logarithmic scale", "ops/s, logarithmic scale"],
    ],
  ],
  [
    "exposed-batch-kotlinx-benchmark-postgresql-e2e-01",
    [
      ["PostgreSQL End-to-End Throughput", "PostgreSQL End-to-End 처리량"],
      ["parallelism 1", "parallelism 1"],
      ["parallelism 4", "parallelism 4"],
      ["parallelism 8", "parallelism 8"],
      ["log scale", "log scale"],
      ["Higher is better. Log scale keeps both drivers readable.", "높을수록 좋습니다. log scale로 두 driver를 모두 읽기 쉽게 유지했습니다."],
    ],
  ],
  [
    "io-http-base-throughput-chart-01",
    [
      ["HTTP client base throughput", "HTTP client 기본 처리량"],
      [
        "WebFlux fixture (GET /ping), @Threads(8), warmup 1×1s, measurement 1×1s, ops/s higher is better",
        "WebFlux fixture (GET /ping), @Threads(8), warmup 1×1s, measurement 1×1s, ops/s 높을수록 좋음",
      ],
    ],
  ],
  [
    "io-http-high-latency-throughput-chart-01",
    [
      ["HTTP client high-latency throughput", "HTTP client high-latency 처리량"],
      [
        "GET /httpbin/delay/0.05 · WebFlux fixture · @Threads(100) · ops/s, higher is better",
        "GET /httpbin/delay/0.05 · WebFlux fixture · @Threads(100) · ops/s, 높을수록 좋음",
      ],
      ["virtual thread", "virtual thread"],
      ["sync", "sync"],
      ["coroutine/async", "coroutine/async"],
      ["Ktor CIO row", "Ktor CIO row"],
      ["Equal-thread local snapshot", "동일 thread 수 local snapshot"],
      ["Source table remains canonical", "원본 표가 기준입니다"],
      ["Report snapshot: 2026-05-21", "Report snapshot: 2026-05-21"],
    ],
  ],
  [
    "graphdb-adoption-latency-chart",
    [
      ["Authorization Inheritance Adoption Latency", "Authorization Inheritance 채택 지연시간"],
      ["Large authorization inheritance benchmark latency. Lower milliseconds per operation is better.", "large authorization inheritance benchmark latency입니다. ms/op는 낮을수록 좋습니다."],
      ["large fixture, resolveResources, ms/op, lower is better", "large fixture, resolveResources, ms/op, 낮을수록 좋음"],
      ["long-chain (10 hops)", "long-chain (10 hops)"],
      ["deep-wide (12 hops)", "deep-wide (12 hops)"],
      ["Winner: Neo4j Cypher", "승자: Neo4j Cypher"],
      ["Winner: PostgreSQL CTE", "승자: PostgreSQL CTE"],
      ["PostgreSQL iterative", "PostgreSQL iterative"],
      ["AGE timeout; Memgraph load failed locally.", "AGE timeout; Memgraph local load 실패."],
    ],
  ],
]);

function sourcePathFor(name) {
  const canonical = `${out}/${name}.svg`;
  return existsSync(canonical) ? canonical : `${out}/${name}-en.svg`;
}

function replaceAllSorted(source, replacements) {
  let result = source;
  for (const [from, to] of [...replacements].sort((a, b) => b[0].length - a[0].length)) {
    result = result.replaceAll(from, to);
  }
  return result;
}

function normalizeEnglishFonts(source) {
  return source
    .replaceAll('"Comic Sans MS", "Comic Neue", sans-serif', '"Architects Daughter", "Comic Sans MS", cursive')
    .replaceAll('"Comic Mono", "Comic Sans MS", "Comic Neue", monospace', '"Comic Mono", "SFMono-Regular", Menlo, monospace')
    .replaceAll('"Comic Mono",Arial,sans-serif', '"Comic Mono","SFMono-Regular",Menlo,monospace')
    .replaceAll('"Comic Sans MS","Comic Sans","Comic Neue",Arial,sans-serif', '"Comic Mono","SFMono-Regular",Menlo,monospace');
}

function normalizeKoreanFonts(source) {
  return source
    .replaceAll('"Architects Daughter", "Comic Sans MS", cursive', '"goorm Sans", "Apple SD Gothic Neo", sans-serif')
    .replaceAll("'Architects Daughter', 'Comic Sans MS', cursive", "'goorm Sans', 'Apple SD Gothic Neo', sans-serif")
    .replaceAll('"Comic Mono", "SFMono-Regular", Menlo, monospace', '"goorm Sans Code", "goorm Sans", monospace')
    .replaceAll("'Comic Mono', 'SFMono-Regular', Menlo, monospace", "'goorm Sans Code', 'goorm Sans', monospace")
    .replaceAll('"Comic Mono","SFMono-Regular",Menlo,monospace', '"goorm Sans Code","goorm Sans",monospace')
    .replaceAll('"Comic Sans MS","Comic Sans","Comic Neue",Arial,sans-serif', '"goorm Sans Code","goorm Sans",monospace')
    .replaceAll('"Architects Daughter"', '"goorm Sans"')
    .replaceAll('"Comic Mono"', '"goorm Sans Code","goorm Sans"');
}

function normalizeAuditStructure(source, name) {
  let result = source;
  if (name === "exposed-batch-kotlinx-benchmark-map-01") {
    const routes = [
      '<polyline class="guide" points="350,195 430,197"/>',
      '<polyline class="guide" points="350,223 406,223 406,307 430,307"/>',
      '<polyline class="guide" points="350,251 394,251 394,417 430,417"/>',
      '<polyline class="guide" points="680,185 736,185 736,217 760,217"/>',
      '<polyline class="guide" points="680,209 712,209 712,379 760,379"/>',
      '<polyline class="guide" points="680,295 732,295 732,233 760,233"/>',
      '<polyline class="guide" points="680,319 736,319 736,407 760,407"/>',
      '<polyline class="guide" points="680,405 720,405 720,245 760,245"/>',
      '<polyline class="guide" points="680,429 716,429 716,411 760,411"/>',
      '<polyline class="guide" points="1020,205 1100,205"/>',
      '<polyline class="guide" points="1020,241 1060,241 1060,383 1100,383"/>',
      '<polyline class="guide" points="1020,385 1052,385 1052,241 1100,241"/>',
      '<polyline class="guide" points="1020,421 1100,421"/>',
    ].join("");
    result = result
      .replace(/<marker id="arrow"[\s\S]*?<\/marker>/, "")
      .replace(/marker-end:url\(#arrow\)/g, "")
      .replace(/\.line\{/g, ".guide{")
      .replace(/<path class="(?:connector )?line"[\s\S]*?(?=<text class="small" x="95" y="540">)/, routes);
  }
  if (name === "exposed-batch-kotlinx-benchmark-summary-01") {
    result = result.replace(/<marker id="arrow"[\s\S]*?<\/marker>/, "");
  }
  return result;
}

function prepare(source, name, locale) {
  const english = normalizeAuditStructure(normalizeEnglishFonts(source), name);
  if (locale === "en") return english;
  return normalizeKoreanFonts(replaceAllSorted(english, translations.get(name) ?? []));
}

for (const name of stems) {
  const source = readFileSync(sourcePathFor(name), "utf8");
  const outputs = [
    [`${out}/${name}-en.svg`, prepare(source, name, "en")],
    [`${out}/${name}-ko.svg`, prepare(source, name, "ko")],
  ];

  for (const [svg, contents] of outputs) {
    writeFileSync(svg, contents);
    execFileSync("xmllint", ["--noout", svg], { stdio: "inherit" });
    execFileSync("cairosvg", [svg, "-o", svg.replace(/\.svg$/, ".png"), "-s", "2"], { stdio: "inherit" });
  }

  for (const ext of ["svg", "png"]) {
    const legacy = `${out}/${name}.${ext}`;
    if (existsSync(legacy)) rmSync(legacy);
  }
}
