# 이미지 인텔리전스 Part 4: 검출 사실과 처리 정책의 경계 설계

Date: 2026-08-10  
Repositories: `bluetape4k-image`, `bluetape4k.github.io`  
Blog issue: [bluetape4k.github.io#201](https://github.com/bluetape4k/bluetape4k.github.io/issues/201)  
Implementation source: [bluetape4k-image#300](https://github.com/bluetape4k/bluetape4k-image/pull/300)

## 승인된 범위

Part 4는 방문증 이미지 통합 API에서 객체 검출 결과를 업무 처리 action으로 오해하지
않도록, 검출 사실·정책 결정·후속 side effect를 분리해 설명한다. 사용자가 새 시각
자료를 제외했으므로 이번 글은 새 diagram, chart, overlay 이미지, hero raster를
생성하지 않는다. 블로그 metadata의 기존 계약을 유지하기 위해 시리즈의 기존 hero를
재사용하고, 본문은 설명·표·짧은 Kotlin 코드·JSON 예로 구성한다.

이번 글의 독자는 이미지 분석 provider를 연결하는 애플리케이션 개발자와 결과를
허용·거부·격리·수동 검토 흐름으로 넘기는 서비스 운영자다. detection model을
선택하거나 학습하는 글이 아니며, 완성형 개인정보 처리 제품을 제시하지 않는다.

## 독자 질문

> 얼굴이나 민감 영역을 찾았다는 분석 사실을 어떻게 보존하고, 그 사실을 흐림·거부·
> 격리·수동 검토 같은 업무 결정으로 연결하되 detector 안에 정책을 섞지 않을 것인가?

Part 3에서 통합 응답의 `Completed`, `Empty`, `Unavailable`, `Failed` 상태를 보존했다.
Part 4는 그 응답의 `detection` 결과를 읽은 다음 단계에 초점을 맞춘다. 분석 결과가
있다는 것과 그 결과에 어떤 조치를 할지는 같은 계약이 아니다.

## 사실 기준과 claim ledger

모든 기술 설명은 병합된 예제와 현재 `develop`의 이미지 모듈을 기준으로 한다.
본문에서 production detector의 정확도나 특정 ML runtime의 동작을 주장하지 않는다.

| 글에서 설명할 claim | 근거 | 본문에서의 한정 |
| --- | --- | --- |
| `ImageDetector`는 이미지와 `DetectionOptions`를 받아 `DetectionResult` 목록을 반환하는 교체 가능한 경계다. | [`ImageDetection.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images/src/main/kotlin/io/bluetape4k/images/detection/ImageDetection.kt) | 구현체는 fake, native, remote, model adapter일 수 있으며 core artifact가 runtime을 번들하지 않는다. |
| `DetectionResult`는 `label`, `category`, `confidence`, `detector`, 선택적 geometry와 backend metadata를 보존한다. | [`ImageDetection.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images/src/main/kotlin/io/bluetape4k/images/detection/ImageDetection.kt) | 이 model은 사실만 담고 `BLUR`·`MOSAIC`·`REJECT`·`QUARANTINE`·`MANUAL_REVIEW`를 선택하지 않는다. |
| `DetectionOptions.minimumConfidence`, category, label filter는 결과를 결정적으로 걸러낸다. | [`ImageDetection.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images/src/main/kotlin/io/bluetape4k/images/detection/ImageDetection.kt), [`ImageDetectionTest.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images/src/test/kotlin/io/bluetape4k/images/detection/ImageDetectionTest.kt) | threshold는 정확도의 증명이 아니라 adapter와 application이 합의한 입력 필터다. 오탐·미탐과 route별 위험도는 별도 정책이다. |
| `VisitorPassPolicy`는 민감 영역, 잘못된 visitor QR, 분석 경로 저하, 얼굴·QR·OCR 조건을 순서대로 판단한다. | [`VisitorPassPolicy.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/VisitorPassPolicy.kt), [`VisitorPassPolicyTest.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/test/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/VisitorPassPolicyTest.kt) | `QUARANTINE`, `REJECT`, `MANUAL_REVIEW`, `ALLOW`는 방문증 예제의 application policy이며 보편 규칙이 아니다. |
| moderation policy는 detection fact를 action과 renderer-neutral parameter로 변환한다. | [`SensitiveContentPolicy.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images/src/main/kotlin/io/bluetape4k/images/moderation/SensitiveContentPolicy.kt), [`SensitiveContentModels.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images/src/main/kotlin/io/bluetape4k/images/moderation/SensitiveContentModels.kt) | pixel rendering, quarantine storage, rejection side effect는 caller 책임이다. |
| 알 수 없는 category 또는 match되지 않은 rule은 fail-closed fallback으로 `QUARANTINE`될 수 있다. | [`SensitiveContentPolicy.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images/src/main/kotlin/io/bluetape4k/images/moderation/SensitiveContentPolicy.kt), [`SensitiveContentPolicyTest.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images/src/test/kotlin/io/bluetape4k/images/moderation/SensitiveContentPolicyTest.kt) | fail-closed는 해당 policy factory의 선택이며 모든 업무에 자동 적용되는 기본값으로 일반화하지 않는다. |

## 글 구조

### 1. detector가 아는 것과 모르는 것

방문증에서 detector가 반환하는 한 건의 결과를 짧은 Kotlin 예로 보여준다.

```kotlin
DetectionResult(
    label = "face",
    category = DetectionCategory.FACE,
    confidence = 0.96,
    detector = DetectorIdentity(name = "fixture-detector"),
    region = faceRegion,
)
```

이 결과에서 읽을 수 있는 것은 “어떤 category를 어느 confidence로 어떤 detector가
어느 region에서 보고했는가”다. `region`은 pixel 또는 normalized 좌표를 사용할 수
있고, `DetectorIdentity`는 adapter/model family와 선택적인 version·backend metadata를
보존한다. 결과 안에 “이 영역을 흐리게 하라”는 명령은 없다.

### 2. confidence는 판결문이 아니다

`DetectionOptions`의 confidence·category·label filter를 설명하고, threshold가
잘못된 결과를 모두 제거해 주는 품질 보증이 아님을 분명히 한다.

- false positive: 실제 얼굴이 아닌 영역을 얼굴로 보고할 수 있다.
- false negative: 실제 얼굴이나 민감 영역을 놓칠 수 있다.
- 같은 confidence라도 방문증 미리보기, 원본 보관, 출입 허용 경로의 위험은 다르다.

따라서 threshold, 재촬영 요구, 추가 사람 검토, 보수적인 fallback은 application
policy가 정한다. detector API는 facts와 metadata를 보존하고, policy는 그 사실을
업무 risk에 맞춰 해석한다.

### 3. `VisitorPassPolicy`는 별도 단계에서 결정을 만든다

방문증 예제의 결정 순서를 표와 짧은 코드로 설명한다.

| 먼저 확인하는 조건 | 예제 action | 이유 |
| --- | --- | --- |
| `SENSITIVE_REGION` 검출 | `QUARANTINE` | 원본을 즉시 정상 흐름에서 분리한다. |
| 완료한 barcode 중 visitor QR이 아닌 값 존재 | `REJECT` | 방문증 식별자 계약에 맞지 않는다. |
| OCR·detection·barcode가 `Failed` 또는 `Unavailable` | `MANUAL_REVIEW` | 사실이 없거나 신뢰할 수 없는 상태에서 자동 승인하지 않는다. |
| 얼굴 정확히 하나, visitor QR 정확히 하나, 유효한 OCR | `ALLOW` | 예제의 자동 승인 조건을 모두 만족한다. |
| 그 밖의 빈 결과·개수 불일치 | `MANUAL_REVIEW` | detector가 틀렸다고 단정하지 않고 확인 대상으로 남긴다. |

특히 `Empty` detection과 `Failed` detection을 같은 빈 목록으로 바꾸지 않는다. 전자는
실행은 됐지만 대상을 찾지 못한 사실이고, 후자는 detector가 결과를 만들지 못한
실패다. 예제 테스트는 두 상태를 서로 다른 사유(`FACE_COUNT_REQUIRES_REVIEW`,
`DETECTION_FAILED`)로 검증한다.

### 4. blur·mosaic·reject·quarantine·manual review는 action 계약이다

core moderation model의 `SensitiveTreatmentAction`을 정책 결과로 소개한다.

```kotlin
SensitiveTreatmentAction.BLUR
SensitiveTreatmentAction.MOSAIC
SensitiveTreatmentAction.SOLID_MASK
SensitiveTreatmentAction.DROP
SensitiveTreatmentAction.REJECT
SensitiveTreatmentAction.QUARANTINE
SensitiveTreatmentAction.MANUAL_REVIEW
```

`SensitiveTreatmentParameters`의 blur radius, mosaic block size, mask opacity,
review priority, reject reason은 renderer-neutral metadata다. policy가 `BLUR`를
선택했다고 해서 이 모듈이 pixels를 변환하거나 저장소로 원본을 옮기는 것은 아니다.
렌더러, quarantine 저장소, 거부 응답, 수동 검토 큐는 application boundary에서
구현한다.

`SensitiveModerationPolicy`의 rule은 category·severity·confidence threshold와
action을 묶고, 여러 결과가 있으면 action precedence로 선택한다. 알 수 없는 category를
match하지 못한 경우에는 fail-closed fallback rule이 `QUARANTINE`을 선택할 수 있다.
이 동작은 선택 가능한 정책 factory이므로 방문증의 `VisitorPassPolicy`와 같은
계약이라고 표현하지 않는다.

### 5. provider와 policy를 함께 배포하지 않아도 된다

통합 예제의 `demo` profile은 OCR과 detection에 deterministic fixture를 사용하고
QR은 실제 ZXing provider를 사용한다. 이 조합은 orchestration·response·policy
경계를 재현하지만 ML model의 정확도나 production latency를 증명하지 않는다.

production에서는 application이 `ImageDetector` adapter, model version, quality
measurements, drift monitoring, timeout/isolation boundary를 소유한다. detector를
교체해도 `VisitorPassPolicy`의 입력 계약이 유지되며, 업무 정책을 바꿔도 detector
runtime을 다시 작성할 필요가 없다.

## 코드와 테스트에 연결할 링크

본문에서 전체 구현을 복사하지 않고 다음 순서로 원문을 연결한다.

1. [`ImageDetection.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images/src/main/kotlin/io/bluetape4k/images/detection/ImageDetection.kt)
2. [`VisitorPassPolicy.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/VisitorPassPolicy.kt)
3. [`VisitorPassPolicyTest.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/src/test/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/VisitorPassPolicyTest.kt)
4. [`SensitiveContentPolicy.kt`](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images/src/main/kotlin/io/bluetape4k/images/moderation/SensitiveContentPolicy.kt)
5. [Spring Boot 통합 예제 README.ko.md](https://github.com/bluetape4k/bluetape4k-image/blob/develop/examples/spring-boot-image-intelligence-api/README.ko.md)

Part 3의 OCR 상태·부분 응답 설명은 선행 글로 링크한다. 업로드 자격 판정과 단일
decode는 Part 2, barcode 계약은 Part 5의 주제로 남긴다.

## Bilingual route와 series navigation

slug는 locale만 다르게 유지한다.

- 한국어: `/ko/blog/image-intelligence-part4-detection-policy-separation/`
- 영어: `/blog/image-intelligence-part4-detection-policy-separation/`

한국어를 먼저 작성하고 기술 사실과 링크를 고정한 뒤 영어로 자연스럽게 현지화한다.
두 글은 같은 표 행, 상태명, action 목록, source link, Part 1~7 navigation을 갖는다.
기존 Part 1~3의 마지막 series navigation에서 Part 4 항목을 실제 링크로 바꾸고,
Part 4에는 Part 1~3의 링크와 Part 5~7 예고를 둔다.

새 diagram·chart·overlay asset은 만들지 않는다. 따라서 diagram source/PNG pair와
rendered visual QA는 이번 범위에서 N/A이며, 기존 series hero 재사용 여부와 alt text는
본문 초안 단계에서 schema와 카드 표현을 확인한다.

## 비목표

- ML model, native runtime, GPU backend, model serving 구현
- detector confidence로 정확도를 보증하거나 false positive/negative를 제거한다는 주장
- 실제 pixel blur/mosaic/mask renderer 구현
- quarantine storage, 원본 삭제·암호화·접근 통제, 수동 검토 큐 구현
- OCR·barcode 상태 계약의 재설명 또는 Part 6 병렬 취소 설계의 선행 작성
- 새 hero/diagram/chart/image asset 생성

## 검증 계획

설계 문서 단계:

- 문서의 claim ledger가 현재 `bluetape4k-image` source/test 링크와 일치하는지 검토한다.
- `git diff --check`와 Markdown 링크·경로 확인을 실행한다.
- Lore commit trailer를 포함해 이 설계 문서만 commit한다.

본문 단계:

- 한국어 초안을 먼저 작성하고 기술 사실·식별자·링크·상태명·action 목록을 source와
  대조한다.
- 영어 locale을 한국어 승인 뒤 작성하고 route·part·claim·link parity를 비교한다.
- 새 시각 asset 없이 `npm run build`, 변경 route, series navigation, `git diff --check`를
  실행한다.
- 사용자가 시각 자료를 제외했으므로 asset pair와 PNG visual inspection은 N/A로
  보고하되, 기존 hero를 재사용할 경우 해당 파일 경로와 HTTP/build 결과를 검증한다.

## 완료 기준

- [ ] 한국어 Part 4가 검출 facts와 policy actions를 별도 계약으로 설명한다.
- [ ] `VisitorPassPolicy` 결정 순서와 핵심 테스트가 source-grounded로 연결된다.
- [ ] `SensitiveModerationPolicy`의 renderer-neutral 경계와 fail-closed caveat가
      과장 없이 설명된다.
- [ ] 영어 글이 한국어와 route·part·claim·link parity를 갖는다.
- [ ] 기존 Part 1~3의 navigation이 Part 4를 가리킨다.
- [ ] 새 시각 asset 없이 build·route·link 검증이 통과한다.
- [ ] 구현/배포/병합은 별도 승인 범위로 남긴다.
