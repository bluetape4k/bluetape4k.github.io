import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const outputDir = "public/assets";
const c = {
  canvas: "#07111F",
  frame: "#0D1B2D",
  card: "#10243A",
  focus: "#0C3044",
  warn: "#332B18",
  line: "#36536F",
  text: "#E6F2FF",
  muted: "#9CB4CC",
  cyan: "#36C5F0",
  mint: "#5EEAD4",
  amber: "#FBBF24",
};

const esc = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function shell(locale, title, subtitle, body, footer, height = 980) {
  const titleFont = locale === "ko" ? '"goorm Sans","Apple SD Gothic Neo",sans-serif' : '"Architects Daughter","Comic Sans MS",cursive';
  const bodyFont = locale === "ko" ? '"goorm Sans Code","goorm Sans",monospace' : '"Comic Mono","SFMono-Regular",Menlo,monospace';
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="${height}" viewBox="0 0 1600 ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(title)}</title><desc id="desc">${esc(footer)}</desc>
  <defs><marker id="arrow" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse"><path d="M1,1 L13,7 L1,13 Z" fill="${c.cyan}"/></marker></defs>
  <style>
    .canvas{fill:${c.canvas}}.frame{fill:${c.frame};stroke:${c.line};stroke-width:2}.card{fill:${c.card};stroke:${c.line};stroke-width:2}
    .focus{fill:${c.focus};stroke:${c.mint};stroke-width:2.5}.warn{fill:${c.warn};stroke:${c.amber};stroke-width:2}
    .title{font:700 40px ${titleFont};fill:${c.text}}.subtitle{font:500 20px ${bodyFont};fill:${c.muted}}
    .card-title{font:700 24px ${titleFont};fill:${c.text}}.body{font:600 18px ${bodyFont};fill:${c.muted}}
    .chip{font:700 16px ${bodyFont};fill:${c.mint}}.label{font:700 16px ${bodyFont};fill:${c.cyan}}
    .connector{fill:none;stroke:${c.cyan};stroke-width:4;marker-end:url(#arrow)}.divider{stroke:${c.line};stroke-width:2}
    .footer{font:600 18px ${bodyFont};fill:${c.muted}}
  </style>
  <rect width="1600" height="${height}" class="canvas"/><rect x="32" y="32" width="1536" height="${height - 64}" rx="32" class="frame"/>
  <text x="80" y="98" class="title">${esc(title)}</text><text x="80" y="138" class="subtitle">${esc(subtitle)}</text>
  ${body}<line x1="80" y1="${height - 150}" x2="1520" y2="${height - 150}" class="divider"/>
  <text x="800" y="${height - 96}" text-anchor="middle" class="footer">${esc(footer)}</text>
</svg>`;
  return svg.replace(/[ \t]+$/gm, "");
}

function card(x, y, w, h, title, lines, cls = "card") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" class="${cls}"/>
  <text x="${x + 28}" y="${y + 52}" class="card-title">${esc(title)}</text>
  ${lines.map((line, i) => `<text x="${x + 28}" y="${y + 98 + i * 38}" class="body">${esc(line)}</text>`).join("\n")}`;
}

function bomFlow(locale) {
  const ko = locale === "ko";
  const t = ko ? {
    title: "중앙 BOM이 공개하는 호환 버전 조합",
    subtitle: "각 저장소의 BOM과 외부 호환선을 중앙 BOM이 조합하고, 소비자는 버전 없는 모듈 의존성을 선언합니다.",
    left: "저장소별 BOM", leftLines: ["projects / exposed / aws / image", "text / graph / leader / javers"],
    center: "bluetape4k-dependencies", centerLines: ["하위 BOM 조합", "외부 의존성 호환선"],
    right: "소비자 프로젝트", rightLines: ["애플리케이션 / 워크숍", "필요한 모듈만 선언"],
    a: "배포된 BOM 가져오기", b: "중앙 BOM 적용", footer: "저장소별 BOM은 모듈 목록을, 중앙 BOM은 함께 사용할 버전 조합을 책임집니다.",
  } : {
    title: "The Central BOM Publishes a Compatible Version Set",
    subtitle: "The central BOM composes repository BOMs and external compatibility lines; consumers omit module versions.",
    left: "Repository BOMs", leftLines: ["projects / exposed / aws / image", "text / graph / leader / javers"],
    center: "bluetape4k-dependencies", centerLines: ["Compose sub-BOMs", "Align external dependencies"],
    right: "Consumer projects", rightLines: ["Applications / workshops", "Declare only needed modules"],
    a: "import published BOMs", b: "apply central BOM", footer: "Repository BOMs own module lists; the central BOM owns the compatible version set.",
  };
  return shell(locale, t.title, t.subtitle, `
    ${card(80, 270, 400, 220, t.left, t.leftLines)}
    ${card(600, 240, 400, 280, t.center, t.centerLines, "focus")}
    ${card(1120, 270, 400, 220, t.right, t.rightLines)}
    <path d="M480 380 H580" class="connector"/><text x="530" y="350" text-anchor="middle" class="label">${esc(t.a)}</text>
    <path d="M1000 380 H1100" class="connector"/><text x="1050" y="350" text-anchor="middle" class="label">${esc(t.b)}</text>
    <rect x="600" y="600" width="400" height="94" rx="20" class="card"/>
    <text x="800" y="640" text-anchor="middle" class="chip">api(platform(...))</text>
    <text x="800" y="674" text-anchor="middle" class="body">Maven POM dependencyManagement</text>`, t.footer);
}

function inputBoundary(locale) {
  const ko = locale === "ko";
  const t = ko ? {
    title: "입력 경계는 메모리 적재 전에 시작된다",
    subtitle: "저비용 검사를 먼저 수행하고, 디코딩 이후의 고비용 처리는 제한된 자원 안에서 실행합니다.",
    cards: [
      ["요청 수신", ["스트림 / 임시 파일", "요청 ID 부여"]],
      ["저비용 검사", ["크기 / 콘텐츠 유형", "허용 형식"]],
      ["제한된 디코딩", ["최대 픽셀 / 문자열 길이", "타임아웃"]],
      ["기능 처리", ["OCR / 토큰화 / 금칙어", "정규화"]],
      ["안전한 결과", ["구조화된 응답", "원문 없는 로그"]],
    ],
    reject: "조기 거부", rejectLines: ["413 / 415", "민감 정보 미노출"], labels: ["검증", "허용", "처리", "응답"],
    footer: "입력 크기, 메모리 적재, 처리 시간, 오류 응답을 하나의 경계 계약으로 검증합니다.",
  } : {
    title: "The Input Boundary Starts Before Memory Allocation",
    subtitle: "Run low-cost checks first, then keep decode and expensive processing within explicit resource limits.",
    cards: [
      ["Receive request", ["Stream / temporary file", "Assign request ID"]],
      ["Low-cost checks", ["Size / content type", "Allowed format"]],
      ["Bounded decode", ["Pixel / text limit", "Timeout"]],
      ["Processing", ["OCR / tokens / blockwords", "Normalize"]],
      ["Safe result", ["Structured response", "Raw input excluded"]],
    ],
    reject: "Early rejection", rejectLines: ["413 / 415", "No sensitive input"], labels: ["validate", "admit", "process", "respond"],
    footer: "Treat input size, memory allocation, processing time, and error responses as one boundary contract.",
  };
  const xs = [60, 365, 670, 975, 1280];
  const cards = t.cards.map(([title, lines], i) => card(xs[i], 245, 250, 210, title, lines, i === 2 ? "focus" : "card")).join("\n");
  const links = t.labels.map((label, i) => {
    const start = xs[i] + 250;
    const end = xs[i + 1] - 20;
    return `<path d="M${start} 350 H${end}" class="connector"/><text x="${(start + end) / 2}" y="320" text-anchor="middle" class="label">${esc(label)}</text>`;
  }).join("\n");
  return shell(locale, t.title, t.subtitle, `${cards}${links}
    ${card(655, 590, 280, 150, t.reject, t.rejectLines, "warn")}
    <path d="M795 455 V570" class="connector"/><text x="823" y="520" class="label">${esc(t.reject)}</text>`, t.footer);
}

function publicContract(locale) {
  const ko = locale === "ko";
  const t = ko ? {
    title: "내부 빌드 계약과 공개 BOM 계약의 분리",
    subtitle: "버전 카탈로그는 공급자의 빌드 작성을 돕고, 게시된 POM은 소비자의 의존성 해석에 참여합니다.",
    catalog: "Gradle 버전 카탈로그", catalogLines: ["내부 빌드 별칭", "플러그인 / 라이브러리 버전"],
    platform: "java-platform", platformLines: ["하위 BOM 가져오기", "개별 제약 조건"],
    pom: "게시된 Maven POM", pomLines: ["dependencyManagement", "라이선스 / SCM 메타데이터"],
    consumer: "소비자 의존성 해석", consumerLines: ["중앙 BOM 적용", "모듈 버전 생략"],
    labels: ["빌드 입력", "게시", "해석"], footer: "카탈로그를 사용자 아티팩트로 설명하지 않고, 공개 계약은 게시된 POM으로 검증합니다.",
  } : {
    title: "Separate the Internal Build Contract from the Public BOM",
    subtitle: "The version catalog supports maintainer authoring; the published POM participates in consumer resolution.",
    catalog: "Gradle version catalog", catalogLines: ["Internal build aliases", "Plugin / library versions"],
    platform: "java-platform", platformLines: ["Import sub-BOMs", "Declare individual constraints"],
    pom: "Published Maven POM", pomLines: ["dependencyManagement", "License / SCM metadata"],
    consumer: "Consumer resolution", consumerLines: ["Apply central BOM", "Omit module versions"],
    labels: ["build input", "publish", "resolve"], footer: "Do not present the catalog as a consumer artifact; verify the public contract in the published POM.",
  };
  return shell(locale, t.title, t.subtitle, `
    ${card(70, 270, 320, 230, t.catalog, t.catalogLines)}
    ${card(470, 240, 320, 290, t.platform, t.platformLines, "focus")}
    ${card(870, 240, 320, 290, t.pom, t.pomLines, "focus")}
    ${card(1270, 270, 260, 230, t.consumer, t.consumerLines)}
    <path d="M390 385 H450" class="connector"/><text x="420" y="350" text-anchor="middle" class="label">${esc(t.labels[0])}</text>
    <path d="M790 385 H850" class="connector"/><text x="820" y="350" text-anchor="middle" class="label">${esc(t.labels[1])}</text>
    <path d="M1190 385 H1250" class="connector"/><text x="1220" y="350" text-anchor="middle" class="label">${esc(t.labels[2])}</text>
    <rect x="470" y="610" width="720" height="92" rx="20" class="card"/>
    <text x="830" y="650" text-anchor="middle" class="chip">publishToMavenLocal</text>
    <text x="830" y="682" text-anchor="middle" class="body">${ko ? "게시 전 POM 구조와 메타데이터 검증" : "Verify POM structure and metadata before release"}</text>`, t.footer);
}

function render(stem, locale, svg) {
  const svgPath = `${outputDir}/${stem}-${locale}.svg`;
  const pngPath = `${outputDir}/${stem}-${locale}.png`;
  writeFileSync(svgPath, svg);
  execFileSync("xmllint", ["--noout", svgPath], { stdio: "inherit" });
  execFileSync("cairosvg", [svgPath, "-o", pngPath, "-s", "2"], { stdio: "inherit" });
}

for (const locale of ["ko", "en"]) {
  render("bluetape4k-dependencies-bom-flow-01", locale, bomFlow(locale));
  render("bluetape4k-dependencies-input-boundary-01", locale, inputBoundary(locale));
  render("bluetape4k-dependencies-public-bom-contract-01", locale, publicContract(locale));
}
