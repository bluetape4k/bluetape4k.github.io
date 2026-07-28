import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const locale = process.argv[2];
if (!["ko", "en"].includes(locale)) {
  throw new Error("Usage: node scripts/generate-text-part2-proofreading-assets.mjs <ko|en>");
}

const outputDir = "public/assets";
const colors = {
  canvas: "#07111F",
  frame: "#0D1B2D",
  panel: "#10243A",
  panelDark: "#0A1727",
  line: "#38506A",
  text: "#E6F2FF",
  muted: "#A9BDD1",
  blue: "#60A5FA",
  cyan: "#36C5F0",
  green: "#5EEAD4",
  violet: "#B794F4",
  amber: "#FBBF24",
};

const copy = {
  ko: {
    title: "다국어 텍스트 입력의 검증과 처리 경계",
    subtitle: "전송 계층에서 본문을 제한하고, 문자열 검증과 언어 감지 뒤에 애플리케이션 정책으로 처리 경로를 선택한다",
    stages: [
      ["HTTP 본문", ["바이트 스트림", "Content-Type"], colors.blue],
      ["전송 계층", ["본문 크기 제한", "제한된 String 변환"], colors.cyan],
      ["입력 검증", ["공백 여부", "최대 100,000자"], colors.green],
      ["Lingua 감지", ["공유 감지기", "Set<Language>"], colors.violet],
    ],
    branches: [
      ["한국어 처리", ["normalize · tokenize", "토큰 · 구문 · 어간"], colors.cyan],
      ["일본어 처리", ["tokenize · filterNoun", "명사 · 금칙어 결과"], colors.violet],
      ["일반 처리", ["TextNormalizer", "키워드 · 미확정 상태"], colors.amber],
    ],
    policyTitle: "처리 정책은 애플리케이션이 결정한다",
    policyLines: [
      "혼합 언어 입력은 목적에 따라 한 경로 또는 여러 경로로 보낸다.",
      "라이브러리의 길이 예외와 HTTP 4xx 응답 사이의 변환도 애플리케이션 책임이다.",
      "감지기는 재사용하되, 코루틴 예제는 Mutex로 공유 접근을 보호한다.",
    ],
    desc: "HTTP 본문 제한, 문자열 검증, Lingua 언어 감지, 한국어와 일본어 및 일반 처리 경로, 애플리케이션 정책의 책임을 구분한 흐름",
  },
  en: {
    title: "Validation and Processing Boundaries for Multilingual Text",
    subtitle: "Cap the request body at transport, validate the materialized string, detect languages, and let application policy choose processors",
    stages: [
      ["HTTP body", ["Byte stream", "Content-Type"], colors.blue],
      ["Transport", ["Cap body size", "Bounded String decode"], colors.cyan],
      ["Input validation", ["Reject blank input", "At most 100,000 chars"], colors.green],
      ["Lingua detection", ["Shared detector", "Set<Language>"], colors.violet],
    ],
    branches: [
      ["Korean processor", ["normalize / tokenize", "tokens / phrases / stems"], colors.cyan],
      ["Japanese processor", ["tokenize / filterNoun", "nouns / blockword result"], colors.violet],
      ["Generic processor", ["TextNormalizer", "keywords / unresolved state"], colors.amber],
    ],
    policyTitle: "The application owns processing policy",
    policyLines: [
      "Mixed-language input may run one or several processors, depending on purpose.",
      "The application also maps library length exceptions to HTTP 4xx responses.",
      "Reuse the detector; the coroutine workshop guards shared access with a Mutex.",
    ],
    desc: "Flow separating HTTP body limits, string validation, Lingua detection, Korean, Japanese, and generic processors, and application-owned routing policy",
  },
};

const c = copy[locale];
const titleFont =
  locale === "ko"
    ? '"goorm Sans","Apple SD Gothic Neo",sans-serif'
    : '"Architects Daughter","Comic Sans MS",cursive';
const bodyFont =
  locale === "ko"
    ? '"goorm Sans Code","goorm Sans",monospace'
    : '"Comic Mono","SFMono-Regular",Menlo,monospace';

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function lines(values, x, y, className, gap = 30) {
  return `<text x="${x}" y="${y}" class="${className}">${values
    .map((value, index) => `<tspan x="${x}" dy="${index ? gap : 0}">${esc(value)}</tspan>`)
    .join("")}</text>`;
}

