import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const out = "public/assets";
const selected = new Set(process.argv.slice(2));

const translations = new Map([
  ["transactional-outbox-idempotency-flow-01", [
    ["Transactional Outbox + Idempotency", "트랜잭셔널 아웃박스 + 멱등성"],
    ["Persist the request outcome and delivery intent before any retry boundary leaves the process.", "재시도 경계가 프로세스를 벗어나기 전에 요청 결과와 전달 의도를 저장합니다."],
    ["request transaction", "요청 트랜잭션"],
    ["after-commit delivery and retry", "커밋 후 전달과 재시도"],
    ["command + key", "명령 + 키"],
    ["HTTP App", "HTTP 앱"],
    ["validates input", "입력 검증"],
    ["Idempotency Gate", "멱등성 가드"],
    ["unique key", "고유 키"],
    ["read existing row", "기존 행 조회"],
    ["DB Transaction", "DB 트랜잭션"],
    ["domain row", "도메인 행"],
    ["outbox row", "outbox 행"],
    ["one commit", "한 번의 커밋"],
    ["Duplicate Result", "중복 결과"],
    ["same key returns stored result", "같은 키는 저장된 결과 반환"],
    ["Outbox Table", "Outbox 테이블"],
    ["PENDING rows", "PENDING 행"],
    ["durable intent", "내구성 있는 전달 의도"],
    ["Relay Worker", "릴레이 작업자"],
    ["poll after commit", "커밋 후 폴링"],
    ["record delivery", "전달 결과 기록"],
    ["external boundary", "외부 경계"],
    ["Retry Ledger", "재시도 원장"],
    ["dead letter at budget", "예산 소진 시 dead letter"],
    ["key check", "키 확인"],
    ["write TX", "TX 기록"],
    ["duplicate", "중복"],
    ["commit exposes", "커밋 후 노출"],
    ["publish", "발행"],
    ["send failed", "전송 실패"],
    ["persist retry", "재시도 저장"],
    ["next retry poll", "다음 재시도 폴링"],
    ["request path", "요청 경로"],
    ["transaction commit", "트랜잭션 커밋"],
    ["after-commit delivery", "커밋 후 전달"],
    ["failure response", "실패 응답"],
    ["retry decision", "재시도 결정"],
  ]],
  ["transactional-outbox-idempotency-sequence-01", [
    ["First Call, Same-Key Retry, Relay Retry", "첫 호출, 동일 키 재시도, 릴레이 재시도"],
    ["Idempotency protects the request path; the outbox protects delivery after commit.", "멱등성은 요청 경로를, outbox는 커밋 후 전달을 보호합니다."],
    ["caller", "호출자"],
    ["HTTP endpoint", "HTTP endpoint"],
    ["Exposed TX", "Exposed TX"],
    ["External API", "외부 API"],
    ["after commit", "커밋 후"],
    ["first call", "첫 호출"],
    ["same key retry", "동일 키 재시도"],
    ["loop relay retry", "loop 릴레이 재시도"],
    ["insert pending command + outbox row", "pending 명령 + outbox 행 저장"],
    ["charge once outside duplicate path", "중복 경로 밖에서 한 번 결제"],
    ["mark succeeded; response row is durable", "성공 표시, 응답 행 영속화"],
    ["POST again with same key", "같은 키로 다시 POST"],
    ["read existing row; no API call", "기존 행 조회, API 호출 없음"],
    ["200 OK uses stored result", "200 OK, 저장 결과 사용"],
    ["poll pending or retryable rows", "pending / retry 가능 행 폴링"],
    ["publish event", "이벤트 발행"],
    ["failure response", "실패 응답"],
    ["attempts + 1; retryable or dead letter", "attempts + 1, 재시도 또는 dead letter"],
    ["retry publish succeeds", "재발행 성공"],
    ["mark published in outbox", "outbox에 발행 완료 표시"],
    ["Same-key HTTP retries reuse stored state; relay retries are driven by persisted outbox attempts and status.", "동일 키 HTTP 재시도는 저장 상태를 재사용하고, 릴레이 재시도는 outbox의 attempts와 status를 따릅니다."],
  ]],
  ["transactional-outbox-kafka-first-fallback-part2-architecture-01", [
    ["Transactional Outbox Part 2: Kafka-first fallback", "트랜잭셔널 아웃박스 2부: Kafka 우선, 영속 대체 경로"],
    ["The DB transaction persists orders only; direct publish uses topic retry/DLQ before durable fallback rows.", "DB 트랜잭션은 주문만 저장하고, 직접 발행은 영속 대체 행보다 토픽 재시도와 배달 불가 큐를 먼저 사용합니다."],
    ["Hot request path", "핵심 요청 경로"],
    ["Fallback path", "대체 발행 경로"],
    ["Repair gap", "복구 공백"],
    ["validate request", "요청 검증"],
    ["return status", "상태 반환"],
    ["Order Tx", "주문 트랜잭션"],
    ["insert orders row", "orders 행 저장"],
    ["no publication row", "발행 행 없음"],
    ["Direct Kafka", "Kafka 직접 발행"],
    ["3 retries -> DLQ", "3회 재시도 → 배달 불가 큐"],
    ["fallback if no ack", "수신 확인 없으면 대체 경로"],
    ["API Response", "API 응답"],
    ["or fallback status", "또는 대체 발행 상태"],
    ["domain source", "도메인 원본"],
    ["reconcile input", "복구 입력"],
    ["claimed relay rows", "선점된 릴레이 행"],
    ["claim by worker", "작업자가 선점"],
    ["Relay Worker", "릴레이 작업자"],
    ["mark published", "발행 완료 표시"],
    ["order events", "주문 이벤트"],
    ["Reconciler", "복구 작업자"],
    ["rebuild missing event rows", "누락 이벤트 행 복구"],
    ["orders only", "orders만 존재"],
    ["unconfirmed fallback", "확인되지 않은 대체 발행"],
    ["topic / DLQ covered", "토픽 / 배달 불가 큐가 처리"],
    ["claim batch + TTL", "배치 선점 + TTL"],
    ["FALLBACK_STORE_FAILED repair", "FALLBACK_STORE_FAILED 항목 복구"],
    ["bluetape4k-workshop messaging/kafka-outbox-fallback, PR #349", "bluetape4k-workshop messaging/kafka-outbox-fallback"],
    ["Source:", "출처:"],
  ]],
  ["transactional-outbox-kafka-first-fallback-part2-sequence-01", [
    ["Kafka-first Fallback Publication Flow", "Kafka 우선 발행과 영속 대체 흐름"],
    ["The order transaction writes only orders; fallback rows exist only after direct Kafka publish fails.", "주문 트랜잭션은 orders만 쓰고, 대체 행은 Kafka 직접 발행 실패 뒤에만 생성됩니다."],
    ["HTTP caller", "HTTP 요청자"],
    ["Client", "클라이언트"],
    ["Order API", "주문 API"],
    ["Order Tx", "주문 트랜잭션"],
    ["Publisher", "발행자"],
    ["Kafka Topic", "Kafka 토픽"],
    ["Outbox DB", "아웃박스 DB"],
    ["Relay", "릴레이"],
    ["orders only", "orders만"],
    ["direct or fallback", "직접 또는 대체 발행"],
    ["order events", "주문 이벤트"],
    ["fallback rows", "대체 발행 행"],
    ["scheduled", "스케줄 실행"],
    ["save order inside TransactionalOrderWriter", "TransactionalOrderWriter에서 주문 저장"],
    ["orders row committed; no publication row", "orders 커밋, 발행 행 없음"],
    ["alt direct Kafka publish succeeds", "조건: Kafka 직접 발행 성공"],
    ["else publish fails or times out after 3 attempts", "그 외: 3회 시도 뒤 실패 또는 시간 초과"],
    ["send event to Kafka topic", "Kafka 토픽으로 이벤트 전송"],
    ["PUBLISHED_DIRECT response", "PUBLISHED_DIRECT 응답"],
    ["upsert NOT_PUBLISHED fallback row", "NOT_PUBLISHED 대체 행 삽입 또는 갱신"],
    ["FALLBACK_STORED response", "FALLBACK_STORED 응답"],
    ["loop scheduled relay claim", "반복: 예약된 릴레이 선점"],
    ["claim eligible rows", "대상 행 선점"],
    ["payload batch", "이벤트 본문 배치"],
    ["send to Kafka and mark PUBLISHED", "Kafka 전송 후 PUBLISHED 표시"],
    ["Reconciler scans old orders without publication rows and rebuilds deterministic fallback rows only for the repair gap.", "복구 작업자는 발행 행이 없는 오래된 주문을 찾아 유실 가능 구간에만 결정적 대체 행을 만듭니다."],
    ["bluetape4k-workshop messaging/kafka-outbox-fallback, PR #349", "bluetape4k-workshop messaging/kafka-outbox-fallback"],
    ["Source:", "출처:"],
  ]],
]);

