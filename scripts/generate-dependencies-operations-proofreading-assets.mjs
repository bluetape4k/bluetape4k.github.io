import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const outputDir = "public/assets";
const colors = {
  canvas: "#07111F",
  frame: "#0D1B2D",
  card: "#10243A",
  line: "#36536F",
  text: "#E6F2FF",
  muted: "#9CB4CC",
  cyan: "#36C5F0",
  mint: "#5EEAD4",
  violet: "#B794F4",
  amber: "#FBBF24",
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function shell({ locale, title, subtitle, body, desc, height = 940 }) {
  const titleFont =
    locale === "ko"
      ? '"goorm Sans","Apple SD Gothic Neo",sans-serif'
      : '"Architects Daughter","Comic Sans MS",cursive';
  const bodyFont =
    locale === "ko"
      ? '"goorm Sans Code","goorm Sans",monospace'
      : '"Comic Mono","SFMono-Regular",Menlo,monospace';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="${height}" viewBox="0 0 1600 ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(desc)}</desc>
  <defs>
    <marker id="arrow" markerWidth="16" markerHeight="16" refX="13" refY="8" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M1,1 L15,8 L1,15 Z" fill="${colors.cyan}"/>
    </marker>
  </defs>
  <style>
    .canvas{fill:${colors.canvas}}.frame{fill:${colors.frame};stroke:${colors.line};stroke-width:2}
    .card{fill:${colors.card};stroke:${colors.line};stroke-width:2}.focus{fill:#0C3044;stroke:${colors.mint};stroke-width:2.5}
    .warn{fill:#332B18;stroke:${colors.amber};stroke-width:2}.title{font:700 40px ${titleFont};fill:${colors.text}}
    .subtitle{font:500 20px ${bodyFont};fill:${colors.muted}}.card-title{font:700 25px ${titleFont};fill:${colors.text}}
    .body{font:600 18px ${bodyFont};fill:${colors.muted}}.chip{font:700 16px ${bodyFont};fill:${colors.mint}}
    .label{font:700 16px ${bodyFont};fill:${colors.cyan}}.connector{fill:none;stroke:${colors.cyan};stroke-width:4;marker-end:url(#arrow)}
    .divider{stroke:${colors.line};stroke-width:2}.footer{font:600 18px ${bodyFont};fill:${colors.muted}}
  </style>
  <rect width="1600" height="${height}" class="canvas"/>
  <rect x="32" y="32" width="1536" height="${height - 64}" rx="32" class="frame"/>
  <text x="80" y="98" class="title">${escapeXml(title)}</text>
  <text x="80" y="138" class="subtitle">${escapeXml(subtitle)}</text>
  ${body}
</svg>`;
}

function governance(locale) {
  const ko = locale === "ko";
  const t = ko
    ? {
        title: "BOM을 기준으로 관리하는 버전 경계",
        subtitle: "애플리케이션은 BOM 버전을 선택하고 개별 모듈 버전은 예외로만 관리합니다.",
        app: "애플리케이션",
        appBody: ["BOM 버전 1개 선택", "필요한 모듈만 선언"],
        bom: "bluetape4k-dependencies",
        bomBody: ["검증된 모듈 조합", "전이 의존성 호환선"],
        modules: "선택한 기능 모듈",
        modulesBody: ["projects · exposed · aws", "image · text · leader"],
        exception: "임시 버전 예외",
        exceptionBody: ["사유 · 제거 조건 기록", "검증 후 BOM으로 복귀"],
        a: "BOM 적용",
        b: "버전 정렬",
        c: "문서화된 예외만 허용",
        footer: "기본 경로는 중앙 정렬이며, 개별 버전 고정은 추적 가능한 임시 예외입니다.",
      }
    : {
        title: "Version Boundaries Governed by the BOM",
        subtitle: "Applications choose one BOM version and treat per-module versions as documented exceptions.",
        app: "Application",
        appBody: ["Choose one BOM version", "Declare only needed modules"],
        bom: "bluetape4k-dependencies",
        bomBody: ["Tested module combination", "Transitive compatibility line"],
        modules: "Selected feature modules",
        modulesBody: ["projects / exposed / aws", "image / text / leader"],
        exception: "Temporary version override",
        exceptionBody: ["Record reason and exit", "Return to BOM after proof"],
        a: "apply BOM",
        b: "align versions",
        c: "documented exception only",
        footer: "The normal path is centrally aligned; an override is a traceable temporary exception.",
      };

  const card = (x, y, title, lines, cls = "card") => `
    <rect x="${x}" y="${y}" width="380" height="190" rx="24" class="${cls}"/>
    <text x="${x + 28}" y="${y + 54}" class="card-title">${escapeXml(title)}</text>
    <text x="${x + 28}" y="${y + 104}" class="body">${escapeXml(lines[0])}</text>
    <text x="${x + 28}" y="${y + 140}" class="body">${escapeXml(lines[1])}</text>`;

  return shell({
    locale,
    title: t.title,
    subtitle: t.subtitle,
    desc: t.footer,
    body: `
      ${card(80, 240, t.app, t.appBody)}
      ${card(610, 240, t.bom, t.bomBody, "focus")}
      ${card(1140, 240, t.modules, t.modulesBody)}
      <path d="M460 335 H590" class="connector"/>
      <text x="525" y="310" text-anchor="middle" class="label">${escapeXml(t.a)}</text>
      <path d="M990 335 H1120" class="connector"/>
      <text x="1055" y="310" text-anchor="middle" class="label">${escapeXml(t.b)}</text>
      ${card(610, 540, t.exception, t.exceptionBody, "warn")}
      <path d="M800 430 V520" class="connector"/>
      <text x="828" y="482" class="label">${escapeXml(t.c)}</text>
      <line x1="80" y1="790" x2="1520" y2="790" class="divider"/>
      <text x="800" y="836" text-anchor="middle" class="footer">${escapeXml(t.footer)}</text>`,
  });
}

function composition(locale) {
  const ko = locale === "ko";
  const t = ko
    ? {
        title: "서비스 경계가 모듈 조합을 결정한다",
        subtitle: "같은 BOM을 사용해도 서비스의 책임과 수명 주기에 따라 선택하는 모듈은 달라집니다.",
        bom: "공통 버전 경계 · bluetape4k-dependencies 1.3.0",
        cards: [
          ["Spring Boot 워커", "DB 작업 · S3 결과", "단일 실행 · 상태 점검", "Exposed · AWS · Leader"],
          ["Ktor 검색 API", "HTTP · 입력 검증", "관측성 · 클라이언트 수명 주기", "Ktor · Text · AWS"],
          ["이미지 업로드 API", "크기 제한 · 스트리밍", "디코딩 · OCR", "Image · OCR · Okio"],
        ],
        footer: "BOM은 버전을 정렬하고, 애플리케이션은 서비스 경계와 자원 소유권을 설계합니다.",
      }
    : {
        title: "Service Boundaries Determine Module Composition",
        subtitle: "Services share one BOM but select different modules according to responsibility and lifecycle.",
        bom: "Shared version boundary / bluetape4k-dependencies 1.3.0",
        cards: [
          ["Spring Boot worker", "DB work / S3 output", "Single execution / health", "Exposed / AWS / Leader"],
          ["Ktor search API", "HTTP / input validation", "Observability / client lifecycle", "Ktor / Text / AWS"],
          ["Image upload API", "Size limit / streaming", "Decode / OCR", "Image / OCR / Okio"],
        ],
        footer: "The BOM aligns versions; the application designs service boundaries and resource ownership.",
      };

  const cards = t.cards
    .map(([title, a, b, modules], index) => {
      const x = 80 + index * 510;
      return `
        <path d="M${x + 220} 280 V348" class="connector"/>
        <rect x="${x}" y="370" width="440" height="330" rx="26" class="card"/>
        <text x="${x + 30}" y="430" class="card-title">${escapeXml(title)}</text>
        <line x1="${x + 30}" y1="458" x2="${x + 410}" y2="458" class="divider"/>
        <text x="${x + 30}" y="510" class="body">${escapeXml(a)}</text>
        <text x="${x + 30}" y="554" class="body">${escapeXml(b)}</text>
        <rect x="${x + 28}" y="610" width="384" height="58" rx="16" fill="#12364A"/>
        <text x="${x + 220}" y="646" text-anchor="middle" class="chip">${escapeXml(modules)}</text>`;
    })
    .join("\n");

  return shell({
    locale,
    title: t.title,
    subtitle: t.subtitle,
    desc: t.footer,
    body: `
      <rect x="80" y="200" width="1440" height="80" rx="22" class="focus"/>
      <text x="800" y="250" text-anchor="middle" class="card-title">${escapeXml(t.bom)}</text>
      ${cards}
      <line x1="80" y1="790" x2="1520" y2="790" class="divider"/>
      <text x="800" y="836" text-anchor="middle" class="footer">${escapeXml(t.footer)}</text>`,
  });
}

function signals(locale) {
  const ko = locale === "ko";
  const t = ko
    ? {
        title: "운영 신호에서 진단 결정까지",
        subtitle: "통합 기능은 데이터를 자동으로 설명하지 않습니다. 발행·관측·판단 경계를 연결해야 합니다.",
        sources: ["Exposed 캐시", "AWS CloudWatch", "Leader 공급자"],
        facts: ["대기열 · flush 오류", "메트릭 · 로그 이름", "갱신 · 저장소 오류"],
        publish: "명시적 발행·상태 노출",
        observe: "관측 가능한 운영 신호",
        decide: ["진단 순서와 복구 결정"],
        a: "상태·이벤트",
        b: "검색·경보",
        footer: "설치 여부가 아니라 어떤 신호를 누가 발행하고 운영자가 어떻게 해석하는지가 운영 계약입니다.",
      }
    : {
        title: "From Operational Signals to Diagnostic Decisions",
        subtitle: "Integrations do not explain data automatically. Publishing, observation, and decisions need explicit boundaries.",
        sources: ["Exposed cache", "AWS CloudWatch", "Leader provider"],
        facts: ["Queue / flush errors", "Metric / log names", "Renewal / storage errors"],
        publish: ["Explicit publish", "and health exposure"],
        observe: "Observable operational signals",
        decide: ["Diagnostic order", "and recovery decision"],
        a: "state and events",
        b: "search and alerts",
        footer: "The contract is who publishes each signal and how operators interpret it, not whether a plugin is installed.",
      };

  const sources = t.sources
    .map((source, index) => {
      const y = 225 + index * 150;
      return `
        <rect x="80" y="${y}" width="340" height="112" rx="22" class="card"/>
        <text x="106" y="${y + 44}" class="card-title">${escapeXml(source)}</text>
        <text x="106" y="${y + 82}" class="body">${escapeXml(t.facts[index])}</text>
        <path d="M420 ${y + 56} H555" class="connector"/>`;
    })
    .join("\n");

  return shell({
    locale,
    title: t.title,
    subtitle: t.subtitle,
    desc: t.footer,
    body: `
      ${sources}
      <rect x="575" y="225" width="360" height="412" rx="26" class="focus"/>
      ${
        Array.isArray(t.publish)
          ? `<text x="755" y="378" text-anchor="middle" class="card-title">${escapeXml(t.publish[0])}</text>
      <text x="755" y="416" text-anchor="middle" class="card-title">${escapeXml(t.publish[1])}</text>`
          : `<text x="755" y="395" text-anchor="middle" class="card-title">${escapeXml(t.publish)}</text>`
      }
      <text x="755" y="472" text-anchor="middle" class="body">${escapeXml(t.a)}</text>
      <path d="M935 415 H1050" class="connector"/>
      <rect x="1075" y="225" width="445" height="190" rx="24" class="card"/>
      <text x="1298" y="300" text-anchor="middle" class="card-title">${escapeXml(t.observe)}</text>
      <text x="1298" y="350" text-anchor="middle" class="body">${escapeXml(t.b)}</text>
      <path d="M1298 415 V510" class="connector"/>
      <rect x="1075" y="535" width="445" height="165" rx="24" class="warn"/>
      <text x="1298" y="${t.decide.length === 1 ? 620 : 602}" text-anchor="middle" class="card-title">${escapeXml(t.decide[0])}</text>
      ${t.decide.length === 1 ? "" : `<text x="1298" y="640" text-anchor="middle" class="card-title">${escapeXml(t.decide[1])}</text>`}
      <line x1="80" y1="790" x2="1520" y2="790" class="divider"/>
      <text x="800" y="836" text-anchor="middle" class="footer">${escapeXml(t.footer)}</text>`,
  });
}

function render(stem, locale, svg) {
  const svgPath = `${outputDir}/${stem}-${locale}.svg`;
  const pngPath = `${outputDir}/${stem}-${locale}.png`;
  writeFileSync(svgPath, svg);
  execFileSync("xmllint", ["--noout", svgPath], { stdio: "inherit" });
  execFileSync("cairosvg", [svgPath, "-o", pngPath, "-s", "2"], { stdio: "inherit" });
}

for (const locale of ["ko", "en"]) {
  render("bluetape4k-dependencies-version-governance-01", locale, governance(locale));
  render("bluetape4k-dependencies-service-composition-01", locale, composition(locale));
  render("bluetape4k-dependencies-production-signals-01", locale, signals(locale));
}
