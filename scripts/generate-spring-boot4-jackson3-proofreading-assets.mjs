import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outputDir = "public/assets";
const assetName = "spring-boot4-jackson3-compatibility-boundaries-01";
mkdirSync(outputDir, { recursive: true });

const locales = {
  ko: {
    aria: "Spring Boot 4 예제의 Jackson 3 호환성 경계",
    title: "Spring Boot 4 예제의 Jackson 3 호환성 경계",
    subtitle: "의존성, 코드 API, 설정과 검증이 같은 기준선을 가리켜야 합니다.",
    baseline: "예제 기준선",
    baselineBody: "Spring Boot 4 + Jackson 3",
    dependency: "의존성 경계",
    dependency1: "Spring Boot 4 BOM",
    dependency2: "tools.jackson:jackson-bom",
    dependency3: "bluetape4k-jackson3",
    api: "코드 API 경계",
    api1: "tools.jackson.*",
    api2: "JsonMapper",
    api3: "Jackson.defaultJsonMapper",
    verification: "설정·검증 경계",
    verification1: "spring.jackson.* 재검토",
    verification2: "testClasses 또는 test",
    verification3: "클라이언트 충돌 확인",
    exception: "허용되는 예외는 숨기지 않고 경계로 기록합니다.",
    exceptionBody: "com.fasterxml.jackson.annotation.* · Jackson 2만 노출하는 상위 라이브러리 · 비활성화된 충돌 테스트",
    conclusion: "세 경계가 정렬되면 독자는 클래스패스 문제보다 예제가 설명하는 기능에 집중할 수 있습니다.",
  },
  en: {
    aria: "Jackson 3 compatibility boundaries for Spring Boot 4 examples",
    title: "Jackson 3 Compatibility Boundaries for Spring Boot 4 Examples",
    subtitle: "Dependencies, code APIs, configuration, and verification must point to the same baseline.",
    baseline: "Example baseline",
    baselineBody: "Spring Boot 4 + Jackson 3",
    dependency: "Dependency boundary",
    dependency1: "Spring Boot 4 BOM",
    dependency2: "tools.jackson:jackson-bom",
    dependency3: "bluetape4k-jackson3",
    api: "Code API boundary",
    api1: "tools.jackson.*",
    api2: "JsonMapper",
    api3: "Jackson.defaultJsonMapper",
    verification: "Configuration and verification",
    verification1: "Re-check spring.jackson.*",
    verification2: "Run testClasses or test",
    verification3: "Confirm client conflicts",
    exception: "Allowed exceptions are documented as boundaries, not hidden.",
    exceptionBody: "com.fasterxml.jackson.annotation.* | upstream Jackson 2 APIs | disabled conflict tests",
    conclusion: "When all three boundaries align, readers can focus on the example instead of classpath failures.",
  },
};

for (const [locale, text] of Object.entries(locales)) {
  const svgPath = join(outputDir, `${assetName}-${locale}.svg`);
  const pngPath = join(outputDir, `${assetName}-${locale}.png`);
  writeFileSync(svgPath, renderSvg(text, locale));
  execFileSync("xmllint", ["--noout", svgPath], { stdio: "inherit" });
  execFileSync("cairosvg", [svgPath, "-o", pngPath, "-s", "2"], { stdio: "inherit" });
}

