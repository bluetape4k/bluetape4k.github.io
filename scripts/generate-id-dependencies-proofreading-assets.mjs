import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const outputDir = "public/assets";
const canvas = "#07111F";
const panel = "#0D1B2D";
const panelAlt = "#10243A";
const line = "#29445F";
const text = "#E6F2FF";
const muted = "#9CB4CC";
const go = "#36C5F0";
const kotlin = "#B794F4";
const accent = "#5EEAD4";
const warning = "#FBBF24";

const phases = [
  {
    stem: "id-generators-benchmark-phase-1-chart-01",
    title: {
      ko: "전역 고유 ID 생성기 · 1차 벤치마크",
      en: "Global Unique ID Generators · Phase 1",
    },
    subtitle: {
      ko: "첫 Go 구현과 기존 Kotlin 구현 · ID당 나노초(ns/id), 낮을수록 좋음",
      en: "First Go implementation vs existing Kotlin · nanoseconds per ID (ns/id), lower is better",
    },
    note: {
      ko: "Snowflake는 시계 모델이 달라 운영 성능의 직접 비교값으로 사용할 수 없습니다.",
      en: "Snowflake uses different clock models and is not a production-equivalent comparison.",
    },
    single: [
      ["Snowflake*", 11.98, 244.06],
      ["ULID monotonic", 65.45, 37.01],
      ["UUID v4 reused", 225.8, 95.09],
      ["UUID v7 reused", 251.2, 23.59],
      ["KSUID millis", 320.6, 167.8],
      ["KSUID seconds", 389.7, 187.93],
    ],
    concurrent: [
      ["Snowflake*", 92.37, 373.89],
      ["ULID monotonic", 190.5, 408.56],
      ["UUID v4 reused", 557.5, 329.69],
      ["UUID v7 reused", 376.4, 115.42],
      ["KSUID millis", 632.3, 396.5],
      ["KSUID seconds", 656.3, 388.7],
    ],
  },
  {
    stem: "id-generators-benchmark-phase-2-chart-01",
    title: {
      ko: "전역 고유 ID 생성기 · 2차 벤치마크",
      en: "Global Unique ID Generators · Phase 2",
    },
    subtitle: {
      ko: "Go 엔트로피 버퍼링과 KSUIDMillis 인코딩 개선 후 · ns/id, 낮을수록 좋음",
      en: "After Go entropy buffering and KSUIDMillis encoding changes · ns/id, lower is better",
    },
    note: {
      ko: "Go는 UUID v4와 여러 동시 실행 항목에서 앞섰지만, 병목은 생성기 계열마다 달랐습니다.",
      en: "Go leads UUID v4 and several concurrent workloads, but bottlenecks still differ by family.",
    },
    single: [
      ["Snowflake*", 11.98, 244.06],
      ["ULID monotonic", 65.31, 37.01],
      ["UUID v4 reused", 45.57, 95.09],
      ["UUID v7 reused", 73.95, 23.59],
      ["KSUID millis", 122.8, 167.8],
      ["KSUID seconds", 217.9, 187.93],
    ],
    concurrent: [
      ["Snowflake*", 92.37, 373.89],
      ["ULID monotonic", 180.2, 408.56],
      ["UUID v4 reused", 145.0, 329.69],
      ["UUID v7 reused", 202.8, 115.42],
      ["KSUID millis", 209.0, 396.5],
      ["KSUID seconds", 244.2, 388.7],
    ],
  },
  {
    stem: "id-generators-benchmark-phase-3-chart-01",
    title: {
      ko: "전역 고유 ID 생성기 · 3차 벤치마크",
      en: "Global Unique ID Generators · Phase 3",
    },
    subtitle: {
      ko: "최적화된 Go와 Kotlin 후보 3 · ns/id, 낮을수록 좋음",
      en: "Optimized Go vs Kotlin candidate 3 · ns/id, lower is better",
    },
    note: {
      ko: "단일 스레드와 동시 실행의 우위가 달라 보편적인 언어 순위로 해석할 수 없습니다.",
      en: "Single-thread and concurrent leaders differ, so the chart does not establish a universal language ranking.",
    },
    single: [
      ["Snowflake*", 11.98, 244.02],
      ["ULID monotonic", 64.96, 26.28],
      ["KSUID seconds", 215.6, 175.86],
      ["KSUID millis", 123.5, 167.07],
    ],
    concurrent: [
      ["Snowflake*", 90.01, 243.65],
      ["ULID monotonic", 194.8, 336.0],
      ["KSUID seconds", 256.4, 242.5],
      ["KSUID millis", 215.9, 215.81],
    ],
  },
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function barWidth(value) {
  const min = Math.log10(10);
  const max = Math.log10(800);
  return 70 + ((Math.log10(value) - min) / (max - min)) * 300;
}

function chartPanel(rows, x, y, locale, label) {
  const rowGap = rows.length === 4 ? 120 : 96;
  const rowStart = y + 104;
  const parts = [
    `<rect x="${x}" y="${y}" width="724" height="690" rx="24" class="panel"/>`,
    `<text x="${x + 34}" y="${y + 50}" class="panel-title">${escapeXml(label)}</text>`,
    `<text x="${x + 690}" y="${y + 50}" text-anchor="end" class="unit">ns/id ↓</text>`,
  ];

  rows.forEach(([name, goValue, kotlinValue], index) => {
    const top = rowStart + index * rowGap;
    const goWidth = barWidth(goValue);
    const kotlinWidth = barWidth(kotlinValue);
    parts.push(
      `<text x="${x + 34}" y="${top}" class="row-label">${escapeXml(name)}</text>`,
      `<rect x="${x + 236}" y="${top - 20}" width="${goWidth.toFixed(1)}" height="22" rx="11" class="bar-go"/>`,
      `<rect x="${x + 236}" y="${top + 12}" width="${kotlinWidth.toFixed(1)}" height="22" rx="11" class="bar-kotlin"/>`,
      `<text x="${x + 246 + goWidth}" y="${top - 4}" class="value">${goValue.toFixed(2)}</text>`,
      `<text x="${x + 246 + kotlinWidth}" y="${top + 28}" class="value">${kotlinValue.toFixed(2)}</text>`,
    );
  });

  const scaleLabel =
    locale === "ko"
      ? "막대 길이는 로그 척도이며 값 표시는 실제 ns/id입니다."
      : "Bar length uses a log scale; labels show actual ns/id.";
  parts.push(`<text x="${x + 34}" y="${y + 654}" class="scale">${escapeXml(scaleLabel)}</text>`);
  return parts.join("\n");
}

function chartSvg(phase, locale) {
  const titleFont =
    locale === "ko"
      ? '"goorm Sans","Apple SD Gothic Neo",sans-serif'
      : '"Architects Daughter","Comic Sans MS",cursive';
  const bodyFont =
    locale === "ko"
      ? '"goorm Sans Code","goorm Sans",monospace'
      : '"Comic Mono","SFMono-Regular",Menlo,monospace';
  const single = locale === "ko" ? "단일 스레드" : "Single thread";
  const concurrent = locale === "ko" ? "동시 실행" : "Concurrent";
  const desc =
    locale === "ko"
      ? "Go와 Kotlin의 ID 생성 지연 시간을 단일 스레드와 동시 실행 조건으로 비교한 벤치마크 차트"
      : "Benchmark chart comparing Go and Kotlin ID generation latency under single-thread and concurrent workloads";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100" viewBox="0 0 1600 1100" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(phase.title[locale])}</title>
  <desc id="desc">${escapeXml(desc)}</desc>
  <style>
    .canvas{fill:${canvas}}.frame{fill:${panelAlt};stroke:${line};stroke-width:2}
    .panel{fill:${panel};stroke:${line};stroke-width:2}
    .title{font:700 42px ${titleFont};fill:${text}}
    .subtitle{font:500 20px ${bodyFont};fill:${muted}}
    .panel-title{font:700 25px ${titleFont};fill:${text}}
    .unit,.scale,.legend,.note{font:500 16px ${bodyFont};fill:${muted}}
    .row-label{font:600 18px ${bodyFont};fill:${text}}
    .value{font:700 15px ${bodyFont};fill:${text};dominant-baseline:middle}
    .bar-go{fill:${go}}.bar-kotlin{fill:${kotlin}}
  </style>
  <rect width="1600" height="1100" class="canvas"/>
  <rect x="32" y="32" width="1536" height="1036" rx="32" class="frame"/>
  <text x="80" y="98" class="title">${escapeXml(phase.title[locale])}</text>
  <text x="80" y="136" class="subtitle">${escapeXml(phase.subtitle[locale])}</text>
  <g class="legend">
    <rect x="1260" y="158" width="22" height="16" rx="8" class="bar-go"/>
    <text x="1292" y="171">Go</text>
    <rect x="1400" y="158" width="22" height="16" rx="8" class="bar-kotlin"/>
    <text x="1432" y="171">Kotlin</text>
  </g>
  ${chartPanel(phase.single, 64, 200, locale, single)}
  ${chartPanel(phase.concurrent, 812, 200, locale, concurrent)}
  <rect x="64" y="930" width="1472" height="88" rx="18" fill="#122B3D" stroke="${accent}" stroke-width="1.5"/>
  <circle cx="94" cy="974" r="8" fill="${warning}"/>
  <text x="116" y="980" class="note">${escapeXml(phase.note[locale])}</text>
</svg>`;
}

const modules = [
  ["projects", "1.11.0", { ko: "JDBC 상태 복원", en: "JDBC state restoration" }],
  ["exposed", "1.11.0", { ko: "캐시 상태 · DB 안전성", en: "Cache health · DB safety" }],
  ["aws", "0.4.0", { ko: "플러그인 수명 주기", en: "Plugin lifecycle" }],
  ["image", "0.3.0", { ko: "대용량 파일 I/O", en: "Large-file I/O" }],
  ["text", "0.2.1", { ko: "입력 검증", en: "Input validation" }],
  ["leader", "0.4.0", { ko: "공급자·런타임 호환성", en: "Provider/runtime compatibility" }],
  ["graph", "0.5.1", { ko: "패치 라인 안정성", en: "Patch-line stability" }],
  ["javers", "0.2.1", { ko: "의존성 노출 경계", en: "Dependency exposure boundary" }],
];

function boundaryLabel(label, locale, x, y) {
  const split = {
    "Cache health · DB safety": ["Cache health", "DB safety"],
    "Provider/runtime compatibility": ["Provider/runtime", "compatibility"],
    "Dependency exposure boundary": ["Dependency exposure", "boundary"],
  };
  const lines = locale === "en" ? (split[label] ?? [label]) : [label];
  if (lines.length === 1) {
    return `<text x="${x}" y="${y}" class="boundary-text">${escapeXml(lines[0])}</text>`;
  }
  return `<text x="${x}" y="${y - 10}" class="boundary-text">${escapeXml(lines[0])}<tspan x="${x}" dy="24">${escapeXml(lines[1])}</tspan></text>`;
}

function dependenciesSvg(locale) {
  const titleFont =
    locale === "ko"
      ? '"goorm Sans","Apple SD Gothic Neo",sans-serif'
      : '"Architects Daughter","Comic Sans MS",cursive';
  const bodyFont =
    locale === "ko"
      ? '"goorm Sans Code","goorm Sans",monospace'
      : '"Comic Mono","SFMono-Regular",Menlo,monospace';
  const title =
    locale === "ko"
      ? "bluetape4k-dependencies 1.3.0 · 라이브러리 경계"
      : "bluetape4k-dependencies 1.3.0 · Library Boundaries";
  const subtitle =
    locale === "ko"
      ? "BOM이 함께 검증한 버전 조합과 각 라이브러리의 대표 설계 경계"
      : "The tested version set and representative design boundary of each library";
  const boundary =
    locale === "ko" ? "검증된 BOM 경계 · 1.3.0" : "TESTED BOM BOUNDARY · 1.3.0";
  const footer =
    locale === "ko"
      ? "버전 정렬의 목적은 최신 버전 수집이 아니라 호환 가능한 경계를 재현하는 것입니다."
      : "Version alignment reproduces compatible boundaries; it is not a collection of the newest versions.";

  const cards = modules
    .map(([name, version, label], index) => {
      const column = index % 4;
      const row = Math.floor(index / 4);
      const x = 92 + column * 372;
      const y = 308 + row * 230;
      return `<g>
        <rect x="${x}" y="${y}" width="332" height="174" rx="22" class="card"/>
        <rect x="${x + 22}" y="${y + 22}" width="96" height="32" rx="16" class="version"/>
        <text x="${x + 70}" y="${y + 44}" text-anchor="middle" class="version-text">${version}</text>
        <text x="${x + 24}" y="${y + 94}" class="module">${name}</text>
        ${boundaryLabel(label[locale], locale, x + 24, y + 132)}
      </g>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(subtitle)}</desc>
  <style>
    .canvas{fill:${canvas}}.frame{fill:${panel};stroke:${line};stroke-width:2}
    .bom{fill:#0C3044;stroke:${accent};stroke-width:2}.card{fill:${panelAlt};stroke:${line};stroke-width:2}
    .version{fill:#173B52}.title{font:700 40px ${titleFont};fill:${text}}
    .subtitle{font:500 20px ${bodyFont};fill:${muted}}
    .bom-title{font:700 26px ${titleFont};fill:${accent}}
    .module{font:700 25px ${bodyFont};fill:${text}}
    .version-text{font:700 15px ${bodyFont};fill:${accent};dominant-baseline:middle}
    .boundary-text{font:600 ${locale === "ko" ? 18 : 15}px ${bodyFont};fill:${muted}}
    .footer{font:500 18px ${bodyFont};fill:${muted}}
  </style>
  <rect width="1600" height="900" class="canvas"/>
  <rect x="32" y="32" width="1536" height="836" rx="32" class="frame"/>
  <text x="80" y="96" class="title">${escapeXml(title)}</text>
  <text x="80" y="134" class="subtitle">${escapeXml(subtitle)}</text>
  <rect x="80" y="180" width="1440" height="82" rx="22" class="bom"/>
  <text x="800" y="230" text-anchor="middle" class="bom-title">${escapeXml(boundary)}</text>
  ${cards}
  <line x1="80" y1="798" x2="1520" y2="798" stroke="${line}" stroke-width="2"/>
  <text x="800" y="836" text-anchor="middle" class="footer">${escapeXml(footer)}</text>
</svg>`;
}

function render(stem, locale, svg) {
  const svgPath = `${outputDir}/${stem}-${locale}.svg`;
  const pngPath = `${outputDir}/${stem}-${locale}.png`;
  writeFileSync(svgPath, svg);
  execFileSync("xmllint", ["--noout", svgPath], { stdio: "inherit" });
  execFileSync("cairosvg", [svgPath, "-o", pngPath, "-s", "2"], { stdio: "inherit" });
}

for (const phase of phases) {
  for (const locale of ["ko", "en"]) {
    render(phase.stem, locale, chartSvg(phase, locale));
  }
}

for (const locale of ["ko", "en"]) {
  render("bluetape4k-dependencies-1-3-0-boundaries-01", locale, dependenciesSvg(locale));
}
