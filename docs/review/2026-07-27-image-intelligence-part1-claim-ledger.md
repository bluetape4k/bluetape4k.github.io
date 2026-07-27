# 이미지 인텔리전스 Part 1 주장 근거표

## 기준선

- 구현 저장소: `bluetape4k/bluetape4k-image`
- 구현 기준 브랜치: `develop`
- 구현 기준 SHA: `bca940192e19594ff87eb9140f77f70c22aece51`
- 구현 PR: [bluetape4k-image PR #300](https://github.com/bluetape4k/bluetape4k-image/pull/300)
- 글 저장소: `bluetape4k/bluetape4k.github.io`
- 한국어 route: `/ko/blog/image-intelligence-part1-multi-analysis-boundaries/`
- 영문 route: `/blog/image-intelligence-part1-multi-analysis-boundaries/`
- 공개 범위: PR 생성까지. 병합과 배포는 별도 승인 사항이다.

## 본문 주장과 근거

| 본문 주장 | 근거 | 기존 글과의 관계 | 표현 제한 |
|---|---|---|---|
| 업로드 이미지는 분석 전에 공통 자격 판정을 통과한다 | [`ImageUploadQualifier.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/ImageUploadQualifier.kt) | 입력 경계 글을 링크 | OCR 가능성이나 QR 존재 여부까지 검증한다고 쓰지 않는다 |
| 이미지는 `ImmutableImage`로 한 번 디코딩된다 | [`ImageUploadQualifier.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/ImageUploadQualifier.kt) | 새 관점 | 원본 업로드 바이트를 처리 경로마다 다시 읽는다고 쓰지 않는다 |
| OCR·객체 검출·QR 작업은 독립적으로 실행된다 | [`ImageIntelligenceWorkflow.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/ImageIntelligenceWorkflow.kt) | 새 관점 | 모든 provider가 production-ready라고 쓰지 않는다 |
| 처리 경로는 `Completed`, `Empty`, `Unavailable`, `Failed`를 구분한다 | [`AnalysisModels.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/model/AnalysisModels.kt), [`ImageIntelligenceService.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/ImageIntelligenceService.kt) | OCR 글의 범위를 여러 경로로 확장 | 빈 결과와 실패를 합치지 않는다 |
| 집계 상태는 `COMPLETED`, `PARTIAL`, `FAILED`다 | [`ImageIntelligenceAggregator.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/ImageIntelligenceAggregator.kt) | 새 관점 | `PARTIAL`을 오류 없는 성공으로 표현하지 않는다 |
| 요청 취소는 상위 coroutine으로 전파된다 | [`GuardedAnalysisRunner.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/GuardedAnalysisRunner.kt), [`ImageIntelligenceCancellationTest.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/test/kotlin/io/bluetape4k/images/examples/spring/intelligence/ImageIntelligenceCancellationTest.kt) | 새 관점 | 취소를 경로별 `Failed`로 포장한다고 쓰지 않는다 |
| 얼굴 검출은 분석 사실이고 얼굴을 가릴지는 정책이다 | [`VisitorPassPolicy.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/VisitorPassPolicy.kt) | 새 관점 | production ML detector를 번들한다고 쓰지 않는다 |
| `demo`는 fixture OCR·detector와 실제 ZXing을 조합한다 | [`ImageIntelligenceConfiguration.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/config/ImageIntelligenceConfiguration.kt), [`ImageAnalysisProviders.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/ImageAnalysisProviders.kt) | 새 관점 | fixture 결과를 실제 ML 추론 결과처럼 표현하지 않는다 |
| 공급자 시간 제한과 동시 실행 수는 처리 경로마다 독립적이다 | [`ImageIntelligenceConfiguration.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/config/ImageIntelligenceConfiguration.kt), [`GuardedAnalysisRunner.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/GuardedAnalysisRunner.kt) | 이후 Part에서 상세 설명 | Part 1에서는 설정값을 나열하지 않고 독립된 보호 경계라는 점만 설명한다 |

## 기존 공개 글 재사용

- OCR 업로드 제한, Tesseract host dependency, 큰 이미지 전처리는 [OCR 서비스를 실전에서 운영하기](/ko/blog/ocr-api-fallback-contract-bluetape4k-image/)를 링크하고 두 문장 이내로 요약한다.
- pure JVM과 libvips 성능 비교는 [Pure JVM에서 libvips로](/ko/blog/from-pure-jvm-to-libvips-benchmarking-image-processing/)의 수치를 반복하지 않는다. 이미지 backend 비용도 분석 조정과 별도로 선택해야 한다는 점만 연결한다.
- multipart와 메모리 입력 경계는 [Kotlin API 입력 경계](/ko/blog/bluetape4k-dependencies-1-3-0-input-boundaries/)를 연결하고, 공통 자격 판정이 필요한 이유만 설명한다.

## 비목표와 주의 사항

- 이 글은 OCR, 객체 검출, 바코드 알고리즘을 각각 가르치는 글이 아니다.
- 예제는 방문증 업무를 위한 만능 서비스가 아니다. 검증·병렬 처리·부분 실패·정책 분리의 재사용 가능한 기본 구조를 보여 준다.
- `demo` 프로필의 OCR과 객체 검출 결과는 fixture다. 실제 ML 모델의 정확도나 운영 준비 상태를 증명하지 않는다.
- `WorkReport.Success`는 세 작업이 결과 계약을 반환했다는 뜻이다. 세 분석 결과가 모두 `Completed`라는 뜻이 아니다.
- `FAILED` 집계 상태에서 현재 `VisitorPassPolicy`가 선택하는 결과는 `MANUAL_REVIEW`일 수 있다. 글의 표에서 이를 임의로 `REJECT`로 바꾸지 않는다.
- `DetectionResponse`와 `BarcodeResponse` API에는 현재 좌표 `region`이 포함되지 않는다. 라이브러리 결과가 region을 지원하더라도 Part 1의 응답 계약 그림에서는 현재 API 필드만 사용한다.
