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
4. claim ledger에 파일·source ref·문서에서 확인할 수 있는 한계를 기록한다.
5. diagram asset은 추가하지 않는다. 기존 hero 재사용만 하고 시각자료 N/A 근거를 기록한다.

## 검증

- `git diff --check`
- `npm test`
- `npm run build`
- `npm run check:manual`
- `npm run check:visual-companions`
- EN/KO Part 5 route와 Part 1–4의 Part 5 links 확인
- 두 locale의 frontmatter tags 동일성 확인
- build output에서 `/blog/image-intelligence-part5-barcode-qr-extraction-contract/`와
  `/ko/blog/image-intelligence-part5-barcode-qr-extraction-contract/`가 생성되는지 확인

Baseline note: 이 worktree에서 source mutation 전 `npm run build`는 2451 pages와 0 Astro errors로 통과했다.
`npm test`는 199개 중 198개가 통과했고, 기존 `tests/manual/version-ui.test.mjs`의 fixture Pagefind 파일
검증 1건이 실패했다. 변경 후 동일 실패가 유지되는지 별도로 기록한다.

## 완료 경계

PR 준비까지 수행한다. PR merge, branch 삭제, GitHub issue mutation, production deploy는 이 계획의 완료 조건이
아니며 별도 승인 없이는 실행하지 않는다.
