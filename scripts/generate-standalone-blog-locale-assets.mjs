import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const out = "public/assets";
const selected = new Set(process.argv.slice(2));

const translations = new Map([
  [
    "bluetape4k-rate-limit-workshop-architecture-02",
    [
      ["Bucket4j rate-limit workshop architecture", "Bucket4j 요청 제한 워크숍 아키텍처"],
      [
        "Client requests pass through proxy-aware caller identity selection, path-scoped WebFilters, Redis or Caffeine bucket storage, and response headers before reaching the application handler.",
        "클라이언트 요청은 프록시 인식 호출자 식별, 경로별 WebFilter, Redis 또는 Caffeine 버킷 저장소, 응답 헤더 처리를 거쳐 애플리케이션 핸들러로 전달됩니다.",
      ],
      ["rate limiting starts with the caller identity, not the bucket", "요청 제한은 버킷이 아니라 호출자 식별에서 시작합니다"],
      [
        "proxy trust decides the IP; filters decide the key shape; storage decides whether quota is local or shared",
        "프록시 신뢰가 IP를 정하고, 필터가 키 형태를 정하며, 저장소가 할당량의 로컬·공유 범위를 정합니다",
      ],
      ["Request source", "요청 출처"],
      ["HTTP request", "HTTP 요청"],
      ["trust proxy explicitly", "프록시 신뢰는 명시적으로"],
      ["spoof risk", "위조 위험"],
      ["Caller identity", "호출자 식별"],
      ["Key resolver", "키 결정기"],
      ["path-scoped key shape", "경로별 키 형태"],
      ["missing identity -> 400/401", "식별자 없음 → 400/401"],
      ["Bucket and handler", "버킷과 핸들러"],
      ["consume 1 token", "토큰 1개 소비"],
      ["write rate headers", "요청 제한 헤더 기록"],
      ["Retry", "재시도"],
      ["Redis shared", "Redis 공유"],
      ["Caffeine local", "Caffeine 로컬"],
      ["Handler runs", "핸들러 실행"],
    ],
  ],
  [
    "bluetape4k-rate-limit-workshop-spring-classes-01",
    [
      ["Spring configuration classes for Bucket4j rate limiting", "Bucket4j 요청 제한을 위한 Spring 설정 클래스"],
      [
        "Class diagram showing RateLimitConfig bean wiring, bluetape4k SuspendRateLimiter and DistributedSuspendRateLimiter, AsyncBucketProxyProvider, RequestUtils, RateLimitResult, and the WebFlux filter.",
        "RateLimitConfig 빈 조립, bluetape4k SuspendRateLimiter와 DistributedSuspendRateLimiter, AsyncBucketProxyProvider, RequestUtils, RateLimitResult, WebFlux 필터의 관계를 보여주는 클래스 다이어그램입니다.",
      ],
      ["Spring configuration wires policies, providers, and limiters", "Spring 설정은 정책·공급자·제한기를 연결합니다"],
      [
        "RateLimitConfig creates strategy-specific beans; WebFilter consumes through bluetape4k's stable result boundary",
        "RateLimitConfig는 전략별 빈을 만들고, WebFilter는 bluetape4k의 안정적인 결과 경계를 사용합니다",
      ],
      ["Workshop Spring layer", "워크숍 Spring 계층"],
      ["Policy and helper beans", "정책과 보조 빈"],
      ["bluetape4k limiter API", "bluetape4k 제한기 API"],
      ["capacity + refill rules", "용량 + 보충 규칙"],
      ["one policy per strategy", "전략마다 정책 하나"],
      ["user/combined variants", "사용자·복합 변형"],
      ["policy", "정책"],
      ["provider", "공급자"],
      ["limiter", "제한기"],
      ["implements", "구현"],
      ["uses", "사용"],
      ["returns", "반환"],
      ["solid = implements", "실선 = 구현"],
      ["dashed = creates / uses / returns", "점선 = 생성 / 사용 / 반환"],
    ],
  ],
  [
    "coroutine-observability-trace-flow-01",
    [
      ["Coroutine observability signal map", "코루틴 관측성 신호 지도"],
      [
        "Architecture diagram separating the coroutine request path from metrics scraping, dashboard querying, and trace export.",
        "코루틴 요청 경로와 메트릭 수집, 대시보드 조회, 추적 정보 전송 경로를 분리한 구조도입니다.",
      ],
      ["Coroutine Observability: Work Path vs Observe Path", "코루틴 관측성: 업무 경로와 관찰 경로"],
      [
        "Coroutine spans stay with suspend work; metrics and dashboards observe after the work is recorded.",
        "코루틴 span은 일시 중단 작업과 함께 흐르고, 메트릭과 대시보드는 기록된 신호만 관찰합니다.",
      ],
      ["Work-producing request path", "업무를 수행하는 요청 경로"],
      ["Observe-only path", "관찰 전용 경로"],
      ["HTTP Client", "HTTP 클라이언트"],
      ["business request", "업무 요청"],
      ["traceparent optional", "traceparent 선택 사항"],
      ["Spring / Ktor", "Spring / Ktor"],
      ["suspend handler", "suspend 핸들러"],
      ["server span", "서버 span"],
      ["Observation Scope", "관찰 범위"],
      ["current span", "현재 span"],
      ["coroutine context", "코루틴 문맥"],
      ["Suspend Service", "suspend 서비스"],
      ["child spans", "자식 span"],
      ["no runCatching", "runCatching 사용 금지"],
      ["DB / HTTP Client", "DB / HTTP 클라이언트"],
      ["db.find / cache.get", "db.find / cache.get"],
      ["http.client.requests", "http.client.requests"],
      ["Zipkin Collector", "Zipkin 수집기"],
      ["trace export", "추적 정보 전송"],
      ["span tree query", "span 트리 조회"],
      ["Actuator / Registry", "Actuator / 레지스트리"],
      ["meters exposed", "메트릭 노출"],
      ["/actuator/metrics", "/actuator/metrics"],
      ["Prometheus", "Prometheus"],
      ["scrape metrics", "메트릭 수집"],
      ["store series", "시계열 저장"],
      ["Grafana", "Grafana"],
      ["query Prometheus", "Prometheus 조회"],
      ["dashboards only", "대시보드 전용"],
      ["record meters", "메트릭 기록"],
      ["export spans", "span 전송"],
      ["scrape", "scrape"],
      ["query", "조회"],
      ["Source-backed contract", "구현 근거로 확인한 계약"],
      [
        "Prometheus, Grafana, Zipkin, Actuator, and registries observe recorded signals. They do not trigger business work.",
        "Prometheus, Grafana, Zipkin, Actuator와 registry는 기록된 신호를 관찰할 뿐 업무 작업을 실행하지 않습니다.",
      ],
      ["Sources: micrometer-tracing-coroutines, observability-basic, observability-advanced", "출처: micrometer-tracing-coroutines, observability-basic, observability-advanced"],
    ],
  ],
  [
    "coroutine-observability-readiness-sequence-01",
    [
      ["Readiness contract sequence", "준비 상태 계약 시퀀스"],
      [
        "Sequence diagram showing readiness probes, Spring Actuator or Ktor readyz endpoint, readiness state, repository ping, and database response branches.",
        "Readiness probe, Spring Actuator 또는 Ktor readyz endpoint, readiness state, repository ping, database response branch를 보여주는 sequence diagram입니다.",
      ],
      ["Readiness Probe Is an Operational Contract", "준비 상태 점검은 운영 계약입니다"],
      [
        "Spring uses Actuator readiness; Ktor exposes /readyz, but both must prove database reachability.",
        "Spring은 Actuator 준비 상태를 사용하고 Ktor는 /readyz를 노출하지만, 둘 다 DB 접근 가능성을 증명해야 합니다.",
      ],
      ["Probe", "점검 요청"],
      ["Kubernetes", "Kubernetes"],
      ["Readiness Endpoint", "준비 상태 엔드포인트"],
      ["Actuator or /readyz", "Actuator 또는 /readyz"],
      ["ReadinessState", "ReadinessState"],
      ["degrade switch", "장애 모의 상태"],
      ["Repository", "저장소"],
      ["ping / record", "연결 확인 / 조회"],
      ["Database", "데이터베이스"],
      ["Exposed JDBC", "Exposed JDBC"],
      ["GET readiness endpoint", "준비 상태 엔드포인트 GET"],
      ["read example state first", "모의 상태 먼저 확인"],
      ["databaseAvailable=true", "databaseAvailable=true"],
      ["alt database is reachable", "조건: DB 접근 가능"],
      ["repository.ping()", "repository.ping()"],
      ["SELECT 1 / ping", "SELECT 1 / ping"],
      ["reachable", "접근 가능"],
      ["HTTP 200, status UP", "HTTP 200, status UP"],
      ["else example state or DB ping is degraded", "그 외: 모의 상태 또는 DB 연결 확인 실패"],
      ["HTTP 503, status DOWN", "HTTP 503, status DOWN"],
      [
        "Tests assert UP/DOWN responses, request-id echo/sanitize, and structured validation errors for Spring and Ktor examples.",
        "테스트는 Spring과 Ktor 예제의 UP/DOWN 응답, 요청 ID 정제·반환, 구조화된 검증 오류를 확인합니다.",
      ],
      [
        "Sources: exposed-workshop 09-spring-observability-readiness and 10-ktor-observability-readiness",
        "출처: exposed-workshop 09-spring-observability-readiness, 10-ktor-observability-readiness",
      ],
    ],
  ],
]);

