import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const out = "public/assets";
const selected = new Set(process.argv.slice(2));

const diagrams = new Map([
  ["bluetape-skills-public-bundle-boundary-01", {
    title: {
      en: "Public skill bundle boundary",
      ko: "공개 스킬 묶음의 배포 경계",
    },
    desc: {
      en: "The canonical skill source exports reusable execution resources while private runtime state remains outside the public bundle.",
      ko: "정식 스킬 원본은 재사용 가능한 실행 자료만 공개 묶음으로 내보내고 개인 런타임 상태는 배포 대상에서 제외합니다.",
    },
    translations: [
      ["Share the contract, keep the runtime private", "실행 계약은 공유하고 개인 런타임은 분리하기"],
      ["A portable skill bundle includes everything needed to execute the guidance — and nothing personal.", "이식 가능한 스킬 묶음에는 지침 실행에 필요한 자료만 넣고 개인 환경은 제외합니다."],
      ["Canonical Skills", "정식 스킬"],
      ["Source", "원본"],
      ["managed and reviewed", "관리·검토 대상"],
      ["Managed source", "관리 원본"],
      ["single authority", "단일 기준점"],
      ["14 canonical skills", "정식 스킬 14개"],
      ["allowlisted inventory", "허용 목록"],
      ["Source-first export", "원본 우선 내보내기"],
      ["validated before sharing", "공유 전 검증"],
      ["Public Bundle", "공개 묶음"],
      ["complete execution contract", "완전한 실행 계약"],
      ["references/", "참조 자료/"],
      ["templates/", "템플릿/"],
      ["scripts/", "스크립트/"],
      ["Private Runtime", "개인 런타임"],
      ["excluded from distribution", "배포 대상에서 제외"],
      ["memory", "메모리"],
      ["rules &amp; hooks", "규칙과 훅"],
      ["config", "설정"],
      ["plugin caches", "플러그인 캐시"],
      ["secrets", "비밀 정보"],
      ["retired aliases", "폐기된 별칭"],
      ["distributed", "배포"],
      ["kept private", "개인 환경 유지"],
    ],
  }],
  ["bluetape-skills-source-first-sync-01", {
    title: {
      en: "Source-first skill synchronization",
      ko: "원본 우선 스킬 동기화",
    },
    desc: {
      en: "Eight verified handoffs connect the managed source to a validated public skill bundle.",
      ko: "관리 원본에서 검증된 공개 스킬 묶음까지 여덟 전달 단계를 차례로 검증합니다.",
    },
    translations: [
      ["Change the source, prove every handoff", "원본을 수정하고 모든 전달 단계를 검증하기"],
      ["A live edit is temporary; a portable skill change survives the entire source-first delivery path.", "실제 파일만 수정하면 다음 적용에서 사라질 수 있습니다. 이식 가능한 스킬 변경은 원본 우선 배포 경로 전체에 남아야 합니다."],
      ["Managed Source", "관리 원본"],
      ["edit the durable authority", "영속 기준점 수정"],
      ["Targeted Apply", "대상별 적용"],
      ["render only the approved scope", "승인 범위만 적용"],
      ["Source / Live Parity", "원본 / 실제 파일 일치"],
      ["prove the target matches", "적용 대상 일치 검증"],
      ["audit managed ownership", "관리 소유권 점검"],
      ["Codex Self-Audit", "Codex 자체 점검"],
      ["verify runtime health", "런타임 상태 검증"],
      ["Commit &amp; Push", "커밋과 푸시"],
      ["persist the source change", "원본 변경 영속화"],
      ["Public Export", "공개 내보내기"],
      ["copy the canonical allowlist", "정식 허용 목록 복사"],
      ["Bundle Validation", "묶음 검증"],
      ["reject private or broken payloads", "개인 정보·손상 항목 거부"],
      ["Every handoff must pass before the portable bundle is ready.", "모든 전달 단계가 통과해야 이식 가능한 묶음이 준비됩니다."],
    ],
  }],
]);

function replaceAllSorted(source, replacements) {
  let result = source;
  for (const [from, to] of [...replacements].sort((a, b) => b[0].length - a[0].length)) {
    result = result.replaceAll(from, to);
  }
  return result;
}

function darken(source) {
  const replacements = [
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
    ["#1e293b", "#f1f5f9"],
    ["#475569", "#c2cede"],
    ["#64748b", "#94a3b8"],
    ["#4f7dc9", "#60a5fa"],
    ["#d25b63", "#fb7185"],
    ["#8a6fd1", "#c084fc"],
    ["#45a66f", "#34d399"],
    ["#c28b3c", "#fbbf24"],
  ];
  let result = replaceAllSorted(source, replacements);
  result = result
    .replaceAll("font-size: 12px;", "font-size: 14px;")
    .replaceAll("font-size: 13px;", "font-size: 14px;");
  return result;
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

function fonts(source, locale) {
  if (locale !== "ko") return source;
  return source
    .replaceAll("'Architects Daughter', 'Comic Mono', cursive", "'goorm Sans'")
    .replaceAll("'Comic Mono', 'SFMono-Regular', Consolas, monospace", "'goorm Sans Code'");
}

for (const [stem, diagram] of diagrams) {
  if (selected.size > 0 && !selected.has(stem)) continue;
  const source = darken(readFileSync(`${out}/${stem}-en.svg`, "utf8"));
  const en = withMetadata(source, diagram.title.en, diagram.desc.en);
  const ko = fonts(
    withMetadata(replaceAllSorted(source, diagram.translations), diagram.title.ko, diagram.desc.ko),
    "ko",
  );
  for (const [locale, svg] of [["en", en], ["ko", ko]]) {
    const svgPath = `${out}/${stem}-${locale}.svg`;
    writeFileSync(svgPath, svg);
    execFileSync("xmllint", ["--noout", svgPath]);
    execFileSync("cairosvg", [svgPath, "-o", svgPath.replace(/\.svg$/, ".png"), "-s", "2"]);
  }
}