function fonts(source, locale) {
  if (locale === "ko") {
    return source
      .replaceAll('"Architects Daughter", "Comic Sans MS", cursive', '"goorm Sans"')
      .replaceAll('"Comic Mono", "SFMono-Regular", monospace', '"goorm Sans Code"')
      .replaceAll('"Architects Daughter"', '"goorm Sans"')
      .replaceAll('"Comic Mono"', '"goorm Sans Code"')
      .replaceAll('"Architects Daughter","Comic Mono","Comic Sans MS",system-ui,sans-serif', '"goorm Sans"')
      .replaceAll('"Comic Mono","Architects Daughter",monospace', '"goorm Sans Code"');
  }
  return source;
}

function localize(source, replacements) {
  let result = source;
  for (const [from, to] of [...replacements].sort((a, b) => b[0].length - a[0].length)) {
    result = result.replaceAll(from, to);
  }
  return result;
}

function normalizeStructure(name, source) {
  if (name !== "transactional-outbox-kafka-first-fallback-part2-sequence-01") return source;
  return source
    .replace('<rect x="348" y="318" width="14" height="186" rx="6" class="activation"/>', '<rect x="348" y="304" width="14" height="200" rx="6" class="activation"/>')
    .replace('<rect x="605" y="382" width="14" height="70" rx="6" class="activation"/>', '<rect x="605" y="368" width="14" height="84" rx="6" class="activation"/>')
    .replace('<rect x="1508" y="826" width="14" height="342" rx="6" class="activation"/>', '<rect x="1508" y="826" width="14" height="356" rx="6" class="activation"/>');
}