function renderSvg(text, locale) {
  const titleSize = locale === "ko" ? 34 : 31;
  const headingSize = locale === "ko" ? 23 : 20;
  const bodyFont = locale === "ko" ? "'goorm Sans Code', monospace" : "'Comic Mono', monospace";
  const headingFont = locale === "ko" ? "'goorm Sans', sans-serif" : "'Architects Daughter', cursive";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="900" viewBox="0 0 1280 900" role="img" aria-label="${text.aria}">
  <defs>
    <style>
      .title{font-family:${headingFont};font-size:${titleSize}px;font-weight:700;fill:#f8fafc}
      .subtitle,.body,.small{font-family:${bodyFont};fill:#cbd5e1}
      .subtitle{font-size:16px}.body{font-size:16px}.small{font-size:14px}
      .heading{font-family:${headingFont};font-size:${headingSize}px;font-weight:700;fill:#f8fafc}
      .baseline-label{font-family:${headingFont};font-size:18px;font-weight:700;fill:#7dd3fc}
      .baseline-value{font-family:${bodyFont};font-size:20px;font-weight:700;fill:#f8fafc}
      .panel{fill:#111827;stroke:#334155;stroke-width:1.5}
      .card{stroke-width:2}
      .connector{fill:none;stroke:#94a3b8;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow)}
    </style>
    <marker id="arrow" viewBox="0 0 16 16" markerWidth="16" markerHeight="16" refX="15" refY="8" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M0 0 L16 8 L0 16 Z" fill="#94a3b8"/>
    </marker>
  </defs>
  <rect width="1280" height="900" fill="#0b1220"/>
  <text class="title" x="64" y="72">${text.title}</text>
  <text class="subtitle" x="66" y="108">${text.subtitle}</text>

  <rect class="panel" x="54" y="142" width="1172" height="680" rx="22"/>

  <rect x="390" y="178" width="500" height="94" rx="18" fill="#12344a" stroke="#38bdf8" stroke-width="2"/>
  <text class="baseline-label" x="640" y="213" text-anchor="middle">${text.baseline}</text>
  <text class="baseline-value" x="640" y="246" text-anchor="middle">${text.baselineBody}</text>

  <path class="connector" d="M480 272 V294 Q480 306 468 306 H258 Q246 306 246 318 V344"/>
  <path class="connector" d="M640 272 V344"/>
  <path class="connector" d="M800 272 V294 Q800 306 812 306 H1022 Q1034 306 1034 318 V344"/>

  <rect class="card" x="86" y="344" width="320" height="246" rx="18" fill="#163a2d" stroke="#4ade80"/>
  <text class="heading" x="246" y="390" text-anchor="middle">${text.dependency}</text>
  <line x1="118" y1="416" x2="374" y2="416" stroke="#2f6b50" stroke-width="1.5"/>
  <text class="body" x="126" y="460">${text.dependency1}</text>
  <text class="body" x="126" y="503">${text.dependency2}</text>
  <text class="body" x="126" y="546">${text.dependency3}</text>

  <rect class="card" x="480" y="344" width="320" height="246" rx="18" fill="#312e58" stroke="#a78bfa"/>
  <text class="heading" x="640" y="390" text-anchor="middle">${text.api}</text>
  <line x1="512" y1="416" x2="768" y2="416" stroke="#59518e" stroke-width="1.5"/>
  <text class="body" x="520" y="460">${text.api1}</text>
  <text class="body" x="520" y="503">${text.api2}</text>
  <text class="body" x="520" y="546">${text.api3}</text>

  <rect class="card" x="874" y="344" width="320" height="246" rx="18" fill="#453511" stroke="#fbbf24"/>
  <text class="heading" x="1034" y="390" text-anchor="middle">${text.verification}</text>
  <line x1="906" y1="416" x2="1162" y2="416" stroke="#7a5c1a" stroke-width="1.5"/>
  <text class="body" x="914" y="460">${text.verification1}</text>
  <text class="body" x="914" y="503">${text.verification2}</text>
  <text class="body" x="914" y="546">${text.verification3}</text>

  <rect x="166" y="646" width="948" height="104" rx="18" fill="#2b2437" stroke="#f472b6" stroke-width="2"/>
  <text class="heading" x="640" y="685" text-anchor="middle">${text.exception}</text>
  <text class="small" x="640" y="720" text-anchor="middle">${text.exceptionBody}</text>

  <text class="small" x="640" y="794" text-anchor="middle">${text.conclusion}</text>
</svg>`;
}
