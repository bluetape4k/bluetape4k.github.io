---
slug: "ko/manual/bluetape4k-image/0.3/guides/learning-path"
manualId: "learning-path"
title: "이미지 처리 학습 경로"
locale: "ko"
releaseRef: "0.3.0"
manual:
  id: "guides/learning-path"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "471a5f364520923911dc31d91be5179a6985337e"
  sourcePath: "docs/manual/ko/guides/learning-path.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "a571c30004f571fe8cfcddc29670c1404d212ec6"
  sourceDir: "docs/manual"
  layer: "build"
---


이 매뉴얼에는 선택 기준과 API 설명, 실행 예제, 장애 진단과 운영 조건이 들어 있다. 프로젝트를 이름순으로 훑기보다 아직 결정하지 못한 지점에서 시작하자.

![JVM 기본 처리에서 프레임워크 예제와 네이티브 백엔드로 이어지는 학습 경로](/manual-assets/bluetape4k-image/0.3/overview/repository-learning-map.svg)

## 1. JVM 기본 처리 완성하기

[시작하기](/ko/manual/bluetape4k-image/0.3/getting-started/), [불변 이미지 모델](/ko/manual/bluetape4k-image/0.3/core/immutable-image-model/), [로드와 저장](/ko/manual/bluetape4k-image/0.3/core/loading-and-writing/)을 읽는다. [기본 이미지 처리 워크숍](/ko/manual/bluetape4k-image/0.3/modules/basic-processing/)을 실행해 이미지 하나를 읽고, 변환하고, 저장하는 경로를 끝까지 확인한다.

## 2. 필요한 기능만 더하기

[변환과 필터](/ko/manual/bluetape4k-image/0.3/core/transforms-and-filters/)나 [분석과 유사도](/ko/manual/bluetape4k-image/0.3/core/analysis-and-similarity/)로 이어간다. 서비스에서 챌린지나 문자 추출이 필요하면 [CAPTCHA](/ko/manual/bluetape4k-image/0.3/integrations/captcha/) 또는 [OCR](/ko/manual/bluetape4k-image/0.3/integrations/ocr/)을 추가한다. 두 기능은 각각 별도 의존성과 런타임 조건을 갖는다.

## 3. 애플리케이션 경계 고르기

[Spring Boot와 Ktor 비교](/ko/manual/bluetape4k-image/0.3/guides/spring-vs-ktor/)를 읽고 프레임워크 예제 하나를 완성한다.

- 썸네일과 CAPTCHA 라우트는 [Ktor 이미지 API](/ko/manual/bluetape4k-image/0.3/modules/ktor-image-api/)
- 저장, 업로드와 다운로드는 [Spring Boot 이미지 API](/ko/manual/bluetape4k-image/0.3/modules/spring-boot-image-api/)
- 실행 환경에 Tesseract를 준비한 뒤에는 [Ktor OCR](/ko/manual/bluetape4k-image/0.3/modules/ktor-ocr-api/) 또는 [Spring Boot OCR](/ko/manual/bluetape4k-image/0.3/modules/spring-boot-ocr-api/)

## 4. 이유가 있을 때 native 처리로 옮기기

[백엔드 선택](/ko/manual/bluetape4k-image/0.3/guides/backend-selection/), [Vips API](/ko/manual/bluetape4k-image/0.3/native/vips-api/), [native 자원 수명 주기](/ko/manual/bluetape4k-image/0.3/guides/native-resource-lifecycle/)를 읽는다. 실제 배포 JDK와 패키지 조건에 맞춰 Java 21 JNI 또는 Java 25 FFM을 고른다. 연산으로 만든 이미지도 빠짐없이 닫는다.

## 5. 운영 경계 검증하기

마지막으로 [테스트와 운영](/ko/manual/bluetape4k-image/0.3/guides/testing-and-operations/), [실패 진단](/ko/manual/bluetape4k-image/0.3/guides/failure-diagnosis/), [성능 선택](/ko/manual/bluetape4k-image/0.3/guides/performance-selection/)을 읽는다. 입력 제한, 네이티브 선행 조건, 자원 소유권, 스토리지 정책과 백엔드 선택을 뒷받침하는 벤치마크나 부하 테스트를 기록한다.

여기까지 마치면 어떤 백엔드가 각 작업을 맡는지, 자원을 누가 닫는지, 디코딩 전에 어떤 입력을 거부하는지, 배포 경계를 어느 테스트가 증명하는지 답할 수 있어야 한다.

## 근거 소스

- [릴리스 실행 예제](https://github.com/bluetape4k/bluetape4k-image/tree/a571c30004f571fe8cfcddc29670c1404d212ec6/examples)
- [릴리스 모듈 안내](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/README.ko.md#모듈-구성)
