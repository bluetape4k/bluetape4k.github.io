import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const out = "public/assets";

const translations = new Map([
  [
    "bluetape4k-rate-limit-workshop-architecture-02",
    [
      ["Bucket4j rate-limit workshop architecture", "Bucket4j rate-limit 워크숍 아키텍처"],
      [
        "Client requests pass through proxy-aware caller identity selection, path-scoped WebFilters, Redis or Caffeine bucket storage, and response headers before reaching the application handler.",
        "클라이언트 요청은 프록시 인식 호출자 식별, 경로별 WebFilter, Redis 또는 Caffeine 버킷 저장소, 응답 헤더 처리를 거쳐 애플리케이션 핸들러로 전달됩니다.",
      ],
      ["rate limiting starts with the caller identity, not the bucket", "rate limiting은 bucket이 아니라 caller identity에서 시작합니다"],
      [
        "proxy trust decides the IP; filters decide the key shape; storage decides whether quota is local or shared",
        "proxy 신뢰가 IP를 정하고, filter가 key 형태를 정하며, storage가 quota의 local/shared 여부를 정합니다",
      ],
      ["Request source", "요청 출처"],
      ["HTTP request", "HTTP 요청"],
      ["trust proxy explicitly", "proxy 신뢰는 명시적으로"],
      ["spoof risk", "spoof 위험"],
      ["Caller identity", "호출자 식별"],
      ["Key resolver", "Key resolver"],
      ["path-scoped key shape", "경로별 key 형태"],
      ["missing identity -> 400/401", "identity 없음 → 400/401"],
      ["Bucket and handler", "Bucket과 handler"],
      ["consume 1 token", "token 1개 소비"],
      ["write rate headers", "rate header 기록"],
      ["Retry", "Retry"],
      ["Redis shared", "Redis shared"],
      ["Caffeine local", "Caffeine local"],
      ["Handler runs", "Handler 실행"],
    ],
  ],
  [
    "bluetape4k-rate-limit-workshop-spring-classes-01",
    [
      ["Spring configuration classes for Bucket4j rate limiting", "Bucket4j rate limiting을 위한 Spring configuration classes"],
      [
        "Class diagram showing RateLimitConfig bean wiring, bluetape4k SuspendRateLimiter and DistributedSuspendRateLimiter, AsyncBucketProxyProvider, RequestUtils, RateLimitResult, and the WebFlux filter.",
        "RateLimitConfig bean wiring, bluetape4k SuspendRateLimiter와 DistributedSuspendRateLimiter, AsyncBucketProxyProvider, RequestUtils, RateLimitResult, WebFlux filter의 관계를 보여주는 class diagram입니다.",
      ],
      ["Spring configuration wires policies, providers, and limiters", "Spring configuration은 policy, provider, limiter를 연결합니다"],
      [
        "RateLimitConfig creates strategy-specific beans; WebFilter consumes through bluetape4k's stable result boundary",
        "RateLimitConfig는 strategy별 bean을 만들고, WebFilter는 bluetape4k의 안정적인 result boundary를 통해 소비합니다",
      ],
      ["Workshop Spring layer", "Workshop Spring layer"],
      ["Policy and helper beans", "Policy와 helper beans"],
      ["bluetape4k limiter API", "bluetape4k limiter API"],
      ["capacity + refill rules", "capacity + refill rules"],
      ["one policy per strategy", "strategy마다 policy 하나"],
      ["user/combined variants", "user/combined variants"],
      ["policy", "policy"],
      ["provider", "provider"],
      ["limiter", "limiter"],
      ["implements", "implements"],
      ["uses", "uses"],
      ["returns", "returns"],
      ["solid = implements", "실선 = implements"],
      ["dashed = creates / uses / returns", "점선 = creates / uses / returns"],
    ],
  ],
  [
    "coroutine-observability-trace-flow-01",
    [
      ["Coroutine observability signal map", "Coroutine observability signal map"],
      [
        "Architecture diagram separating the coroutine request path from metrics scraping, dashboard querying, and trace export.",
        "Coroutine request path와 metrics scraping, dashboard query, trace export 경로를 분리해 보여주는 architecture diagram입니다.",
      ],
      ["Coroutine Observability: Work Path vs Observe Path", "Coroutine Observability: Work Path vs Observe Path"],
      [
        "Coroutine spans stay with suspend work; metrics and dashboards observe after the work is recorded.",
        "Coroutine span은 suspend 작업과 함께 흐르고, metrics와 dashboard는 기록된 뒤의 신호만 관찰합니다.",
      ],
      ["Work-producing request path", "업무를 수행하는 request path"],
      ["Observe-only path", "관찰 전용 path"],
      ["HTTP Client", "HTTP Client"],
      ["business request", "업무 요청"],
      ["traceparent optional", "traceparent optional"],
      ["Spring / Ktor", "Spring / Ktor"],
      ["suspend handler", "suspend handler"],
      ["server span", "server span"],
      ["Observation Scope", "Observation Scope"],
      ["current span", "current span"],
      ["coroutine context", "coroutine context"],
      ["Suspend Service", "Suspend Service"],
      ["child spans", "child spans"],
      ["no runCatching", "no runCatching"],
      ["DB / HTTP Client", "DB / HTTP Client"],
      ["db.find / cache.get", "db.find / cache.get"],
      ["http.client.requests", "http.client.requests"],
      ["Zipkin Collector", "Zipkin Collector"],
      ["trace export", "trace export"],
      ["span tree query", "span tree query"],
      ["Actuator / Registry", "Actuator / Registry"],
      ["meters exposed", "meter 노출"],
      ["/actuator/metrics", "/actuator/metrics"],
      ["Prometheus", "Prometheus"],
      ["scrape metrics", "metrics scrape"],
      ["store series", "series 저장"],
      ["Grafana", "Grafana"],
      ["query Prometheus", "Prometheus query"],
      ["dashboards only", "dashboard only"],
      ["record meters", "meter 기록"],
      ["export spans", "span export"],
      ["scrape", "scrape"],
      ["query", "query"],
      ["Source-backed contract", "Source-backed contract"],
      [
        "Prometheus, Grafana, Zipkin, Actuator, and registries observe recorded signals. They do not trigger business work.",
        "Prometheus, Grafana, Zipkin, Actuator, registry는 기록된 signal을 관찰할 뿐 업무 작업을 실행하지 않습니다.",
      ],
      ["Sources: micrometer-tracing-coroutines, observability-basic, observability-advanced", "Sources: micrometer-tracing-coroutines, observability-basic, observability-advanced"],
    ],
  ],
  [
    "coroutine-observability-readiness-sequence-01",
    [
      ["Readiness contract sequence", "Readiness contract sequence"],
      [
        "Sequence diagram showing readiness probes, Spring Actuator or Ktor readyz endpoint, readiness state, repository ping, and database response branches.",
        "Readiness probe, Spring Actuator 또는 Ktor readyz endpoint, readiness state, repository ping, database response branch를 보여주는 sequence diagram입니다.",
      ],
      ["Readiness Probe Is an Operational Contract", "Readiness Probe는 운영 계약입니다"],
      [
        "Spring uses Actuator readiness; Ktor exposes /readyz, but both must prove database reachability.",
        "Spring은 Actuator readiness를 쓰고 Ktor는 /readyz를 노출하지만, 둘 다 database reachability를 증명해야 합니다.",
      ],
      ["Probe", "Probe"],
      ["Kubernetes", "Kubernetes"],
      ["Readiness Endpoint", "Readiness Endpoint"],
      ["Actuator or /readyz", "Actuator 또는 /readyz"],
      ["ReadinessState", "ReadinessState"],
      ["degrade switch", "degrade switch"],
      ["Repository", "Repository"],
      ["ping / record", "ping / record"],
      ["Database", "Database"],
      ["Exposed JDBC", "Exposed JDBC"],
      ["GET readiness endpoint", "GET readiness endpoint"],
      ["read example state first", "example state 먼저 확인"],
      ["databaseAvailable=true", "databaseAvailable=true"],
      ["alt database is reachable", "alt database reachable"],
      ["repository.ping()", "repository.ping()"],
      ["SELECT 1 / ping", "SELECT 1 / ping"],
      ["reachable", "reachable"],
      ["HTTP 200, status UP", "HTTP 200, status UP"],
      ["else example state or DB ping is degraded", "else example state 또는 DB ping degraded"],
      ["HTTP 503, status DOWN", "HTTP 503, status DOWN"],
      [
        "Tests assert UP/DOWN responses, request-id echo/sanitize, and structured validation errors for Spring and Ktor examples.",
        "Tests는 Spring과 Ktor examples의 UP/DOWN response, request-id echo/sanitize, structured validation error를 검증합니다.",
      ],
      [
        "Sources: exposed-workshop 09-spring-observability-readiness and 10-ktor-observability-readiness",
        "Sources: exposed-workshop 09-spring-observability-readiness and 10-ktor-observability-readiness",
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

function normalizeSequence(source) {
  let result = source
    .replace(/<g id="visible-message-numbers">[\s\S]*?<\/g>\s*/, "")
    .replace('width="1288" height="364" rx="14" class="alt"', 'width="1288" height="520" rx="14" class="alt"');
  return result.replace("</svg>", `${sequenceNumbers}\n</svg>`);
}

function normalizeSpringClasses(source) {
  return source
    .replace('<rect class="class-card spring" x="90" y="670" width="290" height="190"/>', '<rect class="class-card spring" x="90" y="670" width="290" height="205"/>')
    .replace('.class-name { font: 18px', '.class-name { font: 14px')
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
    );
}

function prepare(source, name, replacements, locale) {
  let result = normalizeConnectors(source);
  if (name.includes("spring-classes")) result = normalizeSpringClasses(result);
  if (name.includes("readiness-sequence")) result = normalizeSequence(result);
  if (locale === "ko") result = localize(result, replacements);
  return normalizeFonts(result, locale);
}

for (const [name, replacements] of translations) {
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
