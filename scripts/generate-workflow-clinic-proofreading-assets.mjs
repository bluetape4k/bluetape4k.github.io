import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const out = "public/assets";
const stems = [
  "bluetape-workflow-type-router-01",
  "bluetape-workflow-7-tier-review-01",
  "bluetape-workflow-execution-lanes-01",
  "bluetape-skills-run-lane-model-01",
  "bluetape-skills-native-runtime-boundary-01",
  "clinic-appointment-part1-saas-domain-map-01",
];

const metadata = {
  "bluetape-workflow-type-router-01": {
    en: ["Bluetape workflow type router", "A dark routing diagram that classifies one request into seven evidence-based work types."],
    ko: ["Bluetape 작업 유형 분류", "하나의 요청을 위험도와 증거 범위에 따라 일곱 작업 유형으로 분류하는 어두운 배경의 구조도입니다."],
  },
  "bluetape-workflow-7-tier-review-01": {
    en: ["Seven-tier review convergence", "Six independent review perspectives converge through main-session integration until no P0 or P1 blocker remains."],
    ko: ["7단계 검토의 수렴 과정", "여섯 독립 검토 관점을 주 세션이 통합하고 P0와 P1 차단 문제가 없어질 때까지 반복하는 구조도입니다."],
  },
  "bluetape-workflow-execution-lanes-01": {
    en: ["Seven workflow execution paths", "Seven work types follow distinct evidence, review, recovery, and stop conditions."],
    ko: ["일곱 작업 유형의 실행 경로", "일곱 작업 유형이 서로 다른 증거, 검토, 복구, 종료 조건을 따르는 비교 구조도입니다."],
  },
  "bluetape-skills-run-lane-model-01": {
    en: ["Run and lane recovery model", "A run owns the overall result while bounded lanes provide evidence, recovery, and replacement lineage."],
    ko: ["전체 작업과 실행 단위의 복구 모델", "전체 작업이 결과를 책임지고 범위가 제한된 실행 단위가 증거와 복구 및 교체 계보를 제공하는 구조도입니다."],
  },
  "bluetape-skills-native-runtime-boundary-01": {
    en: ["Native runtime responsibility boundary", "The Codex main session executes native actions while a guarded runtime records bounded evidence."],
    ko: ["네이티브 런타임의 책임 경계", "Codex 주 세션은 네이티브 동작을 실행하고 보호된 런타임은 제한된 증거를 기록하는 구조도입니다."],
  },
  "clinic-appointment-part1-saas-domain-map-01": {
    en: ["Clinic appointment SaaS domain boundaries", "One tenant contains clinics whose distinct calendars and resources determine appointment feasibility."],
    ko: ["병원 예약 SaaS의 업무 영역", "하나의 테넌트에 속한 병원마다 서로 다른 일정과 의료 자원으로 예약 가능 여부를 판단하는 구조도입니다."],
  },
};

