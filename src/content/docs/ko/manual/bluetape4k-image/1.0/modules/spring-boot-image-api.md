---
slug: "ko/manual/bluetape4k-image/1.0/modules/spring-boot-image-api"
manualId: "spring-boot-image-api"
id: "spring-boot-image-api"
title: "Spring Boot 이미지 API 워크숍"
locale: "ko"
kind: "example"
gradlePath: ":spring-boot-image-api"
sourceDir: "examples/spring-boot-image-api"
releaseRef: "1.0.0"
artifact: null
manual:
  id: "spring-boot-image-api"
  repository: "bluetape4k-image"
  group: "workshops"
  kind: "example"
  sourceCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourcePath: "docs/manual/bluetape4k-image/ko/modules/spring-boot-image-api.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourceDir: "examples/spring-boot-image-api"
  layer: "learn"
---


> 실행 가능한 예제

## 제공하는 기능

멀티파트 이미지를 검사하고, 자동 구성된 로컬 `ImageStorage`에 원본을 저장한 뒤 PNG 썸네일과 로컬 읽기 URL을 만드는 Spring Boot 4 예제입니다. S3, CDN, Docker, 네이티브 이미지 라이브러리 없이 업로드부터 다운로드까지의 저장 경계를 확인할 수 있습니다.

## 사용하기 좋은 경우

`bluetape4k-images-spring-boot`를 배우거나 로컬 저장소 자동 구성을 확인할 때, 운영 스토리지를 선택하기 전에 업로드·썸네일·다운로드 계약을 빠르게 만들 때 사용하세요.

## 의존성 좌표

애플리케이션 예제는 배포되지 않습니다. 사용자는 `bluetape4k-dependencies` 버전 하나만 선택하고 `bluetape4k-images`, `bluetape4k-images-spring-boot`를 추가하세요. 모듈 버전을 따로 고정하지 않습니다.

## 핵심 개념

- Spring 자동 구성이 `bluetape4k.images.storage` 설정으로 `ImageStorage`를 제공합니다.
- `UploadOptions.ALLOWED_CONTENT_TYPES`로 decode 전에 업로드 형식을 검사합니다.
- 원본과 PNG thumbnail은 서로 다른 `ImageObjectKey` prefix를 사용합니다.
- multipart byte 읽기는 `Dispatchers.IO`, 이미지 변환은 `Dispatchers.Default`에서 수행합니다.

## 빠르게 시작하기

JDK 25 이상이면 되고 외부 서비스는 필요하지 않습니다.

```bash
./gradlew :spring-boot-image-api:bootRun
curl -F "file=@images/src/test/resources/images/cafe.jpg;type=image/jpeg" \
  "http://localhost:8080/api/images?maxSide=320"
```

`201 Created`와 함께 원본·썸네일 키, 로컬 읽기 URL, 바이트 수가 반환됩니다. 반환된 URL을 `GET`으로 내려받을 수 있습니다.

## 작업별 API

| 작업 | 1.0.0 API |
| --- | --- |
| 업로드 | `POST /api/images?maxSide=320` |
| 다운로드 | `GET /api/images/{prefix}/{name}` |
| byte 저장 | `ImageStorage.upload(key, bytes, UploadOptions)` |
| byte 읽기 | `ImageStorage.download(key)` |
| thumbnail 생성 | `immutableImageOf(bytes).fit(...).forWriter(PngWriter.MaxCompression)` |

## 권장 패턴

콘텐츠 타입, 빈 파일, 크기 범위를 비싼 작업 전에 검사하세요. 저장소는 `ImageStorage` 뒤에 두고 원본과 파생 파일의 접두사를 분리하세요. 파일 시스템 경로를 노출하지 말고 저장소 메타데이터를 반환하는 편이 좋습니다.

## 연동

[`bluetape4k-images-spring-boot`](/ko/manual/bluetape4k-image/1.0/modules/bluetape4k-images-spring-boot/)와 [`bluetape4k-images`](/ko/manual/bluetape4k-image/1.0/modules/bluetape4k-images/)를 조합합니다. 운영 백엔드로 전환하기 전에 버킷 소유권, 자격 증명, URL, 보존, CDN 정책을 먼저 결정하세요.

## 설정

```yaml
bluetape4k:
  images:
    storage:
      backend: local
      max-size-bytes: 10485760
      local:
        root-dir: build/tmp/spring-boot-image-api/storage
```

Spring multipart file/request 제한은 10 MiB입니다. `maxSide`는 `64..2048`, 기본값은 `320`입니다.

## 실패 유형과 해결 방법