const sequenceNumbers = `
<g id="visible-message-numbers">
  <text class="msg num" x="110" y="306">1</text>
  <text class="msg num" x="456" y="392">2</text>
  <text class="msg num" x="494" y="486">3</text>
  <text class="msg num" x="728" y="640">4</text>
  <text class="msg num" x="1028" y="640">5</text>
  <text class="msg num" x="1018" y="756">6</text>
  <text class="msg num" x="510" y="826">7</text>
  <text class="msg num" x="484" y="1006">8</text>
</g>`;

function sourcePathFor(name) {
  const canonical = `${out}/${name}.svg`;
  return existsSync(canonical) ? canonical : `${out}/${name}-en.svg`;
}

function localize(source, replacements) {
  let result = source;
  for (const [from, to] of [...replacements].sort((a, b) => b[0].length - a[0].length)) {
    result = result.replaceAll(from, to);
  }
  return result;
}

function normalizeFonts(source, locale) {
  if (locale !== "ko") return source;
  return source
    .replaceAll('"Architects Daughter"', '"goorm Sans"')
    .replaceAll('"Comic Mono"', '"goorm Sans Code"')
    .replaceAll('"Comic Sans MS"', '"goorm Sans"')
    .replaceAll("font-family:\"Architects Daughter\"", "font-family:\"goorm Sans\"")
    .replaceAll("font-family:\"Comic Mono\"", "font-family:\"goorm Sans Code\"");
}