const koReplacements = [
  ["하나의 요청을 위험도와 증거 범위로 분류해 가장 가벼운 안전 lane을 고른다.", "하나의 요청을 위험도와 증거 범위로 분류해 가장 가벼운 안전 경로를 고릅니다."],
  ["작업 전에 경로를 먼저 고른다", "작업 전에 실행 경로를 먼저 고릅니다"],
  ["가장 간결한 안전 경로", "가장 단순하면서 안전한 경로"],
  ["범위, 위험, 증거를 분류", "범위·위험·증거 분류"],
  ["작은 추가", "소규모 기능 추가"],
  ["국소 영향", "제한된 영향 범위"],
  ["결함 / regression", "결함 / 회귀"],
  ["읽기 전용 review", "읽기 전용 검토"],
  ["Code 검토", "코드 검토"],
  ["문서 / guidance", "문서 / 지침"],
  ["config / CI", "설정 / CI"],
  ["release / tag", "릴리스 / 태그"],
  ["artifact 증거", "산출물 증거"],
  ["benchmark 반복", "벤치마크 반복"],
  ["분류가 lane을 고르고, 증거가 lane을 닫는다.", "분류로 실행 경로를 선택하고 증거로 완료를 판정합니다."],
  ["하나의 7-Tier engine이 2-R, 3-R, 6-R을 지킨다", "하나의 7단계 검토가 2-R, 3-R, 6-R을 지킵니다"],
  ["여섯 독립 관점이 서로 다른 실패를 찾고, main session이 통합해 gate를 책임진다.", "여섯 독립 관점이 서로 다른 실패를 찾고, 주 세션이 통합해 검증 관문을 책임집니다."],
  ["2-R / Spec", "2-R / 명세"],
  ["설계와 acceptance contract", "설계와 인수 계약"],
  ["3-R / Plan", "3-R / 계획"],
  ["mapping, 순서, 증거, hazard", "대응 관계, 순서, 증거, 위험"],
  ["6-R / Pre-PR", "6-R / PR 전"],
  ["현재 diff와 fresh evidence", "현재 변경과 새 증거"],
  ["병렬 관점, 독립 findings", "병렬 관점, 독립 판정"],
  ["Performance", "성능"],
  ["비용, scale, latency", "비용, 규모, 지연 시간"],
  ["Stability", "안정성"],
  ["실패, concurrency", "실패, 동시성"],
  ["Security", "보안"],
  ["trust와 exposure", "신뢰 경계, 노출"],
  ["Operator / Ops", "운영자 / 운영"],
  ["Developer / API", "개발자 / API"],
  ["contract와 오용", "계약과 오용"],
  ["User / Caller", "사용자 / 호출자"],
  ["Main-session 통합", "주 세션 통합"],
  ["YES", "예"],
  ["NO", "아니요"],
  ["다음 gate 열기", "다음 검증 관문 열기"],
  ["fresh P0 = 0, P1 = 0 기록", "새 P0 = 0, P1 = 0 기록"],
  ["blocker 수정", "차단 문제 수정"],
  ["영향받은 review lane", "영향받은 검토 관점"],
  ["영향 lane 뒤 재통합", "영향받은 관점 검토 후 재통합"],
  ["review 흐름", "검토 흐름"],
  ["blocker 반복", "차단 문제 반복"],
  ["gate 통과", "검증 관문 통과"],
  ["통합이 일곱 번째 tier이며, 별도 reviewer가 아니라 main session이 책임진다.", "통합이 일곱 번째 단계이며, 별도 검토자가 아니라 주 세션이 책임집니다."],
  ["일곱 작업 유형, 일곱 증거 경로", "일곱 작업 유형과 일곱 증거 경로"],
  ["Router가 lane을 고르고, 각 lane은 고유한 순서, 증거, 종료 조건을 가진다.", "작업 경로 분류기가 실행 경로를 고르고, 각 경로는 고유한 순서와 증거 및 종료 조건을 가집니다."],
  ["code 전에 design", "구현 전 설계"],
  ["좁은 추가 변경", "제한된 기능 추가"],
  ["읽기 전용 판정", "읽기 전용 검토"],
  ["ownership 보존", "소유권 보존"],
  ["public state 증명", "공개 상태 증명"],
  ["Research", "조사"],
  ["Spec", "명세"],
  ["Plan", "계획"],
  ["Pattern", "패턴"],
  ["가벼운", "간결한"],
  ["Design", "설계"],
  ["Review", "검토"],
  ["Root Cause", "근본 원인"],
  ["Regression RED", "회귀 테스트 RED"],
  ["현재 Diff", "현재 변경"],
  ["Review 관점", "검토 관점"],
  ["Guidance", "지침"],
  ["Ownership", "소유권"],
  ["Source-first", "원본 우선"],
  ["Apply / Parity", "적용 / 일치"],
  ["render = live", "렌더링 결과 = 실제 파일"],
  ["Self-audit", "자체 점검"],
  ["Version 고정", "버전 고정"],
  ["authority 포함", "기준점 포함"],
  ["Preflight", "사전 점검"],
  ["Hold", "보류"],
  ["Publish", "배포"],
  ["Public", "공개"],
  ["Consumer", "소비자"],
  ["Sync", "동기화"],
  ["Baseline", "기준값"],
  ["review 또는 feedback gate", "검토 또는 피드백 관문"],
  ["Run은 결과를 책임지고 lane은 제한된 작업을 맡는다.", "전체 작업은 결과를 책임지고 실행 단위는 제한된 작업을 맡습니다."],
  ["승인된 run 하나가 여러 lane을 가질 수 있지만 완료는 공유 증거로 수렴한다.", "승인된 전체 작업 하나가 여러 실행 단위를 가질 수 있지만 완료는 공유 증거로 수렴합니다."],
  ["하나의 RUN, 여러 LANE", "하나의 전체 작업, 여러 실행 단위"],
  ["정적 ownership + 완료 topology", "정적 소유권 + 완료 구성"],
  ["승인된 전체 결과", "승인된 전체 결과"],
  ["Owner epoch", "소유권 세대"],
  ["현재 authority", "현재 권한"],
  ["Required topology", "필수 구성"],
  ["component + check", "구성 요소 + 검사"],
  ["제한된 할당", "범위가 제한된 할당"],
  ["owner + state", "소유자 + 상태"],
  ["Required components", "필수 구성 요소"],
  ["check + evidence", "검사 + 증거"],
  ["component가 전체를 gate", "구성 요소가 전체 완료를 제한"],
  ["Main verification", "주 세션 검증"],
  ["하나의 LANE, 복구 + 교체", "하나의 실행 단위, 복구 + 교체"],
  ["시간순 state + 명시적 lineage", "시간순 상태 + 명시적 계보"],
  ["Main session: native spawn", "주 세션: 네이티브 에이전트 생성"],
  ["그 뒤 startup-ack 관찰", "그 뒤 시작 확인 응답 관찰"],
  ["probe 필요", "확인 요청 필요"],
  ["probe ack", "확인 요청 응답"],
  ["replacement lane", "교체 실행 단위"],
  ["새 lane id + 새 agent id", "새 실행 단위 ID + 새 에이전트 ID"],
  ["parent lineage", "상위 계보"],
  ["Lane 완료 != Run 완료", "실행 단위 완료 ≠ 전체 작업 완료"],
  ["terminal lane은 최종 판단의 입력 하나일 뿐이다.", "종료 상태의 실행 단위는 최종 판단의 입력 하나일 뿐입니다."],
  ["terminal lane + required check + component evidence", "종료 실행 단위 + 필수 검사 + 구성 요소별 증거"],
  ["RUN COMPLETED", "전체 작업 완료"],
  ["증거 / state", "증거 / 상태"],
  ["복구 / lineage", "복구 / 계보"],
  ["Native action은 native에, 증거는 durable하게 둔다.", "네이티브 동작은 네이티브 도구에, 증거는 영속 저장소에 둡니다."],
  ["Main session이 Codex tool을 실행하고 제한된 intent, result, recovery evidence를 기록한다.", "주 세션이 Codex 도구를 실행하고 제한된 의도, 결과, 복구 증거를 기록합니다."],
  ["Main Session", "주 세션"],
  ["orchestration 책임", "작업 조정 책임"],
  ["Native Codex Tools", "Codex 네이티브 도구"],
  ["agent action 실행", "에이전트 동작 실행"],
  ["Guarded Evidence", "보호된 증거"],
  ["보호된 증거 Runtime", "보호된 증거 런타임"],
  ["기록만 하고 orchestrate하지 않음", "기록만 하고 작업을 조정하지 않음"],
  ["Manifest / Receipt", "매니페스트 / 작업 원장"],
  ["/ Topology", "/ 구성"],
  ["durable workflow state", "영속 작업 흐름 상태"],
  ["다음 action 결정", "다음 동작 결정"],
  ["native tool 호출", "네이티브 도구 호출"],
  ["main-session authority", "주 세션 권한"],
  ["weakest component", "가장 약한 구성 요소"],
  ["intent", "의도"],
  ["native action 전", "네이티브 동작 전"],
  ["observed evidence", "관찰 증거"],
  ["native result 후", "네이티브 결과 후"],
  ["bounded receipt", "제한된 작업 원장"],
  ["guarded CLI write", "보호된 CLI 기록"],
  ["run + lane state", "전체 작업 + 실행 단위 상태"],
  ["receipt chain", "작업 원장 연결 구조"],
  ["replay + diagnose", "재생 + 진단"],
  ["verified terminal", "검증된 종료 상태"],
  ["필수 evidence 전체", "필수 증거 전체"],
  ["solid action / write", "실선: 동작 / 기록"],
  ["dashed observed / recovery", "점선: 관찰 / 복구"],
  ["1 native action 실행", "1 네이티브 동작 실행"],
  ["2 결과 관찰", "2 실행 결과 관찰"],
  ["3 intent / evidence 기록", "3 의도 / 증거 기록"],
  ["4 guarded state write", "4 보호된 상태 기록"],
  ["5 resume / recovery evidence", "5 재개 / 복구 증거"],
  ["doctor + treatment + equipment + date/time + state", "의사 + 진료 + 장비 + 날짜·시간 + 상태"],
];

