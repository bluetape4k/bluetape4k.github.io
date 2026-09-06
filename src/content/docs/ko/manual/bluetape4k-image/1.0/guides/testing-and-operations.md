---
slug: "ko/manual/bluetape4k-image/1.0/guides/testing-and-operations"
manualId: "testing-and-operations"
title: "테스트와 운영"
locale: "ko"
releaseRef: "1.0.0"
manual:
  id: "guides/testing-and-operations"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourcePath: "docs/manual/bluetape4k-image/ko/guides/testing-and-operations.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourceDir: "docs/manual/bluetape4k-image"
  layer: "build"
---


실제 배포에서 사용하는 경계를 테스트해야 한다. JVM 단위 테스트만으로는 실행 환경의 Tesseract, 시스템 libvips, S3 자격 증명이나 파일 권한을 검증할 수 없다.

## 테스트 단계

1. 작은 고정 테스트 이미지로 변환, 검증, CAPTCHA 상태와 저장 정책을 단위 테스트한다.
2. 시각 연산은 기준 이미지 또는 수치 유사도로 검증한다. 인코더 메타데이터가 매번 다를 수 있다면 전체 바이트 비교는 피한다.
3. 선택한 프레임워크 모듈 테스트를 실행한다.
4. 필요한 패키지가 설치된 실행기에서 실제 OCR과 libvips 검사를 순차 실행한다.
5. 배포 환경에서 저장소와 CDN 설정을 최소 수준으로 검증한다.

대표 명령:

    ./gradlew :bluetape4k-images:test
    ./gradlew :bluetape4k-images-ocr:test -Docr.enabled=true
    ./gradlew :bluetape4k-images-vips-java21:test

## 운영 지표

입력 바이트, 디코딩한 이미지 크기, 처리 시간, 출력 바이트, 실패 유형, 대기열 길이와 저장소 지연 시간을 측정한다. Spring Boot 연동에서 상태 점검과 메트릭을 제공하지만 애플리케이션에 필요한 태그와 경보 기준은 서비스가 정한다.

## 용량과 격리

디코딩 전에 요청 크기를 제한한다. 코루틴을 무한히 늘리지 말고 OCR과 네이티브 작업의 동시 실행 수를 제한한다. 실행 환경의 요구 사항이 다른 벤치마크와 네이티브 테스트는 빠른 CI와 분리할 수 있지만, 주기적으로 실제 경계를 검증하는 경로는 남겨야 한다.

## 다이어그램 provenance

매뉴얼 다이어그램은 `scripts/manual/render_image_diagrams.rb`의 SVG source와 controlled `rsvg-convert` delivery profile을 사용한다. [`diagram-provenance.yaml`](../../diagram-provenance.yaml)은 다섯 SVG/PNG pair 각각의 renderer version, 요청·해결된 font inventory, 실행 환경, source와 PNG의 SHA-256, dimensions, color/alpha metadata와 content fingerprint를 기록한다. 각 asset에는 tracked PNG baseline과 기록된 toolchain으로 렌더링한 receipt를 모두 저장하며, tracked 파일을 사후에 읽어 receipt로 간주하지 않는다.

매뉴얼을 변경해 배포하기 전에 provenance 검사를 실행한다.

    ruby -I scripts/manual scripts/manual/diagram_provenance_test.rb
    ruby scripts/manual/verify_diagram_provenance.rb
    ruby scripts/manual/render_image_diagrams.rb --output-root build/manual/diagram-render
    ruby scripts/manual/validate_diagrams.rb

Verifier는 격리된 directory에서 source를 두 번 렌더링하고 controlled run의 PNG SHA-256이 서로 같은지 확인한 뒤 기록된 render receipt와 비교한다. 또한 tracked baseline의 content fingerprint를 검증하므로 크기만 같은 다른 PNG로 바꾸면 실패한다. Tracked baseline은 다른 renderer, font inventory, 운영체제나 architecture에서 PNG bytes가 이식된다고 가정하지 않으므로 semantic-fingerprint mode를 사용한다. 따라서 이 mode에서는 tracked 파일과 receipt의 byte 또는 semantic 차이를 의도된 비차단 note로 표시하며, renderer와 font drift는 기록된 delivery profile을 진단에 표시하고 실패한다. `--write-manifest`도 manifest를 기록하기 전에 격리 렌더링을 수행하고 tracked baseline과 receipt를 별도로 저장한다.

## 릴리스 기준 지키기

이 매뉴얼은 1.0.0을 대상으로 한다. 테스트와 소스 링크도 해당 릴리스 커밋에 고정한다. Develop 빌드가 성공했다고 동결한 매뉴얼 예제가 맞는 것은 아니다.

Pages의 `Build` job이 stable manual provenance를 일차로 검증한다. 커밋된 catalog에서 Image 최신 `releaseRef`를 읽고, 정확히 그 GitHub release와 tag의 peeled commit을 구한 뒤 catalog의 `releaseCommit`과 같은지 확인한다. 같은 job에서 배포 전에 커밋된 snapshot, locale parity, manifest, redirect와 generated content도 검증한다.

    npm run check:manual -- --verify-release-provenance bluetape4k-image --report build/manual-validation.json

`RELEASE_TAG_MISMATCH`는 GitHub release가 catalog의 정확한 tag를 가리키지 않는다는 뜻이다. `RELEASE_MOVED`는 그 tag가 다른 commit으로 해석된다는 뜻이다. Repository identity 오류와 GitHub 요청 실패도 안전하게 검증을 중단한다. 이동한 tag를 받아들이기 위해 `releaseCommit`만 바꾸면 안 된다. 불변 release reference를 복구하거나, 소스 변경이 의도됐다면 새 stable patch release를 발행하고 동기화한 뒤 Pages `Build`를 다시 실행한다.

Image 소스 저장소 CI에는 작은 local contract만 남긴다. `MANUAL_TAG`가 commit으로 해석되어야 하고 tag 기반 generator input이 유효해야 한다. Pages 저장소를 checkout하거나 전체 manual drift suite를 반복하지 않으므로 catalog-only 소스 변경은 빠른 CI 경로를 유지한다. 전체 inventory와 generated-content drift 검증은 중앙 manual tooling과 Pages 배포 gate가 담당한다.

## 근거 소스

- [릴리스 테스트 설정](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/build.gradle.kts)
- [Spring Boot health와 metric 소스](https://github.com/bluetape4k/bluetape4k-image/tree/b38d4891b66dff8bc63db0018b5e41810d1da9bc/images-spring-boot/src/main/kotlin/io/bluetape4k/images/spring)