function darken(source) {
  const colors = new Map([
    ["#fbfaf7", "#08111f"],
    ["#fbfcf8", "#08111f"],
    ["#ffffff", "#111827"],
    ["#fffef7", "#172033"],
    ["#eef6ff", "#10243a"],
    ["#fff7ed", "#2a2117"],
    ["#f1f5f9", "#172033"],
    ["#f8f1e6", "#2a2117"],
    ["#cbd5e1", "#52627a"],
    ["#b9d7ff", "#315f8f"],
    ["#fed7aa", "#8b5a2b"],
    ["#1f2937", "#f8fafc"],
    ["#475569", "#a9b8ca"],
    ["#64748b", "#b6c4d6"],
    ["#e0f2fe", "#102a43"],
    ["#dcfce7", "#123524"],
    ["#ede9fe", "#2b2147"],
    ["#92400e", "#f5bd73"],
    ["#1d4ed8", "#93c5fd"],
    ["#166534", "#86efac"],
    ["#5b21b6", "#c4b5fd"],
    ["#263238", "#f8fafc"],
    ["#36464f", "#d8e5f2"],
    ["#1f3138", "#f8fafc"],
    ["#546a73", "#b6c4d6"],
    ["#60727d", "#a9b8ca"],
    ["#f3ecdf", "#2a2117"],
    ["#d7e0e4", "#52627a"],
    ["#fff5f5", "#321b24"],
    ["#eaf4f8", "#102a43"],
    ["#fff4df", "#332718"],
    ["#eef7f0", "#173522"],
    ["#fff7e8", "#342718"],
    ["#fff0f0", "#321b24"],
    ["#2f6f8e", "#7dd3fc"],
    ["#855a29", "#f5bd73"],
    ["#55783f", "#a3d977"],
    ["#7f6038", "#e8c58f"],
    ["#9d4f4f", "#fda4af"],
  ]);
  let result = source;
  for (const [from, to] of colors) result = result.replaceAll(from, to);
  return result;
}

for (const [name, replacements] of translations) {
  if (selected.size > 0 && !selected.has(name)) continue;
  const canonical = `${out}/${name}.svg`;
  const sourcePath = existsSync(canonical) ? canonical : `${out}/${name}-en.svg`;
  const source = darken(normalizeStructure(name, readFileSync(sourcePath, "utf8")))
    .replaceAll(", PR #349", "");
  const enSvg = `${out}/${name}-en.svg`;
  const koSvg = `${out}/${name}-ko.svg`;
  writeFileSync(enSvg, fonts(source, "en"));
  writeFileSync(koSvg, fonts(localize(source, replacements), "ko"));
  for (const svg of [enSvg, koSvg]) {
    execFileSync("xmllint", ["--noout", svg]);
    execFileSync("cairosvg", [svg, "-o", svg.replace(/\.svg$/, ".png"), "-s", "2"]);
  }
  if (existsSync(canonical)) rmSync(canonical);
  const png = `${out}/${name}.png`;
  if (existsSync(png)) rmSync(png);
}
