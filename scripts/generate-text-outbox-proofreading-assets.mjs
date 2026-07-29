import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const out = "public/assets";
const colors = {
  canvas: "#07111F",
  frame: "#0D1B2D",
  panel: "#10243A",
  panel2: "#0A1727",
  line: "#38506A",
  text: "#E6F2FF",
  muted: "#A9BDD1",
  blue: "#60A5FA",
  cyan: "#36C5F0",
  green: "#5EEAD4",
  olive: "#9FB36A",
  amber: "#F4B860",
  red: "#E07A7A",
  violet: "#B794F4",
  teal: "#5BC0BE",
};

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function localeStyle(locale, titleSize = 38) {
  const title =
    locale === "ko"
      ? '"goorm Sans","Apple SD Gothic Neo",sans-serif'
      : '"Architects Daughter","Comic Sans MS",cursive';
  const body =
    locale === "ko"
      ? '"goorm Sans Code","goorm Sans",monospace'
      : '"Comic Mono","SFMono-Regular",Menlo,monospace';
  return { title, body, titleSize: locale === "ko" ? titleSize : titleSize - 7 };
}

function lines(items, x, y, cls = "body", gap = 30, anchor = "start") {
  return `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${items
    .map((item, index) => `<tspan x="${x}" dy="${index ? gap : 0}">${esc(item)}</tspan>`)
    .join("")}</text>`;
}

