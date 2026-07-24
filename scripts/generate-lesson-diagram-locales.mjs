import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const out = "public/assets";
const name = "embarrassing-bug-fix-loop-01";
const replacements = [
  ["Five embarrassing fixes that made better guards", "부끄러운 실수 다섯 개가 더 나은 가드를 만들었습니다"],
  ["bluetape4k-projects · mistake → signal → fix → evaluation → guard", "bluetape4k-projects · 실수 → 신호 → 수정 → 평가 → 가드"],
  ["Mistake", "실수"],
  ["A tiny assumption", "작은 가정이"],
  ["looks harmless", "해 없어 보여도"],
  ["until null becomes 0", "null이 0이 되거나"],
  ["or cancellation", "취소가"],
  ["becomes a failure.", "실패로 바뀝니다."],
  ["Signal", "신호"],
  ["Round-trip drift,", "왕복 변환 오차,"],
  ["Nightly timeout,", "야간 타임아웃,"],
  ["or a hidden", "숨겨진"],
  ["disabled test", "비활성 테스트가"],
  ["breaks the story.", "이야기를 깨뜨립니다."],
  ["Fix", "수정"],
  ["Make the small", "작은 계약을"],
  ["contract explicit:", "명시합니다:"],
  ["coercion scope,", "강제 변환 범위,"],
  ["bounded close,", "제한된 종료,"],
  ["rethrow first.", "첫 예외 재던지기."],
  ["Guard", "가드"],
  ["Regression tests,", "회귀 테스트,"],
  ["release gates,", "릴리스 게이트,"],
  ["and lesson notes", "교훈 기록이"],
  ["turn shame into", "부끄러움을"],
  ["a reusable alarm.", "재사용 경보로 바꿉니다."],
  ["Rule of thumb: if the fix feels too obvious afterward, write the test that would have embarrassed you sooner.", "원칙: 수정이 뒤늦게 너무 당연해 보인다면, 더 일찍 부끄럽게 만들었을 테스트를 작성하세요."],
];

function localize(source) {
  let result = source
    .replaceAll('"Architects Daughter","Comic Sans MS","Comic Sans",cursive', '"goorm Sans"')
    .replaceAll('"Comic Mono","SFMono-Regular",Menlo,Consolas,monospace', '"goorm Sans Code"');
  for (const [from, to] of [...replacements].sort((a, b) => b[0].length - a[0].length)) {
    result = result.replaceAll(from, to);
  }
  return result;
}

const canonical = `${out}/${name}.svg`;
const sourcePath = existsSync(canonical) ? canonical : `${out}/${name}-en.svg`;
const source = readFileSync(sourcePath, "utf8")
  .replaceAll('markerUnits="strokeWidth"', 'markerUnits="userSpaceOnUse"')
  .replace('<marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">', '<marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse">');
const enSvg = `${out}/${name}-en.svg`;
const koSvg = `${out}/${name}-ko.svg`;
writeFileSync(enSvg, source);
writeFileSync(koSvg, localize(source));
for (const svg of [enSvg, koSvg]) {
  execFileSync("xmllint", ["--noout", svg]);
  execFileSync("cairosvg", [svg, "-o", svg.replace(/\.svg$/, ".png"), "-s", "2"]);
}
if (existsSync(canonical)) rmSync(canonical);
const png = `${out}/${name}.png`;
if (existsSync(png)) rmSync(png);