const topCards = c.stages
  .map(([title, body, accent], index) => {
    const x = 80 + index * 380;
    return `<g data-card="stage-${index + 1}">
      <rect x="${x}" y="230" width="320" height="190" rx="22" class="card"/>
      <rect x="${x}" y="230" width="320" height="7" rx="3" fill="${accent}"/>
      <text x="${x + 24}" y="285" class="card-title">${esc(title)}</text>
      ${lines(body, x + 24, 336, "body", 32)}
    </g>`;
  })
  .join("\n");

const topConnectors = [0, 1, 2]
  .map((index) => {
    const x1 = 400 + index * 380;
    const x2 = 460 + index * 380;
    return `<path data-connector="top-${index + 1}" d="M ${x1} 325 H ${x2}" class="connector" marker-end="url(#arrow)"/>`;
  })
  .join("\n");

const branchCards = c.branches
  .map(([title, body, accent], index) => {
    const x = 120 + index * 500;
    return `<g data-card="branch-${index + 1}">
      <rect x="${x}" y="560" width="360" height="180" rx="22" class="card"/>
      <circle cx="${x + 28}" cy="594" r="8" fill="${accent}"/>
      <text x="${x + 50}" y="603" class="branch-title">${esc(title)}</text>
      ${lines(body, x + 28, 656, "body", 31)}
    </g>`;
  })
  .join("\n");

const branchConnectors = [
  "M 1300 420 V 439 Q 1300 455 1284 455 H 316 Q 300 455 300 471 V 548",
  "M 1380 420 V 469 Q 1380 485 1364 485 H 816 Q 800 485 800 501 V 548",
  "M 1460 420 V 499 Q 1460 515 1444 515 H 1316 Q 1300 515 1300 531 V 548",
]
  .map(
    (d, index) =>
      `<path data-connector="branch-${index + 1}" d="${d}" class="connector branch" marker-end="url(#arrow)"/>`,
  )
  .join("\n");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="980" viewBox="0 0 1600 980" role="img" aria-labelledby="title desc">
  <title id="title">${esc(c.title)}</title>
  <desc id="desc">${esc(c.desc)}</desc>
  <defs>
    <marker id="arrow" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M 0 0 L 14 7 L 0 14 Z" fill="${colors.blue}"/>
    </marker>
  </defs>
  <style>
    .canvas{fill:${colors.canvas}}.frame{fill:${colors.frame};stroke:${colors.line};stroke-width:2}
    .card{fill:${colors.panel};stroke:${colors.line};stroke-width:2}
    .title{font:700 ${locale === "ko" ? 42 : 30}px ${titleFont};fill:${colors.text}}
    .subtitle{font:500 ${locale === "ko" ? 19 : 15}px ${bodyFont};fill:${colors.muted}}
    .card-title{font:700 ${locale === "ko" ? 25 : 18}px ${titleFont};fill:${colors.text}}
    .branch-title{font:700 ${locale === "ko" ? 23 : 18}px ${titleFont};fill:${colors.text}}
    .body{font:500 ${locale === "ko" ? 17 : 15}px ${bodyFont};fill:${colors.muted}}
    .connector{fill:none;stroke:${colors.blue};stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
    .branch{stroke:${colors.cyan}}
    .policy-title{font:700 ${locale === "ko" ? 23 : 18}px ${titleFont};fill:${colors.text}}
    .policy{font:500 ${locale === "ko" ? 16 : 14}px ${bodyFont};fill:${colors.muted}}
  </style>
  <rect width="1600" height="980" class="canvas"/>
  <rect x="32" y="32" width="1536" height="916" rx="32" class="frame"/>
  <text x="80" y="104" class="title">${esc(c.title)}</text>
  <text x="80" y="148" class="subtitle">${esc(c.subtitle)}</text>
  <rect x="64" y="196" width="1472" height="574" rx="28" fill="${colors.panelDark}" stroke="${colors.line}" stroke-width="2"/>
  ${topConnectors}
  ${branchConnectors}
  ${topCards}
  ${branchCards}
  <g data-card="policy">
    <rect x="80" y="790" width="1440" height="144" rx="22" fill="${colors.panelDark}" stroke="${colors.amber}" stroke-width="2"/>
    <circle cx="112" cy="824" r="8" fill="${colors.amber}"/>
    <text x="134" y="832" class="policy-title">${esc(c.policyTitle)}</text>
    ${lines(c.policyLines, 112, 866, "policy", 22)}
  </g>
</svg>`;

const stem = `${outputDir}/bluetape4k-text-part2-language-branches-01-${locale}`;
writeFileSync(`${stem}.svg`, svg);
execFileSync("cairosvg", [`${stem}.svg`, "-o", `${stem}.png`, "-s", "2"], {
  stdio: "inherit",
});
