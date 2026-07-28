import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const out = "public/assets";
const selected = new Set(process.argv.slice(2));

const translations = new Map([
  ["ocr-api-fallback-contract-workflow-01", [
    ["OCR Service Runtime Boundaries", "OCR 서비스 런타임 경계"],
    ["Bad requests stop at upload guard; valid images move through preprocessing, native OCR, and response states.", "잘못된 요청은 업로드 가드에서 멈추고, 유효한 이미지는 전처리와 네이티브 OCR을 거쳐 응답 상태로 이동합니다."],
    ["HTTP Upload Boundary", "HTTP 업로드 경계"],
    ["adapter-level request contract", "어댑터 수준 요청 계약"],
    ["Image Preprocessing", "이미지 전처리"],
    ["bytes, headers, decoded pixels", "바이트, 헤더, 디코딩 픽셀"],
    ["Native OCR Boundary", "네이티브 OCR 경계"],
    ["host runtime and timeout lane", "호스트 런타임과 타임아웃 구간"],
    ["Response Contract", "응답 계약"],
    ["client-readable result shape", "클라이언트가 읽을 수 있는 결과 형태"],
    ["Client Upload", "클라이언트 업로드"],
    ["multipart file", "multipart 파일"],
    ["HTTP Adapter", "HTTP 어댑터"],
    ["Spring or Ktor", "Spring 또는 Ktor"],
    ["builds service request", "서비스 요청 생성"],
    ["Upload Guard", "업로드 가드"],
    ["empty bytes, max bytes", "빈 바이트, 최대 바이트"],
    ["type + magic bytes", "유형 + 매직 바이트"],
    ["Pixel Budget", "픽셀 예산"],
    ["width * height cap", "너비 × 높이 제한"],
    ["decode only if bounded", "범위 안에서만 디코딩"],
    ["Preprocess", "전처리"],
    ["resize / grayscale", "크기 조정 / 회색조"],
    ["lower OCR cost", "OCR 비용 절감"],
    ["Native Gate", "네이티브 가드"],
    ["enabled?", "활성화?"],
    ["tessdata ready?", "tessdata 준비?"],
    ["Semaphore(1)", "Semaphore(1)"],
    ["withTimeout + IO", "withTimeout + IO"],
    ["not a fallback", "대체 응답 아님"],
    ["reject invalid input", "잘못된 입력 거부"],
    ["valid image", "유효한 이미지"],
    ["runtime not ready", "런타임 미준비"],
    ["text + blocks", "텍스트 + 블록"],
    ["same response shape", "동일한 응답 형태"],
    ["OCR exception", "OCR 예외"],
    ["request bytes", "요청 바이트"],
    ["invalid input stops", "잘못된 입력에서 중단"],
    ["runtime gap", "런타임 공백"],
    ["OCR failed safely", "OCR 안전 실패"],
    ["upload guard", "업로드 가드"],
    ["valid OCR path", "유효한 OCR 경로"],
    ["runtime unavailable", "런타임 사용 불가"],
    ["runtime failure", "런타임 실패"],
    ["bad request, not fallback", "잘못된 요청, 대체 응답 아님"],
  ]],
  ["ocr-api-fallback-contract-sample-input-01", [
    ["Synthetic OCR sample document", "OCR 합성 예제 문서"],
    ["A clean synthetic document image used to explain OCR request and response examples.", "OCR 요청과 응답 예제를 설명하기 위한 합성 문서 이미지입니다."],
    ["SAMPLE", "샘플"],
    ["Request: ocr-sample-request", "요청: ocr-sample-request"],
    ["Line 1: Upload image", "1행: 이미지 업로드"],
    ["Line 2: Validate native OCR", "2행: 네이티브 OCR 검증"],
    ["Line 3: Return fallback safely", "3행: 대체 응답 안전 반환"],
  ]],
  ["ocr-api-fallback-contract-benchmark-chart-01", [
    ["OCR document preprocessing benchmark chart", "OCR 문서 전처리 벤치마크 차트"],
    ["Latency and managed heap allocation for representative Scrimage and libvips OCR document preprocessing rows.", "Scrimage와 libvips OCR 문서 전처리의 지연 시간과 관리 힙 할당량을 비교합니다."],
    ["OCR document preprocessing: lower is better", "OCR 문서 전처리: 낮을수록 좋음"],
    ["2480x3508 input -> 1240x1754 grayscale JPEG, macOS arm64, GraalVM Java 25.0.3", "2480×3508 입력 → 1240×1754 회색조 JPEG · macOS arm64 · GraalVM Java 25.0.3"],
    ["Latency, ms/op", "지연 시간, ms/op"],
    ["Managed heap allocation, MiB/op", "관리 힙 할당량, MiB/op"],
    ["Scrimage JVM pipeline", "Scrimage JVM 파이프라인"],
    ["libvips Java 25 FFM pipeline", "libvips Java 25 FFM 파이프라인"],
    ["Source:", "출처:"],
  ]],
]);

