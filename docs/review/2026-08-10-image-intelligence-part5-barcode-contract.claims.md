# Part 5 claim ledger

| ID | 주장 | 근거 | 검증 상태 |
| --- | --- | --- | --- |
| C1 | `BarcodeReader`는 provider-neutral `List<BarcodeResult>` 경계다. | `images-barcode-api/.../BarcodeReader.kt` | 확인 |
| C2 | `BarcodeOptions`는 format, `tryHarder`, raw bytes opt-in, optional confidence filter를 표현한다. | `images-barcode-api/.../BarcodeModels.kt` | 확인 |
| C3 | `BarcodeResult`는 text, normalized format, provider identity, optional region/quality/raw bytes를 보존한다. | `images-barcode-api/.../BarcodeModels.kt` | 확인 |
| C4 | ZXing adapter는 no-code를 빈 목록으로, decode·unsupported format을 normalized exception으로 반환한다. | `images-barcode-zxing/.../ZxingBarcodeReader.kt` | 확인 |
| C5 | 현재 Spring Boot example의 public `BarcodeResponse`는 text/format/provider만 노출한다. | `examples/spring-boot-image-intelligence-api/.../ApiModels.kt`, `ImageIntelligenceService.kt` | 확인 |
| C6 | `VisitorPassPolicy`는 `QR_CODE`와 `visitor:` prefix를 검사하며 decoding과 policy를 분리한다. | `.../VisitorPassPolicy.kt` | 확인 |
| C7 | `BarcodeReader` → ZXing adapter → `BarcodeResult` → `AnalysisResult` → `VisitorPassPolicy` 경계를 정적 architecture flow로 설명한다. | `public/assets/blog/image-intelligence/part5/image-intelligence-barcode-boundary-flow-01-ko.svg`, `...-en.svg`, `docs/review/2026-08-10-image-intelligence-part5-barcode-boundary-flow.semantic.json` | 확인 |

Source ref: `https://github.com/bluetape4k/bluetape4k-image/tree/65c31d4`

한계: ZXing 구현은 현재 `MultiFormatReader` 기반 단일 결과 경로이며, 모든 provider의 multi-barcode·confidence
품질·public region 응답을 보장하지 않는다. 다이어그램은 현재 source의 경계와 policy 흐름을 설명하는 자료이지,
새로운 multi-barcode 보장이나 public DTO 확장을 뜻하지 않는다.