- `400 bad_request`: 빈 파일, 지원하지 않는 콘텐츠 타입, 범위를 벗어난 `maxSide`입니다.
- 다운로드 실패: 업로드 응답의 키를 그대로 사용했는지, 로컬 루트가 남아 있는지 확인하세요.
- 업로드 크기 초과: Spring 멀티파트 제한과 저장소 `max-size-bytes`를 함께 맞추세요.
- URL이 로컬 경로임: 이 예제는 CDN이 아니라 컨트롤러 읽기 URL을 의도적으로 반환합니다.

## 운영

기본 저장소는 `build/tmp` 아래의 임시 경로입니다. 운영에서는 영구 저장소, 정리·보존 정책, 중복 처리, 권한, 악성·부적절 콘텐츠 검사, 메트릭, 공개 URL 정책이 필요합니다.

## 테스트

```bash
./gradlew :spring-boot-image-api:test
```

MockMvc로 JPEG를 업로드하고 두 키 접두사와 URL, 원본과 썸네일 다운로드, PNG 시그니처, 지원하지 않는 콘텐츠 타입 거부를 검증합니다.

## 학습 경로와 예제

1. [`basic-processing`](/ko/manual/bluetape4k-image/1.0/modules/basic-processing/)에서 transform을 먼저 익힙니다.
2. 이 워크숍을 실행해 저장소 디렉터리와 두 다운로드를 확인합니다.
3. Spring Boot 저장소 모듈 매뉴얼을 읽습니다.
4. OCR이 필요하면 [`spring-boot-ocr-api`](/ko/manual/bluetape4k-image/1.0/modules/spring-boot-ocr-api/)로 이어가고, S3/CDN은 더 큰 workshop에서 다룹니다.

## 제약 사항

로컬 quickstart입니다. S3/CDN, 인증, lifecycle 정책, 비동기 처리, 여러 인스턴스 간 일관성은 포함하지 않습니다.

<!-- release-readme-diagrams:start -->
## 배포본 다이어그램

아래 그림은 `1.0.0` 배포본의 README 자산을 해당 배포 커밋에서 직접 불러옵니다. 이후 SNAPSHOT이 아니라 이 매뉴얼 버전의 구조와 실행 흐름을 보여 줍니다. 미리보기를 누르면 같은 배포 커밋의 SVG 원본이 열립니다.

### Spring Boot Image API 아키텍처

[![Spring Boot Image API 아키텍처](https://raw.githubusercontent.com/bluetape4k/bluetape4k-image/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/examples-spring-boot-image-api-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/examples-spring-boot-image-api-architecture-01.svg)

_배포본 README: [`examples/spring-boot-image-api/README.ko.md`](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/examples/spring-boot-image-api/README.ko.md)_

### Spring Boot Image API 실행 시나리오

[![Spring Boot Image API 실행 시나리오](https://raw.githubusercontent.com/bluetape4k/bluetape4k-image/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/examples-spring-boot-image-api-scenario-01.png)](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/examples-spring-boot-image-api-scenario-01.svg)

_배포본 README: [`examples/spring-boot-image-api/README.ko.md`](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/examples/spring-boot-image-api/README.ko.md)_

### Spring Boot Image API 처리 순서

[![Spring Boot Image API 처리 순서](https://raw.githubusercontent.com/bluetape4k/bluetape4k-image/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/examples-spring-boot-image-api-sequence-01.png)](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/examples-spring-boot-image-api-sequence-01.svg)

_배포본 README: [`examples/spring-boot-image-api/README.ko.md`](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/examples/spring-boot-image-api/README.ko.md)_

<!-- release-readme-diagrams:end -->

## 근거 자료

- [1.0.0 README](https://github.com/bluetape4k/bluetape4k-image/blob/1.0.0/examples/spring-boot-image-api/README.ko.md)
- [Controller와 service](https://github.com/bluetape4k/bluetape4k-image/blob/1.0.0/examples/spring-boot-image-api/src/main/kotlin/io/bluetape4k/images/examples/spring/SpringBootImageApiApplication.kt)
- [애플리케이션 설정](https://github.com/bluetape4k/bluetape4k-image/blob/1.0.0/examples/spring-boot-image-api/src/main/resources/application.yml)
- [통합 테스트](https://github.com/bluetape4k/bluetape4k-image/blob/1.0.0/examples/spring-boot-image-api/src/test/kotlin/io/bluetape4k/images/examples/spring/SpringBootImageApiApplicationTest.kt)
- [Gradle 빌드 파일](https://github.com/bluetape4k/bluetape4k-image/blob/1.0.0/examples/spring-boot-image-api/build.gradle.kts)