function archDefs(markerColors = [colors.blue, colors.green, colors.amber, colors.red, colors.violet]) {
  return `<defs>${markerColors
    .map(
      (color, index) =>
        `<marker id="arrow${index}" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L14 7 L0 14 Z" fill="${color}"/></marker>`,
    )
    .join("")}</defs>`;
}

function archCss(locale, titleSize = 38) {
  const font = localeStyle(locale, titleSize);
  return `<style>
    .canvas{fill:${colors.canvas}}.frame{fill:${colors.frame};stroke:${colors.line};stroke-width:2}
    .lane{fill:${colors.panel2};stroke:${colors.line};stroke-width:2}.card{fill:${colors.panel};stroke-width:2}
    .title{font:700 ${font.titleSize}px ${font.title};fill:${colors.text}}
    .subtitle,.lane-title,.body,.footer{font-family:${font.body};fill:${colors.muted}}
    .subtitle{font-size:${locale === "ko" ? 19 : 15}px}.lane-title{font-size:17px;fill:${colors.cyan}}
    .card-title{font:700 ${locale === "ko" ? 22 : 15}px ${locale === "ko" ? font.title : font.body};fill:${colors.text}}
    .body{font-size:${locale === "ko" ? 16 : 14}px}.footer{font-size:${locale === "ko" ? 15 : 13}px}
    .connector{fill:none;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
  </style>`;
}

function card({ x, y, w, h, color, title, body }) {
  return `<g data-card="${esc(title)}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" class="card" stroke="${color}"/>
    <circle cx="${x + 26}" cy="${y + 30}" r="7" fill="${color}"/>
    <text x="${x + 44}" y="${y + 38}" class="card-title">${esc(title)}</text>
    ${lines(body, x + 26, y + 84, "body", 30)}
  </g>`;
}

function textPart3(locale) {
  const ko = locale === "ko";
  const copy = ko
    ? {
        title: "Aho-Corasick: 사전 준비와 요청 처리를 분리한다",
        subtitle: "사전 변경 때 불변 자동 장치를 만들고, 요청 경로에서는 입력 검증과 검색만 수행한다",
        prep: "사전 준비 경계",
        request: "요청 처리 경계",
        cards: [
          ["키워드 사전", ["금칙어·위험 구문", "중복·공백 정규화"]],
          ["자동 장치 생성", ["키워드 트라이", "실패 전이 구성"]],
          ["불변 인스턴스", ["스레드 안전 공유", "버전 교체로 갱신"]],
          ["사용자 텍스트", ["길이·공백 검사", "원문 로그 금지"]],
          ["한 번 검색", ["parseText", "containsMatch"]],
          ["일치 결과", ["위치·키워드·값", "중복·경계 정책 반영"]],
          ["서비스 판단", ["마스킹·알림", "강조·분류"]],
        ],
        footer: "기본 Flow 경로는 즉시 방출하지만, 겹침 제거나 단어 경계 후처리가 필요하면 전체 결과를 먼저 계산합니다.",
        desc: "키워드 사전으로 불변 Aho-Corasick 자동 장치를 준비하고 사용자 입력을 한 번 검사해 서비스 판단으로 전달하는 두 경계",
      }
    : {
        title: "Aho-Corasick: Separate Dictionary Build from Requests",
        subtitle: "Build an immutable automaton when the dictionary changes; validate and scan only on the request path",
        prep: "Dictionary preparation boundary",
        request: "Request-processing boundary",
        cards: [
          ["Keyword dictionary", ["Abuse and risk phrases", "Normalize blanks and duplicates"]],
          ["Build automaton", ["Keyword trie", "Failure transitions"]],
          ["Immutable instance", ["Thread-safe sharing", "Replace by version"]],
          ["User text", ["Length and blank checks", "Do not log raw input"]],
          ["Single scan", ["parseText", "containsMatch"]],
          ["Matches", ["Position, keyword, value", "Overlap and boundary policy"]],
          ["Service decision", ["Mask or alert", "Highlight or classify"]],
        ],
        footer: "The default Flow path emits during traversal; overlap removal or word-boundary filtering requires eager post-processing.",
        desc: "Two boundaries for building an immutable Aho-Corasick automaton from a dictionary and scanning validated user text once for service decisions",
      };
  const positions = [
    [90, 238, 380, 190, colors.blue],
    [610, 238, 380, 190, colors.cyan],
    [1130, 238, 380, 190, colors.green],
    [60, 585, 280, 190, colors.blue],
    [440, 585, 280, 190, colors.cyan],
    [820, 585, 300, 190, colors.amber],
    [1220, 585, 320, 190, colors.violet],
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
  <title id="title">${esc(copy.title)}</title><desc id="desc">${esc(copy.desc)}</desc>
  ${archDefs()}${archCss(locale, 40)}
  <rect width="1600" height="900" class="canvas"/><rect x="30" y="30" width="1540" height="840" rx="30" class="frame"/>
  <text x="70" y="100" class="title">${esc(copy.title)}</text><text x="70" y="142" class="subtitle">${esc(copy.subtitle)}</text>
  <rect x="60" y="190" width="1480" height="282" rx="26" class="lane"/><text x="90" y="222" class="lane-title">${esc(copy.prep)}</text>
  <rect x="40" y="520" width="1520" height="300" rx="26" class="lane"/><text x="70" y="552" class="lane-title">${esc(copy.request)}</text>
  ${copy.cards.map((item, index) => card({ x: positions[index][0], y: positions[index][1], w: positions[index][2], h: positions[index][3], color: positions[index][4], title: item[0], body: item[1] })).join("")}
  <path data-connector="dictionary-build" d="M470 333 H610" class="connector" stroke="${colors.blue}" marker-end="url(#arrow0)"/>
  <path data-connector="build-instance" d="M990 333 H1130" class="connector" stroke="${colors.green}" marker-end="url(#arrow1)"/>
  <path data-connector="instance-scan" d="M1320 428 V480 Q1320 500 1300 500 H590 Q570 500 570 520 V585" class="connector" stroke="${colors.green}" marker-end="url(#arrow1)"/>
  <path data-connector="input-scan" d="M340 680 H440" class="connector" stroke="${colors.blue}" marker-end="url(#arrow0)"/>
  <path data-connector="scan-matches" d="M720 680 H820" class="connector" stroke="${colors.amber}" marker-end="url(#arrow2)"/>
  <path data-connector="matches-decision" d="M1120 680 H1220" class="connector" stroke="${colors.violet}" marker-end="url(#arrow4)"/>
  <text x="800" y="850" text-anchor="middle" class="footer">${esc(copy.footer)}</text>
</svg>`;
}

