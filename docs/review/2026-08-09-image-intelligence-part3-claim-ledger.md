# 이미지 인텔리전스 Part 3 주장 원장

## 목적

Part 3은 자격 판정을 통과한 `ImmutableImage`가 OCR 공급자와 실행 보호 경계를 거쳐 통합 응답으로
바뀌는 과정을 설명한다. OCR의 엔진 설치와 대형 이미지 전처리는 [OCR 서비스를 실전에서 운영하기]에서
다룬 내용으로 연결하고, 이 글에서는 결과 상태와 형제 분석 경로를 보존하는 계약에 집중한다.

## 기준 소스

- 저장소: [`bluetape4k-image`](https://github.com/bluetape4k/bluetape4k-image)
- 기준 브랜치: `develop`
- 확인한 커밋: `f35723f1c9b1add6078aebcd46d41a1e196face9`
- 예제 루트: [`examples/spring-boot-image-intelligence-api`](https://github.com/bluetape4k/bluetape4k-image/tree/develop/examples/spring-boot-image-intelligence-api)

## 핵심 주장

| 주장 | 구현 근거 | 테스트·자료 근거 | 글에서의 표현 | 상태 |
| --- | --- | --- | --- | --- |
| OCR 공급자는 공통 `OcrAnalysisProvider` 계약으로 호출된다. | `ImageAnalysisProviders.kt`의 `OcrAnalysisProvider`가 `id`와 `suspend analyze(ImmutableImage)`를 정의한다. | `ImageIntelligenceWorkflowTest`가 공급자 결과를 워크플로에 전달한다. | “OCR 엔진의 세부 구현보다 공급자 계약을 먼저 통합한다.” | 확인 |
| `GuardedAnalysisRunner`는 제한 시간과 동시성 허가를 한 경계에서 적용한다. | `GuardedAnalysisRunner.kt`가 `semaphore.withPermit` 안에서 `withTimeout`을 실행한다. | 워크플로 테스트와 README가 취소·타임아웃 뒤 허가 반환을 설명한다. | “제한 시간은 공급자 내부가 아니라 실행 경계에서 관리한다.” | 확인 |
| 빈 OCR 텍스트는 실패가 아니라 `Empty`다. | `ImageIntelligenceWorkflow.kt`가 OCR 결과의 `text.isBlank()`를 빈 결과 판정으로 전달한다. | `GuardedAnalysisRunnerTest`가 빈 값의 `AnalysisResult.Empty`를 검증한다. | “공급자가 실행됐지만 읽을 문자가 없는 상태를 `Empty`로 보존한다.” | 확인 |
| 공급자 미설정과 실행 실패는 서로 다른 상태다. | `ProviderUnavailableException`은 `Unavailable`, 그 밖의 예외는 `Failed(provider_failure)`로 매핑한다. | `ImageIntelligenceServiceTest`가 공급자 없음과 실패를 각각 검증한다. | “설정 공백과 처리 실패를 같은 오류로 합치지 않는다.” | 확인 |
| 타임아웃은 안정적인 `Failed(timeout)` 사유가 된다. | `GuardedAnalysisRunner.kt`가 `TimeoutCancellationException`을 `Failed(reasonCode = "timeout")`으로 변환한다. | 워크플로 테스트가 한 경로의 실패가 형제 결과를 지우지 않음을 검증한다. | “내부 예외 문자열 대신 공개 가능한 사유 코드를 반환한다.” | 확인 |
| 상위 취소는 `Failed`로 포장하지 않고 다시 전파한다. | `GuardedAnalysisRunner.kt`가 `CancellationException`을 다시 던진다. | `ImageIntelligenceWorkflowTest`가 모든 자식 경로로 취소가 전파되는지 검증한다. | “요청 취소는 업무 분석 실패와 다른 수명주기 사건이다.” | 확인 |
| OCR 응답은 상태에 따라 결과와 사유를 선택적으로 담는다. | `ImageIntelligenceService.toOcrResponse`가 `Completed`일 때 텍스트·페이지 수를, `Unavailable`·`Failed`일 때 사유 코드를 매핑한다. | `ApiModels.kt`의 `OcrAnalysisResponse`와 README 응답 예시. | “응답은 읽은 결과와 처리 상태를 동시에 설명한다.” | 확인 |
| 한 OCR 경로가 실패해도 검출·바코드 형제 결과는 보존된다. | `ImageAnalysisResults`가 `ocr`, `detection`, `barcode`를 별도 필드로 보존한다. | `ImageIntelligenceServiceTest`가 OCR 실패와 형제 `COMPLETED` 결과, `PARTIAL` 집계를 검증한다. | “부분 실패는 사라진 결과가 아니라 함께 반환되는 상태다.” | 확인 |
| 사용 가능한 분석 경로가 하나도 없으면 집계 상태는 `FAILED`다. | 서비스 집계기가 모든 분석 결과의 상태를 사용해 `AggregateStatus`를 만든다. | 서비스 테스트와 README가 `FAILED` 응답을 검증한다. | “실행 가능한 분석 경로가 없을 때만 전체 실패로 승격한다.” | 확인 |

## OCR 상태와 응답 필드

| 내부 상태 | 의미 | 공개 필드 |
| --- | --- | --- |
| `Completed` | 공급자가 결과를 반환함 | `status`, `provider`, `elapsedMillis`, `result.text`, `result.pageCount` |
| `Empty` | 공급자는 실행됐지만 텍스트가 비어 있음 | `status`, `provider`, `elapsedMillis` |
| `Unavailable` | 공급자가 설정되지 않았거나 사용할 수 없음 | `status`, `provider`, `elapsedMillis`, `reasonCode` |
| `Failed` | 타임아웃 또는 공급자 예외 | `status`, `provider`, `elapsedMillis`, `reasonCode` |

`OcrStructuredResult`는 전체 텍스트뿐 아니라 페이지·블록·라인·단어 구조를 보존한다. 이 Part 3의
통합 응답 예시는 안정적인 외부 계약에 필요한 텍스트와 페이지 수를 중심으로 보여 주며, 엔진별 상세
좌표와 confidence 값은 공급자별 확장 영역으로 남긴다.

## 글의 범위에서 제외할 내용

- Tesseract 설치, 네이티브 런타임 운영, 대형 이미지 전처리는 기존 OCR 글로 연결한다.
- 전체 세 경로의 병렬 실행 알고리즘과 취소 전파 세부도는 Part 6에서 확장한다.
- 객체 검출 사실을 방문증 정책으로 바꾸는 규칙은 Part 4에서 다룬다.
- 재시도, 회로 차단기, 프로세스 격리 같은 운영 정책은 이 글의 `reasonCode` 계약을 넘어서는 별도 설계다.

## 독자용 자료

- `GuardedAnalysisRunner.kt`: 제한 시간, 동시성 허가, `Empty`·`Unavailable`·`Failed` 변환
- `ImageAnalysisProviders.kt`: OCR 공급자 인터페이스와 픽스처·Tesseract 구현
- `ImageIntelligenceWorkflow.kt`: OCR·검출·바코드 결과를 형제 필드로 수집
- `ImageIntelligenceService.kt`: 분석 결과를 공개 응답으로 매핑하고 집계 상태를 계산
- `AnalysisModels.kt`, `ApiModels.kt`: 내부 상태와 외부 응답 타입
- `GuardedAnalysisRunnerTest.kt`, `ImageIntelligenceWorkflowTest.kt`, `ImageIntelligenceServiceTest.kt`: 상태·취소·부분 실패 경계
- [OCR 서비스를 실전에서 운영하기](/ko/blog/ocr-api-fallback-contract-bluetape4k-image/): OCR 엔진 운영과 네이티브 실패 경계
