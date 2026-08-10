# Image Intelligence Part 5 실행 계획

## 범위

Issue #201의 승인된 Type-E 문서 작업이다. source of truth는 `bluetape4k-image` `develop` ref
`65c31d4`이며, 이번 변경은 이 사이트 repository의 bilingual blog와 series navigation에 한정한다.

## 실행 순서

1. 한국어 원고를 먼저 작성한다.
   - OCR과 barcode/QR의 질문 차이
   - `BarcodeReader`·`BarcodeOptions` provider-neutral boundary
   - ZXing adapter와 `BarcodeProviderIdentity`
   - value/format/provider/region/raw bytes result contract
   - `Empty`·`Unavailable`·`Failed` 구분
   - public DTO의 현재 범위와 `VisitorPassPolicy` 해석 경계
2. 영문 parity 원고를 작성한다. 코드, 상태명, API명, source ref, public DTO caveat는 양 locale에서 동일해야
   한다.
3. Part 1–4의 EN/KO navigation에서 Part 5를 실제 route link로 바꾼다.
4. `BarcodeReader` → ZXing adapter → `BarcodeResult` → `AnalysisResult` → `VisitorPassPolicy` 경계를
   설명하는 정적 architecture flow를 설계한다. source-grounded semantic ledger를 먼저 작성하고, 한국어와
   영어 SVG를 각각 CairoSVG로 PNG로 렌더링한다.
5. 두 locale 원고에 해당 PNG를 `bt4k-architecture` figure로 embed하고 alt text와 caption의 의미 parity를
   확인한다.
6. claim ledger에 diagram source·asset·source ref·문서에서 확인할 수 있는 한계를 기록한다.

## 검증

- `git diff --check`
- `npm test`
- `npm run build`
- `npm run check:manual`
- `npm run check:visual-companions`
- `python3 scripts/generate-image-intelligence-part5-barcode-diagram.py`
- `diagram-semantic-audit.py`, `diagram-svg-text-normalize.py`, `diagram-connector-audit.py`,
  `diagram-arrowhead-audit.py`, `diagram-geometry-audit.py`, `diagram-endpoint-audit.py`,
  `diagram-mixed-corner-audit.py`, `diagram-visual-audit.py`, `diagram-asset-pair-audit.py`
- EN/KO Part 5 route와 Part 1–4의 Part 5 links 확인
- 두 locale의 frontmatter tags 동일성 확인
- build output에서 `/blog/image-intelligence-part5-barcode-qr-extraction-contract/`와
  `/ko/blog/image-intelligence-part5-barcode-qr-extraction-contract/`가 생성되는지 확인

Baseline note: 이전 Part 5 correction 이후 `npm test` 199/199와 `npm run build` 2453 pages, Astro errors 0을
확인했다. 이번 다이어그램 변경은 diagram audit와 site build를 다시 실행하고, 기존 경고가 재현되는지 기록한다.

## 완료 경계

PR 준비까지 수행한다. PR merge, branch 삭제, GitHub issue mutation, production deploy는 이 계획의 완료 조건이
아니며 별도 승인 없이는 실행하지 않는다.