function textPart4(locale) {
  const ko = locale === "ko";
  const copy = ko
    ? {
        title: "사전 변경을 동작 변경으로 검증한다",
        subtitle: "정규화, 영향 범위 테스트, 재현 가능한 기록을 하나의 품질 게이트로 묶는다",
        cards: [
          ["사전 변경", ["UTF-8 리소스", "추가·삭제 항목 확인"]],
          ["입력 정규화", ["공백·빈 줄 제거", "중복 제거", "의미가 없을 때만 정렬"]],
          ["영향 범위 테스트", ["공통 로더", "한국어·일본어 사전", "입력 안전 경계"]],
          ["변경 기록", ["검증 명령", "릴리스 노트", "다중 인스턴스 반영 정책"]],
        ],
        footer: "런타임 추가 API는 현재 프로세스의 메모리만 바꿉니다. 영속화, 재시작 복구, 다중 인스턴스 전파는 서비스가 소유합니다.",
        desc: "사전 변경을 정규화하고 영향 범위 테스트로 검증한 뒤 릴리스 기록과 운영 반영 정책으로 이어지는 품질 게이트",
      }
    : {
        title: "Treat Dictionary Updates as Behavior Changes",
        subtitle: "Combine normalization, impact-focused tests, and reproducible records into one quality gate",
        cards: [
          ["Dictionary change", ["UTF-8 resources", "Review additions and removals"]],
          ["Normalize input", ["Trim blanks", "Remove duplicates", "Sort only when order is inert"]],
          ["Test affected behavior", ["Shared loader", "Korean and Japanese data", "Input safety boundary"]],
          ["Record the change", ["Verification commands", "Release note", "Multi-instance rollout policy"]],
        ],
        footer: "Runtime add APIs change only the current process memory. Persistence, restart recovery, and multi-instance rollout belong to the service.",
        desc: "Quality gate that normalizes dictionary changes, tests affected behavior, and records verification and rollout policy",
      };
  const xs = [70, 455, 840, 1225];
  const widths = [300, 300, 300, 305];
  const palette = [colors.blue, colors.cyan, colors.green, colors.amber];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="760" viewBox="0 0 1600 760" role="img" aria-labelledby="title desc">
  <title id="title">${esc(copy.title)}</title><desc id="desc">${esc(copy.desc)}</desc>
  ${archDefs()}${archCss(locale, 42)}
  <rect width="1600" height="760" class="canvas"/><rect x="30" y="30" width="1540" height="700" rx="30" class="frame"/>
  <text x="70" y="104" class="title">${esc(copy.title)}</text><text x="70" y="148" class="subtitle">${esc(copy.subtitle)}</text>
  <rect x="50" y="205" width="1500" height="370" rx="28" class="lane"/>
  ${copy.cards.map((item, index) => card({ x: xs[index], y: 255, w: widths[index], h: 265, color: palette[index], title: item[0], body: item[1] })).join("")}
  <path data-connector="change-normalize" d="M370 388 H455" class="connector" stroke="${colors.blue}" marker-end="url(#arrow0)"/>
  <path data-connector="normalize-test" d="M755 388 H840" class="connector" stroke="${colors.green}" marker-end="url(#arrow1)"/>
  <path data-connector="test-record" d="M1140 388 H1225" class="connector" stroke="${colors.amber}" marker-end="url(#arrow2)"/>
  <rect x="90" y="614" width="1420" height="72" rx="18" fill="${colors.panel2}" stroke="${colors.violet}" stroke-width="2"/>
  <text x="800" y="657" text-anchor="middle" class="footer">${esc(copy.footer)}</text>
</svg>`;
}

function outboxFlow(locale) {
  const ko = locale === "ko";
  const copy = ko
    ? {
        title: "트랜잭셔널 아웃박스와 멱등성의 실패 경계",
        subtitle: "요청 의도는 하나의 DB 트랜잭션으로 저장하고, 외부 전달은 커밋 뒤 재시도한다",
        lane1: "요청 트랜잭션",
        lane2: "커밋 이후 전달",
        cards: [
          ["클라이언트", ["명령 + 멱등성 키", "타임아웃 뒤 재시도"]],
          ["Spring·Ktor", ["입력 검증", "기존 키 조회"]],
          ["멱등성 경계", ["고유 인덱스", "중복이면 기존 행 반환"]],
          ["DB 트랜잭션", ["도메인 행", "아웃박스 행", "한 번에 커밋"]],
          ["아웃박스", ["PENDING 상태", "전달 의도 영속화"]],
          ["릴레이", ["커밋 뒤 폴링", "시도 횟수·상태 기록"]],
          ["외부 시스템", ["Kafka 또는 HTTP", "실패 응답 가능"]],
          ["재시도 원장", ["attempts + 1", "예산 소진 시 dead letter"]],
        ],
        footer: "고유 인덱스는 중복 생성을 막고, 아웃박스 상태는 커밋 이후 전달 실패를 다시 읽을 수 있게 합니다.",
        desc: "클라이언트 요청의 멱등성 확인과 도메인·아웃박스 행의 원자적 커밋, 커밋 이후 릴레이 전달과 재시도 상태를 보여주는 구조도",
      }
    : {
        title: "Transactional Outbox and Idempotency Failure Boundaries",
        subtitle: "Persist request intent in one database transaction, then retry external delivery after commit",
        lane1: "Request transaction",
        lane2: "After-commit delivery",
        cards: [
          ["Client", ["Command + idempotency key", "Retry after timeout"]],
          ["Spring or Ktor", ["Validate input", "Look up existing key"]],
          ["Idempotency boundary", ["Unique index", "Return stored row on duplicate"]],
          ["Database transaction", ["Domain row", "Outbox row", "Commit together"]],
          ["Outbox", ["PENDING state", "Durable delivery intent"]],
          ["Relay", ["Poll after commit", "Record attempts and status"]],
          ["External system", ["Kafka or HTTP", "May return failure"]],
          ["Retry ledger", ["attempts + 1", "Dead letter at budget"]],
        ],
        footer: "The unique index prevents duplicate creation; outbox status makes after-commit delivery failures readable and retryable.",
        desc: "Architecture showing idempotency checks, atomic domain and outbox persistence, after-commit relay delivery, and retry state",
      };
  const p = [
    [60, 250, 290, 210, colors.blue],
    [430, 250, 300, 210, colors.cyan],
    [810, 250, 300, 210, colors.violet],
    [1190, 250, 350, 210, colors.green],
    [60, 650, 290, 200, colors.amber],
    [430, 650, 300, 200, colors.amber],
    [810, 650, 300, 200, colors.green],
    [1190, 650, 350, 200, colors.red],
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="980" viewBox="0 0 1600 980" role="img" aria-labelledby="title desc">
  <title id="title">${esc(copy.title)}</title><desc id="desc">${esc(copy.desc)}</desc>
  ${archDefs()}${archCss(locale, 40)}
  <rect width="1600" height="980" class="canvas"/><rect x="28" y="28" width="1544" height="924" rx="30" class="frame"/>
  <text x="70" y="100" class="title">${esc(copy.title)}</text><text x="70" y="142" class="subtitle">${esc(copy.subtitle)}</text>
  <rect x="40" y="190" width="1520" height="320" rx="26" class="lane"/><text x="70" y="224" class="lane-title">${esc(copy.lane1)}</text>
  <rect x="40" y="570" width="1520" height="320" rx="26" class="lane"/><text x="70" y="604" class="lane-title">${esc(copy.lane2)}</text>
  ${copy.cards.map((item, index) => card({ x: p[index][0], y: p[index][1], w: p[index][2], h: p[index][3], color: p[index][4], title: item[0], body: item[1] })).join("")}
  <path data-connector="client-app" d="M350 355 H430" class="connector" stroke="${colors.blue}" marker-end="url(#arrow0)"/>
  <path data-connector="app-idempotency" d="M730 355 H810" class="connector" stroke="${colors.violet}" marker-end="url(#arrow4)"/>
  <path data-connector="idempotency-tx" d="M1110 355 H1190" class="connector" stroke="${colors.green}" marker-end="url(#arrow1)"/>
  <path data-connector="tx-outbox" d="M1365 460 V530 Q1365 550 1345 550 H225 Q205 550 205 570 V650" class="connector" stroke="${colors.green}" marker-end="url(#arrow1)"/>
  <path data-connector="outbox-relay" d="M350 750 H430" class="connector" stroke="${colors.amber}" marker-end="url(#arrow2)"/>
  <path data-connector="relay-external" d="M730 750 H810" class="connector" stroke="${colors.amber}" marker-end="url(#arrow2)"/>
  <path data-connector="external-retry" d="M1110 750 H1190" class="connector" stroke="${colors.red}" marker-end="url(#arrow3)"/>
  <path data-connector="retry-outbox" d="M1365 850 V874 Q1365 894 1345 894 H225 Q205 894 205 874 V850" class="connector" stroke="${colors.violet}" marker-end="url(#arrow4)"/>
  <text x="800" y="930" text-anchor="middle" class="footer">${esc(copy.footer)}</text>
</svg>`;
}