function replaceAllSorted(source, replacements) {
  let result = source;
  for (const [from, to] of [...replacements].sort((a, b) => b[0].length - a[0].length)) {
    result = result.replaceAll(from, to);
  }
  return result;
}

function darken(source) {
  return replaceAllSorted(source, [
    ["#f8fafc", "#0b1220"],
    ["#ffffff", "#111c2e"],
    ["#f4f9ff", "#101f35"],
    ["#e8f1ff", "#132945"],
    ["#fff7f5", "#2b1b23"],
    ["#ffe8e3", "#3a2027"],
    ["#f3effb", "#241d3b"],
    ["#e8e1f7", "#30264a"],
    ["#eef9f2", "#142d25"],
    ["#fff7e8", "#302719"],
    ["#dbe5f1", "#33475f"],
    ["#eef6ff", "#14243a"],
    ["#fff7ed", "#302317"],
    ["#fef2f2", "#321c24"],
    ["#faf5ff", "#291f3b"],
    ["#f0fdfa", "#122b29"],
    ["#f0fdf4", "#142b22"],
    ["#fffaf0", "#302718"],
    ["#fffaf4", "#30231c"],
    ["#fff7f7", "#321d25"],
    ["#fee2e2", "#3a2027"],
    ["#fbf8ff", "#292039"],
    ["#fafbfc", "#172236"],
    ["#f8fbff", "#14243a"],
    ["#f7fcf8", "#162b22"],
    ["#f5fcfb", "#142c29"],
    ["#f2dfc5", "#352719"],
    ["#f2d7da", "#3a2027"],
    ["#e6dcf6", "#30264a"],
    ["#dfe4ea", "#263445"],
    ["#d8efdf", "#183126"],
    ["#d7e7fb", "#19304a"],
    ["#d4efeb", "#17312d"],
    ["#e6faf7", "#15302c"],
    ["#1e293b", "#f1f5f9"],
    ["#334155", "#e2e8f0"],
    ["#526174", "#c2cede"],
    ["#7b8798", "#aebed2"],
    ["#475569", "#c2cede"],
    ["#64748b", "#94a3b8"],
    ["#4f7dc9", "#60a5fa"],
    ["#d25b63", "#fb7185"],
    ["#8a6fd1", "#c084fc"],
    ["#45a66f", "#34d399"],
    ["#c28b3c", "#fbbf24"],
  ]);
}

