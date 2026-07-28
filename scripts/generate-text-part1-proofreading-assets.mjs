import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const outputDir = "public/assets";
const canvas = "#07111F";
const frame = "#0D1B2D";
const panel = "#10243A";
const line = "#38506A";
const text = "#E6F2FF";
const muted = "#A9BDD1";
const blue = "#60A5FA";
const cyan = "#36C5F0";
const green = "#5EEAD4";
const violet = "#B794F4";
const amber = "#FBBF24";

const copy = {
  ko: {
    title: "서비스 텍스트 처리 경계와 품질 검증 흐름",
    subtitle: "저비용 경계 검증을 먼저 수행하고, 필요한 분석만 실행한 뒤 결과를 재현 가능한 테스트로 보호한다",
    stages: [
      ["1", "전송 경계", ["HTTP 본문 크기 제한", "문자열 생성 전 차단"], blue],
      ["2", "서비스 입력 검증", ["문자 수와 공백 확인", "원문을 오류에 포함하지 않음"], cyan],
      ["3", "정규화·라우팅", ["표기 정규화", "언어 감지와 처리 경로 선택"], green],
      ["4", "텍스트 분석", ["한국어·일본어 토큰화", "Aho-Corasick 다중 검색"], violet],
      ["5", "판단·품질 게이트", ["필터링·색인·라우팅", "결정적 픽스처로 회귀 검증"], amber],
    ],
    leftNoteTitle: "입력 메모리 경계",
    leftNote: ["`String` 길이 검사는 이미 만들어진 문자열을 보호한다.", "HTTP 본문 제한은 그보다 앞선 전송 계층에 둔다."],
    rightNoteTitle: "품질 주장 경계",
    rightNote: ["품질 게이트는 저장소의 대표 동작을 고정한다.", "대규모 외부 말뭉치의 통계적 정확도를 보장하지 않는다."],
    desc: "HTTP 본문 제한에서 서비스 입력 검증, 정규화와 라우팅, 텍스트 분석, 서비스 판단과 품질 게이트로 이어지는 다섯 단계 흐름",
  },
  en: {
    title: "Service Text-Processing Boundaries and Quality Evidence",
    subtitle: "Apply low-cost boundary checks first, run only the analysis that is needed, and protect outcomes with reproducible tests",
    stages: [
      ["1", "Transport boundary", ["Cap the HTTP request body", "Reject before String allocation"], blue],
      ["2", "Service validation", ["Check length and blank input", "Do not echo raw text"], cyan],
      ["3", "Normalize and route", ["Normalize representation", "Detect language and route"], green],
      ["4", "Analyze text", ["Tokenize Korean/Japanese", "Aho-Corasick keyword search"], violet],
      ["5", "Decide and verify", ["Filter, index, or route", "Verify with stable fixtures"], amber],
    ],
    leftNoteTitle: "Input memory boundary",
    leftNote: ["A String-length guard protects an already materialized value.", "The transport must cap the HTTP body before that point."],
    rightNoteTitle: "Quality claim boundary",
    rightNote: ["The gate fixes representative repository behavior.", "It does not claim statistical accuracy on a large external corpus."],
    desc: "Five-stage flow from HTTP body limits through service validation, normalization and routing, text analysis, service decisions, and quality gates",
  },
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textLines(lines, x, y, className, gap = 30) {
  return `<text x="${x}" y="${y}" class="${className}">${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : gap}">${escapeXml(line)}</tspan>`)
    .join("")}</text>`;
}

function svg(locale) {
  const value = copy[locale];
  const titleFont =
    locale === "ko"
      ? '"goorm Sans","Apple SD Gothic Neo",sans-serif'
      : '"Architects Daughter","Comic Sans MS",cursive';
  const bodyFont =
    locale === "ko"
      ? '"goorm Sans Code","goorm Sans",monospace'
      : '"Comic Mono","SFMono-Regular",Menlo,monospace';
  const titleSize = locale === "ko" ? 42 : 30;
  const subtitleSize = locale === "ko" ? 20 : 16;
  const cardTitleFont = locale === "ko" ? titleFont : bodyFont;
  const cardTitleSize = locale === "ko" ? 24 : 17;
  const bodySize = locale === "ko" ? 17 : 15;
  const noteTitleFont = locale === "ko" ? titleFont : bodyFont;
  const noteTitleSize = locale === "ko" ? 20 : 16;
  const noteSize = locale === "ko" ? 16 : 14;
  const cards = value.stages
    .map(([step, heading, body, color], index) => {
      const x = 70 + index * 300;
      return `<g data-card="${step}">
        <rect x="${x}" y="248" width="260" height="300" rx="24" class="card"/>
        <circle cx="${x + 34}" cy="282" r="17" fill="${color}"/>
        <text x="${x + 34}" y="289" text-anchor="middle" class="step">${step}</text>
        <text x="${x + 24}" y="344" class="card-title">${escapeXml(heading)}</text>
        <rect x="${x + 24}" y="370" width="70" height="4" rx="2" fill="${color}"/>
        ${textLines(body, x + 24, 422, "body", 36)}
      </g>`;
    })
    .join("\n");
  const connectors = [0, 1, 2, 3]
    .map((index) => {
      const x1 = 330 + index * 300;
      const x2 = 360 + index * 300;
      return `<path d="M ${x1} 398 H ${x2}" class="connector" marker-end="url(#arrow)"/>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(value.title)}</title>
  <desc id="desc">${escapeXml(value.desc)}</desc>
  <defs>
    <marker id="arrow" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M 0 0 L 14 7 L 0 14 Z" fill="${blue}"/>
    </marker>
  </defs>
  <style>
    .canvas{fill:${canvas}}.frame{fill:${frame};stroke:${line};stroke-width:2}
    .card{fill:${panel};stroke:${line};stroke-width:2}
    .title{font:700 ${titleSize}px ${titleFont};fill:${text}}
    .subtitle{font:500 ${subtitleSize}px ${bodyFont};fill:${muted}}
    .step{font:800 16px ${bodyFont};fill:${canvas}}
    .card-title{font:700 ${cardTitleSize}px ${cardTitleFont};fill:${text}}
    .body{font:500 ${bodySize}px ${bodyFont};fill:${muted}}
    .connector{fill:none;stroke:${blue};stroke-width:5;stroke-linecap:round}
    .note-title{font:700 ${noteTitleSize}px ${noteTitleFont};fill:${text}}
    .note{font:500 ${noteSize}px ${bodyFont};fill:${muted}}
  </style>
  <rect width="1600" height="900" class="canvas"/>
  <rect x="32" y="32" width="1536" height="836" rx="32" class="frame"/>
  <text x="70" y="104" class="title">${escapeXml(value.title)}</text>
  <text x="70" y="146" class="subtitle">${escapeXml(value.subtitle)}</text>
  <rect x="70" y="192" width="1460" height="400" rx="28" fill="#0A1727" stroke="${line}" stroke-width="2"/>
  ${connectors}
  ${cards}
  <g>
    <rect x="70" y="628" width="710" height="174" rx="22" fill="#0A1727" stroke="${cyan}" stroke-width="2"/>
    <circle cx="104" cy="670" r="8" fill="${cyan}"/>
    <text x="126" y="678" class="note-title">${escapeXml(value.leftNoteTitle)}</text>
    ${textLines(value.leftNote, 104, 728, "note", 30)}
  </g>
  <g>
    <rect x="820" y="628" width="710" height="174" rx="22" fill="#0A1727" stroke="${amber}" stroke-width="2"/>
    <circle cx="854" cy="670" r="8" fill="${amber}"/>
    <text x="876" y="678" class="note-title">${escapeXml(value.rightNoteTitle)}</text>
    ${textLines(value.rightNote, 854, 728, "note", 30)}
  </g>
</svg>`;
}

for (const locale of ["ko", "en"]) {
  const stem = `${outputDir}/bluetape4k-text-part1-pipeline-01-${locale}`;
  writeFileSync(`${stem}.svg`, svg(locale));
  execFileSync("cairosvg", [`${stem}.svg`, "-o", `${stem}.png`, "-s", "2"], {
    stdio: "inherit",
  });
}