function normalizeConnectors(source) {
  return source
    .replaceAll('class="line-blue"', 'class="connector line-blue"')
    .replaceAll('class="line-green"', 'class="connector line-green"')
    .replaceAll('class="line-amber"', 'class="connector line-amber"')
    .replaceAll('class="line-red"', 'class="connector line-red"')
    .replace(/(<path id="[^"]+" class=")(dep|assoc|inherit|return)(" data-edge=)/g, "$1connector $2$3");
}

function darken(source) {
  if (source.includes('stop-color="#101827"')) {
    return source.replaceAll('stop-color="#f8fafc"', 'stop-color="#172033"');
  }
  const colors = new Map([
    ["#fbfcf8", "#08111f"],
    ["#fbfaf7", "#08111f"],
    ["#ffffff", "#111827"],
    ["#f3ecdf", "#2a2117"],
    ["#f8f1e6", "#2a2117"],
    ["#fff5f5", "#321b24"],
    ["#ccd7da", "#52627a"],
    ["#d7e0e4", "#52627a"],
    ["#263238", "#f8fafc"],
    ["#36464f", "#d8e5f2"],
    ["#1f3138", "#f8fafc"],
    ["#546a73", "#b6c4d6"],
    ["#60727d", "#a9b8ca"],
    ["#ede9fe", "#2b2147"],
    ["#dcfce7", "#123524"],
    ["#5b21b6", "#c4b5fd"],
    ["#166534", "#86efac"],
    ["#1f2937", "#f8fafc"],
    ["#475569", "#a9b8ca"],
    ["#64748b", "#b6c4d6"],
    ["#eef6ff", "#10243a"],
    ["#f5f3ff", "#241b3b"],
    ["#f7f4ff", "#241b3b"],
    ["#d8ccff", "#6847a8"],
    ["#f1f5f9", "#172033"],
    ["#fffef7", "#172033"],
    ["#cbd5e1", "#52627a"],
    ["#e0f2fe", "#102a43"],
    ["#b9d7ff", "#315f8f"],
    ["#2f6f8e", "#7dd3fc"],
    ["#55783f", "#a3d977"],
    ["#7f6038", "#e8c58f"],
    ["#9d4f4f", "#fda4af"],
  ]);
  let result = source;
  for (const [from, to] of colors) result = result.replaceAll(from, to);
  return result.replaceAll('stop-color="#f8fafc"', 'stop-color="#172033"');
}

function normalizeSequence(source) {
  let result = source
    .replace(/<g id="visible-message-numbers">[\s\S]*?<\/g>\s*/, "")
    .replace('width="1288" height="364" rx="14" class="alt"', 'width="1288" height="520" rx="14" class="alt"');
  return result.replace("</svg>", `${sequenceNumbers}\n</svg>`);
}

function normalizeSpringClasses(source) {
  return source
    .replace('<rect class="class-card spring" x="90" y="670" width="290" height="190"/>', '<rect class="class-card spring" x="90" y="670" width="290" height="205"/>')
    .replace(/\.class-name \{ font: [\d.]+px/, ".class-name { font: 14px")
    .replace('.member { font: 12.5px', '.member { font: 10.8px')
    .replace(
      '<text class="member" x="502" y="812">+ extractIp(exchange, trustProxy)</text>',
      '<text class="member" x="502" y="808">+ extractIp(exchange,</text>\n    <text class="member" x="522" y="830">trustProxy)</text>',
    )
    .replace(
      '<text class="member" x="112" y="844">+ filter(exchange, chain): Mono&lt;Void&gt;</text>',
      '<text class="member" x="112" y="836">+ filter(exchange, chain)</text>\n    <text class="member" x="132" y="852">: Mono&lt;Void&gt;</text>',
    )
    .replace(
      '<text class="member" x="877" y="812">status: CONSUMED | REJECTED | ERROR</text>',
      '<text class="member" x="877" y="806">status: CONSUMED | REJECTED</text>\n    <text class="member" x="897" y="828">| ERROR</text>',
    )
    .replace(".legend { font: 12px \"Comic Mono\", ui-monospace, monospace; fill: #52627a; }", ".legend { font: 12px \"Comic Mono\", ui-monospace, monospace; fill: #b6c4d6; }")
    .replace('x="866" y="895"', 'x="866" y="884"');
}

function prepare(source, name, replacements, locale) {
  let result = darken(normalizeConnectors(source));
  if (name.includes("spring-classes")) result = normalizeSpringClasses(result);
  if (name.includes("readiness-sequence")) result = normalizeSequence(result);
  if (locale === "ko") result = localize(result, replacements);
  return normalizeFonts(result, locale);
}

for (const [name, replacements] of translations) {
  if (selected.size > 0 && !selected.has(name)) continue;
  const source = readFileSync(sourcePathFor(name), "utf8");
  const enSvg = `${out}/${name}-en.svg`;
  const koSvg = `${out}/${name}-ko.svg`;

  writeFileSync(enSvg, prepare(source, name, replacements, "en"));
  writeFileSync(koSvg, prepare(source, name, replacements, "ko"));

  for (const svg of [enSvg, koSvg]) {
    execFileSync("xmllint", ["--noout", svg], { stdio: "inherit" });
    execFileSync("cairosvg", [svg, "-o", svg.replace(/\.svg$/, ".png"), "-s", "2"], { stdio: "inherit" });
  }

  for (const ext of ["svg", "png"]) {
    const legacy = `${out}/${name}.${ext}`;
    if (existsSync(legacy)) rmSync(legacy);
  }
}
