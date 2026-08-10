# Image Intelligence Part 5 설계: OCR과 다른 바코드·QR 추출 계약

## 목표

Issue #201의 Part 5로, OCR처럼 “읽을 수 있는 텍스트”를 추정하는 경로와 바코드·QR처럼 인코딩된 payload를
결정적으로 해석하는 경로의 계약 차이를 설명한다. 글은 `bluetape4k-image` `develop`의
`65c31d4` source를 기준으로 하며, 구현이 제공하는 사실과 애플리케이션이 결정해야 할 공개 API·정책을
분리한다.

## 독자와 범위

- 독자: Kotlin/Spring Boot로 이미지 분석 API를 설계하는 개발자
- 포함: `BarcodeReader`, `BarcodeOptions`, `BarcodeResult`, `BarcodeRegion`, `BarcodeProviderIdentity`,
  ZXing adapter, `Empty`/`Unavailable`/`Failed`, `VisitorPassPolicy` 경계
- 제외: 새로운 barcode 구현, public DTO 확장, multi-barcode 보장, 상용 provider 운영, 배포·merge

## 핵심 메시지

1. OCR의 텍스트 품질과 barcode의 decoded payload는 같은 `text` 필드 이름을 써도 같은 의미가 아니다.
2. provider-neutral API는 format, provider identity, optional region, raw bytes opt-in을 보존한다.
3. ZXing dependency는 adapter module 안에 두고, core 호출자는 `BarcodeReader`만 의존한다.
4. 코드가 없는 이미지는 `Empty`, provider 미설정은 `Unavailable`, decode/format 오류는 `Failed`로 구분한다.
5. 현재 통합 예제의 public `BarcodeResponse`는 `text`, `format`, `provider`만 노출한다. underlying
   `BarcodeResult.region`을 public DTO에 노출할지는 별도 API 결정이다.
6. `VisitorPassPolicy`는 `QR_CODE`와 `visitor:` prefix를 해석하지만, decoding adapter가 allow/reject를
   결정하지 않는다.

## 구조와 route

- 한국어: `/ko/blog/image-intelligence-part5-barcode-qr-extraction-contract/`
- 영어: `/blog/image-intelligence-part5-barcode-qr-extraction-contract/`
- 기존 Part 1–4의 bottom navigation에서 두 route를 링크한다.
- Part 5의 가장 어려운 경계인 `BarcodeReader` → ZXing adapter → `BarcodeResult` → `AnalysisResult` →
  `VisitorPassPolicy`를 한눈에 보여 주는 정적 architecture flow를 추가한다. 한국어와 영어는 별도 SVG/PNG로
  생성하고, article은 PNG만 embed한다.

## 독자가 가져갈 계약

```text
qualified ImmutableImage
        -> BarcodeReader(options)
        -> List<BarcodeResult> or normalized failure
        -> AnalysisResult.Completed / Empty / Unavailable / Failed
        -> public DTO mapping (current example: text, format, provider)
        -> VisitorPassPolicy (application-owned action)
```

다이어그램의 색상은 data contract(blue), adapter 내부 구현(muted), policy action(purple)으로 역할을 구분한다.
`ZXing / MultiFormatReader`는 `images-barcode-zxing` adapter card 안에만 표시하고, policy와 application side
effect는 별도 lane으로 분리한다.

글은 `BarcodeResult.region`이 provider-neutral model에 보존된다는 사실과, 현재 통합 응답이 region을 버리는
것이 의도적인 public contract 선택이라는 사실을 같은 문단에서 명시한다.