function withMetadata(source, title, desc) {
  const normalized = source
    .replace(/\s+role="img"\s+aria-labelledby="title desc"/, "")
    .replace(/\n\s*<title id="title">[^<]*<\/title>/, "")
    .replace(/\n\s*<desc id="desc">[^<]*<\/desc>/, "");
  return normalized.replace(
    /<svg ([^>]+)>/,
    `<svg $1 role="img" aria-labelledby="title desc">\n  <title id="title">${title}</title>\n  <desc id="desc">${desc}</desc>`,
  );
}

function normalizeKo(source) {
  return replaceAllSorted(source, koReplacements)
    .replace(/(?:범위가\s+)+제한된 할당/g, "범위가 제한된 할당")
    .replaceAll("보호된 증거 Runtime", "보호된 증거 런타임")
    .replaceAll(">Runtime<", ">런타임<")
    .replaceAll("main verification", "주 검증")
    .replaceAll("'Architects Daughter', 'Comic Mono', cursive", "'goorm Sans'")
    .replaceAll("'Comic Mono', 'SFMono-Regular', Consolas, monospace", "'goorm Sans Code'");
}

function normalizeStem(source, stem) {
  if (stem !== "clinic-appointment-part1-saas-domain-map-01") return source;
  return source
    .replace(/(\.title \{[^}]*fill: )#0b1220;/, "$1#f1f5f9;")
    .replace(/(\.lane-title \{[^}]*fill: )#0b1220;/, "$1#f1f5f9;")
    .replace(/(\.card-title \{[^}]*fill: )#0b1220;/, "$1#f1f5f9;")
    .replace(/(\.code-title \{[^}]*fill: )#0b1220;/, "$1#f1f5f9;");
}

for (const stem of stems) {
  for (const locale of ["en", "ko"]) {
    const svgPath = `${out}/${stem}-${locale}.svg`;
    let svg = darken(readFileSync(svgPath, "utf8"));
    if (locale === "ko") svg = normalizeKo(svg);
    svg = normalizeStem(svg, stem);
    svg = withMetadata(svg, ...metadata[stem][locale]);
    writeFileSync(svgPath, svg);
    execFileSync("xmllint", ["--noout", svgPath]);
    execFileSync("cairosvg", [svgPath, "-o", svgPath.replace(/\.svg$/, ".png"), "-s", "2"]);
  }
}
