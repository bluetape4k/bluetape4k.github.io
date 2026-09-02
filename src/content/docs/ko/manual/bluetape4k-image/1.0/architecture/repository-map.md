---
slug: "ko/manual/bluetape4k-image/1.0/architecture/repository-map"
manualId: "repository-map"
title: "저장소 지도"
locale: "ko"
releaseRef: "1.0.0"
manual:
  id: "architecture/repository-map"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourcePath: "docs/manual/bluetape4k-image/ko/architecture/repository-map.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourceDir: "docs/manual/bluetape4k-image"
  layer: "build"
---


1.0.0 릴리스에는 Gradle 프로젝트 19개가 있다. 10개는 라이브러리 Maven 좌표로 배포하고, 1개는 이미지 BOM이며, 7개는 실행 예제, 1개는 벤치마크 프로젝트다. 프로젝트 디렉터리와 Gradle 경로, 아티팩트 이름이 항상 같지는 않으므로 릴리스의 <code>settings.gradle.kts</code>를 정확한 목록으로 삼는다.

## 플랫폼과 기반

- [Image BOM](/ko/manual/bluetape4k-image/1.0/modules/bluetape4k-image-bom/)은 이미지 라이브러리 아티팩트 10개의 버전을 맞춘다.
- [불변 이미지 처리](/ko/manual/bluetape4k-image/1.0/modules/bluetape4k-images/)는 Scrimage와 Java2D를 쓰는 JVM 기반 모듈이다. CAPTCHA, OCR, Ktor, Spring Boot와 libvips API의 테스트 이미지가 이 모듈을 사용한다.

## 기능과 프레임워크

- [CAPTCHA](/ko/manual/bluetape4k-image/1.0/modules/bluetape4k-images-captcha/)는 챌린지 생성과 검증 규칙을 맡는다.
- [OCR](/ko/manual/bluetape4k-image/1.0/modules/bluetape4k-images-ocr/)은 Tess4J/Tesseract를 <code>ImmutableImage</code>에 연결한다.
- [Ktor 라우트](/ko/manual/bluetape4k-image/1.0/modules/bluetape4k-images-ktor/)는 썸네일과 CAPTCHA 엔드포인트를 제공한다.
- [Spring Boot](/ko/manual/bluetape4k-image/1.0/modules/bluetape4k-images-spring-boot/)는 저장소, CDN, 상태 점검과 메트릭을 구성한다.

## Native 처리

- [Vips API](/ko/manual/bluetape4k-image/1.0/modules/bluetape4k-images-vips-api/)는 <code>VipsImage</code>, <code>VipsRuntime</code>, 포맷, 작성기와 수명 주기 규칙을 정의한다.
- [JDK 25 JVips JNI](/ko/manual/bluetape4k-image/1.0/modules/bluetape4k-images-vips-java21/)는 JNI로 공통 API를 구현한다. 배포 모듈은 호환성을 위해 `java21` 이름을 유지한다.
- [JDK 25 FFM](/ko/manual/bluetape4k-image/1.0/modules/bluetape4k-images-vips-java25/)은 Foreign Function and Memory API로 구현한다.

공통 API가 애플리케이션 대신 백엔드를 고르거나 초기화하지는 않는다. 측정된 마이그레이션 요구가 없다면 런타임 구현은 하나만 배포한다.

## 학습하고 측정하기

워크숍 7개는 JVM 기본 처리, Ktor 이미지/CAPTCHA, Ktor OCR, Spring Boot 바코드, 이미지 스토리지, 이미지 인텔리전스, Spring Boot OCR을 다룬다. [벤치마크 프로젝트](/ko/manual/bluetape4k-image/1.0/modules/bluetape4k-images-benchmark/)는 처리와 I/O 경로를 비교하지만 라이브러리로 배포하지 않는다.

프로젝트를 이름순으로 읽기보다 [학습 경로](/ko/manual/bluetape4k-image/1.0/guides/learning-path/)에서 목적에 맞는 순서를 고르는 편이 빠르다.

<!-- release-readme-diagrams:start -->
## 배포본 다이어그램

아래 그림은 `1.0.0` 배포본의 README 자산을 해당 배포 커밋에서 직접 불러옵니다. 이후 SNAPSHOT이 아니라 이 매뉴얼 버전의 구조와 실행 흐름을 보여 줍니다. 미리보기를 누르면 같은 배포 커밋의 SVG 원본이 열립니다.

### Bluetape4k Image 아키텍처

[![Bluetape4k Image 아키텍처](https://raw.githubusercontent.com/bluetape4k/bluetape4k-image/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/bluetape4k-image-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/bluetape4k-image-architecture-01.svg)

_배포본 README: [`README.ko.md`](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/README.ko.md)_

### Bluetape4k Image 개요

[![Bluetape4k Image 개요](https://raw.githubusercontent.com/bluetape4k/bluetape4k-image/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/root-readme-overview-01.png)](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/root-readme-overview-01.svg)

_배포본 README: [`README.ko.md`](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/README.ko.md)_

<!-- release-readme-diagrams:end -->

## 근거 소스

- [1.0.0 프로젝트 등록부](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/settings.gradle.kts#L84-L123)
- [배포 대상 판정 규칙](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/build.gradle.kts#L46-L58)
