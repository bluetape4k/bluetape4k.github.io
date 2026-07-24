import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const out = "public/assets";

const translations = new Map([
  ["bluetape4k-flow-extensions-search-pipeline-marble-01", [
    ["search pipeline: burst -> latest request -> cancellable result", "검색 파이프라인: 연속 입력 → 최신 요청 → 취소 가능한 결과"],
    ["debounce keeps the final query, withLatestFrom attaches settings, flatMapLatest cancels stale work", "debounce는 마지막 검색어를 남기고, withLatestFrom은 설정을 결합하며, flatMapLatest는 오래된 작업을 취소합니다"],
    ["typing burst", "연속 입력"],
    ["queries", "검색어"],
    ["settings", "설정"],
    ["newer after request", "요청 뒤 새 설정"],
    ["request", "요청"],
    [">result<", ">결과<"],
  ]],
  ["bluetape4k-flow-extensions-race-fallback-marble-01", [
    ["race / fallback: latency, priority, and partial merge are different", "race / fallback: 지연 시간, 우선순위, 부분 병합은 서로 다릅니다"],
    ["race cancels losers; concat preserves source priority; merge keeps partial contributions", "race는 패자를 취소하고, concat은 소스 우선순위를 지키며, merge는 부분 결과를 보존합니다"],
    ["sources", "소스"],
    ["cache 200ms", "캐시 200ms"],
    ["replica 20ms", "복제본 20ms"],
    ["remote 120ms", "원격 120ms"],
    ["winner", "승자"],
    ["latency-first winner", "지연 시간 우선 승자"],
    ["priority order", "우선순위 순서"],
    ["partial results", "부분 결과"],
    ["cache -> replica -> remote", "캐시 → 복제본 → 원격"],
  ]],
  ["bluetape4k-flow-extensions-subject-bridge-marble-01", [
    ["subject bridge: late subscribers change the contract", "subject 브리지: 늦은 구독자가 계약을 바꿉니다"],
    ["publish drops early events, behavior sends latest state, replay sends history, unicast consumes work once", "publish는 이전 이벤트를 버리고, behavior는 최신 상태를, replay는 이력을 보내며, unicast는 작업을 한 번만 소비합니다"],
    ["callback", "콜백"],
    ["subscriber starts", "구독 시작"],
    ["E1 dropped", "E1 유실"],
    ["one consumer", "소비자 하나"],
  ]],
  ["bluetape4k-flow-extensions-chunked-marble-01", [
    ["chunked / buffer: emit concrete batches", "chunked / buffer: 구체적인 배치를 방출합니다"],
    ["top: source events over time; box: chunked(2); bottom: emitted Lists", "위: 시간순 소스 이벤트 · 상자: chunked(2) · 아래: 방출된 List"],
    ["input Flow", "입력 Flow"],
    ["output Flow", "출력 Flow"],
    ["chunk sizes", "청크 크기"],
  ]],
  ["bluetape4k-flow-extensions-windowed-marble-01", [
    ["windowed / sliding: emit overlapping windows", "windowed / sliding: 겹치는 윈도우를 방출합니다"],
    ["top: source events; box: windowed(3, step 2); bottom: window objects", "위: 소스 이벤트 · 상자: windowed(3, step 2) · 아래: 윈도우 객체"],
    ["input Flow", "입력 Flow"],
    ["output Flow", "출력 Flow"],
    ["sizes", "크기"],
  ]],
  ["bluetape4k-flow-extensions-groupby-marble-01", [
    ["groupBy: partition by key, not by time or size", "groupBy: 시간이나 크기가 아니라 키로 나눕니다"],
    ["color = order key; shape = event type; bottom: one grouped Flow per key", "색상 = 주문 키 · 모양 = 이벤트 유형 · 아래 = 키마다 그룹화된 Flow 하나"],
    ["input Flow", "입력 Flow"],
    ["output Flows", "출력 Flow"],
    ["create", "생성"],
    ["line", "품목"],
    ["paid", "결제"],
    ["shipped", "배송"],
  ]],
  ["bluetape4k-flow-extensions-scanwith-marble-01", [
    ["scanWith / read model: accumulate state", "scanWith / 읽기 모델: 상태를 누적합니다"],
    ["top: events; box: accumulator; bottom: emitted state snapshots", "위: 이벤트 · 상자: 누산기 · 아래: 방출된 상태 스냅샷"],
    ["input Flow", "입력 Flow"],
    ["output Flow", "출력 Flow"],
    ["empty", "비어 있음"],
    ["state snapshots", "상태 스냅샷"],
  ]],
  ["bluetape4k-flow-extensions-metrics-sampling-marble-01", [
    ["metrics sampling: first value now, last value after the window", "메트릭 샘플링: 첫 값은 즉시, 마지막 값은 윈도우 뒤에"],
    ["same input windows, different output contract: preview vs dashboard", "입력 윈도우는 같지만 출력 계약은 다릅니다: 미리보기와 대시보드"],
    ["input metrics", "입력 메트릭"],
    ["leading", "선두 값"],
    ["trailing", "후미 값"],
  ]],
  ["bluetape4k-flow-extensions-parallel-enrichment-marble-01", [
    ["parallel enrichment: split independent work, then fold back", "병렬 보강: 독립 작업으로 나눈 뒤 다시 합칩니다"],
    ["parallel rails are safe only when each rail owns independent work and sequential() is explicit", "각 레일이 독립 작업을 맡고 sequential()을 명시할 때만 병렬 레일이 안전합니다"],
    ["orders", "주문"],
    ["customer -> GOLD", "고객 → GOLD"],
    ["discount -> 10%", "할인 → 10%"],
    ["inventory -> true", "재고 → true"],
    ["output", "출력"],
    ["fulfillable", "주문 처리 가능"],
  ]],
]);

function normalizeFonts(source, locale) {
  if (locale === "ko") {
    return source
      .replaceAll('"Architects Daughter", "Comic Mono", system-ui, sans-serif', '"goorm Sans"')
      .replaceAll('"Comic Mono", ui-monospace, monospace', '"goorm Sans Code"')
      .replaceAll('"Comic Mono"', '"goorm Sans Code"');
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

function normalizeConnectors(source) {
  return source
    .replace(".line {", ".edge {")
    .replaceAll('class="line"', 'class="edge"')
    .replace(
      /<line class="edge" x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"\/>/g,
      '<path class="edge" d="M$1 $2 L$3 $4"/>',
    );
}

for (const [name, replacements] of translations) {
  const canonical = `${out}/${name}.svg`;
  const sourcePath = existsSync(canonical) ? canonical : `${out}/${name}-en.svg`;
  const source = normalizeConnectors(readFileSync(sourcePath, "utf8"));
  const enSvg = `${out}/${name}-en.svg`;
  const koSvg = `${out}/${name}-ko.svg`;
  writeFileSync(enSvg, normalizeFonts(source, "en"));
  writeFileSync(koSvg, normalizeFonts(localize(source, replacements), "ko"));
  for (const svg of [enSvg, koSvg]) {
    execFileSync("xmllint", ["--noout", svg]);
    execFileSync("cairosvg", [svg, "-o", svg.replace(/\.svg$/, ".png"), "-s", "2"]);
  }
  if (existsSync(canonical)) rmSync(canonical);
  const png = `${out}/${name}.png`;
  if (existsSync(png)) rmSync(png);
}