function fonts(source, locale) {
  if (locale === "ko") {
    return source
      .replaceAll("'Architects Daughter', 'Comic Mono', 'Comic Sans MS', cursive", "'goorm Sans'")
      .replaceAll("'Comic Mono', 'SFMono-Regular', monospace", "'goorm Sans Code'")
      .replaceAll('"Architects Daughter"', '"goorm Sans"')
      .replaceAll('"Comic Mono"', '"goorm Sans Code"');
  }
  return source;
}

function localize(source, replacements) {
  let result = source;
  for (const [from, to] of [...replacements].sort((a, b) => b[0].length - a[0].length)) {
    result = result.replaceAll(from, to);
  }
  return result;
}

function darken(source) {
  const colors = new Map([
    ["#f6f8fb", "#0b1220"],
    ["#f8fafc", "#0b1220"],
    ["#eef3f8", "#0b1220"],
    ["#ffffff", "#111c2e"],
    ["#edf5ff", "#101f35"],
    ["#f1f8f4", "#102b2a"],
    ["#fff7e6", "#2b2415"],
    ["#f8f1f4", "#2a1b28"],
    ["#e6fffb", "#12363a"],
    ["#d8e2ef", "#33475f"],
    ["#d4deea", "#33475f"],
    ["#d0d8e4", "#33475f"],
    ["#e8edf5", "#26384f"],
    ["#cbd5e1", "#42566e"],
    ["#1f2937", "#f1f5f9"],
    ["#253449", "#e6edf7"],
    ["#26364d", "#e6edf7"],
    ["#344054", "#d7e1ee"],
    ["#334155", "#d7e1ee"],
    ["#475569", "#c2cede"],
    ["#4b5563", "#c2cede"],
    ["#53606f", "#b9c7d8"],
    ["#596579", "#b9c7d8"],
    ["#64748b", "#94a3b8"],
    ["#667085", "#a8b5c6"],
    ["#3b6ea8", "#60a5fa"],
    ["#26847f", "#2dd4bf"],
    ["#a36b15", "#fbbf24"],
    ["#b34a47", "#fb7185"],
    ["#4f86c6", "#60a5fa"],
    ["#2f9d82", "#2dd4bf"],
    ["#8a6fb5", "#c084fc"],
    ["#c58b3d", "#fbbf24"],
    ["#007979", "#5eead4"],
    ["#00a7a7", "#2dd4bf"],
  ]);
  let result = source;
  for (const [from, to] of colors) result = result.replaceAll(from, to);
  return result.replaceAll('flood-color="#f1f5f9"', 'flood-color="#020617"');
}

for (const [name, replacements] of translations) {
  if (selected.size > 0 && !selected.has(name)) continue;
  const canonical = `${out}/${name}.svg`;
  const sourcePath = existsSync(canonical) ? canonical : `${out}/${name}-en.svg`;
  const source = darken(readFileSync(sourcePath, "utf8"));
  const enSvg = `${out}/${name}-en.svg`;
  const koSvg = `${out}/${name}-ko.svg`;
  writeFileSync(enSvg, fonts(source, "en"));
  writeFileSync(koSvg, fonts(localize(source, replacements), "ko"));
  for (const svg of [enSvg, koSvg]) {
    execFileSync("xmllint", ["--noout", svg]);
    execFileSync("cairosvg", [svg, "-o", svg.replace(/\.svg$/, ".png"), "-s", "2"]);
  }
  if (existsSync(canonical)) rmSync(canonical);
  const png = `${out}/${name}.png`;
  if (existsSync(png)) rmSync(png);
}