function sequence(locale) {
  const ko = locale === "ko";
  const font = localeStyle(locale, 40);
  const copy = ko
    ? {
        title: "첫 요청, 동일 키 재시도, 릴레이 재시도",
        subtitle: "멱등성은 요청 중복을 막고, 아웃박스는 커밋 이후 전달 실패를 복구한다",
        participants: [["호출자", "HTTP 클라이언트"], ["엔드포인트", "Spring 또는 Ktor"], ["Exposed TX", "고유 키 + 아웃박스"], ["릴레이", "커밋 후 작업자"], ["외부 API", "Kafka 또는 HTTP"]],
        frames: ["첫 요청", "동일 키 재시도", "반복: 릴레이 재시도"],
        messages: [
          [0, 1, "POST 명령 + 멱등성 키", "call"],
          [1, 2, "pending 명령 + 아웃박스 행 저장", "state"],
          [2, 1, "커밋된 행 반환", "return"],
          [1, 4, "중복 경로 밖에서 한 번 호출", "call"],
          [4, 1, "성공 응답", "return"],
          [1, 0, "201 Created + 저장 결과", "return"],
          [0, 1, "같은 키로 다시 POST", "call"],
          [1, 2, "기존 행 조회, 새 행 없음", "state"],
          [1, 0, "200 OK + 저장 결과", "return"],
          [3, 2, "pending·재시도 가능 행 폴링", "state"],
          [3, 4, "이벤트 발행", "call"],
          [4, 3, "실패 응답", "error"],
          [3, 2, "attempts + 1, 상태 기록", "error"],
          [3, 4, "다음 주기 재발행", "call"],
          [4, 3, "성공 응답", "return"],
          [3, 2, "PUBLISHED 표시", "state"],
        ],
        footer: "HTTP 재시도는 저장된 요청 상태를 재사용하고, 릴레이 재시도는 아웃박스의 attempts와 status를 따릅니다.",
        desc: "첫 결제 요청, 동일 멱등성 키 재시도, 커밋 이후 릴레이 재시도의 참여자와 호출 순서를 보여주는 시퀀스 다이어그램",
      }
    : {
        title: "First Call, Same-Key Retry, and Relay Retry",
        subtitle: "Idempotency prevents duplicate request work; the outbox recovers delivery failures after commit",
        participants: [["Caller", "HTTP client"], ["Endpoint", "Spring or Ktor"], ["Exposed TX", "Unique key + outbox"], ["Relay", "After-commit worker"], ["External API", "Kafka or HTTP"]],
        frames: ["First request", "Same-key retry", "Loop: relay retry"],
        messages: [
          [0, 1, "POST command + idempotency key", "call"],
          [1, 2, "insert pending command + outbox row", "state"],
          [2, 1, "return committed row", "return"],
          [1, 4, "call once outside duplicate path", "call"],
          [4, 1, "success response", "return"],
          [1, 0, "201 Created + stored result", "return"],
          [0, 1, "POST again with the same key", "call"],
          [1, 2, "read existing row; insert nothing", "state"],
          [1, 0, "200 OK + stored result", "return"],
          [3, 2, "poll pending or retryable rows", "state"],
          [3, 4, "publish event", "call"],
          [4, 3, "failure response", "error"],
          [3, 2, "attempts + 1; record status", "error"],
          [3, 4, "publish again on next cycle", "call"],
          [4, 3, "success response", "return"],
          [3, 2, "mark PUBLISHED", "state"],
        ],
        footer: "HTTP retries reuse stored request state; relay retries follow persisted outbox attempts and status.",
        desc: "Sequence diagram for the first request, same-key retry, and after-commit relay retry",
      };
  const xs = [145, 465, 785, 1105, 1425];
  const ys = [360, 425, 490, 555, 620, 675, 835, 895, 950, 1110, 1172, 1234, 1296, 1358, 1420, 1482];
  const role = { call: [colors.blue, "arrowCall"], state: [colors.olive, "arrowState"], return: [colors.teal, "arrowReturn"], error: [colors.red, "arrowError"] };
  const rows = copy.messages
    .map(([from, to, label, kind], index) => {
      const [color, marker] = role[kind];
      const x1 = xs[from];
      const x2 = xs[to];
      const y = ys[index];
      const left = Math.min(x1, x2) + 18;
      const width = Math.max(150, Math.min(390, Math.abs(x2 - x1) - 36));
      return `<rect x="${left}" y="${y - 42}" width="${width}" height="30" rx="15" class="label" stroke="${color}"/>
        <circle cx="${left + 17}" cy="${y - 27}" r="11" fill="${color}"/><text x="${left + 17}" y="${y - 22}" text-anchor="middle" class="num">${index + 1}</text>
        <text x="${left + 36}" y="${y - 22}" class="msg" fill="${color}">${esc(label)}</text>
        <path data-connector="message-${index + 1}" d="M${x1} ${y} H${x2}" class="${kind}" marker-end="url(#${marker})"/>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1580" viewBox="0 0 1600 1580" role="img" aria-labelledby="title desc">
  <title id="title">${esc(copy.title)}</title><desc id="desc">${esc(copy.desc)}</desc>
  <defs>
    ${Object.values(role).map(([color, marker]) => `<marker id="${marker}" viewBox="0 0 10 10" markerWidth="16" markerHeight="16" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${color}" stroke="${color}" stroke-width="0" stroke-dasharray="none"/></marker>`).join("")}
  </defs>
  <style>
    .canvas{fill:${colors.canvas}}.frame{fill:${colors.frame};stroke:${colors.line};stroke-width:2}.header{fill:${colors.panel};stroke:${colors.line};stroke-width:2}
    .title{font:700 ${font.titleSize}px ${font.title};fill:${colors.text}}.subtitle,.role,.msg,.note,.footer,.num{font-family:${font.body}}
    .subtitle{font-size:${ko ? 18 : 15}px;fill:${colors.muted}}.participant{font:700 ${ko ? 20 : 18}px ${font.title};fill:${colors.text}}
    .role{font-size:${ko ? 14 : 12}px;fill:${colors.muted}}.lifeline{stroke:#607991;stroke-width:2;stroke-dasharray:7 8}
    .activation{fill:#132A43;stroke:#7C93AA;stroke-width:1.5}.call,.state,.return,.error{fill:none;stroke-width:4;stroke-linecap:round}
    .call{stroke:${colors.blue}}.state{stroke:${colors.olive}}.return{stroke:${colors.teal};stroke-dasharray:9 6}.error{stroke:${colors.red};stroke-dasharray:9 6}
    .label{fill:${colors.panel2};stroke-width:1.5}.msg{font-size:${ko ? 13 : 11}px}.num{font-size:11px;font-weight:800;fill:${colors.canvas}}
    .alt{fill:none;stroke:#607991;stroke-width:2;stroke-dasharray:12 8}.branch{fill:${colors.panel2};stroke:#607991;stroke-width:1.5}
    .note{font-size:14px;fill:${colors.muted}}.footer{font-size:${ko ? 15 : 13}px;fill:${colors.muted}}
  </style>
  <rect width="1600" height="1580" class="canvas"/><rect x="24" y="24" width="1552" height="1532" rx="26" class="frame"/>
  <text x="800" y="82" text-anchor="middle" class="title">${esc(copy.title)}</text><text x="800" y="120" text-anchor="middle" class="subtitle">${esc(copy.subtitle)}</text>
  ${copy.participants.map(([name, sub], i) => `<rect x="${xs[i] - 112}" y="160" width="224" height="72" rx="12" class="header"/><text x="${xs[i]}" y="190" text-anchor="middle" class="participant">${esc(name)}</text><text x="${xs[i]}" y="214" text-anchor="middle" class="role">${esc(sub)}</text><path d="M${xs[i]} 232 V1500" class="lifeline"/>`).join("")}
  <rect x="${xs[1] - 8}" y="295" width="16" height="670" rx="6" class="activation"/><rect x="${xs[2] - 8}" y="365" width="16" height="560" rx="6" class="activation"/>
  <rect x="${xs[3] - 8}" y="1060" width="16" height="430" rx="6" class="activation"/><rect x="${xs[4] - 8}" y="495" width="16" height="940" rx="6" class="activation"/>
  <rect x="78" y="270" width="1444" height="420" rx="18" class="alt"/><rect x="98" y="282" width="210" height="30" rx="15" class="branch"/><text x="118" y="303" class="note">${esc(copy.frames[0])}</text>
  <rect x="78" y="745" width="1444" height="220" rx="18" class="alt"/><rect x="98" y="757" width="240" height="30" rx="15" class="branch"/><text x="118" y="778" class="note">${esc(copy.frames[1])}</text>
  <rect x="78" y="1025" width="1444" height="475" rx="18" class="alt"/><rect x="98" y="1037" width="250" height="30" rx="15" class="branch"/><text x="118" y="1058" class="note">${esc(copy.frames[2])}</text>
  ${rows}
  <text x="800" y="1535" text-anchor="middle" class="footer">${esc(copy.footer)}</text>
</svg>`;
}

const assets = [
  ["bluetape4k-text-part3-aho-corasick-flow-01", textPart3],
  ["bluetape4k-text-part4-dictionary-gate-01", textPart4],
  ["transactional-outbox-idempotency-flow-01", outboxFlow],
  ["transactional-outbox-idempotency-sequence-01", sequence],
];

for (const [stem, make] of assets) {
  for (const locale of ["ko", "en"]) {
    const base = `${out}/${stem}-${locale}`;
    writeFileSync(`${base}.svg`, make(locale));
    execFileSync("xmllint", ["--noout", `${base}.svg`]);
    execFileSync("cairosvg", [`${base}.svg`, "-o", `${base}.png`, "-s", "2"], { stdio: "inherit" });
  }
}
